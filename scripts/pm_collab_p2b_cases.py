"""DC sweep part 2B witnesses: the shared CV-1101 date-time predicate, the shared CV-1100/SP-1100 number calls and
SP-1101 retained-original dispatch (scripts/pm_collaboration_events.py contract_probes, integrity_cases and the
composition-time sealing in original_dispatcher call these).

Each negative starts from a named valid parent of its own family and changes one fact; every copy, digest, key and
captured control that observes that fact moves with it, so the negative is refused by exactly its own row. Expected
codes are the legacy first-refusal codes; the refusing row is checked by scripts/pm_collab_guard_suites.py and the
gated tool. Positives (expected None) show what the owner profiles keep valid.

The shared number corpus (Plans/event_number_recipe_corpus.json, number scope) runs through two complete routes of
one valid event per family: the SP-337 reference route (raw body text through the shared loads_current_json) and
the inline route (typed exact integers). Expectations are composed from the shared helpers (loads_current_json,
current_integer, storage_value_bytes) and DC's own SP-337 canonical-body rule, never from the route under test.
"""
import copy
import json
from pathlib import Path

# Slots that a CV-460 arithmetic rule joins to another slot (PR05, PR06); a lone change there is also that rule's defect.
ARITHMETIC = frozenset({"previous_definition_revision", "requested_reviewer_count", "completed_reviewer_count", "failed_reviewer_count"})
LONG = 10 ** 4399  # the 4,400-digit integer (DX, DS15, DF, DM crash class)
BAD_TIMES = ("T24:00:00Z", "-02-29T10:00:00Z", "T23:59:60Z", "T10:60:00Z", "-13-04T10:00:00Z", "T10:00:00Z\n")
STORAGE_BAD = ("+00:00", "z", "Z\n", "T24:00:00Z", "-00:00", "+05:30")


def _bad_time(original, i):
    """A spelling the shared predicate refuses but every DC/CWC/projection pattern still reaches (or the LF leak)."""
    date = original[:10]
    kind = BAD_TIMES[i % len(BAD_TIMES)]
    if kind.startswith("-02"):
        return "2026" + kind
    if kind.startswith("-13"):
        return date[:4] + kind
    if kind == "T23:59:60Z":
        return "2026-11-04T23:59:60Z"  # no leap second on 2026-11-04
    if kind.endswith("\n"):
        return original + "\n"
    return date + kind


def _storage_bad(original, i):
    kind = STORAGE_BAD[i % len(STORAGE_BAD)]
    stem = original[:19]
    if kind == "T24:00:00Z":
        return original[:10] + kind
    if kind == "Z\n":
        return stem + "Z\n"
    return stem + kind


def integer_slots(dc, root, event_type, payload):
    """Top-level integer slots of the payload's closed definition: (field, minimum or None, const or None, subject?)."""
    schema = dc.load(dc.PAYLOAD_PATH, root)["$defs"][dc.payload_def(event_type, dc.edition_of(payload))]
    out = []
    for field, node in schema["properties"].items():
        if field not in payload or type(payload[field]) is not int:
            continue
        if node.get("type") == "integer" or type(node.get("const")) is int:
            out.append((field, node.get("minimum"), node.get("const"), field in dc.SUBJECT[event_type]))
    return out


def corpus_number_values(root):
    """Number-scope raw spellings and exact integers of the shared corpus, plus the 4,400-digit integers (as DO)."""
    corpus = json.loads((Path(root) / "Plans/event_number_recipe_corpus.json").read_text(encoding="utf-8"))
    raws, ints = [], []
    for case in corpus["cases"]:
        if case.get("date_time_profile"):
            continue
        if case.get("op") in ("token", "parse", "parse_token", "slot") and type(case.get("raw")) is str:
            raws.append(case["raw"])
        if case.get("op") == "json_number" and type(case.get("token")) is str:
            raws.append(case["token"])
        if case.get("op") in ("integer", "uint64") and type(case.get("value")) is dict and "@int" in case["value"]:
            ints.append(int(case["value"]["@int"]) if len(case["value"]["@int"]) < 4000 else None)
    long_text = "1" + "0" * 4399
    raws += [long_text, "-" + long_text]
    ints = [i for i in ints if i is not None] + [LONG, -LONG, (1 << 64) - 1, 1 << 64, -(1 << 63), -(1 << 63) - 1]
    return list(dict.fromkeys(raws)), list(dict.fromkeys(ints))


