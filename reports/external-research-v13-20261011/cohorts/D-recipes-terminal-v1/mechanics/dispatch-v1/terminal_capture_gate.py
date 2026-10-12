"""Read-only future D direct completion custody check; no native calls."""
import hashlib
import json
from pathlib import Path


def check_direct_terminal(aux_root, terminal_path, original_failure=False):
    aux_root, terminal_path = Path(aux_root), Path(terminal_path)
    result = {'qualified': False, 'provenance_independently_proved': False,
              'failure_file_present': bool(original_failure) or
              (aux_root / 'native-terminal-capture-failed.json').exists()}
    try:
        checked = json.loads((aux_root / 'native-terminal-capture-checked.json').read_text())
        digest = hashlib.sha256(terminal_path.read_bytes()).hexdigest()
        result.update(terminal_capture_checked=checked.get('terminal_capture_checked') is True,
                      response_source=checked.get('response_source'),
                      terminal_sha256=digest,
                      terminal_sha256_matches=checked.get('terminal_sha256') == digest)
        result['qualified'] = (result['terminal_capture_checked'] and
                               result['response_source'] == 'direct_update_goal_return' and
                               result['terminal_sha256_matches'] and
                               not result['failure_file_present'])
    except (OSError, ValueError, TypeError, AttributeError) as error:
        result['capture_error'] = str(error)
    return result
