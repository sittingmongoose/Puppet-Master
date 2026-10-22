#!/usr/bin/env python3
"""5.6 Pro chat layer: mount the 5.6 Pro chat in PMConcept7, in place of the Home layer's stand-in chat.

  text, notes = chat56_layer.apply(text, need)      # step 6b of opus-5.5 build.build_text(), after Home, before Glass
  problems = chat56_layer.lint()                    # source rules for ../css and ../js (build.py lint_sources())
  problems = chat56_layer.published_problems(text)  # build.py and --check: markers, syntax, scope, the hosted guard

The chat stays the single source: the module list, the stylesheet order and the PM56_EXT shim are read from
`5.6 Pro/build.py` (parsed, never run), and the module files are read as they are. apply() only adds, each exactly once:
  1. <style id="pm56-css"> between C56:CSS markers before </head>: every chat stylesheet in build.py's CSS_ORDER,
     rewritten under the scope class .pm56-host (scope_css below; the chat's @font-face rules are dropped, the page
     embeds the same faces), then pm7-port/css/*.css in filename order, already scoped by hand and passed through as is.
  2. Three scripts between C56:BODY markers before </body>, after the Home block:
       pm56-js       pm7-port/js/00-09 (window.PM56_HOST, the hosted switch), then the chat's data, motion and variants
                     scripts, build.py's EXT_SHIM, plan-media-batch17.js and every MODULES script in order (the NieR
                     modules excepted: PMConcept7 owns NieR, see HOSTED_SKIP_JS);
       pm56-app-js   app.js (it boots into #pmRoot, which 00-host.js mounted in #chatPanel);
       pm56-port-js  pm7-port/js/10-99 in filename order, each in a guarded scope of its own.
The chat's own code is unchanged except where a host hook was impossible; those edits are guarded by window.PM56_HOST,
so the standalone (built by 5.6 Pro/build.py, where PM56_HOST is never defined) behaves exactly as before.

Scope (scope_css): every chat selector is rewritten to match only inside a .pm56-host element (the column #pmRoot,
the overlay root #pmOverlayRoot, each Home tab body the chat draws). body[data-theme...] becomes div.pm56-host[...]
(every host carries data-theme), html/:root/body alone become the host, other html and body state stays on html and
body with the host after it, `*` resets cover the host and its descendants, #pmRoot/#pmOverlayRoot become the host
itself. Specificity rises by one class everywhere, so the chat's own cascade keeps its order.
"""
from __future__ import annotations

import ast
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
PORT = TOOLS.parent
CHAT = PORT.parent
CONCEPTS = CHAT.parents[1]
REPO = CONCEPTS.parent

CSS_START, CSS_END = '<!-- C56:CSS:START -->', '<!-- C56:CSS:END -->'
JS_START, JS_END = '<!-- C56:BODY:START -->', '<!-- C56:BODY:END -->'
HEAD_ANCHOR = '\n</head>'
BODY_ANCHOR = '\n</body>'
SCOPE = '.pm56-host'
HOST_TAG = 'div.pm56-host'

# PMConcept7 owns NieR (scene, ground, faces, PM_NIER and PM_THEME_PAINT_FAMILY, which the chat's nier.js would
# replace): the chat's NieR scripts are not in the hosted bundle; its NieR stylesheets stay (they key on PMConcept7's
# own html[data-o55-nier...] contract) except the faces and the scenes, which PMConcept7 draws itself.
HOSTED_SKIP_JS = ['nier-fonts', 'nier', 'nier-parts', 'nier-world', 'nier-scenes']
HOSTED_SKIP_CSS = ['nier-fonts.css', 'nier-scenes.css']

# Chat classes PMConcept7 styles globally (its own rules would reach the chat's elements): renamed in the chat's
# emitted CSS and JS, consistently, as whole class tokens. PMConcept7's left rail is .activity-bar (81 rules).
RENAME_CLASSES = {'activity-bar': 'pm56-activity-bar'}


def rename_css_classes(css: str) -> str:
    for old, new in RENAME_CLASSES.items():
        css = re.sub(r'\.' + re.escape(old) + r'(?![\w-])', '.' + new, css)
    return css


def rename_js_classes(js: str) -> str:
    for old, new in RENAME_CLASSES.items():
        js = re.sub(r'(?<![\w-])' + re.escape(old) + r'(?![\w-])', new, js)
    return js


# The page parts the chat mounts on; each must be in the input exactly once.
REQUIRED = ['id="chatPanel"', '<!-- HOME:BODY:END -->', '<!-- HOME:CSS:END -->']


# ---------------------------------------------------------------------------------------------------------------------
# the chat's own build: MODULES, CSS_ORDER and EXT_SHIM, read from 5.6 Pro/build.py without running it

