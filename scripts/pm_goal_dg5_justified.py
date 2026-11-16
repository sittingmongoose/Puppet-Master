"""C12-DG5 owner clauses and recorded justifications for the coverage matrix.

Owner clauses: each family's registered DG grade row (reports/event-authority-20261104/DG-self-grade.json)
cites the owner units for every concern; a row's owner entry lists the cells whose concern its code names,
plus the predicate's own source line (the matrix adds it). The canonical Plans subject of each family's
oracle cell is CANONICAL below.

Justifications (CLOSED_BY_PROOF only while every dependency is closed in the same family):

* presence  -- a declared negative refuses exactly at the row; with only that row cut the complete
               checker raises at the next statement that reads the member the row guards (recorded frame
               and source line), and the uncached restoration repeats the refusal. The checker can never
               accept such an input with the row removed; it fails closed by raising (GC's presence class).

Nothing here earns kill credit; the matrix reports these rows as CLOSED_BY_PROOF, never as CLOSED.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GRADES = ROOT / 'reports/event-authority-20261104/DG-self-grade.json'
CANONICAL = {
    'goal.updated': 'Plans/Automated_Testing_System.md#ATS-210',
    'goal.cancelled': 'Plans/Automated_Testing_System.md#ATS-210',
    'goal_run.started': 'Plans/Automated_Testing_System.md#ATS-210',
    'goal_run.cancelled': 'Plans/Automated_Testing_System.md#ATS-210',
    'goal_run.certified': 'Plans/Automated_Testing_System.md#ATS-210',
}
CONCERNS = (
    ('/schema', 'closed_payload_schema'), ('/number', 'positive_negative_oracles'),
    ('/date-time', 'positive_negative_oracles'), ('/sir/', 'replay_idempotency'), ('/producer/', 'producer'),
    ('/publish', 'producer'), ('/source/', 'producer'), ('/body/', 'transitions'), ('/command/', 'transitions'),
    ('/hitl/', 'transitions'), ('/inspect', 'consumers_checkpoints'), ('/reader/', 'consumers_checkpoints'),
    ('/read', 'retention'), ('/retained', 'retention'), ('/custody', 'redaction_custody'),
    ('/receipt', 'redaction_custody'), ('/scope', 'scope_identity'), ('/identity', 'scope_identity'),
    ('/project', 'scope_identity'), ('/projection', 'consumers_checkpoints'), ('/checkpoint', 'consumers_checkpoints'),
    ('/migration', 'compatibility_withdrawal'), ('/withdraw', 'compatibility_withdrawal'),
)
PRESENCE_EXCEPTIONS = ('KeyError', 'TypeError', 'AttributeError', 'IndexError', 'FileNotFoundError', 'ValueError')


def owner_clauses(family):
    grades = json.loads(GRADES.read_text())
    row = next((r for r in grades['rows'] if r['event_type'] == family), None)
    cells = {}
    for name, cell in (row or {}).get('cells', {}).items():
        cells[name] = [dict(path=e['path'], unit=e.get('unit'), line=e.get('line_start'), quote=e.get('quote', '')[:200])
                       for e in cell.get('evidence', [])[:4]]
    return dict(family=family, canonical=CANONICAL.get(family), cells=cells,
                grade_file=str(GRADES.relative_to(ROOT)))


def owner_for(name, owners):
    concerns = sorted({cell for marker, cell in CONCERNS if marker in name}) or ['positive_negative_oracles']
    return dict(canonical=owners['canonical'], concerns=concerns,
                citations=[c for concern in concerns for c in owners['cells'].get(concern, [])][:6])


def justification(family, name, tries):
    for record in tries:
        site = record.get('cut_exception_site') or {}
        if record.get('kill') != 'CUT_EXCEPTION' or site.get('exception') not in ('RuntimeError',):
            continue
        detail = site.get('detail', '')
        raised = detail.split(':', 1)[0].split(' @ ', 1)[0]
        if raised not in PRESENCE_EXCEPTIONS:
            continue
        if record.get('restoration_errors') != record.get('errors'):
            continue
        return dict(kind='presence', witness=record['label'], input_sha256=record['input_sha256'],
                    raised=detail[:200], restoration=record.get('restoration_errors'), depends_on=[])
    return None
