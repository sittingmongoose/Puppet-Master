"""DC criterion-12 schema clause coverage over the checker's own whole-definition schema rows (PNC-019 C12-DC1).

The DC checker (scripts/pm_collaboration_events.py) refuses every schema occurrence through one whole-definition
row per boundary: PS01 payload, SO03 prepared source, WR01 application wrapper, EV01 EventRecord, CK01 projection
checkpoint and PV01 projection value. Those rows are the real predicates and are proved on the gated tool. This
module adds the per-clause evidence that route needs (the W3H whole-definition Method B route, with clause
witnesses and covering evidence), without a new guard engine and without changing a checker row:

1. inventory: every keyword clause the row's validator evaluates for a family, by static expansion of the exact
   schema the row validates ($ref followed; jsonschema's own schema-path convention, which elides $ref), each
   tied to its literal source node (document, JSON pointer, line);
2. controls: the checker's own valid probes (contract_probes, expected None) for that family and boundary;
3. witnesses: one valid control changed in one place so that the row's own validator reports exactly one
   leaf error, at that clause (combinator errors are attributed through the branch the control satisfies);
4. complete route: the witness runs through the checker's evaluate_probe; its FIRST recorded refusal must be the
   boundary's schema row with that row's code;
5. clause cut and restoration: the clause is removed in place from the loaded schema document the checker's
   validators read, the witness and the family's controls rerun through the complete route, and the clause is
   restored and the witness rerun. Only disappearance of the exact expected refusal is a kill; an exception or a
   baseline that is not the expected refusal is INVALID; a refusal still at the schema row is a survivor.

Nothing here repairs, caches or decides a checker result. Every refusal still comes from the checker's rows.
"""
import copy
import hashlib
import json
import pickle
import re
import sys
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_collaboration_events as dc  # noqa: E402

DC1_FAMILIES = [et for et in dc.EVENT_TYPES if et.startswith("collaboration.")]
DC2_FAMILIES = [et for et in dc.EVENT_TYPES if not et.startswith("collaboration.")]
APP_PATH = "Plans/application_workflow_contracts.schema.json"
SKIP = {"$defs", "$comment", "description", "title", "examples", "$schema", "$id", "default", "$anchor", "deprecated", "readOnly", "writeOnly"}
# Keywords that refuse by themselves (clauses); the rest are applicators or annotations.
CLAUSES = {"type", "enum", "const", "pattern", "minLength", "maxLength", "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum",
           "multipleOf", "minItems", "maxItems", "uniqueItems", "minProperties", "maxProperties", "required", "dependentRequired",
           "additionalProperties", "unevaluatedProperties", "anyOf", "oneOf", "not", "contains", "minContains", "maxContains"}
APPLICATORS = {"$ref", "properties", "patternProperties", "items", "prefixItems", "allOf", "if", "then", "else", "dependentSchemas", "propertyNames"}
ANNOTATIONS = {"format"}
ROW = {"payload": ("payload_schema", "PS01_payload_schema"), "source": ("source_schema", None), "wrapper": ("wrapper_shape", None),
       "envelope": ("envelope_schema", None), "checkpoint": ("checkpoint_schema", None), "projection": ("projection_value_schema", None)}


def row_of(boundary):
    """(phase, first row) of the boundary's whole-definition schema row, read from the generated table."""
    phase, row = ROW[boundary]
    if row is None:
        row = dc.table_rows(phase)[0][0]
    return phase, row


# --- literal source locations -------------------------------------------------------------------------------
# Locations are tracked during the walk itself (document URI and JSON pointer, following each $ref target URI), so
# no schema file is loaded outside the checker's own registry.

def _esc(token):
    return str(token).replace("~", "~0").replace("/", "~1")


@lru_cache(maxsize=64)
def line_index(path):
    """JSON pointer -> 1-based line where that member's key (or array element) starts in the source file."""
    text = (dc.ROOT / path).read_text(encoding="utf-8")
    out, n, i = {}, len(text), 0
    line_starts = [0]
    for m in re.finditer("\n", text):
        line_starts.append(m.end())
    import bisect

    def line(pos):
        return bisect.bisect_right(line_starts, pos)

    def ws(i):
        while i < n and text[i] in " \t\r\n":
            i += 1
        return i

    def string(i):
        j = i + 1
        while text[j] != '"':
            j += 2 if text[j] == "\\" else 1
        return json.loads(text[i:j + 1]), j + 1

    def value(i, ptr):
        i = ws(i)
        out.setdefault(ptr, line(i))
        c = text[i]
        if c == "{":
            i = ws(i + 1)
            if text[i] == "}":
                return i + 1
            while True:
                i = ws(i)
                key_pos = i
                key, i = string(i)
                child = ptr + "/" + _esc(key)
                out[child] = line(key_pos)
                i = ws(i)
                i = value(i + 1, child)
                i = ws(i)
                if text[i] == ",":
                    i += 1
                    continue
                return i + 1
        if c == "[":
            i = ws(i + 1)
            if text[i] == "]":
                return i + 1
            k = 0
            while True:
                i = value(i, ptr + "/" + str(k))
                k += 1
                i = ws(i)
                if text[i] == ",":
                    i += 1
                    continue
                return i + 1
        if c == '"':
            return string(i)[1]
        m = re.compile(r"-?[0-9.eE+-]+|true|false|null").match(text, i)
        return m.end()
    value(0, "")
    return out


def locate(loc, keyword):
    doc_uri, ptr = loc
    path = dc.schema_uri_paths(dc.ROOT).get(doc_uri)
    if path is None:
        return {"uri": doc_uri, "pointer": ptr, "path": None, "line": None}
    lines = line_index(path)
    key_ptr = ptr + "/" + _esc(keyword)
    return {"path": path, "pointer": ptr, "keyword_pointer": key_ptr, "line": lines.get(key_ptr) or lines.get(ptr)}


# --- static inventory ---------------------------------------------------------------------------------------

class Site:
    """One clause at one evaluation position of one boundary schema."""
    __slots__ = ("eval_path", "node", "keyword", "member", "template", "context", "src", "loc", "resolver")

    def __init__(self, eval_path, node, keyword, member, template, context, loc, resolver=None):
        self.eval_path, self.node, self.keyword, self.member = tuple(eval_path), node, keyword, member
        self.template, self.context = tuple(template), tuple(context)
        self.src, self.loc, self.resolver = locate(loc, keyword), loc, resolver

    @property
    def key(self):
        return "/".join(map(str, self.eval_path)) + "|" + self.keyword + ("|" + self.member if self.member is not None else "")

    @property
    def src_key(self):
        s = self.src or {}
        return (s.get("path"), s.get("keyword_pointer"), self.member)

    def describe(self):
        value = self.node.get(self.keyword)
        if self.member is not None:
            value = self.member
        return {"site": self.key, "keyword": self.keyword, "member": self.member, "value": value if not isinstance(value, (dict, list)) else None,
                "instance_template": "/" + "/".join(self.template), "context": list(self.context), "source": self.src}


def inventory(uri, pointer):
    """Every clause/applicator/annotation keyword evaluated from uri+pointer, with its instance template and literal location."""
    from urllib.parse import urldefrag, urljoin
    registry = dc.schema_registry(dc.ROOT)
    resolved = registry.resolver(uri).lookup(uri + pointer)
    sites = []

    def walk(node, resolver, path, template, context, stack, loc):
        if not isinstance(node, dict) or id(node) in stack:
            return
        stack = stack | {id(node)}
        doc, ptr = loc
        for k, v in node.items():
            if k in SKIP or k.startswith("x-"):
                continue
            if k == "required" and isinstance(v, list):
                for m in v:
                    sites.append(Site(path, node, k, m, template, context, loc, resolver))
            elif k == "dependentRequired" and isinstance(v, dict):
                for trig, members in v.items():
                    for m in members:
                        sites.append(Site(path, node, k, trig + "->" + m, template, context, loc, resolver))
            else:
                sites.append(Site(path, node, k, None, template, context, loc, resolver))
            sub = lambda *toks: (doc, ptr + "".join("/" + _esc(t) for t in toks))  # noqa: E731
            if k == "$ref":
                r = resolver.lookup(v)
                target, frag = urldefrag(urljoin(str(resolver._base_uri), v))
                walk(r.contents, r.resolver, path, template, context, stack, (target, frag))
            elif k in ("properties", "patternProperties"):
                for pk, pv in v.items():
                    walk(pv, resolver, path + [k, pk], template + [pk if k == "properties" else "*"], context, stack, sub(k, pk))
            elif k == "dependentSchemas":
                for pk, pv in v.items():
                    walk(pv, resolver, path + [k, pk], template, context + [k], stack, sub(k, pk))
            elif k in ("allOf", "anyOf", "oneOf"):
                for i, pv in enumerate(v):
                    walk(pv, resolver, path + [k, i], template, context + ([k + "/" + str(i)] if k != "allOf" else []), stack, sub(k, i))
            elif k == "prefixItems":
                for i, pv in enumerate(v):
                    walk(pv, resolver, path + [k, i], template + [str(i)], context, stack, sub(k, i))
            elif k in ("items", "additionalProperties", "unevaluatedProperties", "unevaluatedItems") and isinstance(v, dict):
                walk(v, resolver, path + [k], template + ["*"], context, stack, sub(k))
            elif k in ("not", "if", "then", "else", "contains", "propertyNames") and isinstance(v, dict):
                walk(v, resolver, path + [k], template + (["*"] if k == "contains" else []), context + [k], stack, sub(k))
    base, frag = urldefrag(uri + pointer)
    walk(resolved.contents, resolved.resolver, [], [], [], frozenset(), (base, frag))
    return sites


