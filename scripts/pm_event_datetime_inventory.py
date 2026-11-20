"""Classified CV-1101 schema-node inventory and fail-closed completeness gate.

The inventory is reviewed owner/resource/path data, never inferred ownership
from a field name. Scan the working tree, including untracked schema additions,
registry-embedded resources, lineage data and Markdown/MDX code containers.
The bounded universe and content-pinned exclusions are documented in scan().
"""
from __future__ import annotations

import argparse
from collections import Counter
from functools import lru_cache
import hashlib
import json
import os
from pathlib import Path
import posixpath
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
INVENTORY = "Plans/event_datetime_inventory.json"
FIELDS = frozenset(("observed_at_utc", "persisted_at_utc"))
# CV-1101 source fields the enforced validator composes, by inventory classification (fix round 18). Every EventRecord
# node is an envelope whose occurred_at_utc takes the broad EventRecord profile, retained and copied history included,
# whatever the original declares; the Storage fields take CV-253's profile through the node's own profile.
SOURCE_FIELDS = {"EventRecord": ("occurred_at_utc",)}


def digest(value):
    """Checker-only structural fingerprint; never a product hash or raw pin."""
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=True,
                                    separators=(",", ":")).encode()).hexdigest()


def walk(value, pointer=""):
    if isinstance(value, dict):
        yield pointer, value
        for key, child in value.items():
            yield from walk(child, pointer + "/" + str(key).replace("~", "~0").replace("/", "~1"))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from walk(child, pointer + "/" + str(index))


def at(value, pointer):
    for bit in pointer.lstrip("/").split("/") if pointer else ():
        value = value[int(bit)] if isinstance(value, list) else value[bit.replace("~1", "/").replace("~0", "~")]
    return value


def node_key(row):
    return row["path"], row["origin"], row["pointer"]


def nested_resource_pointer(path, pointer):
    """Resource address within the two reviewed schema containers.

    A recipe freezes its own schema, even when another recipe uses the same
    $id. Descendants retain that schema's local reference address space.
    """
    if path == "Plans/storage_value_registry.json" and pointer.startswith("/families/"):
        return "/".join(pointer.split("/")[:4])
    if path == "Plans/dch_retained_recipes.json":
        parts = pointer.split("/")
        if len(parts) >= 5 and parts[1] == "recipes" and parts[3] == "schemas" and parts[2] and parts[4]:
            return "/".join(parts[:5])
    return ""


def snapshot_run(path):
    """The migration run directory a scanned file belongs to, or "" for live files.

    Snapshot runs are regenerated from the owner documents at every Plans landing
    and older runs are then pruned (pm-plan-migration.py snapshot-current), so a
    pinned exclusion or a citation that names a run path is ephemeral by
    construction and cannot survive the next landing.
    """
    parts = path.split("/")
    if (len(parts) >= 4 and parts[0] == "Plans" and parts[1] == ".plan_migration"
            and parts[2].startswith("pds-")):
        return parts[2]
    return ""


def snapshot_span_map(run):
    """The one file of a run whose lines are span-map rows."""
    return "Plans/.plan_migration/" + run + "/span_map.jsonl"


def _canonical_owner_path(path):
    """A Plans path spelled the way the scan names it: no ".", "..", empty or control components.

    Coverage is keyed by the scanned spelling, so a span naming its owner any other way
    ("Plans/./Owner.md", "Plans/../scripts/x.md") would find no coverage and pass (c) vacuously.
    """
    return (path.startswith("Plans/") and posixpath.normpath(path) == path
            and not any(ch in path for ch in "\n\r\x00") and not snapshot_run(path))


def adjudicate_snapshot_line(root, path, value, coverage):
    """The fresh check: accept a mentioning snapshot line only as a verified copy of a covered owner span.

    (a) the line is a row of its run's own span_map.jsonl for one owner-document span
    named by its canonical Plans path,
    (b) the owner document still carries that span's exact bytes at the recorded
    offsets, and (c) no mentioning code container overlapping the span is left
    uncovered in the owner document. A copy accepted this way cannot hide a
    timestamp schema: the owner original is scanned in the same pass, a real
    declaration there surfaces as its own classified node, and an uncovered
    mentioning container in the owner span refuses the copy as well.
    """
    run = snapshot_run(path)
    if (path != snapshot_span_map(run)
            or not isinstance(value, dict) or value.get("schema_id") != "pm.plan_migration.span.v1"
            or value.get("run_id") != run or not isinstance(value.get("span_id"), str)
            or not isinstance(value.get("source_path"), str)
            or not _canonical_owner_path(value["source_path"])
            or not isinstance(value.get("sha256"), str)
            or not isinstance(value.get("byte_start"), int) or isinstance(value.get("byte_start"), bool)
            or not isinstance(value.get("byte_end"), int) or isinstance(value.get("byte_end"), bool)
            or not 0 <= value["byte_start"] < value["byte_end"]):
        return "snapshot_line_unmapped"
    source = root / value["source_path"]
    try:
        data = source.read_bytes()
    except OSError:
        return "snapshot_owner_range_missing"
    start, end = value["byte_start"], value["byte_end"]
    if end > len(data):
        return "snapshot_owner_range_missing"
    if hashlib.sha256(data[start:end]).hexdigest() != value["sha256"]:
        return "snapshot_owner_text_changed"
    if source.suffix.lower() not in (".md", ".mdx"):
        # Container coverage is line-mapped for Markdown owners only.
        return "snapshot_owner_span_uncovered"
    first = data[:start].count(b"\n") + 1
    last = first + data[start:end].count(b"\n")
    if any(lo <= last and hi >= first
           for lo, hi, state in coverage.get(value["source_path"], ()) if state == "uncovered"):
        return "snapshot_owner_span_uncovered"
    return None


CURRENT_RUN_POINTER = "Plans/.plan_migration/current_run.json"
# Repository-location variables a calling git hook can export. They would point the history reader at a
# repository other than the tree under --root, so the reader never inherits them.
_GIT_LOCATION_ENV = frozenset(("GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_OBJECT_DIRECTORY",
                               "GIT_ALTERNATE_OBJECT_DIRECTORIES", "GIT_COMMON_DIR", "GIT_NAMESPACE"))


def listed_snapshot_runs(root):
    """The runs current_run.json names, as its run_id or in its supersedes_run_ids.

    snapshot-current keeps exactly these current-snapshot runs and prunes the others
    (remove_older_snapshot_runs in pm-plan-migration.py), so no other run directory belongs to
    the published lineage. An unreadable pointer names none.
    """
    try:
        pointer = json.loads((Path(root) / CURRENT_RUN_POINTER).read_text(), object_pairs_hook=_unique_object)
    except (OSError, ValueError):
        return frozenset()
    if not isinstance(pointer, dict):
        return frozenset()
    supersedes = pointer.get("supersedes_run_ids")
    names = [pointer.get("run_id"), *(supersedes if isinstance(supersedes, list) else ())]
    return frozenset(name for name in names if isinstance(name, str))


