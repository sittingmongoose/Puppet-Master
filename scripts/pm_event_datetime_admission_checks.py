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
                checks[f"datetime_admission_{name}_{route}"] = error.reason == "datetime_schema_unclassified"
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
    # Current and frozen internal objects must behave identically for an eager
    # registry and a trusted offline on-demand retrieval callback.
    envelope = json.loads((root / "Plans/event_record.schema.json").read_text())
    corpus = json.loads((root / "Plans/event_number_recipe_corpus.json").read_text())
    entries = [entry for entry in corpus["inventory_datetime_resources"].values()
               if entry["path"] == "Plans/event_record.schema.json"]
    for index, entry in enumerate(entries):
        for mode in ("eager", "lazy"):
            resource = Resource.from_contents(envelope, default_specification=DRAFT202012)
            bank = {envelope["$id"]: resource}
            registry = (Registry().with_resources(bank.items()) if mode == "eager" else
                        Registry(retrieve=lambda uri: bank[uri]))
            validator = datetime_validator({"$ref": envelope["$id"] + "#" + entry["pointer"]}, registry=registry)
            good = validator.is_valid(entry["baseline"])
            bad = all(not validator.is_valid(dict(entry["baseline"], **{field: "2026-01-01T00:00:00+00:00"}))
                      for field in inv.FIELDS if field in entry["baseline"])
            checks[f"datetime_retrieval_{mode}_{index}"] = good and bad
    validator = datetime_validator(envelope)
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
