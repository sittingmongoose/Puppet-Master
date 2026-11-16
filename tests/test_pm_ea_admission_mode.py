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
PREPARED = "usage.event"                # DT, the one merge-2 family left prepared (blocked), not registered
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
    row["event_type"], row["family_id"] = PREPARED, "event-family-usage-event"
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


# --- registered-row revisions (S5b, revision_verdict) -------------------------------------------------------------
# goal_run.stopped (DL-2437) is judged against the S3 lane's own pinned prepared row; with later revisions applied its
# pins are proved by the hash-checked pre-revision states (revision_states), never by git here.
REVISED = "goal_run.stopped"
PREPARED_ROWS = "Plans/goal_run_stop_block_contracts/prepared-registry-rows.json"
REVISION_DIR = "reports/event-authority-20261116/admission-merge-2/revisions"


def _prepared_entry(root, event_type=REVISED):
    return copy.deepcopy(next(r for r in _read(root, PREPARED_ROWS)["rows"] if r["event_type"] == event_type))


def _revision_edit(change, event_type=REVISED):
    def apply(root):
        rel = REVISION_DIR + "/" + event_type + ".json"
        record = _read(root, rel)
        change(record)
        _write(root, rel, record)
    return apply


def _live_edit(change, event_type=REVISED):
    def apply(root):
        def edit(doc):
            row = next(f for f in doc["families"] if f["event_type"] == event_type)
            change(row)
        _registry_edit(root, edit)
    return apply


def _revision_removed(root):
    (root / REVISION_DIR / (REVISED + ".json")).unlink()


def _revision_copied(root):
    other = root / "reports/event-authority-29991231/zz-copy/revisions"
    other.mkdir(parents=True)
    shutil.copyfile(root / REVISION_DIR / (REVISED + ".json"), other / (REVISED + ".json"))


def _unrevised_row_with_record(root):
    before = _read(root, REVISION_DIR + "/" + REVISED + ".json")["before_row"]
    _registry_edit(root, lambda doc: doc.__setitem__(
        "families", [copy.deepcopy(before) if f["event_type"] == REVISED else f for f in doc["families"]]))


def _successor_without_revision(root):
    """d: an unrevised (pre-revision) tree whose row is wrongly replaced by the prepared successor, with no record."""
    _unrevised_row_with_record(root)
    _revision_removed(root)
    successor = _prepared_entry(root)["registry_row"]
    _registry_edit(root, lambda doc: doc.__setitem__(
        "families", [copy.deepcopy(successor) if f["event_type"] == REVISED else f for f in doc["families"]]))


def _unrevised_tree(root):
    """pre: the family's row is still its predecessor and no revision record names it."""
    _unrevised_row_with_record(root)
    _revision_removed(root)


def _duplicate_revised(root):
    row = copy.deepcopy(_row(root, REVISED))
    _registry_edit(root, lambda doc: doc["families"].append(row))


def _cell_fails(record):
    record["rows"][0]["cells"]["retention"]["status"] = "FAIL"