def chat_build_spec() -> dict:
    tree = ast.parse((CHAT / 'build.py').read_text(encoding='utf-8'))
    found: dict = {}
    for node in tree.body:
        if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
            name = node.targets[0].id
            if name in ('MODULES', 'CSS_LAST', 'EXT_SHIM'):
                found[name] = ast.literal_eval(node.value)
            elif name == 'CSS_ORDER':
                found['_css_order_expr'] = node.value
            elif name == 'data':
                found['_data_expr'] = node.value
    for k in ('MODULES', 'CSS_LAST', 'EXT_SHIM', '_css_order_expr', '_data_expr'):
        if k not in found:
            raise ValueError(f'chat56 layer: 5.6 Pro/build.py no longer assigns {k.strip("_")}')
    expr = ast.Expression(found.pop('_css_order_expr'))
    ast.fix_missing_locations(expr)
    found['CSS_ORDER'] = eval(compile(expr, 'build.py:CSS_ORDER', 'eval'), {'__builtins__': {}},
                              {'MODULES': found['MODULES'], 'CSS_LAST': found['CSS_LAST']})
    # data=(join([... head scripts ...]) + '\n' + EXT_SHIM + '\n' + read('plan-media-batch17.js') + '\n' + join(MODULES))
    nodes = [n for n in ast.walk(found.pop('_data_expr')) if isinstance(n, ast.Constant) and isinstance(n.value, str)
             and n.value.endswith('.js') and n.value != '.js']
    consts = [n.value for n in sorted(nodes, key=lambda n: (n.lineno, n.col_offset))]
    if len(consts) < 2 or consts[-1] != 'plan-media-batch17.js':
        raise ValueError(f'chat56 layer: the shape of build.py\'s data scripts changed: {consts}')
    found['HEAD_JS'] = consts[:-1]
    found['PRE_MODULES_JS'] = consts[-1:]
    if len(set(found['CSS_ORDER'])) != len(found['CSS_ORDER']):
        raise ValueError('chat56 layer: build.py lists a stylesheet twice')
    return found


def read_chat(name: str) -> str:
    p = CHAT / name
    if not p.is_file():
        raise ValueError(f'chat56 layer: chat source {name} is missing')
    return p.read_text(encoding='utf-8')


# ---------------------------------------------------------------------------------------------------------------------
# CSS: a small parser (comments dropped, strings and nesting respected) and the selector scoper

def strip_comments(css: str) -> str:
    out, i, n, q = [], 0, len(css), ''
    while i < n:
        ch = css[i]
        if q:
            out.append(ch)
            if ch == '\\' and i + 1 < n:
                out.append(css[i + 1]); i += 2; continue
            if ch == q:
                q = ''
            i += 1
            continue
        if ch in '"\'':
            q = ch; out.append(ch); i += 1; continue
        if ch == '/' and css.startswith('/*', i):
            j = css.find('*/', i + 2)
            i = n if j < 0 else j + 2
            continue
        out.append(ch); i += 1
    return ''.join(out)


def _scan_to(css: str, i: int, stops: str) -> int:
    """Index of the first char in stops at depth 0 (outside strings, () and [])."""
    n, depth, q = len(css), 0, ''
    while i < n:
        ch = css[i]
        if q:
            if ch == '\\':
                i += 2; continue
            if ch == q:
                q = ''
        elif ch in '"\'':
            q = ch
        elif ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        elif depth == 0 and ch in stops:
            return i
        i += 1
    return n


def _match_brace(css: str, i: int) -> int:
    """css[i] == '{': index of its matching '}'."""
    n, depth, q = len(css), 0, ''
    while i < n:
        ch = css[i]
        if q:
            if ch == '\\':
                i += 2; continue
            if ch == q:
                q = ''
        elif ch in '"\'':
            q = ch
        elif ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return i
        i += 1
    raise ValueError('chat56 layer: unbalanced braces in CSS')


GROUPING = re.compile(r'@(?:-webkit-)?(media|supports|layer|container|document|scope)\b', re.I)


def parse_css(css: str) -> list:
    """[('stmt', text) | ('rule', prelude, body) | ('group', prelude, children) | ('at', prelude, body)]"""
    items, i, n = [], 0, len(css)
    while i < n:
        while i < n and css[i] in ' \t\r\n;':
            i += 1
        if i >= n:
            break
        j = _scan_to(css, i, '{;}')
        if j >= n:
            break
        prelude = css[i:j].strip()
        if css[j] == ';' or css[j] == '}':
            if prelude:
                items.append(('stmt', prelude))
            i = j + 1
            continue
        k = _match_brace(css, j)
        body = css[j + 1:k]
        if prelude.startswith('@'):
            if GROUPING.match(prelude):
                items.append(('group', prelude, parse_css(body)))
            else:
                items.append(('at', prelude, body))
        else:
            items.append(('rule', prelude, body))
        i = k + 1
    return items


