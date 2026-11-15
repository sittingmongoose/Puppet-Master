"""DC criterion-12 join-row copy witnesses (PNC-019 C12-DC1; DC2 reuses it).

A join row compares two or more copies of one fact (a stored copy against a recomputed one, a body copy against an
independently captured context copy). For every row of every DC phase table that reads two or more observation
fields, this reads the gated-tool collection the runner saved (scripts/pm-collab-guard-tables.py
--save-collection) and, for every negative targeted at the row, finds the control observation of the same phase
that differs from it in the fewest of the row's fields (same family first). A negative that differs from such a
control in exactly one of the row's fields is a distinct-copy witness for that field. The report lists, per row
and per family, which copies have their own single-copy witness and which do not.

It reads observations only; it decides no checker result and adds no tool credit.
"""
import ast
import copy
import inspect
import pickle
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_collaboration_events as dc  # noqa: E402


def row_fields(predicate):
    """Observation fields a row predicate reads (value['x'] subscripts)."""
    tree = ast.parse(inspect.getsource(predicate))
    out = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Subscript) and isinstance(node.value, ast.Name) and node.value.id == "value" \
                and isinstance(node.slice, ast.Constant) and isinstance(node.slice.value, str):
            if node.slice.value not in out:
                out.append(node.slice.value)
    return out


def equality_pairs(predicate):
    """(left, right) observation-field pairs a row compares with == or != (the row's copy joins)."""
    tree = ast.parse(inspect.getsource(predicate))

    def field(node):
        if isinstance(node, ast.Subscript) and isinstance(node.value, ast.Name) and node.value.id == "value" \
                and isinstance(node.slice, ast.Constant) and isinstance(node.slice.value, str):
            return node.slice.value
        return None
    pairs = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Compare) and len(node.ops) == 1 and isinstance(node.ops[0], (ast.Eq, ast.NotEq)):
            a, b = field(node.left), field(node.comparators[0])
            if a and b and (a, b) not in pairs:
                pairs.append((a, b))
    return pairs


def _differs(a, b, fields):
    return [f for f in fields if a.get(f) != b.get(f)]


def analyse(collection_path, families=None):
    saved = pickle.loads(Path(collection_path).read_bytes())
    collected = saved["collected"]
    rows_out = []
    for phase in sorted(collected):
        slot = collected[phase]
        controls = list(slot["controls"].values())
        for name, predicate, _ in dc.table_rows(phase):
            fields = row_fields(predicate)
            if len(fields) < 2:
                continue
            negs = [n for n in slot["negatives"].values() if n["target"] == name]
            per_family = {}
            for n in negs:
                fams = n["families"] if families is None else [f for f in n["families"] if f in families or f == "shared"]
                if not fams:
                    continue
                pool = [c for c in controls if c["family"] in n["families"]] or controls
                best = min((_differs(n["value"], c["value"], fields) for c in pool), key=len, default=fields)
                for f in fams:
                    entry = per_family.setdefault(f, dict(single={}, multi=0))
                    if len(best) == 1:
                        entry["single"].setdefault(best[0], []).append(n["id"])
                    else:
                        entry["multi"] += 1
            pairs = equality_pairs(predicate)
            copy_gaps = {}
            for f, e in per_family.items():
                miss = sorted({x for a, b in pairs for x in (a, b) if x not in e["single"]})
                if miss:
                    copy_gaps[f] = miss
            rows_out.append(dict(phase=phase, row=name, fields=fields, equality_pairs=pairs, copy_gaps=copy_gaps, negatives=len(negs),
                                 families={f: dict(single_copy_fields=sorted(e["single"]), witnesses={k: v[:3] for k, v in e["single"].items()},
                                                   multi_field_negatives=e["multi"],
                                                   fields_without_single_copy_witness=[x for x in fields if x not in e["single"]])
                                           for f, e in sorted(per_family.items())}))
    return dict(collection_inputs=saved["inputs"], rows=rows_out)


# --- distinct-copy witness search ---------------------------------------------------------------------------
# For each family's own valid probes, every scalar leaf of the probe input (the value, its captured context, the
# physical key, the wrapper, the payload store, the reducer prestate) is changed once in a way that keeps its
# lexical class (the last character moves within its class, an integer moves by one, a boolean flips). The probe
# runs through the complete checker under its recorder. When the first refusal is a join row and, against the
# probe's own control observation of that phase, exactly one side of one of the row's copy pairs changed, the
# changed probe is a distinct-copy witness for that side. Nothing is repaired or relabelled.

