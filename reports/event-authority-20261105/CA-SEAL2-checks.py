#!/usr/bin/env python3
"""DL-451 isolated input/receipt regressions; fixture trees stay outside the repo."""
import argparse
import ast
import dis
import types
import copy
from collections import Counter
import difflib
import hashlib
from functools import lru_cache
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

REL = 'Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py'
COUNT = 'c53e4199ae94ca853a197354f3f9e7f296cf1efc'
PREVIOUS = '5764ca809c0dcc8a161d4fcd45770abf6355f746'
SEAL_BASE = '17c842445a2623bb0334ba8d6932e7a6bf088967'
COVERAGE = 'reports/event-authority-20261105/CA-SEAL2-coverage.json'
# The frozen validator (round 12, CA2-C12-N01): the second line baseline. Its
# bytes are read from this commit and must have this digest; the table pins
# every one of its lines, and every line inserted, changed, deleted or
# replaced relative to it needs a reviewed record.
FROZEN_COMMIT = '60913cb906590662c97696146edcb10960c2ed09'
FROZEN_SHA = '3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72'


def sha(raw): return hashlib.sha256(raw).hexdigest()
def encoded(doc): return (json.dumps(doc, indent=2) + '\n').encode()


@lru_cache(maxsize=4)
def frozen_source(repo=None):
    """The frozen validator's text, from FROZEN_COMMIT, checked against FROZEN_SHA."""
    command = ['git'] + (['-C', str(repo)] if repo is not None else []) + ['show', FROZEN_COMMIT + ':' + REL]
    raw = subprocess.check_output(command)
    assert sha(raw) == FROZEN_SHA, ('frozen validator bytes changed', sha(raw))
    return raw.decode()


def top_functions(tree):
    """The one binding of each top-level function name (CA2-C12-B01).

    Every name map in this checker comes from here, so the checker reads the
    same definition the script runs. A name defined twice at top level is
    refused, never resolved to its first or last definition.
    """
    functions, seen = {}, set()
    for n in tree.body:
        if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)):
            assert n.name not in seen, ('top-level name bound twice', n.name)
            seen.add(n.name)
            if isinstance(n, ast.FunctionDef):
                functions[n.name] = n
    return functions


def source_lines(text):
    """Physical source lines numbered as the parser numbers them (CA2-C11-N04).

    The parser reads source with universal newlines: CRLF and a lone CR become
    LF, and only LF ends a line. Form feed, vertical tab, U+0085, U+2028 and
    the other characters that str.splitlines() also breaks on do not. The
    count is checked against the parser itself with a sentinel statement.
    """
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    lines = text.split('\n')
    terminated = text.endswith('\n')
    probe = ast.parse(text + ('' if terminated else '\n') + 'pm_line_probe = 0\n').body[-1].lineno
    assert probe == len(lines) + (0 if terminated else 1), ('line count differs from the parser', probe, len(lines))
    return lines


# Complete AST class table (CA2-C11-B01). Every node and operator class of the
# running Python's ast module has exactly one category. The coverage test
# regenerates the class list from ast at run time and refuses any class missing
# from this table, and any class marked refused that occurs in the validator.
TRUTH, DATA, STRUCTURAL, REFUSED = 'truth-carrying', 'data', 'structural', 'refused when present'
CATEGORIES = (TRUTH, DATA, STRUCTURAL, REFUSED)
AST_TABLE_PYTHON = '3.14.4'
_ARITHMETIC = ('Arithmetic operator. On Booleans it returns an int, but what reaches the receipt is truthiness, not '
               'type: the receipt\'s pass is bool(overall_pass), and a nonzero int is truthy, so True + False carries '
               'a truth value; on sets, - is membership truth exactly like & and |. No exclusion since round 12 '
               '(CA2-C12-N03): census row BinOp(<op>) or AugAssign(<op>) wherever it occurs.')
_ROW = 'Census row of its own'
_AST_CLASS_GROUPS = [
    (STRUCTURAL, 'Abstract grammar category: the parser never produces a node of this exact class.',
     ['AST', 'mod', 'stmt', 'expr', 'expr_context', 'boolop', 'operator', 'unaryop', 'cmpop', 'excepthandler',
      'pattern', 'type_ignore', 'type_param', 'slice']),
    (REFUSED, 'Deprecated compatibility class: the parser never produces it.',
     ['AugLoad', 'AugStore', 'ExtSlice', 'Index', 'Param', 'Suite']),
    (STRUCTURAL, 'Root of an exec-mode parse; its statements are walked.', ['Module']),
    (REFUSED, 'Root of another parse mode; a validator source file never parses to it.',
     ['Interactive', 'Expression', 'FunctionType']),
    (TRUTH, _ROW + ': a comparison yields a bool; the row covers every operator of the node.', ['Compare']),
    (TRUTH, _ROW + ': Boolean and/or; the walker also lists each clause.', ['BoolOp']),
    (TRUTH, _ROW + ': every call, whatever its name, since its result may be a truth value.', ['Call']),
    (TRUTH, _ROW + ': a conditional expression selects on a truth value.', ['IfExp']),
    (TRUTH, _ROW + ': an assignment expression can capture a predicate.', ['NamedExpr']),
    (TRUTH, _ROW + ' (Assert).', ['Assert']),
    (TRUTH, 'Its test is a census row (If test).', ['If']),
    (TRUTH, 'Its test is a census row (While test).', ['While']),
    (TRUTH, _ROW + ': exception dispatch over the handler list (Try dispatch, TryStar dispatch).', ['Try', 'TryStar']),
    (TRUTH, _ROW + ' (except dispatch), plus one per alternative (except alternative).', ['ExceptHandler']),
    (TRUTH, 'Each filter is a census row (comprehension if).', ['comprehension']),
    (TRUTH, 'Its pattern (match case) and guard (match guard) are census rows.', ['match_case']),
    (TRUTH, 'Decides whether a case matches; covered by the enclosing match case row, whose expression is the '
            'whole pattern.', ['MatchValue', 'MatchSingleton', 'MatchSequence', 'MatchMapping', 'MatchClass',
                               'MatchStar', 'MatchAs', 'MatchOr']),
    (TRUTH, 'Boolean operator; carried by the census row of its BoolOp.', ['And', 'Or']),
    (TRUTH, 'Negation yields a bool; census row UnaryOp(Not) wherever it occurs.', ['Not']),
    (TRUTH, 'On Booleans a bitwise operator returns a bool, so it combines truth values; census row BinOp(<op>) or '
            'AugAssign(<op>) wherever it occurs.', ['BitAnd', 'BitOr', 'BitXor']),
    (TRUTH, 'Comparison operator; carried by the census row of its Compare.',
     ['Eq', 'NotEq', 'Lt', 'LtE', 'Gt', 'GtE', 'Is', 'IsNot', 'In', 'NotIn']),
    (TRUTH, _ARITHMETIC, ['Add', 'Sub', 'Mult', 'MatMult', 'Div', 'Mod', 'Pow', 'LShift', 'RShift', 'FloorDiv']),
    (TRUTH, 'Unary arithmetic. On a Boolean it returns an int, and ~True == -2 and -True == -1 are truthy, so it '
            'carries a truth value through any truthiness sink; census row UnaryOp(<op>) wherever it occurs.',
     ['Invert', 'UAdd', 'USub']),
    (DATA, 'Expression context of a name, attribute, subscript, starred item or display target.',
     ['Load', 'Store', 'Del']),
    (TRUTH, 'Operator census: every operator class is truth-carrying, so every binary operation, unary operation '
            'and in-place update is a census row <class>(<operator>) wherever it occurs.',
     ['BinOp', 'UnaryOp', 'AugAssign']),
    (DATA, 'Value reference or literal; truth carriers inside it are inventoried in their own right.',
     ['Attribute', 'Subscript', 'Starred', 'Name', 'Constant', 'Slice']),
    (DATA, 'Display or string building; truth carriers inside it are inventoried in their own right.',
     ['Dict', 'Set', 'List', 'Tuple', 'JoinedStr', 'FormattedValue']),
    (DATA, 'Builds a collection or generator; each filter is a census row through its comprehension.',
     ['ListComp', 'SetComp', 'DictComp', 'GeneratorExp']),
    (DATA, 'Binds or removes values; truth carriers in the value are inventoried in their own right.',
     ['Assign', 'AnnAssign', 'Delete', 'Expr']),
    (DATA, 'Binds module objects or import aliases to names.', ['Import', 'ImportFrom', 'alias']),
    (DATA, 'Keyword argument. The JSON parser callbacks object_pairs_hook, parse_constant and parse_float also have '
           'a census row (parser callback).', ['keyword']),
    (STRUCTURAL, 'Defines code; its header is a statement header and its body is walked.',
     ['FunctionDef', 'ClassDef', 'Lambda', 'arguments', 'arg']),
    (STRUCTURAL, 'Control flow without a test of its own; the values it uses are inventoried in their own right.',
     ['Return', 'Raise', 'Pass', 'Break', 'Continue', 'For', 'With', 'withitem', 'Match']),
    (REFUSED, 'Coroutine or generator semantics; the census does not model them.',
     ['AsyncFunctionDef', 'AsyncFor', 'AsyncWith', 'Await', 'Yield', 'YieldFrom']),
    (REFUSED, 'Rebinds a name outside the function\'s own scope; the census does not model it.',
     ['Global', 'Nonlocal']),
    (REFUSED, 'PEP 695 type parameters and aliases are evaluated lazily; the census does not model them.',
     ['TypeAlias', 'TypeVar', 'ParamSpec', 'TypeVarTuple']),
    (REFUSED, 'Produced only with type_comments=True, which this checker never uses.', ['TypeIgnore']),
    (REFUSED, 'Template strings (3.14) build a Template object; the census does not model them.',
     ['TemplateStr', 'Interpolation']),
]
AST_CLASSES = {}
for _category, _reason, _names in _AST_CLASS_GROUPS:
    for _name in _names:
        assert _name not in AST_CLASSES, ('class listed twice', _name)
        AST_CLASSES[_name] = (_category, _reason)


def ast_class_names():
    """Every AST node and operator class of the running Python, regenerated at run time."""
    import _ast
    names = {name for module in (ast, _ast) for name, value in vars(module).items()
             if isinstance(value, type) and issubclass(value, ast.AST)}
    pending = [ast.AST]
    while pending:
        cls = pending.pop()
        if cls.__module__ in ('ast', '_ast'):
            names.add(cls.__name__)
        pending.extend(cls.__subclasses__())
    return sorted(names)


def ast_class_summary(table=None):
    table = AST_CLASSES if table is None else table
    return {'python_version': AST_TABLE_PYTHON, 'classes': len(table),
            'by_category': {c: sum(v[0] == c for v in table.values()) for c in CATEGORIES},
            'table_sha256': sha(json.dumps({k: list(v) for k, v in table.items()}, sort_keys=True).encode())}


def predicate_sites(source, before):
    """Astra 3 inventory rules, with touched functions/lines derived from the diff.

    Keep wrappers and children distinct. Expand chains, receipt fields, nested
    identities and call-instantiated authority requirements independently.
    """
    functions = top_functions(ast.parse(source))
    previous = top_functions(ast.parse(before))
    added_lines = set()
    for tag, _, _, start, end in difflib.SequenceMatcher(
            None, source_lines(before), source_lines(source), autojunk=False).get_opcodes():
        if tag in {'insert', 'replace'}:
            added_lines.update(range(start + 1, end + 1))
    rows = {}
    def add(function, node, expression, kind):
        row = {'function': function, 'line': node.lineno, 'column': node.col_offset,
               'expression': expression, 'kind': kind}
        key = (function, node.lineno, node.col_offset, expression, kind)
        rows[key] = row
    touched = {}
    for name, fn in functions.items():
        old = previous.get(name)
        if old is not None and ast.dump(old) == ast.dump(fn):
            continue
        touched[name] = fn
        for n in ast.walk(fn):
            if not hasattr(n, 'lineno'):
                continue
            # Astra includes the builder's returned record immediately after
            # its inserted gate, since that gate changes this record's pass.
            if old is not None and n.lineno not in added_lines and not (
                    name == 'build_receipt' and isinstance(n, ast.Return)):
                continue
            if isinstance(n, ast.Compare):
                for left, op, right in zip([n.left] + n.comparators[:-1], n.ops, n.comparators):
                    add(name, n, ast.unparse(ast.Compare(left=left, ops=[op], comparators=[right])), 'comparison')
            if isinstance(n, ast.If):
                add(name, n.test, ast.unparse(n.test), 'branch')
            if isinstance(n, ast.IfExp):
                add(name, n.test, ast.unparse(n.test), 'conditional expression')
            if isinstance(n, ast.BoolOp):
                for child in n.values:
                    if not isinstance(child, ast.BoolOp):
                        add(name, child, ast.unparse(child), 'Boolean clause')
            if (isinstance(n, ast.Call) and isinstance(n.func, ast.Attribute)
                    and n.func.attr in {'fullmatch', 'search', 'isfinite', 'startswith',
                                        'is_absolute', 'is_relative_to', 'is_file'}):
                add(name, n, ast.unparse(n), 'predicate call')
            if isinstance(n, ast.Return):
                add(name, n, ast.unparse(n.value) if n.value else 'None', 'return')
            # Astra's close_inventory adds this executable observer assignment.
            if (isinstance(n, ast.Assign) and isinstance(n.value, ast.Call)
                    and ast.unparse(n.value) == 'third_change_validator_pin()'):
                add(name, n, ast.unparse(n), 'changed observer call')
    syntax = sorted(rows.values(), key=lambda r: (r['line'], r['column'], r['kind']))
    for row in syntax:
        row['site_id'] = 'syntax:' + sha(json.dumps(row, sort_keys=True).encode())
    semantic = []
    def expand(label):
        semantic.append({'site_id': 'semantic:' + label, 'predicate': label})
    change = touched['recount_change_state']
    expected = next(n.value for n in ast.walk(change) if isinstance(n, ast.Assign)
                    and any(isinstance(t, ast.Name) and t.id == 'expected' for t in n.targets))
    for key in expected.keys:
        for clause in ['type', 'value']:
            expand('field_' + key.value + '_' + clause)
    authority = next(n for n in ast.walk(change) if isinstance(n, ast.Call)
                     and isinstance(n.func, ast.Name) and n.func.id == 'decision_section_bytes')
    for index, _ in enumerate(authority.args[2].elts):
        expand('authority_required_token_' + str(index))
    for key, value in zip(expected.keys, expected.values):
        if isinstance(value, ast.Dict):
            for clause in ['path', 'keys']:
                expand('nested_' + key.value + '_' + clause)
    flags = next(n for n in ast.walk(change) if isinstance(n, ast.GeneratorExp)
                 and isinstance(n.generators[0].iter, ast.Tuple))
    for flag in flags.generators[0].iter.elts:
        expand(flag.value + ' is False')
    for handler in (n for n in ast.walk(touched['recount_validation']) if isinstance(n, ast.ExceptHandler)):
        issue = next(n for n in ast.walk(handler) if isinstance(n, ast.Dict))
        error = next(value.value for key, value in zip(issue.keys, issue.values) if key.value == 'error')
        expand('collect ' + error + ' before completion')
    return syntax + semantic


def predicate_supplement(source, before, walker):
    """Inventory syntax by node type, without guessing a call's return type.

    Walk the whole body of each changed top-level function, including nested
    functions and inherited August statements. Classification is a separate,
    reviewed record; it can never suppress an identity in this enumeration.
    """
    functions = top_functions(ast.parse(source))
    previous = top_functions(ast.parse(before))
    touched = [name for name, fn in functions.items()
               if name not in previous or ast.dump(previous[name]) != ast.dump(fn)]
    rows = [supplement_identity(name, node, expression, node_type)
            for name in touched for node, expression, node_type in supplement_nodes(functions[name])]
    # Round 12 (CA2-C12-N03): the module body has no function census, so every
    # operator on one of its inserted or changed lines is a census row of its
    # own; any other truth carrier there stays refused (changed_line_inventory).
    rows += [supplement_identity(MODULE_UNIT, node, expression, node_type)
             for node, expression, node_type in module_census_nodes(source, before)]
    return sorted(rows, key=lambda r: (r['line'], r['column'], r['kind'])), touched


def supplement_identity(function, node, expression, node_type):
    identity = {'function': function, 'line': node.lineno, 'column': node.col_offset,
                'expression': expression, 'kind': 'node ' + node_type}
    return dict(identity, node_type=node_type,
                site_id='supplement:' + sha(json.dumps(identity, sort_keys=True).encode()))


def _own_row(n):
    return [(n, ast.unparse(n), type(n).__name__)]


def _dispatch_row(n):
    # Dispatch identity excludes handler bodies; those are walked
    # independently. Each handler and each alternative also has a row.
    return [(n, repr([ast.unparse(h.type) if h.type else '*' for h in n.handlers]), type(n).__name__ + ' dispatch')]


def _handler_rows(n):
    alternatives = n.type.elts if isinstance(n.type, ast.Tuple) else [n.type]
    return [(n, ast.unparse(n.type) if n.type else '*', 'except dispatch')] + [
        (alternative or n, ast.unparse(alternative) if alternative else '*', 'except alternative')
        for alternative in alternatives]


def _case_rows(n):
    return [(n.pattern, ast.unparse(n.pattern), 'match case')] + (
        [(n.guard, ast.unparse(n.guard), 'match guard')] if n.guard is not None else [])


# Census rules, keyed by exact class name. Every truth-carrying class of
# AST_CLASSES has exactly one mechanism: a rule here, the operator rule on
# OPERATOR_PARENTS, or the row of the node that always contains it (BoolOp,
# Compare, match case). ast_class_problems() checks that agreement.
CENSUS_RULES = {
    'Compare': _own_row, 'BoolOp': _own_row, 'Call': _own_row, 'IfExp': _own_row,
    'NamedExpr': _own_row, 'Assert': _own_row,
    'If': lambda n: [(n.test, ast.unparse(n.test), 'If test')],
    'While': lambda n: [(n.test, ast.unparse(n.test), 'While test')],
    'comprehension': lambda n: [(test, ast.unparse(test), 'comprehension if') for test in n.ifs],
    'match_case': _case_rows,
    'Try': _dispatch_row, 'TryStar': _dispatch_row, 'ExceptHandler': _handler_rows,
}
# A data class whose truth depends on its operator: wherever it occurs, a
# truth-carrying operator makes the node a census row, '<parent>(<operator>)'.
OPERATOR_PARENTS = ('BinOp', 'AugAssign', 'UnaryOp')
PARSER_CALLBACKS = {'object_pairs_hook', 'parse_constant', 'parse_float'}
DATA_RULES = {'keyword': lambda n: [(n, n.arg + '=' + ast.unparse(n.value), 'parser callback')]
              if n.arg in PARSER_CALLBACKS else []}


def category(name, table=None):
    # An unknown class counts as truth-carrying (it yields a row nobody lists)
    # and as refused when present; ast_class_problems() names it either way.
    return (AST_CLASSES if table is None else table).get(name, (None,))[0]


def truth_operator(node, table=None):
    """The truth-carrying operator class of a BinOp, AugAssign or UnaryOp, else None."""
    if type(node).__name__ not in OPERATOR_PARENTS:
        return None
    name = type(node.op).__name__
    return name if category(name, table) in (TRUTH, None) else None


def supplement_nodes(fn):
    """Yield (anchor node, expression, node type) for every inventoried node of one function.

    An operator census, not a list of statement shapes: every node is
    dispatched on its exact class, and BinOp, AugAssign and UnaryOp also on
    their operator's class, wherever they occur.
    """
    for n in ast.walk(fn):
        name = type(n).__name__
        for rules in (CENSUS_RULES, DATA_RULES):
            if name in rules:
                yield from rules[name](n)
        op = truth_operator(n)
        if op is not None:
            yield n, ast.unparse(n), name + '(' + op + ')'


def census_mechanism(name):
    """How the census inventories a truth-carrying class, or None if it has no mechanism."""
    if name in CENSUS_RULES:
        return 'own rule'
    if name in OPERATOR_PARENTS:
        return 'operator census row'
    cls = getattr(ast, name, None)
    if not isinstance(cls, type):
        return None
    if issubclass(cls, ast.operator):
        return 'operator of BinOp and AugAssign'
    if issubclass(cls, ast.unaryop):
        return 'operator of UnaryOp'
    for base, carrier in ((ast.boolop, 'BoolOp'), (ast.cmpop, 'Compare'), (ast.pattern, 'match_case')):
        if issubclass(cls, base) and carrier in CENSUS_RULES:
            return 'carried by the ' + carrier + ' row'
    return None


def ast_class_problems(tree, table=None, python=AST_TABLE_PYTHON):
    """Closure of the class table: the running ast, the census rules and the validator's own nodes."""
    table = AST_CLASSES if table is None else table
    running = ast_class_names()
    same_minor = tuple(sys.version_info[:2]) == tuple(int(x) for x in python.split('.')[:2])
    present = Counter(type(n).__name__ for n in ast.walk(tree))
    return {
        'missing_from_table': sorted(set(running) - set(table)),
        # A class the table lists but the running ast lacks is stale only on the
        # recorded minor version; another version still needs every running class.
        'not_in_running_ast': sorted(set(table) - set(running)) if same_minor else [],
        'invalid_entry': sorted(n for n, entry in table.items()
                                if len(entry) != 2 or entry[0] not in CATEGORIES or not str(entry[1]).strip()),
        'truth_carrying_without_census_rule': sorted(n for n in set(running) | set(table)
                                                     if category(n, table) == TRUTH and census_mechanism(n) is None),
        'census_rule_for_class_not_truth_carrying': sorted(n for n in CENSUS_RULES if category(n, table) != TRUTH),
        'refused_present': sorted(n for n in present if category(n, table) in (REFUSED, None)),
    }


STATEMENT_BODIES = {'body', 'orelse', 'finalbody', 'handlers', 'cases'}


def header_span(node):
    """First and last line of a statement, handler or case, outside its nested statement bodies."""
    spans = [(node.lineno, node.lineno)] if hasattr(node, 'lineno') else []
    for field, value in ast.iter_fields(node):
        if field in STATEMENT_BODIES:
            continue
        for child in value if isinstance(value, list) else [value]:
            if isinstance(child, ast.AST):
                spans.extend((n.lineno, n.end_lineno) for n in ast.walk(child)
                             if getattr(n, 'end_lineno', None) is not None)
    return min(s for s, _ in spans), max(e for _, e in spans)


def parent_links(tree):
    links = {}
    for node in ast.walk(tree):
        for field, value in ast.iter_fields(node):
            for child in value if isinstance(value, list) else [value]:
                if isinstance(child, ast.AST):
                    links[id(child)] = (node, field)
    return links


def occurrence_counterpart(node, node_type, expression, fn, old, line_map, links, old_links, index):
    """Return (historical node, None) for an unchanged occurrence, else (None, reason)."""
    def one_block(start, end):
        blocks = {line_map.get(line, (None, None))[1] for line in range(start, end + 1)}
        return None not in blocks and len(blocks) == 1
    statement = isinstance(node, (ast.stmt, ast.excepthandler))
    if not one_block(*(header_span(node) if statement else (node.lineno, node.end_lineno))):
        return None, 'inserted or changed line'
    candidates = index.get((node_type, line_map[node.lineno][0], node.col_offset, expression), [])
    if len(candidates) != 1:
        return None, 'no single historical node at the mapped position'
    match = candidates[0]
    if not statement and (line_map[node.end_lineno][0], node.end_col_offset) != (match.end_lineno, match.end_col_offset):
        return None, 'changed node extent'
    if isinstance(node, (ast.Try, ast.TryStar)) and (
            [line_map.get(h.lineno, (None,))[0] for h in node.handlers] != [h.lineno for h in match.handlers]):
        return None, 'changed handler list'
    # The whole enclosing chain, up to the top-level function, must be the same
    # structure at unchanged positions: same parent type and field, and, where
    # the node sits in a statement body, an unchanged enclosing header.
    current, past = node, match
    while current is not fn:
        (parent, field), (old_parent, old_field) = links[id(current)], old_links.get(id(past), (None, None))
        if type(parent) is not type(old_parent) or field != old_field:
            return None, 'changed enclosing context'
        if field in STATEMENT_BODIES and not one_block(*header_span(parent)):
            return None, 'changed enclosing header'
        if hasattr(parent, 'lineno') and (
                (line_map.get(parent.lineno, (None,))[0], parent.col_offset) != (old_parent.lineno, old_parent.col_offset)):
            return None, 'changed enclosing context'
        current, past = parent, old_parent
    if past is not old:
        return None, 'changed enclosing context'
    return match, None


