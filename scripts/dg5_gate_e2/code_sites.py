"""Static raise sites of refusal codes in owner source (METHOD-RULING addendum 11, route 2). Read only, importable.

addendum 11: condition (b) (and the same condition in KILLED_CODE and keycheck (iii)) holds only if
  1. the trial records the exception's origin frame at the row's guard (a re-raised or rebuilt refusal carrying the
     guard's code unchanged counts), or
  2. the refusal code occurs at exactly one raise site in the owner source at that family's base, by a static check over
     every constructed code; a code built at run time, whose sites cannot be enumerated, fails.
Otherwise (b) is unverifiable and fails closed. This module is route 2, for the gate, keycheck (iii) and the judge.

    sites = OwnerSites({path: source text})          # every owner file at the base
    sites.guard_code(path, line)  -> (code or None, why)   the code the guard at path:line raises, if constant
    sites.unique(code)            -> (True/False, evidence) exactly one constructed site, nothing else can build it

What a raise site is (ast, over every owner file):
  * every construction `C(arg0, ...)` of a refusal class: an exception class DEFINED in the loaded source (builtin
    errors carry values, not refusal codes), wherever it occurs (raised, passed to shared_refuse/shared_require, or stored first), and
    calls to raiser functions: a function is a raiser when it raises (or calls a raiser)
    with one of its own parameters as the code (`def require(code, condition): ... raise AdapterRefusal(code)`),
    to a fixpoint across files (by bare name); `shared_refuse(C(code))` / `shared_require(C(code), ...)` reach the
    inner constructor's arg0.
  * The code argument is classified:
      const     folds to a string: 'a/b', CONST, 'a' + CONST, f'{CONST}/b', '%s/b' % CONST (module constants bound once,
                function-local names assigned only constants, and a for-loop over a literal tuple of strings)
      forward   a parameter of the enclosing raiser function (the call sites of that function are the sites)
      rebuild   the code of a caught exception, unchanged (`error.code`, `error.reason`, `str(error)`, `error.args[0]`
                of an `except ... as error`): rule 1's re-raise; it constructs no new code
      template  partly constant (f-string, +, %, .format): a regex; it can build any code the regex matches
      dynamic   anything else (a name or call whose value the source does not show): its codes cannot be enumerated
A code is unique when exactly one const site builds it, no template site's regex matches it, and no dynamic site exists
in the same owner file or in any file that calls a raiser defined there (fail closed: an unenumerable site might build it).
"""
from pathlib import Path
import ast
import re

RAISE_SUFFIXES = ('Refusal', 'Halt', 'Error')
READ_ONLY_ATTRS = ('code', 'reason')


