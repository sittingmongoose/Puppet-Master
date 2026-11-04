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

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_BASE = "https://puppetmaster.local/schemas/"


def schema_registry():
    registry = Registry()
    paths = ["filemanager_operation_contracts.schema.json", "event_record.schema.json",
             "event_append_receipt_contracts.schema.json"]
    paths += [str(p.relative_to(ROOT / "Plans")) for p in
              sorted((ROOT / "Plans/event_payloads/file_manager").glob("*.schema.json"))]
    for path in paths:
        schema = json.loads((ROOT / "Plans" / path).read_text())
        resource = Resource.from_contents(schema)
        registry = registry.with_resource(SCHEMA_BASE + path, resource)
        registry = registry.with_resource(schema["$id"], resource)
    return registry


SCHEMAS = schema_registry()


def validate_shape(path, definition, value):
    uri = SCHEMA_BASE + path + ("#/$defs/" + definition if definition else "")
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


def resolve_payload(reference, payload_rows):
    if not isinstance(reference, str) or not re.fullmatch(
            r"pm-payload-ref:v1:blake3:[0-9a-f]{64}:[1-9][0-9]*:application/vnd.msgpack", reference):
        raise ValueError("invalid SP-337 reference")
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
    if len(canonical_msgpack(event["payload"])) > INLINE_LIMIT:
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
    if event["replay_policy"] != "dedupe_by_idempotency_key":
        raise ValueError("filemanager writer replay policy")


def validate_profile(registry, family):
    profile = registry["storage_profile"]["family_profiles"][family]
    if (profile["redb_file"] != "canonical" or profile["storage_group"] != "coordination_and_storage" or
            profile["max_value_bytes"] != INLINE_LIMIT or profile["encoding_target"] != "messagepack_canonical"):
        raise ValueError("wrong SP-340 profile")
    group = next(g for g in registry["storage_profile"]["groups"] if g["group_id"] == profile["storage_group"])
    if group["canonical_budget_bytes"] != 2147483648:
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
    if scenario.startswith("profile-"):
        registry = json.loads((ROOT / "Plans/storage_value_registry.json").read_text())
        profiles = registry["storage_profile"]["family_profiles"]
        if scenario == "profile-schema-header":
            entry = next(f for f in registry["families"] if f["family_id"] == case["family"])
            entry["value_schema"]["properties"]["schema_id"] = {"enum": [entry["value_schema_id"]]}
        elif scenario == "profile-missing":
            del profiles[case["family"]]
        else:
            profiles[case["family"]][case["field"]] = case["value"]
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
            proof["custody_model"]["result"]["original_event_value_commitment"]["sha256"] = "0" * 64
        elif scenario == "terminal-replay-only":
            after["complete_event"]["replay_policy"] = "projector_replay_only"
        elif scenario == "terminal-substituted-original":
            model = proof["custody_model"]
            model["operation_rows"][model["operation_key"]]["recovery_epoch"] += 1
        elif scenario == "terminal-already-published-original":
            model = proof["custody_model"]
            model["operation_rows"][model["operation_key"]] = copy.deepcopy(after)
        else:
            raise AssertionError("unknown terminal case")
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
                packs[storage["after"]["value_ref"]]["reader_enabled"] = False
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
            m["payload_rows"] = {}
        elif scenario == "pack-changed":
            next(iter(m["payload_rows"].values()))["evidence_refs"][0] += "a"
        elif scenario == "pack-wrong-size":
            ref = m["request"]["event"]["payload_ref"]
            bad = ref.replace(":" + str(case.get("bytes", INLINE_LIMIT + 1)) + ":", ":99999:")
            changed = copy.deepcopy(m["final_operation"])
            changed["complete_event"]["payload_ref"] = bad
            m["payload_rows"][bad] = copy.deepcopy(m["payload_rows"][ref])
            m["operation_rows"][m["operation_key"]] = stored_value(
                "operation_custody", changed, m["payload_rows"])
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
    elif scenario.startswith("checkpoint-"):
        field = scenario.removeprefix("checkpoint-")
        m["checkpoint_binding"][field] = 999 if field == "recovery_epoch" else "foreign"
    elif scenario.startswith("identifier-lf-"):
        p[scenario.removeprefix("identifier-lf-")] += "\n"
    elif scenario.startswith("companion-lf-"):
        m["operation_rows"][m["operation_key"]][scenario.removeprefix("companion-lf-")] += "\n"
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


