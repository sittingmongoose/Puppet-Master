import hashlib

# W2 (v3): provenance/status model with TRANSITIVE invalidation.
# Rule: an output is 'current' only if, in the current session, its own source hash matches
# AND every upstream dependency's output exists and is itself 'current' with matching hash.
def h(s): return hashlib.sha256(s.encode()).hexdigest()[:12]

cells = [
    {'id': 'c0', 'src': 'import data', 'upstream': []},
    {'id': 'c1', 'src': 'filter',       'upstream': ['c0']},
    {'id': 'c2', 'src': 'plot',         'upstream': ['c1']},
]
for c in cells: c['hash'] = h(c['src'])
cells_by_id = {c['id']: c for c in cells}
outputs = {}

def record_run(session, exec_order):
    events = []
    for n, cid in enumerate(exec_order, start=1):
        outputs[cid] = {'exec_count': n, 'session': session,
                        'inputs': {u: cells_by_id[u]['hash'] for u in cells_by_id[cid]['upstream']},
                        'self': cells_by_id[cid]['hash']}
        events.append((cid, n, session))
    return events

def recompute_status(current_session):
    status = {}
    # evaluate in upstream order (c0 before c1 before c2)
    for c in cells:  # cells list is topologically ordered by construction
        cid = c['id']; o = outputs.get(cid)
        if o is None or o['session'] != current_session:
            status[cid] = 'unverified'; continue
        if o.get('failed'):
            status[cid] = 'failed'; continue
        self_ok = o['self'] == c['hash']
        deps_ok = True
        for u in c['upstream']:
            uo = outputs.get(u)
            if (uo is None or uo['session'] != current_session
                    or status.get(u) != 'current'
                    or uo['self'] != o['inputs'].get(u)):
                deps_ok = False; break
        status[cid] = 'current' if (self_ok and deps_ok) else 'stale'
    return status

ev1 = record_run('S1', ['c2', 'c0', 'c1'])
s1 = recompute_status('S1')
cells_by_id['c0']['src'] = 'import data v2'; cells_by_id['c0']['hash'] = h(cells_by_id['c0']['src'])
s1_edited = recompute_status('S1')
s2 = recompute_status('S2')
outputs['c0'] = {'exec_count': 1, 'session': 'S2', 'inputs': {},
                 'self': cells_by_id['c0']['hash'], 'failed': True}
s2_run = recompute_status('S2')

assert s1 == {'c0': 'current', 'c1': 'current', 'c2': 'current'}, s1
assert s1_edited == {'c0': 'stale', 'c1': 'stale', 'c2': 'stale'}, s1_edited
assert s2 == {'c0': 'unverified', 'c1': 'unverified', 'c2': 'unverified'}, s2
assert s2_run == {'c0': 'failed', 'c1': 'unverified', 'c2': 'unverified'}, s2_run

print("display order:       ", [c['id'] for c in cells])
print("S1 execution order:  ", ev1, " (differs from display order c0,c1,c2)")
print("S1 statuses:         ", s1)
print("after editing c0:    ", s1_edited, " (transitive invalidation)")
print("after kernel restart:", s2, " (restart never marks old outputs current)")
print("after failed run c0: ", s2_run)
print("W2_OK")
