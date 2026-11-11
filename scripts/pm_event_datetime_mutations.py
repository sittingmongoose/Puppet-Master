"""Gate-bar self-check for the CV-1101 date-time gate: AST sites and owner rules.

The date-time code is pm_event_datetime (the predicate, format checker and
runtime admission), pm_event_datetime_inventory (the inventory, the scan and
the gate, StorageSelection) and pm_event_datetime_value_probe (the value probe,
the timestamp-only and deciding checks, closure, automatic credit and the role
check). mutation_points() enumerates, from their AST:

- every refusal site, keyed by its refusal code;
- every guard predicate: each single-predicate weakening of an if or
  conditional-expression guard of a refusal site, and of a credit site (a
  statement that grants non-timestamp credit or exempts a container);
- every comparison boundary (<, <=, > and >=).

Each point has one mutant that disables or weakens it. The committed set
(pm_event_datetime_mutations.json) names, for every point, a witness that the
mutant makes fail, or a declared survivor with its reason. The rules table in
the same file has one row per statement of the owner text (CV-1101 and the
adoption guide's date-time blocks, which carry FIX11's final rule and the
rules of the briefs that followed); each row names witnessed rules or says why
no mutation applies.

--self-test (and the --scope all self-test, through regression_checks) checks
that the committed set is fresh: no new or stale point, no refusal alias, no
statement without a row, no stale row, no unnamed rule, every hand-written
mutation applies once and names its rule. --mutations replays every mutant.
A mutant is built in memory as fresh module objects; files are never written.
Its witness (a self-check of pm_event_datetime_selfcheck, or a date-time case
of the shared corpus) runs alone under the mutant. A declared survivor must
survive every self-check and every date-time corpus case. A mutant that does
not build, or a harness that raises, is never counted as caught.
"""
from __future__ import annotations

import argparse
import ast
from contextlib import contextmanager
import hashlib
import json
from pathlib import Path
import re
import sys
import time
import types

ROOT = Path(__file__).resolve().parents[1]
MUTATION_SET = "scripts/pm_event_datetime_mutations.json"
TARGETS = ("pm_event_datetime", "pm_event_datetime_inventory", "pm_event_datetime_value_probe")
FAMILIES = {
    # T71 (REVIEW-numrule-tb3-opus finding 6): the regex families (regex_points)
    "regex_pattern": "Each flag of a module-level re.compile, dropped; and each character class of its pattern widened "
                     "one step: each [0-9] to \\d and each unescaped + quantifier outside a class to *.",
    "regex_match_kind": "Each fullmatch or search call on re or on a module-level compiled pattern, made a match call.",
    "refusal_site": "Every way the date-time code emits a refusal: each raise statement, each _refuse(...) "
                    "call, each call to a local error sink (a nested function that appends to errors: fail, "
                    "unsupported), each error record (a dict literal with an \"error\" key), each errors.extend, "
                    "each error-code tuple a function returns, each \"status\": \"fail\" constant, and each "
                    "withholding call of the value probe (dependencies.append, unproven.add, dialects.update, "
                    "dynamic.update), which records a reason to withhold credit. The "
                    "mutant disables that one site: a raise becomes pass, a call becomes None, the list or "
                    "comprehension holding an error record becomes [], an error tuple becomes (), and \"fail\" "
                    "becomes \"pass\", and a withholding call becomes None.",
    "refusal_predicate": "Every predicate of an if or conditional-expression guard of a refusal site (each "
                         "enclosing guard up to the function, the else branch included with the opposite "
                         "polarity) where dropping that predicate alone makes the refusal fire less often: an "
                         "or-operand that leads to the refusal becomes False, an and-operand that prevents it "
                         "becomes True, and an element of a literal tuple scanned by any()/all() or tested "
                         "with in/not in is dropped.",
    "credit_predicate": "Every predicate of the guard of a credit site, and of the value of a credit "
                        "assignment, where dropping that predicate alone grants the credit more often. Credit "
                        "sites are the committed credit names: deciding_nodes and timestamp_only_nodes entries, "
                        "the static, all_refused, automatic, credited and on_value_path assignments of the value "
                        "probe, and the used.add exemption of the scan.",
    "comparison_boundary": "Every <, <=, > and >= in the date-time code. The mutant flips strictness (< and "
                           "<=, > and >=), the off-by-one at that range or limit boundary.",
    # T41 (tool batch 3): the data the guards read, not only the guards (REVIEW-datetime-fix16-opus finding 3).
    "data_table_entry": "Every entry of a module-level constant table: a tuple, list or set display, or a frozenset, "
                        "set, tuple or list of one, or a dict display (the leap-second table, the profiles, the "
                        "timestamp fields, the keyword sets, the 16 non-timestamp controls and the sweep zones). The "
                        "mutant drops that one entry.",
    "data_loop_member": "Every element of a literal tuple, list or set that a for loop or a comprehension iterates, "
                        "when the loop holds a refusal, withholding or credit site or calls a function that does "
                        "(the sibling-dependency keywords, the reference keywords, the applicator keywords). The "
                        "mutant drops that one element.",
    "data_flag_operand": "Every operand of a Boolean expression assigned (=, |=, &=, :=) to a local name that a refusal "
                         "or credit guard of the same function reads (the Storage quote's flag). The mutant makes "
                         "an and-operand True or an or-operand False: that clause of the flag is dropped.",
    "data_value_arithmetic": "Every arithmetic operator (+, -, *, //) and integer constant in a value assigned to a "
                             "local name that a refusal or credit guard of the same function reads, in a module-level "
                             "derived table, and in a module-level helper without refusal sites that one of them "
                             "calls (the day arithmetic): + and - are swapped, * and // are swapped, an integer "
                             "constant and each range() bound gain one.",
    "data_collection_build": "Every add, update, append or extend call on a local collection in a module-level "
                             "function without refusal sites that returns a local collection a refusal reads (the "
                             "loadable-resource set): the mutant disables that one call.",
    "data_walk_domain": "Every for loop over a computed collection whose body holds a refusal site (every resource "
                        "verify_resources walks, every inventory row, every citation): the mutant walks only the "
                        "first item.",
}
# Names through which the date-time code emits a refusal. refusal_alias_problems
# refuses any other use of them, so every site stays a direct, enumerable call,
# raise or record.
REFUSAL_CALLS = ("_refuse",)
REFUSAL_CLASSES = ("Refusal", "DatetimeAdmissionError")
SINK_LIST = "errors"
# Credit sites, by module: list appends, set adds and assignments whose guard or
# value grants non-timestamp credit or exempts a container from the scan.
CREDIT = {
    "pm_event_datetime_value_probe": {"append": ("deciding", "timestamp_only"),
                                      "assign": ("static", "all_refused", "automatic", "credited",
                                                 "on_value_path")},
    "pm_event_datetime_inventory": {"add": ("used",)},
}
# Withholding sites, by module: calls that record a reason to withhold credit
# (a sibling dependency, an unproven keyword, a dialect or a dynamic-scope
# keyword of the closure). They are refusal sites: disabling one grants credit.
WITHHOLD = {
    "pm_event_datetime_value_probe": (("dependencies", "append"), ("unproven", "add"), ("dialects", "update"),
                                      ("dynamic", "update")),
}
_FLIPPED = {ast.Lt: ast.LtE, ast.LtE: ast.Lt, ast.Gt: ast.GtE, ast.GtE: ast.Gt}


def _ordered(nodes):
    return sorted(nodes, key=lambda n: (n.lineno, n.col_offset, n.end_lineno, n.end_col_offset))


def _parent_map(tree):
    parents = {}
    for node in ast.walk(tree):
        for child in ast.iter_child_nodes(node):
            parents[child] = node
    return parents


def _qualname(node, parents):
    names = []
    while node in parents:
        node = parents[node]
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            names.append(node.name)
    return ".".join(reversed(names)) or "<module>"


def _function(node, parents):
    while node in parents:
        node = parents[node]
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda)):
            return node
    return None


def _guards(node, parents):
    """(guard test, polarity) for each if or conditional expression guarding node.

    Innermost first, up to the enclosing function. Polarity is True when node
    runs only if the test is true (the body), False for the else branch.
    """
    guards = []
    while node in parents:
        parent = parents[node]
        if isinstance(parent, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda, ast.ClassDef)):
            break
        if isinstance(parent, ast.If) and node is not parent.test:
            guards.append((parent.test, any(node is stmt for stmt in parent.body)))
        elif isinstance(parent, ast.IfExp) and node is not parent.test:
            guards.append((parent.test, node is parent.body))
        node = parent
    return guards