def _bump(value):
    if isinstance(value, bool):
        return not value
    if isinstance(value, int):
        return value + 1
    if isinstance(value, str) and value:
        c = value[-1]
        for cls in ("0123456789abcdef", "0123456789", "abcdefghijklmnopqrstuvwxyz", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"):
            if c in cls:
                return value[:-1] + cls[(cls.index(c) + 1) % len(cls)]
        return value[:-1] + ("a" if c != "a" else "b")
    return None


def _leaves(node, path=()):
    if isinstance(node, dict):
        for k, v in node.items():
            yield from _leaves(v, path + (k,))
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from _leaves(v, path + (i,))
    else:
        yield path, node


INPUT_KEYS = {"source": ("value", "source_context", "physical_key"), "prepared": ("value", "source_case", "payload_store"),
              "envelope": ("value", "payload_store"), "transition": ("value", "prestate"), "checkpoint": ("value", "context"),
              "historical": ("value", "context")}


def _set(probe, path, value):
    p = copy.deepcopy(probe)
    node = p
    for k in path[:-1]:
        node = node[k]
    node[path[-1]] = value
    return p


def sequence_probes():
    """Valid reducer steps of the fixture transition sequences, as the gated suites build them (scripts/pm_collab_guard_suites.py)."""
    fx = dc.load(dc.FIXTURE_PATH, dc.ROOT)
    out = []
    for s in fx["transition_sequences"]:
        state = dc.Reducer(s["admitted_event_types"], s["storage_instance_id"], s["recovery_epoch"])
        for i, st in enumerate(s["steps"]):
            if st["expected"] in ("appended", "exact_retry"):
                out.append(dict(domain="transition", case_id="sequence:" + s["case_id"] + ":" + str(i), value=copy.deepcopy(st["payload"]),
                                expected=None, event_type=st["event_type"], prestate=copy.deepcopy(state.__dict__)))
            state.apply(st["event_type"], st["payload"])
    return out


def search(families, rows_by_phase, cap_per_side=2):
    import pm_dc_c12_clauses as clauses
    found = {}
    tried = 0
    for probe in clauses.all_probes() + sequence_probes():
        if probe["expected"] is not None or probe["domain"] not in INPUT_KEYS:
            continue
        fam = clauses.family(probe)
        if fam not in families:
            continue
        res, first, exc = clauses.route(probe)
        if exc or res is not None:
            continue
        dc.RECORDER = control = []
        try:
            dc.evaluate_probe(probe, dc.ROOT)
        finally:
            dc.RECORDER = None
        control_obs = {}
        for ph, obs, _ in control:
            control_obs.setdefault(ph, obs)
        variants = []
        for key in INPUT_KEYS[probe["domain"]]:
            if key not in probe:
                continue
            for path, leaf in list(_leaves(probe[key], (key,))):
                new = _bump(leaf)
                if new is None:
                    continue
                variants.append(("leaf", path, _set(probe, path, new)))
                # Coherent variants of one prepared-source fact: the derived digests/ids of that copy are recomputed
                # (semantic digest and event payload for a body fact; the owner hash in value and context for a record
                # fact, with or without the wrapper record copy); the independently captured copies stay unchanged.
                if probe["domain"] == "prepared" and path[:3] == ("source_case", "value", "semantic_body"):
                    m = _set(probe, path, new)
                    case = m["source_case"]
                    case["value"]["semantic_sha256"] = dc.producer_digest(case["value"]["semantic_body"])
                    if isinstance(case.get("event"), dict) and case["event"].get("payload_ref") is None:
                        case["event"]["payload"] = copy.deepcopy(case["value"]["semantic_body"])
                        m["value"] = copy.deepcopy(case["event"])
                    variants.append(("body_coherent", path, m))
                if probe["domain"] == "prepared" and path[:3] == ("source_case", "value", "owner_record"):
                    m = _set(probe, path, new)
                    case = m["source_case"]
                    case["value"]["owner_record_sha256"] = dc.row_sha256(case["value"]["owner_record"])
                    case["source_context"]["owner_record_sha256"] = case["value"]["owner_record_sha256"]
                    variants.append(("record_coherent", path, m))
                    m3 = _set(probe, path, new)
                    m3["source_case"]["value"]["owner_record_sha256"] = dc.row_sha256(m3["source_case"]["value"]["owner_record"])
                    variants.append(("record_value_hash_only", path, m3))
                    m2 = copy.deepcopy(m)
                    if "application_wrapper" in m2["source_case"] and isinstance(m2["source_case"]["application_wrapper"], dict) \
                            and m2["source_case"]["application_wrapper"].get("record_ref") is None:
                        m2["source_case"]["application_wrapper"]["record"] = copy.deepcopy(m2["source_case"]["value"]["owner_record"])
                        variants.append(("record_wrapper_coherent", path, m2))
        # The caller's family (the boundary copy of the event type): a sibling family judging this family's record.
        if probe["domain"] in ("envelope", "historical") and probe.get("event_type") in dc.EVENT_TYPES:
            sib = dc.EVENT_TYPES[(dc.EVENT_TYPES.index(probe["event_type"]) + 1) % len(dc.EVENT_TYPES)]
            variants.append(("caller_family", ("event_type",), _set(probe, ("event_type",), sib)))
        # One byte more in an SP-337 body (its declared size copy unchanged).
        for ref, body in (probe.get("payload_store") or {}).items():
            if isinstance(body, str):
                variants.append(("body_length", ("payload_store", ref), _set(probe, ("payload_store", ref), body + " ")))
        for variant, path, mutated in variants:
            if True:
                tried += 1
                dc.RECORDER = recs = []
                try:
                    result = dc.evaluate_probe(mutated, dc.ROOT)
                except Exception:  # a mutation the checker cannot evaluate is not a witness
                    dc.RECORDER = None
                    continue
                finally:
                    dc.RECORDER = None
                refused = next(((ph, obs, r) for ph, obs, r in recs if r is not None), None)
                if refused is None or result is None:
                    continue
                ph, obs, (row, code) = refused
                pairs = rows_by_phase.get(ph, {}).get(row)
                base = control_obs.get(ph)
                if not pairs or base is None:
                    continue
                for a, b in pairs:
                    ca, cb = obs.get(a) != base.get(a), obs.get(b) != base.get(b)
                    if ca != cb:
                        side = a if ca else b
                        slot = found.setdefault((fam, ph, row, side), [])
                        if len(slot) < cap_per_side:
                            slot.append(dict(probe=probe["case_id"], domain=probe["domain"], leaf="/".join(map(str, path)), variant=variant,
                                             code=code, observation=obs, mutated=mutated))
    return found, tried


# --- sides no single-copy witness can reach, with the reason -------------------------------------------------
# D: the side is recomputed by the checker from other inputs (never an input copy of its own); its stored counterpart
#    has a witness, and every input it is computed from is joined by the earlier row(s) named.
# U: the side is an input copy that an earlier row of the same route already joins to a third copy, so it cannot
#    differ alone at this row; the earlier row's own witnesses vary it.
# N: not a two-copy join: both fields are derived from one copy (a uniqueness count, or a value against its own
#    canonical rendering); the row's own witnesses vary that copy.
SIDE_REASONS = {
    ("EV08_attempt", "expected_attempt_id"): ("D", "recomputed from the payload's attempt subject, which PR04 (idempotency recipe) and EV14 (event id) join first"),
    ("EV12_schema_id", "expected_payload_schema_id"): ("D", "recomputed from the boundary event type and the record scope kind, joined first by EV02 and EV03"),
    ("EV04_project_id", "payload_scope_kind"): ("U", "the payload scope kind is joined to the record scope kind by EV03 first"),
    ("EV04_project_id", "record_scope_kind"): ("U", "the record scope kind is joined to the payload scope kind by EV03 first"),
    ("HR02_write_epoch", "custody_write_epoch"): ("U", "the sealed custody's write epoch is bound to the original's identity by the frozen v1 verifier (the event id under that epoch), so a custody epoch other than the one the record was written under refuses HR01 original_verification first"),
    ("PR05_revision_rule", "expected_previous_definition_revision"): ("D", "recomputed as definition_revision - 1; definition_revision is a subject component joined first by PR04 (idempotency recipe)"),
    ("QP01_body", "semantic_body_sha256"): ("U", "every source body fact is joined first by SF13 (binding), SF14/SF15 (record fields) and SF59 (owner facts), and its digest by SF08"),
    ("QP02_metadata", "envelope_metadata"): ("U", "the source envelope metadata is joined to the captured context copy by SF21 first"),
    ("RF06_canonical", "canonical_sha256"): ("N", "both sides derive from the one SP-337 body (its canonical rendering against its raw bytes); RF06's own witnesses vary that body"),
    ("RF03_size", "body_size"): ("D", "the body's measured size; a body of another length also changes its BLAKE3 commitment, and the ref's declared size is the stored copy RF03 witnesses"),
    ("SF10_context_record_digest", "actual_record_sha256"): ("D", "recomputed from the owner record, whose stored hash SF09 joins first"),
    ("SF11_record_ref", "expected_record_ref"): ("D", "recomputed from the body's identities (source_record_ref), joined first by SF05-SF07 and SF08"),
    ("SF12_context_record_ref", "owner_record_ref"): ("U", "the stored owner_record_ref is joined to its recomputed form by SF11 first"),
    ("SF07_event_id", "expected_event_id"): ("D", "recomputed from the body subject, Storage instance and epoch, joined first by SF01, SF03, SF04 and SF06"),
    ("SF59_owner_facts", "fact_projection_sha256"): ("U", "the projection holds only body facts no earlier row binds; where it is empty or every such fact is lexical-class bound, a body change is refused by SF08/SF13/SF14 first"),
    ("SF14_shared_fields", "body_shared_sha256"): ("U", "the body fields shared with the record are joined to the captured binding by SF13 first"),
    ("SF15_joined_fields", "body_join_sha256"): ("U", "the renamed body fields are joined to the captured binding or identity by SF13/SF06 first"),
    ("SF16_coordinator", "record_coordinator_kind"): ("U", "the record's coordinator spec is part of the owner record whose hash SF09/SF10 join first"),
    ("SF17_started_time", "started_body_time"): ("U", "the body time is the family timestamp in the captured binding, joined by SF13 first"),
    ("SF18_message_time", "message_body_time"): ("U", "the body time is the family timestamp in the captured binding, joined by SF13 first"),
    ("SF19_state", "record_state"): ("U", "the record state is part of the owner record whose hash SF09/SF10 join first"),
    ("SF20_terminal_time", "terminal_body_time"): ("U", "the body time is the family timestamp in the captured binding, joined by SF13 first"),
    ("SF22_output_refs", "context_output_refs"): ("U", "the captured output refs are compared after the body copy, which SF59/SF13 bind; recorded as an open single-copy witness of the context side"),
    ("SF23_attempt", "body_attempt_id"): ("U", "the body attempt id is a subject component, joined by SF06/SF07 first"),
    ("SF41_record_currentness", "body_currentness_for_record"): ("U", "the body currentness is joined to the captured context by SF40 first"),
    ("SF30_pack_run", "body_run"): ("U", "the body run id is a subject component, joined by SF06/SF07 first"),
    ("SF43_roster_unique", "snapshot_distinct_slot_count"): ("N", "both counts derive from one slot_requirements list (a uniqueness check, not two copies)"),
    ("SF44_record_unique", "record_distinct_slot_count"): ("N", "both counts derive from the record's one participant_specs list"),
    ("SF45_roster_context", "snapshot_distinct_slot_count"): ("N", "derived from the one slot_requirements list; SF43 owns its uniqueness"),
    ("SF45_roster_context", "snapshot_slot_count"): ("N", "derived from the one slot_requirements list; SF43 owns its uniqueness"),
    ("SF45_roster_context", "snapshot_slot_ids"): ("U", "the snapshot slot ids carry the required flags SF37 joins to the captured required set first; the part 2A roster witnesses (r2:semantic_roster, original_control:participant_slot_ids) vary them"),
    ("SF46_roster_record", "record_distinct_slot_count"): ("N", "derived from the record's one participant_specs list; SF44 owns its uniqueness"),
    ("SF46_roster_record", "record_slot_count"): ("N", "derived from the record's one participant_specs list"),
    ("SF46_roster_record", "snapshot_distinct_slot_count"): ("N", "derived from the one slot_requirements list"),
    ("SF46_roster_record", "snapshot_slot_count"): ("N", "derived from the one slot_requirements list"),
    ("SF46_roster_record", "snapshot_slot_ids"): ("U", "joined to the captured roster by SF45 first"),
    ("SF47_roster_body", "snapshot_distinct_slot_count"): ("N", "derived from the one slot_requirements list"),
    ("SF47_roster_body", "snapshot_slot_count"): ("N", "derived from the one slot_requirements list"),
    ("SF47_roster_body", "snapshot_slot_ids"): ("U", "joined to the captured roster by SF45 first"),
    ("WR04_instance", "value_instance"): ("U", "the source's Storage instance is joined to the captured context by SF01 and to every application context by SF33 first"),
    ("WR05_server", "body_server"): ("U", "the body server is part of the captured binding (SF13) and joined to every application context by SF34 first"),
    ("WR06_scope", "record_scope_sha256"): ("U", "the record scope is part of the owner record, whose hash SF09/SF10 join and whose whole copy WR03 joins to the wrapper first"),
    ("TR01_idempotency_conflict", "recorded_digest"): ("U", "the recorded digest is the reducer's own dedupe entry for the original append; a different recorded digest for the same key is reached only through a different first append, which the dedupe witnesses (exact retry against conflict) vary"),
    ("EV02_event_type", "boundary_event_type"): ("U", "the caller's family selects the payload edition and identity recipe; a sibling caller refuses at that sibling's own rows first where its payload definition differs"),
}


def side_reason(row, side):
    return SIDE_REASONS.get((row, side))
