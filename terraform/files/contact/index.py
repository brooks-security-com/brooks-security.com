"""Contact-form handler for brooks-security.com (reCAPTCHA Enterprise).

Invoked via a Lambda Function URL behind the CloudFront /api/contact behavior.
The handler:

  1. Rejects any request lacking the CloudFront-injected shared-secret header,
     so the public Function URL cannot be invoked directly.
  2. Drops honeypot submissions silently.
  3. Validates the form fields.
  4. Creates a reCAPTCHA Enterprise assessment for the token and checks that the
     token is valid, the action matches, and the risk score clears the floor.
  5. Publishes the message to an SNS topic that emails graham@brooks-security.com.

Auth to the reCAPTCHA Enterprise API uses a Google Cloud API key (read from SSM)
passed as a query parameter, so there are no bundled dependencies (boto3 ships
with the runtime and urllib is stdlib). The public site key is also read from
SSM, since the assessment event must include it. Neither value enters Terraform
state.
"""

import base64
import json
import os
import re
import urllib.request

import boto3

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_ssm = boto3.client("ssm")
_sns = boto3.client("sns")
_cache = {}


def _ssm_param(name):
    if name not in _cache:
        _cache[name] = _ssm.get_parameter(Name=name, WithDecryption=True)["Parameter"]["Value"]
    return _cache[name]


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

    # 5. Create a reCAPTCHA Enterprise assessment. Fail closed on any error.
    try:
        assessment = _assess(token)
    except Exception as exc:
        print(f"reCAPTCHA assessment error: {exc}")
        return _resp(502, {"error": "Could not verify the request. Please try again."})

    props = assessment.get("tokenProperties", {})
    score = float(assessment.get("riskAnalysis", {}).get("score", 0))
    min_score = float(os.environ.get("RECAPTCHA_MIN_SCORE", "0.5"))
    if not (props.get("valid") and props.get("action") == "contact" and score >= min_score):
        print(
            "reCAPTCHA rejected: "
            f"valid={props.get('valid')} reason={props.get('invalidReason')} "
            f"action={props.get('action')} score={score}"
        )
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


def _assess(token):
    project = os.environ["RECAPTCHA_PROJECT_ID"]
    api_key = _ssm_param(os.environ["RECAPTCHA_API_KEY_SSM_PARAM"])
    site_key = _ssm_param(os.environ["RECAPTCHA_SITE_KEY_SSM_PARAM"])
    url = (
        f"https://recaptchaenterprise.googleapis.com/v1/projects/{project}"
        f"/assessments?key={api_key}"
    )
    payload = {
        "event": {
            "token": token,
            "siteKey": site_key,
            "expectedAction": "contact",
        }
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        method="POST",
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        return json.loads(resp.read().decode("utf-8", "replace"))
