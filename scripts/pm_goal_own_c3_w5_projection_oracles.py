#!/usr/bin/env python3
"""TEST_ONLY certified projection reference component controls.

Whole original schema and pinned codec checks are representation prerequisites.
They are NOT CF/P complete original source tuples or owner issuance evidence.
No guard-removal engine, original schema rewrite or ambient resolver is used.
"""
from __future__ import annotations

import argparse
import base64
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import struct
import sys

import blake3
from referencing import Resource
from referencing.jsonschema import DRAFT202012

from pm_goal_own_c3_w5_oracles import ROOT, LOCATIONS, OriginalPrecondition
from pm_goal_own_c3_w5_successor_oracles import (
    CONSUMER_URI, DIRECTORY, ScopedInstances, original_pack,
)

D = "Plans/goal_run_projection_reference_contracts/"
URI = "https://puppetmaster.local/schemas/goal_run_projection_reference/certified/1.0.0"
LIMIT = 16384
STORAGE = "11111111-1111-4111-8111-111111111111"


def read(path):
    return json.loads((ROOT / path).read_bytes())


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


class Refused(ValueError):
    pass


def require(value, guard):
    if value is not True:
        raise Refused(guard)


def exact(a, b):
    """No bool/int aliases or representation coercion at a value join."""
    if type(a) is not type(b):
        return False
    if isinstance(a, dict):
        return a.keys() == b.keys() and all(exact(a[k], b[k]) for k in a)
    if isinstance(a, list):
        return len(a) == len(b) and all(exact(x, y) for x, y in zip(a, b))
    if type(a) is float:
        return struct.pack('>d', a) == struct.pack('>d', b)
    return a == b


class ProjectionBank(OriginalPrecondition):
    def __init__(self):
        locations = json.loads(LOCATIONS.read_bytes())["whole_resource_locations"]
        super().__init__("goal_run_certified_consumer_contracts", locations,
                         source_directory=DIRECTORY)
        selection = read(D + "certified.resources.json")
        for key in ("source_package_selection", "original_resource_map", "original_imports", "additional_imports", "successor_resource"):
            member = selection[key]
            require(sha((ROOT / member["path"]).read_bytes()) == member["sha256"], "selection/" + key)
        member = selection["successor_resource"]
        doc = read(member["path"])
        entry = {**member, "json_pointer": ""}
        require(member["retrieval_uri"] not in self.entries["consumer"], "selection/new_uri")
        self.entries["consumer"][member["retrieval_uri"]] = entry
        self.documents["consumer"].append((entry, doc))
        self.registries["consumer"] = self.registries["consumer"].with_resource(
            member["retrieval_uri"], Resource.from_contents(doc, default_specification=DRAFT202012)
        ).crawl()
        self.imports["imports"].extend(read(D + "certified.imports.json")["imports"])
        self.selected_files[member["path"]] = member["sha256"]


def load_codec():
    pack, selected = original_pack()
    spec = importlib.util.spec_from_file_location("w5_projection_original_codec", selected["path"])
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return pack, module.unpack, selected


class PackStore:
    """TEST_ONLY separate byte custody; no native Storage capability claimed."""
    def __init__(self, codec):
        self.pack, self.unpack = codec
        self.objects = {}
        self.read_allowed = True

    def put(self, value):
        raw = self.pack(value)
        identity = blake3.blake3(raw).hexdigest()
        self.objects[identity] = {"bytes": raw, "durable": True, "storage": STORAGE}
        return {"blake3": identity, "byte_size": len(raw), "media_type": "application/msgpack"}

    def describe(self, value):
        raw = self.pack(value)
        return {"blake3": blake3.blake3(raw).hexdigest(), "byte_size": len(raw), "media_type": "application/msgpack"}

    def get(self, reference):
        require(type(reference) is dict and reference.keys() == {"blake3", "byte_size", "media_type"}, "pack/reference_fields")
        require(type(reference["blake3"]) is str and re.fullmatch(r"[0-9a-f]{64}", reference["blake3"]) is not None, "pack/blake3_type")
        require(type(reference["byte_size"]) is int and reference["byte_size"] >= 0, "pack/byte_size_type")
        require(type(reference["media_type"]) is str and reference["media_type"] == "application/msgpack", "pack/media_type")
        require(self.read_allowed is True, "pack/access")
        record = self.objects.get(reference["blake3"])
        require(record is not None, "pack/available")
        require(record["storage"] == STORAGE, "pack/storage")
        require(record["durable"] is True, "pack/durable")
        raw = record["bytes"]
        require(len(raw) == reference["byte_size"], "pack/byte_size")
        require(blake3.blake3(raw).hexdigest() == reference["blake3"], "pack/blake3")
        try:
            value = self.unpack(raw)
        except (ValueError, UnicodeError):
            raise Refused("pack/canonical_decode") from None
        return value


