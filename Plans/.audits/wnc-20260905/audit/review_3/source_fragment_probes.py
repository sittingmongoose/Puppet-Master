#!/usr/bin/env python3
"""Bounded source-fragment probes of a4111ec; NOT the full repo validator.

The inventory checker and reference resolver reproduce the fetched function
bodies. The synthetic inventory exercises those functions, not unrelated schema
families. The supersede argument schema is the inspected schema branch. The
size predicate is isolated from the inspected write invariant. No repo writes.
"""
from __future__ import annotations
import copy
import json
import re
from pathlib import Path
from typing import Any
from tempfile import TemporaryDirectory
import jsonschema

COMMIT = 'a4111ec28b91f0f8ebbec139a43db8416771fbcf'
ROOT = Path(__file__).parent
EXPECTED_NEGATIVE_TARGETS = {
    "neg_bad_epistemic_kind": "entry_envelopes[0]",
    "neg_body_over_limit": "entry_envelopes[0]",
    "neg_unknown_lifecycle": "entry_envelopes[0]",
    "neg_thread_scope_missing_thread": "entry_envelopes[0]",
    "neg_capsule_over_token_bound": "resume_capsules[0]",
    "neg_capsule_over_byte_bound": "resume_capsules[0]",
    "neg_committed_checkpoint_without_receipt": "notebook_checkpoints[0]",
    "neg_transition_native_success_without_observation": "context_transitions[0]",
    "neg_transition_done_rotated_conflation": "context_transitions[0]",
    "neg_unknown_tool": "tool_requests[0]",
    "neg_mixed_range_convention": "tool_requests[1]",
    "neg_unknown_error_code": "typed_errors[0]",
    "neg_applied_without_result_revision": "revision_mutations[0]",
    "neg_conflict_without_conflicting_revision": "revision_mutations[1]",
    "neg_import_without_restriction": "entry_envelopes[2]",
    "neg_crash_after_commit_discards_checkpoint": "context_transitions[2]",
    "neg_crash_before_commit_claims_checkpoint": "context_transitions[1]",
    "neg_chatread_missing_thread": "tool_requests[2]",
    "neg_fresh_context_legacy_arg_name": "tool_requests[3]",
    "neg_read_negative_offset": "tool_requests[1]",
    "neg_read_unknown_arg": "tool_requests[1]",
    "neg_write_create_with_entry_id": "tool_requests[4]",
    "neg_success_without_new_window": "context_transitions[0]",
    "neg_success_unavailable_controller": "context_transitions[0]",
    "neg_write_update_without_expected_revision": "tool_requests[5]",
    "neg_supersede_unknown_operation": "tool_requests[6]",
    "neg_supersede_null_expected_revision": "tool_requests[6]",
    "neg_chatread_without_message_or_item": "tool_requests[2]",
}
EXPECTED_NEGATIVE_IDS = set(EXPECTED_NEGATIVE_TARGETS)
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
TOOL_COVERAGE = {"notebook_search", "notebook_read", "notebook_write",
                 "notebook_supersede", "fresh_context_request", "chatread"}
EXPECTED_SCENARIO_IDS = {f"WNC-A{i:02d}" for i in range(1, 63)}
SCENARIO_DISPOSITIONS = {"static_fixture", "preexisting_static_fixture", "owner_prose_only", "process_evidence", "runtime_only_future"}

def _parse_mutation_path(path: str) -> list:
    tokens: list = []
    for segment in path.split("."):
        head, *brackets = segment.split("[")
        if head:
            tokens.append(head)
        for bracket in brackets:
            tokens.append(int(bracket.rstrip("]")))
    return tokens

