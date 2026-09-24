"""Accounts and cross-device progress sync for the AIGP study app.

Invoked by the aigp-study API Gateway HTTP API (payload format 2.0) behind the
aigp.brooks-security.com CloudFront /api/* behavior. Three routes, all POST with
a JSON body:

  /api/aigp/register  {username, password}  -> {username, token}
  /api/aigp/login     {username, password}  -> {username, token}
  /api/aigp/sync      {token, state}        -> {state}   (merged)

The app is local-first: each browser keeps its progress in localStorage and
sends the whole of it on every sync. This function merges it with the stored
copy and returns the result, so the client carries no merge logic. The spec is
docs/specs/cross-device-sync.md in the aigp-study repo.

Passwords: PBKDF2-HMAC-SHA256, 600k iterations, per-user salt. Tokens are
stateless HMACs over "<username>.<createdAt>.<expiry>"; createdAt binds a token
to one registration, so deleting and re-registering a name revokes old tokens.
No dependencies beyond the stdlib and the boto3 that ships with the runtime.
"""

import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import time
import unicodedata
import zlib

ITERATIONS = 600_000
TOKEN_TTL = 180 * 86400
MAX_FAILS, LOCK_SECS = 10, 15 * 60
MAX_BODY = 2_000_000  # raw request bytes
MAX_RAW, MAX_STATE = 1_000_000, 350_000  # merged state: JSON bytes returned, zlib bytes stored
MAX_TESTS, MAX_ITEMS = 100, 200  # newest attempts kept; questions per attempt
USERNAME_RE = re.compile(r"[a-z0-9._-]{3,32}")
CHOICE_RE = re.compile(r"[A-Za-z]{1,8}")  # an option letter; rendered into HTML, so never markup
MODE_RE = re.compile(r"[A-Za-z0-9 ]{1,40}")  # "Full Exam", "Practice Quiz"; same reason
BAD_LOGIN = "Wrong username or password."
EXPIRED = "Your session has expired. Sign in again."

_table = None


def _db():
    # Lazy so the pure functions below import without boto3 (see test_index.py).
    global _table
    if _table is None:
        import boto3
        from botocore.config import Config

        # Fail fast when the table's throughput ceiling throttles: botocore's legacy
        # DynamoDB policy retries 10 times over ~25 s, past the 10 s Lambda timeout.
        config = Config(retries={"mode": "standard", "total_max_attempts": 2}, connect_timeout=2, read_timeout=3)
        _table = boto3.resource("dynamodb", config=config).Table(os.environ["TABLE"])
    return _table


def _resp(status, body):
    if isinstance(body, str):
        body = {"error": body}
    return {"statusCode": status, "headers": {"Content-Type": "application/json"}, "body": json.dumps(body)}


def handler(event, context):
    secret = (event.get("headers") or {}).get("x-origin-secret", "")
    if not hmac.compare_digest(secret.encode(), os.environ["ORIGIN_SECRET"].encode()):
        return _resp(403, "Forbidden")

    raw = event.get("body") or ""
    if event.get("isBase64Encoded"):
        raw = base64.b64decode(raw).decode("utf-8", "replace")
    if len(raw) > MAX_BODY:
        return _resp(413, "Progress is too large to sync.")
    try:
        body = json.loads(raw)
    except (ValueError, RecursionError):  # RecursionError: '[' * 200_000 fits under MAX_BODY
        body = None
    if not isinstance(body, dict):
        return _resp(400, "Invalid request.")

    action = {"register": register, "login": login, "sync": sync}.get(event.get("rawPath", "").rsplit("/", 1)[-1])
    if not action:
        return _resp(404, "Not found.")
    try:
        return action(body)
    except Exception as exc:  # throttling or a DynamoDB outage; never a half-applied write
        print(f"{action.__name__} failed: {exc!r}")
        return _resp(503, "The server is busy. Try again shortly.")


