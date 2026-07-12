#!/usr/bin/env python3
"""Strict deterministic attempt-0007 contract and postrun test suite."""
from __future__ import annotations

import copy
import hashlib
import json
import os
import tempfile
from pathlib import Path
from typing import Any, Callable

import canonical_json
import canonical_oracle
import common
import generate_activation_transaction as activation
import validate_postrun as postrun
import write_native_capture as capture_writer
import write_positive_receipt as receipt_writer


def valid_result(aid: str, assignment: dict[str, Any], core: dict[str, Any], auth: dict[str, Any]) -> dict[str, Any]:
    packet = common.load(common.packet_path(aid))
    urls = [f"https://example.org/official/source-{index:02d}" for index in range(8)]
    sources = [
        {"url": url, "title": f"Official source {index:02d}", "publisher": "Example Standards",
         "published_date": None, "access_date": "2026-07-11", "source_tier": "official",
         "material_relevance": "Direct primary evidence for the assigned research question."}
        for index, url in enumerate(urls)
    ]
    rows = {
        "findings": [{"finding_id": "F-1", "claim": "Supported finding.", "evidence_class": "supported_claim", "source_urls": [urls[0]], "confidence": 0.9, "notes": "Direct support."}],
        "competitor_standard_patterns": [{"pattern_id": "P-1", "pattern": "Pattern.", "evidence_class": "inference", "source_urls": [urls[1]], "implication": "Use carefully."}],
        "failure_modes": [{"failure_id": "FM-1", "failure_mode": "Failure.", "evidence_class": "supported_claim", "source_urls": [urls[2]], "mitigation_or_gap": "Mitigate it."}],
        "implications": [{"implication_id": "I-1", "implication": "Implication.", "evidence_class": "inference", "source_urls": [urls[3]], "rationale": "Derived carefully."}],
        "novel_ideas": [{"idea_id": "N-1", "idea": "Idea.", "evidence_class": "inference", "source_urls": [urls[4]], "rationale": "Derived carefully."}],
        "unresolved_questions": [{"question_id": "U-1", "question": "Still unknown.", "evidence_class": "no_evidence", "source_urls": []}],
    }
    attestations = {key: True for key in common.load(common.NAMESPACE / "leaf_initial_task_contract.json")["required_self_attestations"]}
    value = {
        "audit_id": common.AUDIT_ID, "schema_version": common.RESULT_SCHEMA_VERSION,
        "phase": "external_research_current_web_research", "assignment_id": aid,
        "attempt_id": common.ATTEMPT_ID, "controller_thread_id": common.CONTROLLER_THREAD_ID,
        "agent_path": assignment["canonical_agent_path"], "model": common.MODEL,
        "reasoning_effort": common.REASONING_EFFORT, "status": "completed",
        "activation_transaction_id": core["activation_transaction_id"],
        "activation_core_sha256": common.canonical_sha(core),
        "leaf_dispatch_authorization_sha256": common.canonical_sha(auth),
        "topic": packet["topic"], "owner_domains": packet["owner_domains"],
        "feature_refs": packet["feature_refs"], "research_questions": packet["research_questions"],
        "question_coverage": [{"question_index": i, "question": question, "coverage_state": "covered", "evidence_refs": ["F-1"]} for i, question in enumerate(packet["research_questions"])],
        "source_availability": "available", "unavailable_evidence": [], "sources": sources,
        "self_attestation": attestations,
    }
    value.update(rows)
    return value


def wrong(value: Any) -> Any:
    if isinstance(value, bool): return not value
    if isinstance(value, int): return value + 1
    if isinstance(value, list): return value + ["foreign"]
    if isinstance(value, dict): return {**value, "foreign": True}
    return "wrong"


