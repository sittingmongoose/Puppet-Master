"""DG5 supplement negatives for goal_run.started (lead decision 1116061157-ad82, condition 4).

One authored single-defect negative per owner or shared site that no DG-S case
targets (or targets only with a coherent multi-defect case). Each case's
dg5_target is declared in TARGETS here, before it runs, with its reason in the
case comment. Cases use only the original suite's own world and fixture
helpers (pm_goal_dg_s_oracles) and coherent rewrites; formed events are never
edited. Registered as group 'S-DG5' by pm_goal_dg5_s.main; PM_DG5_S_MATCH
selects a substring subset for gated smokes (full runs register all).
"""
import copy
import os

import pm_goal_dg_s_oracles as O
import pm_goal_dg_s_readers as R
import pm_goal_dg_s_start as ST
import pm_goal_dg_s_world as W

TARGETS = {}
CASES = []
Z = '0' * 64


def negative(name, expected, target):
    def deco(fn):
        CASES.append((name, expected, fn))
        TARGETS['S-DG5/' + name] = target
        return fn
    return deco


def cases(suite):
    match = os.environ.get('PM_DG5_S_MATCH')
    for name, expected, fn in CASES:
        if match and match not in name:
            continue
        suite.negative('S-DG5', name, fn, expected)
