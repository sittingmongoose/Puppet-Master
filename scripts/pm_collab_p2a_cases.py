"""DC sweep part 2A witnesses: one single-defect negative for every guard-table row the earlier
witnesses never reached alone (scripts/pm_collaboration_events.py contract_probes and
integrity_cases call these). Each starts from a named valid parent of its own family and changes
one fact; every copy, digest, key and captured control that observes that fact is changed with it,
so the negative is refused by exactly its own row. Expected codes are the legacy first-refusal
codes; the refusing row is checked by scripts/pm_collab_guard_suites.py and the gated tool.
"""
import copy

FOREIGN_INSTANCE = "00000000-0000-4000-8000-000000000000"


def probes(dc, root):
    fx = dc.load(dc.FIXTURE_PATH, root)
    siid, epoch = fx["storage_context"]["storage_instance_id"], fx["storage_context"]["recovery_epoch"]
    out = []

    def add(domain, name, value, expected, **kw):
        out.append(dict(domain=domain, case_id="p2a:" + name, value=copy.deepcopy(value), expected=expected, **copy.deepcopy(kw)))

    def prepared(c, name, expected):
        add("prepared", c["case_id"] + ":" + name, c["event"], expected, source_case=copy.deepcopy(c), payload_store=copy.deepcopy(c.get("payload_store", {})))

    # Payload layer 1: a non-object payload (PO01).
    for i, value in enumerate([[], "payload", None, 1]):
        et = dc.EVENT_TYPES[i]
        add("payload", "payload_object:" + str(i), value, "schema", event_type=et)
    # Retained history: a non-object control (HI01) and a negative original write epoch (HI07).
    for i, c in enumerate(fx["valid_events"]):
        context = dict(storage_instance_id=siid, write_epoch=epoch, withdrawn=False, retained=True, original_record=copy.deepcopy(c["record"]))
        add("historical", c["case_id"] + ":context_type", c["record"], "historical_withdrawn", event_type=c["event_type"],
            context=[None, [], "context", 0, [context]][i % 5])
        bad = dict(context, write_epoch=-1)
        add("historical", c["case_id"] + ":negative_write_epoch", c["record"], "historical_epoch_type", event_type=c["event_type"], context=bad)
    # Checkpoint: each instance copy, the cursor end, every cursor join and the last-event scope joins.
    for c in fx["projection_values"]:
        if c["definition"] != "checkpoint":
            continue
        v, ctx = c["value"], fx["checkpoint_contexts"][c["case_id"]]
        name = c["case_id"]
        bad = copy.deepcopy(v); bad["index_read_token"]["storage_instance_id"] = FOREIGN_INSTANCE
        add("checkpoint", name + ":token_instance", bad, "checkpoint_instance", context=ctx)
        bad = copy.deepcopy(v); bad["index_read_token"]["source_selection"]["storage_instance_id"] = FOREIGN_INSTANCE
        add("checkpoint", name + ":selection_instance", bad, "checkpoint_instance", context=ctx)
        changed = copy.deepcopy(ctx); changed["index_read_token"]["storage_instance_id"] = FOREIGN_INSTANCE
        add("checkpoint", name + ":context_token_instance", v, "checkpoint_instance", context=changed)
        changed = copy.deepcopy(ctx); changed["index_read_token"]["source_selection"]["storage_instance_id"] = FOREIGN_INSTANCE
        add("checkpoint", name + ":context_selection_instance", v, "checkpoint_instance", context=changed)
        if not v["source_cursor"]:
            continue
        def both(field, new):
            bad = copy.deepcopy(v); changed = copy.deepcopy(ctx)
            bad["source_cursor"][field] = new; changed["source_cursor"][field] = new
            return bad, changed
        bad, changed = both("last_sequence_id", v["source_cursor"]["last_sequence_id"] + 1)
        add("checkpoint", name + ":cursor_end", bad, "checkpoint_coverage", context=changed)
        bad = copy.deepcopy(v); bad["source_cursor"]["byte_offset"] -= 1
        add("checkpoint", name + ":cursor_context", bad, "checkpoint_cursor", context=ctx)
        bad, changed = both("segment_generation", v["source_cursor"]["segment_generation"] + 1)
        add("checkpoint", name + ":cursor_generation", bad, "checkpoint_cursor", context=changed)
        bad, changed = both("frame_end_offset", v["source_cursor"]["byte_offset"])
        add("checkpoint", name + ":cursor_frame", bad, "checkpoint_cursor", context=changed)
        changed = copy.deepcopy(ctx); changed["last_event"]["sequence_id"] += 1
        add("checkpoint", name + ":cursor_sequence", v, "checkpoint_cursor", context=changed)
        changed = copy.deepcopy(ctx); changed["last_event"]["scope_kind"] = "application" if v["scope_kind"] == "project" else "project"
        add("checkpoint", name + ":event_scope", v, "checkpoint_event", context=changed)
        changed = copy.deepcopy(ctx); changed["last_event"]["project_id"] = "proj_other_checkpoint"
        add("checkpoint", name + ":event_project", v, "checkpoint_event", context=changed)
    # Prepared source custody.
    first = fx["prepared_sources"][0]
    add("source", "source_object", [], "source_schema", physical_key=first["physical_key"], source_context=first["source_context"])
    renamed = {"run_id", "slot_id", "review_run_id", "revision"}
    for original in fx["prepared_sources"]:
        v = original["value"]; p = v["semantic_body"]; record = v["owner_record"]; et = v["event_type"]
        for field in sorted(renamed & set(record)):
            if dc.SOURCE_JOINS[field] not in p:
                continue
            c = copy.deepcopy(original); old = record[field]
            c["value"]["owner_record"][field] = old + 1 if type(old) is int else old + "x"
            prepared(dc.refresh_prepared(c, True), "renamed_join:" + field, "source_record_identity")
        if et in ("collaboration.cancelled", "collaboration.completed", "collaboration.failed"):
            c = copy.deepcopy(original); c["value"]["owner_record"]["completed_at"] = "2026-11-04T23:59:59Z"
            prepared(dc.refresh_prepared(c, True), "terminal_time", "source_record_state")
        if et == "collaboration.participant_completed" and p["outcome"] == "explicitly_waived":
            c = copy.deepcopy(original); c["source_context"]["waiver_actor_identity"] = "user:other_waiver_actor"
            prepared(c, "waiver_actor", "source_waiver")
            c = copy.deepcopy(original); c["source_context"]["waiver_actor_ref"] = "user:other_waiver_actor_ref"
            prepared(c, "waiver_actor_ref", "source_waiver")
        if "participant_identity" in v:
            c = copy.deepcopy(original)
            c["value"]["participant_identity"]["participant_slot_id"] += "x"; c["source_context"]["participant_identity"]["participant_slot_id"] += "x"
            prepared(c, "identity_slot", "source_participant_identity")
            c = copy.deepcopy(original); c["source_context"]["participant_identity"]["participant_id"] += "x"
            prepared(c, "identity_context", "source_participant_identity")
        if "review_target_pack" in v:
            c = copy.deepcopy(original)
            c["value"]["review_target_pack"]["review_run_id"] += "x"; c["source_context"]["review_target_pack"]["review_run_id"] += "x"
            prepared(c, "pack_run", "source_review_pack")
            c = copy.deepcopy(original); c["source_context"]["review_target_pack"]["review_run_id"] += "x"
            prepared(c, "pack_context", "source_review_pack")
        required = [s for s in v["slot_requirements"] if s["required"]]
        if required:
            c = copy.deepcopy(original); c["value"]["slot_requirements"].append({"slot_id": required[0]["slot_id"], "required": False})
            prepared(c, "duplicate_slot", "source_slot_roster")
        if "participant_specs" in record:
            c = copy.deepcopy(original); specs = c["value"]["owner_record"]["participant_specs"]
            twin = copy.deepcopy(specs[0]); twin["requested_model_id"] += "_twin"
            specs.append(twin)
            prepared(dc.refresh_prepared(c, True), "duplicate_record_slot", "source_slot_roster")
            c = copy.deepcopy(original); c["value"]["owner_record"]["participant_specs"].reverse()
            prepared(dc.refresh_prepared(c, True), "record_roster_order", "source_slot_roster")
        if et in ("review.finding_added", "review.finding_dispositioned"):
            c = copy.deepcopy(original); c["source_context"]["review_target_hashes"] = ["e" * 64]
            prepared(c, "review_targets", "source_review_targets")
            c = copy.deepcopy(original); c["source_context"]["reviewer_ids"] = "reviewers"
            prepared(c, "reviewer_control", "source_review_targets")
        if et == "review.finding_dispositioned":
            c = copy.deepcopy(original); votes = c["value"]["owner_record"]["reviewer_votes"]
            twin = copy.deepcopy(votes[0]); twin["target_hash"] = p["target_hashes"][-1]
            twin["disposition"] = "uncertain" if twin["disposition"] != "uncertain" else "rejected"; votes.append(twin)
            prepared(dc.refresh_prepared(c, True), "duplicate_vote", "source_review_counts")
        if "application_wrapper" in original:
            c = copy.deepcopy(original); c["application_wrapper"]["storage_instance_id"] = FOREIGN_INSTANCE
            prepared(c, "wrapper_instance", "application_wrapper_identity")
            c = copy.deepcopy(original); c["application_wrapper"]["scope"]["server_id"] += "x"
            prepared(c, "wrapper_scope:server_id", "application_wrapper_identity")
    # Transition admission: valid isolated counterparts with one changed fact of payload or pre-state.
    def counterpart(case_id):
        c = next(t for t in fx["transition_cases"] if t["case_id"] == case_id)
        return c["event_type"], copy.deepcopy(c["valid_value"]), dc.thaw_prestate(c["valid_prestate"])

    def transition(name, et, value, state, expected):
        add("transition", "transition:" + name, value, expected, event_type=et, prestate=state)

    et, value, state = counterpart("isolated:family_not_admitted_quarantined:1:no_definition")
    value["definition_revision"] = 99
    transition("started_unrecorded_revision", et, value, state, "conflict:definition_not_recorded")
    et, value, state = counterpart("isolated:family_not_admitted_quarantined:1:no_definition")
    value["kind"] = "review"
    transition("started_definition_kind", et, value, state, "conflict:lineage_mismatch")
    et, value, state = counterpart("isolated:family_not_admitted_quarantined:4:no_run")
    value["kind"] = "review"
    transition("run_kind", et, value, state, "conflict:lineage_mismatch")
    et, value, state = counterpart("isolated:family_not_admitted_quarantined:4:no_run")
    value["collaboration_id"] += "_other"
    transition("run_collaboration", et, value, state, "conflict:lineage_mismatch")
    et, value, state = counterpart("definition_revisions_and_rerun:5")
    state["defs"][(dc.scope_partition(value), value["collaboration_id"])]["latest"] += 5
    transition("latest_revision", et, value, state, "conflict:stale_definition_revision")
    et, value, state = counterpart("completion_output_identity_brainstorm")
    state["runs"][(dc.scope_partition(value), value["collaboration_run_id"])]["synthesized"] = False
    transition("brainstorm_unsynthesized", et, value, state, "conflict:missing_output")
    et, value, state = counterpart("attempt_identity_rules:4")
    state["runs"][(dc.scope_partition(value), value["collaboration_run_id"])]["removed"].add(value["participant_slot_id"])
    transition("slot_removed", et, value, state, "conflict:slot_not_in_roster")
    for field, new in (("slot", "other_slot"), ("rev", None)):
        et, value, state = counterpart("attempt_identity_rules:7")
        attempt = state["runs"][(dc.scope_partition(value), value["collaboration_run_id"])]["attempts"][value["attempt_id"]]
        attempt[field] = new if new is not None else attempt[field] + 7
        transition("completion_attempt_" + field, et, value, state, "conflict:unknown_attempt")
    et, value, state = counterpart("isolated:crew_lifecycle_to_completed:4:missing_attempt")
    state["runs"][(dc.scope_partition(value), value["collaboration_run_id"])]["attempts"][value["attempt_id"]]["slot"] = "other_slot"
    transition("message_attempt_slot", et, value, state, "conflict:unknown_attempt")
    et, value, state = counterpart("brainstorm_proposals_votes_synthesis:2")
    state["runs"][(dc.scope_partition(value), value["collaboration_run_id"])]["attempts"][value["attempt_id"]]["slot"] = "other_slot"
    transition("proposal_attempt_slot", et, value, state, "conflict:unknown_attempt")
    et, value, state = counterpart("brainstorm_proposals_votes_synthesis:10")
    state["runs"][(dc.scope_partition(value), value["collaboration_run_id"])]["slots"][value["participant_slot_id"]]["current_attempt"] = "other_attempt"
    transition("vote_superseded_attempt", et, value, state, "conflict:attempt_not_current")
    et, value, state = counterpart("review_partial_then_accepted:22")
    value["completed_reviewer_count"] = value["requested_reviewer_count"] - 1
    value["partial_coverage_accepted"] = False
    transition("partial_not_accepted", et, value, state, "conflict:partial_not_accepted")
    return out


