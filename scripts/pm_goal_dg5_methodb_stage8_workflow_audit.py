#!/usr/bin/env python3
"""Test the two published WorkflowSourceAudit rule lists on the original schema."""

import argparse
from collections import Counter
from copy import deepcopy
import gzip
from hashlib import sha256
import inspect
import json
from pathlib import Path
import pickle
import sys
from unittest.mock import patch

from pm_goal_dg5_methodb_stage3 import errors_list, require, write

ROOT = "dg5:62292171f4e95559"
ROW = "dg5/roots/schema"
FAMILY = "goal.cancelled"
VARIANTS = {
    "CA": "ee44bc5f845182886c2a747edbaef504f59c3f938f5c20e22f8f0d7b64a5d741",
    "CA3": "3e74d2690e4ca68078018d6cc6924e219dc233a2a6d109bfbb3474d4f2da00ab",
}
PRIOR_SHA256 = "452c04782660fad07d34349ad588818783018cbcdb9cc751c4814524b8114ffa"
THREAD = "https://puppetmaster.local/schemas/full-thread-runtime-contracts.v1.json"
THREAD_FILE = "file:///mnt/Cursor/PuppetMaster/Plans/full_thread_runtime_contracts.schema.json"
EVENT = "https://puppetmaster.local/schemas/event_record/2.0.0/event_record.schema.json"
EVENT_FILE = (
    "file:///home/sittingmongoose/PM-Experiments/workflow-cancel-disposition-source-20260913/"
    "v2/frozen-current/event_record.schema.json"
)
CUSTODY = "https://puppetmaster.local/proposals/goal_workflow_cancel_custody.v1.schema.json"
WITNESSED = {"KILLED", "COVERED_LATER"}


def original_control(directory, ref):
    import pm_goal_dg_ca3_cases as workflow
    import pm_goal_dg_ca_oracles as original
    from pm_goal_own_c3_w12b_roots import Roots

    seen = []
    check = Roots.check

    def observe(roots, realm, reference, value):
        result = check(roots, realm, reference, value)
        if reference == ref:
            site = sys._getframe(1)
            seen.append((roots.banks[realm], deepcopy(value), Path(site.f_code.co_filename), site.f_lineno))
        return result

    _, route = workflow.wf(original.Suite(directory))
    with patch.object(Roots, "check", observe):
        route.capture_source()
    require(len(seen) == 1, "the original source capture did not reach its audit definition")
    return seen[0]


def installed_validator(closure, bank, plain, variant):
    # The current captures had different preceding alias annotations. Recreate
    # those annotations only for aliases registered with the same original bytes.
    memo = closure.PREPARED.setdefault("memo", closure.AnnotationMemo())
    registry = plain._resolver._registry
    pairs = ((THREAD_FILE, THREAD, THREAD_FILE),
             (EVENT_FILE, EVENT, EVENT_FILE if variant == "CA" else EVENT))
    sources = {}
    for alias, canonical, annotation in pairs:
        require(bank.resource_origins[alias] == bank.resource_origins[canonical] and
                registry[alias].contents == registry[canonical].contents,
                f"the installed bank does not pin identical bytes for {alias}")
        for address in (alias, canonical):
            closure.annotate(registry[address].contents, annotation + "#", memo)
        sources[annotation] = bank.resource_origins[annotation]
    return closure.closure_validator(plain, ROOT, bank), sources


