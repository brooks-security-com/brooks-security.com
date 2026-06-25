"""Subscribe handler for brooks-security.com (lead-magnet email capture).

Invoked via the API Gateway HTTP API behind the CloudFront /api/subscribe
behavior. The handler:

  1. Rejects any request lacking the CloudFront-injected shared-secret header,
     so the public API endpoint cannot be invoked directly.
  2. Drops honeypot submissions silently.
  3. Validates and normalizes the form fields.
  4. Creates a reCAPTCHA Enterprise assessment for the token and checks that the
     token is valid, the action matches "subscribe", and the score clears the
     floor.
  5. Appends a row to a Google Sheet via the Sheets API.
  6. Creates a new Prospect row in the Notion Clients database (fail-soft:
     a Notion outage never blocks the form).

Auth to Google is keyless Workload Identity Federation. The Lambda's AWS
execution role (brooks-security-subscribe) federates into GCP and impersonates a
service account; no service-account key exists. The WIF credential config and
the sheet id are read at runtime from SSM SecureStrings, so neither enters
Terraform state. The only bundled dependency is google-auth (a Lambda layer),
used purely for the federated token exchange; the Sheets call itself is plain
urllib with the resulting bearer token.
"""

import base64
import json
import os
import re
import urllib.error
import urllib.request
from datetime import datetime, timezone

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_SPREADSHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"
_MAX = 120  # length cap per field

_cache = {}
_ssm = None


def _ssm_param(name):
    # boto3 ships with the Lambda runtime but not the local self-check env, so
    # the client is created lazily; the self-check never reaches SSM.
    global _ssm
    if _ssm is None:
        import boto3

        _ssm = boto3.client("ssm")
    if name not in _cache:
        _cache[name] = _ssm.get_parameter(Name=name, WithDecryption=True)["Parameter"]["Value"]
    return _cache[name]


def _header(event, name):
    return (event.get("headers") or {}).get(name.lower(), "")


def _resp(status, body):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }


def _validate(data):
    """Return (row_fields_dict, error_message). error_message is None on success."""
    first = (data.get("first_name") or "").strip()[:_MAX]
    last = (data.get("last_name") or "").strip()[:_MAX]
    email = (data.get("email") or "").strip()[:_MAX]
    company = (data.get("company") or "").strip()[:_MAX]

    if not first or not last or not _EMAIL_RE.match(email):
        return None, "Please provide your first name, last name, and a valid email."
    return {"first": first, "last": last, "email": email, "company": company}, None


def handler(event, context):
    # 1. Only accept requests that came through CloudFront with our shared secret.
    if _header(event, "x-origin-secret") != os.environ["ORIGIN_SECRET"]:
        return _resp(403, {"error": "Forbidden"})

    # 2. Parse the JSON body.
    raw = event.get("body") or ""
    if event.get("isBase64Encoded"):
        raw = base64.b64decode(raw).decode("utf-8", "replace")
    try:
        data = json.loads(raw)
    except (ValueError, TypeError):
        return _resp(400, {"error": "Invalid request."})

    # 3. Honeypot: silently accept and write nothing so bots get no signal.
    #    Note: "company" is a real field here, so the honeypot is "website".
    if (data.get("website") or "").strip():
        return _resp(200, {"ok": True})

    # 4. Validate required fields.
    token = (data.get("token") or "").strip()
    fields, err = _validate(data)
    if err or not token:
        return _resp(400, {"error": err or "Please complete the form and try again."})

    # 5. Create a reCAPTCHA Enterprise assessment. Fail closed on any error.
    try:
        assessment = _assess(token)
    except Exception as exc:
        print(f"reCAPTCHA assessment error: {exc}")
        return _resp(502, {"error": "Could not verify the request. Please try again."})

    props = assessment.get("tokenProperties", {})
    score = float(assessment.get("riskAnalysis", {}).get("score", 0))
    min_score = float(os.environ.get("RECAPTCHA_MIN_SCORE", "0.5"))
    if not (props.get("valid") and props.get("action") == "subscribe" and score >= min_score):
        print(
            "reCAPTCHA rejected: "
            f"valid={props.get('valid')} reason={props.get('invalidReason')} "
            f"action={props.get('action')} score={score}"
        )
        return _resp(400, {"error": "Could not verify you are human. Please try again."})

    # 6. Append a row to the Google Sheet.
    ts = datetime.now(timezone.utc).isoformat()
    row = [ts, fields["first"], fields["last"], fields["email"], fields["company"]]
    try:
        _append_row(row)
    except Exception as exc:
        print(f"Sheets append error: {exc}")
        return _resp(502, {"error": "Could not save your details. Please email graham@brooks-security.com."})

    # 7. Create a Prospect row in the Notion Clients database (fail-soft).
    try:
        _notion_row(fields, ts)
    except Exception as exc:
        print(f"Notion row error: {exc}")

    return _resp(200, {"ok": True})


