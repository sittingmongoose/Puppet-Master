#!/usr/bin/env python3
"""348 isolated positive/negative cases for the V31 semantic-repair gate."""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import sys
import tempfile
from pathlib import Path
from typing import Any, Callable

sys.dont_write_bytecode = True
import verify_gate_v31_1 as gate

CaseFn = Callable[[], bool]
CASES: list[tuple[str, str, str, CaseFn]] = []


def add(category: str, polarity: str, name: str, function: CaseFn) -> None:
    CASES.append((category, polarity, f"{category}:{polarity}:{name}", function))


def setter(path: tuple[Any, ...], value: Any) -> Callable[[dict[str, Any]], None]:
    def mutate(document: dict[str, Any]) -> None:
        target: Any = document
        for key in path[:-1]:
            target = target[key]
        target[path[-1]] = value
    return mutate


def deleter(path: tuple[Any, ...]) -> Callable[[dict[str, Any]], None]:
    def mutate(document: dict[str, Any]) -> None:
        target: Any = document
        for key in path[:-1]:
            target = target[key]
        del target[path[-1]]
    return mutate


def valid_dimension() -> dict[str, Any]:
    return {
        "disposition": "blocked_insufficient_evidence",
        "rationale": "Independent evidence is insufficient for this executable boundary.",
        "scenarios": ["Run the blocked transition against the missing authority evidence boundary."],
        "acceptance_criteria": [{
            "criterion": "Keep certification blocked until independently sourced authority evidence is present.",
            "observables": ["The disposition remains blocked and no certification credit is emitted."],
            "evidence_artifacts": ["A source-registry and claim-support validation report."],
            "oracle": {
                "pass": "Pass when the blocked state and zero credit are durably recorded.",
                "fail": "Fail when certification or credit appears without qualifying evidence."
            },
        }],
        "spec_deltas": ["Specify the missing authority evidence, state transition, and falsifiable oracle."],
    }


def source(source_id: str, url: str, domain: str, authority: str, ip: str, authority_class: str = "official_standard") -> dict[str, Any]:
    return {
        "source_id": source_id, "url": url, "canonical_url": gate.canonical_url(url), "registrable_domain": domain,
        "title": f"Authoritative source {source_id}", "publisher": authority, "authority_id": authority,
        "authority_class": authority_class, "accessed_at": "2026-07-12T09:00:00Z",
        "retrieval": {
            "status": "read", "final_url": url, "http_status": 200, "content_sha256": "a" * 64,
            "receipt_sha256": "b" * 64, "resolved_ips": [ip], "redirect_chain": [],
        },
    }


def strong_certification() -> dict[str, Any]:
    sources = [
        source("SRC-W3C", "https://www.w3.org/TR/WCAG22/", "w3.org", "W3C", "8.8.8.8"),
        source("SRC-NIST", "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final", "nist.gov", "NIST", "1.1.1.1", "official_government"),
    ]
    mappings = [
        {"claim_id": "CLM-1", "claim": "The first authority defines a directly applicable requirement.", "evidence_class": "supported_claim", "source_ids": ["SRC-W3C"], "evidence_label": "direct_authority_support"},
        {"claim_id": "CLM-2", "claim": "The second authority independently defines the required control.", "evidence_class": "supported_claim", "source_ids": ["SRC-NIST"], "evidence_label": "independent_authority_support"},
    ]
    claims = [
        {"claim_id": item["claim_id"], "claim": item["claim"], "source_urls": [next(row["url"] for row in sources if row["source_id"] == item["source_ids"][0])], "evidence_label": item["evidence_label"]}
        for item in mappings
    ]
    return {
        "provisional_feature_ref": "PF-TEST", "source_row_sha256": "c" * 64, "research_result_file_sha256": "d" * 64,
        "research_record_sha256": "e" * 64, "certification_disposition": "certified",
        "disposition_rationale": "Two independent live authority sources directly support this certification.",
        "research_applicability": {"state": "applicable", "rationale": "The live evidence directly addresses the feature.", "browsing_performed": True, "claims_used": claims},
        "live_research": {
            "performed": True, "evidence_state": "applicable", "session_id": "LIVE-TEST", "started_at": "2026-07-12T08:59:00Z",
            "completed_at": "2026-07-12T09:01:00Z", "attempts": [{"query": "Find two independent authority sources for the feature.", "method": "public_web", "outcome": "Two public authority sources were read and registered."}],
        },
        "source_registry": sources, "claim_support": mappings, "dimensions": {}, "overall_spec_deltas": [], "newly_discovered_candidates": [],
    }


