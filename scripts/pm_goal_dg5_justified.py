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


def _bind(path, line):
    import hashlib
    full = ROOT / path
    try:
        raw = full.read_bytes()
        text = raw.decode().splitlines()[int(line) - 1].strip()
    except (OSError, IndexError, ValueError):
        return dict(path=path, line=line, source=None, file_sha256=None)
    return dict(path=path, line=int(line), source=text[:240], file_sha256=hashlib.sha256(raw).hexdigest())


def _frames(detail):
    import re
    head = detail.split(' @ ', 1)[1] if ' @ ' in detail else ''
    return [dict(file='scripts/' + f, line=int(l), function=fn)
            for f, l, fn in re.findall(r'(pm_goal\w*\.py):(\d+)\((\w+)\)', head)]


PROOF_MODULES = ('u', 's', 'ca', 'r', 'cf', 'shared')   # pm_goal_dg5_proofs_<x>.py or pm_goal_dg5_justified_<x>.py (SPLIT.md)


WITHDRAWN_FILE = ROOT / 'scripts/pm_goal_dg5_withdrawn_proofs.json'


def withdrawn_proofs():
    """Proof keys a ruling withdrew or ruled UNSOUND, read from the data file.

    One entry per key: the row, the module the ruling names, the ruling source and its
    reason. AMEND1-MATRIX review F7; FINAL-LIST-113.r6 and later rulings."""
    try:
        data = json.loads(WITHDRAWN_FILE.read_text())
    except (OSError, ValueError) as error:
        raise SystemExit(f'{WITHDRAWN_FILE.name}: {error}')
    return {entry['row']: entry for entry in data.get('keys', [])}


def _refuse_withdrawn(label, row, withdrawn):
    """Fail closed: a withdrawn/UNSOUND key never loads, even if a definition returns."""
    entry = withdrawn.get(row)
    if entry is None:
        return
    reason = entry.get('why') or entry.get('route') or ''
    raise SystemExit(f'{label}: written-proof key {row} is withdrawn/UNSOUND by {entry["ruling"]}'
                     + (f' ({reason})' if reason else '')
                     + '; remove the definition (scripts/pm_goal_dg5_withdrawn_proofs.json)')


class ProofDuplicateError(ValueError):
    """A written-proof key is defined more than once (TOOL-ISSUES T316): fail closed, nothing judged."""


def _proof_key_occurrences(module, label):
    """Every PROOFS key occurrence in the module's source, by AST.

    A repeated dict-literal key is silently dropped by Python (the second wins), so the loaded
    dict cannot show it: the source is parsed. Supports exactly the forms the proof modules use —
    `PROOFS = {literal}` and `PROOFS.update({literal})` — with keys folded from string constants
    and module-level string constants bound once (SITE + '517'). Any other form (rebind,
    comprehension, subscript write, del, other mutator, non-constant or non-string key, ** spread)
    is unanalyzable and fails closed. Returns [(key, line)]."""
    import ast
    source = getattr(module, '__dg5_source__', None)
    if source is None:
        path = getattr(module, '__file__', None)
        if path is None:
            raise ProofDuplicateError(f'{label}: loaded without readable source (set __dg5_source__)')
        source = Path(path).read_text()
    tree = ast.parse(source, filename=label)
    namespace = vars(module)

    # Module-level literal dicts bound once: the sources a PROOFS comprehension may iterate
    # (pm_goal_dg5_proofs_r.py builds PROOFS over RETAINED.items()).
    stores = {}
    for n in ast.walk(tree):
        if isinstance(n, ast.Name) and isinstance(n.ctx, (ast.Store, ast.Del)):
            stores[n.id] = stores.get(n.id, 0) + 1
    literal_dicts = {}
    for n in tree.body:
        if isinstance(n, ast.Assign) and len(n.targets) == 1 and isinstance(n.targets[0], ast.Name) \
                and isinstance(n.value, ast.Dict) and n.targets[0].id != 'PROOFS':
            literal_dicts[n.targets[0].id] = n.value

    def fold(key, extra=None):
        if isinstance(key, ast.Constant) and isinstance(key.value, str):
            return key.value
        if isinstance(key, ast.Name):
            value = extra[key.id] if extra and key.id in extra else namespace.get(key.id)
            if isinstance(value, str):
                return value
            raise ProofDuplicateError(f'{label}:{key.lineno}: PROOFS key {key.id} is not a string constant')
        if isinstance(key, ast.BinOp) and isinstance(key.op, ast.Add):
            return fold(key.left, extra) + fold(key.right, extra)
        raise ProofDuplicateError(f'{label}:{key.lineno}: non-constant PROOFS key')

    occurrences, handled = [], set()

    def comprehension_keys(node, where):
        gen = node.generators[0] if len(node.generators) == 1 else None
        if gen is None or gen.ifs or gen.is_async:
            raise ProofDuplicateError(f'{label}:{where.lineno}: PROOFS comprehension with filters or several loops')
        it = gen.iter
        method = it.func.attr if isinstance(it, ast.Call) and isinstance(it.func, ast.Attribute) and not it.args else None
        src = it.func.value if method in ('items', 'keys') else it
        target = gen.target
        if isinstance(target, ast.Tuple) and method == 'items' and len(target.elts) == 2:
            target = target.elts[0]
        if not (isinstance(src, ast.Name) and src.id in literal_dicts and stores.get(src.id) == 1
                and isinstance(target, ast.Name) and method in ('items', 'keys', None)
                and (method == 'items') == isinstance(gen.target, ast.Tuple)):
            raise ProofDuplicateError(f'{label}:{where.lineno}: PROOFS comprehension over a non-literal source')
        source_dict = literal_dicts[src.id]
        for skey, svalue in zip(source_dict.keys, source_dict.values):
            if skey is None:
                raise ProofDuplicateError(f'{label}:{svalue.lineno}: ** spread into {src.id}')
            occurrences.append((fold(node.key, {target.id: fold(skey)}), skey.lineno))

    def literal_keys(node, where):
        if isinstance(node, ast.DictComp):
            return comprehension_keys(node, where)
        if not isinstance(node, ast.Dict):
            raise ProofDuplicateError(f'{label}:{where.lineno}: PROOFS built from a non-literal '
                                      f'({type(node).__name__})')
        for key, value in zip(node.keys, node.values):
            if key is None:
                raise ProofDuplicateError(f'{label}:{value.lineno}: ** spread into PROOFS')
            occurrences.append((fold(key), key.lineno))

    assigns = 0
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign) and len(node.targets) == 1 \
                and isinstance(node.targets[0], ast.Name) and node.targets[0].id == 'PROOFS':
            handled.add(id(node.targets[0]))
            assigns += 1
            literal_keys(node.value, node)
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) \
                and isinstance(node.func.value, ast.Name) and node.func.value.id == 'PROOFS':
            handled.add(id(node.func.value))
            if node.func.attr == 'update':
                if len(node.args) != 1 or node.keywords:
                    raise ProofDuplicateError(f'{label}:{node.lineno}: PROOFS.update needs one literal dict argument')
                literal_keys(node.args[0], node)
            elif node.func.attr not in ('get', 'items', 'keys', 'values', 'copy'):
                raise ProofDuplicateError(f'{label}:{node.lineno}: PROOFS.{node.func.attr}(...) may change PROOFS')
        elif isinstance(node, ast.Subscript) and isinstance(node.value, ast.Name) and node.value.id == 'PROOFS' \
                and isinstance(node.ctx, (ast.Store, ast.Del)):
            raise ProofDuplicateError(f'{label}:{node.lineno}: PROOFS[...] write or delete')
    if assigns > 1:
        raise ProofDuplicateError(f'{label}: PROOFS rebound {assigns} times (earlier keys discarded)')
    for node in ast.walk(tree):
        if isinstance(node, ast.Name) and node.id == 'PROOFS' \
                and isinstance(node.ctx, (ast.Store, ast.Del)) and id(node) not in handled:
            raise ProofDuplicateError(f'{label}:{node.lineno}: PROOFS bound by an unsupported statement')
    return occurrences


