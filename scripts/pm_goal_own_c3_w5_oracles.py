#!/usr/bin/env python3
"""C3-W5 original-bank precondition; does not claim complete-path oracles.

Keep registries separate. Resolve only original explicit import edges. Check
every schema reference, including unvisited definitions, before specimens can
be called a complete original tuple. A missing original edge exits 2.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from urllib.parse import urldefrag, urljoin

from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012


ROOT = Path(__file__).resolve().parents[1]
LOCATIONS = ROOT / "reports/event-authority-20261105/DG-OWN-C3-W5-source-locations.json"
PACKAGES = (
    "goal_certified_event_coordinator_contracts",
    "goal_run_certified_consumer_contracts",
)
MAPS = ("$defs", "definitions", "properties", "patternProperties", "dependentSchemas")
LISTS = ("allOf", "anyOf", "oneOf", "prefixItems")
SINGLES = (
    "items", "contains", "if", "then", "else", "not", "additionalProperties",
    "unevaluatedProperties", "propertyNames", "unevaluatedItems", "contentSchema",
)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def read(path):
    return json.loads((ROOT / path).read_bytes())


def pointer(value, fragment):
    for key in fragment.lstrip("#").split("/")[1:]:
        key = key.replace("~1", "/").replace("~0", "~")
        value = value[int(key)] if isinstance(value, list) else value[key]
    return value


def segment(key):
    return str(key).replace("~", "~0").replace("/", "~1")


class OriginalPrecondition:
    def __init__(self, package, locations):
        self.package = package
        self.prefix = f"Plans/{package}/"
        self.declarations = read(self.prefix + "resource-realms.json")
        self.registries = {}
        self.documents = {}
        self.entries = {}
        self.reference_count = 0
        self.explicit_crossings = 0
        self.errors = []
        self.selected_files = {}
        for realm, declaration in self.declarations.items():
            registry = Registry()
            documents = []
            entries = {}
            for entry in declaration["resources"]:
                path = entry["path"]
                expected = entry["sha256"]
                selected = locations.get(path + "@" + expected, path)
                raw = (ROOT / selected).read_bytes()
                if sha(raw) != expected:
                    raise ValueError(f"whole original bytes mismatched: {path}")
                self.selected_files[selected] = expected
                document = pointer(json.loads(raw), entry.get("json_pointer", ""))
                uri = entry["retrieval_uri"]
                origin = (expected, entry.get("json_pointer", "").lstrip("#"))
                if uri in entries:
                    prior = entries[uri]
                    if origin != (prior["sha256"], prior.get("json_pointer", "").lstrip("#")):
                        raise ValueError(f"original URI rebound: {realm} {uri}")
                entries[uri] = entry
                documents.append((entry, document))
                registry = registry.with_resource(
                    uri, Resource.from_contents(document, default_specification=DRAFT202012)
                )
            self.entries[realm] = entries
            self.documents[realm] = documents
            self.registries[realm] = registry.crawl()
        self.imports = {"imports": [], "inherited_exact_edges": []}
        imports_path = ROOT / self.prefix / "imports.json"
        if imports_path.exists():
            self.imports = json.loads(imports_path.read_bytes())
        routing_path = ROOT / self.prefix / "original-reference-routing.json"
        self.inherited = list(self.imports.get("inherited_exact_edges", []))
        if routing_path.exists():
            self.inherited += json.loads(routing_path.read_bytes())["new_explicit_edges"]

    def explicit_import(self, realm, entry, location, ref, absolute_uri):
        for edge in self.imports.get("imports", []):
            if (edge["from_realm"], edge["from_whole_schema"],
                edge["from_schema_location"], edge["literal_reference"]) == (
                    realm, entry["path"], location, ref):
                if edge["from_whole_sha256"] != entry["sha256"]:
                    raise ValueError("explicit import source bytes mismatched")
                target = edge["whole_source"]
                return edge["to_realm"], edge["to_retrieval_uri"], target["sha256"]
        for edge in self.inherited:
            if realm in edge["from_realms"] and edge["unresolved_retrieval_uri"] == absolute_uri:
                return edge["to_realm"], edge["to_retrieval_uri"], edge["whole_target_sha256"]
        return None

    def check_ref(self, resolver, realm, entry, location, ref):
        self.reference_count += 1
        try:
            resolver.lookup(ref)
            return
        except Exception as error:
            # The resolver's semantic base includes nested original $id values.
            uri, fragment = urldefrag(urljoin(resolver._base_uri, ref))
            original_error = type(error).__name__
        edge = self.explicit_import(realm, entry, location, ref, uri)
        if edge:
            target_realm, target_uri, expected = edge
            target = self.entries[target_realm][target_uri]
            if target["sha256"] != expected:
                raise ValueError("explicit import target bytes mismatched")
            self.registries[target_realm].resolver(target_uri).lookup("#" + fragment)
            self.explicit_crossings += 1
            return
        self.errors.append({
            "realm": realm, "whole_source": entry["path"],
            "whole_source_sha256": entry["sha256"],
            "retrieval_uri": entry["retrieval_uri"], "location": location,
            "literal_reference": ref, "absolute_reference": uri + "#" + fragment,
            "error": original_error, "reason": "no original resource or admitted explicit import",
        })

    def walk(self, schema, resolver, realm, entry, location=""):
        if not isinstance(schema, dict):
            return
        if "$id" in schema:
            resolver = resolver.in_subresource(
                Resource.from_contents(schema, default_specification=DRAFT202012)
            )
        if "$ref" in schema:
            self.check_ref(resolver, realm, entry, location + "/$ref", schema["$ref"])
        for key in MAPS:
            for name, child in schema.get(key, {}).items():
                self.walk(child, resolver, realm, entry, location + "/" + key + "/" + segment(name))
        for key in LISTS:
            for index, child in enumerate(schema.get(key, [])):
                self.walk(child, resolver, realm, entry, location + "/" + key + "/" + str(index))
        for key in SINGLES:
            if isinstance(schema.get(key), dict):
                self.walk(schema[key], resolver, realm, entry, location + "/" + key)

    def run(self):
        for realm, documents in self.documents.items():
            for entry, document in documents:
                self.walk(document, self.registries[realm].resolver(entry["retrieval_uri"]), realm, entry)
        return {
            "qualification": "LITERAL_SCHEMA_REFERENCE_CLOSURE_ONLY_NO_INSTANCE_OR_AUTHORITY_PROOF",
            "status": "BLOCKED" if self.errors else "SCHEMA_REFERENCES_RESOLVED",
            "resource_occurrences": sum(len(x) for x in self.documents.values()),
            "reference_occurrences": self.reference_count,
            "explicit_cross_realm_occurrences": self.explicit_crossings,
            "unresolved_occurrences": self.errors,
            "selected_whole_files_sha256": self.selected_files,
        }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    locations = json.loads(LOCATIONS.read_bytes())["whole_resource_locations"]
    report = {
        "schema_id": "pm.goal_own_c3_w5.original_bank_precondition.v1",
        "base_commit": "e1188eae0c5fa5cf0a8548d9dba76f6f0de8c437",
        "event_type": "goal_run.certified", "native_execution": "NOT_RUN",
        "complete_path_positives": 0, "complete_path_negatives": 0,
        "packages": {name: OriginalPrecondition(name, locations).run() for name in PACKAGES},
    }
    report["closure"] = "BLOCKED" if any(
        x["status"] == "BLOCKED" for x in report["packages"].values()
    ) else "NOT_ASSESSED_FULL_TUPLES_NOT_RUN"
    if args.output:
        args.output.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({
        "closure": report["closure"],
        "packages": {k: {"references": v["reference_occurrences"],
                         "unresolved": len(v["unresolved_occurrences"])}
                     for k, v in report["packages"].items()},
        "complete_path_positives": 0, "complete_path_negatives": 0,
    }))
    return 2 if report["closure"] == "BLOCKED" else 0


if __name__ == "__main__":
    raise SystemExit(main())