# --- accounts ---------------------------------------------------------------


def _creds(body):
    user, pw = body.get("username"), body.get("password")
    if not isinstance(user, str) or not isinstance(pw, str):
        return "", ""
    # NFKC so the same passphrase typed on a phone and a laptop hashes the same.
    return user.strip().lower(), unicodedata.normalize("NFKC", pw)


def weak_password(pw, user):
    """The SP 800-63B-4 3.1.1.2 blocklist check, minimal: whole-value, never substrings."""
    p = re.sub(r"\s+", "", pw.lower())
    return (
        p == user
        or re.fullmatch(r"(.{1,32}?)\1+", p) is not None  # aaaa..., abcabc..., passwordpassword
        or any(p in run for run in ("0123456789" * 13, "abcdefghijklmnopqrstuvwxyz" * 5, "qwertyuiopasdfghjklzxcvbnm" * 5))
        or p == "correcthorsebatterystaple"  # the textbook example passphrase
    )


def _hash(pw, salt, iterations):
    return hashlib.pbkdf2_hmac("sha256", pw.encode(), salt, iterations)


def register(body):
    user, pw = _creds(body)
    if not USERNAME_RE.fullmatch(user):
        return _resp(400, "Username must be 3-32 characters: letters, digits, dot, dash or underscore.")
    if not 15 <= len(pw) <= 128:
        return _resp(400, "Password must be 15-128 characters. A few random words make a good one.")
    if weak_password(pw, user):
        return _resp(400, "That password is too easy to guess. Try a few unrelated words.")
    salt, now = secrets.token_bytes(16), int(time.time())
    db = _db()
    try:
        db.put_item(
            Item={
                "username": user,
                "salt": salt,
                "hash": _hash(pw, salt, ITERATIONS),
                "iterations": ITERATIONS,
                "fails": 0,
                "failedAt": 0,
                "version": 0,
                "createdAt": now,
                "updatedAt": now,
            },
            ConditionExpression="attribute_not_exists(username)",
        )
    except db.meta.client.exceptions.ConditionalCheckFailedException:
        return _resp(409, "That username is taken.")
    return _resp(200, {"username": user, "token": make_token(user, now)})


def login(body):
    user, pw = _creds(body)
    # ponytail: no dummy hash for unknown users; register already reveals which names exist.
    if not USERNAME_RE.fullmatch(user) or len(pw) > 128:
        return _resp(401, BAD_LOGIN)
    db, now = _db(), int(time.time())
    item = db.get_item(Key={"username": user}, ConsistentRead=True).get("Item")
    if not item:
        return _resp(401, BAD_LOGIN)
    # The lock runs 15 minutes from the latest failure, and only a success resets the
    # counter, so each failure after a lock re-locks. Attempts inside one throttle
    # burst can race past the read; the stage throttle bounds that.
    if int(item["fails"]) >= MAX_FAILS and now - int(item["failedAt"]) < LOCK_SECS:
        return _resp(429, "Too many failed attempts. Try again in 15 minutes.")
    ok = hmac.compare_digest(_hash(pw, bytes(item["salt"]), int(item["iterations"])), bytes(item["hash"]))
    # Always write, and only answer once the write lands: if a throttled table let a
    # failure go uncounted, a right guess would still come back 200 (a lockout bypass).
    db.update_item(
        Key={"username": user},
        UpdateExpression="SET fails = :zero" if ok else "SET fails = fails + :one, failedAt = :now",
        ConditionExpression="attribute_exists(username)",  # never recreate an item deleted mid-request
        ExpressionAttributeValues={":zero": 0} if ok else {":one": 1, ":now": now},
    )
    if not ok:
        return _resp(401, BAD_LOGIN)
    return _resp(200, {"username": user, "token": make_token(user, int(item["createdAt"]))})


def _sig(msg):
    mac = hmac.new(os.environ["TOKEN_KEY"].encode(), msg.encode(), hashlib.sha256).digest()
    return base64.urlsafe_b64encode(mac).rstrip(b"=").decode()


