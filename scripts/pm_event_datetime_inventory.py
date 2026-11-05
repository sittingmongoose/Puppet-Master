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
EXCLUSIONS = "scripts/pm_event_datetime_exclusions.json"
INVENTORY_SCHEMA = "scripts/pm_event_datetime_inventory.schema.json"


def mentions_field(body):
    # Repeated decoding also sees names inside serialized JSON strings.
    while True:
        decoded = _JSON_U_ESCAPE.sub(lambda m: chr(int(m.group(1), 16)), body)
        if decoded == body:
            return any(field in body for field in FIELDS)
        body = decoded


def schema_candidate(body):
    """Wildcard declarations can name these fields without spelling them."""
    while True:
        decoded = _JSON_U_ESCAPE.sub(lambda m: chr(int(m.group(1), 16)), body)
        if decoded == body:
            return (any(field in body for field in FIELDS) or
                    "patternProperties" in body or "propertyNames" in body)
        body = decoded


def declarations(node):
    """All supported ways a schema object declares either exact field name.

    This is declaration detection, never ownership inference. Invalid regexes
    fail closed rather than proving that their match set excludes a field.
    """
    if not isinstance(node, dict):
        return ()
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
                if child.type in ("code_inline", "html_inline") and "{" in child.content:
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


def scan(root=ROOT):
    """Bounded universe: all Plans files; JSON/JSONL in UTF-8/16/32,
    Markdown/MDX CommonMark fences, indented code, HTML and inline code,
    plus recursively serialized JSON objects. Markdown prose is out of scope.
    Any mentioning container that cannot yield declarations needs a committed,
    content-pinned exclusion with reason and citation. No suffix skip exists.
    """
    root = Path(root)
    rows, errors, used = [], [], set()
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

    def inspect(value, path, origin):
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
            resource_pointer = ""
            if path == "Plans/storage_value_registry.json" and pointer.startswith("/families/"):
                resource_pointer = "/".join(pointer.split("/")[:4])
            resource = at(value, resource_pointer)
            rows.append({"path": path, "origin": origin, "pointer": pointer,
                         "fields": list(fields), "resource_pointer": resource_pointer,
                         "resource_id": resource.get("$id") if isinstance(resource, dict) else None,
                         "resource_sha256": digest(resource), "node_sha256": digest(node)})
            count += 1
        # Serialized strings have their own resource/pointer address space.
        def strings(obj, pointer=""):
            if isinstance(obj, str):
                if schema_candidate(obj):
                    try:
                        decoded = json.loads(obj, object_pairs_hook=_unique_object)
                    except ValueError:
                        if obj.lstrip().startswith(("{", "[", '"')):
                            unsupported(path, origin + ":string:" + pointer, obj,
                                        "unreadable_schema_string_container")
                        return
                    if isinstance(decoded, (dict, list, str)):
                        inspect(decoded, path, origin + ":string:" + pointer)
            elif isinstance(obj, dict):
                for key, child in obj.items():
                    strings(child, pointer + "/" + str(key).replace("~", "~0").replace("/", "~1"))
            elif isinstance(obj, list):
                for i, child in enumerate(obj):
                    strings(child, pointer + "/" + str(i))
        strings(value)
        return count

    def container(path, origin, body):
        if not schema_candidate(body):
            return
        try:
            documents = decoded_documents(body)
        except ValueError:
            if schema_candidate(body):
                unsupported(path, origin, body, "unreadable_mentioning_container")
            return
        before = len(rows)
        for label, value in documents:
            inspect(value, path, origin if label == "json" else origin + ":" + label)
        if len(rows) == before and (path, origin) not in used and mentions_field(body):
            unsupported(path, origin, body, "unclassified_mentioning_container")

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
                            unsupported(path, origin, json.dumps(value), "unclassified_mentioning_container")
            except (ValueError, OSError, RecursionError, ImportError) as error:
                errors.append({"path": path, "error": "scan_read_failed", "detail": str(error)})
    except (ValueError, OSError) as error:
        errors.append({"error": "scan_walk_failed", "detail": str(error)})
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


def _constraint_sources(root, row, document, pointer, cache, seen=None):
    """Exact value constraints, following only offline schema refs/combinators.

    Object properties and array items describe nested values, not the map
    value itself. Do not mistake a tab record's timestamp member for a map
    whose values are timestamp strings. Cyclic setting-value refs terminate.
    """
    from urllib.parse import urldefrag, unquote, urlsplit
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
            path = unquote(urlsplit(uri).path).lstrip("/")
            if not path.startswith("Plans/") or ".." in path.split("/"):
                raise ValueError("owner evidence reference is not an offline Plans resource")
            target = {"path": path, "origin": "json", "resource_pointer": ""}
            target_document = _source_document(root, target, cache)
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
        role, _ = reviewed_role(row, evidence, citations, root, cache)
        classification = ("wildcard_non_timestamp" if evidence["all_refused"] else
                          "wildcard_non_timestamp_role" if role is not None else
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
                    role, role_error = reviewed_role(row, value_evidence, value_sources, root, documents)
                    if row.get("value_evidence") != {**value_evidence, "reviewed_role": role}:
                        fail("wildcard_value_evidence_changed")
                    if role_error:
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
    except (OSError, ValueError, TypeError, KeyError) as error:
        return {"status": "fail", "nodes": 0, "unclassified_nodes": 0,
                "storage_nodes": 0, "other_owner_nodes": 0,
                "failures": [{"error": "inventory_unreadable", "detail": str(error)}]}
    actual, scan_errors = scan(root)
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
            "unclassified_nodes": len(actual_by_key.keys() - expected_by_key.keys()), "failures": errors}


from pm_event_numbers import Refusal


class DatetimeAdmissionError(Refusal):
    """Typed refusal: no schema fragment may weaken an unclassified owner."""


@lru_cache(maxsize=1)
def resource_selections():
    """Exact resource digest -> ALL classified paths, after integrity checks."""
    inventory = json.loads((ROOT / INVENTORY).read_text())
    errors = validate_inventory(inventory)
    if errors:
        raise DatetimeAdmissionError("datetime_inventory_invalid: " + json.dumps(errors[:3]))
    selections = {}
    for row in inventory["nodes"]:
        if row["classification"] == "source_lineage_schema_patch":
            continue
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
        inventory = json.loads((ROOT / INVENTORY).read_text())
        self.known_uris = {}
        for row in inventory["nodes"]:
            if row["resource_id"] and row["classification"] != "source_lineage_schema_patch":
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


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    args = parser.parse_args()
    result = check_inventory(args.root)
    print(json.dumps(result, indent=2))
    return int(result["status"] != "pass")


if __name__ == "__main__":
    raise SystemExit(main())