# (name, defect, call ('lane' = the S3 prepared row and its replaces pin; 'other_predecessor'), expected mode, code)
REVISION_SCENARIOS = [
    ("rev_admitted_tree_revised", None, "lane", "revised", None),
    ("rev_pre_revision_tree_unrevised", _unrevised_tree, "lane", "unrevised", None),
    ("rev_registered_twice", _duplicate_revised, "lane", "refused", "revision_family_not_registered_once"),
    ("rev_a_record_deleted", _revision_removed, "lane", "refused", "revised_without_revision_record"),
    ("rev_d_unrevised_row_marked_successor", _successor_without_revision, "lane", "refused", "revised_without_revision_record"),
    ("rev_second_record", _revision_copied, "lane", "refused", "revision_record_not_for_family"),
    ("rev_record_other_schema", _revision_edit(_set(["schema_id"], "pm.other.v1")), "lane", "refused", "revision_record_not_for_family"),
    ("rev_record_without_revision", _unrevised_row_with_record, "lane", "refused", "revision_record_without_revision"),
    ("rev_c_live_row_differs_from_prepared", _live_edit(lambda r: r["source_refs"].append("Plans/Decision_Log.md#DL-2437")),
     "lane", "refused", "registry_row_differs_from_prepared_successor"),
    ("rev_c_any_v3_row", _live_edit(lambda r: r.__setitem__("semantic_owner_doc", "Plans/Goal_Runtime_System.md#GRS-201")),
     "lane", "refused", "registry_row_differs_from_prepared_successor"),
    ("rev_record_row_differs", _revision_edit(lambda r: r["registry_row"]["source_refs"].append("x")), "lane", "refused",
     "registry_row_differs_from_revision_row"),
    ("rev_predecessor_pin_differs", None, "other_predecessor", "refused", "revision_predecessor_mismatch"),
    ("rev_record_cell_fails", _revision_edit(_cell_fails), "lane", "refused", "revision_record_incomplete"),
    ("rev_record_native_claimed", _revision_edit(_set(["native_execution"], "PASS")), "lane", "refused", "revision_record_incomplete"),
    ("rev_manifest_sha256", _revision_edit(lambda r: r["manifest"].__setitem__("sha256", _flip(r["manifest"]["sha256"]))),
     "lane", "refused", "revision_manifest_mismatch"),
    ("rev_b_record_before_revision", _revision_edit(lambda r: r["registry_before"].__setitem__("revision", "2026-11-16.999")),
     "lane", "refused", "revision_registry_before_mismatch"),
    ("rev_b_record_after_revision", _revision_edit(lambda r: r["registry_after"].__setitem__("revision", "2026-11-16.998")),
     "lane", "refused", "revision_registry_after_mismatch"),
    ("rev_b_record_after_sha256", _revision_edit(lambda r: r["registry_after"].__setitem__("sha256", _flip(r["registry_after"]["sha256"]))),
     "lane", "refused", "revision_registry_after_mismatch"),
    ("rev_decision_other_entry", _revision_edit(_set(["decision_ref"], "Plans/Decision_Log.md#DL-2436")), "lane", "refused",
     "revision_decision_does_not_pin"),
]


def run_revision_scenarios(module, repo: Path = REPO, names=None) -> list[dict]:
    """Each revision scenario's expected and observed verdict through `module` (the helper or a mutant)."""
    results = []
    with tempfile.TemporaryDirectory(prefix="pm-ea-revision-mode-") as scratch:
        base = Path(scratch) / "base"
        for rel in admission_mode.inputs([REVISED], repo) + [PREPARED_ROWS]:
            (base / rel).parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(repo / rel, base / rel)
        for name, defect, call, mode, code in REVISION_SCENARIOS:
            if names is not None and name not in names:
                continue
            root = Path(scratch) / name
            shutil.copytree(base, root)
            if defect is not None:
                defect(root)
            module.reset_caches()
            entry = _prepared_entry(root)
            predecessor = dict(entry["replaces"])
            if call == "other_predecessor":
                predecessor["family_revision"] = "1.0.0"
            try:
                got = module.revision_verdict(REVISED, root=root, successor_row=entry["registry_row"], predecessor=predecessor)
                observed, error = {"mode": got.get("mode"), "code": got.get("code")}, None
            except Exception as exc:  # reported, never a kill
                observed, error = None, type(exc).__name__ + ": " + str(exc)[:300]
            results.append({"scenario": name, "family": REVISED, "expected": {"mode": mode, "code": code},
                            "observed": observed, "error": error, "ok": observed == {"mode": mode, "code": code}})
            shutil.rmtree(root)
    return results


# --- merge-2 lane checkers (ADMIT-MODE2): each lane's own admission function, read from its checker source ---------
# The function is compiled alone (ast), with ROOT bound to a disposable tree, so no checker module is imported.
# Each lane case: (lane, checker, function, family, adapter(fn, family, root, registry) -> True when accepted).
import ast  # noqa: E402
import json as _json  # noqa: E402


