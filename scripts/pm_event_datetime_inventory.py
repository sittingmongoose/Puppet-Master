"""Classified CV-1101 schema-node inventory and fail-closed completeness gate.

The inventory is reviewed owner/resource/path data, never inferred ownership
from a field name. Scan the working tree, including untracked schema additions,
registry-embedded resources, lineage JSON/JSONL and Markdown schema fences.
"""
from __future__ import annotations

import argparse
from collections import Counter
from functools import lru_cache
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INVENTORY = "Plans/event_datetime_inventory.json"
FIELDS = frozenset(("observed_at_utc", "persisted_at_utc"))


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


_JSON_U_ESCAPE = re.compile(r"\\u([0-9a-fA-F]{4})")


def _looks_like_utc_schema(body):
    """True when a body names a property map and a Storage field, literally or escaped."""
    decoded = _JSON_U_ESCAPE.sub(lambda match: chr(int(match.group(1), 16)), body)
    return "properties" in decoded and any(field in decoded for field in FIELDS)


def scan(root=ROOT):
    rows, errors = [], []

    def inspect(value, path, origin):
        for pointer, node in walk(value):
            props = node.get("properties")
            if not isinstance(props, dict) or not FIELDS.intersection(props):
                continue
            resource_pointer = ""
            if path == "Plans/storage_value_registry.json":
                resource_pointer = "/".join(pointer.split("/")[:4])
            resource = at(value, resource_pointer)
            rows.append({"path": path, "origin": origin, "pointer": pointer,
                         "fields": sorted(FIELDS.intersection(props)),
                         "resource_pointer": resource_pointer,
                         "resource_id": resource.get("$id"),
                         "resource_sha256": digest(resource), "node_sha256": digest(node)})

    # Read a file at a time. Do not load the multi-GB Plans tree into memory.
    for file in sorted((Path(root) / "Plans").rglob("*")):
        if not file.is_file() or file.is_symlink() or file.suffix not in (".json", ".jsonl", ".md"):
            continue
        path = file.relative_to(root).as_posix()
        try:
            data = file.read_bytes()
            # Literal keys or any escaped/UTF-16 spelling must be decoded.
            # Never require a literal "properties" or literal field spelling:
            # valid JSON can escape either key and still declare the same node.
            literal_candidate = (b'"properties"' in data and
                                 any(field.encode() in data for field in FIELDS))
            if (not file.name.endswith(".schema.json") and not literal_candidate and
                    b"\\u" not in data and b"\x00" not in data):
                continue
            if file.suffix == ".json":
                inspect(json.loads(data, object_pairs_hook=_unique_object), path, "json")
            elif file.suffix == ".jsonl":
                for line_no, line in enumerate(data.splitlines(), 1):
                    if line.strip() and ((b'"properties"' in line and
                                          any(field.encode() in line for field in FIELDS)) or
                                         b"\\u" in line or b"\x00" in line):
                        inspect(json.loads(line, object_pairs_hook=_unique_object), path, "jsonl:" + str(line_no))
            else:
                text = data.decode("utf-8")
                for line_no, body in _markdown_fences(text):
                    try:
                        value = json.loads(body, object_pairs_hook=_unique_object)
                    except ValueError:
                        if _looks_like_utc_schema(body):
                            raise
                        continue
                    inspect(value, path, "fence:" + str(line_no))
        except (ValueError, OSError, RecursionError) as error:
            errors.append({"path": path, "error": str(error)})
    return rows, errors


