"""GH1 extension over the unchanged DG-S original Start/checkpoint suite.

Helper B additions (SPLIT.md section 2: entries, corpus slots, supplement hook):
- Supplement negatives from pm_goal_dg5_supplement_s run as group 'S-DG5' in a
  second Suite after the original suite, each with its declared dg5_target.
- Number/date-time corpus for goal_run.started: the family's integers are
  owner-derived, so each corpus value enters only through
  StartOwner.commit_start(..., edits={'submission': f}) over the
  TypedProducerSubmission the producer itself built (HANDOFF.md corpus
  section), rekeyed with the suite's own recipe. A grammatical value other
  than the owner-derived original must refuse at the owner's join
  (producer/expected_revision, producer/after_revision); expectations are
  fixed before each call from NUMRULE plus those joins.
"""
import functools
import os
from pathlib import Path
import sys
import tempfile

import pm_goal_dg5_boundaries as bridge
import pm_goal_dg5_entries as plumbing
import pm_goal_dg_s_oracles as source
import pm_goal_dg_s_start as start
import pm_goal_dg_s_readers as readers
import pm_goal_dg_s_world as world

DG5_EVIDENCE = {}

# Corpus slots over TypedProducerSubmission payload fields. `entry` names the
# real entry for the corpus record; the value is injected by the submission
# edit, never by editing a formed event (see run_corpus).
SLOTS = [
    dict(name='goal_run.started/submission.payload.expected_goal_run_revision', family='goal_run.started',
         entry='StartOwner.commit_start[edits]', kind='uint64', where='producer/expected_goal_run_revision',
         field=('payload', 'expected_goal_run_revision'), join_code='producer/expected_revision',
         original=start.BEFORE_REVISION,
         also_rows=('dg5/start/producer/schema', 'dg5/site/pm_goal_dg_s_start.py:1056')),
    dict(name='goal_run.started/submission.payload.goal_run_revision', family='goal_run.started',
         entry='StartOwner.commit_start[edits]', kind='uint64', where='producer/goal_run_revision',
         field=('payload', 'goal_run_revision'), join_code='producer/after_revision',
         original=start.BEFORE_REVISION + 1,
         also_rows=('dg5/start/producer/schema', 'dg5/site/pm_goal_dg_s_start.py:1058')),
    dict(name='goal_run.started/submission.occurred_at_utc', family='goal_run.started',
         entry='StartOwner.commit_start[edits]', kind='date-time', profile='EVENT_RECORD',
         where='producer/occurred_at_utc', field=('occurred_at_utc',), join_code=None, original=None,
         also_rows=('dg5/start/producer/schema',)),
]


def suite_cases(cls):
    """plumbing.suite_cases plus the supplement's declared dg5_target per case."""
    original = cls._run

    @functools.wraps(original)
    def run(self, group, kind, case_id, fn, expected):
        saved = bridge.CASE[0]
        full = group + '/' + case_id
        target = None
        if group == 'S-DG5':
            import pm_goal_dg5_supplement_s as supplement
            target = supplement.TARGETS.get(full)
        bridge.CASE[0] = dict(id=full, expected=expected, dg5_target=target)
        try:
            return original(self, group, kind, case_id, fn, expected)
        finally:
            bridge.CASE[0] = saved
    cls._run = run


def _slot_edit(spec, value):
    field = spec['field']

    def edit(sub):
        if field[0] == 'payload':
            sub['payload'][field[1]] = value
        else:  # occurred_at_utc: both copies, or producer/time_copy refuses first
            sub['occurred_at_utc'] = value
            sub['payload']['occurred_at_utc'] = value
        return source.rekey(sub)
    return edit


