#!/usr/bin/env python3
"""Genuine other-Goal producer for DG-INT's coalesced group (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.
"""
from __future__ import annotations
import copy
import pm_goal_test_owner_adapters as A
import pm_goal_dg_ca_c1 as C1
import pm_goal_dg_ca_owners as O


class QueuedGoal(A.TestOwner):
    role='unrelated_producer'

    def __init__(self,world):
        self.world=world
        super().__init__(world.registry)

    def freeze(self):
        """C1 owns the complete source/Stop/receipt/settlement/frozen producer.

        This registered adapter exports that unchanged producer to the shared
        group batcher. It has no caller-provided Event or receipt input.
        """
        ca=self.world.goal_bridge.world
        route=C1.NoAssociationCancel(ca,state='active',prior_stop=False)
        route.run(until='freeze_event')
        key=route.progress_key(route.progress['progress_epoch'])
        cell=ca.cell('goal_cancel_progress',key)
        O.require('int/group/frozen_original',cell is not None and cell['value']['record']==route.progress)
        ca.roots.check('producer',O.CANCEL+'#/$defs/StorageProgress',cell['value'])
        O.require('int/group/phase',route.progress['phase']=='event_ready')
        producer=copy.deepcopy(route.progress['producer_input'])
        ca.roots.check('producer',O.CANCEL+'#/$defs/ProducerInput',producer)
        O.require('int/group/other_goal',producer['payload']['goal_id']!=self.world.scope['goal_id'])
        self.route=route
        self.original_progress=copy.deepcopy(cell)
        self.progress_key=key
        self.observations=route.observe_sources()
        self.producer=producer
        handle=self.issue(None,producer,kind='original_frozen_goal_producer')
        self.world.group.enqueue(self.owner_id,handle)
        return handle

    def resolve(self,handle,*,root=None):
        ca=self.world.goal_bridge.world
        O.require('int/group/original_withdrawn',ca.cell('goal_cancel_progress',self.progress_key)==self.original_progress)
        O.require('int/group/original_changed',self.route.progress['producer_input']==self.producer)
        O.require('int/group/source_changed',self.route.observe_sources()==self.observations)
        return super().resolve(handle,root=root)
