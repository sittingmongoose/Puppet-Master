#!/usr/bin/env python3
"""Bounded reproductions of GitHub source inspected at 07382a95e9765890c8b56ab291c29144da60bf81.

These are source-fragment experiments, NOT a full checkout, the repository's
21-test suite, or runtime/governance execution. Relevant JSON Schema branches
are reproduced semantically; unrelated object families are not implemented.
The corpus-inventory checker below is copied from the inspected source.
"""
from __future__ import annotations
import argparse
import copy
import json
from pathlib import Path
from typing import Any
import jsonschema

COMMIT = '07382a95e9765890c8b56ab291c29144da60bf81'
TOOLS = ['notebook_search', 'notebook_read', 'notebook_write', 'notebook_supersede', 'fresh_context_request', 'chatread']
EXPECTED_NEGATIVE_IDS = {
    "neg_bad_epistemic_kind", "neg_body_over_limit", "neg_unknown_lifecycle",
    "neg_thread_scope_missing_thread", "neg_capsule_over_token_bound",
    "neg_capsule_over_byte_bound", "neg_committed_checkpoint_without_receipt",
    "neg_transition_native_success_without_observation",
    "neg_transition_done_rotated_conflation", "neg_unknown_tool",
    "neg_mixed_range_convention", "neg_unknown_error_code",
    "neg_applied_without_result_revision", "neg_conflict_without_conflicting_revision",
    "neg_import_without_restriction", "neg_crash_after_commit_discards_checkpoint",
    "neg_crash_before_commit_claims_checkpoint", "neg_chatread_missing_thread",
    "neg_fresh_context_legacy_arg_name", "neg_read_negative_offset",
    "neg_read_unknown_arg", "neg_write_create_with_entry_id",
    "neg_success_without_new_window", "neg_success_unavailable_controller",
    "neg_write_update_without_expected_revision", "neg_supersede_unknown_target_state",
    "neg_chatread_without_message_or_item",
}
FAMILY_MINIMUMS = {
    "notebooks": 1, "entry_envelopes": 3, "revision_mutations": 3,
    "resume_capsules": 1, "notebook_checkpoints": 1, "context_transitions": 4,
    "tool_requests": 7, "typed_errors": 3,
}
ANCHOR_RECORDS = {
    "notebooks": ["nb_01JEXAMPLENOTEBOOK"],
    "entry_envelopes": ["wne_01JEXAMPLEENTRY01", "wne_01JEXAMPLESTALE02", "wne_01JEXAMPLEIMPORT03"],
    "context_transitions": ["cwt_01JEXAMPLETRANS01", "cwt_01JEXAMPLECRASH01",
                             "cwt_01JEXAMPLECRASH02", "cwt_01JEXAMPLECRASH03"],
    "notebook_checkpoints": ["nbc_01JEXAMPLECKPT01"],
}
TOOL_COVERAGE = set(TOOLS)
EXPECTED_SCENARIO_IDS = {f"WNC-A{i:02d}" for i in range(1, 63)}
SCENARIO_DISPOSITIONS = {"static_fixture", "owner_prose_only", "runtime_only_future"}

# Exact checker body from scripts/pm-working-notebook-contracts.py.
def check_fixture_inventory(fixtures: dict[str, Any]) -> list[str]:
    """Fail-open validation is no validation: pin the fixture corpus itself (WNC-R04)."""
    problems: list[str] = []
    positive = fixtures.get("positive")
    if not isinstance(positive, dict):
        return ["positive fixture families missing entirely"]
    for family, minimum in FAMILY_MINIMUMS.items():
        rows = positive.get(family)
        if not isinstance(rows, list) or len(rows) < minimum:
            problems.append(f"positive family {family} has fewer than {minimum} records (coverage loss)")
    for family, ids in ANCHOR_RECORDS.items():
        rows = positive.get(family, [])
        id_field = {"notebooks": "notebook_id", "entry_envelopes": "entry_id",
                    "context_transitions": "transition_id", "notebook_checkpoints": "checkpoint_id"}[family]
        present = {row.get(id_field) for row in rows}
        for anchor in ids:
            if anchor not in present:
                problems.append(f"anchor record {family}/{anchor} missing from the fixture corpus")
    tools = {request.get("tool") for request in positive.get("tool_requests", [])}
    for tool in sorted(TOOL_COVERAGE - tools):
        problems.append(f"no positive request covers registered tool {tool}")
    negatives = fixtures.get("negative", [])
    seen = [negative.get("negative_id") for negative in negatives]
    for negative_id in sorted(set(seen) - EXPECTED_NEGATIVE_IDS):
        problems.append(f"unknown negative fixture id {negative_id!r} (inventory drift)")
    for negative_id in sorted(EXPECTED_NEGATIVE_IDS - set(seen)):
        problems.append(f"required negative fixture {negative_id!r} missing (coverage loss)")
    if len(seen) != len(set(seen)):
        problems.append("duplicate negative fixture ids present")
    scenario_map = fixtures.get("acceptance_scenario_map") or {}
    scenarios = scenario_map.get("scenarios") or {}
    present_ids = set(scenarios)
    for missing in sorted(EXPECTED_SCENARIO_IDS - present_ids):
        problems.append(f"acceptance scenario {missing} missing from the scenario map")
    for extra in sorted(present_ids - EXPECTED_SCENARIO_IDS):
        problems.append(f"unknown acceptance scenario {extra} in the scenario map")
    for scenario_id, entry in sorted(scenarios.items()):
        if isinstance(entry, dict) and entry.get("disposition") not in SCENARIO_DISPOSITIONS:
            problems.append(f"scenario {scenario_id} has disposition {entry.get('disposition')!r}")
    return problems