def _weakenings(expr, positive):
    """(action, node, detail) for each single-predicate change of a guard.

    positive=True makes the expression true less often (an or-operand becomes
    False, an element of an any() tuple or an in-tuple is dropped); positive=False
    makes it true more often (an and-operand becomes True, an element of an all()
    tuple or a not-in tuple is dropped). Negation flips the direction.
    """
    if isinstance(expr, ast.UnaryOp) and isinstance(expr.op, ast.Not):
        yield from _weakenings(expr.operand, not positive)
    elif isinstance(expr, ast.BoolOp):
        weak = (False if positive else None) if isinstance(expr.op, ast.Or) else (None if positive else True)
        for operand in expr.values:
            if weak is not None:
                yield ("false" if weak is False else "true"), operand, weak
            yield from _weakenings(operand, positive)
    elif (isinstance(expr, ast.Call) and isinstance(expr.func, ast.Name) and expr.func.id in ("any", "all")
          and len(expr.args) == 1 and isinstance(expr.args[0], ast.GeneratorExp)):
        generator = expr.args[0]
        yield from _weakenings(generator.elt, positive)
        scanned = generator.generators[0].iter
        if isinstance(scanned, ast.Tuple) and len(scanned.elts) > 1 and (expr.func.id == "any") == positive:
            for position in range(len(scanned.elts)):
                yield "drop", scanned, position
    elif (isinstance(expr, ast.Compare) and len(expr.ops) == 1 and isinstance(expr.ops[0], (ast.In, ast.NotIn))
          and isinstance(expr.comparators[0], ast.Tuple) and len(expr.comparators[0].elts) > 1
          and isinstance(expr.ops[0], ast.In) == positive):
        for position in range(len(expr.comparators[0].elts)):
            yield "drop", expr.comparators[0], position


def _sinks(tree):
    """Nested functions that append to the errors list: their calls are refusal sites."""
    sinks = set()
    for function in ast.walk(tree):
        if not isinstance(function, (ast.FunctionDef, ast.AsyncFunctionDef)):
            continue
        for node in ast.walk(function):
            if node is function or not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                continue
            if any(_is_errors_call(n, ("append",)) for n in ast.walk(node)):
                sinks.add(node.name)
    return sinks


def _is_errors_call(node, methods=("append", "extend")):
    return (isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr in methods
            and isinstance(node.func.value, ast.Name) and node.func.value.id == SINK_LIST)


def _error_record(node):
    return isinstance(node, ast.Dict) and any(
        isinstance(k, ast.Constant) and k.value == "error" for k in node.keys)


def _string_bindings(function):
    """Local names bound exactly once, by a plain assignment, to a string constant."""
    if function is None:
        return {}
    counts, values = {}, {}
    for node in ast.walk(function):
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name):
                    counts[target.id] = counts.get(target.id, 0) + 1
                    if isinstance(node.value, ast.Constant) and type(node.value.value) is str:
                        values[target.id] = node.value.value
    return {name: value for name, value in values.items() if counts[name] == 1}


def _error_tuple(node, bindings):
    """The codes of a non-empty tuple literal made only of error codes, else None."""
    if not isinstance(node, ast.Tuple) or not node.elts:
        return None
    codes = []
    for element in node.elts:
        if isinstance(element, ast.Constant) and not re.fullmatch(r"[a-z][a-z0-9_]*_[a-z0-9_]+", str(element.value)):
            return None
        if isinstance(element, ast.Constant) and type(element.value) is str:
            codes.append(element.value)
        elif isinstance(element, ast.Name) and re.fullmatch(r"[a-z][a-z0-9_]*_[a-z0-9_]+", bindings.get(element.id, "")):
            codes.append(bindings[element.id])
        else:
            return None
    return codes


def _constant_text(node):
    """The leading constant text of a message: "x", "x: " + y, or f"x{y}"."""
    if isinstance(node, ast.Constant) and type(node.value) is str:
        return node.value
    if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
        return _constant_text(node.left)
    if isinstance(node, ast.JoinedStr) and node.values and isinstance(node.values[0], ast.Constant):
        return node.values[0].value
    return None


def _code(text):
    return text.split(":", 1)[0].strip() if text else "dynamic"


def _raise_reason(node):
    exc = node.exc
    if isinstance(exc, ast.Call):
        name = exc.func.id if isinstance(exc.func, ast.Name) else ast.unparse(exc.func)
        text = _constant_text(exc.args[0]) if exc.args else None
        return name + ":" + _code(text) if text is not None else name
    return "reraise" if exc is None else ast.unparse(exc)[:40]


def refusal_sites(tree, module, parents=None):
    """[(node, kind, reason)] for every refusal site, in source order."""
    parents = parents or _parent_map(tree)
    sinks = _sinks(tree)
    withhold = WITHHOLD.get(module, ())
    sites = []
    for node in ast.walk(tree):
        if (isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute)
                and isinstance(node.func.value, ast.Name) and (node.func.value.id, node.func.attr) in withhold):
            sites.append((node, "withhold_call", node.func.value.id + "." + node.func.attr))
        elif isinstance(node, ast.Raise):
            sites.append((node, "raise", _raise_reason(node)))
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in REFUSAL_CALLS:
            sites.append((node, "refuse_call", _code(_constant_text(node.args[0]) if node.args else None)))
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in sinks:
            texts = [_constant_text(a) for a in node.args]
            texts = [t for t in texts if t is not None and re.fullmatch(r"[a-z][a-z0-9_]*", t)]
            sites.append((node, "sink_call", texts[-1] if texts else "dynamic"))
        elif _is_errors_call(node, ("extend",)):
            sites.append((node, "errors_extend", "extend"))
        elif _error_record(node):
            value = next(v for k, v in zip(node.keys, node.values) if isinstance(k, ast.Constant) and k.value == "error")
            reason = _code(_constant_text(value)) if _constant_text(value) else "dynamic"
            sites.append((node, "error_record", reason))
        elif isinstance(node, ast.Dict):
            for key, value in zip(node.keys, node.values):
                if (isinstance(key, ast.Constant) and key.value == "status" and isinstance(value, ast.Constant)
                        and value.value == "fail"):
                    sites.append((value, "status_fail", "status_fail"))
        elif isinstance(node, ast.Tuple):
            codes = _error_tuple(node, _string_bindings(_function(node, parents)))
            if codes is not None and _in_return(node, parents):
                sites.append((node, "error_tuple", "+".join(codes)))
    return _ordered_sites(sites)


def _ordered_sites(sites):
    return sorted(sites, key=lambda s: (s[0].lineno, s[0].col_offset, s[0].end_lineno, s[0].end_col_offset, s[1]))


def _in_return(node, parents):
    while node in parents:
        node = parents[node]
        if isinstance(node, ast.Return):
            return True
        if isinstance(node, ast.stmt):
            return False
    return False


def credit_sites(tree, module, parents=None):
    """[(node, kind, name, guards_only)] for every credit site of the module."""
    parents = parents or _parent_map(tree)
    vocabulary = CREDIT.get(module, {})
    sites = []
    for node in ast.walk(tree):
        if (isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute)
                and isinstance(node.func.value, ast.Name)):
            method, name = node.func.attr, node.func.value.id
            if (method == "append" and name in vocabulary.get("append", ())
                    or method == "add" and name in vocabulary.get("add", ())):
                sites.append((node, method, name))
        elif isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
            if node.targets[0].id in vocabulary.get("assign", ()):
                sites.append((node, "assign", node.targets[0].id))
    return sorted(sites, key=lambda s: (s[0].lineno, s[0].col_offset))


