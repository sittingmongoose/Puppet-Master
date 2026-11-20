#!/usr/bin/env python3
"""C12-DS15 closure evidence for the seven deck-2 families (PNC-019 criterion 12).

Usage: python3 scripts/pm-c12-ds15-closure.py --mode MODE --out <dir> [--guard <gated report dir>]

Modes (each writes JSON under --out; nothing here decides a checker result, every verdict is the unmodified
deck-2 checker's own, observed through its guard-row recorder):
  entailed  proof of every row a deck-2 family reaches that no single-defect input of that family can refuse first:
            the tool-unproved singleton tables and the family-constant / earlier-boundary rows, each with exact
            path:line anchors and the mechanical checks that hold at this head
  schema    every schema occurrence the complete deck-2 boundaries evaluate (payload, contexts, owner source, owner
            bank, EventRecord current/retained/original, AppendReceipt/custody/result, original evidence, index
            inputs, checkpoint, request transition): eager reference closure, the evaluated clause inventory, one
            directed proposal per clause through the real DS15 validator (isolated to that clause, or INVALID), and
            the same proposal placed in the complete operation input with its exact expected first refusal
  datetime  every format: date-time node and Storage UTC-Z field on the deck-2 boundaries and the shared timestamp
            battery (scripts/pm_event_datetime_timestamp_battery.json) through every site, expected outcome
            composed from pm_event_datetime.date_time alone
  retained  every retained route (read, checkpoint, rebuild, recover, publish, receipt boundary, writer withdrawal)
            of every family base and case, plus the C12 retained witnesses, each with sealed-custody snapshots
            before and after (the Plans file bytes and the composed in-memory custody); no read may change either
  numbers   the shared number corpus through the seven families' complete routes (pm-ds15-number-corpus.py
            routes) and the 4,400-digit integer check
  matrix    owner clause -> guard row -> family controls / own negatives -> gated cut / restoration, per family
"""
import argparse
import copy
import hashlib
import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_ds15_c12_cases as c12  # noqa: E402

FAMILIES = c12.FAMILIES
OPS = ('payload', 'envelope_boundary', 'receipt_boundary', 'checkpoint_boundary', 'event_schema', 'payload_schema',
       'index_boundary', 'recover', 'publish', 'read', 'checkpoint', 'rebuild', 'withdraw_writer')
RETAINED_OPS = ('read', 'checkpoint', 'rebuild', 'recover', 'publish', 'receipt_boundary', 'withdraw_writer')
ASSERTIONS = ('type', 'const', 'enum', 'required', 'additionalProperties', 'minLength', 'maxLength', 'pattern',
              'format', 'minimum', 'maximum', 'minItems', 'maxItems', 'uniqueItems', 'anyOf', 'oneOf', 'allOf', 'not',
              'if', 'then', 'else', '$ref', 'minProperties', 'maxProperties', 'propertyNames', 'dependentRequired')
APPLICATORS = ('allOf', 'if', 'then', 'else', '$ref')


def sha(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), default=repr).encode()).hexdigest()


