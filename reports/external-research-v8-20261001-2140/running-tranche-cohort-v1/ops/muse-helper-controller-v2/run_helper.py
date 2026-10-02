#!/usr/bin/env python3
"""One authorized native helper; bounded lifecycle and stdout-only artifact capture."""
import hashlib
import json
import os
from pathlib import Path
import signal
import subprocess
import time

owned = Path(__file__).resolve().parent
binary = Path('USER_HOME/.local/bin/muse-bin-1.4.2-R4684.1')
command = [str(binary), 'exec', '--provider', 'meta', '--model',
           'muse-spark-1.3-contributor', '--reasoning-effort', 'max',
           '--workspace', str(owned / 'workspace'), '--worktree', 'off',
           '--disable-shell', '--disable-write', '--disable-web-tools',
           '--no-foreign-personal-context', '--no-session-log',
           '--approval-mode', 'on-request', '--json', '--max-model-steps', '3',
           '--prompt-file', str(owned / 'prompt.txt')]
start_epoch = time.time()
start_mono = time.monotonic()
birth = dict(schema='pm.er8.muse-helper-birth.v1', job='muse-mechanical-controller-helper-v2',
             classification='helper_not_candidate', model_requested='muse-spark-1.3-contributor',
             reasoning_requested='max', original_max_seconds=900, command=command,
             started_epoch=start_epoch, binary_sha256=hashlib.sha256(binary.read_bytes()).hexdigest())
(owned / 'BIRTH.json').write_text(json.dumps(birth, indent=2) + '\n')
with (owned / 'native-events.jsonl').open('wb') as out, (owned / 'native-stderr.txt').open('wb') as err:
    child = subprocess.Popen(command, cwd=owned / 'workspace', stdin=subprocess.DEVNULL,
                             stdout=out, stderr=err, start_new_session=True)
    birth['pid'] = child.pid
    (owned / 'BIRTH.json').write_text(json.dumps(birth, indent=2) + '\n')
    timed_out = False
    try:
        child.wait(timeout=885)
    except subprocess.TimeoutExpired:
        timed_out = True
        os.killpg(child.pid, signal.SIGTERM)
        try:
            child.wait(timeout=5)
        except subprocess.TimeoutExpired:
            os.killpg(child.pid, signal.SIGKILL)
            child.wait(timeout=5)
    try:
        os.killpg(child.pid, 0)
        group_absent = False
    except ProcessLookupError:
        group_absent = True
    if not group_absent:
        os.killpg(child.pid, signal.SIGTERM)
        time.sleep(1)
        try:
            os.killpg(child.pid, 0)
            os.killpg(child.pid, signal.SIGKILL)
            time.sleep(1)
        except ProcessLookupError:
            pass
        try:
            os.killpg(child.pid, 0)
            group_absent = False
        except ProcessLookupError:
            group_absent = True
receipt = dict(schema='pm.er8.muse-helper-process-quiet.v1', job=birth['job'],
               classification=birth['classification'], requested_model=birth['model_requested'],
               requested_reasoning=birth['reasoning_requested'], exit_code=child.returncode,
               timed_out=timed_out, elapsed_seconds=time.monotonic()-start_mono,
               started_epoch=start_epoch, ended_epoch=time.time(), parent_reaped=True,
               own_process_group_absent=group_absent, generated_tokens=None, money=None)
for name in ['native-events.jsonl', 'native-stderr.txt', 'prompt.txt', 'INPUT_MANIFEST.json']:
    data = (owned / name).read_bytes()
    receipt[name] = dict(bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
(owned / 'QUIET.json').write_text(json.dumps(receipt, indent=2)+'\n')
print(json.dumps(receipt))