def mutation_points(source, module):
    """Every generated mutation point of one date-time module, from its AST.

    Keys name the module, the enclosing function, the refusal code, credit
    name or predicate text and an ordinal, never a line number, so unrelated
    edits keep them stable.
    """
    tree = ast.parse(source)
    nodes = list(ast.walk(tree))
    index = {id(node): i for i, node in enumerate(nodes)}
    parents = _parent_map(tree)
    points, seen, weakened = [], {}, set()
    short = module.removeprefix("pm_event_")

    def add(family, base, node, **extra):
        seen[base] = seen.get(base, 0) + 1
        point = {"key": "%s#%d" % (base, seen[base]), "family": family, "module": module, "line": node.lineno,
                 "node": index[id(node)], **extra}
        points.append(point)
        return point["key"]

    for node, kind, reason in refusal_sites(tree, module, parents):
        name = _qualname(node, parents)
        key = add("refusal_site", "site:%s:%s:%s" % (short, name, reason), node, function=name, reason=reason,
                  action="disable_" + kind, text=ast.unparse(node)[:160])
        for test, polarity in _guards(node, parents):
            for action, target, detail in _weakenings(test, polarity):
                if (id(target), detail, action) in weakened:
                    continue  # A guard shared by several sites yields each mutant once.
                weakened.add((id(target), detail, action))
                text = ast.unparse(target.elts[detail]) if action == "drop" else ast.unparse(target)
                add("refusal_predicate", "predicate:%s:%s %s" % (key, action, text), target, function=name,
                    reason=reason, action=action, detail=detail, text=text[:160])
    for node, kind, name in credit_sites(tree, module, parents):
        function = _qualname(node, parents)
        base = "credit:%s:%s:%s" % (short, function, name)
        tests = [(node.value, False)] if kind == "assign" else []
        tests += [(test, not polarity) for test, polarity in _guards(node, parents)]
        for test, polarity in tests:
            for action, target, detail in _weakenings(test, polarity):
                if (id(target), detail, action) in weakened:
                    continue
                weakened.add((id(target), detail, action))
                text = ast.unparse(target.elts[detail]) if action == "drop" else ast.unparse(target)
                add("credit_predicate", "%s:%s %s" % (base, action, text), target, function=function,
                    reason=name, action=action, detail=detail, text=text[:160])
    for compare in _ordered([n for n in nodes if isinstance(n, ast.Compare)]):
        for position, op in enumerate(compare.ops):
            if type(op) in _FLIPPED:
                name = _qualname(compare, parents)
                text = ast.unparse(compare)
                add("comparison_boundary", "boundary:%s:%s:%s:%d" % (short, name, text, position), compare,
                    function=name, action=type(op).__name__ + "->" + _FLIPPED[type(op)].__name__,
                    detail=position, text=text[:160])
    for family, node, action, detail, text, function in data_points(tree, module, parents):
        add(family, "data:%s:%s:%s:%s %s" % (family.removeprefix("data_"), short, function, action, text), node,
            function=function, action=action, detail=detail, text=text[:160])
    for family, node, action, detail, text, function in regex_points(tree, parents):
        add(family, "regex:%s:%s:%s %s" % (short, function, action, text), node,
            function=function, action=action, detail=detail, text=text[:160])
    return points


_REGEX_CALLS = ("fullmatch", "search")


def _pattern_widenings(pattern):
    """[(kind, occurrence)] for each one-step widening of a pattern's text (T71): each [0-9] class to \\d, and each
    unescaped + quantifier outside a class to *."""
    out, count = [], {"[0-9]": 0, "+": 0}
    i, in_class = 0, False
    while i < len(pattern):
        c = pattern[i]
        if c == "\\":
            i += 2
            continue
        if pattern.startswith("[0-9]", i) and not in_class:
            out.append(("[0-9]", count["[0-9]"]))
            count["[0-9]"] += 1
            i += 5
            continue
        if c == "[" and not in_class:
            in_class = True
        elif c == "]" and in_class:
            in_class = False
        elif c == "+" and not in_class:
            out.append(("+", count["+"]))
            count["+"] += 1
        i += 1
    return out


def _widened(pattern, kind, occurrence):
    """The pattern with that one widening applied (see _pattern_widenings)."""
    seen, i, in_class = -1, 0, False
    while i < len(pattern):
        c = pattern[i]
        if c == "\\":
            i += 2
            continue
        if pattern.startswith("[0-9]", i) and not in_class:
            if kind == "[0-9]":
                seen += 1
                if seen == occurrence:
                    return pattern[:i] + "\\d" + pattern[i + 5:]
            i += 5
            continue
        if c == "[" and not in_class:
            in_class = True
        elif c == "]" and in_class:
            in_class = False
        elif c == "+" and not in_class and kind == "+":
            seen += 1
            if seen == occurrence:
                return pattern[:i] + "*" + pattern[i + 1:]
        i += 1
    raise ValueError("no such widening: %s #%d" % (kind, occurrence))


def _flag_leaves(node):
    """The flag operands of a flags argument (re.A | re.M ...), in source order."""
    if isinstance(node, ast.BinOp) and isinstance(node.op, ast.BitOr):
        return _flag_leaves(node.left) + _flag_leaves(node.right)
    return [node]


def regex_points(tree, parents):
    """[(family, node, action, detail, text, function)] of the regex family (T71, REVIEW-numrule-tb3-opus finding 6),
    in source order: each flag of a module-level re.compile dropped; each character class of its pattern widened one
    step ([0-9] to \\d, + to *); and each fullmatch or search call (re.search(...), _DATE_TIME.fullmatch(...)) made a
    match call. Pattern text, flags and match kinds had no family, and the blind sample's DT03 and DT13 lived there."""
    out = []
    for statement in tree.body:
        if not (isinstance(statement, ast.Assign) and len(statement.targets) == 1 and isinstance(statement.targets[0], ast.Name)):
            continue
        call, name = statement.value, statement.targets[0].id
        if not (isinstance(call, ast.Call) and isinstance(call.func, ast.Attribute) and call.func.attr == "compile"
                and isinstance(call.func.value, ast.Name) and call.func.value.id == "re" and call.args
                and isinstance(call.args[0], ast.Constant) and isinstance(call.args[0].value, str)):
            continue
        flags = call.args[1] if len(call.args) > 1 else next((k.value for k in call.keywords if k.arg == "flags"), None)
        leaves = _flag_leaves(flags) if flags is not None else []
        for position, leaf in enumerate(leaves):
            out.append(("regex_pattern", call, "drop_flag", position, name + " drop " + ast.unparse(leaf), "<module>"))
        # (under re.ASCII, \\d is exactly [0-9]: the one-step widening of a [0-9] class there also drops the flag, so
        # the class takes every Unicode digit, as the blind sample's DT03 did)
        ascii_flag = next((i for i, leaf in enumerate(leaves) if ast.unparse(leaf) in ("re.ASCII", "re.A")), None)
        for kind, occurrence in _pattern_widenings(call.args[0].value):
            drop = ascii_flag if kind == "[0-9]" else None
            out.append(("regex_pattern", call, "widen_class", [kind, occurrence, drop],
                        name + " widen %s #%d%s" % (kind, occurrence, " without re.ASCII" if drop is not None else ""), "<module>"))
    for node in ast.walk(tree):
        if (isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr in _REGEX_CALLS
                and isinstance(node.func.value, ast.Name) and (node.func.value.id == "re" or node.func.value.id.isupper()
                or node.func.value.id.startswith("_") and node.func.value.id[1:].isupper())):
            out.append(("regex_match_kind", node, "match_call", None, ast.unparse(node)[:120], _qualname(node, parents)))
    return sorted(out, key=lambda p: (p[1].lineno, p[1].col_offset, p[0], str(p[3]), p[4]))


_TABLE_CALLS = ("frozenset", "set", "tuple", "list")
_SWAPPED = {ast.Add: ast.Sub, ast.Sub: ast.Add, ast.Mult: ast.FloorDiv, ast.FloorDiv: ast.Mult}


def _table_display(value):
    """The literal display of a module-level constant table, or None."""
    if isinstance(value, (ast.Tuple, ast.List, ast.Set, ast.Dict)):
        return value
    if (isinstance(value, ast.Call) and isinstance(value.func, ast.Name) and value.func.id in _TABLE_CALLS
            and len(value.args) == 1 and not value.keywords and isinstance(value.args[0], (ast.Tuple, ast.List, ast.Set))):
        return value.args[0]
    return None


def _entries(display):
    """(position, text) of each entry of a display."""
    if isinstance(display, ast.Dict):
        return [(i, ast.unparse(k) if k is not None else "**" + ast.unparse(v)) for i, (k, v) in enumerate(zip(display.keys, display.values))]
    return [(i, ast.unparse(e)) for i, e in enumerate(display.elts)]