# Source: scripts/pm-working-notebook-contracts.py::check_fixture_inventory.
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
    for negative in negatives:
        negative_id = negative.get("negative_id")
        expected_target = EXPECTED_NEGATIVE_TARGETS.get(negative_id)
        declared = negative.get("rejects")
        if expected_target is not None and declared != expected_target:
            problems.append(
                f"negative {negative_id!r} declares rejects {declared!r} but its semantic case is pinned to {expected_target!r} (FU-04)"
            )
        mutation_path = (negative.get("mutation") or {}).get("path", "")
        mutation_tokens = _parse_mutation_path(mutation_path)
        if expected_target is not None:
            target_tokens = _parse_mutation_path(expected_target)
            if mutation_tokens[:2] != target_tokens[:2]:
                problems.append(
                    f"negative {negative_id!r} mutates {mutation_path!r} outside its pinned target {expected_target!r} (FU-04)"
                )
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
        # A non-dictionary row must not slip past the disposition check (FU-04).
        if not isinstance(entry, dict):
            problems.append(f"scenario {scenario_id} entry must be an object with a disposition")
            continue
        disposition = entry.get("disposition")
        if disposition not in SCENARIO_DISPOSITIONS:
            problems.append(f"scenario {scenario_id} has disposition {disposition!r}")
            continue
        refs = entry.get("refs")
        if disposition in {"static_fixture", "preexisting_static_fixture", "owner_prose_only", "process_evidence"}:
            if not isinstance(refs, list) or not refs:
                problems.append(f"scenario {scenario_id} ({disposition}) requires non-empty refs")
                continue
            for ref in refs:
                problem = _scenario_ref_problem(disposition, ref, positive)
                if problem:
                    problems.append(f"scenario {scenario_id} ref {ref!r}: {problem}")
        elif disposition == "runtime_only_future" and not str(entry.get("note") or "").strip():
            problems.append(f"scenario {scenario_id} (runtime_only_future) requires a non-empty note")
    return problems

# Source: same file::_scenario_ref_problem.
def _scenario_ref_problem(disposition: str, ref: Any, positive: dict[str, Any]) -> str | None:
    if not isinstance(ref, str) or not ref.strip():
        return "ref must be a non-empty string"
    if disposition == "static_fixture":
        match = re.match(r"^([a-z_]+)\[(\d+)\]$", ref)
        if match is None:
            return "static refs must look like family[index]"
        family, index = match.group(1), int(match.group(2))
        rows = positive.get(family)
        if not isinstance(rows, list):
            return f"family {family} does not exist in the positive fixtures"
        if index >= len(rows):
            return f"index {index} out of range for {family} ({len(rows)} records)"
        return None
    if disposition == "preexisting_static_fixture":
        if not ref.startswith("external:"):
            return "preexisting refs must start with 'external:'"
        target = ref[len("external:"):].split()[0].strip()
        if not target:
            return "external ref needs a path"
        if not (ROOT / target).exists():
            return f"external path {target!r} does not exist"
        return None
    # owner_prose_only / process_evidence: concrete, existing repository reference
    target = ref.split("#", 1)[0].strip()
    if not target.startswith("Plans/"):
        return "owner/process refs must point into Plans/ (anchor optional)"
    if not (ROOT / target).exists():
        return f"referenced path {target!r} does not exist"
    return None

# Source: current schema's notebook_supersede args, self-contained.
SUPERSEDE_ARGS = {
    "type":"object", "additionalProperties":False,
    "required":["notebook_id","entry_id","request_id","expected_revision","operation"],
    "properties":{
        "notebook_id":{"type":"string","pattern":"^nb_[A-Za-z0-9]+$"},
        "entry_id":{"type":"string","pattern":"^wne_[A-Za-z0-9]+$"},
        "request_id":{"type":"string","minLength":1},
        "expected_revision":{"type":"integer","minimum":1},
        "operation":{"enum":["supersede","archive","tombstone"]},
        "supersedes_entry_revision":{
            "type":"object","additionalProperties":False,"required":["entry_id","revision"],
            "properties":{"entry_id":{"type":"string","pattern":"^wne_[A-Za-z0-9]+$"},
                          "revision":{"type":"integer","minimum":1}}
        }
    }
}

