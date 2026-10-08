"""D-M06-A control candidate-v3 witness: JCS oracle over frozen RFC 8785 derivations.

Reads /input.bin (the witness-input.json oracle spec), runs a correct JCS
canonicalizer derived by the candidate from the frozen RFC bytes, runs seven
plausible wrong implementations, and prints one JSON verdict to stdout.
No file writes, no network, single process.
"""
import hashlib
import json
import math
import struct
import sys
import time
import unicodedata

WITNESS_ID = "d-m06-a-jcs-oracle-v1"
ESCAPES = {0x08: "\\b", 0x09: "\\t", 0x0A: "\\n", 0x0C: "\\f", 0x0D: "\\r"}


class DomainError(Exception):
    def __init__(self, reason, detail=""):
        Exception.__init__(self, reason + (": " + detail if detail else ""))
        self.reason = reason
        self.detail = detail


def number_token(value, mode):
    if mode == "repr":
        if math.isnan(value):
            return "NaN"
        if math.isinf(value):
            return "Infinity" if value > 0 else "-Infinity"
        return repr(value)
    return es6_number(value)


def es6_number(x):
    if math.isnan(x):
        raise DomainError("prohibited_number_nan")
    if math.isinf(x):
        raise DomainError("prohibited_number_infinity")
    if x == 0:
        return "0"
    neg = x < 0
    a = -x if neg else x
    s = repr(a)
    if "e" in s:
        mant, _, es = s.partition("e")
        e = int(es)
    else:
        mant, e = s, 0
    if "." in mant:
        ip, fp = mant.split(".", 1)
    else:
        ip, fp = mant, ""
    combined = ip + fp
    stripped = combined.lstrip("0")
    lead = len(combined) - len(stripped)
    digits = stripped.rstrip("0") or "0"
    n = len(ip) + e - lead
    k = len(digits)
    if n > 21 or n <= -6:
        out = (digits[0] + ("." + digits[1:] if k > 1 else "")
               + "e" + ("+" if n > 0 else "-") + str(abs(n - 1)))
    elif k <= n <= 21:
        out = digits + "0" * (n - k)
    elif n > 0:
        out = digits[:n] + "." + digits[n:]
    else:
        out = "0." + "0" * (-n) + digits
    return ("-" + out) if neg else out


def json_escaped(s):
    out = []
    for ch in s:
        o = ord(ch)
        if o in ESCAPES:
            out.append(ESCAPES[o])
        elif o < 0x20:
            out.append("\\u%04x" % o)
        elif o == 0x22:
            out.append('\\"')
        elif o == 0x5C:
            out.append("\\\\")
        else:
            out.append(ch)
    return "".join(out)


def jcs_quote(s, surrogate_policy="error", normalize=False):
    if normalize:
        s = unicodedata.normalize("NFC", s)
    out = ['"']
    for ch in s:
        o = ord(ch)
        if 0xD800 <= o <= 0xDFFF:
            if surrogate_policy == "error":
                raise DomainError("invalid_unicode_lone_surrogate", "U+%04X" % o)
            ch = "\ufffd"
            o = 0xFFFD
        if o in ESCAPES:
            out.append(ESCAPES[o])
        elif o < 0x20:
            out.append("\\u%04x" % o)
        elif o == 0x22:
            out.append('\\"')
        elif o == 0x5C:
            out.append("\\\\")
        else:
            out.append(ch)
    out.append('"')
    return "".join(out)


def parse_text(text, dup_policy="reject"):
    def hook(pairs):
        if dup_policy == "reject":
            names = [k for k, _ in pairs]
            if len(names) != len(set(names)):
                raise DomainError("duplicate_name")
        return dict(pairs)

    def tofloat(s):
        try:
            return float(s)
        except OverflowError:
            raise DomainError("prohibited_number_infinity", s)

    return json.loads(text, object_pairs_hook=hook, parse_float=tofloat, parse_int=tofloat)