def data_points(tree, module, parents):
    """[(family, node, action, detail, text, function)] for every data point of one module (T41), in source order.

    The guards' own predicates are refusal_predicate and credit_predicate points; these are the values they read:
    constant tables, the literal keyword sets loops walk, the clauses of flags, the arithmetic of values a guard
    tests and of the helpers that compute them, the collections helpers build, and the domains refusal loops walk.
    """
    sites = [n for n, _, _ in refusal_sites(tree, module, parents)]
    credits = [n for n, _, _ in credit_sites(tree, module, parents)]
    site_ids, refusal_ids = {id(n) for n in sites + credits}, {id(n) for n in sites}
    with_sites = {f.name for f in (_function(n, parents) for n in sites + credits) if isinstance(f, (ast.FunctionDef, ast.AsyncFunctionDef))}
    top = {n.name: n for n in tree.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))}
    def holds(node):
        return any(id(x) in site_ids or (isinstance(x, ast.Call) and isinstance(x.func, ast.Name) and x.func.id in with_sites)
                   for x in ast.walk(node))
    # T71 (REVIEW-numrule-tb3-opus finding 3, DT12): the module-level helpers whose results a function with a refusal or
    # credit site reads, directly or through other helpers (declarations(), which admit, scan and validate_inventory read)
    read_by_sites, frontier = set(), [top[name] for name in with_sites if name in top]
    while frontier:
        function = frontier.pop()
        for x in ast.walk(function):
            if isinstance(x, ast.Call) and isinstance(x.func, ast.Name) and x.func.id in top and x.func.id not in read_by_sites:
                read_by_sites.add(x.func.id)
                frontier.append(top[x.func.id])
    # (a helper with refusal sites of its own counts too: declarations() raises on an unreadable regex, and its keyword
    # loop, which holds no site, decides what every refusal reading its result sees)
    def top_of(node):
        while node in parents:
            node = parents[node]
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and parents.get(node) is tree:
                return node.name
        return None
    out = []
    # constant tables
    for statement in tree.body:
        if isinstance(statement, ast.Assign) and len(statement.targets) == 1 and isinstance(statement.targets[0], ast.Name):
            display = _table_display(statement.value)
            if display is not None and len(_entries(display)) > 0:
                for position, text in _entries(display):
                    out.append(("data_table_entry", display, "drop_entry", position, statement.targets[0].id + " " + text, "<module>"))
    # literal sets loops walk
    for node in ast.walk(tree):
        loop = None
        if isinstance(node, (ast.For, ast.AsyncFor)) and isinstance(node.iter, (ast.Tuple, ast.List, ast.Set)):
            loop, display = node, node.iter
        elif isinstance(node, ast.comprehension) and isinstance(node.iter, (ast.Tuple, ast.List, ast.Set)):
            loop, display = parents[node], node.iter
        if loop is not None and (holds(loop) or top_of(loop) in read_by_sites) and len(display.elts) > 1:
            for position, text in _entries(display):
                out.append(("data_loop_member", display, "drop_entry", position, text, _qualname(display, parents)))
    # flags and values a guard reads
    guard_names = {}
    for site in sites + credits:
        function = _function(site, parents)
        for test, _ in _guards(site, parents):
            for x in ast.walk(test):
                if isinstance(x, ast.Name) and isinstance(x.ctx, ast.Load):
                    guard_names.setdefault(id(function), set()).add(x.id)
    def arithmetic(value, function, label):
        for x in ast.walk(value):
            if isinstance(x, ast.BinOp) and type(x.op) in _SWAPPED:
                out.append(("data_value_arithmetic", x, "swap_op", None, label + ": " + ast.unparse(x), function))
            elif isinstance(x, ast.Constant) and type(x.value) is int and not isinstance(parents.get(x), ast.Subscript):
                out.append(("data_value_arithmetic", x, "plus_one", None, label + ": " + ast.unparse(x) + " in " + ast.unparse(parents.get(x, x))[:80], function))
            elif (isinstance(x, ast.Call) and isinstance(x.func, ast.Name) and x.func.id == "range"):
                for position, bound in enumerate(x.args):
                    out.append(("data_value_arithmetic", bound, "plus_one", position, label + ": range bound " + ast.unparse(bound), function))
    helpers = set()
    for node in ast.walk(tree):
        if isinstance(node, (ast.Assign, ast.AugAssign, ast.NamedExpr)):
            target = node.targets[0] if isinstance(node, ast.Assign) and len(node.targets) == 1 else getattr(node, "target", None)
            function = _function(node, parents)
            if not isinstance(target, ast.Name) or function is None or target.id not in guard_names.get(id(function), ()):
                continue
            name = _qualname(node, parents)
            for x in ast.walk(node.value):
                if isinstance(x, ast.BoolOp):
                    for operand in x.values:
                        out.append(("data_flag_operand", operand, "true" if isinstance(x.op, ast.And) else "false", None,
                                    target.id + " " + ast.unparse(operand), name))
            arithmetic(node.value, name, target.id)
            helpers.update(x.func.id for x in ast.walk(node.value) if isinstance(x, ast.Call) and isinstance(x.func, ast.Name) and x.func.id in top)
    for statement in tree.body:
        if (isinstance(statement, ast.Assign) and len(statement.targets) == 1 and isinstance(statement.targets[0], ast.Name)
                and _table_display(statement.value) is None and not isinstance(statement.value, ast.Constant)):
            calls = [x.func.id for x in ast.walk(statement.value) if isinstance(x, ast.Call) and isinstance(x.func, ast.Name)]
            if any(c in top for c in calls):
                arithmetic(statement.value, "<module>", statement.targets[0].id)
                helpers.update(c for c in calls if c in top)
    for name in sorted(helpers):
        if name not in with_sites:
            for statement in top[name].body:
                arithmetic(statement, name, name)
    # collections a helper builds and returns, read by a refusal
    for name, function in top.items():
        if name in with_sites:
            continue
        returned = {r.value.id for r in ast.walk(function) if isinstance(r, ast.Return) and isinstance(r.value, ast.Name)}
        if not returned:
            continue
        built = set(returned)
        for x in ast.walk(function):   # (and the local lists whose items flow into it)
            if isinstance(x, ast.For) and isinstance(x.iter, ast.Name):
                built.add(x.iter.id)
        for x in ast.walk(function):
            if (isinstance(x, ast.Call) and isinstance(x.func, ast.Attribute) and isinstance(x.func.value, ast.Name)
                    and x.func.value.id in built and x.func.attr in ("add", "update", "append", "extend")):
                out.append(("data_collection_build", x, "disable_build", None, ast.unparse(x), _qualname(x, parents)))
    # domains refusal loops walk
    for node in ast.walk(tree):
        if (isinstance(node, (ast.For, ast.AsyncFor)) and not isinstance(node.iter, (ast.Tuple, ast.List, ast.Set))
                and any(id(x) in refusal_ids for x in ast.walk(node))):
            out.append(("data_walk_domain", node, "walk_first", None, ast.unparse(node.iter), _qualname(node, parents)))
    return sorted(out, key=lambda p: (p[1].lineno, p[1].col_offset, p[0], p[3] if p[3] is not None else -1, p[4]))


def credit_vocabulary_problems(sources):
    """Every committed credit and withholding name must still name at least one site."""
    problems = []
    for module, pairs in WITHHOLD.items():
        tree = ast.parse(sources[module][0])
        found = {reason for _, kind, reason in refusal_sites(tree, module) if kind == "withhold_call"}
        for name, method in pairs:
            if name + "." + method not in found:
                problems.append("stale withholding name: %s %s.%s" % (module, name, method))
    for module, vocabulary in CREDIT.items():
        tree = ast.parse(sources[module][0])
        found = {(kind, name) for _, kind, name in credit_sites(tree, module)}
        for kind, names in vocabulary.items():
            for name in names:
                if (kind, name) not in found:
                    problems.append("stale credit name: %s %s %s" % (module, kind, name))
    return problems


def refusal_alias_problems(source, module):
    """Every use of a refusal name other than a direct call, raise, base or handler.

    _refuse may only be called; Refusal and DatetimeAdmissionError may only be
    raised (or built inside _refuse), subclassed, caught, imported without an
    alias, or passed as a format checker's raises=; a sink may only be called;
    errors.append and errors.extend may only be called; no refusal name or the
    errors list may be rebound to another name. Anything else would hide a
    refusal site from the enumeration.
    """
    tree = ast.parse(source)
    parents = _parent_map(tree)
    sinks = _sinks(tree)
    problems = []
    names = set(REFUSAL_CALLS) | set(REFUSAL_CLASSES) | sinks
    for node in ast.walk(tree):
        parent = parents.get(node)
        if isinstance(node, ast.Name) and node.id in names and isinstance(node.ctx, ast.Load):
            ok = isinstance(parent, ast.Call) and parent.func is node and (
                node.id in REFUSAL_CALLS or node.id in sinks or isinstance(parents.get(parent), ast.Raise))
            handler = parent
            while isinstance(handler, ast.Tuple):
                handler = parents.get(handler)
            ok = ok or (node.id in REFUSAL_CLASSES and (
                isinstance(handler, ast.ExceptHandler) or
                isinstance(parent, ast.ClassDef) and node in parent.bases or
                isinstance(parent, ast.keyword) and parent.arg == "raises" or
                isinstance(parent, ast.Raise) and parent.exc is node))
            if not ok:
                problems.append("%s: refusal alias or indirect reference: %s at line %d (%s)"
                                % (module, node.id, node.lineno, ast.unparse(parent)[:80]))
        elif isinstance(node, ast.Name) and node.id in names and not isinstance(node.ctx, ast.Load):
            if not (node.id in sinks and isinstance(parent, ast.FunctionDef)):
                problems.append("%s: refusal name rebound: %s at line %d" % (module, node.id, node.lineno))
        elif isinstance(node, ast.Attribute) and node.attr in names:
            problems.append("%s: refusal attribute access: %s at line %d" % (module, ast.unparse(node), node.lineno))
        elif (isinstance(node, ast.Attribute) and node.attr in ("append", "extend")
              and isinstance(node.value, ast.Name) and node.value.id == SINK_LIST
              and not (isinstance(parent, ast.Call) and parent.func is node)):
            problems.append("%s: errors.%s used as a value at line %d" % (module, node.attr, node.lineno))
        elif isinstance(node, ast.Assign) and isinstance(node.value, ast.Name) and (
                node.value.id in names or node.value.id == SINK_LIST):
            problems.append("%s: refusal name aliased at line %d (%s)" % (module, node.lineno, ast.unparse(node)[:80]))
        elif isinstance(node, ast.alias) and (node.name in names and node.asname or node.asname in names):
            problems.append("%s: refusal name imported under another name: %s" % (module, ast.unparse(node)))
        elif isinstance(node, ast.Constant) and node.value in set(REFUSAL_CALLS) | set(REFUSAL_CLASSES):
            problems.append("%s: refusal name as a string: %r at line %d" % (module, node.value, node.lineno))
    return problems