def occurrence_map(source, before):
    """Map current node identities to their CA-SEAL occurrences, mechanically.

    Each touched function that exists by name at CA-SEAL is aligned to its own
    historical body by unchanged source lines (difflib matching blocks over the
    function's lines, decorators and signature included). A current node has a
    counterpart only if it lies inside one unchanged block, a historical node of
    the same type and expression sits at the mapped position and extent, and its
    enclosing context is unchanged. The map is injective. Nodes on inserted or
    changed lines, in a changed context, or in a function new since CA-SEAL have
    no counterpart. Line marks for every aligned unit, the module body outside
    top-level functions included, are reported with the totals.
    """
    tree, old_tree, units, removed = aligned_units(source, before)
    aligned = {u['name']: u for u in units}
    current = top_functions(tree)
    historical = top_functions(old_tree)
    counterparts, functions, ineligible = {}, {}, Counter()
    for name, fn in current.items():
        old = historical.get(name)
        if old is not None and ast.dump(old) == ast.dump(fn):
            continue
        nodes = list(supplement_nodes(fn))
        if old is None:
            functions[name] = {'history': False, 'aligned_blocks': 0, 'aligned_lines': 0,
                               'nodes': len(nodes), 'eligible_nodes': 0}
            ineligible['function new since CA-SEAL'] += len(nodes)
            continue
        blocks, line_map = aligned[name]['blocks'], aligned[name]['line_map']
        links, old_links = parent_links(fn), parent_links(old)
        index = {}
        for node, expression, node_type in supplement_nodes(old):
            index.setdefault((node_type, node.lineno, node.col_offset, expression), []).append(node)
        eligible = 0
        for node, expression, node_type in nodes:
            match, reason = occurrence_counterpart(node, node_type, expression, fn, old,
                                                   line_map, links, old_links, index)
            if match is None:
                ineligible[reason] += 1
                continue
            site = supplement_identity(name, node, expression, node_type)['site_id']
            assert site not in counterparts, ('ambiguous current occurrence', site)
            counterparts[site] = supplement_identity(name, match, expression, node_type)['site_id']
            eligible += 1
        functions[name] = {'history': True, 'aligned_blocks': len(blocks),
                           'aligned_lines': sum(b.size for b in blocks), 'nodes': len(nodes),
                           'eligible_nodes': eligible}
    assert len(set(counterparts.values())) == len(counterparts), 'occurrence map is not one-to-one'
    totals = {'baseline': SEAL_BASE,
              'aligned_functions': sum(f['history'] for f in functions.values()),
              'new_functions': sum(not f['history'] for f in functions.values()),
              'aligned_blocks': sum(f['aligned_blocks'] for f in functions.values()),
              'aligned_lines': sum(f['aligned_lines'] for f in functions.values()),
              'eligible_nodes': len(counterparts),
              'ineligible_nodes': dict(sorted(ineligible.items())),
              'functions': functions,
              'line_marks': {u['name']: {mark: len(lines) for mark, lines in u['marks'].items()} for u in units},
              'removed_functions': [name for name, _ in removed]}
    return counterparts, totals


MODULE_UNIT = '<module>'
TOP_LEVEL_DEFS = (ast.FunctionDef, ast.AsyncFunctionDef)


def function_span(fn):
    return min([fn.lineno] + [d.lineno for d in fn.decorator_list]), fn.end_lineno


def align_lines(old_numbers, old_lines, new_numbers, new_lines):
    """difflib alignment of two line sequences, given by their 1-based line numbers.

    Returns the matching blocks, a line map {current line: (CA-SEAL line,
    block index)} and the line marks: current lines inserted or changed, and
    CA-SEAL lines deleted or replaced.
    """
    matcher = difflib.SequenceMatcher(None, [old_lines[i - 1] for i in old_numbers],
                                      [new_lines[i - 1] for i in new_numbers], autojunk=False)
    blocks = [b for b in matcher.get_matching_blocks() if b.size]
    line_map = {new_numbers[b.b + k]: (old_numbers[b.a + k], i) for i, b in enumerate(blocks) for k in range(b.size)}
    marks = {'inserted': [], 'changed': [], 'deleted': [], 'replaced': []}
    for tag, a1, a2, b1, b2 in matcher.get_opcodes():
        if tag in ('insert', 'replace'):
            marks['inserted' if tag == 'insert' else 'changed'].extend(new_numbers[b1:b2])
        if tag in ('delete', 'replace'):
            marks['deleted' if tag == 'delete' else 'replaced'].extend(old_numbers[a1:a2])
    return blocks, line_map, marks


@lru_cache(maxsize=4)
def aligned_units(source, before):
    """CA-SEAL units, each aligned line by line (do not mutate the result).

    A unit is a touched top-level function that exists by name at CA-SEAL
    (decorators and signature included), a top-level function new since
    CA-SEAL, or the module body outside all top-level function definitions,
    '<module>'. A new function has no CA-SEAL counterpart, so every line of it
    is an inserted line (round 12, CA2-C12-B02). Returns (tree, CA-SEAL tree,
    units, CA-SEAL functions whose name no longer exists, with their spans).
    """
    tree, old_tree = ast.parse(source), ast.parse(before)
    lines, old_lines = source_lines(source), source_lines(before)
    current = top_functions(tree)
    historical = top_functions(old_tree)
    units = []
    for name, fn in current.items():
        old = historical.get(name)
        if old is not None and ast.dump(old) == ast.dump(fn):
            continue
        start, end = function_span(fn)
        if old is None:
            marks = {'inserted': list(range(start, end + 1)), 'changed': [], 'deleted': [], 'replaced': []}
            units.append({'name': name, 'fn': fn, 'old': None, 'roots': [fn], 'new': True,
                          'blocks': [], 'line_map': {}, 'marks': marks})
            continue
        old_start, old_end = function_span(old)
        blocks, line_map, marks = align_lines(list(range(old_start, old_end + 1)), old_lines,
                                              list(range(start, end + 1)), lines)
        units.append({'name': name, 'fn': fn, 'old': old, 'roots': [fn], 'new': False,
                      'blocks': blocks, 'line_map': line_map, 'marks': marks})

    def outside(t, count):
        inside = set()
        for n in t.body:
            if isinstance(n, TOP_LEVEL_DEFS):
                first, last = function_span(n)
                inside.update(range(first, last + 1))
        return [i for i in range(1, count + 1) if i not in inside]
    blocks, line_map, marks = align_lines(outside(old_tree, len(old_lines)), old_lines,
                                          outside(tree, len(lines)), lines)
    units.append({'name': MODULE_UNIT, 'fn': None, 'old': None, 'new': False,
                  'roots': [n for n in tree.body if not isinstance(n, TOP_LEVEL_DEFS)],
                  'blocks': blocks, 'line_map': line_map, 'marks': marks})
    removed = [(name, function_span(old)) for name, old in historical.items() if name not in current]
    return tree, old_tree, units, removed


def node_span(node):
    return header_span(node) if isinstance(node, (ast.stmt, ast.excepthandler)) else (node.lineno, node.end_lineno)


def _statement_list(value):
    return isinstance(value, list) and all(isinstance(x, (ast.stmt, ast.excepthandler, ast.match_case)) for x in value)


def node_text(node):
    """Source form of a node; a statement with nested bodies is given by its header only.

    Only a field that holds a list of statements, handlers or cases is blanked
    (CA2-C12-N04): Lambda.body and IfExp.body/orelse are expressions and stay.
    """
    fields = [f for f in STATEMENT_BODIES & set(node._fields) if _statement_list(getattr(node, f, None))]
    if fields:
        node = copy.copy(node)
        for field in fields:
            setattr(node, field, [])
    return ast.unparse(node)


def changed_lines(unit):
    return set(unit['marks']['inserted']) | set(unit['marks']['changed'])


def module_operator_nodes(unit):
    """Census anchors of the module unit: every operator node on one of its inserted or changed lines."""
    changed = changed_lines(unit)
    for root in unit['roots']:
        for n in ast.walk(root):
            op = truth_operator(n)
            if op is None:
                continue
            first, last = node_span(n)
            if changed.intersection(range(first, last + 1)):
                yield n, ast.unparse(n), type(n).__name__ + '(' + op + ')'


def module_census_nodes(source, before):
    unit = next(u for u in aligned_units(source, before)[2] if u['name'] == MODULE_UNIT)
    return list(module_operator_nodes(unit))


def unit_anchors(unit):
    """ids of the nodes of a unit that anchor a census row."""
    nodes = supplement_nodes(unit['fn']) if unit['fn'] is not None else module_operator_nodes(unit)
    return {id(a) for a, _, _ in nodes}


def carried_nodes(unit, anchors):
    """ids of truth-carrying nodes whose truth a census row anchored elsewhere carries (If, While, patterns)."""
    carried = set()
    for root in unit['roots']:
        for n in ast.walk(root):
            anchored = [a for a, _, _ in CENSUS_RULES.get(type(n).__name__, lambda n: [])(n)]
            if anchored and all(id(a) in anchors for a in anchored):
                carried.add(id(n))
            if isinstance(n, ast.match_case) and id(n.pattern) in anchors:
                carried.update(id(p) for p in ast.walk(n.pattern))
    return carried


def required_outcome(n, carried, unchanged_truth=None):
    """The outcome a node's own row must state, from its exact class."""
    name = type(n).__name__
    kind = category(name)
    if kind == TRUTH:
        return STRUCTURAL if id(n) in carried else (unchanged_truth or REFUSED)
    if name == 'keyword' and n.arg in PARSER_CALLBACKS:
        # A JSON parser callback has a census row of its own wherever a census applies.
        return unchanged_truth or REFUSED
    return kind if kind in (DATA, STRUCTURAL) else REFUSED


CHANGED_IDENTITY = ('function', 'line', 'column', 'end_line', 'end_column', 'node_class', 'expression')
HISTORICAL_IDENTITY = ('function', 'baseline_line', 'text', 'mark')


def changed_line_inventory(source, before):
    """Every node on an inserted or changed line of a unit (N02, option A; round 12, new functions too).

    A node is on such a line if its span (a statement's header span) meets one;
    every line of a function new since CA-SEAL is an inserted line. Nodes that
    anchor a census row already have their identity and outcome there; every
    other node needs a changed-line row, data or structural as its class is. A
    truth-carrying node whose truth no census row carries (possible only in the
    module unit, where only operators have census rows) is refused: required
    outcome REFUSED.
    """
    tree, _, units, _ = aligned_units(source, before)
    rows = {}
    for unit in units:
        changed = changed_lines(unit)
        if not changed:
            continue
        anchors = unit_anchors(unit)
        carried = carried_nodes(unit, anchors)
        for root in unit['roots']:
            for n in ast.walk(root):
                if getattr(n, 'lineno', None) is None or id(n) in anchors:
                    continue
                first, last = node_span(n)
                if not changed.intersection(range(first, last + 1)):
                    continue
                identity = {'function': unit['name'], 'line': n.lineno, 'column': n.col_offset,
                            'end_line': n.end_lineno, 'end_column': n.end_col_offset,
                            'node_class': type(n).__name__, 'expression': node_text(n)}
                site = 'changed:' + sha(json.dumps(identity, sort_keys=True).encode())
                assert site not in rows, ('ambiguous changed-line node', site)
                rows[site] = dict(identity, site_id=site, required_outcome=required_outcome(n, carried))
    return rows


def historical_line_inventory(source, before):
    """Every CA-SEAL line of an aligned unit with no current counterpart line.

    Marked 'deleted' or 'replaced' by the unit's alignment, or 'function
    removed' when a CA-SEAL top-level function no longer exists by name. Each
    needs a reviewed reason.
    """
    _, _, units, removed = aligned_units(source, before)
    old_lines = source_lines(before)
    rows = {}
    def add(function, line, mark):
        identity = {'function': function, 'baseline_line': line, 'text': old_lines[line - 1], 'mark': mark}
        site = 'historical:' + sha(json.dumps(identity, sort_keys=True).encode())
        rows[site] = dict(identity, site_id=site)
    for unit in units:
        for mark in ('deleted', 'replaced'):
            for line in unit['marks'][mark]:
                add(unit['name'], line, mark)
    for name, (first, last) in removed:
        for line in range(first, last + 1):
            add(name, line, 'function removed')
    return rows


NODE_IDENTITY = CHANGED_IDENTITY + ('baseline_line',)
UNCHANGED_TRUTH = 'unchanged August truth carrier'
NODE_OUTCOMES = (DATA, STRUCTURAL, UNCHANGED_TRUTH)
# Node classes that never carry a source position, and where each one is
# recorded: CPython shares one instance per operator and expression-context
# class, held as a field of a positioned node whose class and text name it.
POSITIONLESS = {
    'Module': 'the parse root; every statement has its own row and every line its pin',
    'comprehension': 'in the text of its ListComp, SetComp, DictComp or GeneratorExp row; each filter is a census row',
    'arguments': 'in the header text of its FunctionDef or Lambda row; each parameter has its own arg row',
    'withitem': 'in the header text of its With row',
    'match_case': 'its pattern, guard and body statements have their own rows',
}
for _base in (ast.expr_context, ast.boolop, ast.operator, ast.unaryop, ast.cmpop):
    for _cls in _base.__subclasses__():
        POSITIONLESS[_cls.__name__] = 'shared ' + _base.__name__ + ' instance; named by the class and text of its holder'


def node_identity(unit, n):
    return {'function': unit, 'line': n.lineno, 'column': n.col_offset, 'end_line': n.end_lineno,
            'end_column': n.end_col_offset, 'node_class': type(n).__name__, 'expression': node_text(n)}


@lru_cache(maxsize=4)
def node_model(source, before):
    """Node rows and the partition of V's nodes (round 12, CA2-C12-B02: the table is total).

    Every node of V with a source position has exactly one kind of row: a
    census row anchored at it (touched functions, and operators on changed
    module lines), a changed-line row (a node on an inserted or changed line
    of a unit; every line of a new function is one), or a node row. A node row
    is a node unchanged since CA-SEAL, either in a function that is
    AST-identical to CA-SEAL or on an unchanged line of a unit, and records
    its computed CA-SEAL line (baseline_line). Its required outcome is its
    class's category: data, structural (a truth carrier whose truth a census
    row carries), or 'unchanged August truth carrier' (a truth carrier in code
    no census covers: an untouched function, which any edit makes touched, or
    an unchanged module line). Nodes without a position are of the classes in
    POSITIONLESS, each recorded in a positioned row as listed there.

    Returns (rows by site id, partition totals and problems).
    """
    tree, old_tree, units, _ = aligned_units(source, before)
    rows, kinds = {}, {}

    def add(unit_name, n, required, baseline):
        identity = dict(node_identity(unit_name, n), baseline_line=baseline)
        site = 'node:' + sha(json.dumps(identity, sort_keys=True).encode())
        assert site not in rows, ('ambiguous node', site)
        rows[site] = dict(identity, site_id=site, required_outcome=required)

    def mark(n, kind):
        kinds.setdefault(id(n), []).append(kind)

    for unit in units:
        changed = changed_lines(unit)
        anchors = unit_anchors(unit)
        carried = carried_nodes(unit, anchors)
        unchanged_truth = UNCHANGED_TRUTH if unit['fn'] is None else None
        for root in unit['roots']:
            for n in ast.walk(root):
                if getattr(n, 'lineno', None) is None:
                    continue
                if id(n) in anchors:
                    mark(n, 'census anchor')
                    continue
                first, last = node_span(n)
                if changed.intersection(range(first, last + 1)):
                    mark(n, 'changed-line row')
                    continue
                mark(n, 'node row')
                add(unit['name'], n, required_outcome(n, carried, unchanged_truth), unit['line_map'][n.lineno][0])
    touched = {u['name'] for u in units}
    historical = top_functions(old_tree)
    untouched = 0
    for name, fn in top_functions(tree).items():
        if name in touched:
            continue
        old = historical[name]
        assert ast.dump(old) == ast.dump(fn), ('untouched function differs from CA-SEAL', name)
        untouched += 1
        # AST-identical, so both walks visit counterpart nodes in the same order.
        for n, o in zip(ast.walk(fn), ast.walk(old)):
            if getattr(n, 'lineno', None) is None:
                continue
            assert type(n) is type(o), (name, type(n).__name__, type(o).__name__)
            mark(n, 'node row')
            add(name, n, required_outcome(n, set(), UNCHANGED_TRUTH), o.lineno)
    positioned = [n for n in ast.walk(tree) if getattr(n, 'lineno', None) is not None]
    positionless = Counter(type(n).__name__ for n in ast.walk(tree) if getattr(n, 'lineno', None) is None)
    partition = {
        'positioned_nodes': len(positioned),
        'by_row_kind': dict(sorted(Counter(k for n in positioned for k in kinds.get(id(n), [])).items())),
        'untouched_functions': untouched,
        'positionless_nodes': dict(sorted(positionless.items())),
        'problems': {
            'node_without_a_row': sorted('%s@%d:%d' % (type(n).__name__, n.lineno, n.col_offset)
                                         for n in positioned if id(n) not in kinds),
            'node_with_two_rows': sorted('%s@%d:%d' % (type(n).__name__, n.lineno, n.col_offset)
                                         for n in positioned if len(kinds.get(id(n), [])) > 1),
            'positionless_class_not_listed': sorted(set(positionless) - set(POSITIONLESS)),
        },
    }
    return rows, partition


def node_totals(rows):
    return {'rows': len(rows), 'by_unit_kind': dict(sorted(Counter(
                'module' if r['function'] == MODULE_UNIT else 'function' for r in rows).items())),
            'by_class': dict(sorted(Counter(r['node_class'] for r in rows).items())),
            'by_outcome': dict(sorted(Counter(r['outcome'] for r in rows).items()))}


FROZEN_IDENTITY = ('mark', 'line', 'sha256', 'text')


def line_pins(text):
    """The SHA-256 of every line, numbered as the parser numbers lines."""
    return [{'line': i, 'sha256': sha(line.encode())} for i, line in enumerate(source_lines(text), 1)]


def frozen_line_inventory(source, frozen):
    """Every line inserted or changed relative to the frozen validator, and every frozen line deleted or replaced.

    The lines are aligned with difflib over the pinned lines; 'inserted' and
    'changed' records carry the current line number, 'deleted' and 'replaced'
    the frozen one. Each needs a reviewed record (round 12, CA2-C12-N01).
    """
    lines, pinned = source_lines(source), source_lines(frozen)
    rows = {}
    def add(mark, line, text):
        identity = {'mark': mark, 'line': line, 'sha256': sha(text.encode()), 'text': text}
        site = 'frozen:' + sha(json.dumps(identity, sort_keys=True).encode())
        rows[site] = dict(identity, site_id=site)
    for tag, a1, a2, b1, b2 in difflib.SequenceMatcher(None, pinned, lines, autojunk=False).get_opcodes():
        if tag in ('insert', 'replace'):
            for i in range(b1, b2):
                add('inserted' if tag == 'insert' else 'changed', i + 1, lines[i])
        if tag in ('delete', 'replace'):
            for i in range(a1, a2):
                add('deleted' if tag == 'delete' else 'replaced', i + 1, pinned[i])
    return rows


def frozen_line_totals(rows):
    return {'rows': len(rows), 'by_mark': {m: sum(r['mark'] == m for r in rows)
                                           for m in ('inserted', 'changed', 'deleted', 'replaced')}}


def pin_totals(pins):
    return {'lines': len(pins), 'pins_sha256': sha(json.dumps(pins, sort_keys=True).encode()),
            'frozen_commit': FROZEN_COMMIT, 'frozen_sha256': FROZEN_SHA}


def _target_names(target):
    """(names bound, roots mutated) by an assignment or deletion target."""
    if isinstance(target, ast.Name):
        return {target.id}, set()
    if isinstance(target, (ast.Tuple, ast.List)):
        pairs = [_target_names(t) for t in target.elts]
        return set().union(*(p[0] for p in pairs)), set().union(*(p[1] for p in pairs))
    if isinstance(target, ast.Starred):
        return _target_names(target.value)
    root = target
    while isinstance(root, (ast.Attribute, ast.Subscript, ast.Starred)):
        root = root.value
    return set(), ({root.id} if isinstance(root, ast.Name) else set())


def module_statements(statements):
    """Every statement at module scope: compound bodies are entered, function and class bodies are not."""
    for n in statements:
        yield n
        if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            continue
        for field in STATEMENT_BODIES:
            for child in getattr(n, field, []):
                if isinstance(child, (ast.excepthandler, ast.match_case)):
                    yield from module_statements(child.body)
                elif isinstance(child, ast.stmt):
                    yield from module_statements([child])


def own_bindings(n):
    """(names bound, roots mutated) by one statement itself, its nested bodies excluded."""
    if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
        return {n.name}, set()
    if isinstance(n, (ast.Import, ast.ImportFrom)):
        return {(alias.asname or alias.name).split('.')[0] for alias in n.names}, set()
    targets = {ast.Assign: lambda: n.targets, ast.Delete: lambda: n.targets,
               ast.AugAssign: lambda: [n.target], ast.AnnAssign: lambda: [n.target],
               ast.For: lambda: [n.target], ast.AsyncFor: lambda: [n.target],
               ast.With: lambda: [i.optional_vars for i in n.items if i.optional_vars is not None],
               ast.AsyncWith: lambda: [i.optional_vars for i in n.items if i.optional_vars is not None]}
    bound, mutated = set(), set()
    for target in targets.get(type(n), lambda: [])():
        names, roots = _target_names(target)
        bound |= names
        mutated |= roots
    return bound, mutated


def fresh_name_problems(source, before):
    """A change may bind or mutate at module scope only names that are new (closing N02 at module scope).

    Every top-level function new since CA-SEAL, and every name bound or object
    mutated by a statement on an inserted or changed line of the module unit,
    must use a name the CA-SEAL validator never binds or reads and that is not
    a builtin. Otherwise a new definition or assignment could replace what
    unchanged August code reads, for example `def isinstance(*args): return
    True`, with no census node and no changed line in any aligned function.
    That every module name is bound exactly once is module_scope_problems().
    """
    import builtins
    tree, old_tree, units, _ = aligned_units(source, before)
    old_functions = set(top_functions(old_tree))
    used = {x.id for x in ast.walk(old_tree) if isinstance(x, ast.Name)} | set(dir(builtins)) | {
        name for n in module_statements(old_tree.body) for name in own_bindings(n)[0]}
    module = next(u for u in units if u['name'] == MODULE_UNIT)
    changed = changed_lines(module)
    new_bound, new_mutated = set(), set()
    for n in module_statements(module['roots']):
        first, last = node_span(n)
        if changed.intersection(range(first, last + 1)):
            names, roots = own_bindings(n)
            new_bound |= names
            new_mutated |= roots
    new_functions = {n.name for n in tree.body if isinstance(n, TOP_LEVEL_DEFS) and n.name not in old_functions}
    names = new_bound | new_functions
    return {'binds_a_ca_seal_or_builtin_name': sorted(n for n in names if n in used),
            'mutates_an_object_that_is_not_new': sorted(r for r in new_mutated if r in used or r not in names)}


