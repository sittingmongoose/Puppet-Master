#!/usr/bin/env python3
"""Write the DFM sweep part 2A witnesses (Plans/filemanager_event_p2a_cases.json) from named specs.

Usage: python3 scripts/pm-filemanager-p2a-cases.py [--check]

Each witness starts from its own family's valid fixture row, makes one source change and moves
every copy of it with the checker's fixture constructors (synchronize_fixture, fixture_event,
fixture_copies, recomputed custody keys). A negative is kept only when the complete checker
refuses it at exactly its target row; its expected_error is that refusal's message. Controls must
be accepted. Specs that do not apply to a family (creation, rename) are skipped for it. --check
fails when the file is stale or a witness no longer refuses at its row.
"""
import copy
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
_spec = importlib.util.spec_from_file_location("pm_filemanager_event_contracts", ROOT / "scripts/pm-filemanager-event-contracts.py")
dfm = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = dfm
_spec.loader.exec_module(dfm)

OUT = ROOT / dfm.P2A_CASES
KEY = "filemanager_operation_custody.v1:" + "1" * 64
KEY2 = "filemanager_operation_custody.v1:" + "2" * 64


def control_base(row):
    m = row["trace"]["custody_model"]
    before = copy.deepcopy(m["control_rows"][m["control_key"]])
    before.update(state="active", writer_cutoff_sequence=None, last_admitted_sequence=0, control_revision=1,
                  drain_operation_keys=[], reader_enabled=True)
    after = copy.deepcopy(before)
    after.update(control_revision=2)
    return before, after


def control_api(row, edit_before, edit_after, issued, drain, valid_issued=None, valid_drain=None, valid_edits=None):
    """A control-transition boundary case: an accepting control and one changed fact."""
    before, after = control_base(row)
    vb, va = copy.deepcopy(before), copy.deepcopy(after)
    valid_edits(vb, va)
    nb, na = copy.deepcopy(before), copy.deepcopy(after)
    edit_before(nb)
    edit_after(na)
    return {"scenario": "api", "validator": "validate_control_transition",
            "valid_args": [vb, va, issued if valid_issued is None else valid_issued, drain if valid_drain is None else valid_drain],
            "args": [nb, na, issued, drain]}


def p2a(steps, **extra):
    return dict({"scenario": "p2a", "steps": steps}, **extra)


def family_parts(name):
    kind, action = name.split(".")
    return kind, action, "node" if kind == "file" else "folder"


def subject_entries(row):
    """(accepted, settled) entries of the operation keyed by path_ref."""
    m = row["trace"]["custody_model"]
    op = m["operation_rows"][m["operation_key"]]
    return ({e["path_ref"]: e for e in op["accepted_path_snapshots"]},
            {e["path_ref"]: e for e in op["settlement"]["path_snapshots"]})


def index_of(row, phase_list, path_ref):
    m = row["trace"]["custody_model"]
    op = m["operation_rows"][m["operation_key"]]
    entries = op["accepted_path_snapshots"] if phase_list == "accepted" else op["settlement"]["path_snapshots"]
    return next(i for i, e in enumerate(entries) if e["path_ref"] == path_ref)