# ---- Building and running one mutant ----

def _sources(root=None):
    base = Path(root or ROOT) / "scripts"
    return {name: ((base / (name + ".py")).read_text(), str(base / (name + ".py"))) for name in TARGETS}


def _replace(tree, node, new):
    parent = _parent_map(tree)[node]
    for field, current in ast.iter_fields(parent):
        if current is node:
            setattr(parent, field, ast.copy_location(new, node) if new is not None else None)
            return
        if type(current) is list:
            for position, item in enumerate(current):
                if item is node:
                    current[position] = ast.copy_location(new, node)
                    return
    raise ValueError("mutation target not found in its parent")


def _record_container(tree, node):
    """The node a disabled error record removes, and what replaces it."""
    parents = _parent_map(tree)
    parent = parents[node]
    if isinstance(parent, ast.Call):
        return parent, ast.Constant(None)
    if isinstance(parent, ast.List):
        return parent, ast.List(elts=[], ctx=ast.Load())
    if isinstance(parent, (ast.ListComp, ast.GeneratorExp)) and parent.elt is node:
        return parent, ast.List(elts=[], ctx=ast.Load())
    raise ValueError("error record outside a call, list or comprehension")


def point_code(source, file, point):
    """Compile one module with exactly one generated mutation point applied."""
    tree = ast.parse(source)
    nodes = list(ast.walk(tree))
    node = nodes[point["node"]]
    if node.lineno != point["line"]:
        raise ValueError("mutation point moved: " + point["key"])
    action = point["action"]
    if point["family"] == "comparison_boundary":
        node.ops[point["detail"]] = _FLIPPED[type(node.ops[point["detail"]])]()
    elif action == "drop":
        target = node.comparators[0] if isinstance(node, ast.Compare) else node
        del target.elts[point["detail"]]
    elif action in ("false", "true"):
        _replace(tree, node, ast.Constant(action == "true"))
    elif action == "disable_raise":
        _replace(tree, node, ast.Pass())
    elif action in ("disable_refuse_call", "disable_sink_call", "disable_errors_extend", "disable_withhold_call"):
        _replace(tree, node, ast.Constant(None))
    elif action == "disable_error_record":
        container, new = _record_container(tree, node)
        _replace(tree, container, new)
    elif action == "disable_status_fail":
        _replace(tree, node, ast.Constant("pass"))
    elif action == "drop_entry":
        if isinstance(node, ast.Dict):
            del node.keys[point["detail"]], node.values[point["detail"]]
        else:
            del node.elts[point["detail"]]
    elif action == "swap_op":
        node.op = _SWAPPED[type(node.op)]()
    elif action == "plus_one":
        _replace(tree, node, ast.BinOp(left=node, op=ast.Add(), right=ast.Constant(1)))
    elif action == "disable_build":
        _replace(tree, node, ast.Constant(None))
    elif action == "walk_first":
        node.iter = ast.Subscript(value=ast.Call(func=ast.Name("list", ast.Load()), args=[node.iter], keywords=[]),
                                  slice=ast.Slice(upper=ast.Constant(1)), ctx=ast.Load())
    elif action == "disable_error_tuple":
        _replace(tree, node, ast.Tuple(elts=[], ctx=ast.Load()))
    elif action == "drop_flag":
        leaves = _flag_leaves(node.args[1] if len(node.args) > 1 else next(k.value for k in node.keywords if k.arg == "flags"))
        rest = [leaf for i, leaf in enumerate(leaves) if i != point["detail"]]
        new = None
        for leaf in rest:
            new = leaf if new is None else ast.BinOp(left=new, op=ast.BitOr(), right=leaf)
        if len(node.args) > 1:
            if new is None:
                del node.args[1]
            else:
                node.args[1] = new
        else:
            node.keywords = [k for k in node.keywords if k.arg != "flags"] + ([ast.keyword(arg="flags", value=new)] if new is not None else [])
    elif action == "widen_class":
        kind, occurrence, drop = point["detail"]
        node.args[0].value = _widened(node.args[0].value, kind, occurrence)
        if drop is not None:
            leaves = _flag_leaves(node.args[1])
            rest = [leaf for i, leaf in enumerate(leaves) if i != drop]
            new = None
            for leaf in rest:
                new = leaf if new is None else ast.BinOp(left=new, op=ast.BitOr(), right=leaf)
            if new is None:
                del node.args[1]
            else:
                node.args[1] = new
    elif action == "match_call":
        node.func.attr = "match"
    else:
        raise ValueError("unknown mutation action: " + action)
    ast.fix_missing_locations(tree)
    return compile(tree, file, "exec")


def _load_module(name, code, file):
    module = types.ModuleType(name)
    module.__file__ = file
    sys.modules[name] = module
    exec(code, module.__dict__)
    return module


class MutantTimeout(BaseException):
    """A mutant run exceeded its time limit. Not an Exception, so no check or
    corpus handler can swallow it and count it as a failing witness."""


@contextmanager
def _time_limit(seconds):
    """Bound a mutant that loops. Uses SIGALRM where the platform has it."""
    import signal

    def expire(signum, frame):
        raise MutantTimeout("mutation run exceeded %d s" % seconds)
    try:
        previous = signal.signal(signal.SIGALRM, expire)
    except (AttributeError, ValueError):
        yield
        return
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)
        signal.signal(signal.SIGALRM, previous)


def _clear_corpus_caches():
    corpus = sys.modules.get("pm_event_numbers_corpus")
    for name in ("_inventory_datetime_validator", "_envelope_datetime_validator"):
        cached = getattr(corpus, name, None) if corpus else None
        if cached is not None:
            cached.cache_clear()


@contextmanager
def installed(target, code, sources):
    """Fresh module objects for all date-time modules, the target built from code.

    Every module is rebuilt, so no cache (resource selections, bound validator
    classes) survives from the intact code or from another mutant.
    """
    import pm_event_datetime_selfcheck as selfcheck
    saved = {name: sys.modules.get(name) for name in TARGETS}
    _clear_corpus_caches()
    try:
        for name in ("pm_event_datetime_inventory", "pm_event_datetime_value_probe", "pm_event_datetime"):
            text, file = sources[name]
            _load_module(name, code if name == target else compile(text, file, "exec"), file)
        # T71 (REVIEW-numrule-tb3-opus finding 7): under a mutant whose inventory fails validation, resource_selections()
        # raises, nothing is cached, and every validator build re-validated the whole inventory (a --all rerun of DT16
        # hit 3,000 s). Its outcome for the committed inventory, a result or the raised error, is computed once per
        # installed mutant: it reads only the committed files and the mutant's code, which do not change while the
        # mutant is installed. A call against any other root (a self-check's scratch inventory) goes to the module's own
        # lru_cache unchanged, and cache_clear() clears both, so the checks that clear or redirect it behave as before.
        inventory = sys.modules["pm_event_datetime_inventory"]
        original, memo, committed = inventory.resource_selections, {}, (inventory.ROOT, inventory.INVENTORY)
        def selections():
            if (inventory.ROOT, inventory.INVENTORY) != committed:
                return original()
            if "value" not in memo and "error" not in memo:
                try:
                    memo["value"] = original()
                except Exception as error:  # noqa: BLE001
                    memo["error"] = error
            if "error" in memo:
                raise memo["error"].with_traceback(None)
            return memo["value"]
        def cache_clear():
            memo.clear()
            original.cache_clear()
        selections.cache_clear = cache_clear
        selections.__wrapped__ = original
        inventory.resource_selections = selections
        selfcheck.CODE[target] = code
        yield
    finally:
        selfcheck.CODE.clear()
        _clear_corpus_caches()
        for name, module in saved.items():
            if module is None:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = module


def _corpus():
    if "corpus" not in _STATE:
        _STATE["corpus"] = json.loads((ROOT / "Plans/event_number_recipe_corpus.json").read_text())
    return _STATE["corpus"]


_STATE = {}
DATETIME_OPS = ("datetime", "datetime_direct", "envelope_datetime", "inventory_datetime", "family_datetime")