def workflow_examples(go, control):
    outcome_path = ("record", "nonterminal_outcome")
    outcome = go.get(control, outcome_path)
    no_receipt = dict(outcome, outcome="accepted", acknowledgement_receipt_ref=None,
                      acknowledgement_frame_id=None, acknowledgement_frame_offset=None,
                      same_frame_acknowledged=False)
    accepted = go.apply(control, outcome_path, no_receipt)
    prefix = THREAD_FILE + "#/$defs/CommandOutcomeRecord/allOf/4/else/properties/"
    examples = {
        prefix + field + "/" + keyword: (
            accepted, go.apply(accepted, (*outcome_path, field), value), (*outcome_path, field), message,
        )
        for field, keyword, value, message in (
            ("acknowledgement_frame_id", "type", outcome["acknowledgement_frame_id"],
             f"{outcome['acknowledgement_frame_id']!r} is not of type 'null'"),
            ("acknowledgement_frame_offset", "type", 0, "0 is not of type 'null'"),
            ("same_frame_acknowledged", "const", True, "False was expected"),
        )
    }
    identity_path = (*outcome_path, "identity")
    identity = dict(outcome["identity"], scope_kind="application", project_id=None,
                    project_home_server_id=None, named_plan_id=None)
    branch = go.apply(control, identity_path, identity)
    prefix = THREAD_FILE + "#/$defs/IdentityEnvelope/allOf/0/then/properties/"
    for member in ("project_id", "project_home_server_id", "named_plan_id"):
        examples[prefix + member + "/type"] = (
            branch, go.apply(branch, (*identity_path, member), "TEST_ONLY:project-member"),
            (*identity_path, member), "'TEST_ONLY:project-member' is not of type 'null'",
        )
    return examples


def event_examples(go, control):
    prefix = ("record", "producer_metadata")
    edits = (
        ("date_time_string/format", "occurred_at_utc", "not-a-date-time", "'not-a-date-time' is not a 'date-time'"),
        ("date_time_string/minLength", "occurred_at_utc", "", "'' is too short"),
        ("date_time_string/type", "occurred_at_utc", None, "None is not of type 'string'"),
        ("migration/closed_members", "migration", ("add", "stage8_extra"),
         "Additional properties are not allowed ('stage8_extra' was unexpected)"),
        ("migration/required", "migration", ("remove", "migrated_from_schema_id"),
         "'migrated_from_schema_id' is a required property"),
        ("migration/type", "migration", None, "None is not of type 'object'"),
        ("non_empty_string/minLength", "event_id", "", "'' is too short"),
        ("non_empty_string/type", "event_id", None, "None is not of type 'string'"),
        ("nullable_non_empty_string/anyOf", "run_id", True, "True is not valid under any of the given schemas"),
        ("nullable_non_empty_string/anyOf/1/type", "run_id", True, "True is not valid under any of the given schemas"),
        ("nullable_non_negative_integer/anyOf", "producer_sequence_id", True,
         "True is not valid under any of the given schemas"),
        ("nullable_non_negative_integer/anyOf/0/minimum", "producer_sequence_id", -1,
         "-1 is not valid under any of the given schemas"),
        ("nullable_non_negative_integer/anyOf/0/type", "producer_sequence_id", 1.5,
         "1.5 is not valid under any of the given schemas"),
        ("nullable_non_negative_integer/anyOf/1/type", "producer_sequence_id", True,
         "True is not valid under any of the given schemas"),
    )
    return {EVENT + "#/$defs/" + rule: (control, go.apply(control, (*prefix, member), change),
                                       (*prefix, member), message)
            for rule, member, change, message in edits}


def check_example(closure, go, plain, validator, rule, examples, leave_enabled):
    valid, invalid, path, message = examples
    require(valid is not None and invalid is not None and not list(plain.iter_errors(valid)) and
            not go.errors_of(validator, valid), f"{rule}: the rule control was refused")
    original = errors_list(plain.iter_errors(invalid))
    refused = go.errors_of(validator, invalid)
    removed = () if leave_enabled else {closure._guard_for_location(rule)}
    disabled = go.errors_of(validator, invalid, removed)
    restored = errors_list(go.errors_of(validator, invalid))
    before, after = go.locations(refused), go.locations(disabled)
    require(any(err[0] == list(path) and err[3] == message for err in original) and
            original == errors_list(refused) == restored,
            f"{rule}: the exact original refusal changed")
    require(rule in before and rule not in after, f"{rule}: disabling one rule did not change the refusal")
    return dict(cls="COVERED_LATER" if disabled else "KILLED", control=valid, invalid=invalid,
                original=original, disabled=errors_list(disabled), restored=restored,
                original_rules=sorted(before), still_refused_by=sorted(after))