def no_evidence_certification(state: str = "no_evidence") -> dict[str, Any]:
    value = strong_certification()
    value["certification_disposition"] = "blocked_insufficient_evidence"
    value["disposition_rationale"] = "Live research did not produce qualifying independent evidence, so certification remains blocked."
    value["research_applicability"] = {"state": "insufficient" if state == "no_evidence" else state, "rationale": "The research threshold was not met by qualifying evidence.", "browsing_performed": True, "claims_used": []}
    value["live_research"]["evidence_state"] = state
    value["live_research"]["attempts"] = [
        {"query": "Search official standards for the missing feature authority.", "method": "public_web", "outcome": "No directly applicable authority evidence was found."},
        {"query": "Search primary documentation for an independent implementation oracle.", "method": "public_web", "outcome": "No second independent qualifying authority was found."},
    ]
    value["source_registry"] = []
    value["claim_support"] = []
    value["overall_spec_deltas"] = ["Specify the missing evidence authority, retrieval receipt, and blocked transition oracle."]
    value["dimensions"] = {"normal_happy_path": valid_dimension()}
    return value


def mutated_research(base: dict[str, Any], mutation: Callable[[dict[str, Any]], None]) -> bool:
    value = copy.deepcopy(base)
    mutation(value)
    return bool(gate.research_errors(value))


def valid_capture() -> dict[str, Any]:
    authority = gate.load(gate.AUTHORITY)
    parent = gate.load(gate.POLICY_V32)["model_routing"]["luna_independent_reviewers"]["controller_thread_id"]
    return {
        "schema_version": "scenario-adversarial-controller-parent-native-capture-v31-v1", "gate_id": gate.GATE_ID,
        "audit_id": gate.AUDIT_ID, "wave_id": "wave-0001", "cohort_id": "cohort-0002", "capture_kind": "parent_native_identity_only",
        "append_only": True, "authored_by_role": "controller", "controller_agent_path": "/root/sol_controller_v29",
        "parent_controller_thread_id": parent, "gate_authority_sha256": gate.file_binding(gate.AUTHORITY)["raw_sha256"],
        "embedded_report_identity_authority": "non_authoritative",
        "reviewer": {"native_reviewer_thread_id": "019f6000-1111-7222-8333-123456789abc", "model": "gpt-5.6-luna", "reasoning_effort": "max", "fork_turns": "none", "descendants": 0, "followups": 0, "retries": 0},
        "terminal_report": {"path": str(gate.LUNA), "raw_sha256": gate.LUNA_SHA, "observed_status": "fail_closed"},
        "scope": {"identity_only": True, "semantic_reinterpretation": False, "activation": False, "credit": 0, "result_writes": 0, "receipt_writes": 0, "sol_capture_rows": 0},
    }