def run_case(case_id):
    """True when one date-time corpus case gives its committed outcome."""
    import pm_event_numbers as m
    import pm_event_numbers_corpus as corpus_module
    corpus = _corpus()
    case = next((c for c in corpus["cases"] if c["id"] == case_id), None)
    if case is None or case["op"] not in DATETIME_OPS:
        raise ValueError("not a date-time corpus case: " + case_id)
    actual, _ = corpus_module.evaluate(m, case, corpus)
    expected = ({"outcome": "refusal", "error": case["error"]} if "error" in case
                else {"outcome": "acceptance", "output": case["output"]})
    return actual == expected


def run_witness(witness, context):
    """True when the witness passes; False (or an exception name) when the mutant breaks it."""
    import pm_event_datetime_selfcheck as selfcheck
    kind, _, name = witness.partition(":")
    if kind == "check":
        if name not in selfcheck.CHECKS:
            raise ValueError("unknown self-check: " + name)
        return selfcheck.run_check(name, context)
    if kind == "case":
        try:
            return run_case(name)
        except ValueError:
            raise
        except Exception as error:  # noqa: BLE001
            return "exception:" + type(error).__name__
    if kind == "regression":
        # (T71: the admission regression checks, run once per mutant under the installed mutant and kept on the context)
        if name not in regression_names():
            raise ValueError("unknown regression check: " + name)
        if not hasattr(context, "regression"):
            import pm_event_datetime_admission_checks as admission
            try:
                context.regression = admission.regression_checks(ROOT)
            except Exception as error:  # noqa: BLE001
                context.regression = {"__exception__": "exception:" + type(error).__name__}
        if "__exception__" in context.regression:
            return context.regression["__exception__"]
        return context.regression.get(name, False) is True
    if kind == "integration":
        # (T102: the other date-time owner checks of --scope all, run once per mutant under the installed mutant, the
        # committed-tree inventory check included, and kept on the context)
        if name not in integration_names():
            raise ValueError("unknown integration check: " + name)
        if not hasattr(context, "integration"):
            import pm_event_numbers as m
            import pm_event_numbers_corpus as corpus
            from pm_event_datetime_inventory import check_inventory
            try:
                context.integration = corpus.datetime_integration_checks(m, ROOT, check_inventory(ROOT))
            except Exception as error:  # noqa: BLE001
                context.integration = {"__exception__": "exception:" + type(error).__name__}
        if "__exception__" in context.integration:
            return context.integration["__exception__"]
        return context.integration.get(name, False) is True
    raise ValueError("unknown witness kind: " + witness)


def run_mutant(target, build, sources, witnesses, *, time_limit=180):
    """Build and install one mutant and run its witnesses; never counts a harness error as caught."""
    import pm_event_datetime_selfcheck as selfcheck
    started = time.monotonic()
    try:
        code = build()
    except Exception as error:  # noqa: BLE001
        return {"result": "build_error", "error": type(error).__name__ + ": " + str(error)[:200]}
    try:
        with installed(target, code, sources), _time_limit(time_limit):
            context = selfcheck.Context()
            try:
                failed = []
                for witness in witnesses:
                    if run_witness(witness, context) is not True:
                        failed.append(witness)
                        break
            finally:
                context.close()
    except (Exception, MutantTimeout) as error:  # noqa: BLE001
        return {"result": "runner_exception", "error": type(error).__name__ + ": " + str(error)[:200]}
    return {"result": "caught" if failed else "survives", "failed": failed,
            "seconds": round(time.monotonic() - started, 2)}


def regression_names():
    """The names of the admission regression checks (pm_event_datetime_admission_checks.regression_checks), from one run
    on the intact tree, cached for the process."""
    if "regression_names" not in _STATE:
        import pm_event_datetime_admission_checks as admission
        _STATE["regression_names"] = sorted(admission.regression_checks(ROOT))
    return _STATE["regression_names"]


def integration_names():
    """T102 (TOOLBATCH4 pre-check finding 3): the date-time owner checks --scope all runs that are not regression checks:
    the committed-tree inventory check, the fence-container check, the EventRecord validity check and the nine format
    checks (datetime_integration_checks less regression_checks), named once from the intact code."""
    if "integration_names" not in _STATE:
        import pm_event_numbers as m
        import pm_event_numbers_corpus as corpus
        names = corpus.datetime_integration_checks(m, ROOT, {"status": "pass"})
        _STATE["integration_names"] = sorted(set(names) - set(regression_names()))
    return _STATE["integration_names"]


def survivor_witnesses():
    """Every check a declared survivor must survive: all self-checks, every date-time corpus case and (T71,
    REVIEW-numrule-tb3-opus finding 3) every admission regression check, the suite --scope all runs beside them, so
    the replay and the CLI judge on one suite (DT12 survived the self-checks and the cases, and only these caught it).
    T102 (TOOLBATCH4 pre-check finding 3): and, last, the other twelve date-time owner checks --scope all runs
    (integration:), the committed-tree inventory check among them, so the replay judges exactly the --scope all
    date-time suite (B-DT15 survived the replay and failed only that inventory check). Only a mutant that survives
    everything before them pays for the committed-tree scan."""
    import pm_event_datetime_selfcheck as selfcheck
    return (["check:" + name for name in selfcheck.CHECKS] +
            ["case:" + c["id"] for c in _corpus()["cases"] if c["op"] in DATETIME_OPS] +
            ["regression:" + name for name in regression_names()] +
            ["integration:" + name for name in integration_names()])


# ---- The rules table, derived from the owner text ----
#
# Statements are every sentence of CV-1101's canonical_text,
# acceptance_criteria and negative_constraints, and of the adoption guide's
# date-time blocks. The guide blocks are exactly the ones the number scope's
# rules table excludes as date-time owned, so the two tables partition the
# shared guide; the statement splitter is the number scope's, so both split it
# the same way. Each statement needs one row keyed by source path, line and
# exact text; a statement without a row, or a row whose line no longer holds
# its text, fails the self-test.

NUMBER_MUTATION_SET = "scripts/pm_event_numbers_mutations.json"
NORMATIVE_MARKERS = re.compile(
    r"\b(?:must|refuses?|refused|refusal|required?|requires|only|exactly|exact|never|no|not|cannot|"
    r"rejects?|disallows?|fails?|insufficient)\b|[0-9]", re.IGNORECASE)


def owner_statements(root, owner_text):
    """Every statement of the selected owner text: (statements, problems)."""
    from pm_event_numbers_corpus import (_guide_blocks, _guide_section_texts, _pin, _sentences, _unit_blocks,
                                         _unit_section_unselected_text)
    statements, problems = [], []
    for unit in owner_text["units"]:
        try:
            lines = (Path(root) / unit["path"]).read_text(encoding="utf-8").split("\n")
            blocks = _unit_blocks(lines, unit["unit"], unit["fields"])
            # T41 (REVIEW-datetime-fix16-opus finding 9): the unit's whole section less its selected fields (its
            # heading, its unselected YAML fields such as validation_surfaces, and its ContractRef: line) is pinned
            section = _pin(_unit_section_unselected_text(lines, unit["unit"], unit["fields"]))
        except (OSError, ValueError, StopIteration) as error:
            problems.append("owner text %s %s unreadable: %s" % (unit["path"], unit["unit"], error))
            continue
        if unit.get("section_unselected_sha256") != section:
            problems.append("owner text %s %s: the unit section outside its selected fields changed (sha256 %s, pinned "
                            "%s); review it for date-time rules and refresh section_unselected_sha256"
                            % (unit["path"], unit["unit"], section, unit.get("section_unselected_sha256")))
        ordinals = {}
        for field, block in blocks:
            ordinals[field] = ordinals.get(field, 0) + 1
            for n, (line, sentence) in enumerate(_sentences(block), 1):
                statements.append({"id": "%s:%s:%d.%d" % (unit["unit"], field, ordinals[field], n),
                                   "source": unit["path"], "line": line, "statement": sentence})
    guide = owner_text["guide"]
    try:
        lines = (Path(root) / guide["path"]).read_text(encoding="utf-8").split("\n")
    except OSError as error:
        problems.append("owner text %s unreadable: %s" % (guide["path"], error))
        lines = None
    if lines is not None:
        # T41 (finding 9): guide sections the date-time table depends on outside its selected blocks, pinned whole:
        # "Per-lane replacements" holds the per-lane "Enforce CV-1101 ..." sentence, 19 times
        texts = _guide_section_texts(lines)
        for section, pinned in sorted(guide.get("pinned_sections", {}).items()):
            if section not in texts:
                problems.append("stale pinned guide section in the date-time selection: %r" % section)
            elif _pin(texts[section]) != pinned:
                problems.append("guide section %r changed (sha256 %s, pinned %s); review it for date-time rules and "
                                "refresh pinned_sections" % (section, _pin(texts[section]), pinned))
        selected = guide["blocks"]
        sections = {b["section"] for b in selected}
        blocks, seen = _guide_blocks(lines, sections)
        for section in sections - set(seen):
            problems.append("stale guide section in the date-time selection: %r" % section)
        matched = [0] * len(selected)
        ordinals = {}
        for section, block, kind in blocks:
            ordinals[section] = ordinals.get(section, 0) + 1
            hits = [j for j, rule in enumerate(selected)
                    if rule["section"] == section and block[0][1].startswith(rule["starts_with"])]
            for j in hits:
                matched[j] += 1
            if not hits:
                continue
            for n, (line, sentence) in enumerate(_sentences(block), 1):
                statements.append({"id": "guide:%s:%d.%d" % (section, ordinals[section], n),
                                   "source": guide["path"], "line": line, "statement": sentence})
        for rule, count in zip(selected, matched):
            if count != 1:
                problems.append("guide block selection %r must match exactly one block (%d)" % (rule["starts_with"], count))
    for statement in statements:
        statement["normative"] = NORMATIVE_MARKERS.search(statement["statement"]) is not None
    return statements, problems