def lane_function(checker: str, name: str, root: Path, extra: dict | None = None):
    source = (REPO / checker).read_text(encoding="utf-8")
    node = next(n for n in ast.parse(source).body if isinstance(n, ast.FunctionDef) and n.name == name)
    namespace = {"ROOT": root, "json": _json, "copy": copy, "Path": Path, "Any": object, **(extra or {})}
    exec(compile(ast.Module(body=[node], type_ignores=[]), checker, "exec"), namespace)
    return namespace[name]


def _dc_extra(root):
    return {"REGISTRY_PATH": REGISTRY, "LEDGER_PATH": "Plans/collaboration_event_admission.json",
            "load": lambda path, where=root: _read(Path(where), path)}


LANE_CASES = [
    ("DMEM", "scripts/pm_memory_maintenance_events.py", "unadmitted_registrations", "memory.dedup_sweep.completed",
     lambda fn, et, root, reg: fn({f["event_type"] for f in reg["families"]}, [et]) == {}, None),
    ("DT", "scripts/pm-dt-event-contracts.py", "registration_refusal", "approval.denied",
     lambda fn, et, root, reg: fn(et, {f["event_type"] for f in reg["families"]}) is None, None),
    ("DO", "scripts/pm-orchestrator-event-contracts.py", "registration_refusal", "config.validation.failed",
     lambda fn, et, root, reg: fn(et, {f["event_type"] for f in reg["families"]}) is None, None),
    ("DCH", "scripts/pm_dch_events.py", "registration_refusal", "chat.message",
     lambda fn, et, root, reg: fn(et, reg) is None, None),
    ("DCH-stop", "scripts/pm_dch_stop.py", "registration_refusal", "chat.response_stop_requested",
     lambda fn, et, root, reg: fn(et, reg) is None, None),
    ("DG6A-alert", "scripts/pm-alert-event-contracts-check.py", "registration_refusal", "alert.acknowledged",
     lambda fn, et, root, reg: fn(et, {f["event_type"] for f in reg["families"]}) is None, None),
    ("DG6A-concern", "scripts/pm-concern-created-contracts-check.py", "registration_refusal", "concern.created",
     lambda fn, et, root, reg: fn(et, {f["event_type"] for f in reg["families"]}) is None, None),
    ("DG6A-panel", "scripts/pm-panel-event-contracts-check.py", "registration_refusal", "panel.redocked",
     lambda fn, et, root, reg: fn(et, {f["event_type"] for f in reg["families"]}) is None, None),
    ("DG6B", "scripts/pm-dg6b-event-contracts.py", "unadmitted_registrations", "auth.github.authenticated",
     lambda fn, et, root, reg: fn({et}, reg) == [], None),
    ("DS15", "scripts/pm-ds15-event-contracts.py", "admission_text_refusal", "dev.session.started",
     lambda fn, et, root, reg: fn(et, reg) is None, None),
    ("DS15-deck2", "scripts/pm-ds15-deck2-contracts.py", "registration_refusal", "browser.context_shared",
     lambda fn, et, root, reg: fn(et, reg) is None, None),
    ("DF", "scripts/pm_filesafe_event_authority.py", "unadmitted_matches", "safe_point.created",
     lambda fn, et, root, reg: fn(et, reg) == 0, None),
    ("DCW", "scripts/pm_dcw_event_oracles.py", "admission_report", "wizard.blocked",
     lambda fn, et, root, reg: _accepts(fn, [et]), None),
    ("DMEM-report", "scripts/pm_memory_maintenance_events.py", "admission_report", "memory.dedup_sweep.completed",
     lambda fn, et, root, reg: _accepts(fn, [et]), None),
    ("DG6A-alert-report", "scripts/pm-alert-event-contracts-check.py", "admission_report", "alert.acknowledged",
     lambda fn, et, root, reg: _accepts(fn, [et]), None),
    ("DG6A-concern-report", "scripts/pm-concern-created-contracts-check.py", "admission_report", "concern.created",
     lambda fn, et, root, reg: _accepts(fn, [et]), None),
    ("DG6A-panel-report", "scripts/pm-panel-event-contracts-check.py", "admission_report", "panel.redocked",
     lambda fn, et, root, reg: _accepts(fn, [et]), None),
    ("DG6A-card5", "scripts/pm-card5-event-contracts-check.py", "admission_label", "bundle.note_created",
     lambda fn, et, root, reg: _accepts(fn, et), None),
    ("DR", "scripts/pm-runtime-artifact-event-drafts.py", "admission_report", "runtime_artifact.screenshot",
     lambda fn, et, root, reg: (lambda failures: (fn([et], failures), failures)[1] == [])([]), None),
    ("DC", "scripts/pm_collaboration_events.py", "admission_mode_failures", "collaboration.created",
     lambda fn, et, root, reg: fn(root, [et] if any(f["event_type"] == et for f in reg["families"]) else []) == [], _dc_extra),
]