def kind(site):
    """clause | applicator | annotation | condition (inside an if) | negated (inside a not) | false_schema."""
    if "if" in site.context:
        return "condition"
    if "not" in site.context:
        return "negated"
    if site.keyword in CLAUSES:
        if site.keyword in ("additionalProperties", "unevaluatedProperties") and site.node.get(site.keyword) is not False:
            return "applicator"
        return "clause"
    if site.keyword in ANNOTATIONS:
        return "annotation"
    return "applicator"


# --- boundaries and controls ---------------------------------------------------------------------------------

def boundary_of(probe):
    """(boundary, uri, pointer, instance getter path) for one valid probe, or None."""
    d = probe["domain"]
    if d == "payload":
        uri = dc.load(dc.PAYLOAD_PATH)["$id"]
        return [("payload:" + dc.edition_of(probe["value"]), uri, "#/$defs/" + dc.payload_def(probe["event_type"], dc.edition_of(probe["value"])), ("value",))]
    if d == "source":
        v = probe["value"]
        return [("source", dc.load(dc.SOURCE_PATH)["$id"], "#/$defs/" + dc.TOKEN[v["event_type"]], ("value",))]
    if d == "envelope":
        return [("envelope", dc.load(dc.EVENT_RECORD_PATH)["$id"], "", ("value",))]
    if d == "prepared":
        out = []
        rec = probe["source_case"]["value"]["owner_record"]
        definition = dc.application_wrapper_definition(rec)
        if definition is not None:
            out.append(("wrapper:" + definition, dc.load(APP_PATH)["$id"], "#/$defs/" + definition + "StorageApplicationV2", ("source_case", "application_wrapper")))
        return out
    if d == "checkpoint":
        return [("checkpoint", dc.load(dc.PROJECTION_PATH)["$id"], "#/$defs/checkpoint", ("value",))]
    return []


def family(probe):
    import pm_collab_guard_suites as gs
    return gs.family_of(probe)


@lru_cache(maxsize=1)
def all_probes():
    """The checker's contract probes plus its fixture payload positives (payload_rejection runs them in fixture_report)."""
    fx = dc.load(dc.FIXTURE_PATH, dc.ROOT)
    fixture = [dict(domain="payload", case_id="fixture:" + c["case_id"], event_type=c["event_type"], value=copy.deepcopy(c["payload"]), expected=None)
               for c in fx["payloads"]]
    return fixture + dc.contract_probes(dc.ROOT)


def controls(families):
    """{(family, boundary): {'uri','pointer','getter','probes': [valid probes]}} from the checker's own valid probes."""
    out = {}
    for p in all_probes():
        if p["expected"] is not None:
            continue
        fam = family(p)
        if p["domain"] == "checkpoint":
            fam = "shared"
        if fam not in families and fam != "shared":
            continue
        for b, uri, pointer, getter in boundary_of(p):
            slot = out.setdefault((fam, b), dict(uri=uri, pointer=pointer, getter=getter, probes=[]))
            slot["probes"].append(p)
    return out


def get_in(obj, getter):
    for k in getter:
        obj = obj[k]
    return obj


def with_instance(probe, getter, instance, expected):
    p = copy.copy(probe)
    if getter == ("value",):
        p["value"] = instance
    else:
        p["source_case"] = dict(probe["source_case"], application_wrapper=instance)
    p["expected"] = expected
    return p


# --- witness construction -----------------------------------------------------------------------------------

def locations(instance, template):
    """Concrete JSON paths in instance matching the template ('*' = any key/index)."""
    found = [((), instance)]
    for tok in template:
        nxt = []
        for path, node in found:
            if tok == "*":
                if isinstance(node, dict):
                    nxt.extend((path + (k,), v) for k, v in node.items())
                elif isinstance(node, list):
                    nxt.extend((path + (i,), v) for i, v in enumerate(node))
            elif isinstance(node, dict) and tok in node:
                nxt.append((path + (tok,), node[tok]))
            elif isinstance(node, list) and tok.isdigit() and int(tok) < len(node):
                nxt.append((path + (int(tok),), node[int(tok)]))
        found = nxt
    return found


def set_at(instance, path, value):
    if not path:
        return value
    root = copy.deepcopy(instance)
    node = root
    for k in path[:-1]:
        node = node[k]
    node[path[-1]] = value
    return root


def del_at(instance, path, key):
    root = copy.deepcopy(instance)
    node = root
    for k in path:
        node = node[k]
    if isinstance(node, dict) and key in node:
        del node[key]
        return root
    return None


TYPE_SAMPLES = [None, True, 7, 0.5, "c12", [], {}]


def _json_type_ok(value, t):
    names = [t] if isinstance(t, str) else list(t)
    for n in names:
        if n == "null" and value is None:
            return True
        if n == "boolean" and isinstance(value, bool):
            return True
        if n == "integer" and isinstance(value, int) and not isinstance(value, bool):
            return True
        if n == "number" and isinstance(value, (int, float)) and not isinstance(value, bool):
            return True
        if n == "string" and isinstance(value, str):
            return True
        if n == "array" and isinstance(value, list):
            return True
        if n == "object" and isinstance(value, dict):
            return True
    return False


def pattern_candidates(value, pattern):
    """Context-bound pattern breakers: each keeps the string type and changes one lexical fact."""
    s = value if isinstance(value, str) else ""
    out = []
    if s:
        out += [s + "\n", dc.lf_negative(s), s[:-1], s + s[-1], " " + s, s + " ", s[:-1] + "G", s[:-1] + "Z", s[:-1] + "!", "G" + s[1:],
                s.upper(), s[:1] + "\u0000" + s[1:], s[:1] + " " + s[1:], s[:-1] + "\ud800"]
        if "_" in s:
            out.append(s.replace("_", "-", 1))
        if ":" in s:
            out.append(s.replace(":", ";", 1))
        if "~" in s:
            out.append(s.replace("~", "!", 1))
        if "-" in s:
            out.append(s.replace("-", "_", 1))
        m = re.match(r"^([a-z]+[_~@.:])", s)
        if m:
            out.append("x" + s)
            out.append(s[len(m.group(1)):])
    out += ["", " ", "\n", "!", "c12 c12", "C12"]
    seen, res = set(), []
    for c in out:
        if c not in seen and c != value:
            seen.add(c)
            res.append(c)
    return res


