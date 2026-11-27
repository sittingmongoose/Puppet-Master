"""Written-proof keys read from SOURCE (TOOL-ISSUES T316; pm-ea-lead 1121114747-ee85 finding (1)).

The loaded PROOFS dict cannot show a duplicate: the second definition has already replaced the first. So keys are read
from the module's Python source (ast) or the proof.json bytes, with the line of every definition.

Python forms that define keys (anything else that can change PROOFS is reported as unanalyzable, which refuses):
    PROOFS = {...}            PROOFS: T = {...}          PROOFS |= {...}
    PROOFS.update({...})      PROOFS.update(k=v)         PROOFS['k'] = ...      PROOFS.setdefault('k', ...)
A second `PROOFS = ...` rebinding, a non-constant key, a `**` spread, `del PROOFS[...]`, pop/popitem/clear, or any
other PROOFS method call is unanalyzable. Reading PROOFS (e.g. `for k in PROOFS`) is fine.
JSON: every member of the top-level object, with its line, found by a scanner that keeps duplicate members.
"""
import ast
import json

MUTATORS = ('pop', 'popitem', 'clear', '__setitem__', '__delitem__', '__ior__')


def _families(node, consts):
    """A proof value's literal families list (dict(..., families=[...]) or {'families': [...]}), None when it has none
    (the proof then applies to every family) or when it is not a literal (None too: callers treat that as 'all')."""
    items = []
    if isinstance(node, ast.Call) and getattr(node.func, 'id', None) == 'dict':
        items = [(k.arg, k.value) for k in node.keywords if k.arg]
    elif isinstance(node, ast.Dict):
        items = [(_fold(k, consts) if k is not None else None, v) for k, v in zip(node.keys, node.values)]
    for key, value in items:
        if key == 'families':
            if isinstance(value, (ast.List, ast.Tuple)):
                folded = [_fold(e, consts) for e in value.elts]
                return None if None in folded else folded
            if isinstance(value, ast.Name) and isinstance(consts.get('__lists__', {}).get(value.id), list):
                return consts['__lists__'][value.id]
            return None
    return None


def _dump(node):
    return ast.dump(node, annotate_fields=True, include_attributes=False)


def _constants(tree):
    """Module-level string constants bound exactly once (NAME = 'text', or folded from earlier constants)."""
    stores = {}
    for node in ast.walk(tree):
        if isinstance(node, ast.Name) and isinstance(node.ctx, (ast.Store, ast.Del)):
            stores[node.id] = stores.get(node.id, 0) + 1
    consts = {}
    for node in tree.body:
        if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name) \
                and stores.get(node.targets[0].id) == 1:
            value = _fold(node.value, consts)
            if value is not None:
                consts[node.targets[0].id] = value
            elif isinstance(node.value, (ast.List, ast.Tuple)):
                items = [_fold(e, consts) for e in node.value.elts]
                if None not in items:  # a list of strings bound once (e.g. FAMILIES), for families=FAMILIES
                    consts.setdefault('__lists__', {})[node.targets[0].id] = items
    return consts


def _fold(node, consts):
    """A key expression folded to its string: 'text', CONST, a + b, f'{CONST}text'. None when it cannot be folded."""
    if isinstance(node, ast.Constant) and isinstance(node.value, str):
        return node.value
    if isinstance(node, ast.Name):
        return consts.get(node.id)
    if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
        left, right = _fold(node.left, consts), _fold(node.right, consts)
        return None if left is None or right is None else left + right
    if isinstance(node, ast.JoinedStr):
        parts = []
        for value in node.values:
            if isinstance(value, ast.FormattedValue):
                if value.conversion != -1 or value.format_spec is not None:
                    return None
                value = value.value
            part = _fold(value, consts)
            if part is None:
                return None
            parts.append(part)
        return ''.join(parts)
    return None