def object_schema(required, properties):
    return {'type': 'object', 'additionalProperties': False, 'required': required, 'properties': properties}

def ident(prefix, nullable=False):
    return {'type': ['string', 'null'] if nullable else 'string', 'pattern': '^'+prefix+'_[A-Za-z0-9]+$'}

# Relevant schema fragments. scope is held constant at the published valid
# thread-scope control, so no uninspected scope behaviors are inferred.
SCOPE = {'kind': 'thread', 'project_id': 'proj_alpha', 'binding_refs': {'thread_id': 'thr_01JEXAMPLETHREAD'}}
RANGE = object_schema(['convention', 'start', 'end'], {
    'convention': {'enum': ['unicode_char_offsets', 'utf8_byte_offsets']},
    'start': {'type': 'integer', 'minimum': 0}, 'end': {'type': 'integer', 'minimum': 0}})
WRITE_ARGS = object_schema(['notebook_id', 'operation', 'request_id'], {
    'notebook_id': ident('nb'), 'entry_id': ident('wne', True),
    'operation': {'enum': ['create', 'update', 'append']},
    'request_id': {'type': 'string', 'minLength': 1},
    'expected_revision': {'type': ['integer', 'null'], 'minimum': 1},
    'actor': {'type': ['string', 'null'], 'minLength': 1},
    'body': {'type': 'string', 'maxLength': 65536}, 'scope': {'const': SCOPE}})
SUPERSEDE_ARGS = object_schema(['notebook_id', 'entry_id', 'request_id'], {
    'notebook_id': ident('nb'), 'entry_id': ident('wne'),
    'request_id': {'type': 'string', 'minLength': 1},
    'expected_revision': {'type': ['integer', 'null'], 'minimum': 1},
    'target_state': {'enum': ['superseded', 'archived', 'tombstoned']}})
READ_ARGS = object_schema(['notebook_id', 'entry_id'], {
    'notebook_id': ident('nb'), 'entry_id': ident('wne'),
    'revision': {'type': ['integer','null'], 'minimum': 1},
    'range': RANGE, 'include_provenance': {'type': 'boolean'}})
CHAT_ARGS = object_schema(['thread_id'], {
    'thread_id': ident('thr'),
    'message_id': {'type': ['string','null'], 'minLength': 1},
    'item_id': {'type': ['string','null'], 'minLength': 1},
    'revision': {'type': ['integer','null'], 'minimum': 1},
    'range': RANGE, 'include_neighbors': {'type': 'boolean'}, 'include_tool_pair': {'type': 'boolean'}})
CHAT_ARGS['allOf'] = [{'oneOf': [
    {'required': ['message_id'], 'properties': {'message_id': {'type':'string'}}},
    {'required': ['item_id'], 'properties': {'item_id': {'type':'string'}}}]}]
REQUEST = object_schema(['tool', 'args'], {'tool': {'enum': TOOLS}, 'args': {'type': 'object'}})
REQUEST['allOf'] = []
for tool, args in [('notebook_write', WRITE_ARGS), ('notebook_supersede', SUPERSEDE_ARGS), ('notebook_read', READ_ARGS), ('chatread', CHAT_ARGS)]:
    REQUEST['allOf'].append({'if': {'properties': {'tool': {'const': tool}}, 'required': ['tool']},
                             'then': {'properties': {'args': args}}})
for op, required, properties in [
    ({'const':'create'}, ['body','scope'], {'entry_id': {'type':'null'}, 'expected_revision': {'type':'null'}}),
    ({'enum':['update','append']}, ['entry_id','expected_revision','body'], {'entry_id':{'type':'string'},'expected_revision':{'type':'integer'}}),
]:
    REQUEST['allOf'].append({'if': {'properties': {'tool': {'const':'notebook_write'}, 'args': {'properties': {'operation': op}, 'required':['operation']}}, 'required':['tool','args']},
                             'then': {'properties': {'args': {'required':required, 'properties':properties}}}})

