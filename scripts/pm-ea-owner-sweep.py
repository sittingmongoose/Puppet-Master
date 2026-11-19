#!/usr/bin/env python3
"""Sweep every merge-2 selected owner, with explicit retained-history witnesses.

This is a text/evidence check, never a new admission or a native execution claim.
The audit records every selected section, every matched clause, and the scope
of each retention decision. A missing owner or unreviewed decision fails closed.
"""
from __future__ import annotations

import argparse
from collections import Counter
from functools import lru_cache
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys

import yaml

ROOT = Path(__file__).resolve().parents[1]
REPORT = "reports/event-authority-20261116/admission-merge-2"
REVISION = None
sys.path.insert(0, str(ROOT / "scripts"))
spec = importlib.util.spec_from_file_location("ea_sweep_writer", ROOT / "scripts/pm-ea-admission-writer.py")
w = importlib.util.module_from_spec(spec)
spec.loader.exec_module(w)


def load(path):
    return json.loads(text(path))


@lru_cache(maxsize=100)
def text(path):
    if REVISION:
        return subprocess.check_output(["git", "-C", str(ROOT), "show", REVISION + ":" + path]).decode()
    return (ROOT / path).read_text()


@lru_cache(maxsize=2048)
def section(ref):
    path, unit = ref.split("#", 1)
    body = text(path)
    if path == "Plans/Decision_Log.md" and re.fullmatch(r"DL-\d+", unit):
        declared = w.unit_span(body, unit)
        if declared:
            start, end = declared
            return start, end, "\n".join(body.splitlines()[start - 1:end])
        matches = list(re.finditer(r"(?m)^#{1,6} (DL-\d+)\b[^\n]*$", body))
        selected = [(i, m) for i, m in enumerate(matches) if m[1] == unit]
        if len(selected) != 1:
            raise ValueError("decision scope is missing or ambiguous: " + ref)
        i, m = selected[0]
        stop = matches[i + 1].start() if i + 1 < len(matches) else len(body)
        start = body.count("\n", 0, m.start()) + 1
        content = body[m.start():stop].rstrip("\n")
        return start, start + content.count("\n"), content
    span = (w.unit_span(body, unit) if re.fullmatch(r"[A-Z][A-Z0-9]*-\d+", unit)
            else w.heading_span(body, unit) or w.heading_span(body, "#" + unit))
    if not span:
        titles = re.findall(r"(?m)^#+\s+(" + re.escape(unit) + r"(?:[:\s–—].*)?)$", body)
        if len(titles) == 1:
            span = w.heading_span(body, titles[0])
    if not span:
        raise ValueError(f"unresolved selected owner: {ref}")
    start, end = span
    return start, end, "\n".join(body.splitlines()[start - 1:end])


def clauses(ref):
    """Decode YAML wrapping, while retaining physical line bounds and exact bytes."""
    first, _, body = section(ref)
    result = []
    blocks = list(re.finditer(r"(?ms)^```ya?ml\s*\n(.*?)^```", body))
    residual = body
    for block in blocks:
        data = yaml.compose(block[1])
        offset = first + body[:block.start(1)].count("\n")
        if isinstance(data, yaml.MappingNode):
            for key, value in data.value:
                if key.value not in ("canonical_text", "acceptance_criteria", "negative_constraints"):
                    continue
                values = value.value if isinstance(value, yaml.SequenceNode) else [value]
                for node in values:
                    if not isinstance(node, yaml.ScalarNode):
                        continue
                    for paragraph in node.value.splitlines():
                        if paragraph.strip():
                            result.append(dict(text=paragraph.strip(), field=key.value,
                                               line_start=offset + node.start_mark.line,
                                               line_end=offset + node.end_mark.line))
        residual = residual.replace(block[0], "\n" * block[0].count("\n"))
    for i, line in enumerate(residual.splitlines(), first):
        if line.strip() and not line.startswith(("#", "ContractRef:")):
            result.append(dict(text=line.strip(), field="prose", line_start=i, line_end=i))
    return result