_COMPREHENSIONS = (ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)
_NO_NAMES = (ast.expr_context, ast.boolop, ast.operator, ast.unaryop, ast.cmpop)


def scope_analysis(tree):
    """Python's name binding, scope by scope.

    Returns (bindings, parents, owner, imported): bindings[scope] counts every
    binding of each name in that scope (assignment and deletion targets,
    imports, def and class names, parameters, except and match captures; an
    assignment expression binds in the nearest enclosing scope that is not a
    comprehension); parents[scope] is the enclosing scope (the module's is
    None); owner[id(node)] is the scope a node is evaluated in; imported[scope]
    holds the names an import binds there.
    """
    bindings, parents, owner, imported = {tree: Counter()}, {tree: None}, {}, {tree: set()}

    def bind(scope, name):
        bindings[scope][name] += 1

    def open_scope(node, scope):
        parents[node], bindings[node], imported[node] = scope, Counter(), set()

    def arguments(args, outer, inner):
        owner[id(args)] = inner
        for a in args.posonlyargs + args.args + args.kwonlyargs + [x for x in (args.vararg, args.kwarg) if x]:
            owner[id(a)] = inner
            bind(inner, a.arg)
            if a.annotation is not None:
                visit(a.annotation, outer)
        for default in args.defaults + [d for d in args.kw_defaults if d is not None]:
            visit(default, outer)

    def visit(node, scope):
        if isinstance(node, _NO_NAMES):
            return
        owner[id(node)] = scope
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda)):
            if not isinstance(node, ast.Lambda):
                for x in node.decorator_list + ([node.returns] if node.returns is not None else []):
                    visit(x, scope)
                bind(scope, node.name)
            open_scope(node, scope)
            arguments(node.args, scope, node)
            for x in (node.body if isinstance(node.body, list) else [node.body]):
                visit(x, node)
            return
        if isinstance(node, ast.ClassDef):
            for x in node.decorator_list + node.bases + node.keywords:
                visit(x, scope)
            bind(scope, node.name)
            open_scope(node, scope)
            for x in node.body:
                visit(x, node)
            return
        if isinstance(node, _COMPREHENSIONS):
            open_scope(node, scope)
            for i, generator in enumerate(node.generators):
                visit(generator.iter, scope if i == 0 else node)
                owner[id(generator)] = node
                visit(generator.target, node)
                for test in generator.ifs:
                    visit(test, node)
            for field in ('elt', 'key', 'value'):
                if getattr(node, field, None) is not None:
                    visit(getattr(node, field), node)
            return
        if isinstance(node, ast.NamedExpr):
            target = scope
            while isinstance(target, _COMPREHENSIONS):
                target = parents[target]
            owner[id(node.target)] = target
            bind(target, node.target.id)
            visit(node.value, scope)
            return
        if isinstance(node, ast.Name) and isinstance(node.ctx, (ast.Store, ast.Del)):
            bind(scope, node.id)
        elif isinstance(node, (ast.Import, ast.ImportFrom)):
            for alias in node.names:
                bind(scope, (alias.asname or alias.name).split('.')[0])
                imported[scope].add((alias.asname or alias.name).split('.')[0])
        elif isinstance(node, ast.ExceptHandler) and node.name:
            bind(scope, node.name)
        elif isinstance(node, (ast.MatchAs, ast.MatchStar)) and node.name:
            bind(scope, node.name)
        elif isinstance(node, ast.MatchMapping) and node.rest:
            bind(scope, node.rest)
        for child in ast.iter_child_nodes(node):
            visit(child, scope)

    for statement in tree.body:
        visit(statement, tree)
    return bindings, parents, owner, imported


def resolves_to(name, scope, tree, bindings, parents):
    """The scope a name used in scope resolves to (the module for globals and builtins)."""
    if name in bindings[scope]:
        return scope
    outer = parents[scope]
    while outer is not None and outer is not tree:
        if not isinstance(outer, ast.ClassDef) and name in bindings[outer]:
            return outer
        outer = parents[outer]
    return tree


def chain_root(node):
    """The Name a value chain (attribute, item, starred, call) starts from, else None."""
    while isinstance(node, (ast.Attribute, ast.Subscript, ast.Starred, ast.Call)):
        node = node.func if isinstance(node, ast.Call) else node.value
    return node.id if isinstance(node, ast.Name) else None


def _pure_root(node):
    """The Name a pure reference chain (attribute, item, starred; no call) starts from, else None."""
    while isinstance(node, (ast.Attribute, ast.Subscript, ast.Starred)):
        node = node.value
    return node.id if isinstance(node, ast.Name) else None


NAMESPACE_BUILTINS = frozenset({'globals', 'vars', 'locals', 'setattr', 'delattr', 'exec', 'eval', 'compile',
                                '__import__', 'breakpoint'})
# Dunders CA-SEAL itself uses: __name__ and __file__ (module), super().__new__ (ExactNumber).
ALLOWED_DUNDERS = frozenset({'__name__', '__file__', '__new__'})
# Methods of the builtin list, dict and set types that never change the object.
READ_ONLY_METHODS = frozenset({'copy', 'count', 'index', 'get', 'items', 'keys', 'values', 'fromkeys',
                               'difference', 'intersection', 'isdisjoint', 'issubset', 'issuperset',
                               'symmetric_difference', 'union'})
MAIN_GUARD = ast.dump(ast.parse('if __name__ == "__main__":\n    raise SystemExit(main())\n').body[0])


def module_scope_problems(tree):
    """Module names are bound once, and module objects are written only by their one binding (round 12).

    - bound_more_than_once: every module-level name, CA-SEAL names included, has
      exactly one binding (a deletion counts), so the checker, the corpus and a
      script run all read the same definition (CA2-C12-B01).
    - shadows_a_builtin: no module name hides a builtin.
    - not_a_declaration: the module body only declares: a leading docstring,
      imports (never `import *`), assignments to plain names, function
      definitions, and CA-SEAL's main guard as the last statement. A class
      body, a module-level loop, an attribute or item write (directly or
      through an alias) and a statement after the main guard are refused.
    - writes_a_module_object: inside any function, lambda, class or
      comprehension, an attribute or item write or deletion whose chain starts
      at a module name, a builtin, an imported module, a call result, or a
      local alias of any of these (CA2-C12-N02).
    - mutates_a_module_container: an attribute of a module-level list, dict or
      set (or of an alias or element of one) other than a read-only method.
    - reflection: the namespace builtins (globals, vars, locals, setattr,
      delattr, exec, eval, compile, __import__, breakpoint) and every dunder
      name or attribute except those CA-SEAL uses (__name__, __file__,
      __new__).
    """
    import builtins
    bindings, parents, owner, imported = scope_analysis(tree)
    module = bindings[tree]
    problems = {'bound_more_than_once': sorted(n for n, c in module.items() if c != 1),
                'shadows_a_builtin': sorted(n for n in module if n in dir(builtins))}
    refused = []
    for index, n in enumerate(tree.body):
        ok = (isinstance(n, ast.Import) or isinstance(n, ast.FunctionDef)
              or (isinstance(n, ast.ImportFrom) and all(a.name != '*' for a in n.names))
              or (isinstance(n, ast.Assign) and all(isinstance(t, ast.Name) for t in n.targets))
              or (index == 0 and isinstance(n, ast.Expr) and isinstance(n.value, ast.Constant)
                  and isinstance(n.value.value, str))
              or (index == len(tree.body) - 1 and ast.dump(n) == MAIN_GUARD))
        if not ok:
            refused.append(type(n).__name__ + '@' + str(n.lineno))
    problems['not_a_declaration'] = refused

    containers = set()
    def container(value):
        if isinstance(value, (ast.List, ast.Set, ast.Dict, ast.ListComp, ast.SetComp, ast.DictComp)):
            return True
        if isinstance(value, ast.BinOp):
            return container(value.left) or container(value.right)
        if isinstance(value, ast.Name):
            return value.id in containers
        return (isinstance(value, ast.Call) and isinstance(value.func, ast.Name)
                and value.func.id in ('list', 'dict', 'set', 'bytearray'))
    for n in tree.body:
        if isinstance(n, ast.Assign) and container(n.value):
            containers.update(t.id for t in n.targets if isinstance(t, ast.Name))

    # Local aliases: a name bound, in its own scope, to a reference chain (or an
    # element of one, through for, comprehension, with and parameter defaults)
    # that starts at a module object or another alias. alias[scope][name] is the
    # module name it ultimately refers to (None for a call result or import).
    alias = {scope: {} for scope in bindings}
    def origin(value):
        """Whether a value is a reference into a module object, and which module name it starts at.

        A display, conditional or Boolean expression refers wherever one of its
        parts does: `for e in [X]` and `y = X or []` alias X.
        """
        parts = (value.elts if isinstance(value, (ast.List, ast.Tuple, ast.Set))
                 else value.values if isinstance(value, (ast.Dict, ast.BoolOp))
                 else [value.body, value.orelse] if isinstance(value, ast.IfExp)
                 else [value.value] if isinstance(value, ast.NamedExpr) else None)
        if parts is not None:
            found = [origin(part) for part in parts if part is not None]
            return next((f for f in found if f[0]), (False, None))
        root = _pure_root(value)
        scope = owner.get(id(value))
        if root is None or scope is None:
            return False, None
        home = resolves_to(root, scope, tree, bindings, parents)
        if home is tree:
            return True, root
        if root in imported[home]:
            return True, None
        if root in alias[home]:
            return True, alias[home][root]
        return False, None
    def stores(target):
        return [(x.id, owner[id(x)]) for x in ast.walk(target)
                if isinstance(x, ast.Name) and isinstance(x.ctx, ast.Store) and id(x) in owner]
    sources = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign):
            sources += [(node.value, stores(t)) for t in node.targets]
        elif isinstance(node, ast.AnnAssign) and node.value is not None:
            sources.append((node.value, stores(node.target)))
        elif isinstance(node, ast.NamedExpr) and id(node.target) in owner:
            sources.append((node.value, [(node.target.id, owner[id(node.target)])]))
        elif isinstance(node, (ast.For, ast.AsyncFor, ast.comprehension)):
            sources.append((node.iter, stores(node.target)))
        elif isinstance(node, (ast.With, ast.AsyncWith)):
            sources += [(i.context_expr, stores(i.optional_vars)) for i in node.items if i.optional_vars]
        elif isinstance(node, ast.arguments) and id(node) in owner:
            positional = node.posonlyargs + node.args
            pairs = list(zip(positional[len(positional) - len(node.defaults):], node.defaults)) + [
                (a, d) for a, d in zip(node.kwonlyargs, node.kw_defaults) if d is not None]
            sources += [(d, [(a.arg, owner[id(node)])]) for a, d in pairs]
    grew = True
    while grew:
        grew = False
        for value, targets in sources:
            refers, name = origin(value)
            if not refers:
                continue
            for local, scope in targets:
                if scope is not tree and local not in alias[scope]:
                    alias[scope][local] = name
                    grew = True

    writes, mutations, reflection = [], [], []
    for node in ast.walk(tree):
        scope = owner.get(id(node))
        if scope is None:
            continue
        if isinstance(node, (ast.Attribute, ast.Subscript)) and isinstance(node.ctx, (ast.Store, ast.Del)):
            root = chain_root(node.value)
            home = resolves_to(root, scope, tree, bindings, parents) if root is not None else None
            if root is None or home is tree or root in imported[home] or root in alias[home]:
                writes.append(str(root) + '@' + str(node.lineno))
        if isinstance(node, ast.Attribute) and node.attr not in READ_ONLY_METHODS:
            root = _pure_root(node.value)
            if root is not None:
                home = resolves_to(root, scope, tree, bindings, parents)
                target = root if home is tree else alias[home].get(root)
                if target in containers:
                    mutations.append(root + '.' + node.attr + '@' + str(node.lineno))
        name = node.id if isinstance(node, ast.Name) else node.attr if isinstance(node, ast.Attribute) else None
        if name is not None and ((name.startswith('__') and name.endswith('__') and name not in ALLOWED_DUNDERS)
                                 or (isinstance(node, ast.Name) and name in NAMESPACE_BUILTINS
                                     and resolves_to(name, scope, tree, bindings, parents) is tree)):
            reflection.append(name + '@' + str(node.lineno))
    problems.update(writes_a_module_object=sorted(set(writes)), mutates_a_module_container=sorted(set(mutations)),
                    reflection=sorted(set(reflection)))
    return problems


def binding_problems(source, before):
    """module_scope_problems(), then fresh_name_problems() once every top-level name has one binding."""
    tree = ast.parse(source)
    problems = module_scope_problems(tree)
    if all(c == 1 for c in Counter(n.name for n in tree.body if isinstance(n, TOP_LEVEL_DEFS)).values()):
        problems.update(fresh_name_problems(source, before))
    else:
        problems.update(binds_a_ca_seal_or_builtin_name=[], mutates_an_object_that_is_not_new=[])
    return problems


OPERATOR_BASES = (ast.boolop, ast.operator, ast.unaryop, ast.cmpop)


def census_totals(source, before):
    """Operator census: every operator occurrence in the touched functions, by parent node.

    A truth-carrying operator must sit in a node that anchors a census row
    ('carried_by_census_row'); 'unanchored' counts the occurrences that do not (the coverage test
    requires zero). Whole-validator occurrences are given for context.
    """
    tree = ast.parse(source)
    previous = top_functions(ast.parse(before))
    touched = [n for n in top_functions(tree).values()
               if n.name not in previous or ast.dump(previous[n.name]) != ast.dump(n)]
    def operators(node):
        if isinstance(node, (ast.BinOp, ast.AugAssign, ast.UnaryOp, ast.BoolOp)):
            return [node.op]
        return list(node.ops) if isinstance(node, ast.Compare) else []
    census = {}
    for fn in touched:
        anchors = {id(a) for a, _, _ in supplement_nodes(fn)}
        for n in ast.walk(fn):
            for op in operators(n):
                entry = census.setdefault(type(op).__name__, {'category': category(type(op).__name__),
                                                              'occurrences': Counter(), 'carried': 0,
                                                              'unanchored': 0})
                entry['occurrences'][type(n).__name__] += 1
                if entry['category'] == TRUTH:
                    entry['carried' if id(n) in anchors else 'unanchored'] += 1
    whole = {}
    for n in ast.walk(tree):
        for op in operators(n):
            whole.setdefault(type(op).__name__, Counter())[type(n).__name__] += 1
    every = {name for name in AST_CLASSES if isinstance(getattr(ast, name, None), type) and getattr(ast, name) not in
             OPERATOR_BASES and issubclass(getattr(ast, name), OPERATOR_BASES)}
    names = sorted(every | set(census) | set(whole))
    return {name: {'category': category(name),
                   'touched_functions': dict(sorted(census.get(name, {}).get('occurrences', Counter()).items())),
                   'carried_by_census_row': census.get(name, {}).get('carried', 0),
                   'unanchored': census.get(name, {}).get('unanchored', 0),
                   'validator': dict(sorted(whole.get(name, Counter()).items()))} for name in names}


def check_coverage(repo, test_names):
    before = subprocess.check_output(['git', '-C', str(repo), 'show', SEAL_BASE + ':' + REL]).decode()
    validate_coverage((repo / REL).read_bytes(), before,
                      json.loads((repo / COVERAGE).read_bytes()), test_names, frozen=frozen_source(repo))


@lru_cache(maxsize=16)
def coverage_model(source, before):
    # Cache only immutable source text. Mutable bytes/table are read and checked
    # on every invocation; changed sources obtain a separately regenerated model.
    actual = predicate_sites(source, before)
    supplement, touched = predicate_supplement(source, before, actual)
    previous, _ = predicate_supplement(before, '', [])
    counterparts, occurrence_totals = occurrence_map(source, before)
    previous_nodes = {r['site_id']: r for r in previous}
    assert set(counterparts.values()) <= set(previous_nodes), 'occurrence map names no historical node'
    return ({r['site_id']: r for r in actual + supplement}, touched, previous_nodes,
            counterparts, occurrence_totals, changed_line_inventory(source, before),
            historical_line_inventory(source, before), census_totals(source, before))


def changed_line_totals(rows):
    return {'rows': len(rows), 'by_unit': dict(sorted(Counter(r['function'] for r in rows).items())),
            'by_class': dict(sorted(Counter(r['node_class'] for r in rows).items())),
            'by_outcome': dict(sorted(Counter(r['outcome'] for r in rows).items()))}


def historical_line_totals(rows):
    return {'rows': len(rows), 'by_mark': {m: sum(r['mark'] == m for r in rows)
                                           for m in ('deleted', 'replaced', 'function removed')}}


def refresh_totals(table, raw, before):
    """Recompute every recorded count and digest the coverage test checks, from the table's own rows."""
    expected, touched, _, _, occurrence_totals, _, _, census = coverage_model(raw.decode(), before)
    _, partition = node_model(raw.decode(), before)
    rows = table['sites'] + table['supplement']
    table['touched_functions'] = touched
    table['validator_sha256'] = sha(raw)
    table['ast_classes'] = ast_class_summary()
    table['totals'].update(
        walker_sites=len(table['sites']),
        supplement_rows=sum(s.startswith('supplement:') for s in expected), combined_sites=len(expected),
        outcomes=dict(Counter(r['outcome'] for r in rows)),
        node_types=dict(Counter(r['node_type'] for r in table['supplement'])),
        node_outcomes=dict(Counter(r['outcome'] for r in table['supplement'])),
        occurrence_map=dict(occurrence_totals, preserved_rows_matched=sum(r['outcome'] == PRESERVED for r in rows)),
        changed_line_nodes=changed_line_totals(table['changed_line_nodes']),
        historical_lines=historical_line_totals(table['historical_lines']), census=census,
        nodes=node_totals(table['nodes']), node_partition=partition_totals(partition),
        frozen_lines=frozen_line_totals(table['frozen_lines']), line_pins=pin_totals(table['line_pins']))
    return table


def partition_totals(partition):
    return {k: v for k, v in partition.items() if k != 'problems'}


def preservation_problems(rows, counterparts):
    """Preservation is computed, not asserted: each claim must be its node's mapped occurrence."""
    preserved = [row for row in rows if row['outcome'] == 'preserved August predicate']
    claims = Counter(row.get('baseline_site_id') for row in preserved)
    return {'not_an_unchanged_occurrence': sorted(r['site_id'] for r in preserved if r['site_id'] not in counterparts),
            'claims_another_occurrence': sorted(r['site_id'] for r in preserved if r['site_id'] in counterparts
                                                and r.get('baseline_site_id') != counterparts[r['site_id']]),
            'occurrence_claimed_twice': sorted(str(b) for b, n in claims.items() if n > 1)}


def _group_check(rows, expected, label, identity_fields, outcome=True):
    """Every expected identity has exactly one row and every row an expected identity, with its reviewed reason."""
    recorded = {row['site_id']: row for row in rows}
    assert len(recorded) == len(rows), 'duplicate ' + label
    missing, stale = set(expected) - set(recorded), set(recorded) - set(expected)
    assert not missing and not stale, (label + ' missing=' + repr(sorted(missing)) + ' stale=' + repr(sorted(stale)))
    for site, identity in expected.items():
        row = recorded[site]
        assert all(row.get(k) == identity[k] for k in identity_fields), ('changed ' + label, site)
        if outcome:
            assert row.get('outcome') == identity['required_outcome'], (label + ' outcome', site, row.get('outcome'))
        assert isinstance(row.get('reason'), str) and row['reason'].strip(), ('missing ' + label + ' reason', site)


def validate_coverage(raw, before, table, test_names, ast_classes=None, frozen=None):
    try:
        source = raw.decode()
        tree = ast.parse(source)
    except (UnicodeDecodeError, SyntaxError, ValueError) as exc:
        raise AssertionError('validator does not parse: ' + type(exc).__name__ + ': ' + str(exc))
    # The class table closes the census: an unlisted class, a truth-carrying
    # class without a census mechanism, or a refused class in V fails first.
    classes = ast_class_problems(tree, ast_classes)
    assert not any(classes.values()), 'ast class table ' + json.dumps(classes, sort_keys=True)
    assert table['ast_classes'] == ast_class_summary(ast_classes), 'changed ast class table summary'
    # Round 12 (CA2-C12-B01, N02): every module name has one binding, the one
    # the checker reads and the script runs, and module objects are written
    # only by it. Nothing in the table can waive this.
    bindings = binding_problems(source, before)
    assert not any(bindings.values()), 'module-level binding refused ' + json.dumps(bindings, sort_keys=True)
    # Round 12 (CA2-C12-N01): the table pins every line of the frozen
    # validator, and every line inserted, changed, deleted or replaced relative
    # to it needs a reviewed record. An edit with the table unchanged stops here.
    frozen = frozen_source() if frozen is None else frozen
    assert table['line_pins'] == line_pins(frozen), 'line pins are not the frozen validator'
    _group_check(table['frozen_lines'], frozen_line_inventory(source, frozen), 'frozen lines', FROZEN_IDENTITY,
                 outcome=False)
    (expected, touched, previous_nodes, counterparts, occurrence_totals,
     changed, historical, census) = coverage_model(source, before)
    assert table['touched_functions'] == touched, 'changed touched-function inventory'
    rows = table['sites'] + table['supplement']
    recorded = {row['site_id']: row for row in rows}
    assert len(recorded) == len(rows), 'duplicate coverage site'
    missing, stale = set(expected) - set(recorded), set(recorded) - set(expected)
    assert not missing and not stale, ('coverage sites missing=' + repr(sorted(missing))
                                       + ' stale=' + repr(sorted(stale)))
    for site, identity in expected.items():
        row = recorded[site]
        assert all(row.get(k) == value for k, value in identity.items()), ('changed site', site)
        assert row['evidence'], ('missing evidence', site)
        if row['outcome'] == 'killed by':
            assert row['killed_by'] and set(row['killed_by']) <= test_names, ('unknown test', site)
            assert row['cut'], ('missing narrow cut', site)
        else:
            assert row['outcome'] in {'same-predicate duplicate', 'implied', 'frozen-input only',
                                      'structural', 'non-predicate data operation', 'preserved August predicate'}
            assert row['reason'], ('missing survivor explanation', site)
            if row['outcome'] == 'non-predicate data operation':
                assert row['data_flow'], ('missing data-flow evidence', site)
            if row['outcome'] == 'preserved August predicate':
                assert row['baseline_expression'] == row['expression']
                baseline = previous_nodes[row['baseline_site_id']]
                assert baseline['line'] == row['baseline_line']
                assert all(baseline[k] == row[k] for k in ('function', 'column', 'expression', 'node_type')), site
    # Expression equality above is necessary but not sufficient: the claimed
    # baseline must be the computed counterpart of this very node, once.
    problems = preservation_problems(rows, counterparts)
    assert not any(problems.values()), 'preserved occurrence mismatch ' + json.dumps(problems, sort_keys=True)
    assert table['totals']['occurrence_map'] == dict(
        occurrence_totals, preserved_rows_matched=sum(r['outcome'] == 'preserved August predicate' for r in rows)), \
        'changed occurrence-map totals'
    # N02, option A: every node on an inserted or changed line of a unit has a
    # row (round 12: every node of a function new since CA-SEAL), and every
    # CA-SEAL line without a counterpart a reason.
    refused = sorted(s for s, r in changed.items() if r['required_outcome'] == REFUSED)
    assert not refused, 'truth-carrying node on a changed line without a census row ' + repr(refused)
    changed_rows = {row['site_id']: row for row in table['changed_line_nodes']}
    assert len(changed_rows) == len(table['changed_line_nodes']), 'duplicate changed-line row'
    missing, stale = set(changed) - set(changed_rows), set(changed_rows) - set(changed)
    assert not missing and not stale, ('changed-line nodes missing=' + repr(sorted(missing))
                                       + ' stale=' + repr(sorted(stale)))
    for site, identity in changed.items():
        row = changed_rows[site]
        assert all(row.get(k) == identity[k] for k in CHANGED_IDENTITY), ('changed changed-line row', site)
        assert row['outcome'] == identity['required_outcome'], ('changed-line outcome', site, row['outcome'])
        assert isinstance(row.get('reason'), str) and row['reason'].strip(), ('missing changed-line reason', site)
    historical_rows = {row['site_id']: row for row in table['historical_lines']}
    assert len(historical_rows) == len(table['historical_lines']), 'duplicate historical-line record'
    missing, stale = set(historical) - set(historical_rows), set(historical_rows) - set(historical)
    assert not missing and not stale, ('historical lines missing=' + repr(sorted(missing))
                                       + ' stale=' + repr(sorted(stale)))
    for site, identity in historical.items():
        row = historical_rows[site]
        assert all(row.get(k) == identity[k] for k in HISTORICAL_IDENTITY), ('changed historical record', site)
        assert isinstance(row.get('reason'), str) and row['reason'].strip(), ('missing historical reason', site)
    # Round 12 (CA2-C12-B02): the table is total. Census rows, changed-line
    # rows and node rows partition every positioned node of V, and every other
    # node is of a class recorded inside a positioned row.
    nodes, partition = node_model(source, before)
    assert not any(partition['problems'].values()), 'node partition ' + json.dumps(partition['problems'], sort_keys=True)
    refused = sorted(s for s, r in nodes.items() if r['required_outcome'] == REFUSED)
    assert not refused, 'truth-carrying node without a census row ' + repr(refused)
    _group_check(table['nodes'], nodes, 'node rows', NODE_IDENTITY)
    unanchored = {op: c['unanchored'] for op, c in census.items() if c['unanchored']}
    assert not unanchored, ('truth-carrying operator without a census row', unanchored)
    assert table['totals']['census'] == census, 'changed operator census totals'
    assert table['totals']['changed_line_nodes'] == changed_line_totals(table['changed_line_nodes'])
    assert table['totals']['historical_lines'] == historical_line_totals(table['historical_lines'])
    assert table['totals']['nodes'] == node_totals(table['nodes']), 'changed node totals'
    assert table['totals']['node_partition'] == partition_totals(partition), 'changed node partition totals'
    assert table['totals']['frozen_lines'] == frozen_line_totals(table['frozen_lines']), 'changed frozen-line totals'
    assert table['totals']['line_pins'] == pin_totals(table['line_pins']), 'changed line-pin totals'
    assert len(table['prior_survivors']) == 84
    assert table['validator_sha256'] == sha(raw), 'validator is not frozen'
    assert table['totals']['walker_sites'] == len(table['sites'])
    assert table['totals']['supplement_rows'] == sum(r['site_id'].startswith('supplement:') for r in expected.values())
    assert table['totals']['combined_sites'] == len(expected)
    outcomes = {outcome: sum(r['outcome'] == outcome for r in rows) for outcome in {r['outcome'] for r in rows}}
    assert table['totals']['outcomes'] == outcomes
    assert table['totals']['node_types'] == dict(Counter(r['node_type'] for r in table['supplement']))
    assert table['totals']['node_outcomes'] == dict(Counter(r['outcome'] for r in table['supplement']))
    assert table['totals']['unclassified'] == 0