def split_top(s: str, sep: str = ',') -> list[str]:
    parts, depth, cur, q = [], 0, [], ''
    for ch in s:
        if q:
            cur.append(ch)
            if ch == q:
                q = ''
            continue
        if ch in '"\'':
            q = ch
        elif ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        elif depth == 0 and ch == sep:
            parts.append(''.join(cur)); cur = []
            continue
        cur.append(ch)
    parts.append(''.join(cur))
    return parts


def tokens(sel: str) -> list[str]:
    """A complex selector as [compound, combinator, compound, ...]; the descendant combinator is ' '."""
    out, cur, depth, q, i, n = [], [], 0, '', 0, len(sel)
    pending = None

    def flush():
        nonlocal cur, pending
        if cur:
            if out and pending is None:
                out.append(' ')
            elif pending is not None:
                out.append(pending)
            out.append(''.join(cur))
            cur, pending = [], None

    while i < n:
        ch = sel[i]
        if q:
            cur.append(ch)
            if ch == q:
                q = ''
            i += 1
            continue
        if ch in '"\'':
            q = ch
        elif ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        if depth == 0 and ch in ' \t\n\r>+~':
            if cur:
                comp = ''.join(cur)
                if out and pending is None:
                    out.append(' ')
                elif out and pending is not None:
                    out.append(pending)
                out.append(comp)
                cur, pending = [], None
            if ch in '>+~':
                pending = ch
            i += 1
            continue
        cur.append(ch)
        i += 1
    if cur:
        if out:
            out.append(pending if pending is not None else ' ')
        out.append(''.join(cur))
    return out


def simple_parts(comp: str) -> list[str]:
    """A compound split into its simple selectors: type/universal first, then .class, #id, [attr], :pseudo(...)."""
    parts, i, n = [], 0, len(comp)
    m = re.match(r'(?:[\w-]+|\*)?', comp)
    if m and m.group(0):
        parts.append(m.group(0)); i = m.end()
    while i < n:
        ch = comp[i]
        if ch == '[':
            j = _scan_to(comp, i + 1, ']')
            parts.append(comp[i:j + 1]); i = j + 1
        elif ch in '.#':
            m = re.match(r'[.#](?:\\.|[\w-])+', comp[i:])
            parts.append(m.group(0)); i += m.end()
        elif ch == ':':
            m = re.match(r'::?[\w-]+', comp[i:])
            j = i + m.end()
            if j < n and comp[j] == '(':
                depth, k = 0, j
                while k < n:
                    if comp[k] == '(':
                        depth += 1
                    elif comp[k] == ')':
                        depth -= 1
                        if depth == 0:
                            break
                    k += 1
                j = k + 1
            parts.append(comp[i:j]); i = j
        else:
            raise ValueError(f'chat56 layer: cannot read compound selector {comp!r}')
    return parts


ROOT_IDS = ('#pmRoot', '#pmOverlayRoot')


def is_theme_part(p: str) -> bool:
    return 'data-theme' in p


def host_from(parts: list[str], tag: str = HOST_TAG) -> str:
    """The host compound with the given simple selectors (pseudo-elements stay last)."""
    cut = next((i for i, p in enumerate(parts) if p.startswith('::')), len(parts))
    return tag + ''.join(parts[:cut]) + ''.join(parts[cut:])