SIGNAL = re.compile(r"PENDING_RETENTION|missing_event_registration|\bquarantin\w*|\bfenced\b|"
                    r"(?:membership|registry).{0,75}\b(?:ABSENT|unregistered|not admitted)\b|"
                    r"no (?:retention )?class is selected|registry still selects|"
                    r"retention.{0,120}\b(?:pending|unresolved)\b|custody.{0,80}pending assignment", re.I)
HISTORY = re.compile(r"^(?:Historical (?:preparation|snapshot|registry|membership)|"
                     r"Preparation (?:history|snapshot)).*20\d\d-\d\d-\d\d", re.I)


def sentences(value):
    # Event/schema/version dots are not sentence separators (no following space).
    return re.split(r"(?<=[.!?])\s+(?=[A-Z`])", value)


def stale_sentences(value, scope):
    retention_context = bool(re.search(r"retention|RP-[A-Z]|PENDING_RETENTION", value, re.I))
    value = re.sub(r"Historical preparation snapshot \(20\d\d-\d\d-\d\d[^)]*\): «.*?»", "", value)
    # An explicit dated historical suffix applies to the remainder of that
    # authored paragraph, not just the first physical/YAML-wrapped sentence.
    suffix = re.search(r"Historical (?:preparation|snapshot|registry|membership).{0,160}?20\d\d-\d\d-\d\d", value, re.I)
    value = value[:suffix.start()] if suffix else value
    for sentence in sentences(value):
        # A dated, explicitly historical suffix is not a current prescription.
        history = re.search(r"Historical (?:preparation|snapshot|registry|membership).{0,160}?20\d\d-\d\d-\d\d", sentence, re.I)
        active = sentence[:history.start()] if history else sentence
        if re.search(r"where explicitly marked", active, re.I):
            continue
        if re.search(r"Missing-registration refusal applies only if|this registered family is not refused|"
                     r"only if the exact current|(?:only|when|if) (?:the )?(?:actual|exact).*registration.*absent", active, re.I):
            continue
        if re.search(r"(?:Preparation outcome|At preparation|At that search revision|At the time of preparation).{0,120}(?:20\d\d|before)", active, re.I):
            continue
        if re.search(r"(?:PENDING_RETENTION\w*`? is resolved|superseded|does not fence|no longer)", active, re.I):
            continue
        if (scope == "project_only" and re.search(r"(?:application|app)[ -](?:history|scope)|application .*PENDING_RETENTION", active, re.I)
                and not re.search(r"Project.{0,60}PENDING_RETENTION", active)):
            continue
        if re.search(r"PENDING_RETENTION|no (?:retention )?class is selected|"
                     r"custody.{0,80}pending assignment|"
                     r"\b(?:retention|policy|lifetime|expiry|deletion)\b[^.!?]{0,100}\b(?:remain|remains|is|are)\s+(?:pending|unresolved|undecided)\b", active, re.I) or (retention_context and re.search(r"neither is selected|no exact family assignment is established|admission remains fenced", active, re.I)):
            # A conditional refusal is still correct when it tests actual unresolved
            # inputs, rather than asserting the selected family's current state.
            if re.search(r"\b(?:if|when|actual absent|a PENDING|until)\b", active, re.I) and not re.search(r"\b(?:remains|is|policy:|policy_ref\s*[=:]?)\s*PENDING_RETENTION", active, re.I):
                continue
            yield "active_pending_retention", sentence
        elif re.search(r"Membership is ABSENT|registry still selects v2|"
                       r"static admission oracle still returns missing_event_registration|"
                       r"(?:family|membership).{0,60}(?:remains absent|is absent|is quarantined)", active, re.I):
            yield "active_registration_fence", sentence


def decision_scope(decision):
    _, _, body = section("Plans/Decision_Log.md#" + decision)
    objects = dict(re.findall(r"(?m)^\s*- ([a-z0-9_]+): (RP-[A-Z0-9-]+(?:@1\.0\.0)?)", body))
    stored_only = bool(re.search(r"separate event retention bindings retain their own rules", body))
    checkpoint_only = bool(re.search(r"saved-value rule,\s+not an event allowance", body, re.I))
    named = re.search(r"\b([a-z][a-z0-9_.]+),\s+([a-z][a-z0-9_.]+) and\s+([a-z][a-z0-9_.]+) are kept\b", body)
    return dict(section_sha256=hashlib.sha256(body.encode()).hexdigest(),
                stored_value_only=stored_only, checkpoint_only=checkpoint_only,
                explicit_event_scope=list(named.groups()) if named else None,
                objects=objects, title=body.splitlines()[0])