# T252: every family selected by DF's contract main goes through the same record gate.
DF_CONTRACT_FAMILIES = tuple(r["event_type"] for r in _read(REPO, "Plans/filesafe_event_contract_fixtures.json")["families"])
LANE_CASES.extend(
    ("DF-contracts:" + family, "scripts/pm_filesafe_event_contracts.py", "admission_report", family,
     lambda fn, et, root, reg: (lambda failures: (fn([et], failures), failures)[1] == [])([]), None)
    for family in DF_CONTRACT_FAMILIES
)


# Missing-record sweep: all twelve FileManager families need the same record gate.
DFM_CONTRACT_FAMILIES = tuple(r["event_type"] for r in _read(REPO, "Plans/filemanager_event_contract_fixtures.json")["rows"])
LANE_CASES.extend(
    ("DFM:" + family, "scripts/pm-filemanager-event-contracts.py", "admission_report", family,
     lambda fn, et, root, reg: _accepts(fn, [et]), None)
    for family in DFM_CONTRACT_FAMILIES
)


def _accepts(fn, *args):
    try:
        fn(*args)
    except AssertionError:
        return False
    return True


def _lane_record_removed(et):
    return lambda root: (root / RECORDS / (et + ".json")).unlink()


def _lane_record_after_revision(et):
    return _record_edit(lambda r: r["registry_after"].__setitem__("revision", "2026-11-16.997"), et)


def _lane_live_row_differs(et):
    def apply(root):
        def edit(doc):
            next(f for f in doc["families"] if f["event_type"] == et)["family_revision"] = "9.9.9"
        _registry_edit(root, edit)
    return apply


def _lane_unregistered(et):
    """pre: the family's row and record withdrawn (the pre-admission state of this family)."""
    def apply(root):
        _registry_edit(root, lambda doc: doc.__setitem__("families", [f for f in doc["families"] if f["event_type"] != et]))
        (root / RECORDS / (et + ".json")).unlink()
    return apply


def _lane_prepared_registered(et):
    """d: on that pre-admission state, the prepared family wrongly registered (its own row, no record)."""
    def apply(root):
        row = copy.deepcopy(_row(root, et))
        _lane_unregistered(et)(root)
        _registry_edit(root, lambda doc: doc["families"].append(row))
    return apply


LANE_DEFECTS = [
    ("admitted_tree", None, True),
    ("a_record_deleted", _lane_record_removed, False),
    ("b_record_does_not_match", _lane_record_after_revision, False),
    ("c_live_row_differs_from_pinned", _lane_live_row_differs, False),
    ("d_prepared_family_registered", _lane_prepared_registered, False),
    ("pre_admission_tree", _lane_unregistered, True),
]