class Representation:
    def __init__(self, bank):
        self.bank = bank
        self.scoped = ScopedInstances(bank)
        self.pack, self.unpack, self.codec = load_codec()
        self.physical = read(D + "certified.physical.json")
        self.store = PackStore((self.pack, self.unpack))

    def validate(self, root, value, *, original=False):
        uri = (CONSUMER_URI if original else URI) + "#/$defs/" + root
        require(not self.scoped.errors("consumer", uri, value), "schema/" + root)

    def commitment(self, event):
        value = {"schema_id": "pm.storage.original_event_value_commitment.v1", "schema_version": "1.0.0",
                 "codec": "pm.seglog_frame_v2.event_value.canonical_msgpack.v1", "domain": "pm.storage.original_event_value_commitment.v1",
                 "event_schema_id": event["schema_id"], "event_schema_version": event["schema_version"]}
        value["sha256"] = sha(self.pack([value["domain"], value["schema_version"], value["codec"],
                                        event["schema_id"], event["schema_version"], event]))
        return value

    @staticmethod
    def key(value):
        require(type(value) is str and bool(value), "key/type")
        return base64.urlsafe_b64encode(value.encode("utf-8", "strict")).rstrip(b"=").decode("ascii")

    def row_key(self, scope):
        return "goal_run_projection.started_cancelled_certified.reference.v1:" + self.key(scope["project_id"]) + ":" + self.key(scope["goal_run_id"])

    def checkpoint_key(self, scope):
        return "goal_run_started_cancelled_certified_checkpoint.reference.v1:" + ":".join(
            self.key(scope[k]) for k in ("storage_instance_id", "project_id", "goal_id", "goal_run_id"))

    @staticmethod
    def identity(record):
        event = record["original_event"]
        return {"storage_instance_id": record["scope"]["storage_instance_id"], "scope": copy.deepcopy(record["scope"]),
                **{k: event[k] for k in ("event_id", "event_type", "sequence_id", "idempotency_key")}}

    def operation(self, row, checkpoint=False):
        return {"table": "checkpoints" if checkpoint else row["dataset_name"], "key": row["physical_key"], "value": row}

    def fits(self, row, checkpoint=False):
        return len(self.pack(row)) <= LIMIT and len(self.pack(self.operation(row, checkpoint))) <= LIMIT

    def encode(self, record, dataset, *, publish_payloads=True):
        self.validate("Projection", record, original=True)
        require(exact(record["original_event_value_commitment"], self.commitment(record["original_event"])), "join/original_commitment")
        row = {"schema_id": self.physical["projection"]["schema_id"], "schema_version": "1.0.0", "storage_instance_id": record["scope"]["storage_instance_id"],
               "physical_key": self.row_key(record["scope"]), "dataset_name": dataset, "event_identity": self.identity(record),
               "original_event_value_commitment": copy.deepcopy(record["original_event_value_commitment"]),
               "content": {"kind": "inline", "record": copy.deepcopy(record)}}
        if not self.fits(row):
            metadata = {k: copy.deepcopy(v) for k, v in record.items() if k != "original_event"}
            prepare = self.store.put if publish_payloads else self.store.describe
            event_ref = prepare(record["original_event"])
            row["content"] = {"kind": "event_reference", "metadata": metadata, "event_ref": event_ref}
            if not self.fits(row):
                row["content"] = {"kind": "record_reference", "metadata_ref": prepare(metadata), "event_ref": event_ref}
        require(self.fits(row), "size/complete_projection_operation")
        self.validate("StorageProjection", row)
        self.validate("ProjectionOperation", self.operation(row))
        return row

    def decode(self, row, expected, dataset):
        self.validate("StorageProjection", row)
        require(self.fits(row), "size/complete_projection_operation")
        content = row["content"]
        if content["kind"] == "inline":
            record = copy.deepcopy(content["record"])
        else:
            metadata = content["metadata"] if content["kind"] == "event_reference" else self.store.get(content["metadata_ref"])
            self.validate("Metadata", metadata)
            event = self.store.get(content["event_ref"])
            self.validate("Event", event)
            record = {**copy.deepcopy(metadata), "original_event": event}
        self.validate("Projection", record, original=True)
        require(exact(record["original_event_value_commitment"], self.commitment(record["original_event"])), "join/original_commitment")
        require(exact(row["original_event_value_commitment"], record["original_event_value_commitment"]), "join/wrapper_commitment")
        require(exact(row["event_identity"], self.identity(record)), "join/event_identity")
        require(exact(row["storage_instance_id"], record["scope"]["storage_instance_id"]), "join/storage")
        require(row["physical_key"] == self.row_key(record["scope"]), "join/physical_key")
        require(row["dataset_name"] == dataset, "join/dataset")
        require(exact(record, expected), "join/complete_original_record")
        canonical = self.encode(record, dataset, publish_payloads=False)
        require(content["kind"] == canonical["content"]["kind"], "representation/first_fitting_form")
        return record

    def encode_checkpoint(self, checkpoint, *, publish_payloads=True):
        self.validate("LogicalCheckpoint", checkpoint)
        require(exact(checkpoint["storage_instance_id"], checkpoint["scope"]["storage_instance_id"]), "checkpoint/storage")
        require(checkpoint["physical_key"] == self.checkpoint_key(checkpoint["scope"]), "checkpoint/key")
        row = {"schema_id": self.physical["checkpoint"]["schema_id"], "schema_version": "1.0.0",
               "storage_instance_id": checkpoint["storage_instance_id"], "physical_key": checkpoint["physical_key"],
               "content": {"kind": "inline", "checkpoint": copy.deepcopy(checkpoint)}}
        if not self.fits(row, True):
            prepare = self.store.put if publish_payloads else self.store.describe
            row["content"] = {"kind": "payload_reference", "reference": prepare(checkpoint)}
        require(self.fits(row, True), "size/complete_checkpoint_operation")
        self.validate("StorageCheckpoint", row)
        self.validate("CheckpointOperation", self.operation(row, True))
        return row

    def decode_checkpoint(self, row, expected):
        self.validate("StorageCheckpoint", row)
        require(self.fits(row, True), "size/complete_checkpoint_operation")
        value = row["content"]["checkpoint"] if row["content"]["kind"] == "inline" else self.store.get(row["content"]["reference"])
        self.validate("LogicalCheckpoint", value)
        require(exact(row["storage_instance_id"], value["storage_instance_id"]), "checkpoint/storage")
        require(row["physical_key"] == value["physical_key"] == self.checkpoint_key(value["scope"]), "checkpoint/key")
        require(exact(value, expected), "checkpoint/complete_logical_value")
        canonical = self.encode_checkpoint(value, publish_payloads=False)
        require(row["content"]["kind"] == canonical["content"]["kind"], "checkpoint/first_fitting_form")
        return value


