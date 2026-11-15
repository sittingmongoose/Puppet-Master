#!/usr/bin/env python3
"""Admission-aware mode for the Event Authority lane checkers (PNC-019, stream E; tool issues T222 and T225).

The lane checkers were written for the preparation phase: each one required its families to be absent from
``Plans/event_family_registry.json``. After an admission merge a family is registered, and a checker must then
accept it only through its exact, complete DL-077 admission record. Every lane checker asks this module for one
verdict per family and keeps every preparation guard it had:

``verdict(event_type, root=..., registry=..., prepared_row=...)`` returns a dict whose ``mode`` is

``prepared``
    The family is not on the registry, and no admission record names it. The checker runs exactly as it did
    during preparation.
``admitted``
    The family is registered once, and its DL-077 record is exact and complete (below). The checker accepts the
    registration in place of its "must remain unadmitted" guard.
``refused``
    Anything else. ``code`` names the first problem, in the order below; ``detail`` says what differed. The
    checker refuses the family through its own preparation guard and adds ``code`` to the message.

Admitted means all of these, checked in this order; the first that fails is the code:

 1. exactly one registry row has the event type, and no other row has its family_id    registered_more_than_once
 2. ``reports/event-authority-20260911/admission-records/<event_type>.json`` exists       registered_without_admission_record
 3. it is one JSON object naming this event type, and no other record names it          admission_record_not_for_family
 4. it records one registry step of one family (no ``registry_step_event_types``)       admission_record_step_unsupported
 5. the live row's canonical SHA-256 equals the record's ``registry_row_sha256``        registry_row_differs_from_pinned_row
    and, when the lane passes its own prepared row, that row's too                       registry_row_differs_from_prepared_row
 6. the frozen seal check's own ``admission_record_problems(record, row)`` is empty      admission_record_incomplete
    (schema id, implementation receipt bytes, family id, decision entry bytes, both registry pins' shape and
    one-family step, row hash, and the pinned 12/12 depth assessment with Plans evidence)
 7. ``registry_before`` is this registry's own history at the pinned revision            registry_before_mismatch
 8. ``registry_after`` is too, with this family's pinned row as its last row             registry_after_mismatch
    Both are first rebuilt from the live registry: its first N rows at the pinned revision, rendered as the
    registry is written, must hash to the pinned SHA-256. When that differs (an earlier row was revised after
    the admission), the exact blob is looked up in the checkout's own git history instead, read-only: it must
    have the pinned revision and family count, the before blob must be the after blob less its last row, and
    the last row must be this family's pinned row.
 9. the decision entry the record pins names the row hash and both registry pins         decision_entry_does_not_pin_admission
10. the landing record the record names exists and names the event type                   admission_landing_record_missing

A family that is not registered while an admission record names it is ``refused`` with
``admission_record_without_registration``.

The module reads files only. Its single subprocess is the read-only git lookup of steps 7 and 8, run with
``git -C <root>`` and without inherited ``GIT_DIR``/``GIT_WORK_TREE``, and only when ``root`` is itself the top
of a git work tree. It never edits the frozen validator, the registry or a record. ``native_execution`` stays
NOT_RUN: this is static planning evidence.

``python3 scripts/pm_ea_admission_mode.py [--json OUT] [event_type ...]`` prints the verdict of each named
family (default: every family with an admission record and every registered family beyond the record set).
"""

from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = "Plans/event_family_registry.json"
DECISION_LOG = "Plans/Decision_Log.md"
RECORD_DIR = "reports/event-authority-20260911/admission-records"
FROZEN = "Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py"
STEP_FIELD = "registry_step_event_types"
POST_AUGUST_RECEIPT = "reports/event-authority-20260911/step-10-post-august-admission-receipt.json"

CODES = (
    "registered_more_than_once",
    "registered_without_admission_record",
    "admission_record_not_for_family",
    "admission_record_step_unsupported",
    "registry_row_differs_from_pinned_row",
    "registry_row_differs_from_prepared_row",
    "admission_record_incomplete",
    "registry_before_mismatch",
    "registry_after_mismatch",
    "decision_entry_does_not_pin_admission",
    "admission_landing_record_missing",
    "admission_record_without_registration",
)

_FROZEN: dict = {}
_HISTORY: dict = {}


def canonical_sha256(value) -> str:
    """The DL-077 row recipe: sorted keys, compact separators, UTF-8."""
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
                          .encode("utf-8")).hexdigest()


def rendered(doc: dict) -> bytes:
    """The registry exactly as the admission writer writes it."""
    return (json.dumps(doc, indent=2, ensure_ascii=False) + "\n").encode("utf-8")