def check_inventory(root=ROOT):
    """Missing, stale, changed, duplicate or unclassified entries all fail."""
    root = Path(root)
    inventory = json.loads((root / INVENTORY).read_text())
    actual, errors = scan(root)
    expected = inventory["nodes"]
    actual_by_key = {node_key(row): row for row in actual}
    expected_by_key = {node_key(row): row for row in expected}
    profiles_by_resource_field = {}
    for row in expected:
        for field in row["fields"]:
            selector = (row["resource_sha256"], row["pointer"][len(row["resource_pointer"]):], field)
            profile = row.get("profile")
            if selector in profiles_by_resource_field and profiles_by_resource_field[selector] != profile:
                errors.append({"error": "conflicting_resource_field_profile", "node": list(node_key(row))})
            profiles_by_resource_field[selector] = profile
    if len(expected_by_key) != len(expected):
        errors.append({"error": "duplicate_inventory_node"})
    for key in sorted(actual_by_key.keys() - expected_by_key.keys()):
        errors.append({"error": "unclassified_schema_node", "node": actual_by_key[key]})
    for key in sorted(expected_by_key.keys() - actual_by_key.keys()):
        errors.append({"error": "inventory_node_missing", "node": list(key)})
    for key in sorted(actual_by_key.keys() & expected_by_key.keys()):
        actual_row, row = actual_by_key[key], expected_by_key[key]
        for name, value in actual_row.items():
            if row.get(name) != value:
                errors.append({"error": "inventory_node_changed", "node": list(key), "field": name})
        if row.get("profile") not in ("storage_utc_z", "owner_schema") or not row.get("citation"):
            errors.append({"error": "unclassified_inventory_node", "node": list(key)})
        if row.get("profile") == "owner_schema" and not row.get("owner"):
            errors.append({"error": "missing_other_owner", "node": list(key)})
        for citation in row.get("citation", []):
            source = root / citation["path"]
            if "pointer" in citation:
                try:
                    valid = at(json.loads(source.read_text()), citation["pointer"]) == citation["value"]
                except (OSError, ValueError, KeyError, IndexError, TypeError):
                    valid = False
            else:
                valid = source.is_file() and citation["quote"] in source.read_text()
            if not valid:
                errors.append({"error": "classification_citation_changed", "node": list(key), "citation": citation})
    counts = Counter(row.get("profile", "unclassified") for row in expected)
    return {"status": "fail" if errors else "pass", "nodes": len(actual),
            "storage_nodes": counts["storage_utc_z"], "other_owner_nodes": counts["owner_schema"],
            "unclassified_nodes": sum(node_key(row) not in expected_by_key for row in actual) +
            sum(row.get("profile") not in ("storage_utc_z", "owner_schema") for row in expected),
            "failures": errors}


@lru_cache(maxsize=1)
def resource_selections():
    """Exact resource digest -> reviewed field paths; no discriminator guesses."""
    inventory = json.loads((ROOT / INVENTORY).read_text())
    selections = {}
    for row in inventory["nodes"]:
        if row["profile"] != "storage_utc_z":
            continue
        key = row["resource_sha256"]
        relative_pointer = row["pointer"][len(row["resource_pointer"]):]
        selections.setdefault(key, {})[relative_pointer] = tuple(row["fields"])
    return selections


class StorageSelection:
    """Bind actual supplied schema objects to authenticated resource field paths.

    Keep strong references: Python object-ID reuse cannot transfer ownership.
    An installing owner supplies authentic current/frozen resources; the exact
    inventory digest authenticates their schema content, not native custody.
    """
    def __init__(self):
        self.nodes = {}
        self.visited = {}

    def install(self, schema, *, resource_root=True):
        if not isinstance(schema, dict) or id(schema) in self.visited:
            return
        self.visited[id(schema)] = schema
        # Inline resource copies also retain their owner paths. Plain wrappers
        # have no profile; declarations alone never assign Storage ownership.
        if resource_root or "$id" in schema or "$schema" in schema:
            paths = resource_selections().get(digest(schema), {})
            for pointer, fields in paths.items():
                node = at(schema, pointer)
                self.nodes[id(node)] = (node, fields)
        for child in schema.values():
            if isinstance(child, dict):
                self.install(child, resource_root=False)
            elif isinstance(child, list):
                for item in child:
                    self.install(item, resource_root=False)

    def fields(self, schema):
        self.install(schema)
        match = self.nodes.get(id(schema))
        return match[1] if match is not None and match[0] is schema else ()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    args = parser.parse_args()
    result = check_inventory(args.root)
    print(json.dumps(result, indent=2))
    return int(result["status"] != "pass")


if __name__ == "__main__":
    raise SystemExit(main())
