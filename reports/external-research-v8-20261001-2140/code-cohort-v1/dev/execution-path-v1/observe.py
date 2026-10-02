"""Read only an enrolled owned cgroup; no PID signals or private native files."""
from pathlib import Path
import json
import time

CGROUP = Path('/sys/fs/cgroup')

def observe(enrollment_path, expected_unit, original_deadline_ns):
    p = Path(enrollment_path)
    if any(q.is_symlink() for q in (p, *p.parents)):
        raise ValueError('symlink ancestry forbidden')
    enrollment = json.loads(p.read_text())
    if enrollment.get('schema') != 'er8.execution.enrollment.v1' or type(original_deadline_ns) is not int or type(enrollment.get('original_deadline_monotonic_ns')) is not int or enrollment['original_deadline_monotonic_ns'] != original_deadline_ns:
        raise ValueError('immutable original enrollment deadline mismatch')
    if type(enrollment.get('enrolled_monotonic_ns')) is not int or enrollment['enrolled_monotonic_ns'] <= 0:
        raise ValueError('positive authentic enrollment clock required')
    group = enrollment['cgroup']
    parts = Path(group).parts
    if enrollment['owned_unit'] != expected_unit or not group.startswith('/') or '..' in parts or parts[-1] != expected_unit:
        raise ValueError('trusted positive service enrollment required')
    target = CGROUP / group.lstrip('/')
    if target.is_symlink():
        raise ValueError('owned cgroup alias forbidden')
    # The observation time is AFTER the full absence/population read. A stalled
    # read cannot get an earlier timestamp or turn late absence into on-time proof.
    try:
        values = dict(line.split() for line in (target / 'cgroup.events').read_text().splitlines())
        empty = values.get('populated') == '0'
        proof = 'owned-cgroup-populated-zero' if empty else 'owned-cgroup-populated'
    except FileNotFoundError:
        empty = not target.exists()
        proof = 'positively-enrolled-owned-cgroup-removed' if empty else 'missing-events-unknown'
    observed_ns = time.monotonic_ns()
    on_time = empty and observed_ns <= original_deadline_ns
    return {'schema':'er8.execution.quiescence.v1', 'owned_unit':expected_unit, 'owned_cgroup':group,
            'enrollment':enrollment, 'absence_proof':proof, 'owned_native_quiescent':empty,
            'quiescence_observed_monotonic_ns':observed_ns, 'original_deadline_monotonic_ns':original_deadline_ns,
            'inclusive_native_lifetime_established':on_time,
            'occupancy_disposition':'releasable-native-only' if on_time else 'held-until-positive-quiescence',
            'native_goal_or_quality_qualification':'UNESTABLISHED; independent native receipt review mandatory'}