class SnapshotHistory:
    """Owner bytes as of the commit that last changed a run's span_map.jsonl, read through git objects.

    One reader serves one scan. It starts git only when a copy is not fresh and never writes.
    """

    def __init__(self, root):
        self.root = Path(root)
        self.env = {key: value for key, value in os.environ.items() if key not in _GIT_LOCATION_ENV}
        self.repository, self.runs, self.blobs, self.batch = None, {}, {}, None

    def _git(self, *args):
        return subprocess.run(["git", "-C", str(self.root), *args], env=self.env, stdin=subprocess.DEVNULL,
                              stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, check=False)

    def _in_repository(self):
        """True only when the scanned root is itself the top of a git working tree."""
        if self.repository is None:
            try:
                done = self._git("rev-parse", "--show-toplevel")
                self.repository = (done.returncode == 0 and Path(os.fsdecode(done.stdout.rstrip(b"\n")))
                                   .resolve() == self.root.resolve())
            except OSError:
                self.repository = False
        return self.repository

    def blob(self, commit, path):
        """The raw bytes of the blob at commit:path, or None when there is no such blob."""
        try:
            if self.batch is None:
                self.batch = subprocess.Popen(["git", "-C", str(self.root), "cat-file", "--batch"],
                                              env=self.env, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                              stderr=subprocess.DEVNULL)
            self.batch.stdin.write((commit + ":" + path + "\n").encode())
            self.batch.stdin.flush()
            header = self.batch.stdout.readline().rstrip(b"\n").rsplit(b" ", 2)
            if len(header) != 3 or not header[2].isdigit():
                return None  # "<name> missing" or "<name> ambiguous"
            size = int(header[2])
            data = self.batch.stdout.read(size + 1)
        except OSError:
            return None
        return data[:size] if header[1] == b"blob" and len(data) == size + 1 else None

    def close(self):
        if self.batch is not None:
            try:
                self.batch.stdin.close()
            except OSError:
                pass
            self.batch.wait()
            self.batch.stdout.close()

    def run_commit(self, run):
        """(commit, None) when the run's working span_map.jsonl is byte-identical to its blob in the commit
        that last changed it, otherwise (None, refusal)."""
        if run not in self.runs:
            self.runs[run] = self._run_commit(run)
        return self.runs[run]

    def _run_commit(self, run):
        span_map = snapshot_span_map(run)
        if not self._in_repository():
            return None, "snapshot_history_unverifiable"
        try:
            done = self._git("-c", "log.showSignature=false", "-c", "log.follow=false",
                             "log", "-1", "--format=%H", "--", span_map)
        except OSError:
            return None, "snapshot_history_unverifiable"
        commit = done.stdout.decode("ascii", "replace").strip()
        if done.returncode or not re.fullmatch(r"[0-9a-f]{40}(?:[0-9a-f]{24})?", commit):
            return None, "snapshot_history_unverifiable"  # no commit carries the run: it is uncommitted
        committed = self.blob(commit, span_map)
        try:
            working = (self.root / span_map).read_bytes()
        except OSError:
            working = None
        if committed is None or working is None:
            return None, "snapshot_history_unverifiable"
        if working != committed:
            return None, "snapshot_history_span_map_edited"
        return commit, None

    def verify(self, run, value):
        """None when the span's bytes are the owner's bytes in the run's commit, else the refusal."""
        commit, refusal = self.run_commit(run)
        if refusal:
            return refusal
        key = (commit, value["source_path"])
        if key not in self.blobs:
            self.blobs[key] = self.blob(*key)
        owner = self.blobs[key]
        if owner is None:
            return "snapshot_history_unverifiable"
        start, end = value["byte_start"], value["byte_end"]
        if end > len(owner) or hashlib.sha256(owner[start:end]).hexdigest() != value["sha256"]:
            return "snapshot_history_text_changed"
        return None


def adjudicate_snapshot_copy(root, path, value, coverage, listed, history):
    """(kind, refusal, fresh check) for one mentioning snapshot line; kind is fresh, history or refused.

    Only a run current_run.json names is adjudicated (snapshot_run_unlisted otherwise). A fresh copy
    passes adjudicate_snapshot_line against the working tree. When that check fails only because the
    working-tree owner no longer carries the span's bytes, a span over a Markdown owner is a history
    copy if those bytes are the owner's bytes in the commit that last changed the run's span_map.jsonl,
    and that file is byte-identical to its blob there (SnapshotHistory). Every other failure of the
    fresh check stands: in particular a copy whose bytes are current but whose owner span is uncovered
    refuses, because the working tree's own coverage decides (c) and history is never consulted.

    (c) is not asked of a history copy. Its text is exact owner text of a recorded commit; the current
    owner text is scanned in this same pass with its own coverage and its own failures; and only lines
    that declare nothing reach adjudication at all, because a snapshot line that declares either field
    becomes an inventory row in inspect() and so its own unclassified schema node.
    """
    run = snapshot_run(path)
    if run not in listed:
        return "refused", "snapshot_run_unlisted", None
    fresh = adjudicate_snapshot_line(root, path, value, coverage)
    if fresh is None:
        return "fresh", None, None
    if (fresh not in ("snapshot_owner_text_changed", "snapshot_owner_range_missing")
            or Path(value["source_path"]).suffix.lower() not in (".md", ".mdx")):
        return "refused", fresh, None
    refusal = history.verify(run, value)
    return ("history", None, fresh) if refusal is None else ("refused", refusal, fresh)


def _unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("duplicate JSON key: " + key)
        result[key] = value
    return result


_BLOCKQUOTE_MARKERS = re.compile(r"^(?:[ \t]*>[ \t]?)*")
_LIST_MARKER = re.compile(r"^[ \t]*(?:[-*+]|\d{1,9}[.)])[ \t]+")


def _strip_blockquotes(line):
    """Remove every leading blockquote marker, including nested `> >`."""
    return line[_BLOCKQUOTE_MARKERS.match(line).end():]


def _supplementary_fences(text):
    """Over-inclusive backtick/tilde fence scan at any container depth.

    It finds fence-like spans CommonMark does not treat as fences (for example
    inside HTML blocks or details elements). It is never authoritative: its
    boundaries may be wrong, so _markdown_fences() discovers CommonMark spans
    independently and a supplementary span can never close or consume one.
    """
    opening, start, body = None, None, []
    for line_no, raw in enumerate(text.splitlines(keepends=True), 1):
        line = _strip_blockquotes(raw)
        if opening is None:
            candidate = line
            while _LIST_MARKER.match(candidate):
                candidate = _strip_blockquotes(_LIST_MARKER.sub("", candidate, count=1))
            match = re.match(r"^[ \t]*(`{3,}|~{3,})([^\n]*)", candidate)
            if match and (match.group(1)[0] == "~" or "`" not in match.group(2)):
                opening, start, body = match.group(1), line_no, []
        elif re.fullmatch(r"[ \t]*" + re.escape(opening[0]) +
                          "{" + str(len(opening)) + r",}[ \t]*\r?\n?", line):
            yield start, "".join(body)
            opening = None
        else:
            body.append(line)
    if opening is not None:
        yield start, "".join(body)


def _commonmark_fences(text):
    """Authoritative CommonMark fence spans (markdown-it-py, CommonMark preset).

    The parser handles container nesting, fence and container lifetimes and
    relative indentation, and returns the decoded body. It is a hard
    dependency (Debian/Ubuntu `python3-markdown-it`): without it completeness
    cannot be shown, so the scan records an error and the gate fails closed.
    """
    try:
        from markdown_it import MarkdownIt
    except ImportError as error:
        raise ValueError("markdown-it-py is required by the datetime inventory gate") from error
    for token in MarkdownIt("commonmark").parse(text):
        if token.type == "fence" and token.map:
            yield token.map[0] + 1, token.content


