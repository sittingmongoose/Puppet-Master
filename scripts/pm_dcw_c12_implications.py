#!/usr/bin/env python3
"""C12-DCW complete-boundary implications for rows without a cut-accepting witness.

pm_dcw_c12_boundary.py records, for every lane witness refused first at a row,
what the complete checker does when only that row is disabled. A row with a
witness that then ACCEPTS is a complete-boundary row (see pm_dcw_c12_cases.py).
Every other proved row is listed here with one of two written arguments, and
this file checks the argument against the observed runs:

- `entailed`: on every input the row refuses, a later named row (or the
  schema row OE001) refuses too. Check: every observed cut chain for the row
  contains at least one of the `by` rows before the chain accepts or stops.
- `precondition`: the row refuses exactly the values the next statement cannot
  process, so without it the complete checker raises instead of accepting.
  Check: the observed cut raises the declared exception type at a line whose
  source text contains the declared dereference.

Neither kind is counted as a kill or as gated-row credit; the gated Method B
proof of each row stays the authority for its phase table.
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
O = 'scripts/pm_dcw_event_oracles.py'
B = 'scripts/pm_dcw_blockage_events.py'
L = 'scripts/pm_bundle_revision_events.py'
R = 'scripts/pm_dcw_registered_schemas.py'


def entailed(by, proof):
    return dict(kind='entailed', by=by, proof=proof)


def precondition(exception, deref, proof, by=()):
    return dict(kind='precondition', exception=exception, deref=deref, proof=proof, by=list(by))


IMPLICATIONS = {
    # ---- entailed by a later named row on every refused input
    'O001': entailed(['O002'], 'writer_policy: O002 requires replay_policy == dedupe_by_idempotency_key on the same value '
                     'immediately after O001; projector_replay_only fails it. O001 only gives the distinct code '
                     'replay_only_not_appendable.'),
    'O029': entailed(['O043'], 'A non-receipted slot is publication prepared (source schema enum, else OE001), whose then-arm '
                     'fixes first_append_receipt, commitment and segment ref to null; original_receipt needs custody_v2 '
                     '(OE001), whose first_append_receipt is a required AppendReceipt object, so O043 slot/custody '
                     'equality fails.'),
    'O051': entailed(['O058', 'O078'], 'The event must exactly equal one phase prepared_event (O078). O058 compares that '
                     "phase's payload fields with the same source fields as O051, so the same pair fails there."),
    'O057': entailed(['L016', 'L018', 'L019', 'L002'], 'A terminal whose predecessor is already settled needs, for L016 and '
                     'L019, a started previous phase whose event_id equals an earlier start. Phase sequences increase by one '
                     '(L018) and event ids are their identity hash (L002), so no such phase exists.'),
    'O058': entailed(['L020', 'O051'], "An earlier phase disagreeing with the source on a field makes the next phase's "
                     'equal-field check L020 fail; the last phase is the event itself, which O051 compares.'),
    'O112': entailed(['OE001', 'O013'], 'The predecessor is validated as wizard.opened: its payload schema fixes event_type '
                     "'wizard.opened' (OE001) and O013 requires the envelope type to equal the payload type."),
    'O115': entailed(['O219'], 'O219 requires the current-state generations to be exactly [current_generation_id]; a current '
                     'generation whose state is not current is missing from that list.'),
    'O118': entailed(['O227', 'O119', 'O213', 'O208'], 'Rows must be exactly one per frame key (O227, unique event ids O208); '
                     'index_row_count must equal the coverage count (O119), which must equal index_coverage(source) (O213), '
                     'i.e. the frame count. So len(rows) != index_row_count fails one of them.'),
    'O119': entailed(['O213', 'O118', 'O227'], 'Coverage must equal index_coverage(source) (O213), whose retained count is the '
                     'frame count; index_row_count must equal len(rows) (O118) and rows are one per frame (O227).'),
    'O122': entailed(['O123'], 'O123 requires the durable token to exactly equal the live token without redb_snapshot_id; a '
                     'durable token that carries redb_snapshot_id has an extra key.'),
    'O211': entailed(['O213', 'OE001', 'O212'], 'Coverage gaps must equal the source gaps (O213) and the checkpoint schema '
                     'enum for coverage sequence_gaps reason is exactly the set O211 allows (OE001); gap evidence must '
                     'also equal the gap (O212).'),
    'O214': entailed(['O216', 'O215'], 'O216 loops over every (key, generation) including (current_generation_id, current '
                     'generation) and requires key == generation_id, the same comparison as O214.'),
    'O215': entailed(['O217'], 'O217 loops over every generation, including the current one, with the same anchor-derived '
                     'generation-id comparison as O215.'),
    'R002': entailed(['RE001', 'RE005', 'R008'], "A fragment that is neither '#' nor '#/...' either fails pointer resolution "
                     '(RE001) or, used verbatim in the validation target URI document $id + fragment, names no resource '
                     '(RE005).'),
    'RE001': entailed(['RE005', 'R008'], 'pointer() returns the last resolved node. A failed dict/str step leaves the parent, '
                      'and the same fragment in the validation target is unresolvable (RE005); a leading-zero array index '
                      'leaves a list, whose identity is not the expected schema id (R008).'),
    'B004': entailed(['B005'], 'Application scope requires a null envelope project_id (EventRecord allOf/0) while the blockage '
                     'payload project_id is a required string, so B005 envelope/payload equality fails.'),
    'B020': entailed(['OE001'], 'A missing predecessor source reaches source_storage, whose source-schema check refuses a '
                     'non-object (OE001).'),
    'B089': entailed(['OE001'], 'A missing restore admission is validated against restore_admission, which refuses null (OE001).'),
    'O017': entailed(['O018'], 'Application scope requires a null envelope project_id while every DCW payload requires a string '
                     'project_id, so O018 envelope/payload equality fails.'),
    'O030': entailed(['OE001'], 'Missing custody is validated against custody_v2, which refuses null (OE001).'),
    'O157': entailed(['OE001'], 'A missing restore admission is validated against restore_admission, which refuses null (OE001).'),
    'O197': entailed(['OE001'], 'A non-object opened source is validated against the inline source schema, which refuses it (OE001).'),
    'N003': entailed(['O078', 'O114', 'B025'], 'A sequence_id outside the exact uint64 domain has no SP-1100 physical encoding: '
                     'exact_equal returns False on any encoding refusal, so the source copy join (O078, O114, B025) fails; '
                     'the sealed store cannot even issue such an original (physical_integer_range).'),
    'B095': entailed(['B096'], 'With no custody, an admitted member either does not exist (B096) or its fields are joined to '
                     'custody[k], which raises on a missing custody record.'),
    'B069': entailed(['OE001', 'B001', 'B071'], 'A non-blockage event type selects no blockage payload schema (OE001), fails the '
                     'type join (B001) and is not an admitted blockage family (B071); with all three disabled the source '
                     'profile lookup for a non-blockage family raises KeyError.'),
    # ---- fail-closed preconditions: the next statement needs exactly what the row refuses
    'B017': precondition('RecursionError', None, 'A predecessor cycle re-enters historical_original for an id already in seen; '
                         'without the row the recursion never terminates.'),
    'B018': precondition('TypeError', "original['event_type']", 'A missing original is subscripted by B019.'),
    'B038': precondition('TypeError', 'actual[field]', 'A missing repair attempt is subscripted by B039.'),
    'B046': precondition('TypeError', 'route[field]', 'A missing route is subscripted by B047.'),
    'B058': precondition('TypeError', 'action[field]', 'A missing clearing action is subscripted by B059.'),
    'B085': precondition('TypeError', "original['replay_policy']", 'A missing compatibility original is subscripted next.'),
    'F006': precondition('UnboundLocalError', 'return result', 'Invalid base64 leaves no decoded source bytes to return.'),
    'L015': precondition('TypeError', "previous['event_type']", 'A missing predecessor phase is subscripted by L016.'),
    'N004': precondition('UnboundLocalError', 'hashlib.sha256(raw)', 'A value outside the binding profile has no encoded bytes to hash.'),
    'O006': precondition('TypeError', "payload['readable']", 'A missing SP-337 payload is subscripted by O007.'),
    'O044': precondition('TypeError', 'group[k]', 'A missing durable group is subscripted by O045.'),
    'O078': precondition('IndexError', 'matching[0]', 'O078 refuses only an empty match list, which slot = matching[0] cannot index.'),
    'O111': precondition('TypeError', "opened['event_type']", 'A missing opened original is subscripted by O112.'),
    'O144': precondition('TypeError', "payload['readable']", 'A missing source payload is subscripted by O145.'),
    'O166': precondition('TypeError', 'c[k]', 'A missing member custody is subscripted by O167.'),
    'O184': precondition('TypeError', "original_event['replay_policy']", 'A missing compatibility original is subscripted next.'),
    'O196': precondition('TypeError', 'json.dumps(item', 'Non-JSON types cannot be encoded. A float is the only JSON-encodable '
                         'value O196 refuses; it reaches canonical_json only through the caller source key, which O056/B021 '
                         'compare exactly with string identities, or through schema-typed fields (OE001).',
                         by=['O056', 'B021', 'OE001']),
    'O232': precondition('IndexError', 'selected[0]', 'O208 makes frame event ids unique, so O232 refuses only an empty '
                         'selection, which selected[0] cannot index.', by=['O208']),
    'OE003': precondition('UnboundLocalError', 'return result', 'A value the SP-1100 physical codec refuses has no bytes to return.'),
    'OE004': precondition('UnboundLocalError', 'return result', 'A value the CV-317 producer projection refuses has no digest to return.'),
    'OE005': precondition('UnboundLocalError', 'ref', 'An undecodable payload_ref leaves no descriptor to validate.'),
    'OE006': precondition('UnboundLocalError', 'raw', 'Undecodable payload hex leaves no bytes to size or hash.'),
    'R001': precondition('AttributeError', 'fragment', 'A non-string pointer has no string operations.'),
    'R004': precondition('AttributeError', 'owner.get', 'An unregistered event type has no registry owner row.'),
    'R005': precondition('AttributeError', 'edition.get', 'No registry edition matches this scope and payload schema id.'),
    'RE002': precondition('UnboundLocalError', 'return result', 'An unreadable schema path leaves no document to return.'),
}


def check(results, summary):
    report, failures = {}, []
    for row, best in sorted(summary.items()):
        if best['best'] == 'complete_boundary':
            continue
        claim = IMPLICATIONS.get(row)
        items = results.get(row, [])
        entry = dict(row=row, observed=best['best'], witnesses=len(items), claim=claim)
        if claim is None:
            entry['status'] = 'missing'
        elif claim['kind'] == 'entailed':
            chains = [[s.get('row') for s in it.get('chain', [])] for it in items]
            entry['chains'] = chains
            entry['status'] = 'pass' if chains and all(set(claim['by']) & set(c) for c in chains) else 'fail'
        else:
            ok = bool(items)
            frames = []
            for it in items:
                steps = it.get('chain') or [it.get('cut') or {}]
                end = steps[-1]
                frame = end.get('frame') or {}
                text = frame.get('text') or ''
                frames.append(dict(type=end.get('type'), path=frame.get('path'), line=frame.get('line'), text=text))
                by_hit = bool(set(claim['by']) & {s.get('row') for s in steps})
                deref_ok = claim['deref'] is None or claim['deref'] in text
                ok &= (end.get('outcome') == 'EXCEPTION' and end.get('type') == claim['exception'] and deref_ok) or by_hit
            entry['frames'] = frames
            entry['status'] = 'pass' if ok else 'fail'
        report[row] = entry
        if entry['status'] != 'pass':
            failures.append(row)
    return report, failures


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--boundary', required=True, type=Path, help='pm_dcw_c12_boundary.py output directory')
    parser.add_argument('--out', required=True, type=Path)
    args = parser.parse_args()
    results = json.loads((args.boundary / 'boundary-results.json').read_text())
    summary = json.loads((args.boundary / 'boundary-summary.json').read_text())
    report, failures = check(results, summary)
    counts = {}
    for v in summary.values():
        counts[v['best']] = counts.get(v['best'], 0) + 1
    kinds = {}
    for v in report.values():
        if v['claim']:
            kinds[v['claim']['kind']] = kinds.get(v['claim']['kind'], 0) + 1
    out = dict(status='pass' if not failures else 'fail', failures=failures, boundary_counts=counts,
               implication_kinds=kinds, rows=report, credited=0)
    args.out.write_text(json.dumps(out, indent=1, sort_keys=True, default=repr) + '\n')
    print(json.dumps(dict(status=out['status'], failures=failures, boundary=counts, kinds=kinds), sort_keys=True))
    raise SystemExit(0 if not failures else 1)


if __name__ == '__main__':
    main()