def scope_complex(sel: str, notes: dict, SCOPE: str = SCOPE, HOST_TAG: str = HOST_TAG, overlay: bool = False) -> list[str]:
    sel = ' '.join(sel.split())
    if not sel:
        return []
    toks = tokens(sel)
    comps = toks[0::2]
    c0 = comps[0]
    head = simple_parts(c0)
    base = head[0] if head and not head[0][0] in '.#[:' else ''
    rest0 = head[1:] if base else head

    def join(ts):
        out = ''
        for t in ts:
            if t in (' ', '>', '+', '~'):
                out += ' ' if t == ' ' else f' {t} '
            else:
                out += t
        return out

    def body_like(i_comp: int, parts: list[str]) -> list[str]:
        """Rewrite the body compound at toks[2*i_comp]: theme parts go to the host, other state stays on body."""
        cut = next((i for i, p in enumerate(parts) if p.startswith('::')), len(parts))
        pe = parts[cut:]
        theme = [p for p in parts[:cut] if is_theme_part(p)]
        state = [p for p in parts[:cut] if not is_theme_part(p)]
        nxt = toks[2 * i_comp + 2] if 2 * i_comp + 2 < len(toks) else None
        comb = toks[2 * i_comp + 1] if 2 * i_comp + 1 < len(toks) else None
        # body[data-theme] #pmOverlayRoot ...: the overlay root is the host itself
        if nxt and comb in (' ', '>') and nxt.startswith(ROOT_IDS):
            rid_parts = simple_parts(nxt)
            merged = rid_parts[0] + '.pm56-host' + ''.join(theme) + ''.join(rid_parts[1:])
            pre = (['body' + ''.join(state), ' '] if state else [])
            return pre + [merged] + toks[2 * i_comp + 3:]
        if pe and not state and len(toks) == 2 * i_comp + 1:
            return [host_from(theme + pe, HOST_TAG)]
        host = host_from(theme + pe, HOST_TAG)
        if state:
            return ['body' + ''.join(state), ' ', host] + toks[2 * i_comp + 1:]
        return [host] + toks[2 * i_comp + 1:]

    # html / :root first
    if base == 'html' or (not base and rest0 and rest0[0] == ':root'):
        parts = rest0[1:] if (not base and rest0[0] == ':root') else rest0
        if len(comps) == 1:
            if not parts:
                return [HOST_TAG if base == 'html' else SCOPE + SCOPE]
            pe = [p for p in parts if p.startswith('::')]
            st = [p for p in parts if not p.startswith('::')]
            return [('html' + ''.join(st) + ' ' if st else '') + host_from(pe, HOST_TAG)]
        nxt = comps[1]
        nparts = simple_parts(nxt)
        if nparts and nparts[0] == 'body':
            return [join(['html' + ''.join(parts), ' '] + body_like(1, nparts[1:]))] if parts else [join(body_like(1, nparts[1:]))]
        if nxt.startswith(ROOT_IDS):
            rid = simple_parts(nxt)
            return [join(['html' + ''.join(parts), ' ', rid[0] + '.pm56-host' + ''.join(rid[1:])] + toks[3:])]
        return [join(['html' + ''.join(parts), ' ', SCOPE, toks[1]] + toks[2:])] if toks[1] != ' ' else \
            [join(['html' + ''.join(parts), ' ', SCOPE, ' '] + toks[2:])]
    if base == 'body':
        return [join(body_like(0, rest0))]
    if c0.startswith(ROOT_IDS):
        if overlay and head[0] == '#pmRoot':
            return []
        return [join([head[0] + '.pm56-host' + ''.join(head[1:])] + toks[1:])]
    if base == '*' and len(comps) == 1:
        # `*` resets (and *::before, *::-webkit-scrollbar ...): the host and everything in it
        return [host_from(rest0, SCOPE), SCOPE + ' ' + c0]
    # :is(#pmOverlayRoot, body) > .x: every argument names a root, so the compound is the host
    m = re.match(r':(is|where)\((.*)\)$', c0)
    if m and not base:
        args = [a.strip() for a in split_top(m.group(2))]
        if args and all(a == 'body' or a.startswith(ROOT_IDS) for a in args):
            new_args = [HOST_TAG if a == 'body' else simple_parts(a)[0] + '.pm56-host' + ''.join(simple_parts(a)[1:]) for a in args]
            return [join([f':{m.group(1)}({", ".join(new_args)})'] + toks[1:])]
    if re.search(r'(?<![\w-])(?:html|body)(?![\w-])|:root', sel):
        notes.setdefault('scope_unhandled', []).append(sel[:160])
    return [SCOPE + ' ' + sel]


# The overlay variant of a window-size @media block: only the body-level hosts (the overlay root, the effects layer)
# take it; :where() keeps the specificity of the ordinary scope.
OVERLAY_SCOPE = '.pm56-host:where(#pmOverlayRoot, #pm56Fx)'
OVERLAY_HOST_TAG = 'div.pm56-host:where(#pmOverlayRoot, #pm56Fx)'


def scope_selector_list(prelude: str, notes: dict, overlay: bool = False) -> str:
    out = []
    for sel in split_top(prelude):
        if sel.strip():
            if overlay:
                out.extend(scope_complex(sel, notes, OVERLAY_SCOPE, OVERLAY_HOST_TAG, True))
            else:
                out.extend(scope_complex(sel, notes))
    return ', '.join(out)


# ---- window-size @media -> @container (the chat column and the chat's tab bodies) ----
# The standalone's width breakpoints are WINDOW widths of its lab layout, where the chat stage beside the 54% editor
# (History pinned, 200) was about 0.46 W - 205 px wide (measured: 678 at 1920, 457 at 1440, 384 at 1280, 301 at 1100)
# and an editor document about 0.54 W. In PMConcept7 the chat is always beside the panels, so a rule written for window
# W applies to the column when the column is at most as wide as the standalone's chat stage was at W, and to a chat tab
# body when it is at most as wide as the standalone's editor was at W. Heights: the stage was the window less the lab's
# header and status bar (66 px). Sheets, menus, hover cards and toasts live in the body-level overlay root and keep
# the window query as written.
def col_width(w: float) -> float:
    return round(0.46 * w - 205, 2)


