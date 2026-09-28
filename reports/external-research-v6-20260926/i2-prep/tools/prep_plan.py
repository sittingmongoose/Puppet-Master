"""Fixed I2 preparation constants and conservative premium-pair admission.

Host evidence metadata is not authorization. This module has no launch operation.
"""
import hashlib
from pathlib import Path

CANDIDATE_SECONDS, CANDIDATE_RESPONSES = 1800, 160
EVALUATOR_SECONDS, EVALUATOR_RESPONSES = 2700, 160
PHASE_SECONDS, HOST_SECONDS = 14400, 300
MAX_CURRENT_BYTES = 4 * 1024 * 1024
CONTROL_FILE_BYTES = 1024 * 1024
MAX_AUTHORED_FILES, MAX_AUTHORED_BYTES = 128, 8 * 1024 * 1024
PAIRS = {
    "EVAL-001": ("I2-M-control", "I2-M-maintained"),
    "EVAL-002": ("I2-Z-control", "I2-Z-maintained"),
}


def check_output_inventory(output, carrier):
    """Read-only retained-file capacity check, not cumulative usage or semantics.

    Freeze the entire raw out/ separately, even on failure; never trim to fit.
    Native traces account for vanished/failed/replaced writes separately.
    """
    if carrier not in {'control', 'maintained'}:
        raise ValueError('unknown I2 carrier')
    output = Path(output)
    errors, inventory = [], {}
    if output.is_symlink() or not output.is_dir():
        return {'complete': False, 'errors': ['missing/nonregular out directory'], 'files': {}, 'bytes': 0}
    for path in sorted(output.rglob('*')):
        relative = path.relative_to(output).as_posix()
        if path.is_symlink():
            errors.append(f'nonregular output: {relative}')
            continue
        if path.is_dir():
            continue
        if not path.is_file():
            errors.append(f'nonregular output: {relative}')
            continue
        size = path.stat().st_size
        inventory[relative] = size
        limit = CONTROL_FILE_BYTES if carrier == 'control' else 32768
        if size > limit:
            errors.append(f'file capacity exceeded: {relative}')
        if carrier == 'maintained' and (len(path.relative_to(output).parts) != 2 or path.parent.name not in {'submissions', 'requests'}):
            errors.append(f'undeclared maintained output: {relative}')
    total = sum(inventory.values())
    if len(inventory) > MAX_AUTHORED_FILES:
        errors.append('retained file-count capacity exceeded')
    if total > MAX_AUTHORED_BYTES:
        errors.append('retained byte capacity exceeded')
    if carrier == 'control':
        for name in ['observations.md', 'draft.md']:
            try:
                path = output / name
                if path.is_symlink() or not path.read_text(encoding='utf-8').strip():
                    errors.append(f'missing/empty/nonregular control artifact: {name}')
            except (OSError, UnicodeError):
                errors.append(f'missing/invalid control artifact: {name}')
    return {'complete': not errors, 'errors': errors, 'files': inventory, 'bytes': total,
            'scope': 'retained model-authored inventory only; not semantic or cumulative-write proof'}


def check_pair_eligibility(metadata, assignment_id=None):
    """Both original arms must have completed, faithful, non-diagnostic delivery.

    The host supplies native/structural results, bound to exact final report bytes.
    This does NOT certify substantive quality or detect an author's prose that
    merely looks diagnostic. Such nonempty authored prose remains evaluator work.
    """
    if not isinstance(metadata, dict) or set(metadata) != {"assignment_id", "arms"}:
        return False
    assignment = metadata["assignment_id"]
    if not isinstance(assignment, str):
        return False
    if assignment_id is not None and assignment != assignment_id:
        return False
    if assignment not in PAIRS or not isinstance(metadata["arms"], list) or len(metadata["arms"]) != 2:
        return False
    expected = set(PAIRS[assignment])
    seen = set()
    required = {"slot", "native_outcome", "structural_complete", "lineage_pass",
                "report_kind", "current_path", "current_sha256"}
    for arm in metadata["arms"]:
        if not isinstance(arm, dict) or set(arm) != required:
            return False
        if not isinstance(arm["slot"], str) or arm["slot"] not in expected or arm["slot"] in seen:
            return False
        seen.add(arm["slot"])
        if arm["native_outcome"] != "goal_complete" or arm["structural_complete"] is not True or arm["lineage_pass"] is not True:
            return False
        control = arm['slot'].endswith('-control')
        if arm["report_kind"] != ('authored_current' if control else 'host_current'):
            return False
        try:
            path = Path(arm["current_path"])
            size_limit = CONTROL_FILE_BYTES if control else MAX_CURRENT_BYTES
            if path.is_symlink() or not path.is_file() or path.stat().st_size > size_limit:
                return False
            raw = path.read_bytes()
            if hashlib.sha256(raw).hexdigest() != arm["current_sha256"] or not raw.decode("utf-8").strip():
                return False
        except (OSError, ValueError, TypeError, UnicodeError):
            return False
    return seen == expected