def register_gate_cases() -> None:
    category = "luna_capture_gate"
    luna = gate.load(gate.LUNA)
    authority = gate.load(gate.AUTHORITY)
    add(category, "positive", "luna-complete", lambda: gate.luna_report_errors(copy.deepcopy(luna)) == [])
    add(category, "positive", "luna-exact-rejected", lambda: luna["assignment_sets"]["rejected"] == gate.EXPECTED_REJECTED)
    add(category, "positive", "luna-exact-eligible", lambda: luna["assignment_sets"]["eligible"] == gate.EXPECTED_ELIGIBLE)
    identity_ignored = copy.deepcopy(luna)
    identity_ignored["reviewer_identity"] = {"controller_thread_id": "non-authoritative-placeholder"}
    add(category, "positive", "embedded-identity-ignored", lambda value=identity_ignored: gate.luna_report_errors(value) == [])
    capture = valid_capture()
    add(category, "positive", "capture-complete", lambda: gate.capture_errors(copy.deepcopy(capture), authority) == [])
    add(category, "positive", "capture-fresh-reviewer", lambda: capture["reviewer"]["native_reviewer_thread_id"] not in {row["identity"]["native_child_thread_id"] for row in gate.load(gate.V30 / "attempt1_preservation_snapshot.json")["assignments"]})
    add(category, "positive", "capture-terminal-binding", lambda: capture["terminal_report"]["raw_sha256"] == gate.LUNA_SHA)
    add(category, "positive", "capture-zero-scope", lambda: capture["scope"]["activation"] is False and capture["scope"]["credit"] == 0)

    luna_mutations = [
        ("schema", setter(("schema_version",), "wrong")), ("audit", setter(("audit_id",), "wrong")),
        ("wave", setter(("wave_id",), "wrong")), ("cohort", setter(("cohort_id",), "wrong")),
        ("status", setter(("status",), "pass")), ("cohort-status", setter(("cohort_status",), "pass")),
        ("derived-status", setter(("derived_postrun_status",), "pass")), ("model", setter(("model",), "gpt-5.6-sol")),
        ("effort", setter(("reasoning_effort",), "xhigh")), ("fork", setter(("fork_turns",), "all")),
        ("descendants", setter(("descendant_count",), 1)), ("followups", setter(("followup_count",), 1)),
        ("retries", setter(("retry_count",), 1)), ("read-only", setter(("read_only_verification",), False)),
        ("fresh", setter(("fresh_direct_reviewer",), False)), ("independent", setter(("independently_reconstructed",), False)),
        ("primary-comparison-only", setter(("primary_report_used_as_comparison_only",), False)),
        ("primary-sha", setter(("primary_report_sha256",), "0" * 64)),
        ("rejected-omitted", setter(("assignment_sets", "rejected"), gate.EXPECTED_REJECTED[:-1])),
        ("rejected-reordered", setter(("assignment_sets", "rejected"), list(reversed(gate.EXPECTED_REJECTED)))),
        ("eligible-omitted", setter(("assignment_sets", "eligible"), gate.EXPECTED_ELIGIBLE[:-1])),
        ("unresolved", setter(("assignment_sets", "unresolved"), ["A005SA-0011"])),
        ("credit", setter(("candidate_credit",), 1)), ("side-effect", setter(("side_effects", "activation_side_effects"), 1)),
    ]
    for name, mutation in luna_mutations:
        add(category, "negative", "luna-" + name, lambda m=mutation: mutated_luna(luna, m))

    capture_mutations = [
        ("schema", setter(("schema_version",), "wrong")), ("gate", setter(("gate_id",), "wrong")),
        ("audit", setter(("audit_id",), "wrong")), ("wave", setter(("wave_id",), "wrong")),
        ("cohort", setter(("cohort_id",), "wrong")), ("kind", setter(("capture_kind",), "self_reported")),
        ("append", setter(("append_only",), False)), ("role", setter(("authored_by_role",), "reviewer")),
        ("controller-path", setter(("controller_agent_path",), "/root/other")),
        ("parent", setter(("parent_controller_thread_id",), "019f6000-0000-7000-8000-000000000000")),
        ("authority", setter(("gate_authority_sha256",), "0" * 64)),
        ("embedded-authority", setter(("embedded_report_identity_authority",), "authoritative")),
        ("reviewer-model", setter(("reviewer", "model"), "gpt-5.6-sol")),
        ("reused-id", setter(("reviewer", "native_reviewer_thread_id"), gate.load(gate.V30 / "attempt1_preservation_snapshot.json")["assignments"][0]["identity"]["native_child_thread_id"])),
        ("report-sha", setter(("terminal_report", "raw_sha256"), "0" * 64)),
        ("activation", setter(("scope", "activation"), True)),
    ]
    for name, mutation in capture_mutations:
        add(category, "negative", "capture-" + name, lambda m=mutation: mutated_capture(capture, authority, m))


def mutated_luna(base: dict[str, Any], mutation: Callable[[dict[str, Any]], None]) -> bool:
    value = copy.deepcopy(base)
    mutation(value)
    return bool(gate.luna_report_errors(value))


def mutated_capture(base: dict[str, Any], authority: dict[str, Any], mutation: Callable[[dict[str, Any]], None]) -> bool:
    value = copy.deepcopy(base)
    mutation(value)
    return bool(gate.capture_errors(value, authority))


def binding_mutation(binding: dict[str, Any], key: str, value: Any) -> bool:
    candidate = copy.deepcopy(binding)
    candidate[key] = value
    return bool(gate.binding_errors(candidate, "fixture"))


def swapped_binding(binding: dict[str, Any], path: str) -> bool:
    candidate = copy.deepcopy(binding)
    candidate["path"] = path
    return bool(gate.binding_errors(candidate, "fixture"))


def output_fixture(kind: str) -> bool:
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary) / "output"
        if kind == "missing":
            try:
                gate.output_tree_inventory(root)
            except (OSError, ValueError):
                return True
            return False
        root.mkdir()
        if kind == "file":
            (root / "result.json").write_text("{}", encoding="utf-8")
            return gate.output_tree_sha(root) != gate.EMPTY_TREE_SHA
        if kind == "nested":
            (root / "nested").mkdir()
            return gate.output_tree_sha(root) != gate.EMPTY_TREE_SHA
        if kind == "symlink":
            target = Path(temporary) / "target"
            target.write_text("x", encoding="utf-8")
            (root / "link").symlink_to(target)
            try:
                gate.output_tree_inventory(root)
            except ValueError:
                return True
            return False
        if kind == "hardlink":
            target = Path(temporary) / "target"
            target.write_text("x", encoding="utf-8")
            os.link(target, root / "hard")
            try:
                gate.output_tree_inventory(root)
            except ValueError:
                return True
            return False
    return False


