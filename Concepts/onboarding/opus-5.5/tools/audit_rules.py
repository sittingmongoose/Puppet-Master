#!/usr/bin/env python3
"""The logic audit's rule table, checked against every state the explorer reached.

  python3 tools/audit_rules.py GRAPH.json [--json out.json]

tools/onboarding_explorer.mjs writes graph.json: every reachable state (its screen, the session behind it and the
controls it offered) and every click between states. Each rule below says what must be true of a state, taken from the
packet (01, 02, 03, 04, 06), canon (PWIZ-021, the setup-plan schema) and Jared's asks. A violation prints the rule,
the screen, and the shortest click path from the first screen that reaches it, so it can be replayed by hand.
"""
import json
import sys
from collections import deque


def load(path):
    g = json.load(open(path))
    states = {s['key']: s for s in g['states']}
    for s in states.values():
        s['S'] = json.loads(s['sess']) if s.get('sess') else None
    return states, g['transitions']


def paths(states, transitions):
    """shortest click path to each state (BFS over the recorded transitions)"""
    start = next((k for k, s in states.items() if s.get('depth') == 0), None)
    prev = {start: None}
    adj = {}
    for t in transitions:
        if t.get('to'):
            adj.setdefault(t['from'], []).append(t)
    q = deque([start])
    while q:
        k = q.popleft()
        for t in adj.get(k, []):
            if t['to'] not in prev:
                prev[t['to']] = (k, t['control'])
                q.append(t['to'])

    def path_to(key):
        out = []
        while key in prev and prev[key]:
            k, c = prev[key]
            if c:
                out.append(('type %s=%s' % (c.get('bind'), c.get('value'))) if c.get('kind') == 'type' else ('%s%s' % (c.get('act'), ' ' + str(c['arg']) if c.get('arg') not in (None, '') else '')))
            key = k
        return list(reversed(out))
    return path_to


def md(S):
    return S['drafts']['main']


def ctrl(state, act, arg=None):
    return any(c['act'] == act and (arg is None or c.get('arg') == arg) and not c.get('disabled') for c in state.get('controls') or [])


def committed(S):
    return (S.get('commit') or {}).get('state') == 'done'


RULES = []
CTX = {}


def rule(rid, text):
    def deco(fn):
        RULES.append((rid, text, fn))
        return fn
    return deco


@rule('R1', 'Use it away from home (remote access) is asked only on a new Server (packet 01: optional unless the route needs it)')
def r1(st, S):
    return st['screen'] != 'away' or md(S)['server_mode'] == 'new_server'


@rule('R2', 'Start like another Project appears only for a new Project on the new-or-local journey (packet 01 step 5)')
def r2(st, S):
    d = md(S)
    return st['screen'] != 'like' or (d['journey'] == 'new_or_local' and d['project_mode'] == 'new')


@rule('R3', 'AI setup (provider_setup, free_models_setup) only after the Project is committed, never for a deferred Project (PWIZ-021)')
def r3(st, S):
    if st['screen'] not in ('ai', 'ai-all', 'ai-none', 'free'):
        return True
    return committed(S) and md(S)['project_mode'] != 'later'


@rule('R4', 'The Guided Tour is offered only when it can end on a real Project (the tour ends on the Planning Wizard with a Project selected)')
def r4(st, S):
    if not ctrl(st, 'tour'):
        return True
    if st['screen'] == 'ready':
        return committed(S) and md(S)['project_mode'] != 'later'
    if st['screen'] == 'c-ready':
        return True  # checked against the Server's Projects by the explorer scenario (C20)
    return True


@rule('R5', 'Nothing is created before the reviewed commit: no Project id, no commit state other than none/later before review_confirmed (PWIZ-021)')
def r5(st, S):
    d = md(S)
    c = (S.get('commit') or {}).get('state', 'none')
    if c in ('running', 'done', 'failed'):
        return d.get('review_confirmed') is True
    return True