def _assess(token):
    project = os.environ["RECAPTCHA_PROJECT_ID"]
    api_key = _ssm_param(os.environ["RECAPTCHA_API_KEY_SSM_PARAM"])
    site_key = _ssm_param(os.environ["RECAPTCHA_SITE_KEY_SSM_PARAM"])
    url = (
        f"https://recaptchaenterprise.googleapis.com/v1/projects/{project}"
        f"/assessments?key={api_key}"
    )
    payload = {"event": {"token": token, "siteKey": site_key, "expectedAction": "subscribe"}}
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        method="POST",
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        return json.loads(resp.read().decode("utf-8", "replace"))


# --- Google: keyless WIF token exchange, then a plain Sheets append ----------
# google-auth needs an HTTP transport to talk to AWS STS, GCP STS, and the IAM
# Credentials API during refresh. Its bundled transports pull in requests or
# urllib3; this stdlib transport keeps the dependency surface to google-auth
# alone (the one dependency this Lambda is allowed). Imports are lazy so the
# __main__ self-check runs without google-auth installed.
def _google_token():
    # Construct the AWS external-account credential directly rather than via
    # google.auth.load_credentials_from_dict: that high-level loader eagerly
    # imports the `requests`-based transport to look up a project id, which is
    # not in this layer (google-auth only). from_info skips that lookup, and
    # refresh() then runs entirely through the urllib transport below.
    from google.auth import aws as google_aws
    from google.auth.transport import Request as TransportRequest
    from google.auth.transport import Response as TransportResponse

    class _Resp(TransportResponse):
        def __init__(self, status, headers, data):
            self._status, self._headers, self._data = status, headers, data

        @property
        def status(self):
            return self._status

        @property
        def headers(self):
            return self._headers

        @property
        def data(self):
            return self._data

    class _Transport(TransportRequest):
        def __call__(self, url, method="GET", body=None, headers=None, timeout=None, **kwargs):
            if isinstance(body, str):
                body = body.encode("utf-8")
            req = urllib.request.Request(url, data=body, method=method, headers=headers or {})
            try:
                with urllib.request.urlopen(req, timeout=timeout or 10) as r:
                    return _Resp(r.status, dict(r.headers), r.read())
            except urllib.error.HTTPError as e:
                # A real HTTP response (4xx/5xx); hand it back so google-auth
                # can surface the actual error message.
                return _Resp(e.code, dict(e.headers), e.read())
            except Exception as exc:
                # Connect/read timeout or DNS failure: name the URL so a hang is
                # diagnosable instead of a silent Lambda timeout.
                print(f"subscribe: transport error calling {url}: {exc}")
                raise

    config = json.loads(_ssm_param(os.environ["GOOGLE_CRED_CONFIG_SSM_PARAM"]))
    creds = google_aws.Credentials.from_info(config, scopes=[_SPREADSHEETS_SCOPE])
    creds.refresh(_Transport())
    return creds.token