def specs(row):
    """(name, target row or None for a control, case) for one family."""
    name = row["event_type"]
    kind, action, noun = family_parts(name)
    p = row["payload"]
    m = row["trace"]["custody_model"]
    event = m["operation_rows"][m["operation_key"]]["complete_event"]
    other_family = "folder.copied" if name != "folder.copied" else "file.copied"
    out = []

    def add(label, target, case):
        out.append((label, target, case))

    # --- complete original EventRecord joins: one event field, then every commitment and copy moved
    for label, target, field, value in (
            ("event-project", "CE03_project", "project_id", "fixture2"),
            ("event-correlation", "CE05_correlation", "correlation_id", "other1"),
            ("event-occurred-at", "CE06_occurred_at", "occurred_at_utc", "2026-11-04T00:00:01Z"),
            ("event-payload-schema", "CE07_payload_schema", "payload_schema_id",
             "pm.file_manager_event." + other_family.replace(".", "_") + ".schema.v1")):
        add(label, target, p2a([["set", "event", [field], value], ["resync_event"], ["copies"]]))
    add("event-application-scope", "CE04_scope_kind",
        p2a([["set", "event", ["scope_kind"], "application"], ["set", "event", ["project_id"], None],
             ["resync_event"], ["copies"]]))
    forged = "evt_" + name.replace(".", "_") + "_" + "0" * 64
    add("event-forged-id", "CE08_identity",
        p2a([["set", "event", ["event_id"], forged], ["set", "operation", ["first_append_receipt", "event_id"], forged],
             ["resync_event"], ["copies"]]))
    # --- producer projection under CV-1100 qualified JCS (numbers)
    add("producer-2^53+1", "QJ01_jcs_binary64",
        p2a([["set", "event", ["producer_sequence_id"], 2 ** 53 + 1], ["resync_event"], ["copies"]]))
    add("producer-2^60", "QJ02_jcs_decimal",
        p2a([["set", "event", ["producer_sequence_id"], 2 ** 60], ["resync_event"], ["copies"]]))
    add("producer-2^53-control", None,
        p2a([["set", "event", ["producer_sequence_id"], 2 ** 53], ["resync_event"], ["copies"]]))
    add("producer-float-redb", "RV01_redb_encodable",
        p2a([["set", "event", ["producer_sequence_id"], 1.0], ["resync_event"], ["copies"]]))
    # --- CV-1100 current integer slot: an integral float the JSON Schema type admits
    add("payload-revision-float", "IS01_integer_type", p2a([["set", "payload", ["path_snapshot_revision"], 0.0],
                                                          ["synchronize"]]))
    add("payload-revision-float-history", "RV01_redb_encodable",
        p2a([["set", "payload", ["path_snapshot_revision"], 0.0], ["synchronize"]], historical=True))
    # --- checkpoint, custody, receipt
    add("checkpoint-extra-field", "CB01_binding_fields", p2a([["set", "model", ["checkpoint_binding", "extra_probe"], "x"]]))
    for label, target, field, value in (
            ("custody-storage", "CU02_storage_instance", "storage_instance_id", "storage2"),
            ("custody-event-id", "CU03_event_id", "event_id", forged),
            ("custody-event-type", "CU05_event_type", "event_type", other_family),
            ("custody-idempotency", "CU06_idempotency_key", "idempotency_key", name + ":" + "0" * 64)):
        add(label, target, p2a([["set", "append", [field], value], ["copies"]]))
    for label, target, field, value in (
            ("receipt-event-id", "IR02_receipt_event_id", "event_id", forged),
            ("receipt-sequence", "IR03_receipt_sequence", "sequence_id", 2),
            ("receipt-ordinary", "IR04_receipt_barrier", "durability_class", "ordinary")):
        add(label, target, p2a([["set", "operation", ["first_append_receipt", field], value],
                                ["set", "append", ["first_append_receipt", field], value],
                                ["set", "model", ["result", "first_append_receipt", field], value], ["copies"]]))
    # --- late physical copies (no copies step: the late copy is the one change)
    add("late-operation-value", "LT04_final_operation_value",
        p2a([["set", "model", ["final_operation_value", "revision"], m["final_operation_value"]["revision"] + 7]]))
    add("late-control-value", "LT05_final_control_value",
        p2a([["set", "model", ["final_control_value", "control_revision"], m["final_control_value"]["control_revision"] + 7]]))
    # --- family control row as read by the retained reader
    add("control-below-sequence", "CX02_sequence_ceiling",
        p2a([["set", "control", ["state"], "active"], ["set", "control", ["writer_cutoff_sequence"], None],
             ["set", "control", ["last_admitted_sequence"], 0], ["copies"]]))
    add("control-other-storage", "CN03_storage_instance",
        p2a([["set", "control", ["storage_instance_id"], "storage2"], ["move_control_key"], ["copies"]]))
    add("control-prepared", "CD01_not_prepared",
        p2a([["set", "control", ["state"], "prepared"], ["set", "control", ["admission_revision"], None],
             ["set", "control", ["last_admitted_sequence"], 0], ["set", "control", ["writer_cutoff_sequence"], None],
             ["set", "control", ["reader_enabled"], False], ["move_control_key"], ["copies"]]))
    # --- operation identity, scope and family (keys and receipt refs recomputed)
    add("operation-receipt-ref", "OK02_receipt_ref",
        p2a([["set", "payload", ["receipt_ref"], "pmref:filemanager_operation:" + "0" * 64], ["synchronize"]]))
    for label, target, field, value in (
            ("operation-other-project", "OS01_project", "project_id", "fixture2"),
            ("operation-other-storage", "OS02_storage_instance", "storage_instance_id", "storage2"),
            ("operation-other-id", "OF02_operation_id", "operation_id", "fixture2")):
        add(label, target, p2a([["set", "operation", [field], value], ["move_operation_key"], ["payload_receipt_ref"],
                                ["synchronize"]]))
    # --- settled original, accepted command, paths
    add("settled-payload-changed", "SO01_settled_payload",
        p2a([["set", "operation", ["settlement", "payload", "evidence_refs"], ["pmref:evidence:other1"]], ["copies"]]))
    for label, target, field, value in (
            ("command-handler", "SC02_handler_target", "handler_target", "handlers::file::other"),
            ("command-correlation", "SC03_correlation", "correlation_id", "other1"),
            ("command-origin", "SC04_origin", "origin", "api" if p["origin"] != "api" else "editor")):
        add(label, target, p2a([["set", "operation", ["accepted_command", field], value], ["copies"]]))
    accepted, settled = subject_entries(row)
    first = next(iter(accepted))
    add("accepted-path-project", "PL01_project",
        p2a([["set", "operation", ["accepted_path_snapshots", index_of(row, "accepted", first), "project_id"], "fixture2"],
             ["copies"]]))
    add("accepted-path-revision", "PL02_revision",
        p2a([["set", "operation", ["accepted_path_snapshots", index_of(row, "accepted", first), "path_snapshot_revision"], 5],
             ["copies"]]))
    extra_index = len(row["trace"]["custody_model"]["operation_rows"][m["operation_key"]]["settlement"]["path_snapshots"])
    add("settled-path-null-node", "PJ03_node_absence",
        p2a([["extra_affected_path"], ["synchronize"],
             ["set", "operation", ["settlement", "path_snapshots", extra_index, "node_ref"], None], ["copies"]]))
    add("extra-affected-path-control", None, p2a([["extra_affected_path"], ["synchronize"]]))
    if action == "created":
        container = next(r for r, e in accepted.items() if e["node_ref"] == p["destination_container_ref"])
        add("creation-no-container", "CC01_container_unique",
            p2a([["set", "payload", ["destination_container_ref"], "pmref:receipt:p2a_missing_container"],
                 ["set", "operation", ["accepted_command", "destination_container_ref"], "pmref:receipt:p2a_missing_container"],
                 ["synchronize"]]))
        add("creation-settled-container-file", "CC04_settled_container_folder",
            p2a([["set", "operation", ["settlement", "path_snapshots", index_of(row, "settled", container), "node_kind"], "file"],
                 ["copies"]]))
        add("creation-destination-kind", "CO03_destination_absent",
            p2a([["set", "operation", ["accepted_path_snapshots", index_of(row, "accepted", p["destination_path_ref"]),
                                       "node_kind"], kind], ["copies"]]))
    if action == "renamed":
        source = accepted[p["source_path_ref"]]["relative_components"]
        steps = [["set", "operation", ["accepted_path_snapshots", index_of(row, "accepted", p["destination_path_ref"]),
                                       "relative_components"], source],
                 ["set", "operation", ["settlement", "path_snapshots", index_of(row, "settled", p["destination_path_ref"]),
                                       "relative_components"], source]]
        add("rename-same-basename", "RN04_new_basename", p2a(steps + [["copies"]]))
    # --- terminal reader route (direct): the exact effect-to-history CAS, one change
    add("terminal-direct-control", None, {"scenario": "p2a-terminal"})
    add("terminal-direct-before-accepted", "OT01_terminal_edge", {"scenario": "p2a-terminal", "set": [["before", ["phase"], "accepted"]]})
    terminal = next(c for c in row["transition_cases"] if c["name"] == "effect-to-history")
    add("terminal-direct-revision-skip", "OT02_terminal_revision",
        {"scenario": "p2a-terminal", "set": [["after", ["revision"], terminal["args"][0]["revision"] + 2]]})
    # --- API boundaries
    add("reference-integer", "PR01_reference_type",
        {"scenario": "api", "validator": "validate_payload_reference",
         "valid_args": ["pm-payload-ref:v1:blake3:" + "0" * 64 + ":1:application/vnd.msgpack"], "args": [123]})
    add("event-body-uint64-overflow", "EV01_integer_range",
        {"scenario": "api", "validator": "event_body", "valid_args": [{"payload": {"v": 1}, "payload_ref": None}, {}],
         "args": [{"payload": {"v": 2 ** 64}, "payload_ref": None}, {}]})
    add("event-body-lone-surrogate", "EV02_event_value_other",
        {"scenario": "api", "validator": "event_body", "valid_args": [{"payload": {"v": "ok"}, "payload_ref": None}, {}],
         "args": [{"payload": {"v": "\ud800"}, "payload_ref": None}, {}]})
    trace = row["trace"]
    context = {k: trace[k] for k in ("storage_instance_id", "recovery_epoch")}
    for label, value in (("non-ascii-latin", "störäge"), ("non-ascii-cjk", "日本語"),
                         ("non-ascii-astral", "\U0001f600"), ("non-ascii-separator", "a b"),
                         ("non-ascii-control", "a\u0001b")):
        add("identity-" + label, None, {"scenario": "api", "validator": "identity", "valid_args": [name, p, context],
                                         "args": [name, p, dict(context, storage_instance_id=value)]})
    add("identity-lone-surrogate", "IT05_rfc8785_preimage",
        {"scenario": "api", "validator": "identity", "valid_args": [name, p, context],
         "args": [name, p, dict(context, storage_instance_id="storage\ud800")]})
    k1, k2 = KEY, KEY2
    add("control-draining-drain-changed", "CA02_issuance_drain", control_api(
        row, lambda b: b.update(state="draining", drain_operation_keys=[k1]),
        lambda a: a.update(state="draining", drain_operation_keys=[k2]), 0, [],
        valid_edits=lambda b, a: (b.update(state="draining", drain_operation_keys=[k1]),
                                  a.update(state="draining", drain_operation_keys=[k1]))))
    add("control-other-family", "CK01_key_unchanged", control_api(
        row, lambda b: None, lambda a: a.update(event_type=other_family), 0, [], valid_edits=lambda b, a: None))
    add("control-issued-negative", "CI02_issued_range", control_api(
        row, lambda b: None, lambda a: None, -1, [], valid_issued=0, valid_edits=lambda b, a: None))
    add("control-issued-behind", "CI04_issued_monotonic", control_api(
        row, lambda b: b.update(last_admitted_sequence=5), lambda a: a.update(last_admitted_sequence=3), 3, [],
        valid_issued=5, valid_edits=lambda b, a: (b.update(last_admitted_sequence=5), a.update(last_admitted_sequence=5))))

    def withdrawn(before_last, before_cutoff, before_reader):
        return (lambda b: b.update(state="withdrawn", last_admitted_sequence=before_last, writer_cutoff_sequence=before_cutoff,
                                   reader_enabled=before_reader),
                lambda a: a.update(state="withdrawn", last_admitted_sequence=2, writer_cutoff_sequence=2, reader_enabled=False))
    valid_withdrawn = lambda b, a: (b.update(state="withdrawn", last_admitted_sequence=2, writer_cutoff_sequence=2, reader_enabled=True),
                                    a.update(state="withdrawn", last_admitted_sequence=2, writer_cutoff_sequence=2, reader_enabled=False))
    for label, target, args in (("control-withdrawn-cutoff-rewritten", "CW01_cutoff_kept", (2, 1, True)),
                                ("control-withdrawn-admitted-rewritten", "CW02_admitted_kept", (1, 2, True)),
                                ("control-withdrawn-reader-before", "CW03_reader_before", (2, 2, False))):
        eb, ea = withdrawn(*args)
        add(label, target, control_api(row, eb, ea, 2, [], valid_issued=2, valid_edits=valid_withdrawn))
    return out


