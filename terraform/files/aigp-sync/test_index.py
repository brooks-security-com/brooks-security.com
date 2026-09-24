"""Self-check for the AIGP sync Lambda. Stdlib only: python3 test_index.py

Not packaged: archive_file zips index.py alone. CI runs it in the terraform-validate
job. A fake table that understands exactly the expressions index.py sends stands in
for DynamoDB.
"""

import copy
import json
import os
import types
import unittest
from unittest import mock

os.environ.update(TABLE="t", ORIGIN_SECRET="s3cret", TOKEN_KEY="k" * 64)
import index  # noqa: E402

index.ITERATIONS = 1000  # keep the suite fast; the production count is exercised by nothing here


class CCF(Exception):
    pass


class FakeTable:
    meta = types.SimpleNamespace(client=types.SimpleNamespace(exceptions=types.SimpleNamespace(ConditionalCheckFailedException=CCF)))

    def __init__(self):
        self.items = {}

    def put_item(self, Item, ConditionExpression):
        if Item["username"] in self.items:
            raise CCF
        self.items[Item["username"]] = copy.deepcopy(Item)

    def get_item(self, Key, ConsistentRead, **_):
        assert ConsistentRead
        item = self.items.get(Key["username"])
        return {"Item": copy.deepcopy(item)} if item else {}

    def update_item(self, Key, UpdateExpression, ExpressionAttributeValues, ConditionExpression, ExpressionAttributeNames=None):
        item, vals, names = self.items.get(Key["username"]), ExpressionAttributeValues, ExpressionAttributeNames or {}
        if item is None or (ConditionExpression == "version = :v" and item["version"] != vals[":v"]):
            raise CCF
        for assignment in UpdateExpression.removeprefix("SET ").split(", "):
            lhs, rhs = assignment.split(" = ")
            left, _, right = rhs.partition(" + ")
            item[names.get(lhs, lhs)] = item[left] + vals[right] if right else vals[rhs]


def call(action, body, secret="s3cret"):
    event = {"rawPath": f"/api/aigp/{action}", "headers": {"x-origin-secret": secret}, "body": json.dumps(body)}
    r = index.handler(event, None)
    return r["statusCode"], json.loads(r["body"])


def state(**kw):
    return index.clean(kw)


def q(ts, correct=True, **kw):
    return {"answer": "A", "correct": correct, "timestamp": ts, **kw}


def attempt(ts, **kw):
    return {"ts": ts, "mode": "Practice Quiz", "total": 1, "correct": 1, "timeUsedMs": 5, "auto": False,
            "items": [{"qid": "q-1", "chosen": "A", "correct": True}], **kw}


PW = "violet anchor mango drizzle"