def make_token(user, created, now=None):
    msg = f"{user}.{created}.{int(now or time.time()) + TOKEN_TTL}"
    return f"{msg}.{_sig(msg)}"


def check_token(token, now=None):
    """(username, createdAt) for a valid, unexpired token, else None."""
    if not isinstance(token, str):
        return None
    parts = token.rsplit(".", 3)  # usernames may contain dots; the other three fields never do
    if len(parts) != 4 or not (parts[1].isdigit() and parts[2].isdigit()):
        return None
    user, created, exp, sig = parts
    if not hmac.compare_digest(sig.encode(), _sig(f"{user}.{created}.{exp}").encode()):
        return None
    return (user, int(created)) if int(exp) > (now or time.time()) else None


# --- sync -------------------------------------------------------------------


def sync(body):
    claims = check_token(body.get("token"))
    if not claims:
        return _resp(401, EXPIRED)
    user, created = claims
    incoming = clean(body.get("state"))
    if incoming is None:
        return _resp(400, "Invalid progress data.")
    # A fast device clock must not be able to reset away other devices' later work.
    incoming["resetAt"] = min(incoming["resetAt"], int(time.time() * 1000))
    db = _db()
    for _ in range(3):  # optimistic lock: another device may sync between our read and write
        item = db.get_item(
            Key={"username": user},
            ProjectionExpression="#s, version, createdAt",
            ExpressionAttributeNames={"#s": "state"},
            ConsistentRead=True,  # the first sync lands milliseconds after register's write
        ).get("Item")
        if not item or int(item["createdAt"]) != created:
            return _resp(401, EXPIRED)  # deleted, or the name was registered again since
        stored = clean(json.loads(zlib.decompress(bytes(item["state"])))) if "state" in item else clean({})
        merged = merge(stored, incoming)
        if merged == stored:
            return _resp(200, {"state": merged})  # nothing new: no write
        raw = json.dumps(merged, separators=(",", ":")).encode()
        blob = zlib.compress(raw)
        if len(raw) > MAX_RAW or len(blob) > MAX_STATE:
            return _resp(413, "Progress is too large to sync.")
        try:
            db.update_item(
                Key={"username": user},
                UpdateExpression="SET #s = :s, version = :next, updatedAt = :now",
                ConditionExpression="version = :v",
                ExpressionAttributeNames={"#s": "state"},
                ExpressionAttributeValues={":s": blob, ":next": item["version"] + 1, ":v": item["version"], ":now": int(time.time())},
            )
            return _resp(200, {"state": merged})
        except db.meta.client.exceptions.ConditionalCheckFailedException:
            continue
    return _resp(409, "Another device is syncing. Try again.")


def _int(v):
    return type(v) is int and v >= 0  # JSON true/false are ints in Python; exclude them


def _key(k):
    return isinstance(k, str) and 0 < len(k) <= 200


def _choice(v):
    """An answer as the app stores it: one letter, or a list of them (multi-select)."""
    if isinstance(v, list):
        return len(v) <= 8 and all(isinstance(x, str) and CHOICE_RE.fullmatch(x) for x in v)
    return isinstance(v, str) and CHOICE_RE.fullmatch(v) is not None


def _attempt(t):
    """A test attempt rebuilt from its known fields, or None. Types and character sets
    are checked, never values, so a new test mode in the app is never silently dropped."""
    if not isinstance(t, dict) or not all(_int(t.get(f)) for f in ("ts", "total", "correct", "timeUsedMs")):
        return None
    mode, items = t.get("mode"), t.get("items")
    if not (isinstance(mode, str) and MODE_RE.fullmatch(mode) and isinstance(t.get("auto"), bool)):
        return None
    if not (isinstance(items, list) and len(items) <= MAX_ITEMS):
        return None
    out = []
    for it in items:
        if not (isinstance(it, dict) and _key(it.get("qid")) and isinstance(it.get("correct"), bool)):
            return None
        if it.get("chosen") is not None and not _choice(it["chosen"]):
            return None
        out.append({"qid": it["qid"], "chosen": it.get("chosen"), "correct": it["correct"]})
    return {**{f: t[f] for f in ("ts", "mode", "total", "correct", "timeUsedMs", "auto")}, "items": out}


