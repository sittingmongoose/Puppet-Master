#!/usr/bin/env python3
"""W5 successor selection, scoped routing and stored-root preconditions.

These are source-package controls, never CF/P whole semantic tuple cases.
All original schema bytes stay in their isolated declared realm.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
from urllib.parse import urldefrag, urljoin

from jsonschema import Draft202012Validator, FormatChecker, validators
from referencing.exceptions import Unresolvable

from pm_goal_own_c3_w5_oracles import (
    ROOT, LOCATIONS, OriginalPrecondition, MAPS, LISTS, SINGLES, segment,
)


DIRECTORY = "Plans/goal_run_certified_consumer_contracts/source-package.v2/"
EDITION = "pm.goal_run_certified.consumer_source.v2"
CONSUMER_URI = "https://puppetmaster.local/proposals/goal_run_started_cancelled_certified_consumer.v1.schema.json"


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


class ScopedInstances:
    """Resolve each cross-realm reference at its original schema location."""

    def __init__(self, bank):
        self.bank = bank
        self.origins = {}
        for realm, documents in bank.documents.items():
            for entry, document in documents:
                self.inventory(document, realm, entry)

        def reference(validator, ref, instance, schema):
            try:
                resolved = validator._resolver.lookup(ref)
            except Unresolvable:
                realm, entry, location = self.origins[id(schema)]
                uri, fragment = urldefrag(urljoin(validator._resolver._base_uri, ref))
                edge = bank.explicit_import(realm, entry, location + "/$ref", ref, uri)
                if edge is None:
                    raise ValueError(f"no scoped import: {realm} {location} {ref}")
                target_realm, target_uri, expected = edge
                if bank.entries[target_realm][target_uri]["sha256"] != expected:
                    raise ValueError("scoped target hash mismatched")
                resolved = bank.registries[target_realm].resolver(target_uri).lookup("#" + fragment)
            yield from validator.descend(instance, resolved.contents, resolver=resolved.resolver)

        self.validator = validators.extend(Draft202012Validator, {"$ref": reference})

    def inventory(self, schema, realm, entry, location=""):
        if not isinstance(schema, dict):
            return
        self.origins[id(schema)] = (realm, entry, location)
        for keyword in MAPS:
            for name, child in schema.get(keyword, {}).items():
                self.inventory(child, realm, entry, location + "/" + keyword + "/" + segment(name))
        for keyword in LISTS:
            for index, child in enumerate(schema.get(keyword, [])):
                self.inventory(child, realm, entry, location + "/" + keyword + "/" + str(index))
        for keyword in SINGLES:
            if isinstance(schema.get(keyword), dict):
                self.inventory(schema[keyword], realm, entry, location + "/" + keyword)

    def errors(self, realm, uri, value):
        resolved = self.bank.registries[realm].resolver().lookup(uri)
        return list(self.validator(
            resolved.contents, _resolver=resolved.resolver,
            format_checker=FormatChecker(),
        ).iter_errors(value))


def package_controls(bank):
    selection = json.loads((ROOT / DIRECTORY / "selection.json").read_bytes())
    profile_path = ROOT / selection["installed_profile"]["path"]
    assert digest(profile_path.read_bytes()) == selection["installed_profile"]["sha256"]
    profile = json.loads(profile_path.read_bytes())
    assert profile["source_package_edition"] == selection["edition"] == EDITION
    for member in profile["members"]:
        raw = (ROOT / member["path"]).read_bytes()
        assert digest(raw) == member["sha256"] and len(raw) == member["bytes"], member["path"]
    for member in selection["predecessor_members"]:
        assert digest((ROOT / member["path"]).read_bytes()) == member["sha256"]
    predecessor = ROOT / "Plans/goal_run_certified_consumer_contracts"
    assert (ROOT / DIRECTORY / "resource-realms.json").read_bytes() == (predecessor / "resource-realms.json").read_bytes()
    old_imports = json.loads((predecessor / "imports.json").read_bytes())
    assert {k: bank.imports[k] for k in old_imports} == old_imports
    methods = json.loads((ROOT / DIRECTORY / "methods.json").read_bytes())
    assert all(m["source_package_selection"]["edition"] == EDITION
               and m["source_package_selection"]["imports"] == selection["imports"]
               and m["source_package_selection"]["resource_realms"] == selection["resource_realms"]
               for m in methods["methods"])
    original_methods = json.loads((predecessor / "methods.json").read_bytes())
    semantic_copy = copy.deepcopy(methods)
    semantic_copy.pop("source_package_edition")
    semantic_copy["status"] = original_methods["status"]
    for method in semantic_copy["methods"]:
        method.pop("source_package_selection")
    assert semantic_copy == original_methods

    edge, = bank.imports["newly_authored_location_scoped_imports"]
    assert edge["from_realm"] == "cancelled_native_consumer"
    assert edge["from_whole_schema"] == "Plans/workflow_activation_contracts/schemas/native-worknode-source.v1.schema.json"
    assert edge["from_whole_sha256"] == "92acbc346f2d066801b3c06f3975d06779c8bc637a02d5ef944466918f89bae1"
    assert edge["to_realm"] == edge["nested_resolution_realm"] == "retained_original_d05"
    assert edge["whole_target_sha256"] == "1b1cff7b32b90f22734e90f025c020a05f9145fbea82ce156cb2224611ce8d4d"
    aliases = sorted(uri for uri, entry in bank.entries[edge["from_realm"]].items()
                     if entry["path"] == edge["from_whole_schema"] and uri.startswith("file:"))
    assert edge["from_retrieval_uris"] == aliases and len(aliases) == 2
    expected_locations = sorted([
        {"location": loc + "/$ref", "literal_reference": node["$ref"]}
        for realm, entry, loc, node in schema_nodes(bank)
        if realm == edge["from_realm"] and entry["retrieval_uri"] == aliases[0]
        and entry["path"] == edge["from_whole_schema"] and "$ref" in node
        and node["$ref"].startswith("inputs/Plans/plans_to_code_handoff.schema.json#")
    ], key=lambda item: item["location"])
    assert edge["from_schema_locations"] == expected_locations and len(expected_locations) == 11
    cases = []
    negatives = {}
    for alias in edge["from_retrieval_uris"]:
        entry = bank.entries[edge["from_realm"]][alias]
        for source in edge["from_schema_locations"]:
            realm, location, ref, absolute = edge["from_realm"], source["location"], source["literal_reference"], edge["unresolved_retrieval_uri"]
            args = (realm, entry, location, ref, absolute)
            expected = (edge["to_realm"], edge["to_retrieval_uri"], edge["whole_target_sha256"])
            assert bank.explicit_import(*args) == expected
            target = bank.registries[edge["to_realm"]].resolver(edge["to_retrieval_uri"]).lookup("#" + urldefrag(ref)[1])
            assert isinstance(target.contents, dict)
            cases.append({"alias": alias, "location": location, "result": "EXACT_ROUTE_RESOLVED"})
    alias = edge["from_retrieval_uris"][0]
    entry = bank.entries[edge["from_realm"]][alias]
    source = edge["from_schema_locations"][0]
    base = [edge["from_realm"], entry, source["location"], source["literal_reference"], edge["unresolved_retrieval_uri"]]
    for field, value in (("realm", "consumer"), ("path", "Plans/other.schema.json"),
                         ("sha256", "0" * 64), ("retrieval_uri", alias + ".other"),
                         ("location", source["location"] + "/unlisted"),
                         ("literal", source["literal_reference"] + "other"),
                         ("absolute", edge["unresolved_retrieval_uri"] + ".other")):
        args = copy.deepcopy(base)
        if field in ("path", "sha256", "retrieval_uri"):
            args[1][field] = value
        else:
            args[{"realm": 0, "location": 2, "literal": 3, "absolute": 4}[field]] = value
        assert bank.explicit_import(*args) is None, field
        negatives["scope/" + field] = ["W5-SOURCE-REFUSE-" + field]
    # These are import-declaration seams; no stale profile is submitted as a tuple.
    original_edge = copy.deepcopy(edge)
    for field, value, expected_error in (
        ("nested_resolution_realm", "consumer", "scoped import changed nested resolution realm"),
        ("whole_target_sha256", "0" * 64, "explicit import target bytes mismatched"),
    ):
        edge[field] = value
        try:
            if field == "nested_resolution_realm":
                bank.explicit_import(*base)
            else:
                bank.check_ref(bank.registries[base[0]].resolver(alias), *base[:4])
        except ValueError as error:
            assert str(error) == expected_error
        else:
            raise AssertionError("mismatched import declaration accepted: " + field)
        finally:
            edge.clear()
            edge.update(copy.deepcopy(original_edge))
        negatives["scope/" + field] = ["W5-SOURCE-REFUSE-" + field]
    return {"qualification": "SOURCE_PACKAGE_CONTROLS_ONLY_NO_NATIVE_OR_CF_P_TUPLES",
            "profile_members_verified": len(profile["members"]),
            "methods_explicitly_selected": len(methods["methods"]),
            "positive_routes": cases, "negative_routes": len(negatives),
            "guard_negative_inventory": negatives}


def schema_nodes(bank):
    def walk(node, realm, entry, location=""):
        if not isinstance(node, dict):
            return
        yield realm, entry, location, node
        for keyword in MAPS:
            for name, child in node.get(keyword, {}).items():
                yield from walk(child, realm, entry, location + "/" + keyword + "/" + segment(name))
        for keyword in LISTS:
            for index, child in enumerate(node.get(keyword, [])):
                yield from walk(child, realm, entry, location + "/" + keyword + "/" + str(index))
        for keyword in SINGLES:
            if isinstance(node.get(keyword), dict):
                yield from walk(node[keyword], realm, entry, location + "/" + keyword)
    for realm, documents in bank.documents.items():
        for entry, document in documents:
            yield from walk(document, realm, entry)


def original_pack():
    inputs = json.loads((ROOT / "Plans/goal_own_c_contracts/source-witness-inputs.json").read_bytes())
    path = Path(inputs["original_storage_codec"])
    expected = next(x["sha256"] for x in inputs["files"] if x["path"] == str(path))
    assert digest(path.read_bytes()) == expected
    spec = importlib.util.spec_from_file_location("w5_original_storage_codec", path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module.pack, {"path": str(path), "sha256": expected}


def stored_root_precondition(bank):
    """A representation counterexample, not an original issuance specimen."""
    fixture_path = ROOT / DIRECTORY / "size-precondition.fixture.json"
    fixture = json.loads(fixture_path.read_bytes())
    pack, codec = original_pack()
    assert codec == fixture["original_codec"]
    row = fixture["storage_projection"]
    event = row["record"]["original_event"]
    scoped = ScopedInstances(bank)
    root = CONSUMER_URI + "#/$defs/StorageProjection"
    assert not scoped.errors("consumer", root, row)
    assert not scoped.errors("consumer", CONSUMER_URI + "#/$defs/TypedCertifiedEvent", event)
    small = copy.deepcopy(row)
    small["record"]["original_event"]["payload"]["evidence_refs"] = []
    assert not scoped.errors("consumer", root, small)
    assert len(pack(small)) <= 16384
    sizes = {"inline_payload_messagepack": len(pack(event["payload"])),
             "inline_payload_compact_utf8_json": len(json.dumps(event["payload"], ensure_ascii=False, separators=(",", ":")).encode()),
             "whole_event_messagepack": len(pack(event)),
             "certified_projection_messagepack": len(pack(row["record"])),
             "whole_storage_projection_messagepack": len(pack(row)),
             "small_control_whole_storage_projection_messagepack": len(pack(small)),
             "redb_value_limit": 16384}
    assert sizes["inline_payload_compact_utf8_json"] <= 16384
    assert sizes["whole_event_messagepack"] <= 16384 < sizes["whole_storage_projection_messagepack"]
    try:
        pack(row, max_bytes=16384)
    except ValueError as error:
        assert str(error) == "encoded_size_cap"
        original_refusal = type(error).__name__ + ":" + str(error)
    else:
        raise AssertionError("original codec accepted oversized whole row")
    # Replacing the entire Event or adding a reference cannot inhabit this frozen root.
    # These are schema-seam controls, not negative semantic tuples with stale digests.
    no_event = copy.deepcopy(row)
    del no_event["record"]["original_event"]
    ref_instead = copy.deepcopy(no_event)
    ref_instead["record"]["original_event_ref"] = {
        "blake3": "0" * 64, "byte_size": len(pack(event)),
        "media_type": "application/msgpack",
    }
    referenced_payload = copy.deepcopy(event)
    referenced_payload["payload"] = None
    referenced_payload["payload_ref"] = "TEST_ONLY:payload-pack-reference"
    refused = {}
    for label, value, selected_root in (
        ("missing_original_event", no_event, root),
        ("reference_instead_of_required_event", ref_instead, root),
        ("externalized_event_payload", referenced_payload, CONSUMER_URI + "#/$defs/TypedCertifiedEvent"),
    ):
        errors = scoped.errors("consumer", selected_root, value)
        assert errors, label
        refused[label] = [{"instance_path": list(e.path), "schema_path": list(e.schema_path),
                           "keyword": e.validator} for e in errors]
    return {"status": "BLOCKED", "blocker": "W5-STORAGE-PROJECTION-NO-REFERENCE-EDITION",
            "qualification": "WHOLE_ORIGINAL_SCHEMA_AND_EXACT_CODEC_COUNTEREXAMPLE_ONLY_NO_ISSUANCE_OR_SEMANTIC_TUPLE",
            "fixture": {"path": str(fixture_path.relative_to(ROOT)), "sha256": digest(fixture_path.read_bytes())},
            "original_codec": codec, "sizes": sizes,
            "original_limit_refusal": original_refusal,
            "reference_shape_refusals": refused,
            "source_constraints": {"evidence_refs_count": len(event["payload"]["evidence_refs"]),
                                   "each_reference_utf8_bytes": sorted({len(x.encode()) for x in event["payload"]["evidence_refs"]}),
                                   "original_event_required": True, "additional_record_properties_allowed": False},
            "blocked_facets": ["CF-10", "CF-11", "P4", "P5", "P6", "P7"],
            "whole_suite_closure": "BLOCKED", "full_tuple_cases": 0}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    locations = json.loads(LOCATIONS.read_bytes())["whole_resource_locations"]
    bank = OriginalPrecondition("goal_run_certified_consumer_contracts", locations,
                                source_directory=DIRECTORY)
    report = {"edition": EDITION, "controls": package_controls(bank),
              "stored_root_precondition": stored_root_precondition(bank),
              "complete_path_positives": 0, "complete_path_negatives": 0,
              "native_execution": "NOT_RUN"}
    args.output.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"source_package_controls": "PASS", "positive_routes": len(report["controls"]["positive_routes"]),
                      "negative_routes": report["controls"]["negative_routes"],
                      "closure": report["stored_root_precondition"]["whole_suite_closure"],
                      "sizes": report["stored_root_precondition"]["sizes"]}))
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