def run_corpus(scratch):
    """Each corpus value through the family's own checker (commit_start), sealed."""
    bridge.SLOTS[:] = SLOTS
    suite = source.Suite(Path(tempfile.mkdtemp(prefix='started-corpus-', dir=scratch)))
    w, handles = source.new_world(suite)
    root = Path(w.work)
    files = bridge.file_state(root)
    for spec in SLOTS:
        for case_id, value in bridge.corpus_values(spec):
            expected = bridge.corpus_expectation(spec, value)
            if spec.get('join_code') and expected == 'accept' and not (
                    type(value) is int and value == spec['original']):
                expected = 'refuse:join'
            edit = _slot_edit(spec, value)
            outcome = bridge._sealed(
                lambda edit=edit: w.start.commit_start(source.request(w), handles,
                                                       edits=dict(submission=edit)), root, files)
            slot_row = bridge.PREFIX + spec['where'] + '/' + (
                'date-time' if spec['kind'] == 'date-time' else 'number')
            row_name = outcome[2] if outcome[0] == 'refused' and len(outcome) > 2 else None
            if outcome[0] in ('exception', 'crash'):
                verdict = 'crash'
            elif expected == 'accept':
                verdict = 'agree' if outcome[0] == 'accepted' else 'disagree'
            elif outcome[0] == 'accepted':
                verdict = 'disagree'
            elif expected == 'refuse:join':
                verdict = 'agree' if outcome[1] == spec['join_code'] else 'disagree'
            else:
                reason = expected.split(':', 1)[1]
                carried = isinstance(outcome[1], str) and outcome[1].endswith('/' + reason)
                verdict = 'agree' if row_name in (slot_row, *spec.get('also_rows', ())) or carried \
                    else 'disagree_other_row'
            bridge.CORPUS.append(dict(
                slot=spec['name'], family=spec['family'], call='S-DG5/corpus/StartOwner.commit_start',
                case=case_id, value=repr(value)[:60] if not (type(value) is int and value > 10 ** 30)
                else '<4400 digits>', expected=expected, outcome=outcome[0], code=outcome[1],
                row=row_name, verdict=verdict))


def main():
    suite_cases(source.Suite)
    family = 'goal_run.started'
    plumbing.entries(start.StartOwner, ('commit_start', 'recover_start'), family)
    plumbing.entries(readers.StartedProjector, ('install', 'withdraw', 'stage', 'replay', 'cutover'), family)
    plumbing.entries(readers.StartedReaders, ('read_retained_native', 'inspect_original',
                                             'read_historical', 'read_current'), family)
    # Owners that authored S1-S3/S6 negatives call directly (calls nested in another entry stay nested).
    plumbing.entries(readers.GenericStartSource, ('acquire', 'generic_snapshot', 'project'), family)
    plumbing.entries(readers.StartReducer, ('step',), family)
    plumbing.entries(readers.Representation, ('validate', 'encode', 'decode', 'encode_checkpoint', 'decode_checkpoint'),
                     family)
    plumbing.entries(world.WholeSourceOwner, ('issue_whole',), family)
    plumbing.entries(start.DescriptorOwner, ('install',), family)
    scratch = Path(os.environ['PM_DG5_SCRATCH'])
    scratch.mkdir(parents=True, exist_ok=True)
    output = scratch / 'started-source.json'
    work = Path(tempfile.mkdtemp(prefix='started-', dir=scratch))
    groups = os.environ.get('PM_DG5_GROUPS', '').split(',') if os.environ.get('PM_DG5_GROUPS') else []
    saved = sys.argv
    sys.argv = [str(Path(source.__file__)), '--output', str(output), '--work', str(work)]
    if groups:
        sys.argv += ['--groups', *groups]
    try:
        code = source.main()
    finally:
        sys.argv = saved
    supplement_rows = []
    if not code and os.environ.get('PM_DG5_SUPPLEMENT', '1') == '1' and (not groups or 'DG5' in groups):
        import pm_goal_dg5_supplement_s as supplement
        suite = source.Suite(Path(tempfile.mkdtemp(prefix='started-supplement-', dir=scratch)))
        supplement.cases(suite)
        supplement_rows = suite.rows
        if any(not row['ok'] for row in supplement_rows):
            code = 1
    if not code and (not groups or 'CORPUS' in groups):
        run_corpus(scratch)
    DG5_EVIDENCE.update(family=family, original_suite=str(output), supplement_rows=supplement_rows,
                        corpus_slots=[spec['name'] for spec in SLOTS])
    return code
