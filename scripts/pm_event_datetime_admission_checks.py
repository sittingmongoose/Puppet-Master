"""Finite regression controls for the CV-1101 admission/discovery boundary."""
from __future__ import annotations

import copy
import json
from pathlib import Path
import tempfile


def regression_checks(root):
    import pm_event_datetime_inventory as inv
    from pm_event_datetime import datetime_validator
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012

    root = Path(root)
    checks = {}
    schema = {"$schema": "https://json-schema.org/draft/2020-12/schema",
              "type": "object", "properties": {f: {"type": "string", "format": "date-time"}
                                                    for f in inv.FIELDS},
              "required": sorted(inv.FIELDS)}
    raw = json.dumps(schema)
    forms = {
        "json": ("new.json", raw.encode()),
        "utf16": ("new.json", raw.encode("utf-16")),
        "utf32": ("new.json", raw.encode("utf-32")),
        "upper": ("new.JSON", raw.encode()),
        "yaml_suffix": ("new.yaml", raw.encode()),
        "schema_suffix": ("new.schema", raw.encode()),
        "extensionless": ("new", raw.encode()),
        "text_suffix": ("new.txt", raw.encode()),
        "mdx": ("new.mdx", ("```json\n" + raw + "\n```\n").encode()),
        "indented": ("new.md", ("    " + raw + "\n").encode()),
        "inline": ("new.md", ("Schema: `" + raw + "`\n").encode()),
        "html": ("new.md", ('<script type="application/schema+json">\n' + raw + '\n</script>\n').encode()),
        "yaml_fence": ("new.md", b'```yaml\nrequired: [observed_at_utc]\n```\n'),
        "string_json": ("new.json", json.dumps({"schema_json": raw}).encode()),
        "string_jsonl": ("new.jsonl", (json.dumps({"schema_json": raw}) + '\n{}\n').encode()),
        "string_fence": ("new.md", ('```json\n' + json.dumps({"schema_json": raw}) + '\n```\n').encode()),
        "pattern": ("new.json", json.dumps({"patternProperties": {"^observed_at_utc$": {"type": "string"}}}).encode()),
        "wildcard": ("new.json", b'{"patternProperties": {".*": {"type": "string"}}}'),
        "wildcard_string": ("new.json", json.dumps({"schema_json": json.dumps({"patternProperties": {".*": {"type": "string"}}})}).encode()),
        "wildcard_yaml_fence": ("new.md", b'```yaml\npatternProperties: {".*": {type: string}}\n```\n'),
        "wildcard_yaml_file": ("new.yaml", b'patternProperties: {".*": {type: string}}\n'),
        "wildcard_html": ("new.md", b'<script type="application/schema+json">\n{"patternProperties":{".*":{}}}\n</script>\n'),
        "wildcard_malformed_string": ("new.json", json.dumps({"schema_json": '{"patternProperties":{".*":{}}'}).encode()),
        "wildcard_malformed": ("new.txt", b'{"patternProperties":{".*":{}}'),
        "propertynames_yaml": ("new.yaml", b'propertyNames: {pattern: ".*"}\n'),
        "escaped": ("new.json", raw.replace('observed_at_utc', r'\u006fbserved_at_utc').encode()),
        "containers": ("new.md", ('> - > ```json\n>   > ' + raw + '\n>   > ```\n').encode()),
    }
    with tempfile.TemporaryDirectory(prefix="pm-datetime-admission-") as temp:
        scratch = Path(temp)
        (scratch / "Plans").mkdir()
        (scratch / "scripts").mkdir()
        (scratch / inv.EXCLUSIONS).write_text("[]\n")
        for name, (filename, data) in forms.items():
            file = scratch / "Plans" / filename
            try:
                file.write_bytes(data)
                nodes, errors = inv.scan(scratch)
                checks["datetime_scan_" + name] = bool(nodes or errors)
            finally:
                file.unlink()
        target = scratch / "Plans/target.txt"
        link = scratch / "Plans/link.schema.json"
        try:
            target.write_text(raw)
            link.symlink_to(target.name)
            nodes, errors = inv.scan(scratch)
            checks["datetime_scan_symlink"] = any(r["path"].endswith("link.schema.json") for r in nodes)
        finally:
            link.unlink()
            target.unlink()
    with tempfile.TemporaryDirectory(prefix="pm-datetime-exclusions-") as temp:
        scratch = Path(temp)
        (scratch / "Plans").mkdir()
        (scratch / "scripts").mkdir()
        file = scratch / "Plans/copy.json"
        for name, value, referenced in (
            ("schema", schema, False),
            ("referenced_fragment", {"properties": {"observed_at_utc": {}}}, True),
            ("referenced_neutral", {}, True),
        ):
            file.write_text(json.dumps(value))
            if referenced:
                (scratch / "Plans/ref.json").write_text(json.dumps({"$schema": schema["$schema"], "$ref": "copy.json"}))
            exclusion = {"path": "Plans/copy.json", "origin": "json", "sha256": inv.hashlib.sha256(json.dumps(value).encode()).hexdigest(),
                         "reason": "Claimed instance data", "citation": "Plans/copy.json#json"}
            (scratch / inv.EXCLUSIONS).write_text(json.dumps([exclusion]))
            _, errors = inv.scan(scratch)
            checks["datetime_exclusion_rejects_" + name] = any(
                "loadable_schema_exclusion_forbidden" in e.get("detail", "") for e in errors)
            (scratch / "Plans/ref.json").unlink(missing_ok=True)
    # Admission refuses every declaration form, even when an empty instance
    # would keep that keyword from examining the field's value.
    declarations = {
        "properties": {"properties": {"observed_at_utc": {}}},
        "patternProperties": {"patternProperties": {"observed.*": {}}},
        "required": {"required": ["observed_at_utc"]},
        "dependentRequired_key": {"dependentRequired": {"observed_at_utc": ["x"]}},
        "dependentRequired_value": {"dependentRequired": {"x": ["persisted_at_utc"]}},
        "dependentSchemas": {"dependentSchemas": {"observed_at_utc": {}}},
        "propertyNames": {"propertyNames": {"pattern": "^observed_at_utc$"}},
        "const": {"const": "observed_at_utc"},
        "const_object": {"const": {"observed_at_utc": "value"}},
        "enum_object": {"enum": [{"persisted_at_utc": "value"}]},
        "propertyNames_true": {"propertyNames": True},
        "enum": {"enum": ["persisted_at_utc"]},
    }
    for name, declaration in declarations.items():
        resource = Resource.from_contents(declaration, default_specification=DRAFT202012)
        bank = {"urn:pm:unclassified": resource}
        routes = {
            "direct": (declaration, {}, {}),
            "nested": ({"properties": {"value": declaration}}, {"value": {}}, {}),
            "lazy": ({"$ref": "urn:pm:unclassified"}, {},
                     {"registry": Registry(retrieve=lambda uri: bank[uri])}),
        }
        for route, (candidate, instance, kwargs) in routes.items():
            try:
                datetime_validator(candidate, **kwargs).is_valid(instance)
            except inv.DatetimeAdmissionError as error:
                checks[f"datetime_admission_{name}_{route}"] = error.reason == ("datetime_on_demand_retrieval_unsupported" if route == "lazy" else "datetime_schema_unclassified")
            else:
                checks[f"datetime_admission_{name}_{route}"] = False
    inventory = json.loads((root / inv.INVENTORY).read_text())
    for name in ("profile_flip", "empty_citations", "false_role"):
        mutated = copy.deepcopy(inventory)
        if name == "profile_flip":
            original = next(r for r in mutated["nodes"] if r["path"] == "Plans/event_record.schema.json" and r["pointer"] == "")
            for row in mutated["nodes"]:
                if row["resource_sha256"] == original["resource_sha256"] and row["pointer"][len(row["resource_pointer"]):] == "":
                    row["profile"] = "owner_schema"
        elif name == "empty_citations":
            for row in mutated["nodes"]:
                row["citation"] = [{"path": row["path"], "quote": ""}]
        else:
            mutated["nodes"][0].update(role_evidence={"schema_identity": "WRONG"},
                                        owner_profile="invented-profile", classification="EventRecord")
        checks["datetime_inventory_rejects_" + name] = bool(inv.validate_inventory(mutated, root))
    # B3: each mutation keeps its content checksum coherent. Rejection must
    # come from field/value authority, not merely an out-of-date checksum.
    coordination = next(r for r in inventory["nodes"] if
        r["path"] == "Plans/coordination_event_payloads.schema.json" and
        r["pointer"] == "/$defs/agent_status_updated")
    for name in ("coherent_wrong_field", "sibling_field_pointer"):
        mutated = copy.deepcopy(inventory)
        row = next(r for r in mutated["nodes"] if inv.node_key(r) == inv.node_key(coordination))
        if name == "coherent_wrong_field":
            row["citation"] = [{"path": "Plans/Contracts_V0.md", "quote":
                "This newly authored technical owner unit binds the existing EventRecord envelope "
                "date_time_string format: date-time to an enforced RFC 3339 section 5.6 date-time "
                "predicate, with section 5.7 calendar and leap-second restrictions."}]
        else:
            document = inv._source_document(root, row, {})
            pointer = row["pointer"] + "/properties/agent_id"
            row["citation"] = [{"path": row["path"], "pointer": pointer,
                                "value": inv.at(document, pointer)}]
        errors = inv.validate_inventory(mutated, root)
        refreshed_pin = inv.hashlib.sha256(json.dumps(mutated).encode()).hexdigest()
        checks["datetime_inventory_rejects_" + name] = (
            any(e["error"] == "owner_field_schema_evidence_changed" for e in errors) and
            inv.derived_inventory_pin(mutated, root) != refreshed_pin)
    with tempfile.TemporaryDirectory(prefix="pm-datetime-map-value-") as temp:
        scratch = Path(temp)
        original = next(r for r in inventory["nodes"] if
            r["path"] == "Plans/section15_browser_program_contracts.schema.json" and
            r["pointer"] == "/$defs/browser_program/properties/result_schema_dependencies")
        row = copy.deepcopy(original)
        document = inv._source_document(root, row, {})
        inv.at(document, row["pointer"])["additionalProperties"] = {
            "type": "string", "format": "date-time"}
        for path, value in ((row["path"], document), (inv.INVENTORY_SCHEMA,
                json.loads((root / inv.INVENTORY_SCHEMA).read_text()))):
            file = scratch / path
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_text(json.dumps(value))
        mutated = inv.source_inventory_projection({**inventory, "nodes": [row]}, scratch)
        # All fingerprints, exact evidence and the derived pin are refreshed;
        # only the obsolete non-timestamp classification remains wrong.
        mutated["nodes"][0]["classification"] = "wildcard_non_timestamp"
        errors = inv.validate_inventory(mutated, scratch)
        reclassified = copy.deepcopy(mutated)
        reclassified["nodes"][0]["classification"] = "other_owner_observation"
        checks["datetime_inventory_rejects_timestamp_map_value"] = (
            any(e["error"] == "source_value_classification_conflict" for e in errors) and
            not inv.validate_inventory(reclassified, scratch) and
            inv.derived_inventory_pin(mutated, scratch) !=
                inv.hashlib.sha256(json.dumps(mutated).encode()).hexdigest())
    # Closed-graph controls, with both current and frozen Storage targets.
    envelope = json.loads((root / "Plans/event_record.schema.json").read_text())
    corpus = json.loads((root / "Plans/event_number_recipe_corpus.json").read_text())
    entries = [entry for entry in corpus["inventory_datetime_resources"].values()
               if entry["path"] == "Plans/event_record.schema.json"]
    for index, entry in enumerate(entries):
        uri = envelope["$id"]
        ref = {"$ref": uri + "#" + entry["pointer"]}
        bank = {uri: Resource.from_contents(envelope)}
        registry = Registry().with_resources(bank.items())
        validator = datetime_validator(ref, registry=registry)
        good = entry["baseline"]
        bad = dict(good, persisted_at_utc="2026-01-01T00:00:00+00:00")
        checks[f"datetime_retrieval_eager_{index}"] = validator.is_valid(good) and not validator.is_valid(bad)
        calls = []
        def retrieve(uri):
            calls.append(uri)
            return bank[uri]
        try:
            datetime_validator(ref, registry=Registry(retrieve=retrieve))
        except inv.DatetimeAdmissionError as error:
            checks[f"datetime_retrieval_lazy_{index}"] = (
                error.reason == "datetime_on_demand_retrieval_unsupported" and not calls)
        else:
            checks[f"datetime_retrieval_lazy_{index}"] = False
        changed = copy.deepcopy(envelope)
        if entry["pointer"]:
            parent, field = entry["pointer"].rsplit("/", 1)
            inv.at(changed, parent)[field] = {}
        else:
            changed = {"$schema": envelope["$schema"], "$id": uri}
        try:
            datetime_validator(ref, registry=Registry().with_resource(uri, Resource.from_contents(changed)))
        except inv.DatetimeAdmissionError as error:
            checks[f"datetime_fresh_resource_replacement_{index}"] = error.reason.startswith("datetime_resource_fingerprint_unclassified")
        else:
            checks[f"datetime_fresh_resource_replacement_{index}"] = False
        # Also replace the selected object inside an already admitted complete
        # resource. An empty replacement must not erase its classified target.
        mutable = copy.deepcopy(envelope)
        validator = datetime_validator(ref, registry=Registry().with_resource(uri, Resource.from_contents(mutable)))
        if entry["pointer"]:
            parent, field = entry["pointer"].rsplit("/", 1)
            inv.at(mutable, parent)[field] = {}
        else:
            mutable.clear()
        try:
            validator.is_valid(bad)
        except inv.DatetimeAdmissionError as error:
            checks[f"datetime_target_disappearance_{index}"] = error.reason == "datetime_schema_changed_after_admission"
        else:
            checks[f"datetime_target_disappearance_{index}"] = False
        dialects = (
            ("202012", "https://json-schema.org/draft/2020-12/schema", "$dynamicRef", "$dynamicAnchor"),
            ("201909", "https://json-schema.org/draft/2019-09/schema", "$recursiveRef", "$recursiveAnchor"),
            ("draft7", "http://json-schema.org/draft-07/schema#", "$ref", None),
            ("draft6", "http://json-schema.org/draft-06/schema#", "$ref", None),
        )
        for name, dialect, keyword, anchor in dialects:
            wrapper = {"$schema": dialect, "$id": "urn:pm:datetime:" + name,
                       "anyOf": [ref, {"type": "array", "items": {keyword: "#"}}]}
            if anchor:
                wrapper[anchor] = True if keyword == "$recursiveRef" else "tree"
            if keyword == "$dynamicRef":
                wrapper["anyOf"][1]["items"][keyword] = "#tree"
            registry = Registry().with_resources([*bank.items(), (wrapper["$id"], Resource.from_contents(wrapper))])
            direct = datetime_validator(wrapper, registry=registry)
            referenced = datetime_validator({"$ref": wrapper["$id"]}, registry=registry)
            outcomes = [(v.is_valid([good]), v.is_valid([bad]), v.is_valid([{"not": "event"}]))
                        for v in (direct, referenced)]
            checks[f"datetime_dialect_equivalence_{name}_{index}"] = outcomes == [(True, False, False)] * 2
    for name, candidate, kwargs, reason in (
        ("unsupported_dialect", {"$schema": "http://json-schema.org/draft-04/schema#"}, {}, "datetime_dialect_unsupported"),
        ("missing_resource", {"anyOf": [{"type": "null"}, {"$ref": "urn:pm:missing"}]}, {},
         "datetime_resource_not_preloaded"),
    ):
        try:
            datetime_validator(candidate, **kwargs).is_valid({})
        except inv.DatetimeAdmissionError as error:
            checks["datetime_" + name + "_refused"] = error.reason.startswith(reason)
        else:
            checks["datetime_" + name + "_refused"] = False
    validator = datetime_validator(envelope)
    try:
        list(validator.iter_errors({}, _schema={}))
    except inv.DatetimeAdmissionError as error:
        checks["datetime_schema_override_refused"] = error.reason == "datetime_schema_override_unsupported"
    else:
        checks["datetime_schema_override_refused"] = False
    envelope["title"] = "changed after admission"
    try:
        validator.is_valid({})
    except inv.DatetimeAdmissionError as error:
        checks["datetime_resource_mutation_refused"] = error.reason == "datetime_schema_changed_after_admission"
    else:
        checks["datetime_resource_mutation_refused"] = False
    try:
        datetime_validator({}, resolver=object())
    except inv.DatetimeAdmissionError as error:
        checks["datetime_custom_resolver_refused"] = error.reason == "datetime_custom_resolver_unsupported"
    else:
        checks["datetime_custom_resolver_refused"] = False
    return checks