@rule('R6', 'Finish protecting your work appears only when a backup destination was chosen (packet 01 step 6)')
def r6(st, S):
    return st['screen'] != 'protect' or bool((S.get('backup') or {}).get('dest'))


@rule('R7', 'The Connect journey never carries a Project or local history until Create a new Project starts the second draft (canon rule #1)')
def r7(st, S):
    c = S['drafts']['connect']
    return c['project_mode'] == 'later' and c['local_history'] is False and c['online_mode'] == 'none'


@rule('R8', 'Choosing This computer leaves no Server reference or access route behind (C6)')
def r8(st, S):
    d = md(S)
    if d['server_mode'] != 'this_device' or S.get('active') != 'main':
        return True
    return d['server_ref'] == '' and d['remote_mode'] == 'none' and not d.get('proxy_hostname') and not d.get('remote_endpoint')


@rule('R9', 'An online copy is created only by explicit choice: online_mode new implies a service and a name (packet 02)')
def r9(st, S):
    d = md(S)
    return d['online_mode'] != 'new' or (d['forge'] not in ('none', None) and bool(d['repository_name']))


@rule('R10', 'The SSH password step is shown only when no discovered key already works with the device (Jared: a working key skips the password)')
def r10(st, S):
    # in the world where the agent key already works with Home NAS, sign-in may appear only if the person chose
    # another key or a new one on purpose
    if st['screen'] != 'nas-signin' or CTX.get('scenario') != 'keyWorks':
        return True
    return (S.get('nas') or {}).get('key') not in (None, 'k-ed')


@rule('R11', 'A deferred Project on a new Server still gets its access question before Review (C1, PWIZ-021 skips only provider phases)')
def r11(st, S):
    d = md(S)
    if st['screen'] != 'review' or d['project_mode'] != 'later' or d['server_mode'] != 'new_server':
        return True
    return d['remote_mode'] != 'none'


@rule('R12', 'Every disabled control says why (packet 06 scenario 24)')
def r12(st, S):
    return all(c.get('reason') for c in st.get('controls') or [] if c.get('disabled'))


@rule('R13', 'On a Server path the folder choice names the Server, not this computer (C7)')
def r13(st, S):
    if st['screen'] != 'begin' or md(S)['server_mode'] == 'this_device':
        return True
    labels = ' '.join(c.get('label', '') for c in st.get('controls') or [])
    return 'on this computer' not in labels.lower()


def main():
    graph = sys.argv[1]
    out = sys.argv[sys.argv.index('--json') + 1] if '--json' in sys.argv else None
    states, transitions = load(graph)
    try:  # the crawl's world (scenario) is in report.json beside graph.json
        import os
        CTX.update(json.load(open(os.path.join(os.path.dirname(os.path.abspath(graph)), 'report.json'))))
    except Exception:
        pass
    path_to = paths(states, transitions)
    report = []
    for rid, text, fn in RULES:
        bad = []
        for st in states.values():
            if st.get('closed') or not st.get('S'):
                continue
            try:
                ok = fn(st, st['S'])
            except Exception as e:  # a rule that cannot read a state is itself a finding
                ok, st = False, dict(st, error=str(e))
            if not ok:
                bad.append(st)
        report.append({'rule': rid, 'text': text, 'violations': len(bad), 'examples': [{'screen': b['screen'], 'path': path_to(b['key'])} for b in bad[:3]]})
        print('%s %-4s %s' % ('ok  ' if not bad else 'FAIL', rid, text))
        for b in bad[:3]:
            print('       %s  <-  %s' % (b['screen'], ' > '.join(path_to(b['key']))))
    if out:
        json.dump(report, open(out, 'w'), indent=1)
    print(json.dumps({'states': len(states), 'rules': len(RULES), 'failing': [r['rule'] for r in report if r['violations']]}))


if __name__ == '__main__':
    main()