def written_proofs():
    """Per-family written proofs: PROOFS = {row: dict(kind, argument, depends_on, sites=[(path, line)])}.
    Each proof is re-bound here to the exact source bytes of its cited sites. One definition per key:
    any key defined twice — within a module's source (a repeated dict-literal key Python would
    silently drop) or across modules — raises ProofDuplicateError before anything is returned
    (TOOL-ISSUES T316, lead ruling 1121224233-9f91 (2); fail closed, nothing judged)."""
    import importlib
    out, seen, withdrawn = {}, {}, withdrawn_proofs()
    for name in PROOF_MODULES:
        for stem in ('pm_goal_dg5_proofs_', 'pm_goal_dg5_justified_'):  # either per-family file name
            try:
                module = importlib.import_module(stem + name)
            except ModuleNotFoundError as error:
                if error.name != stem + name:
                    raise
                continue
            label = 'scripts/%s%s.py' % (stem, name)
            for key, line in _proof_key_occurrences(module, label):
                if key in seen:
                    first_label, first_line = seen[key]
                    where = 'within' if first_label == label else 'across'
                    raise ProofDuplicateError(
                        f'written-proof key {key} defined more than once (TOOL-ISSUES T316): '
                        f'{first_label}:{first_line} and {label}:{line} ({where}, definitions may differ); '
                        f'fail closed, nothing judged')
                seen[key] = (label, line)
            for row, proof in getattr(module, 'PROOFS', {}).items():
                _refuse_withdrawn(label, row, withdrawn)
                out[row] = dict(proof, module=label,
                                bound_sites=[_bind(p, l) for p, l in proof.get('sites', [])],
                                depends_on=list(proof.get('depends_on', [])))
    return out


def justification(family, name, tries, sites=()):
    """A written proof for the row if one exists; else presence, bound to exact source bytes."""
    written = written_proofs().get(name)
    if written is not None and family in written.get('families', [family]):
        return written
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
        frames = _frames(detail)
        if not frames:
            continue
        return dict(kind='presence', witness=record['label'], input_sha256=record['input_sha256'],
                    raised=detail[:240], restoration=record.get('restoration_errors'), depends_on=[],
                    guarded_sites=[_bind(p, l) for p, l in sites],
                    raising_frames=[dict(_bind(f['file'], f['line']), function=f['function']) for f in frames],
                    claim='With only this row cut, the complete checker raises at the recorded frame (it reads the '
                          'member the row guards) instead of accepting; the uncached restoration repeats the refusal.')
    return None