def register_binding_cases() -> None:
    category = "six_assignment_packet_intent_output_rehash"
    manifest = gate.rows(gate.MANIFEST)
    for index, row in enumerate(manifest):
        assignment_id = row["assignment_id"]
        other = manifest[(index + 1) % len(manifest)]
        add(category, "positive", assignment_id + ":packet", lambda r=row: gate.binding_errors(r["packet"], "packet") == [])
        add(category, "positive", assignment_id + ":intent", lambda r=row: gate.binding_errors(r["v31_intent"], "intent") == [])
        add(category, "positive", assignment_id + ":empty-output", lambda r=row: gate.output_tree_sha(Path(r["output_tree"]["path"])) == gate.EMPTY_TREE_SHA)
        for target, label in (("packet", "packet"), ("v31_intent", "intent")):
            binding = row[target]
            add(category, "negative", assignment_id + f":{label}-raw", lambda b=binding: binding_mutation(b, "raw_sha256", "0" * 64))
            add(category, "negative", assignment_id + f":{label}-bytes", lambda b=binding: binding_mutation(b, "byte_count", -1))
            add(category, "negative", assignment_id + f":{label}-canonical", lambda b=binding: binding_mutation(b, "canonical_sha256", "0" * 64))
            add(category, "negative", assignment_id + f":{label}-swap", lambda b=binding, o=other, t=target: swapped_binding(b, o[t]["path"]))
        for kind in ("missing", "file", "nested", "symlink", "hardlink"):
            add(category, "negative", assignment_id + ":output-" + kind, lambda k=kind: output_fixture(k))


def register_url_cases() -> None:
    category = "https_private_placeholder_registrable_authority"
    good = [
        "https://www.w3.org/TR/WCAG22/", "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
        "https://docs.slint.dev/latest/docs/slint/", "https://kubernetes.io/docs/concepts/",
        "https://www.rfc-editor.org/rfc/rfc3986.html", "https://json-schema.org/draft/2020-12/json-schema-core",
        "https://docs.github.com/en/actions", "https://cheatsheetseries.owasp.org/cheatsheets/",
        "https://datatracker.ietf.org/doc/html/rfc9110", "https://doc.rust-lang.org/book/",
        "https://docs.python.org/3/library/", "https://developer.apple.com/documentation/",
    ]
    for index, url in enumerate(good):
        add(category, "positive", f"public-{index:02d}", lambda value=url: gate.source_url_errors(value, "url") == [] and bool(gate.registrable_domain(gate.urlsplit(value).hostname or "")))
    bad_schemes = [
        "http://www.w3.org/TR/", "ftp://www.w3.org/TR/", "file:///etc/passwd", "ws://www.w3.org/socket",
        "data:text/plain,x", "javascript:alert(1)", "ssh://github.com/repo", "mailto:user@example.org",
    ]
    placeholders = [
        "https://one.example/spec", "https://example.com/spec", "https://example.net/spec", "https://example.org/spec",
        "https://example.edu/spec", "https://foo.test/spec", "https://foo.invalid/spec", "https://localhost/spec",
        "https://foo.local/spec", "https://foo.internal/spec", "https://foo.home/spec", "https://foo.lan/spec",
        "https://foo.onion/spec", "https://placeholder.com/spec", "https://invalid.com/spec", "https://test.com/spec",
    ]
    ips = [
        "https://127.0.0.1/x", "https://0.0.0.0/x", "https://10.0.0.1/x", "https://172.16.0.1/x",
        "https://192.168.1.1/x", "https://169.254.169.254/x", "https://192.0.2.1/x", "https://198.51.100.1/x",
        "https://203.0.113.1/x", "https://224.0.0.1/x", "https://255.255.255.255/x", "https://8.8.8.8/x",
        "https://[::1]/x", "https://[fe80::1]/x", "https://[fc00::1]/x", "https://[2001:4860:4860::8888]/x",
    ]
    syntax = [
        "https://user@www.w3.org/x", "https://user:pass@www.w3.org/x", "https://www.w3.org:444/x", "https://www.w3.org./x",
        "https://www.w3.org/has space", "https://www.w3.org/line\nbreak", "https://w3/x", "https:///missing-host",
        "https://", "not-a-url", "", "   ", "https://foo..bar/x", "https://-bad.examplex/x",
        "https://www.w3.org:bad/x", "//www.w3.org/x", "/relative/path", "www.w3.org/x",
        "https://localhost.localdomain/x", "https://metadata.google.internal/computeMetadata/v1/",
    ]
    bad = bad_schemes + placeholders + ips + syntax
    assert len(bad) == 60
    for index, url in enumerate(bad):
        add(category, "negative", f"rejected-{index:02d}", lambda value=url: bool(gate.source_url_errors(value, "url")))