def serialize(node, sort_mode="utf16", number_mode="es6", surrogate_policy="error",
              normalize=False, whitespace="compact"):
    if whitespace == "pretty":
        item_sep, kv_sep = ", ", ": "
    else:
        item_sep, kv_sep = ",", ":"

    def rec(node):
        if node is None:
            return "null"
        if node is True:
            return "true"
        if node is False:
            return "false"
        if isinstance(node, str):
            return jcs_quote(node, surrogate_policy, normalize)
        if isinstance(node, float):
            return number_token(node, number_mode)
        if isinstance(node, int):
            return number_token(float(node), number_mode)
        if isinstance(node, list):
            return "[" + item_sep.join(rec(v) for v in node) + "]"
        if isinstance(node, dict):
            if sort_mode == "codepoint":
                key = lambda kv: kv[0]
            elif sort_mode == "escaped":
                key = lambda kv: json_escaped(kv[0])
            else:
                key = lambda kv: kv[0].encode("utf-16-be")
            items = sorted(node.items(), key=key)
            return ("{" + item_sep.join(
                jcs_quote(k, surrogate_policy, normalize) + kv_sep + rec(v)
                for k, v in items) + "}")
        raise DomainError("unsupported_type")

    return rec(node)


VARIANTS = {
    "correct": {},
    "w-codepoint-sort": {"sort_mode": "codepoint"},
    "w-escaped-text-sort": {"sort_mode": "escaped"},
    "w-python-repr": {"number_mode": "repr"},
    "w-nfc-normalize": {"normalize": True},
    "w-dup-last-wins": {"dup_policy": "lastwins"},
    "w-surrogate-replace": {"surrogate_policy": "replace"},
    "w-pretty-whitespace": {"whitespace": "pretty"},
}


def canonicalize(text, flags):
    return serialize(parse_text(text, flags.get("dup_policy", "reject")),
                     sort_mode=flags.get("sort_mode", "utf16"),
                     number_mode=flags.get("number_mode", "es6"),
                     surrogate_policy=flags.get("surrogate_policy", "error"),
                     normalize=flags.get("normalize", False),
                     whitespace=flags.get("whitespace", "compact"))


def run_case(case, flags):
    kind = case["kind"]
    if kind == "binding":
        return (True, None)
    if kind == "canonicalize":
        try:
            result = canonicalize(case["input"], flags)
        except DomainError as de:
            if "expected_error" in case and case["expected_error"] == de.reason:
                return (True, None)
            return (False, "error %s, expected %s" % (de.reason, case.get("expected_error")))
        if "expected_error" in case:
            return (False, "expected error %s but got output" % case["expected_error"])
        if result != case["expected_text"]:
            return (False, "output mismatch")
        return (True, None)
    if kind == "number_table":
        mode = flags.get("number_mode", "es6")
        bad = []
        for hexs, expected in case["rows"]:
            value = struct.unpack(">d", bytes.fromhex(hexs))[0]
            try:
                token = number_token(value, mode)
                err = None
            except DomainError as de:
                token, err = None, de.reason
            if expected.startswith("ERROR:"):
                if err != expected[6:]:
                    bad.append(hexs)
            elif err is not None or token != expected:
                bad.append(hexs)
        return (not bad, None if not bad else "mismatched rows: " + ",".join(bad))
    return (False, "unknown kind %s" % kind)


