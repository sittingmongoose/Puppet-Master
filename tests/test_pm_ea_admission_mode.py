"""Standing negatives for scripts/pm_ea_admission_mode.py (admission-aware mode of the EA lane checkers; T222/T225).

Each scenario copies the helper's own inputs (pm_ea_admission_mode.inputs) from this checkout into a disposable
directory, applies one defect and asks for one family's verdict. The directory is not a git work tree, so the
git-history route of steps 7 and 8 is never taken here; merge-1 records are proved by the live-registry rebuild.

``run_scenarios(module, repo)`` is also the oracle of the helper's mutation proof: a mutant is killed only when a
scenario returns a verdict other than its expected one (an exception is reported, never counted as a kill).
"""

import copy
import hashlib
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "scripts"))

import pm_ea_admission_mode as admission_mode  # noqa: E402

ADMITTED = "scheduler.pass"            # merge 1, DX, DL-549
OTHER = "subagent.context_rehydrated"  # merge 1, DM, DL-550
PREPARED = "debug.investigation.started"  # DDBG, prepared, not registered
RECORDS = admission_mode.RECORD_DIR
REGISTRY = admission_mode.REGISTRY


def _read(root, rel):
    return json.loads((root / rel).read_text(encoding="utf-8"))


def _write(root, rel, value):
    (root / rel).write_text(json.dumps(value, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")


def _registry_edit(root, change):
    doc = _read(root, REGISTRY)
    change(doc)
    (root / REGISTRY).write_bytes(admission_mode.rendered(doc))


def _row(root, event_type):
    return next(f for f in _read(root, REGISTRY)["families"] if f["event_type"] == event_type)


def _record_edit(change, event_type=ADMITTED):
    def apply(root):
        rel = RECORDS + "/" + event_type + ".json"
        record = _read(root, rel)
        change(record)
        _write(root, rel, record)
    return apply


def _set(path, value):
    def change(record):
        target = record
        for key in path[:-1]:
            target = target[key]
        target[path[-1]] = value
    return change


def _flip(hex64):
    return ("0" if hex64[0] != "0" else "1") + hex64[1:]


def _remove_record(root):
    (root / RECORDS / (ADMITTED + ".json")).unlink()


def _register_prepared(root):
    row = copy.deepcopy(_row(root, ADMITTED))
    row["event_type"], row["family_id"] = PREPARED, "event-family-debug-investigation-started"
    _registry_edit(root, lambda doc: doc["families"].append(row))


def _duplicate_row(root):
    row = copy.deepcopy(_row(root, ADMITTED))
    _registry_edit(root, lambda doc: doc["families"].append(row))


def _shared_family_id(root):
    row = copy.deepcopy(_row(root, ADMITTED))
    row["event_type"] = PREPARED
    _registry_edit(root, lambda doc: doc["families"].append(row))


def _second_record(root):
    record = _read(root, RECORDS + "/" + ADMITTED + ".json")
    _write(root, RECORDS + "/zz-copy-of-scheduler-pass.json", record)


def _unreadable_record(root):
    (root / RECORDS / (ADMITTED + ".json")).write_text("{", encoding="utf-8")


def _live_row_differs(root):
    def change(doc):
        row = next(f for f in doc["families"] if f["event_type"] == ADMITTED)
        row["family_revision"] = "1.0.1"
    _registry_edit(root, change)


def _depth_cell_fails(root):
    record = _read(root, RECORDS + "/" + ADMITTED + ".json")
    depth = _read(root, record["depth_assessment"]["path"])
    depth["rows"][0]["cells"]["retention"]["status"] = "FAIL"
    _write(root, record["depth_assessment"]["path"], depth)


def _decision_without_row_pin(root):
    rel = RECORDS + "/" + ADMITTED + ".json"
    record = _read(root, rel)
    number = record["decision_ref"].split("#", 1)[1]
    log = (root / admission_mode.DECISION_LOG).read_bytes()
    section = admission_mode.frozen_module(root).decision_section_bytes(root / admission_mode.DECISION_LOG, number)
    edited = section.replace(record["registry_row_sha256"].encode(), b"<row hash withdrawn>")
    assert edited != section
    (root / admission_mode.DECISION_LOG).write_bytes(log.replace(section, edited))
    record["decision_section_sha256"] = hashlib.sha256(edited).hexdigest()
    _write(root, rel, record)


def _unregister(root):
    _registry_edit(root, lambda doc: doc.__setitem__(
        "families", [f for f in doc["families"] if f["event_type"] != ADMITTED]))


def _landing_not_naming(root):
    rel = RECORDS + "/" + ADMITTED + ".json"
    landing = _read(root, rel)["admission_landing"]["record"]
    text = (root / landing).read_bytes()
    (root / landing).write_bytes(text.replace(ADMITTED.encode(), b"scheduler-pass-withdrawn"))


def _counts_shifted(record):
    record["registry_before"]["family_count"] += 1
    record["registry_after"]["family_count"] += 1


# (name, defect, family, call (None, prepared_row 'same'/'differs', registry 'synthetic'/'synthetic_changed'),
#  expected mode, expected code)
SCENARIOS = [
    ("admitted_control", None, ADMITTED, None, "admitted", None),
    ("prepared_control", None, PREPARED, None, "prepared", None),
    ("other_admitted_control", None, OTHER, None, "admitted", None),
    ("prepared_row_control", None, ADMITTED, "same", "admitted", None),
    ("a_registered_without_record", _remove_record, ADMITTED, None, "refused", "registered_without_admission_record"),
    ("d_prepared_family_registered", _register_prepared, PREPARED, None, "refused", "registered_without_admission_record"),
    ("registered_twice", _duplicate_row, ADMITTED, None, "refused", "registered_more_than_once"),
    ("family_id_on_two_rows", _shared_family_id, ADMITTED, None, "refused", "registered_more_than_once"),
    ("record_names_other_family", _record_edit(_set(["event_type"], OTHER)), ADMITTED, None, "refused",
     "admission_record_not_for_family"),
    ("record_unreadable", _unreadable_record, ADMITTED, None, "refused", "admission_record_not_for_family"),
    ("second_record_claims_family", _second_record, ADMITTED, None, "refused", "admission_record_not_for_family"),
    ("record_is_multi_family_step", _record_edit(_set([admission_mode.STEP_FIELD], [ADMITTED])), ADMITTED, None,
     "refused", "admission_record_step_unsupported"),
    ("c_live_row_differs_from_pinned", _live_row_differs, ADMITTED, None, "refused",
     "registry_row_differs_from_pinned_row"),
    ("record_pins_other_row", _record_edit(lambda r: r.__setitem__("registry_row_sha256", _flip(r["registry_row_sha256"]))),
     ADMITTED, None, "refused", "registry_row_differs_from_pinned_row"),
    ("lane_prepared_row_differs", None, ADMITTED, "differs", "refused", "registry_row_differs_from_prepared_row"),
    ("record_depth_not_complete", _depth_cell_fails, ADMITTED, None, "refused", "admission_record_incomplete"),
    ("record_cites_other_decision", _record_edit(_set(["decision_ref"], "Plans/Decision_Log.md#DL-550")), ADMITTED, None,
     "refused", "admission_record_incomplete"),
    ("record_other_receipt", _record_edit(lambda r: r.__setitem__(
        "implementation_receipt_sha256", _flip(r["implementation_receipt_sha256"]))), ADMITTED, None, "refused",
     "admission_record_incomplete"),
    ("b_record_after_revision", _record_edit(lambda r: r["registry_after"].__setitem__("revision", "2026-11-15.999")),
     ADMITTED, None, "refused", "registry_after_mismatch"),
    ("b_record_after_sha256", _record_edit(lambda r: r["registry_after"].__setitem__("sha256", _flip(r["registry_after"]["sha256"]))),
     ADMITTED, None, "refused", "registry_after_mismatch"),
    ("b_record_before_sha256", _record_edit(lambda r: r["registry_before"].__setitem__("sha256", _flip(r["registry_before"]["sha256"]))),
     ADMITTED, None, "refused", "registry_before_mismatch"),
    ("b_record_before_revision", _record_edit(lambda r: r["registry_before"].__setitem__("revision", "2026-11-15.998")),
     ADMITTED, None, "refused", "registry_before_mismatch"),
    ("b_record_counts_shifted", _record_edit(_counts_shifted), ADMITTED, None, "refused", "registry_after_mismatch"),
    ("decision_entry_drops_row_pin", _decision_without_row_pin, ADMITTED, None, "refused",
     "decision_entry_does_not_pin_admission"),
    ("landing_record_missing", _record_edit(_set(["admission_landing", "record"], "reports/no-such-landing.md")), ADMITTED,
     None, "refused", "admission_landing_record_missing"),
    ("landing_record_not_naming_family", _landing_not_naming, ADMITTED, None, "refused", "admission_landing_record_missing"),
    ("record_without_registration", _unregister, ADMITTED, None, "refused", "admission_record_without_registration"),
    # A lane witness judging a synthetic registry document (the family's row moved, other families removed): the
    # tree's own registry file still proves the record's pins without git; a wrong pin is still refused.
    ("synthetic_registry_control", None, ADMITTED, "synthetic", "admitted", None),
    ("synthetic_registry_record_after_revision", _record_edit(lambda r: r["registry_after"].__setitem__("revision", "2026-11-15.999")),
     ADMITTED, "synthetic", "refused", "registry_after_mismatch"),
    ("synthetic_registry_row_differs", None, ADMITTED, "synthetic_changed", "refused", "registry_row_differs_from_pinned_row"),
]


def base_tree(repo: Path, target: Path) -> Path:
    for rel in admission_mode.inputs([ADMITTED, OTHER, PREPARED], repo):
        (target / rel).parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(repo / rel, target / rel)
    return target


def run_scenarios(module, repo: Path = REPO, names=None) -> list[dict]:
    """Each scenario's expected and observed verdict, through `module` (the helper or a mutant of it)."""
    results = []
    with tempfile.TemporaryDirectory(prefix="pm-ea-admission-mode-") as scratch:
        base = base_tree(repo, Path(scratch) / "base")
        for name, defect, family, prepared, mode, code in SCENARIOS:
            if names is not None and name not in names:
                continue
            root = Path(scratch) / name
            shutil.copytree(base, root)
            if defect is not None:
                defect(root)
            module.reset_caches()
            row = registry = None
            if prepared in ("same", "differs"):
                row = copy.deepcopy(_row(root, family))
                if prepared == "differs":
                    row["source_refs"] = list(row.get("source_refs", [])) + ["Plans/Decision_Log.md#DL-077"]
            elif prepared in ("synthetic", "synthetic_changed"):
                registry = _read(root, REGISTRY)
                moved = copy.deepcopy(_row(root, family))
                if prepared == "synthetic_changed":
                    moved["family_revision"] += "-changed"
                registry["families"] = [f for f in registry["families"][:40]] + [moved]
            try:
                got = module.verdict(family, root=root, prepared_row=row, registry=registry)
                observed = {"mode": got.get("mode"), "code": got.get("code")}
                error = None
            except Exception as exc:  # reported, never a kill
                observed, error = None, type(exc).__name__ + ": " + str(exc)[:300]
            results.append({"scenario": name, "family": family, "expected": {"mode": mode, "code": code},
                            "observed": observed, "error": error,
                            "ok": observed == {"mode": mode, "code": code}})
            shutil.rmtree(root)
    return results


class AdmissionModeStandingNegatives(unittest.TestCase):
    def test_every_scenario_has_its_expected_verdict(self):
        results = run_scenarios(admission_mode)
        self.assertEqual(len(results), len(SCENARIOS))
        for result in results:
            with self.subTest(result["scenario"]):
                self.assertIsNone(result["error"])
                self.assertTrue(result["ok"], result)

    def test_every_refusal_code_is_reached(self):
        reached = {code for *_, mode, code in SCENARIOS if mode == "refused"}
        self.assertEqual(reached, set(admission_mode.CODES))


if __name__ == "__main__":
    unittest.main()
