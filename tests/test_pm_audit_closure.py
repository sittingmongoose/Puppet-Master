from __future__ import annotations

import argparse
import base64
import contextlib
import copy
import importlib.util
import io
import json
import os
import subprocess
import sys
import tempfile
import time
import unittest
from collections.abc import Callable
from typing import Any
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "scripts/pm-audit-closure.py"
SPEC = importlib.util.spec_from_file_location("pm_audit_closure", MODULE_PATH)
assert SPEC is not None and SPEC.loader is not None
pm_audit_closure = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(pm_audit_closure)
STATUS_INDEX_PATH = ROOT / "scripts/pm-audit-status-index.py"
STATUS_INDEX_SPEC = importlib.util.spec_from_file_location("pm_audit_status_index", STATUS_INDEX_PATH)
assert STATUS_INDEX_SPEC is not None and STATUS_INDEX_SPEC.loader is not None
pm_audit_status_index = importlib.util.module_from_spec(STATUS_INDEX_SPEC)
STATUS_INDEX_SPEC.loader.exec_module(pm_audit_status_index)


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.write_text("".join(json.dumps(row, sort_keys=True) + "\n" for row in rows), encoding="utf-8")


def test_owner_answer_signature_matches_the_committed_ed25519_key() -> None:
    import pytest

    serialization = pytest.importorskip("cryptography.hazmat.primitives.serialization")
    ed25519 = pytest.importorskip("cryptography.hazmat.primitives.asymmetric.ed25519")
    decisions = ROOT / "Plans/.audits/closure-reaudit-20261104/decisions"
    answer = json.loads((decisions / "vm.pm-closure-lead--C-FP2-SPLIT.json").read_bytes())
    signature = answer.pop("signature")
    assert signature["alg"] == "ed25519"
    assert signature["keyId"] == "c112b38be1d32ea0"
    key = serialization.load_pem_public_key((decisions / "c112b38be1d32ea0.pub").read_bytes())
    assert isinstance(key, ed25519.Ed25519PublicKey)
    payload = json.dumps(answer, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    key.verify(base64.b64decode(signature["value"], validate=True), payload)


def test_direct_unittest_entry_point_works_without_pytest() -> None:
    run = subprocess.run(
        [sys.executable, "-B", "-I", "-S", str(Path(__file__).resolve()),
         "PmAuditClosureSelfAnchorTests.test_reaudit_append_help_states_the_author_time_rule"],
        capture_output=True, text=True, check=False,
    )
    assert run.returncode == 0, run.stderr
    assert "Ran 1 test" in run.stderr


def refs(audit_id: str = "audit-terminal", ledger_id: str = "pldg-test") -> dict[str, str]:
    return {
        "audit_id": audit_id,
        "ledger_id": ledger_id,
        "baseline_ref": "base-ref",
        "subject_ref": "subject-ref",
        "observation_ref": "observation-ref",
    }


def write_audit_report(audit_dir: Path, audit_refs: dict[str, str], *, status: str, repair_required_count: int) -> None:
    payload = {
        "schema_id": "pm.semantic_audit.report.v1",
        **audit_refs,
        "status": status,
        "repair_required_count": repair_required_count,
    }
    (audit_dir / "audit_report.json").write_text(json.dumps(payload, sort_keys=True), encoding="utf-8")


def scope_row(audit_refs: dict[str, str], family: str, *, finding_keys: list[str] | None = None, classification: str = "covered") -> dict:
    row = {
        **audit_refs,
        "check_family": family,
        "source_atom_ids": [f"atom-{family}"],
        "plan_unit_ids": [f"PU-{family}"],
        "owner_docs": ["Plans/Test.md"],
        "detail_keys": [family],
        "exact_tokens": [family],
        "covered_artifacts": ["semantic_risks.jsonl"],
        "classification": classification,
        "repair_required": False,
        "finding_level": "observation",
        "finding_keys": finding_keys or [],
    }
    row["check_id"] = pm_audit_closure.compute_check_id(row)
    return row


def write_complete_scope(audit_dir: Path, audit_refs: dict[str, str], *, finding_keys: list[str] | None = None) -> None:
    rows = [
        scope_row(audit_refs, family, finding_keys=finding_keys if family == "compiled_atom_detail" else None)
        for family in sorted(pm_audit_closure.SCOPE_REQUIRED_FAMILIES)
    ]
    write_jsonl(audit_dir / "audit_scope_manifest.jsonl", rows)


def finding_row(audit_refs: dict[str, str], *, repair_required: bool, level: str = "warning") -> dict:
    row = {
        **audit_refs,
        "schema_id": "pm.semantic_audit.finding.v1",
        "classification": "missing_or_drift" if repair_required else "source_lineage_only",
        "finding_family": "test_family",
        "source_atom_ids": ["atom-0001"],
        "plan_unit_ids": ["PU-001"],
        "owner_docs": ["Plans/Test.md"],
        "detail_keys": ["detail"],
        "exact_tokens": ["token"],
        "repair_required": repair_required,
        "finding_level": level,
        "summary": "test finding",
    }
    row["finding_key"] = pm_audit_closure.compute_finding_key(row)
    return row


def registry_row(audit_refs: dict[str, str], finding: dict, closure_id: str = "closure-test-001") -> dict:
    return {
        "closure_id": closure_id,
        "finding_key": finding["finding_key"],
        "closure_status": "repaired",
        "audit_ids": [audit_refs["audit_id"]],
        "closed_by_audit_id": audit_refs["audit_id"],
    }


def closure_matrix_row(audit_refs: dict[str, str], finding: dict, *, source_row: int = 1) -> dict:
    row = {
        **audit_refs,
        "source_artifact": "semantic_risks.jsonl",
        "source_row": source_row,
        "finding_family": finding["finding_family"],
        "source_atom_ids": finding["source_atom_ids"],
        "plan_unit_ids": finding["plan_unit_ids"],
        "owner_docs": finding["owner_docs"],
        "detail_keys": finding["detail_keys"],
        "exact_tokens": finding["exact_tokens"],
        "finding_key": finding["finding_key"],
        "closure_status": "repaired",
        # Tracked evidence is available in fresh worktrees; local AGENTS.md is not.
        "closure_evidence": ["tests/test_pm_audit_closure.py"],
        "closure_reason": "closed in test",
        "registry_closure_id": "closure-test-001",
    }
    return row


def impact_row(audit_refs: dict[str, str], finding: dict, *, drift_field: str | None = None) -> dict:
    drift = {field: False for field in pm_audit_closure.POST_REPAIR_DRIFT_FIELDS}
    if drift_field:
        drift[drift_field] = True
    row = {
        **audit_refs,
        "source_artifact": "semantic_risks.jsonl",
        "source_row": 1,
        "finding_key": finding["finding_key"],
        "files": ["Plans/Test.md"],
        "plan_unit_ids": finding["plan_unit_ids"],
        "schemas": [],
        "dependency_edges": [],
        "owner_refs": ["Plans/Test.md"],
        "ledger_projection_fields": ["state.current"],
        "index_artifacts": ["Plans/.plan_index/plan_units.jsonl"],
        "governance_artifacts": [],
        "scope_check_ids": [],
        "post_repair_semantic_audit": {
            "status": "PASS",
            "repair_required_count": 0,
            "covered_original_scope": True,
            "covered_impact_rows": True,
            "drift": drift,
        },
    }
    row["impact_id"] = pm_audit_closure.compute_impact_id(row)
    return row


class PmAuditClosureSelfAnchorTests(unittest.TestCase):
    def setUp(self) -> None:
        temporary = tempfile.TemporaryDirectory(prefix="pm-self-anchor-")
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()
        root_patch = patch.object(pm_audit_closure, "ROOT", self.root)
        root_patch.start()
        self.addCleanup(root_patch.stop)
        self.audit_dir = self.root / "Plans/.audits/reaudit-fixture"
        self.audit_dir.mkdir(parents=True)
        self.registry = self.audit_dir.parent / "_semantic_closure_registry.jsonl"
        self.registry_ref = pm_audit_closure.rel(self.registry)
        self.anchor = self.registry_ref + "#jsonlset=audit_ids=audit-fixture"
        self.records = self.audit_dir / "records.jsonl"
        evidence = self.audit_dir / "fixture.txt"
        evidence.write_text("The fixture evidence stays current.\n")
        self.target = pm_audit_closure._self_test_registry_row(
            owner_docs=[self.registry_ref], closure_evidence=[self.registry_ref],
            hashes={"closure_evidence_hashes": {pm_audit_closure.rel(evidence): pm_audit_closure.sha256_file(evidence)}},
        )
        write_jsonl(self.registry, [self.target])
        self.git("init", "-q")

    def git(self, *args: str) -> str:
        return subprocess.run(
            ["git", "-C", str(self.root), "-c", "user.name=fixture",
             "-c", "user.email=fixture@invalid", "-c", "commit.gpgsign=false", *args],
            check=True, capture_output=True, text=True,
        ).stdout.strip()

    def commit(self, message: str) -> str:
        self.git("add", "Plans")
        self.git("commit", "-qm", message)
        return self.git("rev-parse", "HEAD")

    def prepare_record(self, *, configure: Callable[[dict, dict], None] | None = None, line: int = 1,
                       anchor: str | None = None) -> None:
        anchor = anchor or self.anchor
        commit = self.commit("recheck state")
        resolver = pm_audit_closure.AnchorResolver(self.root)
        record = {
            "schema_id": pm_audit_closure.REAUDIT_RECORD_SCHEMA,
            "reaudit_id": "reaudit-fixture", "closure_id": self.target["closure_id"],
            "line": line, "row_sha256": pm_audit_closure.sha256_text(pm_audit_closure.raw_registry_lines(self.registry)[line]),
            "recheck_commit": commit, "verdict": "supported",
            "claim": "The registry fixture repair is present.",
            "rationale": "The registry row states the fixture repair.",
            "dependencies": [anchor],
            "dependency_hashes_at_recheck": {anchor: resolver.sha256(anchor)},
            "evidence": [{"ref": anchor, "quote": self.target["closure_reason"]}],
            "stale_hashes_at_recheck": [], "stale_ref_dispositions": [], "fix": None,
        }
        stale = pm_audit_closure._target_stale_refs(self.target, pm_audit_closure.CommitResolver(self.root, commit))
        record["stale_hashes_at_recheck"] = [
            {"group": group, "ref": ref, "stored": stored} for group, ref, stored in sorted(stale)
        ]
        record["stale_ref_dispositions"] = [
            {"ref": ref, "disposition": "not_a_dependency", "note": "The registry anchor supplies the current evidence."}
            for ref in sorted({ref for _, ref, _ in stale})
        ]
        packet = {
            "line": line, "closure_id": record["closure_id"], "row_sha256": record["row_sha256"],
            "recheck_commit": commit, "claim": {k: v for k, v in self.target.items() if k != "hashes"},
            "dependency_anchors": [{"ref": anchor, "sha256": resolver.sha256(anchor),
                                    "text": resolver.content(anchor)[1], "truncated": False}],
        }
        packet["packet_row_digest"] = pm_audit_closure.packet_row_digest(packet)
        packet_path = self.audit_dir / "packet.jsonl"
        write_jsonl(packet_path, [packet])
        reviews = {}
        for who in pm_audit_closure.REAUDIT_REVIEWERS:
            judged = {"line": line, "closure_id": record["closure_id"], "verdict": "supported"}
            if who == "worker":
                judged.update({k: record.get(k) for k in pm_audit_closure.REAUDIT_WORKER_FIELDS})
                judged.update({k: record[k] for k in (
                    "row_sha256", "dependencies", "recheck_commit", "dependency_hashes_at_recheck",
                )})
            else:
                judged["packet_row_digest"] = packet["packet_row_digest"]
            output = self.audit_dir / f"{who}.jsonl"
            write_jsonl(output, [judged])
            review = {"model": f"fixture-{who}", "verdict": "supported",
                      "evidence_path": pm_audit_closure.rel(output),
                      "evidence_sha256": pm_audit_closure.sha256_file(output)}
            if who != "worker":
                review.update(packet_path=pm_audit_closure.rel(packet_path),
                              packet_sha256=pm_audit_closure.sha256_file(packet_path))
            reviews[who] = review
        record["reviews"] = reviews
        if configure is not None:
            configure(record, packet)
        write_jsonl(self.records, [record])
        self.commit("reviewed receipts")

    def prepare_owner_split(
        self, *, outcome: str = "supported", worker: str = "supported",
        sol: str = "not_supported", astra: str = "supported",
        sol_status: str | None = None, astra_status: str | None = None,
        include_decision: bool = True, decision_changes: dict | None = None,
        answer_changes: dict | None = None, missing_split_field: str | None = None,
        tamper_file: str | None = None, bad_digest_echo: bool = False,
        bad_split_encoding: bool = False,
        split_changes: Callable[[dict], None] | None = None,
        assembled_worker: str | None = None, initial_without_verdict: bool = False,
        split_packet_earlier_commit: bool = False,
        sol_initial: dict | None = None, preliminary: bool = False, bad_split_surrogate: bool = False,
        untracked_file: str | None = None, update_tampered_hash: bool = False,
        change_rationale: Callable[[str], str] | None = None,
        scope: str | list[int] = "standing", extra_round: bool = False,
    ) -> None:
        m = pm_audit_closure
        card_id = "fixture-split"
        decision = {"card_id": card_id, "rule": "split_majority_of_three", "choice": "B"}
        pins = {"rule": decision["rule"], "choice": "B", "scope": scope}
        card = {"id": card_id, "seq": 3, "options": [{"key": "B"}]}
        answer = {"cardId": card_id, "cardSeq": 2, "kind": "answer", "choice": ["B"], "answeredBy": "owner"}
        answer.update(answer_changes or {})
        untracked = None
        for kind, data in (("card", json.dumps(card)), ("answer", json.dumps(answer)), ("key", "fixture key")):
            path = self.audit_dir / f"decision-{kind}"
            digest = m.sha256_text(data)
            pins[f"{kind}_sha256"] = digest
            if kind == tamper_file:
                data += "\n"
                if update_tampered_hash:
                    digest = m.sha256_text(data)
            decision.update({f"{kind}_path": m.rel(path), f"{kind}_sha256": digest})
            if kind == untracked_file:
                untracked = path, data
            else:
                path.write_text(data, encoding="utf-8")
        decision.update(decision_changes or {})
        pins_patch = patch.dict(m.OWNER_DECISIONS, {card_id: pins})
        pins_patch.start()
        self.addCleanup(pins_patch.stop)

        def configure(record: dict, packet: dict) -> None:
            worker_review = record["reviews"]["worker"]
            worker_path = self.root / worker_review["evidence_path"]
            source = dict(json.loads(worker_path.read_bytes()), verdict=worker, status_now=None)
            source_path = self.audit_dir / "worker-source.jsonl"
            write_jsonl(source_path, [source])
            worker_review.update(source_path=m.rel(source_path), source_sha256=m.sha256_file(source_path))
            earlier = [dict(reading="A", verdict=source["verdict"], status_now=source["status_now"],
                            rationale=source["rationale"])]
            for role, who, vote in (("C", "sol", "not_supported"), ("D", "astra", "supported")):
                initial = self.audit_dir / f"initial-{who}.jsonl"
                output = self.root / record["reviews"][who]["evidence_path"]
                source_vote = dict(json.loads(output.read_bytes()), verdict=vote, reason=f"Initial reading from {who}.")
                if who == "sol":
                    source_vote.update(sol_initial or {})
                earlier.append(dict(reading=role, **{key: source_vote.get(key) for key in (
                    "verdict", "status_now", "later_closure_id", "reason",
                )}))
                if who == "sol" and initial_without_verdict:
                    source_vote.pop("verdict")
                write_jsonl(initial, [source_vote])
                record["reviews"][who].update(initial_evidence_path=m.rel(initial),
                                              initial_evidence_sha256=m.sha256_file(initial))
            if preliminary:
                initial = self.audit_dir / "preliminary.jsonl"
                reading = {"verdict": "not_supported", "reason": "Preliminary reading."}
                write_jsonl(initial, [dict(reading, **{key: packet[key] for key in (
                    "line", "closure_id", "packet_row_digest",
                )})])
                earlier.insert(1, dict(reading, reading="B"))
                record["reviews"]["preliminary"] = {"evidence_path": m.rel(initial), "evidence_sha256": m.sha256_file(initial)}
            split = {key: packet[key] for key in ("line", "closure_id", "recheck_commit", "packet_row_digest")}
            split.update(split_id="fixture-1", packet_row=dict(packet, held_line=1), readings=earlier,
                         anchors_at_R=copy.deepcopy(packet["dependency_anchors"]))
            if split_changes:
                split_changes(split)
            split["split_row_digest"] = m.sha256_text(m.canonical_json(split))
            if bad_split_surrogate:
                split["note"] = "\ud800"
            split_path = self.audit_dir / "split-packet.jsonl"
            rounds = [split]
            if extra_round:
                # An earlier round for the same line and closure in the same file (T285).
                earlier_round = {key: value for key, value in split.items() if key != "split_row_digest"}
                earlier_round.update(split_id="fixture-0", note="An earlier round for the same closure.")
                earlier_round["split_row_digest"] = m.sha256_text(m.canonical_json(earlier_round))
                rounds.insert(0, earlier_round)
            write_jsonl(split_path, rounds)
            if bad_split_encoding:
                split_path.write_bytes(b"\xff")
            if split_packet_earlier_commit:
                self.git("add", "--", m.rel(split_path))
                self.git("commit", "-qm", "isolated split packet")
            for who, vote, status in (("worker", assembled_worker or worker, None),
                                      ("sol", sol, sol_status), ("astra", astra, astra_status)):
                review = record["reviews"][who]
                path = self.root / review["evidence_path"]
                judged = json.loads(path.read_bytes())
                if who != "worker":
                    judged["reason"] = f"Split judgment from {who}."
                    split_fields = {key: split[key] for key in ("split_id", "split_row_digest")}
                    judged.update(split_fields)
                    review.update(split_fields, split_packet_path=m.rel(split_path),
                                  split_packet_sha256=m.sha256_file(split_path))
                    if who == "sol" and missing_split_field:
                        review.pop(missing_split_field)
                    if who == "sol" and bad_digest_echo:
                        judged["split_row_digest"] = "a" * 64
                judged.update(verdict=vote, status_now=status)
                write_jsonl(path, [judged])
                normalized = "supported" if vote == "resolved_differently" and status == self.target["closure_status"] else vote
                review.update(verdict=normalized, evidence_sha256=m.sha256_file(path))
            rationale = (f"{decision['rule']} applies under {card_id}. {source['rationale']} "
                         "Split judgment from sol. Split judgment from astra.")
            record.update(verdict=outcome, rationale=change_rationale(rationale) if change_rationale else rationale,
                          fix={"description": "Recheck the unresolved fixture requirement."} if outcome == "not_supported" else None)
            if include_decision:
                record["owner_decision"] = decision

        self.prepare_record(configure=configure)
        if untracked is not None:
            path, data = untracked
            path.write_text(data, encoding="utf-8")

    def assert_owner_split_result(self, expected_error: str | None = None) -> None:
        before = self.registry.read_bytes()
        code, report = self.append(dry_run=True)
        self.assertEqual(self.registry.read_bytes(), before)
        if expected_error:
            self.assertNotEqual(code, 0, report)
            self.assertTrue(any(expected_error in error for error in report["errors"]), report)
        else:
            self.assertEqual((code, report["would_append"], report["errors"]), (0, 1, []), report)

    def test_owner_majority_of_two_supported_readings_passes(self) -> None:
        self.prepare_owner_split()
        self.assert_owner_split_result()

    def test_owner_record_cannot_take_the_minority_reading(self) -> None:
        self.prepare_owner_split(outcome="not_supported")
        self.assert_owner_split_result("split majority reading")

    def test_owner_three_distinct_readings_pass_when_reopened(self) -> None:
        self.prepare_owner_split(outcome="not_supported", sol="resolved_differently", sol_status="stale_retired",
                                 astra="not_supported")
        self.assert_owner_split_result()

    def test_owner_three_distinct_readings_fail_if_kept_closed(self) -> None:
        self.prepare_owner_split(sol="resolved_differently", sol_status="stale_retired", astra="not_supported")
        self.assert_owner_split_result("split has no majority")

    def test_owner_same_verdict_with_different_statuses_is_no_majority(self) -> None:
        self.prepare_owner_split(outcome="not_supported", sol="resolved_differently", sol_status="stale_retired",
                                 astra="resolved_differently", astra_status="false_positive")
        self.assert_owner_split_result()

    def test_owner_card_bytes_must_match_the_pinned_hash(self) -> None:
        self.prepare_owner_split(tamper_file="card")
        self.assert_owner_split_result("owner_decision.card_path: file SHA-256")

    def test_owner_answer_bytes_must_match_the_pinned_hash(self) -> None:
        self.prepare_owner_split(tamper_file="answer")
        self.assert_owner_split_result("owner_decision.answer_path: file SHA-256")

    def test_owner_key_bytes_must_match_the_pinned_hash(self) -> None:
        self.prepare_owner_split(tamper_file="key")
        self.assert_owner_split_result("owner_decision.key_path: file SHA-256")

    def test_owner_rejects_untracked_decision_bytes_even_when_pinned(self) -> None:
        self.prepare_owner_split(untracked_file="key")
        self.assert_owner_split_result("does not exist at HEAD")

    def test_owner_uses_committed_decision_bytes(self) -> None:
        self.prepare_owner_split()
        (self.audit_dir / "decision-card").write_text("Local edit.", encoding="utf-8")
        self.assert_owner_split_result()

    def test_owner_rejects_a_card_whose_bytes_match_the_record_but_not_the_pin(self) -> None:
        self.prepare_owner_split(tamper_file="card", update_tampered_hash=True)
        self.assert_owner_split_result("owner_decision.card_path: file SHA-256")

    def test_owner_rejects_an_answer_whose_bytes_match_the_record_but_not_the_pin(self) -> None:
        self.prepare_owner_split(tamper_file="answer", update_tampered_hash=True)
        self.assert_owner_split_result("owner_decision.answer_path: file SHA-256")

    def test_owner_rejects_a_key_whose_bytes_match_the_record_but_not_the_pin(self) -> None:
        self.prepare_owner_split(tamper_file="key", update_tampered_hash=True)
        self.assert_owner_split_result("owner_decision.key_path: file SHA-256")

    def test_owner_answer_cannot_name_another_card_even_if_pinned(self) -> None:
        self.prepare_owner_split(answer_changes={"cardId": "another-card"})
        self.assert_owner_split_result("answer.cardId must equal card.id")

    def test_owner_card_must_be_pinned(self) -> None:
        self.prepare_owner_split(decision_changes={"card_id": "unreviewed"})
        self.assert_owner_split_result("unpinned card or choice")

    def test_owner_choice_must_be_pinned(self) -> None:
        self.prepare_owner_split(decision_changes={"choice": "A"})
        self.assert_owner_split_result("unpinned card or choice")

    def test_owner_decision_cannot_be_used_outside_pinned_scope(self) -> None:
        self.prepare_owner_split(scope=[2])
        self.assert_owner_split_result("pinned scope does not cover closure line 1")

    def test_owner_split_receipt_must_reference_initial_evidence(self) -> None:
        self.prepare_owner_split(missing_split_field="initial_evidence_sha256")
        self.assert_owner_split_result("needs initial_evidence_path")

    def test_owner_split_output_must_echo_the_split_row_digest(self) -> None:
        self.prepare_owner_split(bad_digest_echo=True)
        self.assert_owner_split_result("must bind the same split id and row digest")

    def test_owner_split_packet_with_a_matching_hash_must_still_be_readable(self) -> None:
        self.prepare_owner_split(bad_split_encoding=True)
        self.assert_owner_split_result("split_packet file cannot be read as UTF-8 JSONL")

    def test_owner_split_packet_reports_an_escaped_surrogate(self) -> None:
        self.prepare_owner_split(bad_split_surrogate=True)
        self.assert_owner_split_result("split packet cannot be digested as UTF-8 JSON")

    def test_owner_split_packet_must_include_the_three_earlier_readings(self) -> None:
        def omit_readings(split: dict) -> None:
            split.pop("readings")

        self.prepare_owner_split(split_changes=omit_readings)
        self.assert_owner_split_result("split packet must carry one earlier reading each")

    def test_owner_split_packet_may_include_a_preliminary_reading_alongside_bound_readings(self) -> None:
        self.prepare_owner_split(preliminary=True)
        self.assert_owner_split_result()

    def test_owner_split_packet_cannot_show_a_label_in_place_of_the_preliminary_judgment(self) -> None:
        def keep_label(split: dict) -> None:
            split["readings"][1] = {"reading": "B"}

        self.prepare_owner_split(preliminary=True, split_changes=keep_label)
        self.assert_owner_split_result("earlier reading B must match the committed preliminary judgment and reason")

    def test_owner_split_packet_cannot_omit_the_bound_preliminary_reading(self) -> None:
        self.prepare_owner_split(preliminary=True, split_changes=lambda split: split["readings"].pop(1))
        self.assert_owner_split_result("must include earlier reading B")

    def test_owner_split_packet_cannot_supply_a_preliminary_reading_without_a_receipt(self) -> None:
        self.prepare_owner_split(split_changes=lambda split: split["readings"].insert(
            1, {"reading": "B", "verdict": "not_supported", "reason": "Preliminary reading."},
        ))
        self.assert_owner_split_result("earlier reading B needs a committed preliminary review receipt")

    def test_owner_earlier_reading_must_match_its_initial_judgment(self) -> None:
        self.prepare_owner_split(split_changes=lambda split: split["readings"][1].update(
            verdict="supported", status_now="repaired", later_closure_id="another-closure", reason="Different reason.",
        ))
        self.assert_owner_split_result("earlier reading C must match the committed sol judgment and reason")

    def test_owner_initial_receipt_must_be_a_judgment_with_a_verdict(self) -> None:
        self.prepare_owner_split(initial_without_verdict=True)
        self.assert_owner_split_result("initial evidence must carry a judgment verdict")

    def test_owner_rule_requires_distinct_normalized_initial_deep_judgments(self) -> None:
        self.prepare_owner_split(sol_initial={"verdict": "resolved_differently", "status_now": "repaired"})
        self.assert_owner_split_result("disagreement between the initial deep reviewers")

    def test_owner_initial_receipt_must_match_the_recheck_commit(self) -> None:
        self.prepare_owner_split(sol_initial={"recheck_commit": "1" * 40})
        self.assert_owner_split_result("initial evidence names a different recheck_commit")

    def test_owner_initial_receipt_must_match_the_superseded_row(self) -> None:
        self.prepare_owner_split(sol_initial={"row_sha256": "2" * 64})
        self.assert_owner_split_result("initial evidence is for a different version of the superseded row")

    def test_owner_initial_resolved_differently_receipt_must_name_a_status(self) -> None:
        self.prepare_owner_split(sol_initial={"verdict": "resolved_differently"})
        self.assert_owner_split_result("initial evidence must specify a valid judgment")

    def test_owner_initial_superseded_receipt_must_name_a_later_closure(self) -> None:
        self.prepare_owner_split(sol_initial={"verdict": "superseded_by_later_closure"})
        self.assert_owner_split_result("initial evidence must specify a valid judgment")

    def test_owner_same_open_status_counts_as_supported(self) -> None:
        self.target["closure_status"] = "blocked_requires_user_decision"
        write_jsonl(self.registry, [self.target])
        self.prepare_owner_split(astra="resolved_differently", astra_status=self.target["closure_status"])
        self.assert_owner_split_result()

    def test_owner_rationale_names_the_rule_and_card(self) -> None:
        self.prepare_owner_split(change_rationale=lambda rationale: rationale.replace("fixture-split", ""))
        self.assert_owner_split_result("rationale must name the owner decision rule and card")

    def test_owner_rationale_preserves_the_final_reading_reasons(self) -> None:
        self.prepare_owner_split(change_rationale=lambda rationale: rationale.replace("Split judgment from astra.", ""))
        self.assert_owner_split_result("rationale must include the committed astra reason")

    def test_owner_assembled_worker_cannot_change_the_worker_vote_after_the_split(self) -> None:
        self.prepare_owner_split(worker="not_supported", assembled_worker="supported")
        self.assert_owner_split_result("assembled worker judgment or reason differs from the committed worker source")

    def test_owner_split_anchor_must_be_in_the_record_snapshot(self) -> None:
        self.prepare_owner_split(split_changes=lambda split: split["anchors_at_R"][0].update(
            ref="Plans/Fixture.md#section=Added for the split",
        ))
        self.assert_owner_split_result("split packet showed 'Plans/Fixture.md#section=Added for the split' at a different snapshot")

    def test_owner_split_anchor_hash_must_match_the_record_snapshot(self) -> None:
        self.prepare_owner_split(split_changes=lambda split: split["anchors_at_R"][0].update(sha256="a" * 64))
        self.assert_owner_split_result(f"split packet showed {self.anchor!r} at a different snapshot")

    def test_owner_split_anchor_text_must_match_the_recheck_commit(self) -> None:
        self.prepare_owner_split(split_changes=lambda split: split["anchors_at_R"][0].update(text="Invented text."))
        self.assert_owner_split_result(f"split packet text for {self.anchor} is not that anchor's text at recheck_commit")

    def test_owner_split_anchor_may_show_a_flagged_prefix(self) -> None:
        def truncate(split: dict) -> None:
            anchor = split["anchors_at_R"][0]
            anchor.update(text=anchor["text"][:20], truncated=True)

        self.prepare_owner_split(split_changes=truncate)
        self.assert_owner_split_result()

    def test_owner_split_packet_and_output_must_be_added_in_the_same_commit(self) -> None:
        self.prepare_owner_split(split_packet_earlier_commit=True)
        self.assert_owner_split_result("split packet and split output were not committed together")

    def test_owner_decision_cannot_be_attached_to_unanimous_readings(self) -> None:
        self.prepare_owner_split(sol="supported")
        self.assert_owner_split_result("all three readings agree")

    def test_owner_rule_requires_disagreement_between_deep_reviewers(self) -> None:
        self.prepare_owner_split(worker="not_supported", sol="supported")
        self.assert_owner_split_result("disagreement between the split reviewers")

    def test_disagreement_still_fails_without_an_owner_decision(self) -> None:
        self.prepare_owner_split(include_decision=False)
        self.assert_owner_split_result("reviews.sol.verdict must equal the record verdict")

    def append(self, *, dry_run: bool = False, only: str = "") -> tuple[int, dict]:
        args = argparse.Namespace(registry=str(self.registry), records=str(self.records), only=only, dry_run=dry_run)
        with contextlib.redirect_stdout(io.StringIO()) as output:
            code = pm_audit_closure.cmd_reaudit_append(args)
        return code, json.loads(output.getvalue())

    def write_split_rounds(
        self, record: dict, path: Path, rounds: list[dict], bound: dict[str, str],
        *, echoes: dict[str, str] | None = None,
    ) -> dict[str, dict]:
        """Write split rounds for the record's closure, each with its split_row_digest. Bind each
        reviewer's receipt to the round named in `bound` and its final output to the round named in
        `echoes` (by default the same round), as the committed split records do."""
        m = pm_audit_closure
        target = {key: record[key] for key in ("line", "closure_id")}
        by_id = {}
        for item in rounds:
            row = dict(target, **item)
            row["split_row_digest"] = m.sha256_text(m.canonical_json(row))
            by_id[row["split_id"]] = row
        write_jsonl(path, list(by_id.values()))
        for who, split_id in bound.items():
            echoed = by_id[(echoes or bound)[who]]
            review = record["reviews"][who]
            output = self.root / review["evidence_path"]
            judged = dict(json.loads(output.read_bytes()), split_id=echoed["split_id"],
                          split_row_digest=echoed["split_row_digest"])
            write_jsonl(output, [judged])
            review.update(evidence_sha256=m.sha256_file(output), split_id=split_id,
                          split_row_digest=echoed["split_row_digest"], split_packet_path=m.rel(path),
                          split_packet_sha256=m.sha256_file(path))
        return by_id

    def prepare_currentness_split(self, *, snapshot_conflict: bool = False, anchor: str | None = None) -> tuple[Path, str, Path]:
        m = pm_audit_closure
        extra = self.audit_dir / "split-only.json"
        extra.write_text('{"evidence": "Additional evidence shown in the split round."}\n', encoding="utf-8")
        extra_ref = m.rel(extra) + "#json=/evidence"
        path = self.audit_dir / "currentness-split-packet.jsonl"

        def configure(record: dict, packet: dict) -> None:
            shared = copy.deepcopy(packet["dependency_anchors"])
            additional = {"ref": extra_ref, "sha256": m.AnchorResolver().sha256(extra_ref)}
            astra_anchors = copy.deepcopy(shared) + [additional]
            if snapshot_conflict:
                astra_anchors[0]["sha256"] = "a" * 64
            self.write_split_rounds(record, path, [
                dict(split_id="earlier-round", anchors_at_R=[dict(additional, sha256="b" * 64)]),
                dict(split_id="sol-bound", anchors_at_R=shared),
                dict(split_id="astra-bound", anchors_at_R=astra_anchors),
            ], {"sol": "sol-bound", "astra": "astra-bound"})

        self.prepare_record(configure=configure, anchor=anchor)
        return extra, extra_ref, path

    def proof_anchor(self) -> str:
        """A JSON proof of the fixture repair outside the registry, for records that are not self-dependent."""
        proof = self.audit_dir / "proof.json"
        proof.write_text(json.dumps({"evidence": self.target["closure_reason"]}) + "\n", encoding="utf-8")
        return pm_audit_closure.rel(proof) + "#json=/evidence"

    def prepare_registry_pin_batch(self, *, split_only: bool = False) -> list[dict]:
        """Two audit members, one already protected by a current registry row-set pin."""
        m = pm_audit_closure
        original = self.target
        second = m._self_test_registry_row(
            **{**original, "closure_id": "closure-second", "detail_keys": ["second"]},
        )
        write_jsonl(self.registry, [original, second])
        self.target = second
        self.prepare_record(line=2)
        code, seeded = self.append()
        self.assertEqual((code, seeded["appended"], seeded["errors"]), (0, 1, []), seeded)
        prior_pin = json.loads(self.registry.read_bytes().splitlines()[2])
        return self.prepare_pin_batch_records([(1, original), (3, prior_pin)], split_line=3 if split_only else None)

    def prepare_pin_batch_records(self, targets: list[tuple[int, dict]], *, split_line: int | None = None,
                                  split_lines: tuple[int, ...] = (), plain_lines: tuple[int, ...] = (),
                                  untracked_packets: bool = False) -> list[dict]:
        """One records file with a review of each target. A line in split_lines pins the set through a
        unanimous split round only, a line in plain_lines pins nothing, and every other line pins the set
        in its dependencies. With untracked_packets the split packets are never committed."""
        m = pm_audit_closure
        if untracked_packets:
            with (self.root / ".git/info/exclude").open("a", encoding="utf-8") as handle:
                handle.write("set-packet.jsonl\n")
        records = []
        for line, target in targets:
            self.target = target
            self.audit_dir = self.audit_dir.parent / f"batch-recheck-{line}"
            self.audit_dir.mkdir()
            self.records = self.audit_dir / "records.jsonl"
            proof = self.proof_anchor()  # Also gives the recheck its own commit.
            if line == split_line or line in split_lines:
                def bind_set(record: dict, packet: dict) -> None:
                    anchors = packet["dependency_anchors"] + [
                        {"ref": self.anchor, "sha256": m.AnchorResolver().sha256(self.anchor)},
                    ]
                    self.write_split_rounds(record, self.audit_dir / "set-packet.jsonl",
                                            [dict(split_id="row-set", anchors_at_R=anchors)],
                                            {"sol": "row-set", "astra": "row-set"})
                self.prepare_record(line=line, configure=bind_set, anchor=proof)
            elif line in plain_lines:
                self.prepare_record(line=line, anchor=proof)
            else:
                self.prepare_record(line=line)
            records.append(json.loads(self.records.read_text(encoding="utf-8")))
        self.records = self.audit_dir / "batch-records.jsonl"
        write_jsonl(self.records, records)
        self.commit("two sets of reviewed receipts")
        return records

    def append_pin_batch(self) -> list[dict]:
        code, report = self.append()
        self.assertEqual((code, report["appended"], report["errors"]), (0, 2, []), report)
        rows = [json.loads(raw) for raw in self.registry.read_bytes().splitlines()]
        self.assertEqual(pm_audit_closure.validate_registry(self.registry)["errors"], [])
        self.commit("appended pin batch")
        return rows

    def test_registry_pin_batch_requires_reauditing_the_old_pin(self) -> None:
        records = self.prepare_registry_pin_batch()
        before = self.registry.read_bytes()
        code, report = self.append(dry_run=True, only=records[0]["closure_id"])
        self.assertEqual((code, report["would_append"], report["moved_since_recheck"]), (1, 0, []), report)
        self.assertEqual(len(report["errors"]), 1, report)
        self.assertIn(f"candidate registry would not validate: {self.registry_ref}:3:", report["errors"][0])
        self.assertIn(f"for {self.anchor} is stale", report["errors"][0])
        self.assertEqual(self.registry.read_bytes(), before)

    def assert_registry_pin_batch_drifts(self, *, split_only: bool) -> None:
        m = pm_audit_closure
        original = self.target
        self.prepare_registry_pin_batch(split_only=split_only)
        before = self.registry.read_bytes()
        code, report = self.append(dry_run=True)
        self.assertEqual((code, report["would_append"], report["errors"]), (0, 2, []), report)
        self.assertEqual(self.registry.read_bytes(), before)
        code, report = self.append()
        self.assertEqual((code, report["appended"], report["errors"]), (0, 2, []), report)
        committed = self.registry.read_bytes()
        self.assertTrue(committed.startswith(before))
        self.assertEqual(m.validate_registry(self.registry)["errors"], [])
        code, report = self.append(dry_run=True)
        self.assertEqual((code, report["already_appended"], report["errors"]), (0, 2, []), report)
        self.commit("appended pin batch")

        appended = [json.loads(line) for line in committed.splitlines()]
        later = m._self_test_registry_row(closure_id="closure-later", detail_keys=["later"],
                                          closure_evidence=original["closure_evidence"], hashes=original["hashes"])
        altered = copy.deepcopy(appended)
        altered[3]["closure_reason"] += " Changed after append."
        group = "split_anchor_hashes" if split_only else "owner_evidence_hashes"
        for rows in (appended + [later], altered):
            write_jsonl(self.registry, rows)
            report = m.validate_registry(self.registry)
            self.assertEqual(report["unsuperseded_stale_hash_count"], 2, report)
            self.assertTrue(any(f":5: {group} for {self.anchor} is stale" in e for e in report["errors"]), report)
            self.assertTrue(any(f":4: owner_evidence_hashes for {self.anchor} is stale"
                                in e for e in report["errors"]), report)
        # Without one member, the survivor no longer sits at the line its append wrote it on, and no
        # longer matches the batch rebuilt from its committed records file. It supersedes nothing, so
        # the old pin on line 3 is live again, and stale.
        write_jsonl(self.registry, appended[:3] + appended[4:])
        report = m.validate_registry(self.registry)
        self.assertTrue(any(e.startswith(f"{self.registry_ref}:4: registry_batch_anchor cannot be rebuilt")
                            and "does not sit at" in e for e in report["errors"]), report)
        self.assertTrue(any(f":3: owner_evidence_hashes for {self.anchor} is stale" in e for e in report["errors"]), report)
        write_jsonl(self.registry, appended + [later])
        snapshot = self.commit("later registry member")
        for row in appended[-2:]:
            expected_group = group if row == appended[-1] else "owner_evidence_hashes"
            stale = m._target_stale_refs(row, m.CommitResolver(self.root, snapshot))
            self.assertTrue(any(g == expected_group and ref == self.anchor for g, ref, _ in stale), stale)

    def test_registry_pin_batch_appends_and_later_set_changes_stale_both(self) -> None:
        self.assert_registry_pin_batch_drifts(split_only=False)

    def test_registry_pin_batch_applies_to_split_only_row_sets(self) -> None:
        self.assert_registry_pin_batch_drifts(split_only=True)

    def test_registry_pin_batch_marker_rewrite_cannot_hide_a_later_member(self) -> None:
        """Review H1: rewriting the shared marker on every row, committed, must not move a later set member
        out of the reviewed part of the pins. The batch is rebuilt from its committed records file."""
        m = pm_audit_closure
        original = self.target
        second, third = [
            m._self_test_registry_row(**{**original, "closure_id": f"closure-{name}", "detail_keys": [name]})
            for name in ("second", "third")
        ]
        write_jsonl(self.registry, [original, second, third])
        self.target = second
        self.prepare_record(line=2)
        code, report = self.append()
        self.assertEqual((code, report["appended"]), (0, 1), report)
        prior_pin = json.loads(self.registry.read_bytes().splitlines()[3])
        self.prepare_pin_batch_records([(1, original), (4, prior_pin)])
        rows = self.append_pin_batch()

        self.target = third
        self.audit_dir = self.audit_dir.parent / "later-recheck"
        self.audit_dir.mkdir()
        self.records = self.audit_dir / "records.jsonl"
        self.prepare_record(line=3, anchor=self.proof_anchor())
        code, report = self.append(dry_run=True)
        self.assertEqual((code, report["would_append"]), (1, 0), report)
        self.assertTrue(any(f":6: owner_evidence_hashes for {self.anchor} is stale" in e for e in report["errors"]), report)

        record = json.loads(self.records.read_bytes())
        later = m.build_reaudit_row(third, 3, m.raw_registry_lines(self.registry)[3], record, m.rel(self.records),
                                    m.AnchorResolver(), m.utc_now())
        marker_key = m.REGISTRY_BATCH_ANCHOR
        marker = copy.deepcopy(rows[5]["hashes"][marker_key])
        marker["members"] = sorted([*marker["members"], later["closure_id"]])
        marker["row_sets"][self.anchor] = m.sha256_text(m._canonical_row_set([
            {**row, "hashes": {key: value for key, value in row["hashes"].items() if key != marker_key}}
            for row in [*rows[-2:], later]
        ]))
        for row in [*rows[-2:], later]:
            row["hashes"][marker_key] = marker
        write_jsonl(self.registry, [*rows, later])
        snapshot = self.commit("later member with altered batch markers")
        validation = m.validate_registry(self.registry)
        for line in (5, 6, 7):
            self.assertIn(f"{self.registry_ref}:{line}: registry_batch_anchor differs from the batch rebuilt from "
                          "the append that committed the row", validation["errors"])
        for line in (5, 6):
            self.assertTrue(any(f":{line}: owner_evidence_hashes for {self.anchor} is stale" in e
                                for e in validation["errors"]), validation)
            stale = m._target_stale_refs(rows[line - 1], m.CommitResolver(self.root, snapshot))
            self.assertIn(self.anchor, {ref for _, ref, _ in stale}, stale)

    def test_registry_pin_batch_reports_marker_edits(self) -> None:
        m = pm_audit_closure
        self.prepare_registry_pin_batch()
        rows = self.append_pin_batch()
        key = m.REGISTRY_BATCH_ANCHOR
        for change in ("reorder one", "reorder all", "change hash", "copy", "copy to re-audit", "remove", "duplicate id"):
            with self.subTest(change=change):
                changed = copy.deepcopy(rows)
                marker = changed[3]["hashes"][key]
                if change == "reorder one":
                    marker["members"].reverse()
                elif change == "reorder all":
                    for row in changed[-2:]:
                        row["hashes"][key]["members"].reverse()
                elif change == "change hash":
                    for row in changed[-2:]:
                        row["hashes"][key]["row_sets"][self.anchor] = "0" * 64
                elif change == "copy":
                    changed[0]["hashes"][key] = marker
                elif change == "copy to re-audit":
                    changed[2]["hashes"][key] = marker
                elif change == "remove":
                    for row in changed[-2:]:
                        row["hashes"].pop(key)
                else:
                    marker["members"].append(marker["members"][0])
                write_jsonl(self.registry, changed)
                report = m.validate_registry(self.registry)
                self.assertTrue(any(f"for {self.anchor} is stale" in e for e in report["errors"]), report)
                lines = {"reorder one": [4], "reorder all": [4, 5], "change hash": [4, 5], "copy": [1],
                         "copy to re-audit": [3], "remove": [], "duplicate id": [4]}[change]
                for line in lines:
                    self.assertTrue(any(e.startswith(f"{self.registry_ref}:{line}: {key}") for e in report["errors"]), report)

    def test_registry_pin_batch_dates_its_rows_by_the_records_commit(self) -> None:
        """A batch member that pins no set of its own has no self-exclusion date. It is dated by the commit
        that added its records file, so a later edit of its timestamps cannot be hidden by rehashing the markers."""
        m = pm_audit_closure
        stamp = "2001-02-03T04:05:06Z"
        with patch.dict(os.environ, {"GIT_AUTHOR_DATE": "@981173106 +0000"}):  # the same instant
            self.prepare_registry_pin_batch(split_only=True)
        rows = self.append_pin_batch()
        key = m.REGISTRY_BATCH_ANCHOR
        adding = self.git("log", "--diff-filter=A", "--format=%H", "--", m.rel(self.records))
        self.assertEqual(m.ReceiptLedger(self.root).author_time(adding), stamp)
        self.assertNotIn("registry_self_anchor", rows[4]["hashes"])
        self.assertEqual({row[field] for row in rows[3:] for field in ("created_at", "updated_at")}, {stamp})
        edited = copy.deepcopy(rows)
        edited[4].update(created_at="2099-01-01T00:00:00Z", updated_at="2099-01-01T00:00:00Z")
        digest = m.sha256_text(m._canonical_row_set([
            {**row, "hashes": {k: v for k, v in row["hashes"].items() if k != key}} for row in edited[3:]
        ]))
        for row in edited[3:]:
            row["hashes"][key]["row_sets"][self.anchor] = digest
        write_jsonl(self.registry, edited)
        report = m.validate_registry(self.registry)
        self.assertTrue(any(e.startswith(f"{self.registry_ref}:5: self-excluding re-audit generated fields differ")
                            and "'created_at'" in e for e in report["errors"]), report)
        for line in (4, 5):
            self.assertTrue(any(e.startswith(f"{self.registry_ref}:{line}: {key} differs") for e in report["errors"]), report)
        self.assertTrue(any(f"for {self.anchor} is stale" in e for e in report["errors"]), report)

    def test_registry_pin_batch_reports_a_duplicate_member_row(self) -> None:
        m = pm_audit_closure
        self.prepare_registry_pin_batch()
        rows = self.append_pin_batch()
        write_jsonl(self.registry, [*rows, rows[3]])
        report = m.validate_registry(self.registry)
        self.assertTrue(any("duplicate closure_id" in e for e in report["errors"]), report)
        # The duplicate is a copy of line 4 on another line, so it sits nowhere its append wrote it
        # (T335); the members it shadows still leave their pins stale.
        self.assertTrue(any(e.startswith(f"{self.registry_ref}:6: registry_batch_anchor cannot be rebuilt")
                            and "does not sit at" in e for e in report["errors"]), report)
        for line in (4, 5):
            self.assertTrue(any(f":{line}: owner_evidence_hashes for {self.anchor} is stale" in e
                                for e in report["errors"]), report)

    def test_registry_pin_batch_appends_and_replays_a_second_batch(self) -> None:
        m = pm_audit_closure
        self.prepare_registry_pin_batch()
        first = self.append_pin_batch()
        self.prepare_pin_batch_records(list(enumerate(first[-2:], 4)))
        second = self.append_pin_batch()
        key = m.REGISTRY_BATCH_ANCHOR
        self.assertNotEqual(first[-1]["hashes"][key]["members"], second[-1]["hashes"][key]["members"])
        before = self.registry.read_bytes()
        code, replay = self.append(dry_run=True)
        self.assertEqual((code, replay["already_appended"], replay["would_append"], replay["errors"]), (0, 2, 0, []), replay)
        self.assertEqual(self.registry.read_bytes(), before)
        later = m._self_test_registry_row(closure_id="closure-later", detail_keys=["later"],
                                          closure_evidence=first[0]["closure_evidence"], hashes=first[0]["hashes"])
        write_jsonl(self.registry, [*second, later])
        report = m.validate_registry(self.registry)
        self.assertEqual(report["unsuperseded_stale_hash_count"], 2, report)
        for line in (6, 7):
            self.assertTrue(any(f":{line}: owner_evidence_hashes for {self.anchor} is stale" in e
                                for e in report["errors"]), report)

    def test_registry_pin_batch_refuses_a_live_pin_outside_its_targets(self) -> None:
        m = pm_audit_closure
        self.prepare_registry_pin_batch()
        guard = m._self_test_registry_row(
            closure_id="closure-guard", detail_keys=["guard"], audit_ids=["audit-guard"], closed_by_audit_id="audit-guard",
            closure_evidence=[self.anchor],
            hashes={"hash_scope": m.ANCHOR_SCOPE, "owner_evidence_hashes": {self.anchor: m.AnchorResolver().sha256(self.anchor)}},
        )
        with self.registry.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(guard, sort_keys=True) + "\n")
        self.assertEqual(m.validate_registry(self.registry)["errors"], [])
        before = self.registry.read_bytes()
        code, report = self.append()
        self.assertEqual((code, report["appended"], report["moved_since_recheck"]), (1, 0, []), report)
        self.assertEqual(len(report["errors"]), 1, report)
        self.assertIn(f"candidate registry would not validate: {self.registry_ref}:4:", report["errors"][0])
        self.assertIn(f"for {self.anchor} is stale", report["errors"][0])
        self.assertEqual(self.registry.read_bytes(), before)

    # T308 fix round 2: a batch is the rows that one commit first added from one records file.
    STAMP = "2001-02-03T04:05:06Z"
    STAMP_DATE = "@981173106 +0000"  # the same instant, for GIT_AUTHOR_DATE

    def prepare_same_file_records(self, *, date_selector: bool = False) -> list[dict]:
        """Audit members a, b and c reviewed in one committed records file, added at STAMP: a and b pin
        the audit's row set (with date_selector, the rows created at STAMP), c depends on a proof only."""
        m = pm_audit_closure
        originals = [
            m._self_test_registry_row(**{**self.target, "closure_id": name, "detail_keys": [name],
                                         **({"created_at": self.STAMP} if name != "c" else {})})
            for name in ("a", "b", "c")
        ]
        if date_selector:
            self.anchor = self.registry_ref + "#jsonlset=created_at=" + self.STAMP
        write_jsonl(self.registry, originals)
        audit_dir, records = self.audit_dir, []
        for line, row in enumerate(originals, 1):
            self.audit_dir = audit_dir.parent / f"receipts-{line}"
            self.audit_dir.mkdir()
            self.target, self.records = row, self.audit_dir / "record.jsonl"
            proof = self.proof_anchor()
            self.prepare_record(line=line, anchor=self.anchor if line < 3 else proof)
            records.append(json.loads(self.records.read_bytes()))
        self.audit_dir, self.records = audit_dir, audit_dir / "all.jsonl"
        write_jsonl(self.records, records)
        with patch.dict(os.environ, {"GIT_AUTHOR_DATE": self.STAMP_DATE}):
            self.commit("one records file with three reviews")
        return records

    def hash_report(self) -> tuple[int, dict]:
        with contextlib.redirect_stdout(io.StringIO()) as output:
            code = pm_audit_closure.cmd_refresh_hashes(argparse.Namespace(registry=str(self.registry), dry_run=True))
        return code, json.loads(output.getvalue())

    def test_registry_pin_batch_is_the_append_that_first_committed_its_rows(self) -> None:
        """Deep review (Astra, high): a later run from the same records file, committed with the earlier
        markers rewritten to cover it, does not join the earlier batch. The registry history says which
        rows one commit added; the same bytes appended and committed at once do form one batch."""
        m = pm_audit_closure
        key = m.REGISTRY_BATCH_ANCHOR
        a, b, c = (record["closure_id"] for record in self.prepare_same_file_records())
        base, start = self.git("rev-parse", "HEAD"), self.registry.read_bytes()
        code, report = self.append(only=f"{a},{b},{c}")
        self.assertEqual((code, report["appended"], report["errors"]), (0, 3, []), report)
        three = self.registry.read_bytes()
        self.commit("one append of all three")
        self.assertEqual(m.validate_registry(self.registry)["errors"], [])
        self.git("reset", "-q", "--hard", base)
        self.assertEqual(self.registry.read_bytes(), start)

        code, report = self.append(only=f"{a},{b}")
        self.assertEqual((code, report["appended"], report["errors"]), (0, 2, []), report)
        first = self.commit("append a and b")
        pair = [json.loads(line) for line in self.registry.read_bytes().splitlines()]
        code, report = self.append(dry_run=True, only=c)
        self.assertEqual((code, report["would_append"]), (1, 0), report)
        self.assertTrue(any(f"for {self.anchor} is stale" in e for e in report["errors"]), report)
        rewritten = [json.loads(line) for line in three.splitlines()]
        for old, new in zip(pair[3:], rewritten[3:5]):
            self.assertEqual(m._without_batch_anchor(old), m._without_batch_anchor(new))
            self.assertNotEqual(old["hashes"][key], new["hashes"][key])
        self.registry.write_bytes(three)
        second = self.commit("append c and rewrite the two earlier markers to cover it")
        report = m.validate_registry(self.registry)
        for line in (4, 5, 6):
            self.assertIn(f"{self.registry_ref}:{line}: registry_batch_anchor differs from the batch rebuilt from "
                          "the append that committed the row", report["errors"])
        for line in (4, 5):
            self.assertTrue(any(f":{line}: owner_evidence_hashes for {self.anchor} is stale" in e
                                for e in report["errors"]), report)
            self.assertEqual(m._target_stale_refs(pair[line - 1], m.CommitResolver(self.root, first)), set())
            stale = m._target_stale_refs(rewritten[line - 1], m.CommitResolver(self.root, second))
            self.assertIn(self.anchor, {ref for _, ref, _ in stale}, stale)

    def assert_removed_batch_markers_are_reported(self, **kinds: Any) -> None:
        """Deep review (Neon, high): with every marker of a batch removed and the members that pin no set of
        their own edited, the rows are still derived as a batch from the append that committed them."""
        m = pm_audit_closure
        key = m.REGISTRY_BATCH_ANCHOR
        original = self.target
        second = m._self_test_registry_row(**{**original, "closure_id": "closure-second", "detail_keys": ["second"]})
        write_jsonl(self.registry, [original, second])
        self.target = second
        self.prepare_record(line=2)
        code, seeded = self.append()
        self.assertEqual((code, seeded["appended"]), (0, 1), seeded)
        prior_pin = json.loads(self.registry.read_bytes().splitlines()[2])
        with patch.dict(os.environ, {"GIT_AUTHOR_DATE": self.STAMP_DATE}):
            self.prepare_pin_batch_records([(1, original), (3, prior_pin)], **kinds)
        rows = self.append_pin_batch()
        for row in rows[3:]:
            self.assertIn(key, row["hashes"])
            self.assertEqual((row["created_at"], row["updated_at"]), (self.STAMP, self.STAMP))
        code, clean = self.hash_report()
        self.assertEqual((code, clean.get("errors")), (0, None), clean)

        tampered, edited = copy.deepcopy(rows), []
        for line in (4, 5):
            row = tampered[line - 1]
            row["hashes"].pop(key)
            if "registry_self_anchor" not in row["hashes"]:
                row.update(audit_ids=[row["closed_by_audit_id"]], closure_reason="An unreviewed closure reason.",
                           created_at="2099-01-01T00:00:00Z", updated_at="2099-01-01T00:00:00Z")
                edited.append(line)
        self.assertTrue(edited)
        write_jsonl(self.registry, tampered)
        snapshot = self.commit("remove the batch markers and edit the members")
        report = m.validate_registry(self.registry)
        for line in (4, 5):
            self.assertIn(f"{self.registry_ref}:{line}: the append that committed this row forms a registry batch, "
                          "so the row must carry registry_batch_anchor", report["errors"])
        for line in edited:
            self.assertTrue(any(e.startswith(f"{self.registry_ref}:{line}: self-excluding re-audit generated fields differ")
                                and "'audit_ids'" in e and "'closure_reason'" in e and "'created_at'" in e
                                for e in report["errors"]), report)
        self.assertFalse({1, 3} & set(report["superseded_lines"]), report)
        if 5 not in edited:
            # Line 5 stays in the set. Its dependency pin falls back to the whole set, the row included, and
            # the old pin on line 3 is live again; both are stale.
            for line in (3, 5):
                self.assertTrue(any(f":{line}: owner_evidence_hashes for {self.anchor} is stale" in e
                                    for e in report["errors"]), report)
            stale = m._target_stale_refs(tampered[4], m.CommitResolver(self.root, snapshot))
            self.assertIn(self.anchor, {ref for _, ref, _ in stale}, stale)
        code, replay = self.append(dry_run=True)
        self.assertEqual((code, replay["already_appended"]), (1, 0), replay)
        self.assertTrue(any("does not validate" in e for e in replay["errors"]), replay)
        code, hashes = self.hash_report()
        self.assertEqual(code, 1, hashes)
        self.assertTrue(any("must carry registry_batch_anchor" in e for e in hashes["errors"]), hashes)

    def test_registry_pin_batch_member_that_pins_nothing_cannot_drop_its_marker(self) -> None:
        self.assert_removed_batch_markers_are_reported(plain_lines=(1,))

    def test_registry_pin_batch_of_split_only_pins_cannot_drop_its_markers(self) -> None:
        self.assert_removed_batch_markers_are_reported(split_lines=(1, 3))

    def test_registry_pin_batch_ignores_an_earlier_committed_append_from_its_records_file(self) -> None:
        """Deep review (Astra, medium): an ordinary row appended earlier from the same records file is its
        own append once committed, so it is never dated by the later batch and never joins its sets."""
        m = pm_audit_closure
        key = m.REGISTRY_BATCH_ANCHOR
        a, b, c = (record["closure_id"] for record in self.prepare_same_file_records(date_selector=True))
        code, report = self.append(only=c)
        self.assertEqual((code, report["appended"], report["errors"]), (0, 1, []), report)
        ordinary = json.loads(self.registry.read_bytes().splitlines()[3])
        self.assertNotIn(key, ordinary["hashes"])
        self.assertNotEqual(ordinary["created_at"], self.STAMP)
        # Not committed yet, it would be one append with the next run, which would date it and add it to the set.
        before = self.registry.read_bytes()
        code, report = self.append(dry_run=True, only=f"{a},{b}")
        self.assertEqual((code, report["would_append"]), (1, 0), report)
        self.assertIn(f"{m.rel(self.records)}: line 4 was appended earlier from this records file and is not committed "
                      "yet, and these rows would change its registry batch; commit the registry, then append again",
                      report["errors"])
        self.assertEqual(self.registry.read_bytes(), before)
        self.commit("append c")
        code, report = self.append(only=f"{a},{b}")
        self.assertEqual((code, report["appended"], report["errors"]), (0, 2, []), report)
        rows = [json.loads(line) for line in self.registry.read_bytes().splitlines()]
        self.assertEqual(rows[4]["hashes"][key]["members"], sorted(row["closure_id"] for row in rows[4:]))
        self.assertEqual(m.validate_registry(self.registry)["errors"], [])
        self.commit("append a and b")
        self.assertEqual(m.validate_registry(self.registry)["errors"], [])
        code, replay = self.append(dry_run=True)
        self.assertEqual((code, replay["already_appended"], replay["errors"]), (0, 3, []), replay)

    def test_registry_pin_batch_history_reads_receipts_at_the_historical_commit(self) -> None:
        """Deep review (Astra, medium): a historical stale-ref inventory never reads the working copy."""
        m = pm_audit_closure
        self.prepare_registry_pin_batch()
        rows = self.append_pin_batch()
        snapshot = self.git("rev-parse", "HEAD")
        records = self.records.read_bytes()
        for label, data in (("before", records), ("local edit", records + b"\n"), ("restored", records)):
            with self.subTest(receipt=label):
                self.records.write_bytes(data)
                for row in rows[3:]:
                    self.assertEqual(m._target_stale_refs(row, m.CommitResolver(self.root, snapshot)), set())
        self.records.write_bytes(records + b"\n")
        live = m.validate_registry(self.registry)  # live validation still checks the working copy
        self.assertTrue(any("is not committed at HEAD with its current bytes" in e for e in live["errors"]), live)
        self.records.write_bytes(records)

    def test_registry_pin_batch_reads_split_packets_at_the_records_commit(self) -> None:
        """Deep review (Neon, medium): editing the split packet of a superseded batch row in the working copy
        leaves the batch, and so its supersession edges, as committed (T275)."""
        m = pm_audit_closure
        self.prepare_registry_pin_batch(split_only=True)
        packet = self.audit_dir / "set-packet.jsonl"
        first = self.append_pin_batch()
        self.prepare_pin_batch_records(list(enumerate(first[-2:], 4)))
        self.append_pin_batch()
        with packet.open("a", encoding="utf-8") as output:
            output.write("\n")
        report = m.validate_registry(self.registry)
        self.assertEqual(report["errors"], [])
        self.assertEqual(report["superseded_lines"], [1, 2, 3, 4, 5])

    def test_registry_pin_batch_needs_its_split_packets_committed(self) -> None:
        """Deep review (Neon, medium): a batch row whose split packet was never committed is refused."""
        m = pm_audit_closure
        original = self.target
        second = m._self_test_registry_row(**{**original, "closure_id": "closure-second", "detail_keys": ["second"]})
        write_jsonl(self.registry, [original, second])
        self.target = second
        self.prepare_record(line=2)
        code, seeded = self.append()
        self.assertEqual((code, seeded["appended"]), (0, 1), seeded)
        prior_pin = json.loads(self.registry.read_bytes().splitlines()[2])
        self.prepare_pin_batch_records([(1, original), (3, prior_pin)], split_line=3, untracked_packets=True)
        self.assertEqual(self.git("ls-files", "--others", "--ignored", "--exclude-standard", "Plans"),
                         m.rel(self.audit_dir / "set-packet.jsonl"))
        before = self.registry.read_bytes()
        code, report = self.append()
        self.assertEqual((code, report["appended"]), (1, 0), report)
        self.assertTrue(any("registry_batch_anchor cannot be rebuilt" in e and "split receipts that do not read" in e
                            for e in report["errors"]), report)
        self.assertEqual(self.registry.read_bytes(), before)

    def test_registry_pin_batch_ignores_an_unused_malformed_record(self) -> None:
        """Deep review (Astra, low): only the records the rows bind get the full shape check."""
        m = pm_audit_closure
        records = self.prepare_same_file_records()
        extended = self.audit_dir / "with-unused.jsonl"
        write_jsonl(extended, records + [{"closure_id": "unused"}])
        self.commit("the same reviews with an unused malformed record")
        self.records = extended
        code, report = self.append(dry_run=True, only=f"{records[0]['closure_id']},{records[1]['closure_id']}")
        self.assertEqual((code, report["would_append"], report["errors"]), (0, 2, []), report)
        code, report = self.append(only=f"{records[0]['closure_id']},{records[1]['closure_id']}")
        self.assertEqual((code, report["appended"], report["errors"]), (0, 2, []), report)
        self.assertEqual(m.validate_registry(self.registry)["errors"], [])

    def test_registry_pin_batch_stale_refs_name_their_registry(self) -> None:
        """Deep review (Neon, low): the historical inventory rejects markers that name another registry."""
        m = pm_audit_closure
        self.prepare_registry_pin_batch()
        rows = self.append_pin_batch()
        other = self.registry.with_name("other_registry.jsonl")
        other.write_bytes(self.registry.read_bytes())
        snapshot = self.commit("a copy of the registry under another name")
        self.assertTrue(any("must name this registry" in e for e in m.validate_registry(other)["errors"]))
        at = m.CommitResolver(self.root, snapshot)
        self.assertEqual(m._target_stale_refs(rows[4], at), set())
        stale = m._target_stale_refs(rows[4], at, registry_ref=m.rel(other))
        self.assertIn(self.anchor, {ref for _, ref, _ in stale}, stale)

    def test_registry_pin_batch_shares_its_records_file_with_unrelated_rows(self) -> None:
        """Review item 8: an unrelated row appended with a batch from the same records file gets no marker
        and leaves the markers alone, and editing its split packet after it is superseded leaves the batch."""
        m = pm_audit_closure
        key = m.REGISTRY_BATCH_ANCHOR
        a, b = (m._self_test_registry_row(**{**self.target, "closure_id": name, "detail_keys": [name]}) for name in "ab")
        unrelated = m._self_test_registry_row(**{**self.target, "closure_id": "u", "detail_keys": ["u"],
                                                 "audit_ids": ["audit-unrelated"], "closed_by_audit_id": "audit-unrelated"})
        write_jsonl(self.registry, [a, b, unrelated])
        audit_dir, records, packet = self.audit_dir, [], None
        for line, row in enumerate([a, b, unrelated], 1):
            self.audit_dir = audit_dir.parent / f"shared-{line}"
            self.audit_dir.mkdir()
            self.target, self.records = row, self.audit_dir / "record.jsonl"
            proof = self.proof_anchor()  # Also gives the recheck its own commit.
            if line < 3:
                self.prepare_record(line=line)
            else:
                packet = self.audit_dir / "split.jsonl"

                def bind_proof(record: dict, shown: dict) -> None:
                    self.write_split_rounds(record, packet, [dict(split_id="proof", anchors_at_R=shown["dependency_anchors"])],
                                            {"sol": "proof", "astra": "proof"})
                self.prepare_record(line=line, configure=bind_proof, anchor=proof)
            records.append(json.loads(self.records.read_bytes()))
        self.records = audit_dir / "shared.jsonl"
        write_jsonl(self.records, records)
        self.commit("one records file for a batch and an unrelated row")
        code, report = self.append()
        self.assertEqual((code, report["appended"], report["errors"]), (0, 3, []), report)
        rows = [json.loads(line) for line in self.registry.read_bytes().splitlines()]
        self.assertNotIn(key, rows[5]["hashes"])
        self.assertEqual(rows[3]["hashes"][key]["members"], sorted(row["closure_id"] for row in rows[3:5]))
        self.commit("appended the shared records file")
        self.target, self.audit_dir = rows[5], audit_dir.parent / "unrelated-successor"
        self.audit_dir.mkdir()
        self.records = self.audit_dir / "records.jsonl"
        self.prepare_record(line=6, anchor=self.proof_anchor())
        code, report = self.append()
        self.assertEqual((code, report["appended"], report["errors"]), (0, 1, []), report)
        with packet.open("a", encoding="utf-8") as output:
            output.write("\n")
        report = m.validate_registry(self.registry)
        self.assertEqual(report["errors"], [])
        self.assertEqual(report["superseded_lines"], [1, 2, 3, 6])

    def test_registry_pin_batch_hash_report(self) -> None:
        """Review item 8: refresh-hashes --dry-run on batch rows."""
        m = pm_audit_closure
        self.prepare_registry_pin_batch()
        rows = self.append_pin_batch()
        code, clean = self.hash_report()
        self.assertEqual((code, clean["touched_rows"]), (0, 1), clean)  # only the superseded old pin on line 3
        later = m._self_test_registry_row(closure_id="closure-later", detail_keys=["later"],
                                          closure_evidence=rows[0]["closure_evidence"], hashes=rows[0]["hashes"])
        write_jsonl(self.registry, [*rows, later])
        code, moved = self.hash_report()
        self.assertEqual((code, moved["touched_rows"]), (0, 3), moved)
        removed = copy.deepcopy(rows)
        removed[4]["hashes"].pop(m.REGISTRY_BATCH_ANCHOR)
        write_jsonl(self.registry, removed)
        code, tampered = self.hash_report()
        self.assertEqual(code, 1, tampered)
        self.assertTrue(any(e.startswith("line 5: the append that committed this row forms a registry batch")
                            for e in tampered["errors"]), tampered)

    def test_reaudit_append_help_states_the_batch_rules(self) -> None:
        """Review item 7 (T316): the help covers the dating and landing of registry batch rows."""
        proc = subprocess.run([sys.executable, "-B", str(MODULE_PATH), "reaudit-append", "--help"],
                              cwd=self.root, capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        text = " ".join(proc.stdout.split())
        for phrase in (
            "every row of that batch carries hashes.registry_batch_anchor, including a member that pins no set of its own",
            "Its created_at and updated_at are the author time of the commit that added its records file",
            "the landing rules below apply to it too",
            "An append is the rows that one commit first adds to the registry from one records file",
            "Commit the registry after each append, before the next append from the same records file",
            "A run that would change the batch of uncommitted earlier rows from the same records file is refused.",
        ):
            with self.subTest(phrase=phrase):
                self.assertIn(phrase, text)

    def test_registry_pin_batch_requires_its_records_committed_before_its_rows(self) -> None:
        """T334 (Astra medium 3): a committed batch cannot validate when its records file was first
        committed after the append that added its rows: the append could not have read it."""
        m = pm_audit_closure
        self.prepare_same_file_records()
        code, report = self.append()
        self.assertEqual((code, report["appended"], report["errors"]), (0, 3, []), report)
        ordered = self.commit("one append of all three")
        records_commit = self.git("rev-parse", f"{ordered}^")
        # Rebuild the history with the registry append before the records commit, author dates kept.
        self.git("checkout", "-q", "-b", "records-later", f"{records_commit}^")
        self.git("cherry-pick", ordered)
        self.git("cherry-pick", records_commit)
        validation = m.validate_registry(self.registry)
        for line in (4, 5, 6):
            self.assertTrue(any(e.startswith(f"{self.registry_ref}:{line}: registry_batch_anchor cannot be rebuilt")
                                and "was first committed at" in e for e in validation["errors"]), validation)

    def test_registry_pin_batch_rows_cannot_swap_their_lines(self) -> None:
        """T335 (Astra low 2): two committed batch rows exchanging physical registry lines is
        reported. A committed row sits at the line its append wrote it on, so the order of a batch
        is bound to its adding commit, not just its member set."""
        m = pm_audit_closure
        self.prepare_same_file_records()
        code, report = self.append()
        self.assertEqual((code, report["appended"], report["errors"]), (0, 3, []), report)
        self.commit("one append of all three")
        rows = [json.loads(line) for line in self.registry.read_bytes().splitlines()]
        rows[3], rows[4] = rows[4], rows[3]
        write_jsonl(self.registry, rows)
        self.commit("swap the two batch rows")
        validation = m.validate_registry(self.registry)
        for line in (4, 5):
            self.assertTrue(any(e.startswith(f"{self.registry_ref}:{line}: registry_batch_anchor cannot be rebuilt")
                                and "does not sit at" in e for e in validation["errors"]), validation)
        self.assertEqual(validation["superseded_lines"], [], validation)

    def test_registry_batch_pins_are_the_same_tree_with_or_without_the_link(self) -> None:
        """T332 (Astra medium 1): an alias of the registry that git holds as a regular file is never
        an alias of it, however the working copy links the two paths. Replacing a hard link with a
        byte-identical copy leaves the same tree, so it must leave the same validation."""
        m = pm_audit_closure
        original = self.target
        second = m._self_test_registry_row(**{**original, "closure_id": "closure-second", "detail_keys": ["second"]})
        write_jsonl(self.registry, [original, second])
        self.target = second
        self.prepare_record(line=2)
        code, seeded = self.append()
        self.assertEqual((code, seeded["appended"], seeded["errors"]), (0, 1, []), seeded)
        prior_pin = json.loads(self.registry.read_bytes().splitlines()[2])
        alias = self.registry.with_name("published-rows.jsonl")
        os.link(self.registry, alias)
        self.anchor = m.rel(alias) + "#jsonlset=audit_ids=audit-fixture"
        self.prepare_pin_batch_records([(1, original), (3, prior_pin)], split_lines=(1, 3))
        code, report = self.append()
        self.assertEqual((code, report["appended"], report["errors"]), (0, 2, []), report)
        self.commit("append the alias-pinned batch")  # git holds the alias as a regular blob
        linked = m.validate_registry(self.registry)
        alias.unlink()
        alias.write_bytes(self.registry.read_bytes())
        self.assertEqual(self.git("status", "--porcelain", "--", m.rel(alias)), "")  # the same tree
        self.assertEqual(m.validate_registry(self.registry), linked)

    def test_registry_pin_batch_rejected_marker_cannot_hide_a_stale_split_ref(self) -> None:
        """T333 (Astra medium 2): a split-only holder whose batch marker is rejected keeps its pins
        over the whole set, the row included, so a registry set that drifted from its receipt stays
        in the historical stale inventory."""
        m = pm_audit_closure
        original = self.target
        second = m._self_test_registry_row(**{**original, "closure_id": "closure-second", "detail_keys": ["second"]})
        write_jsonl(self.registry, [original, second])
        self.target = second
        self.prepare_record(line=2)
        code, seeded = self.append()
        self.assertEqual((code, seeded["appended"], seeded["errors"]), (0, 1, []), seeded)
        prior_pin = json.loads(self.registry.read_bytes().splitlines()[2])
        self.prepare_pin_batch_records([(1, original), (3, prior_pin)], split_lines=(3,))
        rows = self.append_pin_batch()
        moved = copy.deepcopy(rows)
        moved[3]["audit_ids"] = ["audit-moved"]  # the plain member leaves the audit set
        moved[3]["closed_by_audit_id"] = "audit-moved"
        write_jsonl(self.registry, moved)
        self.commit("move the plain member out of the audit set")
        with_marker = m._target_stale_refs(moved[4], m.CommitResolver(self.root, self.git("rev-parse", "HEAD")))
        self.assertIn(self.anchor, {ref for _, ref, _ in with_marker}, with_marker)
        tampered = copy.deepcopy(moved)
        tampered[4]["hashes"].pop(m.REGISTRY_BATCH_ANCHOR)
        write_jsonl(self.registry, tampered)
        snapshot = self.commit("remove the holder's batch marker")
        without_marker = m._target_stale_refs(tampered[4], m.CommitResolver(self.root, snapshot))
        self.assertIn(self.anchor, {ref for _, ref, _ in without_marker}, without_marker)

    def test_registry_pin_batch_cannot_rebind_to_a_copy_of_its_records_file(self) -> None:
        """T331 (Astra high 2): committed batch rows cannot be re-pointed at a byte-identical copy of
        their records file so that they absorb a later append as one batch. The append that first
        added the rows decides their batch, never the records path they carry now."""
        m = pm_audit_closure
        key = m.REGISTRY_BATCH_ANCHOR
        records = self.prepare_same_file_records()
        a, b, c = (record["closure_id"] for record in records)
        records_copy = self.audit_dir / "all-copy.jsonl"
        records_copy.write_bytes(self.records.read_bytes())
        with patch.dict(os.environ, {"GIT_AUTHOR_DATE": self.STAMP_DATE}):
            self.commit("a byte-identical copy of the records file")
        before = self.registry.read_bytes()
        original_records = self.records
        self.records = records_copy
        code, report = self.append()
        self.assertEqual((code, report["appended"], report["errors"]), (0, 3, []), report)
        attack = [json.loads(line) for line in self.registry.read_bytes().splitlines()]
        marker = copy.deepcopy(attack[3]["hashes"][key])
        self.assertEqual(marker["members"], sorted(row["closure_id"] for row in attack[3:]))
        self.registry.write_bytes(before)
        self.records = original_records
        code, report = self.append(only=f"{a},{b}")
        self.assertEqual((code, report["appended"], report["errors"]), (0, 2, []), report)
        self.commit("append a and b from the first copy")
        for row in attack[3:]:
            row["hashes"][key] = copy.deepcopy(marker)
        write_jsonl(self.registry, attack)
        self.commit("repoint the committed rows at the copy")
        validation = m.validate_registry(self.registry)
        for line in (4, 5, 6):
            self.assertIn(f"{self.registry_ref}:{line}: registry_batch_anchor differs from the batch rebuilt "
                          "from the append that committed the row", validation["errors"])
        self.assertEqual(validation["superseded_lines"], [], validation)

    def test_split_only_anchor_is_current_after_append(self) -> None:
        self.prepare_currentness_split()
        code, appended = self.append()
        self.assertEqual((code, appended["appended"], appended["errors"]), (0, 1, []), appended)
        report = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual(report["errors"], [])
        self.assertEqual(report["unsuperseded_stale_hash_count"], 0)

    def test_moved_split_only_anchor_is_stale_and_held_back_on_append(self) -> None:
        m = pm_audit_closure
        extra, ref, _ = self.prepare_currentness_split()
        stored = m.AnchorResolver().sha256(ref)
        before = self.registry.read_bytes()
        code, appended = self.append()
        self.assertEqual((code, appended["appended"]), (0, 1), appended)
        extra.write_text('{"evidence": "Changed since the split review."}\n', encoding="utf-8")
        current = m.AnchorResolver().sha256(ref)
        report = m.validate_registry(self.registry)
        self.assertEqual(report["errors"], [
            f"{self.registry_ref}:2: split_anchor_hashes for {ref} is stale (stored {stored}, current {current})",
        ])
        self.assertEqual(report["unsuperseded_stale_hash_count"], 1)
        self.registry.write_bytes(before)
        code, held = self.append()
        self.assertEqual((code, held["would_append"], held["appended"], held["errors"]), (0, 0, 0, []), held)
        self.assertEqual(held["moved_since_recheck"], [{
            "closure_id": self.target["closure_id"], "line": 1,
            "changed_anchors": {ref: {"at_recheck": stored, "now": current}},
        }])
        self.assertEqual(self.registry.read_bytes(), before)

    def test_unresolvable_split_only_anchor_is_stale_and_held_back(self) -> None:
        extra, ref, _ = self.prepare_currentness_split()
        before = self.registry.read_bytes()
        code, appended = self.append()
        self.assertEqual((code, appended["appended"]), (0, 1), appended)
        extra.write_text("{}\n", encoding="utf-8")
        report = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual(report["unsuperseded_stale_hash_count"], 1)
        self.assertTrue(report["errors"][0].startswith(
            f"{self.registry_ref}:2: split_anchor_hashes anchor {ref} no longer resolves: "
        ), report)
        self.registry.write_bytes(before)
        code, held = self.append(dry_run=True)
        self.assertEqual((code, held["would_append"], held["errors"]), (0, 0, []), held)
        self.assertTrue(held["moved_since_recheck"][0]["changed_anchors"][ref]["now"].startswith("unresolved:"))

    def test_split_anchor_must_agree_with_the_snapshot(self) -> None:
        self.prepare_currentness_split(snapshot_conflict=True)
        self.assert_owner_split_result(f"record.reviews.astra split_packet has a conflicting hash for {self.anchor}")

    def test_split_packet_file_must_match_receipt_hash(self) -> None:
        _, _, path = self.prepare_currentness_split()
        before = self.registry.read_bytes()
        code, appended = self.append()
        self.assertEqual((code, appended["appended"]), (0, 1), appended)
        with path.open("a", encoding="utf-8") as output:
            output.write("\n")
        report = pm_audit_closure.validate_registry(self.registry)
        self.assertTrue(any("split_packet file is missing or its SHA-256 differs" in error
                            for error in report["errors"]), report)
        self.registry.write_bytes(before)
        self.assert_owner_split_result("split_packet file is missing or its SHA-256 differs")

    def test_superseded_split_round_is_exempt_from_split_currentness(self) -> None:
        extra, _, path = self.prepare_currentness_split()
        code, appended = self.append()
        self.assertEqual((code, appended["appended"]), (0, 1), appended)
        extra.write_text('{"evidence": "Changed since the split review."}\n', encoding="utf-8")
        self.target = json.loads(self.registry.read_bytes().splitlines()[-1])
        self.audit_dir = self.audit_dir.parent / "successor"
        self.audit_dir.mkdir()
        self.records = self.audit_dir / "records.jsonl"
        self.prepare_record(line=2)
        code, appended = self.append()
        self.assertEqual((code, appended["appended"]), (0, 1), appended)
        with path.open("a", encoding="utf-8") as output:
            output.write("\n")
        report = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual(report["errors"], [])
        self.assertEqual(report["superseded_lines"], [1, 2])
        self.assertEqual(report["unsuperseded_stale_hash_count"], 0)

    def test_successor_must_list_and_dispose_of_a_moved_split_only_anchor(self) -> None:
        extra, _, _ = self.prepare_currentness_split()
        code, appended = self.append()
        self.assertEqual((code, appended["appended"]), (0, 1), appended)
        extra.write_text("{}\n", encoding="utf-8")
        self.target = json.loads(self.registry.read_bytes().splitlines()[-1])
        self.audit_dir = self.audit_dir.parent / "successor"
        self.audit_dir.mkdir()
        self.records = self.audit_dir / "records.jsonl"

        def omit_stale_evidence(record: dict, packet: dict) -> None:
            record["stale_hashes_at_recheck"] = []
            record["stale_ref_dispositions"] = []

        self.prepare_record(configure=omit_stale_evidence, line=2)
        code, report = self.append(dry_run=True)
        self.assertNotEqual(code, 0, report)
        self.assertTrue(any("stale_hashes_at_recheck must list exactly" in error for error in report["errors"]), report)
        self.assertTrue(any("stale_ref_dispositions must cover exactly" in error for error in report["errors"]), report)

    def test_record_without_split_receipts_ignores_unbound_packet(self) -> None:
        (self.audit_dir / "unbound-split-packet.jsonl").write_text("Invalid JSON.\n", encoding="utf-8")
        self.prepare_record()
        code, appended = self.append()
        self.assertEqual((code, appended["appended"], appended["errors"]), (0, 1, []), appended)
        self.assertEqual(pm_audit_closure.validate_registry(self.registry)["errors"], [])

    def test_unanimous_split_receipt_must_select_the_round_its_reviewers_judged(self) -> None:
        # T282 (T275 reviews: Sol max A1, Astra max 1): both outputs echo round A, which shows one more
        # anchor; both receipts point at a correctly pinned packet B with the same line, closure and
        # split ID and only the snapshot anchors. The omitted anchor then moves.
        m = pm_audit_closure
        omitted = self.audit_dir / "omitted.json"
        omitted.write_text('{"evidence": "Shown only in the judged split round."}\n', encoding="utf-8")
        omitted_ref = m.rel(omitted) + "#json=/evidence"
        judged_path = self.audit_dir / "judged-split-packet.jsonl"
        other_path = self.audit_dir / "other-split-packet.jsonl"

        def configure(record: dict, packet: dict) -> None:
            shared = copy.deepcopy(packet["dependency_anchors"])
            additional = {"ref": omitted_ref, "sha256": m.AnchorResolver().sha256(omitted_ref)}
            both = {"sol": "shown", "astra": "shown"}
            self.write_split_rounds(record, judged_path, [dict(split_id="shown", anchors_at_R=shared + [additional])], both)
            other = dict({key: record[key] for key in ("line", "closure_id")}, split_id="shown", anchors_at_R=shared)
            other["split_row_digest"] = m.sha256_text(m.canonical_json(other))
            write_jsonl(other_path, [other])
            for who in both:
                record["reviews"][who].update(split_packet_path=m.rel(other_path), split_packet_sha256=m.sha256_file(other_path))

        self.prepare_record(configure=configure)
        omitted.write_text('{"evidence": "Changed after the split review."}\n', encoding="utf-8")
        code, report = self.append(dry_run=True)
        self.assertNotEqual(code, 0, report)
        self.assertEqual(report["would_append"], 0, report)
        self.assertTrue(any("split_packet row and receipt must bind the same split id and row digest" in error
                            for error in report["errors"]), report)

    def assert_split_echo_needs_receipt(self, removed: tuple[str, ...]) -> None:
        path = self.audit_dir / "dropped-split-packet.jsonl"

        def configure(record: dict, packet: dict) -> None:
            self.write_split_rounds(record, path, [dict(split_id="shown", anchors_at_R=copy.deepcopy(
                packet["dependency_anchors"]))], {"sol": "shown", "astra": "shown"})
            for who in ("sol", "astra"):
                for field in removed:
                    record["reviews"][who].pop(field)

        self.prepare_record(configure=configure)
        code, report = self.append(dry_run=True)
        self.assertNotEqual(code, 0, report)
        self.assertEqual(report["would_append"], 0, report)
        self.assertTrue(any("judged a split round, so it needs a split_id" in error for error in report["errors"]), report)

    def test_unanimous_split_output_needs_its_split_packet_receipt(self) -> None:
        # T282: outputs that echo a split round cannot drop the split file fields from their receipts.
        self.assert_split_echo_needs_receipt(("split_packet_path", "split_packet_sha256"))

    def test_unanimous_split_output_needs_a_split_receipt_at_all(self) -> None:
        # T282: nor every split field.
        self.assert_split_echo_needs_receipt(pm_audit_closure.REAUDIT_SPLIT_RECEIPT_FIELDS)

    def test_replay_does_not_accept_an_appended_split_row_whose_packet_changed(self) -> None:
        # T283 (T275 reviews: Sol max A2, Astra max 2): a packet edited after the append.
        _, _, path = self.prepare_currentness_split()
        code, appended = self.append()
        self.assertEqual((code, appended["appended"]), (0, 1), appended)
        with path.open("a", encoding="utf-8") as output:
            output.write("\n")
        code, replay = self.append(dry_run=True)
        self.assertNotEqual(code, 0, replay)
        self.assertEqual(replay["already_appended"], 0, replay)
        self.assertTrue(any("an earlier append of this record (line 2)" in error for error in replay["errors"]), replay)

    def test_replay_does_not_accept_an_appended_split_row_with_a_live_split_error(self) -> None:
        # T283: the supersession edge holds, but validate reports a structural split error on the live row.
        m = pm_audit_closure
        self.prepare_currentness_split(snapshot_conflict=True, anchor=self.proof_anchor())
        record = json.loads(self.records.read_text(encoding="utf-8").splitlines()[0])
        row = m.build_reaudit_row(self.target, 1, m.raw_registry_lines(self.registry)[1], record, m.rel(self.records),
                                  m.AnchorResolver(), "2026-11-20T00:00:00Z")
        with self.registry.open("a", encoding="utf-8") as output:
            output.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")
        report = m.validate_registry(self.registry)
        self.assertEqual((report["superseded_by"], report.get("split_error_lines")), ({"1": 2}, [2]), report)
        code, replay = self.append(dry_run=True)
        self.assertNotEqual(code, 0, replay)
        self.assertEqual(replay["already_appended"], 0, replay)
        self.assertTrue(any("(line 2) has a split receipt error" in error for error in replay["errors"]), replay)

    def test_replay_still_accepts_an_appended_split_row_whose_anchor_moved(self) -> None:
        # T283 control: ordinary anchor drift keeps the idempotent result.
        extra, _, _ = self.prepare_currentness_split()
        code, appended = self.append()
        self.assertEqual((code, appended["appended"]), (0, 1), appended)
        extra.write_text('{"evidence": "Changed since the split review."}\n', encoding="utf-8")
        self.assertEqual(pm_audit_closure.validate_registry(self.registry).get("split_error_lines", []), [])
        code, replay = self.append(dry_run=True)
        self.assertEqual((code, replay["already_appended"], replay["errors"]), (0, 1, []), replay)

    def test_split_only_row_set_of_this_registry_excludes_the_appended_row(self) -> None:
        # T284 (T275 reviews: Astra max 3): the ordinary dependency is a JSON proof, and the reviewers
        # also saw this registry's row set. The appended row must not count itself in that set.
        m = pm_audit_closure
        path = self.audit_dir / "registry-split-packet.jsonl"

        def configure(record: dict, packet: dict) -> None:
            anchors = copy.deepcopy(packet["dependency_anchors"]) + [
                {"ref": self.anchor, "sha256": m.AnchorResolver().sha256(self.anchor)}]
            self.write_split_rounds(record, path, [dict(split_id="registry-round", anchors_at_R=anchors)],
                                    {"sol": "registry-round", "astra": "registry-round"})

        self.prepare_record(configure=configure, anchor=self.proof_anchor())
        code, dry = self.append(dry_run=True)
        self.assertEqual((code, dry["would_append"], dry["errors"], dry["moved_since_recheck"]), (0, 1, [], []), dry)
        code, appended = self.append()
        self.assertEqual((code, appended["appended"], appended["errors"]), (0, 1, []), appended)
        self.assertNotIn("registry_self_anchor", m.read_jsonl(self.registry, [])[-1]["hashes"])
        report = m.validate_registry(self.registry)
        self.assertEqual((report["errors"], report["unsuperseded_stale_hash_count"]), ([], 0), report)
        # Only the row itself is excluded: a later row that joins the set moves it.
        later = m._self_test_registry_row(
            closure_id="closure-later", owner_docs=[self.registry_ref], closure_evidence=[self.registry_ref],
            detail_keys=["later finding"], hashes=self.target["hashes"],
        )
        with self.registry.open("a", encoding="utf-8") as output:
            output.write(json.dumps(later) + "\n")
        report = m.validate_registry(self.registry)
        self.assertTrue(any(f"split_anchor_hashes for {self.anchor} is stale" in error for error in report["errors"]), report)

    def test_successor_leaves_its_predecessor_out_of_the_predecessors_split_only_row_set(self) -> None:
        # T284: the stale set a successor accounts for applies the same self-exclusion as the
        # predecessor's live split check, so the predecessor joining its own row set is not staleness.
        m = pm_audit_closure
        path = self.audit_dir / "registry-split-packet.jsonl"

        def configure(record: dict, packet: dict) -> None:
            anchors = copy.deepcopy(packet["dependency_anchors"]) + [
                {"ref": self.anchor, "sha256": m.AnchorResolver().sha256(self.anchor)}]
            self.write_split_rounds(record, path, [dict(split_id="registry-round", anchors_at_R=anchors)],
                                    {"sol": "registry-round", "astra": "registry-round"})

        self.prepare_record(configure=configure, anchor=self.proof_anchor())
        code, appended = self.append()
        self.assertEqual((code, appended["appended"], appended["errors"]), (0, 1, []), appended)
        self.target = json.loads(self.registry.read_bytes().splitlines()[-1])
        self.audit_dir = self.audit_dir.parent / "successor"
        self.audit_dir.mkdir()
        self.records = self.audit_dir / "records.jsonl"

        def declare_no_stale_evidence(record: dict, packet: dict) -> None:
            record["stale_hashes_at_recheck"] = []
            record["stale_ref_dispositions"] = []

        self.prepare_record(configure=declare_no_stale_evidence, line=2)
        code, report = self.append(dry_run=True)
        self.assertEqual((code, report["would_append"], report["errors"]), (0, 1, []), report)

    def test_owner_split_receipt_selects_its_round_in_a_multi_round_file(self) -> None:
        # T285 (T275 reviews: Astra max 6): an earlier round for the same line and closure in the same file.
        self.prepare_owner_split(extra_round=True)
        self.assert_owner_split_result()

    def test_self_anchor_is_current_after_append(self) -> None:
        self.prepare_record()
        before = self.registry.read_bytes()
        code, dry = self.append(dry_run=True)
        self.assertEqual((code, dry["would_append"], dry["errors"]), (0, 1, []))
        self.assertEqual(self.registry.read_bytes(), before)
        code, appended = self.append()
        self.assertEqual((code, appended["appended"], appended["errors"]), (0, 1, []))
        report = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual(report["errors"], [])
        self.assertEqual(report["unsuperseded_stale_hash_count"], 0)
        code, repeated = self.append()
        self.assertEqual((code, repeated["already_appended"], repeated["errors"]), (0, 1, []))

    def test_stale_self_anchor_is_held_back(self) -> None:
        self.prepare_record()
        other = pm_audit_closure._self_test_registry_row(
            closure_id="closure-fixture-other", owner_docs=[self.registry_ref],
            closure_evidence=[self.registry_ref], detail_keys=["another finding"],
            hashes=self.target["hashes"],
        )
        with self.registry.open("a") as output:
            output.write(json.dumps(other) + "\n")
        before = self.registry.read_bytes()
        code, report = self.append()
        self.assertEqual((code, report["appended"], report["would_append"]), (0, 0, 0))
        self.assertEqual(len(report["moved_since_recheck"]), 1)
        self.assertIn(self.anchor, report["moved_since_recheck"][0]["changed_anchors"])
        self.assertEqual(self.registry.read_bytes(), before)

    def test_candidate_checks_other_rows_against_appended_content(self) -> None:
        watched = self.registry_ref + "#jsonlset=audit_ids=reaudit-fixture"
        watcher = pm_audit_closure._self_test_registry_row(
            closure_id="closure-watcher", audit_ids=["audit-watcher"], closed_by_audit_id="audit-watcher",
            owner_docs=[self.registry_ref], closure_evidence=[self.registry_ref], detail_keys=["watcher"],
            hashes={"hash_scope": pm_audit_closure.ANCHOR_SCOPE,
                    "owner_evidence_hashes": {watched: pm_audit_closure.sha256_text("[]")}},
        )
        write_jsonl(self.registry, [self.target, watcher])
        self.prepare_record()
        self.assertEqual(pm_audit_closure.validate_registry(self.registry)["errors"], [])
        before = self.registry.read_bytes()
        code, report = self.append()
        self.assertEqual((code, report["appended"]), (1, 0))
        self.assertTrue(any(watched in error and "is stale" in error for error in report["errors"]), report)
        self.assertEqual(report.get("already_stale_current_hash_moved", []), [])
        self.assertEqual(self.registry.read_bytes(), before)

    def test_already_stale_shared_anchor_does_not_block_append(self) -> None:
        watcher = pm_audit_closure._self_test_registry_row(
            closure_id="closure-watcher", audit_ids=["audit-watcher"], closed_by_audit_id="audit-watcher",
            owner_docs=[self.registry_ref], closure_evidence=[self.registry_ref], detail_keys=["watcher"],
            hashes={"hash_scope": pm_audit_closure.ANCHOR_SCOPE,
                    "owner_evidence_hashes": {self.anchor: "0" * 64}},
        )
        write_jsonl(self.registry, [self.target, watcher])
        self.prepare_record()
        baseline = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual(len(baseline["errors"]), 1, baseline)
        before_hash = pm_audit_closure.AnchorResolver().sha256(self.anchor)
        before = self.registry.read_bytes()
        code, report = self.append(dry_run=True)
        self.assertEqual((code, report["would_append"], report["errors"]), (0, 1, []), report)
        self.assertEqual(self.registry.read_bytes(), before)
        moved = report["already_stale_current_hash_moved"]
        self.assertEqual(len(moved), 1, report)
        self.assertEqual(moved[0], {
            "status": "already stale, current hash moved", "line": 2,
            "closure_id": watcher["closure_id"], "group": "owner_evidence_hashes",
            "ref": self.anchor, "stored": "0" * 64,
            "before_append_current": before_hash, "candidate_current": moved[0]["candidate_current"],
        })
        self.assertNotEqual(moved[0]["candidate_current"], before_hash)
        code, appended = self.append()
        self.assertEqual((code, appended["appended"], appended["errors"]), (0, 1, []), appended)
        self.assertEqual(pm_audit_closure.AnchorResolver().sha256(self.anchor),
                         appended["already_stale_current_hash_moved"][0]["candidate_current"])
        after = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual(after["unsuperseded_stale_hash_count"], 1, after)
        self.assertEqual(len(after["errors"]), 1, after)

    def test_stale_on_one_anchor_does_not_excuse_new_staleness_on_another(self) -> None:
        stale_anchor = self.registry_ref + "#jsonlset=audit_ids=audit-absent"
        watched = self.registry_ref + "#jsonlset=audit_ids=reaudit-fixture"
        watcher = pm_audit_closure._self_test_registry_row(
            closure_id="closure-watcher", audit_ids=["audit-watcher"], closed_by_audit_id="audit-watcher",
            owner_docs=[self.registry_ref], closure_evidence=[self.registry_ref], detail_keys=["watcher"],
            hashes={"hash_scope": pm_audit_closure.ANCHOR_SCOPE,
                    "owner_evidence_hashes": {stale_anchor: "0" * 64, watched: pm_audit_closure.sha256_text("[]")}},
        )
        write_jsonl(self.registry, [self.target, watcher])
        self.prepare_record()
        baseline = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual(len(baseline["errors"]), 1, baseline)
        self.assertIn(stale_anchor, baseline["errors"][0])
        before = self.registry.read_bytes()
        code, report = self.append(dry_run=True)
        self.assertEqual((code, report["appended"], report["would_append"]), (1, 0, 0), report)
        self.assertTrue(any(watched in error and "is stale" in error for error in report["errors"]), report)
        self.assertEqual(report.get("already_stale_current_hash_moved", []), [])
        self.assertEqual(self.registry.read_bytes(), before)

    def test_later_matching_row_stales_self_anchor(self) -> None:
        self.prepare_record()
        self.assertEqual(self.append()[0], 0)
        report = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual(report["errors"], [])
        self.assertEqual(report["unsuperseded_stale_hash_count"], 0)
        other = pm_audit_closure._self_test_registry_row(
            closure_id="closure-later", owner_docs=[self.registry_ref], closure_evidence=[self.registry_ref],
            detail_keys=["later finding"], hashes=self.target["hashes"],
        )
        with self.registry.open("a") as output:
            output.write(json.dumps(other) + "\n")
        report = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual(report["unsuperseded_stale_hash_count"], 1)
        self.assertTrue(any(self.anchor in error and "is stale" in error for error in report["errors"]), report)

    def test_self_excluding_generated_fields_cannot_be_tampered(self) -> None:
        self.prepare_record()
        code, appended = self.append()
        self.assertEqual((code, appended["appended"], appended["errors"]), (0, 1, []))
        report = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual(report["errors"], [])
        self.assertEqual(report["unsuperseded_stale_hash_count"], 0)
        original = pm_audit_closure.read_jsonl(self.registry, [])
        for field, value in original[-1].items():
            if field == "_line_no":
                continue
            with self.subTest(field=field):
                rows = copy.deepcopy(original)
                if field in ("created_at", "updated_at"):
                    changed = "2000-01-01T00:00:00Z" if value != "2000-01-01T00:00:00Z" else "2001-01-01T00:00:00Z"
                elif isinstance(value, list):
                    changed = value + ["tampered"]
                elif isinstance(value, dict):
                    changed = {**value, "tampered": True}
                else:
                    changed = value + " tampered"
                rows[-1][field] = changed
                pm_audit_closure.write_jsonl(self.registry, rows)
                report = pm_audit_closure.validate_registry(self.registry)
                self.assertTrue(report["errors"], report)
                self.assertEqual(report["superseded_row_count"], 0, report)

    def record_author_time(self) -> str:
        """The author date of the commit that added the re-audit record file, in registry form."""
        stamp = self.git("log", "--diff-filter=A", "--format=%at", "--", pm_audit_closure.rel(self.records))
        return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(int(stamp)))

    def validated_rows(self, rows: list[dict]) -> dict:
        pm_audit_closure.write_jsonl(self.registry, rows)
        return pm_audit_closure.validate_registry(self.registry)

    def test_self_excluding_timestamps_are_bound_to_the_record_commit(self) -> None:
        # T218 (t203 review r2): both timestamps edited together to one valid string must not pass.
        self.prepare_record()
        code, appended = self.append()
        self.assertEqual((code, appended["appended"], appended["errors"]), (0, 1, []))
        original = pm_audit_closure.read_jsonl(self.registry, [])
        self.assertEqual((original[-1]["created_at"], original[-1]["updated_at"]),
                         (self.record_author_time(), self.record_author_time()))
        for stamp in ("2000-01-01T00:00:00Z", "2099-12-31T23:59:59Z"):
            with self.subTest(stamp=stamp):
                rows = copy.deepcopy(original)
                rows[-1]["created_at"] = rows[-1]["updated_at"] = stamp
                report = self.validated_rows(rows)
                self.assertTrue(any("generated fields differ" in error and "created_at" in error for error in report["errors"]), report)
                self.assertEqual(report["superseded_row_count"], 0, report)
        self.assertEqual(self.validated_rows(original)["errors"], [])

    def test_self_exclusion_mode_is_bound_to_the_record(self) -> None:
        # T219 (t203 Astra max finding 1): the marker cannot be dropped to leave the rebuild.
        self.prepare_record()
        self.assertEqual(self.append()[0], 0)
        original = pm_audit_closure.read_jsonl(self.registry, [])
        downgrades = {
            "marker, audit_ids and reason": lambda row: (
                row["hashes"].pop("registry_self_anchor"),
                row.update(audit_ids=[row["closed_by_audit_id"]], closure_reason="An unreviewed fabricated closure reason.")),
            "marker only": lambda row: row["hashes"].pop("registry_self_anchor"),
            "marker and timestamps": lambda row: (
                row["hashes"].pop("registry_self_anchor"), row.update(created_at="2000-01-01T00:00:00Z", updated_at="2000-01-01T00:00:00Z")),
        }
        for name, downgrade in downgrades.items():
            with self.subTest(downgrade=name):
                rows = copy.deepcopy(original)
                downgrade(rows[-1])
                report = self.validated_rows(rows)
                self.assertTrue(any("so the row must carry registry_self_anchor" in error for error in report["errors"]), report)
                self.assertEqual(report["superseded_row_count"], 0, report)
        self.assertEqual(self.validated_rows(original)["errors"], [])

    def test_listed_pre_marker_record_keeps_its_unmarked_row_but_is_rebuilt(self) -> None:
        # The seven pre-marker records may keep unmarked rows; their generated fields are still rebuilt.
        self.prepare_record()
        record = json.loads(self.records.read_text(encoding="utf-8").splitlines()[0])
        digest = pm_audit_closure.reaudit_record_sha256(record)
        legacy = patch.object(pm_audit_closure, "LEGACY_UNMARKED_SELF_DEPENDENT_RECORDS", frozenset({digest}), create=True)
        legacy.start()
        self.addCleanup(legacy.stop)
        self.assertEqual(self.append()[0], 0)
        original = pm_audit_closure.read_jsonl(self.registry, [])
        unmarked = copy.deepcopy(original)
        unmarked[-1]["hashes"].pop("registry_self_anchor")
        unmarked[-1]["created_at"] = unmarked[-1]["updated_at"] = "2026-11-04T00:00:00Z"
        report = self.validated_rows(unmarked)
        # Like registry rows 963 and 968: the edge holds, and the row's own set is stale.
        self.assertEqual(report["superseded_row_count"], 1, report)
        self.assertTrue(report["errors"] and all(self.anchor in error and "is stale" in error for error in report["errors"]), report)
        narrowed = copy.deepcopy(unmarked)
        narrowed[-1].update(audit_ids=[narrowed[-1]["closed_by_audit_id"]], closure_reason="An unreviewed fabricated closure reason.")
        report = self.validated_rows(narrowed)
        self.assertTrue(any("generated fields differ" in error for error in report["errors"]), report)
        self.assertEqual(report["superseded_row_count"], 0, report)

    def test_hard_link_alias_of_the_registry_is_the_same_registry(self) -> None:
        # T236 (tool-notes Astra max finding 2): a hard link to the registry passed as --registry is the
        # same file, so a tampered, unmarked self-dependent row is refused through either name.
        self.prepare_record()
        self.assertEqual(self.append()[0], 0)
        alias = self.registry.with_name("same-registry-hardlink.jsonl")
        os.link(self.registry, alias)
        self.assertTrue(os.path.samefile(self.registry, alias))
        original = pm_audit_closure.read_jsonl(self.registry, [])
        tampered = copy.deepcopy(original)
        tampered[-1]["hashes"].pop("registry_self_anchor")
        tampered[-1].update(audit_ids=[tampered[-1]["closed_by_audit_id"]], closure_reason="An unreviewed fabricated closure reason.")
        retimed = copy.deepcopy(tampered)
        retimed[-1]["created_at"] = retimed[-1]["updated_at"] = "2000-01-01T00:00:00Z"
        for name, rows in (("marker, audit_ids and reason", tampered), ("and both timestamps", retimed)):
            pm_audit_closure.write_jsonl(self.registry, rows)  # rewrites the shared inode in place
            for path in (self.registry, alias):
                with self.subTest(tampering=name, registry=path.name):
                    args = argparse.Namespace(registry=str(path), audit_dir=[], require_closure_matrix=False,
                                              require_effective_status=False, source_artifact=None)
                    with contextlib.redirect_stdout(io.StringIO()) as output:
                        code = pm_audit_closure.cmd_validate(args)
                    report = json.loads(output.getvalue())
                    self.assertEqual(code, 1, report["errors"])
                    self.assertTrue(any("so the row must carry registry_self_anchor" in error for error in report["errors"]),
                                    report["errors"])
                    self.assertEqual(report["registry"]["superseded_row_count"], 0, report["registry"])
        pm_audit_closure.write_jsonl(self.registry, original)
        self.assertEqual(pm_audit_closure.validate_registry(self.registry)["errors"], [])

    def test_reaudit_append_help_states_the_author_time_rule(self) -> None:
        # T234 (tool-notes reviews): the lander reads where marked-row timestamps come from and what keeps them.
        # The command line, as a lander runs it; main() is left unchanged because registry rows anchor it.
        proc = subprocess.run([sys.executable, "-B", str(MODULE_PATH), "reaudit-append", "--help"],
                              cwd=self.root, capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        text = " ".join(proc.stdout.split())
        for phrase in (
            "created_at and updated_at are the author time of the commit that added its re-audit record",
            "Landings must preserve that author time. An ordinary rebase and a fast-forward do.",
            "A squash, or a rebase with --ignore-date,",
            "running reaudit-append again does not repair it",
            "a branch that needs a squash or --ignore-date is rebuilt before its append",
            "Registry rows are never edited.",
        ):
            with self.subTest(phrase=phrase):
                self.assertIn(phrase, text)

    def test_stale_set_at_later_recheck_uses_self_exclusion(self) -> None:
        self.prepare_record()
        self.assertEqual(self.append()[0], 0)
        commit = self.commit("appended registry")
        rows = pm_audit_closure.read_jsonl(self.registry, [])
        stale = pm_audit_closure._target_stale_refs(rows[-1], pm_audit_closure.CommitResolver(self.root, commit))
        self.assertEqual(stale, set())

    def test_self_exclusion_cannot_name_another_file(self) -> None:
        self.prepare_record()
        self.assertEqual(self.append()[0], 0)
        rows = pm_audit_closure.read_jsonl(self.registry, [])
        rows[-1]["hashes"]["registry_self_anchor"]["path"] = pm_audit_closure.rel(self.records)
        pm_audit_closure.write_jsonl(self.registry, rows)
        report = pm_audit_closure.validate_registry(self.registry)
        self.assertTrue(any("registry_self_anchor must name this registry" in error for error in report["errors"]), report)

    def test_hash_report_agrees_with_self_anchor_validation(self) -> None:
        self.prepare_record()
        self.assertEqual(self.append()[0], 0)
        with contextlib.redirect_stdout(io.StringIO()) as output:
            code = pm_audit_closure.cmd_refresh_hashes(argparse.Namespace(registry=str(self.registry), dry_run=True))
        report = json.loads(output.getvalue())
        self.assertEqual((code, report["touched_rows"]), (0, 0))


class PmAuditClosureTerminalStateTests(unittest.TestCase):
    def validate(self, audit_dir: Path, registry: Path) -> dict:
        return pm_audit_closure.validate_audit_dir(
            audit_dir,
            require_matrix=True,
            require_effective_status=False,
            source_artifacts=None,
            registry_path=registry,
        )

    def setup_audit(self, root: Path, name: str, *, status: str = "PASS", repair_required_count: int = 0) -> tuple[Path, Path, dict[str, str]]:
        audit_dir = root / name
        audit_dir.mkdir()
        registry = root / "_semantic_closure_registry.jsonl"
        registry.write_text("", encoding="utf-8")
        audit_refs = refs(name)
        write_audit_report(audit_dir, audit_refs, status=status, repair_required_count=repair_required_count)
        write_complete_scope(audit_dir, audit_refs)
        return audit_dir, registry, audit_refs

    def test_previously_closed_needs_no_repair_matrix(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-terminal")
            write_jsonl(audit_dir / "atom_fidelity_matrix.jsonl", [{
                **audit_refs,
                "atom_id": "atom-0001",
                "classification": "previously_closed",
                "finding_level": "observation",
                "repair_required": False,
            }])

            report = self.validate(audit_dir, registry)

            self.assertEqual(report["errors"], [])
            self.assertEqual(report["repair_required_count"], 0)
            self.assertFalse(report["matrix_required"])
            self.assertEqual(report["terminal_repair_state"], "no_repair_required")

    def test_warning_only_audit_is_terminal_without_matrix(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-warning-only", status="PASS_WITH_WARNINGS")
            warning = finding_row(audit_refs, repair_required=False, level="warning")
            write_jsonl(audit_dir / "semantic_risks.jsonl", [warning])
            write_complete_scope(audit_dir, audit_refs, finding_keys=[warning["finding_key"]])

            report = self.validate(audit_dir, registry)

            self.assertEqual(report["errors"], [])
            self.assertEqual(report["repair_required_count"], 0)
            self.assertEqual(report["terminal_repair_state"], "no_repair_required")

    def test_ordinary_validator_warning_is_not_actionable(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-validator-warning")
            (audit_dir / "validator_results.json").write_text(json.dumps({
                **audit_refs,
                "results": [{
                    "name": "closure_validate",
                    "status": "pass",
                    "stdout": json.dumps({"warnings": ["informational"]}),
                    "side_effect_count": 0,
                }]
            }), encoding="utf-8")

            report = self.validate(audit_dir, registry)

            self.assertEqual(report["errors"], [])
            self.assertEqual(report["repair_required_count"], 0)

    def test_repair_required_true_requires_matrix_and_impact_matrix(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-actionable", status="BLOCKED", repair_required_count=1)
            actionable = finding_row(audit_refs, repair_required=True, level="blocker")
            write_jsonl(audit_dir / "semantic_risks.jsonl", [actionable])
            write_complete_scope(audit_dir, audit_refs, finding_keys=[actionable["finding_key"]])

            report = self.validate(audit_dir, registry)

            self.assertEqual(report["repair_required_count"], 1)
            self.assertTrue(report["matrix_required"])
            self.assertTrue(any("repair_closure_matrix.jsonl" in error for error in report["errors"]))
            self.assertTrue(any("repair_impact_matrix.jsonl" in error for error in report["errors"]))

    def test_unstable_audit_specific_finding_key_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-unstable-key", status="BLOCKED", repair_required_count=1)
            actionable = finding_row(audit_refs, repair_required=True, level="blocker")
            actionable["finding_key"] = f"{audit_refs['audit_id']}::row-1"
            write_jsonl(audit_dir / "semantic_risks.jsonl", [actionable])

            report = self.validate(audit_dir, registry)

            self.assertTrue(any("audit-specific identity" in error for error in report["errors"]))
            self.assertTrue(any("deterministic" in error for error in report["errors"]))

    def test_incomplete_scope_manifest_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-incomplete-scope")
            rows = [
                scope_row(audit_refs, family)
                for family in sorted(pm_audit_closure.SCOPE_REQUIRED_FAMILIES)
                if family != "forbidden_artifact_check"
            ]
            rows[0]["classification"] = "pending"
            write_jsonl(audit_dir / "audit_scope_manifest.jsonl", rows)

            report = self.validate(audit_dir, registry)

            self.assertTrue(any("classification must be final" in error for error in report["errors"]))
            self.assertTrue(any("missing required check_family coverage" in error for error in report["errors"]))

    def test_cross_artifact_ref_mismatch_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-ref-mismatch", status="PASS_WITH_WARNINGS")
            warning = finding_row(audit_refs, repair_required=False, level="warning")
            warning["subject_ref"] = "different-subject"
            write_jsonl(audit_dir / "semantic_risks.jsonl", [warning])

            report = self.validate(audit_dir, registry)

            self.assertTrue(any("does not match audit_report" in error for error in report["errors"]))

    def test_repair_induced_lineage_dependency_projection_drift_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-repair-drift", status="BLOCKED", repair_required_count=1)
            actionable = finding_row(audit_refs, repair_required=True, level="blocker")
            write_jsonl(audit_dir / "semantic_risks.jsonl", [actionable])
            write_complete_scope(audit_dir, audit_refs, finding_keys=[actionable["finding_key"]])
            write_jsonl(registry, [registry_row(audit_refs, actionable)])
            write_jsonl(audit_dir / "repair_closure_matrix.jsonl", [closure_matrix_row(audit_refs, actionable)])
            write_jsonl(audit_dir / "repair_impact_matrix.jsonl", [impact_row(audit_refs, actionable, drift_field="dependencies")])

            report = self.validate(audit_dir, registry)

            self.assertTrue(any("drift.dependencies must be false" in error for error in report["errors"]))

    def test_repaired_matrix_supersedes_historical_blocked_report(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-repaired", status="BLOCKED", repair_required_count=1)
            actionable = finding_row(audit_refs, repair_required=True, level="blocker")
            write_jsonl(audit_dir / "semantic_risks.jsonl", [actionable])
            write_complete_scope(audit_dir, audit_refs, finding_keys=[actionable["finding_key"]])
            write_jsonl(registry, [registry_row(audit_refs, actionable)])
            write_jsonl(audit_dir / "repair_closure_matrix.jsonl", [closure_matrix_row(audit_refs, actionable)])
            write_jsonl(audit_dir / "repair_impact_matrix.jsonl", [impact_row(audit_refs, actionable)])

            report = self.validate(audit_dir, registry)

            self.assertEqual(report["errors"], [])
            self.assertEqual(report["original_repair_required_count"], 1)
            self.assertEqual(report["repair_required_count"], 0)
            self.assertEqual(report["terminal_repair_state"], "repair_validated")

    def test_effective_status_supersedes_blocked_final_report_when_no_repair_remains(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-effective", status="PASS_WITH_WARNINGS")
            (audit_dir / "FINAL_REPORT.md").write_text(
                "# Audit\n\nStatus: BLOCKED\n\n## Actionable Findings\n\nNone. `repair_required_count=0`.\n\n## Next Action\n\nNo repair.\n",
                encoding="utf-8",
            )

            report = self.validate(audit_dir, registry)
            projection = pm_audit_closure.build_effective_status_projection(audit_dir, report)

            self.assertEqual(projection["effective_status"], "PASS_WITH_WARNINGS")
            self.assertEqual(projection["repair_required_count"], 0)
            self.assertIn("FINAL_REPORT.md", projection["superseded_historical_reports"])

    def test_effective_status_supersedes_blocked_audit_report_when_closed_by_matrix(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-effective-matrix", status="BLOCKED", repair_required_count=1)
            actionable = finding_row(audit_refs, repair_required=True, level="blocker")
            write_jsonl(audit_dir / "semantic_risks.jsonl", [actionable])
            write_complete_scope(audit_dir, audit_refs, finding_keys=[actionable["finding_key"]])
            write_jsonl(registry, [registry_row(audit_refs, actionable)])
            write_jsonl(audit_dir / "repair_closure_matrix.jsonl", [closure_matrix_row(audit_refs, actionable)])
            write_jsonl(audit_dir / "repair_impact_matrix.jsonl", [impact_row(audit_refs, actionable)])

            report = self.validate(audit_dir, registry)
            projection = pm_audit_closure.build_effective_status_projection(audit_dir, report)

            self.assertEqual(projection["effective_status"], "PASS_WITH_WARNINGS")
            self.assertEqual(projection["repair_required_count"], 0)
            self.assertIn("audit_report.json", projection["superseded_historical_reports"])

    def test_audit_report_status_must_match_repair_required_count(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-status-mismatch", status="PASS", repair_required_count=1)
            actionable = finding_row(audit_refs, repair_required=True, level="blocker")
            write_jsonl(audit_dir / "semantic_risks.jsonl", [actionable])

            report = self.validate(audit_dir, registry)

            self.assertTrue(any("status must be BLOCKED" in error for error in report["errors"]))

    def test_audit_only_paths_do_not_create_subject_staleness(self) -> None:
        self.assertFalse(pm_audit_closure.has_substantive_subject_paths([
            "Plans/.audits/audit-20260619-006/FINAL_REPORT.md",
            "Plans/.audits/_semantic_closure_registry.jsonl",
        ]))
        self.assertTrue(pm_audit_closure.has_substantive_subject_paths([
            "Plans/Planning_Ledger_System.md",
        ]))
        self.assertTrue(pm_audit_closure.has_substantive_subject_paths([
            "Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/state/current.json",
        ]))

    def test_zero_actionable_validation_makes_no_changes(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-noop", status="PASS_WITH_WARNINGS")
            risk_path = audit_dir / "semantic_risks.jsonl"
            warning = finding_row(audit_refs, repair_required=False, level="observation")
            write_jsonl(risk_path, [warning])
            write_complete_scope(audit_dir, audit_refs, finding_keys=[warning["finding_key"]])
            before = {path: path.read_text(encoding="utf-8") for path in (registry, risk_path)}

            report = self.validate(audit_dir, registry)

            after = {path: path.read_text(encoding="utf-8") for path in (registry, risk_path)}
            self.assertEqual(report["errors"], [])
            self.assertEqual(report["repair_required_count"], 0)
            self.assertEqual(before, after)



# The provenance every supplemental_closure_pass record carries (T230); reviews may still be pending.
PASS_DECISION = {"decision_record": "Plans/Decision_Log.md#DL-511", "owner_unit": "Plans/Planning_Ledger_System.md#PLS-026",
                 "source": "fixture decision (test)"}
PASS_REVIEWS_PENDING = "pending: blind reviews (test)"


def replacement_identity(finding: dict, **changes) -> dict:
    """The finding's identity fields with `changes` applied, keyed deterministically."""
    row = {field: copy.deepcopy(finding[field]) for field in (
        "finding_family", "ledger_id", "source_atom_ids", "plan_unit_ids", "owner_docs", "detail_keys", "exact_tokens",
    )}
    row.setdefault("consumer_docs", [])
    row.update(changes)
    row["finding_key"] = pm_audit_closure.compute_finding_key(row)
    return row


class PmAuditClosureMatrixReplacementTests(unittest.TestCase):
    """PLS-026 (DL-511): an appended matrix row may replace one frozen row whose registry link does not hold."""

    PASS_ID = "audit-replace-supplemental-20261114"
    RECORD = "supplemental_closure_pass-20261114.json"

    def setUp(self) -> None:
        temporary = tempfile.TemporaryDirectory(prefix="pm-matrix-replace-")
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()
        self.audit_dir = self.root / "audit-replace"
        self.audit_dir.mkdir()
        self.registry = self.root / "_semantic_closure_registry.jsonl"
        self.audit_refs = refs("audit-replace")
        write_audit_report(self.audit_dir, self.audit_refs, status="BLOCKED", repair_required_count=1)
        self.finding = finding_row(self.audit_refs, repair_required=True, level="blocker")
        write_jsonl(self.audit_dir / "semantic_risks.jsonl", [self.finding])
        write_complete_scope(self.audit_dir, self.audit_refs, finding_keys=[self.finding["finding_key"]])
        write_jsonl(self.audit_dir / "repair_impact_matrix.jsonl", [impact_row(self.audit_refs, self.finding)])
        # The live registry closure has the corrected owner; the frozen matrix row still carries the old one.
        self.corrected = replacement_identity(self.finding, owner_docs=["Plans/Corrected.md"])
        self.registry_rows = [
            {**registry_row(self.audit_refs, self.corrected, "closure-old"), **self.corrected},
            {**registry_row(self.audit_refs, self.corrected, "closure-new"), **self.corrected},
        ]
        self.frozen = closure_matrix_row(self.audit_refs, self.finding)
        self.frozen["registry_closure_id"] = "closure-old"

    # -- fixture builders -------------------------------------------------------------------
    def replacing_row(self, target: int = 1, *, record: str | None = None, pass_id: str | None = None, **changes) -> dict:
        row = closure_matrix_row(self.audit_refs, self.finding)
        row.update({field: copy.deepcopy(value) for field, value in self.corrected.items()})
        row.update({
            "registry_closure_id": "closure-new",
            "closure_reason": "corrected owner routing (test)",
            "replaces_matrix_line": target,
            "replaces_row_sha256": "0" * 64,  # filled in by write()
            "replacement_reason": "the frozen row links a registry closure whose finding identity it does not share",
            "supplemental_pass": {"pass_id": pass_id or self.PASS_ID, "record": record or self.RECORD},
        })
        row.update(changes)
        return row

    @staticmethod
    def line(row: dict) -> str:
        return json.dumps(row, sort_keys=True)

    def write(self, rows: list[dict], *, frozen_rows: int = 1, records: dict[str, dict] | None = None,
              bind: bool = True, list_in_record: bool = True) -> None:
        """Write the matrix and pass record(s). With `bind`, each replacing row gets the SHA-256 of the
        line it names. Each record pins the first `frozen_rows` lines (or its own `frozen_rows`)."""
        lines: list[str] = []
        for row in rows:
            if bind and "replaces_matrix_line" in row and isinstance(row["replaces_matrix_line"], int) \
                    and 0 < row["replaces_matrix_line"] <= len(lines):
                row["replaces_row_sha256"] = pm_audit_closure.sha256_text(lines[row["replaces_matrix_line"] - 1])
            lines.append(self.line(row))
        (self.audit_dir / "repair_closure_matrix.jsonl").write_text("".join(text + "\n" for text in lines), encoding="utf-8")
        write_jsonl(self.registry, self.registry_rows)
        records = records if records is not None else {self.RECORD: {"pass_id": self.PASS_ID, "frozen_rows": frozen_rows}}
        for name, spec in records.items():
            pinned = spec["frozen_rows"]
            closures = []
            for index, row in enumerate(rows, 1):
                if list_in_record and row.get("supplemental_pass", {}).get("record") == name and "replaces_matrix_line" in row:
                    closures.append({
                        "appended_line": index,
                        "appended_row_sha256": pm_audit_closure.sha256_text(lines[index - 1]),
                        "replaces_matrix_line": row["replaces_matrix_line"],
                    })
            (self.audit_dir / name).write_text(json.dumps({
                "schema_id": "pm.audit_supplemental_closure_pass.v1",
                "pass_id": spec["pass_id"],
                "audit_id": "audit-replace",
                "decision": PASS_DECISION,
                "reviews": PASS_REVIEWS_PENDING,
                "matrix": {
                    "path": "repair_closure_matrix.jsonl",
                    "original_rows": pinned,
                    "original_sha256": pm_audit_closure.sha256_text("".join(text + "\n" for text in lines[:pinned])),
                },
                "closures": closures,
            }, sort_keys=True), encoding="utf-8")

    def validate(self) -> dict:
        return pm_audit_closure.validate_audit_dir(
            self.audit_dir, require_matrix=True, require_effective_status=False,
            source_artifacts=None, registry_path=self.registry,
        )

    def frozen_link_error(self, report: dict) -> bool:
        return any(":1: registry row finding_key does not match matrix finding_key" in error for error in report["errors"])

    def refusals(self, report: dict) -> list[str]:
        return [error for error in report["errors"] if "does not replace" in error or "more than one replacing row" in error]

    # -- the rules --------------------------------------------------------------------------
    def test_unreplaced_bad_frozen_link_still_fails(self) -> None:
        self.write([self.frozen])
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report), report["errors"])
        self.assertNotIn("matrix_replacements", report)

    def test_valid_replacement_is_judged_instead_of_the_frozen_link(self) -> None:
        frozen_line = self.line(self.frozen)
        self.write([self.frozen, self.replacing_row()])
        report = self.validate()
        self.assertEqual(report["errors"], [])
        self.assertEqual(report["matrix_replacements"], [{"replaced_line": 1, "replacing_line": 2}])
        # The frozen row stays as history, and the replacement adds no second closure.
        self.assertEqual((self.audit_dir / "repair_closure_matrix.jsonl").read_text(encoding="utf-8").split("\n")[0], frozen_line)
        self.assertEqual(report["status_counts"], {"repaired": 1})
        self.assertEqual(report["repair_required_count"], 0)
        self.assertEqual(report["terminal_repair_state"], "repair_validated")

    def test_replacement_of_an_unknown_line_is_refused(self) -> None:
        self.write([self.frozen, self.replacing_row(target=7)])
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("line 7 is not a matrix row" in error for error in self.refusals(report)), report["errors"])

    def test_replacing_row_inside_the_pinned_prefix_is_refused(self) -> None:
        # A record that pins line 2 as frozen makes line 2 history, not an appended correction.
        self.write([self.frozen, self.replacing_row(target=1)], frozen_rows=2)
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("must be appended after the 2 frozen rows" in error for error in self.refusals(report)))

    def test_replacement_of_a_line_after_the_pinned_prefix_is_refused(self) -> None:
        appended = closure_matrix_row(self.audit_refs, self.finding)
        appended["registry_closure_id"] = "closure-old"
        self.write([self.frozen, appended, self.replacing_row(target=2)])
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("line 2 is not one of the 1 frozen rows" in error for error in self.refusals(report)), report["errors"])
        self.assertNotIn("matrix_replacements", report)

    def test_replacement_of_a_non_frozen_row_is_refused(self) -> None:
        appended = closure_matrix_row(self.audit_refs, self.finding)
        appended.update({"registry_closure_id": "closure-old",
                         "supplemental_pass": {"pass_id": "earlier-pass", "record": "supplemental_closure_pass-20261105.json"}})
        self.write([appended, self.replacing_row(target=1)])
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("is an appended or replacing row" in error for error in self.refusals(report)), report["errors"])

    def test_duplicate_replacements_are_refused(self) -> None:
        self.write([self.frozen, self.replacing_row(), self.replacing_row(closure_reason="second correction (test)")])
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("is named by more than one replacing row (lines 2, 3)" in error for error in self.refusals(report)))
        self.assertNotIn("matrix_replacements", report)

    def test_a_replacement_is_never_itself_replaced(self) -> None:
        # A later pass that pins the first replacement as part of its own prefix still cannot replace it.
        later = "supplemental_closure_pass-20261115.json"
        rows = [self.frozen, self.replacing_row(), self.replacing_row(target=2, record=later, pass_id="later-pass")]
        self.write(rows, records={self.RECORD: {"pass_id": self.PASS_ID, "frozen_rows": 1},
                                  later: {"pass_id": "later-pass", "frozen_rows": 2}})
        report = self.validate()
        self.assertTrue(any(":3: does not replace" in error and "never itself replaced" in error for error in report["errors"]))
        # The first replacement still holds; the chain adds nothing.
        self.assertFalse(self.frozen_link_error(report))
        self.assertEqual(report["matrix_replacements"], [{"replaced_line": 1, "replacing_line": 2}])

    def test_replacing_row_whose_own_link_does_not_hold_is_not_honored(self) -> None:
        self.registry_rows[1]["closed_by_audit_id"] = "another-audit"
        self.registry_rows[1]["audit_ids"] = ["another-audit"]
        self.write([self.frozen, self.replacing_row()])
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any(":2: does not replace line 1" in error and "own registry link does not hold" in error
                            for error in report["errors"]), report["errors"])
        self.assertTrue(any(":2: registry row closed_by_audit_id does not match" in error for error in report["errors"]))
        self.assertNotIn("matrix_replacements", report)

    def test_replacing_row_whose_identity_differs_from_its_registry_closure_is_not_honored(self) -> None:
        # Same finding_key string on both rows, but one side's identity gives another deterministic key.
        for side in ("matrix", "registry"):
            with self.subTest(side=side):
                self.registry_rows[1] = {**registry_row(self.audit_refs, self.corrected, "closure-new"), **self.corrected}
                if side == "registry":
                    self.registry_rows[1]["owner_docs"] = ["Plans/Other.md"]
                    replacing = self.replacing_row()
                else:
                    replacing = self.replacing_row(owner_docs=["Plans/Other.md"])
                self.write([self.frozen, replacing])
                report = self.validate()
                self.assertTrue(self.frozen_link_error(report))
                self.assertTrue(any("own registry link does not hold" in error for error in report["errors"]), report["errors"])
                self.assertNotIn("matrix_replacements", report)

    def test_replacement_must_bind_the_frozen_bytes(self) -> None:
        self.write([self.frozen, self.replacing_row()], bind=False)
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("does not match the exact bytes of line 1" in error for error in self.refusals(report)))

    def test_replacement_must_be_listed_in_its_pass_record(self) -> None:
        self.write([self.frozen, self.replacing_row()], list_in_record=False)
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("must list this replacement once" in error for error in self.refusals(report)))

    def test_replacement_needs_its_pass_record(self) -> None:
        self.write([self.frozen, self.replacing_row()], records={})
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("is missing or reached through a symbolic link" in error for error in self.refusals(report)))

    def test_pass_record_must_pin_the_frozen_prefix(self) -> None:
        self.write([self.frozen, self.replacing_row()])
        record_path = self.audit_dir / self.RECORD
        record = json.loads(record_path.read_text(encoding="utf-8"))
        record["matrix"]["original_sha256"] = "f" * 64
        record_path.write_text(json.dumps(record), encoding="utf-8")
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("are not the bytes its supplemental pass record pinned" in error for error in self.refusals(report)))

    def test_crlf_rewrite_of_the_pinned_prefix_is_refused(self) -> None:
        # Review r1 finding 1 (T220): the pinned prefix and line digests bind exact bytes, not LF-normalized text.
        self.write([self.frozen, self.replacing_row()])
        self.assertEqual(self.validate()["errors"], [])
        matrix = self.audit_dir / "repair_closure_matrix.jsonl"
        matrix.write_bytes(matrix.read_bytes().replace(b"\n", b"\r\n"))
        report = self.validate()
        self.assertNotIn("matrix_replacements", report)
        self.assertTrue(any("are not the bytes its supplemental pass record pinned" in error for error in self.refusals(report)),
                        report["errors"])

    def test_replacement_keeps_the_source_row_and_closure_status(self) -> None:
        for changes, expected in (({"source_row": 2}, "must close the same source row as line 1"),
                                  ({"closure_status": "false_positive"}, "must keep the closure_status of line 1")):
            with self.subTest(changes=changes):
                if "closure_status" in changes:
                    self.registry_rows[1]["closure_status"] = "false_positive"
                self.write([self.frozen, self.replacing_row(**changes)])
                report = self.validate()
                self.assertTrue(self.frozen_link_error(report))
                self.assertTrue(any(expected in error for error in self.refusals(report)), report["errors"])
                self.registry_rows[1]["closure_status"] = "repaired"

    def test_replacement_fields_need_a_reason(self) -> None:
        self.write([self.frozen, self.replacing_row(replacement_reason=" ")])
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("replacement_reason must be non-empty" in error for error in self.refusals(report)))

    def test_lone_cr_row_separator_is_refused_without_crashing(self) -> None:
        # T228 (pls026 review r2): a lone CR splits rows for read_jsonl but not for the LF byte split.
        self.write([self.frozen, self.replacing_row()])
        matrix = self.audit_dir / "repair_closure_matrix.jsonl"
        matrix.write_bytes(matrix.read_bytes().replace(b"\n", b"\r", 1))
        report = self.validate()
        self.assertNotIn("matrix_replacements", report)
        self.assertTrue(self.frozen_link_error(report), report["errors"])
        self.assertTrue(any("separates rows with a lone CR" in error for error in report["errors"]), report["errors"])

    def test_replacement_cannot_borrow_an_unrelated_finding_identity(self) -> None:
        # T229 (pls026 Astra max finding 1, Sol max finding 2): another finding's complete, self-consistent
        # identity and closure, closed by the same audit, is not a correction of this finding.
        unrelated = replacement_identity(self.finding, finding_family="owner_routing", detail_keys=["heading_lineage"],
                                         owner_docs=["Plans/Planning_Ledger_System.md"], plan_unit_ids=["PLS-012"])
        self.registry_rows.append({**registry_row(self.audit_refs, unrelated, "closure-unrelated-002"), **unrelated})
        self.write([self.frozen, self.replacing_row(**unrelated, registry_closure_id="closure-unrelated-002")])
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report), report["errors"])
        self.assertNotIn("matrix_replacements", report)
        self.assertTrue(any("may change only the owner fields" in error and "detail_keys" in error and "finding_family" in error
                            for error in self.refusals(report)), report["errors"])

    def test_pass_record_needs_its_pass_id_and_provenance(self) -> None:
        # T230 (pls026 Sol max finding 1): absent or null pass IDs never match, and a record names its decision
        # and reviews. A pending review state is a recorded state.
        def row_without_pass_id(row: dict) -> None:
            row["supplemental_pass"].pop("pass_id")

        def row_with_null_pass_id(row: dict) -> None:
            row["supplemental_pass"]["pass_id"] = None

        cases = {
            "pass_id absent on both sides": (row_without_pass_id, lambda record: record.pop("pass_id"), "pass_id"),
            "pass_id null on both sides": (row_with_null_pass_id, lambda record: record.update(pass_id=None), "pass_id"),
            "record decision absent": (None, lambda record: record.pop("decision"), "must record its decision"),
            "record decision source null": (None, lambda record: record["decision"].update(source=None), "must record its decision"),
            "record reviews absent": (None, lambda record: record.pop("reviews"), "must record its reviews"),
            "record reviews blank": (None, lambda record: record.update(reviews=" "), "must record its reviews"),
        }
        for name, (change_row, change_record, expected) in cases.items():
            with self.subTest(case=name):
                replacing = self.replacing_row()
                if change_row:
                    change_row(replacing)
                self.write([self.frozen, replacing])
                record_path = self.audit_dir / self.RECORD
                record = json.loads(record_path.read_text(encoding="utf-8"))
                change_record(record)
                record_path.write_text(json.dumps(record), encoding="utf-8")
                report = self.validate()
                self.assertTrue(self.frozen_link_error(report), report["errors"])
                self.assertNotIn("matrix_replacements", report)
                self.assertTrue(any(expected in error for error in self.refusals(report)), report["errors"])
        for reviews in (PASS_REVIEWS_PENDING, {"sol": "PASS"}, [{"model": "astra", "verdict": "PASS"}]):
            with self.subTest(reviews=reviews):
                self.write([self.frozen, self.replacing_row()])
                record_path = self.audit_dir / self.RECORD
                record = json.loads(record_path.read_text(encoding="utf-8"))
                record["reviews"] = reviews
                record_path.write_text(json.dumps(record), encoding="utf-8")
                self.assertEqual(self.validate()["errors"], [])

    def test_pass_record_reviews_need_real_entries(self) -> None:
        # T233 (tool-notes reviews, T230 follow-up): a non-empty container is not provenance by itself; every
        # entry records a review or a pending state.
        def with_reviews(reviews: object) -> dict:
            self.write([self.frozen, self.replacing_row()])
            record_path = self.audit_dir / self.RECORD
            record = json.loads(record_path.read_text(encoding="utf-8"))
            record["reviews"] = reviews
            record_path.write_text(json.dumps(record), encoding="utf-8")
            return self.validate()

        refused = {
            "nested null in a list": [None],
            "nested null in an object": {"sol": None},
            "nested blank in a list": [" "],
            "nested blank in an object": {"sol": "\t"},
            "nested empty object": {"sol": {}},
            "nested empty list": {"sol": []},
            "deeper null": [{"model": "astra", "verdict": None}],
            "deeper blank": {"evidence": [{"model": "sol", "verdict": "PASS"}, {"model": " "}]},
            "one real entry beside a null one": {"sol": "PASS", "astra": None},
        }
        for name, reviews in refused.items():
            with self.subTest(refused=name):
                report = with_reviews(reviews)
                self.assertTrue(self.frozen_link_error(report), report["errors"])
                self.assertNotIn("matrix_replacements", report)
                self.assertTrue(any("must record its reviews" in error for error in self.refusals(report)), report["errors"])
        # The committed forms: a pending state, a completed summary string, and audit-004's recorded object.
        accepted = {
            "pending state": PASS_REVIEWS_PENDING,
            "completed summary": "Sol and Astra blind reviews are listed on the decision record (test).",
            "object of strings": {"sol": "PASS"},
            "list of objects": [{"model": "astra", "verdict": "PASS"}],
            "recorded object with evidence": {
                "decision_ref": "Plans/Decision_Log.md#DL-470",
                "evidence": [{"assessment": "Supplemental closure assessment (test).", "model": "Sol 6.1 max",
                              "overall_verdict": "FAIL", "path": "/reviews/V2-sol-r1.md",
                              "reviewed_commit": "6" * 40, "sha256": "4" * 64}],
                "original_recorded_state": "pending: Sol 6.1 max, then Astra max, blind (test)",
                "prior_record_sha256": "1" * 64,
                "recorded_at_utc": "2026-11-08T23:25:11Z",
                "recorded_by": "closure-q2-audit004",
                "scope": "Existing blind reviews (test).",
            },
            # T238: a number or boolean may sit in the same object as real review text.
            "numeric metadata beside review text": {"sol": "PASS", "round": 2},
            "boolean and numeric metadata inside a review record": {
                "sol": {"verdict": "PASS", "score": 0, "blocking": False},
            },
        }
        for name, reviews in accepted.items():
            with self.subTest(accepted=name):
                report = with_reviews(reviews)
                self.assertEqual(report["errors"], [])
                self.assertEqual(report["matrix_replacements"], [{"replaced_line": 1, "replacing_line": 2}])

    def test_pass_record_reviews_reject_numeric_and_boolean_leaves(self) -> None:
        # T238: reviews=[false], {"sol": 0}, [1] and {"pending": true} are not provenance.
        # A number or boolean counts only as metadata inside a record that already has review text.
        def with_reviews(reviews: object) -> dict:
            self.write([self.frozen, self.replacing_row()])
            record_path = self.audit_dir / self.RECORD
            record = json.loads(record_path.read_text(encoding="utf-8"))
            record["reviews"] = reviews
            record_path.write_text(json.dumps(record), encoding="utf-8")
            return self.validate()

        refused = {
            "boolean list": [False],
            "numeric reviewer": {"sol": 0},
            "numeric list": [1],
            "boolean pending flag": {"pending": True},
        }
        for name, reviews in refused.items():
            with self.subTest(refused=name):
                report = with_reviews(reviews)
                self.assertTrue(self.frozen_link_error(report), report["errors"])
                self.assertNotIn("matrix_replacements", report)
                self.assertTrue(any("must record its reviews" in error for error in self.refusals(report)), report["errors"])

    def test_invalid_second_claim_still_withholds_the_replacement(self) -> None:
        # T237 (tool-notes Sol max finding 2): PLS-026 lets no other row name a replaced frozen line, so a
        # second claimant counts even when its own row is invalid.
        invalid = self.replacing_row(closure_reason="second correction (test)")
        invalid.pop("closure_evidence")
        self.write([self.frozen, self.replacing_row(), invalid])
        report = self.validate()
        self.assertNotIn("matrix_replacements", report)
        self.assertTrue(self.frozen_link_error(report), report["errors"])
        self.assertTrue(any("is named by more than one replacing row (lines 2, 3)" in error for error in self.refusals(report)),
                        report["errors"])
        # The invalid claimant's own refusal still stands.
        self.assertTrue(any(":3: does not replace" in error and "missing required fields ['closure_evidence']" in error
                            for error in report["errors"]), report["errors"])

    def test_schema_invalid_replacing_row_is_not_honored(self) -> None:
        # T231 (pls026 Sol max finding 3): a replacing row that fails its own row checks replaces nothing.
        cases = {
            "closure_evidence absent": ({}, ("closure_evidence",), "missing required fields ['closure_evidence']"),
            "closure_reason blank": ({"closure_reason": " "}, (), "closure_reason must be non-empty"),
            "baseline_ref absent": ({}, ("baseline_ref",), "missing required ref field baseline_ref"),
            "owner_docs not a list": ({"owner_docs": "Plans/Corrected.md"}, (), "owner_docs must be a list"),
            "evidence missing": ({"closure_evidence": ["Plans/Missing-evidence.md"]}, (), "missing evidence ref"),
        }
        for name, (changes, removed, expected) in cases.items():
            with self.subTest(case=name):
                replacing = self.replacing_row(**changes)
                for field in removed:
                    replacing.pop(field)
                self.write([self.frozen, replacing])
                report = self.validate()
                self.assertTrue(self.frozen_link_error(report), report["errors"])
                self.assertNotIn("matrix_replacements", report)
                self.assertTrue(any("must meet the full matrix-row schema" in error and expected in error
                                    for error in self.refusals(report)), report["errors"])
                # The row's own diagnostics still stand as before.
                self.assertTrue(any(":2: " in error and expected in error and "does not replace" not in error
                                    for error in report["errors"]), report["errors"])


