"""Static authority/identity/replay checks; no Browser runtime is started."""

import copy
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("browser_admission", ROOT / "scripts/pm-browser-event-admission.py")
GATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GATE)
CONTEXT = GATE.contract_context()
FIXTURES = GATE.load_json("Plans/browser_event_admission_fixtures.json")
CASES = {case["event_type"]: case for case in FIXTURES["valid"]}
ROWS = {row["event_type"]: row for row in CONTEXT[0]["rows"]}


def event(event_type, sequence=1):
    return GATE.fixture_event(CASES[event_type], sequence)


def producer(value):
    return ROWS[value["event_type"]]["producer_component"]


def synthetic_family(row):
    """Complete isolated fixture; never live registration or authority proof."""
    index = next(index for index, candidate in enumerate(CONTEXT[0]["rows"]) if candidate["event_type"] == row["event_type"])
    return {
        **{key: copy.deepcopy(row[key]) for key in ("event_type", "family_id", "family_revision", "payload_schema_ref", "retention_policy_ref")},
        "scope_policy": "project_only",
        "payload_schema_id": row["payload_schema_ref"]["schema_id"],
        "semantic_owner_doc": row["semantic_owner_ref"],
        "payload_owner_doc": "Plans/storage-plan.md#case-l-5-eventrecord-persistence-legacy-normalization-and-dedupe",
        "source_refs": [
            "Plans/browser_event_admission.json#/rows/" + str(index),
            row["semantic_owner_ref"],
            row["payload_schema_ref"]["path"] + row["payload_schema_ref"]["json_pointer"],
        ],
        "legacy": {
            "aliases": [], "admitted_extensions": [],
            "identity_json_pointers": {field: ["/payload/context/" + field] for field in GATE.IDENTITIES},
            "referenced_event_id_pointer": None,
            "redaction": {"mode": "reject_unhandled_secrets", "transform_id": None, "transform_version": None},
        },
    }


def registry_snapshot(registry):
    """Replace only the central registry; keep schemas and owner reads real."""
    original_load = GATE.load_json
    return patch.object(GATE, "load_json", side_effect=lambda path: registry if path == "Plans/event_family_registry.json" else original_load(path))


def all_prepared_snapshot():
    """Synthetic all-prepared case, independent of future live admissions."""
    context = (copy.deepcopy(CONTEXT[0]), *CONTEXT[1:])
    for row in context[0]["rows"]:
        row["admission_status"] = "prepared_not_admitted"
    registry = copy.deepcopy(GATE.load_json("Plans/event_family_registry.json"))
    baseline_ids = set(context[0]["preexisting_family_ids"]) | {"event-family-context-compaction-completed"}
    registry["families"] = [row for row in registry["families"] if row["family_id"] in baseline_ids]
    # Re-frozen 2026-09-23 (was 4f701c95..., last true at 4fe66204bd) after the six landed goal v3
    # adoptions named in scripts/pm_emit_only_event_contract.py; same value as its prefix hash.
    # Re-frozen 2026-11-05 (was a27cf49b..., last true just before c0d688db9f) after three landed registry
    # changes moved it: c0d688db9f and 634412b3ac (workspace.layout_changed 2.0.0, DL-188) and 102a7e99e8
    # (lane F-d added scope_policy, payload_versions and payload_selection_policy to eleven goal rows). The
    # preservation check just below still judges each changed row against its reviewed successor.
    # Re-frozen 2026-11-04 (was a27cf49b..., last true at d86090abd9) after two owner-approved row changes
    # inside the upstream40: DL-188's workspace.layout_changed 2.0.0 row (c0d688db9f, 634412b3ac) and DL-300's
    # eleven Goal application editions (102a7e99e8, admitted 5375bfd2a7). The reviewed-successor check below
    # still requires those exact current rows; pm-browser-event-admission.py accepts them by exact digest.
    reviewed = GATE.emit_only_contract().reviewed_s5b_predecessors(registry["families"])
    if len(reviewed) != 40 or GATE.fingerprint(reviewed) != "2fe49c025e4db8adc9183a3f32c393333c203f375d9a047cc7a98d48c6f8776e":
        raise AssertionError("Synthetic admission fixture requires the unchanged live upstream40")
    preservation, failures = GATE.preexisting_preservation(context[0], registry["families"])
    if len(registry["families"]) != 40 or failures or not preservation["current_preexisting_rows_match_reviewed_successors"]:
        raise AssertionError("Synthetic admission fixture requires the exact reviewed current upstream40")
    return context, registry


class Upstream40PinTests(unittest.TestCase):
    def test_snapshot_refuses_one_changed_live_row(self):
        registry = copy.deepcopy(GATE.load_json("Plans/event_family_registry.json"))
        baseline_ids = set(CONTEXT[0]["preexisting_family_ids"])
        next(row for row in registry["families"] if row["family_id"] in baseline_ids)["family_revision"] = "9.9.9"
        with registry_snapshot(registry):
            with self.assertRaisesRegex(AssertionError, "unchanged live upstream40"):
                all_prepared_snapshot()


