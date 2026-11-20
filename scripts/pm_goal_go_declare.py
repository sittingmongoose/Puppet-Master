"""C12-GO declared targets for authored negatives (G4) and witness capture for the GO search.

Every negative complete call a GO source makes, or an s3ao/GH1 source makes while
GO runs it, gets its declared target here *before* it runs: from the authored
fixture (`rejection`, `expected_refusal`, an expected code literal in the source),
from the pinned witness bank, or from the static owner/source rule written in
this module. A rule never reads the call's result. Calls no rule covers stay
`undeclared` in the ledger and earn nothing.

`Intercept` wraps `collector.invoke` for the duration of a source's main(); it
also remembers up to KEEP exact-expected inputs per (target, family) so the GO
witness search (pm_goal_go_search.py) can test, deterministically and in both
sweep passes, whether a row already has a witness whose single-row cut accepts.
"""
import collections
import copy
import contextvars
import json
from pathlib import Path

import pm_goal_oracle_common as c

ROOT = Path(__file__).resolve().parents[1]
KEEP = 4
PREFIX = 'restore_point.deleted/original/'
RULES = collections.Counter()           # rule name -> declared calls
EXACT = collections.defaultdict(list)   # (target, family) -> [(evaluate, value, label)]
BANK = contextvars.ContextVar('go_bank', default=None)
_LABELS = None


def frozen_files():
    """Every pinned frozen Python file of the two restore_point.deleted subjects."""
    fixtures = c.load(ROOT / 'Plans/restore_point_deleted_contract_fixtures.json')
    out = []
    for key in ('frozen_joined_subject', 'retained_phase_subject'):
        manifest = Path(fixtures[key]['path'])
        for row in c.load(manifest)['files']:
            path = Path(row['path'])
            path = path if path.is_absolute() else manifest.parent / path
            if path.suffix == '.py':
                out.append(path.resolve())
    # The s3ao in-repository adapters that raise the same refusal transport.
    out += [ROOT / 'scripts/pm_goal_deleted_components.py', ROOT / 'scripts/pm_goal_deleted_retained_oracles.py']
    return sorted(set(out))


_PREFIXES = None


def label_prefixes():
    """Constant prefixes of labels the frozen sources build by concatenation ('created original source '+key)."""
    global _PREFIXES
    if _PREFIXES is None:
        import ast
        out = set()
        for path in frozen_files():
            for node in ast.walk(ast.parse(path.read_text())):
                if (isinstance(node, ast.Call) and isinstance(node.func, ast.Name)
                        and node.func.id in ('expect', 'need', 'require') and len(node.args) > 1
                        and isinstance(node.args[1], ast.BinOp) and isinstance(node.args[1].left, ast.Constant)
                        and isinstance(node.args[1].left.value, str)):
                    out.add(node.args[1].left.value)
        _PREFIXES = out
    return _PREFIXES


def frozen_labels():
    """String-literal refusal labels of expect/need/require calls in the frozen sources (AST)."""
    global _LABELS
    if _LABELS is None:
        import ast
        labels = set()
        for path in frozen_files():
            for node in ast.walk(ast.parse(path.read_text())):
                if (isinstance(node, ast.Call) and isinstance(node.func, ast.Name)
                        and node.func.id in ('expect', 'need', 'require') and len(node.args) > 1
                        and isinstance(node.args[1], ast.Constant) and isinstance(node.args[1].value, str)):
                    labels.add(node.args[1].value)
        _LABELS = labels
    return _LABELS


def resolve_rejection(text, prefix=PREFIX):
    """Authored rejection text -> exactly one frozen label (exact, else unique containing)."""
    if not isinstance(text, str) or not text:
        return None
    labels = frozen_labels()
    if text in labels:
        return prefix + text
    hits = sorted(label for label in labels if text in label)
    if len(hits) == 1:
        return prefix + hits[0]
    if not hits and any(text.startswith(p) and len(text) > len(p) for p in label_prefixes()):
        return prefix + text  # a concatenated label: constant prefix + the authored member
    return None


class Intercept:
    """Declare targets on `collector.invoke` while a source runs; never after a result."""

    def __init__(self, collector, rule, family=None):
        self.collector, self.rule, self.family = collector, rule, family

    def __enter__(self):
        collector, rule = self.collector, self.rule
        self.previous = collector.__dict__.get('invoke')
        inner = collector.invoke  # an outer Intercept, or the collector's own method

        def invoke(label, evaluate, value, valid=None, *, target=None, family=None, generated=False):
            why = 'source' if target is not None else None
            if target is None and valid is False:
                hit = rule(label, value)
                if hit is not None:
                    target, why = hit
            result = inner(label, evaluate, value, valid, target=target, family=family, generated=generated)
            record = collector.ledger[-1] if collector.ledger else None
            if record is not None and record.get('label') == label:
                if why and 'declared_rule' not in record:
                    record['declared_rule'] = why
                    RULES[why] += 1
                if record.get('outcome') == 'exact_expected' and isinstance(record.get('target'), str):
                    slot = EXACT[(record['target'], record['family'])]
                    if len(slot) < KEEP and all(x[2] != label for x in slot):
                        slot.append((evaluate, copy.deepcopy(value), label))
            return result

        collector.invoke = invoke
        return self

    def __exit__(self, *exc):
        if self.previous is None:
            self.collector.__dict__.pop('invoke', None)
        else:
            self.collector.invoke = self.previous
        return False


def bank_rule(label):
    """`frozen-fixture/single-defect/<n>`: the pinned bank's authored expected_refusal."""
    bank = BANK.get()
    if bank is None or not label.startswith('frozen-fixture/single-defect/'):
        return None
    number = int(label.rsplit('/', 1)[1])
    case = bank['cases'][number]
    return case['expected_refusal'], 'bank:' + bank['name']


def load_bank(path, name):
    data = c.load(path)
    return dict(name=name, path=str(path), cases=data['cases'])


def evidence():
    return dict(rules=dict(sorted(RULES.items())), frozen_labels=len(frozen_labels()),
                frozen_files=[str(p) for p in frozen_files()])