def check_acknowledgement(closure, go, bank, validator, evidence):
    definition = THREAD + "#/$defs/CommandOutcomeRecord"
    record = bank.registry.resolver().lookup(definition).contents
    enclosing = bank.registry.resolver().lookup(CUSTODY + "#/$defs/NonterminalOutcome").contents
    receipt = "acknowledgement_receipt_ref"
    field = "same_frame_acknowledged"
    early, late = (record["allOf"][number] for number in (4, 7))
    require(enclosing["allOf"][0] == {"$ref": definition} and
            {receipt, field} <= set(record["required"]) and record["properties"][field] == {"type": "boolean"} and
            early["if"] == {"properties": {receipt: {"type": "string"}}, "required": [receipt]} and
            early["else"]["properties"][field] == {"const": False} and
            late["if"] == {"properties": {field: {"const": True}}, "required": [field]} and
            receipt in late["then"]["required"] and late["then"]["properties"][receipt]["type"] == "string",
            "the installed acknowledgement checks no longer require a receipt when the same-frame field is true")
    literal = THREAD_FILE + "#/$defs/CommandOutcomeRecord"
    rule = literal + "/allOf/4/else/properties/" + field + "/const"
    result = evidence[rule]
    later = {literal + "/allOf/7/then/properties/" + suffix for suffix in
             ("acknowledgement_frame_id/type", "acknowledgement_frame_offset/const", receipt + "/type")}
    require(set(result["still_refused_by"]) == later and set(result["original_rules"]) == {rule} | later,
            "the remaining acknowledgement checks changed")
    isolated = {}
    for other in sorted(later):
        trial = go.errors_of(validator, result["invalid"], {closure._guard_for_location(other)})
        require(go.locations(trial) == ({rule} | later) - {other}, f"{other}: the later rule did not isolate")
        isolated[other] = errors_list(trial)
    other_guards = {closure._guard_for_location(other) for other in later}
    require(go.locations(go.errors_of(validator, result["invalid"], other_guards)) == {rule} and
            not go.errors_of(validator, result["invalid"], other_guards | {closure._guard_for_location(rule)}) and
            errors_list(go.errors_of(validator, result["invalid"])) == result["original"],
            "the original rule could not be isolated and restored")
    result["implication"] = dict(source=definition, receipt_required_branch=late,
                                 no_receipt_branch=early, individually_disabled=isolated,
                                 conclusion="With no string receipt the required boolean must be false.")