class BrowserPreexistingPreservationTests(unittest.TestCase):
    def setUp(self):
        self.admission = copy.deepcopy(CONTEXT[0])
        self.rows = copy.deepcopy(GATE.load_json("Plans/event_family_registry.json")["families"])

    def test_historical39_and40_are_separate_from_current_successors(self):
        context, registry = all_prepared_snapshot()
        rows = GATE.historical_preexisting_rows(registry["families"])
        original39 = [row for row in rows if row["family_id"] != GATE.COMPACTION_FAMILY]
        self.assertEqual(len(original39), 39)
        self.assertEqual(GATE.fingerprint(original39), "f548a2977dc4f1c51dc0a4976940a0a3562de6281a707a96fbd5cee67f618c0e")
        self.assertEqual(len(rows), 40)
        self.assertEqual(GATE.fingerprint(rows), "4f701c9598003d7c01a405f18f7991b373379eca8b182cf6222540a4746d1756")
        report, failures = GATE.preexisting_preservation(context[0], rows, allow_historical=True)
        self.assertEqual(failures, [])
        self.assertTrue(report["historical_baseline_verified"])
        self.assertTrue(report["preexisting_family_rows_unchanged"])
        self.assertFalse(report["current_preexisting_rows_match_reviewed_successors"])
        self.assertEqual(report["reviewed_preexisting_successor_family_ids"], [])

    def test_each_predecessor_and_mixed_or_full_rollback_fail_default_validation(self):
        historical = {row["family_id"]: row for row in GATE.historical_preexisting_rows(self.rows)}
        ids = list(GATE.REVIEWED_GOAL_SUCCESSORS)
        for rollback_ids in ([family_id] for family_id in ids):
            with self.subTest(rollback_ids=rollback_ids):
                rows = [copy.deepcopy(historical[row["family_id"]] if row["family_id"] in rollback_ids else row)
                        for row in self.rows]
                report, failures = GATE.preexisting_preservation(self.admission, rows)
                self.assertTrue(report["historical_baseline_verified"])
                self.assertFalse(report["current_preexisting_rows_match_reviewed_successors"])
                self.assertIn("required_preexisting_successors_missing", {row["error"] for row in failures})
        for rollback_ids in (ids[:2], ids):
            with self.subTest(rollback_ids=rollback_ids):
                rows = [copy.deepcopy(historical[row["family_id"]] if row["family_id"] in rollback_ids else row)
                        for row in self.rows]
                with registry_snapshot({"families": rows}):
                    report = GATE.validate()
                self.assertEqual(report["status"], "fail")
                self.assertIn("required_preexisting_successors_missing", {row["error"] for row in report["failures"]})
                self.assertFalse(report["admission_complete"])

    def test_exact_six_complete_adoptions_preserve_historical_authority(self):
        report, failures = GATE.preexisting_preservation(self.admission, self.rows)
        self.assertEqual(failures, [])
        self.assertTrue(report["historical_original39_verified"])
        self.assertTrue(report["historical_original40_verified"])
        self.assertFalse(report["preexisting_family_rows_unchanged"])
        self.assertTrue(report["current_preexisting_rows_match_reviewed_successors"])
        self.assertEqual(set(report["reviewed_preexisting_successor_family_ids"]), {
            "event-family-goal-created", "event-family-goal-updated", "event-family-goal-cancelled",
            "event-family-goal-run-started", "event-family-goal-run-cancelled",
            "event-family-goal-run-certified",
        })

    def test_every_field_of_each_successor_is_pinned(self):
        for original in self.rows:
            if original["family_id"] not in GATE.REVIEWED_GOAL_SUCCESSORS:
                continue
            for field in original:
                with self.subTest(family=original["family_id"], field=field):
                    rows = copy.deepcopy(self.rows)
                    row = next(row for row in rows if row["family_id"] == original["family_id"])
                    # Even apparently descriptive metadata is whole-row authority.
                    row[field] = "unapproved-drift"
                    report, failures = GATE.preexisting_preservation(self.admission, rows)
                    self.assertTrue(failures)
                    self.assertFalse(report["historical_baseline_verified"])
                    self.assertFalse(report["current_preexisting_rows_match_reviewed_successors"])

    def test_each_other_historical_row_and_compaction_remain_exact(self):
        coordination = GATE.admitted_coordination_rows()
        recorded = GATE.admitted_record_rows()
        for original in self.rows:
            if original["family_id"] in GATE.REVIEWED_GOAL_SUCCESSORS or original["event_type"].startswith("browser."):
                continue
            with self.subTest(family=original["family_id"]):
                rows = copy.deepcopy(self.rows)
                next(row for row in rows if row["family_id"] == original["family_id"])["family_revision"] = "99.0.0"
                report, failures = GATE.preexisting_preservation(self.admission, rows)
                self.assertTrue(failures)
                if ((original["family_id"], original["event_type"]) in coordination
                        or original["family_id"] in GATE.REVIEWED_DL300_FAMILIES
                        or ((original["family_id"], original["event_type"]) in recorded
                            and original["family_id"] not in set(self.admission["preexisting_family_ids"]) | {GATE.COMPACTION_FAMILY})):
                    # An admitted coordination row (Step 9 batch 2), a DL-300 family or a row its own DL-077
                    # admission record pins is not historical: drift makes it unexpected.
                    self.assertIn("unexpected_central_event_family", {row["error"] for row in failures})
                    continue
                self.assertFalse(report["historical_baseline_verified"])

    def test_record_pinned_row_passes_only_byte_for_byte(self):
        # PNC-019 admission merges: a row outside every allowlist passes only through its own DL-077 record pin.
        extra = copy.deepcopy(next(row for row in self.rows if row["family_id"] == GATE.COMPACTION_FAMILY))
        extra.update(family_id="event-family-pnc019-record-probe", event_type="pnc019.record_probe")
        rows = copy.deepcopy(self.rows) + [extra]
        pin = {(extra["family_id"], extra["event_type"]): GATE.dl077_row_sha256(extra)}
        base = {k: v for k, v in GATE.admitted_record_rows().items()}
        _, failures = GATE.preexisting_preservation(self.admission, rows, record_rows={**base, **pin})
        self.assertNotIn("unexpected_central_event_family", {row["error"] for row in failures})
        for name, record_rows in (("no_record", base),
                                  ("changed_row", {**base, (extra["family_id"], extra["event_type"]): "0" * 64}),
                                  ("renamed_family", {**base, ("event-family-other", extra["event_type"]): pin[(extra["family_id"], extra["event_type"])]}),
                                  ("renamed_event", {**base, (extra["family_id"], "pnc019.other"): pin[(extra["family_id"], extra["event_type"])]})):
            with self.subTest(case=name):
                _, failures = GATE.preexisting_preservation(self.admission, rows, record_rows=record_rows)
                self.assertIn("unexpected_central_event_family", {row["error"] for row in failures})

    def test_missing_duplicate_reordered_extra_and_changed_manifest_rejected(self):
        for mutation in ("missing", "duplicate", "order", "compaction_order", "extra", "manifest_order", "manifest_hash"):
            with self.subTest(mutation=mutation):
                rows, admission = copy.deepcopy(self.rows), copy.deepcopy(self.admission)
                if mutation == "missing":
                    rows.pop(0)
                elif mutation == "duplicate":
                    rows.append(copy.deepcopy(rows[0]))
                elif mutation == "order":
                    rows[0], rows[1] = rows[1], rows[0]
                elif mutation == "compaction_order":
                    row = next(row for row in rows if row["family_id"] == GATE.COMPACTION_FAMILY)
                    rows.remove(row)
                    rows.insert(0, row)
                elif mutation == "extra":
                    rows.append({**rows[0], "family_id": "event-family-unapproved", "event_type": "unapproved.event"})
                elif mutation == "manifest_order":
                    admission["preexisting_family_ids"].reverse()
                else:
                    admission["preexisting_family_rows_sha256"] = "0" * 64
                report, failures = GATE.preexisting_preservation(admission, rows)
                self.assertTrue(failures)
                self.assertFalse(report["current_preexisting_rows_match_reviewed_successors"])

    def test_current_manifest_pin_does_not_replace_historical_row_authority(self):
        self.assertEqual(self.admission["preexisting_family_rows_sha256"], GATE.CURRENT39_SHA256)
        current39 = [row for row in self.rows if row["family_id"] in self.admission["preexisting_family_ids"]]
        self.assertEqual(GATE.fingerprint(current39), GATE.CURRENT39_SHA256)
        admission = copy.deepcopy(self.admission)
        admission["preexisting_family_rows_sha256"] = GATE.ORIGINAL39_SHA256
        report, failures = GATE.preexisting_preservation(admission, self.rows)
        self.assertTrue(report["historical_baseline_verified"])
        self.assertIn("current_preexisting_manifest_hash_mismatch", {row["error"] for row in failures})
        self.assertFalse(report["current_preexisting_rows_match_reviewed_successors"])

    def test_prepared_registration_cannot_escape_with_reviewed_successors(self):
        prepared = next(row for row in self.admission["rows"] if row["admission_status"] == "prepared_not_admitted")
        for payloads_only in (False, True):
            with self.subTest(payloads_only=payloads_only):
                registry = {"families": self.rows + [synthetic_family(prepared)]}
                with registry_snapshot(registry):
                    report = GATE.validate(payloads_only=payloads_only)
                self.assertEqual(report["status"], "fail")
                self.assertIn("exact_admitted_subset_mismatch", {row["error"] for row in report["failures"]})
                self.assertFalse(report["admission_complete"])