def _expected_reference(dc, numbers, token, body_text, minimum):
    """SP-337 route outcome from the shared helpers: raw parse, DC's canonical-body rule, then current_integer."""
    try:
        value = numbers.loads_current_json(token)
    except numbers.Refusal:
        return "reference_json"
    try:
        parsed = numbers.loads_current_json(body_text)
        if dc.canonical(parsed) != body_text:
            return "reference_canonical"
    except (numbers.Refusal, ValueError, TypeError):
        return "reference_canonical"
    try:
        numbers.current_integer(value, minimum=minimum)
    except numbers.Refusal:
        return "payload"
    return None


def _expected_inline(numbers, value, minimum):
    try:
        numbers.storage_value_bytes(value, profile=numbers.EVENT_VALUE)
    except numbers.Refusal:
        return "event_value_encoding"
    try:
        numbers.current_integer(value, minimum=minimum)
    except numbers.Refusal:
        return "payload"
    return None


def corpus_bases(dc, root):
    """One inline valid event per family whose payload has a non-subject, non-const integer slot."""
    fx = dc.load(dc.FIXTURE_PATH, root)
    bases, seen = [], set()
    for c in fx["valid_events"]:
        et = c["event_type"]
        if et in seen or c["record"]["payload_ref"] is not None:
            continue
        slots = [s for s in integer_slots(dc, root, et, c["record"]["payload"]) if not s[3] and s[2] is None and s[0] not in ARITHMETIC]
        if slots:
            seen.add(et)
            bases.append((c, slots[0]))
    return bases


def sealed_originals(dc, root):
    """SP-1101 retained originals built by DC's writer builders and sealed at composition (never by a case).

    float/negzero/uint64: valid under the v1 recipe when written, readable by the frozen v1 verifier after CV-1100's
    current grammar refuses them as new input. invalid_time: a 24:00:00Z original the v1 checker accepted (its
    valid_utc and an EventRecord validator without format did); CV-1101 makes it owner-invalid, so the frozen
    verifier refuses it. unsupported: a record sealed under a recipe tuple with no installed frozen verifier.
    """
    return [dict(o, storage_instance_id=o["storage_instance_id"]) for o in _sealed(dc, root)]


def _sealed(dc, root):
    fx = dc.load(dc.FIXTURE_PATH, root)
    siid, epoch = fx["storage_context"]["storage_instance_id"], fx["storage_context"]["recovery_epoch"]
    out = []
    for c in fx["valid_events"]:
        e, et = c["record"], c["event_type"]
        p = e["payload"]
        slots = [s for s in integer_slots(dc, root, et, p) if s[2] is None]
        if slots:
            r = copy.deepcopy(e); field = slots[0][0]
            r["payload"][field] = float(p[field])
            out.append(dict(name=c["case_id"] + ":float_original", record=r, storage_instance_id=siid, write_epoch=epoch, event_type=et))
        zero = [s for s in slots if s[1] == 0 and p[s[0]] == 0 and s[0] not in ARITHMETIC]
        if zero:
            r = copy.deepcopy(e); field = zero[0][0]
            r["payload"][field] = -0.0
            out.append(dict(name=c["case_id"] + ":negzero_original:" + field, record=r, storage_instance_id=siid, write_epoch=epoch, event_type=et,
                            negzero_field=field))
        r = copy.deepcopy(e); r["sequence_id"] = (1 << 64) - 1
        out.append(dict(name=c["case_id"] + ":uint64_original", record=r, storage_instance_id=siid, write_epoch=epoch, event_type=et))
        r = copy.deepcopy(e); bad = e["occurred_at_utc"][:10] + "T24:00:00Z"
        r["occurred_at_utc"] = bad; r["payload"][dc.FAMILY_TS[et]] = bad
        out.append(dict(name=c["case_id"] + ":invalid_time_original", record=r, storage_instance_id=siid, write_epoch=epoch, event_type=et))
        r = copy.deepcopy(e); r["producer_sequence_id"] = 99
        out.append(dict(name=c["case_id"] + ":unsupported_recipe_original", record=r, storage_instance_id=siid, write_epoch=epoch, event_type=et,
                        recipe_override={"identity_recipe": "SP-460 raw-v0 (no frozen verifier installed)"}))
    return out


