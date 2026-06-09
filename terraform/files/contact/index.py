"""Contact-form handler for brooks-security.com.

The contact form uses a reCAPTCHA Enterprise score-based key, but verifies the
token through the legacy `siteverify` endpoint using the key's legacy secret
(the "Secret key" shown in the reCAPTCHA console, provided for third-party /
non-Cloud-API integrations). The frontend mints the token with enterprise.js;
this backend checks it with the classic endpoint, which avoids needing a GCP API
key or service account.

Flow (behind the CloudFront /api/contact behavior):
  1. Reject requests lacking the CloudFront-injected shared-secret header, so the
     public Function URL can't be invoked directly.
  2. Drop honeypot submissions silently.
  3. Validate the form fields.
  4. POST the token to siteverify with the legacy secret; require success, a
     matching action, and a risk score at or above the floor.
  5. Publish the message to an SNS topic that emails graham@brooks-security.com.

The secret is read from SSM at runtime and never enters Terraform state. boto3
ships with the runtime and urllib is stdlib, so there are no bundled deps.
"""

import base64
import json
import os
import re
import urllib.parse
import urllib.request

import boto3

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_ssm = boto3.client("ssm")
_sns = boto3.client("sns")
_secret_cache = None


def _secret():
    global _secret_cache
    if _secret_cache is None:
        _secret_cache = _ssm.get_parameter(
            Name=os.environ["RECAPTCHA_SECRET_SSM_PARAM"], WithDecryption=True
        )["Parameter"]["Value"]
    return _secret_cache


def _header(event, name):
    # Function URL delivers header names lowercased.
    return (event.get("headers") or {}).get(name.lower(), "")


def _resp(status, body):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }


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

    # 3. Honeypot: silently accept and drop so bots get no signal.
    if (data.get("company") or "").strip():
        return _resp(200, {"ok": True})

    # 4. Validate required fields.
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    subject = (data.get("subject") or "").strip() or "(no subject)"
    message = (data.get("message") or "").strip()
    token = (data.get("token") or "").strip()

    if not name or not message or not _EMAIL_RE.match(email) or not token:
        return _resp(400, {"error": "Please provide your name, a valid email, and a message."})

    # 5. Verify the token via the legacy siteverify endpoint. Fail closed.
    try:
        verify = _verify(token, _source_ip(event))
    except Exception as exc:
        print(f"reCAPTCHA verify error: {exc}")
        return _resp(502, {"error": "Could not verify the request. Please try again."})

    min_score = float(os.environ.get("RECAPTCHA_MIN_SCORE", "0.5"))
    score = float(verify.get("score", 0))
    # The action field may be absent in some legacy responses; only enforce it
    # when present so a missing action doesn't reject a legitimate submission.
    action_ok = verify.get("action", "contact") == "contact"
    if not (verify.get("success") and action_ok and score >= min_score):
        print(f"reCAPTCHA rejected: {json.dumps(verify)}")
        return _resp(400, {"error": "Could not verify you are human. Please try again."})

    # 6. Publish to SNS.
    body = (
        "New contact-form submission from brooks-security.com\n\n"
        f"Name:    {name}\n"
        f"Email:   {email}\n"
        f"Subject: {subject}\n"
        f"Score:   {score}\n\n"
        f"{message}\n"
    )
    sns_subject = re.sub(r"[\r\n]+", " ", f"[brooks-security.com] {subject}")
    sns_subject = re.sub(r"[^\x20-\x7E]", "", sns_subject)[:100]
    try:
        _sns.publish(
            TopicArn=os.environ["SNS_TOPIC_ARN"],
            Subject=sns_subject or "[brooks-security.com] contact form",
            Message=body,
        )
    except Exception as exc:
        print(f"SNS publish error: {exc}")
        return _resp(502, {"error": "Could not send your message. Please email graham@brooks-security.com."})

    return _resp(200, {"ok": True})


def _verify(token, remote_ip):
    payload = {"secret": _secret(), "response": token}
    if remote_ip:
        payload["remoteip"] = remote_ip
    req = urllib.request.Request(
        "https://www.google.com/recaptcha/api/siteverify",
        data=urllib.parse.urlencode(payload).encode(),
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        return json.loads(resp.read().decode("utf-8", "replace"))


def _source_ip(event):
    # Behind CloudFront, the viewer IP is the first hop of X-Forwarded-For.
    xff = _header(event, "x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return event.get("requestContext", {}).get("http", {}).get("sourceIp", "")
