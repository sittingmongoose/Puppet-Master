"""DG5 declared duplicate sets for goal.cancelled (owner: helper C, SPLIT.md).

Same form as pm_goal_dg5_declarations: DECLARED = {case_id: (members, reason)} and/or
DECLARED_RULES = ((case-id test, members, reason), ...). Every set is reviewed against
the source before the judging run: all members check the same field with the same
predicate, or fall in the lead's enum/const-closed class (decision 1116073727-d098),
whose sets are collected in ENUM_CLOSED_RULES and listed separately in the handover.
"""
C1_SITE = 'dg5/site/pm_goal_dg_ca_c1.py:'
C3_SITE = 'dg5/site/pm_goal_dg_ca3_route.py:'

R3_SITE = 'dg5/site/pm_goal_dg_ca3_route.py:'
ST_SITE = 'dg5/site/pm_goal_test_storage.py:'

DECLARED = {
    # prepare twice: the readiness-cell absence check and the Storage CAS-absent
    # check on the same put are the same predicate on the same cell.
    'C3/prepare_readiness_twice': (
        (R3_SITE + '631', ST_SITE + '1654'),
        'prepare requires the readiness cell absent at :631 and then puts it with '
        'expected=None, whose transact CAS-absent check (storage :1654) requires '
        'the identical absence of the identical cell; a second prepare is refused '
        'by both for the same field with the same predicate.'),
}

# Enum-closed class (lead decision 1116073727-d098): the Goal body state is closed by
# BodySelection's schema enum ['active', 'paused', 'blocked'] - exactly LEGAL_STATES -
# validated when capture builds the BodySelection from the same snapshot body whose
# state :302 checks (pm_goal_dg_ca_c1.py:344 via Roots.check). The broadest check was
# tried alone first: no value distinguishes the two checks, because both read the same
# copied body['state'] in the same call and their domains are identical; a stored body
# with any out-of-enum state fails both, and BodySelection is constructed inside
# capture after :302, so no schema-skipping path reaches one without the other.
LEGAL_STATE_CLOSURE = (
    "Closure: BodySelection state enum ['active', 'paused', 'blocked'] in the producer "
    'bank (goal_cancel_command_custody $defs/BodySelection), validated at '
    'pm_goal_own_c3_w12b_roots.py:41 when capture builds the BodySelection from the '
    'same snapshot body. Out-of-enum single-kill tried by construction: the two '
    'checks read the identical copied value in one synchronous call and their '
    'domains are identical, so no real path reaches one without the other.')
ENUM_CLOSED_RULES = (
    (lambda cid: cid == 'C1/C1/entry/completed_goal',
     (C1_SITE + '302', 'dg5/roots/schema'),
     "body['state'] in LEGAL_STATES (:302) and BodySelection state enum in the "
     "producer schema agree on the defect value 'completed' over the enum-closed "
     'domain. ' + LEGAL_STATE_CLOSURE),
    (lambda cid: cid == 'C3/capture_completed_goal',
     (R3_SITE + '392', 'dg5/roots/schema'),
     "body['state'] in C1.LEGAL_STATES (:392) and BodySelection state enum in the "
     "producer schema agree on the defect value 'completed' over the enum-closed "
     'domain. ' + LEGAL_STATE_CLOSURE),
    (lambda cid: cid == 'C3/unsettled_wrong_kind',
     (R3_SITE + '1294', 'dg5/roots/schema'),
     "kind in ('unknown', 'no_effect') at :1294 and the terminal result schema's "
     'kind discrimination in _terminal_values agree on any out-of-enum kind over '
     'the closed terminal-kind domain {succeeded, unknown, no_effect} fixed by '
     'the GoalCancelResultV3 schema validated in _terminal_values. Out-of-enum '
     'single-kill tried: a bogus kind falls into the unknown branch and is '
     'refused by the result-schema/terminal-value construction for exactly the '
     'same closed domain, so no real path reaches one check without the other.'),
    (lambda cid: cid == 'C3/retained_unsettled_reader_on_success',
     (R3_SITE + '1387', 'dg5/roots/schema'),
     "terminal kind in ('no_effect', 'unknown') at :1387 and the "
     'UnsettledRetainedEntry schema validated immediately after agree on the '
     "defect value 'succeeded' over the closed terminal-kind domain "
     '{succeeded, unknown, no_effect}; the retained entry is built only from '
     'the same stored terminal record both checks read, so no real path '
     'reaches one without the other.'),
)

DECLARED_RULES = () + ENUM_CLOSED_RULES
