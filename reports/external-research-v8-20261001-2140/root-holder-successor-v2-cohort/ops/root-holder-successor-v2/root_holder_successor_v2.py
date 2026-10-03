#!/usr/bin/env python3
"""Root-authorized bounded standby; no service or native-work activation."""
import argparse
import fcntl
import hashlib
import json
import math
import os
from pathlib import Path
import stat
import time

LAB = Path('LAB_ROOT')
PARENT = LAB / 'ops/recovery-v1'
SOURCE = LAB / 'ops/root-holder-successor-v2/root_holder_successor_v2.py'
REQUEST = PARENT / 'ROOT_HOLDER_SUCCESSOR_REQUEST_V2.json'
LOCK = PARENT / 'supervisor.lock'
PREDECESSOR_SOURCE = PARENT / 'durable_holder_v1.py'
PREDECESSOR_CLAIM = PARENT / 'SUPERVISOR_DURABLE.json'
CLAIM = PARENT / 'SUPERVISOR_DURABLE_SUCCESSOR_V2.json'
DEADLINE = 1791013030.8303788
PREDECESSOR_PID = 1969270
PREDECESSOR_UNIT = 'er8-v8-root-durable-20261002-2348.service'
SUCCESSOR_UNIT = 'er8-v8-root-durable-successor-v2.service'
PREDECESSOR_SOURCE_SHA = '48907c8afa5b6a8699b61d01528466e4c5b838ac2bdb955f4420738dc2a12788'
PREDECESSOR_CLAIM_SHA = 'e0b37dcddefe3d6fcad80a913701cb69729b467bd0ffbf34b535f54dab3211b9'
KEYS = {'schema', 'root_authority', 'deadline_epoch', 'native_global_cutoff_monotonic_ns',
        'source_path', 'source_sha256', 'predecessor_source_path', 'predecessor_source_sha256',
        'predecessor_claim_path', 'predecessor_claim_sha256', 'predecessor_pid', 'predecessor_unit',
        'lock_path', 'lock_device', 'lock_inode', 'successor_claim_path', 'successor_unit'}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def valid_sha(value):
    return isinstance(value, str) and len(value) == 64 and all(c in '0123456789abcdef' for c in value)


def directory(path):
    """Open every absolute path component without traversing a symlink."""
    require(path.is_absolute(), 'absolute directory required')
    fd = os.open('/', os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        for part in path.parts[1:]:
            require(part not in ('.', '..'), 'ambiguous path')
            next_fd = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            os.close(fd)
            fd = next_fd
        return fd
    except BaseException:
        os.close(fd)
        raise


def read_file(parent_fd, name):
    fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=parent_fd)
    try:
        before = os.fstat(fd)
        require(stat.S_ISREG(before.st_mode) and before.st_size <= 65536, 'invalid regular input')
        chunks = []
        while True:
            chunk = os.read(fd, 65537)
            if not chunk:
                break
            chunks.append(chunk)
            require(sum(map(len, chunks)) <= 65536, 'oversized input')
        after = os.fstat(fd)
        current = os.stat(name, dir_fd=parent_fd, follow_symlinks=False)
        require((before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns, before.st_ctime_ns) ==
                (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns, after.st_ctime_ns), 'input changed')
        require((current.st_dev, current.st_ino) == (after.st_dev, after.st_ino) and
                stat.S_ISREG(current.st_mode), 'input replaced')
        return b''.join(chunks)
    finally:
        os.close(fd)


def json_object(data):
    def pairs(items):
        obj = {}
        for key, value in items:
            require(key not in obj, 'duplicate JSON key')
            obj[key] = value
        return obj
    obj = json.loads(data, object_pairs_hook=pairs,
                     parse_constant=lambda value: (_ for _ in ()).throw(ValueError('nonfinite JSON')))
    require(isinstance(obj, dict), 'JSON object required')
    return obj


def alive(request):
    return time.time() < request['deadline_epoch'] and time.monotonic_ns() < request['native_global_cutoff_monotonic_ns']


def lock_identity(parent_fd, lock_fd, request):
    current = os.stat(LOCK.name, dir_fd=parent_fd, follow_symlinks=False)
    opened = os.fstat(lock_fd)
    wanted = (request['lock_device'], request['lock_inode'])
    require(stat.S_ISREG(current.st_mode) and stat.S_ISREG(opened.st_mode) and
            (current.st_dev, current.st_ino) == wanted == (opened.st_dev, opened.st_ino), 'lock identity changed')
    current_parent_fd = directory(PARENT)
    try:
        parent_current = os.fstat(current_parent_fd)
        parent_opened = os.fstat(parent_fd)
        require((parent_current.st_dev, parent_current.st_ino) ==
                (parent_opened.st_dev, parent_opened.st_ino), 'parent replaced')
    finally:
        os.close(current_parent_fd)


