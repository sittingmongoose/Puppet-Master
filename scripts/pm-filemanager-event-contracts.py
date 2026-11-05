#!/usr/bin/env python3
"""Static FileManager event contract oracles. No filesystem/native execution proof."""
import copy
import base64
import hashlib
import importlib.util
import json
import re
from pathlib import Path
import sys
import jsonschema
from blake3 import blake3
from referencing import Registry, Resource
from referencing.exceptions import Unresolvable
from referencing.jsonschema import DRAFT202012

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_BASE = "https://puppetmaster.local/schemas/"


def validate_schema_graph(documents):
    """Resolve every reference, including unused definitions and absent optional fields."""
    registry = Registry()
    for path, schema in documents.items():
        jsonschema.Draft202012Validator.check_schema(schema)
        resource = Resource.from_contents(schema, default_specification=DRAFT202012)
        registry = registry.with_resource(SCHEMA_BASE + path, resource)
        if "$id" in schema:
            registry = registry.with_resource(schema["$id"], resource)
    registry = registry.crawl()

    def visit(resource, resolver, location):
        node = resource.contents
        resolver = resolver.in_subresource(resource)
        if isinstance(node, dict):
            if "$ref" in node:
                try:
                    resolver.lookup(node["$ref"])
                except Unresolvable as error:
                    raise ValueError("unresolved schema reference at " + location + ": " + node["$ref"]) from error
            # Follow schema positions defined by the dialect, including all $defs and
            # optional properties. A properties map may itself name "$schema" or
            # "$ref"; that map is not a schema and must not be treated as a resource.
            children = {id(child.contents): child for child in resource.subresources()}

            def descend(value, pointer):
                if id(value) in children:
                    visit(children[id(value)], resolver, location + pointer)
                elif isinstance(value, dict):
                    for key, child in value.items():
                        descend(child, pointer + "/" + key.replace("~", "~0").replace("/", "~1"))
                elif isinstance(value, list):
                    for index, child in enumerate(value):
                        descend(child, pointer + "/" + str(index))

            for key, child in node.items():
                descend(child, "/" + key.replace("~", "~0").replace("/", "~1"))

    for path, schema in documents.items():
        visit(Resource.from_contents(schema, default_specification=DRAFT202012),
              registry.resolver(SCHEMA_BASE + path), path + "#")
    return registry


def schema_registry():
    return validate_schema_graph(schema_documents())


def schema_documents():
    paths = ["filemanager_operation_contracts.schema.json", "event_record.schema.json",
             "event_append_receipt_contracts.schema.json", "storage_value_registry.schema.json"]
    paths += [str(p.relative_to(ROOT / "Plans")) for p in
              sorted((ROOT / "Plans/event_payloads/file_manager").glob("*.schema.json"))]
    return {path: json.loads((ROOT / "Plans" / path).read_text()) for path in paths}


SCHEMAS = schema_registry()


def validate_shape(path, definition, value):
    fragment = definition if definition.startswith("#") else ("#/$defs/" + definition if definition else "")
    uri = SCHEMA_BASE + path + fragment
    jsonschema.Draft202012Validator({"$ref": uri}, registry=SCHEMAS,
                                   format_checker=jsonschema.FormatChecker()).validate(value)


def same_value(left, right):
    """Preserve complete-value types; Python equality conflates bool/int/float."""
    if type(left) is not type(right):
        return False
    if isinstance(left, dict):
        return left.keys() == right.keys() and all(same_value(left[k], right[k]) for k in left)
    if isinstance(left, list):
        return len(left) == len(right) and all(same_value(a, b) for a, b in zip(left, right))
    if isinstance(left, float):
        return left.hex() == right.hex()
    return left == right


def validate_project_scope(project_id, expected_project_id, label):
    if project_id != expected_project_id:
        raise ValueError(label)


def validate_original_payload(payload, original_payload, label):
    if not same_value(payload, original_payload):
        raise ValueError(label)


# Reuse the repository's canonical MessagePack encoder for this suite's closed integer-only
# fixture domain. Native arbitrary EventRecord encoding remains SP-026/SP-236's obligation.
_codec_spec = importlib.util.spec_from_file_location("pm_readiness_codec", ROOT / "scripts/pm-implementation-readiness.py")
_codec = importlib.util.module_from_spec(_codec_spec)
sys.modules[_codec_spec.name] = _codec
_codec_spec.loader.exec_module(_codec)
canonical_msgpack = _codec.canonical_messagepack_bytes
INLINE_LIMIT = 16384
SEMANTIC_FIELDS = (
    "event_type", "scope_kind", "project_id", "thread_id", "run_id", "node_id", "attempt_id",
    "actor_ref", "requested_account_ref", "effective_account_ref", "occurred_at_utc",
    "producer_sequence_id", "correlation_id", "causation_event_id", "parent_event_id",
    "idempotency_key", "payload_schema_id", "payload", "payload_ref", "redaction_profile", "migration")


def payload_reference(value):
    body = canonical_msgpack(value)
    return f"pm-payload-ref:v1:blake3:{blake3(body).hexdigest()}:{len(body)}:application/vnd.msgpack"


def validate_payload_reference(reference):
    if not isinstance(reference, str) or not re.fullmatch(
            r"pm-payload-ref:v1:blake3:[0-9a-f]{64}:[1-9][0-9]*:application/vnd.msgpack", reference):
        raise ValueError("invalid SP-337 reference")


def resolve_payload(reference, payload_rows):
    validate_payload_reference(reference)
    value = payload_rows[reference]
    if reference != payload_reference(value):
        raise ValueError("SP-337 bytes/hash/size mismatch")
    return value


def resolve_value(definition, physical, payload_rows):
    if len(canonical_msgpack(physical)) > INLINE_LIMIT:
        raise ValueError("redb value exceeds 16 KiB")
    if "value_ref" in physical:
        validate_shape("filemanager_operation_contracts.schema.json", definition + "_reference", physical)
        value = resolve_payload(physical["value_ref"], payload_rows)
        if len(canonical_msgpack(value)) <= INLINE_LIMIT:
            raise ValueError("noncanonical small value reference")
    else:
        value = physical
    validate_shape("filemanager_operation_contracts.schema.json", definition, value)
    return value


def event_body(event, payload_rows):
    if type(event["payload"]) is not dict:
        raise ValueError("event inline body exceeds 16 KiB")
    if type(event["payload"]) is dict and len(canonical_msgpack(event["payload"])) > INLINE_LIMIT:
        raise ValueError("event inline body exceeds 16 KiB")
    if event["payload_ref"] is None:
        return event["payload"]
    if event["payload"] != {}:
        raise ValueError("referenced event retains inline body")
    value = resolve_payload(event["payload_ref"], payload_rows)
    if len(canonical_msgpack(value)) <= INLINE_LIMIT:
        raise ValueError("noncanonical small event reference")
    return value


def semantic_body(event):
    return {k: event[k] for k in SEMANTIC_FIELDS}


def validate_writer(event):
    if event["replay_policy"] == "projector_replay_only":
        raise ValueError("replay_only_not_appendable")
    elif event["replay_policy"] != "dedupe_by_idempotency_key":
        raise ValueError("filemanager writer replay policy")


def validate_profile(registry, family):
    profile = registry["storage_profile"]["family_profiles"][family]
    if (profile["redb_file"] != "canonical" or profile["storage_group"] != "coordination_and_storage" or
            not same_value(profile["max_value_bytes"], INLINE_LIMIT) or profile["encoding_target"] != "messagepack_canonical"):
        raise ValueError("wrong SP-340 profile")
    group = next(g for g in registry["storage_profile"]["groups"] if g["group_id"] == profile["storage_group"])
    if not same_value(group["canonical_budget_bytes"], 2147483648):
        raise ValueError("wrong existing advisory canonical budget")
    entry = next(f for f in registry["families"] if f["family_id"] == family)
    if entry["value_schema"]["properties"]["schema_id"].get("const") != entry["value_schema_id"]:
        raise ValueError("wrong stored schema header")