def validate_operation_transition(before, after, proof=None, storage=None):
    storage = storage or {}
    for label, row in (("before", before), ("after", after)):
        resolved = resolve_value("operation_custody", storage.get(label, row), storage.get("payload_rows", {}))
        if not same_value(resolved, row):
            raise ValueError("operation physical resolution differs")
    expected = {"accepted": "effect_settled", "effect_settled": "history_settled"}
    permitted = (expected.get(before["phase"]) == after["phase"] or
                 (before["phase"] == "accepted" and after["phase"] == "no_event_settled"))
    if not permitted or after["revision"] != before["revision"] + 1:
        raise ValueError("operation CAS/phase")
    immutable = set(before) - {"phase", "revision", "settlement", "complete_event", "first_append_receipt", "noncompletion"}
    if any(not same_value(before[k], after[k]) for k in immutable):
        raise ValueError("changed accepted original")
    if before["settlement"] is not None and not same_value(before["settlement"], after["settlement"]):
        raise ValueError("changed settled original")
    if after["phase"] == "no_event_settled":
        return  # No event/payload/receipt may be attached; the closed schema enforces this.
    payload = after["settlement"]["payload"]
    if (payload["schema_id"] != "pm.file_manager_event." + after["event_type"].replace(".", "_") + ".schema.v1" or
            payload["project_id"] != after["project_id"] or payload["operation_id"] != after["operation_id"] or
            payload["receipt_ref"] != receipt_ref(after) or
            any(payload[k] != after["accepted_command"][k]
                for k in ("command_id", "handler_target", "correlation_id", "origin"))):
        raise ValueError("settlement acceptance join")
    if after["phase"] == "history_settled":
        event = after["complete_event"]
        validate_writer(event)
        if (event["event_type"] != after["event_type"] or
                event["project_id"] != after["project_id"] or event["scope_kind"] != "project" or
                event["correlation_id"] != payload["correlation_id"] or
                event["occurred_at_utc"] != payload["ts"] or
                event["payload_schema_id"] != payload["schema_id"] or
                (event["event_id"], event["idempotency_key"]) != identity(after["event_type"], payload, after)):
            raise ValueError("terminal original EventRecord join")
        if proof is None:
            raise ValueError("terminal strict full-value proof missing")
        model = proof["custody_model"]
        selected = resolve_value("operation_custody", model["operation_rows"][model["operation_key"]],
                                 model["payload_rows"])
        if not same_value(selected, before):
            raise ValueError("terminal selected original differs from before")
        validate_case(after["event_type"], payload, proof, operation_candidate=after)


def validate_control_transition(before, after, issued_sequence, drain_keys, storage=None):
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
    if (after["last_admitted_sequence"] != issued_sequence or
            issued_sequence < before["last_admitted_sequence"]):
        raise ValueError("control issued boundary")
    if edge in {("active", "active"), ("draining", "draining")} and (
            after["reader_enabled"] != before["reader_enabled"] or
            after["drain_operation_keys"] != before["drain_operation_keys"]):
        raise ValueError("issuance changed control authority")
    if edge == ("active", "draining") and after["drain_operation_keys"] != drain_keys:
        raise ValueError("drain membership")
    if after["state"] == "withdrawn" and (drain_keys or
            after["writer_cutoff_sequence"] != issued_sequence):
        raise ValueError("cutoff before original drain")
    if edge == ("withdrawn", "withdrawn") and (
            before["writer_cutoff_sequence"] != after["writer_cutoff_sequence"] or
            before["last_admitted_sequence"] != after["last_admitted_sequence"] or
            before["reader_enabled"] is not True or after["reader_enabled"] is not False):
        raise ValueError("withdrawn authority rewritten")