def partition_problems(root, owner_text):
    """The date-time guide blocks are exactly the number table's date-time exclusions."""
    numbers = json.loads((Path(root) / NUMBER_MUTATION_SET).read_text())
    excluded = {(b["section"], b["starts_with"]) for b in numbers["owner_text"]["guide"]["excluded_blocks"]}
    selected = {(b["section"], b["starts_with"]) for b in owner_text["guide"]["blocks"]}
    problems = []
    for section, start in sorted(selected - excluded):
        problems.append("date-time guide block %r is also in the number rules table" % start)
    for section, start in sorted(excluded - selected):
        problems.append("number table excludes %r as date-time owned, but the date-time table has no rows for it"
                        % start)
    return problems


def check_rules_table(root, spec):
    """Statement rows, rules and hand-written mutations, checked together.

    Every extracted statement has exactly one row with the same source, line
    and text, and every row matches a statement (else it is stale). A row names
    rules or says why no mutation applies. Every rule is named by a row and
    lists at least one mutation (a hand-written id or a generated point key);
    every hand-written mutation names a rule that lists it, except a declared
    survivor (fix round 17, V04): it names its rule, and no rule lists any
    declared survivor, hand-written or generated, because a rule is caught
    only when every mutation it lists makes its witness fail.
    """
    problems = []
    statements, extraction = owner_statements(root, spec["owner_text"])
    problems.extend(extraction)
    problems.extend(partition_problems(root, spec["owner_text"]))
    rows = spec.get("statements", [])
    key = lambda r: (r["source"], r["line"], r["statement"])
    extracted = {key(s): s for s in statements}
    if len(extracted) != len(statements):
        problems.append("two owner statements share a source line and text")
    by_text = {}
    for s in statements:
        by_text.setdefault((s["source"], s["statement"]), []).append(s["line"])
    row_keys = {}
    for row in rows:
        k = key(row)
        if k in row_keys:
            problems.append("duplicate statement row: %s line %d" % (row["source"], row["line"]))
        row_keys[k] = row
        if k not in extracted:
            now = by_text.get((row["source"], row["statement"]))
            problems.append("stale statement row %s: %s line %d no longer holds its text%s"
                            % (row.get("id"), row["source"], row["line"], " (now at line %s)" % now if now else ""))
        elif extracted[k]["id"] != row.get("id"):
            problems.append("statement row id %s should be %s" % (row.get("id"), extracted[k]["id"]))
        if bool(row.get("rules")) == bool(row.get("no_mutation")):
            problems.append("statement row %s needs exactly one of rules or no_mutation" % row.get("id"))
    for k, s in extracted.items():
        if k not in row_keys:
            problems.append("owner statement without a row: %s %s line %d: %s"
                            % (s["id"], s["source"], s["line"], s["statement"][:120]))
    rules = {}
    for rule in spec.get("rules", []):
        if rule["id"] in rules:
            problems.append("duplicate rule id: " + rule["id"])
        rules[rule["id"]] = rule
        if not rule.get("mutations"):
            problems.append("rule %s lists no mutation" % rule["id"])
    named = {name for row in rows for name in row.get("rules", [])}
    for name in sorted(named - set(rules)):
        problems.append("statement rows name an unknown rule: " + name)
    for name in sorted(set(rules) - named):
        problems.append("rule %s is named by no statement row" % name)
    hand = {m["id"]: m for m in spec.get("mutations", [])}
    for mutation in spec.get("mutations", []):
        rule = rules.get(mutation.get("rule"))
        if rule is None:
            problems.append("hand-written mutation %s names no known rule" % mutation["id"])
        elif mutation.get("survives"):
            continue
        elif mutation["id"] not in rule["mutations"]:
            problems.append("mutation %s names rule %s, which does not list it" % (mutation["id"], rule["id"]))
    generated = spec.get("generated", {}).get("points", {})
    points = set(generated)
    survivors = {k for k, e in generated.items() if e.get("survives")} | {
        m["id"] for m in spec.get("mutations", []) if m.get("survives")}
    for rule in rules.values():
        for name in rule["mutations"]:
            if name in survivors:
                problems.append("rule %s lists the declared survivor %s; declared survivors are never listed"
                                % (rule["id"], name))
            elif name not in hand and name not in points:
                problems.append("rule %s lists an unknown mutation: %s" % (rule["id"], name))
            elif name in hand and hand[name].get("rule") != rule["id"] and name not in rule.get("shared", ()):
                problems.append("rule %s lists %s, which names rule %s; list it under shared"
                                % (rule["id"], name, hand[name].get("rule")))
    totals = {"statements": len(statements), "normative_statements": sum(s["normative"] for s in statements),
              "statement_rows": len(rows), "rows_with_rules": sum(bool(r.get("rules")) for r in rows),
              "rows_without_mutation": sum(bool(r.get("no_mutation")) for r in rows),
              "statements_without_row": sum(k not in row_keys for k in extracted),
              "stale_rows": sum(key(r) not in extracted for r in rows), "rules": len(rules),
              "hand_written_with_rule": sum(m.get("rule") in rules for m in spec.get("mutations", [])),
              "hand_written_orphans": sum(m.get("rule") not in rules for m in spec.get("mutations", []))}
    return problems, totals, statements


# ---- Freshness: the committed set against the code and the owner text ----

def load_spec(root=None):
    return json.loads((Path(root or ROOT) / MUTATION_SET).read_text())


FRESHNESS_CHECKS = {
    "datetime_gate_bar_no_refusal_alias": "no refusal alias or indirect refusal reference in the date-time code",
    "datetime_gate_bar_sites_fresh": "every enumerated point has exactly one committed entry, none is stale, and "
                                     "every credit and withholding name still names a site",
    "datetime_gate_bar_entries_valid": "every committed entry names exactly one known witness or a survivor reason",
    "datetime_gate_bar_hand_written_apply": "every hand-written mutation applies once to its module",
    "datetime_gate_bar_rules_table_complete": "every owner statement has one current row, no row is stale, every row "
                                              "names rules or a reason, every rule is named and lists mutations, and "
                                              "every hand-written mutation names its rule",
}


def freshness(root=None, spec=None):
    """(problems by check name, totals) for everything checked without running a mutant."""
    import pm_event_datetime_selfcheck as selfcheck
    root = Path(root or ROOT)
    spec = spec or load_spec(root)
    sources = _sources(root)
    problems = {name: [] for name in FRESHNESS_CHECKS}
    points = []
    for module in TARGETS:
        problems["datetime_gate_bar_no_refusal_alias"].extend(refusal_alias_problems(sources[module][0], module))
        points.extend(mutation_points(sources[module][0], module))
    sites = problems["datetime_gate_bar_sites_fresh"]
    sites.extend(credit_vocabulary_problems(sources))
    committed = spec.get("generated", {}).get("points", {})
    enumerated = {p["key"] for p in points}
    for key in sorted(enumerated - set(committed)):
        sites.append("new mutation point without a committed entry: " + key)
    for key in sorted(set(committed) - enumerated):
        sites.append("stale committed mutation point (not in the date-time AST): " + key)
    for key, entry in committed.items():
        problems["datetime_gate_bar_entries_valid"].extend(_entry_problems(key, entry, selfcheck))
    for mutation in spec.get("mutations", []):
        if mutation["module"] not in sources:
            problems["datetime_gate_bar_hand_written_apply"].append(mutation["id"] + ": unknown module")
            continue
        count = sources[mutation["module"]][0].count(mutation["find"])
        if count != 1 or mutation["find"] == mutation["replace"]:
            problems["datetime_gate_bar_hand_written_apply"].append(
                mutation["id"] + ": find text must occur exactly once and differ from replace (%d)" % count)
        problems["datetime_gate_bar_entries_valid"].extend(_entry_problems(mutation["id"], mutation, selfcheck))
    table_problems, table_totals, _ = check_rules_table(root, spec)
    problems["datetime_gate_bar_rules_table_complete"].extend(table_problems)
    families = {family: sum(p["family"] == family for p in points) for family in FAMILIES}
    totals = {"points": len(points), **families, "committed_points": len(committed),
              "committed_survivors": sum(bool(e.get("survives")) for e in committed.values()),
              "hand_written_mutations": len(spec.get("mutations", [])), **table_totals}
    return problems, totals