def main() -> None:
    tests: dict[str, bool] = {}

    def put(name: str, passed: bool) -> None:
        if name in tests:
            raise AssertionError("duplicate test:" + name)
        tests[name] = passed is True

    manifest = common.load(common.NAMESPACE / "manifest.json")
    assignments = {row["assignment_id"]: row for row in manifest["assignments"]}
    report_path = Path("/future/luna-independent-prelaunch-v7.json")
    core = activation.build_core(report_path, "a" * 64)
    core_sha = common.canonical_sha(core)
    auths = {aid: activation.build_authorization(aid, assignments[aid], core, core_sha) for aid in common.RECOVERY_IDS}
    envelope = activation.build_envelope(core, core_sha, auths)
    results = {aid: valid_result(aid, assignments[aid], core, auths[aid]) for aid in common.RECOVERY_IDS}
    result_raws = {aid: common.json_bytes(results[aid]) for aid in common.RECOVERY_IDS}
    tree_shas = {aid: common.canonical_sha([{"relative_path": "result.json", "byte_count": len(result_raws[aid]), "file_sha256": common.sha_bytes(result_raws[aid])}]) for aid in common.RECOVERY_IDS}
    proofs = {}
    receipts = {}
    receipt_raws = {}
    for index, aid in enumerate(common.RECOVERY_IDS):
        raw = result_raws[aid]
        proofs[aid] = {
            "schema_version": "external-research-terminal-proof-v7", "assignment_id": aid,
            "attempt_id": common.ATTEMPT_ID, "agent_path": common.expected_agent_path(aid),
            "native_child_thread_id": f"00000000-0000-7000-8000-{index + 1:012d}",
            "native_child_turn_id": f"10000000-0000-7000-8000-{index + 1:012d}",
            "native_child_turn_status": "completed", "terminal_response_exact": "PMR1",
            "result_present_before_pmr1": True, "result_file_sha256": common.sha_bytes(raw),
            "parent_spawn_call_sha256": ("a" if index == 0 else "b") * 64,
            "parent_spawn_result_sha256": ("c" if index == 0 else "d") * 64,
            "spawn_requested_model": common.MODEL, "spawn_requested_reasoning_effort": common.REASONING_EFFORT,
            "fork_turns": "none", "descendants_spawned": 0, "followup_messages_sent": 0, "retries_spawned": 0,
        }
        receipts[aid] = receipt_writer.build_receipt(
            assignments[aid], core, auths[aid], envelope, proofs[aid], common.NAMESPACE / "runtime/terminal-proofs" / f"{aid}.json", "e" * 64,
            common.sha_bytes(raw), canonical_json.canonical_sha256_from_buffer(raw), len(raw), tree_shas[aid],
        )
        receipt_raws[aid] = common.json_bytes(receipts[aid])
    capture = {
        "schema_version": common.CAPTURE_SCHEMA_VERSION, "audit_id": common.AUDIT_ID,
        "sprint_id": common.SPRINT_ID, "retry_namespace": common.RETRY_NAMESPACE,
        "attempt_id": common.ATTEMPT_ID, "controller_thread_id": common.CONTROLLER_THREAD_ID,
        "assignment_count": 2, "native_state_path": "/future/native-state.json", "native_state_file_sha256": "f" * 64,
        "capture_writer_path": str(common.NAMESPACE / "tools/write_native_capture.py"),
        "capture_writer_sha256": common.sha(common.NAMESPACE / "tools/write_native_capture.py"),
        "canonicalization_algorithm_id": common.CANONICALIZATION_ALGORITHM_ID,
        "leaves": [], "coverage_credit": 0, "research_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
    }
    for aid in common.RECOVERY_IDS:
        proof = proofs[aid]
        capture["leaves"].append({
            "assignment_id": aid, "agent_path": common.expected_agent_path(aid),
            "native_child_thread_id": proof["native_child_thread_id"], "native_child_turn_id": proof["native_child_turn_id"],
            "native_child_turn_status": "completed", "terminal_response_exact": "PMR1", "result_present_before_pmr1": True,
            "result_path": str(common.result_path(aid)), "result_file_sha256": common.sha_bytes(result_raws[aid]),
            "result_canonical_sha256": canonical_json.canonical_sha256_from_buffer(result_raws[aid]),
            "output_tree_sha256": tree_shas[aid], "receipt_path": str(common.receipt_path(aid)),
            "receipt_file_sha256": common.sha_bytes(receipt_raws[aid]),
            "receipt_canonical_sha256": canonical_json.canonical_sha256_from_buffer(receipt_raws[aid]),
            "canonicalization_algorithm_id": common.CANONICALIZATION_ALGORITHM_ID,
            "parent_spawn_call_sha256": proof["parent_spawn_call_sha256"],
            "parent_spawn_result_sha256": proof["parent_spawn_result_sha256"],
        })
    capture_raw = common.json_bytes(capture)
    prior_empty = {"identities": set(), "paths": set()}
    valid = postrun.validate_snapshot(core, auths, envelope, result_raws, receipt_raws, capture, capture_raw, tree_shas, prior_empty)
    put("full-valid-writer-capture-postrun-flow", valid["status"] == "pass_candidate_pending_independent" and valid["candidate_research_eligibility_count"] == 8 and valid["research_credit"] == 0)
    put("full-valid-six-floor-preserved", valid["preserved_floor_ids"] == common.FLOOR_IDS and not valid["unrelated_six_floor_suppressed"])
    put("draft202012-pinned", common.schema_engine() == {"library": "jsonschema", "version": "4.26.0", "validator": "Draft202012Validator", "draft": "2020-12"})
    for aid in common.RECOVERY_IDS:
        value, file_sha, canonical_sha, errors = common.validate_result_buffer(result_raws[aid], assignments[aid], core, auths[aid])
        put(f"valid-result:{aid}", value == results[aid] and not errors and file_sha != canonical_sha)
        put(f"valid-receipt:{aid}", postrun.receipt_errors(receipts[aid], receipt_raws[aid], assignments[aid], result_raws[aid], core, auths[aid], envelope, tree_shas[aid]) == [])
        put(f"valid-terminal-proof:{aid}", receipt_writer.terminal_proof_errors(proofs[aid], aid, common.sha_bytes(result_raws[aid])) == [])

    # Independent canonicalization oracle: whitespace, key order, escaped Unicode,
    # exponent/fraction/integer spellings all alter raw bytes while preserving the object digest.
    canonical_baseline = b'{"a":1,"b":"\xc3\xa9","c":[1,2,0],"d":{"x":10,"y":true}}'
    baseline_digest = canonical_json.canonical_sha256_from_buffer(canonical_baseline)
    put("canonical-oracle-baseline", canonical_oracle.canonical_sha256_from_buffer(canonical_baseline) == baseline_digest)
    variants = []
    numeric_ones = ["1", "1.0", "1.00", "1e0", "1E+0", "10e-1", "0.1e1", "100e-2"]
    numeric_twos = ["2", "2.0", "2.00", "2e0", "2E+0", "20e-1", "0.2e1", "200e-2"]
    zeroes = ["0", "0.0", "-0", "0e9", "0.000", "-0.0"]
    unicode_forms = ['"é"', '"\\u00e9"']
    for index in range(240):
        one = numeric_ones[index % len(numeric_ones)]
        two = numeric_twos[(index // 3) % len(numeric_twos)]
        zero = zeroes[(index // 7) % len(zeroes)]
        uni = unicode_forms[index % 2]
        if index % 3 == 0:
            text = f'{{ "d" : {{"y":true,"x":10.0}}, "c" : [{one},{two},{zero}], "b" : {uni}, "a" : {one} }}'
        elif index % 3 == 1:
            text = f'{{\n"a":{one},\n"b":{uni},\n"c":[{one},{two},{zero}],\n"d":{{"x":1e1,"y":true}}\n}}'
        else:
            text = f'{{"c":[{one},{two},{zero}],"a":{one},"d":{{"x":10,"y":true}},"b":{uni}}}'
        variants.append(text.encode())
    for index, raw in enumerate(variants):
        prod = canonical_json.canonical_sha256_from_buffer(raw)
        oracle = canonical_oracle.canonical_sha256_from_buffer(raw)
        put(f"canonical-equivalence:{index:03d}", prod == baseline_digest and oracle == prod and common.sha_bytes(raw) != baseline_digest)

    malformed = [b'{"a":1,"a":1}', b'{"n":NaN}', b'{"n":Infinity}', b'{"n":-Infinity}', b'\xff']
    for index, raw in enumerate(malformed):
        rejected = False
        try: canonical_json.canonical_sha256_from_buffer(raw)
        except Exception: rejected = True
        put(f"canonical-reject:{index}", rejected)
    same_raw = b'{"n":1.00}'
    put("same-raw-deterministic-parse", canonical_json.canonical_sha256_from_buffer(same_raw) == canonical_json.canonical_sha256_from_buffer(bytes(same_raw)))

    # Exhaustively mutate every positive receipt field: omitted, wrong, extra.
    receipt_schema = common.load(common.NAMESPACE / "schema/external_research_dispatch_receipt_v7.schema.json")
    for aid in common.RECOVERY_IDS:
        base = receipts[aid]
        for key in sorted(base):
            missing = copy.deepcopy(base); missing.pop(key)
            missing_raw = common.json_bytes(missing)
            put(f"receipt:{aid}:missing:{key}", bool(postrun.receipt_errors(missing, missing_raw, assignments[aid], result_raws[aid], core, auths[aid], envelope, tree_shas[aid])))
            changed = copy.deepcopy(base); changed[key] = wrong(changed[key])
            changed_raw = common.json_bytes(changed)
            put(f"receipt:{aid}:wrong:{key}", bool(postrun.receipt_errors(changed, changed_raw, assignments[aid], result_raws[aid], core, auths[aid], envelope, tree_shas[aid])))
        extra = copy.deepcopy(base); extra["result_sha256"] = base["result_file_sha256"]
        put(f"receipt:{aid}:ambiguous-result-alias", bool(postrun.receipt_errors(extra, common.json_bytes(extra), assignments[aid], result_raws[aid], core, auths[aid], envelope, tree_shas[aid])))
        extra = copy.deepcopy(base); extra["output_sha256"] = base["output_tree_sha256"]
        put(f"receipt:{aid}:ambiguous-output-alias", bool(postrun.receipt_errors(extra, common.json_bytes(extra), assignments[aid], result_raws[aid], core, auths[aid], envelope, tree_shas[aid])))
        copied_label = copy.deepcopy(base); copied_label["schema_version"] = common.RECEIPT_CONTRACT_VERSION
        put(f"receipt:{aid}:contract-label-confusion", bool(postrun.receipt_errors(copied_label, common.json_bytes(copied_label), assignments[aid], result_raws[aid], core, auths[aid], envelope, tree_shas[aid])))
        attempt6_repro = copy.deepcopy(base); attempt6_repro["result_canonical_sha256"] = base["result_file_sha256"]
        put(f"attempt6-reproduction:{aid}:raw-in-canonical-field", bool(postrun.receipt_errors(attempt6_repro, common.json_bytes(attempt6_repro), assignments[aid], result_raws[aid], core, auths[aid], envelope, tree_shas[aid])))
        swapped = copy.deepcopy(base); swapped["result_file_sha256"], swapped["result_canonical_sha256"] = swapped["result_canonical_sha256"], swapped["result_file_sha256"]
        put(f"receipt:{aid}:raw-canonical-swap", bool(postrun.receipt_errors(swapped, common.json_bytes(swapped), assignments[aid], result_raws[aid], core, auths[aid], envelope, tree_shas[aid])))

    # Raw variants share a canonical object digest but must each bind their exact file digest.
    for index in range(100):
        raw = json.dumps(results["ER-0003"], ensure_ascii=(index % 2 == 0), sort_keys=(index % 3 == 0), indent=(index % 5) + 1).encode()
        raw_sha = common.sha_bytes(raw); canon_sha = canonical_json.canonical_sha256_from_buffer(raw)
        put(f"raw-canonical-distinction:{index}:different", raw_sha != canon_sha)
        candidate = copy.deepcopy(receipts["ER-0003"])
        candidate["result_file_sha256"] = canon_sha
        candidate["result_canonical_sha256"] = raw_sha
        candidate["result_buffer_byte_count"] = len(raw)
        put(f"raw-canonical-distinction:{index}:swap-rejected", bool(postrun.receipt_errors(candidate, common.json_bytes(candidate), assignments["ER-0003"], raw, core, auths["ER-0003"], envelope, tree_shas["ER-0003"])))

    # Complete capture field and identity/hash mutation coverage.
    capture_schema = common.load(common.NAMESPACE / "schema/external_research_native_capture_v7.schema.json")
    put("capture-valid-schema", common.draft_errors(capture, capture_schema) == [])
    for index, row in enumerate(capture["leaves"]):
        aid = row["assignment_id"]
        for key in sorted(row):
            candidate = copy.deepcopy(capture); candidate["leaves"][index].pop(key)
            errs = postrun.capture_errors(candidate, common.json_bytes(candidate), receipts, receipt_raws, result_raws, tree_shas, prior_empty)
            put(f"capture:{aid}:missing:{key}", bool(errs))
            candidate = copy.deepcopy(capture); candidate["leaves"][index][key] = wrong(candidate["leaves"][index][key])
            errs = postrun.capture_errors(candidate, common.json_bytes(candidate), receipts, receipt_raws, result_raws, tree_shas, prior_empty)
            put(f"capture:{aid}:wrong:{key}", bool(errs))
    for key in sorted(set(capture) - {"leaves"}):
        candidate = copy.deepcopy(capture); candidate.pop(key)
        put(f"capture-top:missing:{key}", bool(postrun.capture_errors(candidate, common.json_bytes(candidate), receipts, receipt_raws, result_raws, tree_shas, prior_empty)))
    duplicate = copy.deepcopy(capture); duplicate["leaves"][1]["native_child_thread_id"] = duplicate["leaves"][0]["native_child_thread_id"]
    put("capture:duplicate-thread", "capture:thread-uniqueness" in postrun.capture_errors(duplicate, common.json_bytes(duplicate), receipts, receipt_raws, result_raws, tree_shas, prior_empty))
    replay = {"identities": {capture["leaves"][0]["native_child_thread_id"]}, "paths": set()}
    put("capture:identity-replay", any("identity-reuse" in error for error in postrun.capture_errors(capture, capture_raw, receipts, receipt_raws, result_raws, tree_shas, replay)))
    path_replay = {"identities": set(), "paths": {capture["leaves"][0]["agent_path"]}}
    put("capture:path-replay", any("path-reuse" in error for error in postrun.capture_errors(capture, capture_raw, receipts, receipt_raws, result_raws, tree_shas, path_replay)))

    # Result schema/cross-field semantics, including attempt5 no_evidence failure.
    schema = common.load(common.NAMESPACE / "schema/external_research_result_v7.schema.json")
    top_mutations: list[tuple[str, Callable[[dict[str, Any]], None]]] = [
        ("extra-top", lambda x: x.update(extra=True)), ("wrong-model", lambda x: x.update(model="gpt-5.6-sol")),
        ("wrong-effort", lambda x: x.update(reasoning_effort="xhigh")), ("wrong-attempt", lambda x: x.update(attempt_id="attempt-0006")),
        ("wrong-path", lambda x: x.update(agent_path="/root/reused")), ("task-thread-id", lambda x: x.update(task_thread_id="forbidden")),
        ("question-missing", lambda x: x["question_coverage"].pop()), ("source-underfill", lambda x: x.update(sources=x["sources"][:1])),
        ("duplicate-source", lambda x: x["sources"].append(copy.deepcopy(x["sources"][0]))),
        ("nonhttps", lambda x: x["sources"][0].update(url="http://example.org")),
        ("search-url", lambda x: x["sources"][0].update(url="https://google.com/search?q=x")),
        ("foreign-source", lambda x: x["findings"][0].update(source_urls=["https://example.org/foreign"])),
        ("question-foreign-evidence", lambda x: x["question_coverage"][0].update(evidence_refs=["FOREIGN"])),
    ]
    for name, mutate in top_mutations:
        candidate = copy.deepcopy(results["ER-0003"]); mutate(candidate)
        put("result-mutation:" + name, bool(common.draft_errors(candidate, schema) + common.result_errors(candidate, assignments["ER-0003"], core, auths["ER-0003"])))
    for section in common.SECTIONS:
        for refkey in sorted(common.REFERENCE_KEYS):
            candidate = copy.deepcopy(results["ER-0008"])
            candidate[section][0]["evidence_class"] = "no_evidence"
            candidate[section][0]["source_urls"] = []
            candidate[section][0][refkey] = ["REF"]
            put(f"no-evidence:{section}:{refkey}", any("no_evidence_with_references" in error for error in common.semantic_errors(candidate, common.load(common.packet_path("ER-0008")))))
    attempt5 = copy.deepcopy(results["ER-0008"]); attempt5["unresolved_questions"][0]["source_urls"] = [attempt5["sources"][0]["url"]]
    put("attempt5-reproduction:no-evidence-cites-source", any("no_evidence_with_references" in error for error in common.semantic_errors(attempt5, common.load(common.packet_path("ER-0008")))))

    # Activation/report closure, stale intent visibility, policy/model/path/scope drift.
    expected_report = activation.expected_independent_report()
    for key in sorted(expected_report):
        candidate = copy.deepcopy(expected_report); candidate[key] = wrong(candidate[key])
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "report.json"; path.write_bytes(common.json_bytes(candidate))
            put("independent-report:wrong:" + key, bool(activation.report_errors(candidate, path, common.sha(path))))
    for key in sorted(core):
        candidate = copy.deepcopy(core); candidate[key] = wrong(candidate[key])
        put("activation-core:wrong:" + key, bool(activation.core_errors(candidate, report_path, "a" * 64)))
    for aid in common.RECOVERY_IDS:
        for key in sorted(auths[aid]):
            candidate = copy.deepcopy(auths[aid]); candidate[key] = wrong(candidate[key])
            put(f"authorization:{aid}:wrong:{key}", bool(activation.authorization_errors(candidate, aid, assignments[aid], core, core_sha)))
    for key in sorted(envelope):
        candidate = copy.deepcopy(envelope); candidate[key] = wrong(candidate[key])
        put("activation-envelope:wrong:" + key, bool(activation.envelope_errors(candidate, core, core_sha, auths)))
    put("stale-blocked-intent-is-lineage", all(common.load(common.intent_path(aid))["prelaunch_intent_is_immutable_lineage_only_after_later_authorization"] for aid in common.RECOVERY_IDS))
    put("authorization-true-grant-required", all(auths[aid]["activation_granted"] is True for aid in common.RECOVERY_IDS))

    # Exclusive writers, duplicate/manual/replay closure, TOCTOU/output-tree variants.
    receipt_source = (common.NAMESPACE / "tools/write_positive_receipt.py").read_text()
    capture_source = (common.NAMESPACE / "tools/write_native_capture.py").read_text()
    activation_source = (common.NAMESPACE / "tools/generate_activation_transaction.py").read_text()
    put("receipt-writer-exclusive", "write_exclusive" in receipt_source and "one immutable buffer" in receipt_source)
    put("capture-writer-exclusive", "write_exclusive" in capture_source)
    put("activation-generator-exclusive", "write_exclusive" in activation_source)
    put("activation-order-core-before-auth-before-envelope", activation_source.index("write_exclusive(common.core_path()") < activation_source.index("write_exclusive(common.authorization_path") < activation_source.index("write_exclusive(common.envelope_path()"))
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "receipt.json"
        common.write_exclusive(path, receipts["ER-0003"])
        duplicate_failed = False
        try: common.write_exclusive(path, receipts["ER-0003"])
        except FileExistsError: duplicate_failed = True
        put("duplicate-receipt-exclusive-create", duplicate_failed)
        output = Path(tmp) / "output"; output.mkdir(); (output / "result.json").write_bytes(result_raws["ER-0003"])
        baseline_tree = common.output_tree_sha256(output)
        (output / "extra.json").write_text("{}")
        put("output-tree-extra-drift", common.output_tree_sha256(output) != baseline_tree)
        (output / "extra.json").unlink(); (output / "result.json").write_bytes(result_raws["ER-0003"] + b" ")
        put("mutate-after-read-tree-drift", common.output_tree_sha256(output) != baseline_tree)
        if hasattr(os, "symlink"):
            (output / "result.json").unlink(); (output / "target.json").write_text("{}")
            os.symlink(output / "target.json", output / "result.json")
            rejected = False
            try: common.output_tree_inventory(output)
            except ValueError: rejected = True
            put("output-tree-symlink-rejected", rejected)

    put("current-zero-state", common.zero_state_errors() == [])
    put("v10-lineage-hash", common.sha(common.ROOT / "master/coordination/CONCURRENCY_POLICY_V10.json") == common.V10_SHA256)
    put("v11-active-hash", common.sha(common.ROOT / "master/coordination/CONCURRENCY_POLICY_V11.json") == common.V11_SHA256)
    put("routing-v2-hash", common.sha(common.ROOT / "master/coordination/MODEL_LANE_ROUTING_POLICY_V2.json") == common.ROUTING_V2_SHA256)
    put("attempt6-capture-hash", common.sha(common.ROOT / "master/external_research/sprint-wave-0001/retry-attempt-0006/runtime/native_capture.json") == common.ATTEMPT6_CAPTURE_SHA256)
    put("attempt6-primary-hash", common.sha(common.ROOT / "master/external_research/sprint-wave-0001/retry-attempt-0006/validation/primary-cumulative-postrun.json") == common.ATTEMPT6_PRIMARY_SHA256)
    put("fresh-agent-paths", all(common.expected_agent_path(aid) not in common.prior_identity_inventory()["paths"] for aid in common.RECOVERY_IDS))
    put("canonical-production-oracle-source-distinct", common.sha(common.NAMESPACE / "tools/canonical_json.py") != common.sha(common.NAMESPACE / "tools/canonical_oracle.py"))

    failures = sorted(name for name, passed in tests.items() if not passed)
    minimum = 600
    report = {
        "schema_version": "external-research-recovery-attempt-0007-tests-v1",
        "status": "pass" if not failures and len(tests) >= minimum else "fail",
        "counts": {"total": len(tests), "passed": len(tests) - len(failures), "failed": len(failures), "minimum_required": minimum},
        "errors": failures,
        "test_digest": hashlib.sha256(json.dumps(tests, sort_keys=True, separators=(",", ":")).encode()).hexdigest(),
        "categories": {
            "canonicalization_equivalence": 240, "receipt_field_and_digest_mutations": True,
            "capture_identity_and_digest_mutations": True, "activation_and_report_mutations": True,
            "no_evidence_and_source_question_closure": True, "toctou_and_output_tree": True,
            "full_valid_writer_capture_postrun_flow": tests.get("full-valid-writer-capture-postrun-flow", False),
        },
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