class BrowserPreparedAdmissionTests(unittest.TestCase):
    def assert_quarantined_unchanged(self, oracle, value, context):
        before = copy.deepcopy(vars(oracle))
        self.assertEqual(oracle.consume(value, producer(value), context), "quarantined_without_checkpoint_advance")
        self.assertEqual(vars(oracle), before)

    def test_live_consistency_counts_match_exact_manifest_and_registry(self):
        report = GATE.validate()
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["failures"], [])
        admitted = {row["event_type"] for row in ROWS.values() if row["admission_status"] == "admitted_static_contract"}
        prepared = {row["event_type"] for row in ROWS.values() if row["admission_status"] == "prepared_not_admitted"}
        central = GATE.load_json("Plans/event_family_registry.json")["families"]
        central_browser = [row["event_type"] for row in central if row["event_type"] in ROWS]
        self.assertEqual(set(central_browser), admitted)
        self.assertEqual(len(central_browser), len(admitted))
        self.assertEqual(admitted | prepared, set(ROWS))
        self.assertEqual(report["prepared_scoped_event_families"], len(prepared))
        self.assertEqual(report["admitted_scoped_event_families"], len(admitted))
        # The only other additions are rows the coordination ledger marks admitted (Step 9 batch 2), the
        # three DL-300 families and rows their own DL-077 admission record pins (PNC-019 admission merges).
        coordination = GATE.admitted_coordination_rows()
        historical = set(CONTEXT[0]["preexisting_family_ids"]) | {GATE.COMPACTION_FAMILY}
        recorded = GATE.admitted_record_rows()
        record_pinned = [row for row in central
                         if row["family_id"] not in historical and row["event_type"] not in ROWS
                         and (row["family_id"], row["event_type"]) not in coordination
                         and row["family_id"] not in GATE.REVIEWED_DL300_FAMILIES
                         and recorded.get((row["family_id"], row["event_type"])) == GATE.dl077_row_sha256(row)]
        self.assertEqual(report["registry_family_count"],
                         40 + len(admitted) + len(coordination) + len(GATE.REVIEWED_DL300_FAMILIES) + len(record_pinned))
        self.assertEqual(report["admission_complete"], len(admitted) == 53)

    def test_isolated_prepared_consistency_is_not_admission_completion(self):
        context, registry = all_prepared_snapshot()
        with patch.object(GATE, "contract_context", return_value=context), registry_snapshot(registry):
            report = GATE.validate()
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["failures"], [])
        self.assertEqual(report["prepared_scoped_event_families"], 53)
        self.assertEqual(report["admitted_scoped_event_families"], 0)
        self.assertFalse(report["admission_complete"])

    def test_default_replay_quarantines_all_prepared_candidates_without_state_change(self):
        context, registry = all_prepared_snapshot()
        oracle = GATE.ReplayOracle()
        for ordinal, case in enumerate(FIXTURES["valid"], 1):
            value = GATE.fixture_event(case, ordinal)
            with self.subTest(event=value["event_type"]):
                with registry_snapshot(registry):
                    self.assertEqual(GATE.candidate_failures(value, producer(value), context), [])
                    self.assertEqual(GATE.event_failures(value, producer(value), context), ["event_not_admitted"])
                    self.assert_quarantined_unchanged(oracle, value, context)
        self.assertEqual(oracle.checkpoint, -1)
        self.assertEqual(oracle.projected_count, 0)
        self.assertEqual(oracle.executed_effects, 0)

    def test_admitted_manifest_label_cannot_bypass_absent_central_family(self):
        context, registry = all_prepared_snapshot()
        row = context[0]["rows"][0]
        row["admission_status"] = "admitted_static_contract"
        value = event(row["event_type"])
        self.assertTrue(GATE.event_failures(value, producer(value), context, families={}))
        with registry_snapshot(registry):
            self.assert_quarantined_unchanged(GATE.ReplayOracle(), value, context)

    def test_central_family_cannot_bypass_prepared_manifest_label(self):
        context, _ = all_prepared_snapshot()
        row = context[0]["rows"][0]
        value = event(row["event_type"])
        families = {row["event_type"]: synthetic_family(row)}
        self.assertIn("event_not_admitted", GATE.event_failures(value, producer(value), context, families=families))
        with registry_snapshot({"families": list(families.values())}):
            self.assert_quarantined_unchanged(GATE.ReplayOracle(), value, context)

    def test_isolated_mixed_subset_projects_only_exact_admitted_family(self):
        context, _ = all_prepared_snapshot()
        admitted, pending = context[0]["rows"][:2]
        admitted["admission_status"] = "admitted_static_contract"
        family = synthetic_family(admitted)
        value, sibling = event(admitted["event_type"]), event(pending["event_type"], 2)
        self.assertEqual(GATE.event_failures(value, producer(value), context, families={admitted["event_type"]: family}), [])
        with registry_snapshot({"families": [family]}):
            oracle = GATE.ReplayOracle()
            self.assertEqual(oracle.consume(value, producer(value), context), "projected_no_effect")
            self.assert_quarantined_unchanged(oracle, sibling, context)
            self.assertEqual(oracle.projected_count, 1)
            self.assertEqual(oracle.checkpoint, 1)
            self.assertEqual(oracle.executed_effects, 0)

    def test_mutated_central_binding_cannot_project_admitted_label(self):
        context = (copy.deepcopy(CONTEXT[0]), *CONTEXT[1:])
        row = context[0]["rows"][0]
        row["admission_status"] = "admitted_static_contract"
        value = event(row["event_type"])
        for field, replacement in (("family_id", "event-family-browser-wrong"),
                                   ("family_revision", "99.0.0"),
                                   ("payload_schema_id", "wrong"),
                                   ("scope_policy", "application_only"),
                                   ("retention_policy_ref", {}),
                                   ("payload_schema_ref", {}),
                                   ("semantic_owner_doc", "Plans/Contracts_V0.md#CV-001"),
                                   ("payload_owner_doc", row["semantic_owner_ref"]),
                                   ("source_refs", ["Plans/browser_event_admission.json#/rows/1", row["semantic_owner_ref"], row["payload_schema_ref"]["path"] + row["payload_schema_ref"]["json_pointer"]]),
                                   ("legacy", {})):
            with self.subTest(field=field):
                family = synthetic_family(row)
                family[field] = replacement
                self.assertTrue(GATE.event_failures(value, producer(value), context, families={row["event_type"]: family}))
                with registry_snapshot({"families": [family]}):
                    self.assert_quarantined_unchanged(GATE.ReplayOracle(), value, context)

    def test_unadmitted_legacy_transforms_and_missing_fields_cannot_project(self):
        context = (copy.deepcopy(CONTEXT[0]), *CONTEXT[1:])
        row = context[0]["rows"][0]
        row["admission_status"] = "admitted_static_contract"
        value = event(row["event_type"])
        for target in ("transform_id", "transform_version", "referenced_event_id_pointer", "missing_source_refs"):
            with self.subTest(target=target):
                family = synthetic_family(row)
                if target == "missing_source_refs":
                    del family["source_refs"]
                elif target == "referenced_event_id_pointer":
                    family["legacy"][target] = "/payload/event_id"
                else:
                    family["legacy"]["redaction"][target] = "unadmitted-transform"
                self.assertTrue(GATE.event_failures(value, producer(value), context, families={row["event_type"]: family}))
                with registry_snapshot({"families": [family]}):
                    self.assert_quarantined_unchanged(GATE.ReplayOracle(), value, context)

    def test_validate_cannot_hide_manifest_registry_mismatch_in_payloads_only_mode(self):
        for mutation in ("prepared_registered", "admitted_absent", "duplicate_central_family"):
            for payloads_only in (False, True):
                with self.subTest(mutation=mutation, payloads_only=payloads_only):
                    context, registry = all_prepared_snapshot()
                    row = context[0]["rows"][0]
                    if mutation == "prepared_registered":
                        registry["families"].append(synthetic_family(row))
                    elif mutation == "admitted_absent":
                        row["admission_status"] = "admitted_static_contract"
                    else:
                        registry["families"].append(copy.deepcopy(registry["families"][0]))
                    with patch.object(GATE, "contract_context", return_value=context), registry_snapshot(registry):
                        report = GATE.validate(payloads_only=payloads_only)
                    self.assertEqual(report["status"], "fail")
                    expected_error = "duplicate_central_event_family" if mutation == "duplicate_central_family" else "exact_admitted_subset_mismatch"
                    self.assertIn(expected_error, {failure["error"] for failure in report["failures"]})
                    self.assertFalse(report["admission_complete"])

    def test_validator_accepts_isolated_one_admitted_fifty_two_prepared_subset(self):
        context, registry = all_prepared_snapshot()
        row = context[0]["rows"][0]
        row["admission_status"] = "admitted_static_contract"
        registry["families"].append(synthetic_family(row))
        with patch.object(GATE, "contract_context", return_value=context), registry_snapshot(registry):
            report = GATE.validate()
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["failures"], [])
        self.assertEqual(report["admitted_scoped_event_families"], 1)
        self.assertEqual(report["prepared_scoped_event_families"], 52)
        self.assertEqual(report["registry_family_count"], 41)
        self.assertFalse(report["admission_complete"])

    def test_sibling_cannot_borrow_the_created_depth_binding(self):
        context, registry = all_prepared_snapshot()
        sibling = next(row for row in context[0]["rows"] if row["event_type"] == "browser.workspace.closed")
        sibling["admission_status"] = "admitted_static_contract"
        sibling["authority_contract_ref"] = "Plans/browser_workspace_created_contracts.schema.json#/x-pm-event-authority-binding"
        family = synthetic_family(sibling)
        value = event(sibling["event_type"])
        # browser.workspace.closed is one of the 51 Browser Program families, so it is judged by its own
        # per-family binding: without lane s4b's contracts it has none, and with them the borrowed
        # authority_contract_ref is not its own Storage unit. Either way it never binds through created's.
        own = ("browser_program_contract_missing" if not (ROOT / GATE.BROWSER_PROGRAM_CONTRACTS).is_file()
               else "browser_program_authority_contract")
        failures = GATE.event_failures(value, producer(value), context, families={sibling["event_type"]: family})
        self.assertIn(own, failures)
        self.assertNotIn("complete_browser_authority_binding_missing", failures)
        registry["families"].append(family)
        with patch.object(GATE, "contract_context", return_value=context), registry_snapshot(registry):
            report = GATE.validate()
        self.assertEqual(report["status"], "fail")
        self.assertIn(own, {row["error"] for row in report["failures"]})

    def test_created_requires_exact_depth_ref_beyond_label_and_central_row(self):
        context, _ = all_prepared_snapshot()
        row = context[0]["rows"][0]
        row["admission_status"] = "admitted_static_contract"
        row.pop("authority_contract_ref", None)
        value = event(row["event_type"])
        self.assertIn("browser_authority_contract_ref_missing_or_mismatched", GATE.event_failures(value, producer(value), context, families={row["event_type"]: synthetic_family(row)}))