def python_keys(source, label, name='PROOFS'):
    """Returns (entries, problems): entries = [dict(key, line, value, source)], value = a line-free dump of the definition.
    Keys may be string constants or fold from module-level string constants bound once (SITE + '517')."""
    tree = ast.parse(source, filename=label)
    consts = _constants(tree)
    entries, problems, handled = [], [], set()
    binds = 0

    def is_name(node):
        return isinstance(node, ast.Name) and node.id == name

    literal_dicts = {}  # module-level NAME = {...} bound once (the source of a supported comprehension)
    for node in tree.body:
        if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name) \
                and isinstance(node.value, ast.Dict) and node.targets[0].id != name:
            literal_dicts[node.targets[0].id] = node.value
    stores = {}
    for node in ast.walk(tree):
        if isinstance(node, ast.Name) and isinstance(node.ctx, (ast.Store, ast.Del)):
            stores[node.id] = stores.get(node.id, 0) + 1

    def from_comprehension(node, where):
        """{<key expr over k>: <value> for k[, v] in SRC.items() | SRC.keys() | SRC}, SRC a literal dict bound once with
        foldable distinct keys. Each SRC key yields one PROOFS key (line = the SRC entry's line)."""
        gen = node.generators[0] if len(node.generators) == 1 else None
        if gen is None or gen.ifs or gen.is_async:
            return problems.append(f'{label}:{where.lineno}: {name} comprehension with filters or several loops')
        it = gen.iter
        method = it.func.attr if isinstance(it, ast.Call) and isinstance(it.func, ast.Attribute) and not it.args else None
        src = it.func.value if method in ('items', 'keys') else it
        target = gen.target
        if isinstance(target, ast.Tuple) and method == 'items' and len(target.elts) == 2:
            target = target.elts[0]
        if not (isinstance(src, ast.Name) and src.id in literal_dicts and stores.get(src.id) == 1
                and isinstance(target, ast.Name) and method in ('items', 'keys', None)
                and (method == 'items') == isinstance(gen.target, ast.Tuple)):
            return problems.append(f'{label}:{where.lineno}: {name} comprehension over a non-literal source')
        source_dict = literal_dicts[src.id]
        seen = {}
        for skey, svalue in zip(source_dict.keys, source_dict.values):
            folded = _fold(skey, consts) if skey is not None else None
            if folded is None:
                return problems.append(f'{label}:{source_dict.lineno}: {src.id} has a non-constant key')
            if folded in seen:
                problems.append(f'{label}:{skey.lineno}: {src.id} key {folded!r} also at line {seen[folded]} '
                                f'(the comprehension would silently drop one)')
            seen[folded] = skey.lineno
            key = _fold(node.key, dict(consts, **{target.id: folded}))
            if key is None:
                return problems.append(f'{label}:{where.lineno}: {name} comprehension key does not fold')
            entries.append(dict(key=key, line=skey.lineno, value=_dump(node.value) + '|' + _dump(svalue),
                                families=_families(node.value, consts),
                                source=label, kind='py'))

    def from_dict(node, where):
        if isinstance(node, ast.DictComp):
            return from_comprehension(node, where)
        if not isinstance(node, ast.Dict):
            problems.append(f'{label}:{where.lineno}: {name} built from a non-literal ({type(node).__name__})')
            return
        for key, value in zip(node.keys, node.values):
            if key is None:
                problems.append(f'{label}:{value.lineno}: ** spread into {name}')
            elif _fold(key, consts) is not None:
                entries.append(dict(key=_fold(key, consts), line=key.lineno, value=_dump(value), source=label, kind='py',
                                    families=_families(value, consts)))
            else:
                problems.append(f'{label}:{key.lineno}: non-constant {name} key')

    for node in ast.walk(tree):
        if isinstance(node, (ast.Assign, ast.AnnAssign)):
            targets = node.targets if isinstance(node, ast.Assign) else [node.target]
            for target in targets:
                if is_name(target):
                    handled.add(id(target))
                    binds += 1
                    if binds > 1:
                        problems.append(f'{label}:{node.lineno}: {name} rebound (earlier keys discarded)')
                    if node.value is not None:
                        from_dict(node.value, node)
                elif isinstance(target, ast.Subscript) and is_name(target.value):
                    handled.add(id(target.value))
                    key = target.slice
                    if _fold(key, consts) is not None:
                        entries.append(dict(key=_fold(key, consts), line=node.lineno, value=_dump(node.value), source=label,
                                            families=_families(node.value, consts),
                                            kind='py'))
                    else:
                        problems.append(f'{label}:{node.lineno}: non-constant {name}[...] key')
        elif isinstance(node, ast.AugAssign) and is_name(node.target):
            handled.add(id(node.target))
            if isinstance(node.op, ast.BitOr):
                from_dict(node.value, node)
            else:
                problems.append(f'{label}:{node.lineno}: {name} changed by {type(node.op).__name__}=')
        elif isinstance(node, ast.Delete):
            for target in node.targets:
                if (isinstance(target, ast.Subscript) and is_name(target.value)) or is_name(target):
                    handled.add(id(target.value if isinstance(target, ast.Subscript) else target))
                    problems.append(f'{label}:{node.lineno}: del on {name}')
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and is_name(node.func.value):
            handled.add(id(node.func.value))
            attr = node.func.attr
            if attr == 'update':
                if len(node.args) > 1:
                    problems.append(f'{label}:{node.lineno}: {name}.update with several arguments')
                for arg in node.args:
                    from_dict(arg, node)
                for keyword in node.keywords:
                    if keyword.arg is None:
                        problems.append(f'{label}:{node.lineno}: ** spread into {name}.update')
                    else:
                        entries.append(dict(key=keyword.arg, line=keyword.value.lineno, value=_dump(keyword.value),
                                            families=_families(keyword.value, consts),
                                            source=label, kind='py'))
            elif attr == 'setdefault':
                key = node.args[0] if node.args else None
                if key is not None and _fold(key, consts) is not None:
                    entries.append(dict(key=_fold(key, consts), line=node.lineno,
                                        families=_families(node.args[1], consts) if len(node.args) > 1 else None,
                                        value=_dump(node.args[1]) if len(node.args) > 1 else 'None', source=label, kind='py'))
                else:
                    problems.append(f'{label}:{node.lineno}: non-constant {name}.setdefault key')
            elif attr in MUTATORS or attr not in ('get', 'items', 'keys', 'values', 'copy', '__contains__', '__getitem__'):
                problems.append(f'{label}:{node.lineno}: {name}.{attr}(...) may change {name}')
    # Any other binding of the name (for/with/import/walrus/global function rebinding) is unanalyzable.
    for node in ast.walk(tree):
        if is_name(node) and isinstance(node.ctx, (ast.Store, ast.Del)) and id(node) not in handled:
            problems.append(f'{label}:{node.lineno}: {name} bound by an unsupported statement')
    # N1 (review A): any other read of the name could alias PROOFS and change it unseen (`_p = PROOFS`,
    # `dict.update(PROOFS, ...)`, `operator.setitem(PROOFS, ...)`). A Load is allowed only as: the receiver of a
    # handled or read-only method call, a subscript read, iteration, a membership test, or the argument of a read-only
    # builtin. `globals()['PROOFS']` / `vars()['PROOFS']` (a string subscript of globals/vars) is unanalyzable too.
    parents = {}
    for node in ast.walk(tree):
        for child in ast.iter_child_nodes(node):
            parents[id(child)] = node
    read_only_calls = ('len', 'sorted', 'list', 'set', 'tuple', 'dict', 'iter', 'any', 'all', 'repr', 'str', 'print')
    for node in ast.walk(tree):
        if not (is_name(node) and isinstance(node.ctx, ast.Load)) or id(node) in handled:
            continue
        parent = parents.get(id(node))
        ok = (isinstance(parent, ast.Attribute) and parent.attr in ('get', 'items', 'keys', 'values', 'copy', '__contains__',
                                                                   '__getitem__'))
        ok = ok or (isinstance(parent, ast.Subscript) and parent.value is node and isinstance(parent.ctx, ast.Load))
        ok = ok or (isinstance(parent, (ast.For, ast.comprehension)) and parent.iter is node)
        ok = ok or (isinstance(parent, ast.Compare) and node in parent.comparators
                    and all(isinstance(op, (ast.In, ast.NotIn)) for op in parent.ops))
        ok = ok or (isinstance(parent, ast.Call) and node in parent.args and isinstance(parent.func, ast.Name)
                    and parent.func.id in read_only_calls)
        if not ok:
            problems.append(f'{label}:{node.lineno}: {name} read in a way that could alias it '
                            f'({type(parent).__name__}); the source cannot show what it changes')
    for node in ast.walk(tree):
        if isinstance(node, ast.Subscript) and isinstance(node.value, ast.Call) and isinstance(node.value.func, ast.Name) \
                and node.value.func.id in ('globals', 'vars', 'locals') and isinstance(node.slice, ast.Constant) \
                and node.slice.value == name:
            problems.append(f'{label}:{node.lineno}: {name} reached through {node.value.func.id}()')
    return entries, problems