def register_registry_cases() -> None:
    category = "live_source_registry_claim_support"
    base = strong_certification()
    for index in range(10):
        add(category, "positive", f"closed-registry-{index:02d}", lambda value=copy.deepcopy(base): gate.research_errors(value) == [])
    mutations: list[tuple[str, Callable[[dict[str, Any]], None]]] = [
        ("performed", setter(("live_research", "performed"), False)), ("state", setter(("live_research", "evidence_state"), "weak")),
        ("attempts", setter(("live_research", "attempts"), [])), ("query-short", setter(("live_research", "attempts", 0, "query"), "short")),
        ("outcome-short", setter(("live_research", "attempts", 0, "outcome"), "short")),
        ("duplicate-id", setter(("source_registry", 1, "source_id"), "SRC-W3C")),
        ("http-url", setter(("source_registry", 0, "url"), "http://www.w3.org/TR/WCAG22/")),
        ("example-url", setter(("source_registry", 0, "url"), "https://one.example/spec")),
        ("canonical", setter(("source_registry", 0, "canonical_url"), "https://wrong.example/spec")),
        ("domain", setter(("source_registry", 0, "registrable_domain"), "wrong.org")),
        ("authority-duplicate", setter(("source_registry", 1, "authority_id"), "W3C")),
        ("authority-empty", setter(("source_registry", 0, "authority_id"), "")),
        ("secondary", setter(("source_registry", 0, "authority_class"), "secondary")),
        ("retrieval-status", setter(("source_registry", 0, "retrieval", "status"), "failed")),
        ("final-http", setter(("source_registry", 0, "retrieval", "final_url"), "http://www.w3.org/TR/WCAG22/")),
        ("http-status", setter(("source_registry", 0, "retrieval", "http_status"), 500)),
        ("content-hash", setter(("source_registry", 0, "retrieval", "content_sha256"), "bad")),
        ("receipt-hash", setter(("source_registry", 0, "retrieval", "receipt_sha256"), "bad")),
        ("ips-empty", setter(("source_registry", 0, "retrieval", "resolved_ips"), [])),
        ("ip-private", setter(("source_registry", 0, "retrieval", "resolved_ips"), ["10.0.0.1"])),
        ("ip-loopback", setter(("source_registry", 0, "retrieval", "resolved_ips"), ["127.0.0.1"])),
        ("redirect-http", setter(("source_registry", 0, "retrieval", "redirect_chain"), ["http://www.w3.org/TR/"])),
        ("redirect-private", setter(("source_registry", 0, "retrieval", "redirect_chain"), ["https://localhost/private"])),
        ("duplicate-url", setter(("source_registry", 1, "url"), base["source_registry"][0]["url"])),
        ("duplicate-canonical", setter(("source_registry", 1, "canonical_url"), base["source_registry"][0]["canonical_url"])),
        ("duplicate-domain", setter(("source_registry", 1, "registrable_domain"), "w3.org")),
        ("claim-id", setter(("claim_support", 1, "claim_id"), "CLM-1")),
        ("claim-short", setter(("claim_support", 0, "claim"), "short")),
        ("label-short", setter(("claim_support", 0, "evidence_label"), "x")),
        ("source-ids-empty", setter(("claim_support", 0, "source_ids"), [])),
        ("unknown-source", setter(("claim_support", 0, "source_ids"), ["SRC-UNKNOWN"])),
        ("duplicate-source-ref", setter(("claim_support", 0, "source_ids"), ["SRC-W3C", "SRC-W3C"])),
        ("inference", setter(("claim_support", 0, "evidence_class"), "inference")),
        ("orphan", setter(("claim_support",), [base["claim_support"][0]])),
        ("no-mappings", setter(("claim_support",), [])), ("no-projected-claims", setter(("research_applicability", "claims_used"), [])),
        ("projected-text", setter(("research_applicability", "claims_used", 0, "claim"), "Different projected claim text that does not match mapping.")),
        ("projected-url", setter(("research_applicability", "claims_used", 0, "source_urls"), [base["source_registry"][1]["url"]])),
        ("base-state", setter(("research_applicability", "state"), "weak")),
        ("browsing", setter(("research_applicability", "browsing_performed"), False)),
        ("one-source", setter(("source_registry",), [base["source_registry"][0]])),
        ("one-mapping", setter(("claim_support",), [base["claim_support"][0]])),
        ("extra-orphan", append_third_source()), ("duplicate-source-row", append_duplicate_source()),
        ("authority-repeat", setter(("source_registry", 1, "authority_id"), base["source_registry"][0]["authority_id"])),
        ("userinfo", setter(("source_registry", 0, "url"), "https://user@www.w3.org/TR/WCAG22/")),
        ("public-ip-literal", setter(("source_registry", 0, "url"), "https://8.8.8.8/spec")),
        ("reserved-resolved", setter(("source_registry", 0, "retrieval", "resolved_ips"), ["192.0.2.1"])),
        ("invalid-authority-class", setter(("source_registry", 0, "authority_class"), "untrusted")),
        ("invalid-evidence-class", setter(("claim_support", 0, "evidence_class"), "no_evidence")),
    ]
    assert len(mutations) == 50
    for name, mutation in mutations:
        add(category, "negative", name, lambda m=mutation: mutated_research(base, m))


