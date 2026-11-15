"""C12-GO declared justifications for rows with no single-row or duplicate-set kill (lane 18).

Lane GC's standard (scripts/pm_goal_gc_declarations.py on plans/ea-pnc-c12-gc-20261114): a row that
cannot be the sole refusal of an input whose cut makes the complete checker accept is closed only by a
written, source-bound justification that the proof run confirms. Kinds:

  presence  with the row cut, the next checker statement indexes the member the row guards and raises
            (KeyError / TypeError / IndexError / AttributeError);
  typed     with the row cut, the value reaches a shared codec or the read harness's store postcondition,
            which refuses by raising (ValueError, n.Refusal, AssertionError).

Entries live in scripts/pm_goal_go_justifications.json, drafted from the proof run's recorded cut
frames (drafts/PNC019/c12-go/tools/justify.py) and reviewed: each names the row, its guard site, the
witness (label and input SHA-256), the frame where the cut raises and its source text, and the kill class
the run must show (CUT_EXCEPTION). They carry no kill credit; the matrix lists them as CLOSED_BY_PROOF
apart from kills.
"""
import json
from pathlib import Path

_PATH = Path(__file__).resolve().parent / 'pm_goal_go_justifications.json'
JUSTIFIED = json.loads(_PATH.read_text()) if _PATH.exists() else {}
