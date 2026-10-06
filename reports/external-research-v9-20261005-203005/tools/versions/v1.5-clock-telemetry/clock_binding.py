"""Zero-inference constructor for original controller scalar receipts.

Caller supplies actual original variables. This module never computes action
from cleanup, reads TASK, writes artifacts, starts a Goal, or allocates time.
"""
import importlib.util
import hashlib
from pathlib import Path

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('clock_binding_reader',HERE/'clock_telemetry.py')
clock=importlib.util.module_from_spec(spec);spec.loader.exec_module(clock)

def binding(*, stage_id, original_birth_monotonic_ns,
            original_stage_allocation_seconds,
            original_candidate_action_deadline_monotonic_ns,
            original_total_cleanup_stop_monotonic_ns,
            receipt_path, controller_path=None, controller_sha256=None,
            action_field=None):
    scalars={'stage_id':stage_id,
        'original_birth_monotonic_ns':original_birth_monotonic_ns,
        'original_stage_allocation_seconds':original_stage_allocation_seconds,
        'original_candidate_action_deadline_monotonic_ns':original_candidate_action_deadline_monotonic_ns,
        'original_total_cleanup_stop_monotonic_ns':original_total_cleanup_stop_monotonic_ns}
    receipt={'schema':'er9.original-controller-clock-receipt.v1',**scalars}
    raw=clock.encoded(receipt)+b'\n'
    proof=None
    if original_candidate_action_deadline_monotonic_ns is not None and all(
            value is not None for value in (controller_path,controller_sha256,action_field)):
        proof={'kind':'explicit_original_native_action_deadline',
            'controller_path':str(Path(controller_path).absolute()),
            'controller_sha256':controller_sha256,'action_field':action_field,
            'receipt':{'path':str(Path(receipt_path).absolute()),
                'sha256':hashlib.sha256(raw).hexdigest(),
                'stage_id_selector':'/stage_id',
                'birth_selector':'/original_birth_monotonic_ns',
                'allocation_selector':'/original_stage_allocation_seconds',
                'action_deadline_selector':'/original_candidate_action_deadline_monotonic_ns',
                'total_cleanup_selector':'/original_total_cleanup_stop_monotonic_ns'}}
    profile={'schema':clock.PROFILE_SCHEMA,**scalars,'action_deadline_proof':proof}
    clock.validate(profile)
    return {'profile':profile,'profile_bytes':clock.encoded(profile)+b'\n',
            'receipt':receipt,'receipt_bytes':raw}