def profile_integrity(bank):
    """Static full-member and profile DAG qualification, never native birth."""
    selected = read(D + "certified.selection.json")
    source = read(DIRECTORY + "selection.json")
    locations = json.loads(LOCATIONS.read_bytes())["whole_resource_locations"]
    checked, graph = {}, {}

    def visit(path, expected=None, length=None):
        actual = locations.get(path + "@" + expected, path) if expected else path
        raw = (ROOT / actual).read_bytes()
        require(expected is None or sha(raw) == expected, "profile/member_hash")
        require(length is None or len(raw) == length, "profile/member_size")
        key = path + "@" + sha(raw)
        if key in checked:
            return key
        checked[key] = {"path": path, "selected_path": actual, "sha256": sha(raw), "bytes": len(raw)}
        graph[key] = []
        if path.endswith("installed-profile.json"):
            doc = json.loads(raw)
            for member in doc["members"]:
                graph[key].append(visit(member["path"], member["sha256"], member.get("bytes")))
        return key

    for key in ("installed_profile", "source_package_selection", "methods", "resources", "physical", "protocol", "historical_predecessor_physical"):
        member = selected[key]
        visit(member["path"], member["sha256"], member.get("bytes"))
    profile = read(selected["installed_profile"]["path"])
    logical = sha(json.dumps(profile, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode())
    require(logical == selected["installed_profile_logical_sha256"], "profile/logical_digest")
    visit(source["installed_profile"]["path"], source["installed_profile"]["sha256"])
    for member in source["predecessor_members"]:
        visit(member["path"], member["sha256"])
    native_path = "Plans/goal_certified_event_coordinator_contracts/installed-profile.json"
    native = read(native_path)
    visit(native_path)
    native_digest = sha(json.dumps(native, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode())
    require(native_digest == profile["required_original_native_profile_digest"], "profile/native_descriptor")
    visit("Plans/goal_certified_producer_source_contracts/native-v7/installed-profile.json")
    active, done = set(), set()
    def acyclic(key):
        require(key not in active, "profile/cycle")
        if key in done:
            return
        active.add(key)
        for child in graph[key]:
            acyclic(child)
        active.remove(key); done.add(key)
    for key in graph:
        acyclic(key)
    methods = read(D + "certified.methods.json")["methods"]
    prior = read(DIRECTORY + "methods.json")["methods"]
    substitutions = read(D + "certified.definition-adaptations.json")["reference_substitutions"]
    names = {m["method"]: m["method"][:-3] + ".reference.v1" for m in prior}
    require(len(methods) == len(prior) == 12, "profile/method_count")
    for new, old in zip(methods, prior):
        require(new["original_method"] == old["method"], "profile/original_method")
        require([a["name"] for a in new["arguments"]] == [a["name"] for a in old["arguments"]], "profile/complete_arguments")
        require(new["entry_predicates"] == old["entry_predicates"] and new["final_post_all_helpers_predicates"] == old["final_post_all_helpers_predicates"], "profile/original_predicates")
        require(new["source_package_selection"] == old["source_package_selection"], "profile/source_selection")
        require(new["projection_selection"]["installed_profile_selection"] == D + "certified.selection.json", "profile/explicit_edition")
        expected = copy.deepcopy(old)
        expected["method"] = names[old["method"]]
        expected["lower_calls"] = [names.get(n, n) for n in old.get("lower_calls", [])]
        for arg in expected["arguments"]:
            arg["schema_ref"] = substitutions.get(arg["schema_ref"], arg["schema_ref"])
        for variant in expected["return_variants"]:
            for result in variant["results"]:
                result["schema_ref"] = substitutions.get(result["schema_ref"], result["schema_ref"])
        actual = {k: v for k, v in new.items() if k not in ("original_method", "projection_selection", "representation_adapter")}
        require(exact(actual, expected), "profile/whole_method_adaptation")
    return {"qualification": "STATIC_MEMBER_HASH_AND_PROFILE_DAG_ONLY_NO_NATIVE_BIRTH_OR_FULL_CF04_TUPLE",
            "members": list(checked.values()), "profile_dependency_graph": graph,
            "logical_profile_sha256": logical, "native_descriptor_logical_sha256": native_digest,
            "methods_explicitly_selected": len(methods), "original_method_arguments": sum(len(m["arguments"]) for m in prior)}


def fixture(rep):
    """Inherited TEST_ONLY shape, repaired only for this component's joins.

    No issued native/producer/Standard/coordinator source is asserted by it.
    """
    record = read(DIRECTORY + "size-precondition.fixture.json")["storage_projection"]["record"]
    def storage(v):
        if isinstance(v, dict):
            return {k: STORAGE if k == "storage_instance_id" else storage(x) for k, x in v.items()}
        if isinstance(v, list):
            return [storage(x) for x in v]
        return v
    record = storage(record)
    record["original_event_value_commitment"] = rep.commitment(record["original_event"])
    rep.validate("Projection", record, original=True)
    return record


def component_cases(rep):
    rows, guards, sizes = [], {}, {}
    def case(name, call, negative=None):
        try:
            result = call()
        except Refused as error:
            require(negative is not None and str(error) == negative, "oracle/unexpected_refusal:" + name + ":" + str(error))
            guards.setdefault(negative, []).append(name)
            rows.append({"id": name, "expected": "REFUSE", "guard": str(error), "status": "PASS"})
            return None
        require(negative is None, "oracle/negative_accepted:" + name)
        rows.append({"id": name, "expected": "ACCEPT", "status": "PASS"})
        return result

    record = fixture(rep)
    dataset = rep.physical["projection"]["table"].replace("<generation_id>", "grsccg_" + "1" * 64)
    records = {"event_reference": record, "inline": copy.deepcopy(record), "record_reference": copy.deepcopy(record)}
    records["inline"]["original_event"]["payload"]["evidence_refs"] = []
    records["inline"]["original_event_value_commitment"] = rep.commitment(records["inline"]["original_event"])
    selector = records["record_reference"]["original_native_result"]
    selector["physical_key"] = "TEST_ONLY:" + "s" * 20000
    for form, value in records.items():
        row = case("REP-" + form, lambda: rep.encode(value, dataset))
        require(row["content"]["kind"] == form, "oracle/wrong_form")
        case("ROUNDTRIP-" + form, lambda: rep.decode(row, value, dataset))
        sizes[form] = {"logical_record": len(rep.pack(value)), "event": len(rep.pack(value["original_event"])),
                       "whole_stored_row": len(rep.pack(row)), "whole_operation": len(rep.pack(rep.operation(row)))}

    # Every row-level negative starts from a valid complete representation.
    valid = rep.encode(record, dataset)
    for field, other, guard in [
        ("physical_key", valid["physical_key"] + "x", "join/physical_key"),
        ("dataset_name", dataset + "x", "join/dataset"),
        ("storage_instance_id", "22222222-2222-4222-8222-222222222222", "join/storage"),
    ]:
        changed = copy.deepcopy(valid); changed[field] = other
        case("ROW-" + field, lambda changed=changed: rep.decode(changed, record, dataset), guard)
    for field, other in [("event_id", "TEST_ONLY:substituted"), ("event_type", "goal_run.started"), ("sequence_id", 2), ("idempotency_key", "TEST_ONLY:substituted")]:
        changed = copy.deepcopy(valid); changed["event_identity"][field] = other
        case("IDENTITY-" + field, lambda changed=changed: rep.decode(changed, record, dataset), "join/event_identity")
    changed = copy.deepcopy(valid); changed["original_event_value_commitment"]["sha256"] = "f" * 64
    case("ROW-COMMITMENT", lambda: rep.decode(changed, record, dataset), "join/wrapper_commitment")
    changed = copy.deepcopy(valid)
    changed["content"]["metadata"]["original_native_result"]["physical_key"] += "x"
    case("WHOLE-RECORD", lambda: rep.decode(changed, record, dataset), "join/complete_original_record")
    # Alternate representation carries the same exact record and valid payloads.
    changed = rep.encode(records["inline"], dataset)
    metadata = {k: copy.deepcopy(v) for k, v in records["inline"].items() if k != "original_event"}
    changed["content"] = {"kind": "event_reference", "metadata": metadata, "event_ref": rep.store.put(records["inline"]["original_event"])}
    case("NONDETERMINISTIC-FORM", lambda: rep.decode(changed, records["inline"], dataset), "representation/first_fitting_form")
    # Coherent changed metadata and comparison source: only the original commitment is wrong.
    bad = copy.deepcopy(record); bad["original_event_value_commitment"]["sha256"] = "f" * 64
    case("ORIGINAL-COMMITMENT", lambda: rep.encode(bad, dataset), "join/original_commitment")

    reference = valid["content"]["event_ref"]
    for field, other, guard in [("byte_size", reference["byte_size"] + 1, "pack/byte_size"),
                                ("media_type", "application/json", "pack/media_type"),
                                ("blake3", "f" * 64, "pack/available")]:
        changed = copy.deepcopy(reference); changed[field] = other
        case("PACK-" + field, lambda changed=changed: rep.store.get(changed), guard)
    for other in [True, "1", None, [], {}]:
        changed = copy.deepcopy(reference); changed["byte_size"] = other
        case("PACK-SIZE-TYPE-" + type(other).__name__, lambda changed=changed: rep.store.get(changed), "pack/byte_size_type")
    for field, other, guard in [("durable", False, "pack/durable"), ("storage", "TEST_ONLY:other-store", "pack/storage")]:
        member = rep.store.objects[reference["blake3"]]; before = member[field]; member[field] = other
        try:
            case("PACK-CUSTODY-" + field, lambda: rep.store.get(reference), guard)
        finally:
            member[field] = before
    rep.store.read_allowed = False
    try:
        case("PACK-ACCESS", lambda: rep.store.get(reference), "pack/access")
    finally:
        rep.store.read_allowed = True
    member = rep.store.objects[reference["blake3"]]; raw = member["bytes"]
    member["bytes"] = bytes([raw[0] ^ 1]) + raw[1:]
    try:
        case("PACK-CORRUPT", lambda: rep.store.get(reference), "pack/blake3")
    finally:
        member["bytes"] = raw
    # Hash/size coherent around noncanonical bytes; only decoder refusal remains.
    trailing = raw + b"\xc0"; identity = blake3.blake3(trailing).hexdigest()
    rep.store.objects[identity] = {"bytes": trailing, "durable": True, "storage": STORAGE}
    case("PACK-TRAILING", lambda: rep.store.get({"blake3": identity, "byte_size": len(trailing), "media_type": "application/msgpack"}), "pack/canonical_decode")

    # Operation overhead is measured even if the value itself fits.
    small = records["inline"]
    overhead = copy.deepcopy(small)
    inline = rep.encode(small, dataset)
    padding = LIMIT - len(rep.pack(inline)) - 16
    overhead["original_native_result"]["physical_key"] += "x" * padding
    inline["content"]["record"] = overhead
    require(len(rep.pack(inline)) <= LIMIT < len(rep.pack(rep.operation(inline))), "oracle/operation_boundary")
    fallback = case("OPERATION-OVERHEAD-FALLBACK", lambda: rep.encode(overhead, dataset))
    sizes["operation_overhead_boundary"] = {"inline_value": len(rep.pack(inline)), "inline_operation": len(rep.pack(rep.operation(inline))),
                                            "selected_value": len(rep.pack(fallback)), "selected_operation": len(rep.pack(rep.operation(fallback)))}
    require(fallback["content"]["kind"] != "inline", "oracle/operation_limit_skipped")
    case("OPERATION-COMPACT-OVERFLOW", lambda: rep.encode(small, "x" * LIMIT), "size/complete_projection_operation")

    scope = record["scope"]
    checkpoint = {"schema_id": "pm.goal_run_started_cancelled_certified_checkpoint.reference.v1", "schema_version": "1.0.0", "storage_instance_id": STORAGE,
                  "scope": scope, "physical_key": rep.checkpoint_key(scope), "current_generation_id": None, "generations": {}, "root_revision": 0, "last_transaction_id": "TEST_ONLY:transaction"}
    for label, transaction in [("inline", "TEST_ONLY:transaction"), ("payload_reference", "TEST_ONLY:" + "t" * 20000)]:
        value = {**copy.deepcopy(checkpoint), "last_transaction_id": transaction}
        row = case("CHECKPOINT-" + label, lambda value=value: rep.encode_checkpoint(value))
        require(row["content"]["kind"] == label, "oracle/checkpoint_form")
        case("CHECKPOINT-ROUNDTRIP-" + label, lambda row=row, value=value: rep.decode_checkpoint(row, value))
        sizes["checkpoint_" + label] = {"logical_checkpoint": len(rep.pack(value)), "whole_stored_row": len(rep.pack(row)), "whole_operation": len(rep.pack(rep.operation(row, True)))}
    wide_scope = {**scope, "project_id": "x" * LIMIT}
    case("CHECKPOINT-OPERATION-OVERFLOW", lambda: rep.encode_checkpoint({**checkpoint, "scope": wide_scope, "physical_key": rep.checkpoint_key(wide_scope)}), "size/complete_checkpoint_operation")
    case("CHECKPOINT-KEY", lambda: rep.encode_checkpoint({**checkpoint, "physical_key": checkpoint["physical_key"] + "x"}), "checkpoint/key")
    case("CHECKPOINT-STORAGE", lambda: rep.encode_checkpoint({**checkpoint, "storage_instance_id": "22222222-2222-4222-8222-222222222222"}), "checkpoint/storage")
    changed_checkpoint = rep.encode_checkpoint(checkpoint)
    changed_checkpoint["content"]["checkpoint"]["root_revision"] = 1
    case("CHECKPOINT-WHOLE", lambda: rep.decode_checkpoint(changed_checkpoint, checkpoint), "checkpoint/complete_logical_value")
    changed_checkpoint = rep.encode_checkpoint(checkpoint)
    changed_checkpoint["content"] = {"kind": "payload_reference", "reference": rep.store.put(checkpoint)}
    case("CHECKPOINT-NONDETERMINISTIC-FORM", lambda: rep.decode_checkpoint(changed_checkpoint, checkpoint), "checkpoint/first_fitting_form")
    # Returning decode calls are passive even while recomputing deterministic form.
    before = copy.deepcopy(rep.store.objects)
    case("PASSIVE-DECODE", lambda: rep.decode(valid, record, dataset))
    require(exact(before, rep.store.objects), "oracle/passive_store_changed")
    require(rep.key("é") != rep.key("e\u0301"), "oracle/normalization")
    case("KEY-UNICODE", lambda: rep.row_key({**scope, "project_id": "é🚀"}))
    case("KEY-WRONG-TYPE", lambda: rep.key(True), "key/type")
    # These are whole-root schema seams, not full semantic source tuples. Keep
    # their actual predicate coordinates for the shared isolation inventory.
    schema_cases = []
    baselines = {
        "PayloadRef": reference, "EventIdentity": valid["event_identity"],
        "StorageProjection": valid, "LogicalCheckpoint": checkpoint,
        "StorageCheckpoint": rep.encode_checkpoint(checkpoint),
        "ProjectionOperation": rep.operation(valid),
        "CheckpointOperation": rep.operation(rep.encode_checkpoint(checkpoint), True),
    }
    for root, baseline in baselines.items():
        require(not rep.scoped.errors("consumer", URI + "#/$defs/" + root, baseline), "oracle/schema_baseline")
        mutations = []
        for field in baseline:
            for mutation in ("missing", "wrong_type"):
                candidate = copy.deepcopy(baseline)
                if mutation == "missing":
                    del candidate[field]
                else:
                    candidate[field] = [] if type(candidate[field]) is not list else {}
                mutations.append((field, mutation, candidate))
        candidate = copy.deepcopy(baseline)
        candidate["TEST_ONLY_unexpected_extension"] = True
        mutations.append(("TEST_ONLY_unexpected_extension", "extension", candidate))
        for field in ("storage_instance_id", "blake3"):
            if field in baseline and root != "LogicalCheckpoint":
                candidate = copy.deepcopy(baseline)
                candidate[field] += "\n"
                mutations.append((field, "trailing_LF", candidate))
        for field, mutation, candidate in mutations:
            errors = rep.scoped.errors("consumer", URI + "#/$defs/" + root, candidate)
            require(bool(errors), "oracle/schema_negative_accepted")
            schema_cases.append({"id": "SCHEMA-" + root + "-" + field + "-" + mutation,
                                 "root": URI + "#/$defs/" + root, "mutation_field": field,
                                 "expected": "REFUSE", "status": "PASS",
                                 "errors": [{"instance_path": list(e.absolute_path), "schema_path": list(e.absolute_schema_path), "keyword": e.validator} for e in errors]})
    return {"qualification": "TEST_ONLY_REPRESENTATION_COMPONENT_ONLY_NO_ORIGINAL_ISSUANCE_OR_CF_P_SEMANTIC_TUPLES",
            "cases": rows, "positives": sum(r["expected"] == "ACCEPT" for r in rows), "negatives": sum(r["expected"] == "REFUSE" for r in rows),
            "guard_negative_inventory": guards, "schema_seam_negatives": schema_cases,
            "schema_seam_positive_roots": list(baselines),
            "sizes": sizes, "codec": rep.codec}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    bank = ProjectionBank()
    qualification = bank.run()
    require(not qualification["unresolved_occurrences"], "bank/eager_references")
    rep = Representation(bank)
    controls = component_cases(rep)
    report = {"status": "PASS", "native_execution": "NOT_RUN", "whole_suite_closure": "NOT_COMPLETE",
              "complete_path_positives": 0, "complete_path_negatives": 0,
              "bank": qualification, "profile_integrity": profile_integrity(bank), "representation_controls": controls}
    args.output.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"status": report["status"], "component_positives": controls["positives"], "component_negatives": controls["negatives"],
                      "complete_path_positives": 0, "complete_path_negatives": 0, "whole_suite_closure": report["whole_suite_closure"]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