class PmAuditClosureLegacyReplacementCoverageTests(unittest.TestCase):
    """A replacing row stands in for its frozen row: it adds no over-coverage of a non-actionable source row."""

    NAME = "audit-20260617-099-replacement-coverage"

    def setUp(self) -> None:
        temporary = tempfile.TemporaryDirectory(prefix="pm-matrix-replace-legacy-")
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()
        patcher = patch.object(pm_audit_closure, "ROOT", self.root)
        patcher.start()
        self.addCleanup(patcher.stop)
        frozen_files = ["audit_report.json", "repair_closure_matrix.jsonl", "semantic_risks.jsonl"]
        patcher = patch.object(pm_audit_closure, "legacy_audit_state",
                               lambda audit_dir: {"historical_matrix_lines": 1, "frozen_files": list(frozen_files)})
        patcher.start()
        self.addCleanup(patcher.stop)
        self.audit_dir = self.root / "Plans" / ".audits" / self.NAME
        self.audit_dir.mkdir(parents=True)
        self.registry = self.root / "Plans" / ".audits" / "_semantic_closure_registry.jsonl"
        self.audit_refs = refs(self.NAME)
        write_audit_report(self.audit_dir, self.audit_refs, status="PASS_WITH_WARNINGS", repair_required_count=0)
        # A June-style row: neither repair_required nor finding_level, so the inference judges it (non-actionable).
        source = {**self.audit_refs, "classification": "source_lineage_only", "finding_family": "test_family",
                  "source_atom_ids": ["atom-0001"], "plan_unit_ids": ["PU-001"], "owner_docs": ["Plans/Test.md"],
                  "detail_keys": ["detail"], "exact_tokens": ["token"]}
        source["finding_key"] = pm_audit_closure.compute_finding_key(source)
        write_jsonl(self.audit_dir / "semantic_risks.jsonl", [source])
        write_complete_scope(self.audit_dir, self.audit_refs, finding_keys=[source["finding_key"]])
        self.source = source
        self.corrected = replacement_identity(source, owner_docs=["Plans/Corrected.md"])

    def run_case(self, appended: dict | None) -> dict:
        frozen = closure_matrix_row(self.audit_refs, self.source)
        frozen["registry_closure_id"] = "closure-old"
        frozen_line = json.dumps(frozen, sort_keys=True)
        lines = [frozen_line]
        if appended is not None:
            if "replaces_matrix_line" in appended:
                appended["replaces_row_sha256"] = pm_audit_closure.sha256_text(frozen_line)
            lines.append(json.dumps(appended, sort_keys=True))
        (self.audit_dir / "repair_closure_matrix.jsonl").write_text("".join(text + "\n" for text in lines), encoding="utf-8")
        (self.audit_dir / "supplemental_closure_pass-20261114.json").write_text(json.dumps({
            "schema_id": "pm.audit_supplemental_closure_pass.v1",
            "pass_id": "legacy-replace-pass",
            "audit_id": self.NAME,
            "decision": PASS_DECISION,
            "reviews": PASS_REVIEWS_PENDING,
            "matrix": {"path": "repair_closure_matrix.jsonl", "original_rows": 1,
                       "original_sha256": pm_audit_closure.sha256_text(frozen_line + "\n")},
            "closures": [{"appended_line": 2, "appended_row_sha256": pm_audit_closure.sha256_text(lines[-1]),
                          "replaces_matrix_line": 1}] if len(lines) == 2 else [],
        }), encoding="utf-8")
        write_jsonl(self.registry, [
            {**registry_row(self.audit_refs, self.corrected, closure_id), **self.corrected}
            for closure_id in ("closure-old", "closure-new")
        ])
        return pm_audit_closure.validate_audit_dir(
            self.audit_dir, require_matrix=True, require_effective_status=False,
            source_artifacts=["semantic_risks.jsonl"], registry_path=self.registry,
        )

    def corrected_row(self, **extra) -> dict:
        row = closure_matrix_row(self.audit_refs, self.source)
        row.update({field: copy.deepcopy(value) for field, value in self.corrected.items()})
        row.update({"registry_closure_id": "closure-new", "closure_reason": "corrected (test)",
                    "supplemental_pass": {"pass_id": "legacy-replace-pass", "record": "supplemental_closure_pass-20261114.json"}})
        row.update(extra)
        return row

    def over_coverage_kept(self, report: dict) -> bool:
        return any("non-actionable source rows" in error for error in report["errors"])

    def test_replacing_row_adds_no_over_coverage(self) -> None:
        before = self.run_case(None)
        self.assertFalse(self.over_coverage_kept(before), before["errors"])
        self.assertEqual(before["legacy_format_rule"]["demoted_by_kind"].get("inferred_actionability_over_coverage"), 1)
        self.assertTrue(any(":1: registry row finding_key does not match" in error for error in before["errors"]))

        replaced = self.run_case(self.corrected_row(replaces_matrix_line=1, replacement_reason="corrected owner (test)"))
        self.assertEqual(replaced["errors"], [])
        self.assertEqual(replaced["matrix_replacements"], [{"replaced_line": 1, "replacing_line": 2}])
        self.assertEqual(replaced["legacy_format_rule"]["demoted_by_kind"].get("inferred_actionability_over_coverage"), 1)

        # The same row appended without naming the frozen row is a second, newer closure: over-coverage is kept.
        appended = self.run_case(self.corrected_row())
        self.assertTrue(self.over_coverage_kept(appended), appended["errors"])