def validate(parent_fd, request_sha):
    require(valid_sha(request_sha), 'invalid request SHA')
    raw = read_file(parent_fd, REQUEST.name)
    require(digest(raw) == request_sha, 'request SHA mismatch')
    request = json_object(raw)
    require(set(request) == KEYS, 'request keys mismatch')
    expected = {'schema': 'pm.er8.root-holder-successor-request.v2', 'root_authority': True,
                'deadline_epoch': DEADLINE, 'source_path': str(SOURCE),
                'predecessor_source_path': str(PREDECESSOR_SOURCE),
                'predecessor_source_sha256': PREDECESSOR_SOURCE_SHA,
                'predecessor_claim_path': str(PREDECESSOR_CLAIM),
                'predecessor_claim_sha256': PREDECESSOR_CLAIM_SHA,
                'predecessor_pid': PREDECESSOR_PID, 'predecessor_unit': PREDECESSOR_UNIT,
                'lock_path': str(LOCK), 'successor_claim_path': str(CLAIM), 'successor_unit': SUCCESSOR_UNIT}
    require(request['root_authority'] is True, 'root authority required')
    require(type(request['deadline_epoch']) in (int, float) and math.isfinite(request['deadline_epoch']), 'invalid epoch')
    for key, value in expected.items():
        require(request[key] == value, 'request mismatch: ' + key)
    for key in ('native_global_cutoff_monotonic_ns', 'lock_device', 'lock_inode', 'predecessor_pid'):
        require(type(request[key]) is int and request[key] > 0, 'invalid integer: ' + key)
    require(request['native_global_cutoff_monotonic_ns'] <= 2**63 - 1, 'invalid monotonic cutoff range')
    require(valid_sha(request['source_sha256']), 'invalid source SHA')
    require(Path(__file__).absolute() == SOURCE, 'unexpected executable path')
    source_fd = directory(SOURCE.parent)
    try:
        require(digest(read_file(source_fd, SOURCE.name)) == request['source_sha256'], 'source SHA mismatch')
    finally:
        os.close(source_fd)
    require(digest(read_file(parent_fd, PREDECESSOR_SOURCE.name)) == PREDECESSOR_SOURCE_SHA, 'predecessor source SHA mismatch')
    predecessor_raw = read_file(parent_fd, PREDECESSOR_CLAIM.name)
    require(digest(predecessor_raw) == PREDECESSOR_CLAIM_SHA, 'predecessor claim SHA mismatch')
    predecessor = json_object(predecessor_raw)
    require(predecessor == {'schema': 'pm.er8.durable-supervisor.v1', 'root_authority': True,
            'pid': PREDECESSOR_PID, 'unit': PREDECESSOR_UNIT, 'deadline_epoch': DEADLINE,
            'acquired_epoch': 1790984828.5959241, 'owner': 'codex-er8-recovery',
            'original_costs_and_births_preserved': True}, 'predecessor metadata drift')
    require(alive(request), 'cutoff reached')
    return request


def run(request_path, request_sha):
    require(str(request_path) == str(REQUEST), 'unexpected request path')
    parent_fd = directory(PARENT)
    lock_fd = None
    try:
        request = validate(parent_fd, request_sha)
        lock_fd = os.open(LOCK.name, os.O_RDWR | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=parent_fd)
        while True:
            require(alive(request), 'cutoff reached before acquisition')
            lock_identity(parent_fd, lock_fd, request)
            try:
                fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                break
            except BlockingIOError:
                time.sleep(min(0.2, max(0, request['deadline_epoch'] - time.time()),
                               max(0, (request['native_global_cutoff_monotonic_ns'] - time.monotonic_ns()) / 1e9)))
        # Recheck all pinned inputs after the wait, before any claim write.
        require(validate(parent_fd, request_sha) == request, 'request changed')
        lock_identity(parent_fd, lock_fd, request)
        require(alive(request), 'cutoff reached before claim')
        claim = {'schema': 'pm.er8.durable-supervisor-successor.v2', 'root_authority': True,
                 'pid': os.getpid(), 'unit': SUCCESSOR_UNIT, 'deadline_epoch': request['deadline_epoch'],
                 'native_global_cutoff_monotonic_ns': request['native_global_cutoff_monotonic_ns'],
                 'acquired_epoch': time.time(), 'acquired_monotonic_ns': time.monotonic_ns(),
                 'ownership': 'exclusive_flock_only', 'predecessor_exit_proven': False,
                 'native_case_activation': False, 'original_costs_and_births_preserved': True,
                 'source_path': str(SOURCE), 'source_sha256': request['source_sha256'],
                 'request_path': str(REQUEST), 'request_sha256': request_sha,
                 'predecessor_claim_path': str(PREDECESSOR_CLAIM), 'predecessor_claim_sha256': PREDECESSOR_CLAIM_SHA,
                 'predecessor_source_path': str(PREDECESSOR_SOURCE), 'predecessor_source_sha256': PREDECESSOR_SOURCE_SHA,
                 'predecessor_pid': PREDECESSOR_PID, 'predecessor_unit': PREDECESSOR_UNIT,
                 'lock_path': str(LOCK), 'lock_device': request['lock_device'], 'lock_inode': request['lock_inode']}
        require(claim['acquired_epoch'] < request['deadline_epoch'] and
                claim['acquired_monotonic_ns'] < request['native_global_cutoff_monotonic_ns'], 'cutoff reached at claim')
        fd = os.open(CLAIM.name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=parent_fd)
        try:
            require(alive(request), 'cutoff reached before claim write')
            data = (json.dumps(claim, sort_keys=True, indent=2) + '\n').encode()
            while data:
                written = os.write(fd, data)
                require(written > 0, 'claim write failed')
                data = data[written:]
            os.fsync(fd)
        finally:
            os.close(fd)
        os.fsync(parent_fd)
        while alive(request):
            lock_identity(parent_fd, lock_fd, request)
            time.sleep(min(0.2, max(0, request['deadline_epoch'] - time.time()),
                           max(0, (request['native_global_cutoff_monotonic_ns'] - time.monotonic_ns()) / 1e9)))
        return claim
    finally:
        if lock_fd is not None:
            os.close(lock_fd)
        os.close(parent_fd)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root-request', required=True)
    parser.add_argument('--request-sha256', required=True)
    args = parser.parse_args()
    try:
        run(args.root_request, args.request_sha256)
    except (ValueError, OSError) as error:
        parser.exit(2, 'HOLD: ' + str(error) + '\n')


if __name__ == '__main__':
    main()