def tab_width(w: float) -> float:
    return round(0.54 * w, 2)


def stage_height(h: float) -> float:
    return round(h - 66, 2)


SIZE_FEATURE = re.compile(r'^\(\s*(min-|max-)?(width|height)\s*:\s*([\d.]+)(px|em|rem)\s*\)$', re.I)
RANGE_FEATURE = re.compile(r'^\(\s*(width|height)\s*(<=|>=|<|>)\s*([\d.]+)(px|em|rem)\s*\)$', re.I)
OTHER_SIZE = re.compile(r'^\(\s*(?:min-|max-)?(?:aspect-ratio|orientation)\b', re.I)


def media_to_container(prelude: str, kind: str):
    """'@media <q>' -> (container_condition, media_wrapper) for kind 'col' or 'tab', or None when the query has no
    size feature or cannot be read (it then stays a plain @media for every host). media_wrapper is the non-size part
    of a one-query media list ('' when none)."""
    m = re.match(r'@media\s*(.*)$', prelude.strip(), re.S | re.I)
    if not m:
        return None
    queries = [q.strip() for q in split_top(m.group(1)) if q.strip()]
    conds, wrapper, any_size = [], '', False
    for q in queries:
        words = re.split(r'\s+and\s+', q, flags=re.I)
        size, other = [], []
        for wd in words:
            wd = wd.strip()
            low = wd.lower()
            if low in ('screen', 'all', 'only screen', 'only all'):
                continue
            if low.startswith('not ') or low in ('print', 'speech'):
                return None
            sm, rm = SIZE_FEATURE.match(wd), RANGE_FEATURE.match(wd)
            if sm or rm:
                prefix, dim, val, unit = (sm.group(1) or '', sm.group(2), sm.group(3), sm.group(4)) if sm else ('', rm.group(1), rm.group(3), rm.group(4))
                v = float(val) * (16 if unit.lower() in ('em', 'rem') else 1)
                dim = dim.lower()
                nv = (col_width(v) if kind == 'col' else tab_width(v)) if dim == 'width' else stage_height(v)
                if sm:
                    size.append(f'({prefix.lower()}{dim}: {nv:g}px)')
                else:
                    size.append(f'({dim} {rm.group(2)} {nv:g}px)')
                any_size = True
            elif OTHER_SIZE.match(wd):
                size.append(wd); any_size = True
            elif wd.startswith('('):
                other.append(wd)
            else:
                return None
        if other:
            if len(queries) > 1:
                return None
            wrapper = ' and '.join(other)
        if not size:
            return None
        conds.append(size)
    if not any_size:
        return None
    if len(conds) == 1:
        cond = ' and '.join(conds[0])
    else:
        cond = ' or '.join(('(' + ' and '.join(c) + ')') if len(c) > 1 else c[0] for c in conds)
    return cond, wrapper


def has_size_feature(prelude: str) -> bool:
    return bool(re.match(r'@media\b', prelude, re.I)) and bool(re.search(r'\b(?:min-|max-)?(?:width|height)\s*[:<>=]', prelude, re.I))


KEYFRAMES = re.compile(r'@(-webkit-)?keyframes\s+([\w-]+)', re.I)