# Exact relevant branch body from the inspected check_explicit_invariants.
def write_invariants(request):
    problems = []
    label = 'tool_requests[0]'
    args = request.get('args', {})
    if request.get("tool") == "notebook_write":
        operation = args.get("operation")
        if operation == "create":
            if args.get("entry_id") is not None or args.get("expected_revision") is not None:
                problems.append(f"{label}: create mints the entry host-side; it cannot carry a preassigned entry id or expected revision (WNC-N06)")
            if not args.get("body"):
                problems.append(f"{label}: create without a bounded body (WNC-N05)")
        elif operation in {"update", "append"}:
            if not isinstance(args.get("expected_revision"), int) or not args.get("entry_id"):
                problems.append(f"{label}: update/append require the CAS expected revision and an entry id (WNC-N06)")
            if len(args.get("body", "").encode("utf-8")) > 65536:
                problems.append(f"{label}: write body exceeds 64 KiB UTF-8 (WNC-N05)")
    return problems

SUCCESS_CONDITION = {
    'if': {'properties': {'state': {'enum':['activated','recovered_resumed']}}, 'required':['state']},
    'then': {'required':['admission_receipt_ref','checkpoint_ref','new_context_window_id'], 'properties': {
        'admission_receipt_ref':{'type':'string'}, 'checkpoint_ref':{'type':'string'},
        'new_context_window_id':{'type':'string'}, 'effective_controller':{'enum':['pm_managed','provider_native']}}}}
ROOT_FIELDS = ['schema_id','schema_version',*FAMILY_MINIMUMS]
ROOT = {'type':'object', 'additionalProperties':False, 'required':ROOT_FIELDS,
        'properties':{k:{} for k in ROOT_FIELDS}}
# As in the actual root schema, a raw request/transition has none of these
# fixture-family fields; thus these experiments never reach any $defs branch.

def schema_errors(value, schema=REQUEST):
    return [e.message for e in jsonschema.Draft202012Validator(schema).iter_errors(value)]

def inventory_control():
    p = {k: [{} for _ in range(n)] for k,n in FAMILY_MINIMUMS.items()}
    for fam, ids in ANCHOR_RECORDS.items():
        field = {'notebooks':'notebook_id','entry_envelopes':'entry_id','context_transitions':'transition_id','notebook_checkpoints':'checkpoint_id'}[fam]
        for row, rid in zip(p[fam], ids): row[field] = rid
    p['tool_requests'] = [{'tool':t} for t in TOOLS] + [{'tool':'notebook_write'}]
    return {'positive':p, 'negative':[{'negative_id':i} for i in sorted(EXPECTED_NEGATIVE_IDS)],
            'acceptance_scenario_map': {'scenarios':{i:{'disposition':'static_fixture','refs':['entry_envelopes[0]']} for i in sorted(EXPECTED_SCENARIO_IDS)}}}

