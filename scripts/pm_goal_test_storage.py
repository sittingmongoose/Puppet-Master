#!/usr/bin/env python3
"""TEST_ONLY owner Storage for DG original-path planning oracles.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

This is an executable model owner, not native Storage. It actually performs
its modeled issuance and keeps its own durable state on disk:

* sequence allocation, Storage-assigned ``observed_at_utc`` /
  ``persisted_at_utc`` and ``acknowledged_at_utc`` from its own clock;
* raw ``SeglogFrameV2`` member frames and SP-347 group commit frames written
  to segment files (Plans/storage-plan.md Case L-2 byte profile, verified
  against Plans/seglog_frame_v2_wire_fixtures.json);
* CV-339 ``active_durable_group`` digests, eleven-field AppendReceipts and
  ``custody_v2`` first-receipt rows retained privately;
* dedupe by app-global event id and scoped (partition, type, key) identity,
  whole producer25 comparison, replay-only refusal;
* named cells with versions, generations, CAS, all-or-none transactions,
  snapshots and a nine-field durable read token plus transient snapshot id;
* Storage-supplied 32-byte seeds with collision rejection;
* SP-337-shaped payload packs (durable before a reference may be issued);
* retention-owner gap dispositions for retired sealed segments.

Every integer goes through ``pm_event_numbers`` (via pm_goal_test_numrule) and
every timestamp through ``pm_event_datetime``. No value comes from a fixture:
identities, seeds and times come from this process's own execution. Cut points
(``FaultPlan``) let a test kill the process at each protocol step; reopening
reads the bytes back and recovers per SP-347 (a valid commit frame in the
durable tail marks its group issued; a torn or missing commit frame leaves its
group unissued and the tail is truncated).
"""
from __future__ import annotations

import base64
import copy
from dataclasses import dataclass
import datetime as _dt
import hashlib
import json
import os
from pathlib import Path
import secrets
import time
import uuid
import weakref
import zlib

import jsonschema

import pm_goal_test_numrule as NR
from pm_goal_test_numrule import NumruleRefusal

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE
ROOT = NR.ROOT
MAGIC = b'PMSEGR2\x00'
PREFIX = 48
HEADER_CAP = 4096
PAYLOAD_CAP = 16777216
STORED_PART_CAP = 16384
CRASH_EXIT = 73
CONTROL_TYPE = 'pm.seglog.group_commit'
CONTROL_SCHEMA = ('pm.seglog.control.v1', '1.0.0', 'pm.seglog.group_commit.v1')
STORAGE_FIELDS = ('observed_at_utc', 'persisted_at_utc', 'sequence_id')
COMMIT_KEYS = ('commit_group_id', 'segment_name', 'segment_generation', 'manifest_generation',
               'durability_class', 'acknowledged_at_utc', 'first_sequence', 'last_sequence',
               'members', 'restore_admission')
RECEIPT_KEYS = ('event_id', 'sequence_id', 'segment_generation', 'segment_name', 'byte_offset',
                'commit_group_id', 'durability_class', 'durable_end_offset', 'durability_state',
                'manifest_generation', 'acknowledged_at_utc')
CUT_POINTS = ('before_reservation', 'after_reservation', 'before_append', 'torn_member_frame',
              'torn_commit_frame', 'after_append_frames', 'after_append', 'before_first_receipt',
              'after_first_receipt', 'before_terminal', 'after_terminal')

_EVENT_SCHEMA = json.loads((ROOT / 'Plans/event_record.schema.json').read_text())
_EVENT_VALIDATOR = jsonschema.Draft202012Validator(_EVENT_SCHEMA)
_RECEIPT_SCHEMA = json.loads((ROOT / 'Plans/event_append_receipt_contracts.schema.json').read_text())


def _receipt_validator(name):
    return jsonschema.Draft202012Validator({'$ref': '#/$defs/' + name, '$defs': _RECEIPT_SCHEMA['$defs']})


_CUSTODY_V2 = _receipt_validator('custody_v2')
_GROUP = _receipt_validator('active_durable_group')
_FULL_VALUE = _receipt_validator('full_value_result')


class StorageRefusal(Exception):
    """A TEST_ONLY Storage refusal; ``code`` is the guard that refused."""

    def __init__(self, code):
        super().__init__(code)
        self.code = code


class FrameError(Exception):
    def __init__(self, klass, code):
        super().__init__(klass + ':' + code)
        self.klass, self.code = klass, code


class Crash(BaseException):
    """In-process cut. Subprocess runs use os._exit(CRASH_EXIT) instead."""

    def __init__(self, point):
        super().__init__(point)
        self.point = point


def refuse(code):
    raise StorageRefusal(code)


def require(code, condition):
    if not condition:
        raise StorageRefusal(code)


def sha256(raw):
    return hashlib.sha256(raw).hexdigest()


def crc32(raw):
    # CRC32/ISO-HDLC; zlib implements exactly this parameter set.
    return zlib.crc32(raw) & 0xffffffff


def k_component(value):
    """SP-311/SP-312 K(s): unpadded base64url of exact UTF-8, no normalization."""
    require('key/component_type', type(value) is str)
    try:
        raw = value.encode('utf-8', 'strict')
    except UnicodeError:
        refuse('key/component_utf8')
    return base64.urlsafe_b64encode(raw).rstrip(b'=').decode('ascii')


def k_decode(text):
    require('key/component_type', type(text) is str)
    require('key/component_alphabet', all(c.isascii() and (c.isalnum() or c in '-_') for c in text))
    require('key/component_padding', len(text) % 4 != 1)
    try:
        raw = base64.urlsafe_b64decode(text + '=' * (-len(text) % 4))
        value = raw.decode('utf-8', 'strict')
    except (ValueError, UnicodeError):
        refuse('key/component_decode')
    require('key/component_reversible', k_component(value) == text)
    return value


def scope_partition(event):
    """CV-339: ``app`` or ``project~`` plus unpadded base64url of exact UTF-8 project ID."""
    if event['scope_kind'] == 'application':
        require('scope/application_project_null', event['project_id'] is None)
        return 'app'
    require('scope/project_id', type(event['project_id']) is str and event['project_id'] != '')
    return 'project~' + k_component(event['project_id'])


def _num(where, function, *args, **kwargs):
    try:
        return function(*args, **kwargs)
    except NumruleRefusal as error:
        raise StorageRefusal(error.reason) from error


def u64(value, where):
    return _num(where, NR.uint64, value, where)


def canonical(value, where='canonical'):
    return _num(where, NR.event_value_bytes, value, where)


def decode_canonical(raw, where='canonical'):
    return _num(where, NR.decode_event_value, raw, where)


def binding(value, where='binding'):
    return _num(where, NR.binding_value_bytes, value, where)


