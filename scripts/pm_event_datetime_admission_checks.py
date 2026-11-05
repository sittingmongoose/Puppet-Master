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
        from pm_event_datetime_value_probe import BATTERY, ROLES
        for path in (BATTERY, ROLES):
            (scratch / path).write_bytes((root / path).read_bytes())
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
    checks.update(wildcard_battery_checks(root, inventory))
    checks.update(wildcard_context_checks(root, inventory))
    checks.update(wildcard_authority_checks(root, inventory))
    return checks


def wildcard_battery_checks(root, inventory):
    """B4 controls keep real source graphs and coherently refreshed evidence."""
    import pm_event_datetime_inventory as inv
    from pm_event_datetime_value_probe import BATTERY, ROLES
    checks = {}
    maps = [r for r in inventory["nodes"] if r["classification"] in (
        "wildcard_non_timestamp", "wildcard_non_timestamp_role")]
    checks["datetime_battery_21_name_maps"] = (len(maps) == 21 and
        sum(r["classification"] == "wildcard_non_timestamp" for r in maps) == 3 and
        sum(r["classification"] == "wildcard_non_timestamp_role" for r in maps) == 18 and
        all(r["value_evidence"]["automatic_credit"]
            if r["classification"] == "wildcard_non_timestamp" else
            r["value_evidence"]["reviewed_role"] is not None for r in maps))
    original = next(r for r in maps if r["path"] == "Plans/section15_browser_program_contracts.schema.json"
                    and r["pointer"].endswith("/result_schema_dependencies"))
    canonical = r"^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]{1,9})?Z$"
    alternate = canonical.replace("[0-9]{4}", "[0-9][0-9][0-9][0-9]").replace("Z$", "(?:Z)$")
    stamp = {"type": "string", "pattern": alternate}
    ref = {"$ref": "#/$defs/battery_stamp"}
    forms = {
        "direct": stamp,
        "ref": ref,
        "anyOf": {"anyOf": [{"type": "string", "maxLength": 4}, ref]},
        "allOf": {"allOf": [{"type": "string"}, ref]},
        "oneOf": {"oneOf": [ref, {"const": ""}]},
        "not": {"not": {"not": ref}},
        "if_then": {"if": {"type": "string"}, "then": ref, "else": False},
        "single_timestamp": {"const": "2016-12-31T23:59:60Z"},
        "timestamp_or_empty": {"anyOf": [stamp, {"const": ""}]},
        "real_format": {"type": "string", "format": "date-time", "const": "2026-01-01T00:00:00Z"},
    }
    with tempfile.TemporaryDirectory(prefix="pm-datetime-battery-") as temp:
        scratch = Path(temp)
        for path in (inv.INVENTORY_SCHEMA, BATTERY, ROLES):
            file = scratch / path
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_bytes((root / path).read_bytes())
        source = scratch / original["path"]
        source.parent.mkdir(parents=True, exist_ok=True)
        for name, value in forms.items():
            document = inv._source_document(root, original, {})
            document["$defs"]["battery_stamp"] = copy.deepcopy(stamp)
            inv.at(document, original["pointer"])["additionalProperties"] = copy.deepcopy(value)
            source.write_text(json.dumps(document))
            projected = inv.source_inventory_projection({**inventory, "nodes": [copy.deepcopy(original)]}, scratch)
            corrected = inv.validate_inventory(projected, scratch)
            bad = copy.deepcopy(projected)
            bad["nodes"][0]["classification"] = "wildcard_non_timestamp"
            errors = inv.validate_inventory(bad, scratch)
            checks["datetime_battery_rejects_" + name] = (
                projected["nodes"][0]["classification"] == "other_owner_observation" and
                any(e["error"] == "source_value_classification_conflict" for e in errors) and
                inv.derived_inventory_pin(bad, scratch) != inv.hashlib.sha256(json.dumps(bad).encode()).hexdigest())
            checks["datetime_battery_corrected_" + name] = not corrected
            stale = copy.deepcopy(bad)
            stale["nodes"][0]["value_evidence"] = original["value_evidence"]
            checks["datetime_battery_stale_fingerprint_" + name] = any(
                e["error"] == "wildcard_value_evidence_changed" for e in inv.validate_inventory(stale, scratch))
            if name == "single_timestamp":
                checks["datetime_battery_exactly_one_acceptance"] = all(
                    r["accepted"] == 1 for r in projected["nodes"][0]["value_evidence"]["results"])
        # A real format checker must refuse an invalid calendar value; an
        # annotation-only implementation would trigger this impossible date.
        document = inv._source_document(root, original, {})
        inv.at(document, original["pointer"])["additionalProperties"] = {
            "format": "date-time", "const": "2026-02-30T00:00:00Z"}
        source.write_text(json.dumps(document))
        projected = inv.source_inventory_projection({**inventory, "nodes": [copy.deepcopy(original)]}, scratch)
        checks["datetime_battery_format_enforced"] = projected["nodes"][0]["value_evidence"]["all_refused"]
        # An explicit role is pinned independently of regenerated inventory
        # evidence. Even refreshed source evidence cannot re-review that role.
        role_row = next(r for r in maps if r["pointer"].endswith("/result_schema_resources"))
        document = inv._source_document(root, role_row, {})
        inv.at(document, role_row["pointer"])["additionalProperties"]["maxLength"] = 99
        source.write_text(json.dumps(document))
        changed = inv.source_inventory_projection({**inventory, "nodes": [copy.deepcopy(role_row)]}, scratch)
        errors = inv.validate_inventory(changed, scratch)
        checks["datetime_battery_changed_role_requires_review"] = any(
            e["error"] == "wildcard_role_schema_changed" for e in errors)
        # A copied role record with a refreshed pin still cannot cite another
        # field as this value's authority.
        roles = json.loads((scratch / ROLES).read_text())
        record = next(r for r in roles if tuple(r["node"]) == inv.node_key(role_row))
        record["value_schema_sha256"] = changed["nodes"][0]["value_evidence"]["value_schema_sha256"]
        record["citation"]["pointer"] = original["pointer"]
        (scratch / ROLES).write_text(json.dumps(roles))
        errors = inv.validate_inventory(changed, scratch)
        checks["datetime_battery_foreign_role_evidence_refused"] = any(
            e["error"] == "wildcard_role_evidence_changed" for e in errors)
    return checks