class Handler(unittest.TestCase):
    def setUp(self):
        index._table = FakeTable()

    def register(self, user="ann"):
        code, body = call("register", {"username": user, "password": PW})
        self.assertEqual(code, 200)
        return body["token"]

    def test_rejects_requests_without_the_origin_secret(self):
        self.assertEqual(call("login", {}, secret="nope")[0], 403)
        self.assertEqual(call("nope", {})[0], 404)
        event = {"rawPath": "/api/aigp/login", "headers": {"x-origin-secret": "s3cret"}, "body": "[" * 200_000 + "]" * 200_000}
        self.assertEqual(index.handler(event, None)["statusCode"], 400)

    def test_register_rules(self):
        for pw in ("7 chars", "x" * 129):
            self.assertEqual(call("register", {"username": "ann", "password": pw})[0], 400, pw)
        self.assertEqual(call("register", {"username": "bob", "password": "password"})[0], 200)  # 8 chars, anything goes
        self.assertEqual(call("register", {"username": "a!", "password": PW})[0], 400)
        code, body = call("register", {"username": " Ann ", "password": PW})
        self.assertEqual((code, body["username"]), (200, "ann"))
        self.assertEqual(call("register", {"username": "ann", "password": PW})[0], 409)

    def test_login_and_lockout(self):
        self.register()
        self.assertEqual(call("login", {"username": "ANN", "password": PW})[0], 200)
        for _ in range(index.MAX_FAILS):
            self.assertEqual(call("login", {"username": "ann", "password": PW + "x"})[0], 401)
        self.assertEqual(call("login", {"username": "ann", "password": PW})[0], 429)  # locked, even with the right password
        with mock.patch("time.time", return_value=index.time.time() + index.LOCK_SECS + 1):
            self.assertEqual(call("login", {"username": "ann", "password": PW})[0], 200)
        self.assertEqual(index._table.items["ann"]["fails"], 0)

    def test_login_refuses_when_the_counter_write_fails(self):
        self.register()

        def throttled(**kw):
            raise RuntimeError("ProvisionedThroughputExceededException")

        index._table.update_item = throttled
        self.assertEqual(call("login", {"username": "ann", "password": PW})[0], 503)  # no token without a counted attempt

    def test_sync_merges_across_devices(self):
        token = self.register()
        laptop = {"quiz": {"q1": q(10)}}
        phone = {"quiz": {"q2": q(20, correct=False)}}
        self.assertEqual(set(call("sync", {"token": token, "state": laptop})[1]["state"]["quiz"]), {"q1"})
        self.assertEqual(set(call("sync", {"token": token, "state": phone})[1]["state"]["quiz"]), {"q1", "q2"})
        self.assertEqual(index._table.items["ann"]["version"], 2)
        call("sync", {"token": token, "state": phone})
        self.assertEqual(index._table.items["ann"]["version"], 2)  # nothing new, nothing written
        self.assertEqual(call("sync", {"token": token + "x", "state": phone})[0], 401)
        self.assertEqual(call("sync", {"token": token, "state": []})[0], 400)

    def test_tokens_die_with_the_registration(self):
        old = self.register()
        del index._table.items["ann"]  # the documented recovery: the owner deletes the item
        self.assertEqual(call("sync", {"token": old, "state": {}})[0], 401)
        with mock.patch("time.time", return_value=index.time.time() + 5):
            self.register()  # someone registers the freed name
        self.assertEqual(call("sync", {"token": old, "state": {}})[0], 401)

    def test_sync_retries_when_another_device_wrote_first(self):
        token = self.register()
        table, real_get = index._table, index._table.get_item

        def racing_get(**kw):  # first read sees version 0, then another device bumps it
            item = real_get(**kw)
            if table.items["ann"]["version"] == 0:
                table.items["ann"]["version"] = 1
            return item

        table.get_item = racing_get
        self.assertEqual(call("sync", {"token": token, "state": {"resetAt": 5}})[0], 200)
        self.assertEqual(table.items["ann"]["version"], 2)

    def test_a_fast_clock_cannot_reset_the_future(self):
        token = self.register()
        now_ms = int(index.time.time() * 1000)
        merged = call("sync", {"token": token, "state": {"resetAt": now_ms + 3600_000}})[1]["state"]
        self.assertLessEqual(merged["resetAt"], now_ms + 1000)


class Token(unittest.TestCase):
    def test_round_trip_tamper_expiry(self):
        t = index.make_token("a.b-c", 77, now=1000)
        self.assertEqual(index.check_token(t, now=1001), ("a.b-c", 77))
        self.assertIsNone(index.check_token(t, now=1000 + index.TOKEN_TTL))
        user, created, exp, sig = t.rsplit(".", 3)
        for forged in (f"mallory.{created}.{exp}.{sig}", f"{user}.78.{exp}.{sig}", f"{user}.{created}.{int(exp) + 1}.{sig}"):
            self.assertIsNone(index.check_token(forged, now=1001))
        for junk in (None, 5, "", "a.b", "a.1.2", "a.x.1.y", "a.1.2.é"):
            self.assertIsNone(index.check_token(junk, now=1001))


