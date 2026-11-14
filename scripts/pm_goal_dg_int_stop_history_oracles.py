#!/usr/bin/env python3
"""Authenticated host-Stop history and coherent substitution cases (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.
"""
import argparse,copy,json,tempfile,types
from pathlib import Path
import pm_goal_test_owner_adapters as A
import pm_goal_dg_ca_owners as O
import pm_goal_dg_ca_c1 as C1
import pm_goal_dg_r_world as R
import pm_goal_dg_int_world as I
import pm_goal_dg_int_v7 as V
import pm_goal_dg_int_cancel as C
from pm_goal_dg_int_v7_oracles import Run,BASE


def setup(directory):
    world=O.World(directory,storage_cls=V.Storage)
    route=C1.NoAssociationCancel(world,prior_stop=False)
    world.host_stop.manual(route.scope,'stop')
    # The retained-source adapter needs only this actual Goal's host authority,
    # Storage and enrolled custody; it makes no Workflow or native-run claim.
    view=C.CancelWorld.__new__(C.CancelWorld)
    view.storage,view.registry,view.recorder=world.storage,world.registry,world.recorder
    view.sid,view.scope,view.issued=world.storage_id,dict(route.scope),{}
    view.goal_bridge=types.SimpleNamespace(world=world,route=route)
    host=world.host_stop;key=host.key(route.scope)
    custodian=I.AdoptedCustody(view,'retained_host_stop',host.owner_id)
    retained=custodian.adopt(host.FAMILY,host.current(route.scope)['value'],None,None,key=key)
    host.manual(route.scope,'resume');older=copy.deepcopy(host.current(route.scope)['value'])
    host.manual(route.scope,'stop')
    return world,route,view,retained,older


def replace(world,family,key,value):
    cell=world.storage.cell(family,key)
    world.storage.transact([dict(table=family,key=key,expected=cell['version'],value=value)])


def record_for(receipt,record):
    out=copy.deepcopy(record)
    out.update(user_stop_epoch=receipt['user_stop_epoch'],continuation_epoch=receipt['continuation_epoch'],
        latched=receipt['action']=='stop',last_original_stop_receipt_ref=receipt['receipt_ref'],
        last_original_stop_receipt_sha256=O.row_sha(receipt))
    return out


def case(edit=None):
    def run():
        with tempfile.TemporaryDirectory(prefix='dgint-stop-history-',dir=BASE) as directory:
            world,route,view,retained,older=setup(Path(directory))
            if edit:edit(world,route,older)
            before=world.recorder.snapshot()
            try:
                value=view.resolve(retained.selector())
                A.require('stop_history/original_bytes',value==retained.wrapper)
                return dict(retained_stop=value['record']['user_stop_epoch'],
                    current_stop=world.host_stop.record(route.scope)['user_stop_epoch'])
            finally:A.require('stop_history/passive',world.recorder.snapshot()==before)
    return run


def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--output',required=True)
    args=parser.parse_args();BASE.mkdir(parents=True,exist_ok=True);checks=Run()
    checks.case('R4/retained_Stop_after_authentic_owner_advance',case())
    def field(world,route,older):
        host=world.host_stop;record=host.record(route.scope)
        record['original_birth_or_adoption_ref']+=':substituted'
        replace(world,host.FAMILY,host.key(route.scope),host.wrapper(record))
    checks.case('R4/committed_control_afterimage_substituted',case(field),'select/cell_substituted')
    def stale(world,route,older):
        host=world.host_stop;replace(world,host.FAMILY,host.key(route.scope),older)
    checks.case('R4/older_genuine_manual_receipt_replayed',case(stale),'select/cell_substituted')
    def foreign(world,route,older):
        host=world.host_stop;other=C1.NoAssociationCancel(world,prior_stop=True)
        receipt=host.receipt(host.record(other.scope)['last_original_stop_receipt_ref'])
        record=record_for(receipt,host.record(route.scope))
        replace(world,host.FAMILY,host.key(route.scope),host.wrapper(record))
    checks.case('R4/other_Goal_genuine_receipt_coherent_afterimage',case(foreign),'select/cell_substituted')
    def receipt_bytes(world,route,older):
        host=world.host_stop;record=host.record(route.scope);ref=record['last_original_stop_receipt_ref']
        receipt=copy.deepcopy(host.receipt(ref))
        receipt['owner_epoch']=R.NR.uint64(receipt['owner_epoch']+1,'stop_history/epoch')
        replace(world,host.RECEIPTS,ref,receipt)
        replace(world,host.FAMILY,host.key(route.scope),host.wrapper(record_for(receipt,record)))
    checks.case('R4/receipt_bytes_and_control_commitment_substituted',case(receipt_bytes),'select/cell_substituted')
    failed=[row for row in checks.rows if row['status']!='pass']
    Path(args.output).write_text(json.dumps(dict(qualification='TEST_ONLY',native=C.NATIVE_LINE,
        status='fail' if failed else 'pass',cases=checks.rows,failures=failed),indent=1)+'\n')
    return bool(failed)


if __name__=='__main__':raise SystemExit(main())