def emit(items: list, notes: dict, page_keyframes: dict, renames: dict, depth: int = 0, variant: str = 'all') -> str:
    """variant: 'all' (top level and plain groups), 'overlay' (the window @media copy for the body-level hosts),
    'col' / 'tab' (inside a container copy)."""
    out = []
    for it in items:
        kind = it[0]
        if kind == 'stmt':
            if re.match(r'@(import|charset)\b', it[1], re.I):
                notes.setdefault('dropped_statements', []).append(it[1][:80])
                continue
            out.append(it[1] + ';')
        elif kind == 'rule':
            body = it[2]
            if '{' in body:
                notes['nested_rules'] = notes.get('nested_rules', 0) + 1
            sl = scope_selector_list(it[1], notes, overlay=(variant == 'overlay'))
            if sl:
                out.append(sl + '{' + rename_animations(body, renames) + '}')
        elif kind == 'group':
            pre = it[1]
            if has_size_feature(pre) and variant in ('all', 'col', 'tab'):
                kinds = ['col', 'tab'] if variant == 'all' else [variant]
                converted = [(k, media_to_container(pre, k)) for k in kinds]
                if all(c is not None for _, c in converted):
                    notes['media_converted'] = notes.get('media_converted', 0) + 1
                    if variant == 'all':
                        inner = emit(it[2], notes, page_keyframes, renames, depth + 1, 'overlay')
                        if inner.strip():
                            out.append(pre + '{' + inner + '}')
                    for k, (cond, wrapper) in converted:
                        inner = emit(it[2], notes, page_keyframes, renames, depth + 1, k)
                        if not inner.strip():
                            continue
                        block = f'@container pm56{k} {cond}' + '{' + inner + '}'
                        out.append(f'@media {wrapper}' + '{' + block + '}' if wrapper else block)
                    continue
                notes.setdefault('media_kept', []).append(pre[:100])
            inner = emit(it[2], notes, page_keyframes, renames, depth + 1, variant)
            if inner.strip():
                out.append(pre + '{' + inner + '}')
        else:
            pre = it[1]
            if re.match(r'@font-face\b', pre, re.I):
                notes['font_faces_dropped'] = notes.get('font_faces_dropped', 0) + 1
                continue
            m = KEYFRAMES.match(pre)
            if m:
                name = m.group(2)
                if name in renames:
                    pre = pre[:m.start(2)] + renames[name] + pre[m.end(2):]
                elif name in page_keyframes and _norm(page_keyframes[name]) == _norm(it[2]):
                    notes['keyframes_shared'] = notes.get('keyframes_shared', 0) + 1
                    continue
            out.append(pre + '{' + it[2] + '}')
    return '\n'.join(out)


def _norm(s: str) -> str:
    return re.sub(r'\s+', '', s)


ANIM_DECL = re.compile(r'((?:-webkit-)?animation(?:-name)?\s*:)([^;{}]*)')


def rename_animations(body: str, renames: dict) -> str:
    if not renames:
        return body

    def sub(m):
        return m.group(1) + re.sub(r'(?<![\w-])([\w-]+)(?![\w-])', lambda w: renames.get(w.group(1), w.group(1)), m.group(2))
    return ANIM_DECL.sub(sub, body)


def page_keyframes(text: str) -> dict:
    """@keyframes name -> body in the page so far (before this layer)."""
    out = {}
    for sm in re.finditer(r'<style\b[^>]*>(.*?)</style>', text, re.S | re.I):
        css = sm.group(1)
        for m in KEYFRAMES.finditer(css):
            j = css.find('{', m.end())
            if j < 0:
                continue
            try:
                k = _match_brace(css, j)
            except ValueError:
                continue
            out.setdefault(m.group(2), css[j + 1:k])
    return out


def scope_css(css: str, notes: dict, page_kf: dict | None = None) -> str:
    items = parse_css(strip_comments(css))
    page_kf = page_kf or {}
    # a chat @keyframes whose name the page already uses with other frames is renamed pm56-<name> here and in every
    # animation declaration of the chat's CSS (identical frames are shared: the chat's copy is dropped)
    renames = {}

    def walk(its):
        for it in its:
            if it[0] == 'group':
                walk(it[2])
            elif it[0] == 'at':
                m = KEYFRAMES.match(it[1])
                if m and m.group(2) in page_kf and _norm(page_kf[m.group(2)]) != _norm(it[2]):
                    renames[m.group(2)] = 'pm56-' + m.group(2)
    walk(items)
    notes['keyframes_renamed'] = sorted(renames)
    return emit(items, notes, page_kf, renames)


# ---------------------------------------------------------------------------------------------------------------------
# the bundle

def port_files(sub: str, suffix: str, lo: int = 0, hi: int = 99) -> list[Path]:
    folder = PORT / sub
    out = []
    for p in sorted(folder.glob('*' + suffix)) if folder.is_dir() else []:
        m = re.match(r'(\d\d)-', p.name)
        if m and lo <= int(m.group(1)) <= hi:
            out.append(p)
    return out


def guard(part: str, body: str) -> str:
    return (f"try {{\n{body}\n}} catch (error) {{ try {{ console.error('[pm56] {part} failed', error); }} catch (_) {{}} }}\n")


def js_safe(js: str) -> str:
    js = re.sub(r'</(script)', r'<\\/\1', js, flags=re.I)
    # '<!doctype html><html>' in a JS string (an artifact preview's srcdoc) would read as a second page root to the
    # page checks; '<\\!' is the same characters inside JS strings and template literals
    js = re.sub(r'<!(doctype)', r'<\\!\1', js, flags=re.I)
    return js.replace('<!--', '<\\!--')