# ---------------------------------------------------------------- frame codec

def _prefix(header_len, payload_len, flags, generation, sequence, header_crc, payload_crc):
    raw = bytearray(PREFIX)
    raw[0:8] = MAGIC
    raw[8] = 2
    raw[9:11] = header_len.to_bytes(2, 'little')
    raw[11:15] = payload_len.to_bytes(4, 'little')
    raw[15] = flags
    raw[16:24] = generation.to_bytes(8, 'little')
    raw[24:32] = sequence.to_bytes(8, 'little')
    raw[32:36] = header_crc.to_bytes(4, 'little')
    raw[36:40] = payload_crc.to_bytes(4, 'little')
    raw[40:44] = crc32(bytes(raw)).to_bytes(4, 'little')
    return bytes(raw)


def event_header(event):
    return [1, event['event_id'], event['event_type'], event['schema_id'], event['schema_version'],
            event['payload_schema_id'], event['scope_kind'], event['project_id']]


def control_header(generation, sequence):
    return [1, 'seglog_commit:%d:%d' % (generation, sequence), CONTROL_TYPE, *CONTROL_SCHEMA, 'application', None]


def encode_event_frame(event, generation):
    generation = u64(generation, 'frame/generation')
    sequence = u64(event['sequence_id'], 'frame/sequence')
    header = canonical(event_header(event), 'frame/header')
    payload = canonical(event, 'frame/payload')
    require('frame/header_cap', len(header) <= HEADER_CAP)
    require('frame/payload_cap', len(payload) <= PAYLOAD_CAP)
    return _prefix(len(header), len(payload), 0, generation, sequence, crc32(header), crc32(payload)) + header + payload


def encode_commit_frame(commit, generation, sequence):
    generation = u64(generation, 'commit/generation')
    sequence = u64(sequence, 'commit/sequence')
    header = canonical(control_header(generation, sequence), 'commit/header')
    payload = canonical(commit, 'commit/payload')
    return _prefix(len(header), len(payload), 2, generation, sequence, crc32(header), crc32(payload)) + header + payload


@dataclass
class Frame:
    offset: int
    length: int
    flags: int
    sequence_id: int
    header: list
    value: dict
    raw: bytes

    @property
    def control(self):
        return self.flags == 2


def validate_event_record(event, where='event'):
    """Whole closed EventRecord 2.0.0 plus shared integer and date-time calls."""
    require(where + '/type', type(event) is dict)
    errors = sorted(_EVENT_VALIDATOR.iter_errors(event), key=lambda e: list(e.absolute_path))
    if errors:
        refuse(where + '/schema/' + '/'.join(str(p) for p in errors[0].absolute_path))
    u64(event['sequence_id'], where + '/sequence_id')
    if event['producer_sequence_id'] is not None:
        _num(where, NR.integer, event['producer_sequence_id'], where + '/producer_sequence_id', minimum=0)
    _num(where, NR.event_time, event['occurred_at_utc'], where + '/occurred_at_utc')
    _num(where, NR.storage_time, event['observed_at_utc'], where + '/observed_at_utc')
    _num(where, NR.storage_time, event['persisted_at_utc'], where + '/persisted_at_utc')
    return event


def _commit_shape(value, generation, sequence):
    if type(value) is not dict or tuple(sorted(value)) != tuple(sorted(COMMIT_KEYS)):
        raise FrameError('Corrupt', 'commit_payload_shape')
    for key in ('segment_generation', 'manifest_generation', 'first_sequence', 'last_sequence'):
        try:
            u64(value[key], 'commit/' + key)
        except StorageRefusal:
            raise FrameError('Corrupt', 'commit_payload_shape')
    if value['durability_class'] not in ('ordinary', 'barrier') or type(value['durability_class']) is not str:
        raise FrameError('Corrupt', 'commit_payload_shape')
    for key in ('commit_group_id', 'segment_name'):
        if type(value[key]) is not str or value[key] == '':
            raise FrameError('Corrupt', 'commit_payload_shape')
    try:
        _num('commit', NR.storage_time, value['acknowledged_at_utc'], 'commit/acknowledged_at_utc')
    except StorageRefusal:
        raise FrameError('Corrupt', 'commit_payload_shape')
    if value['restore_admission'] is not None:
        raise FrameError('Unsupported', 'restore_admission_unadmitted')
    members = value['members']
    if type(members) is not list or not members:
        raise FrameError('Corrupt', 'commit_payload_shape')
    for member in members:
        if type(member) is not list or len(member) != 3 or type(member[0]) is not str:
            raise FrameError('Corrupt', 'commit_payload_shape')
    if value['segment_generation'] != generation or value['last_sequence'] != sequence:
        raise FrameError('Corrupt', 'commit_payload_identity')


