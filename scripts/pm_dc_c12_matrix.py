"""DC criterion-12 coverage matrix: owner clause -> checker predicate rows -> control, negative, cut, restoration.

Owner clauses are read from each family's own units (Collaborative_Workflows CWR-1xx, Contracts_V0 CV-46x with one
clause per payload field row, storage-plan SP-46x) by their bold section headings, with the line each starts on.
Each heading maps to the checker phase tables that decide it (CLAUSE_PHASES); every row of those tables that the
family's own witnesses reach is listed with the fresh gated-tool result for its table (proved, own negatives that
flip when the row alone is cut, every other case keeping its exact result, restoration) and the family's own
control and negative counts from the tool collection. Schema-occurrence rows add the family's clause ledger
(scripts/pm_dc_c12_clauses.py). A clause no static row decides is listed with its native obligation, NOT_RUN.
"""
import collections
import gzip
import json
import pickle
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_collaboration_events as dc  # noqa: E402

# Owner section heading -> phase table name prefixes that decide it.
CLAUSE_PHASES = {
    ("cw", "Records"): ["source_", "wrapper_", "prepared_join", "payload_schema"],
    ("cw", "Emitted when"): ["transition_"],
    ("cw", "Never emitted"): ["transition_", "envelope_replay"],
    ("cw", "Producer and order"): ["transition_dedupe", "envelope_replay", "source_identity"],
    ("cw", "Text and custody"): ["payload_schema", "source_owner_facts"],
    ("cw", "Withdrawal"): ["historical_"],
    ("cw", "Bindings"): ["payload_schema", "retention_", "envelope_family"],
    ("cv", "field"): ["payload_schema", "payload_numbers", "payload_rules"],
    ("cv", "Rules"): ["payload_rules", "envelope_joins", "envelope_identity", "envelope_datetime"],
    ("sp", "Identity"): ["payload_rules", "envelope_identity", "source_identity"],
    ("sp", "Admission checks, in order"): ["transition_"],
    ("sp", "Consumers and checkpoint"): ["checkpoint_", "projection_value_", "fix_projection"],
    ("sp", "Requiredness projection"): ["source_requirements", "transition_completed", "transition_participant_completed"],
    ("sp", "Producer and first receipt"): ["transition_dedupe", "envelope_replay"],
    ("sp", "Custody and retention"): ["retention_", "payload_schema", "source_owner_facts"],
    ("sp", "Withdrawal"): ["historical_"],
    ("sp", "Prepared source"): ["source_", "wrapper_", "prepared_join", "reference_", "representation"],
}
NATIVE = {("cw", "Emitted when"), ("cw", "Never emitted"), ("cw", "Producer and order"), ("cw", "Withdrawal"), ("sp", "Producer and first receipt"),
          ("sp", "Withdrawal")}
SCHEMA_ROWS = {"PS01_payload_schema": "payload", "SO03_schema": "source", "WR01_schema": "wrapper", "EV01_record_schema": "envelope",
               "CK01_schema": "checkpoint"}


def unit_clauses(doc, unit):
    lines = (ROOT / doc).read_text(encoding="utf-8").splitlines()
    start = next(i for i, l in enumerate(lines) if l.startswith("### " + unit + " "))
    end = next(i for i in range(start + 1, len(lines)) if lines[i].startswith("```yaml") or lines[i].startswith("### "))
    out = []
    for i in range(start + 1, end):
        m = re.match(r"^\*\*([^*]+?)\.?\*\*", lines[i])
        if m:
            heading = m.group(1).rstrip(".")
            heading = "Prepared source" if heading.startswith("Prepared source") else heading
            out.append(dict(unit=unit, doc=doc, heading=heading, line=i + 1, text=lines[i][:220]))
        m = re.match(r"^\| `([a-z_]+)` \|", lines[i])
        if m:
            out.append(dict(unit=unit, doc=doc, heading="field", field=m.group(1), line=i + 1, text=lines[i][:220]))
    return out


def build(families, gated_summary, collection, clause_summaries, gated_dir=None):
    suites = {s["phase"]: s for s in gated_summary["suites"]}
    row_detail = {}
    for phase, s in suites.items():
        if gated_dir and s.get("report"):
            rep = json.loads(gzip.open(Path(gated_dir) / s["report"], "rt").read())
            for r in rep.get("rows", []):
                row_detail[(phase, r["id"])] = dict(own=len(r["own"]), own_flips=len(r["flips"]), stays=r["stays"] if isinstance(r["stays"], int) else len(r["stays"]),
                                                     restoration_runs=len(r["restoration"]), unrelated_changes=r["unrelated_changes"] if isinstance(r["unrelated_changes"], int) else len(r["unrelated_changes"]),
                                                     masked=len(r["masked"]))
    saved = pickle.loads(Path(collection).read_bytes())["collected"]
    guards = {}
    for phase in suites:
        built = dc.table_module(phase).case(None)
        for name, gd in built.table.guards.items():
            guards[(phase, name)] = gd.invariant.predicate if hasattr(gd.invariant, "predicate") else str(gd.invariant)
    ledger = collections.defaultdict(list)
    for s in clause_summaries:
        ledger[s["family"]].append(s)
    out = {}
    for et in families:
        units = dc.UNITS[et]
        clauses = []
        for kind in ("cw", "cv", "sp"):
            clauses += [dict(c, kind=kind) for c in unit_clauses(dc.UNIT_DOC[kind], units[kind])]
        rows_for = []
        for c in clauses:
            key = (c["kind"], c["heading"])
            prefixes = CLAUSE_PHASES.get(key, [])
            rows = []
            for phase, s in sorted(suites.items()):
                if not any(phase.startswith(p) for p in prefixes):
                    continue
                slot = saved.get(phase, dict(controls={}, negatives={}))
                fam_controls = sum(1 for x in slot["controls"].values() if x["family"] == et)
                for row in s["rows"]:
                    fams = s["row_families"].get(row, [])
                    if et not in fams and "shared" not in fams:
                        continue
                    own = sum(1 for n in slot["negatives"].values() if n["target"] == row and et in n["families"])
                    entry = dict(phase=phase, row=row, invariant=guards.get((phase, row)), proved=row in s.get("proved", []),
                                 tool_status=s.get("tool_status"), family_controls=fam_controls, family_negatives=own,
                                 family_negative_aliases=sum(len(n["aliases"]) for n in slot["negatives"].values() if n["target"] == row and et in n["families"]))
                    entry["tool_row"] = row_detail.get((phase, row))
                    if row in SCHEMA_ROWS:
                        entry["clause_ledger"] = [dict(boundary=x["boundary"], clauses=x["clauses"], killed=x["killed"], invalid=x["invalid"],
                                                       control_detected=x["control_detected"], implied=x["implied"], open=x["open"])
                                                  for x in ledger[et] if x["boundary"].split(":")[0] == SCHEMA_ROWS[row]]
                    rows.append(entry)
            if c["heading"] == "field":
                rows = [r for r in rows if r["phase"] != "payload_rules" or c["field"] in ("idempotency_key", dc.FAMILY_TS[et],
                                                                                            "previous_definition_revision", "definition_revision")]
            rows_for.append(dict(c, rows=rows, native=("NOT_RUN" if key in NATIVE else None),
                                 decided_by_static_rows=bool(rows)))
        out[et] = rows_for
    return out