def _markdown_fences(text):
    """Every CommonMark fence, then each supplementary span CommonMark lacks.

    Opening lines are 1-based. Discovery is independent per source, and a
    supplementary span opening on a CommonMark fence line is dropped, so the
    authoritative body always wins.
    """
    authoritative = list(_commonmark_fences(text))
    starts = {line_no for line_no, _ in authoritative}
    yield from authoritative
    for line_no, body in _supplementary_fences(text):
        if line_no not in starts:
            yield line_no, body


_JSON_ESCAPE = re.compile(r'\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4})')
# A JSON container's first character, after any whitespace or byte order marks.
_JSON_SHAPED = re.compile(r'[\s\ufeff]*[\[{"]')
# Serialized strings decoded inside one container, at most (T164).
SERIALIZED_DEPTH = 8
EXCLUSIONS = "scripts/pm_event_datetime_exclusions.json"
INVENTORY_SCHEMA = "scripts/pm_event_datetime_inventory.schema.json"


def _json_layers(text):
    """The text, then each JSON-unescaped layer of it, to the fixed point (T163).

    Every JSON escape is decoded at every level, the short ones as well as
    \\u, so a name, a keyword or a container spelled only through escapes,
    however many times escaped, is seen. Each layer is shorter than the one
    before, so the list is finite.
    """
    layers, current = [text], text
    while True:
        decoded = _JSON_ESCAPE.sub(lambda m: json.loads('"' + m.group(0) + '"'), current)
        if decoded == current:
            return layers
        layers.append(decoded)
        current = decoded


def mentions_field(body):
    # Every escape layer, so names spelled only through escapes are seen too.
    return any(field in layer for layer in _json_layers(body) for field in FIELDS)


def schema_candidate(body):
    """Wildcard declarations can name these fields without spelling them."""
    return any(any(field in layer for field in FIELDS) or "patternProperties" in layer or "propertyNames" in layer
               for layer in _json_layers(body))


# Each declaring keyword and the JSON type it must have to be read (T164's class).
_DECLARING_TYPES = (("properties", dict), ("dependentRequired", dict), ("dependentSchemas", dict),
                    ("patternProperties", dict), ("propertyNames", (bool, dict)), ("required", list),
                    ("enum", list))


def declarations(node):
    """All supported ways a schema object declares either exact field name.

    This is declaration detection, never ownership inference. Invalid regexes
    fail closed rather than proving that their match set excludes a field, and
    so does a declaring keyword of another JSON type that names either field:
    it is never read as declaring nothing.
    """
    if not isinstance(node, dict):
        return ()
    for key, kind in _DECLARING_TYPES:
        if key in node and not isinstance(node[key], kind) and mentions_field(json.dumps(node[key])):
            raise ValueError("unreadable field declaration keyword: " + key)
    found = set()
    for key in ("properties", "dependentRequired", "dependentSchemas"):
        value = node.get(key, {})
        if isinstance(value, dict):
            found.update(FIELDS.intersection(value))
            if key == "dependentRequired":
                for names in value.values():
                    if isinstance(names, list):
                        found.update(f for f in names if isinstance(f, str) and f in FIELDS)
    for key in ("required", "enum"):
        value = node.get(key, [])
        if isinstance(value, list):
            found.update(f for f in value if isinstance(f, str) and f in FIELDS)
    if isinstance(node.get("const"), str) and node["const"] in FIELDS:
        found.add(node["const"])
    # Object-valued constants also declare fields, without a properties map.
    for value in [node.get("const"), *node.get("enum", [])]:
        if isinstance(value, (dict, list)):
            for _, constant in walk(value):
                found.update(FIELDS.intersection(constant))
    for pattern in node.get("patternProperties", {}):
        try:
            found.update(f for f in FIELDS if re.search(pattern, f))
        except (re.error, TypeError) as error:
            raise ValueError("unreadable field declaration regex") from error
    names = node.get("propertyNames")
    if names is True:
        found.update(FIELDS)
    if isinstance(names, dict):
        # A property-name constraint is relevant when it admits either name.
        # Its own nested const/enum declarations are independently inventoried.
        from jsonschema import Draft202012Validator
        try:
            # A ref needs its owning resolver; conservatively classify it here.
            # Runtime admission still resolves its ordinary constraints.
            if any("$ref" in n or "$dynamicRef" in n for _, n in walk(names)):
                found.update(FIELDS)
            else:
                found.update(f for f in FIELDS if Draft202012Validator(names).is_valid(f))
        except Exception as error:
            raise ValueError("unreadable propertyNames declaration") from error
    return tuple(sorted(found))


def decoded_documents(text):
    """JSON or JSONL, independent of suffix. Duplicate keys never disappear."""
    try:
        return [("json", json.loads(text, object_pairs_hook=_unique_object))]
    except ValueError:
        lines = [(i, line) for i, line in enumerate(text.splitlines(), 1) if line.strip()]
        if not lines:
            raise ValueError("empty JSON container")
        return [("jsonl:" + str(i), json.loads(line, object_pairs_hook=_unique_object))
                for i, line in lines]


def decode_text(data):
    # json.detect_encoding handles UTF-8/16/32, with or without a BOM.
    return data.decode(json.detect_encoding(data)).lstrip("\ufeff")


def _markdown_blocks(text):
    from markdown_it import MarkdownIt
    tokens = MarkdownIt("commonmark").parse(text)
    for token in tokens:
        if token.map and token.type in ("fence", "code_block", "html_block"):
            yield token.type.replace("_block", "") + ":" + str(token.map[0] + 1), token.content
        # Inline code is a code container; surrounding Markdown prose is not.
        if token.type == "inline":
            for i, child in enumerate(token.children or []):
                if child.type in ("code_inline", "html_inline") and any(
                        "{" in layer for layer in _json_layers(child.content)):
                    yield child.type + ":" + str(token.map[0] + 1) + ":" + str(i), child.content
    authoritative = {t.map[0] + 1 for t in tokens if t.type == "fence" and t.map}
    for line, body in _supplementary_fences(text):
        if line not in authoritative:
            yield "supplementary:" + str(line), body


def _files(plans):
    """Every regular file, any suffix/case; follow file and directory symlinks.

    Cycles and unreadable entries are failures, never silently pruned.
    """
    def visit(directory, ancestors):
        resolved = directory.resolve(strict=True)
        if resolved in ancestors:
            raise ValueError("symlink directory cycle: " + str(directory))
        for entry in sorted(directory.iterdir()):
            if entry.is_dir():
                yield from visit(entry, ancestors | {resolved})
            elif entry.is_file():
                yield entry
            elif entry.is_symlink():
                raise ValueError("unreadable symlink: " + str(entry))
    yield from visit(plans, set())