def check_event_timestamps(closure, go, bank, validator, evidence):
    import pm_goal_own_c_roots as roots

    timestamp = EVENT + "#/$defs/date_time_string"
    metadata = CUSTODY + "#/$defs/ProducerMetadata"
    node = bank.registry.resolver().lookup(metadata).contents
    require(node["properties"]["occurred_at_utc"] == {"$ref": timestamp} and
            bank.registry.resolver().lookup(timestamp).contents ==
            {"type": "string", "format": "date-time", "minLength": 1},
            "the installed event and owner timestamp checks changed")
    profile = roots._timestamp_profiles(node)["occurred_at_utc"]
    date_time = roots.NR.DT.date_time
    properties_source = inspect.getsourcefile(roots._owned_properties)
    timestamp_source = inspect.getsourcefile(date_time)
    sources = [dict(path=Path(path).name, sha256=sha256(Path(path).read_bytes()).hexdigest(), name=function.__name__)
               for path, function in ((properties_source, roots._owned_properties), (timestamp_source, date_time))]
    fallback = metadata + "/properties"
    format_rule = timestamp + "/format"
    calls = []

    def skip_owner_fallback(value, **kwargs):
        caller = sys._getframe(1)
        if (caller.f_code is roots._owned_properties.__code__ and caller.f_locals["name"] == "occurred_at_utc"
                and caller.f_locals["schema"].get("x-pm-oracle-id") == metadata):
            calls.append((value, kwargs["profile"]))
            return value
        return date_time(value, **kwargs)

    for keyword in ("format", "type", "minLength"):
        rule = timestamp + "/" + keyword
        result = evidence[rule]
        value = result["invalid"]
        require(result["still_refused_by"] == [format_rule if keyword == "minLength" else fallback],
                f"{rule}: a different check refused when the selected check was disabled")
        other = {closure._guard_for_location(format_rule)} if keyword == "minLength" else set()
        target = {closure._guard_for_location(rule)}
        if other:
            format_disabled = go.errors_of(validator, value, other)
            require(go.locations(format_disabled) == {rule, fallback},
                    "format isolation did not expose the owner timestamp check")
        else:
            format_disabled = []
        with patch.object(roots.NR.DT, "date_time", skip_owner_fallback):
            fallback_disabled = go.errors_of(validator, value)
            all_later_disabled = go.errors_of(validator, value, other)
            combined = go.errors_of(validator, value, other | target)
        require(errors_list(fallback_disabled) == result["original"] and
                go.locations(all_later_disabled) == {rule} and not combined and
                errors_list(go.errors_of(validator, value)) == result["original"],
                f"{rule}: the timestamp checks did not isolate and restore")
        require(calls and all(recorded == profile for _, recorded in calls),
                "the test did not reach the original owner timestamp profile")
        result["implication"] = dict(
            source=timestamp, owner=metadata, owner_source=sources, profile=profile,
            only_format_disabled=errors_list(format_disabled),
            only_owner_fallback_disabled=errors_list(fallback_disabled),
            all_later_disabled=errors_list(all_later_disabled),
            conclusion="The owner checks the same required timestamp using the installed date-time predicate. "
                       "Its predicate accepts only strings that match a nonempty date-time pattern.",
        )
        calls.clear()


def stored_evidence(parent, pin):
    raw = (parent / pin["path"]).read_bytes()
    require(sha256(raw).hexdigest() == pin["sha256"], "an earlier witness store changed")
    return pickle.loads(gzip.decompress(raw))