def stored_value(definition, value, payload_rows):
    """Construct fixture storage; validation never repairs or constructs missing custody."""
    if len(canonical_msgpack(value)) <= INLINE_LIMIT:
        return copy.deepcopy(value)
    reference = payload_reference(value)
    payload_rows[reference] = copy.deepcopy(value)
    return {"schema_id": value["schema_id"],
            "schema_version": "1.0.0", "value_ref": reference}


def synchronize_fixture(name, payload, trace, external_body=True, external_operation=True):
    """Keep all witnesses coherent before changing one tested invariant."""
    m = trace["custody_model"]
    op = m["operation_rows"][m["operation_key"]]
    op["settlement"]["payload"] = copy.deepcopy(payload)
    event = op["complete_event"]
    m["payload_rows"] = {}
    event["payload"] = copy.deepcopy(payload)
    event["payload_ref"] = None
    if external_body and len(canonical_msgpack(payload)) > INLINE_LIMIT:
        event["payload"] = {}
        event["payload_ref"] = payload_reference(payload)
        m["payload_rows"][event["payload_ref"]] = copy.deepcopy(payload)
    trace["original_payload"] = copy.deepcopy(payload)
    trace["retry_identity"] = list(identity(name, payload, trace))
    event["event_id"], event["idempotency_key"] = trace["retry_identity"]
    stored = m["append_rows"][m["append_key"]]
    stored["event_id"], stored["idempotency_key"] = trace["retry_identity"]
    stored["first_append_receipt"]["event_id"] = event["event_id"]
    op["first_append_receipt"] = copy.deepcopy(stored["first_append_receipt"])
    stored["original_event_value_commitment"] = full_value_commitment(event)
    stored["producer_semantic_digest"] = hashlib.sha256(json.dumps(
        semantic_body(event), sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()
    m["request"] = {"event": copy.deepcopy(event)}
    m["retry_event"] = copy.deepcopy(event)
    m["result"] = {k: copy.deepcopy(stored[k]) for k in
                   ("first_append_receipt", "original_segment_ref", "original_event_value_commitment")}
    old_key = m["append_key"]
    m["append_key"] = ("event_append_receipt_custody.v1:" + stored["storage_instance_id"] + ":" +
                       hashlib.sha256(event["event_id"].encode()).hexdigest())
    if old_key != m["append_key"]:
        del m["append_rows"][old_key]
        m["append_rows"][m["append_key"]] = stored
    m["checkpoint_binding"]["event_id"] = event["event_id"]
    control = m["control_rows"][m["control_key"]]
    m["final_operation"], m["final_control"], m["final_append"] = map(copy.deepcopy, (op, control, stored))
    m["operation_rows"][m["operation_key"]] = (
        stored_value("operation_custody", op, m["payload_rows"]) if external_operation else op)
    m["final_operation_value"] = copy.deepcopy(m["operation_rows"][m["operation_key"]])
    m["final_control_value"] = copy.deepcopy(control)
    m["final_payload_rows"] = copy.deepcopy(m["payload_rows"])
    m["backup_binding"] = copy.deepcopy({
        "operation": m["final_operation_value"], "control": control, "append": stored,
        "storage_instance_id": op["storage_instance_id"], "payload_rows": m["payload_rows"]})


def fixture_copies(trace):
    """Construct observational copies; never called by a contract validator."""
    model = trace["custody_model"]
    operation = model["operation_rows"][model["operation_key"]]
    control = model["control_rows"][model["control_key"]]
    append = model["append_rows"][model["append_key"]]
    logical = lambda value: model["payload_rows"][value["value_ref"]] if "value_ref" in value else value
    model["final_operation"], model["final_control"], model["final_append"] = map(
        copy.deepcopy, (logical(operation), logical(control), append))
    model["final_operation_value"], model["final_control_value"] = map(copy.deepcopy, (operation, control))
    model["final_payload_rows"] = copy.deepcopy(model["payload_rows"])
    model["backup_binding"] = copy.deepcopy(dict(operation=operation, control=control, append=append,
        storage_instance_id=logical(operation)["storage_instance_id"], payload_rows=model["payload_rows"]))


def fixture_event(trace, event):
    """Recompute fixture commitments/copies after a non-digest event mutation."""
    model = trace["custody_model"]
    stored = model["append_rows"].pop(model["append_key"])
    stored["event_id"], stored["idempotency_key"] = event["event_id"], event["idempotency_key"]
    stored["first_append_receipt"]["event_id"] = event["event_id"]
    stored["original_event_value_commitment"] = full_value_commitment(event)
    stored["producer_semantic_digest"] = hashlib.sha256(json.dumps(
        semantic_body(event), sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()
    model["append_key"] = ("event_append_receipt_custody.v1:" + stored["storage_instance_id"] + ":" +
                           hashlib.sha256(event["event_id"].encode()).hexdigest())
    model["append_rows"][model["append_key"]] = stored
    model["request"] = {"event": copy.deepcopy(event)}
    model["retry_event"] = copy.deepcopy(event)
    model["result"] = {k: copy.deepcopy(stored[k]) for k in
                       ("first_append_receipt", "original_segment_ref", "original_event_value_commitment")}
    model["checkpoint_binding"]["event_id"] = event["event_id"]


def terminal_fixture_proof(trace, before):
    """A terminal CAS reads the actual pre-CAS original, not its uncommitted candidate."""
    proof = copy.deepcopy(trace)
    m = proof["custody_model"]
    physical = stored_value("operation_custody", before, m["payload_rows"])
    m["operation_rows"][m["operation_key"]] = physical
    m["final_operation"] = copy.deepcopy(before)
    m["final_operation_value"] = copy.deepcopy(physical)
    control = m["control_rows"][m["control_key"]]
    control.update(state="active", writer_cutoff_sequence=None, drain_operation_keys=[])
    m["final_control"] = copy.deepcopy(control)
    m["final_control_value"] = copy.deepcopy(control)
    m["final_payload_rows"] = copy.deepcopy(m["payload_rows"])
    m["backup_binding"].update(operation=copy.deepcopy(physical), control=copy.deepcopy(control),
                               payload_rows=copy.deepcopy(m["payload_rows"]))
    return proof


def payload_at_size(payload, target):
    payload["evidence_refs"] = ["pmref:evidence:e" + str(i).zfill(2) for i in range(64)]
    for i in range(64):
        missing = target - len(canonical_msgpack(payload))
        if missing <= 0:
            break
        old = payload["evidence_refs"][i]
        low, high = 0, 320 - len(old)
        while low < high:
            extra = (low + high + 1) // 2
            payload["evidence_refs"][i] = old + "a" * extra
            if len(canonical_msgpack(payload)) <= target:
                low = extra
            else:
                high = extra - 1
        payload["evidence_refs"][i] = old + "a" * low
    if len(canonical_msgpack(payload)) != target:
        raise AssertionError("unrepresentable payload fixture boundary")


def boundary_case(row, case):
    """Run named per-family counterexamples through the same complete validator."""
    name, scenario = row["event_type"], case["scenario"]
    p, t = copy.deepcopy(row["payload"]), copy.deepcopy(row["trace"])
    m = t["custody_model"]
    if scenario == "schema-rule":
        # A schema-only proof deliberately avoids unrelated custody joins. Its
        # accepting control and single JSON edit are authored in the fixture.
        value = (json.loads((ROOT / case["control_file"]).read_text()) if "control_file" in case
                 else copy.deepcopy(case.get("control", row)))
        for key in case.get("control_path", []):
            value = value[key]
        validate_shape(case["document"], case["definition"], value)
        mutation = case["mutation"]
        if not mutation["path"]:
            value = copy.deepcopy(mutation["value"])
        else:
            target = value
            for key in mutation["path"][:-1]:
                target = target[key]
            if mutation.get("delete"):
                del target[mutation["path"][-1]]
            else:
                target[mutation["path"][-1]] = copy.deepcopy(mutation["value"])
        return validate_shape(case["document"], case["definition"], value)
    if scenario == "api":
        validators = {fn.__name__: fn for fn in (
            validate_payload_reference, resolve_payload, resolve_value, event_body,
            validate_writer, validate_profile, validate_operation_transition,
            validate_control_transition, validate_original_models, validate_case,
            validate_snapshot_subjects, validate_complete_event, identity,
            validate_transition_storage)}
        validator = validators[case["validator"]]
        # A boundary probe carries its accepting control and changes one invariant.
        validator(*copy.deepcopy(case["valid_args"]), **copy.deepcopy(case.get("valid_kwargs", {})))
        return validator(*copy.deepcopy(case["args"]), **copy.deepcopy(case.get("kwargs", {})))
    if scenario == "original-location":
        # Retain the complete original EventRecord, commitments and custody. Only
        # the represented destination location changes, in both captured copies.
        validate_case(name, p, t, historical=case.get("historical", False))
        operation = m["operation_rows"][m["operation_key"]]
        for entries in (operation["accepted_path_snapshots"], operation["settlement"]["path_snapshots"]):
            source = next(x for x in entries if x["path_ref"] == p["source_path_ref"])
            destination = next(x for x in entries if x["path_ref"] == p["destination_path_ref"])
            for field in ("computer_id", "root_identity_ref", "relative_components"):
                if field != case.get("distinct_coordinate"):
                    destination[field] = copy.deepcopy(source[field])
                elif field == "computer_id":
                    destination[field] = "othercomputer"
                elif field == "root_identity_ref":
                    destination[field] = "pmref:root:other"
        fixture_copies(t)
        # Today's live placement is not an operand of original-location checks.
        t["current_live_state"] = {"exists": False, "root_identity_ref": "pmref:root:relocated"}
        return validate_case(name, p, t, historical=case.get("historical", False))
    if scenario == "coverage":
        operation = m["operation_rows"][m["operation_key"]]
        # Add a non-subject affected path to the accepting control so required
        # coverage can fail independently of every source/result/container join.
        extra = copy.deepcopy(operation["accepted_path_snapshots"][0])
        extra["path_ref"] = "pm-path-ref:v1:project:coverage1"
        extra["relative_components"] = ["coverage", "original"]
        p["affected_path_refs"].append(extra["path_ref"])
        operation["accepted_path_snapshots"].append(copy.deepcopy(extra))
        operation["settlement"]["path_snapshots"].append(copy.deepcopy(extra))
        synchronize_fixture(name, p, t)
        validate_case(name, p, t)
        operation = m["operation_rows"][m["operation_key"]]
        entries = operation["settlement"]["path_snapshots"]
        if case["mode"] == "cardinality":
            entries.append(copy.deepcopy(entries[0]))
        else:
            entries[-1] = copy.deepcopy(entries[0])
        fixture_copies(t)
        return validate_case(name, p, t)
    if scenario == "schema-reference":
        documents = schema_documents()
        path = "event_payloads/file_manager/" + name.replace(".", "_") + ".schema.json"
        schema = documents[path]
        target = schema.setdefault(case["container"], {})
        target["unexercised_probe"] = {"$ref": case["reference"]}
        return validate_schema_graph({path: schema})
    if scenario.startswith("profile-"):
        registry = json.loads((ROOT / "Plans/storage_value_registry.json").read_text())
        profiles = registry["storage_profile"]["family_profiles"]
        if scenario == "profile-budget":
            profile = profiles[case["family"]]
            next(g for g in registry["storage_profile"]["groups"]
                 if g["group_id"] == profile["storage_group"])["canonical_budget_bytes"] = case.get("value", 1)
        elif scenario == "profile-schema-header":
            entry = next(f for f in registry["families"] if f["family_id"] == case["family"])
            entry["value_schema"]["properties"]["schema_id"] = {"enum": [entry["value_schema_id"]]}
        elif scenario == "profile-missing":
            del profiles[case["family"]]
        else:
            profiles[case["family"]][case["field"]] = case["value"]
            if case["field"] == "storage_group":
                # The profile assignment is wrong; the selected group's budget is
                # deliberately coherent so it is not a second refusal boundary.
                group = next(g for g in registry["storage_profile"]["groups"] if g["group_id"] == case["value"])
                group["canonical_budget_bytes"] = 2147483648
        return validate_profile(registry, case["family"])
    if scenario.startswith("terminal-"):
        original = next(c for c in row["transition_cases"] if c["name"] == "effect-to-history")
        before, after = copy.deepcopy(original["args"])
        proof = terminal_fixture_proof(row["trace"], before)
        if scenario == "terminal-unrelated-event":
            after["complete_event"]["event_type"] = "unrelated.completed"
        elif scenario == "terminal-changed-payload":
            after["complete_event"]["payload"]["evidence_refs"] = ["pmref:evidence:unrelated"]
        elif scenario == "terminal-changed-receipt":
            after["first_append_receipt"]["sequence_id"] += 1
        elif scenario == "terminal-missing-proof":
            proof = None
        elif scenario == "terminal-semantic-proof":
            proof["custody_model"]["resolver"] = "storage.first_append_receipt.resolve.v2"
        elif scenario == "terminal-wrong-witness":
            model = proof["custody_model"]
            model["append_rows"][model["append_key"]]["original_event_value_commitment"]["sha256"] = "0" * 64
        elif scenario == "terminal-replay-only":
            after["complete_event"]["replay_policy"] = "projector_replay_only"
        elif scenario == "terminal-substituted-original":
            model = proof["custody_model"]
            model["operation_rows"][model["operation_key"]]["revision"] += 1
        elif scenario == "terminal-already-published-original":
            model = proof["custody_model"]
            model["operation_rows"][model["operation_key"]]["revision"] += 1
        else:
            raise AssertionError("unknown terminal case")
        if proof is not None:
            if scenario != "terminal-wrong-witness":
                fixture_event(proof, after["complete_event"])
            fixture_copies(proof)
        return validate_operation_transition(before, after, proof)
    if scenario.startswith("physical-"):
        definition = case["definition"]
        if definition == "operation_custody":
            value = copy.deepcopy(next(c for c in row["transition_cases"]
                                       if c["name"] == "accept-to-effect")["args"][0])
            component = value["accepted_path_snapshots"][0]["relative_components"]
            component.append("p" * 1000)
            for _ in range(5):
                component[-1] += "p" * max(0, case["bytes"] - len(canonical_msgpack(value)))
                if len(canonical_msgpack(value)) > case["bytes"]:
                    component[-1] = component[-1][:case["bytes"] - len(canonical_msgpack(value))]
        else:
            value = copy.deepcopy(m["control_rows"][m["control_key"]])
            value.update(state="draining", writer_cutoff_sequence=None)
            value["drain_operation_keys"] = ["filemanager_operation_custody.v1:" +
                hashlib.sha256(str(i).encode()).hexdigest() for i in range(150)]
            value["admission_revision"] = "r" * 1000
            for _ in range(5):
                delta = case["bytes"] - len(canonical_msgpack(value))
                value["admission_revision"] = (value["admission_revision"] + "r" * max(0, delta))[:
                    len(value["admission_revision"]) + delta]
        if len(canonical_msgpack(value)) != case["bytes"]:
            raise AssertionError("physical size fixture missed boundary")
        packs = {}
        physical = stored_value(definition, value, packs) if case.get("reference") else value
        return resolve_value(definition, physical, packs)
    if scenario.startswith("control-"):
        before = copy.deepcopy(m["control_rows"][m["control_key"]])
        before.update(state="active", writer_cutoff_sequence=None)
        after = copy.deepcopy(before)
        after.update(state="draining", control_revision=before["control_revision"] + 1,
                     drain_operation_keys=["filemanager_operation_custody.v1:" +
                         hashlib.sha256(str(i).encode()).hexdigest() for i in range(200)])
        storage = None
        if scenario != "control-oversized-inline":
            packs = {}
            storage = {"before": before, "after": stored_value("family_control", after, packs),
                       "payload_rows": packs}
            if scenario == "control-changed-referent":
                ref = storage["after"]["value_ref"]
                parts = ref.split(":")
                parts[3] = ("0" if parts[3][0] != "0" else "1") + parts[3][1:]
                bad = ":".join(parts)
                packs[bad] = packs.pop(ref)
                storage["after"]["value_ref"] = bad
        validate_control_transition(before, after, before["last_admitted_sequence"],
                                    after["drain_operation_keys"], storage)
        if scenario == "control-large-reference-reader":
            m["control_rows"][m["control_key"]] = storage["after"]
            m["payload_rows"] = storage["payload_rows"]
            m["final_control"] = copy.deepcopy(after)
            m["final_control_value"] = copy.deepcopy(storage["after"])
            m["final_payload_rows"] = copy.deepcopy(m["payload_rows"])
            m["backup_binding"]["control"] = copy.deepcopy(storage["after"])
            m["backup_binding"]["payload_rows"] = copy.deepcopy(m["payload_rows"])
            return validate_case(name, p, t)
        return
    if scenario.startswith("body-") or scenario.startswith("operation-") or scenario.startswith("pack-"):
        payload_at_size(p, case.get("bytes", INLINE_LIMIT + 1))
        synchronize_fixture(name, p, t, external_body=scenario != "body-oversized-inline",
                            external_operation=scenario != "operation-oversized-inline")
        m = t["custody_model"]
        if scenario == "pack-missing":
            reference = m["operation_rows"][m["operation_key"]]["value_ref"]
            del m["payload_rows"][reference]
            # Exactly one missing referent, consistently observed at final read
            # and backup. Other required body/value referents stay available.
            m["final_payload_rows"] = copy.deepcopy(m["payload_rows"])
            m["backup_binding"]["payload_rows"] = copy.deepcopy(m["payload_rows"])
        elif scenario in {"pack-changed", "pack-wrong-size"}:
            physical = m["operation_rows"][m["operation_key"]]
            ref = physical["value_ref"]
            parts = ref.split(":")
            if scenario == "pack-changed":
                parts[3] = ("0" if parts[3][0] != "0" else "1") + parts[3][1:]
            else:
                parts[4] = "99999"
            bad = ":".join(parts)
            m["payload_rows"][bad] = m["payload_rows"].pop(ref)
            physical["value_ref"] = bad
            fixture_copies(t)
        elif scenario == "pack-backup-missing":
            m["backup_binding"]["payload_rows"] = {}
        elif scenario == "pack-late-change":
            m["final_payload_rows"] = {}
    elif scenario == "writer-replay-only":
        m["operation_rows"][m["operation_key"]]["complete_event"]["replay_policy"] = "projector_replay_only"
        synchronize_fixture(name, p, t)
    elif scenario == "retry-replay-only":
        m["retry_event"]["replay_policy"] = "projector_replay_only"
    elif scenario == "retry-storage-metadata":
        m["retry_event"].update(sequence_id=9999, observed_at_utc="2026-11-04T01:00:00Z",
                                persisted_at_utc="2026-11-04T02:00:00Z")
    elif scenario == "retry-semantic-change":
        m["retry_event"]["actor_ref"] = "pmref:actor:other"
    elif scenario == "retry-event-id":
        m["retry_event"]["event_id"] = "evt_unrelated"
    elif scenario == "raw-project-partition":
        m["append_rows"][m["append_key"]]["scope_partition"] = p["project_id"]
        fixture_copies(t)
    elif scenario.startswith("checkpoint-"):
        field = scenario.removeprefix("checkpoint-")
        m["checkpoint_binding"][field] = 999 if field == "recovery_epoch" else "foreign"
    elif scenario == "snapshot-join":
        operation = m["operation_rows"][m["operation_key"]]
        if case["target"] == "selected_root_ref":
            operation["accepted_command"]["selected_root_ref"] = case["value"]
        else:
            entries = (operation["accepted_path_snapshots"] if case["phase"] == "accepted"
                       else operation["settlement"]["path_snapshots"])
            entry = next(p for p in entries if p["path_ref"] == case["path_ref"])
            entry[case["target"]] = case["value"]
            if case.get("both_phases"):
                other = next(p for p in operation["accepted_path_snapshots"]
                             if p["path_ref"] == case["path_ref"])
                other[case["target"]] = case["value"]
        synchronize_fixture(name, p, t)
    elif scenario.startswith("identifier-lf-"):
        p[scenario.removeprefix("identifier-lf-")] += "\n"
        # Test the lexical boundary directly. A derived receipt cannot legally acquire LF;
        # running custody equality afterwards would hide a broken lexical guard.
        return validate_shape("event_payloads/file_manager/" + name.replace(".", "_") + ".schema.json", "", p)
    elif scenario.startswith("companion-lf-"):
        value = m["operation_rows"][m["operation_key"]]
        value[scenario.removeprefix("companion-lf-")] += "\n"
        return validate_shape("filemanager_operation_contracts.schema.json", "operation_custody", value)
    elif scenario == "schema-identifier":
        value = p if case["schema"] == "payload" else m["operation_rows"][m["operation_key"]]
        target = value
        for key in case["path"][:-1]:
            target = target[key]
        key = case["path"][-1]
        target[key] = target[key] + case["suffix"] if "suffix" in case else case["value"]
        path = ("event_payloads/file_manager/" + name.replace(".", "_") + ".schema.json"
                if case["schema"] == "payload" else "filemanager_operation_contracts.schema.json")
        return validate_shape(path, "" if case["schema"] == "payload" else "operation_custody", value)
    elif scenario == "historical-live-state":
        # Retained SP-278 source authentication is distinct from today's native tree.
        t["current_live_state"] = case["live_state"]
        return validate_case(name, p, t, historical=True)
    elif scenario == "historical-policy":
        event = m["operation_rows"][m["operation_key"]]["complete_event"]
        event["replay_policy"] = case["policy"]
        if case.get("compatibility"):
            event["migration"].update(migrated_from_schema_id="pm.event.v0",
                migrated_from_schema_version="1.0.0", migration_id="compat1",
                compatibility_event_type=name)
        fixture_event(t, event)
        fixture_copies(t)
        t["current_live_state"] = {"state": "deleted", "exists": False}
        t.update(copy.deepcopy(case.get("trace_set", {})))
        if case.get("reader_withdrawn"):
            m["control_rows"][m["control_key"]]["reader_enabled"] = False
            fixture_copies(t)
        if case.get("foreign_storage"):
            m["checkpoint_binding"]["storage_instance_id"] = "foreign"
        if case.get("forged_digest"):
            m["append_rows"][m["append_key"]]["producer_semantic_digest"] = "a" * 64
            fixture_copies(t)
        return validate_case(name, p, t, historical=True)
    else:
        raise AssertionError("unknown boundary scenario " + scenario)
    return validate_case(name, p, t)


def full_value_commitment(event):
    domain = "pm.storage.original_event_value_commitment.v1"
    codec = "pm.seglog_frame_v2.event_value.canonical_msgpack.v1"
    preimage = [domain, "1.0.0", codec, event["schema_id"], event["schema_version"], event]
    return {"schema_id": domain, "schema_version": "1.0.0", "codec": codec,
            "domain": domain, "event_schema_id": event["schema_id"],
            "event_schema_version": event["schema_version"],
            "sha256": hashlib.sha256(canonical_msgpack(preimage)).hexdigest()}


def operation_key(row):
    parts = [row[k].encode().hex() for k in
             ("storage_instance_id", "project_id", "operation_id", "root_slot_id")]
    suffix = hashlib.sha256(":".join(parts).encode()).hexdigest()
    return "filemanager_operation_custody.v1:" + suffix


def receipt_ref(row):
    return "pmref:filemanager_operation:" + operation_key(row).split(":", 1)[1]


def control_key(row):
    return ("filemanager_family_control.v1:" + row["storage_instance_id"].encode().hex() +
            ":" + row["event_type"] + ":" + row["family_revision"])


def validate_path_coverage(paths, required_paths, label):
    # Accepted and settled snapshots obey the same coverage invariant. Keep one
    # enforcement point so an isolated coverage mutation tests that invariant.
    if len(paths) != len(required_paths) or {p["path_ref"] for p in paths} != required_paths:
        raise ValueError(label + " path coverage")


def validate_path_custody(payload, row):
    """Authenticate complete settled coverage against the accepted path source."""
    paths = row["settlement"]["path_snapshots"]
    required_paths = set(payload["affected_path_refs"] +
                         [payload[k] for k in ("source_path_ref", "destination_path_ref") if k in payload])
    validate_path_coverage(paths, required_paths, "original")
    for p in paths:
        if (p["project_id"] != payload["project_id"] or
                p["path_snapshot_revision"] != payload["path_snapshot_revision"] or
                (p["node_ref"] is None) != (p["node_kind"] == "absent")):
            raise ValueError("original path join")
    accepted_paths = row["accepted_path_snapshots"]
    validate_path_coverage(accepted_paths, required_paths, "accepted")
    for p in paths:
        original = next(a for a in accepted_paths if a["path_ref"] == p["path_ref"])
        if any(original[k] != p[k] for k in ("project_id", "path_snapshot_revision", "computer_id",
                                             "root_identity_ref", "relative_components")):
            raise ValueError("changed accepted location")


def validate_snapshot_subjects(event_type, payload, operation):
    """Join represented original facts; semantic flags cannot attest these relations."""
    kind, action = event_type.split(".")
    noun = "node" if kind == "file" else "folder"
    accepted = {p["path_ref"]: p for p in operation["accepted_path_snapshots"]}
    settled = {p["path_ref"]: p for p in operation["settlement"]["path_snapshots"]}

    def subject(entry, reference, label):
        if entry["node_ref"] != reference or entry["node_kind"] != kind:
            raise ValueError(label + " snapshot subject/kind")

    if action == "created":
        if operation["accepted_command"]["selected_root_ref"] is not None:
            raise ValueError("creation selected root")
        destination = accepted[payload["destination_path_ref"]]
        if destination["node_ref"] is not None or destination["node_kind"] != "absent":
            raise ValueError("creation original absence")
        subject(settled[payload["destination_path_ref"]], payload["result_" + noun + "_ref"], "result")
        containers = [p for p in accepted.values() if p["node_ref"] == payload["destination_container_ref"]]
        if len(containers) != 1 or containers[0]["node_kind"] != "folder":
            raise ValueError("creation exact container")
        container = containers[0]
        final_container = settled[container["path_ref"]]
        if (final_container["node_ref"] != container["node_ref"] or
                final_container["node_kind"] != "folder"):
            raise ValueError("creation settled container")
        if (destination["computer_id"] != container["computer_id"] or
                destination["root_identity_ref"] != container["root_identity_ref"] or
                destination["relative_components"][:-1] != container["relative_components"]):
            raise ValueError("creation container location")
        return

    field = ({"copied": "source_", "exported": "source_", "deleted": "prior_"}.get(action, "") +
             noun + "_ref")
    reference = payload[field]
    if operation["accepted_command"]["selected_root_ref"] != reference:
        raise ValueError("selected original subject")
    source = accepted[payload["source_path_ref"]]
    subject(source, reference, "accepted source")
    subject(settled[payload["source_path_ref"]], reference, "source")
    if action in {"copied", "moved", "renamed"}:
        result_ref = payload["result_" + noun + "_ref"] if action == "copied" else reference
        subject(settled[payload["destination_path_ref"]], result_ref, "result")
    elif action == "exported" and settled[payload["destination_path_ref"]]["node_kind"] != kind:
        raise ValueError("export destination kind")
    if action in {"copied", "moved", "exported"}:
        destination = settled[payload["destination_path_ref"]]
        # These are captured original locations, authenticated above against the
        # accepted snapshots. Opaque handle inequality does not prove a mutation.
        location_fields = ("computer_id", "root_identity_ref", "relative_components")
        if tuple(source[k] for k in location_fields) == tuple(destination[k] for k in location_fields):
            raise ValueError("unchanged represented original location")
    if action == "renamed":
        destination = settled[payload["destination_path_ref"]]
        if (source["computer_id"] != destination["computer_id"] or
                source["root_identity_ref"] != destination["root_identity_ref"] or
                source["relative_components"][:-1] != destination["relative_components"][:-1] or
                source["relative_components"][-1] == destination["relative_components"][-1]):
            raise ValueError("rename original parent/basename")


def validate_complete_event(event_type, payload, context, event, payload_rows, *,
                            include_body=True, label="original complete event join"):
    if type(include_body) is not bool:
        raise ValueError("invalid body-validation mode")
    if ((include_body and not same_value(event_body(event, payload_rows), payload)) or event["event_type"] != event_type or
            event["project_id"] != payload["project_id"] or event["scope_kind"] != "project" or
            event["correlation_id"] != payload["correlation_id"] or
            event["occurred_at_utc"] != payload["ts"] or event["payload_schema_id"] != payload["schema_id"] or
            (event["event_id"], event["idempotency_key"]) != identity(event_type, payload, context)):
        raise ValueError(label)


def validate_operation_edge(before, after, terminal=False):
    expected = {"accepted": "effect_settled", "effect_settled": "history_settled"}
    permitted = (expected.get(before["phase"]) == after["phase"] or
                 (before["phase"] == "accepted" and after["phase"] == "no_event_settled"))
    if terminal:
        permitted = before["phase"] == "effect_settled" and after["phase"] == "history_settled"
    if not permitted or after["revision"] != before["revision"] + 1:
        raise ValueError("operation CAS/phase")


def validate_operation_immutables(before, after):
    immutable = set(before) - {"phase", "revision", "settlement", "complete_event", "first_append_receipt", "noncompletion"}
    if any(not same_value(before[k], after[k]) for k in immutable):
        raise ValueError("changed accepted original")
    if before["settlement"] is not None and not same_value(before["settlement"], after["settlement"]):
        raise ValueError("changed settled original")


def validate_transition_storage(storage):
    if storage is not None and type(storage) is not dict:
        raise ValueError("invalid physical storage input")


def validate_family_identity(event_type, payload):
    kind, action = event_type.split(".")
    noun = "node" if kind == "file" else "folder"
    if action == "copied" and payload["result_" + noun + "_ref"] == payload["source_" + noun + "_ref"]:
        raise ValueError("copy result equals source")
    if action == "created" and payload["result_" + noun + "_ref"] == payload["destination_container_ref"]:
        raise ValueError("create result equals destination container")


def validate_settlement_inputs(payload, row, command_label="original command join"):
    """The effect boundary and retained reader enforce the same frozen joins."""
    for k in ("command_id", "handler_target", "correlation_id", "origin"):
        if row["accepted_command"][k] != payload[k]:
            raise ValueError(command_label)
    for k in ("source_path_ref", "destination_path_ref", "destination_container_ref", "deletion_mode"):
        if row["accepted_command"][k] != payload.get(k):
            raise ValueError("original accepted input join")
    if row["settlement"]["settled_at_utc"] != payload["ts"]:
        raise ValueError("original completion time")


def validate_operation_transition(before, after, proof=None, storage=None):
    validate_transition_storage(storage)
    storage = storage or {}
    for label, row in (("before", before), ("after", after)):
        resolved = resolve_value("operation_custody", storage.get(label, row), storage.get("payload_rows", {}))
        if not same_value(resolved, row):
            raise ValueError("operation physical resolution differs")
    validate_operation_edge(before, after)
    validate_operation_immutables(before, after)
    if after["phase"] == "no_event_settled":
        return  # No event/payload/receipt may be attached; the closed schema enforces this.
    payload = after["settlement"]["payload"]
    if (payload["schema_id"] != "pm.file_manager_event." + after["event_type"].replace(".", "_") + ".schema.v1" or
            payload["project_id"] != after["project_id"] or payload["operation_id"] != after["operation_id"] or
            payload["receipt_ref"] != receipt_ref(after)):
        raise ValueError("settlement acceptance join")
    validate_settlement_inputs(payload, after, "settlement acceptance join")
    validate_family_identity(after["event_type"], payload)
    validate_path_custody(payload, after)
    validate_snapshot_subjects(after["event_type"], payload, after)
    if after["phase"] == "history_settled":
        event = after["complete_event"]
        validate_writer(event)
        validate_complete_event(after["event_type"], payload, after, event, {},
                                include_body=False, label="terminal original EventRecord join")
        if proof is None:
            raise ValueError("terminal strict full-value proof missing")
        # The proof-dependent joins have no operands when the optional input is absent.
        if proof is not None:
            validate_case(after["event_type"], payload, proof, operation_candidate=after,
                          transition_before=before)


def validate_control_transition(before, after, issued_sequence, drain_keys, storage=None):
    # Validate the API input before truthiness or membership can interpret it.
    if type(drain_keys) is not list:
        raise ValueError("drain keys must be an exact list")
    if type(drain_keys) is list:
        for key in drain_keys:
            if type(key) is not str:
                raise ValueError("invalid drain operation reference")
            if type(key) is str and not re.fullmatch(r"filemanager_operation_custody\.v1:[0-9a-f]{64}", key):
                raise ValueError("invalid drain operation reference")
    validate_transition_storage(storage)
    storage = storage or {}
    for label, row in (("before", before), ("after", after)):
        resolved = resolve_value("family_control", storage.get(label, row), storage.get("payload_rows", {}))
        if not same_value(resolved, row):
            raise ValueError("control physical resolution differs")
    if (control_key(before) != control_key(after) or
            after["control_revision"] != before["control_revision"] + 1):
        raise ValueError("control CAS/identity")
    edge = before["state"], after["state"]
    if edge not in {("prepared", "active"), ("active", "active"), ("active", "draining"),
                    ("draining", "draining"), ("draining", "withdrawn"), ("withdrawn", "withdrawn")}:
        raise ValueError("control transition")
    if before["admission_revision"] is not None and before["admission_revision"] != after["admission_revision"]:
        raise ValueError("changed original admission")
    if type(issued_sequence) is not int:
        raise ValueError("control issued boundary")
    if type(issued_sequence) is int and (issued_sequence < 0 or
            after["last_admitted_sequence"] != issued_sequence or
            issued_sequence < before["last_admitted_sequence"]):
        raise ValueError("control issued boundary")
    if edge in {("active", "active"), ("draining", "draining")} and (
            after["reader_enabled"] != before["reader_enabled"] or
            after["drain_operation_keys"] != before["drain_operation_keys"]):
        raise ValueError("issuance changed control authority")
    if type(drain_keys) is list and edge == ("active", "draining") and after["drain_operation_keys"] != drain_keys:
        raise ValueError("drain membership")
    if edge == ("active", "draining") and after["reader_enabled"] != before["reader_enabled"]:
        raise ValueError("drain changed reader authority")
    if after["state"] == "withdrawn" and ((type(drain_keys) is list and drain_keys) or
            after["writer_cutoff_sequence"] != issued_sequence):
        raise ValueError("cutoff before original drain")
    if edge == ("withdrawn", "withdrawn") and (
            before["writer_cutoff_sequence"] != after["writer_cutoff_sequence"] or
            before["last_admitted_sequence"] != after["last_admitted_sequence"] or
            before["reader_enabled"] is not True or after["reader_enabled"] is not False):
        raise ValueError("withdrawn authority rewritten")


def validate_original_models(event_type, payload, trace, *, operation_candidate=None,
                             transition_before=None, historical=False):
    if type(historical) is not bool:
        raise ValueError("invalid historical mode")
    model = trace["custody_model"]  # Synthetic canonical tables; native origin remains NOT_RUN.
    physical_operation = model["operation_rows"][model["operation_key"]]
    selected_operation = resolve_value("operation_custody", physical_operation, model["payload_rows"])
    row = selected_operation if operation_candidate is None else operation_candidate
    validate_shape("filemanager_operation_contracts.schema.json", "operation_custody", row)
    if operation_candidate is not None:
        before = selected_operation if transition_before is None else transition_before
        validate_operation_edge(before, row, terminal=True)
        validate_operation_immutables(before, row)
        if transition_before is not None and not same_value(selected_operation, transition_before):
            raise ValueError("terminal selected original differs from before")
    if model["operation_key"] != operation_key(row) or payload["receipt_ref"] != receipt_ref(row):
        raise ValueError("operation physical identity")
    validate_project_scope(row["project_id"], trace["project_id"], "operation original epoch/scope")
    if any(row[k] != trace[k] for k in ("storage_instance_id", "recovery_epoch")):
        raise ValueError("operation original epoch/scope")
    if row["event_type"] != event_type or row["operation_id"] != payload["operation_id"]:
        raise ValueError("operation family/identity")
    if row["phase"] != "history_settled":
        raise ValueError("unsettled or changed original payload")
    # All remaining joins consume a historical complete event and issued receipt.
    if row["phase"] == "history_settled":
        # Current append/retry and terminal publication still enforce writer policy.
        # A retained historical original is governed by its authenticated written value.
        if not historical or operation_candidate is not None:
            validate_writer(row["complete_event"])
            validate_writer(model["retry_event"])
        validate_historical_operation(event_type, payload, trace, model, row,
                                      physical_operation, selected_operation)


def validate_historical_operation(event_type, payload, trace, model, row,
                                  physical_operation, selected_operation):
    validate_original_payload(payload, row["settlement"]["payload"], "unsettled or changed original payload")
    validate_settlement_inputs(payload, row)
    validate_path_custody(payload, row)
    validate_snapshot_subjects(event_type, payload, row)
    event = row["complete_event"]
    validate_complete_event(event_type, payload, row, event, model["payload_rows"])
    if model["resolver"] != "storage.first_append_receipt.resolve_full_value.v1":
        raise ValueError("semantic proof is not full-value proof")
    request, result = model["request"], model["result"]
    validate_shape("event_append_receipt_contracts.schema.json", "full_value_request", request)
    validate_shape("event_append_receipt_contracts.schema.json", "full_value_result", result)
    if not same_value(request["event"], event):
        raise ValueError("changed original full-value request")
    retry = model["retry_event"]
    validate_shape("event_record.schema.json", "", retry)
    if retry["event_id"] != event["event_id"]:
        raise ValueError("retry original event identity")
    if not same_value(semantic_body(retry), semantic_body(event)):
        raise ValueError("unequal caller semantic retry")
    stored = model["append_rows"][model["append_key"]]
    validate_shape("event_append_receipt_contracts.schema.json", "custody_v2", stored)
    key = ("event_append_receipt_custody.v1:" + row["storage_instance_id"] + ":" +
           hashlib.sha256(event["event_id"].encode()).hexdigest())
    scope = "project~" + base64.urlsafe_b64encode(payload["project_id"].encode()).decode().rstrip("=")
    if (model["append_key"] != key or stored["storage_instance_id"] != row["storage_instance_id"] or
            stored["event_id"] != event["event_id"] or stored["scope_partition"] != scope or
            stored["event_type"] != event_type or stored["idempotency_key"] != event["idempotency_key"]):
        raise ValueError("original v2 custody identity")
    if not same_value(result, {k: stored[k] for k in result}):
        raise ValueError("full-value result differs from selected original")
    if result["original_event_value_commitment"] != full_value_commitment(event):
        raise ValueError("unequal complete-value commitment")
    digest = hashlib.sha256(json.dumps(semantic_body(event), sort_keys=True, separators=(",", ":"),
                                      ensure_ascii=False).encode()).hexdigest()
    if stored["producer_semantic_digest"] != digest:
        raise ValueError("producer semantic digest mismatch")
    receipt = result["first_append_receipt"]
    if (not same_value(receipt, row["first_append_receipt"]) or receipt["event_id"] != event["event_id"] or
            receipt["sequence_id"] != event["sequence_id"] or receipt["durability_class"] != "barrier"):
        raise ValueError("original issued receipt join")
    if not same_value(model["checkpoint_binding"], {
            "storage_instance_id": row["storage_instance_id"], "recovery_epoch": row["recovery_epoch"],
            "event_id": event["event_id"], "scope_partition": scope}):
        raise ValueError("checkpoint original storage identity mismatch")
    physical_control = model["control_rows"][model["control_key"]]
    control = resolve_value("family_control", physical_control, model["payload_rows"])
    validate_shape("filemanager_operation_contracts.schema.json", "family_control", control)
    if (model["control_key"] != control_key(control) or control["event_type"] != event_type or
            control["storage_instance_id"] != row["storage_instance_id"]):
        raise ValueError("control physical identity")
    if control["state"] == "prepared" or not control["reader_enabled"]:
        raise ValueError("control reader unavailable")
    ceiling = control["writer_cutoff_sequence"] if control["state"] == "withdrawn" else control["last_admitted_sequence"]
    if (control["state"] == "withdrawn" and ceiling != control["last_admitted_sequence"]) or event["sequence_id"] > ceiling:
        raise ValueError("control cutoff/sequence")
    if any(not same_value(model["final_" + name], value) for name, value in
           [("operation", selected_operation), ("control", control), ("append", stored)]):
        raise ValueError("late original/control change")
    if (not same_value(model["final_operation_value"], physical_operation) or
            not same_value(model["final_control_value"], physical_control) or
            not same_value(model["final_payload_rows"], model["payload_rows"])):
        raise ValueError("late physical value/referent change")
    if not same_value(model["backup_binding"], {"operation": physical_operation, "control": physical_control,
                                               "append": stored, "storage_instance_id": row["storage_instance_id"],
                                               "payload_rows": model["payload_rows"]}):
        raise ValueError("backup original/control skew")


def identity(event_type, payload, context):
    # These fixtures contain ASCII strings only; JSON compact encoding equals RFC8785 here.
    # Production MUST use RFC8785, not this bounded oracle encoding, for arbitrary Unicode.
    if type(context["recovery_epoch"]) is not int:
        raise ValueError("noncanonical recovery epoch")
    if type(context["recovery_epoch"]) is int and context["recovery_epoch"] < 0:
        raise ValueError("noncanonical recovery epoch")
    kind, action = event_type.split(".")
    subject = {
        "created": "result_node_ref" if kind == "file" else "result_folder_ref",
        "copied": "source_node_ref" if kind == "file" else "source_folder_ref",
        "exported": "source_node_ref" if kind == "file" else "source_folder_ref",
        "deleted": "prior_node_ref" if kind == "file" else "prior_folder_ref",
        "moved": "node_ref" if kind == "file" else "folder_ref",
        "renamed": "node_ref" if kind == "file" else "folder_ref",
    }[action]
    fields = [context["storage_instance_id"], str(context["recovery_epoch"]),
              payload["project_id"], event_type, payload["operation_id"], payload[subject]]
    if any(type(value) is not str for value in fields):
        raise ValueError("noncanonical identity tuple")
    digest = hashlib.sha256(json.dumps(fields, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()
    return "evt_" + event_type.replace(".", "_") + "_" + digest, event_type + ":" + digest


def validate_case(event_type, payload, trace, *, operation_candidate=None,
                  transition_before=None, historical=False):
    validate_shape("event_payloads/file_manager/" + event_type.replace(".", "_") + ".schema.json", "", payload)
    validate_project_scope(payload["project_id"], trace["project_id"], "scope mismatch")
    validate_family_identity(event_type, payload)
    for key in ("source_path_ref", "destination_path_ref"):
        if key in payload and not payload[key].startswith("pm-path-ref:v1:project:"):
            raise ValueError("foreign path scope")
    if any(not p.startswith("pm-path-ref:v1:project:") for p in payload["affected_path_refs"]):
        raise ValueError("foreign affected path scope")
    validate_original_payload(payload, trace["original_payload"], "unequal original custody")
    if trace["stages"] != ["effect_settled", "receipt_settled", "append", "first_ack", "terminal"]:
        raise ValueError("invalid ordering")
    if trace["original_first_receipt_resolved"] is not True:
        raise ValueError("unresolved first receipt")
    if (not same_value(trace["replay_effect_count"], 0) or
            not same_value(trace["retry_append_count"], 0)):
        raise ValueError("replay/duplicate effect")


    if any(trace[k] is not True for k in ("current_source_verified", "access_allowed", "restore_coherent")):
        raise ValueError("source/access/restore fence")
    if trace["reader_revision"] != "1.0.0" or trace["event_revision"] != "1.0.0":
        raise ValueError("unsupported revision")
    if trace["reader_enabled"] is not True:
        raise ValueError("reader withdrawn")
    for k in ("event_sequence", "writer_cutoff_sequence"):
        if type(trace[k]) is not int:
            raise ValueError("past writer cutoff")
        if type(trace[k]) is int and trace[k] < 0:
            raise ValueError("past writer cutoff")
    if (type(trace["event_sequence"]) is int and type(trace["writer_cutoff_sequence"]) is int and
            trace["event_sequence"] >= 0 and trace["writer_cutoff_sequence"] >= 0 and
            trace["event_sequence"] > trace["writer_cutoff_sequence"]):
        raise ValueError("past writer cutoff")
    action = event_type.split(".")[1]
    expected_semantics = {
        "copied": {"source_unchanged": True, "distinct_result": True},
        "created": {"valid_name": True, "exact_container": True, "new_node": True},
        "deleted": {"mode_matches_original": True, "confirmation_valid": True, "custody_distinct": True},
        "exported": {"source_unchanged": True, "destination_authorized": True, "transfer_complete": True},
        "moved": {"destination_committed": True, "source_removed": True, "identity_preserved": True},
        "renamed": {"valid_name": True, "same_parent": True, "identity_preserved": True},
    }[action]
    if not same_value(trace["semantic_checks"], expected_semantics):
        raise ValueError("family semantic boundary")
    if event_type.startswith("folder.") and "descendant_count" in payload:
        if not same_value(payload["descendant_count"], trace["original_descendant_count"]):
            raise ValueError("descendant receipt mismatch")
    expected = identity(event_type, payload, trace)
    if type(trace["retry_identity"]) is not list:
        raise ValueError("retry identity changed")
    if type(trace["retry_identity"]) is list and tuple(trace["retry_identity"]) != expected:
        raise ValueError("retry identity changed")
    validate_original_models(event_type, payload, trace, operation_candidate=operation_candidate,
                             transition_before=transition_before, historical=historical)
    return expected


def negative_case(row, case):
    if case.get("scenario") == "coverage":
        return boundary_case(row, case)
    p, t = copy.deepcopy(row["payload"]), copy.deepcopy(row["trace"])
    for k, v in case.get("payload_set", {}).items():
        p[k] = v
    for k in case.get("payload_delete", []):
        p.pop(k, None)
    t.update(case.get("trace_set", {}))
    for mutation in case.get("model_set", []):
        target = t["custody_model"]
        for key in mutation["path"][:-1]:
            target = target[key]
        target[mutation["path"][-1]] = mutation["value"]
    if case.get("schema_only"):
        return validate_shape("event_payloads/file_manager/" + row["event_type"].replace(".", "_") +
                              ".schema.json", "", p)
    if "schema_target" in case:
        target = t["custody_model"]
        for key in case["schema_target"]["path"]:
            target = target[key]
        return validate_shape(case["schema_target"]["document"], case["schema_target"]["definition"], target)
    return validate_case(row["event_type"], p, t)


def check_negative_reason(case, error):
    if "expected_error" not in case and "expected_schema" not in case:
        raise AssertionError("negative has no defect oracle: " + case["name"]) from error
    if case.get("expected_error") and str(error) != case["expected_error"]:
        raise AssertionError("negative masked: " + case["name"]) from error
    if "expected_schema" in case:
        actual = ({"validator": error.validator, "path": list(error.absolute_path)}
                  if isinstance(error, jsonschema.ValidationError) else None)
        if actual != case["expected_schema"]:
            raise AssertionError("schema negative masked: " + case["name"]) from error


def transition_case(row, case):
    args = case["args"]
    if case.get("schema_only"):
        value = args[1]
        for key in case.get("schema_path", []):
            value = value[key]
        return validate_shape("filemanager_operation_contracts.schema.json",
                              case.get("schema_definition", "operation_custody" if case["kind"] == "operation"
                                       else "family_control"), value)
    validator = validate_operation_transition if case["kind"] == "operation" else validate_control_transition
    if "control_args" in case:
        validator(*copy.deepcopy(case["control_args"]))
    if case.get("proof_source") == "original_trace":
        return validator(*args, proof=terminal_fixture_proof(row["trace"], args[0]))
    return validator(*args)


def main(family=None):
    global SCHEMAS
    SCHEMAS = schema_registry()  # Fail before instances, even if no fixture visits a broken ref.
    fixtures = json.loads((ROOT / "Plans/filemanager_event_contract_fixtures.json").read_text())
    expected_families = {kind + "." + action for kind in ("file", "folder")
                         for action in ("copied", "created", "deleted", "exported", "moved", "renamed")}
    if ((family is not None and family not in expected_families) or len(fixtures["rows"]) != 12 or
            {r["event_type"] for r in fixtures["rows"]} != expected_families):
        raise AssertionError("incomplete twelve-family fixture set")
    count = 0
    assessed_families = 0
    for row in fixtures["rows"]:
        if family is not None and row["event_type"] != family:
            continue
        assessed_families += 1
        name, payload, trace = row["event_type"], row["payload"], row["trace"]
        validate_case(name, payload, trace)
        count += 1
        for case in row["negative_cases"]:
            try:
                negative_case(row, case)
            except (ValueError, KeyError, jsonschema.ValidationError) as error:
                check_negative_reason(case, error)
                count += 1
            else:
                raise AssertionError(name + ": accepted negative " + case["name"])
        for case in row["transition_cases"]:
            try:
                transition_case(row, case)
            except (ValueError, KeyError, jsonschema.ValidationError) as error:
                if case["valid"]:
                    raise AssertionError(name + ": rejected positive transition " + case["name"])
                check_negative_reason(case, error)
            else:
                if not case["valid"]:
                    raise AssertionError(name + ": accepted negative transition " + case["name"])
            count += 1
        for case in row["boundary_cases"]:
            try:
                boundary_case(row, case)
            except (ValueError, KeyError, jsonschema.ValidationError) as error:
                if case["valid"]:
                    raise AssertionError(name + ": rejected positive boundary " + case["name"]) from error
                check_negative_reason(case, error)
            else:
                if not case["valid"]:
                    raise AssertionError(name + ": accepted negative boundary " + case["name"])
            count += 1
        owner = (ROOT / "Plans/FileManager.md").read_text()
        start = owner.index("### " + row["owner_unit"] + " - ")
        section = owner[start:].split("\n### ", 1)[0]
        for token in [name, "SP-278", "SP-286/CV-339", "PENDING_RETENTION_DECISION",
                      "SP-337/SP-340", "replay_only_not_appendable", "operation_custody_value/family_control_value",
                      "storage.first_append_receipt.resolve_full_value.v1", "#/$defs/full_value_request",
                      "#/$defs/full_value_result", "filemanager.operation_custody.resolve.v1",
                      "filemanager.path_snapshot.resolve.v1", "filemanager_family_control.v1",
                      "reader.filemanager." + name.replace(".", "_") + ".v1@1.0.0"]:
            if token not in section:
                raise AssertionError(name + ": missing owner adoption " + token)
    registry = json.loads((ROOT / "Plans/storage_value_registry.json").read_text())
    jsonschema.Draft202012Validator(json.loads((ROOT / "Plans/storage_value_registry.schema.json").read_text())).validate(registry)
    schema = json.loads((ROOT / "Plans/filemanager_operation_contracts.schema.json").read_text())
    jsonschema.Draft202012Validator.check_schema(schema)
    for family, definition in [("filemanager_operation_custody", "operation_custody"),
                               ("filemanager_family_control", "family_control")]:
        entry = next(f for f in registry["families"] if f["family_id"] == family)
        jsonschema.Draft202012Validator.check_schema(entry["value_schema"])
        validate_schema_graph({**schema_documents(), "embedded/" + family + ".schema.json": entry["value_schema"]})
        for field in ("properties", "required", "additionalProperties", "oneOf"):
            if entry["value_schema"][field] != schema["$defs"][definition + "_value"][field]:
                raise AssertionError(family + ": registry/schema drift")
        if (entry["required_fields"] != schema["$defs"][definition + "_value"]["required"] or
                not entry["recovery_disposition"]["backup_required"] or
                not entry["restore_disposition"]["mutation_fence_on_unresolved"]):
            raise AssertionError(family + ": incomplete registered custody")
        if entry["value_schema"]["$defs"] != schema["$defs"]:
            raise AssertionError(family + ": embedded logical schema drift")
        validate_profile(registry, family)
    dfm_registry_failures = [f for f in _codec.storage_value_registry_data_failures(
        registry, path_label="Plans/storage_value_registry.json")
        if f.get("family_id") in {"filemanager_operation_custody", "filemanager_family_control"}]
    if dfm_registry_failures:
        raise AssertionError("FileManager registry contract failures: " + json.dumps(dfm_registry_failures))
    print(json.dumps({"status": "pass", "families": assessed_families,
                      "oracle_cases": count, "native_execution": "NOT_RUN"}))
    return 0


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--family", choices=[k + "." + a for k in ("file", "folder")
                        for a in ("copied", "created", "deleted", "exported", "moved", "renamed")],
                        help="Run one complete family, including the shared registry gates.")
    sys.exit(main(parser.parse_args().family))