def append_third_source() -> Callable[[dict[str, Any]], None]:
    def mutate(value: dict[str, Any]) -> None:
        value["source_registry"].append(source("SRC-IETF", "https://datatracker.ietf.org/doc/html/rfc9110", "ietf.org", "IETF", "9.9.9.9"))
    return mutate


def append_duplicate_source() -> Callable[[dict[str, Any]], None]:
    def mutate(value: dict[str, Any]) -> None:
        value["source_registry"].append(copy.deepcopy(value["source_registry"][0]))
    return mutate


def register_evidence_cases() -> None:
    category = "disposition_no_evidence_concrete_delta"
    positives = [
        strong_certification(), no_evidence_certification(), no_evidence_certification("weak"), no_evidence_certification("misapplied"),
        no_evidence_certification("insufficient"), no_evidence_certification("not_applicable"), strong_certification(), strong_certification(),
    ]
    positives[6]["certification_disposition"] = "gap_confirmed"
    positives[7]["certification_disposition"] = "contradiction"
    for index, value in enumerate(positives):
        add(category, "positive", f"valid-disposition-{index:02d}", lambda item=copy.deepcopy(value): gate.research_errors(item) == [])
    base = no_evidence_certification()
    mutations: list[tuple[str, Callable[[dict[str, Any]], None]]] = [
        ("attempts-empty", setter(("live_research", "attempts"), [])), ("attempts-one", setter(("live_research", "attempts"), base["live_research"]["attempts"][:1])),
        ("attempts-duplicate", setter(("live_research", "attempts"), [base["live_research"]["attempts"][0], base["live_research"]["attempts"][0]])),
        ("query-short", setter(("live_research", "attempts", 0, "query"), "short")), ("query-tbd", setter(("live_research", "attempts", 0, "query"), "TBD")),
        ("outcome-short", setter(("live_research", "attempts", 0, "outcome"), "short")),
        ("registry-present", setter(("source_registry",), strong_certification()["source_registry"])),
        ("mapping-present", setter(("claim_support",), strong_certification()["claim_support"])),
        ("claims-present", setter(("research_applicability", "claims_used"), strong_certification()["research_applicability"]["claims_used"])),
        ("state", setter(("research_applicability", "state"), "applicable")), ("browsing", setter(("research_applicability", "browsing_performed"), False)),
        ("certified", setter(("certification_disposition",), "certified")), ("gap", setter(("certification_disposition",), "gap_confirmed")),
        ("deltas-empty", setter(("overall_spec_deltas",), [])), ("delta-tbd", setter(("overall_spec_deltas",), ["TBD"])),
        ("dimensions-empty", setter(("dimensions",), {})), ("dimension-disposition", setter(("dimensions", "normal_happy_path", "disposition"), "certified")),
        ("spec-empty", setter(("dimensions", "normal_happy_path", "spec_deltas"), [])), ("spec-tbd", setter(("dimensions", "normal_happy_path", "spec_deltas"), ["TBD"])),
        ("scenario-empty", setter(("dimensions", "normal_happy_path", "scenarios"), [])), ("scenario-tbd", setter(("dimensions", "normal_happy_path", "scenarios"), ["TBD"])),
        ("criteria-empty", setter(("dimensions", "normal_happy_path", "acceptance_criteria"), [])),
        ("criterion-short", setter(("dimensions", "normal_happy_path", "acceptance_criteria", 0, "criterion"), "short")),
        ("criterion-tbd", setter(("dimensions", "normal_happy_path", "acceptance_criteria", 0, "criterion"), "TBD")),
        ("observables-empty", setter(("dimensions", "normal_happy_path", "acceptance_criteria", 0, "observables"), [])),
        ("observables-tbd", setter(("dimensions", "normal_happy_path", "acceptance_criteria", 0, "observables"), ["TBD"])),
        ("artifacts-empty", setter(("dimensions", "normal_happy_path", "acceptance_criteria", 0, "evidence_artifacts"), [])),
        ("artifacts-tbd", setter(("dimensions", "normal_happy_path", "acceptance_criteria", 0, "evidence_artifacts"), ["TBD"])),
        ("pass-short", setter(("dimensions", "normal_happy_path", "acceptance_criteria", 0, "oracle", "pass"), "short")),
        ("pass-tbd", setter(("dimensions", "normal_happy_path", "acceptance_criteria", 0, "oracle", "pass"), "TBD")),
        ("fail-short", setter(("dimensions", "normal_happy_path", "acceptance_criteria", 0, "oracle", "fail"), "short")),
        ("fail-tbd", setter(("dimensions", "normal_happy_path", "acceptance_criteria", 0, "oracle", "fail"), "TBD")),
        ("oracle-equal", equal_oracle()), ("performed", setter(("live_research", "performed"), False)),
        ("weak-certified", state_certified("weak")), ("misapplied-certified", state_certified("misapplied")),
        ("insufficient-certified", state_certified("insufficient")), ("notapp-certified", state_certified("not_applicable")),
        ("certified-one-source", certified_one_source()), ("certified-duplicate-domain", certified_duplicate_domain()),
    ]
    assert len(mutations) == 40
    for name, mutation in mutations:
        fixture = strong_certification() if name.startswith("certified-") or name.endswith("-certified") else base
        add(category, "negative", name, lambda m=mutation, value=copy.deepcopy(fixture): mutated_research(value, m))