def probes(dc, root):
    import pm_event_numbers as numbers
    fx = dc.load(dc.FIXTURE_PATH, root)
    siid, epoch = fx["storage_context"]["storage_instance_id"], fx["storage_context"]["recovery_epoch"]
    out = []

    def add(domain, name, value, expected, **kw):
        out.append(dict(domain=domain, case_id="p2b:" + name, value=copy.deepcopy(value), expected=expected, **copy.deepcopy(kw)))

    def prepared(c, name, expected):
        add("prepared", c["case_id"] + ":" + name, c["event"], expected, source_case=copy.deepcopy(c), payload_store=copy.deepcopy(c.get("payload_store", {})))

    def history(name, record, et, expected, **context):
        ctx = dict(storage_instance_id=siid, write_epoch=epoch, withdrawn=False, retained=True, original_record=copy.deepcopy(record))
        ctx.update(context)
        add("historical", name, record, expected, event_type=et, context=ctx)

    # ---- CV-1101 family timestamps (PR03, STORAGE_UTC_Z): the 24:00:00Z leak and the other calendar forms.
    seen = set()
    for i, c in enumerate(fx["payloads"]):
        key = (c["event_type"], c["edition"])
        if key in seen:
            continue
        seen.add(key)
        p, ts = c["payload"], dc.FAMILY_TS[c["event_type"]]
        for j in range(3):
            bad = copy.deepcopy(p); bad[ts] = _bad_time(p[ts], i + j) if not _bad_time(p[ts], i + j).endswith("\n") else p[ts][:10] + "T24:00:00Z"
            add("payload", c["case_id"] + ":family_time:" + str(j), bad, "valid_utc_datetime", event_type=c["event_type"])
        good = copy.deepcopy(p); good[ts] = "2016-12-31T23:59:60Z"
        add("payload", c["case_id"] + ":family_time:leap_second", good, None, event_type=c["event_type"])
        good = copy.deepcopy(p); good[ts] = p[ts][:19] + ".123456789Z"
        add("payload", c["case_id"] + ":family_time:nine_digit_fraction", good, None, event_type=c["event_type"])

    # ---- CV-1101 EventRecord timestamps (EV15 EVENT_RECORD; EV16/EV17 STORAGE_UTC_Z, CV-253).
    for i, c in enumerate(fx["valid_events"]):
        et, e = c["event_type"], c["record"]
        bad = copy.deepcopy(e); bad["occurred_at_utc"] = e["occurred_at_utc"][:10] + "T24:00:00Z"
        add("envelope", c["case_id"] + ":occurred_at:hour_24", bad, "event_record_schema", event_type=et)
        for field in ("observed_at_utc", "persisted_at_utc"):
            bad = copy.deepcopy(e); bad[field] = _storage_bad(e[field], i)
            add("envelope", c["case_id"] + ":" + field + ":profile", bad, "event_record_schema", event_type=et)
            bad = copy.deepcopy(e); bad[field] = _storage_bad(e[field], i + 3)
            add("envelope", c["case_id"] + ":" + field + ":profile_b", bad, "event_record_schema", event_type=et)
            good = copy.deepcopy(e); good[field] = "2016-12-31T23:59:60Z"
            add("envelope", c["case_id"] + ":" + field + ":leap_second", good, None, event_type=et)
            good = copy.deepcopy(e); good[field] = e[field][:19] + ".123456789012Z"
            add("envelope", c["case_id"] + ":" + field + ":long_fraction", good, None, event_type=et)

    # ---- CV-1101 Collaborative Workflows owner timestamps in the prepared source (SO06, EVENT_RECORD).
    for i, original in enumerate(fx["prepared_sources"]):
        v = original["value"]; et = v["event_type"]; record = v["owner_record"]
        if "created_at" in record and et not in ("collaboration.started", "collaboration.message_added"):
            for j in range(2):
                c = copy.deepcopy(original); c["value"]["owner_record"]["created_at"] = _bad_time(record["created_at"], i + 2 * j + (5 if j == 0 else 0))
                prepared(dc.refresh_prepared(c, True), "owner_time:created_at:" + str(j), "source_schema")
            c = copy.deepcopy(original); c["value"]["owner_record"]["created_at"] = record["created_at"][:19] + "+05:30"
            prepared(dc.refresh_prepared(c, True), "owner_time:created_at:offset", None)
        if "review_target_pack" in v and "frozen_at" in v["review_target_pack"]:
            c = copy.deepcopy(original); bad = v["review_target_pack"]["frozen_at"] + "\n"
            c["value"]["review_target_pack"]["frozen_at"] = bad; c["source_context"]["review_target_pack"]["frozen_at"] = bad
            prepared(c, "owner_time:frozen_at:lf", "source_schema")
            c = copy.deepcopy(original); bad = v["review_target_pack"]["frozen_at"][:10] + "T24:00:00Z"
            c["value"]["review_target_pack"]["frozen_at"] = bad; c["source_context"]["review_target_pack"]["frozen_at"] = bad
            prepared(c, "owner_time:frozen_at:hour_24", "source_schema")

    # ---- CV-1101 checkpoint and projection timestamps (CK20, PV02; STORAGE_UTC_Z).
    for i, c in enumerate(fx["projection_values"]):
        value, definition = c["value"], c["definition"]
        stamps = [k for k, x in value.items() if k.endswith("_utc") and type(x) is str]
        for j, field in enumerate(stamps):
            bad = copy.deepcopy(value); bad[field] = _bad_time(value[field], i + j) if not _bad_time(value[field], i + j).endswith("\n") else value[field][:10] + "T24:00:00Z"
            if definition == "checkpoint":
                add("checkpoint", c["case_id"] + ":time:" + field, bad, "checkpoint_schema", context=fx["checkpoint_contexts"][c["case_id"]])
            else:
                add("projection", c["case_id"] + ":time:" + field, bad, "projection_value", definition=definition)
        if stamps:
            good = copy.deepcopy(value); good[stamps[0]] = "2016-12-31T23:59:60Z"
            if definition == "checkpoint":
                add("checkpoint", c["case_id"] + ":time:leap_second", good, None, context=fx["checkpoint_contexts"][c["case_id"]])
            else:
                add("projection", c["case_id"] + ":time:leap_second", good, None, definition=definition)

    # ---- CV-1100 payload integer slots (PN01): an integral float at every integer slot; identities are unchanged
    # because DC's v1 canonical writes the same decimal (so only the slot predicate differs).
    for c in fx["payloads"]:
        p, et = c["payload"], c["event_type"]
        for field, minimum, const, subject in integer_slots(dc, root, et, p):
            bad = copy.deepcopy(p); bad[field] = float(p[field])
            add("payload", c["case_id"] + ":integer_slot:" + field, bad, "number_domain", event_type=et)
        zero = [s for s in integer_slots(dc, root, et, p) if s[1] == 0 and p[s[0]] == 0]
        for field, _, _, _ in zero:
            bad = copy.deepcopy(p); bad[field] = -0.0
            add("payload", c["case_id"] + ":negative_zero:" + field, bad, "number_domain", event_type=et)

    # ---- CV-1100/SP-1100 EventRecord integer slots (EV18, EV19) and the EVENT_VALUE profile (RP03).
    for i, c in enumerate(fx["valid_events"]):
        et, e = c["event_type"], c["record"]
        bad = copy.deepcopy(e); bad["sequence_id"] = float(e["sequence_id"]) if i % 2 == 0 else 1 << 64
        add("envelope", c["case_id"] + ":sequence_id:" + ("float" if i % 2 == 0 else "two_to_64"), bad, "event_record_schema", event_type=et)
        good = copy.deepcopy(e); good["sequence_id"] = (1 << 64) - 1
        add("envelope", c["case_id"] + ":sequence_id:uint64_max", good, None, event_type=et)
        bad = copy.deepcopy(e); bad["producer_sequence_id"] = 1.0
        add("envelope", c["case_id"] + ":producer_sequence_id:float", bad, "event_record_schema", event_type=et)
        good = copy.deepcopy(e); good["producer_sequence_id"] = (1 << 64) - 1
        add("envelope", c["case_id"] + ":producer_sequence_id:uint64_max", good, None, event_type=et)
        bad = copy.deepcopy(e); bad["producer_sequence_id"] = (1 << 64) if i % 2 == 0 else LONG
        add("envelope", c["case_id"] + ":producer_sequence_id:physical", bad, "event_value_encoding", event_type=et)

    # ---- CV-1100/SP-1100 prepared-source integer slots (SO07), wrapper slots (WR08) and APP_PHYSICAL (WR07).
    for original in fx["prepared_sources"]:
        v = original["value"]
        c = copy.deepcopy(original); c["value"]["recovery_epoch"] = float(v["recovery_epoch"])
        prepared(c, "integer_slot:recovery_epoch", "source_schema")
        context = v["owner_record"].get("application_context")
        if context is not None and type(context.get("task_stop_epoch")) is int:
            c = copy.deepcopy(original); c["value"]["owner_record"]["application_context"]["task_stop_epoch"] = float(context["task_stop_epoch"])
            prepared(dc.refresh_prepared(c, True), "integer_slot:owner_record:task_stop_epoch", "source_schema")
            if "application_wrapper" in original:
                c = copy.deepcopy(original)
                c["application_wrapper"]["record"]["application_context"]["task_stop_epoch"] = float(context["task_stop_epoch"])
                prepared(c, "wrapper_integer_slot:task_stop_epoch", "application_wrapper_schema")
                c = copy.deepcopy(original); c["value"]["owner_record"]["application_context"]["task_stop_epoch"] = 1 << 64
                prepared(dc.refresh_prepared(c, True), "wrapper_physical:task_stop_epoch", "application_wrapper_encoding")
                c = copy.deepcopy(original); c["value"]["owner_record"]["application_context"]["task_stop_epoch"] = (1 << 64) - 1
                prepared(dc.refresh_prepared(c, True), "wrapper_physical:uint64_max", None)

    # ---- CV-1100/SP-1100 checkpoint integer slots (CK21).
    for c in fx["projection_values"]:
        if c["definition"] != "checkpoint":
            continue
        value, ctx = c["value"], fx["checkpoint_contexts"][c["case_id"]]
        bad = copy.deepcopy(value); bad["index_read_token"]["source_selection"]["recovery_epoch"] = float(value["index_read_token"]["source_selection"]["recovery_epoch"])
        add("checkpoint", c["case_id"] + ":integer_slot:token_epoch", bad, "checkpoint_schema", context=ctx)
        if value["index_through_sequence_id"] is not None:
            bad = copy.deepcopy(value); bad["index_through_sequence_id"] = float(value["index_through_sequence_id"])
            if bad["source_cursor"] is not None:
                bad["source_cursor"]["last_sequence_id"] = float(value["source_cursor"]["last_sequence_id"])
            add("checkpoint", c["case_id"] + ":integer_slot:index_through", bad, "checkpoint_schema", context=ctx)
            bad = copy.deepcopy(value); changed = copy.deepcopy(ctx)
            bad["index_through_sequence_id"] = LONG; changed["index_through_sequence_id"] = LONG
            if bad["source_cursor"] is not None:
                bad["source_cursor"]["last_sequence_id"] = LONG; changed["source_cursor"]["last_sequence_id"] = LONG
            add("checkpoint", c["case_id"] + ":integer_slot:index_through_long", bad, "checkpoint_schema", context=changed)

    # ---- SP-1101 retained dispatch (HR01, HR02, CK22) and the frozen v1 recipe (10a).
    sealed = {o["name"]: o for o in _sealed(dc, root)}
    for c in fx["valid_events"]:
        et, e = c["event_type"], c["record"]
        forged = copy.deepcopy(e); forged["actor_ref"] = "component:coherent_forgery"
        history(c["case_id"] + ":coherent_forgery", forged, et, "historical_original_recipe")
        history(c["case_id"] + ":write_epoch_disclosed", e, et, "historical_original_recipe", write_epoch=epoch + 1)
        long = copy.deepcopy(e); long["sequence_id"] = LONG
        history(c["case_id"] + ":long_integer_unsealable", long, et, "historical_original_recipe")
        for suffix, expected_history, expected_current in (("float_original", None, "payload"), ("uint64_original", None, None),
                                                           ("invalid_time_original", "historical_original_recipe", "event_record_schema"),
                                                           ("unsupported_recipe_original", "historical_original_recipe", None)):
            o = sealed.get(c["case_id"] + ":" + suffix)
            if o is None:
                continue
            history(o["name"], o["record"], et, expected_history)
            add("envelope", o["name"] + ":as_current_input", o["record"], expected_current, event_type=et)
        for name, o in sealed.items():
            if name.startswith(c["case_id"] + ":negzero_original:"):
                history(name, o["record"], et, None)
                add("envelope", name + ":as_current_input", o["record"], "payload", event_type=et)
    for c in fx["projection_values"]:
        if c["definition"] != "checkpoint" or not c["value"]["source_cursor"]:
            continue
        ctx = copy.deepcopy(fx["checkpoint_contexts"][c["case_id"]])
        ctx["last_event"]["observed_at_utc"] = ctx["last_event"]["observed_at_utc"][:19] + ".5Z"
        add("checkpoint", c["case_id"] + ":last_event_unsealed", c["value"], "checkpoint_event", context=ctx)

    # ---- The shared number corpus through two complete routes, and the 4,400-digit integer at every boundary.
    raws, ints = corpus_number_values(root)
    for base, (field, minimum, _, _) in corpus_bases(dc, root):
        et, e = base["event_type"], base["record"]
        for k, token in enumerate(raws):
            p = copy.deepcopy(e["payload"]); p[field] = "__DC_P2B_SLOT__"
            body = dc.canonical(p).replace('"__DC_P2B_SLOT__"', token)
            ref = "payload:blake3:" + __import__("blake3").blake3(body.encode("utf-8")).hexdigest() + ":" + str(len(body.encode("utf-8"))) + ":application/json"
            record = copy.deepcopy(e); record.update(payload={}, payload_ref=ref)
            add("envelope", base["case_id"] + ":corpus:reference:" + field + ":" + str(k), record, _expected_reference(dc, numbers, token, body, minimum),
                event_type=et, payload_store={ref: body})
        for k, value in enumerate(ints):
            record = copy.deepcopy(e); record["payload"][field] = value
            add("envelope", base["case_id"] + ":corpus:inline:" + field + ":" + str(k), record, _expected_inline(numbers, value, minimum), event_type=et)
        p = copy.deepcopy(e["payload"]); p[field] = LONG
        add("payload", base["case_id"] + ":long_integer:payload:" + field, p, None, event_type=et)
    return out


def integrity_cases(dc, root):
    """Fixture-level witness for the changed IF03 oracle: one planted wrong current-input expectation."""
    fixtures = copy.deepcopy(dc.load(dc.FIXTURE_PATH, root))
    fixtures["numeric_family_cases"][0]["current_rejection"] = None
    return [dict(case_id="integrity:p2b:numeric_current_expectation", target="fixture_report", expected="numeric_identity",
                 overrides={dc.FIXTURE_PATH: fixtures})]