def _append_row(row):
    sheet_id = _ssm_param(os.environ["SHEET_ID_SSM_PARAM"])
    rng = os.environ.get("SHEET_RANGE", "Subscribers!A:E")
    print("subscribe: requesting federated Google token")
    token = _google_token()
    print("subscribe: token acquired, appending row to sheet")
    url = (
        f"https://sheets.googleapis.com/v4/spreadsheets/{sheet_id}/values/"
        f"{urllib.request.quote(rng)}:append?valueInputOption=RAW"
    )
    req = urllib.request.Request(
        url,
        data=json.dumps({"values": [row]}).encode(),
        method="POST",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        result = json.loads(resp.read().decode("utf-8", "replace"))
    print("subscribe: sheet append complete")
    return result


# --- Notion: fail-soft Prospect row in the Clients database ------------------
# Creates a new row in the Clients database for each valid subscriber. Uses
# the Notion API directly via urllib (no extra deps). The API key is read from
# SSM at runtime so it never enters Terraform state or Lambda code. The row is
# created with Status=Prospect and the subscriber's details as typed properties.
# Failures are printed and swallowed so a Notion outage never blocks the form.
def _notion_row(fields, ts):
    key = _ssm_param(os.environ["NOTION_KEY_SSM_PARAM"])
    db_id = os.environ["NOTION_DATABASE_ID"]
    company_name = f"{fields['first']} {fields['last']}"
    body = json.dumps({
        "parent": {"database_id": db_id},
        "properties": {
            "Company Name": {"title": [{"text": {"content": company_name}}]},
            "Email": {"email": fields["email"]},
            "Status": {"select": {"name": "Prospect"}},
        },
    })
    url = "https://api.notion.com/v1/pages"
    req = urllib.request.Request(
        url, data=body.encode(),
        method="POST",
        headers={
            "Authorization": f"Bearer {key}",
            "Notion-Version": "2025-09-03",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8", "replace"))
    print(f"subscribe: notion prospect row created ({data.get('id', '?')})")


# --- Self-check: no network, no credentials, no google-auth needed -----------
if __name__ == "__main__":
    os.environ["ORIGIN_SECRET"] = "test-secret"
    os.environ["RECAPTCHA_MIN_SCORE"] = "0.5"

    def _event(body, secret="test-secret"):
        return {"headers": {"x-origin-secret": secret}, "body": json.dumps(body)}

    # Field validation
    ok, err = _validate({"first_name": "Ada", "last_name": "Lovelace", "email": "ada@example.com"})
    assert err is None and ok["first"] == "Ada", ok
    assert _validate({"first_name": "Ada", "last_name": "L", "email": "bad"})[1], "bad email must fail"
    assert _validate({"first_name": "", "last_name": "L", "email": "a@b.co"})[1], "missing first must fail"
    assert _validate({"first_name": "Ada", "last_name": "", "email": "a@b.co"})[1], "missing last must fail"

    # Origin-secret enforcement
    assert handler(_event({}, secret="wrong"), None)["statusCode"] == 403

    # Honeypot: returns success, writes nothing (no Sheets/_assess call reached)
    hp = handler(_event({"first_name": "A", "last_name": "B", "email": "a@b.co", "website": "x"}), None)
    assert hp["statusCode"] == 200, hp

    # Invalid email rejected before any network call
    assert handler(_event({"first_name": "A", "last_name": "B", "email": "nope", "token": "t"}), None)["statusCode"] == 400

    # Happy path with reCAPTCHA mocked and Sheets/Notion stubbed
    _captured = []
    _assess = lambda token: {"tokenProperties": {"valid": True, "action": "subscribe"}, "riskAnalysis": {"score": 0.9}}
    _append_row = _captured.append
    _notion_row = lambda fields, ts: _captured.append(("notion", fields, ts))
    good = handler(_event({"first_name": "Ada", "last_name": "Lovelace", "email": "ada@example.com", "token": "t"}), None)
    assert good["statusCode"] == 200, good
    assert len(_captured) == 2 and _captured[0][1] == "Ada" and _captured[0][3] == "ada@example.com", _captured
    assert _captured[1][0] == "notion", "notion not called"

    print("subscribe self-check passed")