def build_css(text: str, notes: dict) -> str:
    spec = chat_build_spec()
    parts = []
    kf = page_keyframes(text)
    for name in spec['CSS_ORDER']:
        if name in HOSTED_SKIP_CSS:
            continue
        parts.append(f'/* ---- 5.6 Pro/{name} (scoped) ---- */\n' + scope_css(rename_css_classes(read_chat(name)), notes, kf) + '\n')
    for p in port_files('css', '.css'):
        parts.append(f'/* ---- pm7-port/css/{p.name} ---- */\n' + p.read_text(encoding='utf-8').rstrip() + '\n')
    return ''.join(parts)


def build_scripts() -> tuple[str, str, str]:
    spec = chat_build_spec()
    early = ''.join(f'/* ---- pm7-port/js/{p.name} ---- */\n' + p.read_text(encoding='utf-8').rstrip() + '\n'
                    for p in port_files('js', '.js', 0, 9))
    data = ('\n'.join(read_chat(n) for n in spec['HEAD_JS']) + '\n' + spec['EXT_SHIM'] + '\n'
            + '\n'.join(read_chat(n) for n in spec['PRE_MODULES_JS']) + '\n'
            + '\n'.join(read_chat(m + '.js') for m in spec['MODULES'] if m not in HOSTED_SKIP_JS))
    class_map = 'window.PM56_CLASS_MAP=' + json.dumps(RENAME_CLASSES, sort_keys=True) + ';\n'
    main = class_map + early + rename_js_classes(data)
    app = read_chat('app.js')
    if app.count('  renderApp(false);\n  scrollTranscriptToEnd(true);') != 1:
        raise ValueError('chat56 layer: the boot render in app.js changed')
    app = rename_js_classes(app.replace('  renderApp(false);\n  scrollTranscriptToEnd(true);',
                                        '  renderApp(false);\n  window.__PM56_BOOT_OK=true;\n  scrollTranscriptToEnd(true);', 1))
    late = ''.join(guard('port ' + p.stem, f'/* ---- pm7-port/js/{p.name} ---- */\n(function () {{\n\'use strict\';\n'
                         + p.read_text(encoding='utf-8').rstrip() + '\n})();')
                   for p in port_files('js', '.js', 10, 99))
    return js_safe(main), js_safe(app), js_safe(late)


def apply(text: str, need) -> tuple[str, dict]:
    notes: dict = {'bytes_in': len(text.encode('utf-8'))}
    for marker in (CSS_START, CSS_END, JS_START, JS_END, 'id="pm56-css"', 'id="pm56-js"', 'id="pmRoot"', 'id="pmOverlayRoot"'):
        need(marker not in text, f'chat56 layer: {marker} already in the input (layer applied twice?)')
    for needle in REQUIRED:
        n = text.count(needle)
        need(n == 1, f'chat56 layer: {needle!r} found {n} times in the page (need exactly 1)')
    try:
        css = build_css(text, notes)
        main, app, late = build_scripts()
    except ValueError as exc:
        need(False, str(exc))
        raise
    need(not re.search(r'</style', css, re.I), 'chat56 layer: chat css contains "</style"')
    for name, chunk in (('css', css), ('js', main + app + late)):
        for marker in (CSS_START, CSS_END, JS_START, JS_END, '<!-- HOME:BODY:END -->', '<!-- O55:BODY:END -->'):
            need(marker not in chunk, f'chat56 layer: {name} contains the build marker {marker}')
    need(text.index('<!-- HOME:CSS:END -->') < text.index(HEAD_ANCHOR), 'chat56 layer: the Home head block must precede </head>')
    need(text.index('<!-- HOME:BODY:END -->') < text.rindex(BODY_ANCHOR), 'chat56 layer: the Home body block must precede </body>')
    head = '\n' + CSS_START + f'\n<style id="pm56-css">\n{css}</style>\n' + CSS_END + '\n</head>'
    need(text.count(HEAD_ANCHOR) == 1, f'chat56 layer: </head> found {text.count(HEAD_ANCHOR)} times')
    text = text.replace(HEAD_ANCHOR, head, 1)
    body = ('\n' + JS_START + f'\n<script id="pm56-js">\n{main}</script>\n<script id="pm56-app-js">\n{app}</script>\n'
            f'<script id="pm56-port-js">\n{late}</script>\n' + JS_END + '\n</body>')
    need(text.count(BODY_ANCHOR) == 1, f'chat56 layer: </body> found {text.count(BODY_ANCHOR)} times')
    text = text.replace(BODY_ANCHOR, body, 1)
    notes['css_bytes'] = len(css.encode('utf-8'))
    notes['js_bytes'] = len((main + app + late).encode('utf-8'))
    notes['bytes_out'] = len(text.encode('utf-8'))
    if notes.get('scope_unhandled'):
        notes['scope_unhandled_count'] = len(notes['scope_unhandled'])
    return text, notes


# ---------------------------------------------------------------------------------------------------------------------
# checks