def _exclusion_schema_paths(root, files):
    """An exclusion cannot hide a schema root or a referenced resource.

    Read references independently of timestamp candidate detection: even a
    timestamp-free schema can make another file a loadable resource.
    """
    from urllib.parse import urljoin, urldefrag, urlsplit, unquote
    import posixpath
    loadable, identities, references = set(), {}, []
    for file in files:
        path = file.relative_to(root).as_posix()
        data = file.read_bytes()
        if not any(token in data for token in (b"$schema", b"$id", b"$ref", b"$dynamicRef",
                                               b"$recursiveRef", b"\\u", b"\x00")):
            continue
        text = decode_text(data)
        try:
            documents = decoded_documents(text)
        except ValueError:
            if file.suffix.lower() not in (".md", ".mdx"):
                continue
            documents = []
            for _, body in _markdown_blocks(text):
                try:
                    documents.extend(decoded_documents(body))
                except ValueError:
                    continue
        for _, document in documents:
            if isinstance(document, dict) and ("$schema" in document or "$id" in document):
                loadable.add(path)
            def visit(value, base):
                if isinstance(value, dict):
                    if isinstance(value.get("$id"), str):
                        base = urljoin(base, value["$id"])
                        identities.setdefault(urldefrag(base)[0], set()).add(path)
                    for key in ("$ref", "$dynamicRef", "$recursiveRef"):
                        if isinstance(value.get(key), str):
                            references.append((path, urldefrag(urljoin(base, value[key]))[0]))
                            references.append((path, urldefrag(urljoin(
                                "https://pm-inventory.invalid/" + path, value[key]))[0]))
                    for child in value.values():
                        visit(child, base)
                elif isinstance(value, list):
                    for child in value:
                        visit(child, base)
            visit(document, "https://pm-inventory.invalid/" + path)
    for source, uri in references:
        loadable.update(p for p in identities.get(uri, ()) if p != source)
        parsed = urlsplit(uri)
        target = posixpath.normpath(unquote(parsed.path)).lstrip("/")
        if target.startswith("Plans/") and target != source:
            loadable.add(target)
    return loadable


def scan(root=ROOT, report=None):
    """Bounded universe: all Plans files; JSON/JSONL in UTF-8/16/32,
    Markdown/MDX CommonMark fences, indented code, HTML and inline code,
    plus recursively serialized JSON objects, arrays and strings, up to
    SERIALIZED_DEPTH strings deep. Markdown prose is out of scope.
    Any mentioning container that cannot yield declarations needs a committed,
    content-pinned exclusion with reason and citation. No suffix skip exists.
    Decoding is total (T163, T164): a candidate string or key that is JSON is
    inspected; one that is JSON-shaped but unreadable, that is JSON only once
    unescaped, that is a key, or that lies past the depth bound refuses with a
    named code. A candidate is skipped only when no layer of it is JSON-shaped.
    A mentioning line of a migration snapshot run carries no pinned exclusion:
    the run is regenerated and pruned at every Plans landing, so the line is
    accepted only by adjudicate_snapshot_copy, as a fresh copy of a span the gate
    has itself covered in the live owner document or as a history copy of the
    owner's bytes in the commit that last changed the run's span map. A dict
    passed as report receives the fresh/history/refused counts per run.
    """
    root = Path(root)
    rows, errors, used = [], [], set()
    # Mentioning lines of migration snapshot runs, adjudicated after every file is
    # scanned (owner documents sort after .plan_migration, so their container
    # coverage is complete only at the end), and the line-mapped container
    # coverage of every Markdown document the scan has looked at.
    snapshot_lines, md_coverage = [], {}
    try:
        files = list(_files(root / "Plans"))
        exclusions = json.loads((root / EXCLUSIONS).read_text())
        excluded = {(r["path"], r["origin"]): r for r in exclusions}
        if len(excluded) != len(exclusions):
            raise ValueError("duplicate scan exclusion")
        schema_paths = _exclusion_schema_paths(root, files)
        for r in exclusions:
            if not all(isinstance(r.get(k), str) and r[k].strip() for k in
                       ("path", "origin", "sha256", "reason", "citation")):
                raise ValueError("invalid scan exclusion")
            if r["path"] in schema_paths:
                raise ValueError("loadable_schema_exclusion_forbidden: " + r["path"])
            if not re.search(r"data|lineage|non-JSON code|example", r["reason"], re.I):
                raise ValueError("exclusion_non_runtime_purpose_missing: " + r["path"])
            citations = [part.strip().split("#", 1)[0] for part in r["citation"].split(";")]
            if any(citation == "Plans/.plan_migration" or citation.startswith("Plans/.plan_migration/")
                   for citation in citations):
                raise ValueError("exclusion_purpose_citation_ephemeral: " + r["path"])
            if snapshot_run(r["path"]):
                # A pinned exclusion on a snapshot line would bypass adjudicate_snapshot_line and, since
                # inspect() returns early on a pinned container, could hide a declaration there.
                raise ValueError("exclusion_path_ephemeral: " + r["path"])
            if not citations or any(not (root / citation).is_file() for citation in citations):
                raise ValueError("exclusion_purpose_citation_unreadable: " + r["path"])
            if r["path"] == INVENTORY:
                inventory = json.loads((root / INVENTORY).read_text())
                if r["origin"] != "json" or r["sha256"] != derived_inventory_pin(inventory, root):
                    raise ValueError("inventory_derived_source_pin_changed")
    except (OSError, ValueError, KeyError, TypeError, RecursionError, ImportError) as error:
        return [], [{"error": "scan_exclusions_invalid", "detail": str(error)}]

    def unsupported(path, origin, body, reason):
        key = (path, origin)
        pin = hashlib.sha256(body.encode()).hexdigest()
        row = excluded.get(key)
        if row and row["sha256"] == pin:
            used.add(key)
        else:
            errors.append({"path": path, "origin": origin, "error": reason, "sha256": pin})

    def inspect(value, path, origin, depth=0):
        key = (path, origin)
        pin = hashlib.sha256(json.dumps(value).encode()).hexdigest()
        if key in excluded and excluded[key]["sha256"] == pin:
            used.add(key)
            return 0
        count = 0
        for pointer, node in walk(value):
            fields = declarations(node)
            if not fields:
                continue
            resource_pointer = nested_resource_pointer(path, pointer)
            resource = at(value, resource_pointer)
            rows.append({"path": path, "origin": origin, "pointer": pointer,
                         "fields": list(fields), "resource_pointer": resource_pointer,
                         "resource_id": resource.get("$id") if isinstance(resource, dict) else None,
                         "resource_sha256": digest(resource), "node_sha256": digest(node)})
            count += 1
        # Serialized strings have their own resource/pointer address space.
        def serialized(obj, here):
            try:
                decoded = json.loads(obj, object_pairs_hook=_unique_object)
            except ValueError:
                if _JSON_SHAPED.match(obj):
                    unsupported(path, here, obj, "unreadable_schema_string_container")
                elif any(_JSON_SHAPED.match(layer) for layer in _json_layers(obj)[1:]):
                    # JSON with its quotes stripped: no pointer reaches it.
                    unsupported(path, here, obj, "escaped_schema_string_container")
                return
            if isinstance(decoded, (dict, list, str)):
                if depth >= SERIALIZED_DEPTH:
                    unsupported(path, here, obj, "serialized_depth_exceeded")
                    return
                inspect(decoded, path, here, depth + 1)

        def strings(obj, pointer=""):
            if isinstance(obj, str):
                if schema_candidate(obj):
                    serialized(obj, origin + ":string:" + pointer)
            elif isinstance(obj, dict):
                for key, child in obj.items():
                    child_pointer = pointer + "/" + str(key).replace("~", "~0").replace("/", "~1")
                    # A key has no pointer of its own to address a container.
                    if schema_candidate(key) and any(_JSON_SHAPED.match(layer) for layer in _json_layers(key)):
                        unsupported(path, origin + ":key:" + child_pointer, key, "serialized_key_container")
                    strings(child, child_pointer)
            elif isinstance(obj, list):
                for i, child in enumerate(obj):
                    strings(child, pointer + "/" + str(i))
        strings(value)
        return count

    def cover(path, origin, body, state):
        try:
            line_no = int(origin.split(":")[1])
        except (IndexError, ValueError):
            line_no = 0
        md_coverage.setdefault(path, []).append((line_no, line_no + body.count("\n") + 1, state))

    def container(path, origin, body):
        if not schema_candidate(body):
            return
        try:
            documents = decoded_documents(body)
        except ValueError:
            if schema_candidate(body):
                unsupported(path, origin, body, "unreadable_mentioning_container")
            # An unreadable container is covered only by its pinned exclusion; otherwise the owner
            # failure above was recorded and the container is uncovered for (c) as well.
            cover(path, origin, body, "used" if (path, origin) in used else "uncovered")
            return
        before = len(rows)
        for label, value in documents:
            inspect(value, path, origin if label == "json" else origin + ":" + label)
        if len(rows) == before and (path, origin) not in used and mentions_field(body):
            if snapshot_run(path):
                snapshot_lines.extend(
                    (path, origin + ("" if label == "json" else ":" + label), value)
                    for label, value in documents if mentions_field(json.dumps(value)))
            else:
                unsupported(path, origin, body, "unclassified_mentioning_container")
        # unsupported() consults the committed exclusions itself, so the coverage
        # state is read only after it has run.
        cover(path, origin, body, "rows" if len(rows) > before else
              "used" if (path, origin) in used else
              "uncovered" if mentions_field(body) and len(rows) == before else "clean")

    try:
        for file in files:
            path = file.relative_to(root).as_posix()
            try:
                data = file.read_bytes()
                # A literal fast path is insufficient for escaped or wide UTF.
                if not (any(f.encode() in data for f in FIELDS) or b"\\u" in data or b"\x00" in data or
                        b"patternProperties" in data or b"propertyNames" in data):
                    continue
                text = decode_text(data)
                if not schema_candidate(text):
                    continue
                file_key = (path, "file")
                if file_key in excluded and excluded[file_key]["sha256"] == hashlib.sha256(text.encode()).hexdigest():
                    used.add(file_key)
                    continue
                try:
                    documents = decoded_documents(text)
                except ValueError:
                    if file.suffix.lower() in (".md", ".mdx"):
                        for origin, body in _markdown_blocks(text):
                            container(path, origin, body)
                    elif schema_candidate(text):
                        unsupported(path, "file", text, "unreadable_mentioning_container")
                else:
                    for origin, value in documents:
                        before = len(rows)
                        inspect(value, path, origin)
                        if (len(rows) == before and (path, origin) not in used and path not in schema_paths
                                and mentions_field(json.dumps(value))):
                            if snapshot_run(path):
                                snapshot_lines.append((path, origin, value))
                            else:
                                unsupported(path, origin, json.dumps(value), "unclassified_mentioning_container")
            except (ValueError, OSError, RecursionError, ImportError) as error:
                errors.append({"path": path, "error": "scan_read_failed", "detail": str(error)})
    except (ValueError, OSError) as error:
        errors.append({"error": "scan_walk_failed", "detail": str(error)})
    listed, history, copies = None, None, {}
    try:
        for path, origin, value in snapshot_lines:
            if history is None:
                listed, history = listed_snapshot_runs(root), SnapshotHistory(root)
            kind, refusal, fresh = adjudicate_snapshot_copy(root, path, value, md_coverage, listed, history)
            copies.setdefault(snapshot_run(path), {"fresh": 0, "history": 0, "refused": 0})[kind] += 1
            if refusal:
                errors.append({"path": path, "origin": origin, "error": refusal,
                               **({"fresh_check": fresh} if fresh else {})})
    finally:
        if history is not None:
            history.close()
    if report is not None:
        report["snapshot_copies"] = {run: copies[run] for run in sorted(copies)}
    for key in excluded.keys() - used:
        errors.append({"error": "stale_scan_exclusion", "path": key[0], "origin": key[1]})
    return rows, errors


