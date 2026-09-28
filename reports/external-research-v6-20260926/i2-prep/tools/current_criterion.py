#!/usr/bin/env python3
"""Prospective, read-only lineage/fidelity criterion; never semantic approval.

Consumes a frozen archive, not live workspace inputs. No Store is instantiated:
in particular this module never publishes or repairs the evidence it assesses.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
from pathlib import Path

_spec = importlib.util.spec_from_file_location("criterion_i2_store_wrapper", Path(__file__).with_name("research_store.py"))
_wrapper = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_wrapper)
# The helper verifies the frozen D1 source pin and applies declared I2 capacities
# to a private module object. Loading uses absolute paths, independent of cwd.
frozen = _wrapper.frozen_module()


def _pairs(items):
    value = {}
    for key, item in items:
        if key in value:
            raise ValueError(f"duplicate JSON key: {key}")
        value[key] = item
    return value


def load_json(raw: bytes):
    return json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs)


def exact(actual, expected):
    # Python equality equates True with 1; JSON field fidelity must not do so.
    return json.dumps(actual, ensure_ascii=False, sort_keys=True) == json.dumps(expected, ensure_ascii=False, sort_keys=True)


def synthetic_assertions(current: dict, expectation: dict) -> dict:
    """Exact artificial-task expectations, NOT a general semantic validator.

    Whole records are compared, including source_fit/condition. These fields have
    no lexical exemption. Assertion and condition checks name one designated part;
    markers elsewhere cannot satisfy them. Legitimate historical quotes can remain.
    """
    findings = current.get("findings", [])
    checks = {"exact_full_fields": exact(findings, expectation["findings"])}
    for key in ("designated_assertion", "required_condition"):
        target = expectation[key]
        matching = [part for finding in findings if finding.get("id") == target["finding_id"]
                    for part in finding.get("parts", []) if part.get("id") == target["part_id"]]
        checks[key] = len(matching) == 1 and exact(matching[0], {
            "id": target["part_id"], "type": target["type"], "text": target["text"]})
    return {"scope": "synthetic_task_assertions_only", "passed": all(checks.values()), "checks": checks}


def check_archive(archive: Path, expectation: dict | None = None) -> dict:
    """Independently derive lineage from request order and immutable raw bytes.

    State status/finding/revision and the published projection are checked, not
    used as the parsed current record. Mutation/protocol flags are retained audit
    signals; snapshots alone cannot reconstruct native writes or pending inputs.
    """
    archive = Path(archive).resolve()
    errors, identities, latest, unbound, hashes = [], {}, {}, [], {}
    history_gaps = []

    def read(name):
        path = archive / name
        if path.is_symlink() or not path.is_file() or not path.resolve().is_relative_to(archive):
            raise ValueError(f"missing/nonregular/outside archive: {name}")
        raw = path.read_bytes()
        hashes[name] = hashlib.sha256(raw).hexdigest()
        return raw

    def snapshot(attempt, field, digest, expected_name):
        name, claimed_hash = attempt.get(field), attempt.get(digest)
        if name is None and claimed_hash is None:
            return None, False
        try:
            if name != expected_name:
                raise ValueError(f"unexpected {field} path: {name!r}")
            raw = read(name)
            if hashlib.sha256(raw).hexdigest() != claimed_hash:
                raise ValueError(f"{field} SHA-256 mismatch")
            return raw, False
        except (OSError, ValueError) as exc:
            errors.append(f"attempt {attempt.get('sequence')}: {exc}")
            history_gaps.append({"attempt": attempt.get("sequence"), "kind": field})
            return None, True

    try:
        state = load_json(read("state.json"))
        if state.get("schema") != "finding-receipts/v2" or not isinstance(state.get("attempts"), list):
            raise ValueError("unsupported state schema/attempts")
        if state.get("closed") is not True:
            raise ValueError("archive is not closed: state.closed must be strictly true")
        seen, next_id = set(), 1
        for sequence, attempt in enumerate(state["attempts"], 1):
            request = attempt.get("request")
            if not exact(attempt.get("sequence"), sequence) or not isinstance(request, str) or request in seen:
                raise ValueError("attempt sequence/request order is malformed")
            seen.add(request)
            raw, raw_gap = snapshot(attempt, "snapshot", "raw_sha256", f"snapshots/{sequence:04d}.md")
            marker, marker_gap = snapshot(attempt, "marker_snapshot", "marker_sha256", f"snapshots/{sequence:04d}.request")
            match = frozen.NAME.fullmatch(request)
            fid, revision = None, None
            if match and match[1] == "new":
                fid = f"F{next_id:04d}"
                next_id += 1
            elif match and match[1] in identities:
                fid = match[1]
            if fid:
                revision = identities.get(fid, 0) + 1
                identities[fid] = revision
            for key, expected in (("finding_id", fid), ("revision", revision)):
                if not exact(attempt.get(key), expected):
                    errors.append(f"attempt {sequence}: {key} differs from request-derived identity")
            finding, reason = None, None
            status = "INVALID"
            if fid and marker == b"submit\n" and raw is not None:
                try:
                    finding, reason = frozen.parse_finding(raw, fid, match[1] != "new")
                    status = "VALID_UNVERIFIED"
                except frozen.StructuralError:
                    pass
            if not (raw_gap or marker_gap):
                for key, expected in (("status", status), ("finding", finding), ("change_reason", reason)):
                    if not exact(attempt.get(key), expected):
                        errors.append(f"attempt {sequence}: {key} differs from snapshot-derived parse")
            effective = status
            if "invalidated" in attempt and type(attempt["invalidated"]) is not bool:
                errors.append(f"attempt {sequence}: invalidated must be boolean")
            if attempt.get("invalidated"):
                effective = "INVALID_MUTATED_SUBMISSION"
            if raw_gap or marker_gap or (attempt.get("status") == "VALID_UNVERIFIED" and (raw is None or marker is None)):
                effective = "INCOMPLETE_SNAPSHOT"
                if not (raw_gap or marker_gap):
                    errors.append(f"attempt {sequence}: accepted record lacks snapshot bytes")
            if fid:
                latest[fid] = {"sequence": sequence, "status": effective, "finding": finding}
            else:
                unbound.append(request)
        if not exact(state.get("next_id"), next_id):
            errors.append("next_id differs from request-derived identities")
        findings = [row["finding"] for row in latest.values() if row["status"] == "VALID_UNVERIFIED"]
        complete = bool(latest) and len(findings) == len(latest) and not (
            unbound or history_gaps or errors or state.get("protocol_errors"))
        delivery_status = "STRUCTURALLY_COMPLETE_UNVERIFIED" if complete else "INCOMPLETE"
        expected = frozen.legacy.project_current({"schema": frozen.legacy.SCHEMA_DRAFT, "findings": findings}) if findings else {
            "schema": frozen.legacy.SCHEMA_CURRENT, "status": "UNVERIFIED", "findings": []}
        expected["delivery_status"] = delivery_status
        expected["incomplete_records"] = {fid: {"status": row["status"], "latest_attempt": row["sequence"]}
                                          for fid, row in latest.items() if row["status"] != "VALID_UNVERIFIED"}
        body = frozen.legacy.render_current(expected)
        body += "\n## Structural delivery status\n\n" + delivery_status + "\n"
        for fid, row in expected["incomplete_records"].items():
            body += f"\n- {fid}: {row['status']} (latest attempt {row['latest_attempt']}); older content is audit-only.\n"
        if unbound or state.get("protocol_errors") or history_gaps:
            body += "\nUnresolved structural/chronology errors; inspect structural status and separate audit.\n"
        actual = load_json(read("current.json"))
        json_match = exact(actual, expected)
        md_match = read("current.md") == body.encode("utf-8")
        # history.json is another published projection, not a source of lineage.
        history_match = exact(load_json(read("history.json")), {"attempts": state["attempts"], "history_gaps": history_gaps})
        result = {"schema": "prospective-current-criterion/v1", "passed": not errors and json_match and md_match and history_match,
                  "projection_fidelity": json_match and md_match, "history_fidelity": history_match,
                  "temporal_integrity": not errors, "structurally_complete": complete,
                  "current_json_exact": json_match, "current_markdown_exact": md_match,
                  "latest_states": {fid: {"status": row["status"], "latest_attempt": row["sequence"]} for fid, row in latest.items()},
                  "errors": errors, "input_sha256": hashes,
                  "semantic_validation": "not_performed",
                  "boundary": "archive-only; native trace, unobserved writes and pending workspace inputs are not verified"}
        if expectation is not None:
            result["synthetic_task_assertions"] = synthetic_assertions(actual, expectation)
        return result
    except (OSError, UnicodeError, ValueError, KeyError, TypeError, AttributeError) as exc:
        return {"schema": "prospective-current-criterion/v1", "passed": False, "projection_fidelity": False,
                "temporal_integrity": False, "structurally_complete": False,
                "semantic_validation": "not_performed", "errors": errors + [str(exc)], "input_sha256": hashes}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    parser.add_argument("--synthetic-expectation", type=Path)
    args = parser.parse_args()
    expectation = load_json(args.synthetic_expectation.read_bytes()) if args.synthetic_expectation else None
    result = check_archive(args.archive, expectation)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