def load_registry(root: Path = ROOT) -> dict:
    return json.loads((Path(root) / REGISTRY).read_text(encoding="utf-8"))


def frozen_module(root: Path = ROOT):
    """The frozen seal check, loaded from ``root`` itself so its paths are that tree's (never edited)."""
    path = (Path(root) / FROZEN).resolve()
    if path not in _FROZEN:
        spec = importlib.util.spec_from_file_location("pm_ea_admission_mode_frozen_%d" % len(_FROZEN), path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        _FROZEN[path] = module
    return _FROZEN[path]


def reset_caches() -> None:
    """Forget loaded frozen modules and git histories (a test that edits a tree between verdicts)."""
    _FROZEN.clear()
    _HISTORY.clear()


def _refused(event_type: str, code: str, detail) -> dict:
    assert code in CODES, code
    return {"event_type": event_type, "mode": "refused", "code": code, "detail": detail}


def _git_history(root: Path) -> dict | None:
    """sha256 -> registry bytes for every registry blob reachable from HEAD; None when root is no git top level."""
    root = Path(root).resolve()
    if root in _HISTORY:
        return _HISTORY[root]
    env = {k: v for k, v in os.environ.items() if k not in ("GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE",
                                                           "GIT_OBJECT_DIRECTORY", "GIT_COMMON_DIR")}
    history = None
    try:
        top = subprocess.run(["git", "-C", str(root), "rev-parse", "--show-toplevel"], env=env,
                             capture_output=True, text=True, timeout=60)
        if top.returncode == 0 and Path(top.stdout.strip()).resolve() == root:
            log = subprocess.run(["git", "-C", str(root), "log", "--format=", "--raw", "--no-abbrev", "--no-renames",
                                  "-m", "HEAD", "--", REGISTRY], env=env, capture_output=True, text=True, timeout=300)
            if log.returncode == 0:
                blobs = sorted({field for line in log.stdout.splitlines() if line.startswith(":")
                                for field in line.split()[2:4] if not set(field) <= {"0"}})
                batch = subprocess.run(["git", "-C", str(root), "cat-file", "--batch"], env=env,
                                       input=("\n".join(blobs) + "\n").encode(), capture_output=True, timeout=300)
                if batch.returncode == 0:
                    history, out, at = {}, batch.stdout, 0
                    while at < len(out):
                        newline = out.index(b"\n", at)
                        header = out[at:newline].split()
                        if len(header) != 3 or header[1] != b"blob":
                            history = None
                            break
                        size = int(header[2])
                        body = out[newline + 1:newline + 1 + size]
                        history[hashlib.sha256(body).hexdigest()] = body
                        at = newline + 1 + size + 1
    except (OSError, ValueError, subprocess.SubprocessError):
        history = None
    _HISTORY[root] = history
    return history


def _prefix(doc: dict, revision: str, count: int) -> bytes:
    rebuilt = dict(doc)
    rebuilt["families"] = doc["families"][:count]
    rebuilt["registry_revision"] = revision
    return rendered(rebuilt)


def _pins_match(side: dict, doc) -> bool:
    return (isinstance(doc, dict) and doc.get("registry_revision") == side.get("revision")
            and isinstance(doc.get("families"), list) and len(doc["families"]) == side.get("family_count"))


def registry_history_problem(record: dict, registry: dict, index: int, root: Path) -> tuple[str, dict] | None:
    """Steps 7 and 8: (code, detail) when the record's registry pins are not this registry's own history.

    First the live-registry rebuild; when it cannot prove both pins (or the row is not at the pinned position), the
    checkout's git history, when there is one. Each route judges the before pin first, then the after pin.
    """
    before, after = record["registry_before"], record["registry_after"]
    rebuilt_before = rebuilt_after = None
    if index == after["family_count"] - 1 and after["family_count"] <= len(registry["families"]):
        rebuilt_before = hashlib.sha256(_prefix(registry, before["revision"], before["family_count"])).hexdigest()
        rebuilt_after = hashlib.sha256(_prefix(registry, after["revision"], after["family_count"])).hexdigest()
        if rebuilt_before == before["sha256"] and rebuilt_after == after["sha256"]:
            return None
    history = _git_history(root)
    if history is None:
        detail = {"route": "rebuild", "row_index": index, "rebuilt_before_sha256": rebuilt_before,
                  "rebuilt_after_sha256": rebuilt_after}
        if rebuilt_before is not None and rebuilt_before != before["sha256"]:
            return "registry_before_mismatch", dict(detail, pinned=before)
        return "registry_after_mismatch", dict(detail, pinned=after)
    found_after, found_before = history.get(after["sha256"]), history.get(before["sha256"])
    after_doc = json.loads(found_after.decode("utf-8")) if found_after is not None else None
    before_doc = json.loads(found_before.decode("utf-8")) if found_before is not None else None
    detail = {"route": "git_history", "registry_blobs": len(history)}
    if not _pins_match(before, before_doc):
        return "registry_before_mismatch", dict(detail, pinned=before, blob_found=before_doc is not None)
    if not (_pins_match(after, after_doc) and after_doc["families"]
            and isinstance(after_doc["families"][-1], dict)
            and after_doc["families"][-1].get("event_type") == record.get("event_type")
            and canonical_sha256(after_doc["families"][-1]) == record.get("registry_row_sha256")):
        return "registry_after_mismatch", dict(detail, pinned=after, blob_found=after_doc is not None)
    if canonical_sha256(before_doc["families"]) != canonical_sha256(after_doc["families"][:-1]):
        return "registry_before_mismatch", dict(detail, pinned=before, before_is_after_less_its_last_row=False)
    return None


def verdict(event_type: str, *, root: Path = ROOT, registry: dict | None = None, prepared_row: dict | None = None) -> dict:
    """The admission verdict of one family (see the module docstring for the ten steps and their codes)."""
    root = Path(root)
    registry = load_registry(root) if registry is None else registry
    families = [f for f in registry.get("families", []) if isinstance(f, dict)]
    rows = [(i, f) for i, f in enumerate(families) if f.get("event_type") == event_type]
    record_path = root / RECORD_DIR / (event_type + ".json")
    if not rows:
        if record_path.exists():
            return _refused(event_type, "admission_record_without_registration", RECORD_DIR + "/" + event_type + ".json")
        return {"event_type": event_type, "mode": "prepared"}
    # 1. One registration.
    index, row = rows[0]
    same_id = [f for f in families if f.get("family_id") == row.get("family_id")]
    if len(rows) != 1 or len(same_id) != 1:
        return _refused(event_type, "registered_more_than_once", {"rows": len(rows), "family_id_rows": len(same_id)})
    # 2. Its record.
    if not record_path.is_file():
        return _refused(event_type, "registered_without_admission_record", RECORD_DIR + "/" + event_type + ".json")
    # 3. The record is for this family, and the only one.
    try:
        record = json.loads(record_path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        return _refused(event_type, "admission_record_not_for_family", "unreadable: " + str(exc))
    if not isinstance(record, dict) or record.get("event_type") != event_type:
        return _refused(event_type, "admission_record_not_for_family",
                        {"record_event_type": record.get("event_type") if isinstance(record, dict) else None})
    claims = []
    for other in sorted((root / RECORD_DIR).glob("*.json")):
        if other.name == record_path.name:
            continue
        try:
            value = json.loads(other.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if isinstance(value, dict) and value.get("event_type") == event_type:
            claims.append(other.name)
    if claims:
        return _refused(event_type, "admission_record_not_for_family", {"other_records": claims})
    # 4. One family per step.
    if STEP_FIELD in record:
        return _refused(event_type, "admission_record_step_unsupported", record.get(STEP_FIELD))
    # 5. The live row is the pinned (prepared, reviewed) row.
    row_sha = canonical_sha256(row)
    if row_sha != record.get("registry_row_sha256"):
        return _refused(event_type, "registry_row_differs_from_pinned_row",
                        {"live": row_sha, "pinned": record.get("registry_row_sha256")})
    if prepared_row is not None and canonical_sha256(prepared_row) != row_sha:
        return _refused(event_type, "registry_row_differs_from_prepared_row",
                        {"prepared": canonical_sha256(prepared_row), "pinned": row_sha})
    # 6. Complete under the frozen seal check's own record predicate.
    frozen = frozen_module(root)
    try:
        problems = frozen.admission_record_problems(record, row)
    except (OSError, ValueError, TypeError, KeyError, AttributeError) as exc:
        problems = ["malformed: " + str(exc)]
    if problems:
        return _refused(event_type, "admission_record_incomplete", problems)
    # 7 and 8. Both registry pins are this registry's own history.
    problem = registry_history_problem(record, registry, index, root)
    if problem is not None:
        return _refused(event_type, *problem)
    # 9. The decision entry pins this admission.
    number = record["decision_ref"].split("#", 1)[1]
    section = frozen.decision_section_bytes(root / DECISION_LOG, number)
    before, after = record["registry_before"], record["registry_after"]
    tokens = [record["registry_row_sha256"], before["revision"], before["sha256"], after["revision"], after["sha256"]]
    missing = [token for token in tokens if token.encode("utf-8") not in section]
    if missing:
        return _refused(event_type, "decision_entry_does_not_pin_admission", {"decision": number, "missing": missing})
    # 10. The landing record.
    landing = record.get("admission_landing")
    landing_rel = landing.get("record") if isinstance(landing, dict) else None
    landing_path = root / landing_rel if isinstance(landing_rel, str) and ".." not in Path(landing_rel).parts else None
    if (landing_path is None or not landing_path.is_file()
            or event_type.encode("utf-8") not in landing_path.read_bytes()):
        return _refused(event_type, "admission_landing_record_missing", landing_rel)
    return {"event_type": event_type, "mode": "admitted", "family_id": row["family_id"],
            "family_revision": row.get("family_revision"), "row_index": index, "row_sha256": row_sha,
            "record": RECORD_DIR + "/" + event_type + ".json",
            "record_sha256": hashlib.sha256(record_path.read_bytes()).hexdigest(),
            "decision_ref": record["decision_ref"], "registry_before": copy.deepcopy(before),
            "registry_after": copy.deepcopy(after), "landing_record": landing_rel}


def verdicts(event_types, *, root: Path = ROOT, registry: dict | None = None, prepared_rows: dict | None = None) -> dict:
    """{event_type: verdict} over one registry read."""
    root = Path(root)
    registry = load_registry(root) if registry is None else registry
    prepared_rows = prepared_rows or {}
    return {et: verdict(et, root=root, registry=registry, prepared_row=prepared_rows.get(et))
            for et in sorted(set(event_types))}


def problem(event_type: str, **kwargs) -> str | None:
    """None when the family is prepared or admitted; otherwise the refusal code."""
    result = verdict(event_type, **kwargs)
    return result["code"] if result["mode"] == "refused" else None


def summary(results: dict) -> dict:
    """Counts by mode and the refusals, for a checker's JSON output."""
    out = {"prepared": sorted(et for et, v in results.items() if v["mode"] == "prepared"),
           "admitted": sorted(et for et, v in results.items() if v["mode"] == "admitted"),
           "refused": [{"event_type": et, "code": v["code"], "detail": v["detail"]}
                       for et, v in sorted(results.items()) if v["mode"] == "refused"]}
    out["counts"] = {mode: len(out[mode]) for mode in ("prepared", "admitted", "refused")}
    return out


def gate_failures(results: dict) -> list[str]:
    """One failure line per refused family: '<event_type>: admission mode refused: <code>'."""
    return [et + ": admission mode refused: " + v["code"] for et, v in sorted(results.items()) if v["mode"] == "refused"]


def lane_gate(event_types, root: Path = ROOT) -> tuple[dict, list[str]]:
    """(summary, failure lines) of the admission gate a lane checker adds to its own result.

    A checker whose oracles model registry membership synthetically (membership ABSENT) calls this once over its
    families: prepared and admitted families pass, and every refused family fails the run with its code.
    """
    results = verdicts(event_types, root=root)
    return summary(results), gate_failures(results)


def inputs(event_types, root: Path = ROOT) -> list[str]:
    """Repository-relative paths a disposable copy of the tree needs for these verdicts."""
    root = Path(root)
    paths = {REGISTRY, DECISION_LOG, FROZEN, POST_AUGUST_RECEIPT, "scripts/pm_ea_admission_mode.py"}
    paths.update(str(p.relative_to(root)) for p in sorted((root / RECORD_DIR).glob("*.json")))
    for et in event_types:
        path = root / RECORD_DIR / (et + ".json")
        if not path.is_file():
            continue
        try:
            record = json.loads(path.read_text(encoding="utf-8"))
        except ValueError:
            continue
        depth = record.get("depth_assessment") if isinstance(record, dict) else None
        if isinstance(depth, dict) and isinstance(depth.get("path"), str):
            paths.add(depth["path"])
        landing = record.get("admission_landing") if isinstance(record, dict) else None
        if isinstance(landing, dict) and isinstance(landing.get("record"), str):
            paths.add(landing["record"])
    return sorted(p for p in paths if (root / p).exists())


def main(argv=None) -> int:
    args = list(sys.argv[1:] if argv is None else argv)
    out = None
    if "--json" in args:
        at = args.index("--json")
        out = Path(args[at + 1])
        del args[at:at + 2]
    registry = load_registry(ROOT)
    names = args or sorted({p.stem for p in (ROOT / RECORD_DIR).glob("*.json")})
    results = verdicts(names, registry=registry)
    report = {"status": "pass" if not gate_failures(results) else "fail", "registry_revision": registry["registry_revision"],
              "families": len(registry["families"]), **summary(results), "native_execution": "NOT_RUN"}
    text = json.dumps(report, indent=1, ensure_ascii=False)
    if out is not None:
        out.write_text(text + "\n", encoding="utf-8")
    print(text)
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
