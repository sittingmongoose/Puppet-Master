"""Prospective ER8 policy overlay. Import is read-only; state amendment explicit."""
import copy, hashlib, json, types
from pathlib import Path
HERE = Path(__file__).resolve().parent
BASE = HERE.parent / 'accounting-v1/slot_ledger.py'
BASE_SHA = '5590fdc09936005e09b2de7aa4ac4113bbe0ddeefa4a8caf3548d78b0e3045af'
AMENDMENT = HERE / 'AUTHORITY_AMENDMENT.json'
AMENDMENT_SHA = '1479c0b44869d13878b90ccd2f02d5fb2d755cfa0f0b17315105dc48d57616ec'
if hashlib.sha256(BASE.read_bytes()).hexdigest() != BASE_SHA:
    raise RuntimeError('frozen accounting source changed')
if hashlib.sha256(AMENDMENT.read_bytes()).hexdigest() != AMENDMENT_SHA:
    raise RuntimeError('prospective authority changed')
policy = json.loads(AMENDMENT.read_text())
source = BASE.read_text()
changes = {
    "positive_number(starts,48)": "positive_number(starts,auth()['limits']['native_goal_starts'])",
    "start_commitments(s,v['case'],r['job'])>48": "start_commitments(s,v['case'],r['job'])>auth()['limits']['native_goal_starts']",
    "if a['helper_task_starts']+1+remaining_eval-int(consumes_eval)>32: raise RuntimeError('helper evaluation reserve/cap')": "# Cumulative helper count removed by prospective authority.",
    "or a['helper_task_starts']>=32 or a['active_helpers']>=8": "or a['active_helpers']>=auth()['limits']['active_helpers']",
}
for old, new in changes.items():
    if source.count(old) != 1:
        raise RuntimeError('frozen successor transformation no longer exact: ' + old)
    source = source.replace(old, new)
legacy = types.ModuleType('er8_accounting_successor')
legacy.__file__ = str(BASE)
exec(compile(source, str(BASE), 'exec'), legacy.__dict__)
historical_auth = legacy.auth

def auth():
    result = copy.deepcopy(historical_auth())
    result['root_work_clock_deadline_epoch'] = policy['deadline_epoch']
    result['limits'].update(policy['limits'])
    result['limits']['helpers_task_starts'] = None
    result['limits']['repair_versions_per_boundary'] = None
    return result
legacy.auth = auth
transaction = legacy.transaction
accounting = legacy.accounting

def amend_state(state, root_authority):
    """Root-authorized one-time deadline amendment; no birth/cap/job rewrite."""
    if not root_authority or state['clock_start_epoch'] != policy['clock_start_epoch']:
        raise RuntimeError('root authority and original clock required')
    if state['authorization_sha256'] != legacy.AUTH_SHA:
        raise RuntimeError('historical authority changed')
    receipt = {'authority_sha256': AMENDMENT_SHA, 'root_authority': root_authority,
               'previous_deadline_epoch': state['deadline_epoch'],
               'deadline_epoch': policy['deadline_epoch']}
    if 'prospective_authority_amendment' in state:
        raise RuntimeError('authority amendment already recorded')
    state['deadline_epoch'] = policy['deadline_epoch']
    state['prospective_authority_amendment'] = receipt
    return receipt

def apply(state, action, request):
    if state.get('prospective_authority_amendment', {}).get('authority_sha256') != AMENDMENT_SHA:
        raise RuntimeError('root-authorized state amendment required before successor use')
    if action == 'extend-reservations':
        if not request.get('root_authority') or state.get('tranche_reservation_receipt'):
            raise RuntimeError('root-authorized first tranche reservation required')
        rows = request['reservations']
        names = [row['case'] for row in rows]
        if len(names) != 28 or len(set(names)) != 28:
            raise ValueError('24 integrated and four holdout unique names required')
        if not set(state['final_reserved_names']).issubset(names):
            raise ValueError('all historical six reservations must remain')
        prospective = copy.deepcopy(state)
        for row in rows:
            if row['native_starts'] != 3 or row['occupied_seconds'] != 5400:
                raise ValueError('declared whole pipeline reservation required')
            if row['final_job'] != row['case'] + '-final-correction':
                raise ValueError('protected final correction name required')
            old = prospective['reservation_by_case'].get(row['case'])
            value = {k: row[k] for k in ('native_starts', 'occupied_seconds', 'final_job')}
            if old:
                if any(old[k] != v for k, v in value.items()):
                    raise RuntimeError('historical reservation never rewritten')
            else:
                if row['case'] in state['cases']:
                    raise RuntimeError('prospective reservation cannot rewrite born case')
                prospective['reservation_by_case'][row['case']] = {**value, 'completed': False}
        a = accounting(prospective)
        if a['native_goal_starts'] + a['reserved_or_committed_native_starts'] > policy['limits']['native_goal_starts']:
            raise RuntimeError('whole campaign start reservations exceed ceiling')
        if a['occupied_slot_seconds'] + a['reserved_or_committed_slot_seconds'] > policy['limits']['occupied_candidate_slot_seconds']:
            raise RuntimeError('whole campaign slot reservations exceed ceiling')
        state['reservation_by_case'] = prospective['reservation_by_case']
        state['tranche_reservation_receipt'] = copy.deepcopy(request)
        for name in request['evaluator_names']:
            if name not in state['evaluator_reserved_names']:
                state['evaluator_reserved_names'].append(name)
        return accounting(state)
    return legacy.apply(state, action, request)

def admit(state, request, now, component_birth=None):
    if state.get('prospective_authority_amendment', {}).get('authority_sha256') != AMENDMENT_SHA:
        raise RuntimeError('root-authorized state amendment required before successor use')
    return legacy.admit(state, request, now, component_birth=component_birth)