def main():
    observations=[]
    def record(name, outcome, category, detail):
        observations.append({'probe':name,'observed':outcome,'category':category,'detail':detail})
    def req_case(name, req, category):
        errors = schema_errors(req)
        inv = write_invariants(req)
        record(name, 'accepted' if not errors and not inv else 'rejected', category, {'schema_errors':errors[:4], 'invariant_errors':inv})
    read = {'tool':'chatread','args':{'thread_id':'thr_A','message_id':'msg_A'}}
    create = {'tool':'notebook_write','args':{'notebook_id':'nb_A','operation':'create','request_id':'req_A','body':'Observation','scope':SCOPE}}
    req_case('valid chatread control', read, 'repaired_control')
    req_case('empty chatread args', {'tool':'chatread','args':{}}, 'repaired_counterexample')
    req_case('empty write args', {'tool':'notebook_write','args':{}}, 'repaired_counterexample')
    bad = copy.deepcopy(read); bad['args']['range']={'convention':'unicode_char_offsets','start':-4,'end':10}
    req_case('negative read start', bad, 'repaired_counterexample')
    req_case('schema-conforming create control', create, 'control')
    for field,value in [('epistemic_kind','observation'),('provenance_refs',[]),('validity_refs',[])]:
        bad=copy.deepcopy(create); bad['args'][field]=value
        req_case('documented write field '+field, bad, 'remaining_contract_drift')
    bad=copy.deepcopy(create); bad['args'].pop('notebook_id')
    req_case('create without documented optional notebook_id', bad, 'remaining_contract_drift')
    supersede = {'tool':'notebook_supersede','args':{'notebook_id':'nb_A','entry_id':'wne_A','request_id':'req_A'}}
    req_case('supersede without CAS revision or action',supersede,'remaining_acceptance_hole')
    bad=copy.deepcopy(supersede); bad['args'].update(expected_revision=None,target_state='archived')
    req_case('supersede with null CAS revision',bad,'remaining_acceptance_hole')
    bad={'tool':'notebook_supersede','args':{'notebook_id':'nb_A','entry_id':'wne_A','expected_revision':1,'operation':'archive'}}
    req_case('documented supersede operation argument',bad,'remaining_contract_drift')
    big=copy.deepcopy(create); big['args']['body']='é'*32769
    req_case('create with 32769 chars / 65538 UTF-8 bytes',big,'remaining_byte_bound_hole')
    big['args'].update(operation='update',entry_id='wne_A',expected_revision=1)
    req_case('update with same oversized UTF-8 body',big,'control')
    transition={'state':'activated','admission_receipt_ref':'admission_A','checkpoint_ref':'nbc_A','new_context_window_id':'cw2','effective_controller':'pm_managed'}
    record('success-state control','accepted' if not schema_errors(transition,SUCCESS_CONDITION) else 'rejected','repaired_control',{})
    for field,value in [('admission_receipt_ref',None),('new_context_window_id',None),('effective_controller','unavailable')]:
        bad=copy.deepcopy(transition); bad[field]=value
        errs=schema_errors(bad,SUCCESS_CONDITION)
        record('success-state '+field+'='+str(value),'rejected' if errs else 'accepted','repaired_counterexample',errs)
    bad=copy.deepcopy(transition); bad.pop('admission_receipt_ref')
    record('success-state absent receipt','rejected' if schema_errors(bad,SUCCESS_CONDITION) else 'accepted','repaired_counterexample',{})
    # A legal object is rejected by the wrong schema just like a malformed one.
    for name,obj in [('valid tool object',read),('valid success-state object',transition)]:
        errs=schema_errors(obj,ROOT)
        record(name+' tested against fixture root','rejected','vacuous_regression_control',errs[:4])
    inv=inventory_control()
    record('inventory control','accepted' if not check_fixture_inventory(inv) else 'rejected','control',{})
    bad=copy.deepcopy(inv); bad['negative']=[]
    record('delete all negatives','rejected' if check_fixture_inventory(bad) else 'accepted','repaired_counterexample',{})
    bad=copy.deepcopy(inv); bad['acceptance_scenario_map']['scenarios'].pop('WNC-A26')
    record('delete scenario key','rejected' if check_fixture_inventory(bad) else 'accepted','repaired_counterexample',{})
    bad=copy.deepcopy(inv); bad['acceptance_scenario_map']['scenarios']={k:None for k in EXPECTED_SCENARIO_IDS}
    record('all 62 scenario values null','accepted' if not check_fixture_inventory(bad) else 'rejected','remaining_inventory_hole',{})
    bad=copy.deepcopy(inv)
    for row in bad['acceptance_scenario_map']['scenarios'].values(): row['refs']=['does_not_exist[999]']
    record('all static references invalid','accepted' if not check_fixture_inventory(bad) else 'rejected','remaining_inventory_hole',{})
    bad=copy.deepcopy(inv)
    for row in bad['acceptance_scenario_map']['scenarios'].values(): row.pop('refs')
    record('all static references removed','accepted' if not check_fixture_inventory(bad) else 'rejected','remaining_inventory_hole',{})
    bad=copy.deepcopy(inv)
    for row in bad['negative']:
        row.update(rejects='not_a_family[999]',mutation={'path':'tool_requests[0].tool','value':'notebook_dump_all'})
    record('27 expected ids all use one identical unrelated mutation','accepted' if not check_fixture_inventory(bad) else 'rejected','remaining_inventory_hole',{'negative_count':len(bad['negative'])})
    parser=argparse.ArgumentParser(); parser.add_argument('command',nargs='?',choices=['validate']); parser.add_argument('--json',action='store_true')
    for argv in ([],['validate'],['--json'],['validate','--json']):
        parser.parse_args(argv)
    record('four documented argument forms','accepted','repaired_parser_control',{'boundary':'argparse interface only, not execution of repository commands'})
    result={'commit':COMMIT,'boundary':__doc__,'observation_count':len(observations),'observations':observations}
    path=Path(__file__).with_name('source_fragment_results.json'); path.write_text(json.dumps(result,indent=2)+'\n')
    for row in observations: print(row['observed'].upper().ljust(9),row['probe'])
    print('Wrote',path)
if __name__=='__main__': main()