def _opus_build():
    main = sys.modules.get('__main__')
    if main is not None and hasattr(main, 'EMOJI') and hasattr(main, 'build_text'):
        return main
    tools = str(CONCEPTS / 'onboarding' / 'opus-5.5' / 'tools')
    if tools not in sys.path:
        sys.path.insert(0, tools)
    import build  # noqa: E402
    return build


def lint() -> list[str]:
    """The port's own sources (pm7-port/css, pm7-port/js): no emoji, no pills, no coloured side stripes, no :has() on
    html/body, every CSS selector scoped under .pm56-host or the frame, no window-size reads outside 00-host.js."""
    build = _opus_build()
    problems = []
    for p in sorted(list((PORT / 'css').glob('*.css')) + list((PORT / 'js').glob('*.js'))):
        rel = p.relative_to(CHAT).as_posix()
        t = p.read_text(encoding='utf-8')
        if build.EMOJI.search(t):
            problems.append(f'emoji glyph in 5.6 Pro/{rel}')
        if p.suffix == '.css':
            code = strip_comments(t)
            for m in re.finditer(r'border-(?:left|inline-start)(?:-width)?\s*:\s*([^;}]+)', code):
                w = re.search(r'(\d+(?:\.\d+)?)px', m.group(1))
                if w and float(w.group(1)) >= 2:
                    problems.append(f'coloured side border in 5.6 Pro/{rel}: {m.group(0).strip()}')
            for m in re.finditer(r'border-radius\s*:\s*(9{3,}|[5-9]\d{2,})px', code):
                problems.append(f'capsule radius in 5.6 Pro/{rel}: {m.group(0)} (no pills)')
            if re.search(r'(?:^|[\s,}])(?:html|body|:root)\b[^{},]*:has\(', code):
                problems.append(f'page-wide :has() in 5.6 Pro/{rel}')
            for _, sel in build.css_selectors(t):
                if not re.search(r'\.pm56-(?:host|frame)|#pmw-chat56|#pmRoot|#pmOverlayRoot|#chatPanel', sel):
                    problems.append(f'unscoped selector in 5.6 Pro/{rel}: {sel[:100]} (scope it under .pm56-host)')
        else:
            if re.search(r'\binnerWidth\b', t) and not p.name.startswith('00-'):
                problems.append(f'5.6 Pro/{rel} reads the window width (read PM56_HOST.width())')
    return problems


MARKERS = [CSS_START, CSS_END, JS_START, JS_END, '<style id="pm56-css">', '<script id="pm56-js">',
           '<script id="pm56-app-js">', '<script id="pm56-port-js">']


def published_problems(built: str) -> list[str]:
    problems = []
    for marker in MARKERS:
        if built.count(marker) != 1:
            problems.append(f'chat56: marker {marker} appears {built.count(marker)} times (need exactly 1)')
    hb, cb = built.find('<!-- HOME:BODY:END -->'), built.find(JS_START)
    if 0 <= cb < hb:
        problems.append('chat56: the chat body block comes before the Home block (the layer runs after Home)')
    if 'window.PM56_HOST' not in built:
        problems.append('chat56: window.PM56_HOST is not defined (pm7-port/js/00-host.js)')
    for sid in ('pm56-js', 'pm56-app-js', 'pm56-port-js'):
        found = re.findall(r'<script\b[^>]*\bid="' + sid + r'"[^>]*>(.*?)</script>', built, re.S)
        if len(found) != 1:
            problems.append(f'chat56: script {sid} found {len(found)} times')
            continue
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as fh:
            fh.write(found[0])
            path = fh.name
        try:
            r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
        finally:
            Path(path).unlink(missing_ok=True)
        if r.returncode:
            problems.append(f'chat56: syntax error in {sid}: ' + ' | '.join(r.stderr.strip().splitlines()[-4:])[:600])
    m = re.search(r'<style id="pm56-css">(.*?)</style>', built, re.S)
    if m:
        bad = []
        for item in _rules(parse_css(strip_comments(m.group(1)))):
            for sel in split_top(item):
                s = sel.strip()
                if s and not re.search(r'\.pm56-(?:host|frame)|#pmw-chat56|#chatPanel', s):
                    bad.append(s[:100])
        if bad:
            problems.append(f'chat56: {len(bad)} chat selectors are not scoped, first: {bad[0]}')
    return problems


def _rules(items: list):
    for it in items:
        if it[0] == 'rule':
            yield it[1]
        elif it[0] == 'group':
            yield from _rules(it[2])


if __name__ == '__main__':
    # quick self-test: python3 chat56_layer.py 'body[data-theme="x"] .a, html[data-motion] *'
    nn: dict = {}
    for arg in sys.argv[1:]:
        print(scope_selector_list(arg, nn))
    print(nn)