def main():
    raw = open("/input.bin", "rb").read()
    spec = json.loads(raw.decode("utf-8"))
    binding_spec = spec["binding"]
    out = {
        "witness_id": WITNESS_ID,
        "case_id": spec.get("case_id"),
        "arm": spec.get("arm"),
        "python_version": sys.version.split()[0],
        "executed_at_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "executed_at_epoch": time.time(),
        "input_sha256": hashlib.sha256(raw).hexdigest(),
        "code_self_sha256": hashlib.sha256(open(__file__, "rb").read()).hexdigest(),
        "binding": {
            "source_id": binding_spec["primary_source"]["source_id"],
            "source_identifier": binding_spec["primary_source"]["identifier"],
            "source_sha256": binding_spec["primary_source"]["sha256"],
            "seed_fixtures_sha256": binding_spec["seed_fixtures_sha256"],
            "applicability": binding_spec["applicability_statement"],
        },
    }
    results = {}
    for vid, flags in VARIANTS.items():
        passed, failed = [], {}
        for case in spec["cases"]:
            try:
                ok, detail = run_case(case, flags)
            except DomainError as de:
                ok, detail = False, "unexpected error: " + de.reason
            except Exception as exc:
                ok, detail = False, "crash: %s: %s" % (type(exc).__name__, exc)
            if ok:
                passed.append(case["id"])
            else:
                failed[case["id"]] = detail
        results[vid] = {"passed": passed, "failed": failed}
    correct = results["correct"]
    correct_impl_valid = not correct["failed"]

    diff_checks = []
    for case in spec["cases"]:
        ref = case.get("expected_different_from_case")
        if ref:
            outs = {}
            for other in spec["cases"]:
                if other["kind"] == "canonicalize" and "expected_text" in other:
                    try:
                        outs[other["id"]] = canonicalize(other["input"], {})
                    except DomainError:
                        outs[other["id"]] = None
            preserved = outs.get(case["id"]) is not None and outs.get(case["id"]) != outs.get(ref)
            diff_checks.append({"case": case["id"], "differs_from": ref, "preserved": preserved})
            if not preserved:
                correct_impl_valid = False
                correct["failed"][case["id"]] = "preservation check failed: output equals %s" % ref

    discrimination = []
    for w in spec.get("wrong_implementations", []):
        vid = w["id"]
        fails = set(results[vid]["failed"])
        need = set(w["must_fail_on"])
        discrimination.append({
            "id": vid,
            "description": w["description"],
            "discriminated": need <= fails,
            "failed_on": sorted(fails),
            "not_rejected_on": sorted(need - fails),
            "passed_count": len(results[vid]["passed"]),
            "total_cases": len(spec["cases"]),
        })
    all_discriminated = all(d["discriminated"] for d in discrimination)

    selfcheck = []
    for case in spec["cases"]:
        if "expected_text" in case and "expected_hex" in case:
            selfcheck.append({
                "case": case["id"],
                "consistent": case["expected_text"].encode("utf-8") == bytes.fromhex(case["expected_hex"]),
            })
    oracle_self_consistent = all(s["consistent"] for s in selfcheck) if selfcheck else True

    binding_ok = (out["binding"]["source_sha256"] == "63d52294eb0e3f0014174288186d388b4ddbf2c67d1ce8af1d9726eb0c3ab240"
                  and len(out["input_sha256"]) == 64
                  and len(out["code_self_sha256"]) == 64
                  and bool(out["executed_at_utc"])
                  and bool(out["python_version"]))

    verdict = ("valid_scientific_witness"
               if correct_impl_valid and all_discriminated and oracle_self_consistent and binding_ok
               else "witness_invalid")
    out.update({
        "case_results": results,
        "correct_impl_valid": correct_impl_valid,
        "preservation_diff_checks": diff_checks,
        "discrimination": discrimination,
        "all_wrong_impl_discriminated": all_discriminated,
        "oracle_self_check": {"cases_checked": len(selfcheck),
                              "consistent": oracle_self_consistent,
                              "details": selfcheck},
        "binding_ok": binding_ok,
        "units_and_domain": binding_spec["units_and_domain"],
        "applicability": ("Results attest only to this witness build (code_self_sha256), this exact "
                          "input file (input_sha256), and the sandboxed CPython that executed them. "
                          "They do not extend to other implementations, releases, or inputs, and the "
                          "sandbox certifies process isolation only, never oracle truth."),
        "verdict": verdict,
    })
    sys.stdout.write(json.dumps(out, ensure_ascii=True, sort_keys=True))
    sys.stdout.flush()
    return 0


try:
    sys.exit(main())
except Exception as exc:
    sys.stdout.write(json.dumps({
        "witness_id": WITNESS_ID,
        "verdict": "process_error",
        "process_completed": False,
        "error": "%s: %s" % (type(exc).__name__, exc),
    }, ensure_ascii=True))
    sys.stdout.flush()
    sys.exit(0)
