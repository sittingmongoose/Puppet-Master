#!/usr/bin/env python3
"""DG-CF3 TEST_ONLY backup and restore driver for CF-12 and P8.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

* ``BackupOwner.take`` captures one coherent original-authority unit of the
  adapter Storage at a single manifest generation: CURRENT, the manifest it
  names, every live sealed/active segment's durable bytes and every durable
  payload pack, each with SHA-256 and size.  The owner privately retains the
  unit's sealed manifest; a presented unit is authenticated against that
  custody, never against hashes it carries itself.  Derived projection rows,
  checkpoints and generations are named as excluded: under BRS-027/028/031 they
  are rebuilt after restore, not restore-verified authority.
* ``TombstoneOwner`` is the current deletion/tombstone ledger held outside the
  restored Storage.  Each entry is an issued original of that owner.
* ``RestoreDriver.restore`` authenticates the unit, refuses incomplete,
  substituted, mixed, extra-member (archive) or derived-as-authority units,
  installs the canonical files into a fresh directory, reopens Storage (CURRENT
  -> manifest hash join and SP-347 recovery), enforces current tombstones
  through the registered retention owner (no resurrection) and pack
  withdrawal, drops every derived table, and rebuilds the derived generation
  from authenticated retained source through the lower Storage publisher.  It
  appends no Event, issues no custody, and never completes pending work.

Actual physical backup enumeration, deletion and restore remain NOT_RUN.
"""
from __future__ import annotations

import copy
import json
import os
from pathlib import Path
import shutil

import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_dg_cf3_world as W
import pm_goal_dg_cf3_projector as P
from pm_goal_dg_cf3_world import require

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = W.NATIVE_LINE
UNIT_FILE = 'BACKUP.json'
UNIT_SCHEMA = 'pm.goal_test.dg_cf3.backup_unit.v1'
DERIVED_PREFIXES = (P.ROW_PREFIX, P.CHECKPOINT_TABLE)


def _derived(table):
    return table == P.CHECKPOINT_TABLE or table.startswith(P.ROW_PREFIX + '@')


def _authority_path(path):
    return (path == 'CURRENT' or (path.startswith('manifest.') and path.endswith('.msgpack')) or
            (path.startswith('segment-') and path.endswith('.seglog')) or path.startswith('packs/'))


class BackupOwner(A.TestOwner):
    role = 'backup_authority'

    def take(self, storage, dest):
        """One coherent original-authority unit at one manifest generation."""
        dest = Path(dest)
        require('backup/dest_empty', not dest.exists())
        dest.mkdir(parents=True)
        with self.recorder.call(self.owner_id, 'take_backup') as slot:
            root = storage.root
            current_raw = (root / 'CURRENT').read_bytes()
            current = S.decode_canonical(current_raw)
            manifest_raw = (root / current['manifest_ref']).read_bytes()
            state = S.decode_canonical(manifest_raw)
            require('backup/coherent_generation', state['manifest_generation'] == current['manifest_generation']
                    == storage.manifest_generation)
            members = [('CURRENT', current_raw, 'authority'), (current['manifest_ref'], manifest_raw, 'authority')]
            for segment in state['segments']:
                if segment['retired']:
                    continue
                raw = (root / ('segment-%d.seglog' % segment['generation'])).read_bytes()[:segment['watermark']]
                members.append(('segment-%d.seglog' % segment['generation'], raw, 'authority'))
            for digest, info in sorted(state['packs'].items()):
                if info['durable']:
                    members.append(('packs/' + digest, (root / 'packs' / digest).read_bytes(), 'authority'))
            listing = []
            for path, raw, kind in members:
                target = dest / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(raw)
                listing.append(dict(path=path, sha256=W.sha256(raw), bytes=len(raw), kind=kind))
            unit = dict(schema=UNIT_SCHEMA, qualification=QUALIFICATION,
                        backup_generation='TEST_ONLY:backup:%s:%d' % (storage.storage_instance_id,
                                                                      state['manifest_generation']),
                        storage_instance_id=storage.storage_instance_id, manifest_generation=state['manifest_generation'],
                        taken_at_utc=storage.now(), members=listing,
                        derived_excluded=sorted(t for t in state['cells'] if _derived(t)),
                        derived_rule='BRS-031: derived rows/checkpoints/generations/datasets are rebuilt after restore')
            raw = json.dumps(unit, sort_keys=True, separators=(',', ':')).encode()
            (dest / UNIT_FILE).write_bytes(raw)
            handle = self._issue(None, unit, kind='backup_unit')
            slot.set(dict(backup_generation=unit['backup_generation'], members=len(listing)))
            return handle, unit

    def authenticate_unit(self, handle, presented_raw):
        _, retained = self.resolve(handle)
        presented = json.loads(presented_raw)
        require('restore/seal', json.dumps(presented, sort_keys=True, separators=(',', ':')).encode() ==
                json.dumps(retained, sort_keys=True, separators=(',', ':')).encode())
        return retained


