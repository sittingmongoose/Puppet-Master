#!/usr/bin/env python3
"""Deterministic compile witnesses for a v2 planning ledger.

Witness 1, repairs versus targets: every findings record that names a PlanUnit as repaired must have that unit
among the compile queue targets of the record's atoms, and (when --base is given) the unit must actually differ
from the base revision.

Witness 2, exact tokens: every exact token of a compiled atom must appear in the prose of at least one owner PlanUnit
the atom's queue item compiled into, and in at least one of those units' preserved_exact_tokens registries. Tokens
that appear only in companion outputs (schemas, fixtures) are reported as such, never counted as present in an owner unit.

Witness 3, registry hygiene: every entry in an owner unit's preserved_exact_tokens registry must occur in that unit's
own text (the registry line itself excluded), for every unit the compile targets.

All three witnesses are static text checks; they need no model and make no judgment about meaning.
Coverage is the set of atom-to-existing-owner mappings. When no atom reaches an owner, the result is vacuous, never pass,
even if nominal targets exist and their registries were checked. --allow-empty explicitly permits only that empty result.
A targeted owner unit with more than one independent definition, in one document or across documents, is a finding.
Reviewed held/ledger-retired token exemptions live in records/compile_witness_exemptions.jsonl. Each needs a matching
structured token_dispositions entry on the accepted ledger record it cites; missing, active or conflicting entries are refused.
Exit 0 for pass or explicit --allow-empty, 2 for findings/vacuity, 1 for input/read errors.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

# The one identifier grammar for owner headings, fenced declarations and repair sentences.
UNIT_ID_FORM = r"[A-Z0-9][A-Za-z0-9]*-\d+"
UNIT_HEAD = re.compile(r"^(#{2,4})\s+(" + UNIT_ID_FORM + r")\s*[-–—:]\s+(.*)$")
ANY_HEAD = re.compile(r"^(#{1,6})\s")
UNIT_ID = re.compile(r"\b(" + UNIT_ID_FORM + r")\b")
CANDIDATE_ID = re.compile(r"\b([A-Z0-9]{2,5}-\d{2})\b")
RECORD_HEAD = re.compile(r"^Records?\s+\d", re.I)
REPAIRS = re.compile(r"\bRepairs\s+(.+?)(?:\.\s|\.$|,\s+which|,\s+whose|\s+and\s+section\b)", re.S)


def load_jsonl(path: Path, *, required=False) -> list[dict]:
    rows = []
    if not path.exists():
        if required:
            raise ValueError("required ledger input is missing: " + path.name)
        return rows
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line:
            row = json.loads(line)
            if type(row) is not dict:
                raise ValueError(f"{path}: JSONL records must be objects")
            rows.append(row)
    return rows


PLAN_UNIT_ID = re.compile(r"^\s*plan_unit_id:\s*(" + UNIT_ID_FORM + r")\s*$")


def definitions_in(text: str) -> list[dict]:
    """Every independent definition occurrence, headings first, with its location.

    A heading is its line through the line before the next heading. The first fence declaring that heading's own ID
    inside its section (deeper subheadings included) is its metadata, not a second definition. Any other heading or
    declaring fence is independent, and a fence that declares several IDs is marked so uniqueness can refuse it.
    """
    lines = text.splitlines()
    fences, fenced, i = [], set(), 0
    while i < len(lines):
        if not lines[i].strip().startswith("```"):
            i += 1
            continue
        k = i + 1
        while k < len(lines) and not lines[k].strip().startswith("```"):
            k += 1
        fenced.update(range(i, k + 1))
        ids = [mm.group(1) for mm in (PLAN_UNIT_ID.match(l) for l in lines[i + 1:k]) if mm]
        if ids:
            fences.append((i, k, ids))
        i = k + 1
    found, sections = [], {}
    i = 0
    while i < len(lines):
        m = UNIT_HEAD.match(lines[i])
        if not m:
            i += 1
            continue
        j = i + 1
        while j < len(lines) and not ANY_HEAD.match(lines[j]):
            j += 1
        end = i + 1
        while end < len(lines) and (end in fenced or not ANY_HEAD.match(lines[end]) or len(ANY_HEAD.match(lines[end]).group(1)) > len(m.group(1))):
            end += 1
        block = "\n".join(lines[i:j]).rstrip()
        found.append({"unit": m.group(2), "form": "heading", "line_start": i + 1, "line_end": j, "text": block})
        sections.setdefault(m.group(2), []).append([i, end, False])
        i = j
    for start, stop, ids in fences:
        for uid in ids:
            own = next((s for s in sections.get(uid, ()) if s[0] < start and stop <= s[1] and not s[2]), None) if len(ids) == 1 else None
            if own is not None:
                own[2] = True
                continue
            found.append({"unit": uid, "form": "fence" if len(ids) == 1 else "multi_id_fence", "line_start": start + 1,
                          "line_end": min(stop + 1, len(lines)), "text": "\n".join(lines[start:stop + 1]).rstrip()})
    return found


def units_in(text: str) -> dict[str, dict]:
    """First block per unit id, for text evidence. Uniqueness is validated from definitions_in, never from this view."""
    out: dict[str, dict] = {}
    for definition in definitions_in(text):
        out.setdefault(definition["unit"], {key: definition[key] for key in ("line_start", "line_end", "text")})
    return out


def registry(block: str) -> list[str]:
    """preserved_exact_tokens as an inline flow list or a block list."""
    m = re.search(r"^\s*preserved_exact_tokens:\s*\[(.*?)\]\s*$", block, flags=re.S | re.M)
    if m:
        parts = re.split(r",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", m.group(1))
        return [p.strip().strip('"').strip("'") for p in parts if p.strip()]
    m = re.search(r"^\s*preserved_exact_tokens:\s*\n((?:\s+-\s.*\n?)+)", block, flags=re.M)
    if m:
        return [re.sub(r"^\s*-\s*", "", l).strip().strip('"').strip("'") for l in m.group(1).splitlines() if l.strip()]
    return []


def prose(block: str) -> str:
    """Exclude the entire inline/block token registry from token evidence."""
    lines = block.splitlines(keepends=True)
    out, index = [], 0
    while index < len(lines):
        match = re.match(r"^[ \t]*preserved_exact_tokens:[ \t]*(.*)$", lines[index].rstrip("\r\n"))
        if not match:
            out.append(lines[index])
            index += 1
            continue
        tail = match.group(1).strip()
        index += 1
        if tail.startswith("["):
            while not tail.endswith("]") and index < len(lines):
                tail += lines[index].strip()
                index += 1
        elif not tail:
            while index < len(lines) and (not lines[index].strip() or re.match(r"^[ \t]*-[ \t]+", lines[index])):
                index += 1
    return "".join(out)


def strings(value, label, *, unique=False):
    if type(value) is not list or any(type(item) is not str or not item.strip() for item in value):
        raise ValueError(label + " must be a list of nonempty strings")
    if unique and len(set(value)) != len(value):
        raise ValueError(label + " contains duplicates")
    return value


def contained(root: Path, relative: str) -> Path:
    if type(relative) is not str or Path(relative).is_absolute():
        raise ValueError("expected a relative path: " + str(relative))
    path = (root / relative).resolve()
    if not path.is_relative_to(root):
        raise ValueError("path escapes its declared root: " + relative)
    return path


DISPOSITION_SCHEMA = "pm.ledger_token_disposition.v1"
DISPOSITION_VALUES = ("active", "held", "ledger_retired")


def dispositions_in(record, label):
    """Structured token_dispositions entries of one accepted ledger record."""
    entries = record.get("token_dispositions", [])
    if type(entries) is not list:
        raise ValueError(label + " token_dispositions must be a list")
    for entry in entries:
        if type(entry) is not dict or entry.get("schema_id") != DISPOSITION_SCHEMA:
            raise ValueError(label + " token_dispositions entries need schema_id " + DISPOSITION_SCHEMA)
        for key in ("queue_id", "atom_id", "token"):
            if type(entry.get(key)) is not str or not entry[key].strip():
                raise ValueError(label + " token disposition requires nonempty " + key)
        if not strings(entry.get("target_plan_unit_ids"), label + " disposition targets", unique=True):
            raise ValueError(label + " token disposition requires target_plan_unit_ids")
        if entry.get("disposition") not in DISPOSITION_VALUES:
            raise ValueError(label + " token disposition must be one of " + ", ".join(DISPOSITION_VALUES))
    return entries


def accepted_dispositions(ledger_dir):
    """Every accepted disposition in records/, so a conflict in any record is seen."""
    records = (ledger_dir / "records").resolve()
    found = []
    for path in sorted(records.rglob("*.jsonl")):
        if not path.resolve().is_relative_to(records):
            raise ValueError("ledger record escapes records/: " + path.name)
        if path.resolve() == records / "compile_witness_exemptions.jsonl":
            continue
        for row in load_jsonl(path):
            if row.get("status") == "accepted":
                found.extend(dispositions_in(row, path.name))
    return found


def token_exemptions(ledger_dir, items, atoms, units):
    """Reviewed, per-atom/per-owner exceptions; never a token-wide waiver."""
    rows = load_jsonl(ledger_dir / "records/compile_witness_exemptions.jsonl")
    indexed, ids, reports = {}, set(), []
    decided = accepted_dispositions(ledger_dir) if rows else []
    for row in rows:
        for key in ("exemption_id", "queue_id", "atom_id", "token", "reason", "reviewed_by", "review_ref"):
            if type(row.get(key)) is not str or not row[key].strip():
                raise ValueError("token exemption requires nonempty " + key)
        if row.get("schema_id") != "pm.ledger_compile_witness_exemption.v1" or row.get("disposition") not in ("held", "ledger_retired"):
            raise ValueError("token exemption needs v1 schema and held/ledger_retired disposition")
        if row["exemption_id"] in ids:
            raise ValueError("duplicate exemption_id: " + row["exemption_id"])
        ids.add(row["exemption_id"])
        item = items.get(row["queue_id"])
        atom = atoms.get(row["atom_id"])
        if item is None or atom is None or row["atom_id"] not in item["atom_targets"] or row["token"] not in atom.get("exact_tokens", []):
            raise ValueError("stale or unknown exemption queue/atom/token: " + row["exemption_id"])
        targets = strings(row.get("target_plan_unit_ids"), "exemption targets", unique=True)
        owners = {uid for uid in item["atom_targets"][row["atom_id"]] if not uid.startswith("DL-") and uid in units}
        if not targets or not set(targets) <= owners:
            raise ValueError("exemption targets must be existing owner units of that atom: " + row["exemption_id"])
        ref_path, separator, record_id = row["review_ref"].partition("#")
        if not separator or not record_id or not ref_path.startswith("records/") or not ref_path.endswith(".jsonl") or ref_path == "records/compile_witness_exemptions.jsonl":
            raise ValueError("review_ref must cite another ledger record as records/file.jsonl#id")
        reference = contained(ledger_dir, ref_path)
        if (not reference.is_relative_to((ledger_dir / "records").resolve()) or
                reference == (ledger_dir / "records/compile_witness_exemptions.jsonl").resolve()):
            raise ValueError("review_ref must remain in records/ and cannot certify its own exemption file")
        reviews = [record for record in load_jsonl(reference)
                   if record_id in [record.get(key) for key in ("correction_id", "decision_id", "question_id", "review_id")]]
        if len(reviews) != 1:
            raise ValueError("review_ref must resolve to exactly one ledger record: " + row["review_ref"])
        review = reviews[0]
        linked = set(strings(review.get("source_atom_ids", []), "review source_atom_ids")) | set(strings(review.get("linked_atom_ids", []), "review linked_atom_ids")) | {review.get("atom_id")}
        reviewed_tokens = strings(review.get("exact_tokens", []), "review exact_tokens")
        if review.get("status") != "accepted" or row["atom_id"] not in linked or row["token"] not in reviewed_tokens:
            raise ValueError("review_ref must be accepted and name the exact atom and token: " + row["exemption_id"])
        same_token = [entry for entry in dispositions_in(review, row["review_ref"]) if entry["atom_id"] == row["atom_id"] and entry["token"] == row["token"]]
        cited = [entry for entry in same_token if entry["queue_id"] == row["queue_id"] and set(entry["target_plan_unit_ids"]) == set(targets)]
        if len(cited) != 1:
            raise ValueError("review_ref needs exactly one structured token_dispositions entry for this queue item, atom, token and exact target scope: " + row["exemption_id"])
        if cited[0]["disposition"] == "active":
            raise ValueError("accepted disposition keeps this token active: " + row["exemption_id"])
        if cited[0]["disposition"] != row["disposition"]:
            raise ValueError("exemption disposition differs from its accepted record: " + row["exemption_id"])
        conflicts = [entry for entry in decided if entry["atom_id"] == row["atom_id"] and entry["token"] == row["token"] and
                     entry["disposition"] != row["disposition"] and set(entry["target_plan_unit_ids"]) & set(targets)]
        if conflicts:
            raise ValueError("another accepted record gives this token a different disposition: " + row["exemption_id"])
        for uid in targets:
            key = (row["queue_id"], row["atom_id"], row["token"], uid)
            if key in indexed:
                raise ValueError("overlapping token exemptions: " + row["exemption_id"])
            indexed[key] = row["exemption_id"]
        reports.append({**row, "accepted_disposition": cited[0]})
    return indexed, reports


def records_in(findings_md: str) -> list[dict]:
    out = []
    for sec in re.split(r"^##\s+", findings_md, flags=re.M)[1:]:
        head, _, body = sec.partition("\n")
        if not RECORD_HEAD.match(head.strip()):
            continue
        rep = REPAIRS.search(body)
        named_units = sorted(set(UNIT_ID.findall(rep.group(1)))) if rep else []
        named_docs = sorted(set(re.findall(r"\b([A-Z][A-Za-z]+_[A-Za-z0-9_]+)\b", rep.group(1)))) if rep else []
        out.append({"heading": head.strip(), "candidate_ids": sorted(set(CANDIDATE_ID.findall(head))),
                    "named_units": named_units, "named_documents": named_docs, "has_repairs_sentence": bool(rep)})
    return out


def git_show(root: Path, rev: str, path: str) -> str | None:
    listed = subprocess.run(["git", "--literal-pathspecs", "-C", str(root), "ls-tree", "--name-only", "-z", rev, "--", path], capture_output=True, text=True)
    if listed.returncode:
        raise ValueError("cannot inspect base document: " + path)
    if not listed.stdout:
        return None
    result = subprocess.run(["git", "-C", str(root), "show", f"{rev}:{path}"], capture_output=True, text=True)
    if result.returncode:
        raise ValueError("cannot read existing base document: " + path)
    return result.stdout


def run(root: Path, ledger_dir: Path, base: str | None = None, *, allow_empty=False) -> dict:
    root, ledger_dir = Path(root).resolve(), Path(ledger_dir)
    ledger_dir = (ledger_dir if ledger_dir.is_absolute() else root / ledger_dir).resolve()
    if type(allow_empty) is not bool:
        raise ValueError("allow_empty must be an explicit boolean")
    if base is not None and (type(base) is not str or not base.strip()):
        raise ValueError("--base must name a nonempty Git revision")
    if base:
        revision = subprocess.run(["git", "-C", str(root), "rev-parse", "--verify", "--end-of-options", base + "^{commit}"], capture_output=True, text=True)
        if revision.returncode:
            raise ValueError("--base must resolve to a Git commit in --root")
    queue = json.loads((ledger_dir / "state/compile_queue.json").read_text(encoding="utf-8"))
    if type(queue) is not dict or type(queue.get("items", [])) is not list:
        raise ValueError("compile queue must be an object with an items list")
    atoms = {}
    for atom in load_jsonl(ledger_dir / "records/design_atoms.jsonl", required=True):
        aid = atom.get("atom_id")
        if type(aid) is not str or not aid or aid in atoms:
            raise ValueError("design atoms require unique nonempty atom_id values")
        strings(atom.get("exact_tokens", []), aid + " exact_tokens", unique=True)
        atoms[aid] = atom
    corrections = load_jsonl(ledger_dir / "records/corrections.jsonl")
    findings_path = ledger_dir / "source_shards/findings.md"
    findings_md = findings_path.read_text(encoding="utf-8") if findings_path.exists() else ""
    docs, items, atom_targets = set(), {}, {}
    for field in ("canonical_plan_targets", "compiled_owner_docs"):
        docs.update(strings(queue.get(field, []), field))
    for index, item in enumerate(queue.get("items", []), 1):
        if type(item) is not dict:
            raise ValueError("queue items must be objects")
        qid = item.get("queue_id", "item-" + str(index))
        if type(qid) is not str or not qid or qid in items:
            raise ValueError("queue items require unique queue_id values")
        source_atoms = strings(item.get("source_atom_ids", []), qid + " source_atom_ids", unique=True)
        if any(aid not in atoms for aid in source_atoms):
            raise ValueError("queue item names an unknown atom: " + qid)
        targets = strings(item.get("target_plan_unit_ids", []), qid + " target_plan_unit_ids", unique=True)
        mapping = item.get("atom_target_plan_unit_ids")
        if mapping is not None:
            if type(mapping) is not dict or set(mapping) != set(source_atoms):
                raise ValueError("atom_target_plan_unit_ids must map every source atom exactly once: " + qid)
            for aid, owned in mapping.items():
                strings(owned, aid + " targets", unique=True)
                if not set(owned) <= set(targets):
                    raise ValueError("atom targets must be a subset of the queue item's targets: " + aid)
        else:
            mapping = {aid: list(targets) for aid in source_atoms}
        items[qid] = {"targets": targets, "atom_targets": mapping}
        for aid, owned in mapping.items():
            atom_targets.setdefault(aid, set()).update(owned)
        for field in ("target_docs", "canonical_plan_targets", "compiled_owner_docs"):
            docs.update(strings(item.get(field, []), qid + " " + field))
        if item.get("target_doc"):
            docs.update(strings([item["target_doc"]], qid + " target_doc"))
    docs = sorted(d for d in docs if d.endswith(".md"))
    declared = set().union(*(set(item["targets"]) for item in items.values()))
    units, placed, config_findings = {}, {}, []
    for doc in docs:
        path = contained(root, doc)
        if not path.is_file():
            config_findings.append({"kind": "missing_owner_document", "path": doc})
            continue
        for definition in definitions_in(path.read_text(encoding="utf-8")):
            uid = definition["unit"]
            placed.setdefault(uid, []).append({"path": doc, **{key: definition[key] for key in ("form", "line_start", "line_end")}})
            units.setdefault(uid, {key: definition[key] for key in ("line_start", "line_end", "text")})
    for uid in sorted(declared & placed.keys()):
        # DL-* units supply no owner evidence, and a Decision Log may carry a log entry and a PlanUnit under one number.
        same_file_counts = not uid.startswith("DL-") and (len(placed[uid]) > 1 or placed[uid][0]["form"] == "multi_id_fence")
        if same_file_counts or len({place["path"] for place in placed[uid]}) > 1:
            config_findings.append({"kind": "ambiguous_owner_unit", "unit": uid, "definitions": placed[uid]})
    for uid in sorted(declared - units.keys()):
        config_findings.append({"kind": "missing_target_unit", "unit": uid})
    base_units = {}
    if base:
        for doc in docs:
            text = git_show(root, base, doc)
            if text is not None:
                base_units.update(units_in(text))
    cand_atoms = {}
    for correction in corrections:
        for candidate in re.split(r"\s*\+\s*|,\s*", str(correction.get("finding_id", ""))):
            if candidate.strip():
                cand_atoms.setdefault(candidate.strip(), set()).update(correction.get("source_atom_ids", correction.get("linked_atom_ids", [])))
    w1 = []
    for record in records_in(findings_md):
        linked = set().union(*(cand_atoms.get(cid, set()) for cid in record["candidate_ids"]))
        targets = set().union(*(atom_targets.get(aid, set()) for aid in linked))
        # Ledger candidate IDs such as RT-01 share the short form, so a short ID names a unit only when one exists.
        known = units.keys() | base_units.keys() | declared
        unresolved_short = sorted(uid for uid in record["named_units"] if len(uid.rpartition("-")[2]) < 3 and uid not in known)
        named_units = sorted(set(record["named_units"]) - set(unresolved_short))
        not_targeted = sorted(set(named_units) - targets)
        unchanged = [uid for uid in named_units if base and uid in units and uid in base_units and units[uid]["text"] == base_units[uid]["text"]]
        w1.append({"record": record["heading"], "candidate_ids": record["candidate_ids"], "atoms": sorted(linked),
                   "queue_targets": sorted(targets), "named_units": named_units, "unresolved_short_ids": unresolved_short, "named_documents": record["named_documents"],
                   "named_but_not_targeted": not_targeted, "named_but_unchanged_since_base": unchanged,
                   "unmatched_record": not linked and bool(record["candidate_ids"]), "fires": bool(not_targeted or unchanged)})
    exemptions, exemption_records = token_exemptions(ledger_dir, items, atoms, units)
    companion_text = ""
    for output in strings(queue.get("compiled_plan_outputs", []), "compiled_plan_outputs"):
        path = contained(root, output)
        if path.is_file() and path.suffix == ".json":
            companion_text += path.read_text(encoding="utf-8", errors="replace")
    w2, uncompiled_atoms, compiled_mappings = [], [], []
    for qid, item in items.items():
        for aid, targets in item["atom_targets"].items():
            owners = sorted(uid for uid in targets if not uid.startswith("DL-") and uid in units)
            if not owners:
                uncompiled_atoms.append({"queue_id": qid, "atom": aid})
                continue
            compiled_mappings.append({"queue_id": qid, "atom": aid, "owner_units": owners})
            regs = {uid: registry(units[uid]["text"]) for uid in owners}
            bodies = {uid: prose(units[uid]["text"]) for uid in owners}
            for token in atoms[aid].get("exact_tokens", []):
                exempt = {uid: exemptions[(qid, aid, token, uid)] for uid in owners if (qid, aid, token, uid) in exemptions}
                required = sorted(set(owners) - exempt.keys())
                in_prose = [uid for uid in required if token in bodies[uid]]
                in_registry = [uid for uid in required if token in regs[uid]]
                same_unit = sorted(set(in_prose) & set(in_registry))
                fully_exempt = not required
                w2.append({"queue_id": qid, "atom": aid, "token": token, "owner_units": owners,
                           "required_owner_units": required, "exempt_owner_units": exempt, "exempted": fully_exempt,
                           "units_with_token_in_prose": in_prose, "units_with_token_in_registry": in_registry,
                           "units_with_both": same_unit,
                           "in_companion_outputs_only": bool(required) and not in_prose and token in companion_text,
                           "fires": not fully_exempt and not same_unit})
    w3 = []
    for uid in sorted(declared & units.keys()):
        if uid.startswith("DL-"):
            continue
        reg = registry(units[uid]["text"])
        missing = [token for token in reg if token not in prose(units[uid]["text"])]
        prior_missing = None
        if base and uid in base_units:
            prior_missing = [token for token in registry(base_units[uid]["text"]) if token not in prose(base_units[uid]["text"])]
        w3.append({"unit": uid, "registry_entries": len(reg), "entries_absent_from_unit_text": missing,
                   "absent_already_at_base": sorted(set(missing) & set(prior_missing)) if prior_missing is not None else None,
                   "fires": bool(missing)})
    fires1, fires2, fires3 = [[row for row in witness if row["fires"]] for witness in (w1, w2, w3)]
    # Coverage is what actually compiled. A nominal target or an empty hygiene row is not compilation evidence.
    vacuous = not compiled_mappings
    vacuity_reason = None if not vacuous else "no_owner_targets" if not declared else "no_atom_reaches_an_owner"
    findings = bool(config_findings or fires1 or fires2 or fires3)
    status = ("vacuous_with_findings" if vacuous else "findings") if findings else (
        "vacuous_allowed_by_--allow-empty" if allow_empty else "vacuous") if vacuous else "pass"
    active = [row for row in w2 if not row["exempted"]]
    return {"schema_id": "pm.ledger_compile_witness.v2", "ledger_id": ledger_dir.name, "base": base, "documents": docs,
            "witness_repairs_vs_targets": w1, "witness_exact_tokens": w2, "witness_registry_hygiene": w3,
            "token_exemptions": exemption_records, "configuration_findings": config_findings,
            "atom_owner_mappings": compiled_mappings, "atoms_without_owner_targets": uncompiled_atoms,
            "vacuous": vacuous, "vacuity_reason": vacuity_reason, "allow_empty": bool(allow_empty),
            "summary": {"records": len(w1), "records_firing": len(fires1), "named_but_not_targeted": sum(len(r["named_but_not_targeted"]) for r in w1),
                        "named_but_unchanged_since_base": sum(len(r["named_but_unchanged_since_base"]) for r in w1),
                        "declared_target_plan_units": len(declared), "registries_checked": len(w3),
                        "atoms_reaching_an_owner": len({row["atom"] for row in compiled_mappings}),
                        "item_tokens": len(w2), "item_tokens_exempted": len(w2) - len(active),
                        "tokens_missing_from_prose": sum(not row["units_with_token_in_prose"] for row in active),
                        "tokens_missing_from_registry": sum(not row["units_with_token_in_registry"] for row in active),
                        "tokens_only_in_companion_outputs": sum(row["in_companion_outputs_only"] for row in active),
                        "units_with_registry_entries_absent_from_text": len(fires3),
                        "registry_entries_absent_from_text": sum(len(row["entries_absent_from_unit_text"]) for row in w3),
                        "registry_entries_absent_already_at_base": sum(len(row["absent_already_at_base"] or []) for row in w3)},
            "status": status}


def self_test(*, scratch=None):
    from pm_ledger_compile_witness_traps import exercise
    return exercise(sys.modules[__name__], scratch=scratch)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("ledger_dir", nargs="?", help="ledger directory containing state/ and records/")
    parser.add_argument("--root", default=str(Path.cwd()), help="owner-document root (default: current directory)")
    parser.add_argument("--base", default=None, help="git revision to compare edited units against (for example origin/main)")
    parser.add_argument("--json", action="store_true", help="print the full JSON report instead of the summary")
    parser.add_argument("--allow-empty", action="store_true", help="permit an explicitly labelled vacuous result; never waive findings")
    parser.add_argument("--self-test", action="store_true", help="run the portable regression corpus")
    parser.add_argument("--scratch", type=Path, help="self-test scratch parent (default: OS temporary directory)")
    args = parser.parse_args(argv)
    if args.self_test == bool(args.ledger_dir):
        parser.error("choose exactly one ledger directory or --self-test")
    if args.scratch is not None and not args.self_test:
        parser.error("--scratch requires --self-test")
    root = Path(args.root).resolve()
    try:
        if args.self_test:
            report = self_test(scratch=args.scratch)
        else:
            ledger_dir = Path(args.ledger_dir)
            if not ledger_dir.is_absolute():
                ledger_dir = root / ledger_dir
            report = run(root, ledger_dir, args.base, allow_empty=args.allow_empty)
    except (OSError, ValueError, TypeError, KeyError, subprocess.SubprocessError) as exc:
        if args.json:
            print(json.dumps({"schema_id": "pm.ledger_compile_witness.v2", "status": "error", "error": str(exc)}, indent=2))
        else:
            print("error: " + str(exc), file=sys.stderr)
        return 1
    if args.json:
        print(json.dumps(report, indent=2, sort_keys=True))
    elif args.self_test:
        print(f"compile witness self-test: {report['status']} ({report['caught']}/{len(report['tests'])})")
    else:
        s = report["summary"]
        print(f"{report['ledger_id']}: {report['status']}")
        print(f"  coverage: {s['atoms_reaching_an_owner']} atoms reach an owner ({len(report['atoms_without_owner_targets'])} queue mappings do not); {s['declared_target_plan_units']} declared targets; {s['registries_checked']} owner registries checked; {s['item_tokens_exempted']} item tokens explicitly exempted")
        if report["vacuous"]:
            print(f"  vacuous: {report['vacuity_reason']}")
        for finding in report["configuration_findings"]:
            print("    - " + str(finding))
        print(f"  witness 1 repairs vs targets: {s['records_firing']} of {s['records']} records fire; named-but-not-targeted {s['named_but_not_targeted']}; named-but-unchanged {s['named_but_unchanged_since_base']}")
        for r in report["witness_repairs_vs_targets"]:
            if r["fires"]:
                print(f"    - {r['record'][:70]}: not targeted {r['named_but_not_targeted']} unchanged {r['named_but_unchanged_since_base']}")
        print(f"  witness 2 exact tokens: {s['item_tokens']} item tokens; missing from every owner unit's prose {s['tokens_missing_from_prose']} (of which only in companion outputs {s['tokens_only_in_companion_outputs']}); missing from every owner registry {s['tokens_missing_from_registry']}")
        per: dict[str, list[str]] = {}
        for r in report["witness_exact_tokens"]:
            if not r["exempted"] and not r["units_with_token_in_prose"]:
                per.setdefault(",".join(r["owner_units"]), []).append(r["token"])
        for owners, toks in sorted(per.items()):
            print(f"    - {owners}: not in prose {toks}")
        print(f"  witness 3 registry hygiene: {s['units_with_registry_entries_absent_from_text']} units carry registry entries absent from their own text ({s['registry_entries_absent_from_text']} entries; {s['registry_entries_absent_already_at_base']} already absent at base)")
        for r in report["witness_registry_hygiene"]:
            if r["fires"]:
                print(f"    - {r['unit']}: {r['entries_absent_from_unit_text']}" + (f" (already at base: {r['absent_already_at_base']})" if r["absent_already_at_base"] else ""))
    return 0 if report["status"] in ("pass", "vacuous_allowed_by_--allow-empty") else 2


if __name__ == "__main__":
    sys.exit(main())