def check_insertion_probe(repo, test_names, statement, return_function):
    raw = (repo / REL).read_bytes()
    before = subprocess.check_output(['git', '-C', str(repo), 'show', SEAL_BASE + ':' + REL]).decode()
    return insertion_probe(raw, before, (repo / COVERAGE).read_bytes(),
                           frozenset(test_names), statement, return_function, frozen_source(repo))


@lru_cache(maxsize=16)
def insertion_probe(raw, before, table_raw, test_names, statement, return_function, frozen=None):
    source = raw.decode().replace('\r\n', '\n')
    # CA2-C12-N05: the one binding, the same definition the census reads.
    fn = top_functions(ast.parse(source))[return_function]
    line = next(n.lineno for n in fn.body if isinstance(n, ast.Return))
    lines = source_lines(source)
    lines.insert(line - 1, '    ' + statement)
    altered = '\n'.join(lines)
    table = json.loads(table_raw)
    # Rebase existing byte/line metadata only. No new row, classification or
    # outcome is supplied for the inserted nodes.
    rebase_lines(table, lambda n: n + 1 if n >= line else n)
    altered_raw = altered.replace('\n', '\r\n').encode() if b'\r\n' in raw else altered.encode()
    table['validator_sha256'] = sha(altered_raw)
    # Round 12: only the inserted line's frozen-line record is supplied, since
    # that check runs first; the census stays the rule under test.
    frozen = frozen_source() if frozen is None else frozen
    forge_records(altered_raw, before, table, 'insertion', groups=('frozen_lines',), frozen=frozen)
    walker = predicate_sites(altered, before)
    supplement, _ = predicate_supplement(altered, before, walker)
    recorded = {r['site_id'] for r in table['sites'] + table['supplement']}
    missing = {r['site_id'] for r in walker + supplement} - recorded
    inserted = [r for r in supplement if r['line'] == line]
    assert inserted and all(r['site_id'] in missing for r in inserted), inserted
    try:
        validate_coverage(altered_raw, before, table, test_names, frozen=frozen)
    except AssertionError as exc:
        assert 'coverage sites missing=' in str(exc) and str(sorted(missing)) in str(exc), str(exc)
    else:
        raise AssertionError('unlisted insertion passed coverage')
    return missing


def rebase_lines(table, move):
    """Carry every row's current-line metadata through move(line) -> new line or None; drop rows that vanish.

    Site ids are recomputed from the moved identity. CA-SEAL baseline lines and
    historical-line records refer to CA-SEAL and never move.
    """
    for group in ('sites', 'supplement'):
        kept = []
        for row in table[group]:
            if 'line' in row:
                line = move(row['line'])
                if line is None:
                    continue
                row['line'] = line
                identity = {k: row[k] for k in ('function', 'line', 'column', 'expression', 'kind')}
                row['site_id'] = row['site_id'].split(':')[0] + ':' + sha(json.dumps(identity, sort_keys=True).encode())
            kept.append(row)
        table[group] = kept
    kept = []
    for row in table['changed_line_nodes']:
        first, last = move(row['line']), move(row['end_line'])
        if first is None or last is None:
            continue
        row['line'], row['end_line'] = first, last
        row['site_id'] = 'changed:' + sha(json.dumps({k: row[k] for k in CHANGED_IDENTITY}, sort_keys=True).encode())
        kept.append(row)
    table['changed_line_nodes'] = kept
    # Round 12: node rows move like changed-line rows (their CA-SEAL line
    # stays); frozen-line records of current lines move, those of frozen lines
    # and the line pins themselves (frozen lines) never do.
    kept = []
    for row in table.get('nodes', []):
        first, last = move(row['line']), move(row['end_line'])
        if first is None or last is None:
            continue
        row['line'], row['end_line'] = first, last
        row['site_id'] = 'node:' + sha(json.dumps({k: row[k] for k in NODE_IDENTITY}, sort_keys=True).encode())
        kept.append(row)
    table['nodes'] = kept
    kept = []
    for row in table.get('frozen_lines', []):
        if row['mark'] in ('inserted', 'changed'):
            line = move(row['line'])
            if line is None:
                continue
            row['line'] = line
            row['site_id'] = 'frozen:' + sha(json.dumps({k: row[k] for k in FROZEN_IDENTITY}, sort_keys=True).encode())
        kept.append(row)
    table['frozen_lines'] = kept
    return table


PRESERVED = 'preserved August predicate'
PRESERVATION_PROBES = ('rebinding_inserted_call', 'inserted_sole_claim', 'duplicate_claim',
                       'changed_occurrence', 'changed_enclosing_header')


def forged_preservation(raw, before, table_raw, label, frozen=None):
    """Scratch edit of V plus a forged table that satisfies the round-9 preservation rule.

    Existing rows are rebased onto the edited source as the insertion probes do.
    A new identity at the position of a vanished one takes over that row; a
    preserved row there becomes 'implied', because round 9 already refused a
    changed expression. Any other new node copies the preserved row whose
    function, column, expression and node type it shares: the recheck's
    rebinding. Other new nodes and new walker identities get a forged 'implied'
    row, which round 9 also accepted. Changed-line rows and historical-line
    records are forged and every count is regenerated, so only the occurrence
    check can refuse the result. Returns
    (edited bytes, forged table, preservation problems the refusal must name).
    """
    source = raw.decode().replace('\r\n', '\n')
    lines = source_lines(source)
    functions = top_functions(ast.parse(source))
    table = json.loads(table_raw)
    def preserved(function, expression, node_type, column=None):
        return sorted((r for r in table['supplement'] if r['outcome'] == PRESERVED and r['function'] == function
                       and r['expression'] == expression and r['node_type'] == node_type
                       and column in (None, r['column'])), key=lambda r: r['line'])
    def line_of(function, text):
        fn = functions[function]
        return next(i for i in range(fn.lineno, fn.end_lineno + 1) if lines[i - 1].strip() == text)
    shifted, claim, expect = None, None, {}
    if label in ('rebinding_inserted_call', 'inserted_sole_claim'):
        # The recheck's witness: an inserted call labelled with V:220's baseline.
        fn = functions['multi_family_receipt_state']
        shifted = next(n.lineno for n in fn.body if isinstance(n, ast.Return))
        lines.insert(shifted - 1, '    probe = isinstance(receipt, dict)')
        original, = preserved('multi_family_receipt_state', 'isinstance(receipt, dict)', 'Call', 12)
        at = ast.Name(id='probe', lineno=shifted, col_offset=12)
        inserted = supplement_identity('multi_family_receipt_state', at, 'isinstance(receipt, dict)', 'Call')
        expect['not_an_unchanged_occurrence'] = [inserted['site_id']]
        if label == 'rebinding_inserted_call':
            expect['occurrence_claimed_twice'] = [original['baseline_site_id']]
        else:
            # The inserted node holds the only claim; the inherited row is relabelled.
            def claim(table, site=original['site_id']):
                row = next(r for r in table['supplement'] if r['site_id'] == site)
                for key in [k for k in row if k.startswith('baseline_')]:
                    del row[key]
                row.update(outcome='implied', reason='Forged probe row.')
            expect['occurrence_claimed_twice'] = []
    elif label == 'duplicate_claim':
        # No source edit: a second inherited occurrence claims the first one's baseline.
        first, second = preserved('main', 'isinstance(pins, str)', 'Call')[:2]
        def claim(table, first=first, second=second):
            row = next(r for r in table['supplement'] if r['site_id'] == second['site_id'])
            row.update(baseline_site_id=first['baseline_site_id'], baseline_line=first['baseline_line'],
                       evidence=copy.deepcopy(first['evidence']))
        expect['occurrence_claimed_twice'] = [first['baseline_site_id']]
        expect['claims_another_occurrence'] = [second['site_id']]
    elif label == 'changed_occurrence':
        # V:218 edited in place: the preserved call keeps line, column and text.
        line = line_of('multi_family_receipt_state', 'lander = receipt.get("lander_task") if isinstance(receipt, dict) else None')
        lines[line - 1] = lines[line - 1].replace('else None', 'else "x!"')
        kept, = [r for r in preserved('multi_family_receipt_state', 'isinstance(receipt, dict)', 'Call') if r['line'] == line]
        expect['not_an_unchanged_occurrence'] = [kept['site_id']]
    elif label == 'changed_enclosing_header':
        # V:1122's guard inverted in place: its unchanged body now runs on the opposite branch.
        line = line_of('main', 'if failures:')
        lines[line - 1] = lines[line - 1].replace('if failures:', 'if not failures:')
        body = next(n for n in ast.walk(functions['main']) if isinstance(n, ast.If) and n.lineno == line)
        expect['not_an_unchanged_occurrence'] = sorted(
            r['site_id'] for r in table['supplement'] if r['outcome'] == PRESERVED and r['function'] == 'main'
            and line < r['line'] <= body.end_lineno)
        assert expect['not_an_unchanged_occurrence']
    else:
        raise ValueError('unknown preservation probe ' + label)
    altered = '\n'.join(lines)
    rebase_lines(table, lambda n: n + 1 if shifted is not None and n >= shifted else n)
    walker = predicate_sites(altered, before)
    supplement, _ = predicate_supplement(altered, before, walker)
    expected = {r['site_id'] for r in walker + supplement}
    vanished = [r for r in table['supplement'] if r['site_id'] not in expected]
    recorded = {r['site_id'] for r in table['sites'] + table['supplement']}
    table['sites'] = [r for r in table['sites'] if r['site_id'] in expected] + [
        dict(r, outcome='implied', reason='Forged probe row.', evidence=[{'probe': label}])
        for r in walker if r['site_id'] not in recorded]
    added = []
    for identity in (r for r in supplement if r['site_id'] not in recorded):
        donor = next((r for r in vanished if all(r[k] == identity[k] for k in ('function', 'line', 'column', 'node_type'))), None)
        if donor is None:
            donor = next(iter(preserved(identity['function'], identity['expression'], identity['node_type'],
                                        identity['column'])), None)
        if donor is None:
            added.append(dict(identity, outcome='implied', reason='Forged probe row.', evidence=[{'probe': label}]))
            continue
        row = dict(copy.deepcopy(donor), **identity)
        if donor in vanished and row['outcome'] == PRESERVED:
            for key in [k for k in row if k.startswith('baseline_')]:
                del row[key]
            row.update(outcome='implied', reason='Forged probe row.')
        added.append(row)
    table['supplement'] = [r for r in table['supplement'] if r['site_id'] in expected] + added
    if claim:
        claim(table)
    altered_raw = altered.replace('\n', '\r\n').encode() if b'\r\n' in raw else altered.encode()
    # Round 11: the changed-line rows and historical-line records the edit
    # needs are forged too, so the occurrence check is still the only refusal.
    forge_records(altered_raw, before, table, label, frozen=frozen)
    refresh_totals(table, altered_raw, before)
    return altered_raw, table, expect


def check_preservation_probe(repo, test_names, label):
    raw = (repo / REL).read_bytes()
    before = subprocess.check_output(['git', '-C', str(repo), 'show', SEAL_BASE + ':' + REL]).decode()
    return preservation_probe(raw, before, (repo / COVERAGE).read_bytes(), frozenset(test_names), label,
                              frozen_source(repo))


def preservation_probe(raw, before, table_raw, test_names, label, frozen=None):
    frozen = frozen_source() if frozen is None else frozen
    altered_raw, table, expect = forged_preservation(raw, before, table_raw, label, frozen)
    prefix = 'preserved occurrence mismatch '
    try:
        validate_coverage(altered_raw, before, table, test_names, frozen=frozen)
    except AssertionError as exc:
        assert str(exc).startswith(prefix), str(exc)
        problems = json.loads(str(exc)[len(prefix):])
    else:
        raise AssertionError('forged preservation passed coverage: ' + label)
    for key, sites in expect.items():
        assert set(sites) <= set(problems[key]) and (sites or not problems[key]), (label, key, problems)
    return problems


FORGED = 'Forged probe row.'


RECORD_GROUPS = ('changed_line_nodes', 'historical_lines', 'nodes', 'frozen_lines')


def forge_records(raw, before, table, label, groups=RECORD_GROUPS, omit=(), frozen=None):
    """Forge what an edit needs in the record groups: a row for every missing identity, stale rows dropped.

    A forged changed-line or node row takes the outcome its class requires
    (data for a refused node, which the coverage test refuses before it reads
    any row). Identities in omit are left missing.
    """
    source = raw.decode()
    _, _, _, _, _, changed, historical, _ = coverage_model(source, before)
    expected_by_group = {'changed_line_nodes': lambda: changed, 'historical_lines': lambda: historical,
                         'nodes': lambda: node_model(source, before)[0],
                         'frozen_lines': lambda: frozen_line_inventory(
                             source, frozen_source() if frozen is None else frozen)}
    for group in RECORD_GROUPS:
        if group not in groups:
            continue
        expected = expected_by_group[group]()
        kept = [r for r in table[group] if r['site_id'] in expected]
        recorded = {r['site_id'] for r in kept}
        for site, identity in expected.items():
            if site in recorded or site in omit:
                continue
            row = {k: v for k, v in identity.items() if k != 'required_outcome'}
            if 'required_outcome' in identity:
                row['outcome'] = identity['required_outcome'] if identity['required_outcome'] != REFUSED else DATA
            kept.append(dict(row, reason=FORGED))
        table[group] = kept
    return table


def forge_census(raw, before, table, label, omit=()):
    """Forge the walker and census rows an edit needs (identities in omit left missing), and repair every
    preservation claim the map now refuses."""
    expected, _, previous_nodes, counterparts, _, _, _, _ = coverage_model(raw.decode(), before)
    recorded = {r['site_id'] for r in table['sites'] + table['supplement']}
    for group, prefixes in (('sites', ('syntax:', 'semantic:')), ('supplement', ('supplement:',))):
        table[group] = [r for r in table[group] if r['site_id'] in expected] + [
            dict(identity, outcome='implied', reason=FORGED, evidence=[{'probe': label}])
            for site, identity in expected.items() if site.startswith(prefixes) and site not in recorded
            and site not in omit]
    for row in table['supplement']:
        if row['outcome'] != PRESERVED or counterparts.get(row['site_id']) == row.get('baseline_site_id'):
            continue
        if row['site_id'] in counterparts:
            baseline = previous_nodes[counterparts[row['site_id']]]
            row.update(baseline_site_id=baseline['site_id'], baseline_line=baseline['line'])
        else:
            for key in [k for k in row if k.startswith('baseline_')]:
                del row[key]
            row.update(outcome='implied', reason=FORGED)
    return table


# Edit probes (rounds 11 and 12). Each edits a scratch copy of V, rebases
# every row's line metadata through a whole-file alignment, forges every group
# except the one under test and regenerates every count, so only that group's
# rule can refuse. (label: group left unforged, expected refusal prefix,
# description.) Group 'binding' is refused before any row is read, so its
# probes forge every row; a source with a name defined twice cannot be modelled
# at all, so nothing is forged for it.
BINDING = 'module-level binding refused '
EDIT_PROBES = {
    'census_augassign_bitor': ('census', 'coverage sites missing=',
                               "recount_validation: state['complete'] |= True before the return"),
    'census_augassign_bitand': ('census', 'coverage sites missing=',
                                "recount_validation: state['complete'] &= True before the return"),
    'census_augassign_bitxor': ('census', 'coverage sites missing=',
                                "recount_validation: state['complete'] ^= True before the return"),
    'census_hidden_builder_bitor': ('census', 'coverage sites missing=', 'build_receipt: overall_pass |= '
                                    '{"review_extra": False, **named}["review_extra"] after the round-9 gate'),
    'census_hidden_builder_bitand': ('census', 'coverage sites missing=', 'build_receipt: the same with &='),
    'census_hidden_builder_bitxor': ('census', 'coverage sites missing=', 'build_receipt: the same with ^='),
    'census_arithmetic_augassign_add': ('census', 'coverage sites missing=', 'build_receipt: overall_pass += '
                                        '{"review_extra": 0, **named}["review_extra"] after the round-9 gate (N03)'),
    'census_arithmetic_unary_usub': ('census', 'coverage sites missing=',
                                     'build_receipt: overall_pass = -overall_pass after the round-9 gate (N03)'),
    'changed_truncated_input': ('changed_line_nodes', 'changed-line nodes missing=',
                                'post_august_validator_pin: anchors = anchors[:1] before the preserved guard'),
    'changed_rebound_input': ('changed_line_nodes', 'changed-line nodes missing=',
                              'main: actual_ets = expected_ets before the preserved partition comparison'),
    'changed_inserted_continue': ('changed_line_nodes', 'changed-line nodes missing=',
                                  'main: continue at the top of the partition loop'),
    'changed_module_rebinding': ('binding', BINDING,
                                 'module: POST_AUGUST_RECEIPT = MULTI_FAMILY_RECEIPT after MULTI_FAMILY_AUTHOR '
                                 '(round 12: refused as a second binding before any row is read)'),
    'changed_module_new_constant': ('changed_line_nodes', 'changed-line nodes missing=',
                                    'module: PM_RECEIPT = MULTI_FAMILY_RECEIPT after MULTI_FAMILY_AUTHOR'),
    'changed_module_truth_carrier': ('changed_line_nodes', 'truth-carrying node on a changed line without a census row ',
                                     'module: PM_PROBE = isinstance(HOME, Path) after MULTI_FAMILY_AUTHOR'),
    'changed_new_function_dict_spread': ('changed_line_nodes', 'changed-line nodes missing=',
                                         'recount_outcomes: cards = {"cards": cards, **doc}["cards"] before '
                                         'if cards: (CA2-C12-B02)'),
    'deleted_preserved_guard': ('historical_lines', 'historical lines missing=',
                                'main: the preserved if actual_ets != expected_ets block deleted in place'),
    'frozen_round9_gate_deleted': ('frozen_lines', 'frozen lines missing=',
                                   'build_receipt: the round-9 gate deleted (CA2-C12-N01)'),
    'frozen_comment_inserted': ('frozen_lines', 'frozen lines missing=',
                                'sha256_file (untouched): a comment line inserted; no node changes'),
    'nodes_untouched_function_respaced': ('nodes', 'node rows missing=',
                                          'sha256_file (untouched): one space added inside the lambda line; '
                                          'the AST stays identical, so no census or changed-line row exists'),
    'refused_class_present': ('none', 'ast class table ',
                              'recount_validation: global PM_PROBE as its first statement'),
    'fresh_module_rebinding': ('binding', BINDING,
                               'module: POST_AUGUST_RECEIPT = MULTI_FAMILY_RECEIPT, with every row forged'),
    'fresh_module_mutation': ('binding', BINDING,
                              'module: HOLDING_DECISIONS["DL-039"] = None, with every row forged'),
    'fresh_function_shadows_builtin': ('binding', BINDING,
                                       'module: def isinstance(*args): return True, with every row forged'),
    'binding_duplicate_def_build_receipt': ('binding', BINDING,
                                            'build_receipt: a weak def (gate replaced by overall_pass = True) in '
                                            'place, the honest def moved after the main guard (CA2-C12-B01)'),
    'binding_duplicate_def_admission_record_problems': ('binding', BINDING,
                                                        'admission_record_problems: a weak def returning [] padded '
                                                        'to the same lines, the honest def after the main guard'),
    'binding_evidence_fields_truncation': ('binding', BINDING,
                                           'third_change_validator_pin: EVIDENCE_FIELDS[{"pm_fields": 12, '
                                           '**receipt}["pm_fields"]:] = [], with every row forged'),
    'binding_module_alias_write': ('binding', BINDING,
                                   'module: PM_ALIAS = HOLDING_DECISIONS, then PM_ALIAS["DL-039"] = None'),
    'binding_module_class_body': ('binding', BINDING,
                                  'module: class PmC: HOLDING_DECISIONS["DL-039"] = None'),
    'binding_star_import': ('binding', BINDING, 'module: from os.path import *'),
    'binding_globals_write_new_function': ('binding', BINDING,
                                           'recount_outcomes: globals()["HOLDING_AUTHOR"] = "/root/other"'),
    'binding_alias_method_new_function': ('binding', BINDING,
                                          'recount_outcomes: fields = EVIDENCE_FIELDS, then fields.clear()'),
}
# The non-empty problem lists each binding probe must produce, and nothing
# else; None means any non-empty list (its entries carry line numbers).
BINDING_EXPECTED = {
    'changed_module_rebinding': {'binds_a_ca_seal_or_builtin_name': ['POST_AUGUST_RECEIPT'],
                                 'bound_more_than_once': ['POST_AUGUST_RECEIPT']},
    'fresh_module_rebinding': {'binds_a_ca_seal_or_builtin_name': ['POST_AUGUST_RECEIPT'],
                               'bound_more_than_once': ['POST_AUGUST_RECEIPT']},
    'fresh_module_mutation': {'mutates_an_object_that_is_not_new': ['HOLDING_DECISIONS'],
                              'not_a_declaration': None, 'writes_a_module_object': None},
    'fresh_function_shadows_builtin': {'binds_a_ca_seal_or_builtin_name': ['isinstance'],
                                       'shadows_a_builtin': ['isinstance']},
    'binding_duplicate_def_build_receipt': {'bound_more_than_once': ['build_receipt'], 'not_a_declaration': None},
    'binding_duplicate_def_admission_record_problems': {'bound_more_than_once': ['admission_record_problems'],
                                                        'not_a_declaration': None},
    'binding_evidence_fields_truncation': {'writes_a_module_object': None},
    'binding_module_alias_write': {'not_a_declaration': None, 'writes_a_module_object': None},
    'binding_module_class_body': {'not_a_declaration': None, 'writes_a_module_object': None},
    'binding_star_import': {'not_a_declaration': None},
    'binding_globals_write_new_function': {'writes_a_module_object': None, 'reflection': None},
    'binding_alias_method_new_function': {'mutates_a_module_container': None},
}
_AUG = {'bitor': '|=', 'bitand': '&=', 'bitxor': '^='}


