#!/usr/bin/env python3
"""Registered whole original consumer inputs for DG-INT (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Enrollment happens before projection publication. Reads authenticate retained
whole originals and independently reacquire the underlying sources; enrollment
never grants current-state authority.
"""
from __future__ import annotations
import copy
import random
import types
import pm_goal_test_owner_adapters as A
import pm_goal_dg_cf1_world as F
import pm_goal_dg_cf1_compose as Compose


class Originals(F.IssuingOwner):
    role='consumer_original_sources'

    def __init__(self,world):
        self.actual=world
        sw=getattr(world,'start_world',None) or world.sw
        self.scope=dict(sw.ctx.scope,thread_id=sw.ctx.thread_id)
        view=types.SimpleNamespace(storage=world.storage,registry=world.registry,
            owner_by_id=lambda oid:world.registry._owners.get(oid))
        super().__init__(world.registry,view)
        self.values=None

    def _whole(self,label,value):
        realm,uri=F.ROOTS['OriginalStructuredValue']
        out=Compose.compose(realm,uri,Compose.Context(clock=self.world.storage.now,
            rng=random.Random(F.hsj([label,value])),owner_tag=self.owner_id),validate=False)
        out['_record']=copy.deepcopy(value)
        self.seal(out,tag=label,scope=self.scope)
        out.pop('_record',None)
        F.rvalidate('OriginalStructuredValue',out,'int/consumer/'+label)
        return out

    def enroll(self,values,disclosure):
        A.require('int/consumer/enroll_once',self.values is None)
        self.values=copy.deepcopy(values)
        self.permission=copy.deepcopy(disclosure)
        # These are real registered source-owner identities and current epochs;
        # the original readers still acquire each actual owner independently.
        roster=[dict(owner_id=oid,role=role,owner_epoch=self.actual.registry._owners[oid].owner_epoch)
                for oid,role in sorted(self.actual.registry.roster().items())]
        self.roster=copy.deepcopy(roster)
        self.registration=self._whole('source_owner_registrations',roster)
        self.originals=[self._whole('original_'+name,value) for name,value in values.items()]
        self.disclosure=self._whole('current_disclosure_controls',disclosure)

    def read(self,values,disclosure,snapshot):
        for row in self.roster:
            owner=self.actual.registry._owners.get(row['owner_id'])
            A.require('int/consumer/source_owner_current',owner is not None and
                owner.role==row['role'] and owner.owner_epoch==row['owner_epoch'])
        A.require('int/consumer/original_sources_changed',values==self.values)
        A.require('int/consumer/disclosure_changed',disclosure==self.permission)
        for node in [self.registration,self.disclosure]+self.originals:
            F.authenticate_structured(self.world,node,'int/consumer/source',self.scope)
            A.require('int/consumer/owner_epoch',node['identity']['owner_epoch']==self.owner_epoch)
        source=dict(scope={k:self.scope[k] for k in ('storage_instance_id','project_id','goal_id','goal_run_id')},
            storage_instance_id=self.actual.storage.storage_instance_id,database_instance_id=self.actual.storage.storage_instance_id,
            source_read_id=snapshot['snapshot_id'],native_snapshot_read_id=snapshot['snapshot_id'],
            root_generation=snapshot['cell_generation'],complete_member_selections=[dict(owner_role=self.role,
                whole_argument_name=name,original_physical_path='/'+name,source_index=i) for i,name in enumerate(values)],
            whole_original_owner_registrations=[copy.deepcopy(self.registration)],whole_original_values=copy.deepcopy(self.originals),
            whole_current_disclosure_controls=[copy.deepcopy(self.disclosure)])
        return source,copy.deepcopy(self.disclosure)