class BrowserEventAdmissionTests(unittest.TestCase):
    def setUp(self):
        # Retain all payload/replay semantics with zero synthetic admission,
        # regardless of how many live families gain independent admission later.
        context, registry = all_prepared_snapshot()
        self.context_patch = patch(__name__ + ".CONTEXT", context)
        self.context_patch.start()
        self.addCleanup(self.context_patch.stop)
        self.registry_patch = registry_snapshot(registry)
        self.registry_patch.start()
        self.addCleanup(self.registry_patch.stop)
        self.contract_patch = patch.object(GATE, "contract_context", return_value=context)
        self.contract_patch.start()
        self.addCleanup(self.contract_patch.stop)

    def test_exact_census_and_all_rejection_fixtures(self):
        report = GATE.validate(payloads_only=True)
        self.assertEqual(report["failures"], [])
        self.assertEqual(report["required_event_families"], 53)
        self.assertEqual(report["positive_cases"], 53)
        self.assertGreaterEqual(report["negative_cases"], 558)
        self.assertFalse(report["runtime_producer_proven"])
        self.assertFalse(report["governance_sealed"])
        self.assertEqual(report["global_event_denominator"], "UNKNOWN_OPEN")

    def test_every_candidate_projects_once_without_reexecuting(self):
        oracle = GATE.CandidateReplayOracle()
        for ordinal, case in enumerate(FIXTURES["valid"], 1):
            value = GATE.fixture_event(case, ordinal)
            with self.subTest(event=case["event_type"]):
                self.assertEqual(oracle.consume(value, producer(value), CONTEXT), "projected_no_effect")
                self.assertEqual(oracle.consume(value, producer(value), CONTEXT), "duplicate_no_effect")
        self.assertEqual(oracle.projected_count, 53)
        self.assertEqual(oracle.executed_effects, 0)

    def test_invalid_input_cannot_advance_checkpoint(self):
        oracle = GATE.CandidateReplayOracle()
        good = event("browser.workspace.created")
        oracle.consume(good, producer(good), CONTEXT)
        bad = event("browser.page.created", 2)
        bad["payload"]["context"]["project_id"] = "project-other"
        self.assertEqual(oracle.consume(bad, producer(bad), CONTEXT), "quarantined_without_checkpoint_advance")
        self.assertEqual(oracle.checkpoint, 1)

    def test_unknown_event_never_advances_checkpoint(self):
        oracle = GATE.ReplayOracle()
        value = event("browser.workspace.created")
        value["event_type"] = "browser.unregistered_family"
        self.assertEqual(oracle.consume(value, "BrowserRuntimeService.workspace", CONTEXT), "quarantined_without_checkpoint_advance")
        self.assertEqual(oracle.checkpoint, -1)

    def test_event_id_collision_is_not_replay(self):
        oracle = GATE.CandidateReplayOracle()
        value = event("browser.workspace.created")
        oracle.consume(value, producer(value), CONTEXT)
        changed = copy.deepcopy(value)
        changed["payload"]["transition_receipt_ref"] = "receipt:different-transition"
        self.assertEqual(oracle.consume(changed, producer(changed), CONTEXT), "quarantined_without_checkpoint_advance")
        self.assertEqual(oracle.projected_count, 1)

    def test_idempotency_collision_is_not_new_effect(self):
        oracle = GATE.CandidateReplayOracle()
        value = event("browser.workspace.created")
        oracle.consume(value, producer(value), CONTEXT)
        duplicate = event("browser.workspace.created", 2)
        duplicate["idempotency_key"] = value["idempotency_key"]
        self.assertEqual(oracle.consume(duplicate, producer(duplicate), CONTEXT), "quarantined_without_checkpoint_advance")
        self.assertEqual(oracle.executed_effects, 0)

    def test_out_of_order_live_append_cannot_lower_cursor(self):
        oracle = GATE.CandidateReplayOracle()
        newer = event("browser.page.created", 2)
        oracle.consume(newer, producer(newer), CONTEXT)
        older = event("browser.workspace.created", 1)
        self.assertEqual(oracle.consume(older, producer(older), CONTEXT), "quarantined_without_checkpoint_advance")
        self.assertEqual(oracle.checkpoint, 2)

    def test_same_scoped_key_and_semantic_digest_returns_original(self):
        oracle = GATE.CandidateReplayOracle()
        value = event("browser.workspace.created")
        oracle.consume(value, producer(value), CONTEXT)
        same = copy.deepcopy(value)
        same["event_id"] = "event-browser-retry"
        same["sequence_id"] = 2
        same["persisted_at_utc"] = "2026-09-10T01:00:00Z"
        self.assertEqual(oracle.consume(same, producer(same), CONTEXT), "duplicate_no_effect")
        self.assertEqual(oracle.projected_count, 1)
        self.assertEqual(oracle.checkpoint, 1)

    def test_idempotency_identity_includes_the_event_type(self):
        oracle = GATE.CandidateReplayOracle()
        created = event("browser.workspace.created")
        closed = event("browser.workspace.closed", 2)
        closed["idempotency_key"] = created["idempotency_key"]
        oracle.consume(created, producer(created), CONTEXT)
        self.assertEqual(oracle.consume(closed, producer(closed), CONTEXT), "projected_no_effect")

    def test_global_event_id_cannot_be_reused_in_another_project(self):
        oracle = GATE.CandidateReplayOracle()
        value = event("browser.workspace.created")
        oracle.consume(value, producer(value), CONTEXT)
        other = copy.deepcopy(value)
        other["project_id"] = "project-other"
        other["payload"]["context"]["project_id"] = "project-other"
        self.assertEqual(oracle.consume(other, producer(other), CONTEXT), "quarantined_without_checkpoint_advance")

    def test_reconnect_observation_timestamp_does_not_duplicate(self):
        oracle = GATE.CandidateReplayOracle()
        value = event("browser.workspace.created")
        oracle.consume(value, producer(value), CONTEXT)
        observed_again = copy.deepcopy(value)
        observed_again["observed_at_utc"] = "2026-09-10T01:00:00Z"
        self.assertEqual(oracle.consume(observed_again, producer(value), CONTEXT), "duplicate_no_effect")

    def test_historical_projection_never_restores_old_page_generation(self):
        oracle = GATE.CandidateReplayOracle()
        newer = event("browser.navigation.generation_changed")
        newer["payload"]["context"]["page_generation"] = 9
        oracle.consume(newer, producer(newer), CONTEXT)
        older_fact = event("browser.page.activated", 2)
        oracle.consume(older_fact, producer(older_fact), CONTEXT)
        self.assertEqual(next(iter(oracle.page_generations.values())), 9)
        self.assertEqual(oracle.executed_effects, 0)

    def test_manual_route_before_cef_needs_no_fabricated_run_or_page(self):
        value = event("browser.route.fetch_selected")
        subject = value["payload"]["context"]
        for field in ("run_id", "attempt_id", "browser_page_id", "browser_workspace_id", "browser_session_id"):
            self.assertIsNone(subject[field])
        self.assertEqual(GATE.candidate_failures(value, producer(value), CONTEXT), [])

    def test_runtime_retention_has_actual_run_anchor(self):
        for row in ROWS.values():
            if row["retention_policy_ref"]["policy_id"] == "RP-RUNTIME-365D":
                with self.subTest(event=row["event_type"]):
                    self.assertTrue({"run_id", "attempt_id"} <= set(row["required_context_fields"]))

    def test_closed_payload_and_byte_budget_block_unbounded_material(self):
        value = event("browser.program.completed")
        value["payload"]["artifact_refs"] = ["artifact:" + str(index) + "x" * 450 for index in range(64)]
        value["payload"]["facts"]["completed_action_ids"] = ["action-" + str(index) + "x" * 170 for index in range(256)]
        self.assertIn("payload_byte_limit", GATE.candidate_failures(value, producer(value), CONTEXT))


class BrowserCandidateSuccessorTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = importlib.util.spec_from_file_location("browser_candidate_inspection", ROOT / "scripts/pm-assistant-contract-check.py")
        cls.checker = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.checker)

    def test_exact_candidate_roster_has_distinct_conditionally_admitted_successors(self):
        candidates = GATE.load_json("Plans/browser_event_admission_candidates.json")["rows"]
        registry = {r["event_type"]: r for r in GATE.load_json("Plans/event_family_registry.json")["families"]}
        self.assertEqual({r["event_type"] for r in candidates}, set(ROWS))
        for candidate in candidates:
            with self.subTest(event=candidate["event_type"]):
                row = ROWS[candidate["event_type"]]
                self.assertNotEqual(candidate["payload_schema_id"], row["payload_schema_ref"]["schema_id"])
                family = registry.get(candidate["event_type"])
                if row["admission_status"] == "admitted_static_contract":
                    self.assertIsNotNone(family)
                    self.assertIsNone(self.checker.payload_binding_error(candidate, family, row))
                else:
                    self.assertEqual(row["admission_status"], "prepared_not_admitted")
                    self.assertIsNone(family)
                    synthetic_family = {"payload_schema_id": row["payload_schema_ref"]["schema_id"]}
                    self.assertIsNotNone(self.checker.payload_binding_error(candidate, synthetic_family, row))

    def test_registered_id_difference_requires_exact_admitted_successor(self):
        candidate = {"event_type": "browser.workspace.created", "payload_schema_id": "candidate"}
        family = {"payload_schema_id": "admitted"}
        self.assertIsNotNone(self.checker.payload_binding_error(candidate, family))
        successor = {"event_type": candidate["event_type"], "admission_status": "admitted_static_contract", "payload_schema_ref": {"schema_id": "admitted"}}
        self.assertIsNone(self.checker.payload_binding_error(candidate, family, successor))
        for successor in ({"event_type": "browser.other", "admission_status": "admitted_static_contract"},
                          {"event_type": candidate["event_type"], "admission_status": "proposed"},
                          {"event_type": candidate["event_type"], "admission_status": "admitted_static_contract", "payload_schema_ref": {"schema_id": "different"}}):
            self.assertIsNotNone(self.checker.payload_binding_error(candidate, family, successor))

    def test_candidate_payload_is_not_accepted_as_admitted_schema(self):
        value = event("browser.workspace.created")
        value["payload"]["schema_id"] = "pm.browser_event.workspace_created.v1"
        self.assertIn("payload_schema", GATE.candidate_failures(value, producer(value), CONTEXT))


