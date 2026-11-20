#!/usr/bin/env python3
"""Run the shared number corpus through coordination's integer slots.

Date-time cases are not adopted. The local payload hash stays separate from
CV-317 producer JCS. Exit 0 when nothing crashes and there is no disagreement.
"""
import copy
import importlib.util
import json
import math
import sys
from pathlib import Path

from pm_event_numbers import Refusal, producer_semantic_digest
from pm_coordination_numbers import RECIPE_ID, epoch_token, retained_retry_matches

ROOT = Path(__file__).resolve().parents[1]
NUMBER_OPS = {"token", "integer", "parse", "slot", "current_json_slot", "json_number"}


def coordination():
    spec = importlib.util.spec_from_file_location("coordination_numbers", ROOT / "scripts/pm_coordination_events.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main():
    sys.set_int_max_str_digits(0)
    checker = coordination()
    corpus = json.loads((ROOT / "Plans/event_number_recipe_corpus.json").read_text())
    fixtures = checker.load(checker.FIXTURE_PATH)["payloads"]
    base = next(case for case in fixtures if case["event_type"] == "coordination.agent_operation_updated")
    status = next(case for case in fixtures if case["event_type"] == "coordination.agent_status_updated")
    status_epoch = checker.key_recovery_epoch(status["payload"]["idempotency_key"])
    agree = refuse = skip = crash = 0
    disagreements = []
    for case in corpus["cases"]:
        if case.get("op") not in NUMBER_OPS or case.get("date_time_profile"):
            skip += 1
            continue
        raw = case.get("raw")
        if type(raw) is not str or len(raw) > 8000:
            skip += 1
            continue
        number = epoch_token(raw) if case["op"] == "token" else None
        if case["op"] != "token":
            try:
                parsed = json.loads(raw)
            except json.JSONDecodeError:
                skip += 1
                continue
            number = parsed if type(parsed) is int else None
            if type(parsed) is float and math.isfinite(parsed) and parsed == int(parsed):
                number = parsed
        if number is None and case.get("output") == "accepted":
            skip += 1
            continue
        if type(number) is int and number >= 2:
            payload = copy.deepcopy(status["payload"])
            payload["agent_revision"] = number
            payload["idempotency_key"] = checker.idempotency_key(
                status["event_type"], payload["project_id"], payload["agent_id"], status_epoch, number)
            event_type = status["event_type"]
        elif type(number) is int and 0 <= number <= 100 or type(number) is float or number is None:
            payload = copy.deepcopy(base["payload"])
            payload["progress_pct"] = number if number is not None else raw
            event_type = base["event_type"]
        else:
            skip += 1
            continue
        try:
            result = checker.payload_rejection(event_type, payload)
        except Exception as exc:
            crash += 1
            disagreements.append({"id": case["id"], "error": type(exc).__name__})
            continue
        if case.get("output") not in ("accepted", "refused"):
            skip += 1
            continue
        accepted = result is None
        corpus_accepted = case.get("output") == "accepted"
        # progress_pct's owner maximum is 100. A corpus integer outside that, or a
        # float spelling the shared parser accepts, is a coordination-domain refusal.
        if corpus_accepted and type(number) is int and number < 0:
            refuse += 1
            continue
        if corpus_accepted and type(number) is not int and not accepted:
            refuse += 1
            continue
        if accepted == corpus_accepted or (not corpus_accepted and not accepted):
            if accepted:
                agree += 1
            else:
                refuse += 1
        else:
            disagreements.append({"id": case["id"], "op": case["op"], "lane": result, "corpus": case.get("output")})
    huge = "9" * 4400
    status = next(case for case in checker.load(checker.FIXTURE_PATH)["payloads"]
                  if case["event_type"] == "coordination.agent_status_updated")
    payload = copy.deepcopy(status["payload"])
    revision = epoch_token(huge)
    epoch = checker.key_recovery_epoch(status["payload"]["idempotency_key"])
    payload["agent_revision"] = revision
    payload["idempotency_key"] = checker.idempotency_key(status["event_type"], payload["project_id"], payload["agent_id"], epoch, revision)
    huge_result = checker.payload_rejection(status["event_type"], payload)
    operation = copy.deepcopy(base["payload"])
    operation["progress_pct"] = 1.0
    float_result = checker.payload_rejection(base["event_type"], operation)
    record = checker.load(checker.FIXTURE_PATH)["valid_events"][0]["record"]
    local = checker.producer_digest(record["event_type"], record["payload"])
    try:
        generic = producer_semantic_digest(record)
        generic_status = "separate"
    except Refusal as exc:
        generic = str(exc)
        generic_status = "separate_refusal"
    retained_ok = retained_retry_matches(RECIPE_ID, local, local)
    retained_forged = retained_retry_matches("forged-recipe", local, local)
    report = {
        "status": "pass" if not disagreements and not crash and huge_result is None and float_result == "payload_integer_slots" and retained_ok and not retained_forged else "fail",
        "agree": agree,
        "domain_or_refusal": refuse,
        "skipped": skip,
        "crash": crash,
        "disagreements": disagreements[:10],
        "huge_4400_revision": huge_result,
        "progress_float": float_result,
        "local_payload_digest": local,
        "generic_producer_jcs": generic_status,
        "retained_exact": retained_ok,
        "retained_forged": retained_forged,
    }
    print(json.dumps(report, indent=2))
    raise SystemExit(report["status"] != "pass")


if __name__ == "__main__":
    main()