def validate_original_models(event_type, payload, trace, *, operation_candidate=None):
    model = trace["custody_model"]  # Synthetic canonical tables; native origin remains NOT_RUN.
    physical_operation = model["operation_rows"][model["operation_key"]]
    selected_operation = resolve_value("operation_custody", physical_operation, model["payload_rows"])
    row = selected_operation if operation_candidate is None else operation_candidate
    validate_shape("filemanager_operation_contracts.schema.json", "operation_custody", row)
    if operation_candidate is not None:
        immutable = set(selected_operation) - {"phase", "revision", "complete_event", "first_append_receipt"}
        if (selected_operation["phase"] != "effect_settled" or row["phase"] != "history_settled" or
                row["revision"] != selected_operation["revision"] + 1 or
                any(not same_value(row[k], selected_operation[k]) for k in immutable)):
            raise ValueError("terminal candidate changed selected original")
    if model["operation_key"] != operation_key(row) or payload["receipt_ref"] != receipt_ref(row):
        raise ValueError("operation physical identity")
    if any(row[k] != trace[k] for k in ("storage_instance_id", "recovery_epoch", "project_id")):
        raise ValueError("operation original epoch/scope")
    if row["event_type"] != event_type or row["operation_id"] != payload["operation_id"]:
        raise ValueError("operation family/identity")
    if row["phase"] != "history_settled" or not same_value(row["settlement"]["payload"], payload):
        raise ValueError("unsettled or changed original payload")
    for k in ("command_id", "handler_target", "correlation_id", "origin"):
        if row["accepted_command"][k] != payload[k]:
            raise ValueError("original command join")
    for k in ("source_path_ref", "destination_path_ref", "destination_container_ref", "deletion_mode"):
        if row["accepted_command"][k] != payload.get(k):
            raise ValueError("original accepted input join")
    if row["settlement"]["settled_at_utc"] != payload["ts"]:
        raise ValueError("original completion time")
    paths = row["settlement"]["path_snapshots"]
    required_paths = set(payload["affected_path_refs"] +
                         [payload[k] for k in ("source_path_ref", "destination_path_ref") if k in payload])
    if len(paths) != len(required_paths) or {p["path_ref"] for p in paths} != required_paths:
        raise ValueError("original path coverage")
    for p in paths:
        if (p["project_id"] != payload["project_id"] or
                p["path_snapshot_revision"] != payload["path_snapshot_revision"] or
                (p["node_ref"] is None) != (p["node_kind"] == "absent")):
            raise ValueError("original path join")
    accepted_paths = row["accepted_path_snapshots"]
    if len(accepted_paths) != len(paths) or {p["path_ref"] for p in accepted_paths} != required_paths:
        raise ValueError("accepted path coverage")
    for p in paths:
        original = next(a for a in accepted_paths if a["path_ref"] == p["path_ref"])
        if any(original[k] != p[k] for k in ("project_id", "path_snapshot_revision", "computer_id",
                                             "root_identity_ref", "relative_components")):
            raise ValueError("changed accepted location")
    kind, action = event_type.split(".")
    root = "node" if kind == "file" else "folder"
    if action == "created":
        destination = next(a for a in accepted_paths if a["path_ref"] == payload["destination_path_ref"])
        result = next(p for p in paths if p["path_ref"] == payload["destination_path_ref"])
        if (destination["node_kind"] != "absent" or destination["node_ref"] is not None or
                not any(a["node_ref"] == payload["destination_container_ref"] and a["node_kind"] == "folder"
                        for a in accepted_paths) or
                result["node_ref"] != payload["result_" + root + "_ref"] or result["node_kind"] != kind):
            raise ValueError("creation original parent/absence")
    event = row["complete_event"]
    validate_writer(event)
    if (not same_value(event_body(event, model["payload_rows"]), payload) or event["event_type"] != event_type or
            event["project_id"] != payload["project_id"] or event["scope_kind"] != "project" or
            event["correlation_id"] != payload["correlation_id"] or
            event["occurred_at_utc"] != payload["ts"] or event["payload_schema_id"] != payload["schema_id"] or
            (event["event_id"], event["idempotency_key"]) != identity(event_type, payload, row)):
        raise ValueError("original complete event join")
    if model["resolver"] != "storage.first_append_receipt.resolve_full_value.v1":
        raise ValueError("semantic proof is not full-value proof")
    request, result = model["request"], model["result"]
    validate_shape("event_append_receipt_contracts.schema.json", "full_value_request", request)
    validate_shape("event_append_receipt_contracts.schema.json", "full_value_result", result)
    if not same_value(request["event"], event):
        raise ValueError("changed original full-value request")
    retry = model["retry_event"]
    validate_shape("event_record.schema.json", "", retry)
    validate_writer(retry)
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
    digest = hashlib.sha256(json.dumps(fields, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()
    return "evt_" + event_type.replace(".", "_") + "_" + digest, event_type + ":" + digest


def validate_case(event_type, payload, trace, *, operation_candidate=None):
    schema = json.loads((ROOT / "Plans/event_payloads/file_manager" /
                         (event_type.replace(".", "_") + ".schema.json")).read_text())
    jsonschema.Draft202012Validator(schema, format_checker=jsonschema.FormatChecker()).validate(payload)
    if payload["project_id"] != trace["project_id"]:
        raise ValueError("scope mismatch")
    kind, action = event_type.split(".")
    root = "node" if kind == "file" else "folder"
    if action == "copied" and payload["result_" + root + "_ref"] == payload["source_" + root + "_ref"]:
        raise ValueError("copy result equals source")
    if action == "created" and payload["result_" + root + "_ref"] == payload["destination_container_ref"]:
        raise ValueError("create result equals destination container")
    for key in ("source_path_ref", "destination_path_ref"):
        if key in payload and not payload[key].startswith("pm-path-ref:v1:project:"):
            raise ValueError("foreign path scope")
    if any(not p.startswith("pm-path-ref:v1:project:") for p in payload["affected_path_refs"]):
        raise ValueError("foreign affected path scope")
    if not same_value(trace["original_payload"], payload):
        raise ValueError("unequal original custody")
    if trace["stages"] != ["effect_settled", "receipt_settled", "append", "first_ack", "terminal"]:
        raise ValueError("invalid ordering")
    if not trace["original_first_receipt_resolved"]:
        raise ValueError("unresolved first receipt")
    if trace["replay_effect_count"] != 0 or trace["retry_append_count"] != 0:
        raise ValueError("replay/duplicate effect")


    if not trace["current_source_verified"] or not trace["access_allowed"] or not trace["restore_coherent"]:
        raise ValueError("source/access/restore fence")
    if trace["reader_revision"] != "1.0.0" or trace["event_revision"] != "1.0.0":
        raise ValueError("unsupported revision")
    if not trace["reader_enabled"]:
        raise ValueError("reader withdrawn")
    if trace["event_sequence"] > trace["writer_cutoff_sequence"]:
        raise ValueError("past writer cutoff")
    if event_type.endswith((".copied", ".moved", ".renamed", ".exported")):
        if payload["source_path_ref"] == payload["destination_path_ref"]:
            raise ValueError("unchanged path edge")
    action = event_type.split(".")[1]
    expected_semantics = {
        "copied": {"source_unchanged": True, "distinct_result": True},
        "created": {"valid_name": True, "exact_container": True, "new_node": True},
        "deleted": {"mode_matches_original": True, "confirmation_valid": True, "custody_distinct": True},
        "exported": {"source_unchanged": True, "destination_authorized": True, "transfer_complete": True},
        "moved": {"destination_committed": True, "source_removed": True, "identity_preserved": True},
        "renamed": {"valid_name": True, "same_parent": True, "identity_preserved": True},
    }[action]
    if trace["semantic_checks"] != expected_semantics:
        raise ValueError("family semantic boundary")
    if event_type.startswith("folder.") and "descendant_count" in payload:
        if payload["descendant_count"] != trace["original_descendant_count"]:
            raise ValueError("descendant receipt mismatch")
    expected = identity(event_type, payload, trace)
    if tuple(trace["retry_identity"]) != expected:
        raise ValueError("retry identity changed")
    validate_original_models(event_type, payload, trace, operation_candidate=operation_candidate)
    return expected


def main():
    fixtures = json.loads((ROOT / "Plans/filemanager_event_contract_fixtures.json").read_text())
    expected_families = {kind + "." + action for kind in ("file", "folder")
                         for action in ("copied", "created", "deleted", "exported", "moved", "renamed")}
    if (len(fixtures["rows"]) != 12 or
            {r["event_type"] for r in fixtures["rows"]} != expected_families):
        raise AssertionError("incomplete twelve-family fixture set")
    count = 0
    for row in fixtures["rows"]:
        name, payload, trace = row["event_type"], row["payload"], row["trace"]
        validate_case(name, payload, trace)
        count += 1
        for case in row["negative_cases"]:
            p, t = copy.deepcopy(payload), copy.deepcopy(trace)
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
            try:
                validate_case(name, p, t)
            except (ValueError, KeyError, jsonschema.ValidationError) as error:
                if case.get("expected_error") and str(error) != case["expected_error"]:
                    raise AssertionError(name + ": negative masked: " + case["name"]) from error
                count += 1
            else:
                raise AssertionError(name + ": accepted negative " + case["name"])
        for case in row["transition_cases"]:
            args = case["args"]
            validator = validate_operation_transition if case["kind"] == "operation" else validate_control_transition
            try:
                if case.get("proof_source") == "original_trace":
                    validator(*args, proof=terminal_fixture_proof(trace, args[0]))
                else:
                    validator(*args)
            except (ValueError, KeyError, jsonschema.ValidationError):
                if case["valid"]:
                    raise AssertionError(name + ": rejected positive transition " + case["name"])
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
                if case.get("expected_error") and str(error) != case["expected_error"]:
                    raise AssertionError(name + ": boundary negative masked: " + case["name"]) from error
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
    print(json.dumps({"status": "pass", "families": len(fixtures["rows"]),
                      "oracle_cases": count, "native_execution": "NOT_RUN"}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