def edit_probe_source(source, label):
    """Scratch source for one edit probe: (altered LF source, edited current lines, deleted current lines)."""
    lines = source_lines(source)
    tree = ast.parse(source)
    functions = top_functions(tree)
    def find(function, text):
        fn = functions[function]
        return next(i for i in range(fn.lineno, fn.end_lineno + 1) if lines[i - 1].strip() == text)
    def insert(line, *texts):
        return '\n'.join(lines[:line - 1] + list(texts) + lines[line - 1:]), list(range(line, line + len(texts))), []
    kind = label.rsplit('_', 1)[-1]
    if label.startswith('census_augassign_'):
        ret = next(n.lineno for n in functions['recount_validation'].body if isinstance(n, ast.Return))
        return insert(ret, "    state['complete'] " + _AUG[kind] + ' True')
    gate_end = find('build_receipt', 'and named["august_result_before_recount"].get("pass") is True)')
    if label.startswith('census_hidden_builder_'):
        return insert(gate_end + 1, '    overall_pass ' + _AUG[kind] + ' {"review_extra": False, **named}["review_extra"]')
    if label == 'census_arithmetic_augassign_add':
        return insert(gate_end + 1, '    overall_pass += {"review_extra": 0, **named}["review_extra"]')
    if label == 'census_arithmetic_unary_usub':
        return insert(gate_end + 1, '    overall_pass = -overall_pass')
    gate = next(n for n in functions['build_receipt'].body if isinstance(n, ast.Assign) and n.end_lineno == gate_end)
    if label == 'frozen_round9_gate_deleted':
        return '\n'.join(lines[:gate.lineno - 1] + lines[gate_end:]), [], list(range(gate.lineno, gate_end + 1))
    loop = find('main', 'for cat, expected_ets in independent_partition.items():')
    if label == 'changed_truncated_input':
        return insert(find('post_august_validator_pin', 'if (isinstance(receipt, dict) and isinstance(dl077, dict)'),
                      '        anchors = anchors[:1]')
    if label == 'changed_rebound_input':
        assert lines[loop + 1].strip() == 'if actual_ets != expected_ets:'
        return insert(loop + 2, '        actual_ets = expected_ets')
    if label == 'changed_inserted_continue':
        return insert(loop + 1, '        continue')
    cards = find('recount_outcomes', 'if cards:')
    if label == 'changed_new_function_dict_spread':
        return insert(cards, '    cards = {"cards": cards, **doc}["cards"]')
    if label == 'binding_globals_write_new_function':
        return insert(cards, '    globals()["HOLDING_AUTHOR"] = "/root/other"')
    if label == 'binding_alias_method_new_function':
        return insert(cards, '    fields = EVIDENCE_FIELDS', '    fields.clear()')
    if label == 'binding_evidence_fields_truncation':
        third = find('third_change_validator_pin', 'third = recount_object(REPO / MULTI_FAMILY_RECEIPT)')
        return insert(third + 1, '        EVIDENCE_FIELDS[{"pm_fields": 12, **receipt}["pm_fields"]:] = []')
    sha_file = functions['sha256_file']
    lambda_line = next(n.lineno for n in ast.walk(sha_file) if isinstance(n, ast.Lambda))
    if label == 'frozen_comment_inserted':
        indent = lines[lambda_line - 1][:len(lines[lambda_line - 1]) - len(lines[lambda_line - 1].lstrip())]
        return insert(lambda_line, indent + '# probe comment')
    if label == 'nodes_untouched_function_respaced':
        text = lines[lambda_line - 1]
        assert text.count(', b""') == 1, text
        respaced = text.replace(', b""', ',  b""')
        assert ast.dump(ast.parse(source)) == ast.dump(ast.parse('\n'.join(
            lines[:lambda_line - 1] + [respaced] + lines[lambda_line:])))
        return '\n'.join(lines[:lambda_line - 1] + [respaced] + lines[lambda_line:]), [lambda_line], []
    if label.startswith('binding_duplicate_def_'):
        name = label[len('binding_duplicate_def_'):]
        fn = functions[name]
        first, last = function_span(fn)
        honest = lines[first - 1:last]
        if name == 'build_receipt':
            weak = lines[first - 1:gate.lineno - 1] + ['    overall_pass = True'] + lines[gate_end:last]
        else:
            weak = lines[first - 1:fn.body[0].lineno - 1] + ['    return []']
            weak += [''] * (len(honest) - len(weak))
        assert lines[-2:] == ['    raise SystemExit(main())', ''] or lines[-1] == '    raise SystemExit(main())', lines[-3:]
        end = len(lines) - (1 if lines[-1] == '' else 0)
        altered = lines[:first - 1] + weak + lines[last:end] + ['', ''] + honest + lines[end:]
        return '\n'.join(altered), list(range(first, first + len(weak))), []
    at = next(i for i, text in enumerate(lines, 1) if text.startswith('MULTI_FAMILY_AUTHOR = '))
    if label in ('changed_module_rebinding', 'fresh_module_rebinding'):
        return insert(at + 1, 'POST_AUGUST_RECEIPT = MULTI_FAMILY_RECEIPT')
    if label == 'changed_module_new_constant':
        return insert(at + 1, 'PM_RECEIPT = MULTI_FAMILY_RECEIPT')
    if label == 'changed_module_truth_carrier':
        return insert(at + 1, 'PM_PROBE = isinstance(HOME, Path)')
    if label == 'fresh_module_mutation':
        return insert(at + 1, 'HOLDING_DECISIONS["DL-039"] = None')
    if label == 'binding_module_alias_write':
        return insert(at + 1, 'PM_ALIAS = HOLDING_DECISIONS', 'PM_ALIAS["DL-039"] = None')
    if label == 'binding_module_class_body':
        return insert(at + 1, 'class PmC:', '    HOLDING_DECISIONS["DL-039"] = None')
    if label == 'binding_star_import':
        return insert(at + 1, 'from os.path import *')
    if label == 'fresh_function_shadows_builtin':
        return insert(at + 1, 'def isinstance(*args):', '    return True')
    if label == 'deleted_preserved_guard':
        start = loop + 2
        end = next(i for i in range(start + 1, start + 20) if lines[i - 1].strip() == '})')
        return '\n'.join(lines[:start - 1] + lines[end:]), [], list(range(start, end + 1))
    if label == 'refused_class_present':
        return insert(functions['recount_validation'].body[0].lineno, '    global PM_PROBE')
    raise ValueError('unknown edit probe ' + label)


def check_edit_probe(repo, test_names, label):
    raw = (repo / REL).read_bytes()
    before = subprocess.check_output(['git', '-C', str(repo), 'show', SEAL_BASE + ':' + REL]).decode()
    return edit_probe(raw, before, (repo / COVERAGE).read_bytes(), frozenset(test_names), label, frozen_source(repo))


def edit_probe(raw, before, table_raw, test_names, label, frozen=None):
    """Run one edit probe; return the refusal and the identities it must name.

    Every group is forged except the probe's own identities in the group
    under test, so the refusal names exactly those identities whatever else the
    repository's table already lacks.
    """
    group, prefix, _ = EDIT_PROBES[label]
    frozen = frozen_source() if frozen is None else frozen
    source = raw.decode()
    old_lines = source_lines(source)
    altered, edited, deleted = edit_probe_source(source, label)
    altered_raw = altered.replace('\n', '\r\n').encode() if b'\r\n' in raw else altered.encode()
    line_map = {}
    for b in difflib.SequenceMatcher(None, old_lines, source_lines(altered), autojunk=False).get_matching_blocks():
        for k in range(b.size):
            line_map[b.a + k + 1] = b.b + k + 1
    table = rebase_lines(json.loads(table_raw), line_map.get)
    table['validator_sha256'] = sha(altered_raw)
    modelled = all(c == 1 for c in Counter(n.name for n in ast.parse(altered).body
                                           if isinstance(n, TOP_LEVEL_DEFS)).values())
    named = []
    if modelled:
        expected, _, _, _, _, changed, historical, _ = coverage_model(altered_raw.decode(), before)
        frozen_records = frozen_line_inventory(altered_raw.decode(), frozen)
        nodes = node_model(altered_raw.decode(), before)[0]
    if group == 'census':
        named = sorted(s for s, r in expected.items() if r.get('line') in edited)
        assert named and all(expected[s]['node_type'].split('(')[0] in ('AugAssign', 'UnaryOp') for s in named), named
    elif group == 'changed_line_nodes':
        named = sorted(s for s, r in changed.items() if r['line'] in edited)
        if prefix.startswith('truth-carrying'):
            named = sorted(s for s in named if changed[s]['required_outcome'] == REFUSED)
        assert named, label
    elif group == 'historical_lines':
        assert deleted and not set(deleted) & set(line_map), deleted
        named = sorted(s for s, r in historical.items() if r['mark'] == 'deleted')
        assert len(named) == len(deleted) and sorted(historical[s]['text'] for s in named) == sorted(
            old_lines[n - 1] for n in deleted), (named, deleted)
    elif group == 'frozen_lines':
        named = sorted(frozen_records)
        assert sorted((r['mark'], r['line']) for r in frozen_records.values()) == sorted(
            [('deleted', n) for n in deleted] + [('inserted', n) for n in edited]), frozen_records
    elif group == 'nodes':
        named = sorted(s for s, r in nodes.items() if r['line'] in edited)
        assert named, label
    if modelled:
        forge_census(altered_raw, before, table, label, omit=set(named) if group == 'census' else ())
        forge_records(altered_raw, before, table, label, omit=set(named), frozen=frozen)
        refresh_totals(table, altered_raw, before)
    try:
        validate_coverage(altered_raw, before, table, test_names, frozen=frozen)
    except AssertionError as exc:
        message = str(exc)
    else:
        raise AssertionError('edit probe passed coverage: ' + label)
    assert message.startswith(prefix), (label, message[:400])
    if group == 'none':
        assert json.loads(message[len(prefix):])['refused_present'] == ['Global'], message
    elif group == 'binding':
        problems = {k: v for k, v in json.loads(message[len(prefix):]).items() if v}
        want = BINDING_EXPECTED[label]
        assert set(problems) == set(want) and all(v is None or problems[k] == v for k, v in want.items()), problems
    elif group == 'census':
        # The census identity alone refuses: every other inserted node is forged.
        assert message == 'coverage sites missing=' + repr(named) + ' stale=[]', message[:400]
    elif prefix.startswith('truth-carrying'):
        assert message == prefix + repr(named), message[:400]
    else:
        assert message == prefix + repr(named) + ' stale=[]', message[:400]
    return {'label': label, 'refusal': message[:240], 'named': named}


# (edit of the class table, the problems the refusal must name and nothing else).
# A class missing from the table that V uses also counts as refused when present.
CLASS_TABLE_PROBES = {
    'ast_class_removed': (lambda t: {k: v for k, v in t.items() if k != 'AugAssign'},
                          {'missing_from_table': ['AugAssign'], 'refused_present': ['AugAssign']}),
    'ast_truth_class_without_rule': (lambda t: dict(t, Subscript=(TRUTH, 'Synthetic probe entry.')),
                                     {'truth_carrying_without_census_rule': ['Subscript']}),
    'ast_rule_for_data_class': (lambda t: dict(t, Call=(DATA, 'Synthetic probe entry.')),
                                {'census_rule_for_class_not_truth_carrying': ['Call']}),
}


def check_class_table_probe(repo, test_names, label):
    """A synthetic edit of the class table, with V and the coverage table unchanged, must fail coverage."""
    edit, named = CLASS_TABLE_PROBES[label]
    before = subprocess.check_output(['git', '-C', str(repo), 'show', SEAL_BASE + ':' + REL]).decode()
    table = json.loads((repo / COVERAGE).read_bytes())
    prefix = 'ast class table '
    try:
        validate_coverage((repo / REL).read_bytes(), before, table, test_names, ast_classes=edit(AST_CLASSES))
    except AssertionError as exc:
        assert str(exc).startswith(prefix), str(exc)[:400]
        problems = json.loads(str(exc)[len(prefix):])
    else:
        raise AssertionError('edited class table passed coverage: ' + label)
    assert {k: v for k, v in problems.items() if v} == named, problems
    return problems


def check_ast_class_table(repo):
    """The committed class table against the running ast and the validator."""
    raw = (repo / REL).read_bytes()
    tree = ast.parse(raw.decode())
    problems = ast_class_problems(tree)
    assert not any(problems.values()), problems
    running = ast_class_names()
    assert set(running) == set(AST_CLASSES), sorted(set(running) ^ set(AST_CLASSES))
    present = {type(n).__name__ for n in ast.walk(tree)}
    assert not any(category(n) == REFUSED for n in present)
    truth = sorted(n for n, (c, _) in AST_CLASSES.items() if c == TRUTH)
    assert all(census_mechanism(n) for n in truth), truth
    return {'python': sys.version.split()[0], 'table_built_for': AST_TABLE_PYTHON, 'classes': len(running),
            'summary': ast_class_summary()}


def check_occurrence_map():
    # Synthetic alignment control. `kept` moves within the file and stays
    # aligned; a duplicated line maps once; inserted, changed-line,
    # changed-context, changed-header, changed-handler and new-function nodes
    # have no counterpart.
    before = """def kept(x):
    a = isinstance(x, dict)
    if x:
        b = isinstance(x, list)
    if x:
        c = isinstance(x, set)
    try:
        d = isinstance(x, int)
    except ValueError:
        pass
    return a


def gone(x):
    return bool(x)
"""
    source = """def fresh(x):
    return isinstance(x, dict)


def kept(x):
    a = isinstance(x, dict)
    a = isinstance(x, dict)
    probe = isinstance(x, dict)
    if x:
        pass
    else:
        b = isinstance(x, list)
    if not x:
        c = isinstance(x, set)
    try:
        d = isinstance(x, int)
    except ValueError as exc:
        pass
    return a and isinstance(x, dict)
"""
    counterparts, totals = occurrence_map(source, before)
    rows, _ = predicate_supplement(source, before, [])
    old = {r['site_id']: r for r in predicate_supplement(before, '', [])[0]}
    mapped = sorted((r['line'], r['expression'], r['node_type'], old[counterparts[r['site_id']]]['line'])
                    for r in rows if r['site_id'] in counterparts)
    assert mapped == [(6, 'isinstance(x, dict)', 'Call', 2), (9, 'x', 'If test', 3),
                      (16, 'isinstance(x, int)', 'Call', 8)], mapped
    assert totals['aligned_functions'] == 1 and totals['new_functions'] == 1, totals
    assert totals['ineligible_nodes'] == {'changed enclosing context': 1, 'changed enclosing header': 1,
                                          'changed handler list': 1, 'function new since CA-SEAL': 1,
                                          'inserted or changed line': 8}, totals
    assert len(rows) == 15 and len(set(counterparts.values())) == 3, (len(rows), counterparts)
    # Round 11 (N02, option A): the same edit's line marks, changed-line rows
    # and CA-SEAL lines without a counterpart, the removed function included.
    assert totals['line_marks']['kept'] == {'inserted': 4, 'changed': 3, 'deleted': 0, 'replaced': 3}, totals
    assert totals['removed_functions'] == ['gone'], totals
    changed = sorted((r['line'], r['node_class'], r['required_outcome'])
                     for r in changed_line_inventory(source, before).values())
    # Round 12 (CA2-C12-B02): every line of the new function `fresh` is an
    # inserted line, so its nodes have changed-line rows too (its call is a census row).
    assert changed == [(1, 'FunctionDef', STRUCTURAL), (1, 'arg', STRUCTURAL), (2, 'Name', DATA), (2, 'Name', DATA),
                       (2, 'Name', DATA), (2, 'Return', STRUCTURAL),
                       (7, 'Assign', DATA), (7, 'Name', DATA), (7, 'Name', DATA), (7, 'Name', DATA), (7, 'Name', DATA),
                       (8, 'Assign', DATA), (8, 'Name', DATA), (8, 'Name', DATA), (8, 'Name', DATA), (8, 'Name', DATA),
                       (10, 'Pass', STRUCTURAL), (13, 'If', STRUCTURAL), (13, 'Name', DATA),
                       (19, 'Name', DATA), (19, 'Name', DATA), (19, 'Name', DATA), (19, 'Name', DATA),
                       (19, 'Return', STRUCTURAL)], changed
    historical = sorted((r['function'], r['baseline_line'], r['mark'])
                        for r in historical_line_inventory(source, before).values())
    assert historical == [('gone', 14, 'function removed'), ('gone', 15, 'function removed'),
                          ('kept', 5, 'replaced'), ('kept', 9, 'replaced'), ('kept', 11, 'replaced')], historical

    def mapped(source, before):
        counterparts, _ = occurrence_map(source, before)
        old = {r['site_id']: r for r in predicate_supplement(before, '', [])[0]}
        return sorted((r['line'], r['expression'], old[counterparts[r['site_id']]]['line'])
                      for r in predicate_supplement(source, before, [])[0] if r['site_id'] in counterparts)
    def records(source, before):
        return (sorted((r['function'], r['line'], r['node_class'], r['required_outcome'])
                       for r in changed_line_inventory(source, before).values()),
                sorted((r['function'], r['baseline_line'], r['mark'])
                       for r in historical_line_inventory(source, before).values()))
    # N04: lines are counted as the parser counts them. A form feed inside a
    # string does not end a line (str.splitlines() would say it does), and a
    # lone carriage return does.
    before = "def kept(x):\n    a = isinstance(x, dict)\n    b = isinstance(x, list)\n    return a\n"
    feed = "def kept(x):\n    s = 'p\x0cq'\n    a = isinstance(x, dict)\n    b = isinstance(x, list)\n    return a\n"
    assert feed.splitlines().index('    a = isinstance(x, dict)') + 1 == 4
    assert source_lines(feed).index('    a = isinstance(x, dict)') + 1 == 3
    assert mapped(feed, before) == [(3, 'isinstance(x, dict)', 2), (4, 'isinstance(x, list)', 3)], mapped(feed, before)
    assert records(feed, before) == ([('kept', 2, 'Assign', DATA), ('kept', 2, 'Constant', DATA),
                                      ('kept', 2, 'Name', DATA)], []), records(feed, before)
    copied = "def kept(x):\n    s = 'p\x0cq'\n    a = isinstance(x, dict)\n    a = isinstance(x, dict)\n    return a\n"
    assert mapped(copied, before) == [(3, 'isinstance(x, dict)', 2)], mapped(copied, before)
    assert records(copied, before)[1] == [('kept', 3, 'replaced')], records(copied, before)
    lone = "def kept(x):\r    s = 1\n    a = isinstance(x, dict)\n    b = isinstance(x, list)\n    return a\n"
    assert mapped(lone, before) == [(3, 'isinstance(x, dict)', 2), (4, 'isinstance(x, list)', 3)], mapped(lone, before)
    # N02: a deleted decorator is a CA-SEAL line without a counterpart; a
    # changed one puts the function header on a changed line.
    before = "@negate\ndef kept(x):\n    a = isinstance(x, dict)\n    return a\n"
    removed = "def kept(x):\n    a = isinstance(x, dict)\n    return a\n"
    assert records(removed, before) == ([], [('kept', 1, 'deleted')]), records(removed, before)
    other = "@other\ndef kept(x):\n    a = isinstance(x, dict)\n    return a\n"
    assert records(other, before) == ([('kept', 1, 'Name', DATA), ('kept', 2, 'FunctionDef', STRUCTURAL)],
                                      [('kept', 1, 'replaced')]), records(other, before)
    # The module body outside top-level functions is an aligned unit too; a
    # truth carrier there has no census row and is refused.
    before = "LIMIT = 1\n\n\ndef kept(x):\n    return isinstance(x, dict)\n"
    module = "LIMIT = 1\nLIMIT = 2\nFLAG = isinstance(LIMIT, int)\n\n\ndef kept(x):\n    return isinstance(x, dict)\n"
    assert records(module, before) == ([
        ('<module>', 2, 'Assign', DATA), ('<module>', 2, 'Constant', DATA), ('<module>', 2, 'Name', DATA),
        ('<module>', 3, 'Assign', DATA), ('<module>', 3, 'Call', REFUSED), ('<module>', 3, 'Name', DATA),
        ('<module>', 3, 'Name', DATA), ('<module>', 3, 'Name', DATA), ('<module>', 3, 'Name', DATA)], []), \
        records(module, before)
    gone = "\n\ndef kept(x):\n    return isinstance(x, dict)\n"
    assert records(gone, before) == ([], [('<module>', 1, 'deleted')]), records(gone, before)


def check_node_types():
    # Synthetic grammar control: none of these forms needs a call-name rule.
    source = """def probe(items, flag):
    assigned = isinstance(items, list)
    both = flag & assigned
    either = flag | assigned
    xor = flag ^ assigned
    inverted = not flag
    combined = flag and assigned
    compare = flag == assigned
    choice = flag if assigned else False
    saved = (value := flag)
    selected = [x for x in items if x]
    assert flag
    try:
        (lambda x: x)(flag)
    except ValueError:
        pass
    match flag:
        case True if assigned:
            return choice
    def nested():
        return unknown_predicate(flag)
    flag &= assigned
    flag |= assigned
    flag ^= assigned
    flag += assigned
    difference = flag - assigned
    while flag:
        break
    try:
        pass
    except* ValueError:
        pass
"""
    rows, _ = predicate_supplement(source, '', [])
    required = {'Call', 'BinOp(BitAnd)', 'BinOp(BitOr)', 'BinOp(BitXor)', 'UnaryOp(Not)',
                'BoolOp', 'Compare', 'IfExp', 'NamedExpr', 'comprehension if', 'Assert',
                'Try dispatch', 'except dispatch', 'except alternative', 'match case', 'match guard',
                'AugAssign(BitAnd)', 'AugAssign(BitOr)', 'AugAssign(BitXor)', 'While test', 'TryStar dispatch'}
    types = Counter(r['node_type'] for r in rows)
    assert required <= set(types), sorted(required - set(types))
    # Round 12 (CA2-C12-N03): arithmetic is a census row too, in either statement shape.
    assert {'AugAssign(Add)', 'BinOp(Sub)'} <= set(types), types
    assert all(types['AugAssign(' + op + ')'] == 1 for op in ('BitAnd', 'BitOr', 'BitXor')), types
    calls = [n for n in ast.walk(ast.parse(source)) if isinstance(n, ast.Call)]
    assert sum(r['node_type'] == 'Call' for r in rows) == len(calls)
    assert any(r['expression'] == 'unknown_predicate(flag)' for r in rows)
    census = census_totals(source, '')
    assert not any(c['unanchored'] for c in census.values()), census
    assert census['BitOr']['touched_functions'] == {'AugAssign': 1, 'BinOp': 1}, census['BitOr']