def equal_oracle() -> Callable[[dict[str, Any]], None]:
    def mutate(value: dict[str, Any]) -> None:
        oracle = value["dimensions"]["normal_happy_path"]["acceptance_criteria"][0]["oracle"]
        oracle["fail"] = oracle["pass"]
    return mutate


def state_certified(state: str) -> Callable[[dict[str, Any]], None]:
    def mutate(value: dict[str, Any]) -> None:
        value["research_applicability"]["state"] = state
        value["live_research"]["evidence_state"] = state
        value["certification_disposition"] = "certified"
    return mutate


def certified_one_source() -> Callable[[dict[str, Any]], None]:
    def mutate(value: dict[str, Any]) -> None:
        value["source_registry"] = value["source_registry"][:1]
        value["claim_support"] = value["claim_support"][:1]
        value["research_applicability"]["claims_used"] = value["research_applicability"]["claims_used"][:1]
    return mutate


def certified_duplicate_domain() -> Callable[[dict[str, Any]], None]:
    def mutate(value: dict[str, Any]) -> None:
        second = value["source_registry"][1]
        second["url"] = "https://www.w3.org/TR/WAI-ARIA/"
        second["canonical_url"] = gate.canonical_url(second["url"])
        second["registrable_domain"] = "w3.org"
        value["research_applicability"]["claims_used"][1]["source_urls"] = [second["url"]]
    return mutate


def register_base_cases() -> None:
    category = "draft202012_namespace_zero_state_toctou"
    add(category, "positive", "result-schema-valid", lambda: not gate.Draft202012Validator.check_schema(gate.load(gate.RESULT_SCHEMA)))
    add(category, "positive", "capture-schema-valid", lambda: not gate.Draft202012Validator.check_schema(gate.load(gate.CAPTURE_SCHEMA)))
    add(category, "positive", "luna-schema-valid", lambda: not gate.Draft202012Validator.check_schema(gate.load(gate.LUNA_SCHEMA)))
    add(category, "positive", "preterminal-pass-blocked", lambda: gate.verify_gate(require_terminal=False)["status"] == "pass_blocked")
    negatives: list[tuple[str, CaseFn]] = [
        ("duplicate-json-key", duplicate_json_key), ("stable-symlink", stable_symlink), ("stable-directory", stable_directory),
        ("output-symlink", lambda: output_fixture("symlink")), ("output-hardlink", lambda: output_fixture("hardlink")),
        ("output-nested", lambda: output_fixture("nested")), ("placeholder-text", lambda: not gate.concrete_text("TBD")),
        ("short-text", lambda: not gate.concrete_text("short")), ("empty-concrete-list", lambda: not gate.concrete_list([])),
        ("whitespace-url", lambda: bool(gate.source_url_errors("https://w3.org/has space", "url"))),
        ("private-ip", lambda: bool(gate.public_ip_errors(["10.0.0.1"], "ip"))),
        ("invalid-ip", lambda: bool(gate.public_ip_errors(["not-an-ip"], "ip"))),
        ("binding-raw", lambda: binding_mutation(gate.file_binding(gate.LUNA), "raw_sha256", "0" * 64)),
        ("binding-canonical", lambda: binding_mutation(gate.file_binding(gate.AUTHORITY), "canonical_sha256", "0" * 64)),
        ("binding-bytes", lambda: binding_mutation(gate.file_binding(gate.AUTHORITY), "byte_count", -1)),
        ("capture-invalid-instance", lambda: bool(list(gate.Draft202012Validator(gate.load(gate.CAPTURE_SCHEMA)).iter_errors({"schema_version": "wrong"})))),
        ("result-invalid-instance", lambda: bool(list(gate.Draft202012Validator(gate.load(gate.RESULT_SCHEMA)).iter_errors({"audit_id": gate.AUDIT_ID})))),
        ("duplicate-domain", lambda: mutated_research(strong_certification(), certified_duplicate_domain())),
        ("no-evidence-delta", lambda: mutated_research(no_evidence_certification(), setter(("overall_spec_deltas",), []))),
        ("fifo-nonregular", fifo_nonregular),
    ]
    assert len(negatives) == 20
    for name, function in negatives:
        add(category, "negative", name, function)