def run_lane_scenarios(module, repo: Path = REPO, lanes=None) -> list[dict]:
    """Each lane case under each defect: accepted or refused through the lane's own function and `module`."""
    results = []
    sys.modules["pm_ea_admission_mode"] = module
    try:
        with tempfile.TemporaryDirectory(prefix="pm-ea-lane-mode-") as scratch:
            base = Path(scratch) / "base"
            families = [case[3] for case in LANE_CASES]
            for rel in admission_mode.inputs(families, repo) + ["Plans/collaboration_event_admission.json"]:
                (base / rel).parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(repo / rel, base / rel)
            for lane, checker, name, family, adapter, extra in LANE_CASES:
                if lanes is not None and lane not in lanes:
                    continue
                for defect_name, defect, accepted in LANE_DEFECTS:
                    root = Path(scratch) / (lane + "-" + defect_name)
                    shutil.copytree(base, root)
                    if defect is not None:
                        defect(family)(root)
                    module.reset_caches()
                    try:
                        fn = lane_function(checker, name, root, extra(root) if extra else None)
                        observed, error = adapter(fn, family, root, _read(root, REGISTRY)), None
                    except Exception as exc:  # reported, never a kill
                        observed, error = None, type(exc).__name__ + ": " + str(exc)[:300]
                    results.append({"lane": lane, "family": family, "scenario": defect_name, "expected_accepted": accepted,
                                    "observed_accepted": observed, "error": error, "ok": observed is accepted})
                    shutil.rmtree(root)
    finally:
        sys.modules["pm_ea_admission_mode"] = admission_mode
    return results


GOAL_CASES = [  # S3: pm_goal_own_a_oracles.replaces_or_selected over the revision defects (True = prepared/identity holds)
    ("rev_admitted_tree_revised", True), ("rev_pre_revision_tree_unrevised", True), ("rev_a_record_deleted", False),
    ("rev_b_record_after_revision", False), ("rev_c_any_v3_row", False), ("rev_d_unrevised_row_marked_successor", False),
]


def run_goal_scenarios(module, repo: Path = REPO) -> list[dict]:
    results = []
    defects = {name: defect for name, defect, *_ in REVISION_SCENARIOS}
    sys.modules["pm_ea_admission_mode"] = module
    try:
        with tempfile.TemporaryDirectory(prefix="pm-ea-goal-mode-") as scratch:
            base = Path(scratch) / "base"
            for rel in admission_mode.inputs([REVISED], repo) + [PREPARED_ROWS]:
                (base / rel).parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(repo / rel, base / rel)
            for name, accepted in GOAL_CASES:
                root = Path(scratch) / name
                shutil.copytree(base, root)
                if defects[name] is not None:
                    defects[name](root)
                module.reset_caches()
                try:
                    ok_fn = lane_function("scripts/pm_goal_own_a_oracles.py", "prepared_replaces_ok", root)
                    fn = lane_function("scripts/pm_goal_own_a_oracles.py", "replaces_or_selected", root,
                                       {"prepared_replaces_ok": ok_fn})
                    observed, error = fn(_prepared_entry(root), _row(root, REVISED)), None
                except Exception as exc:  # reported, never a kill
                    observed, error = None, type(exc).__name__ + ": " + str(exc)[:300]
                results.append({"lane": "S3", "family": REVISED, "scenario": name, "expected_accepted": accepted,
                                "observed_accepted": observed, "error": error, "ok": observed is accepted})
                shutil.rmtree(root)
    finally:
        sys.modules["pm_ea_admission_mode"] = admission_mode
    return results


# revised_predecessor_rows: the S3 historical reader keeps goal_run.stopped's v2 selection only while its revision
# is record-bound ('refused' = the v2 predecessor is withheld, the protective outcome).
PREDECESSOR_CASES = [
    ("rev_admitted_tree_revised", "admitted"), ("rev_a_record_deleted", "refused"), ("rev_b_record_after_revision", "refused"),
    ("rev_c_any_v3_row", "refused"), ("rev_record_without_revision", "refused"), ("rev_pre_revision_tree_unrevised", "refused"),
]