class PmAuditStatusIndexOpenSetTests(unittest.TestCase):
    """T235 (tool-notes Astra max finding 1): the status index lists the closure validator's open set.

    The real case: registry row 1203 is reopened, and its closing re-audit successor, row 1218, went
    stale when a `#pydef=` anchor in its closure evidence changed. The last row of that finding is
    the closed row 1218, so a latest-row-per-finding index, which PLS-025 forbids, drops the finding,
    while the closure validator keeps 1203 open. Rows 1-3 of this fixture have that shape."""

    FIXTURE_SCRIPT = "def f():\n    return 2\n"

    def setUp(self) -> None:
        temporary = tempfile.TemporaryDirectory(prefix="pm-status-index-")
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()
        for module in (pm_audit_closure, pm_audit_status_index):
            root_patch = patch.object(module, "ROOT", self.root)
            root_patch.start()
            self.addCleanup(root_patch.stop)
        audits = self.root / "Plans/.audits"
        self.audit_dir = audits / "reaudit-fixture"
        (self.audit_dir / "reviews").mkdir(parents=True)
        (self.root / "scripts").mkdir()
        self.registry = audits / "_semantic_closure_registry.jsonl"
        for name, value in (("AUDITS", audits), ("REGISTRY", self.registry), ("INDEX", audits / "_audit_status_index.json"),
                            ("MARKDOWN", audits / "CURRENT_AUDIT_STATUS.md")):
            path_patch = patch.object(pm_audit_status_index, name, value)
            path_patch.start()
            self.addCleanup(path_patch.stop)
        # The index reads the open set from this test's closure module, whose ROOT is the fixture.
        validator_patch = patch.object(pm_audit_status_index, "closure_validator", lambda: pm_audit_closure, create=True)
        validator_patch.start()
        self.addCleanup(validator_patch.stop)
        report_dir = audits / "audit-fixture"
        report_dir.mkdir()
        (report_dir / "FINAL_REPORT.md").write_text("# Fixture audit\n\nStatus: BLOCKED\n", encoding="utf-8")
        (self.root / "Plans/Fixture.md").write_text(pm_audit_closure.SELF_TEST_DOC, encoding="utf-8")
        self.script = self.root / "scripts/fixture.py"
        self.script.write_text(self.FIXTURE_SCRIPT, encoding="utf-8")
        self.unit_ref = "Plans/Fixture.md#unit=FIX-001"
        self.pydef_ref = "scripts/fixture.py#pydef=f"
        self.quote = "The fixture repair is present and must stay present."
        self.counter = 0
        self.git("init", "-q")

    def git(self, *args: str) -> str:
        return subprocess.run(
            ["git", "-C", str(self.root), "-c", "user.name=fixture", "-c", "user.email=fixture@invalid",
             "-c", "commit.gpgsign=false", *args],
            check=True, capture_output=True, text=True,
        ).stdout.strip()

    def commit(self) -> str:
        self.git("add", "-A")
        self.git("commit", "-q", "--allow-empty", "-m", "fixture state")
        return self.git("rev-parse", "HEAD")

    def reaudit(self, rows_before: list[dict], line: int, verdict: str, *, dependencies: list[str],
                evidence: list[dict], status_now: str | None = None) -> dict:
        """A complete, valid re-audit row of `line`, with committed receipts (as the self-test builds them)."""
        m = pm_audit_closure
        pm_audit_closure.write_jsonl(self.registry, rows_before)
        lines = m.raw_registry_lines(self.registry)
        target = rows_before[line - 1]
        resolver = m.AnchorResolver(self.root)
        self.counter += 1
        records = self.audit_dir / f"reaudit_records-{self.counter}.jsonl"
        recheck = self.commit()
        record = {
            "schema_id": m.REAUDIT_RECORD_SCHEMA, "reaudit_id": "reaudit-fixture",
            "closure_id": target["closure_id"], "line": line, "row_sha256": m.sha256_text(lines[line]),
            "recheck_commit": recheck, "verdict": verdict,
            "claim": "The fixture repair is present in FIX-001.",
            "rationale": "FIX-001 canonical_text states the repair.",
            "dependencies": dependencies, "evidence": evidence,
            "fix": {"kind": "small_in_scope", "description": "restore it"} if verdict == "not_supported" else None,
            "status_now": status_now, "later_closure_id": None,
            "dependency_hashes_at_recheck": {ref: resolver.sha256(ref) for ref in dependencies},
        }
        stale = [{"group": g, "ref": r, "stored": h}
                 for g, r, h in sorted(m._target_stale_refs(target, m.CommitResolver(self.root, recheck)))]
        record["stale_hashes_at_recheck"] = stale
        record["stale_ref_dispositions"] = [
            {"ref": ref, "disposition": "dependency", "anchors": [self.unit_ref]} for ref in sorted({s["ref"] for s in stale})
        ]
        extra = {"status_now": status_now} if status_now else {}
        reviews = {}
        for who in m.REAUDIT_REVIEWERS:
            judged = {"line": line, "closure_id": target["closure_id"], "verdict": verdict, **extra}
            review: dict = {"model": f"fixture-{who}", "verdict": verdict}
            if who == "worker":
                judged.update({k: record.get(k) for k in m.REAUDIT_WORKER_FIELDS})
                judged.update(row_sha256=record["row_sha256"], dependencies=list(dependencies), verdict=verdict,
                              recheck_commit=recheck, dependency_hashes_at_recheck=dict(record["dependency_hashes_at_recheck"]))
            else:
                shown = {"line": line, "closure_id": target["closure_id"],
                         "claim": {k: v for k, v in target.items() if k not in ("hashes", "_line_no")},
                         "row_sha256": record["row_sha256"], "recheck_commit": recheck,
                         "dependency_anchors": [{"ref": ref, "sha256": record["dependency_hashes_at_recheck"][ref],
                                                 "text": resolver.content(ref)[1], "truncated": False} for ref in dependencies]}
                shown["packet_row_digest"] = m.packet_row_digest(shown)
                packet = self.audit_dir / "reviews" / f"packet-{who}-{self.counter}.jsonl"
                packet.write_text(json.dumps(shown) + "\n", encoding="utf-8")
                review.update(packet_path=m.rel(packet), packet_sha256=m.sha256_file(packet))
                judged["packet_row_digest"] = shown["packet_row_digest"]
            output = self.audit_dir / "reviews" / f"{who}-{self.counter}.jsonl"
            output.write_text(json.dumps(judged) + "\n", encoding="utf-8")
            review.update(evidence_path=m.rel(output), evidence_sha256=m.sha256_file(output))
            reviews[who] = review
        record["reviews"] = reviews
        row = m.build_reaudit_row(target, line, lines[line], record, m.rel(records), resolver, "2026-11-04T00:00:00Z")
        records.write_text(json.dumps(record, sort_keys=True) + "\n", encoding="utf-8")
        self.commit()  # receipts count only once committed, after the recheck commit they judge
        return row

    def reopened_chain(self) -> list[dict]:
        """Line 1 closed; line 2 reopens it (like row 1203); line 3 closes it again (like row 1218),
        with the closure evidence it read anchored on scripts/fixture.py#pydef=f."""
        legacy = pm_audit_closure._self_test_registry_row(hashes={
            "owner_evidence_hashes": {"Plans/Fixture.md": "0" * 64},
            "closure_evidence_hashes": {"Plans/Fixture.md": "0" * 64},
        })
        reopened = self.reaudit([legacy], 1, "not_supported", dependencies=[self.unit_ref],
                                evidence=[{"ref": self.unit_ref, "absent": "a phrase the claim needs"}])
        closing = self.reaudit([legacy, reopened], 2, "resolved_differently", status_now="repaired",
                               dependencies=[self.unit_ref, self.pydef_ref],
                               evidence=[{"ref": self.unit_ref, "quote": self.quote}])
        rows = [legacy, reopened, closing]
        pm_audit_closure.write_jsonl(self.registry, rows)
        self.commit()
        return rows

    def generate(self) -> None:
        with patch.object(sys, "argv", ["pm-audit-status-index.py", "generate"]), contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(pm_audit_status_index.main(), 0)

    def test_stale_closing_successor_keeps_the_reopened_finding_open(self) -> None:
        rows = self.reopened_chain()
        closure = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual((closure["errors"], closure["open_rows"]), ([], []), closure)
        self.assertEqual(pm_audit_status_index.build_index()["summary"]["current_blocker_count"], 0)
        self.generate()
        self.assertEqual(pm_audit_status_index.validate()["status"], "pass")

        # The closing successor's anchored evidence changes, as matrix_replacement_candidates did for row 1218.
        self.script.write_text(self.FIXTURE_SCRIPT.replace("return 2", "return 3"), encoding="utf-8")
        closure = pm_audit_closure.validate_registry(self.registry)
        self.assertTrue(closure["errors"] and all(":3:" in error and self.pydef_ref in error and "is stale" in error
                                                  for error in closure["errors"]), closure["errors"])
        self.assertEqual([(row["line"], row["closure_status"]) for row in closure["open_rows"]], [(2, "reopened")])
        # The finding's last row is the closed line 3; the open set still holds line 2.
        self.assertEqual(rows[-1]["closure_status"], "repaired")

        index = pm_audit_status_index.build_index()
        self.assertEqual(index["summary"]["current_blocker_count"], len(closure["open_rows"]))
        self.assertEqual(index["summary"]["current_open_finding_count"], 1)
        self.assertEqual(index["summary"]["current_reopened_finding_count"], 1)
        self.assertEqual([(f["line"], f["closure_id"], f["closure_status"]) for f in index["active_open_findings"]],
                         [(2, rows[1]["closure_id"], "reopened")])
        # The index generated before the staleness no longer validates; regenerated, it does.
        stale = pm_audit_status_index.validate()
        self.assertEqual(stale["status"], "fail")
        self.assertIn({"path": "Plans/.audits/_audit_status_index.json", "error": "stale_audit_status_index"}, stale["failures"])
        self.generate()
        current = pm_audit_status_index.validate()
        self.assertEqual((current["status"], current["failures"]), ("pass", []), current)
        self.assertEqual(current["summary"]["current_open_finding_count"], current["closure_validator_open_finding_count"])
        markdown = pm_audit_status_index.MARKDOWN.read_text(encoding="utf-8")
        self.assertIn("- Open finding blockers: 1", markdown)
        self.assertIn(f"| `{rows[1]['finding_key']}` | `{rows[1]['closure_id']}` | `reopened` | 2 |", markdown)

        # With the anchored text back, the closing leaf is current again and the finding closes.
        self.script.write_text(self.FIXTURE_SCRIPT, encoding="utf-8")
        self.assertEqual(pm_audit_status_index.build_index()["summary"]["current_open_finding_count"], 0)

    def test_markdown_counts_and_open_finding_rows_must_match_the_render(self) -> None:
        # T239: changed blocker counts, or an omitted open-finding line, fail. Only the generation-time
        # line may differ from render_markdown of the validated index.
        rows = self.reopened_chain()
        self.script.write_text(self.FIXTURE_SCRIPT.replace("return 2", "return 3"), encoding="utf-8")
        self.generate()
        current = pm_audit_status_index.validate()
        self.assertEqual((current["status"], current["failures"]), ("pass", []), current)
        path = pm_audit_status_index.MARKDOWN
        original = path.read_text(encoding="utf-8")
        finding = f"| `{rows[1]['finding_key']}` | `{rows[1]['closure_id']}` | `reopened` | 2 |"
        self.assertEqual(original.count(finding), 1)

        def expect_markdown_failure(text: str) -> None:
            path.write_text(text, encoding="utf-8")
            report = pm_audit_status_index.validate()
            self.assertEqual(report["status"], "fail", report)
            self.assertIn(
                {"path": "Plans/.audits/CURRENT_AUDIT_STATUS.md", "error": "stale_current_audit_status_markdown"},
                report["failures"],
            )
            self.assertFalse(any(item.get("error") == "stale_audit_status_index" for item in report["failures"]), report)

        counted = original
        for label in ("Current blockers", "Open finding blockers", "Reopened finding blockers"):
            before = counted
            counted = counted.replace(f"- {label}: 1\n", f"- {label}: 0\n", 1)
            self.assertNotEqual(before, counted, label)
        with self.subTest(case="changed counts"):
            expect_markdown_failure(counted)
        with self.subTest(case="omitted open-finding line"):
            expect_markdown_failure(original.replace(finding + "\n", "", 1))
        shifted = "".join(
            "- Generated: `1999-01-01T00:00:00Z`\n" if line.startswith("- Generated: `") else line
            for line in original.splitlines(keepends=True)
        )
        self.assertNotEqual(shifted, original)
        with self.subTest(case="generation time only"):
            path.write_text(shifted, encoding="utf-8")
            report = pm_audit_status_index.validate()
            self.assertEqual((report["status"], report["failures"]), ("pass", []), report)

    def test_multiline_generation_block_cannot_hide_counts_or_findings(self) -> None:
        # T240: the generation-time exception covers one physical line. A multi-line "Generated"
        # value whose unclosed HTML comment hides the real counts and finding rows must fail,
        # not normalize to the placeholder.
        rows = self.reopened_chain()
        self.script.write_text(self.FIXTURE_SCRIPT.replace("return 2", "return 3"), encoding="utf-8")
        self.generate()
        self.assertEqual(pm_audit_status_index.validate()["status"], "pass")
        path = pm_audit_status_index.MARKDOWN
        original = path.read_text(encoding="utf-8")
        finding = f"| `{rows[1]['finding_key']}` | `{rows[1]['closure_id']}` | `reopened` | 2 |"
        self.assertEqual(original.count(finding), 1)
        injection = (
            "- Generated: `1999-01-01T00:00:00Z\n"
            "\n"
            "## Current status: all findings closed\n"
            "\n"
            "- Current blockers: 0\n"
            "- Open finding blockers: 0\n"
            "- Reopened finding blockers: 0\n"
            "\n"
            "<!--\n"
            "`\n"
        )
        injected = "".join(
            injection if line.startswith("- Generated: `") else line
            for line in original.splitlines(keepends=True)
        )
        self.assertNotEqual(injected, original)
        path.write_text(injected, encoding="utf-8")
        report = pm_audit_status_index.validate()
        self.assertEqual(report["status"], "fail", report)
        self.assertIn(
            {"path": "Plans/.audits/CURRENT_AUDIT_STATUS.md", "error": "stale_current_audit_status_markdown"},
            report["failures"],
        )
        self.assertFalse(any(item.get("error") == "stale_audit_status_index" for item in report["failures"]), report)

    def test_stale_report_notes_the_full_tree_requirement(self) -> None:
        # T241: a stale index/Markdown report adds one note line saying the committed index counts
        # gitignored reports only full checkouts carry; a current report adds nothing. Message only.
        self.reopened_chain()
        self.generate()
        self.script.write_text(self.FIXTURE_SCRIPT.replace("return 2", "return 3"), encoding="utf-8")
        out, err = io.StringIO(), io.StringIO()
        with patch.object(sys, "argv", ["pm-audit-status-index.py", "validate"]), \
                contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            self.assertEqual(pm_audit_status_index.main(), 1)
        report = json.loads(out.getvalue())
        self.assertEqual(report["status"], "fail")
        self.assertTrue(any(f.get("error") == "stale_audit_status_index" for f in report["failures"]), report)
        note = err.getvalue()
        self.assertEqual(len(note.splitlines()), 1, note)
        self.assertIn("gitignored", note)
        self.assertIn("full tree", note)
        # T244: the note names both causes, so a full-tree user is told to regenerate.
        self.assertIn("generate", note)
        self.generate()
        out, err = io.StringIO(), io.StringIO()
        with patch.object(sys, "argv", ["pm-audit-status-index.py", "validate"]), \
                contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            self.assertEqual(pm_audit_status_index.main(), 0)
        self.assertEqual(json.loads(out.getvalue())["status"], "pass")
        self.assertEqual(err.getvalue(), "")


if __name__ == "__main__":
    unittest.main()