def decode_frame(buf, offset, *, generation, prior_sequence, prior_control):
    """Mandatory Case L-2 validation order, steps 1-10."""
    end = len(buf)
    if end - offset < 8 or buf[offset:offset + 8] != MAGIC:
        if end - offset < 8 and buf[offset:end] == MAGIC[:end - offset]:
            raise FrameError('Corrupt', 'prefix_truncated')
        raise FrameError('Corrupt', 'magic')
    if end - offset < PREFIX:
        raise FrameError('Corrupt', 'prefix_truncated')
    prefix = bytearray(buf[offset:offset + PREFIX])
    stored_prefix_crc = int.from_bytes(prefix[40:44], 'little')
    prefix[40:44] = b'\0\0\0\0'
    if crc32(bytes(prefix)) != stored_prefix_crc:
        raise FrameError('Corrupt', 'prefix_crc')
    version = prefix[8]
    if version != 2:
        raise FrameError('Unsupported', 'unsupported_frame_version')
    if prefix[44:48] != b'\0\0\0\0':
        raise FrameError('Corrupt', 'reserved_nonzero')
    flags = prefix[15]
    if flags not in (0, 2):
        raise FrameError('Unsupported', 'unsupported_flags')
    header_len = int.from_bytes(prefix[9:11], 'little')
    payload_len = int.from_bytes(prefix[11:15], 'little')
    if header_len > HEADER_CAP or payload_len > PAYLOAD_CAP:
        raise FrameError('Corrupt', 'frame_caps')
    if end - offset - PREFIX < header_len + payload_len:
        raise FrameError('Corrupt', 'frame_truncated')
    frame_generation = int.from_bytes(prefix[16:24], 'little')
    sequence = int.from_bytes(prefix[24:32], 'little')
    if frame_generation != generation:
        raise FrameError('Corrupt', 'generation_mismatch')
    if flags == 0 and prior_sequence is not None and sequence <= prior_sequence:
        raise FrameError('Corrupt', 'sequence_progression')
    header_raw = bytes(buf[offset + PREFIX:offset + PREFIX + header_len])
    payload_raw = bytes(buf[offset + PREFIX + header_len:offset + PREFIX + header_len + payload_len])
    if crc32(header_raw) != int.from_bytes(prefix[32:36], 'little'):
        raise FrameError('Corrupt', 'header_crc')
    try:
        header = decode_canonical(header_raw, 'frame/header')
    except StorageRefusal:
        raise FrameError('Corrupt', 'header_codec')
    if type(header) is not list or not header or header[0] != 1 or type(header[0]) is not int:
        raise FrameError('Unsupported', 'header_version')
    if len(header) != 8 or any(type(x) is not str or x == '' for x in header[1:7]) or not (
            header[7] is None or (type(header[7]) is str and header[7] != '')):
        raise FrameError('Corrupt', 'header_shape')
    if flags == 2 and header != control_header(generation, sequence):
        raise FrameError('Corrupt', 'control_header_mismatch')
    if flags == 2 and (prior_sequence is None or prior_control or sequence != prior_sequence):
        # SP-347: a control frame carries the prior frame's sequence and is
        # never first in a segment or after another control frame.
        raise FrameError('Corrupt', 'control_sequence')
    if flags == 0 and header[2] == CONTROL_TYPE:
        raise FrameError('Corrupt', 'control_header_mismatch')
    if crc32(payload_raw) != int.from_bytes(prefix[36:40], 'little'):
        raise FrameError('Corrupt', 'payload_crc')
    try:
        value = decode_canonical(payload_raw, 'frame/payload')
    except StorageRefusal:
        raise FrameError('Corrupt', 'payload_codec')
    if flags == 2:
        _commit_shape(value, generation, sequence)
    else:
        if type(value) is not dict:
            raise FrameError('Corrupt', 'payload_shape')
        try:
            validate_event_record(value, 'frame/event')
        except StorageRefusal as error:
            raise FrameError('Corrupt', 'event_record:' + error.code)
        if event_header(value) != header or value['sequence_id'] != sequence:
            raise FrameError('Corrupt', 'duplicate_header_envelope_identity')
    length = PREFIX + header_len + payload_len
    return Frame(offset, length, flags, sequence, header, value, bytes(buf[offset:offset + length]))


def group_digest(storage_instance_id, commit, frames, schema_version='2.0.0'):
    members = [[f.value['event_id'], f.sequence_id, f.offset, f.length, sha256(f.raw)] for f in frames]
    start = frames[0].offset
    end = frames[-1].offset + frames[-1].length
    tuple_ = ['pm.active_durable_group.v2', schema_version, storage_instance_id, commit['commit_group_id'],
              commit['durability_class'], commit['segment_generation'], commit['segment_name'], start, end,
              commit['manifest_generation'], members, []]
    return sha256(binding(tuple_, 'group/digest')), start, end, members


def receipts_from_commit(commit, commit_offset):
    out = []
    for event_id, sequence, offset in commit['members']:
        out.append(dict(event_id=event_id, sequence_id=sequence, segment_generation=commit['segment_generation'],
                        segment_name=commit['segment_name'], byte_offset=offset,
                        commit_group_id=commit['commit_group_id'], durability_class=commit['durability_class'],
                        durable_end_offset=commit_offset, durability_state='synced',
                        manifest_generation=commit['manifest_generation'],
                        acknowledged_at_utc=commit['acknowledged_at_utc']))
    return out


def scan_segment(raw, *, generation, name, storage_instance_id, prior_sequence=None, stop=None):
    """Return issued groups, the durable watermark and the tail classification.

    Groups end at a valid commit frame whose member triples equal the frames
    between the previous commit and itself (SP-347). Bytes after the last valid
    commit frame are an unacknowledged tail.
    """
    stop = len(raw) if stop is None else stop
    offset, pending, groups, watermark = 0, [], [], 0
    sequence, prior_control, tail = prior_sequence, False, None
    while offset < stop:
        try:
            frame = decode_frame(raw[:stop], offset, generation=generation, prior_sequence=sequence,
                                 prior_control=prior_control)
        except FrameError as error:
            tail = (error.klass, error.code, offset)
            break
        if frame.control:
            commit = frame.value
            expected = [[f.value['event_id'], f.sequence_id, f.offset] for f in pending]
            if not pending or commit['members'] != expected or commit['segment_name'] != name or \
                    commit['first_sequence'] != pending[0].sequence_id:
                tail = ('Corrupt', 'commit_membership', offset)
                break
            digest, start, end, members = group_digest(storage_instance_id, commit, pending)
            if end != frame.offset:
                tail = ('Corrupt', 'commit_tiling', offset)
                break
            groups.append(dict(commit=commit, commit_offset=frame.offset, commit_raw=frame.raw,
                               frames=list(pending), digest=digest, durable_start_offset=start,
                               durable_end_offset=end, members=members,
                               receipts=receipts_from_commit(commit, frame.offset)))
            pending = []
            watermark = frame.offset + frame.length
        else:
            pending.append(frame)
        sequence, prior_control = frame.sequence_id, frame.control
        offset += frame.length
    if tail is None and pending:
        tail = ('UnacknowledgedTail', 'missing_commit_frame', pending[0].offset)
    # Scanning stops at the first defect, so every defect lies at or after the
    # watermark: bytes there were never acknowledged. Unsupported frames are
    # not corruption and are reported as such.
    if tail is None:
        klass = 'Valid'
    elif tail[0] == 'Unsupported':
        klass = 'Unsupported'
    else:
        klass = 'UnacknowledgedTail'
    return dict(groups=groups, watermark=watermark, tail=tail, klass=klass)


# ------------------------------------------------------------------- handles

class _Handle:
    """Opaque owner-private capability. Never serialized, never a JSON field."""
    __slots__ = ('__weakref__', 'kind', 'qualification')

    def __init__(self, kind):
        self.kind = kind
        self.qualification = QUALIFICATION

    def __repr__(self):
        return '<TEST_ONLY %s handle>' % self.kind

    def __reduce__(self):
        refuse('handle/not_serializable')

    def __copy__(self):
        refuse('handle/not_copyable')

    def __deepcopy__(self, memo):
        refuse('handle/not_copyable')


@dataclass
class FaultPlan:
    cut: str | None = None
    mode: str = 'raise'  # 'raise' in-process, 'exit' for a real process death
    torn_bytes: int = 40

    def __post_init__(self):
        require('fault/cut', self.cut is None or self.cut in CUT_POINTS)
        require('fault/mode', self.mode in ('raise', 'exit'))