def file_sha(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


def anchor(path, text):
    """path:line of the first line containing text (exact), with the file's SHA-256; AssertionError if absent."""
    lines = (ROOT / path).read_text().splitlines()
    for i, line in enumerate(lines, 1):
        if text in line:
            return {'path': path, 'line': i, 'quote': text, 'sha256': file_sha(path)}
    raise AssertionError(f'anchor not found: {path}: {text!r}')


def load():
    m16, deck = c12.load_models()
    return m16, deck


def recorded(deck, call):
    return c12.recorded(deck, call)


def first_refusal(records):
    first = next((r for r in records if r[2] is not None), None)
    return None if first is None else [first[0], first[2][0], first[2][1]]


def valid_parents(deck, family):
    """(base, op) pairs of this family whose evaluation records no refusal and returns a non-refusing result."""
    c, f = c12.contract(deck, family), c12.fixture(deck, family)
    out = []
    for base, data in f['bases'].items():
        for op in OPS:
            result, records = recorded(deck, lambda: deck.evaluate(c, op, copy.deepcopy(data)))
            if c12.refused_result(result) is False and first_refusal(records) is None:
                out.append((base, op))
    return out


# =========================================================================== entailed
def entailed(m16, deck, out):
    b = deck.base
    E = 'scripts/pm-ds15-event-contracts.py'
    D = 'scripts/pm-ds15-deck2-contracts.py'
    G = 'scripts/pm-ds15-table-generate.py'
    contracts = {c['event_type']: c for c in deck.read('Plans/ds15_deck2_contracts.json')}
    custody = b.original_custody()
    checks = {}

    # Mechanical facts about this head's composition and owner schemas.
    current = {name: b.recipe_resource_manifest(cc['payload_schema_ref'], b.context_schema_ref(cc))
               for name, cc in [(n, b.contract_of(n)) for n in custody['manifests']]}
    checks['custody_manifests_current'] = all(custody['manifests'][n] == current[n] for n in current)
    known = {c['event_type'] for c in b.read('Plans/ds15_event_contracts.json')} | set(contracts)
    entries = [(k, e) for k, v in custody['sealed'].items() for e in v]
    checks['sealed_entries_name_known_families'] = all(e[1] in known for _, e in entries)
    checks['sealed_bindings_match_their_key'] = all(
        e[0].storage_instance_id == k[0] and e[0].event_id == k[1] and e[0].server_id == b.DS15_SERVER for k, e in entries)
    checks['installed_recipes_cover_every_family'] = len(b.installed_recipes()) == len(known) * len(b.INSTALLED_RECIPES)
    resolve_src = (ROOT / E).read_text()
    checks['resolve_passes_no_override_and_discloses'] = (
        'installed_recipes()).resolve(\n            event[\'event_id\'], expected, disclose=lambda binding: True)' in resolve_src)
    checks['commitment_call_sites'] = sorted({ln.strip() for ln in resolve_src.splitlines()
                                             if re.search(r'(?<![_\w])commitment\(', ln) and 'def commitment' not in ln})
    payload_bounds, run_null, source_type, no_numbers, closed_scope = {}, {}, {}, {}, {}
    ctx = b.read('Plans/ds15_deck2_context.schema.json')['$defs']
    src = b.read('Plans/ds15_deck2_sources.schema.json')['$defs']
    for name, c in contracts.items():
        payload = b.read(c['payload_schema_ref'])
        no_numbers[name] = not re.search(r'"(integer|number)"', json.dumps(payload))
        payload_bounds[name] = worst_case_size(b, payload)
        run_null[name] = ctx[name]['properties']['envelope_run_id'] in ({'type': 'null'}, {'const': None})
        source_type[name] = src[name]['properties']['event_type'].get('const') == name
        cp = b.read(c['checkpoint_schema_ref'])
        closed_scope[name] = dict(checkpoint_project_id='project_id' in cp['properties'],
                                  checkpoint_scope='scope' in cp['properties'],
                                  payload_project_id='project_id' in payload['properties'],
                                  payload_scope='scope' in payload['properties'],
                                  closed=cp['additionalProperties'] is False and payload['additionalProperties'] is False)
    checks['deck2_payload_worst_case_bytes'] = payload_bounds
    checks['deck2_payload_has_no_number_slot'] = no_numbers
    checks['deck2_context_envelope_run_id_null'] = run_null
    checks['deck2_source_event_type_const'] = source_type
    checks['deck2_checkpoint_payload_scope_members'] = closed_scope
    cp_slots = {}
    for name, c in contracts.items():
        for key, lo, hi in integer_slots(b.read(c['checkpoint_schema_ref'])):
            cp_slots.setdefault(name, {})[key] = dict(minimum=lo, maximum=hi, authority=key in b.AUTHORITY_INTEGERS,
                                                      bounded=key == 'through_sequence_id' or (lo == 0 and hi == 2 ** 64 - 1))
    checks['checkpoint_integer_slots'] = {n: all(v['authority'] and v['bounded'] for v in slots.values()) for n, slots in cp_slots.items()}
    checks['checkpoint_integer_slot_detail'] = cp_slots
    checks['evidence_scan_low_is_storage_uint64'] = 'scan_low' in b.STORAGE_UINT64_FIELDS and 'scan_low' in integer_slot_names(
        b.read('Plans/ds15_original_evidence.schema.json'))
    index_slots = integer_slot_names(b.read('Plans/ds15_index_inputs.schema.json'))
    checks['index_inputs_integer_slots'] = sorted(index_slots)
    checks['index_inputs_slots_are_authority_integers'] = index_slots <= set(b.AUTHORITY_INTEGERS)
    id_patterns = {}
    for name, c in contracts.items():
        props = b.read(c['payload_schema_ref'])['properties']
        for field in c['identity_fields']:
            pattern = props[field].get('pattern')
            id_patterns[f'{name}/{field}'] = bool(pattern) and re.fullmatch(pattern, 'x\ud800') is None
    checks['identity_field_patterns_exclude_lone_surrogates'] = id_patterns
    checks['browser_families'] = {n: deck.n_is_browser(c) for n, c in contracts.items()}
    checks['payload_strings_patterned'] = {
        n: all(sub.get('const') is not None or (sub.get('type') == 'string' and sub.get('pattern')
                                               and re.fullmatch(sub['pattern'], 'x\ud800') is None)
               for sub in b.read(c['payload_schema_ref'])['properties'].values())
        for n, c in contracts.items() if c['scope_policy'] == 'project_only'}

    tool_unproved = [
        dict(table='cm_value', row='CM02_commitment_computable', anchors=[
            anchor(E, "    receipts = sealed_receipts(storage_instance_id, d) if sealed else None"),
            anchor(E, "        ref, commitment = event['event_id'], full_value_commitment(event)"),
            anchor(E, "    except (Refusal, KeyError, TypeError, AttributeError, ValueError):"),
            anchor(E, "    if refused('cm_value', commitment_refusal=refusal_reason(full_value_commitment, event)):")],
             proof=('commitment() runs only inside receipt_ok (and the predicate harness), after selected_recipe on the same '
                    "operation input: select_original_recipe computes full_value_commitment of the same d['original']['event'] in "
                    'sealed_receipts, which returns no receipt when that raises a Refusal, so rd_recipe SX08 refuses first; '
                    'nothing changes the event between the two calls'),
             mechanical=['commitment_call_sites']),
        dict(table='cp_range_entailed', row='CN03_contiguous', anchors=[
            anchor(G, "('CS04_source_contiguous', '/source_sequences'"), anchor(G, "('CN02_rows', '/index_rows'"),
            anchor(G, "('CS03_source_high', '/source_last_sequence'"), anchor(G, "('CN05_selected_high', '/scan_high'")],
             proof='the source rows are first..last (CS04), the index rows are exactly the source rows in low..high (CN02) and '
                   'high is the source high (CS03, CN05), so the index row sequences are low..high'),
        dict(table='cp_row_entailed', row='CR03_row_original_read', anchors=[
            anchor(E, "                nested = evaluate(c, 'read', original).get('result') if original is not d else None")],
             proof='the nested read of a matching row records its own first refusal (a row of the nested evaluation) before '
                   'CR03 sees its result'),
        dict(table='d2_env_b_entailed', row='DE06_scope_kind', anchors=[
            anchor('Plans/event_record.schema.json', '"scope_kind"'), anchor(G, "('DE07_project', '/project_id'")],
             proof='the EventRecord schema ties scope_kind application to a null project_id and project to a non-empty one, '
                   'so a kind mismatch is a schema error first or also a project mismatch (DE07)'),
        dict(table='d2_env_c_entailed', row='ER05_record_event_type', anchors=[
            anchor(D, "    schema = read('Plans/ds15_deck2_sources.schema.json')['$defs'][c['event_type']]")],
             proof="sch_d2_source validates the owner record against its own family definition, whose event_type is const the "
                   'family name, before d2_env_c', mechanical=['deck2_source_event_type_const']),
        dict(table='d2_env_storage_entailed', row='DE14_inline_limit', anchors=[
            anchor(D, "    if refused('d2_env_storage', scope_partition=d['scope_partition'],")],
             proof='every deck-2 payload schema is closed and bounds every string; the worst-case EVENT_VALUE size of a '
                   'maximal payload (every string at its maxLength in 4-byte UTF-8, every optional member present) is below '
                   '16,384 bytes', mechanical=['deck2_payload_worst_case_bytes']),
        dict(table='d2_pl_gate_entailed', row='PG05_no_run', anchors=[
            anchor(D, "    if refused('d2_pl_gate', owner_command_authorized=x['owner_command_authorized'],")],
             proof="the deck-2 context schema fixes envelope_run_id to null for every family, and sch_d2_context runs first "
                   '(payload_ok)', mechanical=['deck2_context_envelope_run_id_null']),
        dict(table='ev_original_ids_entailed', row='OC04_event_payload', anchors=[
            anchor(E, "        if refused('ev_original_copies', payload=tx(p), original_payload=tx(o['payload']), outcome_payload=tx(out['payload'])):"),
            anchor(D, "    if refused('d2_env_b', scope_kind=e['scope_kind']")],
             proof="the payload equals the original payload (OC01), the envelope payload equals the payload (DE08) and the "
                   "envelope's producer digest equals the original event's (EN17 on retry; the retained envelope is the "
                   'original on reads), so the original event payload already equals it'),
        dict(table='id_scope_entailed', row='ID02_scope_object', anchors=[
            anchor(E, "    if identity_fields_refused(c, payload, recipe):")],
             proof="sch_id_fields validates every identity field and scope against its payload property schema (an object) "
                   'before ID02'),
        dict(table='sch_id_fields_v1', row='ID_FIELDS_V1_schema', anchors=[
            anchor(D, "                       expected_key=base.identity(c, p, source, recipe))")],
             proof='the retained identity is recomputed from the payload p, which sch_payload_v1 validated first with the same '
                   'property subschemas (identity fields and scope included)'),
        dict(table='sch_id_fields_v1_n', row='ID_FIELDS_V1_numbers', anchors=[
            anchor(D, "                       expected_key=base.identity(c, p, source, recipe))")],
             proof='as ID_FIELDS_V1_schema, and the deck-2 payload schemas declare no number slot',
             mechanical=['deck2_payload_has_no_number_slot']),
        dict(table='cp_prior_entailed', row='CN06_prior_storage', anchors=[
            anchor(E, "                or not token_matches_storage(prior['index_read_token'], d['storage_instance_id'])"),
            anchor(E, "                or not token_matches_storage(token, d['storage_instance_id'])")],
             proof='TK01 binds the checkpoint token (earlier in the same branch) and then the prior token to the event Storage '
                   'instance, so their Storage instances are equal before CN06'),
        dict(table='sch_prior_checkpoint_n', row='PRIOR_CHECKPOINT_numbers', anchors=[
            anchor(E, "AUTHORITY_INTEGERS = frozenset({"), anchor(E, "        if (refused('cp_range', scan_low=low, expected_low=start, index_rows=rows,")],
             proof='every integer slot of the deck-2 checkpoint schemas is a named authority integer (AT02 refuses a non-integer '
                   'over the whole input first); every slot but through_sequence_id carries the stock bounds 0..2^64-1, so the '
                   'stock verdict row refuses out-of-range values first; a prior through_sequence_id past 2^64-1 needs scan_low '
                   '= through + 1 for CN01, which runs before the prior checks, and scan_low is a Storage uint64 slot of the '
                   'original evidence schema (EVIDENCE_numbers at entry)', mechanical=['checkpoint_integer_slots']),
        dict(table='rd_resolve_entailed_sx03', row='SX03_original_sealed', anchors=[
            anchor(E, "    sealed = custody['sealed'].get((self.storage_instance_id, original_ref))"),
            anchor(E, "    return [entry for entry in original_custody()['sealed'].get((storage_instance_id, ref), [])")],
             proof="the owner looks up the same (Storage instance, original ref) key as rd_recipe's sealed_receipts, with the "
                   "same d['storage_instance_id'] and event_id; an empty lookup gives no receipt, so SX08 refuses first"),
        dict(table='rd_resolve_entailed_sx04', row='SX04_original_authentic', anchors=[
            anchor(E, "        matches = [entry for entry in sealed if entry[0].source_commitment == self.commitment_sha256]"),
            anchor(E, "        c = contract_of(event_type)")],
             proof='the owner keeps the entries whose commitment equals full_value_commitment of the fetched event, exactly '
                   "the receipts SX08 counted; every sealed entry names a DS15 family, so contract_of never fails",
             mechanical=['sealed_entries_name_known_families']),
        dict(table='rd_resolve_entailed_sx06', row='SX06_recipe_known', anchors=[
            anchor(E, "        tuple_ = recipe_tuple(c, write_recipe, custody['manifests'][event_type])"),
            anchor(E, "def installed_recipes():")],
             proof="SX02 refuses first a selected receipt whose recipe is not installed; installed_recipes holds every DS15 "
                   "family under every installed recipe at this head's manifests, and every custody manifest equals this "
                   "head's, so the owner's tuple for the sealed entry's family is installed whenever SX02 passed",
             mechanical=['custody_manifests_current', 'installed_recipes_cover_every_family']),
        dict(table='rd_resolve_entailed_sx07', row='SX07_dispatch_other', anchors=[
            anchor(E, "            idempotency_key=event['idempotency_key'], owner_operation_id=event['correlation_id'], source_commitment=sha)"),
            anchor(E, "            event['event_id'], expected, disclose=lambda binding: True)")],
             proof='original_binding: the sealed binding was recorded from the event its commitment covers, at its own '
                   '(Storage instance, event_id) key with the DS15 server, and the expected binding is recomputed from the same '
                   'fetched event and Storage instance; original_ambiguous: the owner matches the same receipts SX09 counted; '
                   'caller_recipe_override: none is passed; recipe_selection: recipe_tuple always builds a RecipeTuple; '
                   'original_bytes_type: storage_value_bytes always returns bytes; current_disclosure: disclose always holds',
             mechanical=['sealed_bindings_match_their_key', 'resolve_passes_no_override_and_discloses']),
    ]
    family_rows = family_entailments(b, deck, contracts, E, D, G)
    result = dict(checks=checks, tool_unproved=tool_unproved, family=family_rows)
    required = ('custody_manifests_current', 'sealed_entries_name_known_families', 'sealed_bindings_match_their_key',
                'installed_recipes_cover_every_family', 'resolve_passes_no_override_and_discloses',
                'deck2_payload_has_no_number_slot', 'deck2_context_envelope_run_id_null', 'deck2_source_event_type_const',
                'identity_field_patterns_exclude_lone_surrogates', 'payload_strings_patterned', 'checkpoint_integer_slots',
                'evidence_scan_low_is_storage_uint64')
    failed = [k for k in required if checks[k] is False or (isinstance(checks[k], dict) and False in checks[k].values())]
    failed += [k for k, v in closed_scope.items() if not v['closed']]
    failed += ['commitment_call_sites'] if len(checks['commitment_call_sites']) != 3 else []
    bound_fail = [n for n, v in payload_bounds.items() if not v or v >= 16384]
    result['failed_checks'] = failed + (['deck2_payload_worst_case_bytes'] if bound_fail else [])
    out('entailed.json', result)
    return dict(tool_unproved=len(tool_unproved), family_rows=sum(len(v['families']) for v in family_rows),
                failed_checks=result['failed_checks'])


def family_entailments(b, deck, contracts, E, D, G):
    """Rows a family reaches but no single-defect input of that family can refuse first."""
    cat_update = [n for n in contracts if n.startswith('catalog.update.')]
    cat_remove = [n for n in contracts if n.startswith('catalog.remove.')]
    non_browser = [n for n in contracts if not n.startswith('browser.')]
    scope_families = [n for n, c in contracts.items() if c['scope_policy'] != 'project_only']
    project_only = [n for n, c in contracts.items() if c['scope_policy'] == 'project_only']
    allf = sorted(contracts)
    return [
        dict(table='d2_pl_gate', row='PG06_session_class', families=non_browser,
             anchors=[anchor(D, "    browser = n_is_browser(c)"), anchor(G, "('PG06_session_class', '/session_security_class'")],
             proof="the row refuses only when browser_family is True; browser_family is n_is_browser(c), False for these families",
             mechanical=['browser_families']),
        dict(table='d2_tr_browser', row='TB23_existing_grant', families=['browser.context_share_revoked'],
             anchors=[anchor(G, "    ('TB23_existing_grant', '/existing_grant'")],
             proof="the row refuses only when family is browser.context_shared"),
        dict(table='d2_tr_browser', row='TB24_recipient_scope', families=['browser.context_share_revoked'],
             anchors=[anchor(G, "    ('TB24_recipient_scope', '/recipient_scope'")],
             proof="the row refuses only when family is browser.context_shared (a revocation passes no recipient scope)"),
        dict(table='d2_request', row='CQ02_remove_installed', families=cat_update,
             anchors=[anchor(G, "('CQ02_remove_installed', '/installed_available'")], proof="refuses only when remove is True"),
        dict(table='d2_request', row='CQ03_remove_not_queued', families=cat_update,
             anchors=[anchor(G, "('CQ03_remove_not_queued', '/queued'")], proof="refuses only when remove is True"),
        dict(table='d2_request', row='CQ04_update_verified', families=cat_remove,
             anchors=[anchor(G, "('CQ04_update_verified', '/effective_version'")], proof="refuses only when remove is False"),
        dict(table='d2_request', row='CQ05_update_installed', families=cat_remove,
             anchors=[anchor(G, "('CQ05_update_installed', '/installed_available'")], proof="refuses only when remove is False"),
        dict(table='cp_scope', row='CG10_project', families=scope_families,
             anchors=[anchor(E, "                or refused('cp_scope', checkpoint_project_id=cp.get('project_id'), payload_project_id=p.get('project_id'),")],
             proof='the closed checkpoint and payload schemas of these families have no project_id member, so both observations '
                   'are None', mechanical=['deck2_checkpoint_payload_scope_members']),
        dict(table='cp_scope', row='CG11_scope', families=project_only,
             anchors=[anchor(E, "                       checkpoint_scope=cp.get('scope'), payload_scope=p.get('scope'))):")],
             proof='the closed checkpoint and payload schemas of this project-only family have no scope member, so both '
                   'observations are None', mechanical=['deck2_checkpoint_payload_scope_members']),
        dict(table='cp_prior', row='CN09_prior_project', families=scope_families,
             anchors=[anchor(E, "                           checkpoint_project_id=cp.get('project_id'), prior_scope=prior.get('scope'),")],
             proof='the closed checkpoint schemas of these families have no project_id member (the prior is validated by the '
                   'same schema first), so both observations are None', mechanical=['deck2_checkpoint_payload_scope_members']),
        dict(table='cp_prior', row='CN10_prior_scope', families=project_only,
             anchors=[anchor(E, "                           checkpoint_scope=cp.get('scope'), prior_state=prior['state'])):")],
             proof='the closed checkpoint schema of this project-only family has no scope member, so both observations are None',
             mechanical=['deck2_checkpoint_payload_scope_members']),
        dict(table='sch_payload_n', row='PAYLOAD_numbers', families=allf,
             anchors=[anchor(E, "    numbered = len([e for e in errors if e.validator in numbers]) if not stock else 0")],
             proof='the closed deck-2 payload schemas declare no integer or number slot, so a number anywhere is a stock type '
                   'error of the verdict row first', mechanical=['deck2_payload_has_no_number_slot']),
        dict(table='sch_payload_v1_n', row='PAYLOAD_V1_numbers', families=allf,
             anchors=[anchor(E, "    numbered = len([e for e in errors if e.validator in numbers]) if not stock else 0")],
             proof='as PAYLOAD_numbers under the frozen ds15-v1 domain', mechanical=['deck2_payload_has_no_number_slot']),
        dict(table='sch_id_fields', row='ID_FIELDS_schema', families=allf,
             anchors=[anchor(D, "                       expected_key=base.identity(c, p, source, recipe))"),
                      anchor(D, "    if not valid('sch_payload_v1' if historical else 'sch_payload', read(c['payload_schema_ref']), p, recipe):")],
             proof="the deck-2 identity is computed from the payload p after sch_payload validated p with the same property "
                   'subschemas (the identity fields and scope are payload properties)'),
        dict(table='sch_id_fields_n', row='ID_FIELDS_numbers', families=allf,
             anchors=[anchor(D, "                       expected_key=base.identity(c, p, source, recipe))")],
             proof='as ID_FIELDS_schema; the deck-2 payload schemas declare no number slot',
             mechanical=['deck2_payload_has_no_number_slot']),
        dict(table='id_input', row='ID01_payload_object', families=allf,
             anchors=[anchor(D, "                       expected_key=base.identity(c, p, source, recipe))")],
             proof='the identity input is the payload p, an object by sch_payload (and EV03) before the identity row'),
        dict(table='id_scope', row='ID03_application_custody', families=scope_families,
             anchors=[anchor(D, "    if refused('d2_env_d', has_operation='operation_id' in p,")],
             proof='for application scope d2_env_d runs first and requires the application source to equal '
                   '{server_id, original_operation_id} of the owner record (strings by the sources schema), so a missing source '
                   'refuses at ER09 before the identity'),
        dict(table='id_scope', row='ID03_application_custody', families=project_only,
             anchors=[anchor(E, "    application = bool(scoped and scope_object and payload['scope'].get('kind') == 'app')")],
             proof='the row refuses only for an application identity; a project-only family is never scoped, so application is '
                   'False'),
        dict(table='id_preimage', row='ID04_preimage_encodable', families=allf,
             anchors=[anchor(D, "               expected_partition=base.partition_of(e['scope_kind'], e['project_id']), payload_size=base.physical_size(p)):")],
             proof='every identity field pattern excludes lone surrogates and the payload is EVENT_VALUE-encodable (DE13) '
                   'before the identity preimage is measured', mechanical=['identity_field_patterns_exclude_lone_surrogates']),
        dict(table='wd_gate', row='WD02_admitted_uint64', families=allf,
             anchors=[anchor(E, "STORAGE_UINT64_FIELDS = frozenset({"), anchor(E, "    schema = dict(read('Plans/ds15_original_evidence.schema.json'), required=required)")],
             proof='admitted_sequence is an authority integer (AT02 type, AT03 minimum 0 over the whole input first) and a '
                   'Storage uint64 slot of the closed original evidence schema, whose number rule (storage_uint64) refuses a '
                   'value past 2^64-1 at EVIDENCE_numbers before writer withdrawal reads it'),
        dict(table='wd_gate', row='WD03_frontier_uint64', families=allf,
             anchors=[anchor(E, "STORAGE_UINT64_FIELDS = frozenset({"), anchor(E, "    schema = dict(read('Plans/ds15_original_evidence.schema.json'), required=required)")],
             proof='as WD02 for withdrawal_frontier'),
        dict(table='d2_env_storage', row='DE13_payload_encodable', families=project_only,
             anchors=[anchor(D, "               expected_partition=base.partition_of(e['scope_kind'], e['project_id']), payload_size=base.physical_size(p)):")],
             proof='every string of this family payload carries the ASCII identifier pattern (no lone surrogate passes '
                   'sch_payload) and the payload has no other member kind, so it always has an EVENT_VALUE encoding',
             mechanical=['payload_strings_patterned']),
        dict(table='d2_env_d', row='ER08_record_operation', families=[n for n in allf if 'operation_id' not in
                                                                       b.read(contracts[n]['payload_schema_ref'])['properties']],
             anchors=[anchor(D, "    if refused('d2_env_d', has_operation='operation_id' in p,")],
             proof="the row refuses only when the payload has operation_id; this family's closed payload schema has none"),
        dict(table='d2_env_d', row='ER09_app_source', families=project_only,
             anchors=[anchor(D, "    application = scope['kind'] == 'app'")],
             proof='the row refuses only for an application-scope payload; a project-only family builds a project scope'),
        dict(table='d2_env_d', row='ER10_app_original_source', families=project_only,
             anchors=[anchor(D, "    application = scope['kind'] == 'app'")],
             proof='as ER09'),
        dict(table='cm_domain', row='CM01_v1_domain', families=allf,
             anchors=[anchor(D, "            or not valid('sch_original_event', event_schema, original, original_recipe)):"),
                      anchor(E, "        if schema_refused('sch_original_event', validator(read('Plans/event_record.schema.json'), recipe),")],
             proof='commitment() applies recipe_numbers_ok(ds15-v1) to the original event; at every complete boundary '
                   'sch_original_event applies the same ds15-v1 integer domain (ds15IntegerDomain) to the same event first '
                   '(envelope_ok before receipt_ok; the receipt boundary validates it explicitly)'),
    ]


def worst_case_size(b, schema):
    """EVENT_VALUE size of a maximal instance of a closed, array-free, string-bounded schema (None if not bounded).

    Every member is present at its largest value: a string at its maxLength in 4-byte UTF-8 (patterns ignored, so
    this over-estimates), the longest const/enum literal, True for booleans. A member the object level leaves
    unbounded counts as bounded only when allOf if/then branches bound it for every value of the enumerated
    discriminator they test (the deck-2 scope project_id: a 256-character string for project, null for app).
    """
    def leaf(node):
        if not isinstance(node, dict):
            return None, False
        if 'const' in node:
            return copy.deepcopy(node['const']), True
        if 'enum' in node:
            return max(node['enum'], key=lambda v: len(json.dumps(v))), True
        kinds = node.get('type')
        kinds = kinds if isinstance(kinds, list) else [kinds]
        if 'object' in kinds or 'properties' in node:
            value = obj(node)
            return value, value is not None
        for keyword in ('anyOf', 'oneOf'):
            if keyword in node:
                values = [leaf(branch) for branch in node[keyword]]
                if not all(ok for _, ok in values):
                    return None, False
                return max((v for v, _ in values), key=lambda v: len(json.dumps(v))), True
        if 'array' in kinds:
            return None, False
        if 'string' in kinds:
            n = node.get('maxLength')
            return ('\U0010ffff' * n, True) if n is not None else (None, False)
        if 'boolean' in kinds:
            return True, True
        if kinds == ['null']:
            return None, True
        return None, False

    def obj(node):
        if node.get('additionalProperties', True) is not False:
            return None
        out = {}
        for key, sub in node.get('properties', {}).items():
            value, ok = leaf(sub)
            if not ok:
                branches = []
                for part in node.get('allOf', []):
                    cond = (part.get('if') or {}).get('properties', {})
                    then = (part.get('then') or {}).get('properties', {})
                    if key in then and len(cond) == 1:
                        (disc, test), = cond.items()
                        branches.append((disc, test.get('const'), leaf(then[key])))
                discs = {d for d, _, _ in branches}
                if len(discs) != 1:
                    return None
                disc = discs.pop()
                domain = node['properties'][disc].get('enum', [])
                covered = {v for _, v, (_, ok2) in branches if ok2}
                if not domain or set(domain) - covered:
                    return None
                value = max((val for _, _, (val, ok2) in branches if ok2), key=lambda v: len(json.dumps(v)))
            out[key] = value
        return out
    value = obj(schema)
    return b.physical_size(value) if isinstance(value, dict) else None


def integer_leaves(value, path=()):
    if isinstance(value, dict):
        for k, v in value.items():
            yield from integer_leaves(v, path + (k,))
    elif isinstance(value, list):
        for i, v in enumerate(value):
            yield from integer_leaves(v, path + (i,))
    elif type(value) is int:
        yield path


def integer_slots(schema):
    out = set()

    def walk(node, key=None):
        if isinstance(node, dict):
            kinds = node.get('type')
            kinds = kinds if isinstance(kinds, list) else [kinds]
            if 'integer' in kinds and key:
                out.add((key, node.get('minimum'), node.get('maximum')))
            for k, v in node.items():
                if k == 'properties':
                    for name, sub in v.items():
                        walk(sub, name)
                elif isinstance(v, (dict, list)):
                    walk(v, key if k in ('anyOf', 'oneOf', 'allOf', 'items') else None)
        elif isinstance(node, list):
            for v in node:
                walk(v, key)
    walk(schema)
    return sorted(out, key=repr)


def integer_slot_names(schema):
    names = set()

    def walk(node, key=None):
        if isinstance(node, dict):
            kinds = node.get('type')
            kinds = kinds if isinstance(kinds, list) else [kinds]
            if 'integer' in kinds and key:
                names.add(key)
            for k, v in node.items():
                if k == 'properties':
                    for name, sub in v.items():
                        walk(sub, name)
                elif isinstance(v, (dict, list)):
                    walk(v, key if k in ('anyOf', 'oneOf', 'allOf', 'items') else None)
        elif isinstance(node, list):
            for v in node:
                walk(v, key)
    walk(schema)
    return names


# =========================================================================== schema
def spy_schema_calls(deck):
    """Record (phase, validator, instance) of every schema occurrence during one call; return a restore function."""
    b = deck.base
    original = b.schema_refused
    calls = []

    def spy(phase, v, instance):
        calls.append((phase, v, instance))
        return original(phase, v, instance)
    b.schema_refused = spy
    return calls, (lambda: setattr(b, 'schema_refused', original)), original


def locate(data, instance):
    """Path of instance inside data by identity, or a projection {key: path} when instance is a dict of data nodes."""
    paths = {}

    def walk(node, path):
        if isinstance(node, (dict, list)):
            paths.setdefault(id(node), path)
            items = node.items() if isinstance(node, dict) else enumerate(node)
            for k, v in items:
                walk(v, path + (k,))
    walk(data, ())
    if id(instance) in paths:
        return ('node', paths[id(instance)])
    if isinstance(data, dict) and isinstance(instance, dict) and instance and set(instance) <= set(data) and all(
            data[k] is v if isinstance(v, (dict, list)) else data[k] == v for k, v in instance.items()):
        # the original-evidence carrier: the operation input less the members it does not carry (owner_records)
        return ('carrier', sorted(set(data) - set(instance)))
    if isinstance(instance, dict) and instance and all(isinstance(v, (dict, list)) and id(v) in paths for v in instance.values()):
        return ('projection', {k: paths[id(v)] for k, v in instance.items()})
    if isinstance(data, dict) and isinstance(data.get('owner_records'), dict):
        for ref, text in data['owner_records'].items():
            try:
                if isinstance(text, str) and json.loads(text) == instance:
                    return ('record_text', ref)
            except ValueError:
                pass
    return None


def schema_path_norm(path):
    """The error schema path of a site: jsonschema continues in the $ref target without a '$ref' element."""
    return tuple(k for k in path if not (isinstance(k, str) and k.startswith('$ref:')))


def site_pointer(path):
    """Readable schema location of a site, keeping each followed $ref."""
    return '/' + '/'.join(('{' + k[5:] + '}') if isinstance(k, str) and k.startswith('$ref:') else str(k) for k in path)


def evaluated_sites(v, instance):
    """Every (schema location, keyword, instance path) the validator evaluates for this instance (applicators followed)."""
    sites = []
    seen = set()

    def walk(validator, schema, value, ipath, spath, depth):
        if not isinstance(schema, dict) or depth > 40:
            return
        key = (id(schema), ipath)
        if key in seen:
            return
        seen.add(key)
        for keyword in ASSERTIONS:
            if keyword in schema:
                sites.append((spath, keyword, ipath, schema))
        if '$ref' in schema:
            resolved = validator._resolver.lookup(schema['$ref'])
            walk(validator.evolve(schema=resolved.contents, _resolver=resolved.resolver), resolved.contents, value, ipath,
                 spath + ('$ref:' + schema['$ref'],), depth + 1)
        if isinstance(value, dict):
            props = schema.get('properties', {})
            for k, sub in props.items():
                if k in value:
                    walk(validator, sub, value[k], ipath + (k,), spath + ('properties', k), depth + 1)
            for pattern, sub in schema.get('patternProperties', {}).items():
                for k in value:
                    if re.search(pattern, k):
                        walk(validator, sub, value[k], ipath + (k,), spath + ('patternProperties', pattern), depth + 1)
            extra = schema.get('additionalProperties')
            if isinstance(extra, dict):
                for k in value:
                    if k not in props and not any(re.search(p, k) for p in schema.get('patternProperties', {})):
                        walk(validator, extra, value[k], ipath + (k,), spath + ('additionalProperties',), depth + 1)
        if isinstance(value, list):
            items = schema.get('items')
            for i, item in enumerate(value):
                if isinstance(items, dict):
                    walk(validator, items, item, ipath + (i,), spath + ('items',), depth + 1)
        for i, sub in enumerate(schema.get('allOf', [])):
            walk(validator, sub, value, ipath, spath + ('allOf', i), depth + 1)
        for keyword in ('anyOf', 'oneOf'):
            for i, sub in enumerate(schema.get(keyword, [])):
                if validator.evolve(schema=sub).is_valid(value):
                    walk(validator, sub, value, ipath, spath + (keyword, i), depth + 1)
        if 'if' in schema:
            branch = 'then' if validator.evolve(schema=schema['if']).is_valid(value) else 'else'
            walk(validator, schema['if'], value, ipath, spath + ('if',), depth + 1)
            if branch in schema:
                walk(validator, schema[branch], value, ipath, spath + (branch,), depth + 1)
        if isinstance(schema.get('not'), dict):
            pass  # a 'not' subschema is evaluated only for its own verdict (the 'not' clause itself is the site)
    walk(v.original, v.original.schema, instance, (), (), 0)
    return sites


def at_path(value, path):
    for k in path:
        value = value[k]
    return value


def set_at(value, path, new):
    if not path:
        return copy.deepcopy(new)
    out = copy.deepcopy(value)
    node = out
    for k in path[:-1]:
        node = node[k]
    node[path[-1]] = copy.deepcopy(new)
    return out


def proposals(keyword, rule, seed):
    """Directed clause proposals: the intended keyword is named BEFORE the validator is consulted."""
    if keyword == 'type':
        kinds = rule['type'] if isinstance(rule['type'], list) else [rule['type']]
        for kind, value in (('null', None), ('object', {}), ('array', []), ('string', 'x'), ('boolean', False), ('integer', 7)):
            if kind not in kinds and not (kind == 'integer' and 'number' in kinds):
                yield 'wrong_' + kind, value
    elif keyword in ('const', 'enum'):
        if type(seed) is bool:
            yield 'outside_literal', not seed
        elif isinstance(seed, str):
            yield 'outside_literal', seed + 'c12'
        elif seed is None:
            yield 'outside_literal', 'c12'
        elif type(seed) is int:
            yield 'outside_literal', seed + 1
    elif keyword == 'required' and isinstance(seed, dict):
        for field in rule['required']:
            if field in seed:
                changed = copy.deepcopy(seed)
                del changed[field]
                yield 'missing/' + field, changed
    elif keyword == 'additionalProperties' and rule['additionalProperties'] is False and isinstance(seed, dict):
        yield 'extra_property', dict(seed, c12_unexpected=True)
    elif keyword == 'minLength' and isinstance(seed, str) and rule['minLength'] > 0:
        yield 'below_minimum', seed[:rule['minLength'] - 1]
    elif keyword == 'maxLength' and isinstance(seed, str):
        yield 'above_maximum', (seed or 'a') * (rule['maxLength'] // max(1, len(seed or 'a')) + 1)
    elif keyword == 'pattern' and isinstance(seed, str) and seed:
        yield 'trailing_lf', seed + '\n'
        yield 'foreign_character', '!' + seed[1:]
    elif keyword == 'format' and isinstance(seed, str):
        yield 'malformed_format', seed[:10] + ' ' + seed[11:] if len(seed) > 11 else 'not-a-date'
    elif keyword == 'minimum' and type(seed) is int:
        yield 'below_minimum', rule['minimum'] - 1
    elif keyword == 'maximum' and type(seed) is int:
        yield 'above_maximum', rule['maximum'] + 1
    elif keyword == 'minItems' and isinstance(seed, list) and rule['minItems'] > 0:
        yield 'too_few_items', seed[:rule['minItems'] - 1]
    elif keyword == 'maxItems' and isinstance(seed, list) and seed:
        yield 'too_many_items', seed + [copy.deepcopy(seed[0])] * (rule['maxItems'] + 1 - len(seed))
    elif keyword == 'uniqueItems' and rule['uniqueItems'] and isinstance(seed, list) and seed:
        yield 'duplicate_item', seed + [copy.deepcopy(seed[0])]
    elif keyword == 'uniqueItems' and rule['uniqueItems'] and seed == [] and isinstance(rule.get('items'), dict):
        items = rule['items']
        allowed = items.get('enum') or ([items['const']] if 'const' in items else None) or (
            ['c12'] if items.get('type') == 'string' else None)
        if allowed:  # an empty seed: two copies of one allowed item
            yield 'duplicate_allowed_item', [copy.deepcopy(allowed[0]), copy.deepcopy(allowed[0])]
    elif keyword in ('anyOf', 'oneOf'):
        for value in (7, 'c12', [], {}, None, False):
            yield 'no_branch/' + json.dumps(value), value
    elif keyword == 'not' and isinstance(seed, dict) and isinstance(rule['not'], dict) and 'required' in rule['not']:
        yield 'forbidden_members', dict(seed, **{k: 'c12' for k in rule['not']['required'] if k not in seed})


def sibling_entailment(keyword, rule):
    """A clause no value can violate alone because a sibling clause of the same node refuses the same values."""
    if keyword == 'minLength' and rule.get('minLength') == 1 and isinstance(rule.get('pattern'), str):
        if re.fullmatch(rule['pattern'], '') is None:
            return 'minLength 1: the sibling pattern requires a first character, so the empty string violates both'
    if keyword == 'minLength' and rule.get('minLength') == 1 and rule.get('format') == 'date-time':
        from pm_event_datetime import date_time
        from pm_event_numbers import Refusal
        try:
            date_time('')
        except Refusal:
            return 'minLength 1: the sibling format date-time (shared predicate) refuses the empty string too'
    if keyword == 'type' and ('const' in rule or 'enum' in rule):
        kinds = rule['type'] if isinstance(rule['type'], list) else [rule['type']]
        literals = [rule['const']] if 'const' in rule else rule['enum']
        names = {str: 'string', bool: 'boolean', type(None): 'null', dict: 'object', list: 'array', int: 'integer'}
        if all(names.get(type(v)) in kinds for v in literals):
            return 'type: every sibling const/enum literal has this type, so a wrong type also violates the literal set'
    return None


def branch_witness(errors, spath, keyword, ipath):
    """A clause inside an anyOf/oneOf branch: the only top-level error is the enclosing applicator at this instance
    path, and its context holds an error at exactly this clause (the branch fails at it)."""
    norm = schema_path_norm(spath)
    cut = max((i for i, k in enumerate(norm) if k in ('anyOf', 'oneOf')), default=None)
    if cut is None or len(errors) != 1:
        return None
    e = errors[0]
    if tuple(e.absolute_schema_path) != norm[:cut + 1] or tuple(e.absolute_path) != tuple(ipath):
        return None
    want = norm + (keyword,)
    if any(tuple(x.absolute_schema_path) == want for x in (e.context or ())):
        return '/'.join(map(str, norm[:cut + 1]))
    return None


def isolated(errors, spath, keyword, ipath, storage_fields):
    """All errors are exactly at this clause: its normalized schema path and keyword, at this instance path."""
    if not errors:
        return False
    want = schema_path_norm(spath) + (keyword,)
    for e in errors:
        if tuple(e.absolute_schema_path) == want and tuple(e.absolute_path) == tuple(ipath):
            continue
        if (keyword == 'format' and e.validator == 'format' and not e.absolute_schema_path and tuple(e.path) == tuple(ipath)
                and ipath and ipath[-1] in storage_fields):
            continue
        return False
    return True


def schema_mode(m16, deck, out):
    b = deck.base
    inventory, witnesses, invalid, kills, cb_invalid, closure, uncovered = [], [], [], [], [], [], []
    totals = {}
    for family in FAMILIES:
        c, f = c12.contract(deck, family), c12.fixture(deck, family)
        contexts = {}
        for base, op in valid_parents(deck, family):
            data = copy.deepcopy(f['bases'][base])
            calls, restore, _ = spy_schema_calls(deck)
            try:
                deck.evaluate(c, op, data)
            finally:
                restore()
            for phase, v, instance in calls:
                key = (phase, sha(v.original.schema))
                place = locate(data, instance)
                entry = contexts.setdefault(key, dict(phase=phase, v=v, seeds=[]))
                if len(entry['seeds']) < 8 and sha(instance) not in {sha(x['instance']) for x in entry['seeds']}:
                    entry['seeds'].append(dict(base=base, op=op, data=data, instance=copy.deepcopy(instance), place=place))
        for policy in [z for z in f.get('policy_cases', []) if z['expected'] != 'REFUSE'][:4]:
            carrier = {'payload': copy.deepcopy(policy['payload']), 'transition': copy.deepcopy(policy['transition'])}
            calls, restore, _ = spy_schema_calls(deck)
            try:
                deck.catalog_request(c, carrier['payload'], carrier['transition'])
            finally:
                restore()
            for phase, v, instance in calls:
                key = (phase, sha(v.original.schema))
                entry = contexts.setdefault(key, dict(phase=phase, v=v, seeds=[]))
                if len(entry['seeds']) < 8 and sha(instance) not in {sha(x['instance']) for x in entry['seeds']}:
                    entry['seeds'].append(dict(base=policy['id'], op='policy', data=carrier, instance=copy.deepcopy(instance),
                                               place=locate(carrier, instance)))
        fam = dict(occurrences=len(contexts), sites=0, witnessed=0, applicator=0, unwitnessed=0, cb_kills=0)
        for (phase, schema_sha), entry in sorted(contexts.items()):
            v = entry['v']
            row = b.table_rows(phase)[0][0]
            closure.append(dict(family=family, phase=phase, schema_sha256=schema_sha, reference_closure='verified_at_build',
                                recipe='ds15-v1' if 'ds15IntegerDomain' in v.original.schema else 'current'))
            site_map = {}
            for seed in entry['seeds']:
                for spath, keyword, ipath, rule in evaluated_sites(v, seed['instance']):
                    site_map.setdefault((spath, keyword), dict(ipath=ipath, rule=rule, seeds=[]))['seeds'].append((seed, ipath))
            for (spath, keyword), site in sorted(site_map.items(), key=lambda kv: json.dumps(kv[0], default=str)):
                fam['sites'] += 1
                record = dict(family=family, phase=phase, row=row, schema_sha256=schema_sha,
                              schema_pointer=site_pointer(spath), keyword=keyword,
                              instance_pointer='/' + '/'.join(map(str, site['ipath'])))
                if keyword == 'additionalProperties' and site['rule']['additionalProperties'] is True:
                    record['status'] = 'NO_ASSERTION'  # additionalProperties: true admits every member
                    inventory.append(record)
                    continue
                if keyword in APPLICATORS or (keyword == 'additionalProperties' and isinstance(site['rule']['additionalProperties'], dict)):
                    record['status'] = 'APPLICATOR_COVERED_BY_CHILDREN'
                    fam['applicator'] += 1
                    inventory.append(record)
                    continue
                if 'if' in schema_path_norm(spath):
                    # A clause of an if-condition never errors itself: it selects then/else, whose clauses are sites
                    # of their own (witnessed or covered below).
                    record['status'] = 'CONDITION_SELECTS_BRANCH'
                    fam['condition'] = fam.get('condition', 0) + 1
                    inventory.append(record)
                    continue
                sibling = sibling_entailment(keyword, site['rule'])
                if sibling:
                    record['status'] = 'ENTAILED_BY_SIBLING'
                    record['entailment'] = sibling
                    fam['sibling'] = fam.get('sibling', 0) + 1
                    inventory.append(record)
                    continue
                done = False
                for seed, ipath in site['seeds'][:3]:
                    try:
                        value = at_path(seed['instance'], ipath)
                    except (KeyError, IndexError, TypeError):
                        continue
                    for label, proposal in proposals(keyword, site['rule'], value):
                        mutated = set_at(seed['instance'], ipath, proposal)
                        errors = list(v.iter_errors(mutated))
                        ok = isolated(errors, spath, keyword, ipath, v.storage_fields)
                        branch = None if ok else branch_witness(errors, spath, keyword, ipath)
                        ok = ok or bool(branch)
                        attempt = dict(record, proposal=label, base=seed['base'], operation=seed['op'])
                        if not ok:
                            attempt['reason'] = 'not_isolated' if errors else 'accepted'
                            attempt['error_paths'] = sorted({'/'.join(map(str, e.absolute_schema_path)) for e in errors})[:4]
                            invalid.append(attempt)
                            continue
                        records = []
                        b.RECORDER = records
                        try:
                            refused = b.schema_refused(phase, v, mutated)
                        finally:
                            b.RECORDER = None
                        got = first_refusal(records)
                        if not refused or got is None or got[1] != row:
                            attempt['reason'] = 'phase_not_refused_at_row:' + repr(got)
                            invalid.append(attempt)
                            continue
                        witness = dict(attempt, status='BRANCH_WITNESS' if branch else 'CLAUSE_WITNESS',
                                       enclosing=branch, expected=[phase, row, got[2]], actual=got,
                                       control_sha256=sha(seed['instance']), negative_sha256=sha(mutated))
                        cb = complete_boundary(deck, c, seed, ipath, proposal, phase, row)
                        witness['complete_boundary'] = cb
                        if cb['status'] == 'KILLED':
                            kills.append(dict(witness, complete_boundary=None, cb=cb))
                            fam['cb_kills'] += 1
                        else:
                            cb_invalid.append(dict(record, proposal=label, **cb))
                        witnesses.append(witness)
                        done = True
                        break
                    if done:
                        break
                if not done:
                    co = co_asserted(b, v, phase, row, site, spath, keyword)
                    if co:
                        record.update(co)
                record['status'] = 'WITNESSED' if done else record.get('status', 'WHOLE_DEFINITION_COVER')
                if done:
                    fam['witnessed'] += 1
                elif record['status'] == 'CO_ASSERTED':
                    fam['co_asserted'] = fam.get('co_asserted', 0) + 1
                else:
                    fam['unwitnessed'] += 1
                    uncovered.append(record)
                inventory.append(record)
        totals[family] = fam
    out('schema-inventory.json', inventory)
    out('schema-clause-witnesses.json', witnesses)
    out('schema-invalid-proposals.json', invalid)
    out('schema-complete-boundary-kills.json', kills)
    out('schema-complete-boundary-invalid.json', cb_invalid)
    out('schema-reference-closure.json', closure)
    out('schema-whole-definition-covers.json', uncovered)
    summary = dict(totals=totals, sites=len(inventory), clause_witnesses=len(witnesses), invalid_proposals=len(invalid),
                   complete_boundary_kills=len(kills), complete_boundary_invalid=len(cb_invalid),
                   whole_definition_covers=len(uncovered))
    out('schema-summary.json', summary)
    return summary


def co_asserted(b, v, phase, row, site, spath, keyword):
    """No proposal violates this clause alone: find one the full schema refuses at this clause together with other
    clauses of the same instance location (named), refused by the real phase row."""
    want = schema_path_norm(spath) + (keyword,)
    for seed, ipath in site['seeds'][:3]:
        try:
            value = at_path(seed['instance'], ipath)
        except (KeyError, IndexError, TypeError):
            continue
        for label, proposal in proposals(keyword, site['rule'], value):
            mutated = set_at(seed['instance'], ipath, proposal)
            errors = list(v.iter_errors(mutated))
            paths = [tuple(e.absolute_schema_path) for e in errors]
            inner = [tuple(x.absolute_schema_path) for e in errors if e.validator in ('anyOf', 'oneOf') for x in (e.context or ())]
            if not errors or (want not in paths and want not in inner) or any(tuple(e.absolute_path) != tuple(ipath) for e in errors):
                continue
            records = []
            b.RECORDER = records
            try:
                refused = b.schema_refused(phase, v, mutated)
            finally:
                b.RECORDER = None
            got = first_refusal(records)
            if refused and got and got[1] == row:
                return dict(status='CO_ASSERTED', proposal=label, refused_at=got,
                            co_asserted_with=sorted('/'.join(map(str, p)) for p in paths if p != want))
    return None


def complete_boundary(deck, c, seed, ipath, proposal, phase, row):
    """The clause proposal placed in the complete operation input; KILLED only at exactly (phase, row)."""
    place, data = seed['place'], seed['data']
    if data is None or place is None:
        return dict(status='NOT_PLACEABLE', reason='instance is derived (parsed record, request carrier) or a value copy')
    if place[0] == 'node':
        target = place[1] + tuple(ipath)
        mutated = set_at(data, target, proposal)
    elif place[0] == 'carrier':
        if ipath:
            target = tuple(ipath)
            mutated = set_at(data, target, proposal)
        elif not isinstance(proposal, dict):
            return dict(status='NOT_PLACEABLE', reason='the carrier itself replaced by a non-object is the EV01 entry row')
        else:  # a carrier-level member added or removed; the members it does not carry stay
            target = ()
            mutated = dict(copy.deepcopy(proposal), **{k: copy.deepcopy(data[k]) for k in place[1]})
    elif place[0] == 'record_text':
        record = set_at(json.loads(data['owner_records'][place[1]]), tuple(ipath), proposal)
        mutated = copy.deepcopy(data)
        mutated['owner_records'][place[1]] = json.dumps(record, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
        target = ('owner_records', place[1]) + tuple(ipath)
    else:
        if not ipath or ipath[0] not in place[1]:
            return dict(status='NOT_PLACEABLE', reason='projection root member')
        target = place[1][ipath[0]] + tuple(ipath[1:])
        mutated = set_at(data, target, proposal)
    if seed['op'] == 'policy':
        result, records = recorded(deck, lambda: deck.catalog_request(c, copy.deepcopy(mutated['payload']),
                                                                       copy.deepcopy(mutated['transition'])))
    else:
        result, records = recorded(deck, lambda: deck.evaluate(c, seed['op'], mutated))
    got = first_refusal(records)
    status = 'KILLED' if got is not None and got[:2] == [phase, row] and c12.refused_result(result) else 'INVALID'
    return dict(status=status, operation=seed['op'], base=seed['base'], path='/'.join(map(str, target)),
                expected=[phase, row], actual=got, result=result if isinstance(result, dict) else repr(result))


# =========================================================================== datetime
def datetime_mode(m16, deck, out):
    from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time
    from pm_event_numbers import Refusal
    b = deck.base
    samples = [s['value'] for s in json.loads((ROOT / 'scripts/pm_event_datetime_timestamp_battery.json').read_text())['samples']]

    def ok(value, profile):
        try:
            date_time(value, profile=profile)
            return True
        except Refusal:
            return False
    sites = [
        # (site id, op, path, maintenance, refusing (phase,row), field profiles)
        ('current-envelope', 'payload', 'envelope', None, ('sch_envelope', 'ENVELOPE_schema')),
        ('retained-envelope', 'read', 'envelope', None, ('sch_envelope_v1', 'ENVELOPE_V1_schema')),
        ('retained-original-event', 'read', 'original/event', 'seal', ('sch_original_event', 'ORIGINAL_EVENT_schema')),
    ]
    fields = (('occurred_at_utc', (EVENT_RECORD,)), ('observed_at_utc', (EVENT_RECORD, STORAGE_UTC_Z)),
              ('persisted_at_utc', (EVENT_RECORD, STORAGE_UTC_Z)))
    results, disagreements, snapshots = [], [], []
    plans_bytes = file_sha('Plans/ds15_original_custody.json')
    inventory = datetime_inventory(deck)
    for family in FAMILIES:
        c, f = c12.contract(deck, family), c12.fixture(deck, family)
        base = f['bases']['project']
        for site, op, prefix, maintenance, refusing in sites:
            for field, profiles in fields:
                for value in samples:
                    data = copy.deepcopy(base)
                    node = at_path(data, tuple(prefix.split('/')))
                    original_value = node[field]
                    node[field] = value
                    custody_before = None
                    if maintenance == 'seal':
                        c12.maintain(b, c, data, ['commitments'], {})
                        restore, custody_before = compose_sealed(b, data)
                    try:
                        result, records = recorded(deck, lambda: deck.evaluate(c, op, data))
                    finally:
                        if maintenance == 'seal':
                            after = sha(custody_snapshot(b))
                            restore()
                            snapshots.append(dict(family=family, site=site, before=custody_before, after=after))
                    got = first_refusal(records)
                    valid = all(ok(value, p) for p in profiles)
                    expected = expected_datetime(b, site, field, value, original_value, valid, refusing, data, base)
                    agree = (got[:2] == list(expected) if expected is not None and got else got is None and expected is None)
                    row = dict(family=family, site=site, field=field, value=value, valid=valid,
                               profiles=list(profiles), expected=list(expected) if expected else None,
                               actual=got, result=result.get('result') if isinstance(result, dict) else repr(result))
                    results.append(row)
                    if not agree:
                        disagreements.append(row)
        # receipt acknowledged_at_utc: every receipt copy moved together (RC01/RC02 keep agreeing)
        for value in samples:
            data = copy.deepcopy(base)
            for path in ('receipt', 'custody/first_append_receipt', 'issued_result/first_append_receipt'):
                at_path(data, tuple(path.split('/')))['acknowledged_at_utc'] = value
            result, records = recorded(deck, lambda: deck.evaluate(c, 'read', data))
            got = first_refusal(records)
            valid = ok(value, EVENT_RECORD)
            expected = None if valid else ('sch_receipt', 'RECEIPT_schema')
            row = dict(family=family, site='retained-receipt', field='acknowledged_at_utc', value=value, valid=valid,
                       profiles=[EVENT_RECORD], expected=list(expected) if expected else None, actual=got,
                       result=result.get('result') if isinstance(result, dict) else repr(result))
            results.append(row)
            if (got[:2] if got else None) != (list(expected) if expected else None):
                disagreements.append(row)
    changed = [s for s in snapshots if s['before'] != s['after']]
    summary = dict(samples=len(samples), checks=len(results), disagreements=len(disagreements),
                   accepted=sum(r['actual'] is None for r in results), refused=sum(r['actual'] is not None for r in results),
                   sealed_scenarios=len(snapshots), custody_changed_by_read=len(changed),
                   plans_custody_unchanged=file_sha('Plans/ds15_original_custody.json') == plans_bytes,
                   inventory_nodes=len(inventory))
    out('datetime-inventory.json', inventory)
    out('datetime-corpus-disagreements.json', disagreements)
    out('datetime-corpus-summary.json', summary)
    out('datetime-corpus.json', results)
    return summary


def expected_datetime(b, site, field, value, original_value, valid, refusing, data, base):
    """Expected first refusal composed from the shared predicate and the shared producer digest only."""
    if not valid:
        return refusing
    if value == original_value:
        return None
    if site == 'current-envelope':
        return None
    # A retained read compares the CV-317 producer projection (Storage-assigned times excluded) with the original.
    if site == 'retained-envelope':
        same = b.recipe_producer_digest(b.V1, data['envelope']) == b.recipe_producer_digest(b.V1, base['original']['event'])
        return None if same else ('env_retry', 'EN17_semantic_digest')
    if site == 'retained-original-event':
        same = b.recipe_producer_digest(b.V1, base['envelope']) == b.recipe_producer_digest(b.V1, data['original']['event'])
        return None if same else ('env_retry', 'EN17_semantic_digest')
    raise AssertionError(site)


def custody_snapshot(b):
    custody = b.original_custody()
    return dict(stores=custody['stores'], manifests=custody['manifests'],
                sealed={'|'.join(k): [[e[0]._asdict() if hasattr(e[0], '_asdict') else repr(e[0]), e[1], e[2]] for e in v]
                        for k, v in sorted(custody['sealed'].items())})


def compose_sealed(b, data):
    """Scenario composition BEFORE a read: the committed sealed custody plus the receipt Storage sealed with this
    original at write time. Returns (restore, snapshot sha before the read)."""
    import pm_ds15_p2b_cases as p2b
    from pm_event_numbers import OriginalBinding
    composed = copy.deepcopy(b.original_custody())
    row = p2b.binding_row(b, data)
    key = (row['binding']['storage_instance_id'], row['original_ref'])
    composed['sealed'].setdefault(key, []).append((OriginalBinding(**row['binding']), row['event_type'], row['write_recipe']))
    saved = b.original_custody
    b.original_custody = lambda: composed
    before = sha(custody_snapshot(b))
    return (lambda: setattr(b, 'original_custody', saved)), before


def datetime_inventory(deck):
    """Every format: date-time node and Storage-assigned UTC-Z field the deck-2 boundaries validate."""
    b = deck.base
    nodes = []
    resources = {'Plans/event_record.schema.json': ('sch_envelope', 'sch_envelope_v1', 'sch_original_event'),
                 'Plans/event_append_receipt_contracts.schema.json': ('sch_receipt', 'sch_custody', 'sch_result')}
    for c in deck.read('Plans/ds15_deck2_contracts.json'):
        for ref in (c['payload_schema_ref'], c['checkpoint_schema_ref'], 'Plans/ds15_deck2_context.schema.json',
                    'Plans/ds15_deck2_sources.schema.json', 'Plans/ds15_original_evidence.schema.json',
                    'Plans/ds15_index_inputs.schema.json'):
            resources.setdefault(ref, ())
    for ref, phases in sorted(resources.items()):
        text = (ROOT / ref).read_text().splitlines()
        for i, line in enumerate(text, 1):
            if '"date-time"' in line:
                nodes.append(dict(resource=ref, line=i, quote=line.strip(), phases=list(phases),
                                  profile='event_record', shared_check='pm_event_datetime.date_time via format_checker'))
    storage = b.storage_datetime_fields(b.read('Plans/event_record.schema.json'))
    for field in storage:
        nodes.append(dict(resource='Plans/event_record.schema.json', field=field, profile='storage_utc_z',
                          phases=['sch_envelope', 'sch_envelope_v1', 'sch_original_event'],
                          shared_check='pm_event_datetime.date_time(profile=STORAGE_UTC_Z) (storage_datetime_errors)'))
    return nodes


# =========================================================================== retained
def retained_mode(m16, deck, out):
    b = deck.base
    plans = file_sha('Plans/ds15_original_custody.json')
    observations = []
    for family in FAMILIES:
        c, f = c12.contract(deck, family), c12.fixture(deck, family)
        inputs = [(f'base/{name}', op, data) for name, data in f['bases'].items() for op in RETAINED_OPS]
        for case in f['cases']:
            if case['operation'] in RETAINED_OPS:
                data = copy.deepcopy(f['bases'][case['base']])
                b.patch(data, case['changes'])
                b.patch(data, case.get('derived_observations', {}))
                inputs.append((f'case/{case["id"]}', case['operation'], data))
        for w in c12.fixture_cases():
            if w['family'] == family and w['operation'] in RETAINED_OPS:
                _, data, _ = c12.build(deck, w)
                inputs.append((w['id'], w['operation'], data))
        for wid, op, data in inputs:
            before = sha(custody_snapshot(b))
            supplied = copy.deepcopy(data)
            result, records = recorded(deck, lambda: deck.evaluate(c, op, data))
            after = sha(custody_snapshot(b))
            got = first_refusal(records)
            selection = next((r for r in records if r[0] == 'rd_recipe'), None)
            observations.append(dict(family=family, witness=wid, operation=op,
                                     result=result.get('result') if isinstance(result, dict) else repr(result),
                                     first_refusal=got, selection=selection[1] if selection else None,
                                     resolved='rd_resolve' in {r[0] for r in records},
                                     custody_before=before, custody_after=after, input_unchanged=supplied == data))
    changed = [o for o in observations if o['custody_before'] != o['custody_after'] or not o['input_unchanged']]
    summary = dict(observations=len(observations), accepted=sum(o['first_refusal'] is None for o in observations),
                   refused=sum(o['first_refusal'] is not None for o in observations),
                   selected=sum(o['selection'] is not None for o in observations),
                   resolved=sum(o['resolved'] for o in observations), changed=len(changed),
                   plans_custody_unchanged=file_sha('Plans/ds15_original_custody.json') == plans,
                   custody_sha256=plans,
                   by_first_row={k: sum(1 for o in observations if (o['first_refusal'] or [None, None])[1] == k)
                                 for k in sorted({(o['first_refusal'] or [None, None])[1] for o in observations
                                                  if o['first_refusal']} | set())})
    out('retained-observations.json', observations)
    out('retained-summary.json', summary)
    return summary


# =========================================================================== regressions
def regressions_mode(m16, deck, out):
    """The two complete-boundary exceptions C12-DS15 found and fixed, on every family: each input now gets the checker's
    own refusal, never an exception. Neither is a table witness (the first parent is itself the defect; the second is
    refused by two rows of one table by construction)."""
    rows = []
    for family in FAMILIES:
        c, f = c12.contract(deck, family), c12.fixture(deck, family)
        cases = [('history-carrier-at-envelope-boundary', 'history', 'envelope_boundary', {}, ['sch_d2_context', 'D2_CONTEXT_schema'])]
        cases += [(f'source-last-sequence-u64max-{op}', 'project', op, {'selected_source/last_sequence': 2 ** 64 - 1},
                   ['cp_source', 'CS03_source_high']) for op in ('checkpoint', 'rebuild')]
        for rid, base, op, changes, expected in cases:
            data = copy.deepcopy(f['bases'][base])
            deck.base.patch(data, changes)
            result, records = recorded(deck, lambda: deck.evaluate(c, op, data))
            got = first_refusal(records)
            rows.append(dict(family=family, regression=rid, operation=op, expected=expected, actual=got,
                             result=result.get('result') if isinstance(result, dict) else repr(result),
                             ok=not isinstance(result, tuple) and got is not None and got[:2] == expected))
    out('regressions.json', rows)
    return dict(regressions=len(rows), failed=sum(not r['ok'] for r in rows), disagreements=sum(not r['ok'] for r in rows))


# =========================================================================== numbers
def numbers_mode(m16, deck, out):
    spec = importlib.util.spec_from_file_location('ds15_c12_corpus', ROOT / 'scripts/pm-ds15-number-corpus.py')
    corpus = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(corpus)
    values = corpus.corpus_values()
    long_values = sorted(v for v in values if len(v.lstrip('-')) >= 4400)
    routes, disagreements = [], []
    contracts = {c['event_type']: c for c in deck.read('Plans/ds15_deck2_contracts.json')}
    for family in FAMILIES:
        for route, data, path, run, want in corpus.routes(family, contracts[family], False):
            for spelling in sorted(values):
                ok, candidate = corpus.with_spelling(data, path, spelling)
                got = run(candidate) if ok else False
                expected = want(spelling)
                row = dict(family=family, route=route, spelling=spelling[:40] + ('...' if len(spelling) > 40 else ''),
                           digits=len(spelling), expected=expected, actual=got)
                routes.append(row)
                if got != expected:
                    disagreements.append(row)
    # A valid 4,400-digit integer (CV-1100 sets no global cap) at every complete-boundary place one can stand: it must
    # give the checker's own refusal or acceptance, never an exception (the crash DX, DS15, DF, DM and DCO found).
    big = 10 ** 4399
    places = (('payload', 'envelope/producer_sequence_id'), ('payload', 'envelope/payload/c12_number'),
              ('read', 'envelope/payload/c12_number'), ('withdraw_writer', 'admitted_sequence'),
              ('checkpoint', 'checkpoint/through_sequence_id'), ('read', 'receipt/segment_generation'))
    crashes = []
    for family in FAMILIES:
        c, f = c12.contract(deck, family), c12.fixture(deck, family)
        for op, path in places:
            data = copy.deepcopy(f['bases']['project'])
            deck.base.patch(data, {path: big})
            result, records = recorded(deck, lambda: deck.evaluate(c, op, data))
            row = dict(family=family, route='long_integer_4400', operation=op, path=path, digits=4400,
                       expected='no exception', actual=result.get('result') if isinstance(result, dict) else repr(result),
                       first_refusal=first_refusal(records))
            routes.append(row)
            if isinstance(result, tuple):
                crashes.append(row)
                disagreements.append(row)
    # Every integer leaf of every family's project and application bases at the uint64/int64 edges, 2^64 and a 4,400-digit
    # value, through every complete operation: the checker's own result, never an exception. C12-DS15 found one class
    # here: selected_source.last_sequence = 2^64-1 (a valid Storage uint64) raised OverflowError in the checkpoint and
    # rebuild source contiguity observation (claimed_range now bounds it; the input refuses at CS03, two rows by
    # construction with CS04, so it is a regression check rather than a table witness).
    edge_values = {'u64max': 2 ** 64 - 1, 'u64max+1': 2 ** 64, 'i64min-1': -(2 ** 63) - 1, 'big4400': big, 'zero': 0}
    sweep_runs, sweep_crashes, regression = 0, [], []
    for family in FAMILIES:
        c, f = c12.contract(deck, family), c12.fixture(deck, family)
        for bname in [n for n in ('project', 'application') if n in f['bases']]:
            base = f['bases'][bname]
            for path in integer_leaves(base):
                for vname, val in edge_values.items():
                    data = copy.deepcopy(base)
                    deck.base.patch(data, {'/'.join(map(str, path)): val})
                    for op in OPS:
                        sweep_runs += 1
                        result, records = recorded(deck, lambda: deck.evaluate(c, op, copy.deepcopy(data)))
                        if isinstance(result, tuple):
                            sweep_crashes.append(dict(family=family, base=bname, operation=op, path='/'.join(map(str, path)),
                                                      value=vname, error=result[1]))
                        if path == ('selected_source', 'last_sequence') and vname == 'u64max' and op in ('checkpoint', 'rebuild'):
                            regression.append(dict(family=family, base=bname, operation=op,
                                                   result=result.get('result') if isinstance(result, dict) else repr(result),
                                                   first_refusal=first_refusal(records)))
    out('numbers-edge-sweep.json', dict(runs=sweep_runs, exceptions=sweep_crashes, overflow_regression=regression))
    disagreements += sweep_crashes
    disagreements += [r for r in regression if r['first_refusal'] is None or r['first_refusal'][1] != 'CS03_source_high']
    summary = dict(values=len(values), long_values=len(long_values), route_runs=len(routes), disagreements=len(disagreements),
                   long_integer_4400_runs=len(FAMILIES) * len(places), long_integer_4400_exceptions=len(crashes),
                   edge_sweep_runs=sweep_runs, edge_sweep_exceptions=len(sweep_crashes), overflow_regression=len(regression),
                   accepted=sum(1 for r in routes if r['actual'] is True), refused=sum(1 for r in routes if r['actual'] is False),
                   self_test='run separately: python3 scripts/pm_event_numbers.py --self-test --scope numbers',
                   routes=sorted({r['route'] for r in routes}))
    out('numbers-routes.json', routes)
    out('numbers-summary.json', summary)
    return summary


# =========================================================================== gated
def gated_mode(m16, deck, out, family, collection, max_rss=1900, low=12, resume=13, negative_limit=10, control_limit=10):
    """One family's gated proof on the unchanged tool, from the pinned collection of pm-ds15-guard-tables.py.

    Each table this family reaches runs with only this family's own controls and negatives, except that a row this family
    has no negative for (a row it cannot refuse first: its entailment is in --mode entailed) is exercised by other
    families' negatives of that row, marked assisting, so the table can certify and the family's own rows keep their
    credit. An assisting negative is never credited to this family: the matrix credits a row as this family's own only
    when every negative the tool cut for it names this family.
    """
    import gzip
    import pickle
    import time
    import pm_ds15_guard_suites as suites
    g = suites.g
    root = suites.ROOT
    sources = (sorted(root.glob('scripts/pm_ds15*.py')) + sorted(root.glob('scripts/pm-ds15*.py'))
               + [root / 'scripts/pm_guard_isolation.py', root / 'scripts/pm_event_numbers.py']
               + sorted(root.glob('Plans/ds15_*.json')) + [root / 'Plans/event_number_recipe_corpus.json'])
    inputs = {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(set(sources))}
    saved = pickle.loads(Path(collection).read_bytes())
    if saved['inputs'] != inputs:
        raise SystemExit('collection was made from different checker, table, fixture or tool sources')
    gate = g.MemoryGate(max_rss, low, resume, 30, 2700)
    summary = dict(tool_sha256=inputs['scripts/pm_guard_isolation.py'], source_sha256=inputs, family=family, assisted=True,
                   collection_sha256=hashlib.sha256(Path(collection).read_bytes()).hexdigest(), suites=[])
    for phase in sorted(saved['collected']):
        full = saved['collected'][phase]
        slot = suites.family_slot(full, family)
        if not slot['controls'] and not slot['negatives']:
            continue
        own_targets = {n['target'] for n in slot['negatives'].values()}
        rows = [name for name, _, _ in suites.table_rows(phase)]
        assisting = {}
        for k, n in full['negatives'].items():
            if n['target'] not in own_targets and k not in slot['negatives']:
                assisting[k] = dict(n, kind='assisting-' + n['kind'])
                if n['control'] and n['control'] not in {c['id'] for c in slot['controls'].values()}:
                    for ck, cv in full['controls'].items():
                        if cv['id'] == n['control']:
                            slot['controls'][ck] = cv
        slot['negatives'].update(assisting)
        controls, negatives = list(slot['controls'].values()), list(slot['negatives'].values())
        entry = dict(phase=phase, rows=rows, controls=len(controls), negatives=len(negatives),
                     own_targets=sorted(own_targets), assisted_rows=sorted({n['target'] for n in assisting.values()}),
                     row_negatives={r: sum(1 for n in negatives if n['target'] == r and n['kind'].startswith('assisting-') is False)
                                    for r in rows},
                     lane_matrix=suites.lane_matrix(phase, controls, negatives))
        entry['rows_without_negative'] = [r for r in rows if r not in {n['target'] for n in negatives}]
        if negatives and controls:
            path = root / f'scripts/{suites.TABLE_PREFIX}{phase}.py'
            stops = [e for e in g.prescan_sources(path) if e['kind'] in g.STATIC_STOP_KINDS]
            suite = suites.suite_for(phase, slot, negative_limit, control_limit)
            t = time.monotonic()
            report = g.run(suite, memory=gate) if not stops else g.prescan_report(stops)
            name = f'{phase}.json.gz'
            target = out('__dir__', None) / name
            with gzip.open(target, 'wt') as handle:
                handle.write(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
            rows_report = report.get('rows', [])
            entry.update(tool_status=report['status'], seconds=round(time.monotonic() - t, 1),
                         proved=sorted(r['id'] for r in rows_report if r.get('proved')),
                         unproved=sorted(report.get('unproved_guards', [])), masked=report.get('masked_negatives', []),
                         unrelated=sum(len(r.get('unrelated_changes', [])) for r in rows_report),
                         report=name, report_sha256=hashlib.sha256(target.read_bytes()).hexdigest())
            print(f"{phase} {entry['tool_status']} proved {len(entry['proved'])}/{len(rows)} assisted {entry['assisted_rows']}",
                  file=sys.stderr, flush=True)
        summary['suites'].append(entry)
    out('summary-' + family + '.json', summary)
    bad = [x['phase'] for x in summary['suites'] if x.get('tool_status') not in (None, 'PASS')]
    return dict(family=family, tables=len(summary['suites']), failed_tables=bad,
                rows_proved=sum(len(x.get('proved', [])) for x in summary['suites']),
                lane_matrix_problems=sum(len(x['lane_matrix']) for x in summary['suites']))


# =========================================================================== matrix
OWNER = 'Plans/Section15_MVP_Promoted_Features_Spec.md'
# (clause id, paragraph label in the family's owner unit, exact sentence fragment quoted from it, guard tables)
CLAUSES = [
    ('producer-transition', 'Producer:', 'Producer:',
     ['d2_pl_gate', 'd2_pl_gate_entailed', 'd2_tr_browser', 'd2_grants', 'd2_tr_catalog_a', 'd2_tr_catalog_b', 'd2_tr_update',
      'd2_tr_remove', 'd2_tr_skipped', 'd2_tr_skipped_origin']),
    ('listed-uses', 'Exact approved listed uses', 'Exact approved listed uses', ['d2_request', 'sch_d2_transition']),
    ('scope-identity', 'Scope and identity:', 'Original event_id is allocated once and retained.',
     ['env_identity', 'id_input', 'id_scope', 'id_scope_entailed', 'id_preimage', 'sch_id_fields', 'sch_id_fields_n',
      'sch_id_fields_v1', 'sch_id_fields_v1_n', 'd2_env_d', 'd2_env_b', 'd2_env_b_entailed', 'env_retry', 'cp_scope']),
    ('closed-payload', 'Closed payload:', 'Unknown version/field fails closed.' if False else 'Closed payload:',
     ['sch_payload', 'sch_payload_v1', 'sch_d2_context', 'sch_d2_context_retained', 'sch_d2_context_v1', 'schema_references',
      'raw_ingress', 'ev_input', 'authority_types']),
    ('numbers', 'Closed payload:', 'Numbers (sweep 2026-11-08): current inputs follow CV-1100 and SP-1100',
     ['sch_payload_n', 'sch_payload_v1_n', 'sch_envelope_n', 'sch_envelope_v1_n', 'sch_original_event_n', 'sch_receipt_n',
      'sch_custody_n', 'sch_result_n', 'sch_evidence_n', 'sch_index_inputs_n', 'sch_checkpoint_n', 'sch_prior_checkpoint_n',
      'env_producer', 'wd_gate']),
    ('retained-sp1101', 'Closed payload:', 'Retained originals keep the frozen ds15-v1 profile they were written under, selected only through SP-1101',
     ['rd_recipe', 'rd_resolve', 'rd_resolve_entailed_sx03', 'rd_resolve_entailed_sx04', 'rd_resolve_entailed_sx06',
      'rd_resolve_entailed_sx07', 'cm_domain', 'cm_value', 'ev_outcome_domain']),
    ('timestamps', 'Closed payload:', 'Timestamps follow CV-1101 through the shared predicate',
     ['sch_envelope', 'sch_envelope_v1', 'sch_original_event']),
    ('inline-size', 'Closed payload:', 'SP-337 resolves bodies over the 16384-byte inline boundary',
     ['d2_env_storage', 'd2_env_storage_entailed', 'cp_size']),
    ('original-source-custody', 'Original source and custody:', 'outcome_ref resolves independently retained owning-component record bytes',
     ['d2_or_bytes', 'd2_ev_bank', 'sch_d2_owner_records', 'sch_d2_source', 'd2_env_c', 'd2_env_c_entailed', 'rc_copies',
      'rc_commitment_copies', 'rc_commitment', 'rc_custody', 'sch_receipt', 'sch_custody', 'sch_result', 'sch_evidence',
      'ev_outcome', 'ev_original_copies', 'ev_original_ids', 'ev_original_ids_entailed', 'ev_outcome_ref']),
    ('read-recheck', 'Original source and custody:', 'are rechecked on read; a checkpoint grants no access',
     ['ev_disclosure', 'ev_disclosure_owner']),
    ('replay', 'Replay and transitions:', 'Current writer/retry refuses projector_replay_only as replay_only_not_appendable',
     ['replay_only', 'ev_append_recovery', 'ev_publish', 'ev_receipt_pending']),
    ('consumer-checkpoint', 'Consumer and checkpoint:', 'Advance by atomic CAS of complete prior and new checkpoint',
     ['sch_checkpoint', 'sch_prior_checkpoint', 'sch_index_inputs', 'cp_guard', 'cp_matches', 'cp_prior', 'cp_prior_entailed',
      'cp_range', 'cp_range_entailed', 'cp_row', 'cp_row_entailed', 'cp_source', 'tk_storage', 'ev_rebuild']),
    ('compatibility-withdrawal', 'Compatibility and withdrawal:', 'exact 1.0.0 writer/reader/schema only',
     ['d2_env_a', 'ev_reader']),
]


def unit_lines(family, contracts):
    """{paragraph label: (line number, line text)} of the family's owner unit, at the current text."""
    unit = contracts[family]['semantic_owner'].split('#')[1]
    lines = (ROOT / OWNER).read_text().splitlines()
    start = next(i for i, ln in enumerate(lines) if ln.startswith('### ' + unit + ' '))
    end = next((i for i in range(start + 1, len(lines)) if lines[i].startswith('### ')), len(lines))
    out = {}
    labels = [label for _, label, _, _ in CLAUSES] + ['Oracles:']
    for i in range(start, end):
        for label in labels:
            if lines[i].startswith('  ' + label):
                out.setdefault(label, (i + 1, lines[i]))
    return unit, out


def gated_rows(guard_dir, family):
    """{(phase, row): evidence} from this family's own gated tool run (--family F)."""
    import gzip
    summary = json.loads((guard_dir / ('summary-' + family + '.json')).read_text())
    rows = {}
    for suite in summary['suites']:
        report = None
        if suite.get('report'):
            path = guard_dir / suite['report']
            report = json.loads(gzip.open(path, 'rt').read())
            assert hashlib.sha256(path.read_bytes()).hexdigest() == suite['report_sha256']
        by_row = {r['id']: r for r in (report or {}).get('rows', [])}
        negs = {n['id']: n for n in (report or {}).get('negatives', [])} if report else {}
        for name in suite['rows']:
            r = by_row.get(name)
            rows[(suite['phase'], name)] = dict(
                tool_status=suite.get('tool_status'), proved=bool(r and r.get('proved')),
                own_negatives=sorted(r.get('own', [])) if r else [],
                witnesses=sorted({str(negs.get(n, {}).get('defect', n))[:160] for n in (r or {}).get('own', [])}),
                own_families_only=all(('(' + family + ')') in str(negs.get(n, {}).get('defect', '')) for n in (r or {}).get('own', [])),
                cut_flips=len(r.get('flips', [])) if r else 0, stays=len(r.get('stays', [])) if r else 0,
                restoration=[x['outcome'] for x in r.get('restoration', [])] if r else [],
                masked=len(r.get('masked', [])) if r else 0, unrelated=len(r.get('unrelated_changes', [])) if r else 0,
                report=suite.get('report'), report_sha256=suite.get('report_sha256'),
                lane_matrix_problems=len(suite.get('lane_matrix', [])), family_negatives=suite.get('row_negatives', {}).get(name, 0))
    return summary, rows


def matrix_mode(m16, deck, out, guard_dir, entailed_path):
    contracts = {c['event_type']: c for c in deck.read('Plans/ds15_deck2_contracts.json')}
    ent = json.loads(Path(entailed_path).read_text())
    tool_ent = {(r['table'], r['row']): r for r in ent['tool_unproved']}
    fam_ent = {}
    for r in ent['family']:
        for f in r['families']:
            fam_ent[(f, r['table'], r['row'])] = r
    table_clause = {}
    for cid, _, _, tables in CLAUSES:
        for t in tables:
            table_clause.setdefault(t, []).append(cid)
    result, totals = {}, {}
    for family in FAMILIES:
        unit, lines = unit_lines(family, contracts)
        summary, rows = gated_rows(guard_dir / ('fam-' + family), family)
        reached = sorted(rows)
        clauses = []
        for cid, label, fragment, tables in CLAUSES:
            if label not in lines:
                continue  # the paragraph is not in this family's unit (catalog listed uses)
            line, text = lines[label]
            assert fragment in text, (family, cid, fragment)
            entries = []
            for phase, row in reached:
                if phase not in tables:
                    continue
                ev = rows[(phase, row)]
                if ev['proved'] and ev['own_negatives'] and ev['own_families_only']:
                    status = 'PROVED_BY_OWN_WITNESSES'
                elif (phase, row) in tool_ent:
                    status = 'ENTAILED_SINGLETON'
                elif (family, phase, row) in fam_ent:
                    # cannot be refused first by this family; when proved, only by assisting negatives of other families
                    status = 'ENTAILED_FOR_FAMILY'
                else:
                    status = 'OPEN'
                entries.append(dict(table=phase, row=row, status=status, **ev))
            clauses.append(dict(clause=cid, owner=dict(path=OWNER, unit=unit, line=line, quote=fragment,
                                                       sha256=file_sha(OWNER)), rows=entries))
        unmapped = sorted({p for p, _ in reached if p not in table_clause})
        statuses = [e['status'] for c in clauses for e in c['rows']]
        mapped = {(e['table'], e['row']) for c in clauses for e in c['rows']}
        totals[family] = dict(tables=len({p for p, _ in reached}), rows=len(reached), mapped_rows=len(mapped),
                              proved_own=sum(1 for p in reached if rows[p]['proved'] and rows[p]['own_negatives']
                                             and rows[p]['own_families_only']),
                              entailed_singleton=sum(1 for p in reached if p in tool_ent),
                              entailed_family=sum(1 for p in reached if (family,) + p in fam_ent and not (
                                  rows[p]['proved'] and rows[p]['own_negatives'] and rows[p]['own_families_only'])),
                              open=sorted(f'{e["table"]}:{e["row"]}' for c in clauses for e in c['rows'] if e['status'] == 'OPEN'),
                              unmapped_tables=unmapped, tool_failures=sorted({s['phase'] for s in summary['suites']
                                                                             if s.get('tool_status') not in (None, 'PASS')}),
                              masked=sum(rows[p]['masked'] for p in reached), unrelated=sum(rows[p]['unrelated'] for p in reached),
                              lane_matrix_problems=sum(len(s.get('lane_matrix', [])) for s in summary['suites']),
                              cut_flips=sum(rows[p]['cut_flips'] for p in reached))
        result[family] = clauses
    out('coverage-matrix.json', result)
    out('coverage-summary.json', totals)
    return totals


# =========================================================================== ledger
def ledger_mode(m16, deck, out, guard_dir, evidence, derivation):
    """Exact expected-code mutation ledger per family. Only an exact expected refusal is a kill; every other outcome
    is INVALID and listed separately. Four categories, never summed into one total."""
    witnesses = json.loads((evidence / 'schema-clause-witnesses.json').read_text())
    cb_kills = json.loads((evidence / 'schema-complete-boundary-kills.json').read_text())
    sch_invalid = json.loads((evidence / 'schema-invalid-proposals.json').read_text())
    cb_invalid = json.loads((evidence / 'schema-complete-boundary-invalid.json').read_text())
    corpus = json.loads((evidence / 'datetime-corpus.json').read_text())
    derived = json.loads(Path(derivation).read_text())
    cases = c12.fixture_cases()
    families = {}
    for family in FAMILIES:
        summary, rows = gated_rows(guard_dir / ('fam-' + family), family)
        proved = [k for k, v in rows.items() if v['proved'] and v['own_negatives']]
        attempts = [a for a in derived['attempts'] if a['id'].split('/')[1] == family]
        families[family] = dict(
            checker_row_cuts=dict(rows_cut=len(proved), own_negative_flips=sum(rows[k]['cut_flips'] for k in proved),
                                  other_negatives_kept_exact=sum(rows[k]['stays'] for k in proved),
                                  restorations=sum(len(rows[k]['restoration']) for k in proved),
                                  tool_status_pass=all(v['tool_status'] in (None, 'PASS') for v in rows.values())),
            input_witnesses=dict(kills=sum(w['family'] == family for w in cases),
                                 invalid_attempts=sum(a['status'] != 'KILL' for a in attempts)),
            schema=dict(phase_kills=sum(w['family'] == family for w in witnesses),
                        complete_boundary_kills=sum(w['family'] == family for w in cb_kills),
                        invalid_proposals=sum(w['family'] == family for w in sch_invalid),
                        complete_boundary_invalid=sum(w['family'] == family and w.get('status') == 'INVALID' for w in cb_invalid),
                        complete_boundary_not_placeable=sum(w['family'] == family and w.get('status') == 'NOT_PLACEABLE'
                                                            for w in cb_invalid)),
            datetime=dict(refusal_kills=sum(r['family'] == family and not r['valid'] and r['expected'] is not None
                                            and r['actual'] is not None and r['actual'][:2] == r['expected'] for r in corpus),
                          valid_controls=sum(r['family'] == family and r['valid'] for r in corpus),
                          disagreements=sum(r['family'] == family and ((r['actual'] or [None, None])[:2] != r['expected']
                                                                      if r['expected'] else r['actual'] is not None) for r in corpus)))
    ledger = dict(families=families, rule='only the exact expected (phase, row, code) refusal is a kill; INVALID listed '
                  'separately; categories are never summed')
    out('ledger.json', ledger)
    return {f: (v['checker_row_cuts']['own_negative_flips'], v['input_witnesses']['kills'], v['schema']['complete_boundary_kills'])
            for f, v in families.items()}


# =========================================================================== grade
BEFORE = 'reports/event-authority-20261104/DS15-self-grade.json'


def json_line(path, needle_family, needle):
    """Line of the first occurrence of needle after the family's event_type line in a JSON report."""
    lines = (ROOT / path).read_text().splitlines()
    start = next(i for i, ln in enumerate(lines) if f'"event_type": "{needle_family}"' in ln)
    for i in range(start, len(lines)):
        if needle in lines[i]:
            return {'path': path, 'line': i + 1, 'quote': needle, 'sha256': file_sha(path)}
    raise AssertionError((path, needle_family, needle))


def grade_mode(m16, deck, out, evidence):
    """Criterion-12 regrade of the seven families from the evidence summaries; every quote re-read at its line."""
    contracts = {c['event_type']: c for c in deck.read('Plans/ds15_deck2_contracts.json')}
    ev = {name: json.loads((evidence / name).read_text()) for name in (
        'coverage-summary.json', 'schema-summary.json', 'datetime-corpus-summary.json', 'retained-summary.json',
        'numbers-summary.json', 'entailed.json', 'c12-check.json', 'ledger.json', 'regressions.json')}
    pins = {name: hashlib.sha256((evidence / name).read_bytes()).hexdigest() for name in sorted(ev)}
    before = json.loads((ROOT / BEFORE).read_text())
    E = 'scripts/pm-ds15-event-contracts.py'
    D = 'scripts/pm-ds15-deck2-contracts.py'
    rows = []
    for family in FAMILIES:
        c = contracts[family]
        unit, lines = unit_lines(family, contracts)
        prior = next(r for r in before['rows'] if r['event_type'] == family)['cells']['positive_negative_oracles']
        cov = ev['coverage-summary.json'][family]
        sch = ev['schema-summary.json']['totals'][family]
        led = ev['ledger.json']['families'][family]
        evidence_quotes = [
            anchor(OWNER, '  Oracles: '), anchor(OWNER, 'python3 scripts/pm-ds15-deck2-contracts.py --family ' + family),
            anchor(OWNER, '  Closed payload: Plans/' + c['payload_schema_ref'].split('/')[-1]),
            json_line(BEFORE, family, '"status": "PARTIAL"'),
            anchor(E, 'def claimed_range(first, last, rows):'),
            anchor(D, "    if not retry and not context_ok(c, d.get('context')):"),
            anchor('scripts/pm_ds15_c12_cases.py', '"""C12-DS15 own-family witnesses for the seven deck-2 families'),
            anchor('scripts/pm-ds15-guard-tables.py', "    parser.add_argument('--family'"),
        ]
        # the unit's own Oracles line is the first match after the unit heading
        oracle_line = lines['Oracles:'][0]
        evidence_quotes[0] = {'path': OWNER, 'line': oracle_line, 'quote': '  Oracles: ', 'sha256': file_sha(OWNER)}
        evidence_quotes[1] = {'path': OWNER, 'line': oracle_line,
                              'quote': 'python3 scripts/pm-ds15-deck2-contracts.py --family ' + family, 'sha256': file_sha(OWNER)}
        evidence_quotes[2] = {'path': OWNER, 'line': lines['Closed payload:'][0],
                              'quote': '  Closed payload: ' + c['payload_schema_ref'], 'sha256': file_sha(OWNER)}
        open_items = (cov['open'] + cov['unmapped_tables'] + cov['tool_failures']
                      + (['masked'] if cov['masked'] else []) + (['unrelated'] if cov['unrelated'] else [])
                      + (['lane_matrix'] if cov['lane_matrix_problems'] else [])
                      + (['schema_whole_definition_covers'] if sch['unwitnessed'] else [])
                      + (['datetime_disagreements'] if ev['datetime-corpus-summary.json']['disagreements'] else [])
                      + (['number_disagreements'] if ev['numbers-summary.json']['disagreements'] else [])
                      + (['retained_store_changed'] if ev['retained-summary.json']['changed'] else [])
                      + (['entailment_checks'] if ev['entailed.json']['failed_checks'] else [])
                      + (['c12_witnesses'] if ev['c12-check.json']['status'] != 'pass' else [])
                      + (['regressions'] if any(not r['ok'] for r in ev['regressions.json'] if r['family'] == family) else []))
        status = 'PASS' if not open_items else 'PARTIAL'
        finding = (f"{unit} {family}@{c['family_revision']}: every guard row the complete deck-2 checker reaches for this family "
                   f"({cov['rows']} rows in {cov['tables']} tables) is proved by the gated tool from this family's own "
                   f"single-defect witnesses ({cov['proved_own']} rows) or carries a checked entailment proof "
                   f"({cov['entailed_singleton']} singleton-table rows, {cov['entailed_family']} family-constant or "
                   f"earlier-boundary rows); {sch['sites']} evaluated schema clause sites: {sch['witnessed']} isolated or branch "
                   f"witnesses through the real validator and phase row, {sch['cb_kills']} exact complete-boundary kills, the rest "
                   'applicator, condition, sibling-entailed or co-asserted with named clauses; shared date-time battery, number '
                   'corpus and edge sweep, sealed-receipt retained reads with custody snapshots, and the full original suite pass. '
                   'Native execution NOT_RUN; membership ABSENT; independent review NOT_RUN.')
        rows.append(dict(event_type=family, family_revision=c['family_revision'], owner_unit=unit,
                         criterion='positive_negative_oracles', before=dict(status=prior['status'], source=BEFORE,
                                                                           source_sha256=file_sha(BEFORE), finding=prior['finding']),
                         after=dict(status=status, finding=finding, open=open_items),
                         counts=dict(coverage=cov, schema=sch, ledger=led), evidence=evidence_quotes))
    audit = []
    for r in rows:
        for q in r['evidence']:
            text = (ROOT / q['path']).read_text().splitlines()[q['line'] - 1]
            audit.append(dict(path=q['path'], line=q['line'], quote=q['quote'], match=q['quote'] in text,
                              sha256_match=file_sha(q['path']) == q['sha256']))
    grade = dict(schema_id='pm.pnc019.c12.ds15.self_grade.v1', lane='C12-DS15', criterion=12,
                 assessed_tree=git_head(), native_execution='NOT_RUN', membership='ABSENT', independent_review='NOT_RUN',
                 evidence_root='/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/c12-ds15',
                 evidence_sha256=pins, rows=rows,
                 quote_audit=dict(quotes=len(audit), mismatches=[a for a in audit if not (a['match'] and a['sha256_match'])]))
    out('C12-DS15-self-grade.json', grade)
    return dict(families={r['event_type']: (r['before']['status'], r['after']['status'], r['after']['open']) for r in rows},
                quotes=len(audit), quote_mismatches=len(grade['quote_audit']['mismatches']))


def git_head():
    import subprocess
    return subprocess.run(['git', '-C', str(ROOT), 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--mode', required=True, choices=('entailed', 'schema', 'datetime', 'retained', 'numbers', 'regressions', 'gated', 'matrix', 'ledger', 'grade'))
    parser.add_argument('--collection', type=Path, help='gated: the pinned collection of pm-ds15-guard-tables.py --save-collection')
    parser.add_argument('--derivation', type=Path, help='ledger: c12-derivation.json of pm_ds15_c12_cases.py --derive')
    parser.add_argument('--evidence', type=Path, help='grade: the directory holding every mode summary')
    parser.add_argument('--guard', type=Path, help='matrix: the directory of the per-family gated runs (--family F)')
    parser.add_argument('--entailed', type=Path, help='matrix: entailed.json of --mode entailed')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--family', action='append', help='restrict to these families (default: all seven)')
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    global FAMILIES
    if args.family:
        FAMILIES = tuple(f for f in FAMILIES if f in args.family)

    def out(name, value):
        if name == '__dir__':
            return args.out
        (args.out / name).write_text(json.dumps(value, indent=1, sort_keys=True, ensure_ascii=True, default=str) + '\n')
    m16, deck = load()
    if args.mode == 'gated':
        assert args.family and len(args.family) == 1, 'gated runs one --family'
        summary = gated_mode(m16, deck, out, args.family[0], args.collection)
    elif args.mode == 'matrix':
        summary = matrix_mode(m16, deck, out, args.guard, args.entailed)
    elif args.mode == 'ledger':
        summary = ledger_mode(m16, deck, out, args.guard, args.evidence, args.derivation)
    elif args.mode == 'grade':
        summary = grade_mode(m16, deck, out, args.evidence)
    else:
        summary = globals()[args.mode + ('_mode' if args.mode not in ('entailed',) else '')](m16, deck, out)
    print(json.dumps(summary, sort_keys=True, default=str))
    bad = (summary.get('failed_checks') or summary.get('disagreements') or summary.get('changed')
           or summary.get('custody_changed_by_read') or summary.get('plans_custody_unchanged') is False
           or summary.get('quote_mismatches') or summary.get('failed_tables') or summary.get('lane_matrix_problems')
           or (args.mode == 'grade' and any(v[1] != 'PASS' for v in summary['families'].values()))
           or (args.mode == 'matrix' and any(v['open'] or v['unmapped_tables'] or v['tool_failures'] or v['masked']
                                             or v['unrelated'] or v['lane_matrix_problems'] for v in summary.values())))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