def run_predecessor_scenarios(module, repo: Path = REPO) -> list[dict]:
    results = []
    defects = {name: defect for name, defect, *_ in REVISION_SCENARIOS}
    with tempfile.TemporaryDirectory(prefix="pm-ea-predecessor-") as scratch:
        base = Path(scratch) / "base"
        for rel in admission_mode.inputs([REVISED], repo) + [PREPARED_ROWS]:
            (base / rel).parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(repo / rel, base / rel)
        before = _read(base, REVISION_DIR + "/" + REVISED + ".json")["before_row"]
        for name, expected in PREDECESSOR_CASES:
            root = Path(scratch) / name
            shutil.copytree(base, root)
            if defects[name] is not None:
                defects[name](root)
            module.reset_caches()
            try:
                rows = module.revised_predecessor_rows(root)
                kept = any(admission_mode.canonical_sha256(r) == admission_mode.canonical_sha256(before) for r in rows)
                observed, error = {"mode": "admitted" if kept else "refused", "code": None}, None
            except Exception as exc:  # reported, never a kill
                observed, error = None, type(exc).__name__ + ": " + str(exc)[:300]
            results.append({"scenario": "predecessor:" + name, "family": REVISED, "expected": {"mode": expected, "code": None},
                            "observed": observed, "error": error, "ok": observed == {"mode": expected, "code": None}})
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


class LaneAdmissionFunctions(unittest.TestCase):
    def test_every_lane_function_accepts_only_the_record_bound_admission(self):
        results = run_lane_scenarios(admission_mode)
        self.assertEqual(len(results), len(LANE_CASES) * len(LANE_DEFECTS))
        for result in results:
            with self.subTest(result["lane"] + ":" + result["scenario"]):
                self.assertIsNone(result["error"])
                self.assertTrue(result["ok"], result)


    def test_output_metadata_names_record_bound_and_prepared_states(self):
        for lane, checker, name, family, _, _ in LANE_CASES:
            if lane not in ('DMEM-report', 'DG6A-alert-report', 'DG6A-concern-report', 'DG6A-panel-report'):
                continue
            with self.subTest(lane):
                fn = lane_function(checker, name, REPO)
                row = _row(REPO, family)
                ref = row['retention_policy_ref']
                policy = 'RECORD_BOUND:' + ref['policy_id'] + '@' + ref['policy_version']
                self.assertEqual(fn([family]), dict(admission='RECORD_BOUND', retention={family: policy},
                                                    admission_counts=dict(prepared=0, admitted=1, refused=0)))
                self.assertEqual(fn([PREPARED]), dict(admission='ABSENT', retention={PREPARED: 'PENDING_RETENTION_DECISION'},
                                                      admission_counts=dict(prepared=1, admitted=0, refused=0)))
                mixed = fn([family, PREPARED])
                self.assertEqual(mixed['admission'], 'ABSENT_AND_RECORD_BOUND')
                self.assertEqual(mixed['retention'], {family: policy, PREPARED: 'PENDING_RETENTION_DECISION'})


class RevisionModeStandingNegatives(unittest.TestCase):
    def test_every_revision_scenario_has_its_expected_verdict(self):
        results = run_revision_scenarios(admission_mode)
        self.assertEqual(len(results), len(REVISION_SCENARIOS))
        for result in results:
            with self.subTest(result["scenario"]):
                self.assertIsNone(result["error"])
                self.assertTrue(result["ok"], result)

    def test_goal_prepared_identity_accepts_only_the_exact_selected_successor(self):
        results = run_goal_scenarios(admission_mode)
        self.assertEqual(len(results), len(GOAL_CASES))
        for result in results:
            with self.subTest(result["scenario"]):
                self.assertIsNone(result["error"])
                self.assertTrue(result["ok"], result)

    def test_predecessor_rows_only_through_the_exact_revision_record(self):
        results = run_predecessor_scenarios(admission_mode)
        self.assertEqual(len(results), len(PREDECESSOR_CASES))
        for result in results:
            with self.subTest(result["scenario"]):
                self.assertIsNone(result["error"])
                self.assertTrue(result["ok"], result)

    def test_every_revision_refusal_code_is_reached(self):
        reached = {code for *_, mode, code in REVISION_SCENARIOS if mode == "refused"}
        self.assertEqual(reached, set(admission_mode.REVISION_CODES))


if __name__ == "__main__":
    unittest.main()