def _source_document(root, row, cache):
    path = row["path"]
    if path not in cache:
        text = decode_text((root / path).read_bytes())
        try:
            cache[path] = dict(decoded_documents(text))
        except ValueError:
            cache[path] = {origin: json.loads(body, object_pairs_hook=_unique_object)
                           for origin, body in _markdown_blocks(text) if schema_candidate(body)}
    origin, *strings = row["origin"].split(":string:")
    value = cache[path][origin]
    for pointer in strings:
        value = json.loads(at(value, pointer), object_pairs_hook=_unique_object)
    return value


def _pointer_child(pointer, key):
    return pointer + "/" + key.replace("~", "~0").replace("/", "~1")


def embedded_resources(document):
    """$id -> JSON pointer of each resource embedded in one scanned document under an $id that no other resource
    of the same document also claims (JSON Schema 2020-12 Core 8.2.1, 8.2.3.1). Nothing outside the document is
    consulted. An $id two resources claim is left out, so a reference to it resolves to nothing and stays refused
    (fail closed; TOOL-ISSUES T228)."""
    unique, duplicated = {}, set()
    for pointer, node in walk(document):
        uri = node.get("$id")
        if isinstance(uri, str):
            if uri in unique:
                duplicated.add(uri)
            unique.setdefault(uri, pointer)
    return {uri: pointer for uri, pointer in unique.items() if uri not in duplicated}


def _constraint_sources(root, row, document, pointer, cache, seen=None):
    """Exact value constraints, following only offline schema refs/combinators.

    Object properties and array items describe nested values, not the map
    value itself. Do not mistake a tab record's timestamp member for a map
    whose values are timestamp strings. Cyclic setting-value refs terminate.
    """
    from urllib.parse import urldefrag, unquote, urljoin, urlsplit
    seen = set() if seen is None else seen
    key = (row["path"], row["origin"], pointer)
    if key in seen:
        return
    seen.add(key)
    value = at(document, pointer)
    yield {"path": row["path"], "pointer": pointer, "value": value}
    if not isinstance(value, dict):
        return
    for keyword in ("$ref", "$dynamicRef", "$recursiveRef"):
        if keyword not in value:
            continue
        uri, fragment = urldefrag(value[keyword])
        if uri and uri != at(document, row["resource_pointer"]).get("$id"):
            # A reference may name a resource embedded in this same scanned file by its $id, resolved
            # against the current resource's base URI (JSON Schema 2020-12 Core 8.2.1, 8.2.3.1).
            embedded = embedded_resources(document).get(urljoin(at(document, row["resource_pointer"]).get("$id") or "", uri))
            path = row["path"] if embedded is not None else unquote(urlsplit(uri).path).lstrip("/")
            if not path.startswith("Plans/") or ".." in path.split("/"):
                raise ValueError("owner evidence reference is not an offline Plans resource")
            target = (dict(row, resource_pointer=embedded) if embedded is not None else
                      {"path": path, "origin": "json", "resource_pointer": ""})
            target_document = document if embedded is not None else _source_document(root, target, cache)
        else:
            target, target_document = row, document
        if fragment and not fragment.startswith("/"):
            raise ValueError("owner evidence requires a JSON-pointer reference")
        target_pointer = target["resource_pointer"] + unquote(fragment)
        yield from _constraint_sources(root, target, target_document, target_pointer, cache, seen)
    for keyword in ("allOf", "anyOf", "oneOf"):
        for index, _ in enumerate(value.get(keyword, [])):
            yield from _constraint_sources(root, row, document,
                pointer + "/" + keyword + "/" + str(index), cache, seen)
    for keyword in ("not", "if", "then", "else"):
        if keyword in value:
            yield from _constraint_sources(root, row, document,
                pointer + "/" + keyword, cache, seen)


