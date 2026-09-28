#!/usr/bin/env python3
"""Small file/receipt interface. Structural acceptance is never semantic approval.

Native Write saves a whole Markdown finding, then a unique request marker. Native
Read reads a host receipt. No custom app API, model tool, shell or transport.
"""
from __future__ import annotations

import hashlib
import importlib.util
import json
import re
from pathlib import Path

LEGACY = Path(__file__).resolve().parents[2] / "offline-repair-v1/tools/delivery.py"
LEGACY_SHA = "e1c7ea2e32bd00ef2606b5974b690a4537b6b200fd3c4e620880ae430b9ebe59"
if hashlib.sha256(LEGACY.read_bytes()).hexdigest() != LEGACY_SHA:
    raise RuntimeError("frozen current/history dependency differs from its pin")
_spec = importlib.util.spec_from_file_location("frozen_delivery_i1", LEGACY)
legacy = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(legacy)
TYPES = legacy.PART_TYPES
REQUIRED = {"condition", "source_fit", "plan_fit", "implication", "validation_proposal", "uncertainty"}
NAME = re.compile(r"^(new|F[0-9]{4})--[a-z0-9][a-z0-9_-]{0,39}$")
MAX_BYTES = 16384
MAX_ATTEMPTS = 16


class StructuralError(ValueError):
    pass


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    tmp.replace(path)


def parse_finding(raw: bytes, fid: str, revision: bool) -> tuple[dict, str | None]:
    """Reserved headings outside fenced code; bodies remain verbatim strings."""
    if len(raw) > MAX_BYTES:
        raise StructuralError(f"finding exceeds {MAX_BYTES} bytes")
    try:
        text = raw.decode("utf-8")
    except UnicodeError as exc:
        raise StructuralError("finding is not UTF-8") from exc
    lines = text.splitlines(keepends=True)
    if not lines or not lines[0].startswith("# ") or not lines[0][2:].strip():
        raise StructuralError("first line must be '# ' followed by a nonempty title")
    title = lines[0][2:].rstrip("\r\n")
    fields: dict[str, str] = {}
    section = None
    fence = None
    for n, line in enumerate(lines[1:], 2):
        marker = re.match(r"^ {0,3}(`{3,}|~{3,})(.*?)(?:\r?\n)?$", line)
        if fence:
            if marker and marker[1][0] == fence[0] and len(marker[1]) >= fence[1] and not marker[2].strip():
                fence = None
            fields[section] += line
            continue
        if marker:
            if section is None:
                raise StructuralError(f"line {n}: code must be inside a typed section")
            fence = (marker[1][0], len(marker[1]))
            fields[section] += line
            continue
        if line.startswith("## "):
            section = line[3:].rstrip("\r\n")
            if section not in TYPES | {"change_reason"}:
                raise StructuralError(f"line {n}: unknown field {section!r}")
            if section in fields:
                raise StructuralError(f"line {n}: duplicate field {section!r}")
            fields[section] = ""
        elif line.startswith("# "):
            raise StructuralError(f"line {n}: second finding title in one submission")
        elif section is None:
            if line.strip():
                raise StructuralError(f"line {n}: content before a typed section")
        else:
            fields[section] += line
    if fence:
        raise StructuralError("unclosed code fence")
    missing = REQUIRED - fields.keys()
    if missing:
        raise StructuralError(f"missing fields: {sorted(missing)}")
    if ("assertion" in fields) == ("non_finding" in fields):
        raise StructuralError("exactly one assertion or non_finding field is required")
    if revision and "change_reason" not in fields:
        raise StructuralError("revision requires change_reason")
    for field, value in fields.items():
        if not value.strip():
            raise StructuralError(f"empty field: {field}")
    finding = {"id": fid, "title": title, "parts": [
        {"id": f"{fid}_{kind.upper()}", "type": kind, "text": value}
        for kind, value in fields.items() if kind != "change_reason"
    ]}
    return finding, fields.get("change_reason")