def check_module_scope_rules(repo):
    """The round-12 binding rules refuse nothing in V or in CA-SEAL."""
    raw = (repo / REL).read_bytes()
    before = subprocess.check_output(['git', '-C', str(repo), 'show', SEAL_BASE + ':' + REL]).decode()
    out = {}
    for label, text in (('validator', raw.decode()), ('ca_seal', before)):
        problems = module_scope_problems(ast.parse(text))
        assert not any(problems.values()), (label, problems)
        tree = ast.parse(text)
        out[label] = {'module_names': len(scope_analysis(tree)[0][tree]), 'module_statements': len(tree.body)}
    problems = binding_problems(raw.decode(), before)
    assert not any(problems.values()), problems
    return out


def check_total_table_controls():
    """Synthetic controls for the round-12 node table, frozen-line records and module-scope rules."""
    def ids(rows, fields=('function', 'line', 'node_class')):
        return sorted(tuple(r[k] for k in fields) + (r['required_outcome'],) for r in rows.values())
    before = "X = 1\n\n\ndef same(a):\n    return a + 1\n\n\ndef kept(a):\n    b = a\n    return b\n"
    source = ("X = 1\nY = X / 2\nZ = 1 if X else 2\n\n\ndef same(a):\n    return a + 1\n\n\n"
              "def kept(a):\n    b = a\n    c = (lambda q: q or b)(a)\n    return b\n\n\ndef fresh(a):\n    return a\n")
    nodes, partition = node_model(source, before)
    assert not any(partition['problems'].values()), partition
    # 40 positioned nodes: 3 census anchors (the module's changed-line Div, and
    # kept's Call and BoolOp), 21 changed-line rows (module lines 2-3, kept's
    # line 12 and every line of the new function), 16 node rows (unchanged).
    assert partition['positioned_nodes'] == 40 and partition['untouched_functions'] == 1, partition
    assert partition['by_row_kind'] == {'census anchor': 3, 'changed-line row': 21, 'node row': 16}, partition
    assert ids(nodes, ('function', 'line', 'node_class', 'baseline_line')) == [
        ('<module>', 1, 'Assign', 1, DATA), ('<module>', 1, 'Constant', 1, DATA), ('<module>', 1, 'Name', 1, DATA),
        ('kept', 10, 'FunctionDef', 8, STRUCTURAL), ('kept', 10, 'arg', 8, STRUCTURAL),
        ('kept', 11, 'Assign', 9, DATA), ('kept', 11, 'Name', 9, DATA), ('kept', 11, 'Name', 9, DATA),
        ('kept', 13, 'Name', 10, DATA), ('kept', 13, 'Return', 10, STRUCTURAL),
        ('same', 6, 'FunctionDef', 4, STRUCTURAL), ('same', 6, 'arg', 4, STRUCTURAL),
        ('same', 7, 'BinOp', 5, UNCHANGED_TRUTH), ('same', 7, 'Constant', 5, DATA), ('same', 7, 'Name', 5, DATA),
        ('same', 7, 'Return', 5, STRUCTURAL)], ids(nodes, ('function', 'line', 'node_class', 'baseline_line'))
    changed = changed_line_inventory(source, before)
    assert ids(changed) == [
        ('<module>', 2, 'Assign', DATA), ('<module>', 2, 'Constant', DATA), ('<module>', 2, 'Name', DATA),
        ('<module>', 2, 'Name', DATA), ('<module>', 3, 'Assign', DATA), ('<module>', 3, 'Constant', DATA),
        ('<module>', 3, 'Constant', DATA), ('<module>', 3, 'IfExp', REFUSED), ('<module>', 3, 'Name', DATA),
        ('<module>', 3, 'Name', DATA),
        ('fresh', 16, 'FunctionDef', STRUCTURAL), ('fresh', 16, 'arg', STRUCTURAL), ('fresh', 17, 'Name', DATA),
        ('fresh', 17, 'Return', STRUCTURAL),
        ('kept', 12, 'Assign', DATA), ('kept', 12, 'Lambda', STRUCTURAL), ('kept', 12, 'Name', DATA),
        ('kept', 12, 'Name', DATA), ('kept', 12, 'Name', DATA), ('kept', 12, 'Name', DATA),
        ('kept', 12, 'arg', STRUCTURAL)], ids(changed)
    # N04: a Lambda, and a module-level IfExp, on a changed line has a row whose text keeps its body.
    texts = {(r['line'], r['node_class']): r['expression'] for r in changed.values()}
    assert texts[(12, 'Lambda')] == 'lambda q: q or b' and texts[(3, 'IfExp')] == '1 if X else 2', texts
    census, _ = predicate_supplement(source, before, [])
    assert sorted((r['function'], r['line'], r['node_type']) for r in census) == [
        ('<module>', 2, 'BinOp(Div)'), ('kept', 12, 'BoolOp'), ('kept', 12, 'Call')], census
    # Frozen-line records: inserted, changed, deleted, replaced, and a node-free comment line.
    frozen = "a = 1\nb = 2\nc = 3\n"
    def marks(text):
        return sorted((r['mark'], r['line'], r['text']) for r in frozen_line_inventory(text, frozen).values())
    assert marks(frozen) == []
    assert marks("a = 1\nx = 0\nb = 2\nc = 3\n") == [('inserted', 2, 'x = 0')]
    assert marks("a = 1\nc = 3\n") == [('deleted', 2, 'b = 2')]
    assert marks("a = 1\nb = 9\nc = 3\n") == [('changed', 2, 'b = 9'), ('replaced', 2, 'b = 2')]
    assert marks("a = 1\nb = 2\nc = 3 \n") == [('changed', 3, 'c = 3 '), ('replaced', 3, 'c = 3')]
    assert marks("a = 1\n# note\nb = 2\nc = 3\n") == [('inserted', 2, '# note')]
    assert marks("a = 1\nc = 3\nb = 2\n") == [('deleted', 3, 'c = 3'), ('inserted', 2, 'c = 3')]
    assert line_pins(frozen) == [{'line': i + 1, 'sha256': sha(t.encode())} for i, t in enumerate(['a = 1', 'b = 2', 'c = 3', ''])]
    # Module-scope rules (CA2-C12-B01, N02): each refused form, and the forms CA-SEAL uses.
    base = 'X = [1]\nD = {}\n'
    def refused(code):
        return sorted(k for k, v in module_scope_problems(ast.parse(base + code)).items() if v)
    for code, keys in [
            ('def f():\n    pass\ndef f():\n    pass\n', ['bound_more_than_once']),
            ('X = 2\n', ['bound_more_than_once']), ('del D\n', ['bound_more_than_once', 'not_a_declaration']),
            ('len = 1\n', ['shadows_a_builtin']), ('from os.path import *\n', ['not_a_declaration']),
            ('Y = X\nY[0] = 2\n', ['not_a_declaration', 'writes_a_module_object']),
            ('class C:\n    D["k"] = 1\n', ['not_a_declaration', 'writes_a_module_object']),
            ('for i in X:\n    pass\n', ['bound_more_than_once', 'not_a_declaration'][1:]),
            ('if __name__ == "__main__":\n    raise SystemExit(main())\nZ = 1\n', ['not_a_declaration']),
            ('def f():\n    X[0:] = []\n', ['writes_a_module_object']),
            ('def f():\n    y = X\n    y[0] = 1\n', ['writes_a_module_object']),
            ('def f():\n    for e in [X]:\n        e[0] = 1\n', ['writes_a_module_object']),
            ('def f(z=X):\n    z.append(1)\n', ['mutates_a_module_container']),
            ('def f():\n    D.update(a=1)\n', ['mutates_a_module_container']),
            ('def f():\n    y = X or []\n    y.clear()\n', ['mutates_a_module_container']),
            ('def f():\n    import os\n    os.environ["A"] = "1"\n', ['writes_a_module_object']),
            ('def f():\n    globals()["X"] = 1\n', ['reflection', 'writes_a_module_object']),
            ('def f():\n    return vars()\n', ['reflection']), ('def f():\n    return X.__class__\n',
                                                                 ['mutates_a_module_container', 'reflection']),
            ('def f():\n    d = {}\n    d["a"] = 1\n    return D.get("a"), X.index(1), d\n', []),
            ('def f():\n    X = []\n    X.append(1)\n    return X\n', []),
            ('def f():\n    class E(float):\n        def __new__(cls, t):\n            v = super().__new__(cls, t)\n'
             '            v.t = t\n            return v\n    return E\n', []),
            ('if __name__ == "__main__":\n    raise SystemExit(main())\n', [])]:
        assert refused(code) == keys, (code, refused(code), keys)
    return {'nodes': len(nodes), 'changed': len(changed)}


RANDOM_EDITS = 200
RANDOM_SEED = 20261106
_SWAPS = [('==', '!='), (' is not ', ' is '), (' not in ', ' in '), (' and ', ' or '), ('True', 'False'),
          ('<=', '<'), ('>=', '>'), ('[0]', '[1]'), ('[-1]', '[0]'), ('(', '( '), (', ', ',')]


def _mutated(text, rng):
    """One random in-line change: an operator, literal, name or spacing change, or a trailing comment."""
    choices = []
    for a, b in _SWAPS:
        for x, y in ((a, b), (b, a)):
            if x in text:
                choices.append(lambda t, x=x, y=y: t.replace(x, y, 1))
    digits = [i for i, c in enumerate(text) if c.isdigit()]
    if digits:
        choices.append(lambda t, i=rng.choice(digits): t[:i] + str((int(t[i]) + 1) % 10) + t[i + 1:])
    quotes = [i for i, c in enumerate(text) if c in '"\'']
    if quotes:
        choices.append(lambda t, i=rng.choice(quotes): t[:i + 1] + 'x' + t[i + 1:])
    words = [w for w in __import__('re').findall(r'\b[a-z_][a-z0-9_]{2,}\b', text)]
    if words:
        choices.append(lambda t, w=rng.choice(words): t.replace(w, w + '_x', 1))
    choices += [lambda t: t + ' ', lambda t: t + '  # probe', lambda t: (' ' if t.strip() else '') + t]
    return rng.choice(choices)(text)


def random_line_edits(source, count=RANDOM_EDITS, seed=RANDOM_SEED):
    """count distinct single-line edits of source that still parse, cycling insert, delete, change and swap.

    Returns [(kind, line, altered LF source)]. Seeded, so the corpus and the
    replay draw the same edits.
    """
    import random
    rng = random.Random(seed)
    lines = source_lines(source)
    candidates = [i for i, t in enumerate(lines, 1) if t.strip()]
    kinds = ('insert', 'delete', 'change', 'swap')
    edits, seen, attempts = [], set(), 0
    while len(edits) < count:
        attempts += 1
        assert attempts < 200 * count, 'random edits: too few parseable edits'
        kind, line = kinds[len(edits) % 4], rng.choice(candidates)
        text, new = lines[line - 1], list(lines)
        if kind == 'insert':
            donor = lines[rng.choice(candidates) - 1].strip()
            new.insert(line - 1, text[:len(text) - len(text.lstrip())] + donor)
        elif kind == 'delete':
            del new[line - 1]
        elif kind == 'change':
            new[line - 1] = _mutated(text, rng)
        else:
            if line >= len(lines) or not lines[line].strip() or lines[line] == text:
                continue
            new[line - 1], new[line] = lines[line], text
        altered = '\n'.join(new)
        if altered == source or altered in seen:
            continue
        try:
            ast.parse(altered)
        except (SyntaxError, ValueError):
            continue
        seen.add(altered)
        edits.append((kind, line, altered))
    return edits


def refusal_rule(message):
    """The coverage rule a refusal message names."""
    for prefix in ('validator does not parse', 'ast class table', 'module-level binding refused',
                   'line pins are not the frozen validator', 'frozen lines', 'coverage sites', 'preserved occurrence',
                   'truth-carrying node on a changed line', 'changed-line nodes', 'historical lines', 'node partition',
                   'truth-carrying node without a census row', 'node rows', 'validator is not frozen'):
        if message.startswith(prefix) or message.startswith("('" + prefix):
            return prefix
    return 'other: ' + message[:60]


def check_random_edits(repo, test_names, count=RANDOM_EDITS):
    """The stopping bar's control: every random single-line edit of V fails coverage with the table byte-identical."""
    raw = (repo / REL).read_bytes()
    before = subprocess.check_output(['git', '-C', str(repo), 'show', SEAL_BASE + ':' + REL]).decode()
    table_raw = (repo / COVERAGE).read_bytes()
    frozen = frozen_source(repo)
    crlf = b'\r\n' in raw
    rules, kinds = Counter(), Counter()
    for kind, line, altered in random_line_edits(raw.decode().replace('\r\n', '\n'), count):
        altered_raw = altered.replace('\n', '\r\n').encode() if crlf else altered.encode()
        table = json.loads(table_raw)
        try:
            validate_coverage(altered_raw, before, table, test_names, frozen=frozen)
        except AssertionError as exc:
            rules[refusal_rule(str(exc))] += 1
        else:
            raise AssertionError('random edit passed coverage with the table unchanged: %s at V:%d' % (kind, line))
        assert encoded(table) == table_raw, 'coverage check changed the table'
        kinds[kind] += 1
    assert sum(kinds.values()) == count and (repo / COVERAGE).read_bytes() == table_raw
    return {'edits': count, 'by_kind': dict(sorted(kinds.items())), 'refused_by': dict(sorted(rules.items()))}