def source_owner_evidence(row, document, root=ROOT, cache=None):
    """Recompute field/value pointers and exact constraints from this source.

    Named observations retain their actual schema, including unformatted
    string fields: evidence adds no timestamp predicate. Wildcards carry no
    timestamp profile. Battery acceptance triggers explicit source-bound role
    review; it never infers a role from the spelling of a regular expression.
    """
    cache = {} if cache is None else cache
    node = at(document, row["pointer"])
    fields = declarations(node)
    named = set(fields).intersection(node.get("properties", {}))
    citations = []
    if named:
        if named != set(fields):
            raise ValueError("mixed named/wildcard owner evidence needs classification")
        for field in fields:
            pointer = row["pointer"] + "/properties/" + field
            citations.extend(_constraint_sources(root, row, document, pointer, cache))
        classification = ("source_lineage_schema_patch" if
                          row["classification"] == "source_lineage_schema_patch" else
                          "other_owner_observation")
    else:
        if not ("propertyNames" in node or "patternProperties" in node):
            raise ValueError("non-named declaration is not a wildcard value map")
        from pm_event_datetime_value_probe import wildcard_probe, reviewed_role
        evidence, citations = wildcard_probe(row, document, root, cache)
        role, role_errors = reviewed_role(row, evidence, citations, root, cache)
        classification = (role.get("classification", "wildcard_non_timestamp_role") if role is not None else
                          "wildcard_review_required" if (not evidence["singleton_probes_complete"] or
                                                         "wildcard_role_review_required" in role_errors) else
                          "wildcard_non_timestamp" if evidence["all_refused"] else
                          "other_owner_observation")
    # Shared ref targets can occur in both fields; keep deterministic evidence.
    return classification, list({(c["path"], c["pointer"]): c for c in citations}.values())


def source_inventory_projection(inventory, root=ROOT):
    """Rebuild source-derived assertions before hashing the inventory pin.

    Storage owner citations remain reviewed CV-253/CV-1101 authority. Other
    rows derive their evidence and classification solely from their own source.
    The exclusion checksum cannot authenticate a changed inventory assertion.
    """
    import copy
    projected, cache = copy.deepcopy(inventory), {}
    for row in projected["nodes"]:
        document = _source_document(root, row, cache)
        resource, node = at(document, row["resource_pointer"]), at(document, row["pointer"])
        row.update(fields=list(declarations(node)), resource_id=resource.get("$id"),
                   resource_sha256=digest(resource), node_sha256=digest(node),
                   role_evidence={"resource_title": resource.get("title"),
                                  "schema_identity": node.get("properties", {}).get("schema_id"),
                                  "required": node.get("required", [])})
        if row["profile"] != "storage_utc_z":
            row["classification"], row["citation"] = source_owner_evidence(row, document, root, cache)
            row.pop("owner_profile", None)
            if not set(declarations(node)).intersection(node.get("properties", {})):
                from pm_event_datetime_value_probe import wildcard_probe, reviewed_role
                evidence, sources = wildcard_probe(row, document, root, cache)
                role, _ = reviewed_role(row, evidence, sources, root, cache)
                row["value_evidence"] = {**evidence, "reviewed_role": role}
            else:
                row.pop("value_evidence", None)
    return projected


def derived_inventory_pin(inventory, root=ROOT):
    return hashlib.sha256(json.dumps(source_inventory_projection(inventory, root)).encode()).hexdigest()


def validate_inventory(inventory, root=ROOT):
    """Validate schema, structural assertions and owner evidence before use."""
    from jsonschema import Draft202012Validator
    root = Path(root)
    schema = json.loads((root / INVENTORY_SCHEMA).read_text())
    errors = [{"error": "inventory_schema", "pointer": list(e.absolute_path), "detail": e.message}
              for e in Draft202012Validator(schema).iter_errors(inventory)]
    if errors:
        return errors
    documents, texts, profiles = {}, {}, {}
    keys = set()
    for row in inventory["nodes"]:
        key = node_key(row)
        def fail(reason, **detail):
            errors.append({"error": reason, "node": list(key), **detail})
        if key in keys:
            fail("duplicate_inventory_node")
        keys.add(key)
        storage = row["classification"] in ("EventRecord", "event_record_index",
                    "original_storage_fields", "Storage issued original fields")
        if storage != (row["profile"] == "storage_utc_z") or (
                "CV-253" in row["owner"] and row["profile"] != "storage_utc_z"):
            fail("classification_profile_conflict")
        if storage and "CV-253" not in row["owner"]:
            fail("storage_owner_missing")
        if not row["owner"].strip():
            fail("owner_empty")
        quote_names_profile = False
        for citation in row["citation"]:
            try:
                source = root / citation["path"]
                if "pointer" in citation:
                    if citation["path"] not in documents:
                        documents[citation["path"]] = dict(decoded_documents(decode_text(source.read_bytes())))
                    valid = at(documents[citation["path"]]["json"], citation["pointer"]) == citation["value"]
                else:
                    if citation["path"] not in texts:
                        texts[citation["path"]] = decode_text(source.read_bytes())
                    quote = citation["quote"]
                    valid = len(quote.split()) >= 2 and quote in texts[citation["path"]]
                    quote_names_profile |= valid and "storage_utc_z" in quote and "CV-253" in quote
                if not valid:
                    fail("classification_citation_changed", citation=citation)
            except (OSError, ValueError, KeyError, IndexError, TypeError):
                fail("classification_citation_unreadable", citation=citation)
        if storage and not quote_names_profile:
            fail("owner_profile_quote_missing")
        try:
            document = _source_document(root, row, documents)
            resource = at(document, row["resource_pointer"])
            node = at(document, row["pointer"])
            if not storage:
                classification, citations = source_owner_evidence(row, document, root, documents)
                if row["classification"] != classification:
                    fail("source_value_classification_conflict")
                if row["citation"] != citations:
                    fail("owner_field_schema_evidence_changed")
                if not set(declarations(node)).intersection(node.get("properties", {})):
                    from pm_event_datetime_value_probe import wildcard_probe, reviewed_role
                    value_evidence, value_sources = wildcard_probe(row, document, root, documents)
                    role, role_errors = reviewed_role(row, value_evidence, value_sources, root, documents)
                    if row.get("value_evidence") != {**value_evidence, "reviewed_role": role}:
                        fail("wildcard_value_evidence_changed")
                    for role_error in role_errors:
                        fail(role_error)
                elif "value_evidence" in row:
                    fail("unexpected_wildcard_value_evidence")
            if row["classification"] == "source_lineage_schema_patch":
                match = re.fullmatch(r"/documents/([0-9]+)/changes/[0-9]+/(?:before|after)", row["pointer"])
                if match is None or "documents" not in document or resource.get("$id"):
                    fail("source_lineage_role_invalid")
            evidence = {"resource_title": resource.get("title"),
                        "schema_identity": node.get("properties", {}).get("schema_id"),
                        "required": node.get("required", [])}
            if evidence != row["role_evidence"]:
                fail("role_evidence_changed")
            if not storage and row["classification"] != "source_lineage_schema_patch":
                owners = (resource.get("title"), resource.get("$id"), node.get("title"),
                          row["path"], (evidence["schema_identity"] or {}).get("const"))
                if row["owner"] not in owners:
                    fail("source_owner_changed")
            required = set(evidence["required"])
            identity = (evidence["schema_identity"] or {}).get("const")
            source_storage = (
                identity in ("pm.event.v0", "pm.storage_value.event_record_index.v2") or
                {"event_type", "payload_schema_id", "replay_policy"}.issubset(required) or
                {"source_schema_id", "producer_semantic_digest", "publication_locator"}.issubset(required) or
                "original_storage_fields" in row["pointer"].split("/") or
                {"first_append_receipt", "original_event_value_commitment"}.issubset(required))
            if source_storage != storage:
                fail("source_role_classification_conflict")
            if not (row["pointer"] == row["resource_pointer"] or
                    row["pointer"].startswith(row["resource_pointer"] + "/")):
                fail("node_outside_resource")
            facts = {"fields": list(declarations(node)), "resource_id": resource.get("$id"),
                     "resource_sha256": digest(resource), "node_sha256": digest(node)}
            for field, value in facts.items():
                if row[field] != value:
                    fail("inventory_node_changed", field=field)
            for field in row["fields"]:
                selector = (row["resource_sha256"], row["pointer"][len(row["resource_pointer"]):], field)
                if selector in profiles and profiles[selector] != row["profile"]:
                    fail("conflicting_resource_field_profile")
                profiles[selector] = row["profile"]
        except (OSError, ValueError, KeyError, IndexError, TypeError) as error:
            fail("inventory_source_unreadable", detail=str(error))
    return errors


