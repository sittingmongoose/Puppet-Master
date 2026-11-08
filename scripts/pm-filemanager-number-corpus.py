#!/usr/bin/env python3
"""Run the shared NUMRULE number corpus through the complete DFM checker (sweep part 2B numbers).

Every number value of the corpus's number scope (Plans/event_number_recipe_corpus.json cases
selected by pm_event_numbers_corpus.number_case: typed values and the values of raw spellings
that loads_current_json admits) is placed, in each family, at the DFM boundaries that read a
number, with every copy moved:

  payload-slot   payload path_snapshot_revision and every path snapshot revision, current write
  history-slot   the same coherent original through the retained reader (historical=True)
  trace-sequence the static trace event_sequence (writer cutoff 2^70; above it TQ05 refuses)
  identity-epoch the identity recipe's recovery_epoch (identity boundary)
  issued         the control issued sequence with a coherent active->active issuance
  producer       the complete event's producer_sequence_id (CV-317 projection), current write
  event-body     an EventRecord inline body {"v": value} (SP-1100 EVENT_VALUE bytes)

The expected outcome of each run is composed outside the checker from the shared helpers, the
owner schema verdict and the SP-339 redb domain; the history-slot route asserts that no current
integer-slot row is ever reached on the retained reader. Prints a JSON summary; exit 1 on any
disagreement.
"""
import argparse
import copy
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import jsonschema  # noqa: E402
import pm_event_numbers as numbers  # noqa: E402
import pm_event_numbers_corpus as corpus_module  # noqa: E402

_spec = importlib.util.spec_from_file_location("pm_filemanager_event_contracts", ROOT / "scripts/pm-filemanager-event-contracts.py")
dfm = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = dfm
_spec.loader.exec_module(dfm)

SAFE_MAX = 9007199254740991


def scalars(value):
    if type(value) in (list, tuple):
        for item in value:
            yield from scalars(item)
    elif type(value) is dict:
        for item in value.values():
            yield from scalars(item)
    elif not isinstance(value, (str, bytes)) or value is None:
        yield value


def corpus_values(corpus):
    found = {}
    for case in corpus["cases"]:
        if not corpus_module.number_case(case):
            continue
        candidates = []
        if "value" in case:
            candidates += list(scalars(corpus_module._value(case["value"])))
        for raw_key in ("raw", "token"):
            if type(case.get(raw_key)) is str:
                try:
                    candidates += list(scalars(numbers.loads_current_json(case[raw_key])))
                except numbers.Refusal:
                    pass
        for value in candidates:
            # The checker's input domain is decoded JSON: json.loads values, or loads_current_json's
            # finite ParsedDecimal carriers. A bare or non-finite Decimal is not a JSON value.
            if type(value) in (int, float, bool) or (type(value) is numbers.ParsedDecimal and value.is_finite()):
                found.setdefault(json.dumps(corpus_module.typed(value), sort_keys=True), value)
    return list(found.values())


def shared_integer(value, **bounds):
    try:
        numbers.current_integer(value, **bounds)
    except numbers.Refusal as refusal:
        return refusal.reason
    return None


def outcome(action):
    try:
        action()
    except dfm.TableRefusal as error:
        return ("refused", error.phase, error.row)
    except Exception as error:  # an untracked refusal is a disagreement, never a pass
        return ("untracked", type(error).__name__, str(error)[:120])
    return ("accepted",)


def coherent_payload_slot(row, value, historical):
    name = row["event_type"]
    p, t = copy.deepcopy(row["payload"]), copy.deepcopy(row["trace"])
    p["path_snapshot_revision"] = value
    m = t["custody_model"]
    op = m["operation_rows"][m["operation_key"]]
    for entry in op["accepted_path_snapshots"] + op["settlement"]["path_snapshots"]:
        entry["path_snapshot_revision"] = value
    dfm.synchronize_fixture(name, p, t, external_operation=False)
    return lambda: dfm.validate_case(name, p, t, historical=historical)


def coherent_producer(row, value):
    name = row["event_type"]
    p, t = copy.deepcopy(row["payload"]), copy.deepcopy(row["trace"])
    m = t["custody_model"]
    m["operation_rows"][m["operation_key"]]["complete_event"]["producer_sequence_id"] = value
    dfm.synchronize_fixture(name, p, t, external_operation=False)
    return lambda: dfm.validate_case(name, p, t)


def schema_accepts(fragment_uri, value):
    validator = jsonschema.Draft202012Validator({"$ref": dfm.SCHEMA_BASE + fragment_uri}, registry=dfm.SCHEMAS,
                                                format_checker=jsonschema.FormatChecker())
    with dfm.exact_integer_text():
        return next(validator.iter_errors(value), None) is None


def issued_action(row, value):
    m = row["trace"]["custody_model"]
    before = copy.deepcopy(m["control_rows"][m["control_key"]])
    before.update(state="active", writer_cutoff_sequence=None, last_admitted_sequence=0)
    after = copy.deepcopy(before)
    after.update(control_revision=before["control_revision"] + 1, last_admitted_sequence=value)
    return lambda: dfm.validate_control_transition(before, after, value, [])