def clean(s):
    """Normalize a client or stored state, rebuilding every entry from its known fields.

    None if it is not a state at all. Malformed entries are dropped rather than
    rejected, so one odd legacy entry never blocks a device from syncing.
    """
    if not isinstance(s, dict):
        return None
    out = {"quiz": {}, "mastery": {}, "counts": {}, "tests": [], "resetAt": s.get("resetAt") if _int(s.get("resetAt")) else 0}
    quiz, mastery, counts, tests = (s.get(k) for k in ("quiz", "mastery", "counts", "tests"))
    for k, v in (quiz.items() if isinstance(quiz, dict) else ()):
        if _key(k) and isinstance(v, dict) and isinstance(v.get("correct"), bool) and _choice(v.get("answer")):
            c = v["correct"]
            out["quiz"][k] = {
                "answer": v["answer"],
                "correct": c,
                "timestamp": v["timestamp"] if _int(v.get("timestamp")) else 0,
                # Entries from before per-question tallies imply one attempt (see recordAnswer).
                "right": v["right"] if _int(v.get("right")) else int(c),
                "wrong": v["wrong"] if _int(v.get("wrong")) else int(not c),
            }
    for k, v in (mastery.items() if isinstance(mastery, dict) else ()):
        if _key(k) and isinstance(v, bool):
            out["mastery"][k] = v
    for k, v in (counts.items() if isinstance(counts, dict) else ()):
        if _key(k) and isinstance(v, dict):
            out["counts"][k] = {f: v[f] if _int(v.get(f)) else 0 for f in ("yes", "no", "ts")}
    out["tests"] = [a for a in map(_attempt, tests if isinstance(tests, list) else ()) if a]
    return out


def merge(a, b):
    """Merge stored state a with incoming state b (both already clean()ed). Ties go to a,
    so conflicting untimestamped legacy entries settle on whichever uploaded first."""
    reset = max(a["resetAt"], b["resetAt"])

    def live(ts):  # entries at or before a reset are gone on every device; 0 means never reset
        return not reset or ts > reset

    quiz = {}
    for side in (a, b):
        for k, e in side["quiz"].items():
            if not live(e["timestamp"]):
                continue
            prev = quiz.get(k)
            if prev is None:
                quiz[k] = e
            else:
                win = e if e["timestamp"] > prev["timestamp"] else prev
                # Tallies only grow, so take the max. It undercounts when two devices answer
                # the same question between syncs; per-device counters would fix that.
                quiz[k] = {**win, "right": max(e["right"], prev["right"]), "wrong": max(e["wrong"], prev["wrong"])}

    mastery, counts = {}, {}
    for side in (a, b):
        for t in side["mastery"].keys() | side["counts"].keys():
            c = side["counts"].get(t)
            ts = c["ts"] if c else 0
            if not live(ts):
                continue
            prev = counts.get(t)
            if t in side["mastery"] and (t not in mastery or ts > (prev["ts"] if prev else 0)):
                mastery[t] = side["mastery"][t]
            if c:
                counts[t] = {f: max(c[f], prev[f]) for f in c} if prev else c

    tests = {}
    for side in (a, b):
        for t in side["tests"]:
            if live(t["ts"]):
                tests.setdefault(t["ts"], t)
    return {
        "quiz": quiz,
        "mastery": mastery,
        "counts": counts,
        "tests": sorted(tests.values(), key=lambda t: -t["ts"])[:MAX_TESTS],
        "resetAt": reset,
    }