def candidates(site, value, control_instance, path):
    """Single-change instances for the clause at its concrete location (instance path) in the control."""
    k, node = site.keyword, site.node
    v = node.get(k)
    out = []

    def put(new):
        out.append(set_at(control_instance, path, new))
    if k == "required":
        r = del_at(control_instance, path, site.member)
        if r is not None:
            out.append(r)
    elif k == "dependentRequired":
        trig, member = site.member.split("->", 1)
        if isinstance(value, dict) and trig in value:
            r = del_at(control_instance, path, member)
            if r is not None:
                out.append(r)
    elif k in ("additionalProperties", "unevaluatedProperties") and v is False and isinstance(value, dict):
        put(dict(value, zz_c12_unknown_member="c12"))
    elif k == "type":
        for s in TYPE_SAMPLES:
            if not _json_type_ok(s, v):
                put(copy.deepcopy(s))
    elif k == "enum" and isinstance(v, list):
        if isinstance(value, str):
            put("c12_not_in_enum")
        elif isinstance(value, bool):
            if True not in v:
                put(True)
            if False not in v:
                put(False)
        elif isinstance(value, int):
            put(max([e for e in v if type(e) is int] or [0]) + 1000)
        for s in TYPE_SAMPLES:
            if s not in v:
                put(copy.deepcopy(s))
    elif k == "const":
        if isinstance(v, bool):
            put(not v)
        elif isinstance(v, int):
            put(v + 1)
        elif isinstance(v, str):
            put(v + "x" if v else "c12")
            put("c12_not_const")
        for s in TYPE_SAMPLES:
            if s != v or type(s) is not type(v):
                put(copy.deepcopy(s))
    elif k == "pattern" and isinstance(value, str):
        for c in pattern_candidates(value, v):
            put(c)
    elif k == "minLength" and isinstance(value, str) and isinstance(v, int) and v > 0:
        put(value[: v - 1])
        put("" if v == 1 else value[:1] * (v - 1))
    elif k == "maxLength" and isinstance(value, str) and isinstance(v, int):
        put(value + (value[-1:] or "a") * (v + 1 - len(value)))
        put("a" * (v + 1))
        if value:
            put((value * (v // max(len(value), 1) + 2))[: v + 1])
    elif k in ("minimum", "exclusiveMinimum") and isinstance(value, (int, float)) and not isinstance(value, bool) and isinstance(v, (int, float)):
        put(v - 1 if k == "minimum" else v)
    elif k in ("maximum", "exclusiveMaximum") and isinstance(value, (int, float)) and not isinstance(value, bool) and isinstance(v, (int, float)):
        put(v + 1 if k == "maximum" else v)
    elif k == "minItems" and isinstance(value, list) and isinstance(v, int) and v > 0:
        put(value[: v - 1])
    elif k == "maxItems" and isinstance(value, list) and isinstance(v, int) and not value:
        for item in (SIBLING_VALUES.get(site.template + ("*",), []) + GEN_AT(site.template + ("*",)) + ["c12"])[:3]:
            put([copy.deepcopy(item)] * (v + 1))
    elif k == "maxItems" and isinstance(value, list) and isinstance(v, int):
        if value:
            put(value + [copy.deepcopy(value[-1])] * (v + 1 - len(value)))
            if isinstance(value[-1], str):
                # distinct items of the same lexical class (an index suffix), so uniqueItems still holds
                put(value + [value[-1] + "_" + str(i) for i in range(v + 1 - len(value))])
    elif k == "uniqueItems" and v is True and isinstance(value, list) and value:
        put(value + [copy.deepcopy(value[0])])
        if len(value) >= 2:
            put([copy.deepcopy(value[0])] + value[:1] + value[2:])
    elif k == "minProperties" and isinstance(value, dict) and isinstance(v, int) and v > 0:
        put({kk: value[kk] for kk in list(value)[: v - 1]})
    elif k in ("anyOf", "oneOf"):
        for s in TYPE_SAMPLES:
            put(copy.deepcopy(s))
        if isinstance(value, str):
            for c in pattern_candidates(value, None):
                put(c)
        if isinstance(value, dict):
            for kk in list(value):
                r = del_at(control_instance, path, kk)
                if r is not None:
                    out.append(r)
            put(dict(value, zz_c12_unknown_member="c12"))
        if k == "oneOf" and isinstance(v, list):
            pass
    elif k == "not" and isinstance(v, dict):
        NOT_TEMPLATE[0] = tuple(site.template)
        out.extend(set_at(control_instance, path, c) for c in not_matches(v, value))
    elif k == "contains" and isinstance(value, list):
        put([])
    if k in ("type", "const", "enum", "anyOf", "oneOf"):
        # values another control holds where another schema node applies at this location (valid there, so a
        # value-clause witness need not also break that node)
        for v2 in SIBLING_VALUES.get(site.template, []):
            if v2 != value:
                put(copy.deepcopy(v2))
    return out


SIBLING_VALUES = {}  # instance template -> values seen at that template in any slot's controls (set by run_slot)
NOT_TEMPLATE = [()]  # the location of the not clause candidates() is building for
_GEN_AT = {}


def GEN_AT(template):
    """Generated values valid at a node that applies at this location in the current slot (set by run_slot)."""
    return _GEN_AT.get("fn", lambda t: [])(tuple(template))


MEMBER_POOL = {}  # member name -> values other controls of the slot hold (set by run_slot for not-required witnesses)


def _member_pool(instances):
    pool, stack = {}, [inst for _, inst in instances]
    while stack:
        node = stack.pop()
        if isinstance(node, dict):
            for k, v in node.items():
                lst = pool.setdefault(k, [])
                if len(lst) < 3 and v not in lst:
                    lst.append(copy.deepcopy(v))
                stack.append(v)
        elif isinstance(node, list):
            stack.extend(node)
    return pool


def not_matches(schema, value):
    """Values matching a negated subschema (each a candidate violation of the not clause)."""
    res = []
    branches = schema.get("anyOf") or schema.get("oneOf") or [schema]
    for b in branches:
        if not isinstance(b, dict):
            continue
        if "const" in b:
            res.append(copy.deepcopy(b["const"]))
        if isinstance(b.get("enum"), list):
            res.extend(copy.deepcopy(e) for e in b["enum"])
        if isinstance(b.get("pattern"), str):
            res.extend(pattern_examples(b["pattern"]))
        if isinstance(b.get("required"), list) and isinstance(value, dict):
            options = [{m: value.get(m, "c12") for m in b["required"]}]
            # a member's value as another control holds it (so the added member is valid at its own schema)
            for vals in zip(*[MEMBER_POOL.get(m, ["c12"]) for m in b["required"]]):
                options.append(dict(zip(b["required"], vals)))
            for vals in zip(*[(SIBLING_VALUES.get(NOT_TEMPLATE[0] + (m,), []) + GEN_AT(NOT_TEMPLATE[0] + (m,)))[:3] or ["c12"] for m in b["required"]]):
                options.append(dict(zip(b["required"], vals)))
            for extra in options:
                res.append(dict(value, **{m: copy.deepcopy(x) for m, x in extra.items() if m not in value}))
        if b.get("type") and len(b) == 1:
            res.extend(s for s in TYPE_SAMPLES if _json_type_ok(s, b["type"]))
    return res


def pattern_examples(pattern):
    """Strings a forbidden-alias pattern matches (case-folded literal patterns used under not)."""
    m = re.fullmatch(r"\^((?:\[[^\]]{2}\]|[^\[\]^$()|*+?{}\\]|\\.)+)\$", pattern)
    if not m:
        return []
    body = m.group(1)
    lo, up = [], []
    for tok in re.findall(r"\[[^\]]{2}\]|\\.|.", body):
        if tok.startswith("[") and len(tok) == 4:
            lo.append(tok[1]); up.append(tok[2])
        else:
            ch = tok[1] if tok.startswith("\\") else tok
            lo.append(ch); up.append(ch)
    return ["".join(lo), "".join(up)]


def leaf_errors(error, branch_choice=None):
    """Leaf errors of one top-level error; anyOf/oneOf 'none matched' descend into the one branch with fewest leaves."""
    if error.validator in ("anyOf", "oneOf") and error.context and "is valid under each of" not in error.message:
        by_branch = {}
        for c in error.context:
            by_branch.setdefault(c.relative_schema_path[0], []).append(c)
        counts = {b: sum(len(leaf_errors(c)) for c in errs) for b, errs in by_branch.items()}
        if not counts:
            return [error]
        best = min(counts.values())
        winners = [b for b, n in counts.items() if n == best]
        if len(winners) != 1 or len(by_branch) < len(error.validator_value or []):
            # A branch with no error would have matched; a tie leaves the control's branch ambiguous.
            return [error]
        out = []
        for c in by_branch[winners[0]]:
            out.extend(leaf_errors(c))
        return out
    return [error]


def error_tree(error):
    """((id(schema node), keyword) of every error in the tree, contexts included; any error under then/else)."""
    nodes, conditional, stack = set(), False, [error]
    while stack:
        e = stack.pop()
        nodes.add((id(e.schema), e.validator))
        if e.validator == "required":
            m = re.match(r"^'((?:[^'\\]|\\.)*)' is a required property$", e.message)
            if m:
                nodes.add((id(e.schema), e.validator, m.group(1)))
        if "then" in e.absolute_schema_path or "else" in e.absolute_schema_path:
            conditional = True
        stack.extend(e.context or [])
    return frozenset(nodes), conditional


def sole_key(error, instance):
    """(node id, keyword[, member]) of the one leaf error, or None when the leaf is ambiguous."""
    leaves = leaf_errors(error)
    if len(leaves) != 1:
        return None
    e = leaves[0]
    if e.validator == "required":
        m = re.match(r"^'((?:[^'\\]|\\.)*)' is a required property$", e.message)
        return (id(e.schema), "required", m.group(1)) if m else None
    return (id(e.schema), e.validator)


def error_site(error, instance):
    path = tuple(error.absolute_schema_path)
    member = None
    if error.validator == "required":
        node = instance
        for k in error.absolute_path:
            node = node[k]
        missing = [m for m in error.validator_value if not (isinstance(node, dict) and m in node)]
        member = missing[0] if len(missing) == 1 else None
    elif error.validator == "dependentRequired":
        member = None
    key = "/".join(map(str, path[:-1])) + "|" + error.validator + ("|" + member if member is not None else "")
    return key, id(error.schema)


def single_site(validator, instance):
    """(site key, schema node id) when the row validator reports exactly one leaf error, else None."""
    errors = list(validator.iter_errors(instance))
    if len(errors) != 1:
        return None
    leaves = leaf_errors(errors[0])
    if len(leaves) != 1:
        return None
    return error_site(leaves[0], instance)


# --- complete route ------------------------------------------------------------------------------------------

def route(probe):
    """(result, first refusal (phase, row, code) or None, exception name or None) through the complete checker."""
    dc.RECORDER = records = []
    try:
        result = dc.evaluate_probe(probe, dc.ROOT)
    except Exception as exc:  # recorded as INVALID, never as a kill
        return None, None, type(exc).__name__ + ": " + str(exc)[:160]
    finally:
        dc.RECORDER = None
    first = next(((ph, r[0], r[1]) for ph, _, r in records if r is not None), None)
    return result, first, None


# --- clause cuts ---------------------------------------------------------------------------------------------

class Cut:
    """Remove one clause in place from the loaded schema node (every validator reads it live); restore exactly."""

    def __init__(self, site):
        self.site = site

    def __enter__(self):
        node, k = self.site.node, self.site.keyword
        self.items = list(node.items())
        if k == "required" and self.site.member is not None:
            node[k] = [m for m in node[k] if m != self.site.member]
        elif k == "dependentRequired":
            trig, member = self.site.member.split("->", 1)
            node[k] = {t: [m for m in ms if not (t == trig and m == member)] for t, ms in node[k].items()}
        else:
            del node[k]
        return self

    def __exit__(self, *exc):
        node = self.site.node
        node.clear()
        node.update(self.items)
        return False


def digest(value):
    """SHA-256 of the pickled value (exact integers of any length; witnesses are in-memory only)."""
    return hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest()


# --- donor bases --------------------------------------------------------------------------------------------
# A clause whose location no control of this family populates (an optional member, a non-null branch, a then/else
# branch the controls never select) gets a base built from this family's own control with one value replaced: a value
# that another valid control holds at a location evaluated by the SAME literal schema node. The base must itself be
# valid at the row; it is a schema-valid instance of this family's boundary, not a claim about any other row.

def donor_pool(slots, cap=6):
    pool = {}
    for (fam, boundary), slot in slots.items():
        sites = inventory(slot["uri"], slot["pointer"])
        for p in slot["probes"]:
            inst = get_in(p, slot["getter"])
            for s in sites:
                for path, value in locations(inst, s.template):
                    lst = pool.setdefault(id(s.node), [])
                    if len(lst) < cap and all(digest(value) != digest(x) for x in lst):
                        lst.append(copy.deepcopy(value))
    return pool


def insert_at(instance, template, value):
    """Place value at the template location of instance (creating the last member only); None when the parent is absent."""
    if not template:
        return copy.deepcopy(value)
    parents = locations(instance, template[:-1])
    if not parents:
        return None
    path, parent = parents[0]
    last = template[-1]
    root = copy.deepcopy(instance)
    node = root
    for k in path:
        node = node[k]
    if last == "*":
        if isinstance(node, list):
            if node:
                node[0] = copy.deepcopy(value)
            else:
                node.append(copy.deepcopy(value))
            return root
        if isinstance(node, dict) and node:
            node[next(iter(node))] = copy.deepcopy(value)
            return root
        return None
    if isinstance(node, dict):
        node[last] = copy.deepcopy(value)
        return root
    return None


STRING_SAMPLES = ["0" * 64, "00000000-0000-0000-0000-000000000000", "evt_collaboration_" + "0" * 64, "collabop_" + "0" * 64,
                  "eig_" + "0" * 64, "app", "project~c12", "c12", "c12:ref", "2026-01-01T00:00:00Z", "collaboration@1:collabop_" + "0" * 64]


def node_valid(node_loc, value):
    doc, ptr = node_loc
    return dc.validator(doc, "#" + ptr, dc.ROOT).is_valid(value)


def generate(node, resolver, loc, depth=0):
    """Candidate valid values for one schema node (checked against that node in its own document by the caller)."""
    from urllib.parse import urldefrag, urljoin
    if not isinstance(node, dict) or depth > 6:
        return []
    out = []
    if "const" in node:
        return [copy.deepcopy(node["const"])]
    if isinstance(node.get("enum"), list) and node["enum"]:
        return [copy.deepcopy(e) for e in node["enum"][:2]]
    if "$ref" in node:
        r = resolver.lookup(node["$ref"])
        target, frag = urldefrag(urljoin(str(resolver._base_uri), node["$ref"]))
        out += generate(r.contents, r.resolver, (target, frag), depth + 1)
    for comb in ("anyOf", "oneOf", "allOf"):
        for i, b in enumerate(node.get(comb, [])):
            out += generate(b, resolver, (loc[0], loc[1] + "/" + comb + "/" + str(i)), depth + 1)
    t = node.get("type")
    types = [t] if isinstance(t, str) else (t or [])
    for ty in types:
        if ty == "string":
            for smp in STRING_SAMPLES:
                ok = True
                if isinstance(node.get("pattern"), str) and not re.search(node["pattern"], smp):
                    ok = False
                if len(smp) < node.get("minLength", 0) or len(smp) > node.get("maxLength", 10 ** 9):
                    ok = False
                if ok:
                    out.append(smp)
        elif ty == "integer":
            out.append(max(node.get("minimum", 1), node.get("exclusiveMinimum", 0) + 1))
        elif ty == "number":
            out.append(node.get("minimum", 1))
        elif ty == "boolean":
            out += [True, False]
        elif ty == "null":
            out.append(None)
        elif ty == "array":
            items = generate(node.get("items", {}), resolver, (loc[0], loc[1] + "/items"), depth + 1) if isinstance(node.get("items"), dict) else []
            n = node.get("minItems", 0)
            if n == 0:
                out.append([])
            if items:
                out.append([copy.deepcopy(items[0])] * max(n, 1))
        elif ty == "object":
            obj, alts = {}, {}
            props = node.get("properties", {})
            for m in node.get("required", []):
                vals = generate(props.get(m, {}), resolver, (loc[0], loc[1] + "/properties/" + _esc(m)), depth + 1) if m in props else ["c12"]
                obj[m] = vals[0] if vals else None
                if len(vals) > 1 and depth == 0:
                    alts[m] = vals[1]
            out.append(obj)
            # one-member variants (each repaired later with that member frozen)
            for m, alt in list(alts.items())[:6]:
                out.append(dict(obj, **{m: alt}))
    return out


def repaired(node, resolver, loc, value, rounds=8, frozen=()):
    """Repair a generated object against its node: replace a top-level member an error names with another candidate."""
    doc, ptr = loc
    v = dc.validator(doc, "#" + ptr, dc.ROOT)
    cur = copy.deepcopy(value)
    for _ in range(rounds):
        errors = list(v.iter_errors(cur))
        if not errors:
            return cur
        if not isinstance(cur, dict):
            return None
        changed = False
        for key in list(cur):
            if key in frozen:
                continue
            sub = node.get("properties", {}).get(key) if isinstance(node.get("properties"), dict) else None
            options = (generate(sub, resolver, (doc, ptr + "/properties/" + _esc(key))) if isinstance(sub, dict) else []) + STRING_SAMPLES + [None]
            for cand in options:
                trial = dict(cur, **{key: copy.deepcopy(cand)})
                if len(list(v.iter_errors(trial))) < len(errors):
                    cur, changed = trial, True
                    break
            if changed:
                break
        if not changed and isinstance(node.get("properties"), dict):
            # add a missing member the node's properties describe (an if branch may require it)
            for e in errors:
                for x in [e] + list(e.context or []):
                    mm = re.match(r"^'((?:[^'\\]|\\.)*)' is a required property$", x.message) if x.validator == "required" else None
                    if mm and mm.group(1) not in cur and mm.group(1) in node["properties"] and mm.group(1) not in frozen:
                        key = mm.group(1)
                        for cand in generate(node["properties"][key], resolver, (doc, ptr + "/properties/" + _esc(key)))[:3]:
                            trial = dict(cur, **{key: copy.deepcopy(cand)})
                            if len(list(v.iter_errors(trial))) < len(errors):
                                cur, changed = trial, True
                                break
                    if changed:
                        break
                if changed:
                    break
        if not changed:
            # drop a member the node does not require when that removes errors (a then branch may forbid it)
            required = set(node.get("required", [])) if isinstance(node, dict) else set()
            for key in list(cur):
                if key in frozen or key in required:
                    continue
                trial = {k2: v2 for k2, v2 in cur.items() if k2 != key}
                if len(list(v.iter_errors(trial))) < len(errors):
                    cur, changed = trial, True
                    break
        if not changed:
            return None
    return cur if not list(v.iter_errors(cur)) else None


def generated_values(site, cap=4, node=None, resolver=None, loc=None):
    """Values valid at the clause's own node (each checked against that node in its document)."""
    node = node if node is not None else site.node
    resolver, loc = resolver or site.resolver, loc or site.loc
    vals = []
    raw = generate(node, resolver, loc)
    first = raw[0] if raw and isinstance(raw[0], dict) else {}
    for v in list(raw):
        if isinstance(v, dict):
            try:
                r = repaired(node, resolver, loc, v, frozen=tuple(k for k in v if first.get(k) != v[k]))
            except Exception:  # a value the repair cannot judge is simply not a base
                r = None
            if r is not None:
                raw.append(r)
    for v in raw:
        try:
            if node_valid(loc, v) and all(digest(v) != digest(x) for x in vals):
                vals.append(v)
        except Exception:  # an unresolvable generated value is simply not a base
            continue
        if len(vals) >= cap:
            break
    return vals


def condition_bases(site, instances, by_template):
    """(template, value) bases for a then/else clause: the control's own enclosing object with the if-condition's
    properties set so that branch applies, repaired against the enclosing object's schema node."""
    ptr = site.loc[1]
    out = []
    for branch in ("then", "else"):
        marker = "/" + branch
        if marker not in ptr:
            continue
        holder_ptr = ptr[:ptr.rindex(marker)]
        depth = len([t for t in ptr[ptr.rindex(marker):].split("/") if t == "properties"])
        holder_t = tuple(site.template[:len(site.template) - depth]) if depth else tuple(site.template)
        try:
            holder = _node_at((site.loc[0], holder_ptr))
        except Exception:  # an unresolvable holder gives no base
            continue
        cond = holder.get("if") if isinstance(holder, dict) else None
        if not isinstance(cond, dict):
            continue
        conds = [cond] + [c for c in cond.get("allOf", []) if isinstance(c, dict)]
        settings = [{}]
        for c in conds:
            for key, sub in (c.get("properties") or {}).items():
                if not isinstance(sub, dict):
                    continue
                vals = [sub["const"]] if "const" in sub else list(sub.get("enum") or [])
                if not vals and branch == "then":
                    from jsonschema import Draft202012Validator as _V
                    pool_vals = []
                    for o in by_template.get(holder_t + (key,), []):
                        pool_vals += SIBLING_VALUES.get(o.template, []) + generated_values(o)
                    vals = [x for x in pool_vals if _V(sub).is_valid(x)][:2]
                if not vals:
                    continue
                if branch == "else":
                    settings = [dict(x, **{key: "c12_not_selected"}) for x in settings]
                else:
                    settings = [dict(x, **{key: v}) for x in settings for v in vals[:2]]
        # the enclosing object's own node in the same root branch as the clause (never another edition's node)
        branch = tuple(c for c in site.context if c not in ("then", "else", "if", "not"))
        outer = [a for a in by_template.get(holder_t, []) if a.keyword == "type" and tuple(a.context) == branch[:len(a.context)]
                 and not ({"if", "then", "else", "not"} & set(a.context))]
        for _, inst in instances:
            for path, value in locations(inst, holder_t):
                if not isinstance(value, dict):
                    continue
                for setting in settings[:4]:
                    v = dict(copy.deepcopy(value), **copy.deepcopy(setting))
                    for a in outer[:2]:
                        try:
                            r = repaired(a.node, a.resolver, a.loc, v, rounds=12, frozen=tuple(setting))
                        except Exception:  # an unrepairable value gives no base
                            r = None
                        if r is not None:
                            out.append((holder_t, r))
                            break
    return out


# --- per-slot driver ----------------------------------------------------------------------------------------

def run_slot(fam, boundary, slot, per_site=3, route_kills=3, progress=None, pool=None):
    """Witnesses, baseline, clause cuts and restoration for one family boundary; returns the slot ledger."""
    uri, pointer, getter, probes = slot["uri"], slot["pointer"], slot["getter"], slot["probes"]
    validator = dc.validator(uri, pointer, dc.ROOT)
    phase, row = row_of(boundary.split(":")[0])
    code = dict((n, None) for n, _, _ in dc.table_rows(phase))
    # the row's own refusal code, read by evaluating its predicate on a refusing observation
    sites = inventory(uri, pointer)
    kinds = {s.key: kind(s) for s in sites}
    # A payload witness must stay in the slot's edition: payload_rejection selects the edition from scope_kind.
    edition = boundary.split(":")[1] if boundary.startswith("payload:") else None
    instances = [(p, get_in(p, getter)) for p in probes]
    MEMBER_POOL.clear()
    MEMBER_POOL.update(_member_pool(instances))
    _gen_at_cache = {}

    def _gen_at(t):
        if t not in _gen_at_cache:
            vals = []
            for s_ in sites:
                if s_.template == t and s_.keyword in ("type", "enum", "const", "$ref") and len(vals) < 4:
                    for v_ in generated_values(s_, cap=2):
                        if all(digest(v_) != digest(x) for x in vals):
                            vals.append(v_)
            _gen_at_cache[t] = vals
        return _gen_at_cache[t]
    _GEN_AT["fn"] = _gen_at
    SIBLING_VALUES.clear()
    for s_ in sites:
        vals = SIBLING_VALUES.setdefault(s_.template, [])
        for v_ in (pool or {}).get(id(s_.node), []):
            if len(vals) < 8 and all(digest(v_) != digest(x) for x in vals):
                vals.append(v_)
    # Controls must be accepted by the complete route and valid at the row before anything is credited.
    control_rows = []
    for p, inst in instances:
        res, first, exc = route(p)
        control_rows.append(dict(case_id=p["case_id"], result=res, exception=exc, row_valid=validator.is_valid(inst)))
    witnesses, seen = [], set()
    attempts = 0
    for s in sites:
        if kinds[s.key] != "clause":
            continue
        found = 0
        for p, inst in instances:
            if found >= per_site:
                break
            got_here = False
            for path, value in locations(inst, s.template):
                if found >= per_site or got_here:
                    break
                for cand in candidates(s, value, inst, path):
                    attempts += 1
                    d = digest(cand)
                    if d in seen:
                        continue
                    if edition is not None and (not isinstance(cand, dict) or dc.edition_of(cand) != edition):
                        continue
                    errors = list(validator.iter_errors(cand))
                    if len(errors) != 1:
                        continue
                    seen.add(d)
                    tree, conditional = error_tree(errors[0])
                    att = error_site(leaf_errors(errors[0])[0], cand) if len(leaf_errors(errors[0])) == 1 else None
                    witnesses.append(dict(target=s.key, attributed=att[0] if att else None, attributed_node=att[1] if att else None,
                                          exact=bool(att and att[0] == s.key and att[1] == id(s.node)), probe=p, instance=cand,
                                          location="/" + "/".join(map(str, path)), top_error=errors[0].validator,
                                          tree=tree, conditional=conditional, sole=sole_key(errors[0], cand)))
                    found += 1
                    got_here = True
                    break
    # A required member that no single deletion isolates: the member removed together with one other member whose
    # presence another rule ties to it (a coherent removal), on the controls only.
    sole_now = {w.get("sole") for w in witnesses}
    for s in sites:
        if kinds[s.key] != "clause" or s.keyword != "required" or (id(s.node), "required", s.member) in sole_now:
            continue
        done = False
        for p, inst in instances:
            if done:
                break
            for path, value in locations(inst, s.template):
                if done or not isinstance(value, dict) or s.member not in value:
                    continue
                first = del_at(inst, path, s.member)
                for other in [m for m in value if m != s.member]:
                    cand = del_at(first, path, other)
                    if cand is None:
                        continue
                    if edition is not None and (not isinstance(cand, dict) or dc.edition_of(cand) != edition):
                        continue
                    errors = list(validator.iter_errors(cand))
                    if len(errors) != 1:
                        continue
                    tree, conditional = error_tree(errors[0])
                    if (id(s.node), "required", s.member) not in tree:
                        continue
                    with Cut(s):
                        if not validator.is_valid(cand):
                            continue
                    d = digest(cand)
                    if d in seen:
                        continue
                    seen.add(d)
                    witnesses.append(dict(target=s.key, attributed=None, attributed_node=None, exact=False, probe=p, instance=cand,
                                          location="/" + "/".join(map(str, path)), top_error=errors[0].validator, tree=tree,
                                          conditional=conditional, coherent=True, sole=(id(s.node), "required", s.member)))
                    done = True
                    break
    # Donor bases for clauses no control-derived witness reaches (neither targeted nor in any witness's error tree).
    by_template_all = {}
    for s in sites:
        by_template_all.setdefault(s.template, []).append(s)
    _gen = {}

    def gen_cache(a):
        if id(a.node) not in _gen:
            _gen[id(a.node)] = generated_values(a)
        return _gen[id(a.node)]
    reached = set()
    bases_by_t, valid_base_keys = {}, set()
    for w in witnesses:
        if w.get("sole"):
            reached.add(w["sole"])
    for s in sites:
        if kinds[s.key] != "clause" or pool is None:
            continue
        probe_key = (id(s.node), s.keyword, s.member) if s.keyword == "required" else (id(s.node), s.keyword)
        if probe_key in reached:
            continue
        done = False
        # Bases: a donor or generated value at the clause's own location, else at the nearest enclosing location
        # (an absent array item or member), each kept only when the whole instance stays valid at the row.
        base_values = [(s.template, v) for v in pool.get(id(s.node), []) + generated_values(s)]
        if "then" in s.context or "else" in s.context:
            base_values += condition_bases(s, instances, by_template_all)
        else:
            for t_ in (s.template, s.template[:-1]):
                for o in by_template_all.get(t_, []):
                    if o is not s and ("then" in o.context or "else" in o.context) and o.keyword in ("type", "const", "required"):
                        base_values += condition_bases(o, instances, by_template_all)[:4]
        for depth in range(len(s.template) - 1, 0, -1):
            anc_t = s.template[:depth]
            for a in by_template_all.get(anc_t, []):
                if a.keyword == "type" and tuple(a.context) == tuple(s.context)[:len(a.context)]:
                    base_values += [(anc_t, v) for v in pool.get(id(a.node), [])[:2] + gen_cache(a)]
        for p, inst in instances:
            if done:
                break
            for at, donor in base_values:
                base = insert_at(inst, at, donor)
                if base is None or not validator.is_valid(base):
                    continue
                db = digest(base)
                root = s.context[0] if s.context and s.context[0].startswith(("oneOf/", "anyOf/")) else ""
                slot_b = bases_by_t.setdefault((tuple(at), root), [])
                if db not in valid_base_keys and len(slot_b) < 12:
                    valid_base_keys.add(db)
                    slot_b.append((p["case_id"] + "@base:" + "/".join(map(str, at)), base))
                for path, value in locations(base, s.template):
                    for cand in candidates(s, value, base, path):
                        attempts += 1
                        d = digest(cand)
                        if d in seen:
                            continue
                        if edition is not None and (not isinstance(cand, dict) or dc.edition_of(cand) != edition):
                            continue
                        errors = list(validator.iter_errors(cand))
                        if len(errors) != 1:
                            continue
                        with Cut(s):
                            causal = validator.is_valid(cand)
                        if not causal:
                            continue
                        seen.add(d)
                        tree, conditional = error_tree(errors[0])
                        leaves = leaf_errors(errors[0])
                        att = error_site(leaves[0], cand) if len(leaves) == 1 else None
                        witnesses.append(dict(target=s.key, attributed=att[0] if att else None, attributed_node=att[1] if att else None,
                                              exact=bool(att and att[0] == s.key and att[1] == id(s.node)), probe=p, instance=cand,
                                              location="/" + "/".join(map(str, path)), top_error=errors[0].validator,
                                              tree=tree, conditional=conditional, donor_base=True, sole=probe_key))
                        if witnesses[-1]["sole"]:
                            reached.add(witnesses[-1]["sole"])
                        done = True
                        break
                    if done:
                        break
                if done:
                    break
    # Coherent witnesses for clauses still unreached: replace an enclosing member with a value valid at its own node
    # (another control's value there, or a generated one), kept only when the row then reports exactly one error
    # whose error tree holds this clause.
    by_template = {}
    for s in sites:
        by_template.setdefault(s.template, []).append(s)
    for s in sites:
        if kinds[s.key] != "clause":
            continue
        probe_key = (id(s.node), s.keyword, s.member) if s.keyword == "required" else (id(s.node), s.keyword)
        if probe_key in reached:
            continue
        done = False
        for depth in range(len(s.template) - 1, -1, -1):
            if done:
                break
            anc_t = s.template[:depth]
            anc_nodes = {id(a.node): a for a in by_template.get(anc_t, []) if a.keyword in ("type", "properties", "required")}
            for a in anc_nodes.values():
                if done:
                    break
                values = (pool or {}).get(id(a.node), []) + gen_cache(a)
                for p, inst in instances:
                    if done:
                        break
                    for val in values:
                        cand = insert_at(inst, anc_t, val)
                        if cand is None:
                            continue
                        if edition is not None and (not isinstance(cand, dict) or dc.edition_of(cand) != edition):
                            continue
                        d = digest(cand)
                        if d in seen:
                            continue
                        attempts += 1
                        errors = list(validator.iter_errors(cand))
                        if len(errors) != 1:
                            continue
                        tree, conditional = error_tree(errors[0])
                        if probe_key not in tree:
                            continue
                        with Cut(s):
                            causal = validator.is_valid(cand)
                        if not causal:
                            continue
                        seen.add(d)
                        leaves = leaf_errors(errors[0])
                        att = error_site(leaves[0], cand) if len(leaves) == 1 else None
                        witnesses.append(dict(target=s.key, attributed=att[0] if att else None, attributed_node=att[1] if att else None,
                                              exact=bool(att and att[0] == s.key and att[1] == id(s.node)), probe=p, instance=cand,
                                              location="/" + "/".join(map(str, anc_t)), top_error=errors[0].validator,
                                              tree=tree, conditional=conditional, coherent=True, sole=probe_key))
                        if witnesses[-1]["sole"]:
                            reached.add(witnesses[-1]["sole"])
                        done = True
                        break
    # Complete-route baseline for every witness: first refusal must be the schema row.
    for w in witnesses:
        wp = with_instance(w["probe"], getter, w["instance"], None)
        res, first, exc = route(wp)
        w["baseline"] = dict(result=res, first=list(first) if first else None, exception=exc)
        w["baseline_ok"] = exc is None and first is not None and first[0] == phase and first[1] == row and res == first[2]
        if w["baseline_ok"]:
            code[row] = first[2]
    good = [w for w in witnesses if w["baseline_ok"]]
    # Clause cuts over literal clauses (one cut per source node keyword member), row-level flips for all witnesses,
    # complete-route kills for the flipped witnesses, controls under the cut, then restoration.
    literal = {}
    for s in sites:
        if kinds[s.key] in ("clause", "condition", "negated"):
            literal.setdefault((id(s.node), s.keyword, s.member), []).append(s)
    cuts = []
    for n, ((nid, kw, member), group) in enumerate(literal.items()):
        if progress and n % 100 == 0:
            progress(fam, boundary, n, len(literal))
        s0 = group[0]
        entry = dict(clause=s0.src_key[1], path=s0.src_key[0], member=member, keyword=kw, line=(s0.src or {}).get("line"),
                     kind=kinds[s0.key], eval_sites=[s.key for s in group])
        with Cut(s0):
            # Only a witness whose error tree holds this clause, or one with an error under then/else (an if-condition
            # cut can switch the branch), can change; every other witness keeps the error the cut does not touch.
            flipped = [w for w in good if ((nid, kw) in w["tree"] or w["conditional"]) and validator.is_valid(w["instance"])]
            # a required-member cut can only flip a witness missing that member
            ctrl_broken = [p["case_id"] for p, inst in instances if not validator.is_valid(inst)]
            # constructed valid bases (each valid at the row before the cut) refused under the cut detect it too
            # (bases built where this clause's location and the base's insertion location are nested in each other)
            # nested in each other, or siblings under the same enclosing object (an if there reads its members)
            temps = {s_.template for s_ in group}
            near = [b for (at, _root), lst in bases_by_t.items()
                    if any(at == t[:len(at)] or t == at[:len(t)] or (t and at[:len(t) - 1] == t[:-1]) for t in temps) for b in lst]
            ctrl_broken += [name for name, base in near if not validator.is_valid(base)][:5]
            kills = []
            for w in sorted(flipped, key=lambda w: (not (w["target"] in entry["eval_sites"]), not w["exact"]))[:route_kills]:
                wp = with_instance(w["probe"], getter, w["instance"], None)
                res, first, exc = route(wp)
                if exc is not None:
                    outcome = "INVALID_exception"
                elif first is not None and first[0] == phase and first[1] == row:
                    outcome = "survived"
                elif res is None:
                    outcome = "kill_accepted"
                else:
                    outcome = "kill_refused_later"
                kills.append(dict(witness=w["probe"]["case_id"] + "@" + w["location"] + "#" + w["target"], own=w["target"] in entry["eval_sites"],
                                  outcome=outcome, refused_later=list(first) if first and outcome == "kill_refused_later" else None, exception=exc))
            ctrl_route = []
            if ctrl_broken:
                for p, inst in instances:
                    if p["case_id"] in ctrl_broken:
                        res, first, exc = route(p)
                        ctrl_route.append(dict(case_id=p["case_id"], result=res, first=list(first) if first else None, exception=exc))
        restored = []
        for k in kills:
            pass
        for w in sorted(flipped, key=lambda w: (not (w["target"] in entry["eval_sites"]), not w["exact"]))[:route_kills]:
            wp = with_instance(w["probe"], getter, w["instance"], None)
            res, first, exc = route(wp)
            restored.append(exc is None and first is not None and first[0] == phase and first[1] == row)
        if not flipped and not ctrl_broken:
            imp = None
            for s in group:
                imp = implication(s, by_template, boundary)
                if imp:
                    break
            entry["implication"] = imp
            if imp is None:
                entry["joint"] = joint_cut(s0, literal, instances, validator, getter, phase, row, edition)
            if imp is None and not entry.get("joint") and kw == "type":
                imp = type_entailed_under_cut(s0, instances, validator, edition)
                entry["implication"] = imp
        entry.update(row_flips=len(flipped), own_row_flips=sum(1 for w in flipped if w["target"] in entry["eval_sites"]),
                     controls_refused_under_cut=ctrl_broken, controls_route_under_cut=ctrl_route, kills=kills,
                     restored=all(restored) if restored else None)
        cuts.append(entry)
    for w in witnesses:
        w.pop("tree", None)
        w.pop("sole", None)
        w["probe_case"] = w.pop("probe")["case_id"]
        w["instance_sha256"] = digest(w.pop("instance"))
        w.pop("attributed_node", None)
    return dict(family=fam, boundary=boundary, uri=uri, pointer=pointer, phase=phase, row=row, code=code[row],
                sites=[dict(s.describe(), kind=kinds[s.key]) for s in sites], controls=control_rows, candidate_attempts=attempts,
                witnesses=witnesses, cuts=cuts)


# --- covering proofs for clauses no single-defect witness can isolate -----------------------------------------

def _pattern_width(pattern):
    """(min, max, anchored, guarded) of a JSON Schema pattern under re.search; None when not fully anchored."""
    from re import _parser as sre
    if not isinstance(pattern, str) or not pattern.startswith("^"):
        return None
    guarded = pattern.endswith("$(?![\\s\\S])")
    if not (guarded or pattern.endswith("$")) or "|" in pattern.replace("(app|project", "").split("(")[0]:
        return None
    try:
        lo, hi = sre.parse(pattern).getwidth()
    except Exception:  # an unparsable pattern earns no implication
        return None
    return lo, (hi if hi < sre.MAXREPEAT else None), guarded


def _node_at(loc):
    doc, ptr = loc
    return dc.schema_registry(dc.ROOT).resolver(doc).lookup(doc + "#" + ptr).contents


def _forced_if(holder_loc, holder_template, by_template, context=()):
    """(truth, const site) when the if at holder_loc is properties:{K:{const|enum}} and K is fixed by a const that applies
    whenever the holder does (unconditionally, or in the same root branch); None otherwise."""
    holder = _node_at(holder_loc)
    cond = holder.get("if") if isinstance(holder, dict) else None
    if not (isinstance(cond, dict) and set(cond) in ({"properties"}, {"properties", "required"}) and len(cond["properties"]) == 1):
        return None
    (key, sub), = cond["properties"].items()
    if "required" in cond and cond["required"] != [key]:
        return None
    if not (isinstance(sub, dict) and (set(sub) == {"const"} or set(sub) == {"enum"})):
        return None
    allowed = [sub["const"]] if "const" in sub else list(sub["enum"])
    # The key must be present on every instance the holder judges: required by the holder's own node (outside any if).
    if not any(r.keyword == "required" and r.member == key and not ({"if", "then", "else"} & set(r.context))
               for r in by_template.get(tuple(holder_template), [])):
        return None
    for o in by_template.get(tuple(holder_template) + (key,), []):
        if o.keyword != "const" or {"if", "then", "else"} & set(o.context):
            continue
        if tuple(o.context) != tuple(context)[:len(o.context)]:
            continue
        return (o.node.get("const") in allowed, o)
    return None


def forced_branch(site, by_template):
    """Proof for clauses decided by an if whose condition a const fixes on every instance this clause is evaluated for."""
    src = site.src or {}
    where = f"{src.get('path')}:{src.get('line')}"
    ptr = site.loc[1]
    for branch in ("then", "else", "if"):
        marker = "/" + branch
        if marker not in ptr:
            continue
        holder_ptr = ptr[:ptr.rindex(marker)]
        depth = len([t for t in ptr[ptr.rindex(marker):].split("/") if t == "properties"])
        holder_t = site.template[:len(site.template) - depth] if depth else site.template
        forced = _forced_if((site.loc[0], holder_ptr), holder_t, by_template, site.context)
        if forced is None:
            continue
        truth, fix = forced
        f = fix.src or {}
        tag = f"the if at {src.get('path')}#{holder_ptr}, whose condition is fixed {'true' if truth else 'false'} by the const {fix.node['const']!r} at {f.get('path')}:{f.get('line')}"
        if (branch == "else" and truth) or (branch == "then" and not truth):
            return dict(kind=branch + "_branch_never_selected", proof=f"{where} sits in the {branch} branch of {tag}; on every instance this "
                        f"clause is evaluated for, the {branch} branch never applies, so the clause can never refuse here")
        if branch == "if":
            return dict(kind="condition_forced", proof=f"{where} is the condition of {tag}; cutting it can only make the condition hold on "
                        "more instances, and it already holds on all of them" if truth else f"{where} is the condition of {tag}; the fixed "
                        "value fails this condition clause itself, so cutting it would select the then branch, which the forcing const "
                        "already keeps away from every accepted instance (an accepted instance never reaches it); recorded as an equivalent "
                        "mutant on this boundary")
    # A forced branch's const or type at the same location entails this clause when that value set lies inside the
    # clause's holder: every value that makes this clause refuse also violates the forced branch.
    for o in by_template.get(site.template, []):
        if o is site or o.keyword not in ("const", "type"):
            continue
        optr = o.loc[1]
        for branch in ("then", "else"):
            if "/" + branch not in optr:
                continue
            holder_ptr = optr[:optr.rindex("/" + branch)]
            depth = len([t for t in optr[optr.rindex("/" + branch):].split("/") if t == "properties"])
            forced = _forced_if((o.loc[0], holder_ptr), site.template[:len(site.template) - depth], by_template, site.context)
            if forced is None or forced[0] != (branch == "then"):
                continue
            fix = forced[1]
            values = [o.node["const"]] if o.keyword == "const" else ([None] if o.node["type"] == "null" else None)
            if values is None:
                continue
            holder_loc = site.loc
            local = re.search(r"/(anyOf|oneOf)/\d+$", site.loc[1])
            if local:
                holder_loc = (site.loc[0], site.loc[1][:local.start()])
            try:
                ok = all(node_valid(holder_loc, c) for c in values)
            except Exception:  # an unresolvable holder earns no proof
                ok = False
            if ok:
                os_, f = o.src or {}, fix.src or {}
                return dict(kind="entailed_by_forced_" + branch, proof=f"{where} is entailed by the {branch}-branch {o.keyword} {values[0]!r} at "
                            f"{os_.get('path')}:{os_.get('line')}, whose if is fixed by the const at {f.get('path')}:{f.get('line')}: it "
                            f"applies to every instance this clause is evaluated for, and {values[0]!r} satisfies this clause's schema, so "
                            "every value that makes this clause refuse also violates it; no single-defect witness fails this clause alone")
    return None


def implication(site, slot_sites_by_node, boundary):
    """A written proof that no single-defect witness can isolate this clause, or None.

    Each proof names the clause that always refuses first or the route fact that makes the clause unreachable;
    the proof is mechanical (pattern widths, enum/const value types, definition selection), never a missing witness.
    """
    node, k, v = site.node, site.keyword, site.node.get(site.keyword)
    src = site.src or {}
    where = f"{src.get('path')}:{src.get('line')}"
    if k == "type" and "not" in site.context and slot_sites_by_node:
        outer = tuple(site.context)[:list(site.context).index("not")]
        same = [o for o in slot_sites_by_node.get(site.template, []) if o.keyword == "type" and o.node.get("type") == v
                and "not" not in o.context and "if" not in o.context and tuple(o.context) == outer[:len(o.context)]]
        if same:
            o = same[0].src or {}
            return dict(kind="negated_type_restates_unconditional_type", proof=f"{where} type {v!r} inside a negated subschema restates the "
                        f"unconditional type {v!r} that {o.get('path')}:{o.get('line')} applies at the same location: cutting it only lets the "
                        "negated branch also match values of other types, every one of which that unconditional type already refuses, so "
                        "no accepted instance changes (an equivalent mutant); the negated branch itself is witnessed through its not")
    if k in ("minItems", "minLength", "minProperties") and v == 0:
        return dict(kind="vacuous_lower_bound", proof=f"{where} {k} 0 admits every value of its type, so no instance can violate it and "
                    "cutting it changes no result: a vacuous clause with nothing to witness")
    pw = _pattern_width(node.get("pattern"))
    if k == "minLength" and isinstance(v, int) and pw and pw[0] >= v:
        return dict(kind="minLength_by_pattern", proof=f"{where} minLength {v} is implied by the sibling pattern {node['pattern']!r}: every string it "
                    f"accepts has at least {pw[0]} characters (sre width), so a shorter string also fails the pattern and no witness fails minLength alone; "
                    f"the pattern clause is witnessed and cut on its own")
    if k == "maxLength" and isinstance(v, int) and pw and pw[1] is not None and pw[1] + (0 if pw[2] else 1) <= v:
        return dict(kind="maxLength_by_pattern", proof=f"{where} maxLength {v} is implied by the sibling pattern {node['pattern']!r}: every string it "
                    f"accepts has at most {pw[1] + (0 if pw[2] else 1)} characters" + ("" if pw[2] else " (the unguarded $ admits one trailing LF)") +
                    ", so a longer string also fails the pattern")
    if k == "type" and ("enum" in node or "const" in node):
        values = node["enum"] if "enum" in node else [node["const"]]
        if all(_json_type_ok(x, v) for x in values):
            return dict(kind="type_by_enum_const", proof=f"{where} type {v!r} is implied by the sibling " + ("enum" if "enum" in node else "const") +
                        f": every admitted value is of that type, so a wrong-type value also fails the " + ("enum" if "enum" in node else "const") +
                        " and no witness fails the type alone")
    if k in ("enum", "type") and slot_sites_by_node:
        # Another node applies at the same instance location whenever this clause applies, with a const (or an enum)
        # inside this clause's domain: every violation of this clause also violates that const/enum.
        for other in slot_sites_by_node.get(site.template, []):
            if other.node is node or other.keyword not in ("const", "enum") or len(other.context) > len(site.context) \
                    or tuple(other.context) != tuple(site.context)[:len(other.context)]:
                continue
            vals = [other.node["const"]] if other.keyword == "const" else other.node.get("enum") or []
            if not vals:
                continue
            inside = all(x in v for x in vals) if k == "enum" else all(_json_type_ok(x, v) for x in vals)
            if inside:
                o = other.src or {}
                return dict(kind=k + "_by_other_node_" + other.keyword, proof=f"{where} {k} {v!r} is implied by the {other.keyword} "
                            f"{vals!r} that {o.get('path')}:{o.get('line')} applies at the same location whenever this clause applies: every "
                            f"value outside this {k} also fails that {other.keyword}, so no witness fails this {k} alone; that "
                            f"{other.keyword} is witnessed and cut on its own")
    forced = forced_branch(site, slot_sites_by_node) if slot_sites_by_node else None
    if forced:
        return forced
    if k in ("anyOf", "oneOf") and isinstance(v, list) and slot_sites_by_node:
        # A complete if/then/else at the enclosing object constrains this member in both branches, and each branch's
        # constraint is one of this combinator's own branches: whichever applies, a value the combinator refuses also
        # fails it, so the combinator is never the only failing clause.
        by_holder = {}
        for o in slot_sites_by_node.get(site.template, []):
            for br in ("then", "else"):
                m = re.search(r"^(.*)/" + br + r"/properties/[^/]+$", o.loc[1])
                if m and o.keyword in ("$ref", "type", "const"):
                    by_holder.setdefault((o.loc[0], m.group(1)), {})[br] = o
        for (doc, hptr), pair in by_holder.items():
            if set(pair) != {"then", "else"}:
                continue
            nodes = {br: _node_at((doc, pair[br].loc[1])) for br in pair}
            if all(any(json.dumps(nodes[br], sort_keys=True) == json.dumps(b, sort_keys=True) for b in v) for br in nodes):
                t, e = pair["then"].src or {}, pair["else"].src or {}
                return dict(kind="combinator_entailed_by_complete_if", proof=f"{where} {k} is entailed by the complete if/then/else at "
                            f"{src.get('path')}#{hptr}: its then constraint ({t.get('path')}:{t.get('line')}) and its else constraint "
                            f"({e.get('path')}:{e.get('line')}) are each one of this {k}'s own branches, and one of them applies to every "
                            f"instance, so a value this {k} refuses also fails the branch that applies; no single-defect witness fails it "
                            "alone, and both branch constraints are witnessed and cut on their own")
    if k == "properties" and "if" in site.context and slot_sites_by_node is not None and isinstance(v, dict):
        outer = tuple(site.context)[:list(site.context).index("if")]
        restated = []
        for prop, sub in v.items():
            allowed = [sub["const"]] if isinstance(sub, dict) and "const" in sub else (sub.get("enum") if isinstance(sub, dict) else None)
            if not isinstance(allowed, list) or set(sub) - {"enum", "const"}:
                restated = None
                break
            hit = [o for o in slot_sites_by_node.get(tuple(site.template) + (prop,), []) if o.keyword in ("enum", "const")
                   and "if" not in o.context and tuple(o.context) == outer[:len(o.context)]
                   and all(x in allowed for x in ([o.node["const"]] if o.keyword == "const" else o.node["enum"]))]
            if not hit:
                restated = None
                break
            restated.append(hit[0])
        if restated:
            o = restated[0].src or {}
            return dict(kind="condition_restates_unconditional_enum", proof=f"{where} the if-condition's enum/const on "
                        f"{sorted(v)} admits every value the unconditional clause at {o.get('path')}:{o.get('line')} admits, so on every "
                        "instance the row accepts this part of the condition already holds; cutting it changes no accepted instance (an "
                        "equivalent mutant), and an instance outside it is refused by that unconditional clause, which is witnessed and cut "
                        "on its own")
    if k == "required" and "if" in site.context and slot_sites_by_node is not None:
        outer = tuple(site.context)[:list(site.context).index("if")]
        enclosing = [o for o in slot_sites_by_node.get(site.template, []) if o.keyword == "required" and o.member == site.member
                     and "if" not in o.context and tuple(o.context) == outer[:len(o.context)]]
        if enclosing:
            o = enclosing[0].src or {}
            return dict(kind="condition_required_restates_enclosing_required", proof=f"{where} the if-condition's required {site.member!r} "
                        f"restates the required {site.member!r} that {o.get('path')}:{o.get('line')} imposes on every instance this if is "
                        "evaluated for: an instance the row accepts always holds the member, so cutting it from the condition changes no "
                        "accepted instance (an equivalent mutant), and an instance without it is refused by that enclosing required, which "
                        "is witnessed and cut on its own")
    if not site.template and boundary.startswith(("payload", "source")) and k == "type" and v == "object":
        row = "PO01_payload_object (payload_object)" if boundary.startswith("payload") else "SO01_object (source_object)"
        return dict(kind="root_type_by_earlier_row", proof=f"{where} the root type object is refused first by the earlier row {row}, "
                    "which the checker evaluates before the schema row on every input (scripts/pm_collaboration_events.py payload_rejection/"
                    "source_rejection)")
    if boundary == "source" and tuple(site.template) in ((), ("event_type",)) and \
            ((k == "required" and site.member == "event_type") or (k == "const" and site.template == ("event_type",))):
        return dict(kind="definition_selected_by_event_type", proof=f"{where} the source definition is selected by the value's own event_type "
                    "(source_rejection reads value.get('event_type'), the source_family row SO02 refuses a missing or unknown one, and a known "
                    "one selects that family's definition), so this family's definition never sees another event_type or a missing one")
    if boundary == "payload:application" and ((site.template == ("scope_kind",) and k == "const") or
                                              (not site.template and k == "required" and site.member == "scope_kind")):
        return dict(kind="edition_selected_by_scope_kind", proof=f"{where} the application edition is selected only when the payload's own "
                    "scope_kind is 'application' (payload_rejection -> edition_of), so this const never sees another value; the project edition "
                    "judges every other value, and its own scope_kind const is witnessed there")
    return None


def type_entailed_under_cut(site, instances, validator, edition):
    """With the type clause cut, one value of every other JSON type at the clause's location in a control: when every
    one is still refused by the row, another clause refuses every value this type refuses (the refusing clause of each
    sample is named), so no single-defect witness fails this type alone and its cut is equivalent here."""
    samples = [x for x in TYPE_SAMPLES if not _json_type_ok(x, site.node.get("type"))]
    found = []
    with Cut(site):
        for p, inst in instances:
            for path, value in locations(inst, site.template)[:1]:
                for x in samples:
                    cand = set_at(inst, path, copy.deepcopy(x))
                    if edition is not None and (not isinstance(cand, dict) or dc.edition_of(cand) != edition):
                        return None
                    errors = list(validator.iter_errors(cand))
                    if not errors:
                        return None
                    leaves = []
                    for e in errors:
                        stack = [e]
                        while stack:
                            y = stack.pop()
                            if y.context:
                                stack.extend(y.context)
                            elif list(y.absolute_path) == list(path):
                                leaves.append(y.validator + " at " + "/".join(map(str, y.absolute_schema_path)))
                    found.append(dict(sample=repr(x), refused_by=sorted(set(leaves))[:3]))
            if found:
                break
    if not found or any(not f["refused_by"] for f in found):
        return None
    src = site.src or {}
    return dict(kind="type_entailed_under_cut", proof=f"{src.get('path')}:{src.get('line')} type {site.node.get('type')!r}: with it cut, a value "
                f"of every other JSON type at this location is still refused by the row, by the clause(s) named per sample "
                f"({'; '.join(f['sample'] + ': ' + ', '.join(f['refused_by']) for f in found)}); every value this type refuses is refused "
                "there too, so no single-defect witness fails it alone and its cut is equivalent on this boundary", samples=found)


# --- duplicate clauses: cut individually (above), then together ---------------------------------------------

def joint_cut(s0, literal, instances, validator, getter, phase, row, edition):
    """An identical clause (same keyword and value) that another node applies at the same location: every violation
    fails both, so neither cut alone can flip a witness. Find a witness whose errors are exactly that pair, cut both
    together, run it through the complete checker, restore both. None when there is no such duplicate."""
    val0 = json.dumps(s0.node.get(s0.keyword), sort_keys=True, default=str)
    for (nid, kw, member), group in literal.items():
        other = group[0]
        if other.node is s0.node or kw != s0.keyword or member != s0.member or other.template != s0.template:
            continue
        if json.dumps(other.node.get(kw), sort_keys=True, default=str) != val0:
            continue
        for p, inst in instances:
            for path, value in locations(inst, s0.template):
                for cand in candidates(s0, value, inst, path):
                    if edition is not None and (not isinstance(cand, dict) or dc.edition_of(cand) != edition):
                        continue
                    errors = list(validator.iter_errors(cand))
                    if len(errors) != 1:
                        continue
                    tree, _ = error_tree(errors[0])
                    if (id(s0.node), s0.keyword) not in tree or (id(other.node), kw) not in tree:
                        continue
                    with Cut(s0):
                        alone = validator.is_valid(cand)
                        with Cut(other):
                            both = validator.is_valid(cand)
                            res, first, exc = route(with_instance(p, getter, cand, None)) if both else (None, None, None)
                    if alone or not both:
                        continue
                    res2, first2, exc2 = route(with_instance(p, getter, cand, None))
                    restored = exc2 is None and first2 is not None and first2[0] == phase and first2[1] == row
                    outcome = ("INVALID_exception" if exc else "survived" if first and first[0] == phase and first[1] == row
                               else "kill_accepted" if res is None else "kill_refused_later")
                    o = other.src or {}
                    return dict(duplicate_of=dict(path=o.get("path"), line=o.get("line"), keyword=kw), witness=p["case_id"] + "@/" + "/".join(map(str, path)),
                                outcome=outcome, refused_later=list(first) if first and outcome == "kill_refused_later" else None,
                                exception=exc, restored=restored)
    return None


# --- ledger summary -----------------------------------------------------------------------------------------

def cut_status(entry):
    """killed | invalid | survived | control_detected | implied | open, for one literal clause cut (strict accounting)."""
    outcomes = [k["outcome"] for k in entry["kills"]]
    if any(o in ("kill_accepted", "kill_refused_later") for o in outcomes):
        return "killed"
    if outcomes and all(o == "INVALID_exception" for o in outcomes):
        return "invalid"
    if outcomes:
        return "survived"
    if entry["controls_refused_under_cut"]:
        return "control_detected"
    joint = entry.get("joint")
    if joint and joint["outcome"] in ("kill_accepted", "kill_refused_later") and joint["restored"]:
        return "joint_kill"
    if entry.get("implication"):
        return "implied"
    return "open"


def summarize(r):
    import collections
    statuses = collections.Counter()
    for e in r["cuts"]:
        e["status"] = cut_status(e)
        statuses[e["status"]] += 1
    kills = collections.Counter(k["outcome"] for e in r["cuts"] if e["status"] == "killed" for k in e["kills"][:1])
    return dict(family=r["family"], boundary=r["boundary"], row=r["row"], code=r["code"], sites=len(r["sites"]),
                site_kinds=dict(collections.Counter(s["kind"] for s in r["sites"])), clauses=len(r["cuts"]),
                witnesses=len(r["witnesses"]), witnesses_baseline_ok=sum(w["baseline_ok"] for w in r["witnesses"]),
                donor_witnesses=sum(1 for w in r["witnesses"] if w.get("donor_base")), coherent_witnesses=sum(1 for w in r["witnesses"] if w.get("coherent")),
                killed=statuses["killed"], kill_first_outcomes=dict(kills), invalid=statuses["invalid"], survived=statuses["survived"],
                joint_kill=statuses["joint_kill"],
                control_detected=statuses["control_detected"], implied=statuses["implied"], open=statuses["open"],
                implication_kinds=dict(collections.Counter(e["implication"]["kind"] for e in r["cuts"] if e["status"] == "implied")),
                open_clauses=[dict(keyword=e["keyword"], member=e["member"], path=e["path"], line=e["line"], kind=e["kind"], eval_sites=e["eval_sites"][:3])
                              for e in r["cuts"] if e["status"] in ("open", "survived")],
                baseline_failures=0, baseline_not_schema_row=sum(1 for w in r["witnesses"] if not w["baseline_ok"]),
                restoration_failures=sum(1 for e in r["cuts"] if e["restored"] is False),
                control_route_failures=sum(1 for c in r["controls"] if c["result"] is not None or c["exception"] or not c["row_valid"]),
                seconds=r.get("seconds"))