def json_keys(raw, label):
    """Members of the top-level JSON object, duplicates kept, each with its line. Returns (entries, problems)."""
    text = raw.decode() if isinstance(raw, bytes) else raw
    try:
        pairs = json.loads(text, object_pairs_hook=lambda p: p)
    except ValueError as error:
        return [], [f'{label}: not JSON ({error})']
    if not isinstance(pairs, list):
        return [], [f'{label}: top level is not an object']
    lines, depth, i, line = [], 0, 0, 1
    while i < len(text):  # positions of depth-1 member names, in order (strings skipped exactly)
        ch = text[i]
        if ch == '\n':
            line += 1
        elif ch in '{[':
            depth += 1
        elif ch in '}]':
            depth -= 1
        elif ch == '"':
            start_line, j = line, i + 1
            while text[j] != '"':
                j += 2 if text[j] == '\\' else 1
            k = j + 1
            while k < len(text) and text[k] in ' \t\r\n':
                k += 1
            if depth == 1 and k < len(text) and text[k] == ':':
                lines.append(start_line)
            line += text.count('\n', i, j)
            i = j
        i += 1
    if len(lines) != len(pairs):
        return [], [f'{label}: could not locate members ({len(lines)} found, {len(pairs)} parsed)']
    return [dict(key=key, line=at, value=json.dumps(value, sort_keys=True), source=label, kind='json',
                 families=value.get('families') if isinstance(value, dict) and isinstance(value.get('families'), list) else None)
            for (key, value), at in zip(pairs, lines)], []


def duplicates(entries):
    """Group entries by key; every key defined more than once, with where, whether across sources, whether they differ."""
    by_key = {}
    for entry in entries:
        by_key.setdefault(entry['key'], []).append(entry)
    out = []
    for key, items in sorted(by_key.items()):
        if len(items) > 1:
            out.append(dict(key=key, at=[f"{e['source']}:{e['line']}" for e in items],
                            scope='across' if len({e['source'] for e in items}) > 1 else 'within',
                            # None: a .py and a .json definition cannot be compared by text
                            definitions_differ=None if len({e['kind'] for e in items}) > 1
                            else len({e['value'] for e in items}) > 1))
    return out