def check_inventory(root=ROOT):
    """Missing, stale, changed, duplicate or unclassified entries all fail."""
    root = Path(root)
    try:
        inventory = json.loads((root / INVENTORY).read_text())
        errors = validate_inventory(inventory, root)
        expected = inventory.get("nodes", [])
        if errors:
            return {"status": "fail", "nodes": len(expected), "unclassified_nodes": 0,
                    "storage_nodes": 0, "other_owner_nodes": 0, "failures": errors}
        documents = {}
        expected = [bind_nested_resource(row, _source_document(root, row, documents)) for row in expected]
    except (OSError, ValueError, TypeError, KeyError, DatetimeAdmissionError) as error:
        return {"status": "fail", "nodes": 0, "unclassified_nodes": 0,
                "storage_nodes": 0, "other_owner_nodes": 0,
                "failures": [{"error": "inventory_unreadable", "detail": str(error)}]}
    report = {}
    actual, scan_errors = scan(root, report)
    errors.extend(scan_errors)
    actual_by_key = {node_key(row): row for row in actual}
    expected_by_key = {node_key(row): row for row in expected}
    for key in sorted(actual_by_key.keys() - expected_by_key.keys()):
        errors.append({"error": "unclassified_schema_node", "node": actual_by_key[key]})
    for key in sorted(expected_by_key.keys() - actual_by_key.keys()):
        errors.append({"error": "inventory_node_missing", "node": list(key)})
    for key in sorted(actual_by_key.keys() & expected_by_key.keys()):
        for name, value in actual_by_key[key].items():
            if expected_by_key[key].get(name) != value:
                errors.append({"error": "inventory_node_changed", "node": list(key), "field": name})
    counts = Counter(row.get("profile", "unclassified") for row in expected)
    wildcard_count = sum(row["classification"] == "wildcard_non_timestamp" for row in expected)
    role_count = sum(row["classification"] == "wildcard_non_timestamp_role" for row in expected)
    return {"status": "fail" if errors else "pass", "nodes": len(actual),
            "storage_nodes": counts["storage_utc_z"],
            "other_owner_nodes": counts["owner_schema"] - wildcard_count - role_count,
            "wildcard_non_timestamp_nodes": wildcard_count,
            "wildcard_non_timestamp_role_nodes": role_count,
            "unclassified_nodes": len(actual_by_key.keys() - expected_by_key.keys()),
            "snapshot_copies": report.get("snapshot_copies", {}), "failures": errors}


from pm_event_numbers import Refusal


class DatetimeAdmissionError(Refusal):
    """Typed refusal: no schema fragment may weaken an unclassified owner."""


def bind_nested_resource(row, document):
    """Project a verified container pin onto its exact frozen schema.

    Existing inventories pin the DCH container as a whole. Authenticate that
    original pin and node before deriving a narrower resource fingerprint;
    retain the original inventory and every frozen byte unchanged. An already
    nested row must name this node's own recipe, including identical siblings.
    """
    pointer = nested_resource_pointer(row["path"], row["pointer"])
    if row["path"] != "Plans/dch_retained_recipes.json" or not pointer:
        return row
    if row["resource_pointer"] not in ("", pointer):
        raise DatetimeAdmissionError("datetime_resource_pointer_mismatch")
    resource = at(document, row["resource_pointer"])
    node = at(document, row["pointer"])
    if (digest(resource) != row["resource_sha256"] or digest(node) != row["node_sha256"] or
            resource.get("$id") != row["resource_id"]):
        raise DatetimeAdmissionError("datetime_resource_binding_changed")
    nested = at(document, pointer)
    return dict(row, resource_pointer=pointer, resource_id=nested.get("$id"), resource_sha256=digest(nested))


@lru_cache(maxsize=1)
def resource_selections():
    """Exact resource digest -> ALL classified paths, after integrity checks."""
    inventory = json.loads((ROOT / INVENTORY).read_text())
    errors = validate_inventory(inventory)
    if errors:
        raise DatetimeAdmissionError("datetime_inventory_invalid: " + json.dumps(errors[:3]))
    selections = {}
    documents = {}
    for row in inventory["nodes"]:
        if row["classification"] == "source_lineage_schema_patch":
            continue
        row = bind_nested_resource(row, _source_document(ROOT, row, documents))
        relative_pointer = row["pointer"][len(row["resource_pointer"]):]
        selections.setdefault(row["resource_sha256"], {})[relative_pointer] = row
    return selections