def main():
    global REVISION
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--output", type=Path)
    p.add_argument("--explore", action="store_true", help="include every signal for evidence review")
    p.add_argument("--revision", help="read every input at this Git edition, e.g. the received FIX3 head")
    args = p.parse_args()
    REVISION = args.revision
    ready = {r["event_type"]: r for f in ("readiness-list.json", "usage-readiness-list.json")
             for r in load(REPORT + "/" + f)["ready"]}
    assert len(ready) == 299
    registry = {r["event_type"]: r for r in load("Plans/event_family_registry.json")["families"]}
    stored = {r["family_id"]: r for r in load("Plans/storage_value_registry.json")["families"]}
    findings, signals, owners, decisions, revisions = [], [], [], [], []
    scope_cache = {}
    for event, preparation in sorted(ready.items()):
        row = registry[event]
        delta = preparation.get("retention_delta", {})
        refs = {row["semantic_owner_doc"], row["payload_owner_doc"]}
        refs.update(ref for ref in row["source_refs"] if ref.startswith("Plans/storage-plan.md#"))
        if delta.get("owner"):
            refs.add(delta["owner"])
        checkpoints = delta.get("existing_checkpoints", [])
        for checkpoint in checkpoints:
            refs.add(stored[checkpoint["family_id"]]["owner_doc"])
        for ref in sorted(refs):
            start, end, body = section(ref)
            owners.append(dict(event_type=event, lane=preparation["lane"], ref=ref,
                               line_start=start, line_end=end,
                               section_sha256=hashlib.sha256(body.encode()).hexdigest()))
            for clause in clauses(ref):
                value = clause["text"]
                mentioned = {name for name in re.findall(r"\b[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+\b", value)
                             if name in registry}
                if mentioned and event not in mentioned:
                    continue
                base = dict(event_type=event, lane=preparation["lane"], ref=ref,
                            field=clause["field"], line_start=clause["line_start"], line_end=clause["line_end"],
                            clause_sha256=hashlib.sha256(value.encode()).hexdigest())
                if SIGNAL.search(value):
                    record = dict(base, historical=bool(HISTORY.search(value)),
                                  matched_sentences=[sentence for sentence in sentences(value) if SIGNAL.search(sentence)])
                    signals.append(record)
                    for kind, sentence in stale_sentences(value, row["scope_policy"]):
                        findings.append(dict(base, kind=kind, sentence=sentence))
                selected = re.search(r"Current selected assignment \(2026-11-19\): ([a-z0-9_.]+)@([^ ]+) is registered for ([a-z_]+).*?as recorded by (Plans/Decision_Log.md#DL-\d+)\. Its event history selects ([^;]+);", value)
                if selected:
                    subject, version, family_scope, decision, policy = selected.groups()
                    selected_row = registry.get(subject, {})
                    rp = selected_row.get("retention_policy_ref", {})
                    expected = (rp["policy_id"] + "@" + rp["policy_version"]) if rp.get("policy_id") else rp.get("setting_key", "ai.usage.usage-retention")
                    admission = load("reports/event-authority-20260911/admission-records/" + subject + ".json")
                    _, _, decision_body = section(decision)
                    if (version != selected_row.get("family_revision") or family_scope != selected_row.get("scope_policy")
                            or policy != expected or decision != admission["decision_ref"] or subject not in decision_body):
                        findings.append(dict(base, kind="current_assignment_differs_from_admitted_row", sentence=value))
                if (event == "usage.event" and ref == "Plans/Contracts_V0.md#CV-614"
                        and "Application source retention and coherent backup use this event's same explicit policy" in value):
                    findings.append(dict(base, kind="usage_source_borrows_event_policy", sentence=value))
                if re.search(r"retention|checkpoint|history|lifetime|expiry", value, re.I):
                    for sentence in sentences(value):
                        cited = re.findall(r"(?:Plans/Decision_Log\.md#|\b)(DL-\d+)", sentence)
                        if cited:
                            decisions.append(dict(base, sentence=sentence, cited=sorted(set(cited))))
                            for decision in sorted(set(cited)):
                                if decision not in scope_cache:
                                    scope_cache[decision] = decision_scope(decision)
                                scope = scope_cache[decision]
                                if (scope["explicit_event_scope"] and event not in scope["explicit_event_scope"]
                                        and re.search(r"retention|event detail|event history|lifetime|expiry", sentence, re.I)
                                        and re.search(r"\bunder\b", sentence, re.I)):
                                    findings.append(dict(base, kind="event_history_decision_scope", sentence=sentence,
                                                         decision=decision, decision_scope=scope))
                                # A stored-value-only decision cannot authorize event
                                # history. Naming its separate source/checkpoint is fine.
                                if ((scope["stored_value_only"] or scope["checkpoint_only"])
                                        and re.search(r"event history.{0,300}\bunder\b", sentence, re.I)
                                        and not re.search(r"does not|separate event|source.{0,40}only", sentence, re.I)):
                                    findings.append(dict(base, kind="event_history_decision_scope", sentence=sentence,
                                                         decision=decision, decision_scope=scope))
                                cp = re.search(r"(?:separate )?([a-z0-9_]+) checkpoint uses (RP-[A-Z0-9-]+@1\.0\.0), under", sentence)
                                if cp and scope["stored_value_only"] and scope["objects"].get(cp[1]) != cp[2]:
                                    findings.append(dict(base, kind="checkpoint_decision_scope", sentence=sentence,
                                                         decision=decision, decision_scope=scope))
    # These are definition changes, not members of the 299 admission count.
    for path in sorted((ROOT / REPORT / "revisions").glob("*.json")):
        doc = load(str(path.relative_to(ROOT)))
        event = doc["rows"][0]["event_type"]
        row = registry[event]
        ref = row["semantic_owner_doc"]
        start, end, body = section(ref)
        errors = [dict(kind=kind, sentence=sentence) for clause in clauses(ref)
                  for kind, sentence in stale_sentences(clause['text'], row['scope_policy'])]
        _, _, payload_body = section(row["payload_owner_doc"])
        resource = row["payload_schema_ref"]
        schema = load(resource["path"])
        for part in resource.get("json_pointer", "#").removeprefix("#").split("/")[1:]:
            schema = schema[part.replace("~1", "/").replace("~0", "~")]
        schema_id = schema.get("properties", {}).get("schema_id", {}).get("const") or schema.get("$id")
        if schema_id != row["payload_schema_id"]:
            errors.append(dict(kind="selected_resource_schema_id_mismatch", sentence=str(schema_id)))
        revisions.append(dict(event_type=event, ref=ref, selected_schema=row["payload_schema_id"],
                              payload_owner=row["payload_owner_doc"], selected_resource=resource,
                              mentions_selected_resource=(row["payload_schema_id"] in body + payload_body
                                  or Path(resource["path"]).name in body + payload_body),
                              decision=doc["decision_ref"], errors=errors))
        findings.extend(dict(event_type=event, lane="S5b", ref=ref, **error) for error in errors)
    assert len(revisions) == 8
    result = dict(schema_id="pm.ea.owner_sweep.v1", admitted_families=len(ready),
                  input_revision=REVISION or "working_tree", script_sha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
                  selected_sections=len(owners), owners=owners, signals=signals,
                  retention_citations=decisions, decision_scopes=scope_cache, revisions=revisions, findings=findings,
                  by_lane={lane:dict(families=len({x['event_type'] for x in findings if x['lane']==lane}),
                                     findings=sum(x['lane']==lane for x in findings))
                           for lane in sorted({x['lane'] for x in ready.values()} | {'S5b'})})
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps(dict(families=len(ready), selected_sections=len(owners), signals=len(signals),
                          retention_citations=len(decisions), findings=len(findings))))
    return int(bool(findings))


if __name__ == "__main__":
    raise SystemExit(main())
