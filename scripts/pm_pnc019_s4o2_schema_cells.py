#!/usr/bin/env python3
"""S4o2 owner-schema witnesses with exact keyword attribution and restoration.

These are schema-consumer witnesses, supplementary to complete append/read
paths and Method B proofs. They grant no full-boundary or native proof credit.
Each cut removes one assertion or required MEMBER in an in-memory owner-schema
copy; every other keyword remains byte-equivalent. Overlapping constraints do
not become kills: the exact original keyword must be the only refusal.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import re
from functools import lru_cache
from pathlib import Path
from urllib.parse import urldefrag, urljoin

from jsonschema import Draft202012Validator, FormatChecker, validators
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

from pm_event_datetime import EVENT_RECORD, date_time
from pm_event_numbers import Refusal, current_integer
from pm_pnc019_s4o2_oracles import ROOT, MANIFEST, manifest


@lru_cache(maxsize=None)
def load(path):
    return json.loads((ROOT / path).read_text())


def sha(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode()).hexdigest()


def exact_integer(checker, value):
    try:
        current_integer(value)
    except Refusal:
        return False
    return True


Validator = validators.extend(Draft202012Validator,
                              type_checker=Draft202012Validator.TYPE_CHECKER.redefine("integer", exact_integer))


def current_formats():
    # The shared returned checker is deliberately immutable. Compose an owned
    # registry from the same shared predicate, preserving its exact profile.
    formats = FormatChecker()

    @formats.checks("date-time", raises=Refusal)
    def event_record_format(value):
        return True if not isinstance(value, str) else date_time(value, profile=EVENT_RECORD) == value

    @formats.checks("pm-uint", raises=Refusal)
    def current_integer_format(value):
        # Exactly DCW's owner call: nullable slots defer null to their `type`;
        # every non-null value goes through the shared current_integer.
        if value is not None:
            current_integer(value)
        return True

    return formats


def at(value, path):
    for key in path:
        value = value[int(key)] if isinstance(value, list) else value[key]
    return value


def schema_spec(row):
    family, lane = row["event_type"], row["lane"]
    slug = family.replace(".", "_")
    if lane == "DM":
        return None
    if lane in ("DT", "DG6B", "DO"):
        paths = dict(DT="dt_event_contracts.schema.json", DG6B="dg6b_event_contracts.schema.json",
                     DO="orchestrator_event_payloads.schema.json")
        fixtures = dict(DT="dt_event_contract_fixtures.json", DG6B="dg6b_event_contract_fixtures.json",
                        DO="orchestrator_event_contract_fixtures.json")
        return "Plans/" + paths[lane], ("$defs", slug), ["Plans/" + fixtures[lane]]
    if lane == "DMEM":
        rows = load("Plans/memory_maintenance_contracts.json")["families"] + load("Plans/memory_archive_contracts.json")["families"]
        contract = next(r for r in rows if r["event_type"] == family)
        path, fragment = urldefrag(contract["payload_schema_ref"])
        return path, tuple(fragment.removeprefix("/").split("/")) if fragment else (), [
            "Plans/memory_maintenance_event_fixtures.json", "Plans/memory_archive_event_fixtures.json"]
    if lane == "DR":
        contract = next(r for r in load("Plans/runtime_artifact_event_drafts.json")["rows"] if r["event_type"] == family)
        return contract["payload_schema_ref"], (), ["Plans/runtime_artifact_event_drafts.fixtures.json"]
    if lane == "DC":
        contract = next(r for r in load("Plans/collaboration_event_admission.json")["rows"] if r["event_type"] == family)
        ref = contract["registry_row"]["payload_schema_ref"]
        return ref["path"], tuple(ref["json_pointer"].removeprefix("#/").split("/")), [
            "Plans/collaboration_event_contract_fixtures.json"]
    if lane == "DG6A":
        return "Plans/event_payloads/" + slug + "_v2.schema.json", (), ["Plans/panel_event_contracts/" + slug + ".fixtures.json"]
    if lane == "DF":
        return "Plans/event_payloads/" + slug + "_v2.schema.json", (), ["Plans/filesafe_event_contract_fixtures.json"]
    if lane == "DCW":
        fixtures = ["Plans/dcw_event_contract_fixtures.json", "Plans/dcw_blockage_event_fixtures.json"]
        contract = next(r for fixture in fixtures for r in load(fixture)["families"] if r["event_type"] == family)
        return contract["schema"], (), fixtures
    if lane == "DS15":
        contracts = load("Plans/ds15_event_contracts.json") + load("Plans/ds15_deck2_contracts.json")
        contract = next(r for r in contracts if r["event_type"] == family)
        return contract["payload_schema_ref"], (), ["Plans/ds15_event_contract_fixtures.json", "Plans/ds15_deck2_fixtures.json"]
    if lane == "DS" and family == "terminal.workgroup_moved":
        return "Plans/event_payloads/terminal_workgroup_moved.schema.json", (), ["Plans/terminal_workgroup_compatibility_fixtures.json"]
    if lane == "DS" and family == "workspace.layout_changed":
        return "Plans/event_payloads/workspace_layout_changed_v2.schema.json", (), ["Plans/home_layout_v2_slot_receipt_fixtures.json"]
    raise ValueError("no schema binding for " + family)


def specimens(value, family, selected=False):
    """Use existing complete fixtures; never manufacture a new valid payload."""
    if isinstance(value, dict):
        selected = selected or value.get("event_type") == family
        if selected:
            for key in ("valid_payload", "valid", "payload", "positive", "value"):
                if isinstance(value.get(key), dict):
                    yield value[key]
            if "schema_version" in value:
                yield value
        if "original_bytes_hex" in value:
            yield json.loads(bytes.fromhex(value["original_bytes_hex"]))
        for key, child in value.items():
            if key in ("positive_payloads",) and family in child:
                yield child[family]
            if key == family and isinstance(child, dict):
                yield child
            yield from specimens(child, family, selected)
    elif isinstance(value, list):
        for child in value:
            yield from specimens(child, family, selected)


def resources():
    """Local schema resources only; the registry has no network retrieval hook."""
    registry = Registry()
    documents = []
    opaque = {}
    for path in sorted((ROOT / "Plans").rglob("*.schema.json")):
        if any(part.startswith(".") or part == "_shards" for part in path.relative_to(ROOT / "Plans").parts):
            continue
        document = json.loads(path.read_text())
        resource = Resource.from_contents(document, default_specification=DRAFT202012)
        documents.append((path, document))
        registry = registry.with_resource(path.as_uri(), resource)
        if isinstance(document, dict) and "$id" in document:
            registry = registry.with_resource(document["$id"], resource)
            if ":" not in document["$id"]:
                opaque[document["$id"]] = resource
    # The owners import a few legacy opaque `$id` values relatively (notably
    # WorkflowScopeV2). Bind each actually referenced alias to that exact local
    # resource, as the existing DF schema graph does; never fetch the network.
    def aliases(value, base):
        nonlocal registry
        if isinstance(value, dict):
            if isinstance(value.get("$id"), str):
                base = urljoin(base, value["$id"])
            for name in ("$ref", "$dynamicRef"):
                if isinstance(value.get(name), str):
                    target, _ = urldefrag(value[name])
                    if target in opaque:
                        registry = registry.with_resource(urljoin(base, target), opaque[target])
            for child in value.values():
                aliases(child, base)
        elif isinstance(value, list):
            for child in value:
                aliases(child, base)
    for path, document in documents:
        aliases(document, path.as_uri())
    return registry.crawl()


def validator(path, document, pointer, registry):
    resource = Resource.from_contents(document, default_specification=DRAFT202012)
    base = (ROOT / path).as_uri()
    registry = registry.with_resource(base, resource)
    if "$id" in document:
        registry = registry.with_resource(document["$id"], resource)
        base = document["$id"]
    root = dict(document, **{"$ref": "#/" + "/".join(pointer)}) if pointer else document
    return Validator(root, registry=registry, format_checker=current_formats())


def error_keys(valid, value):
    # Only structured errors are refusals. Crashes propagate and earn no credit.
    return [(error.validator, list(error.schema_path), list(error.path)) for error in valid.iter_errors(value)]


ASSERTIONS = ("type", "const", "enum", "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum",
              "minLength", "maxLength", "pattern", "format", "minItems", "maxItems", "uniqueItems")


def node_subjects(document, pointer, value, instance_path=(), seen=()):
    """Concrete property/item occurrences; applicator residue stays explicit."""
    node = at(document, pointer)
    if not isinstance(node, dict):
        return
    if "$ref" in node and node["$ref"].startswith("#/"):
        target = tuple(node["$ref"][2:].split("/"))
        if target not in seen:
            yield from node_subjects(document, target, value, instance_path, seen + (pointer,))
    yield pointer, instance_path, node, value
    if isinstance(value, dict):
        for key, child in node.get("properties", {}).items():
            if key in value:
                yield from node_subjects(document, pointer + ("properties", key), value[key],
                                         instance_path + (key,), seen)
    if isinstance(value, list) and isinstance(node.get("items"), dict):
        # Every authored element in the chosen positive is an occurrence.
        for index, child in enumerate(value):
            yield from node_subjects(document, pointer + ("items",), child, instance_path + (index,), seen)


def replacements(keyword, node, value):
    """Candidate negatives; only a uniquely attributed refusal can be credited."""
    if keyword == "type":
        return [None, False, 0, 1.0, "x", [], {}]
    if keyword in ("const", "enum"):
        if type(value) is str:
            return [value + "x", "x" + value[1:], "z" * len(value), "9.0.0", "2026-01-01T00:00:00Z"]
        if type(value) is bool:
            return [not value]
        if type(value) in (int, float):
            return [value + 1, value - 1, 0, 1]
        return [None, "other", [], {}]
    if keyword in ("minimum", "exclusiveMinimum"):
        return [node[keyword] - 1, node[keyword]]
    if keyword in ("maximum", "exclusiveMaximum"):
        return [node[keyword] + 1, node[keyword]]
    if keyword == "minLength":
        return ["x" * max(0, node[keyword] - 1)]
    if keyword == "maxLength":
        cap = node[keyword]
        prefix = "2026-11-04T00:00:00."
        temporal = prefix + "1" * max(1, cap - len(prefix)) + "Z"
        return ([value + "\n", value + "x" * max(1, cap + 1 - len(value)),
                 value + "x" * max(0, cap - len(value)) + "\n"]
                if type(value) is str else []) + [temporal, "x" * (cap + 1)]
    if keyword == "pattern" and type(value) is str:
        return [prefix + value[1:] for prefix in ("!", "/", " ", "g", "z")] + [value + "\n",
                "2026-11-04T00:00:00z", "2026-11-04T01:00:00+01:00"]
    if keyword == "format":
        return ["2026-02-30T00:00:00Z", "2026-11-04T24:00:00Z", "not a format", "\n"]
    if keyword == "minItems":
        return [value[:max(0, node[keyword] - 1)]]
    if keyword == "maxItems" and value:
        repeated = [copy.deepcopy(value[0]) for _ in range(node[keyword] + 1)]
        unique = ([value[0] + "_" + str(i) for i in range(node[keyword] + 1)]
                  if type(value[0]) is str else repeated)
        return [unique, repeated]
    if keyword == "uniqueItems" and node[keyword] and value:
        return [[copy.deepcopy(value[0]) for _ in range(max(2, node.get("minItems", 0)))],
                copy.deepcopy(value) + [copy.deepcopy(value[0])]]
    return []


def entailment(node, keyword):
    """Explicit schema implications, never an excuse based on missing samples.

    A regexp's conservative minimum match width is a lower bound on the input
    length even for search semantics and Python's final-LF `$` behavior. It
    cannot prove an upper bound. Constant/enum proofs enumerate every value
    permitted by the earlier assertion through the same actual validator.
    """
    if keyword == "minLength" and "pattern" in node:
        minimum, _ = re._parser.parse(node["pattern"], 0).getwidth()
        if minimum >= node[keyword]:
            return dict(earlier_keyword="pattern", proof="Every regex match consumes at least %d characters; any input shorter than minLength=%d cannot match." % (minimum, node[keyword]),
                        no_isolation_credit=True)
    for earlier in ("const", "enum"):
        if earlier not in node or keyword == earlier:
            continue
        permitted = [node[earlier]] if earlier == "const" else node[earlier]
        assertion = {keyword: node[keyword]}
        check = Validator(assertion, format_checker=current_formats())
        if permitted and all(not list(check.iter_errors(v)) for v in permitted):
            return dict(earlier_keyword=earlier,
                        proof="Every value permitted by this %s satisfies the unchanged %s assertion; an input violating it necessarily violates %s too. This is an implication, not a first-refusal-order certificate." % (earlier, keyword, earlier),
                        permitted_sha256=sha(permitted), no_isolation_credit=True)
    if keyword == "uniqueItems" and node.get("maxItems", 2) <= 1:
        return dict(earlier_keyword="maxItems", proof="An array of at most one item cannot contain duplicate items.", no_isolation_credit=True)
    return None


def replaced(value, path, replacement):
    if not path:
        return copy.deepcopy(replacement)
    result = copy.deepcopy(value)
    at(result, path[:-1])[path[-1]] = copy.deepcopy(replacement)
    return result


def leaf_cells(path, document, pointer, specimen, registry):
    original = validator(path, document, pointer, registry)
    cases = []
    for schema_path, input_path, node, value in node_subjects(document, pointer, specimen):
        for keyword in ASSERTIONS:
            if keyword not in node:
                continue
            changed = copy.deepcopy(document)
            del at(changed, schema_path)[keyword]
            weakened = validator(path, changed, pointer, registry)
            attempted = []
            proved = None
            for replacement in replacements(keyword, node, value):
                bad = replaced(specimen, input_path, replacement)
                errors = list(original.iter_errors(bad))
                actual = [(e.validator, list(e.schema_path), list(e.path), sha(e.schema)) for e in errors]
                own = (len(errors) == 1 and errors[0].validator == keyword
                       and tuple(errors[0].path) == input_path and sha(errors[0].schema) == sha(node))
                cut = error_keys(weakened, bad)
                restored = error_keys(original, bad)
                attempted.append(dict(baseline=actual, cut=cut, restored=restored))
                if own and not cut and len(restored) == 1 and restored[0][0] == keyword:
                    proved = dict(baseline=actual, cut=cut, restored=restored, input_sha256=sha(bad))
                    break
            cases.append(dict(id="/".join(map(str, schema_path + (keyword,))) + "@/" + "/".join(map(str, input_path)),
                              schema_path=list(schema_path + (keyword,)), input_path=list(input_path),
                              keyword=keyword, killed=proved is not None, evidence=proved,
                              entailed=None if proved else entailment(node, keyword),
                              not_proved=None if proved else dict(
                                  reason="No attempted input exposed only this owner assertion; no isolation credit.",
                                  attempts=attempted)))
    return cases


def family_cells(row, registry):
    spec = schema_spec(row)
    if spec is None:
        return dict(event_type=row["event_type"], status="NOT_APPLICABLE", cases=[], boundary="retired Settings name")
    path, pointer, fixtures = spec
    document = load(path)
    before = sha(document)
    original = validator(path, document, pointer, registry)
    valid = None
    bound_fixture = None
    for fixture in fixtures:
        for candidate in specimens(load(fixture), row["event_type"]):
            if not error_keys(original, candidate):
                valid = copy.deepcopy(candidate)
                bound_fixture = fixture
                break
        if valid is not None:
            break
    if valid is None:
        return dict(event_type=row["event_type"], status="NO_BOUND_POSITIVE", schema=path, cases=[])
    node = at(document, pointer)
    cases = []
    for member in node.get("required", []):
        bad = copy.deepcopy(valid)
        bad.pop(member)
        changed = copy.deepcopy(document)
        at(changed, pointer)["required"].remove(member)
        expected = [("required", ["required"], [])]
        refused = error_keys(original, bad)
        cut = error_keys(validator(path, changed, pointer, registry), bad)
        restored = error_keys(original, bad)
        cases.append(dict(id="required/" + member, expected=expected, baseline=refused, cut=cut, restored=restored,
                          killed=refused == expected and not cut and restored == expected,
                          schema_mutation="remove exactly this required member", input_sha256=sha(bad)))
    if node.get("additionalProperties") is False:
        bad = dict(valid, pnc019_s4o2_unknown_member=True)
        changed = copy.deepcopy(document)
        at(changed, pointer)["additionalProperties"] = True
        expected = [("additionalProperties", ["additionalProperties"], [])]
        refused = error_keys(original, bad)
        cut = error_keys(validator(path, changed, pointer, registry), bad)
        restored = error_keys(original, bad)
        cases.append(dict(id="additionalProperties", expected=expected, baseline=refused, cut=cut, restored=restored,
                          killed=refused == expected and not cut and restored == expected,
                          schema_mutation="allow extra root members only", input_sha256=sha(bad)))
    if sha(document) != before:
        raise AssertionError("schema source mutated: " + path)
    cases.extend(leaf_cells(path, document, pointer, valid, registry))
    return dict(event_type=row["event_type"], status="PASS" if cases and all(c["killed"] for c in cases) else "PARTIAL",
                schema=path, schema_pointer=list(pointer), schema_sha256=hashlib.sha256((ROOT / path).read_bytes()).hexdigest(),
                fixture=bound_fixture, fixture_sha256=hashlib.sha256((ROOT / bound_fixture).read_bytes()).hexdigest(),
                specimen_sha256=sha(valid), original_schema_restored=True, cases=cases,
                boundary="root schema consumer only; no complete-path or Method B keyword proof credit")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--family", action="append")
    args = parser.parse_args()
    registry = resources()
    assignment = manifest()["rows"]
    if args.family and (len(set(args.family)) != len(args.family)
                        or not set(args.family) <= {r["event_type"] for r in assignment}):
        parser.error("--family must name distinct families in the S4o2 assignment")
    rows = [r for r in assignment if not args.family or r["event_type"] in args.family]
    sources = {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest()
               for p in (ROOT / "Plans").rglob("*.schema.json")
               if not any(part.startswith(".") or part == "_shards" for part in p.relative_to(ROOT / "Plans").parts)}
    sources.update({"scripts/" + name: hashlib.sha256((ROOT / "scripts" / name).read_bytes()).hexdigest()
                    for name in ("pm_pnc019_s4o2_schema_cells.py", "pm_pnc019_s4o2_oracles.py",
                                 "pm_event_numbers.py", "pm_event_datetime.py")})
    sources[MANIFEST] = hashlib.sha256((ROOT / MANIFEST).read_bytes()).hexdigest()
    result = []
    for row in rows:
        try:
            report = family_cells(row, registry)
        except Exception as exc:
            # An infrastructure/derivation error is an explicit non-result,
            # never a refusal or a mutation kill. Continue the other families.
            report = dict(event_type=row["event_type"], status="ERROR", cases=[],
                          error=type(exc).__name__ + ": " + str(exc))
        result.append(report)
        print(row["event_type"], report["status"], len(report["cases"]), flush=True)
        args.out.write_text(json.dumps(dict(rows=result, sources=sources, native_execution="NOT_RUN"), indent=2) + "\n")
    return int(any(r["status"] not in ("PASS", "NOT_APPLICABLE") for r in result))


if __name__ == "__main__":
    raise SystemExit(main())