def run(repo, output, source_map, apply_cut=None):
    results = []
    def record(name, action, rejects=False, message=None):
        try:
            value = action()
            if rejects:
                raise AssertionError('negative was accepted')
            results.append({'name': name, 'pass': True})
            return value
        except (ValueError, OSError, TypeError, KeyError, UnicodeError, subprocess.SubprocessError) as exc:
            if not rejects or (message is not None and message not in str(exc)):
                results.append({'name': name, 'pass': False, 'error': str(exc)})
            else:
                results.append({'name': name, 'pass': True, 'refusal': str(exc)[:240]})
        except Exception as exc:
            # Unexpected exceptions always fail assertion-based controls.
            results.append({'name': name, 'pass': False, 'error': type(exc).__name__ + ': ' + str(exc)})

    def exact_refusal(action, message):
        # Only the intended ValueError, with the complete contextual diagnostic,
        # satisfies these controls. TypeError/AttributeError never qualify.
        try:
            action()
        except ValueError as exc:
            assert str(exc) == message, (message, str(exc))
        else:
            raise AssertionError('expected controlled refusal: ' + message)

    def git(spec):
        return subprocess.check_output(['git', '-C', str(repo), 'show', spec])

    base = Path.home() / 'PM-Experiments'
    base.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='CA-SEAL2-', dir=base) as directory:
        root = Path(directory)
        def put(path, raw):
            target = root / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(raw)
            return target
        put(REL, (repo / REL).read_bytes())
        spec = importlib.util.spec_from_file_location('dl451_fixture', root / REL)
        v = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(v)
        def imported_bindings_match():
            # CA2-C12-B01: the corpus runs the one binding the checker reads.
            tree = ast.parse((root / REL).read_bytes().decode())
            problems = module_scope_problems(tree)
            assert not any(problems.values()), problems
            for name, fn in top_functions(tree).items():
                assert getattr(v, name).__code__.co_firstlineno == function_span(fn)[0], name
            module_names = set(scope_analysis(tree)[0][tree])
            assert module_names <= set(vars(v)), sorted(module_names - set(vars(v)))
            return len(module_names)
        record('positive_imported_bindings_match_ast', imported_bindings_match)
        if apply_cut is not None:
            apply_cut(v)
        for path in [v.MULTI_FAMILY_RECEIPT, v.POST_AUGUST_RECEIPT, v.HOLDING_RECEIPT,
                     str(v.DENOM.relative_to(root)),
                     'Plans/.audits/event-authority-2026-08-12/closed-world-census/CURRENT_SOURCE_INVENTORY.json',
                     'Plans/.audits/event-authority-2026-08-12/independent-validator/receipts/event_authority_validator_receipt.json']:
            put(path, (repo / path).read_bytes())
        put('Plans/Decision_Log.md', git('origin/plans/ea-cards2-answers-20261105:Plans/Decision_Log.md'))
        frozen_receipt = git(COUNT + ':' + v.RECOUNT_RECEIPT)
        frozen_list = git(COUNT + ':' + v.RECOUNT_LIST)
        put(v.RECOUNT_RECEIPT, frozen_receipt)
        put(v.RECOUNT_LIST, frozen_list)
        change = json.loads((repo / v.RECOUNT_CHANGE).read_bytes())
        change['lander_task'] = 'fixture:lander'
        change['seal_applier_forbidden_tasks'] = sorted({v.RECOUNT_AUTHOR, 'fixture:lander'})
        put(v.RECOUNT_CHANGE, encoded(change))
        def anchors():
            put('Plans/Spec_Lock.json', encoded({'canonical_ssot_hashes': {'files': [
                {'path': p, 'sha256': sha((root / p).read_bytes())}
                for p in [v.MULTI_FAMILY_RECEIPT, v.RECOUNT_CHANGE]]}}))
        anchors()
        original_env = {k: os.environ.get(k) for k in ['GIT_DIR', 'PM_EA_RECOUNT_SOURCE_MAP']}
        try:
            os.environ['GIT_DIR'] = str(Path(subprocess.check_output(
                ['git', '-C', str(repo), 'rev-parse', '--absolute-git-dir']).decode().strip()))
            os.environ['PM_EA_RECOUNT_SOURCE_MAP'] = str(source_map)
            names, custody = record('positive_real_frozen_recount_597_sources', v.recount_frozen_inputs)
            # Astra 2 B03: mutate only the supplied map, retaining all 597 sources.
            real_map = json.loads(source_map.read_bytes())
            probe_map = put('real-map-probe.json', encoded(real_map))
            for label, mutate in [
                ('extra_root_key', lambda d: d.__setitem__('extra', 'not allowed')),
                ('wrong_schema', lambda d: d.__setitem__('schema_id', 'wrong.schema')),
                ('relative_location', lambda d: d['locations'].__setitem__(
                    next(iter(d['locations'])), os.path.relpath(next(iter(d['locations'].values()))))),
            ]:
                os.environ['PM_EA_RECOUNT_SOURCE_MAP'] = str(source_map)
                v.recount_frozen_inputs()  # The unchanged parent verifies all sources.
                bad = copy.deepcopy(real_map)
                mutate(bad)
                probe_map.write_bytes(encoded(bad))
                os.environ['PM_EA_RECOUNT_SOURCE_MAP'] = str(probe_map)
                record('negative_source_map_' + label, v.recount_frozen_inputs, True)
            os.environ['PM_EA_RECOUNT_SOURCE_MAP'] = str(source_map)
            # Astra 5 B01: explicit source failures keep every frozen pin fixed.
            source_key = next(iter(real_map['locations']))
            probe_map.write_bytes(encoded(real_map))
            os.environ['PM_EA_RECOUNT_SOURCE_MAP'] = str(probe_map)
            v.recount_frozen_inputs()
            for label, replacement in [
                    ('custody_oserror', root / 'absent-source'),
                    ('custody_valueerror', put('changed-source', b'substituted source bytes\n'))]:
                bad_map = copy.deepcopy(real_map)
                bad_map['locations'][source_key] = str(replacement)
                probe_map.write_bytes(encoded(bad_map))
                detail = (str(FileNotFoundError(2, 'No such file or directory', str(replacement)))
                          if label == 'custody_oserror' else 'source fingerprint mismatch')
                message = 'recount source custody failed: ' + json.dumps(
                    [{'source': source_key, 'error': detail}], sort_keys=True)
                record('negative_' + label, lambda message=message:
                       exact_refusal(v.recount_frozen_inputs, message))
            frozen = json.loads(frozen_receipt)
            git_sources = [name for name in frozen['inputs']
                           if name not in real_map['locations'] and not name.startswith('/')]
            assert git_sources
            unavailable_source = git_sources[0]
            single_git_map = copy.deepcopy(real_map)
            # This passing parent maps all other sources to their verified bytes.
            # Its frozen receipt/list fingerprints remain exactly unchanged.
            for index, name in enumerate(git_sources[1:]):
                raw = v.recount_source_bytes(name, v.RECOUNT_REVISION, real_map['locations'])
                single_git_map['locations'][name] = str(put('real-source-bytes/' + str(index), raw))
            probe_map.write_bytes(encoded(single_git_map))
            v.recount_frozen_inputs()
            old_git = os.environ['GIT_DIR']
            try:
                os.environ['GIT_DIR'] = str(root / 'absent-git-directory')
                revision, relative = v.RECOUNT_REVISION, unavailable_source
                if unavailable_source.startswith('git:'):
                    _, revision, relative = unavailable_source.split(':', 2)
                command = ['git', '-C', str(root), 'cat-file', 'blob', revision + ':' + relative]
                try:
                    subprocess.check_output(command, stderr=subprocess.PIPE, timeout=30)
                except subprocess.SubprocessError as exc:
                    detail = str(exc)
                else:
                    raise AssertionError('absent repository unexpectedly resolved source')
                message = 'recount source custody failed: ' + json.dumps(
                    [{'source': unavailable_source, 'error': detail}], sort_keys=True)
                record('negative_custody_subprocess', lambda:
                       exact_refusal(v.recount_frozen_inputs, message))
            finally:
                os.environ['GIT_DIR'] = old_git
                os.environ['PM_EA_RECOUNT_SOURCE_MAP'] = str(source_map)

            record('positive_fourth_receipt', v.recount_change_state)
            record('positive_original_DL077_predicate_through_both_anchors', v.post_august_receipt_state)
            fourth_path = root / v.RECOUNT_CHANGE
            fourth_raw = fourth_path.read_bytes()
            for label, raw in [('third_oserror', None), ('third_valueerror', b'[]\n')]:
                fourth_path.write_bytes(fourth_raw)
                assert v.third_change_validator_pin() == v.RECOUNT_BEFORE_SHA
                if raw is None:
                    fourth_path.unlink()
                else:
                    fourth_path.write_bytes(raw)
                def live_fallback():
                    assert v.third_change_validator_pin() == sha((root / REL).read_bytes())
                record('negative_' + label, live_fallback)
            fourth_path.write_bytes(fourth_raw)

            def august_snapshot():
                inventory = json.loads((v.CENSUS / 'CURRENT_SOURCE_INVENTORY.json').read_bytes())
                denominator = json.loads(v.DENOM.read_bytes())
                assert inventory['canonical_digest_sha256'] == denominator['freeze_digest_sha256']
                assert sha((v.CENSUS / 'CURRENT_SOURCE_INVENTORY.json').read_bytes()) == sha((repo / str((v.CENSUS / 'CURRENT_SOURCE_INVENTORY.json').relative_to(root))).read_bytes())
                pins = v.recount_snapshot_pins()
                observed = {('august', 'inventory_sha256'): v.CENSUS / 'CURRENT_SOURCE_INVENTORY.json',
                            ('august', 'denominator_sha256'): v.DENOM,
                            ('recount', 'observed_receipt_sha256'): root / v.RECOUNT_RECEIPT,
                            ('recount', 'list_sha256'): root / v.RECOUNT_LIST}
                for (snapshot, field), path in observed.items():
                    assert pins[snapshot][field] == sha(path.read_bytes()), (snapshot, field, pins)
                assert pins['august']['inventory_sha256'] != pins['recount']['expected_list_sha256']
            record('positive_preserved_August_snapshot_own_digest', august_snapshot)

            denominator_raw = v.DENOM.read_bytes()
            v.DENOM.unlink()
            def missing_snapshot():
                pins = v.recount_snapshot_pins()
                assert pins['august']['denominator_sha256'] is None, pins
                assert pins['august']['inventory_sha256'] == sha(
                    (v.CENSUS / 'CURRENT_SOURCE_INVENTORY.json').read_bytes())
                assert pins['recount']['observed_receipt_sha256'] == sha(frozen_receipt)
                assert pins['recount']['list_sha256'] == sha(frozen_list)
                assert pins['august']['receipt_sha256'] == v.AUGUST_RECEIPT_SHA
                assert pins['recount']['expected_receipt_sha256'] == v.RECOUNT_RECEIPT_SHA
                assert pins['recount']['expected_list_sha256'] == v.RECOUNT_LIST_SHA
            record('negative_snapshot_missing_file', missing_snapshot)
            v.DENOM.write_bytes(denominator_raw)

            # B02: direct False assertions retain a valid third anchor and all
            # unrelated fourth-anchor facts. No crash is an expected refusal.
            anchors()
            lock_parent = json.loads((root / 'Plans/Spec_Lock.json').read_bytes())
            for label in ['anchor_ssot_type', 'anchor_files_type', 'anchor_entry_type', 'anchor_sha_type']:
                anchors()
                assert v.recount_anchor(v.RECOUNT_CHANGE) is True
                bad_lock = copy.deepcopy(lock_parent)
                if label == 'anchor_ssot_type':
                    bad_lock['canonical_ssot_hashes'] = 1
                elif label == 'anchor_files_type':
                    bad_lock['canonical_ssot_hashes']['files'] = 1
                elif label == 'anchor_entry_type':
                    bad_lock['canonical_ssot_hashes']['files'][-1] = None
                else:
                    bad_lock['canonical_ssot_hashes']['files'][-1]['sha256'] = 123
                put('Plans/Spec_Lock.json', encoded(bad_lock))
                def anchor_false():
                    assert v.recount_anchor(v.RECOUNT_CHANGE) is False
                record('negative_' + label, anchor_false)
            anchors()
            assert v.recount_relative('Plans/a') == 'Plans/a'
            record('negative_relative_type', lambda: exact_refusal(
                lambda: v.recount_relative(['a']), 'unsafe recount source path'))
            mapped_source = next(iter(real_map['locations']))
            v.recount_source_bytes(mapped_source, v.RECOUNT_REVISION, real_map['locations'])
            bad_locations = copy.deepcopy(real_map['locations'])
            bad_locations[mapped_source] = 123
            record('negative_location_type', lambda: exact_refusal(
                lambda: v.recount_source_bytes(mapped_source, v.RECOUNT_REVISION, bad_locations),
                'source location must be an explicit absolute path'))

            # Every following negative starts from an independently passing synthetic
            # custody fixture. It uses the actual 249-name list and exact 597-source shape.
            sources = {}
            locations = {}
            for i in range(597):
                name = 'Plans/fixture_' + str(i) + '.json'
                raw = str(i % 10).encode()
                target = put('fixture-source-bytes/' + str(i), raw)
                sources[name] = {'sha256': sha(raw), 'bytes': len(raw)}
                locations[name] = str(target)
            synthetic = json.loads(frozen_receipt)
            synthetic['inputs'] = sources
            map_path = put('source-map.json', encoded({'schema_id': 'pm.event_authority.recount_source_locations.v1', 'locations': locations}))
            os.environ['PM_EA_RECOUNT_SOURCE_MAP'] = str(map_path)
            def reset_inputs(doc=None):
                raw = encoded(synthetic if doc is None else doc)
                put(v.RECOUNT_RECEIPT, raw)
                v.RECOUNT_RECEIPT_SHA = sha(raw)
                put(v.RECOUNT_LIST, frozen_list)
                coherent_locations = {k: locations[k] for k in (synthetic if doc is None else doc)['inputs']}
                map_path.write_bytes(encoded({'schema_id': 'pm.event_authority.recount_source_locations.v1', 'locations': coherent_locations}))
            reset_inputs()
            record('positive_isolated_source_fixture', v.recount_frozen_inputs)
            # Same-size JSON whitespace change: only the frozen receipt byte pin is stale.
            mutated_receipt = bytearray((root / v.RECOUNT_RECEIPT).read_bytes())
            mutated_receipt[mutated_receipt.index(32)] = 9
            put(v.RECOUNT_RECEIPT, bytes(mutated_receipt))
            record('negative_one_changed_receipt_byte', v.recount_frozen_inputs, True, 'receipt byte fingerprint')
            reset_inputs()
            mutated = bytearray(frozen_list)
            mutated[mutated.index(32)] = 9  # One whitespace byte; JSON and byte count stay valid.
            put(v.RECOUNT_LIST, bytes(mutated))
            record('negative_one_changed_list_byte', v.recount_frozen_inputs, True, 'list byte fingerprint')
            reset_inputs()
            source = Path(locations['Plans/fixture_0.json'])
            source.write_bytes(b'9')
            record('negative_one_changed_source_byte', v.recount_frozen_inputs, True, 'source fingerprint mismatch')
            source.write_bytes(b'0')
            for label, mutate, message in [
                ('wrong_source_byte_count', lambda d: d['inputs']['Plans/fixture_0.json'].__setitem__('bytes', 2), 'source fingerprint mismatch'),
                ('missing_fingerprint', lambda d: d['inputs']['Plans/fixture_0.json'].pop('sha256'), 'missing or noncanonical'),
                ('mismatched_fingerprint', lambda d: d['inputs']['Plans/fixture_0.json'].__setitem__('sha256', 'f' * 64), 'source fingerprint mismatch'),
                ('mixed_August_source_revision', lambda d: d.__setitem__('main_sha', '0' * 40), 'snapshot identity'),
                ('missing_source_member', lambda d: d['inputs'].pop('Plans/fixture_0.json'), 'fingerprint set incomplete'),
                ('string_byte_count', lambda d: d['inputs']['Plans/fixture_0.json'].__setitem__('bytes', '1'), 'missing or noncanonical'),
                ('boolean_byte_count', lambda d: d['inputs']['Plans/fixture_0.json'].__setitem__('bytes', True), 'missing or noncanonical'),
                ('float_byte_count', lambda d: d['inputs']['Plans/fixture_0.json'].__setitem__('bytes', 1.0), 'missing or noncanonical'),
                ('uppercase_source_sha', lambda d: d['inputs']['Plans/fixture_0.json'].__setitem__('sha256', d['inputs']['Plans/fixture_0.json']['sha256'].upper()), 'missing or noncanonical'),
            ]:
                doc = copy.deepcopy(synthetic)
                mutate(doc)
                reset_inputs(doc)  # Refresh only the fixture trust pin to isolate its inner predicate.
                record('negative_' + label, v.recount_frozen_inputs, True, message)
            reset_inputs()
            doc = copy.deepcopy(synthetic)
            doc['inputs']['Plans/fixture_0.json']['sha256'] = json.loads(
                (v.CENSUS / 'CURRENT_SOURCE_INVENTORY.json').read_bytes())['canonical_digest_sha256']
            reset_inputs(doc)
            record('negative_August_fingerprint_with_recount_membership', v.recount_frozen_inputs, True, 'source fingerprint mismatch')
            reset_inputs()

            reset_inputs()
            unknown_map = json.loads(map_path.read_bytes())
            unknown_map['locations']['Plans/unknown-source.json'] = locations['Plans/fixture_0.json']
            map_path.write_bytes(encoded(unknown_map))
            record('negative_source_map_unknown_member', v.recount_frozen_inputs, True,
                   'invalid explicit recount source locations')
            absolute_doc = copy.deepcopy(synthetic)
            absolute_doc['inputs'] = {locations[k]: pin for k, pin in sources.items()}
            put(v.RECOUNT_RECEIPT, encoded(absolute_doc))
            v.RECOUNT_RECEIPT_SHA = sha(encoded(absolute_doc))
            map_path.write_bytes(encoded({'schema_id': 'pm.event_authority.recount_source_locations.v1', 'locations': {}}))
            record('positive_absolute_sources_without_map_entries', v.recount_frozen_inputs)
            # Remove only the optional map from the passing absolute-source
            # fixture. These are actual fixture bytes, not a claim that this
            # machine can resolve the real frozen sources without their map.
            saved_map = os.environ.pop('PM_EA_RECOUNT_SOURCE_MAP')
            try:
                def optional_map_absent():
                    actual_names, actual_custody = v.recount_frozen_inputs()
                    assert actual_names == names
                    assert actual_custody == {
                        'receipt_sha256': v.RECOUNT_RECEIPT_SHA, 'list_sha256': v.RECOUNT_LIST_SHA,
                        'source_revision': v.RECOUNT_REVISION, 'verified_sources': 597,
                        'source_locations': None}, actual_custody
                record('negative_optional_map_absent', optional_map_absent)
            finally:
                os.environ['PM_EA_RECOUNT_SOURCE_MAP'] = saved_map
            map_path.write_bytes(encoded({'schema_id': 'pm.event_authority.recount_source_locations.v1', 'locations': []}))
            record('negative_source_map_locations_array', v.recount_frozen_inputs, True,
                   'invalid explicit recount source locations')
            reset_inputs()

            # Semantic receipt faults retain a matching byte anchor, so integrity
            # rejection cannot mask the intended validator/authority predicate.
            v.RECOUNT_RECEIPT_SHA = sha(frozen_receipt)
            put(v.RECOUNT_RECEIPT, frozen_receipt)
            for field, value in [
                ('schema_id', 'wrong.schema'), ('authority_ref', 'Plans/Decision_Log.md#DL-450'),
                ('validator_before_sha256', '0' * 64), ('validator_after_sha256', '0' * 64),
                ('prior_receipt', {'path': v.MULTI_FAMILY_RECEIPT, 'sha256': '0' * 64}),
                ('recount_receipt', {'path': v.RECOUNT_RECEIPT, 'sha256': '0' * 64}),
                ('recount_list', {'path': v.RECOUNT_LIST, 'sha256': '0' * 64}),
                ('definition_writing_authorized', True), ('app_recording_authorized', True),
                ('contract_depth_complete', True),
                ('validator_id', 'another.validator'), ('validator_path', 'Plans/wrong.py'),
                ('authority_section_sha256', '0' * 64), ('author_task', 'another.author'),
                ('lander_task', None), ('seal_authorized', True), ('admission_authorized', 'false'),
                ('certification_scope', 'recount_only'),
            ]:
                doc = copy.deepcopy(change)
                doc[field] = value
                put(v.RECOUNT_CHANGE, encoded(doc))
                anchors()
                record('negative_change_' + field, v.recount_change_state, True, 'identity, authority')
                record('legacy_predicate_preserved_under_' + field, v.post_august_receipt_state,
                       field in {'validator_before_sha256', 'validator_after_sha256'})
            put(v.RECOUNT_CHANGE, encoded(change))
            anchors()
            # Astra 3 B01/B02: each parent passes; hashes follow changed bytes.
            decision_path = root / 'Plans/Decision_Log.md'
            decision_raw = decision_path.read_bytes()
            section = v.decision_section_bytes(decision_path, 'DL-451')
            authority_tokens = [b'i approve all of it', b'Approve a fourth recorded change',
                                b'Keep every per-name decision',
                                b'6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30']
            try:
                for index, token in enumerate(authority_tokens):
                    decision_path.write_bytes(decision_raw)
                    put(v.RECOUNT_CHANGE, encoded(change))
                    anchors()
                    v.recount_change_state()
                    edited = section.replace(token, b'[removed requirement]')
                    assert token not in edited
                    decision_path.write_bytes(decision_raw.replace(section, edited))
                    bad = copy.deepcopy(change)
                    bad['authority_section_sha256'] = sha(edited)
                    put(v.RECOUNT_CHANGE, encoded(bad))
                    anchors()
                    record('negative_authority_required_token_' + str(index), v.recount_change_state,
                           True, 'DL-451 authority text missing or changed')
            finally:
                decision_path.write_bytes(decision_raw)
                put(v.RECOUNT_CHANGE, encoded(change))
                anchors()
            for field in ['prior_receipt', 'recount_receipt', 'recount_list']:
                for clause in ['path', 'keys']:
                    put(v.RECOUNT_CHANGE, encoded(change))
                    anchors()
                    v.recount_change_state()
                    bad = copy.deepcopy(change)
                    if clause == 'path':
                        bad[field]['path'] = 'reports/substituted-path.json'
                    else:
                        bad[field]['unexpected'] = 'extra'
                    put(v.RECOUNT_CHANGE, encoded(bad))
                    anchors()
                    record('negative_nested_' + field + '_' + clause, v.recount_change_state,
                           True, 'fourth amendment identity, authority')
            put(v.RECOUNT_CHANGE, encoded(change))
            anchors()
            # B06: call the changed third semantic helper directly, from a
            # fully finalized third/fourth fixture. Every byte observation follows.
            third_raw = (root / v.MULTI_FAMILY_RECEIPT).read_bytes()
            try:
                third = json.loads(third_raw)
                third['lander_task'] = 'fixture:third-lander'
                third['seal_applier_forbidden_tasks'] = sorted({v.MULTI_FAMILY_AUTHOR, 'fixture:third-lander'})
                def sync_third(doc):
                    put(v.MULTI_FAMILY_RECEIPT, encoded(doc))
                    fourth = copy.deepcopy(change)
                    fourth['prior_receipt']['sha256'] = sha((root / v.MULTI_FAMILY_RECEIPT).read_bytes())
                    put(v.RECOUNT_CHANGE, encoded(fourth))
                    anchors()
                sync_third(third)
                v.multi_family_receipt_state()
                v.recount_change_state()
                bad = copy.deepcopy(third)
                bad['validator_after_sha256'] = 'e' * 64
                sync_third(bad)
                record('negative_third_semantic_after_hash', v.multi_family_receipt_state, True,
                       'multi-family step amendment receipt identity, authority or hash mismatch')
            finally:
                put(v.MULTI_FAMILY_RECEIPT, third_raw)
                put(v.RECOUNT_CHANGE, encoded(change))
                anchors()
            for label, raw, kind in [
                ('duplicate_root', b'{"a":1,"a":2}', dict),
                ('duplicate_nested', b'{"a":{"b":1,"b":2}}', dict),
                ('NaN', b'{"a":NaN}', dict), ('Infinity', b'{"a":Infinity}', dict),
                ('negative_Infinity', b'{"a":-Infinity}', dict), ('overflow', b'{"a":1e9999}', dict),
                ('BOM', b'\xef\xbb\xbf{}', dict), ('trailing', b'{}x', dict),
                ('wrong_root_array', b'[]', dict), ('wrong_root_bool', b'false', dict),
                ('wrong_root_null', b'null', dict), ('wrong_root_string', b'"0"', dict),
            ]:
                record('negative_strict_' + label, lambda raw=raw, kind=kind: v.recount_json(raw, kind), True)
            for raw in [b'{"a":1}', b'{} \n']:
                record('positive_strict_JSON_' + str(len(raw)), lambda raw=raw: v.recount_json(raw, dict))

            put('Plans/Spec_Lock.json', encoded({'canonical_ssot_hashes': {'files': [
                {'path': v.MULTI_FAMILY_RECEIPT, 'sha256': sha((root / v.MULTI_FAMILY_RECEIPT).read_bytes())}]}}))
            def broken_anchor():
                # Product call only: an observer assertion cannot prove a refusal.
                v.post_august_receipt_state()
            record('negative_missing_fourth_anchor', broken_anchor, True)
            anchors()
            lock = json.loads((root / 'Plans/Spec_Lock.json').read_bytes())
            lock['canonical_ssot_hashes']['files'].append(copy.deepcopy(lock['canonical_ssot_hashes']['files'][-1]))
            put('Plans/Spec_Lock.json', encoded(lock))
            record('negative_duplicate_fourth_anchor', broken_anchor, True)
            anchors()

            # Round 2: each control starts from the same valid complete receipt.
            # The list and whole-receipt anchor are observations of the changed
            # lander/receipt, so synchronize them rather than leave a second fault.
            for label in ['wrong_fourth_anchor_digest', 'wrong_fourth_anchor_path', 'blank_lander',
                          'missing_lander_from_seal_applier_list']:
                put(v.RECOUNT_CHANGE, encoded(change))
                anchors()
                v.recount_change_state()  # Prove the parent case passes first.
                doc = copy.deepcopy(change)
                if label == 'blank_lander':
                    doc['lander_task'] = ' '
                    doc['seal_applier_forbidden_tasks'] = sorted({v.RECOUNT_AUTHOR, ' '})
                elif label == 'missing_lander_from_seal_applier_list':
                    doc['seal_applier_forbidden_tasks'] = [v.RECOUNT_AUTHOR]
                put(v.RECOUNT_CHANGE, encoded(doc))
                anchors()
                if label == 'wrong_fourth_anchor_digest':
                    lock = json.loads((root / 'Plans/Spec_Lock.json').read_bytes())
                    fourth = next(entry for entry in lock['canonical_ssot_hashes']['files']
                                  if entry['path'] == v.RECOUNT_CHANGE)
                    fourth['sha256'] = '0' * 64  # Canonical, wrong; third anchor stays valid.
                    put('Plans/Spec_Lock.json', encoded(lock))
                if label == 'wrong_fourth_anchor_path':
                    # Cycle 7 C7-B01: only the fourth anchor's path changes; its digest
                    # stays correct for the fourth receipt and the third anchor stays valid.
                    lock = json.loads((root / 'Plans/Spec_Lock.json').read_bytes())
                    fourth = next(entry for entry in lock['canonical_ssot_hashes']['files']
                                  if entry['path'] == v.RECOUNT_CHANGE)
                    fourth['path'] = 'reports/review-foreign-receipt.json'
                    put('Plans/Spec_Lock.json', encoded(lock))
                record('negative_' + label, v.recount_change_state, True, 'identity, authority')
            put(v.RECOUNT_CHANGE, encoded(change))
            anchors()

            third_raw = (root / v.MULTI_FAMILY_RECEIPT).read_bytes()
            third_doc = json.loads(third_raw)
            third_doc['validator_after_sha256'] = '0' * 64
            put(v.MULTI_FAMILY_RECEIPT, encoded(third_doc))
            bridge_change = copy.deepcopy(change)
            bridge_change['prior_receipt']['sha256'] = sha(encoded(third_doc))
            put(v.RECOUNT_CHANGE, encoded(bridge_change))
            anchors()
            def bridge_refusal():
                if v.third_change_validator_pin() != v.RECOUNT_BEFORE_SHA:
                    raise ValueError('third executable pin refused')
            record('negative_third_bridge_executable_pin', bridge_refusal, True)
            record('negative_change_requires_valid_third_bridge', v.recount_change_state, True)
            put(v.MULTI_FAMILY_RECEIPT, third_raw)
            put(v.RECOUNT_CHANGE, encoded(change))
            anchors()

            # Outcome checks cannot supply admission: the accepted set is the
            # output of unchanged admission checks in main, explicitly injected here.
            outcome_doc = {'schema_id': 'pm.assurance.event_authority.recount_outcomes.v1',
                           'recount_receipt_sha256': v.RECOUNT_RECEIPT_SHA,
                           'recount_list_sha256': v.RECOUNT_LIST_SHA,
                           'rows': [{'event_type': n, 'outcome': 'registered'} for n in names]}
            def outcomes(doc, admitted=None):
                put(str(v.RECOUNT_OUTCOMES.relative_to(root)), encoded(doc))
                return v.recount_outcomes(names, set(names) if admitted is None else admitted)
            record('positive_complete_outcome_reader_with_injected_admitted_set', lambda: outcomes(outcome_doc))
            # Astra A01: one defect per case, from the same complete parent.
            # These helper positives inject prior admissions; they grant none.
            for label, field, value, message in [
                ('outcomes_rows_type', 'rows', 1, 'recount outcomes snapshot identity mismatch'),
                ('outcomes_row_type', 'row', [], 'recount outcomes must name each exact member once in sorted order')]:
                outcomes(outcome_doc)
                bad = copy.deepcopy(outcome_doc)
                if field == 'row': bad['rows'][0] = value
                else: bad[field] = value
                record('negative_' + label, lambda bad=bad, message=message:
                       exact_refusal(lambda: outcomes(bad), message))
            for label, mutate in [
                ('schema_id', lambda d: d.__setitem__('schema_id', 'wrong.schema')),
                ('receipt_sha256', lambda d: d.__setitem__('recount_receipt_sha256', '0' * 64)),
                ('registered_extra_field', lambda d: d['rows'][0].__setitem__('extra', 'not allowed')),
            ]:
                outcomes(outcome_doc)
                bad = copy.deepcopy(outcome_doc)
                mutate(bad)
                record('negative_outcome_' + label, lambda bad=bad: outcomes(bad), True)
            for label, mutate in [
                ('missing_name', lambda d: d['rows'].pop()),
                ('duplicate_name', lambda d: d['rows'].__setitem__(1, copy.deepcopy(d['rows'][0]))),
                ('extra_name', lambda d: d['rows'].append({'event_type': 'foreign.name', 'outcome': 'registered'})),
                ('mixed_snapshot', lambda d: d.__setitem__('recount_list_sha256', '0' * 64)),
                ('unknown_outcome', lambda d: d['rows'][0].__setitem__('outcome', 'PASS')),
            ]:
                doc = copy.deepcopy(outcome_doc)
                mutate(doc)
                if label == 'extra_name':
                    doc['rows'].sort(key=lambda row: row['event_type'])
                    admitted = set(names) | {'foreign.name'}
                    record('negative_outcome_extra_name', lambda doc=doc, admitted=admitted:
                           exact_refusal(lambda: outcomes(doc, admitted),
                                         'recount outcomes must name each exact member once in sorted order'))
                else:
                    record('negative_outcome_' + label, lambda doc=doc: outcomes(doc), True)
            put(str(v.RECOUNT_OUTCOMES.relative_to(root)), encoded(outcome_doc))
            record('negative_missing_complete_admission_record', lambda: v.recount_outcomes(names, set(names[1:])), True)
            card_raw = ('Decision required: ' + names[0]).encode()
            card_path = 'reports/card.md'
            put(card_path, card_raw)
            doc = copy.deepcopy(outcome_doc)
            doc['rows'][0] = {'event_type': names[0], 'outcome': 'decision_card', 'card': {'path': card_path, 'sha256': sha(card_raw)}}
            record('negative_complete_card_still_unresolved', lambda: outcomes(doc), True, 'cards unresolved')
            bad = copy.deepcopy(doc)
            bad['rows'][0]['card']['sha256'] = '0' * 64
            record('negative_card_fingerprint', lambda: outcomes(bad), True, 'card fingerprint')
            bad_card = copy.deepcopy(doc)
            bad_card['rows'][0]['card'] = 1
            record('negative_card_type', lambda: exact_refusal(lambda: outcomes(bad_card),
                   'recount decision card incomplete: ' + names[0]))
            # Cycle 5 B02: require the malformed-card diagnostic while the
            # independent terminal unresolved-card rule remains enabled.
            card_parent = copy.deepcopy(doc)
            card_alias = root / 'Plans/fixture-card.md'
            card_alias.symlink_to(root / card_path)
            try:
                for label, mutate, message in [
                    ('extra_row_key', lambda d: d['rows'][0].__setitem__('extra', 'not allowed'),
                     'recount decision card incomplete: '),
                    ('Plans_symlink_path', lambda d: d['rows'][0]['card'].__setitem__(
                        'path', 'Plans/fixture-card.md'), 'recount decision card path invalid: '),
                    ('extra_pin_key', lambda d: d['rows'][0]['card'].__setitem__(
                        'extra', 'not allowed'), 'recount decision card path invalid: '),
                    ('missing_event_name', lambda d: d['rows'][0]['card'].__setitem__(
                        'sha256', sha(b'Decision required.')), 'recount decision card fingerprint/name mismatch: '),
                ]:
                    bad = copy.deepcopy(card_parent)
                    mutate(bad)
                    def malformed_card(bad=bad, label=label):
                        put(card_path, card_raw)
                        try:
                            outcomes(card_parent)
                        except ValueError as exc:
                            assert str(exc) == 'recount decision cards unresolved: ' + json.dumps([names[0]])
                        else:
                            raise AssertionError('valid diagnostic card must remain unresolved')
                        if label == 'missing_event_name':
                            put(card_path, b'Decision required.')  # Observational SHA follows the bytes.
                        return outcomes(bad)
                    record('negative_card_' + label, malformed_card,
                           True, message + names[0])
            finally:
                card_alias.unlink()
                put(card_path, card_raw)
            # Existing exclusion vocabulary: own decision and exact hashed owner span.
            own_section = ('### DL-998: Exclusion for ' + names[0] + '\n\n' + names[0] + ' is excluded.\n\n').encode()
            decision_path = root / 'Plans/Decision_Log.md'
            decision_path.write_bytes(decision_path.read_bytes() + own_section)
            evidence_raw = (names[0] + ' has no live persisted writer.\n').encode()
            put('Plans/fixture-owner.md', evidence_raw)
            excluded = copy.deepcopy(outcome_doc)
            excluded['rows'][0] = {
                'event_type': names[0], 'outcome': 'excluded', 'disposition': 'RECLASSIFY_TO_EXCLUDED',
                'decision_ref': 'Plans/Decision_Log.md#DL-998',
                'decision_section_sha256': sha(own_section), 'rationale': 'Fixture own exclusion.',
                'source_citations': [{'path': 'Plans/fixture-owner.md', 'sha256': sha(evidence_raw), 'line_start': 1, 'line_end': 1}]}
            admitted_rest = set(names[1:])
            record('positive_exclusion_own_decision_and_evidence', lambda: outcomes(excluded, admitted_rest))
            for label, field, value, message in [
                ('rationale_type', 'rationale', 1, 'incomplete or contradictory recount exclusion: '),
                ('decision_ref_type', 'decision_ref', 1, 'recount exclusion decision missing: '),
                ('citations_type', 'source_citations', 1, 'recount exclusion evidence missing: '),
                ('citation_type', 'citation', ['path', 'sha256', 'line_start', 'line_end'],
                 'malformed recount exclusion citation: ')]:
                outcomes(excluded, admitted_rest)
                bad = copy.deepcopy(excluded)
                if field == 'citation': bad['rows'][0]['source_citations'][0] = value
                else: bad['rows'][0][field] = value
                record('negative_' + label, lambda bad=bad, message=message: exact_refusal(
                    lambda: outcomes(bad, admitted_rest), message + names[0]))
            # Cycle 5 B01: a reversed negative slice end can retain the event
            # token. Only line_end changes from this coherent two-line parent.
            two_line_raw = evidence_raw + b'Second evidence line.\n'
            two_line_parent = copy.deepcopy(excluded)
            two_line_parent['rows'][0]['source_citations'][0]['sha256'] = sha(two_line_raw)
            put('Plans/fixture-owner.md', two_line_raw)
            try:
                record('positive_exclusion_two_line_order_parent',
                       lambda: outcomes(two_line_parent, admitted_rest))
                bad = copy.deepcopy(two_line_parent)
                bad['rows'][0]['source_citations'][0]['line_end'] = -1
                record('negative_exclusion_line_end_negative', lambda: outcomes(bad, admitted_rest),
                       True, 'recount exclusion evidence fingerprint/span mismatch: ' + names[0])
            finally:
                put('Plans/fixture-owner.md', evidence_raw)
            for label, mutate in [
                ('extra_field', lambda d: d['rows'][0].__setitem__('extra', 'not allowed')),
                ('disposition', lambda d: d['rows'][0].__setitem__('disposition', 'KEEP_REGISTERED')),
                ('citation_extra_field', lambda d: d['rows'][0]['source_citations'][0].__setitem__('extra', 'not allowed')),
            ]:
                outcomes(excluded, admitted_rest)
                bad = copy.deepcopy(excluded)
                mutate(bad)
                record('negative_exclusion_' + label, lambda bad=bad: outcomes(bad, admitted_rest), True)
            # Cycle 7 C7-B02: a fully valid exclusion shape with an unknown outcome tag.
            outcomes(excluded, admitted_rest)
            bad_tag = copy.deepcopy(excluded)
            bad_tag['rows'][0]['outcome'] = 'review_unknown_exclusion'
            record('negative_exclusion_unknown_outcome_tag', lambda: outcomes(bad_tag, admitted_rest),
                   True, 'unknown recount outcome')

            alias = root / 'alias-owner.md'
            alias.symlink_to(root / 'Plans/fixture-owner.md')
            try:
                for label, mutate in [
                    ('decision_ref_grammar', lambda d: d['rows'][0].__setitem__('decision_ref', 'Wrong/Decision_Log.md#DL-998')),
                    ('lexical_Plans_prefix', lambda d: d['rows'][0]['source_citations'][0].__setitem__('path', 'alias-owner.md')),
                    ('line_end_boolean', lambda d: d['rows'][0]['source_citations'][0].__setitem__('line_end', True)),
                    ('line_start_zero', lambda d: d['rows'][0]['source_citations'][0].__setitem__('line_start', 0)),
                ]:
                    outcomes(excluded, admitted_rest)
                    bad = copy.deepcopy(excluded)
                    mutate(bad)
                    record('negative_exclusion_' + label, lambda bad=bad: outcomes(bad, admitted_rest), True)
            finally:
                alias.unlink()

            # Change the decision token alone; synchronize its observational hash.
            # Own-name source evidence and every other decision field stay valid.
            outcomes(excluded, admitted_rest)
            decision_raw = decision_path.read_bytes()
            sibling_section = own_section.replace(names[0].encode(), (names[0] + '.other').encode())
            bad = copy.deepcopy(excluded)
            bad['rows'][0]['decision_section_sha256'] = sha(sibling_section)
            try:
                decision_path.write_bytes(decision_raw[:-len(own_section)] + sibling_section)
                record('negative_exclusion_decision_dotted_sibling',
                       lambda: outcomes(bad, admitted_rest), True, 'decision fingerprint/name mismatch')
            finally:
                decision_path.write_bytes(decision_raw)

            outcomes(excluded, admitted_rest)
            prefixed_section = own_section.replace(names[0].encode(), ('x' + names[0]).encode())
            bad = copy.deepcopy(excluded)
            bad['rows'][0]['decision_section_sha256'] = sha(prefixed_section)
            try:
                decision_path.write_bytes(decision_raw[:-len(own_section)] + prefixed_section)
                record('negative_exclusion_decision_prefix', lambda: outcomes(bad, admitted_rest),
                       True, 'decision fingerprint/name mismatch')
            finally:
                decision_path.write_bytes(decision_raw)

            # The relative spelling, bytes, digest, span and name remain valid.
            # Only the resolved evidence location moves outside Plans.
            outcomes(excluded, admitted_rest)
            evidence_path = root / 'Plans/fixture-owner.md'
            outside = put('fixture-source-bytes/exclusion-owner.md', evidence_raw)
            evidence_path.unlink()
            try:
                evidence_path.symlink_to(outside)
                record('negative_exclusion_evidence_symlink_outside_Plans',
                       lambda: outcomes(excluded, admitted_rest), True, 'evidence escapes Plans')
            finally:
                evidence_path.unlink()
                evidence_path.write_bytes(evidence_raw)
            for label, spelling in [('prefix', 'x' + names[0]), ('suffix', names[0] + '_other'),
                                     ('dotted_sibling', names[0] + '.other')]:
                raw = (spelling + ' has no live persisted writer.\n').encode()
                put('Plans/fixture-owner.md', raw)
                bad = copy.deepcopy(excluded)
                bad['rows'][0]['source_citations'][0]['sha256'] = sha(raw)
                record('negative_exclusion_' + label, lambda bad=bad: outcomes(bad, admitted_rest),
                       True, 'evidence fingerprint/span mismatch')
            put('Plans/fixture-owner.md', evidence_raw)
            for label, mutate in [
                ('decision_sha', lambda d: d['rows'][0].__setitem__('decision_section_sha256', '0' * 64)),
                ('evidence_sha', lambda d: d['rows'][0]['source_citations'][0].__setitem__('sha256', '0' * 64)),
                ('citation_boolean', lambda d: d['rows'][0]['source_citations'][0].__setitem__('line_start', True)),
                ('citation_float', lambda d: d['rows'][0]['source_citations'][0].__setitem__('line_start', 1.0)),
                ('citation_span', lambda d: d['rows'][0]['source_citations'][0].__setitem__('line_end', 2)),
                ('missing_evidence', lambda d: d['rows'][0].__setitem__('source_citations', [])),
                ('missing_rationale', lambda d: d['rows'][0].__setitem__('rationale', '')),
            ]:
                bad = copy.deepcopy(excluded)
                mutate(bad)
                record('negative_exclusion_' + label, lambda bad=bad: outcomes(bad, admitted_rest), True)
            record('negative_registered_and_excluded_contradiction', lambda: outcomes(excluded), True, 'contradictory')
            def single_snapshot():
                for named in [{}, {'recount': {'complete': True}}, {'august_result_before_recount': {'pass': True}}]:
                    assert v.build_receipt(True, True, [], {}, {}, named, True)['pass'] is False
                named = {'recount': {'complete': True}, 'august_result_before_recount': {'pass': True}}
                assert v.build_receipt(True, True, [], {}, {}, named, True)['pass'] is True
                assert v.build_receipt(True, True, [{'error': 'anything'}], {}, {}, named, True)['pass'] is False
                assert v.build_receipt(False, True, [], {}, {}, named, True)['pass'] is False
                # The newly added bool() must retain a boolean result even when
                # an explicitly supplied false value is integer zero.
                assert v.build_receipt(True, True, [], {}, {}, named, 0)['pass'] is False
            record('combined_result_boolean_and_single_snapshot_refusals', single_snapshot)
            named_parent = {'recount': {'complete': True}, 'august_result_before_recount': {'pass': True}}
            for label, index, field in [
                ('explicit_overall_false', 6, 'pass'), ('depth_false', 1, 'pass'),
                ('recount_false', None, 'pass'), ('August_false', None, 'pass'),
                ('denominator_observation_false', 0, 'complete_denominator_known'),
                ('depth_observation_false', 1, 'contract_depth_complete'),
            ]:
                args = [True, True, [], {}, {}, copy.deepcopy(named_parent), True]
                assert v.build_receipt(*args)[field] is True
                if index is not None:
                    args[index] = False
                elif label == 'recount_false':
                    args[5]['recount']['complete'] = False
                else:
                    args[5]['august_result_before_recount']['pass'] = False
                def refuses_false(args=args, field=field):
                    if v.build_receipt(*args)[field] is False:
                        raise ValueError('builder false ' + field)
                record('negative_builder_' + label, refuses_false, True)

            # Execute the actual main bytecode at its recount seam, supplying
            # a passing August result. Preserve the four production clauses and
            # their jumps; bypass only the earlier August computation and later
            # receipt I/O. No live approval run or executable file is changed.
            # CA2-C12-N05: the seam lines come from the AST of the one binding of
            # main (the recount_validation call and the next fail_errors
            # assignment), not from fixed line numbers.
            main_def = top_functions(ast.parse((root / REL).read_bytes().decode()))['main']
            assert v.main.__code__.co_firstlineno == function_span(main_def)[0]
            seam_start = next(n.lineno for n in main_def.body if isinstance(n, ast.Assign)
                              and isinstance(n.value, ast.Call) and isinstance(n.value.func, ast.Name)
                              and n.value.func.id == 'recount_validation')
            seam_stop = next(n.lineno for n in main_def.body if isinstance(n, ast.Assign) and n.lineno > seam_start
                             and any(isinstance(t, ast.Name) and t.id == 'fail_errors' for t in n.targets))
            def main_flags(complete, august_values=None):
                code = v.main.__code__
                instructions = list(dis.get_instructions(v.main))
                start = next(i.offset for i in instructions if i.positions.lineno == seam_start)
                stop = next(i.offset for i in instructions if i.positions.lineno == seam_stop)
                body = bytearray(code.co_code)
                body[:start] = bytes([dis.opmap['NOP'], 0]) * (start // 2)
                fields = ['complete_denominator_known', 'contract_depth_complete', 'overall_pass', 'named']
                tail = bytearray()
                for field in fields:
                    index = code.co_varnames.index(field)
                    assert index < 256
                    tail.extend([dis.opmap['LOAD_FAST'], index])
                tail.extend([dis.opmap['BUILD_TUPLE'], 4, dis.opmap['RETURN_VALUE'], 0])
                body[stop:] = tail
                seam = types.FunctionType(code.replace(co_code=bytes(body),
                    co_argcount=code.co_nlocals, co_posonlyargcount=0,
                    co_kwonlyargcount=0, co_exceptiontable=b''), v.main.__globals__)
                args = [None] * code.co_nlocals
                supplied = {'named': {'seal_prerequisites_met': True,
                                      'seal_prerequisites_blocking_errors': []},
                            'overall_pass': True, 'complete_denominator_known': True,
                            'contract_depth_complete': True, 'failures': [], 'post_august_admitted': set()}
                supplied.update(copy.deepcopy(august_values or {}))
                for field, value in supplied.items():
                    args[code.co_varnames.index(field)] = value
                old_recount = v.recount_validation
                v.recount_validation = lambda admitted: (
                    {'complete': complete}, [] if complete else
                    [{'error': 'recount_change_receipt_invalid', 'detail': 'fixture receipt invalid'}])
                try:
                    return dict(zip(fields, seam(*args)))
                finally:
                    v.recount_validation = old_recount
            for field in ['complete_denominator_known', 'contract_depth_complete', 'overall_pass', 'seal_prerequisites_met']:
                def refuses_incomplete(field=field):
                    # The parent runs inside record() (CA2-C12-N05): a broken seam fails this test only.
                    parent = main_flags(True)
                    assert (parent['named'][field] if field == 'seal_prerequisites_met' else parent[field]) is True
                    flags = main_flags(False)
                    result = flags['named'][field] if field == 'seal_prerequisites_met' else flags[field]
                    if result is False:
                        raise ValueError('main refuses incomplete recount: ' + field)
                record('negative_main_incomplete_' + field, refuses_incomplete, True)

            for field in ['complete_denominator_known', 'contract_depth_complete', 'overall_pass', 'seal_prerequisites_met']:
                def refuses_August_false(field=field):
                    assert (main_flags(True)['named'][field] if field == 'seal_prerequisites_met'
                            else main_flags(True)[field]) is True
                    supplied = ({'named': {'seal_prerequisites_met': False,
                                           'seal_prerequisites_blocking_errors': []}}
                                if field == 'seal_prerequisites_met' else {field: False})
                    flags = main_flags(True, supplied)
                    result = flags['named'][field] if field == 'seal_prerequisites_met' else flags[field]
                    if result is False:
                        raise ValueError('main refuses false August input: ' + field)
                record('negative_main_August_' + field, refuses_August_false, True)

            # The aggregate's positive uses the real frozen sources, coherent
            # fourth receipt and complete helper outcomes with prior admissions.
            os.environ['PM_EA_RECOUNT_SOURCE_MAP'] = str(source_map)
            put(v.RECOUNT_RECEIPT, frozen_receipt)
            v.RECOUNT_RECEIPT_SHA = sha(frozen_receipt)
            put(v.RECOUNT_CHANGE, encoded(change))
            anchors()

            outcomes(outcome_doc)
            state, issues = v.recount_validation(set(names))
            assert state['complete'] is True and issues == [], (state, issues)
            bad = copy.deepcopy(outcome_doc)
            bad['schema_id'] = 'wrong.schema'
            put(str(v.RECOUNT_OUTCOMES.relative_to(root)), encoded(bad))
            def aggregate_issue(code, detail):
                state, issues = v.recount_validation(set(names))
                assert state['complete'] is False, state
                assert state['diagnostic_only'] is True, state
                assert issues == [{'error': code, 'detail': detail}], issues
                if code == 'recount_change_receipt_invalid':
                    assert 'change_receipt_sha256' not in state, state
                    assert state['outcomes']['complete'] is True, state
                else:
                    assert state['change_receipt_sha256'] == sha((root / v.RECOUNT_CHANGE).read_bytes()), state
                    assert 'outcomes' not in state, state
            record('negative_aggregate_input_issue', lambda: aggregate_issue(
                'recount_input_or_outcome_invalid', 'recount outcomes snapshot identity mismatch'))
            outcomes(outcome_doc)
            assert v.recount_validation(set(names))[0]['complete'] is True
            bad = copy.deepcopy(change)
            bad['authority_ref'] = 'Plans/Decision_Log.md#DL-450'
            put(v.RECOUNT_CHANGE, encoded(bad))
            anchors()
            record('negative_aggregate_receipt_issue', lambda: aggregate_issue(
                'recount_change_receipt_invalid', 'fourth amendment identity, authority, byte link or anchor mismatch'))
            put(v.RECOUNT_CHANGE, encoded(change))
            anchors()
            for label, path, code in [
                ('aggregate_receipt_oserror', root / v.RECOUNT_CHANGE, 'recount_change_receipt_invalid'),
                ('aggregate_input_oserror', v.RECOUNT_OUTCOMES, 'recount_input_or_outcome_invalid')]:
                assert v.recount_validation(set(names))[0]['complete'] is True
                raw = path.read_bytes()
                path.unlink()
                record('negative_' + label, lambda path=path, code=code: aggregate_issue(
                    code, str(FileNotFoundError(2, 'No such file or directory', str(path)))))
                path.write_bytes(raw)

            # Remaining defensive dispatch alternatives use one explicit
            # dependency fault, rather than malformed multi-defect JSON. The
            # real-file controls above independently cover OSError/ValueError.
            def dependency_fault(dependency, fault, action, source=None):
                original = getattr(v, dependency)
                def fail(*args, **kwargs):
                    if source is None or args[0] == source:
                        raise fault('fixture dependency fault')
                    return original(*args, **kwargs)
                setattr(v, dependency, fail)
                try:
                    action()
                finally:
                    setattr(v, dependency, original)
            for kind in [TypeError, KeyError]:
                record('negative_third_dispatch_' + kind.__name__, lambda kind=kind:
                       dependency_fault('recount_object', kind, live_fallback))
                record('negative_aggregate_receipt_dispatch_' + kind.__name__, lambda kind=kind:
                       dependency_fault('recount_change_state', kind, lambda: aggregate_issue(
                           'recount_change_receipt_invalid', str(kind('fixture dependency fault')))))
                record('negative_aggregate_input_dispatch_' + kind.__name__, lambda kind=kind:
                       dependency_fault('recount_frozen_inputs', kind, lambda: aggregate_issue(
                           'recount_input_or_outcome_invalid', str(kind('fixture dependency fault')))))
            record('negative_aggregate_input_dispatch_SubprocessError', lambda:
                   dependency_fault('recount_frozen_inputs', subprocess.SubprocessError,
                       lambda: aggregate_issue('recount_input_or_outcome_invalid', 'fixture dependency fault')))
            record('negative_custody_dispatch_TypeError', lambda:
                   dependency_fault('recount_source_bytes', TypeError,
                       lambda: exact_refusal(v.recount_frozen_inputs,
                           'recount source custody failed: ' + json.dumps([
                               {'source': source_key, 'error': 'fixture dependency fault'}], sort_keys=True)),
                       source_key))

            for label, path in [('parent', '../Plans/x'), ('absolute', '/etc/passwd'),
                                ('empty_segment', 'Plans//x'), ('dot_segment', 'Plans/./x'),
                                ('control', 'Plans/x\n/y'), ('DEL', 'Plans/x\x7f/y'), ('backslash', 'Plans\\x'), ('colon', 'git:bad')]:
                record('negative_unsafe_source_path_' + label, lambda path=path: v.recount_relative(path), True)
        finally:
            for key, value in original_env.items():
                if value is None: os.environ.pop(key, None)
                else: os.environ[key] = value
    record('positive_complete_predicate_coverage', lambda: check_coverage(repo, {r['name'] for r in results}))
    record('positive_ast_class_table', lambda: check_ast_class_table(repo))
    record('positive_exhaustive_node_type_inventory', check_node_types)
    record('positive_occurrence_map_controls', check_occurrence_map)
    for label in PRESERVATION_PROBES:
        record('negative_preserved_' + label, lambda label=label:
               check_preservation_probe(repo, {r['name'] for r in results}, label))
    for label, statement, function in [
        ('isinstance_assignment', "state['complete'] = isinstance(issues, list)", 'recount_validation'),
        ('boolean_bitand_assignment', "state['complete'] = state['complete'] & state['diagnostic_only']", 'recount_validation'),
        ('builder_boolean_bitor', "overall_pass = overall_pass | isinstance(named.get('review_extra'), dict)", 'build_receipt'),
    ]:
        record('negative_unlisted_' + label, lambda statement=statement, function=function:
               check_insertion_probe(repo, {r['name'] for r in results}, statement, function))
    # Round 11: the operator census, changed lines and deleted lines, the module
    # unit, and the class table; each must fail coverage on its own rule.
    for label in EDIT_PROBES:
        record('negative_' + label, lambda label=label: check_edit_probe(repo, {r['name'] for r in results}, label))
    for label in CLASS_TABLE_PROBES:
        record('negative_' + label, lambda label=label:
               check_class_table_probe(repo, {r['name'] for r in results}, label))
    # Round 12: the binding rules hold on V and CA-SEAL, the total-table
    # controls, and the stopping bar's control: random single-line edits of V
    # with the committed table byte-identical each fail coverage.
    record('positive_module_scope_rules_on_V_and_CA_SEAL', lambda: check_module_scope_rules(repo))
    record('positive_total_table_controls', check_total_table_controls)
    record('negative_random_single_line_edits', lambda: check_random_edits(repo, {r['name'] for r in results}))
    summary = {'status': 'pass' if all(r['pass'] for r in results) else 'fail', 'checks': len(results),
               'passed': sum(r['pass'] for r in results), 'failed': sum(not r['pass'] for r in results),
               'real_frozen_source_custody': custody, 'results': results,
               'limits': ['No final approval, admission, live seal or all-green August main run is claimed.',
                          'Outcome positives inject the existing admitted set; they do not create or waive admission records.',
                          'Guard-removal inventory belongs to the shared-tool sweep; no lane-local proof engine is claimed.']}
    output.write_text(json.dumps(summary, indent=2) + '\n')
    print(json.dumps({k: summary[k] for k in ['status', 'checks', 'passed', 'failed']}))
    for row in results:
        if not row['pass']: print(json.dumps(row))
    return 0 if summary['status'] == 'pass' else 1


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument('--source-map', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    raise SystemExit(run(args.repo.resolve(), args.out, args.source_map.resolve()))