def build():
    fixtures = json.loads((ROOT / "Plans/filemanager_event_contract_fixtures.json").read_text())
    rows, dropped = {}, []
    for row in fixtures["rows"]:
        name = row["event_type"]
        cases = []
        for label, target, spec in specs(row):
            case = dict(json.loads(json.dumps(spec)), name=f"{name}:p2a:{label}", valid=target is None)
            if target is not None:
                case["expected_row"] = target
            try:
                dfm.boundary_case(row, copy.deepcopy(case))
                outcome = None
            except dfm.TableRefusal as error:
                outcome = error
            except Exception as error:  # a builder that cannot reach its row drops the witness and reports why
                dropped.append(dict(case=case["name"], target=target, got="untracked " + type(error).__name__ + ": " + str(error)[:120]))
                continue
            if target is None:
                if outcome is not None:
                    dropped.append(dict(case=case["name"], target=None, got=outcome.row))
                    continue
            else:
                if outcome is None or outcome.row != target:
                    dropped.append(dict(case=case["name"], target=target, got=None if outcome is None else outcome.row))
                    continue
                case["expected_error"] = str(outcome)
                if outcome.schema:
                    case["expected_schema"] = outcome.schema
            cases.append(case)
        rows[name] = cases
    document = {"schema_id": "pm.filemanager_event_p2a_cases.v1", "native_execution": "NOT_RUN",
                "builder": "scripts/pm-filemanager-p2a-cases.py",
                "fixture_sha256": hashlib.sha256((ROOT / "Plans/filemanager_event_contract_fixtures.json").read_bytes()).hexdigest(),
                "rows": rows}
    return document, dropped


def main():
    check = "--check" in sys.argv[1:]
    document, dropped = build()
    text = json.dumps(document, indent=1, sort_keys=True) + "\n"
    stale = not OUT.exists() or OUT.read_text() != text
    if not check:
        OUT.write_text(text)
    total = sum(len(v) for v in document["rows"].values())
    negatives = sum(1 for v in document["rows"].values() for c in v if not c["valid"])
    print(json.dumps({"witnesses": total, "negatives": negatives, "controls": total - negatives,
                      "dropped": dropped, "stale": stale if check else False}, indent=1))
    return 1 if dropped or (check and stale) else 0


if __name__ == "__main__":
    sys.exit(main())