def synthetic_inventory():
    positive = {family:[{} for _ in range(n)] for family,n in FAMILY_MINIMUMS.items()}
    for family,ids in ANCHOR_RECORDS.items():
        field={"notebooks":"notebook_id","entry_envelopes":"entry_id",
               "context_transitions":"transition_id","notebook_checkpoints":"checkpoint_id"}[family]
        for row,identity in zip(positive[family],ids): row[field]=identity
    tools=["notebook_search","notebook_read","chatread","fresh_context_request",
           "notebook_write","notebook_write","notebook_supersede"]
    for row,tool in zip(positive['tool_requests'],tools): row['tool']=tool
    negatives=[{"negative_id":key,"rejects":target,
                "mutation":{"path":target+'.placeholder_field',"value":"invalid"}}
               for key,target in EXPECTED_NEGATIVE_TARGETS.items()]
    for row in negatives:
        if row['negative_id']=='neg_body_over_limit':
            row['mutation']={'path':'entry_envelopes[0].body','value_char_count':70000}
        if row['negative_id']=='neg_bad_epistemic_kind':
            row['mutation']={'path':'entry_envelopes[0].epistemic_kind','value':'verified'}
    scenarios={k:{'disposition':'static_fixture','refs':['entry_envelopes[0]']}
               for k in sorted(EXPECTED_SCENARIO_IDS)}
    return {'positive':positive,'negative':negatives,'acceptance_scenario_map':{'scenarios':scenarios}}

def main():
    global ROOT
    results=[]
    def record(name, observed, expected, detail=None):
        results.append({'probe':name,'observed':observed,'expected_contract_outcome':expected,
                        'conforms':observed==expected,'detail':detail})
    control={'notebook_id':'nb_A','entry_id':'wne_A','request_id':'req_A',
             'expected_revision':1,'operation':'archive'}
    validate=lambda obj:list(jsonschema.Draft202012Validator(SUPERSEDE_ARGS).iter_errors(obj))
    record('supersede with all schema fields',not bool(validate(control)),True)
    documented=copy.deepcopy(control); documented.pop('request_id')
    errs=validate(documented)
    record('supersede with exactly the documented required signature',not bool(errs),True,
           [e.message for e in errs])
    for field,value in [('operation',None),('expected_revision',None)]:
        obj=copy.deepcopy(control); obj[field]=value
        record('supersede rejects '+field+'=null',bool(validate(obj)),True)
    for operation in ['create','update','append']:
        # Isolated source predicate now executes before the operation branches.
        for body,expected in [('é'*32768,False),('é'*32768+'a',True),('é'*32769,True)]:
            reject=isinstance(body,str) and len(body.encode('utf-8'))>65536
            record(f'{operation} byte limit: {len(body.encode("utf-8"))} bytes',reject,expected)
    base=synthetic_inventory()
    record('inventory synthetic baseline',not bool(check_fixture_inventory(base)),True)
    obj=copy.deepcopy(base)
    next(n for n in obj['negative'] if n['negative_id']=='neg_body_over_limit')['mutation']={
        'path':'entry_envelopes[0].epistemic_kind','value':'verified'}
    record('size case replaced by epistemic-kind case within same record is rejected',
           bool(check_fixture_inventory(obj)),True)
    obj=copy.deepcopy(base)
    next(n for n in obj['negative'] if n['negative_id']=='neg_body_over_limit')['mutation']={
        'path':'tool_requests[0].tool','value':'notebook_dump_all'}
    record('cross-record replacement is rejected',bool(check_fixture_inventory(obj)),True)
    obj=copy.deepcopy(base); obj['acceptance_scenario_map']['scenarios']['WNC-A02']=None
    record('null scenario row is rejected',bool(check_fixture_inventory(obj)),True)
    obj=copy.deepcopy(base); obj['acceptance_scenario_map']['scenarios']['WNC-A02'].pop('refs')
    record('missing static refs rejected',bool(check_fixture_inventory(obj)),True)
    obj=copy.deepcopy(base); obj['acceptance_scenario_map']['scenarios']['WNC-A02']['refs']=['missing_family[1]']
    record('nonexistent static refs rejected',bool(check_fixture_inventory(obj)),True)
    with TemporaryDirectory() as temporary:
        ROOT=Path(temporary); (ROOT/'Plans').mkdir()
        (ROOT/'Plans'/'owner.md').write_text('# Real owner\n',encoding='utf-8')
        record('owner file reference accepted',_scenario_ref_problem('owner_prose_only','Plans/owner.md',base['positive']) is None,True)
        record('missing owner anchor detected',_scenario_ref_problem('owner_prose_only','Plans/owner.md#missing-anchor',base['positive']) is not None,True)
    out={'commit':COMMIT,'evidence_boundary':'source fragments + synthetic inventory; full checkout validator/test suite NOT_RUN',
         'count':len(results),'observations':results}
    print(json.dumps(out,indent=2))

if __name__=='__main__': main()