def wildcard_context_checks(root, inventory):
    """B5/B6: coherent source projection cannot certify incomplete probes or keys."""
    import pm_event_datetime_inventory as inv
    from pm_event_datetime_value_probe import BATTERY, ROLES, wildcard_probe
    from pm_event_datetime import _closed_datetime_graph, format_checker
    from referencing import Registry, Resource
    checks = {}
    original = next(r for r in inventory["nodes"] if r["path"] ==
        "Plans/section15_browser_program_contracts.schema.json" and
        r["pointer"].endswith("/result_schema_dependencies"))
    stamp = {"type": "string", "pattern":
        r"^[0-9][0-9][0-9][0-9]-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]{1,9})?(?:Z)$"}
    with tempfile.TemporaryDirectory(prefix="pm-datetime-context-") as temp:
        scratch = Path(temp)
        for path in (inv.INVENTORY_SCHEMA, BATTERY, ROLES):
            file = scratch / path
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_bytes((root / path).read_bytes())
        source = scratch / original["path"]
        source.parent.mkdir(parents=True, exist_ok=True)

        def project(node, definitions=None):
            document = inv._source_document(root, original, {})
            inv.at(document, original["pointer"]).clear()
            inv.at(document, original["pointer"]).update(copy.deepcopy(node))
            document["$defs"].update(copy.deepcopy(definitions or {}))
            source.write_text(json.dumps(document))
            value = inv.source_inventory_projection({**inventory, "nodes": [copy.deepcopy(original)]}, scratch)
            return document, value

        basic = {"type": "object", "propertyNames": {"type": "string"}}
        required = {**basic, "required": ["kind"], "properties": {"kind": {"const": "timestamp"}},
                    "additionalProperties": stamp}
        conditional = {**basic, "properties": {"kind": {}}, "if": {"required": ["kind"]},
                       "then": {"properties": {"kind": {}}, "additionalProperties": stamp},
                       "else": {"additionalProperties": {"type": "integer"}}}
        for name, node in (("required_sibling_timestamp", required),
                           ("conditional_sibling_timestamp", conditional)):
            document, projected = project(node)
            row = projected["nodes"][0]
            errors = inv.validate_inventory(projected, scratch)
            checks["datetime_" + name] = (row["classification"] == "wildcard_review_required" and
                not row["value_evidence"]["singleton_probes_complete"] and
                any(e["error"] == "wildcard_role_review_required" for e in errors))
            bank = Registry().with_resource(document["$id"], Resource.from_contents(document))
            selector = {"$schema": document["$schema"], "$ref": document["$id"] + "#" + row["pointer"]}
            cls, bank = _closed_datetime_graph(selector, bank)
            validator = cls(selector, registry=bank, format_checker=format_checker())
            checks["datetime_" + name + "_witness"] = (
                not validator.is_valid({"observed_at_utc": "2026-01-01T00:00:00Z"}) and
                validator.is_valid({"kind": "timestamp", "observed_at_utc": "2026-01-01T00:00:00Z"}) and
                not validator.is_valid({"kind": "timestamp", "observed_at_utc": "resource-id"}))
            checks["datetime_" + name + "_context_probe"] = any(
                r.get("context") == {"kind": "timestamp"} and r["accepted"] > 0
                for r in row["value_evidence"]["results"])
            bad = copy.deepcopy(projected)
            bad["nodes"][0]["classification"] = "wildcard_non_timestamp"
            checks["datetime_" + name + "_pin"] = (
                inv.derived_inventory_pin(bad, scratch) != inv.hashlib.sha256(json.dumps(bad).encode()).hexdigest())
            pointer = original["pointer"] + ("/additionalProperties" if name.startswith("required_")
                                            else "/then/additionalProperties")
            record = {"node": list(inv.node_key(original)),
                "value_schema_sha256": row["value_evidence"]["value_schema_sha256"],
                "role": "timestamp", "classification": "other_owner_observation",
                "reason": "Explicit timestamp review of the exact sibling-selected value constraint.",
                "citation": {"path": original["path"], "pointer": pointer, "value": stamp},
                "sibling_contexts": [{"kind": "timestamp"}]}
            (scratch / ROLES).write_text(json.dumps([record]))
            reviewed = inv.source_inventory_projection({**inventory, "nodes": [copy.deepcopy(original)]}, scratch)
            checks["datetime_" + name + "_reviewed_positive"] = not inv.validate_inventory(reviewed, scratch)
            checks["datetime_" + name + "_reviewer_context"] = any(
                d["keyword"] == "reviewed_sibling_context"
                for d in reviewed["nodes"][0]["value_evidence"]["sibling_dependencies"])
            (scratch / ROLES).write_bytes((root / ROLES).read_bytes())
        # A schema that refuses every sample still requires review if a
        # sibling-sensitive keyword is present, including behind a reference.
        for keyword, extra in (("required", {"required": ["kind"]}),
                ("dependentRequired", {"dependentRequired": {"kind": ["other"]}}),
                ("dependentSchemas", {"dependentSchemas": {"kind": {}}}),
                ("minProperties", {"minProperties": 2}),
                ("unevaluatedProperties", {"unevaluatedProperties": False}),
                ("combinator", {"anyOf": [{"required": ["kind"]}, {"required": ["other"]}]}),
                ("reference", {"$ref": "#/$defs/context_map"})):
            _, projected = project({**basic, "additionalProperties": {"type": "integer"}, **extra},
                {"context_map": {"required": ["kind"]}})
            checks["datetime_incomplete_probe_" + keyword] = (
                projected["nodes"][0]["classification"] == "wildcard_review_required" and
                any(e["error"] == "wildcard_role_review_required" for e in inv.validate_inventory(projected, scratch)))
        # The exact same definition is valid evidence only when reached as a
        # value constraint, not as a key, sibling, nested value or unused $def.
        safe = {"type": "string", "minLength": 1}
        for route in ("key", "sibling", "nested", "unused", "one_field_only",
                      "value_ref", "value_allOf", "value_anyOf"):
            node = {**basic, "additionalProperties": copy.deepcopy(stamp)}
            ref = {"$ref": "#/$defs/SafeRef"}
            if route == "key":
                node["propertyNames"] = ref
            elif route == "sibling":
                node["properties"] = {"kind": ref}
            elif route == "nested":
                node["additionalProperties"]["properties"] = {"nested": ref}
            elif route == "one_field_only":
                node["patternProperties"] = {"^observed_at_utc$": ref}
            elif route == "value_ref":
                node["additionalProperties"] = ref
            elif route in ("value_allOf", "value_anyOf"):
                node["additionalProperties"] = {route.removeprefix("value_"): [ref]}
            document, projected = project(node, {"SafeRef": safe})
            evidence, _ = wildcard_probe(original, document, scratch, {})
            record = {"node": list(inv.node_key(original)), "value_schema_sha256": evidence["value_schema_sha256"],
                      "role": "SafeRef", "reason": "Reviewed reference string value.",
                      "citation": {"path": original["path"], "pointer": "/$defs/SafeRef", "value": safe}}
            (scratch / ROLES).write_text(json.dumps([record]))
            projected = inv.source_inventory_projection({**inventory, "nodes": [copy.deepcopy(original)]}, scratch)
            errors = inv.validate_inventory(projected, scratch)
            checks["datetime_value_role_path_" + route] = (not errors if route.startswith("value_") else
                any(e["error"] == "wildcard_role_evidence_changed" for e in errors))
            (scratch / ROLES).write_bytes((root / ROLES).read_bytes())
    return checks