def replay_prior(closure, go, validator, nodes, rules, prior, directory):
    kept = {rule: item for rule, item in prior["clauses"].items()
            if rule in rules and item["cls"] != "UNCOVERED"}
    for rule, item in kept.items():
        if item["cls"] == "UNREACHABLE":
            location, keyword = rule.rsplit("/", 1)
            result = go.pinned_proof(nodes[location], nodes, validator, keyword)
            require(result == item, f"{rule}: the original branch proof changed: {result}")
        elif item["cls"] == "SELECTOR_OR_NEGATED":
            location, _ = rule.rsplit("/", 1)
            contexts = [{kind for kind, *_ in reach["ctx"] if kind in go.APART}
                        for reach in nodes[location]["reach"]]
            require(contexts and all(contexts) and set.union(*contexts) == set(item["inside"]),
                    f"{rule}: the original selector paths changed")
        else:
            require(item["cls"] in WITNESSED, f"{rule}: unsupported earlier result")
    result = closure.verify_witnesses(
        validator, kept, raw_store=stored_evidence(directory, prior["witness_store"]),
        controls=stored_evidence(directory, prior["control_store"]),
    )
    require(result["passed"] == sum(item["cls"] in WITNESSED for item in kept.values())
            and not result["failed"] and not result["unverifiable"],
            f"the exact variant did not reproduce the earlier rule tests: {result}")
    return kept, result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("variant", choices=VARIANTS)
    for name in ("source", "reference", "prior", "out"):
        parser.add_argument(f"--{name}", type=Path, required=True)
    parser.add_argument("--leave-enabled", metavar="RULE")
    args = parser.parse_args()
    sys.path.insert(0, str(args.source.resolve() / "scripts"))
    import pm_goal_dg5_closure as closure
    import pm_goal_go_schema_closure as go

    reference_raw = args.reference.read_bytes()
    reference = json.loads(gzip.decompress(reference_raw))["roots"][ROOT][VARIANTS[args.variant]]
    prior_raw = args.prior.read_bytes()
    require(sha256(prior_raw).hexdigest() == PRIOR_SHA256, "the earlier rule report changed")
    prior = json.loads(prior_raw)["roots"][ROOT]
    require(prior["schema"] == reference["schema"] and ROW in reference["rows"],
            "the exact WorkflowSourceAudit binding changed")
    args.out.mkdir(parents=True)
    ref = json.loads(reference["schema"])["$ref"]
    bank, control, path, line = original_control(args.out / "fixture", ref)
    plain = bank.validator(ref)
    kind = type(plain).__module__ + "." + type(plain).__qualname__
    registry = closure._registry_digest(plain)
    bank_name = type(bank).__module__ + "." + type(bank).__qualname__
    require(kind == reference["validator_class"] and registry == reference["registry_sha256"]
            and bank_name == reference["bank"], "the original call reached a different validator")
    validator, aliases = installed_validator(closure, bank, plain, args.variant)
    nodes, rules = closure._clause_inventory(validator)
    pin = closure._clause_inventory_pin(rules)
    if rules != sorted(reference["clause_ids"]) or pin != reference["clause_inventory"]:
        write(args.out / "inventory-difference.json", dict(
            actual=pin, expected=reference["clause_inventory"],
            installed_only=sorted(set(rules) - set(reference["clause_ids"])),
            reference_only=sorted(set(reference["clause_ids"]) - set(rules)),
        ))
        raise ValueError("the original call does not match all literal rules of the selected variant")
    require(not list(plain.iter_errors(control)) and not go.errors_of(validator, control),
            "the installed validators disagreed on the complete original accepted example")
    examples = workflow_examples(go, control)
    if args.variant == "CA3":
        examples.update(event_examples(go, control))
    expected = set(rules) - {rule for rule, item in prior["clauses"].items() if item["cls"] != "UNCOVERED"}
    require(set(examples) == expected, "the tests do not match every outstanding literal rule")
    require(args.leave_enabled is None or args.leave_enabled in examples, "the selected rule has no test")
    evidence = {rule: check_example(closure, go, plain, validator, rule, pair, rule == args.leave_enabled)
                for rule, pair in sorted(examples.items())}
    check_acknowledgement(closure, go, bank, validator, evidence)
    if args.variant == "CA3":
        check_event_timestamps(closure, go, bank, validator, evidence)
    require(all(item["cls"] == "KILLED" or "implication" in item for item in evidence.values()),
            "one remaining refusal lacks its checked dependency")
    write(args.out / "tests.json", dict(root=ROOT, row=ROW, family=FAMILY, variant=VARIANTS[args.variant],
                                       source=dict(path=str(path.relative_to(args.source.resolve())),
                                                   line=line, sha256=sha256(path.read_bytes()).hexdigest()),
                                       original_control=control, source_aliases=aliases,
                                       reference_sha256=sha256(reference_raw).hexdigest(),
                                       rule_inventory=reference["clause_inventory"], rules=evidence))
    kept, replay = replay_prior(closure, go, validator, nodes, rules, prior, args.prior.parent)
    clauses = kept | evidence
    require(set(clauses) == set(rules), "the combined result lacks literal rules")
    counts = dict(Counter(item["cls"] for item in clauses.values()))
    receipt = dict(clauses=clauses, clause_inventory=reference["clause_inventory"], counts=counts,
                   families=[FAMILY], rows=[ROW], schema=reference["schema"], variant=VARIANTS[args.variant],
                   verify=dict(replay, passed=replay["passed"] + len(evidence)))
    write(args.out / "coverage.json", {"roots": {ROOT: receipt}})
    print(json.dumps(dict(counts=counts, retained=replay["passed"], new=len(evidence)), sort_keys=True), flush=True)


if __name__ == "__main__":
    main()