def integrity_cases(dc, root):
    """One defect per integrity row the earlier integrity cases did not reach alone."""
    cases = []

    def case(target, check, path, patch, label, support=None):
        value = copy.deepcopy(dc.load(path, root)); patch(value)
        overrides = {path: value}
        if support:
            support(overrides)
        cases.append(dict(case_id="integrity:p2a:" + check + ":" + label, target=target, expected=check, overrides=overrides))

    def family(d, name):
        return next(r for r in d["families"] if r["family_id"] == name)

    def setter(name, *keys, value):
        def patch(d):
            node = family(d, name)
            for k in keys[:-1]:
                node = node[k]
            node[keys[-1]] = value
        return patch
    run = "collaboration_run_projection"
    for field, new in (("key_shape", "unknown"), ("owner_doc", "Plans/storage-plan.md#SP-461"), ("producer", ["OtherProjector"]),
                       ("retention_policy_ref", "RP-OTHER"), ("value_schema_ref", "Plans/other.schema.json"), ("value_schema", {}),
                       ("schema_version", "9.9.9"), ("value_schema_id", "pm.other.v1")):
        case("physical_binding_failures", "physical_binding", dc.SVR_PATH, setter(run, field, value=new), field)
    case("physical_binding_failures", "physical_binding", dc.SVR_PATH, lambda d: d["families"].remove(family(d, run)), "absent")
    case("physical_binding_failures", "physical_recovery", dc.SVR_PATH, setter(run, "recovery_disposition", "authority_class", value="canonical_non_rebuildable"), "authority_class")
    source = "collaboration_prepared_source"
    for field, keys, new in (("value_schema_ref", ("value_schema_ref",), "Plans/other.schema.json"), ("encoding", ("encoding",), "json"),
                             ("backup_required", ("recovery_disposition", "backup_required"), False), ("value_schema", ("value_schema",), {}),
                             ("value_schema_id", ("value_schema_id",), "pm.other.v1"), ("key_shape", ("key_shape",), "unknown"),
                             ("retention_policy_ref", ("retention_policy_ref",), "RP-OTHER"),
                             ("authority_class", ("recovery_disposition", "authority_class"), "derived_rebuildable")):
        case("physical_binding_failures", "source_physical_binding", dc.SVR_PATH, setter(source, *keys, value=new), field)
    case("physical_binding_failures", "source_physical_binding", dc.SVR_PATH, lambda d: d["families"].remove(family(d, source)), "absent")
    binding = lambda d: d["x-pm-event-authority-binding"]
    case("projection_schema_failures", "binding_source", dc.PROJECTION_PATH, lambda d: binding(d)["families"][0].__setitem__("prepared_source_family_id", "other_source"), "family_id")
    case("projection_schema_failures", "binding_source", dc.PROJECTION_PATH, lambda d: binding(d)["families"][0].__setitem__("source_owner_schemas", {}), "owner_schemas")
    case("projection_schema_failures", "binding_adoptions", dc.PROJECTION_PATH, lambda d: binding(d)["checkpoint"].__setitem__("adopts", "SP-000"), "checkpoint")

    def rehash(overrides):
        for r in overrides[dc.LEDGER_PATH]["rows"]:
            r["registry_row_sha256"] = dc.row_sha256(r["registry_row"])

    def row(check, patch, label):
        case("ledger_failures", check, dc.LEDGER_PATH, lambda d: patch(d["rows"][0]), label, rehash)

    def family_id(r):
        r["family_id"] = "event-family-other-family"; r["registry_row"]["family_id"] = "event-family-other-family"
    row("row_identity", lambda r: r["registry_row"].__setitem__("event_type", "collaboration.started"), "row_event_type")
    row("row_identity", family_id, "family_id_form")
    row("owner_anchors", lambda r: r["registry_row"].__setitem__("payload_owner_doc", "Plans/Contracts_V0.md#CV-462"), "payload_anchor")
    row("payload_schema_ref_resolves", lambda r: r["registry_row"]["payload_schema_ref"].__setitem__("path", "Plans/other.schema.json"), "path")
    row("payload_schema_ref_resolves", lambda r: r["registry_row"]["payload_schema_ref"].__setitem__("json_pointer", "#/$defs/absent"), "def")
    row("scope_editions", lambda r: r["registry_row"].__setitem__("scope_policy", "project_only"), "scope_policy")
    token = dc.TOKEN[dc.EVENT_TYPES[0]]
    case("payload_schema_failures", "payload_closed", dc.PAYLOAD_PATH, lambda d: d["$defs"][token].__setitem__("type", "array"), "type")
    fx = dc.load(dc.FIXTURE_PATH, root)
    used = {c["payload_case_id"] for c in fx["valid_events"]}
    unused = next(i for i, c in enumerate(fx["payloads"]) if c["case_id"] not in used)
    numeric = next(i for i, c in enumerate(fx["numeric_family_cases"]) if "alternate_payload" in c and "epoch_raw_json" not in c)

    def numeric_invalid(f):
        for side in ("payload", "alternate_payload"):
            f["numeric_family_cases"][numeric][side]["currentness_hash"] = "not-a-digest"
    fixture = [
        ("numeric_identity", numeric_invalid, "alternate_invalid"),
        ("positive_payload", lambda f: f["payloads"][unused].__setitem__("edition", "application" if f["payloads"][unused]["edition"] == "project" else "project"), "edition"),
    ]
    first = fx["valid_events"][0]
    other = next(c["case_id"] for c in fx["payloads"] if c["event_type"] == first["event_type"] and c["edition"] == first["record"]["scope_kind"]
                 and c["case_id"] != first["payload_case_id"] and dc.canonical(c["payload"]) != dc.canonical(first["record"]["payload"]))
    fixture.append(("valid_event", lambda f: f["valid_events"][0].__setitem__("payload_case_id", other), "payload_case"))
    vector = next(i for i, v in enumerate(fx["identity_vectors"]) if v["edition"] == "application")
    fixture.append(("identity_vector", lambda f: f["identity_vectors"][vector].__setitem__("scope_partition", "app_other"), "partition"))
    # Per-family case floors, each by removing cases of one family only.
    target = "collaboration.cancelled"
    fixture.append(("family_case_floor", lambda f: f.__setitem__("payloads", [c for c in f["payloads"] if c["event_type"] != target or c["case_id"] in used]), "positive"))
    def fewer_negatives(f):
        kept = [c for c in f["invalid_payloads"] if c["event_type"] == target][:6]
        f["invalid_payloads"] = [c for c in f["invalid_payloads"] if c["event_type"] != target or c in kept]
    fixture.append(("family_case_floor", fewer_negatives, "negative"))
    fixture.append(("family_case_floor", lambda f: f.__setitem__("valid_events", [c for c in f["valid_events"] if not (c["event_type"] == target and c["record"]["scope_kind"] == "application")]), "editions"))
    def fewer_joins(f):
        joins = sorted({c["join"] for c in f["invalid_events"] if c["event_type"] == target})[:3]
        f["invalid_events"] = [c for c in f["invalid_events"] if c["event_type"] != target or c["join"] in joins]
    fixture.append(("family_case_floor", fewer_joins, "joins"))
    def no_refusals(f):
        f["transition_cases"] = [c for c in f["transition_cases"] if c["event_type"] != target]
        for s in f["transition_sequences"]:
            s["steps"] = [st for st in s["steps"] if st["event_type"] != target or st["expected"] in ("appended", "exact_retry")]
    fixture.append(("family_case_floor", no_refusals, "sequences_refused"))
    def no_appends(f):
        # collaboration.failed appends once, in one sequence; drop that step, the steps after it and the final state.
        for s in f["transition_sequences"]:
            index = next((i for i, st in enumerate(s["steps"]) if st["event_type"] == "collaboration.failed" and st["expected"] == "appended"), None)
            if index is not None:
                s["steps"] = s["steps"][:index]
                s.pop("final_state", None)
    fixture.append(("family_case_floor", no_appends, "sequences_appended"))
    for check, patch, label in fixture:
        case("fixture_report", check, dc.FIXTURE_PATH, patch, label)
    # Table order: a factory that requires two rows out of table order.
    path = "scripts/pm_collab_table_payload_rules.py"
    text = dc.read_owner(path, root)
    a, b = "        table.require('PR01_epoch_integer', value, context)\n", "        table.require('PR02_epoch_nonnegative', value, context)\n"
    cases.append(dict(case_id="integrity:p2a:table_require_order", target="table_order_errors", expected="table_require_order",
                      texts={path: text.replace(a + b, b + a)}))
    return cases