def wildcard_authority_checks(root, inventory):
    """B7: role authority travels only through positive conjunctive paths.

    Every record has a freshly computed fingerprint, so each refusal comes from
    the path rule, not a stale pin. The controls keep legitimate routes passing.
    """
    import pm_event_datetime_inventory as inv
    from pm_event_datetime_value_probe import BATTERY, ROLES, wildcard_probe
    checks = {}
    review = "wildcard_role_review_required"
    original = next(r for r in inventory["nodes"] if r["path"] ==
        "Plans/section15_browser_program_contracts.schema.json" and
        r["pointer"].endswith("/result_schema_dependencies"))
    node_pointer = original["pointer"]
    value_pointer = node_pointer + "/additionalProperties"
    stamp = {"type": "string", "pattern":
        r"^[0-9][0-9][0-9][0-9]-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]{1,9})?(?:Z)$"}
    # SafeRef refuses every timestamp, as in the reviewed attack. Generic accepts
    # them, so a citation of it reaches the checks on timestamp-accepting values.
    safe = {"type": "string", "minLength": 1, "pattern": "^[a-z]+$", "description": "Named reference values."}
    generic = {"type": "string", "minLength": 1, "description": "Generic reference string."}
    anchored = {"$dynamicAnchor": "generic_anchor", **generic}
    definitions = {"SafeRef": safe, "Generic": generic, "Anchored": anchored}
    ref = {"$ref": "#/$defs/SafeRef"}
    good = {"$ref": "#/$defs/Generic"}
    basic = {"type": "object", "propertyNames": {"type": "string"}}
    safe_pointer, generic_pointer = "/$defs/SafeRef", "/$defs/Generic"
    draft7 = "http://json-schema.org/draft-07/schema#"

    with tempfile.TemporaryDirectory(prefix="pm-datetime-authority-") as temp:
        scratch = Path(temp)
        for path in (inv.INVENTORY_SCHEMA, BATTERY, ROLES):
            file = scratch / path
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_bytes((root / path).read_bytes())
        source = scratch / original["path"]
        source.parent.mkdir(parents=True, exist_ok=True)
        subset = {**inventory, "nodes": [copy.deepcopy(original)]}

        def run(node, cited, classification=None):
            document = inv._source_document(root, original, {})
            inv.at(document, node_pointer).clear()
            inv.at(document, node_pointer).update(copy.deepcopy(node))
            document["$defs"].update(copy.deepcopy(definitions))
            source.write_text(json.dumps(document))
            (scratch / ROLES).write_text("[]")
            # Parse the written bytes: pointers need unshared objects, as in any source.
            document = json.loads(source.read_text())
            evidence, _ = wildcard_probe(original, document, scratch, {})
            if cited is not None:
                record = {"node": list(inv.node_key(original)),
                          "value_schema_sha256": evidence["value_schema_sha256"],
                          "role": "scratch_role", "reason": "Scratch role review.",
                          "citation": {"path": original["path"], "pointer": cited,
                                       "value": inv.at(document, cited)}}
                if classification:
                    record["classification"] = classification
                (scratch / ROLES).write_text(json.dumps([record]))
            projected = inv.source_inventory_projection(subset, scratch)
            errors = {e["error"] for e in inv.validate_inventory(projected, scratch)}
            return projected["nodes"][0], errors

        refused = {
            # The two reviewed B7 variants.
            "irrelevant_if": ({**basic, "additionalProperties": {
                "allOf": [stamp, {"if": ref, "then": {}, "else": {}}]}}, safe_pointer),
            "vacuous_not": ({**basic, "additionalProperties": {
                "allOf": [stamp, {"not": {"allOf": [ref, False]}}]}}, safe_pointer),
            # Each non-positive keyword as the only route to the citation.
            "then": ({**basic, "additionalProperties": {"if": {"type": "string"}, "then": ref, "else": {}}}, safe_pointer),
            "else": ({**basic, "additionalProperties": {"if": {"type": "integer"}, "then": {}, "else": ref}}, safe_pointer),
            "not": ({**basic, "additionalProperties": {"not": ref}}, safe_pointer),
            "dependentSchemas": ({**basic, "additionalProperties": {"dependentSchemas": {"x": ref}}}, safe_pointer),
            "contains": ({**basic, "additionalProperties": {"contains": ref}}, safe_pointer),
            "prefixItems": ({**basic, "additionalProperties": {"prefixItems": [ref]}}, safe_pointer),
            "items": ({**basic, "additionalProperties": {"items": ref}}, safe_pointer),
            "propertyNames": ({**basic, "additionalProperties": {"propertyNames": ref}}, safe_pointer),
            "patternProperties": ({**basic, "additionalProperties": {"patternProperties": {"^x$": ref}}}, safe_pointer),
            "nested_additionalProperties": ({**basic, "additionalProperties": {"additionalProperties": ref}}, safe_pointer),
            "unevaluatedProperties": ({**basic, "additionalProperties": {"unevaluatedProperties": ref}}, safe_pointer),
            "unevaluatedItems": ({**basic, "additionalProperties": {"unevaluatedItems": ref}}, safe_pointer),
            "unknown_keyword": ({**basic, "additionalProperties": {"x-role": ref}}, safe_pointer),
            # The same keywords at object scope.
            "map_if": ({**basic, "if": {"additionalProperties": ref}, "then": {}, "else": {}}, safe_pointer),
            "map_then": ({**basic, "if": {"required": ["x"]}, "then": {"additionalProperties": ref}}, safe_pointer),
            "map_dependentSchemas": ({**basic, "dependentSchemas": {"x": {"additionalProperties": ref}}}, safe_pointer),
            "map_dependentRequired": ({**basic, "dependentRequired": {"x": ["y"]},
                                       "additionalProperties": good}, generic_pointer),
            "map_unevaluatedProperties": ({**basic, "unevaluatedProperties": good}, generic_pointer),
            # Unions count only when every branch carries the same citation.
            "partial_anyOf": ({**basic, "additionalProperties": {"anyOf": [good, {"type": "integer"}]}}, generic_pointer),
            "partial_oneOf": ({**basic, "additionalProperties": {"oneOf": [good, {"type": "integer"}]}}, generic_pointer),
            "map_partial_anyOf": ({**basic, "anyOf": [{"additionalProperties": good}, {"additionalProperties": stamp}]},
                                  generic_pointer),
            # A positive path does not excuse an unaccounted timestamp narrowing.
            "conjunct_timestamp": ({**basic, "additionalProperties": {"allOf": [stamp, good]}}, generic_pointer),
            "ref_sibling_timestamp": ({**basic, "additionalProperties": {**good, **stamp}}, generic_pointer),
            "conjunct_condition": ({**basic, "additionalProperties": {"allOf": [
                good, {"if": {"minLength": 99}, "then": {}, "else": {}}]}}, generic_pointer),
            "conjunct_unknown": ({**basic, "additionalProperties": {"allOf": [good, {"x-note": 1}]}}, generic_pointer),
            "map_condition_with_value": ({**basic, "additionalProperties": good, "if": {"required": ["x"]},
                                          "then": {"additionalProperties": stamp}}, generic_pointer),
            # The whole value cited directly still cannot be timestamp-only.
            "direct_timestamp": ({**basic, "additionalProperties": stamp}, value_pointer),
            "whole_union_timestamp_branch": ({**basic, "additionalProperties": {"anyOf": [stamp, {"const": ""}]}}, value_pointer),
            "whole_value_condition": ({**basic, "additionalProperties": {
                "if": {"minLength": 20}, "then": stamp, "else": {}}}, value_pointer),
            "implicit_with_conjunct_value": ({**basic, "allOf": [{"additionalProperties": stamp}]}, node_pointer),
            # A dialect's unimplemented or ignored keywords are not paths.
            "draft7_ref_sibling": ({**basic, "additionalProperties": {
                "$schema": draft7, "$id": "urn:pm:authority:draft7", "definitions": {
                    "g": generic, "s": stamp,
                    "shape": {"$ref": "#/definitions/s", "allOf": [{"$ref": "#/definitions/g"}]}},
                "allOf": [{"$ref": "#/definitions/shape"}]}},
                value_pointer + "/definitions/g"),
            "draft7_dynamicRef": ({**basic, "additionalProperties": {
                "$schema": draft7, "$id": "urn:pm:authority:draft7dyn", "definitions": {"g": {**generic, "$id": "#g"}},
                "$dynamicRef": "#g"}}, value_pointer + "/definitions/g"),
            "recursiveRef": ({**basic, "additionalProperties": {"$recursiveRef": "#/$defs/Generic", "type": "string"}}, value_pointer),
        }
        for name, (node, cited) in refused.items():
            row, errors = run(node, cited)
            checks["datetime_role_authority_refuses_" + name] = (
                review in errors and row["classification"] == "wildcard_review_required" and
                row["value_evidence"]["reviewed_role"] is None and
                "wildcard_role_schema_changed" not in errors and
                "wildcard_value_evidence_changed" not in errors)
        accepted = {
            "direct": ({**basic, "additionalProperties": copy.deepcopy(generic)}, value_pointer),
            "ref": ({**basic, "additionalProperties": good}, generic_pointer),
            "dynamicRef": ({**basic, "additionalProperties": {"$dynamicRef": "#generic_anchor"}}, "/$defs/Anchored"),
            "allOf": ({**basic, "additionalProperties": {"allOf": [good, {"maxLength": 99}]}}, generic_pointer),
            "ref_sibling_bound": ({**basic, "additionalProperties": {**good, "maxLength": 99}}, generic_pointer),
            "anyOf_every_branch": ({**basic, "additionalProperties": {"anyOf": [
                good, {"allOf": [good, {"maxLength": 9}]}]}}, generic_pointer),
            "oneOf_every_branch": ({**basic, "additionalProperties": {"oneOf": [
                {"allOf": [good, {"maxLength": 5}]}, {"allOf": [good, {"minLength": 6}]}]}}, generic_pointer),
            "whole_union": ({**basic, "additionalProperties": {"oneOf": [good, {"type": "integer"}]}}, value_pointer),
            "map_allOf": ({**basic, "allOf": [{"additionalProperties": good}]}, generic_pointer),
            "map_anyOf_every_branch": ({**basic, "anyOf": [{"additionalProperties": good},
                                                           {"additionalProperties": good}]}, generic_pointer),
            "implicit_true": ({**basic}, node_pointer),
        }
        for name, (node, cited) in accepted.items():
            row, errors = run(node, cited)
            checks["datetime_role_authority_accepts_" + name] = (
                not errors and row["classification"] == "wildcard_non_timestamp_role")
        # Member keywords inside a cited definition are not routes, and they do
        # not decide a string value's acceptance. This is the setting_value shape.
        row, errors = run({**basic, "additionalProperties": {"oneOf": [
            {"type": "string"}, {"type": "array", "items": {"$ref": "#/$defs/Generic"}}]}}, value_pointer)
        checks["datetime_role_authority_member_keywords_in_cited_definition"] = not errors
        # A value refusing every timestamp has no trigger, so a cited definition
        # may contain conditions. The citation itself must still be positive.
        permission = {"type": "object", "allOf": [{"if": {"required": ["a"]}, "then": {"required": ["b"]}}]}
        row, errors = run({**basic, "minProperties": 1, "additionalProperties": permission}, value_pointer)
        checks["datetime_role_authority_refused_value_keeps_review"] = not errors
        # The correct classification stays available for the B7 value language:
        # with no false record, the row is simply a timestamp row.
        node, _ = refused["irrelevant_if"]
        row, errors = run(node, None)
        checks["datetime_role_authority_b7_corrected_without_record"] = (
            not errors and row["classification"] == "other_owner_observation")
        row, errors = run(node, value_pointer + "/allOf/0", "other_owner_observation")
        checks["datetime_role_authority_b7_timestamp_review"] = (
            not errors and row["classification"] == "other_owner_observation")
        # No automatic non-timestamp credit outside the allowlist. A refused,
        # keyword-clean value keeps it, and an accepting value stays a timestamp row.
        for name, value in (("not", {"type": "integer", "not": {"const": 1}}),
                            ("if", {"type": "integer", "if": {"minimum": 1}, "then": {}}),
                            ("object_members", {"type": "object", "properties": {"a": {}}}),
                            ("array_items", {"type": "array", "items": {}}),
                            ("unknown", {"type": "integer", "x-note": 1}),
                            ("recursiveRef", {"type": "integer", "$recursiveRef": "#/$defs/Generic"})):
            row, errors = run({**basic, "additionalProperties": value}, None)
            checks["datetime_automatic_credit_withheld_" + name] = (
                review in errors and row["classification"] == "wildcard_review_required" and
                not row["value_evidence"]["automatic_credit"])
        for name, value in (("clean_string", {"type": "string", "pattern": "^x$"}),
                            ("clean_enum", {"enum": ["a", "b"]}),
                            ("clean_ref_union", {"anyOf": [{"$ref": "#/$defs/SafeRef"}, {"type": "null"}]})):
            row, errors = run({**basic, "additionalProperties": value}, None)
            checks["datetime_automatic_credit_kept_" + name] = (
                not errors and row["classification"] == "wildcard_non_timestamp")
        # Discovery stays broad while authority is narrow.
        row, _ = run(refused["irrelevant_if"][0], None)
        evidence = row["value_evidence"]
        checks["datetime_role_authority_discovery_separate"] = (
            any(p["path"][-1]["pointer"] == safe_pointer for p in evidence["value_constraint_paths"]) and
            all({"path": original["path"], "pointer": safe_pointer} not in a["endpoints"]
                for a in evidence["role_authority"]) and
            all(any(u["keyword"] == "if" for u in a["unproven"]) for a in evidence["role_authority"]))
    return checks