class BrowserProgramBindingTests(unittest.TestCase):
    """The per-family binding of the 51 Browser Program families (DL-046; lane s4b contracts; merge 2).

    A synthetic root holds one contract shaped as lane s4b prepares them and the canon it names; every
    binding row has a positive and a single-defect negative that refuses at that row alone.
    """
    EVENT = "browser.workspace.closed"

    def spec(self):
        return {
            "event_type": self.EVENT, "admission_row_index": 0, "family_id": "event-family-browser-workspace-closed",
            "family_revision": "1.0.0", "semantic_anchor": "browser-program-event-authority-workspace-closed",
            "cv_unit": "CV-2500", "sp_unit": "SP-2500", "producer_component": "BrowserRuntimeService.workspace",
            "publication_operation": "BrowserRuntimeService.workspace.publish.workspace_closed@1.0.0",
            "consumer_id": "browser.workspace_inventory.workspace_closed.v1@1.0.0",
            "index_writer_id": "storage.browser_workspace_closed_index.v1@1.0.0",
            "checkpoint_family_id": "browser_workspace_closed_index_checkpoint",
            "checkpoint_key_shape": "browser_workspace_closed_index_checkpoint.v1:{storage_instance_id}:{scope_partition}",
            "checkpoint_schema_ref": "Plans/browser_program_event_contracts.schema.json#/$defs/workspace_closed_index_checkpoint",
            "checkpoint_retention_policy": "RP-PROJECTION-3GEN@1.0.0", "retention_policy": "RP-AUTHORITY-INDEFINITE@1.0.0",
            "payload_schema_id": "pm.browser_event.workspace_closed.schema.v1",
            "owner_record_contract_ref": "Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result",
        }

    def admitted_row(self, spec):
        return {
            "event_type": self.EVENT, "family_id": spec["family_id"], "family_revision": spec["family_revision"],
            "admission_status": "admitted_static_contract", "authority_contract_ref": "Plans/storage-plan.md#SP-2500",
            "semantic_owner_ref": "Plans/Section15_MVP_Promoted_Features_Spec.md#" + spec["semantic_anchor"],
            "consumer_contract_refs": ["Plans/storage-plan.md#SP-2500", "Plans/Contracts_V0.md#CV-2500"],
            "producer_component": spec["producer_component"],
            "payload_schema_ref": {"path": "Plans/browser_event_payloads.schema.json", "json_pointer": "#/$defs/workspace_closed",
                                   "schema_id": spec["payload_schema_id"]},
            "retention_policy_ref": {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-AUTHORITY-INDEFINITE",
                                     "policy_version": "1.0.0"},
            "owner_record_contract_ref": spec["owner_record_contract_ref"],
        }

    def write_root(self, root, spec, *, s15=None, cv=None, sp=None, storage=None, checkpoints=None, admission=None):
        def put(rel, text):
            path = root / rel
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text, encoding="utf-8")
        tokens = " ".join(str(spec[k]) for k in ("producer_component", "publication_operation", "consumer_id",
                                                  "checkpoint_family_id", "cv_unit", "sp_unit", "retention_policy"))
        put("reports/event-authority-20261114/S4B-contracts.json", json.dumps({"families": [spec]}))
        put("Plans/browser_event_admission.json", json.dumps(admission or {"rows": [{"event_type": self.EVENT}]}))
        put("Plans/Section15_MVP_Promoted_Features_Spec.md", s15 if s15 is not None else
            '<a id="' + spec["semantic_anchor"] + '"></a>\n' + tokens + '\n<a id="other"></a>\nnothing')
        put("Plans/Contracts_V0.md", cv if cv is not None else
            "### CV-2500 - x\n" + " ".join([self.EVENT, spec["payload_schema_id"], "evt_browser_", "browser@1:",
                                            "dedupe_by_idempotency_key", "projector_replay_only", "payload_inline_limit"]) + "\n### CV-2501 - y\n")
        put("Plans/storage-plan.md", sp if sp is not None else
            "### SP-2500 - x\n" + " ".join([self.EVENT, spec["checkpoint_family_id"], spec["checkpoint_key_shape"],
                                            spec["checkpoint_schema_ref"], spec["index_writer_id"], spec["consumer_id"],
                                            "RP-PROJECTION-3GEN", spec["retention_policy"], "original_receipt_missing",
                                            "family_withdrawn", "checkpoint_cas_conflict"]) + "\n### SP-2501 - y\n")
        put("Plans/storage_value_registry.json", json.dumps(storage or {"families": [{
            "family_id": spec["checkpoint_family_id"], "key_shape": spec["checkpoint_key_shape"], "consumers": [spec["consumer_id"]],
            "producer": [spec["index_writer_id"]], "value_schema_ref": spec["checkpoint_schema_ref"],
            "retention_policy_ref": "RP-PROJECTION-3GEN"}]}))
        put("Plans/browser_program_event_contracts.schema.json", json.dumps(checkpoints or {"$defs": {"workspace_closed_index_checkpoint": {"type": "object"}}}))

    def failures(self, row, spec=None, **canon):
        spec = spec or self.spec()
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_root(root, spec, **canon)
            return GATE.browser_program_binding_failures(row, root=root)

    def test_the_prepared_contract_binds_its_admitted_row(self):
        self.assertEqual(self.failures(self.admitted_row(self.spec())), [])

    def test_each_binding_row_refuses_its_own_single_defect(self):
        spec = self.spec()
        row = self.admitted_row(spec)

        def changed_row(**fields):
            return dict(copy.deepcopy(row), **fields)

        cases = {
            "browser_program_family_identity": (changed_row(family_revision="2.0.0"), {}),
            "browser_program_semantic_owner": (changed_row(semantic_owner_ref="Plans/Section15_MVP_Promoted_Features_Spec.md#other"), {}),
            "browser_program_consumer_refs": (changed_row(consumer_contract_refs=["Plans/storage-plan.md#SP-2500"]), {}),
            "browser_program_producer": (changed_row(producer_component="BrowserRuntimeService.page"), {}),
            "browser_program_payload_schema": (changed_row(payload_schema_ref=dict(row["payload_schema_ref"], schema_id="pm.other.v1")), {}),
            "browser_program_retention": (changed_row(retention_policy_ref=dict(row["retention_policy_ref"], policy_id="RP-RUNTIME-365D")), {}),
            "browser_program_owner_record": (changed_row(owner_record_contract_ref="Plans/other.schema.json#/$defs/x"), {}),
            "browser_program_authority_contract": (changed_row(authority_contract_ref="Plans/storage-plan.md#SP-2501"), {}),
            "browser_program_section15_text": (row, {"s15": '<a id="' + spec["semantic_anchor"] + '"></a>\nonly some text'}),
            "browser_program_contract_unit_text": (row, {"cv": "### CV-2500 - x\n" + self.EVENT + "\n"}),
            "browser_program_storage_unit_text": (row, {"sp": "### SP-2500 - x\n" + self.EVENT + "\n"}),
            "browser_program_checkpoint_row": (row, {"storage": {"families": [{"family_id": spec["checkpoint_family_id"]}]}}),
            "browser_program_checkpoint_schema": (row, {"checkpoints": {"$defs": {}}}),
        }
        for code, (candidate, canon) in cases.items():
            with self.subTest(code=code):
                self.assertEqual(self.failures(candidate, **canon), [code])

    def test_entry_rows_refuse_names_contracts_and_rows_they_do_not_pin(self):
        spec = self.spec()
        row = self.admitted_row(spec)
        other = dict(row, event_type="browser.workspace.created")
        self.assertEqual(self.failures(other), ["browser_program_binding_missing"])
        prefix = dict(row, event_type="browser.workspace.closed.extra")
        self.assertEqual(self.failures(prefix), ["browser_program_binding_missing"])
        renamed = dict(spec, event_type="browser.page.closed")
        self.assertEqual(self.failures(row, spec=renamed), ["browser_program_contract_missing"])
        self.assertEqual(self.failures(row, admission={"rows": [{"event_type": "browser.page.closed"}]}),
                         ["browser_program_admission_row_mismatch"])
        self.assertEqual(self.failures(row, spec=dict(spec, admission_row_index=5)), ["browser_program_admission_row_mismatch"])

    def test_dispatch_opens_exactly_the_pinned_program_names(self):
        self.assertEqual(len(GATE.BROWSER_PROGRAM_FAMILIES), 51)
        self.assertEqual(GATE.BROWSER_PROGRAM_FAMILIES,
                         {row["event_type"] for row in CONTEXT[0]["rows"]} - {"browser.workspace.created", "browser.workspace.reset"})
        row = self.admitted_row(self.spec())
        self.assertEqual(GATE.authority_binding_failures(dict(row, event_type="browser.not_a_program_family")),
                         ["complete_browser_authority_binding_missing"])
        if not (ROOT / GATE.BROWSER_PROGRAM_CONTRACTS).is_file():
            # Before lane s4b's contracts merge, a Program family is pinned but has no contract: it stays closed.
            self.assertEqual(GATE.authority_binding_failures(row), ["browser_program_contract_missing"])