class StorageSelection:
    """Bind complete resources before evaluating fragments; keep strong refs.

    Inventory fingerprints authenticate schema content, not native custody.
    Unclassified declarations refuse independently at every evaluation hook.
    """
    def __init__(self):
        self.selections = resource_selections()
        self.nodes = {}
        self.visited = {}
        self.resources = {}
        self.uri_pins = {}
        self.known_uris = {}
        for by_pointer in self.selections.values():
            for row in by_pointer.values():
                if row["resource_id"]:
                    self.known_uris.setdefault(row["resource_id"].rstrip("#"), set()).add(row["resource_sha256"])

    def pin(self, uri, schema):
        fingerprint = digest(schema)
        uri = uri.rstrip("#")
        if uri in self.known_uris and fingerprint not in self.known_uris[uri]:
            raise DatetimeAdmissionError("datetime_resource_fingerprint_unclassified: " + uri)
        if uri in self.uri_pins and fingerprint != self.uri_pins[uri]:
            raise DatetimeAdmissionError("datetime_resource_uri_conflict: " + uri)
        self.uri_pins[uri] = fingerprint
        self.resources[id(schema)] = (schema, fingerprint)

    def verify_resources(self):
        # Check complete resources, including a classified target replaced by
        # a fresh empty object which no longer declares either field.
        for schema, fingerprint in self.resources.values():
            if digest(schema) != fingerprint:
                raise DatetimeAdmissionError("datetime_schema_changed_after_admission")

    def install(self, schema, *, resource_root=True):
        if not isinstance(schema, dict):
            return
        # A dictionary previously seen inside a wrapper may later be loaded
        # as its own complete (possibly anonymous) resource.
        if resource_root or "$id" in schema or "$schema" in schema:
            self.resources[id(schema)] = (schema, digest(schema))
            if "$id" in schema:
                self.pin(schema["$id"], schema)
            for pointer, row in self.selections.get(digest(schema), {}).items():
                node = at(schema, pointer)
                self.nodes[id(node)] = (node, row)
        if id(schema) in self.visited:
            return
        self.visited[id(schema)] = schema
        for child in schema.values():
            if isinstance(child, dict):
                self.install(child, resource_root=False)
            elif isinstance(child, list):
                for item in child:
                    self.install(item, resource_root=False)

    def admit(self, schema):
        if not isinstance(schema, dict):
            return ()
        match = self.nodes.get(id(schema))
        if match is not None and match[0] is schema and digest(schema) != match[1]["node_sha256"]:
            raise DatetimeAdmissionError("datetime_schema_changed_after_admission")
        fields = declarations(schema)
        if not fields:
            return ()
        if match is None or match[0] is not schema or tuple(match[1]["fields"]) != fields:
            raise DatetimeAdmissionError("datetime_schema_unclassified")
        return fields if match[1]["profile"] == "storage_utc_z" else ()

    def fields(self, schema):
        return self.admit(schema)

    def classified(self, schema):
        """(Storage fields, CV-1101 source fields) of one admitted fragment, by its node's classification.

        Fix round 18: the source fields are keyed by the inventory
        classification, never by a format annotation of the original.
        """
        storage = self.admit(schema)
        if not storage:
            return (), ()
        return storage, SOURCE_FIELDS.get(self.nodes[id(schema)][1].get("classification"), ())


def embedded_reference_self_test():
    """Standing cases for same-file $id references in owner evidence (_constraint_sources, embedded_resources).

    Admitted: a $ref to the one resource of the same scanned file that claims that $id, absolute or relative
    to the current resource's base. Refused exactly as before: an $id nothing in the file claims, a network or
    other non-Plans URI, an $id two resources of the file claim (T228), a path that leaves the file for a
    non-Plans location. A reference to another offline Plans file still resolves as before.
    """
    base = "https://pm-selftest.invalid/"
    refused = "owner evidence reference is not an offline Plans resource"

    def bank(ids):
        return {"bank" + str(index): {"$id": uri, "$defs": {"t": {"type": "string", "format": "date-time"}}}
                for index, uri in enumerate(ids)}

    def run(name, ref, ids, expected, node_id=None):
        node = {"type": "object", "properties": {"at": {"$ref": ref}}}
        if node_id:
            node["$id"] = node_id
        document = dict(bank(ids), node=node)
        row = {"path": "Plans/self-test.json", "origin": "json", "resource_pointer": "/node" if node_id else ""}
        try:
            pointers = [c["pointer"] for c in _constraint_sources(ROOT, row, document, "/node/properties/at", {})]
            observed = "resolved:" + pointers[1]  # the reference's first target
        except ValueError as refusal:
            observed = "refused:" + str(refusal)
        return {"case": name, "expected": expected, "observed": observed, "ok": observed == expected}

    def run_wildcard(name, ids, expected, ref=base + "a.json#/$defs/t", inside=None):
        # The wildcard value probe resolves the map's value $ref through the same same-file rule; a node
        # inside an embedded resource takes that resource's $id as its base.
        from pm_event_datetime_value_probe import wildcard_probe
        node = {"type": "object", "propertyNames": {"pattern": "^[a-z]+$"}, "additionalProperties": {"$ref": ref}}
        document = dict(bank(ids), node=node)
        pointer = "/node"
        if inside:
            document[inside]["$defs"]["map"] = node
            pointer = "/" + inside + "/$defs/map"
        row = {"path": "Plans/self-test.json", "origin": "json", "pointer": pointer, "resource_pointer": "",
               "fields": list(declarations(node))}
        try:
            _, citations = wildcard_probe(row, document, ROOT, {})
            cited = {c["pointer"] for c in citations}
            observed = ("resolved:/bank0/$defs/t" if "/bank0/$defs/t" in cited else
                        "unresolved:" + ",".join(sorted(cited)))
        except Exception as refusal:  # referencing raises Unresolvable for a reference it cannot resolve
            observed = "refused:" + type(refusal).__name__
        return {"case": name, "expected": expected, "observed": observed, "ok": observed == expected}

    return [
        run_wildcard("wildcard_embedded_id", [base + "a.json"], "resolved:/bank0/$defs/t"),
        run_wildcard("wildcard_duplicate_id_refused", [base + "a.json", base + "a.json"], "refused:Unresolvable"),
        run_wildcard("wildcard_unmatched_id_refused", [base + "b.json"], "refused:Unresolvable"),
        run_wildcard("wildcard_relative_ref_inside_embedded_resource", [base + "a.json"], "resolved:/bank0/$defs/t",
                     ref="#/$defs/t", inside="bank0"),
        run("embedded_absolute_id", base + "a.json#/$defs/t", [base + "a.json"], "resolved:/bank0/$defs/t"),
        run("embedded_relative_to_base", "a.json#/$defs/t", [base + "a.json"], "resolved:/bank0/$defs/t",
            node_id=base + "node.json"),
        run("unmatched_id_refused", base + "missing.json#/$defs/t", [base + "a.json"], "refused:" + refused),
        run("network_uri_refused", "https://elsewhere.invalid/a.json#/$defs/t", [base + "a.json"], "refused:" + refused),
        run("duplicate_id_refused", base + "a.json#/$defs/t", [base + "a.json", base + "a.json"], "refused:" + refused),
        run("leaves_file_refused", "../outside.json#/$defs/t", [base + "a.json"], "refused:" + refused),
        run("offline_plans_file_unchanged", "Plans/event_record.schema.json#/properties/occurred_at_utc", [],
            "resolved:/properties/occurred_at_utc"),
    ]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--self-test", action="store_true",
                        help="run the standing same-file $id reference cases instead of the gate")
    args = parser.parse_args()
    if args.self_test:
        cases = embedded_reference_self_test()
        print(json.dumps({"self_test": "embedded_references", "cases": cases,
                          "pass": all(case["ok"] for case in cases)}, indent=2))
        return int(not all(case["ok"] for case in cases))
    result = check_inventory(args.root)
    print(json.dumps(result, indent=2))
    return int(result["status"] != "pass")


if __name__ == "__main__":
    raise SystemExit(main())