def _entry_problems(name, entry, selfcheck):
    problems = []
    if bool(entry.get("witness")) == bool(entry.get("survives")):
        problems.append(name + ": needs exactly one of witness or survives")
    witness = entry.get("witness") or ""
    kind, _, target = witness.partition(":")
    if witness and kind == "check" and target not in selfcheck.CHECKS:
        problems.append(name + ": unknown witness check " + target)
    elif witness and kind == "case" and not any(c["id"] == target and c["op"] in DATETIME_OPS
                                               for c in _corpus()["cases"]):
        problems.append(name + ": unknown date-time corpus case " + target)
    elif witness and kind == "regression" and target not in regression_names():
        problems.append(name + ": unknown admission regression check " + target)
    elif witness and kind not in ("check", "case", "regression"):
        problems.append(name + ": unknown witness kind " + witness)
    return problems


def freshness_checks(root=None):
    """(named booleans for the --scope all self-test, problem list, totals)."""
    try:
        by_name, totals = freshness(root)
    except Exception as error:  # noqa: BLE001 - an unreadable set fails the self-test
        message = "freshness check raised " + type(error).__name__ + ": " + str(error)[:200]
        return {name: False for name in FRESHNESS_CHECKS}, [message], {}
    flat = [problem for name in FRESHNESS_CHECKS for problem in by_name[name]]
    return {name: not by_name[name] for name in FRESHNESS_CHECKS}, flat, totals


# ---- The full replay ----

def _judge(row, entry, run, problems, label):
    row["result"] = run["result"]
    if run["result"] in ("build_error", "runner_exception"):
        row["error"] = run["error"]
        problems.append("%s: %s (%s); never counted as caught" % (label, run["result"], run["error"]))
        return
    row["seconds"] = run.get("seconds")
    if entry.get("survives"):
        row["declared_survivor"] = entry["survives"]
        if run["result"] == "caught":
            row["caught_by"] = run["failed"]
            problems.append(label + ": declared survivor is now caught by %s; update the set" % run["failed"])
        return
    row["witness"] = entry["witness"]
    row["witness_failed"] = run["result"] == "caught" and run["failed"] == [entry["witness"]]
    if not row["witness_failed"]:
        problems.append("%s: witness %s did not fail; the mutation survived" % (label, entry["witness"]))


def run_mutations(root=None, *, only=None, time_limit=180, survivor_time_limit=3600, progress=None):
    """Replay every committed mutant. Pass means: every self-check passes on the
    intact code, the committed set is fresh, every mutant builds and makes its
    witness fail, and every declared survivor survives every self-check and
    every date-time corpus case."""
    import pm_event_datetime_selfcheck as selfcheck
    root = Path(root or ROOT)
    spec = load_spec(root)
    sources = _sources(root)
    problems = []
    intact = selfcheck.run_all(root)
    for name, ok in intact.items():
        if not ok:
            problems.append("intact self-check fails: " + name)
    by_name, totals = freshness(root, spec)
    problems.extend(problem for name in FRESHNESS_CHECKS for problem in by_name[name])
    committed = spec.get("generated", {}).get("points", {})
    survivors = None
    generated = []
    for module in TARGETS:
        text, file = sources[module]
        for point in mutation_points(text, module):
            if only and not any(o in point["key"] for o in only):
                continue
            entry = committed.get(point["key"])
            row = {key: point[key] for key in ("key", "family", "module", "function", "line", "action", "text")}
            if entry is None:
                row["result"] = "no_committed_entry"
                generated.append(row)
                continue
            if entry.get("survives") and survivors is None:
                survivors = survivor_witnesses()
            witnesses = survivors if entry.get("survives") else [entry["witness"]]
            run = run_mutant(module, lambda: point_code(text, file, point), sources, witnesses,
                             time_limit=survivor_time_limit if entry.get("survives") else time_limit)
            _judge(row, entry, run, problems, point["key"])
            generated.append(row)
            if progress:
                progress(row)
    hand = []
    for mutation in spec.get("mutations", []):
        if only and not any(o in mutation["id"] for o in only):
            continue
        row = {key: mutation[key] for key in ("id", "module", "rule") if key in mutation}
        text, file = sources[mutation["module"]]
        if text.count(mutation["find"]) != 1 or mutation["find"] == mutation["replace"]:
            row["result"] = "not_applied"
            hand.append(row)
            continue
        if mutation.get("survives") and survivors is None:
            survivors = survivor_witnesses()
        witnesses = survivors if mutation.get("survives") else [mutation["witness"]]
        run = run_mutant(mutation["module"], lambda: compile(text.replace(mutation["find"], mutation["replace"]),
                                                             file, "exec"),
                         sources, witnesses, time_limit=survivor_time_limit if mutation.get("survives") else time_limit)
        _judge(row, mutation, run, problems, mutation["id"])
        hand.append(row)
        if progress:
            progress(row)
    by_name = {r["key"]: r for r in generated} | {r["id"]: r for r in hand}
    rules = []
    for rule in spec.get("rules", []):
        rows = [by_name.get(name) for name in rule["mutations"]]
        caught = bool(rows) and all(r is not None and r.get("witness_failed") for r in rows)
        if not only and not caught:
            problems.append("rule %s: not every mutation is caught with its witness failing" % rule["id"])
        rules.append({"id": rule["id"], "owner": rule["owner"], "rule": rule["rule"], "mutations": rule["mutations"],
                      "result": "caught" if caught else "NOT CAUGHT"})
    result_by_rule = {r["id"]: r["result"] for r in rules}
    statements = []
    for row in spec.get("statements", []):
        out = {key: row[key] for key in ("id", "source", "line", "statement")}
        if row.get("rules"):
            out["rules"] = row["rules"]
            out["result"] = ("caught" if all(result_by_rule.get(n) == "caught" for n in row["rules"])
                             else "NOT CAUGHT")
        else:
            out["no_mutation"] = row["no_mutation"]
            out["result"] = "no mutation applies"
        statements.append(out)
    every = generated + hand
    totals.update({
        "self_checks": len(intact), "self_checks_passing": sum(intact.values()),
        "generated_mutations": len(generated), "mutations": len(every),
        "caught": sum(r.get("result") == "caught" for r in every),
        "witnessed": sum(bool(r.get("witness_failed")) for r in every),
        "survivors": sum(r.get("result") == "survives" for r in every),
        "declared_survivors": sum("declared_survivor" in r for r in every),
        "undeclared_survivors": sum(r.get("result") == "survives" and "declared_survivor" not in r for r in every),
        "build_errors": sum(r.get("result") == "build_error" for r in every),
        "runner_exceptions": sum(r.get("result") == "runner_exception" for r in every),
        "not_applied": sum(r.get("result") == "not_applied" for r in every),
        "rules_caught": sum(r["result"] == "caught" for r in rules),
        "statement_rows_caught": sum(s["result"] == "caught" for s in statements),
        "statement_rows_not_caught": sum(s["result"] == "NOT CAUGHT" for s in statements)})
    return {"status": "fail" if problems else "pass", "mutation_set": spec.get("schema_id"), "totals": totals,
            "problems": problems, "families": FAMILIES, "generated": generated, "mutations": hand, "rules": rules,
            "statements": statements, "native_authority": "NOT_RUN"}


def self_test(root=None):
    """The fast self-check: every self-check passes and the committed set is fresh."""
    import pm_event_datetime_selfcheck as selfcheck
    checks = selfcheck.run_all(root or ROOT)
    flags, problems, totals = freshness_checks(root)
    checks.update(flags)
    failures = sorted(name for name, ok in checks.items() if not ok)
    return {"status": "fail" if failures else "pass", "checks": len(checks), "failures": failures,
            "freshness_problems": problems, "totals": totals}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--self-test", action="store_true")
    mode.add_argument("--mutations", action="store_true")
    parser.add_argument("--only", nargs="*", help="replay only mutations whose key or id contains one of these")
    parser.add_argument("--out", type=Path, help="also write the full JSON result here")
    args = parser.parse_args(argv)
    if args.mutations:
        result = run_mutations(only=args.only, progress=lambda r: print(
            "%-8s %s" % (r.get("result"), r.get("key") or r.get("id")), file=sys.stderr, flush=True))
    else:
        result = self_test()
    text = json.dumps(result, indent=2)
    if args.out:
        args.out.write_text(text + "\n")
    print(text if not args.mutations else json.dumps({k: result[k] for k in ("status", "totals", "problems")},
                                                      indent=2))
    return int(result["status"] != "pass")


if __name__ == "__main__":
    raise SystemExit(main())