class Merge2Fix1BrowserTests(unittest.TestCase):
    """FIX1: full ledger compatibility and bounded successor preservation."""
    def test_whole_ledger_is_valid(self):
        result = GATE.validate()
        self.assertEqual(result["failures"], [])
        self.assertEqual(result["status"], "pass")

    def test_storage_reference_shape_and_cross_family_refusals(self):
        schema = GATE.load_json("Plans/browser_event_admission.schema.json")
        admission = GATE.load_json("Plans/browser_event_admission.json")
        self.assertEqual(list(GATE.Draft202012Validator(schema).iter_errors(admission)), [])
        row = next(r for r in admission["rows"] if r["event_type"] == "browser.workspace.closed")
        prop = schema["properties"]["rows"]["items"]["properties"]["authority_contract_ref"]
        for ref in ("Plans/other.md#SP-2500", "Plans/storage-plan.md#SP-x", "Plans/storage-plan.md#SP-02500",
                    "Plans/storage-plan.md#SP-2500/trailing", "Plans/storage-plan.md#SP-2500x"):
            with self.subTest(ref=ref):
                self.assertTrue(list(GATE.Draft202012Validator(prop).iter_errors(ref)))
        wrong = dict(row, authority_contract_ref="Plans/storage-plan.md#SP-2501")
        self.assertEqual(list(GATE.Draft202012Validator(prop).iter_errors(wrong["authority_contract_ref"])), [])
        self.assertTrue(GATE.browser_program_binding_failures(wrong))
        self.assertEqual(GATE.browser_program_binding_failures(row), [])

    def test_s5b_projection_keeps_real_changes_refused(self):
        rows = GATE.load_json("Plans/event_family_registry.json")["families"]
        admission = GATE.load_json("Plans/browser_event_admission.json")
        report, failures = GATE.preexisting_preservation(admission, rows)
        self.assertEqual(failures, [])
        self.assertTrue(report["historical_original39_verified"] and report["historical_original40_verified"])
        pins = json.loads((ROOT / "scripts/pm_ea_reviewed_successors.json").read_text())["families"]
        for family_id in pins:
            for field in ("family_revision", "semantic_owner_doc", "payload_owner_doc", "source_refs", "scope_policy"):
                changed = copy.deepcopy(rows)
                row = next(r for r in changed if r["family_id"] == family_id)
                row[field] = ["Plans/forged.md#CV-1"] if field == "source_refs" else "forged"
                with self.subTest(family=family_id, field=field):
                    self.assertTrue(GATE.preexisting_preservation(admission, changed)[1])
        for family_id in GATE.REVIEWED_GOAL_SUCCESSORS:
            changed = [r for r in rows if r["family_id"] != family_id]
            self.assertTrue(GATE.preexisting_preservation(admission, changed)[1])


if __name__ == "__main__":
    unittest.main()