class TombstoneOwner(A.TestOwner):
    """Current deletion ledger, outside the restored Storage."""
    role = 'tombstone_authority'

    def __init__(self, registry, **kw):
        super().__init__(registry, **kw)
        self.ledger = []

    def tombstone(self, kind, storage_instance_id, target, deleted_at_utc):
        entry = dict(qualification=QUALIFICATION, kind=kind, storage_instance_id=storage_instance_id, target=target,
                     deleted_at_utc=deleted_at_utc, owner_id=self.owner_id)
        handle = self._issue(None, entry, kind='tombstone')
        self.ledger.append((self._handles[handle], entry))
        return handle

    def entries(self):
        out = []
        for ref, entry in self.ledger:
            out.append((ref, self.authenticate(ref, entry)))
        return out


class RestoreDriver(A.TestOwner):
    role = 'restore'

    def restore(self, *, backup_owner, handle, unit_dir, target, tombstones, scopes, extra_entries=()):
        unit_dir, target = Path(unit_dir), Path(target)
        with self.recorder.call(self.owner_id, 'restore') as slot:
            reg = self.registry
            reg.authenticate_owner(backup_owner, 'backup_authority')
            reg.authenticate_owner(tombstones, 'tombstone_authority')
            require('restore/unit_present', (unit_dir / UNIT_FILE).exists())
            unit = backup_owner.authenticate_unit(handle, (unit_dir / UNIT_FILE).read_bytes())
            listed = {m['path'] for m in unit['members']}
            present = {str(p.relative_to(unit_dir)) for p in unit_dir.rglob('*') if p.is_file()} - {UNIT_FILE}
            for member in unit['members']:
                require('restore/derived_as_authority', not member['path'].startswith('derived/'))
                require('restore/unexpected_member', _authority_path(member['path']) and member['kind'] == 'authority')
            require('restore/unexpected_member', present <= listed)
            require('restore/unit_incomplete', listed <= present)
            for member in unit['members']:
                raw = (unit_dir / member['path']).read_bytes()
                require('restore/member_digest', W.sha256(raw) == member['sha256'] and len(raw) == member['bytes'])
            require('restore/target_empty', not target.exists())
            target.mkdir(parents=True)
            (target / 'packs').mkdir()
            for member in unit['members']:
                dest = target / member['path']
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes((unit_dir / member['path']).read_bytes())
            storage = W.LaneStorage.open(target)
            require('restore/storage_instance', storage.storage_instance_id == unit['storage_instance_id'])
            require('restore/manifest_generation', storage.manifest_generation >= unit['manifest_generation'])
            before_events, before_custody = len(storage.events), len(storage.custody)
            entries = tombstones.entries()
            for ref, entry in extra_entries:
                try:
                    entries.append((ref, tombstones.authenticate(ref, entry)))
                except A.AdapterRefusal:
                    raise W.LaneRefusal('restore/tombstone_authority') from None
            retention = S.RetentionOwner(storage)
            applied = []
            for ref, entry in entries:
                if entry['storage_instance_id'] != storage.storage_instance_id:
                    continue
                if entry['kind'] == 'segment':
                    seg = next((s for s in storage.segments if s['generation'] == entry['target']), None)
                    if seg is not None and not seg['retired']:
                        storage.retire_segment(entry['target'], retention)
                        applied.append(['segment', entry['target']])
                elif entry['kind'] == 'pack':
                    info = storage.packs.get(entry['target'])
                    if info is not None and info['durable']:
                        storage.withdraw_pack(entry['target'])
                        applied.append(['pack', entry['target']])
            drops = []
            for table, rows in sorted(storage.cells.items()):
                if _derived(table):
                    for key, cell in sorted(rows.items()):
                        drops.append(dict(table=table, key=key, expected=cell['version'], delete=True))
            if drops:
                storage.transact(drops)
            require('restore/no_authority_effect', len(storage.custody) == before_custody and
                    len(storage.events) <= before_events)
            consumer = P.Consumer(storage, registry=A.OwnerRegistry())
            rebuilt = {}
            for scope in scopes:
                scope = dict(scope, storage_instance_id=storage.storage_instance_id)
                rebuilt[scope['goal_run_id']] = consumer.rebuild(scope)
            require('restore/no_authority_effect', len(storage.custody) == before_custody)
            slot.set(dict(applied=applied, dropped=len(drops), rebuilt=len(rebuilt)))
            return dict(storage=storage, consumer=consumer, unit=unit, applied=applied, dropped=len(drops),
                        rebuilt=rebuilt)