def _fsync_dir(path):
    fd = os.open(path, os.O_RDONLY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def _atomic_write(path, raw):
    tmp = path.with_name(path.name + '.tmp')
    with open(tmp, 'wb') as handle:
        handle.write(raw)
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(tmp, path)
    _fsync_dir(path.parent)


def format_ms(ms):
    ms = u64(ms, 'clock/ms')
    stamp = _dt.datetime.fromtimestamp(ms // 1000, tz=_dt.timezone.utc)
    text = stamp.strftime('%Y-%m-%dT%H:%M:%S') + '.%03dZ' % (ms % 1000)
    return _num('clock', NR.storage_time, text, 'clock/format')


class TestOwnerStorage:
    """TEST_ONLY Storage owner with real durable bytes and private custody."""

    qualification = QUALIFICATION
    native = NATIVE_LINE

    def __init__(self, root, *, faults=None, segment_target_bytes=65536, _new=False):
        self.root = Path(root)
        self.faults = faults or FaultPlan()
        self.segment_target_bytes = segment_target_bytes
        self._handles = weakref.WeakKeyDictionary()
        self._receipt_handles = weakref.WeakKeyDictionary()
        self.calls = []
        if _new:
            self._birth()
        else:
            self._open()

    # ---------------------------------------------------------- lifecycle
    @classmethod
    def create(cls, root, **kwargs):
        root = Path(root)
        root.mkdir(parents=True, exist_ok=True)
        require('storage/create_empty', not (root / 'CURRENT').exists())
        return cls(root, _new=True, **kwargs)

    @classmethod
    def open(cls, root, **kwargs):
        return cls(root, **kwargs)

    def _birth(self):
        self.storage_instance_id = str(uuid.uuid4())
        self.manifest_generation = 0
        self.recovery_epoch = 0
        self.clock_last_ms = u64(time.time_ns() // 1_000_000, 'clock/birth')
        self.group_counter = 0
        self.tx_counter = 0
        self.cell_generation = 0
        self.segments = [dict(generation=1, name='segment-1', watermark=0, sealed=False, retired=False)]
        self.reservations = {}
        self.custody = {}
        self.cells = {}
        self.seeds = []
        self.gaps = []
        self.packs = {}
        self.index_seed_hex = secrets.token_hex(32)
        self.index_frontier_revision = 0
        self.index_frontier_sha256 = None
        self.excluded = []
        (self.root / 'packs').mkdir(exist_ok=True)
        self._segment_path(1).touch()
        self._rebuild_index()
        self._commit_state()

    def _segment_path(self, generation):
        return self.root / ('segment-%d.seglog' % generation)

    def _state(self):
        return dict(qualification=QUALIFICATION, schema='pm.goal_test.storage_manifest.v1',
                    storage_instance_id=self.storage_instance_id, manifest_generation=self.manifest_generation,
                    recovery_epoch=self.recovery_epoch, clock_last_ms=self.clock_last_ms,
                    group_counter=self.group_counter, tx_counter=self.tx_counter,
                    cell_generation=self.cell_generation, segments=self.segments,
                    reservations=self.reservations, custody=self.custody, cells=self.cells,
                    seeds=self.seeds, gaps=self.gaps, packs=self.packs, excluded=self.excluded,
                    index_seed_hex=self.index_seed_hex,
                    index_frontier_revision=self.index_frontier_revision,
                    index_frontier_sha256=self.index_frontier_sha256)

    def _commit_state(self):
        self.manifest_generation = u64(self.manifest_generation + 1, 'manifest/generation')
        raw = canonical(self._state(), 'manifest/bytes')
        name = 'manifest.%d.msgpack' % self.manifest_generation
        _atomic_write(self.root / name, raw)
        current = dict(qualification=QUALIFICATION, schema='pm.goal_test.storage_current.v1',
                       storage_instance_id=self.storage_instance_id, manifest_ref=name,
                       manifest_generation=self.manifest_generation, manifest_sha256=sha256(raw))
        _atomic_write(self.root / 'CURRENT', canonical(current, 'current/bytes'))
        old = self.root / ('manifest.%d.msgpack' % (self.manifest_generation - 2))
        if old.exists():
            old.unlink()

    def _open(self):
        current_raw = (self.root / 'CURRENT').read_bytes()
        current = decode_canonical(current_raw, 'open/current')
        require('open/qualification', current.get('qualification') == QUALIFICATION)
        raw = (self.root / current['manifest_ref']).read_bytes()
        require('open/manifest_hash', sha256(raw) == current['manifest_sha256'])
        state = decode_canonical(raw, 'open/manifest')
        require('open/manifest_generation', state['manifest_generation'] == current['manifest_generation'])
        require('open/instance', state['storage_instance_id'] == current['storage_instance_id'])
        for key in ('storage_instance_id', 'manifest_generation', 'recovery_epoch', 'clock_last_ms',
                    'group_counter', 'tx_counter', 'cell_generation', 'segments', 'reservations', 'custody',
                    'cells', 'seeds', 'gaps', 'packs', 'excluded', 'index_seed_hex',
                    'index_frontier_revision', 'index_frontier_sha256'):
            setattr(self, key, state[key])
        self.recovered = self._recover()

    def _recover(self):
        """SP-347 convergence: issue complete tail groups, truncate the rest."""
        notes = []
        changed = False
        prior = None
        for segment in self.segments:
            if segment['retired']:
                prior = None
                continue
            path = self._segment_path(segment['generation'])
            raw = path.read_bytes()
            scan = scan_segment(raw, generation=segment['generation'], name=segment['name'],
                                storage_instance_id=self.storage_instance_id, prior_sequence=prior)
            require('recover/durable_prefix_valid', scan['watermark'] >= segment['watermark'])
            if scan['watermark'] > segment['watermark']:
                for group in scan['groups']:
                    if group['commit_offset'] >= segment['watermark']:
                        gid = group['commit']['commit_group_id']
                        for op, r in self.reservations.items():
                            if r['commit_group_id'] == gid and r['state'] == 'reserved':
                                r['state'] = 'appended'
                                r['event_ids'] = [m[0] for m in group['commit']['members']]
                                notes.append(dict(kind='tail_group_issued', operation_id=op, commit_group_id=gid))
                segment['watermark'] = scan['watermark']
                changed = True
            if len(raw) > scan['watermark']:
                self.excluded.append(dict(segment_generation=segment['generation'], start=scan['watermark'],
                                          end=len(raw), reason='unacknowledged_tail:' + (scan['tail'] or ('', ''))[1]))
                with open(path, 'r+b') as handle:
                    handle.truncate(scan['watermark'])
                    handle.flush()
                    os.fsync(handle.fileno())
                notes.append(dict(kind='tail_truncated', segment_generation=segment['generation'],
                                  truncate_to=scan['watermark'], bytes=len(raw) - scan['watermark']))
                changed = True
            if scan['groups']:
                prior = scan['groups'][-1]['frames'][-1].sequence_id
        self._rebuild_index()
        if changed:
            self.recovery_epoch = u64(self.recovery_epoch + 1, 'recover/epoch')
            self._advance_frontier()
            self._commit_state()
        return notes

    # ---------------------------------------------------------- index
    def _rebuild_index(self):
        self.events, self.scoped, self.groups = {}, {}, []
        self.last_sequence = None
        prior = None
        for segment in self.segments:
            if segment['retired']:
                continue
            raw = self._segment_path(segment['generation']).read_bytes()
            scan = scan_segment(raw, generation=segment['generation'], name=segment['name'],
                                storage_instance_id=self.storage_instance_id, prior_sequence=prior,
                                stop=segment['watermark'])
            require('index/durable_prefix', scan['watermark'] == segment['watermark'] and scan['tail'] is None)
            for group in scan['groups']:
                self._index_group(segment, group)
            if scan['groups']:
                prior = scan['groups'][-1]['frames'][-1].sequence_id
        for gap in self.gaps:
            if self.last_sequence is None or gap['last_sequence'] > self.last_sequence:
                self.last_sequence = gap['last_sequence']

    def _index_group(self, segment, group):
        self.groups.append(dict(segment_generation=segment['generation'], **{
            k: group[k] for k in ('commit', 'commit_offset', 'digest', 'durable_start_offset',
                                  'durable_end_offset', 'members', 'receipts')}))
        for frame, receipt in zip(group['frames'], group['receipts']):
            event = frame.value
            identity = (scope_partition(event), event['event_type'], event['idempotency_key'])
            require('index/duplicate_event_id', event['event_id'] not in self.events)
            require('index/duplicate_scoped_identity', identity not in self.scoped)
            self.events[event['event_id']] = dict(segment_generation=segment['generation'], offset=frame.offset,
                                                 length=frame.length, sequence_id=frame.sequence_id,
                                                 frame_sha256=sha256(frame.raw), identity=identity,
                                                 producer25=sha256(canonical(producer25(event))),
                                                 receipt=receipt, group_digest=group['digest'],
                                                 commit_group_id=group['commit']['commit_group_id'])
            self.scoped[identity] = event['event_id']
            self.last_sequence = frame.sequence_id

    def _advance_frontier(self):
        prior = self.index_frontier_sha256
        self.index_frontier_revision = u64(self.index_frontier_revision + 1, 'frontier/revision')
        self.index_frontier_sha256 = sha256(binding([
            'pm.goal_test.event_index_frontier.v1', self.index_anchor_sha256(), self.index_frontier_revision,
            prior or '', self.last_sequence if self.last_sequence is not None else 0,
            self.durable_watermarks_sha256()], 'frontier/hash'))

    # ---------------------------------------------------------- faults
    def _cut(self, point):
        if self.faults.cut == point:
            if self.faults.mode == 'exit':
                os._exit(CRASH_EXIT)
            raise Crash(point)

    # ---------------------------------------------------------- clock
    def _tick(self):
        now = u64(time.time_ns() // 1_000_000, 'clock/now')
        self.clock_last_ms = u64(max(now, self.clock_last_ms + 1), 'clock/monotonic')
        return format_ms(self.clock_last_ms)

    # ---------------------------------------------------------- reservations
    def _issue_handle(self, kind, payload):
        handle = _Handle(kind)
        self._handles[handle] = payload
        return handle

    def _resolve_handle(self, handle, kind):
        require('handle/type', type(handle) is _Handle)
        require('handle/issuer', handle in self._handles)
        require('handle/kind', handle.kind == kind)
        return self._handles[handle]

    def reserve(self, operation_id, request):
        """Phase A: durable owner-operation reservation; no sequence is allocated."""
        require('reserve/operation_type', type(operation_id) is str and operation_id != '')
        digest = sha256(canonical(request, 'reserve/request'))
        existing = self.reservations.get(operation_id)
        if existing is not None:
            require('reserve/conflict', existing['request_sha256'] == digest)
            return self._issue_handle('reservation', operation_id)
        self._cut('before_reservation')
        self.group_counter = u64(self.group_counter + 1, 'reserve/group_counter')
        self.reservations[operation_id] = dict(
            operation_id=operation_id, request_sha256=digest, state='reserved', reserved_at_utc=self._tick(),
            commit_group_id='TEST_ONLY:group:%s:%d' % (self.storage_instance_id, self.group_counter),
            event_ids=[], terminal=None)
        self._commit_state()
        self._cut('after_reservation')
        return self._issue_handle('reservation', operation_id)

    def resume(self, operation_id, request):
        """Re-entry after restart: authenticate the durable reservation by request."""
        r = self.reservations.get(operation_id)
        require('resume/absent', r is not None)
        require('resume/conflict', r['request_sha256'] == sha256(canonical(request, 'resume/request')))
        return self._issue_handle('reservation', operation_id), r['state']

    def release(self, handle):
        op = self._resolve_handle(handle, 'reservation')
        r = self.reservations[op]
        require('release/state', r['state'] in ('reserved', 'released'))
        if r['state'] == 'reserved':
            r['state'] = 'released'
            self._commit_state()
        return dict(operation_id=op, outcome='confirmed_no_effect', qualification=QUALIFICATION)

    def reservation_state(self, operation_id):
        r = self.reservations.get(operation_id)
        return None if r is None else copy.deepcopy(r)

    # ---------------------------------------------------------- append
    def _active_segment(self, need):
        segment = self.segments[-1]
        if segment['watermark'] > 0 and segment['watermark'] + need > self.segment_target_bytes:
            segment['sealed'] = True
            generation = u64(segment['generation'] + 1, 'segment/generation')
            segment = dict(generation=generation, name='segment-%d' % generation, watermark=0,
                           sealed=False, retired=False)
            self.segments.append(segment)
            self._segment_path(generation).touch()
            _fsync_dir(self.root)
        return segment

    def _candidate(self, candidate, where):
        require(where + '/type', type(candidate) is dict)
        for field in STORAGE_FIELDS:
            require(where + '/storage_metadata_supplied/' + field, field not in candidate)
        _num(where, NR.append_policy, candidate.get('replay_policy'), where + '/replay_policy')
        require(where + '/redaction_profile', candidate.get('redaction_profile') == 'no_secrets')
        return candidate

    def append(self, handle, candidates, *, durability_class='ordinary'):
        """Phase B: allocate sequences/times, write frames and the commit frame."""
        op = self._resolve_handle(handle, 'reservation')
        r = self.reservations[op]
        require('append/released', r['state'] != 'released')
        if r['state'] != 'reserved':
            return dict(status='already_appended', event_ids=list(r['event_ids']))
        require('append/durability_class', durability_class in ('ordinary', 'barrier'))
        require('append/nonempty', type(candidates) is list and len(candidates) > 0)
        hits, fresh = [], []
        for i, c in enumerate(candidates):
            self._candidate(c, 'append/candidate')
            identity = (scope_partition(c), c['event_type'], c['idempotency_key'])
            existing = self.scoped.get(identity) or (c['event_id'] if c['event_id'] in self.events else None)
            if existing is None:
                fresh.append(c)
                continue
            require('append/append_once_exists', c['replay_policy'] != 'append_once')
            info = self.events[existing]
            require('append/conflict/event_id', existing == c['event_id'])
            require('append/conflict/scoped_identity', info['identity'] == identity)
            require('append/conflict/producer25', info['producer25'] == sha256(canonical(producer25(c))))
            hits.append(existing)
        require('append/partial_dedupe', not (hits and fresh))
        if hits:
            r['state'] = 'appended'
            r['event_ids'] = hits
            r['dedupe'] = True
            self._commit_state()
            return dict(status='dedupe', event_ids=list(hits))
        ids = [c['event_id'] for c in fresh]
        require('append/duplicate_in_group', len(set(ids)) == len(ids))
        self._cut('before_append')
        observed = self._tick()
        persisted = self._tick()
        sequence = -1 if self.last_sequence is None else self.last_sequence
        events = []
        for c in fresh:
            sequence = u64(sequence + 1, 'append/sequence')
            event = dict(c, observed_at_utc=observed, persisted_at_utc=persisted, sequence_id=sequence)
            validate_event_record(event, 'append/event')
            require('append/stored_part_cap', len(canonical(event)) <= STORED_PART_CAP)
            events.append(event)
        frames_raw = []
        estimate = sum(len(encode_event_frame(e, 0)) for e in events) + 1024
        segment = self._active_segment(estimate)
        offset = segment['watermark']
        members = []
        for event in events:
            raw = encode_event_frame(event, segment['generation'])
            members.append([event['event_id'], event['sequence_id'], offset])
            frames_raw.append(raw)
            offset += len(raw)
        commit = dict(commit_group_id=r['commit_group_id'], segment_name=segment['name'],
                      segment_generation=segment['generation'], manifest_generation=self.manifest_generation,
                      durability_class=durability_class, acknowledged_at_utc=persisted,
                      first_sequence=events[0]['sequence_id'], last_sequence=events[-1]['sequence_id'],
                      members=members, restore_admission=None)
        commit_raw = encode_commit_frame(commit, segment['generation'], events[-1]['sequence_id'])
        member_bytes = b''.join(frames_raw)
        path = self._segment_path(segment['generation'])
        with open(path, 'r+b') as handle_:
            handle_.seek(segment['watermark'])
            handle_.truncate(segment['watermark'])
            if self.faults.cut == 'torn_member_frame':
                handle_.write(member_bytes[:max(1, min(self.faults.torn_bytes, len(member_bytes) - 1))])
                handle_.flush()
                os.fsync(handle_.fileno())
                self._cut('torn_member_frame')
            handle_.write(member_bytes)
            if self.faults.cut == 'torn_commit_frame':
                handle_.write(commit_raw[:self.faults.torn_bytes])
                handle_.flush()
                os.fsync(handle_.fileno())
                self._cut('torn_commit_frame')
            handle_.write(commit_raw)
            handle_.flush()
            os.fsync(handle_.fileno())
        self._cut('after_append_frames')
        segment['watermark'] = offset + len(commit_raw)
        r['state'] = 'appended'
        r['event_ids'] = ids
        raw = path.read_bytes()
        scan = scan_segment(raw, generation=segment['generation'], name=segment['name'],
                            storage_instance_id=self.storage_instance_id,
                            prior_sequence=None, stop=segment['watermark'])
        require('append/readback', scan['tail'] is None and scan['groups'][-1]['commit'] == commit)
        self._index_group(segment, scan['groups'][-1])
        self._advance_frontier()
        self._commit_state()
        self._cut('after_append')
        return dict(status='appended', event_ids=list(ids))

    # ---------------------------------------------------------- first receipt
    def _custody_row(self, event_id):
        info = self.events[event_id]
        event = self.read_event(event_id)
        row = dict(schema_id='pm.storage_value.event_append_receipt_custody.v2', schema_version='2.0.0',
                   storage_instance_id=self.storage_instance_id, event_id=event_id,
                   scope_partition=info['identity'][0], event_type=event['event_type'],
                   idempotency_key=event['idempotency_key'],
                   producer_semantic_digest=_num('custody', NR.producer_digest, event, 'custody/producer'),
                   group_digest=info['group_digest'], first_append_receipt=copy.deepcopy(info['receipt']),
                   redaction_profile=event['redaction_profile'],
                   original_segment_ref='TEST_ONLY:segment-ref:' + sha256(binding(
                       ['pm.goal_test.segment_ref.v1', self.storage_instance_id, info['segment_generation'],
                        'segment-%d' % info['segment_generation']])),
                   original_event_value_commitment=dict(
                       schema_id='pm.storage.original_event_value_commitment.v1', schema_version='1.0.0',
                       codec='pm.seglog_frame_v2.event_value.canonical_msgpack.v1',
                       domain='pm.storage.original_event_value_commitment.v1', event_schema_id='pm.event.v0',
                       event_schema_version='2.0.0',
                       sha256=_num('custody', NR.full_value_commitment, event, 'custody/full_value')))
        errors = list(_CUSTODY_V2.iter_errors(row))
        require('custody/schema', not errors)
        return row

    def issue_first_receipt(self, handle):
        """Phase C: issue and privately retain first custody for every member."""
        op = self._resolve_handle(handle, 'reservation')
        r = self.reservations[op]
        require('receipt/state', r['state'] in ('appended', 'receipted', 'published'))
        if r['state'] == 'appended':
            missing = [e for e in r['event_ids'] if e not in self.custody]
            if missing:
                self._cut('before_first_receipt')
                for event_id in missing:
                    self.custody[event_id] = self._custody_row(event_id)
            r['state'] = 'receipted'
            self._commit_state()
            self._cut('after_first_receipt')
        return [self._receipt_handle(e) for e in r['event_ids']]

    def _receipt_handle(self, event_id):
        handle = _Handle('first_receipt')
        self._receipt_handles[handle] = event_id
        return handle

    def receipt_of(self, handle):
        require('receipt_handle/type', type(handle) is _Handle and handle.kind == 'first_receipt')
        require('receipt_handle/issuer', handle in self._receipt_handles)
        event_id = self._receipt_handles[handle]
        return copy.deepcopy(self.custody[event_id])

    def first_custody(self, event_id):
        row = self.custody.get(event_id)
        return None if row is None else copy.deepcopy(row)

    def authenticate_receipt(self, event_id, presented):
        """Compare a presented value with private custody; it never creates custody."""
        row = self.custody.get(event_id)
        require('custody/unavailable', row is not None)
        require('custody/receipt_mismatch', canonical(presented) == canonical(row['first_append_receipt']))
        return copy.deepcopy(row)

    def full_value_result(self, event_id):
        row = self.custody.get(event_id)
        require('custody/unavailable', row is not None)
        result = dict(first_append_receipt=copy.deepcopy(row['first_append_receipt']),
                      original_segment_ref=row['original_segment_ref'],
                      original_event_value_commitment=copy.deepcopy(row['original_event_value_commitment']))
        require('custody/full_value_schema', not list(_FULL_VALUE.iter_errors(result)))
        return result

    def active_durable_group(self, event_id):
        info = self.events[event_id]
        group = next(g for g in self.groups if g['commit']['commit_group_id'] == info['commit_group_id'])
        commit = group['commit']
        value = dict(schema_version='2.0.0', storage_instance_id=self.storage_instance_id,
                     commit_group_id=commit['commit_group_id'], durability_class=commit['durability_class'],
                     segment_generation=commit['segment_generation'], segment_name=commit['segment_name'],
                     durable_start_offset=group['durable_start_offset'],
                     durable_end_offset=group['durable_end_offset'],
                     manifest_generation=commit['manifest_generation'],
                     members=[dict(event_id=m[0], sequence_id=m[1], byte_offset=m[2], frame_length=m[3],
                                   frame_sha256=m[4]) for m in group['members']],
                     group_digest=group['digest'], restore_admission=None)
        require('group/schema', not list(_GROUP.iter_errors(value)))
        return value

    # ---------------------------------------------------------- reads
    def read_frame(self, event_id):
        info = self.events.get(event_id)
        require('read/event_unavailable', info is not None)
        with open(self._segment_path(info['segment_generation']), 'rb') as handle:
            handle.seek(info['offset'])
            raw = handle.read(info['length'])
        require('read/frame_hash', sha256(raw) == info['frame_sha256'])
        return raw

    def read_event(self, event_id):
        info = self.events.get(event_id)
        require('read/event_unavailable', info is not None)
        raw = self.read_frame(event_id)
        frame = decode_frame(raw, 0, generation=info['segment_generation'], prior_sequence=None, prior_control=False)
        return frame.value

    def event_by_identity(self, partition, event_type, key):
        return self.scoped.get((partition, event_type, key))

    # ---------------------------------------------------------- cells/CAS
    def transact(self, writes, *, operation=None, cut_before=None, cut_after=None):
        """All-or-none write set with per-key CAS; returns the transaction record."""
        require('tx/writes', type(writes) is list and writes)
        staged = copy.deepcopy(self.cells)
        for write in writes:
            require('tx/write_shape', type(write) is dict and set(write) <= {'table', 'key', 'expected', 'value', 'delete'})
            table, key = write['table'], write['key']
            require('tx/table', type(table) is str and table != '')
            require('tx/key', type(key) is str and key != '')
            current = staged.get(table, {}).get(key)
            expected = write.get('expected')
            if expected is None:
                require('tx/cas_absent', current is None)
            else:
                u64(expected, 'tx/expected')
                require('tx/cas_version', current is not None and current['version'] == expected)
            if write.get('delete'):
                require('tx/delete_present', current is not None)
                del staged[table][key]
                continue
            canonical(write['value'], 'tx/value')
            require('tx/stored_part_cap', len(canonical(write['value'])) <= STORED_PART_CAP)
            version = 1 if current is None else u64(current['version'] + 1, 'tx/version')
            staged.setdefault(table, {})[key] = dict(version=version, value=copy.deepcopy(write['value']))
        if cut_before:
            self._cut(cut_before)
        self.tx_counter = u64(self.tx_counter + 1, 'tx/counter')
        self.cell_generation = u64(self.cell_generation + 1, 'tx/generation')
        tx_id = 'TEST_ONLY:tx:%s:%d' % (self.storage_instance_id, self.tx_counter)
        for write in writes:
            if not write.get('delete'):
                staged[write['table']][write['key']]['tx'] = tx_id
        self.cells = staged
        if operation is not None:
            r = self.reservations[operation]
            r['state'] = 'published'
            r['terminal'] = dict(tx_id=tx_id, writes=[[w['table'], w['key']] for w in writes])
        self._commit_state()
        if cut_after:
            self._cut(cut_after)
        return dict(tx_id=tx_id, generation=self.cell_generation, qualification=QUALIFICATION)

    def cell(self, table, key):
        value = self.cells.get(table, {}).get(key)
        return None if value is None else copy.deepcopy(value)

    def publish_terminal(self, handle, table, key, value):
        """Phase D: terminal publication once, by CAS from absent."""
        op = self._resolve_handle(handle, 'reservation')
        r = self.reservations[op]
        if r['state'] == 'published':
            current = self.cell(table, key)
            require('terminal/replay_target', current is not None and [table, key] in r['terminal']['writes'])
            require('terminal/replay_conflict', canonical(current['value']) == canonical(value))
            return dict(tx_id=r['terminal']['tx_id'], replay=True, qualification=QUALIFICATION)
        require('terminal/state', r['state'] == 'receipted')
        return self.transact([dict(table=table, key=key, expected=None, value=value)], operation=op,
                             cut_before='before_terminal', cut_after='after_terminal')

    def new_seed(self):
        """Storage-supplied 32 random bytes with collision rejection (SP-311)."""
        while True:
            seed = secrets.token_hex(32)
            if seed not in self.seeds:
                self.seeds.append(seed)
                self._commit_state()
                return seed

    # ---------------------------------------------------------- packs
    def put_pack(self, raw, media_type):
        require('pack/bytes', type(raw) is bytes)
        require('pack/media_type', type(media_type) is str and media_type != '')
        import blake3
        digest = blake3.blake3(raw).hexdigest()
        path = self.root / 'packs' / digest
        if not path.exists():
            _atomic_write(path, raw)
        self.packs[digest] = dict(byte_size=len(raw), media_type=media_type, durable=True)
        self._commit_state()
        return dict(blake3=digest, byte_size=len(raw), media_type=media_type)

    def read_pack(self, reference, *, expected_media_type):
        require('pack/reference', type(reference) is dict and set(reference) == {'blake3', 'byte_size', 'media_type'})
        record = self.packs.get(reference['blake3'])
        require('pack/unavailable', record is not None and record['durable'] is True)
        path = self.root / 'packs' / reference['blake3']
        require('pack/present', path.exists())
        raw = path.read_bytes()
        _num('pack', NR.verify_payload, raw, byte_size=reference['byte_size'], payload_id=reference['blake3'],
             media_type=reference['media_type'], expected_media_type=expected_media_type)
        return raw

    def withdraw_pack(self, digest):
        record = self.packs.get(digest)
        require('pack/unavailable', record is not None)
        record['durable'] = False
        path = self.root / 'packs' / digest
        if path.exists():
            path.unlink()
        self._commit_state()

    # ---------------------------------------------------------- retention
    def retire_segment(self, generation, retention_owner):
        """Retire a sealed segment through the registered retention owner."""
        segment = next((s for s in self.segments if s['generation'] == generation), None)
        require('retire/segment', segment is not None)
        require('retire/sealed', segment['sealed'] is True and segment['retired'] is False)
        require('retire/owner', isinstance(retention_owner, RetentionOwner) and retention_owner.storage is self)
        raw = self._segment_path(generation).read_bytes()[:segment['watermark']]
        sequences = [info['sequence_id'] for info in self.events.values() if info['segment_generation'] == generation]
        require('retire/nonempty', sequences)
        disposition = dict(qualification=QUALIFICATION, segment_generation=generation, segment_name=segment['name'],
                           first_sequence=min(sequences), last_sequence=max(sequences), frame_count=len(sequences),
                           durable_prefix_sha256=sha256(raw), retention_owner_id=retention_owner.owner_id,
                           reason='TEST_ONLY:retention-expired')
        disposition['proof_sha256'] = retention_owner.sign(disposition)
        self.gaps.append(disposition)
        segment['retired'] = True
        self._segment_path(generation).unlink()
        self._rebuild_index()
        self._advance_frontier()
        self._commit_state()
        return copy.deepcopy(disposition)

    # ---------------------------------------------------------- token/source
    def index_anchor_sha256(self):
        return sha256(binding(['pm.goal_test.event_index_anchor.v1', self.storage_instance_id,
                               self.index_seed_hex], 'anchor'))

    def durable_watermarks_sha256(self):
        return sha256(binding([[s['generation'], s['name'], s['watermark']] for s in self.segments
                               if not s['retired']], 'watermarks'))

    def read_token(self):
        """Nine durable generic token fields (consumer DurableGenericToken shape)."""
        current_raw = (self.root / 'CURRENT').read_bytes()
        current = decode_canonical(current_raw)
        manifest_raw = (self.root / current['manifest_ref']).read_bytes()
        live = [s for s in self.segments if not s['retired']]
        inventory = [[s['generation'], s['name'], s['watermark'], sha256(
            self._segment_path(s['generation']).read_bytes()[:s['watermark']])] for s in live]
        anchor = self.index_anchor_sha256()
        token = dict(
            storage_instance_id=self.storage_instance_id,
            checkpoint_key='TEST_ONLY:event_index_checkpoint:' + k_component(self.storage_instance_id),
            checkpoint_ref='TEST_ONLY:checkpoint-ref:%d' % self.manifest_generation,
            generation_id='eig_' + anchor, generation_anchor_sha256=anchor,
            frontier_revision=self.index_frontier_revision,
            frontier_sha256=self.index_frontier_sha256 or sha256(binding(['pm.goal_test.empty_frontier.v1', anchor])),
            index_dataset_name='TEST_ONLY:event_record_index@eig_' + anchor,
            source_selection=dict(
                storage_instance_id=self.storage_instance_id, current_ref='storage/seglog/CURRENT',
                current_bytes_sha256=sha256(current_raw),
                selected_segment_generation=live[-1]['generation'] if live else 0,
                manifest_ref='storage/seglog/manifest.v1.msgpack', manifest_bytes_sha256=sha256(manifest_raw),
                manifest_generation=self.manifest_generation, recovery_epoch=self.recovery_epoch,
                manifest_survivor_prefix_sha256=sha256(binding(
                    [[g['segment_generation'], g['commit']['commit_group_id'], g['digest']] for g in self.groups])),
                retained_inventory_sha256=sha256(binding(inventory)),
                durable_watermarks_sha256=self.durable_watermarks_sha256(),
                excluded_ranges_sha256=sha256(binding(
                    [[e['segment_generation'], e['start'], e['end'], e['reason']] for e in self.excluded])),
                retired_inputs_sha256=sha256(binding(
                    [[g['segment_generation'], g['first_sequence'], g['last_sequence'], g['proof_sha256']]
                     for g in self.gaps]))))
        return token

    def snapshot(self):
        """Read snapshot: committed cells, durable token, transient snapshot id."""
        return dict(qualification=QUALIFICATION, snapshot_id='TEST_ONLY:snapshot:' + secrets.token_hex(8),
                    cell_generation=self.cell_generation, cells=copy.deepcopy(self.cells), token=self.read_token())

    def acquire_source(self):
        """Whole generic source bytes, as Storage holds them, for the source adapter."""
        current_raw = (self.root / 'CURRENT').read_bytes()
        current = decode_canonical(current_raw)
        manifest_raw = (self.root / current['manifest_ref']).read_bytes()
        segments = []
        for s in self.segments:
            if s['retired']:
                continue
            segments.append(dict(generation=s['generation'], name=s['name'], watermark=s['watermark'],
                                 raw=self._segment_path(s['generation']).read_bytes()[:s['watermark']]))
        return dict(qualification=QUALIFICATION, storage_instance_id=self.storage_instance_id,
                    current_raw=current_raw, manifest_raw=manifest_raw, segments=segments,
                    gaps=copy.deepcopy(self.gaps), custody=copy.deepcopy(self.custody), token=self.read_token(),
                    snapshot_id='TEST_ONLY:snapshot:' + secrets.token_hex(8))

    def observe(self):
        """Content-free observation for the method-call recorder."""
        return dict(manifest_generation=self.manifest_generation, last_sequence=self.last_sequence,
                    events=len(self.events), custody=len(self.custody), cell_generation=self.cell_generation,
                    reservations={k: v['state'] for k, v in self.reservations.items()},
                    watermarks=[[s['generation'], s['watermark']] for s in self.segments])


def producer25(event):
    return {k: v for k, v in event.items() if k not in STORAGE_FIELDS}


class RetentionOwner:
    """TEST_ONLY retention owner that issues gap dispositions for one Storage."""

    def __init__(self, storage, owner_id=None):
        self.storage = storage
        self.owner_id = owner_id or 'TEST_ONLY:retention-owner:' + storage.storage_instance_id

    def sign(self, disposition):
        body = {k: v for k, v in disposition.items() if k != 'proof_sha256'}
        return sha256(canonical(['pm.goal_test.retention_gap.v1', body]))

    @staticmethod
    def verify(disposition):
        body = {k: v for k, v in disposition.items() if k != 'proof_sha256'}
        return disposition.get('proof_sha256') == sha256(canonical(['pm.goal_test.retention_gap.v1', body]))