class Merge(unittest.TestCase):
    def test_clean_rebuilds_entries_from_known_fields(self):
        s = state(quiz={"q1": {"answer": ["A", "C"], "correct": True, "x": 1}, "q2": "x", "q3": {"answer": "A", "correct": 1},
                        "q4": {"answer": "<b>", "correct": True}},
                  mastery={"t": 1, "u": False}, counts={"u": {"yes": True, "no": 2}}, resetAt="9")
        self.assertEqual(s["quiz"], {"q1": {"answer": ["A", "C"], "correct": True, "timestamp": 0, "right": 1, "wrong": 0}})
        self.assertEqual((s["mastery"], s["counts"], s["resetAt"]), ({"u": False}, {"u": {"yes": 0, "no": 2, "ts": 0}}, 0))
        self.assertIsNone(index.clean([]))

    def test_test_attempts_are_type_checked_so_nothing_renders_as_markup(self):
        good = attempt(3, extra="dropped", items=[{"qid": "q-1", "chosen": None, "correct": False}, {"qid": "q-2", "chosen": ["B", "D"], "correct": True}])
        bad = [attempt(4, mode="<img src=x onerror=alert(1)>"), attempt(5, items=[{"qid": "q", "chosen": "<b>", "correct": True}]),
               attempt(6, items="x"), attempt(7, total=True), attempt(8, auto="no"), {"ts": 9}, 7]
        tests = state(tests=[good, *bad])["tests"]
        self.assertEqual([t["ts"] for t in tests], [3])
        self.assertNotIn("extra", tests[0])

    def test_quiz_newest_answer_wins_and_tallies_take_the_max(self):
        a = state(quiz={"q": {"answer": "A", "correct": True, "timestamp": 5, "right": 3, "wrong": 0}})
        b = state(quiz={"q": {"answer": "B", "correct": False, "timestamp": 9, "right": 1, "wrong": 2}})
        self.assertEqual(index.merge(a, b)["quiz"]["q"], {"answer": "B", "correct": False, "timestamp": 9, "right": 3, "wrong": 2})
        self.assertEqual(index.merge(b, a)["quiz"]["q"]["answer"], "B")

    def test_flashcard_newest_rating_wins(self):
        old = state(mastery={"t": False}, counts={"t": {"yes": 0, "no": 4, "ts": 5}})
        new = state(mastery={"t": True}, counts={"t": {"yes": 1, "no": 1, "ts": 9}})
        for a, b in ((old, new), (new, old)):
            m = index.merge(a, b)
            self.assertEqual((m["mastery"]["t"], m["counts"]["t"]), (True, {"yes": 1, "no": 4, "ts": 9}))
        legacy = state(mastery={"t": False})  # rated before sync shipped: no ts, loses to any later rating
        self.assertTrue(index.merge(new, legacy)["mastery"]["t"])
        self.assertTrue(index.merge(legacy, new)["mastery"]["t"])

    def test_legacy_conflicts_settle_on_the_stored_side(self):
        server, laptop = state(mastery={"t": True}), state(mastery={"t": False})
        self.assertTrue(index.merge(server, laptop)["mastery"]["t"])  # converges instead of flipping per sync
        self.assertEqual(index.merge(state(), laptop)["mastery"], {"t": False})  # one side only: kept

    def test_reset_on_one_device_clears_the_others(self):
        before = state(quiz={"q1": q(50)}, mastery={"t": True}, counts={"t": {"yes": 1, "no": 0, "ts": 50}}, tests=[attempt(50)])
        after = state(quiz={"q2": q(150)}, tests=[attempt(150)], resetAt=100)
        m = index.merge(before, after)
        self.assertEqual((set(m["quiz"]), m["mastery"], m["counts"], [t["ts"] for t in m["tests"]], m["resetAt"]), ({"q2"}, {}, {}, [150], 100))
        self.assertEqual(index.merge(m, before), m)  # a stale device syncing later can't resurrect them
        never = index.merge(state(), state(quiz={"q": q(0)}, mastery={"t": True}))  # ts 0 survives when never reset
        self.assertEqual((set(never["quiz"]), never["mastery"]), ({"q"}, {"t": True}))

    def test_tests_union_newest_first_capped(self):
        m = index.merge(state(tests=[attempt(1), attempt(3)]), state(tests=[attempt(2), attempt(3)]))
        self.assertEqual([t["ts"] for t in m["tests"]], [3, 2, 1])
        many = index.merge(state(), state(tests=[attempt(i) for i in range(1, index.MAX_TESTS + 6)]))
        self.assertEqual((len(many["tests"]), many["tests"][-1]["ts"]), (index.MAX_TESTS, 6))


if __name__ == "__main__":
    unittest.main()