def _load_sources_module():
    import importlib.util
    spec = importlib.util.spec_from_file_location('dg5_proof_sources_cs', Path(__file__).resolve().parent / 'proof_sources.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


PS = _load_sources_module()


def _callee(node):
    func = node.func if isinstance(node, ast.Call) else None
    if isinstance(func, ast.Name):
        return func.id
    if isinstance(func, ast.Attribute):
        return func.attr
    return None


class _Scope:
    """Per function: parameters, except-handler names, local names bound only to constants (or a loop over a literal)."""

    def __init__(self, func, consts):
        self.params = set()
        if func is not None:
            a = func.args
            self.params = {x.arg for x in a.posonlyargs + a.args + a.kwonlyargs}
            if a.vararg:
                self.params.add(a.vararg.arg)
        self.caught, self.local = set(), {}
        body = func if func is not None else None
        if body is None:
            return
        assigned = {}
        for node in ast.walk(func):
            if isinstance(node, ast.ExceptHandler) and node.name:
                self.caught.add(node.name)
            if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
                assigned.setdefault(node.targets[0].id, []).append(PS._fold(node.value, consts))
            if isinstance(node, ast.For) and isinstance(node.target, ast.Name) and isinstance(node.iter, (ast.Tuple, ast.List)):
                assigned.setdefault(node.target.id, []).extend(PS._fold(e, consts) for e in node.iter.elts)
            elif isinstance(node, (ast.For, ast.comprehension)) and isinstance(getattr(node, 'target', None), ast.Name):
                assigned.setdefault(node.target.id, []).append(None)
        for name, values in assigned.items():
            if None not in values and name not in self.params:
                self.local[name] = sorted(set(values))


class OwnerSites:
    def __init__(self, files):
        self.files = {path: text for path, text in files.items()}
        self.trees = {path: ast.parse(text, filename=path) for path, text in self.files.items()}
        self.consts = {path: PS._constants(tree) for path, tree in self.trees.items()}
        # Refusal classes: exception classes DEFINED in the loaded source (a refusal code travels on these; builtin
        # errors such as KeyError(cell) carry values, not codes). Fixpoint over bases: Exception/BaseException, a
        # name ending in Error/Exception/Refusal/Halt, or another class already found.
        classdefs = [node for tree in self.trees.values() for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
        self.exc_classes = set()
        changed = True
        while changed:
            changed = False
            for node in classdefs:
                if node.name in self.exc_classes:
                    continue
                bases = [b.attr if isinstance(b, ast.Attribute) else getattr(b, 'id', '') for b in node.bases]
                if any(b in ('Exception', 'BaseException') or b.endswith(('Error', 'Exception', 'Refusal', 'Halt'))
                       or b in self.exc_classes for b in bases):
                    self.exc_classes.add(node.name)
                    changed = True
        self.raisers = {}  # function name -> index of its code parameter
        self._find_raisers()
        self.sites = []    # dict(path, line, kind, code|pattern|expr, via)
        for path in self.trees:
            self._collect(path)

    # -- code expressions
    def _codes(self, node, path, scope):
        """[(kind, value)] for a code expression."""
        consts = self.consts[path]
        folded = PS._fold(node, consts)
        if folded is not None:
            return [('const', folded)]
        if isinstance(node, ast.Name) and node.id in scope.local:
            return [('const', v) for v in scope.local[node.id]]
        if isinstance(node, ast.Name) and node.id in scope.params:
            return [('forward', node.id)]
        if isinstance(node, ast.Attribute) and node.attr in READ_ONLY_ATTRS and isinstance(node.value, ast.Name) \
                and node.value.id in scope.caught:
            return [('rebuild', ast.unparse(node))]
        if isinstance(node, ast.Call) and _callee(node) == 'str' and node.args and isinstance(node.args[0], ast.Name) \
                and node.args[0].id in scope.caught:
            return [('rebuild', ast.unparse(node))]
        if isinstance(node, ast.Subscript) and isinstance(node.value, ast.Attribute) and node.value.attr == 'args' \
                and isinstance(node.value.value, ast.Name) and node.value.value.id in scope.caught:
            return [('rebuild', ast.unparse(node))]
        pattern = self._pattern(node, path, scope)
        if pattern is not None:
            return [('template', pattern)]
        return [('dynamic', ast.unparse(node)[:160])]

    def _pattern(self, node, path, scope):
        """A regex for a partly constant code, or None."""
        consts = self.consts[path]

        def part(n):
            f = PS._fold(n, consts)
            if f is not None:
                return re.escape(f)
            if isinstance(n, ast.Name) and n.id in scope.local:
                return '(?:' + '|'.join(re.escape(v) for v in scope.local[n.id]) + ')'
            if isinstance(n, ast.BinOp) and isinstance(n.op, ast.Add):
                left, right = part(n.left), part(n.right)
                return left + right
            if isinstance(n, ast.JoinedStr):
                out = ''
                for v in n.values:
                    out += part(v.value) if isinstance(v, ast.FormattedValue) else re.escape(v.value)
                return out
            return '.*'

        if isinstance(node, (ast.JoinedStr, ast.BinOp)) and not (isinstance(node, ast.BinOp) and isinstance(node.op, ast.Mod)):
            pattern = part(node)
            return pattern if pattern.replace('.*', '') else None
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Mod):
            fmt = PS._fold(node.left, consts)
            if fmt is not None:
                return re.sub(r'%[sdr]', '.*', re.escape(fmt).replace('\\%', '%'))
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == 'format':
            fmt = PS._fold(node.func.value, consts)
            if fmt is not None:
                return re.sub(r'\\\{[^}]*\\\}', '.*', re.escape(fmt))
        return None

    # -- raisers
    def _code_arg(self, call):
        """The code expression of a raise/raiser call, and how it was reached."""
        name = _callee(call)
        if name in self.raisers:
            index = self.raisers[name]
            if index < len(call.args):
                arg = call.args[index]
                if isinstance(arg, ast.Call) and self._is_exc(arg):
                    return (arg.args[0] if arg.args else None), name + '(' + _callee(arg) + ')'
                return arg, name
            return None, name
        if self._is_exc(call):
            return (call.args[0] if call.args else None), name
        return None, None

    def _is_exc(self, call):
        name = _callee(call)
        return bool(name) and name in self.exc_classes

    def _functions(self, path):
        for node in ast.walk(self.trees[path]):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                yield node

    def _find_raisers(self):
        changed = True
        while changed:
            changed = False
            for path in self.trees:
                for func in self._functions(path):
                    if func.name in self.raisers:
                        continue
                    params = [x.arg for x in func.args.posonlyargs + func.args.args]
                    for node in ast.walk(func):
                        call = node.exc if isinstance(node, ast.Raise) and isinstance(node.exc, ast.Call) else (
                            node if isinstance(node, ast.Call) and _callee(node) in self.raisers else None)
                        if call is None:
                            continue
                        arg, _ = self._code_arg(call)
                        if isinstance(arg, ast.Name) and arg.id in params:
                            self.raisers[func.name] = params.index(arg.id)
                            changed = True
                            break

    def _collect(self, path):
        tree = self.trees[path]
        owners = {}
        for func in self._functions(path):
            for node in ast.walk(func):
                owners.setdefault(id(node), func)  # innermost wins below
        for func in sorted(self._functions(path), key=lambda f: f.lineno):
            for node in ast.walk(func):
                owners[id(node)] = func
        # exception constructions passed straight to a raiser call (computed once per file, not per construction)
        scopes = {}
        wrapped = {id(arg) for p in ast.walk(tree) if isinstance(p, ast.Call) and _callee(p) in self.raisers
                   for arg in p.args}
        for node in ast.walk(tree):
            call = None
            if isinstance(node, ast.Raise) and isinstance(node.exc, ast.Call):
                continue  # its exc Call is visited on its own below (constructions count wherever they occur)
            if isinstance(node, ast.Call) and (_callee(node) in self.raisers or self._is_exc(node)):
                call = node
            if call is not None and self._is_exc(call) and id(call) in wrapped:
                continue  # counted once, through the raiser call that wraps it
            if call is None:
                continue
            arg, via = self._code_arg(call)
            if arg is None:
                continue
            func = owners.get(id(node))
            if id(func) not in scopes:
                scopes[id(func)] = _Scope(func, self.consts[path])
            scope = scopes[id(func)]
            for kind, value in self._codes(arg, path, scope):
                if kind == 'forward':
                    continue  # the raiser's callers are the sites
                self.sites.append(dict(path=path, line=node.lineno, kind=kind, value=value, via=via))

    # -- queries
    def guard_code(self, path, line):
        """The code the guard statement at path:line constructs, when it is constant."""
        here = [s for s in self.sites if s['path'] == path and s['line'] == line]
        if not here:
            return None, f'no raise site at {path}:{line}'
        consts = sorted({s['value'] for s in here if s['kind'] == 'const'})
        other = [s for s in here if s['kind'] != 'const']
        if other:
            return None, f"the guard's code is built at run time ({other[0]['kind']}: {other[0]['value']})"
        if len(consts) != 1:
            return None, f'the guard constructs {len(consts)} codes {consts}'
        return consts[0], 'constant'

    def unique(self, code):
        const = [s for s in self.sites if s['kind'] == 'const' and s['value'] == code]
        templates = [s for s in self.sites if s['kind'] == 'template' and re.fullmatch(s['value'], code)]
        files = {s['path'] for s in const}
        dynamic = [s for s in self.sites if s['kind'] == 'dynamic' and s['path'] in files]
        evidence = dict(const_sites=[f"{s['path']}:{s['line']}" for s in const],
                        template_sites=[f"{s['path']}:{s['line']} {s['value']}" for s in templates],
                        dynamic_sites_in_same_files=[f"{s['path']}:{s['line']} {s['value']}" for s in dynamic])
        if len(const) != 1:
            return False, dict(evidence, why=f'{len(const)} constant raise sites build {code!r}')
        if templates:
            return False, dict(evidence, why=f'{len(templates)} run-time template sites can also build {code!r}')
        if dynamic:
            return False, dict(evidence, why=f"{len(dynamic)} unenumerable sites in {sorted(files)} could build it")
        return True, dict(evidence, why='exactly one raise site')

    def counts(self):
        from collections import Counter
        return dict(Counter(s['kind'] for s in self.sites))


def owner_files_at(repo, rev, paths):
    """{path: text} of the owner files at a revision (git show; read only)."""
    import subprocess
    out = {}
    for path in sorted(paths):
        try:
            out[path] = subprocess.check_output(['git', '-C', str(repo), 'show', f'{rev}:{path}'],
                                                stderr=subprocess.DEVNULL).decode()
        except subprocess.CalledProcessError:
            continue
    return out


# ---------------------------------------------------------------- exception classes (addendum 11 rule 1 on re-raise sites)

def _imports(tree):
    """{local name: (module name, original name)} for `from M import a, b as c`."""
    out = {}
    for node in tree.body:
        if isinstance(node, ast.ImportFrom) and node.module:
            for alias in node.names:
                out[alias.asname or alias.name] = (node.module, alias.name)
        if isinstance(node, ast.Import):
            for alias in node.names:
                out[alias.asname or alias.name] = (alias.name, None)
    return out


class Classes:
    """Resolve, from source, which exception class a guard raises and which classes a handler catches."""

    def __init__(self, repo, rev, read):
        self.repo, self.rev, self.read = repo, rev, read
        self.cache = {}

    def tree(self, module):
        if module not in self.cache:
            text = self.read(f'scripts/{module}.py')
            self.cache[module] = ast.parse(text) if text else None
        return self.cache[module]

    def resolve(self, module, name, depth=0):
        """(defining module, ast node) of a top-level class or function `name` as seen from `module`."""
        tree = self.tree(module)
        if tree is None or depth > 6:
            return None, None
        for node in tree.body:
            if isinstance(node, (ast.ClassDef, ast.FunctionDef)) and node.name == name:
                return module, node
            if isinstance(node, ast.Assign) and any(getattr(t, 'id', None) == name for t in node.targets) \
                    and isinstance(node.value, (ast.Name, ast.Attribute)):
                target = node.value.id if isinstance(node.value, ast.Name) else node.value.attr
                base = _imports(tree).get(node.value.value.id)[0] if isinstance(node.value, ast.Attribute) and \
                    isinstance(node.value.value, ast.Name) and node.value.value.id in _imports(tree) else module
                return self.resolve(base, target, depth + 1)
        imported = _imports(tree).get(name)
        if imported and imported[1]:
            return self.resolve(imported[0], imported[1], depth + 1)
        return None, None

    def bases(self, module, name, depth=0):
        """Every class name in the inheritance chain of `name` (itself included), as far as the source shows."""
        import builtins
        if isinstance(getattr(builtins, name, None), type) and issubclass(getattr(builtins, name), BaseException):
            return [name] + [c.__name__ for c in getattr(builtins, name).__mro__[1:] if c is not object]
        mod, node = self.resolve(module, name)
        out = [name]
        if node is None or not isinstance(node, ast.ClassDef) or depth > 8:
            return out + ['?']
        for base in node.bases:
            if isinstance(base, ast.Name):
                out += self.bases(mod, base.id, depth + 1)
            elif isinstance(base, ast.Attribute) and isinstance(base.value, ast.Name):
                imp = _imports(self.tree(mod)).get(base.value.id)
                out += self.bases(imp[0], base.attr, depth + 1) if imp else [base.attr, '?']
        return out

    def raised_class(self, module, func_name, depth=0):
        """The class a raiser function raises (`raise C(code)`), following raiser chains."""
        mod, node = self.resolve(module, func_name)
        if node is None or not isinstance(node, ast.FunctionDef) or depth > 6:
            return None, None
        for sub in ast.walk(node):
            if isinstance(sub, ast.Raise) and isinstance(sub.exc, ast.Call):
                name = _callee(sub.exc)
                return mod, name
        for sub in ast.walk(node):
            if isinstance(sub, ast.Call) and _callee(sub) and _callee(sub) != func_name:
                got = self.raised_class(mod, _callee(sub), depth + 1)
                if got[1]:
                    return got
        return None, None

    def guard_class(self, path, line):
        """(module, class name, chain) of the exception the guard statement at path:line raises."""
        module = Path(path).stem
        tree = self.tree(module)
        if tree is None:
            return None
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and getattr(node, 'lineno', None) == line:
                name = _callee(node)
                if name and name.endswith(RAISE_SUFFIXES):
                    return module, name, self.bases(module, name)
                mod, cls = self.raised_class(module, name)
                if cls:
                    return mod, cls, self.bases(mod, cls)
        return None

    def handler_classes(self, path, line):
        """Class names the `except` handler around path:line catches (as written), or None outside a handler."""
        module = Path(path).stem
        tree = self.tree(module)
        if tree is None:
            return None
        for node in ast.walk(tree):
            if isinstance(node, ast.ExceptHandler) and node.lineno <= line <= (node.end_lineno or node.lineno):
                types = node.type.elts if isinstance(node.type, ast.Tuple) else [node.type] if node.type else []
                return [t.attr if isinstance(t, ast.Attribute) else getattr(t, 'id', '?') for t in types] or ['BaseException']
        return None
