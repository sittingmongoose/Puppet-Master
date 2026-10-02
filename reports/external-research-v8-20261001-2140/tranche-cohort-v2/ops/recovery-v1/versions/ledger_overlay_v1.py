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
    return legacy.apply(state, action, request)