def run(families=None):
    corpus = json.loads((ROOT / "Plans/event_number_recipe_corpus.json").read_text())
    values = corpus_values(corpus)
    fixtures = json.loads((ROOT / "Plans/filemanager_event_contract_fixtures.json").read_text())
    runs, disagreements, routes = 0, [], {}

    def record(route, family, value, expected, got):
        nonlocal runs
        runs += 1
        tally = routes.setdefault(route, {"runs": 0, "accepted": 0, "refused": 0})
        tally["runs"] += 1
        tally["accepted" if got[0] == "accepted" else "refused"] += 1
        if not expected(got):
            disagreements.append(dict(route=route, family=family, value=corpus_module.typed(value), got=list(got)))

    for row in fixtures["rows"]:
        name = row["event_type"]
        if families and name not in families:
            continue
        payload_schema = dfm.PAYLOAD_DOCUMENT + name.replace(".", "_") + ".schema.json#/properties/path_snapshot_revision"
        for value in values:
            reason = shared_integer(value, minimum=0, maximum=SAFE_MAX)
            try:
                current = coherent_payload_slot(row, value, False)
                history = coherent_payload_slot(row, value, True)
            except (ValueError, TypeError) as error:
                current = history = (lambda error=error: (_ for _ in ()).throw(error))
            record("payload-slot", name, value,
                   (lambda got, reason=reason: got == ("accepted",) if reason is None else
                    got[0] == "refused" and (got[1].startswith("schema_payload_") or got[2] == ("IS01_integer_type" if reason == "integer_type" else "IS02_integer_range"))),
                   outcome(current))
            got = outcome(history)
            accepted_by_schema = schema_accepts(payload_schema, value)
            record("history-slot", name, value,
                   (lambda got, reason=reason, ok=accepted_by_schema: got[0] != "untracked" and
                    (got[0] == "refused" or ok) and not (got[0] == "refused" and got[1] == "integer_slot") and
                    (reason is not None or got == ("accepted",))), got)
            seq = shared_integer(value, minimum=0)
            t = copy.deepcopy(row["trace"])
            t["event_sequence"], t["writer_cutoff_sequence"] = value, 1 << 70
            record("trace-sequence", name, value,
                   (lambda got, seq=seq, value=value: got[0] == "refused" and got[1] == "trace_sequence" and
                    got[2] == {"integer_type": "TQ01_sequence_type", "integer_range": "TQ02_sequence_range"}[seq]
                    if seq else (got == ("refused", "trace_sequence", "TQ05_within_cutoff") if value > (1 << 70) else
                                 got[0] != "untracked" and not (got[0] == "refused" and got[1] == "trace_sequence"))),
                   outcome(lambda t=t: dfm.validate_case(name, copy.deepcopy(row["payload"]), t)))
            ctx = dict(copy.deepcopy(row["trace"]), recovery_epoch=value)
            record("identity-epoch", name, value,
                   (lambda got, seq=seq: got == ("refused", "identity_epoch",
                                                 {"integer_type": "IE01_epoch_type", "integer_range": "IE02_epoch_range"}[seq])
                    if seq else got == ("accepted",)),
                   outcome(lambda ctx=ctx: dfm.identity(name, row["payload"], ctx)))
            physical_ok = type(value) is int and -(1 << 63) <= value <= (1 << 64) - 1
            record("issued", name, value,
                   (lambda got, seq=seq, ok=physical_ok: got == ("accepted",) if seq is None and ok else got[0] == "refused"),
                   outcome(issued_action(row, value)))
            try:
                numbers.qualified_jcs({"v": value})
                jcs = None
            except numbers.Refusal as refusal:
                jcs = refusal.reason
            schema_ok = schema_accepts("event_record.schema.json#/$defs/nullable_non_negative_integer", value)
            try:
                producer = coherent_producer(row, value)
            except (ValueError, TypeError) as error:
                producer = (lambda error=error: (_ for _ in ()).throw(error))
            record("producer", name, value,
                   (lambda got, jcs=jcs, ok=schema_ok, phys=physical_ok: got == ("accepted",) if ok and jcs is None and phys
                    else got[0] == "refused" and (not ok or jcs is None or got[1] in ("producer_jcs", "redb_value_encoding")
                                                  or got[1].startswith("schema_"))),
                   outcome(producer))
            try:
                numbers.storage_value_bytes({"v": value}, profile=numbers.EVENT_VALUE)
                physical = None
            except numbers.Refusal as refusal:
                physical = refusal.reason
            record("event-body", name, value,
                   (lambda got, physical=physical: got == ("accepted",) if physical is None else
                    got == ("refused", "event_value_encoding",
                            "EV01_integer_range" if physical == "physical_integer_range" else "EV02_event_value_other")),
                   outcome(lambda value=value: dfm.event_body({"payload": {"v": value}, "payload_ref": None}, {})))
    return dict(status="pass" if not disagreements else "fail", values=len(values), runs=runs, routes=routes,
                disagreements=disagreements[:200], disagreement_count=len(disagreements))


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--family", action="append")
    parser.add_argument("--json", type=Path)
    args = parser.parse_args()
    result = run(args.family)
    text = json.dumps(result, indent=1, sort_keys=True)
    if args.json:
        args.json.write_text(text + "\n")
    print(json.dumps({k: result[k] for k in ("status", "values", "runs", "routes", "disagreement_count")}, sort_keys=True))
    return 0 if result["status"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