class Store:
    """One host instance per live Goal; append-only acknowledged submissions.

    The workspace isn't a security sandbox. Its native write traces must corroborate
    protocol compliance. A marker follows a successful payload write; no polling
    observer can reconstruct unsubmitted or overwritten-before-observation bytes.
    """
    def __init__(self, workspace: Path, archive: Path):
        self.ws, self.archive = Path(workspace), Path(archive)
        self.payloads = self.ws / "out/submissions"
        self.requests = self.ws / "out/requests"
        self.feedback = self.ws / "feedback"
        for path in (self.payloads, self.requests, self.feedback, self.archive / "snapshots"):
            path.mkdir(parents=True, exist_ok=True)
        self.state_path = self.archive / "state.json"
        self.state = json.loads(self.state_path.read_text()) if self.state_path.exists() else {
            "schema": "finding-receipts/v2", "attempts": [], "next_id": 1,
            "protocol_errors": [], "closed": False,
        }
        self.publish()

    def _read(self, path: Path, bounded: bool = True) -> bytes:
        if path.is_symlink() or not path.is_file():
            raise StructuralError(f"missing/nonregular input: {path.name}")
        # Size checked before reading to keep the receiving interface bounded.
        if bounded and path.stat().st_size > MAX_BYTES:
            raise StructuralError(f"input exceeds {MAX_BYTES} bytes: {path.name}")
        return path.read_bytes()

    def _record_error(self, message: str) -> None:
        if message not in self.state["protocol_errors"]:
            self.state["protocol_errors"].append(message)

    def poll(self) -> dict:
        if self.state["closed"]:
            raise StructuralError("store closed; no post-freeze submissions")
        seen = {a["request"]: a for a in self.state["attempts"]}
        # Check acknowledged paths even when an input disappeared from iterdir().
        for name, a in seen.items():
            try:
                unchanged = sha(self._read(self.requests / name, False)) == a["marker_sha256"]
                payload_path = self.payloads / (name + ".md")
                if a["raw_sha256"] is None and not payload_path.exists():
                    pass  # A failed write still has no bytes; do not reconstruct it.
                else:
                    unchanged = unchanged and sha(self._read(payload_path, False)) == a["raw_sha256"]
            except StructuralError:
                unchanged = False
            if not unchanged:
                self._record_error(f"acknowledged request/payload changed or removed: {name}")
                a["invalidated"] = True
        for path in sorted(self.requests.iterdir()):
            name = path.name
            if name in seen:
                continue
            if len(self.state["attempts"]) >= MAX_ATTEMPTS:
                self._record_error(f"submission limit {MAX_ATTEMPTS} exceeded")
                continue
            seq = len(self.state["attempts"]) + 1
            a = {"sequence": seq, "request": name, "finding_id": None, "status": "INVALID",
                 "diagnostics": [], "raw_sha256": None, "marker_sha256": None,
                 "snapshot": None, "marker_snapshot": None, "finding": None, "change_reason": None,
                 "revision": None, "changes": None}
            self.state["attempts"].append(a)
            try:
                # Preserve available raw bytes even when name/marker/schema is invalid.
                raw = None
                payload_path = self.payloads / (name + ".md")
                if payload_path.exists() and not payload_path.is_symlink() and payload_path.is_file():
                    raw = self._read(payload_path, False)
                    snapshot = self.archive / "snapshots" / f"{seq:04d}.md"
                    snapshot.write_bytes(raw)
                    snapshot.chmod(0o444)
                    a.update(raw_sha256=sha(raw), snapshot=str(snapshot.relative_to(self.archive)))
                match = NAME.fullmatch(name)
                if not match:
                    raise StructuralError("invalid request name; use new--slug or F0001--slug")
                target = match[1]
                if target == "new":
                    a["finding_id"] = f"F{self.state['next_id']:04d}"
                    self.state["next_id"] += 1
                else:
                    if target not in {x["finding_id"] for x in self.state["attempts"][:-1]}:
                        raise StructuralError(f"unknown finding identity: {target}")
                    a["finding_id"] = target
                previous = [x for x in self.state["attempts"][:-1] if x["finding_id"] == a["finding_id"]]
                a["revision"] = len(previous) + 1
                marker = self._read(path, False)
                a["marker_sha256"] = sha(marker)
                marker_path = self.archive / "snapshots" / f"{seq:04d}.request"
                marker_path.write_bytes(marker)
                marker_path.chmod(0o444)
                a["marker_snapshot"] = str(marker_path.relative_to(self.archive))
                if raw is None:
                    raise StructuralError(f"missing/nonregular payload: {name}.md")
                if marker != b"submit\n":
                    raise StructuralError("request marker must contain exactly 'submit' plus newline")
                finding, reason = parse_finding(raw, a["finding_id"], target != "new")
                a.update(status="VALID_UNVERIFIED", finding=finding, change_reason=reason)
                prior_valid = next((x for x in reversed(previous) if x["finding"] is not None), None)
                before = {p["id"]: p for p in prior_valid["finding"]["parts"]} if prior_valid else {}
                after = {p["id"]: p for p in finding["parts"]}
                a["changes"] = {
                    "basis": "last parsed record for byte comparison only; never a current fallback",
                    "previous_valid_attempt": prior_valid["sequence"] if prior_valid else None,
                    "added_parts": sorted(after.keys() - before.keys()),
                    "removed_parts": sorted(before.keys() - after.keys()),
                    "replaced_parts": sorted(k for k in after.keys() & before.keys() if after[k] != before[k]),
                    "title_changed": prior_valid is not None and prior_valid["finding"]["title"] != finding["title"],
                }
            except (StructuralError, OSError) as exc:
                a["diagnostics"].append(str(exc))
            # Snapshot and persistent state are written before the acknowledgement.
            self.publish()
            write_json(self.feedback / (name + ".json"), self.receipt(a))
        return self.publish()

    def receipt(self, a: dict) -> dict:
        summary = self.summary()
        return {k: a[k] for k in ("request", "sequence", "finding_id", "revision", "status", "diagnostics", "raw_sha256", "snapshot")} | {
            "structural_only": True, "semantic_validation": "not_performed",
            "current_states": summary["current_states"], "complete": summary["complete"],
            "protocol_errors": summary["protocol_errors"],
        }

    def summary(self) -> dict:
        current: dict[str, dict] = {}
        blocked = []
        for a in self.state["attempts"]:
            if a["finding_id"]:
                current[a["finding_id"]] = a
            else:
                blocked.append(a["request"])
        findings = []
        states = {}
        for fid, a in current.items():
            state = a["status"]
            if a.get("invalidated"):
                state = "INVALID_MUTATED_SUBMISSION"
            for field, digest in (("snapshot", "raw_sha256"), ("marker_snapshot", "marker_sha256")):
                if a.get(field):
                    snap = self.archive / a[field]
                    if not snap.is_file() or sha(snap.read_bytes()) != a[digest]:
                        state = "INCOMPLETE_SNAPSHOT"
                elif a["status"] == "VALID_UNVERIFIED":
                    state = "INCOMPLETE_SNAPSHOT"
            states[fid] = {"status": state, "latest_attempt": a["sequence"]}
            if state == "VALID_UNVERIFIED":
                findings.append(a["finding"])
        # Missing OLD snapshots also break temporal evidence even if current is valid.
        history_gaps = []
        for a in self.state["attempts"]:
            for field, digest in (("snapshot", "raw_sha256"), ("marker_snapshot", "marker_sha256")):
                if a.get(field):
                    snap = self.archive / a[field]
                    if not snap.is_file() or sha(snap.read_bytes()) != a[digest]:
                        history_gaps.append({"attempt": a["sequence"], "kind": field})
        acknowledged = {a["request"] for a in self.state["attempts"]}
        pending = sorted({p.name for p in self.payloads.iterdir() if p.name not in {n + ".md" for n in acknowledged}} |
                         {p.name for p in self.requests.iterdir() if p.name not in acknowledged})
        complete = bool(current) and len(findings) == len(current) and not (
            blocked or history_gaps or pending or self.state["protocol_errors"])
        return {"status": "STRUCTURALLY_COMPLETE_UNVERIFIED" if complete else "INCOMPLETE",
                "complete": complete, "semantic_validation": "not_performed",
                "current_states": states, "findings": findings, "unbound_invalid_attempts": blocked,
                "missing_or_corrupt_snapshots": history_gaps, "pending_inputs": pending,
                "protocol_errors": self.state["protocol_errors"]}

    def publish(self) -> dict:
        summary = self.summary()
        projection = legacy.project_current({"schema": legacy.SCHEMA_DRAFT,
                    "findings": summary["findings"]}) if summary["findings"] else {
                    "schema": legacy.SCHEMA_CURRENT, "status": "UNVERIFIED", "findings": []}
        projection["delivery_status"] = summary["status"]
        projection["incomplete_records"] = {k: v for k, v in summary["current_states"].items()
                                             if v["status"] != "VALID_UNVERIFIED"}
        body = legacy.render_current(projection)
        body += "\n## Structural delivery status\n\n" + summary["status"] + "\n"
        # Diagnostics in the current view never echo a rejected finding's prose/history.
        for fid, state in projection["incomplete_records"].items():
            body += f"\n- {fid}: {state['status']} (latest attempt {state['latest_attempt']}); older content is audit-only.\n"
        if summary["unbound_invalid_attempts"] or summary["protocol_errors"] or summary["missing_or_corrupt_snapshots"] or summary["pending_inputs"]:
            body += "\nUnresolved structural/chronology errors; inspect structural status and separate audit.\n"
        write_json(self.state_path, self.state)
        write_json(self.archive / "current.json", projection)
        (self.archive / "current.md").write_text(body)
        write_json(self.archive / "history.json", {"attempts": self.state["attempts"], "history_gaps": summary["missing_or_corrupt_snapshots"]})
        write_json(self.feedback / "status.json", {k: v for k, v in summary.items() if k != "findings"})
        return summary

    def close(self) -> dict:
        self.poll()
        submitted = {a["request"] + ".md" for a in self.state["attempts"]}
        for path in self.payloads.iterdir():
            if path.name not in submitted:
                self._record_error(f"unsubmitted payload: {path.name}")
                # Preserve surviving unsubmitted bytes, but never infer an earlier state.
                if path.is_file() and not path.is_symlink():
                    dest = self.archive / "snapshots" / ("unsubmitted-" + path.name)
                    dest.write_bytes(path.read_bytes())
                    dest.chmod(0o444)
        self.state["closed"] = True
        return self.publish()
