#!/usr/bin/env python3
"""Offline, type-preserving finding carrier and conservative delivery assembler.

Structural checks establish coverage of records, never the truth of a finding.
No network, source reading, model calls, or runner integration occurs here.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
import sys
from pathlib import Path
from typing import Any

SCHEMA_DRAFT = "offline-finding-draft/v1"
SCHEMA_REVIEW = "offline-finding-review/v1"
SCHEMA_DELIVERY = "offline-finding-delivery/v1"
SCHEMA_CURRENT = "offline-finding-current/v1"
PART_TYPES = frozenset({
    "assertion", "condition", "implication", "validation_proposal",
    "uncertainty", "source_fit", "plan_fit", "non_finding",
})
EVIDENCE_KINDS = frozenset({"source_text", "plan_text", "issue_title", "search_result", "secondary_summary"})
DIRECT_KINDS = frozenset({"source_text", "plan_text"})
ACTION_TYPES = frozenset({"keep", "replace", "remove", "unresolved"})
BASES = frozenset({"supported", "counterevidence", "absence", "insufficient"})
ID = re.compile(r"^[A-Z][A-Z0-9_-]*$")
ABSENCE_WORDS = re.compile(
    r"\b(?:absen(?:ce|t)|missing|not found|not in (?:the )?evidence|"
    r"not (?:stated|documented|present|listed|mentioned|supported|implemented)|"
    r"not in (?:the )?(?:corpus|sources?|plan|spec|records?)|"
    r"no (?:in-corpus )?(?:source|evidence|match|citation|record|mention)|"
    r"no\b.{0,80}\b(?:exists?|found|listed|available|recorded|present)|"
    r"never (?:states?|shows?|documents?|supports?|mentions?|lists?)|"
    r"does not (?:state|show|document|support|mention|list|contain)|"
    r"did not (?:find|state|show|document|mention|list)|"
    r"unlisted|unsupported|lacks? (?:evidence|source|support|mention|coverage)|"
    r"without (?:evidence|source|support|mention|coverage))\b", re.I,
)


class CarrierError(ValueError):
    pass


def _unique_pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in pairs:
        if key in out:
            raise CarrierError(f"duplicate JSON key: {key}")
        out[key] = value
    return out


def load(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=_unique_pairs)
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise CarrierError(f"{path}: {exc}") from exc


def _text(value: Any, name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise CarrierError(f"{name} must be nonempty text")
    return value


def _id(value: Any, name: str) -> str:
    value = _text(value, name)
    if not ID.fullmatch(value):
        raise CarrierError(f"{name} must be a stable uppercase ID")
    return value


def _list(value: Any, name: str, nonempty: bool = True) -> list[Any]:
    if not isinstance(value, list) or (nonempty and not value):
        raise CarrierError(f"{name} must be {'nonempty ' if nonempty else ''}array")
    return value


def _allowed_keys(value: dict[str, Any], allowed: set[str], name: str) -> None:
    unknown = value.keys() - allowed
    if unknown:
        raise CarrierError(f"{name}: unsupported fields {sorted(unknown)}")


def _evidence(value: Any, name: str, required: bool = True) -> list[dict[str, str]]:
    rows = _list(value, name, required)
    for index, row in enumerate(rows):
        if not isinstance(row, dict):
            raise CarrierError(f"{name}[{index}] must be object")
        _allowed_keys(row, {"kind", "source", "locator", "quote"}, f"{name}[{index}]")
        if not isinstance(row.get("kind"), str) or row["kind"] not in EVIDENCE_KINDS:
            raise CarrierError(f"{name}[{index}].kind must be one of {sorted(EVIDENCE_KINDS)}")
        for field in ("source", "locator", "quote"):
            _text(row.get(field), f"{name}[{index}].{field}")
    return rows


def _part(part: Any, name: str) -> dict[str, Any]:
    if not isinstance(part, dict):
        raise CarrierError(f"{name} must be object")
    _allowed_keys(part, {"id", "type", "text", "evidence"}, name)
    _id(part.get("id"), f"{name}.id")
    if not isinstance(part.get("type"), str) or part["type"] not in PART_TYPES:
        raise CarrierError(f"{name}.type must be one of {sorted(PART_TYPES)}")
    _text(part.get("text"), f"{name}.text")
    # Investigator citations can be leads; the verifier's evidence is checked separately.
    if "evidence" in part:
        _evidence(part["evidence"], f"{name}.evidence", required=False)
    return part


def _finding(finding: Any, name: str, used_parts: set[str], allow_decisions: bool = False) -> dict[str, Any]:
    if not isinstance(finding, dict):
        raise CarrierError(f"{name} must be object")
    _allowed_keys(finding, {"id", "title", "parts"} | ({"decisions"} if allow_decisions else set()), name)
    _id(finding.get("id"), f"{name}.id")
    _text(finding.get("title"), f"{name}.title")
    parts = _list(finding.get("parts"), f"{name}.parts")
    for index, part in enumerate(parts):
        _part(part, f"{name}.parts[{index}]")
        if part["id"] in used_parts:
            raise CarrierError(f"duplicate part ID: {part['id']}")
        used_parts.add(part["id"])
    return finding


def validate_draft(draft: Any) -> list[dict[str, Any]]:
    if not isinstance(draft, dict) or draft.get("schema") != SCHEMA_DRAFT:
        raise CarrierError(f"draft.schema must be {SCHEMA_DRAFT}")
    _allowed_keys(draft, {"schema", "findings", "revision_history"}, "draft")
    findings = _list(draft.get("findings"), "draft.findings")
    used_findings: set[str] = set()
    used_parts: set[str] = set()
    for index, finding in enumerate(findings):
        _finding(finding, f"draft.findings[{index}]", used_parts)
        if finding["id"] in used_findings:
            raise CarrierError(f"duplicate finding ID: {finding['id']}")
        used_findings.add(finding["id"])
    if "revision_history" in draft:
        _list(draft["revision_history"], "draft.revision_history", False)
    return findings


def _absence_packet(value: Any, name: str) -> list[str]:
    defects: list[str] = []
    if not isinstance(value, dict):
        return [f"{name}: structured absence packet required"]
    try:
        _allowed_keys(value, {"scope", "context", "searches", "source_evidence", "assessment"}, name)
        _text(value.get("scope"), f"{name}.scope")
        context = _list(value.get("context"), f"{name}.context")
        for i, item in enumerate(context):
            if not isinstance(item, dict):
                raise CarrierError(f"{name}.context[{i}] must be object")
            _allowed_keys(item, {"kind", "source", "locator", "quote"}, f"{name}.context[{i}]")
            if not isinstance(item.get("kind"), str) or item["kind"] not in DIRECT_KINDS:
                raise CarrierError(f"{name}.context[{i}].kind must be source_text or plan_text")
            _text(item.get("source"), f"{name}.context[{i}].source")
            _text(item.get("locator"), f"{name}.context[{i}].locator")
            _text(item.get("quote"), f"{name}.context[{i}].quote")
        searches = _list(value.get("searches"), f"{name}.searches")
        for i, item in enumerate(searches):
            if not isinstance(item, dict):
                raise CarrierError(f"{name}.searches[{i}] must be object")
            _allowed_keys(item, {"pattern", "scope", "result"}, f"{name}.searches[{i}]")
            for field in ("pattern", "scope", "result"):
                _text(item.get(field), f"{name}.searches[{i}].{field}")
        source_evidence = _evidence(value.get("source_evidence"), f"{name}.source_evidence")
        if not any(item["kind"] in DIRECT_KINDS for item in source_evidence):
            raise CarrierError(f"{name}.source_evidence requires direct source or Plan text")
        if value.get("assessment") not in ("source_supported", "inconclusive"):
            raise CarrierError(f"{name}.assessment must be source_supported or inconclusive")
    except CarrierError as exc:
        defects.append(str(exc))
    return defects


def _decision_defects(decision: Any, original: dict[str, Any], name: str) -> list[str]:
    defects: list[str] = []
    if not isinstance(decision, dict):
        return [f"{name} must be object"]
    try:
        _allowed_keys(decision, {"part_id", "action", "basis", "reason", "evidence", "replacement", "absence"}, name)
    except CarrierError as exc:
        defects.append(str(exc))
    action = decision.get("action")
    basis = decision.get("basis")
    if not isinstance(action, str) or action not in ACTION_TYPES:
        defects.append(f"{name}.action invalid")
    if not isinstance(basis, str) or basis not in BASES:
        defects.append(f"{name}.basis invalid")
    try:
        _text(decision.get("reason"), f"{name}.reason")
    except CarrierError as exc:
        defects.append(str(exc))
    if action in ("keep", "replace") and basis not in ("supported", "counterevidence"):
        defects.append(f"{name}: retained content needs explicit supporting judgement")
    if action == "keep" and basis != "supported":
        defects.append(f"{name}: keep requires supported basis")
    if action == "remove" and basis not in ("counterevidence", "absence"):
        defects.append(f"{name}: remove requires counterevidence or absence")
    if action == "unresolved" and basis != "insufficient":
        defects.append(f"{name}: unresolved requires insufficient basis")
    if action in ("keep", "replace", "remove"):
        try:
            evidence = _evidence(decision.get("evidence"), f"{name}.evidence")
            if not any(item["kind"] in DIRECT_KINDS for item in evidence):
                defects.append(f"{name}: title/search/summary evidence is a lead only; direct source or Plan text required")
        except CarrierError as exc:
            defects.append(str(exc))
    if action == "replace":
        replacement = decision.get("replacement")
        if not isinstance(replacement, dict):
            defects.append(f"{name}: replacement object required")
        else:
            try:
                _allowed_keys(replacement, {"type", "text"}, f"{name}.replacement")
            except CarrierError as exc:
                defects.append(str(exc))
            if replacement.get("type") != original["type"]:
                defects.append(f"{name}: replacement must preserve original type")
            try:
                _text(replacement.get("text"), f"{name}.replacement.text")
            except CarrierError as exc:
                defects.append(str(exc))
    elif "replacement" in decision:
        defects.append(f"{name}: replacement only allowed for replace")
    prose = " ".join(str(x) for x in (
        decision.get("reason", ""),
        original.get("text", "") if action == "keep" else "",
        decision.get("replacement", {}).get("text", "") if isinstance(decision.get("replacement"), dict) else "",
    ))
    absence_needed = (basis == "absence" or bool(ABSENCE_WORDS.search(prose))
                      or (original["type"] == "non_finding" and action in ("keep", "replace")))
    if absence_needed:
        defects.extend(_absence_packet(decision.get("absence"), f"{name}.absence"))
        if isinstance(decision.get("absence"), dict):
            if decision["absence"].get("assessment") == "inconclusive" and action != "unresolved":
                defects.append(f"{name}: inconclusive absence cannot support a reviewed assertion or removal")
    return defects


def _review_finding(original: dict[str, Any], entries: list[Any]) -> dict[str, Any]:
    result = {"id": original["id"], "title": original["title"], "status": "UNRESOLVED",
              "parts": [], "defects": [], "original": original, "review_records": entries}
    if len(entries) != 1:
        result["defects"].append(f"expected one review record; found {len(entries)}")
        result["parts"] = [{"original": p, "current": None, "action": "unresolved"} for p in original["parts"]]
        return result
    entry = entries[0]
    if not isinstance(entry, dict):
        result["defects"].append("review finding must be object")
        result["parts"] = [{"original": p, "current": None, "action": "unresolved"} for p in original["parts"]]
        return result
    try:
        _allowed_keys(entry, {"id", "decisions"}, f"review.findings[{original['id']}]")
    except CarrierError as exc:
        result["defects"].append(str(exc))
    decisions = entry.get("decisions")
    if not isinstance(decisions, list):
        decisions = []
        result["defects"].append("review decisions must be array")
    by_part: dict[str, list[Any]] = {}
    for decision in decisions:
        if isinstance(decision, dict) and isinstance(decision.get("part_id"), str):
            by_part.setdefault(decision["part_id"], []).append(decision)
        else:
            result["defects"].append("decision lacks part_id")
    known = {part["id"] for part in original["parts"]}
    for unknown in sorted(by_part.keys() - known):
        result["defects"].append(f"unknown part_id {unknown}")
    for part in original["parts"]:
        candidates = by_part.get(part["id"], [])
        if len(candidates) != 1:
            result["defects"].append(f"{part['id']}: expected one decision; found {len(candidates)}")
            result["parts"].append({"original": part, "current": None, "action": "unresolved", "decisions": candidates})
            continue
        decision = candidates[0]
        result["defects"].extend(_decision_defects(decision, part, f"{original['id']}/{part['id']}"))
        action = decision.get("action")
        current = part if action == "keep" else decision.get("replacement") if action == "replace" else None
        result["parts"].append({"original": part, "current": current, "action": action, "decision": decision})
    if ABSENCE_WORDS.search(original["title"]):
        packets = [d.get("absence") for ds in by_part.values() for d in ds if isinstance(d, dict)]
        if not any(isinstance(packet, dict) and not _absence_packet(packet, f"{original['id']}.title.absence")
                   and packet.get("assessment") == "source_supported" for packet in packets):
            result["defects"].append(f"{original['id']}: negative finding title requires a source-supported absence packet")
    if result["defects"] or any(p["action"] == "unresolved" for p in result["parts"]):
        # One defective part invalidates the assembled whole finding. Preserve attempted changes in history.
        result["status"] = "UNRESOLVED"
        for part in result["parts"]:
            part["current"] = None
    else:
        result["status"] = "REVIEWED_VERIFIER_ASSERTION"
    return result


def assemble(draft: Any, review: Any | None = None) -> dict[str, Any]:
    findings = validate_draft(draft)
    output: dict[str, Any] = {
        "schema": SCHEMA_DELIVERY,
        "truth_validation": "not_established_by_assembler",
        "lint": "heuristic_absence_trigger_only; never evidence of truth or completeness",
        "findings": [], "diagnostics": [], "unmatched_review_records": [],
        "revision_history": draft.get("revision_history", []),
    }
    if review is None:
        for finding in findings:
            output["findings"].append({
                "id": finding["id"], "title": finding["title"], "status": "UNVERIFIED",
                "original": finding, "parts": [
                    {"original": p, "current": None, "action": "unverified"} for p in finding["parts"]
                ], "defects": [], "review_records": [],
            })
    else:
        if not isinstance(review, dict) or review.get("schema") != SCHEMA_REVIEW:
            raise CarrierError(f"review.schema must be {SCHEMA_REVIEW}")
        unknown_review_fields = sorted(review.keys() - {"schema", "findings", "new_findings"})
        if unknown_review_fields:
            output["diagnostics"].append(f"review: unsupported fields {unknown_review_fields}; all findings unresolved")
            output["unmatched_review_records"].append({key: review[key] for key in unknown_review_fields})
        review_rows = _list(review.get("findings"), "review.findings", False)
        by_finding: dict[str, list[Any]] = {}
        for row in review_rows:
            if isinstance(row, dict) and isinstance(row.get("id"), str):
                by_finding.setdefault(row["id"], []).append(row)
            else:
                output["unmatched_review_records"].append(row)
        known = {f["id"] for f in findings}
        for unknown in sorted(by_finding.keys() - known):
            output["diagnostics"].append(f"unknown review finding ID {unknown}")
            output["unmatched_review_records"].extend(by_finding[unknown])
        for finding in findings:
            output["findings"].append(_review_finding(finding, by_finding.get(finding["id"], [])))
        # New claims/non-findings are first-class findings with their own decisions, never auto-promoted.
        new_rows = review.get("new_findings", [])
        if not isinstance(new_rows, list):
            output["diagnostics"].append("new_findings must be array")
            new_rows = []
        used_parts = {p["id"] for f in findings for p in f["parts"]}
        seen = set(known)
        for index, row in enumerate(new_rows):
            try:
                new_finding = _finding(row, f"review.new_findings[{index}]", used_parts, allow_decisions=True)
                if new_finding["id"] in seen:
                    raise CarrierError(f"duplicate finding ID: {new_finding['id']}")
                seen.add(new_finding["id"])
                output["findings"].append(_review_finding(new_finding, [{"id": new_finding["id"], "decisions": row.get("decisions")}]))
            except CarrierError as exc:
                output["diagnostics"].append(str(exc))
                output["unmatched_review_records"].append(row)
        if unknown_review_fields:
            for finding in output["findings"]:
                finding["status"] = "UNRESOLVED"
                finding["defects"].append("review contains unsupported top-level fields")
                for part in finding["parts"]:
                    part["current"] = None
    output["mechanical_coverage"] = {
        "original_findings": len(findings),
        "original_parts": sum(len(f["parts"]) for f in findings),
        "reviewed_findings": sum(f["status"] == "REVIEWED_VERIFIER_ASSERTION" for f in output["findings"]),
        "unresolved_findings": sum(f["status"] == "UNRESOLVED" for f in output["findings"]),
        "unverified_findings": sum(f["status"] == "UNVERIFIED" for f in output["findings"]),
    }
    return output


def project_current(draft: Any) -> dict[str, Any]:
    """Project only the investigator's current typed content, never history or raw carrier.

    This is an I1 first-view acquisition artifact, not a verifier decision.
    """
    findings = validate_draft(draft)
    return {
        "schema": SCHEMA_CURRENT,
        "status": "UNVERIFIED",
        "truth_validation": "not_established_by_projection",
        "findings": [{
            "id": finding["id"],
            "title": finding["title"],
            "parts": [{key: copy.deepcopy(part[key]) for key in ("id", "type", "text", "evidence") if key in part}
                      for part in finding["parts"]],
        } for finding in findings],
    }


def _quoted(text: str) -> str:
    return "\n".join("> " + line for line in text.splitlines())


def _one_line(value: Any) -> str:
    return " ".join(str(value).split())


def _json_block(value: Any) -> str:
    return "\n".join("    " + line for line in json.dumps(value, indent=2, ensure_ascii=False).splitlines())


def _evidence_lines(value: Any, prefix: str) -> list[str]:
    lines: list[str] = []
    if isinstance(value, list):
        for item in value:
            if isinstance(item, dict):
                lines.append(f"{prefix}: {_one_line(item.get('source', '?'))} [{_one_line(item.get('kind', '?'))}] {_one_line(item.get('locator', '?'))} — {_one_line(item.get('quote', '?'))}")
    return lines


def _decision_lines(decision: Any, prefix: str) -> list[str]:
    if not isinstance(decision, dict):
        return [f"{prefix}: malformed decision {decision!r}"]
    lines = [f"{prefix}: {_one_line(decision.get('action', '?'))} / {_one_line(decision.get('basis', '?'))} — {_one_line(decision.get('reason', '?'))}"]
    replacement = decision.get("replacement")
    if isinstance(replacement, dict):
        lines.extend(["Proposed replacement (not asserted unless whole finding is reviewed):", _quoted(str(replacement.get("text", "")))])
    lines.extend(_evidence_lines(decision.get("evidence"), "Verifier evidence"))
    absence = decision.get("absence")
    if isinstance(absence, dict):
        lines.append(f"Absence scope: {_one_line(absence.get('scope', '?'))} (assessment: {_one_line(absence.get('assessment', '?'))})")
        lines.extend(_evidence_lines(absence.get("context"), "Inspected context"))
        lines.extend(_evidence_lines(absence.get("source_evidence"), "Absence source evidence"))
        if isinstance(absence.get("searches"), list):
            for search in absence["searches"]:
                if isinstance(search, dict):
                    lines.append(f"Bounded search: {_one_line(search.get('pattern', '?'))} in {_one_line(search.get('scope', '?'))} — {_one_line(search.get('result', '?'))}")
    return lines


def render(delivery: dict[str, Any]) -> str:
    lines = ["# Offline finding delivery", "", "Structural coverage only. The assembler does not establish truth or completeness.",
             "Validation proposals below are UNEXECUTED proposals, never passed tests.", ""]
    for finding in delivery["findings"]:
        lines.extend([f"## {finding['id']} — {_one_line(finding['title'])}", "", f"Status: **{finding['status']}**", ""])
        if finding["defects"]:
            lines.extend(["Carrier/review defects: " + "; ".join(_one_line(d) for d in finding["defects"]), ""])
        for part in finding["parts"]:
            original = part["original"]
            current = part["current"]
            typ = original["type"]
            label = f"{original['id']} · {typ}"
            if typ == "validation_proposal":
                label += " · UNEXECUTED PROPOSAL"
            lines.append(f"### {label}")
            if finding["status"] == "REVIEWED_VERIFIER_ASSERTION":
                if part["action"] == "remove":
                    lines.append("Disposition: removed by explicit verifier decision; original retained in history.")
                else:
                    lines.append(f"Disposition: {part['action']} (verifier assertion; truth not established by assembler).")
                    lines.append(_quoted(current["text"]))
                if "decision" in part:
                    lines.extend(_decision_lines(part["decision"], "Verifier decision"))
            else:
                lines.append("Disposition: unresolved/unverified; original shown for inspection, not asserted.")
                lines.append(_quoted(original["text"]))
                if "decision" in part:
                    lines.extend(_decision_lines(part["decision"], "Verifier challenge"))
                for duplicate in part.get("decisions", []):
                    lines.extend(_decision_lines(duplicate, "Conflicting/missing verifier record"))
            lines.extend(_evidence_lines(original.get("evidence"), "Investigator source lead"))
            lines.append("")
    lines.extend(["## Mechanical coverage", "", _json_block(delivery["mechanical_coverage"]), ""])
    if delivery["diagnostics"] or delivery["unmatched_review_records"]:
        lines.extend(["## Carrier diagnostics", "",
                      _json_block({"diagnostics": delivery["diagnostics"], "unmatched_review_records": delivery["unmatched_review_records"]}), ""])
    lines.extend(["## Auditable history", "", "The original typed parts and every review record are preserved below, including rejected, replaced, removed, and unresolved material.", ""])
    for finding in delivery["findings"]:
        lines.extend([f"### {finding['id']}", "",
                      _json_block({"original": finding["original"], "review_records": finding["review_records"]}), ""])
    if delivery["revision_history"]:
        lines.extend(["### Investigator revision history", "", _json_block(delivery["revision_history"]), ""])
    return "\n".join(lines)


def render_current(current: dict[str, Any]) -> str:
    if not isinstance(current, dict) or current.get("schema") != SCHEMA_CURRENT:
        raise CarrierError(f"current.schema must be {SCHEMA_CURRENT}")
    lines = ["# Current investigator findings", "", "Status: **UNVERIFIED**. This first-view report contains the current typed findings only.",
             "Source citations are investigator leads. Validation proposals are UNEXECUTED; no test result is asserted.", ""]
    for finding in current["findings"]:
        lines.extend([f"## {finding['id']} — {_one_line(finding['title'])}", ""])
        for part in finding["parts"]:
            label = f"{part['id']} · {part['type']}"
            if part["type"] == "validation_proposal":
                label += " · UNEXECUTED PROPOSAL"
            lines.extend([f"### {label}", _quoted(part["text"])])
            lines.extend(_evidence_lines(part.get("evidence"), "Investigator source lead"))
            lines.append("")
    return "\n".join(lines)


def fail_visible(message: str, raw_carriers: dict[str, str] | None = None) -> tuple[dict[str, Any], str]:
    raw_carriers = raw_carriers or {}
    result = {"schema": SCHEMA_DELIVERY, "status": "CARRIER_INVALID", "diagnostics": [message],
              "findings": [], "truth_validation": "not_established_by_assembler", "asserted_claims": 0,
              "raw_carriers": raw_carriers}
    markdown = "# Offline finding delivery\n\n**CARRIER INVALID — no claims asserted.**\n\n" + message + "\n"
    for label, raw in raw_carriers.items():
        markdown += f"\n## Raw {label} retained for repair\n\n" + "\n".join("    " + line for line in raw.splitlines()) + "\n"
    return result, markdown


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("render", "assemble", "render-current"))
    parser.add_argument("--draft", type=Path, required=True)
    parser.add_argument("--review", type=Path)
    parser.add_argument("--out-md", type=Path, required=True)
    parser.add_argument("--out-json", type=Path, required=True)
    parser.add_argument("--history-md", type=Path)
    parser.add_argument("--history-json", type=Path)
    parser.add_argument("--raw-draft-out", type=Path)
    args = parser.parse_args(argv)
    if args.mode == "assemble" and args.review is None:
        parser.error("assemble requires --review")
    if args.mode == "render" and args.review is not None:
        parser.error("render does not accept --review")
    if args.mode == "render-current":
        if args.review is not None:
            parser.error("render-current does not accept --review")
        if not all((args.history_md, args.history_json, args.raw_draft_out)):
            parser.error("render-current requires --history-md, --history-json, and --raw-draft-out")
        paths = [args.draft, args.out_md, args.out_json, args.history_md, args.history_json, args.raw_draft_out]
        if len({path.resolve() for path in paths}) != len(paths):
            parser.error("render-current input and output paths must all differ")
        raw_bytes = b""
        try:
            raw_bytes = args.draft.read_bytes()
            draft = load(args.draft)
            current = project_current(draft)
            current_md = render_current(current)
            audit = assemble(draft)
            audit_md = render(audit)
            status = 0
        except (CarrierError, OSError) as exc:
            current, current_md = fail_visible("Invalid draft carrier; inspect deferred audit artifacts.")
            current.pop("raw_carriers", None)
            raw_text = raw_bytes.decode("utf-8", errors="replace")
            audit, audit_md = fail_visible(str(exc), {"draft": raw_text})
            status = 2
        args.out_md.write_text(current_md, encoding="utf-8")
        args.out_json.write_text(json.dumps(current, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        args.history_md.write_text(audit_md, encoding="utf-8")
        args.history_json.write_text(json.dumps(audit, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        args.raw_draft_out.write_bytes(raw_bytes)
        return status
    status = 0
    try:
        draft = load(args.draft)
        review = load(args.review) if args.review else None
        result = assemble(draft, review)
        markdown = render(result)
        if result["diagnostics"] or any(f["status"] == "UNRESOLVED" for f in result["findings"]):
            status = 1
    except CarrierError as exc:
        raw = {}
        for label, path in (("draft", args.draft), ("review", args.review)):
            if path:
                try:
                    raw[label] = path.read_text(encoding="utf-8")
                except (OSError, UnicodeError):
                    pass
        result, markdown = fail_visible(str(exc), raw)
        status = 2
    args.out_md.write_text(markdown, encoding="utf-8")
    args.out_json.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return status


if __name__ == "__main__":
    sys.exit(main())
