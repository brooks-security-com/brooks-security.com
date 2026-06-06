"""Nightly trigger for the GitHub contribution heatmap.

Invoked once a day by EventBridge (see lambda.tf). Reads a GitHub PAT from SSM
and POSTs to the `hugo-deploy.yml` workflow_dispatch endpoint, which forces a
site rebuild so hugo/data/contributions.json is re-baked with fresh data.

boto3 ships with the Lambda Python runtime, so this has no bundled dependencies.
"""

import json
import os
import urllib.error
import urllib.request

import boto3


def handler(event, context):
    ssm = boto3.client("ssm")
    token = ssm.get_parameter(
        Name=os.environ["SSM_PARAM"], WithDecryption=True
    )["Parameter"]["Value"]

    owner = os.environ["REPO_OWNER"]
    repo = os.environ["REPO_NAME"]
    workflow = os.environ["WORKFLOW_FILE"]
    ref = os.environ.get("REF", "main")

    url = (
        f"https://api.github.com/repos/{owner}/{repo}"
        f"/actions/workflows/{workflow}/dispatches"
    )
    req = urllib.request.Request(
        url,
        data=json.dumps({"ref": ref}).encode(),
        method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "brooks-security-contrib-dispatch",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            # workflow_dispatch returns 204 No Content on success.
            status = resp.status
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace")
        raise RuntimeError(f"workflow_dispatch failed: HTTP {exc.code} {detail}")

    print(f"Dispatched {workflow} on {owner}/{repo}@{ref} (HTTP {status})")
    return {"status": status}