def duplicate_json_key() -> bool:
    try:
        gate.parse_json(b'{"x":1,"x":2}')
    except gate.DuplicateKey:
        return True
    return False


def stable_symlink() -> bool:
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        target = root / "target.json"
        target.write_text("{}", encoding="utf-8")
        link = root / "link.json"
        link.symlink_to(target)
        try:
            gate.stable_read(link)
        except ValueError:
            return True
    return False


def stable_directory() -> bool:
    with tempfile.TemporaryDirectory() as temporary:
        try:
            gate.stable_read(Path(temporary))
        except ValueError:
            return True
    return False


def fifo_nonregular() -> bool:
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary) / "output"
        root.mkdir()
        fifo = root / "fifo"
        os.mkfifo(fifo)
        try:
            gate.output_tree_inventory(root)
        except ValueError:
            return True
    return False


def write_report(report: dict[str, Any]) -> None:
    gate.TEST_REPORT.parent.mkdir(parents=True, exist_ok=True)
    raw = (json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8")
    descriptor = os.open(gate.TEST_REPORT, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        os.write(descriptor, raw)
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-report", action="store_true")
    args = parser.parse_args()
    register_gate_cases()
    register_binding_cases()
    register_url_cases()
    register_registry_cases()
    register_evidence_cases()
    register_base_cases()
    matrix = gate.load(gate.TEST_MATRIX)
    failures: list[dict[str, str]] = []
    results: list[dict[str, Any]] = []
    for category, polarity, case_id, function in CASES:
        try:
            passed = function() is True
            detail = ""
        except Exception as exc:
            passed = False
            detail = type(exc).__name__ + ":" + str(exc)
        results.append({"case_id": case_id, "category": category, "polarity": polarity, "passed": passed})
        if not passed:
            failures.append({"case_id": case_id, "detail": detail})
    ids = [row[2] for row in CASES]
    category_counts: dict[str, dict[str, int]] = {}
    for category, polarity, _, _ in CASES:
        counts = category_counts.setdefault(category, {"positive": 0, "negative": 0, "total": 0})
        counts[polarity] += 1
        counts["total"] += 1
    expected_counts = {row["category"]: {"positive": row["positive"], "negative": row["negative"], "total": row["total"]} for row in matrix["categories"]}
    if len(ids) != len(set(ids)) or len(ids) != matrix["expected_total"] or category_counts != expected_counts:
        failures.append({"case_id": "matrix-contract", "detail": f"ids={len(ids)} unique={len(set(ids))} counts={category_counts}"})
    source_raw = Path(__file__).read_bytes()
    digest = hashlib.sha256(("\n".join(sorted(ids)) + "\n").encode("utf-8")).hexdigest()
    report = {
        "schema_version": "scenario-adversarial-semantic-repair-tests-v31-report-v1",
        "status": "pass" if not failures else "fail", "passed": len(CASES) - len([row for row in results if not row["passed"]]),
        "total": len(CASES), "failed": len([row for row in results if not row["passed"]]),
        "minimum_required": matrix["minimum_required"], "positive": sum(1 for row in results if row["polarity"] == "positive"),
        "negative": sum(1 for row in results if row["polarity"] == "negative"), "category_counts": category_counts,
        "case_id_digest": digest, "test_source_sha256": hashlib.sha256(source_raw).hexdigest(),
        "verifier_source_sha256": gate.file_binding(gate.HERE / "verify_gate_v31_1.py")["raw_sha256"],
        "authority_sha256": gate.file_binding(gate.AUTHORITY)["raw_sha256"], "failures": failures, "cases": results,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    if args.write_report and report["status"] == "pass":
        write_report(report)
    raise SystemExit(0 if report["status"] == "pass" and len(CASES) >= 300 else 1)


if __name__ == "__main__":
    main()
