#!/usr/bin/env python3
"""Deterministic Event Authority admission writer (PNC-019 step S5, stream E).

Three stages, each a pure function of the repository tree and the pinned inputs:

``prepare``
    Builds the admission manifest for one admission merge. It reads the two
    reviewed admission-readiness lists (pinned by SHA-256), each family's
    reviewed grade in ``reports/``, and the family's lane contract in canon,
    and derives the registry row the family would append. Every field comes
    from a named source; a field no source states, or two sources state
    differently, blocks the family with a named gap instead of being guessed.
    Every derived row is checked with readiness's own registry checks.

``apply``
    Writes one commit per ready family, in manifest order: the registry
    append (DL-078/DL-096), the family's own Decision Log entry, its DL-077
    admission record, its 12/12 depth assessment, its CPU ledger rationale or
    recount OUTCOMES row, and the DL-078 checkpoint pins. Nothing in a commit
    depends on a clock: the recording time, revision date and DL ids are
    inputs.

``verify``
    Judges every written record with the frozen seal check's own
    ``admission_record_problems`` and the registry with readiness's checks,
    and prints the verdict per family.

``refresh-dispositions``
    Reprojects the existing merge-2 CPU ledger rows and their mirrors from
    current accepted depth assessments. It changes no admission, verdict,
    holding bucket or original append checkpoint. ``--check`` independently
    verifies the current assessment digest and each registry span's family.

The writer never edits the frozen validator, Spec Lock, ``Plans/.evidence``
or ``Plans/auto_decisions.jsonl``, never regenerates shards or the plan
index (one regeneration per merge, run by the merge), never pushes and never
lands.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import json
import re
import subprocess
import sys
from functools import lru_cache
from pathlib import Path
from typing import Any


sys.path.insert(0, str(Path(__file__).resolve().parent))
from pm_ea_admission_rows import (  # noqa: E402  the derived-row rules, reviewable on their own
    EVIDENCE_FIELDS, Gap, SELF_GRADES, canonical_sha256, derive_row, find_by_event,
    grade_cells_ok, grade_rows, lane_contract, load, load_module, render_registry,
    schema_failures, sha256_bytes, sha256_file, unit_ref,
)

REPO = Path(__file__).resolve().parents[1]
PLANS = REPO / "Plans"

WRITER_ID = "pm-ea-admission-writer.v1"
REGISTRY = "Plans/event_family_registry.json"
REGISTRY_SCHEMA = "Plans/event_family_registry.schema.json"
DECISION_LOG = "Plans/Decision_Log.md"
CURRENTNESS = "scripts/pm_pnc019_currentness.py"
TEST_PINS = ("tests/test_pm_testing_session_events.py", "tests/test_pm_github_project_integration.py")
# The EVT2 legacy golden oracle names the registry revision it recomputes against; readiness fails
# event_legacy_fixture_root_mismatch (and its self-test) when the label trails the live registry.
LEGACY_GOLDEN = "tests/fixtures/event_record/legacy_normalization/golden/event_envelope_v1_to_event_record_v2.json"
AUDIT = "Plans/.audits/event-authority-2026-08-12"
FROZEN = AUDIT + "/independent-validator/pm_event_authority_independent_validator.py"
LEDGER = AUDIT + "/individual-disposition/LEDGER.jsonl"
LEDGER_ROWS = AUDIT + "/individual-disposition/rows"
OUTCOMES = AUDIT + "/recount/OUTCOMES.json"
RECOUNT_LIST = "reports/event-authority-20261104/census-recount-20261104/NEW-LIST.json"
RECOUNT_RECEIPT = "reports/event-authority-20261104/census-recount-20261104/RECEIPT.json"
RECORD_DIR = "reports/event-authority-20260911/admission-records"
POST_AUGUST_RECEIPT = "reports/event-authority-20260911/step-10-post-august-admission-receipt.json"
COORDINATION_LEDGER = "Plans/coordination_event_admission.json"
STORAGE_REGISTRY = "Plans/storage_value_registry.json"

# The two reviewed readiness lists of admission merge 1 (EA-P2 B, Jared 2026-11-14).
EVIDENCE_ROOT = Path("/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104")
READINESS = {
    "batch2": (EVIDENCE_ROOT / "drafts/INT2/admission-readiness-final.json",
               "58566991d8f8a012b87e49afb36f0578576ed24f73122362d84ff365901507be"),
    "batch3": (EVIDENCE_ROOT / "drafts/INT3/admission-readiness.json",
               "815ed8bfdc86b5fe565fac1cc5549fc590fa7b72cd9606fcb589f947bf8eaa8f"),
}


# Shared helpers live with the rules so both modules compute hashes and loads one way.
# ---------------------------------------------------------------- inputs

def readiness_families(args=None) -> list[dict]:
    """Admission merge 1: 32 batch-2 rows at 11 PASS + membership ABSENT, then 141 batch-3 rows at 11/0/1."""
    out = []
    if args is not None and getattr(args, "readiness_list", None):
        source = Path(args.readiness_list)
        if not source.is_absolute():
            source = REPO / source
        try:
            relative = str(source.relative_to(REPO))
        except ValueError:
            raise SystemExit("readiness input must be a repository result bundle")
        if sha256_file(source) != args.readiness_sha256:
            raise SystemExit("readiness list bytes differ from --readiness-sha256")
        data = json.loads(source.read_text(encoding="utf-8"))
        if data.get("status") != "pass" or data.get("not_ready"):
            raise SystemExit("readiness list contains blocked families")
        names = set()
        for row in data["ready"]:
            event_type, lane = row["event_type"], row["lane"]
            if event_type in names:
                raise SystemExit("duplicate readiness family: " + event_type)
            names.add(event_type)
            SELF_GRADES[lane] = relative
            out.append(dict(event_type=event_type, lane=lane, batch="batch3" if lane.startswith("W3") or lane=="S4B" else "batch2",
                            readiness=dict(path=relative, sha256=args.readiness_sha256)))
        return sorted(out, key=lambda row: row["event_type"])
    path2, pin2 = READINESS["batch2"]
    path3, pin3 = READINESS["batch3"]
    if sha256_file(path2) != pin2 or sha256_file(path3) != pin3:
        raise SystemExit("readiness list bytes differ from their pins")
    batch2 = json.loads(path2.read_text(encoding="utf-8"))
    batch3 = json.loads(path3.read_text(encoding="utf-8"))
    for row in batch2:
        if row["counts"] == {"ABSENT": 1, "PASS": 11} and set(row["nonpass_cells"]) == {"membership_version"}:
            out.append({"event_type": row["event_type"], "lane": row["lane"], "batch": "batch2",
                        "readiness": {"path": str(path2), "sha256": sha256_file(path2)}})
    for row in batch3:
        if row["grade"] == "11/0/1" and row["nonpass"] == []:
            out.append({"event_type": row["event_type"], "lane": row["lane"], "batch": "batch3",
                        "readiness": {"path": str(path3), "sha256": sha256_file(path3)}})
    order = {"batch2": 0, "batch3": 1}
    return sorted(out, key=lambda f: (order[f["batch"]], f["event_type"]))


def kind_of(event_type: str, ledger: dict, recount: dict) -> str:
    if event_type in ledger and ledger[event_type].get("bucket") == "confirmed_persisted_unregistered":
        return "cpu"
    if event_type in recount:
        return "recount"
    raise Gap("neither a confirmed_persisted_unregistered ledger row nor a recount name")





def prepare(args) -> int:
    problems = self_test()
    if problems:
        raise SystemExit("writer self-test failed: " + "; ".join(problems))
    readiness = load_module("pm_impl_readiness_for_writer", "scripts/pm-implementation-readiness.py")
    ledger = {json.loads(line)["event_type"]: json.loads(line) for line in (REPO / LEDGER).read_text(encoding="utf-8").splitlines()}
    recount = {row["name"]: row for row in load(RECOUNT_LIST)}
    registry = load(REGISTRY)
    live_types = {f["event_type"] for f in registry["families"]}
    live_ids = {f["family_id"] for f in registry["families"]}
    families = readiness_families(args)
    grades = {lane: grade_rows(lane) for lane in SELF_GRADES}
    out_rows = []
    candidates = []
    for family in families:
        event_type, lane = family["event_type"], family["lane"]
        entry = {"event_type": event_type, "lane": lane, "batch": family["batch"],
                 "readiness": family["readiness"], "status": "ready", "gaps": []}
        try:
            entry["kind"] = kind_of(event_type, ledger, recount)
            if event_type in live_types:
                raise Gap("already registered")
            grade = grades[lane].get(event_type)
            if grade is None:
                raise Gap("no reviewed grade row in " + SELF_GRADES[lane])
            grade_cells_ok(grade)
            entry["grade"] = {"path": SELF_GRADES[lane], "sha256": sha256_file(REPO / SELF_GRADES[lane])}
            contract = lane_contract(lane, event_type)
            row, provenance = derive_row(family, grade, contract, readiness)
            if row["family_id"] in live_ids:
                raise Gap("family_id already registered")
            problems = schema_failures(row)
            if problems:
                raise Gap("registry schema: " + "; ".join(problems[:3]))
            carried_cells(grade, entry["grade"], lane=lane)  # every cited quotation must still read at this tree
            entry.update(registry_row=row, row_provenance=provenance, contract_ref=contract["contract_ref"])
            candidates.append(row)
        except Gap as gap:
            entry["status"] = "blocked"
            entry["gaps"].append(str(gap))
        out_rows.append(entry)

    # Readiness's own registry data checks over the live registry plus every candidate.
    trial = copy.deepcopy(registry)
    trial["families"].extend(candidates)
    readiness.EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT = len(trial["families"])
    failures = readiness.event_family_registry_data_failures(
        trial, load(REGISTRY_SCHEMA), path_label=REGISTRY, include_residuals=False)
    by_index: dict[int, list] = {}
    for failure in failures:
        match = re.search(r":families/(\d+)$", str(failure.get("path", "")))
        if match:
            by_index.setdefault(int(match.group(1)), []).append(failure)
    offset = len(registry["families"])
    position = {row["event_type"]: offset + i for i, row in enumerate(candidates)}
    for entry in out_rows:
        if entry["status"] != "ready":
            continue
        found = by_index.get(position[entry["event_type"]], [])
        if found:
            entry["status"] = "blocked"
            entry["gaps"].append("readiness registry check: " + json.dumps(found, sort_keys=True)[:400])
            entry.pop("registry_row", None)
    global_failures = [f for f in failures if not re.search(r":families/\d+$", str(f.get("path", "")))]
    manifest = {
        "schema_id": "pm.assurance.event_authority.admission_manifest.v1",
        "writer": WRITER_ID,
        "merge": args.merge,
        "base": subprocess.run(["git", "-C", str(REPO), "rev-parse", "HEAD"], capture_output=True, text=True).stdout.strip(),
        "registry_before": {"revision": registry["registry_revision"], "sha256": sha256_file(REPO / REGISTRY),
                            "family_count": len(registry["families"])},
        "counts": {"families": len(out_rows), "ready": sum(e["status"] == "ready" for e in out_rows),
                   "blocked": sum(e["status"] == "blocked" for e in out_rows)},
        "registry_level_failures_with_all_ready_rows": global_failures,
        "families": out_rows,
    }
    Path(args.out).write_text(json.dumps(manifest, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(manifest["counts"]))
    return 0


# ---------------------------------------------------------------- evidence currency

_TEXT_CACHE: dict[str, str] = {}
_TEXT_HASH_CACHE: dict[str, str] = {}


def file_text(rel: str) -> str | None:
    if rel not in _TEXT_CACHE:
        path = REPO / rel
        _TEXT_CACHE[rel] = path.read_bytes().decode("utf-8") if path.is_file() else None
        if _TEXT_CACHE[rel] is not None:
            _TEXT_HASH_CACHE[rel] = sha256_bytes(_TEXT_CACHE[rel].encode("utf-8"))
    return _TEXT_CACHE[rel]


HEADING_LINE = re.compile(r"#{1,6} ")
FENCE_LINE = re.compile(r"\s*(```|~~~)")


_SPLIT_CACHE: dict[int, tuple[str, list[str], dict[str, tuple[int, int] | None]]] = {}
HEADING_PARTS = re.compile(r"(#{1,6}) (.*)")


def _split_and_spans(text: str) -> tuple[list[str], dict[str, tuple[int, int] | None]]:
    """The text's lines and every declared PlanUnit's span (1-based, inclusive); cached per text.

    A unit starts at the heading that names its id, when one sits between the previous declaration and its
    own (EP-210's '## EP-210 - ...' above its own '###' subheading); otherwise at the nearest heading above
    its declaration (AMS-044's addendum heading). It ends before the next heading of the same or a higher
    level after the fenced block that holds its declaration, and never reaches the next unit's start. A unit
    declared more than once has no span.
    """
    key = id(text)
    cached = _SPLIT_CACHE.get(key)
    if cached is not None and cached[0] is text:
        return cached[1], cached[2]
    lines = text.split("\n")
    headings = []
    declarations = []
    fenced = False
    for i, line in enumerate(lines):
        if FENCE_LINE.match(line):
            fenced = not fenced
            continue
        match = re.fullmatch(r"plan_unit_id: (\S+)\s*", line)
        if match:
            declarations.append((i, match.group(1)))
            continue
        heading = HEADING_PARTS.fullmatch(line) if not fenced else None
        if heading:
            headings.append((i, len(heading.group(1)), heading.group(2)))
    counts: dict[str, int] = {}
    for _, unit in declarations:
        counts[unit] = counts.get(unit, 0) + 1
    fence_ends = []
    for at, _ in declarations:
        fence_end = at + 1
        while fence_end < len(lines) and not FENCE_LINE.match(lines[fence_end]):
            fence_end += 1
        fence_ends.append(fence_end)
    starts = []
    for index, (at, unit) in enumerate(declarations):
        previous = declarations[index - 1][0] if index else -1
        region = [h for h in headings if previous < h[0] < at]
        naming = [h for h in region if re.search(r"(?<![A-Za-z0-9-])" + re.escape(unit) + r"(?![0-9])", h[2])]
        if naming or region:
            head = naming[-1] if naming else region[-1]
        elif index:
            # No heading of its own: it starts right after the previous unit's block, at that unit's level.
            head = (fence_ends[index - 1] + 1, starts[index - 1][1], "")
        else:
            head = max((h for h in headings if h[0] < at), key=lambda h: h[0], default=(0, 1, ""))
        starts.append(head)
    spans: dict[str, tuple[int, int] | None] = {}
    for index, (at, unit) in enumerate(declarations):
        head_line, level, _ = starts[index]
        fence_end = fence_ends[index]
        stop = next((h[0] for h in headings if h[0] > fence_end and h[1] <= level), len(lines))
        if index + 1 < len(declarations):
            stop = min(stop, starts[index + 1][0])
        spans[unit] = None if counts[unit] != 1 else (head_line + 1, stop)
    _SPLIT_CACHE[key] = (text, lines, spans)
    return lines, spans


def unit_span(text: str, unit: str) -> tuple[int, int] | None:
    """(first, last) 1-based lines of a PlanUnit's declared span, or None when not declared exactly once."""
    return _split_and_spans(text)[1].get(unit)


def heading_span(text: str, title: str) -> tuple[int, int] | None:
    """An exactly named Markdown section, excluding fenced YAML headings."""
    headings = []
    fenced = False
    lines = text.splitlines()
    for index, line in enumerate(lines):
        if FENCE_LINE.match(line):
            fenced = not fenced
        match = HEADING_PARTS.fullmatch(line) if not fenced else None
        if match:
            headings.append((index, len(match[1]), match[2]))
    def slug(value: str) -> str:
        return re.sub(r"\s+", "-", re.sub(r"[^\w\s-]", "", value.lower())).strip("-")
    found = [(index, level) for index, level, name in headings
             if name == title or (title.startswith("#") and slug(name) == title[1:])]
    if not found and title.startswith("#"):
        anchors = [i for i, line in enumerate(lines)
                   if re.fullmatch(r'\s*<a\s+(?:id|name)=["\']' + re.escape(title[1:])
                                   + r'["\']\s*>\s*</a>\s*', line)]
        if len(anchors) == 1:
            first = anchors[0]
            following = [(index, level) for index, level, _ in headings if first < index <= first + 3]
            if following:
                heading, level = following[0]
                last = next((index for index, other, _ in headings if index > heading and other <= level), len(lines))
                # The next family's explicit anchor precedes its heading.
                while last > first and (not lines[last - 1].strip() or lines[last - 1].lstrip().startswith("<a ")):
                    last -= 1
                return first + 1, last
    if len(found) != 1:
        return None
    first, level = found[0]
    last = next((index for index, other, _ in headings if index > first and other <= level), len(lines))
    return first + 1, last


def relocate(text: str, quote: str, want: int, span: tuple[int, int] | None) -> tuple[int, int, str] | None:
    """(line_start, line_end, quote_check) of the quotation inside span (the whole text when span is None).

    T221 (Astra, merge-1 review note 1): a quotation is looked for only inside its own unit's span, never in a
    sibling unit, even a nearer one. An exact occurrence is preferred, nearest the cited line; otherwise an
    occurrence equal after collapsing whitespace (a re-wrapped YAML line). None when neither exists there.
    """
    lines, _ = _split_and_spans(text)
    first, last = span if span is not None else (1, len(lines))
    window = text if span is None else "\n".join(lines[first - 1:last])
    exact = [window.count("\n", 0, m.start()) + first for m in re.finditer(re.escape(quote), window)]
    if exact:
        start = min(exact, key=lambda n: (abs(n - want), n))
        return start, start + quote.count("\n"), "exact"
    words = quote.split()
    if not words:
        return None
    pattern = r"\s+".join(re.escape(w) for w in words)
    loose = [(window.count("\n", 0, m.start()) + first, window.count("\n", 0, m.end()) + first)
             for m in re.finditer(pattern, window)]
    if loose:
        start, end = min(loose, key=lambda pair: (abs(pair[0] - want), pair[0]))
        return start, end, "whitespace_normalized"
    return None


@lru_cache(maxsize=8)
def historical_text(commit: str, rel: str) -> str:
    if (not re.fullmatch(r"[0-9a-f]{40}", commit) or Path(rel).is_absolute()
            or ".." in Path(rel).parts):
        raise Gap(f"invalid historical evidence identity: {commit}:{rel}")
    result = subprocess.run(["git", "-C", str(REPO), "show", commit + ":" + rel], capture_output=True)
    if result.returncode:
        raise Gap(f"historical evidence is unreadable: {commit}:{rel}")
    return result.stdout.decode("utf-8")


def rederive_source_citation(source: dict) -> dict:
    """Reissue a source edition from its authenticated original hash and quote.

    This maintenance operation is explicit. refresh_evidence instead rejects a
    mixed input. Callers retain the received object as separate lineage.
    """
    out = copy.deepcopy(source)
    rel, commit = out.get("path"), out.get("commit")
    if not isinstance(rel, str) or not isinstance(commit, str):
        raise Gap("historical evidence needs its path and commit")
    text = historical_text(commit, rel)
    digest = sha256_bytes(text.encode("utf-8"))
    # The original sha256 is the lane's whole-file pin. A later file_sha256
    # must not overwrite it or become authority for historical repair.
    if out.get("sha256", out.get("file_sha256")) != digest:
        raise Gap(f"historical source's original whole-file pin differs: {commit}:{rel}")
    unit, quote = out.get("unit"), out.get("quote")
    span = (unit_span(text, unit) if isinstance(unit, str) and re.fullmatch(r"[A-Z][A-Z0-9]*-\d+", unit)
            else heading_span(text, unit) if isinstance(unit, str) else None)
    if rel.endswith('.py') and isinstance(unit, str) and unit.startswith('python:function:'):
        import ast
        name = unit.split(':',2)[2]
        functions = [node for node in ast.walk(ast.parse(text))
                     if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef)) and node.name == name]
        span = (functions[0].lineno, functions[0].end_lineno) if len(functions)==1 else None
    if not span or not isinstance(quote, str) or not quote:
        raise Gap(f"historical source needs a quoted, declared unit: {commit}:{rel}")
    window = "\n".join(text.splitlines()[span[0] - 1:span[1]])
    if window.count(quote) != 1:
        raise Gap(f"historical quotation is not unique in its own unit: {commit}:{rel}#{unit}")
    start, end, check = relocate(text, quote, out.get("line", span[0]), span)
    out.update(sha256=digest, file_sha256=digest, line=start, line_start=start, line_end=end,
               quote_check=check, quote_scope=f"unit {unit}, {rel}@{commit}:{span[0]}-{span[1]}")
    if "quote_line" in out:
        out["quote_line"] = start
    if "excerpt_sha256" in out:
        convention = out.get("excerpt_digest_convention", "whole_line")
        if convention not in ("whole_line", "literal_quote"):
            raise Gap(f"unknown historical excerpt convention: {convention}")
        excerpt = "\n".join(text.splitlines()[start - 1:end])
        out["excerpt_sha256"] = sha256_bytes((quote if convention == "literal_quote" else excerpt).encode())
    return out


def source_citation_problems(source: dict) -> list[str]:
    """Check every stored pin/coordinate against the citation's named Git edition."""
    try:
        expected = rederive_source_citation(source)
    except (Gap, ValueError) as exc:
        return [str(exc)]
    fields = ("sha256", "file_sha256", "line", "line_start", "line_end", "quote_line", "excerpt_sha256", "quote_scope")
    return [f"historical {key} differs at {source['commit']}:{source['path']}"
            for key in fields if key in source and source[key] != expected.get(key)]


def refresh_evidence(item: dict, *, digest_convention: str = "whole_line", source_commit: str | None = None,
                     event_type: str | None = None, criterion: str | None = None) -> dict:
    """Re-read one cited quotation at the current tree; relocate it inside its own unit or fail closed."""
    rel = item.get("path")
    if isinstance(rel, str) and Path(rel).is_absolute():
        path = Path(rel)
        if not path.resolve().is_relative_to(EVIDENCE_ROOT.resolve()) or not path.is_file():
            raise Gap(f"external evidence is outside the pinned campaign custody: {rel}")
        out = dict(item)
        if item.get("quote") and item["quote"] not in path.read_text(encoding="utf-8"):
            raise Gap(f"external evidence quotation not present: {rel}")
        out["file_sha256"] = sha256_file(path)
        return out
    if not isinstance(rel, str) or ".." in Path(rel).parts:
        raise Gap(f"evidence path is not a repository path: {rel}")
    text = file_text(rel)
    if text is None:
        raise Gap(f"evidence file missing: {rel}")
    out = dict(item)
    # A current file hash must never be paired with an unexplained old line or
    # excerpt hash. Keep the original edition as a separate auditable value.
    source = copy.deepcopy(item.get("source_citation") or {
        k: v for k, v in item.items() if k not in ("quote_check", "quote_scope")})
    if source_commit:
        source.setdefault("commit", source_commit)
    unit = item.get("unit")
    quote = item.get("quote")
    if not quote and ("line" in item or "line_start" in item):
        commit = source.get("commit")
        if not isinstance(commit, str) or not re.fullmatch(r"[0-9a-f]{40}", commit):
            raise Gap(f"line-only evidence needs its historical source commit: {rel}")
        result = subprocess.run(["git", "-C", str(REPO), "show", commit + ":" + rel], capture_output=True)
        if result.returncode:
            raise Gap(f"historical evidence is unreadable: {commit}:{rel}")
        expected = source.get("sha256") or source.get("file_sha256")
        if not expected or sha256_bytes(result.stdout) != expected:
            raise Gap(f"historical evidence file hash differs: {commit}:{rel}")
        old_lines = result.stdout.decode("utf-8").splitlines()
        start = source.get("line_start", source.get("line"))
        end = source.get("line_end", start)
        if not isinstance(start, int) or not isinstance(end, int) or not 1 <= start <= end <= len(old_lines):
            raise Gap(f"historical evidence line range is invalid: {rel}")
        quote = "\n".join(old_lines[start - 1:end])
        source.setdefault("quote", quote)
        heading = re.match(r"^#+\s+([A-Z][A-Z0-9]*-[0-9]+)\b", quote)
        if not unit and heading:
            unit = heading[1]
            out["unit"] = unit
        if not unit:
            raise Gap(f"line-only evidence has no declared unit bound: {rel}")
    if source.get("commit"):
        problems = source_citation_problems(source)
        if problems:
            raise Gap("; ".join(problems))
    span = None
    if rel.endswith(".md") and isinstance(unit, str):
        if unit.startswith("heading:") or unit.startswith("#"):
            span = heading_span(text, unit.removeprefix("heading:"))
            if span is None:
                raise Gap(f"evidence heading has no single declared span: {rel}#{unit}")
        elif not re.fullmatch(r"[A-Z][A-Z0-9]*-[0-9]+", unit):
            span = heading_span(text, unit)
    if rel.endswith(".json"):
        from pm_ea_evidence_projection import family_span, inferred_event, pointer_span, quote_in_pointer
        try:
            pointer = item.get("json_pointer") or unit
            if isinstance(pointer, str) and "#" in pointer:
                pointer = "#" + pointer.split("#", 1)[1]
            if pointer == "#/" and "json_pointer" not in item:
                document = json.loads(text, parse_int=str, parse_float=str)
                if isinstance(document, dict) and "" not in document:
                    pointer = "#"
                    out["unit"] = unit = "#"
                    out["json_pointer"] = "#"
            subject = event_type or inferred_event(text, pointer, quote)
            bound = (family_span(text, subject, pointer,
                                 criterion if rel.startswith("reports/") else None) if subject else None)
            if not bound and isinstance(pointer, str) and pointer.startswith("#/"):
                bound = pointer, pointer_span(text, pointer)
        except ValueError as exc:
            raise Gap(str(exc)) from exc
        if bound:
            unit, span = bound
            out["unit"] = unit
            out["json_pointer"] = unit
            if quote and not quote_in_pointer(text, unit, quote):
                raise Gap(f"cited quotation is outside its exact JSON unit: {rel}{unit}")
    if (rel.startswith("Plans/") and rel.endswith(".md") and isinstance(unit, str)
            and re.fullmatch(r"[A-Z][A-Z0-9]*-[0-9]+", unit)):
        if unit_ref(unit) not in (None, rel + "#" + unit):
            raise Gap(f"evidence unit {unit} is not declared by {rel}")
        span = unit_span(text, unit)
        if span is None:
            raise Gap(f"evidence unit {unit} has no single declared span in {rel}")
    if rel.startswith("Plans/") and rel.endswith(".md") and span is None:
        if unit or _split_and_spans(text)[1]:
            raise Gap(f"canonical Markdown evidence needs a resolvable unit or heading bound: {rel}#{unit}")
    if (criterion == "retention" and event_type and rel.startswith("Plans/")
            and rel.endswith(".md") and span and isinstance(quote, str)
            and quote.lstrip().startswith("Current selected assignment")):
        # MERGE3 finding 4: a wrapped membership line is not retention proof.
        # The replacement remains inside the cited unit and needs actual policy,
        # anchor and count values; no sibling fallback or verdict change.
        from pm_ea_retention_citations import union_range
        registry = load(REGISTRY)
        selected = next((r for r in registry["families"] if r["event_type"] == event_type), None)
        policies = {p["policy_id"]:p for p in load(STORAGE_REGISTRY)["retention_policies"]}
        replacement = union_range(out, selected, policies, file_text) if selected else None
        if replacement and replacement["quote"] != quote:
            out["retention_range_maintenance"] = dict(authority="MERGE3-POSTFIX finding 4",
                old_quote=quote, old_line_start=item.get("line_start"),
                new_line_start=replacement["line_start"], new_line_end=replacement["line_end"],
                reason="Expand the exact current assignment through its policy, scope, anchor and effective count in its own cited unit.")
            quote = out["quote"] = replacement["quote"]
    if isinstance(quote, str) and quote:
        want = item.get("line_start") if isinstance(item.get("line_start"), int) else 1
        found = relocate(text, quote, want, span)
        if found is None:
            where = f"unit {unit} ({rel}:{span[0]}-{span[1]})" if span else rel
            raise Gap(f"cited quotation not present in {where}: {quote[:80]!r}")
        out["line_start"], out["line_end"], out["quote_check"] = found
        excerpt = "\n".join(text.splitlines()[found[0] - 1:found[1]])
        if found[2] == "whitespace_normalized":
            matched = re.search(r"\s+".join(re.escape(w) for w in quote.split()), excerpt)
            quote = matched[0]
        out["quote"] = quote
        if "line" in out:
            out["line"] = found[0]
        if "quote_line" in out:
            out["quote_line"] = found[0]
        if "excerpt_sha256" in item:
            convention = item.get("excerpt_digest_convention", digest_convention)
            if convention not in ("whole_line", "literal_quote"):
                raise Gap(f"unknown excerpt digest convention: {convention}")
            out["excerpt_digest_convention"] = convention
            out["excerpt_sha256"] = sha256_bytes((quote if convention == "literal_quote" else excerpt).encode("utf-8"))
        out["quote_scope"] = f"unit {unit}, {rel}:{span[0]}-{span[1]}" if span else "document"
    out["source_citation"] = source
    out["file_sha256"] = _TEXT_HASH_CACHE[rel]
    if "sha256" in out:
        out["sha256"] = out["file_sha256"]
    return out


def self_test() -> list[str]:
    """Standing negatives of the evidence relocation (T221); empty when every case holds."""
    doc = "\n".join([
        "## AMS-044 addendum", "The quoted claim stays in its own unit.", "```yaml", "plan_unit_id: AMS-044",
        "canonical_text: |-", "  own unit text", "```", "",
        "## Sibling", "The quoted claim stays in its own unit.", "```yaml", "plan_unit_id: AMS-045",
        "canonical_text: |-", "  The quoted claim", "  stays wrapped here.", "```", "", "## Tail", "only tail",
    ])
    problems = []
    own, sibling = unit_span(doc, "AMS-044"), unit_span(doc, "AMS-045")
    if own != (1, 8) or sibling != (9, 17):
        problems.append(f"declared spans {own} {sibling}")
    quote = "The quoted claim stays in its own unit."
    # The sibling's copy is nearer the cited line; it must not be chosen.
    if relocate(doc, quote, 10, own) != (2, 2, "exact"):
        problems.append("a quotation repeated in another unit was chosen over its own unit")
    if relocate(doc, quote, 10, None) != (10, 10, "exact"):
        problems.append("document-scope relocation no longer picks the nearest occurrence")
    if relocate(doc, "only tail", 1, own) is not None:
        problems.append("a quotation found only outside its unit was accepted")
    if relocate(doc, "The quoted claim stays wrapped here.", 1, sibling) != (14, 15, "whitespace_normalized"):
        problems.append("a re-wrapped quotation in its own unit was not found")
    if unit_span(doc + "\nplan_unit_id: AMS-044\n", "AMS-044") is not None:
        problems.append("a unit declared twice still has a span")
    # A unit's own titled heading holds prose above a subheading of its own (the EP-210 shape).
    titled = "\n".join([
        "## EP-210 - one family", "Sequence quote.", "### pass two", "more", "```yaml", "plan_unit_id: EP-210", "```",
        "## EP-211 - next family", "Sequence quote.", "```yaml", "plan_unit_id: EP-211", "```",
    ])
    if unit_span(titled, "EP-210") != (1, 7) or unit_span(titled, "EP-211") != (8, 12):
        problems.append(f"titled spans {unit_span(titled, 'EP-210')} {unit_span(titled, 'EP-211')}")
    if relocate(titled, "Sequence quote.", 9, unit_span(titled, "EP-210")) != (2, 2, "exact"):
        problems.append("a quotation under the unit's own titled heading was not kept in its unit")
    # Two units under one heading (the AMS-044/AMS-045 shape): the second starts after the first's block.
    shared = "\n".join([
        "## Addendum", "Claim prose.", "```yaml", "plan_unit_id: AMS-044", "```", "Second prose.", "```yaml",
        "plan_unit_id: AMS-045", "```", "## Next",
    ])
    if unit_span(shared, "AMS-044") != (1, 5) or unit_span(shared, "AMS-045") != (6, 9):
        problems.append(f"shared-heading spans {unit_span(shared, 'AMS-044')} {unit_span(shared, 'AMS-045')}")
    if relocate(shared, "Second prose.", 2, unit_span(shared, "AMS-044")) is not None:
        problems.append("a quotation of the next unit under a shared heading was accepted")
    return problems


def carried_cells(grade: dict, grade_ref: dict, *, lane: str | None = None) -> dict:
    """The eleven reviewed PASS cells, each quotation re-read at the current tree."""
    cells = {}
    for field in EVIDENCE_FIELDS[1:]:
        cell = copy.deepcopy(grade["cells"][field])
        convention = "literal_quote" if (lane or grade.get("lane")) in ("DF", "DG6B") else "whole_line"
        source_commit = grade_ref.get("source_commit")
        if (lane or grade.get("lane")) == "DO" and field == "positive_negative_oracles":
            delta = load("reports/event-authority-20261114/C12-DO.self-grade.json")
            source_commit = delta["implementation_commit"]
            _, original = find_by_event(delta["families"], grade["event_type"])
            for e in cell.get("evidence") or []:
                if e.get("path") == "Plans/orchestrator-subagent-integration.md":
                    e.setdefault("unit", original["owner_unit"])
        evidence = [refresh_evidence(e, digest_convention=convention,
                                   source_commit=source_commit, event_type=grade["event_type"], criterion=field)
                    for e in cell.get("evidence") or [] if isinstance(e, dict)]
        if not any(str(e.get("path", "")).startswith("Plans/") for e in evidence):
            raise Gap(f"{field} PASS carries no Plans evidence")
        cells[field] = {
            "status": "PASS",
            "representation": cell.get("representation"),
            "finding": cell.get("finding"),
            "evidence": evidence,
            "carried_from": dict(grade_ref, field=field, status=cell.get("status")),
        }
    return cells


# ---------------------------------------------------------------- apply

ANSWERS = (EVIDENCE_ROOT / "decision-answers/ANSWERS_EA-P_20261114.md",
           "8f8c89d237c83fa265aa2baeebd041b657e757014a3a806aff451efb6641f1ac")
EA_P1 = "Add each once its definition passes every check"
EA_P2 = "Two merges: the 173 ready now, then the rest"
DL096_WORDS = "And yes I approve the DL-093 covering the families and later"
PIN_MARKER = "# Moved under DL-078's standing rule by admission merge"
TEST_PIN = re.compile(r"(?m)^APPROVED_CHECKPOINT_FAMILY_COUNT = (\d+)  # moved under DL-078 by each registration$")


def git(*args: str, check: bool = True) -> str:
    result = subprocess.run(["git", "-C", str(REPO), *args], capture_output=True, text=True)
    if check and result.returncode != 0:
        raise SystemExit("git " + " ".join(args) + " failed: " + result.stderr.strip())
    return result.stdout


def read_raw(rel: str) -> str:
    """The file's exact text: UTF-8 bytes decoded with no newline translation (some ledgers mix CRLF and LF)."""
    return (REPO / rel).read_bytes().decode("utf-8")


def write_text(rel: str, text: str, *, crlf: bool = False) -> None:
    data = text.replace("\n", "\r\n") if crlf else text
    (REPO / rel).write_bytes(data.encode("utf-8"))
    previous = _TEXT_CACHE.pop(rel, None)
    if previous is not None:
        # Decision_Log is rewritten for each family. Retaining every prior split
        # document makes a resumed, otherwise bounded batch exceed its 2 GiB cap.
        _SPLIT_CACHE.pop(id(previous), None)
        from pm_ea_evidence_projection import forget
        forget(previous)
    _TEXT_HASH_CACHE.pop(rel, None)


def next_revision(previous: str, date: str) -> str:
    match = re.fullmatch(r"(\d{4}-\d{2}-\d{2})\.(\d+)", previous)
    if match and match.group(1) == date:
        return f"{date}.{int(match.group(2)) + 1}"
    if match and match.group(1) > date:
        raise SystemExit(f"revision date {date} precedes the live revision {previous}")
    return f"{date}.1"


def dl_numbers(spec: str) -> list[str]:
    out = []
    for part in spec.split(","):
        part = part.strip()
        match = re.fullmatch(r"DL-(\d+)(?:\.\.DL-(\d+))?", part)
        if not match:
            raise SystemExit("bad --dl-ids part: " + part)
        lo = int(match.group(1))
        hi = int(match.group(2) or lo)
        out.extend(f"DL-{n:03d}" for n in range(lo, hi + 1))
    if len(set(out)) != len(out):
        raise SystemExit("--dl-ids repeats an id")
    return out


def row_lines(rendered: str, family_id: str) -> tuple[int, int, int]:
    """(first, last, event_type line) of the registry row naming family_id, 1-based."""
    lines = rendered.split("\n")
    hits = [i for i, line in enumerate(lines) if line.strip() == f'"family_id": "{family_id}",']
    if len(hits) != 1:
        raise SystemExit("registry row not located uniquely: " + family_id)
    first = hits[0] - 1
    if lines[first].strip() != "{":
        raise SystemExit("registry row opening brace not found: " + family_id)
    indent = lines[first][: len(lines[first]) - len(lines[first].lstrip())]
    last = next(i for i in range(first + 1, len(lines)) if lines[i] in (indent + "}", indent + "},"))
    et_line = next(i for i in range(first, last) if lines[i].strip().startswith('"event_type": '))
    return first + 1, last + 1, et_line + 1


def yaml_str(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def retention_label(ref: dict) -> str:
    """Render either registry form without substituting a policy for the Usage setting."""
    if "setting_key" in ref:
        readiness = load_module("pm_impl_readiness_for_retention_label", "scripts/pm-implementation-readiness.py")
        failures = readiness.event_family_setting_retention_failures(
            "usage.event", ref, path_label="decision_entry/retention_policy_ref")
        if failures:
            raise Gap(failures[0]["error"])
        return (f"setting `{ref['setting_key']}` from {ref['owner_ref']} "
                f"(anchor `{ref['anchor']}`, immutable; no policy ID)")
    return ref["policy_id"] + "@" + ref["policy_version"]


def decision_entry(dl: str, fam: dict, ctx: dict) -> str:
    et, row = fam["event_type"], fam["registry_row"]
    if fam["kind"] == "cpu":
        authority = (f"`{et}` is one of the rows DL-039 confirmed as persisted but unregistered and kept quarantined until "
                     "its contract was complete; DL-414 requires every such row to reach its one outcome, and DL-039 "
                     "authorized registering these rows family by family.")
        lineage_extra = "Plans/Decision_Log.md#DL-039 (confirmed_persisted_unregistered row, registered family by family)"
    else:
        authority = (f"`{et}` is one of the 249 names of the 2026-11-04 census recount (bucket {ctx['bucket']}). Jared's "
                     f"answer to card EA-P1, option A (\"{EA_P1}\"), admits each such name once its full definition, its "
                     "record and both reviews pass; DL-039's no bulk registration stands.")
        lineage_extra = "reports/event-authority-20261104/census-recount-20261104/NEW-LIST.json (recount name)"
    retention = retention_label(row["retention_policy_ref"])
    editions = ""
    if row.get("payload_versions"):
        parts = [f"{v['scope_kind']} `{v['payload_schema_id']}` ({retention_label(v['retention_policy_ref'])}, "
                 f"producer {v['producer_admission']})" for v in row["payload_versions"]]
        editions = " Its payload versions are " + "; ".join(parts) + "."
    merge_number = ctx.get("merge", "admission-merge-1").rsplit("-", 1)[-1]
    merge_reason = ("the families ready then are admitted in a first merge" if merge_number == "1"
                    else "the remaining prepared families are admitted in this second merge after the first 173")
    text = (
        f"Event Authority registers `{et}` as family `{row['family_id']}` revision {row['family_revision']} in admission merge {merge_number} of "
        f"PNC-019. On 2026-11-14 Jared answered card EA-P2 with option B (\"{EA_P2}\"), so "
        f"{merge_reason}. {authority} Under DL-096 (\"{DL096_WORDS}\") this entry is Jared's decision entry for `{et}`, "
        "and the family's DL-077 admission record cites it as its decision_ref. DL-400 keeps this family's own commit, entry, "
        "record and twelve-criterion assessment inside the batched landing.\n\n"
        f"The registry moves from revision {ctx['before']['revision']} ({ctx['before']['family_count']} families, SHA-256 "
        f"{ctx['before']['sha256']}) to {ctx['after']['revision']} ({ctx['after']['family_count']} families, SHA-256 "
        f"{ctx['after']['sha256']}). The appended row, canonical SHA-256 {ctx['row_sha256']}, has scope policy "
        f"{row['scope_policy']}, payload `{row['payload_schema_id']}` at {row['payload_schema_ref']['path']}"
        f"{row['payload_schema_ref']['json_pointer']}, semantic owner {row['semantic_owner_doc']}, payload owner "
        f"{row['payload_owner_doc']} and retention {retention}.{editions} Under DL-078's standing rule the PNC-019 checkpoint "
        f"moves in the same commit: EVENT_FAMILY_REGISTRY_REVISION {ctx['after']['revision']} and "
        f"EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT {ctx['after']['family_count']} in scripts/pm_pnc019_currentness.py, and the "
        "approved checkpoint count in the two DL-078 test files.\n\n"
        f"Depth: {ctx['depth_path']} (SHA-256 {ctx['depth_sha256']}) grades all twelve criteria PASS. Eleven are carried from "
        f"the reviewed grade {fam['grade']['path']} (SHA-256 {fam['grade']['sha256']}) with every cited quotation re-read at "
        f"this commit's base, and membership_version is this registry row. Admission record: {ctx['record_path']}.\n\n"
        "Native execution stays NOT_RUN and every payload version's producer still requires owner adoption. This entry "
        f"registers only `{et}`. It changes no other family, validator, seal condition, retention assignment or holding "
        "bucket, and it grants no producer adoption, native claim, readiness clearance or governance seal. It lands only "
        "with its merge, after the merge's review pair and the coordinator's landing go."
    )
    body = "\n".join("  " + line if line else "" for line in text.split("\n"))
    lineage = [
        f"{ANSWERS[0]}; SHA-256 {ANSWERS[1]} (EA-P1 A, EA-P2 B, Jared 2026-11-14)",
        lineage_extra,
        f"{fam['grade']['path']}; SHA-256 {fam['grade']['sha256']}",
        f"{fam['readiness']['path']}; SHA-256 {fam['readiness']['sha256']}",
        f"scripts/pm-ea-admission-writer.py ({WRITER_ID})",
    ]
    tokens = [et, row["family_id"], ctx["after"]["revision"], ctx["after"]["sha256"], ctx["row_sha256"], EA_P2, DL096_WORDS]
    if fam["kind"] == "recount":
        tokens.insert(5, EA_P1)
    depends = ["DL-039", "DL-077", "DL-078", "DL-096", "DL-400", "DL-414"]
    out = [
        f"### {dl}: Event Authority registers {et} (admission merge {merge_number})",
        "",
        "```yaml",
        f"plan_unit_id: {dl}",
        "unit_type: decision",
        "status: accepted",
        "owner_doc: Plans/Decision_Log.md",
        "canonical_text: |-",
        body,
        "gui_related: false",
        "gui_classification_reason: Registers one event family in the Event Authority registry; no visual presentation changes.",
        f"depends_on: [{', '.join(depends)}]",
        "unblocks: []",
        "acceptance_criteria:",
        f"- {yaml_str('The live registry contains exactly one row for ' + et + ', equal to the row whose canonical SHA-256 this entry records.')}",
        f"- {yaml_str('The DL-077 admission record ' + ctx['record_path'] + ' passes the frozen seal check with no problem for this family.')}",
        f"- {yaml_str('The checkpoint pins name revision ' + ctx['after']['revision'] + ' and ' + str(ctx['after']['family_count']) + ' families.')}",
        "validation_surfaces:",
        "- python3 Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py",
        "- python3 scripts/pm-implementation-readiness.py validate",
        "- python3 scripts/pm-ea-admission-writer.py verify",
        "risk_class: event_authority_admission",
        "reasoning_tier: high",
        f"context_scope: event_authority_pnc019_admission_merge_{merge_number}",
        "implementation_surfaces: [Plans/event_family_registry.json, scripts/pm_pnc019_currentness.py]",
        "node_compile_hint: {mode: owner_contract_only, create_worknodes: false, create_nodeseeds: false}",
        "source_lineage:",
        *[f"- {yaml_str(x)}" for x in lineage],
        f"preserved_exact_tokens: [{', '.join(yaml_str(t) for t in tokens)}]",
        "negative_constraints:",
        "- No other family, validator, seal condition, retention assignment or holding bucket changes.",
        "- No producer adoption, native execution claim, readiness clearance or governance seal is granted.",
        "```",
        "",
        "",
    ]
    return "\n".join(out)


def membership_cell(fam: dict, ctx: dict) -> dict:
    return {
        "status": "PASS",
        "representation": "exact_registry_membership",
        "finding": (f"Registered at registry revision {ctx['after']['revision']} as #/families/{ctx['row_index']} "
                    f"(canonical row SHA-256 {ctx['row_sha256']}); before this commit the family was absent."),
        "evidence": [{
            "path": REGISTRY,
            "json_pointer": f"#/families/{ctx['row_index']}",
            "line_start": ctx["row_lines"][0],
            "line_end": ctx["row_lines"][1],
            "quote": f'"event_type": "{fam["event_type"]}"',
            "quote_line": ctx["row_lines"][2],
            "file_sha256": ctx["after"]["sha256"],
            "quote_check": "exact",
        }],
    }


def ledger_cell(cell: dict, event_type: str | None = None) -> dict:
    """One individual-disposition evidence cell from a depth cell: PASS, Plans citations first, the finding."""
    spans = []
    for item in sorted(cell["evidence"], key=lambda e: not str(e.get("path", "")).startswith("Plans/")):
        start, end = item.get("line_start"), item.get("line_end")
        if item.get("path") == REGISTRY and event_type:
            registry = load(REGISTRY)
            matches = [row for row in registry["families"] if row["event_type"] == event_type]
            if len(matches) != 1:
                raise Gap("ledger registry subject is not unique: " + event_type)
            start, end, _ = row_lines(file_text(REGISTRY), matches[0]["family_id"])
        span = f"{item['path']}:{start}" if start == end or end is None else f"{item['path']}:{start}-{end}"
        if start is None:
            span = item["path"]
        if span not in spans:
            spans.append(span)
    if not spans or not spans[0].startswith("Plans/"):
        raise SystemExit("a projected ledger cell needs a Plans citation first")
    return {"status": "PASS", "citation": "; ".join(spans), "note": cell.get("finding") or ""}


def project_disposition(row: dict, assessment: dict, assessment_path: str, digest: str) -> dict:
    """Refresh an existing registration's projection, preserving its append checkpoints."""
    event_type = row["event_type"]
    subjects = assessment.get("rows", [])
    if len(subjects) != 1 or subjects[0].get("event_type") != event_type:
        raise Gap("disposition assessment subject differs: " + event_type)
    cells = subjects[0]["cells"]
    if set(cells) != set(EVIDENCE_FIELDS) or any(cells[k].get("status") != "PASS" for k in EVIDENCE_FIELDS):
        raise Gap("disposition assessment is not twelve PASS cells: " + event_type)
    if row.get("disposition") != "KEEP_REGISTERED":
        raise Gap("evidence maintenance cannot change a disposition: " + event_type)
    result = copy.deepcopy(row)
    result["evidence"] = {field: ledger_cell(cells[field], event_type) for field in row["evidence"]}
    pattern = re.escape(assessment_path) + r" \(sha256 ([0-9a-f]{64})\)"
    rationale, count = re.subn(pattern, lambda _: assessment_path + " (sha256 " + digest + ")",
                               row["disposition_rationale"])
    if count != 1:
        raise Gap("disposition must have exactly one current assessment pin: " + event_type)
    note = (" Evidence maintenance 2026-11-19 (MERGE2-FIX2): current assessment digest and locators "
            "are projected by the writer; original one-family append checkpoints remain in the "
            "DL-077 record and immutable Git history. No new admission or verdict change.")
    if note not in rationale:
        rationale += note
    result["disposition_rationale"] = rationale
    return result


def disposition_problems(row: dict, assessment_path: str) -> list[str]:
    """Check the live assessment digest and every projected registry span's subject."""
    problems = []
    digest = sha256_file(REPO / assessment_path)
    pins = re.findall(re.escape(assessment_path) + r" \(sha256 ([0-9a-f]{64})\)",
                      row.get("disposition_rationale", ""))
    if pins != [digest]:
        problems.append("assessment_digest_mismatch")
    text = file_text(REGISTRY)
    lines = text.splitlines()
    subject = '"event_type": "' + row["event_type"] + '"'
    membership_count = 0
    for field, cell in row.get("evidence", {}).items():
        for first, last in re.findall(re.escape(REGISTRY) + r":([0-9]+)(?:-([0-9]+))?", cell.get("citation", "")):
            start, end = int(first), int(last or first)
            if field == "membership_version":
                membership_count += 1
            if not 1 <= start <= end <= len(lines) or subject not in "\n".join(lines[start - 1:end]):
                problems.append(field + ":registry_span_omits_family")
    if not membership_count:
        problems.append("membership_registry_span_missing")
    return problems


def refresh_dispositions(args) -> int:
    """Reproject existing CPU rows and mirrors; --check makes no changes."""
    folder = args.report_dir.rstrip("/")
    names = {item["event_type"] for item in load(folder + "/readiness-list.json")["ready"]}
    lines = read_raw(LEDGER).splitlines(keepends=True)
    updates = []
    errors = []
    for index, line in enumerate(lines):
        if not line.strip():
            continue
        row = json.loads(line)
        event_type = row.get("event_type")
        if event_type not in names:
            continue
        path = folder + "/depth/" + event_type + ".json"
        mirror = f"{LEDGER_ROWS}/ROW_{event_type}.json"
        before_mirror = load(mirror)
        if before_mirror != row:
            raise Gap("disposition mirror disagrees before maintenance: " + event_type)
        assessment = load(path)
        projected = project_disposition(row, assessment, path, sha256_file(REPO / path))
        problems = disposition_problems(row if args.check else projected, path)
        if args.check and projected != row:
            problems.append("projection_differs_from_current_assessment")
        if problems:
            errors.append({"event_type": event_type, "problems": problems})
        updates.append((index, mirror, projected))
    if len(updates) != 191:
        raise Gap(f"expected the 191 merge-2 CPU dispositions, found {len(updates)}")
    result = {"status": "fail" if errors else "pass", "checked": len(updates), "errors": errors,
              "check_only": args.check, "original_registry_checkpoints_preserved": True}
    if not args.check and not errors:
        for index, mirror, row in updates:
            # Canonicalize only the refreshed rows/mirrors to LF. Untouched
            # ledger lines retain their original bytes and historical editions.
            lines[index] = json.dumps(row, ensure_ascii=False) + "\n"
            write_text(mirror, json.dumps(row, indent=2, ensure_ascii=False) + "\n")
        write_text(LEDGER, "".join(lines))
    if args.out:
        Path(args.out).write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result))
    return int(bool(errors))


def apply_family(fam: dict, dl: str, args, state: dict) -> list[str]:
    et, row = fam["event_type"], fam["registry_row"]
    touched = []
    # 1. Registry append and revision.
    raw = read_raw(REGISTRY)
    registry = json.loads(raw)
    if render_registry(registry) != raw:
        raise SystemExit("registry serialization does not round-trip; refusing to rewrite it")
    if any(f["event_type"] == et or f["family_id"] == row["family_id"] for f in registry["families"]):
        raise SystemExit("family already registered: " + et)
    before = {"revision": registry["registry_revision"], "sha256": sha256_bytes(raw.encode("utf-8")),
              "family_count": len(registry["families"])}
    registry["families"].append(row)
    registry["registry_revision"] = next_revision(before["revision"], args.revision_date)
    rendered = render_registry(registry)
    write_text(REGISTRY, rendered)
    touched.append(REGISTRY)
    after = {"revision": registry["registry_revision"], "sha256": sha256_bytes(rendered.encode("utf-8")),
             "family_count": len(registry["families"])}
    ctx = {"before": before, "after": after, "row_sha256": canonical_sha256(row), "row_index": before["family_count"],
           "row_lines": row_lines(rendered, row["family_id"]), "bucket": state["recount"].get(et, {}).get("bucket"), "merge": args.merge}
    # 2. Depth assessment: membership from the row, eleven carried cells re-read now.
    grade = state["grades"][fam["lane"]][et]
    if sha256_file(REPO / fam["grade"]["path"]) != fam["grade"]["sha256"]:
        raise SystemExit("reviewed grade bytes changed since prepare: " + fam["grade"]["path"])
    cells = {"membership_version": membership_cell(fam, ctx), **carried_cells(grade, fam["grade"], lane=fam["lane"])}
    depth_rel = f"{args.report_dir}/depth/{et}.json"
    depth = {
        "schema_id": "pm.assurance.event_authority.admission_depth_assessment.v1",
        "assessment_kind": "admission_twelve_criteria",
        "writer": WRITER_ID,
        "merge": args.merge,
        "registry": {"path": REGISTRY, **after, "row_pointer": f"#/families/{ctx['row_index']}"},
        "base_commit": state["base"],
        "rubric": "Step 8 depth matrix, twelve criteria (DL-077); PASS needs Plans/ evidence",
        "native_execution": "NOT_RUN",
        "rows": [{"event_type": et, "family_id": row["family_id"], "family_revision": row["family_revision"],
                  "cells": {f: cells[f] for f in EVIDENCE_FIELDS}}],
    }
    (REPO / depth_rel).parent.mkdir(parents=True, exist_ok=True)
    depth_text = json.dumps(depth, indent=1, ensure_ascii=False) + "\n"
    write_text(depth_rel, depth_text)
    touched.append(depth_rel)
    ctx.update(depth_path=depth_rel, depth_sha256=sha256_bytes(depth_text.encode("utf-8")),
               record_path=f"{RECORD_DIR}/{et}.json")
    # 3. The family's own Decision Log entry (appended; ends with a blank line so later
    #    appends never move its pinned section bytes).
    log = read_raw(DECISION_LOG)
    if f"### {dl}:" in log or re.search(rf"(?m)^plan_unit_id: {dl}$", log):
        raise SystemExit(dl + " already exists in the Decision Log")
    if not log.endswith("\n\n"):
        log += "\n"
    entry = decision_entry(dl, fam, ctx)
    write_text(DECISION_LOG, log + entry)
    touched.append(DECISION_LOG)
    frozen = state["frozen"]
    section = frozen.decision_section_bytes(PLANS / "Decision_Log.md", dl)
    # 4. The DL-077 admission record.
    record = {
        "schema_id": "pm.assurance.event_authority.post_august_admission_record.v1",
        "event_type": et,
        "family_id": row["family_id"],
        "implementation_receipt_sha256": sha256_file(REPO / POST_AUGUST_RECEIPT),
        "decision_ref": f"Plans/Decision_Log.md#{dl}",
        "decision_section_sha256": sha256_bytes(section),
        "registry_before": before,
        "registry_after": after,
        "registry_row_sha256": ctx["row_sha256"],
        "depth_assessment": {"path": depth_rel, "sha256": ctx["depth_sha256"]},
        "admission_landing": {
            "branch": args.branch,
            "commit": None,
            "record": args.landing_record,
            "note": "The landing commit is this family's commit on the branch once the merge lands. A record cannot name the commit that contains it, so the landing record names it.",
        },
        "criteria_not_passing_at_recording": [],
        "status_at_recording": "complete_depth",
        "recorded_by": args.recorded_by,
        "recorded_at_utc": args.recorded_at,
        "notes": [
            f"{args.merge} (EA-P2 B), written by {WRITER_ID} from the manifest row for this family; one commit holds the registry append, this record, its Decision Log entry, its depth assessment, its {'KEEP_REGISTERED ledger row' if fam['kind'] == 'cpu' else 'recount OUTCOMES row'} and the DL-078 checkpoint pins.",
            "The decision entry is " + dl + ", which DL-096 makes Jared's decision entry for this family.",
            "registry_before is the registry at this commit's parent. If main's registry moves before the landing, the writer runs again on the new base and this record, its entry and the pins are taken again.",
            "Written under DL-077. The seal check recomputes completeness from the pinned assessment; the two fields ending in _at_recording are informational only.",
        ],
    }
    record_text = json.dumps(record, indent=1, ensure_ascii=False) + "\n"
    write_text(ctx["record_path"], record_text)
    touched.append(ctx["record_path"])
    problems = frozen.admission_record_problems(record, row)
    unexpected = [p for p in problems if p not in args.accept_record_problem]
    if unexpected:
        raise SystemExit(f"{et}: the frozen check refuses the record just written: {problems}")
    state["record_problems"] = problems
    # 5. CPU ledger rationale or recount OUTCOMES row.
    if fam["kind"] == "cpu":
        # The family's row is brought into agreement with its registration (PLAN section 2: the closing proof
        # needs no CPU row left KEEP_QUARANTINED): KEEP_REGISTERED, provisional false and twelve PASS cells
        # projected from this commit's depth assessment, the receipted row update lane S2 used; bucket,
        # cohort pins, July classification and every other field stay as written.
        sentence = (f" Registered at registry revision {after['revision']} in admission merge {args.merge.rsplit('-', 1)[-1]} under DL-078, DL-096 and DL-400 "
                    f"(decision Plans/Decision_Log.md#{dl}); DL-077 admission record {ctx['record_path']}. Disposition "
                    "KEEP_QUARANTINED -> KEEP_REGISTERED, evidence cells " + ", ".join(EVIDENCE_FIELDS) + " projected with "
                    f"twelve PASS cells from the family's admission depth assessment {depth_rel} (sha256 "
                    f"{ctx['depth_sha256']}); bucket, cohort pins, July classification and every other field are unchanged; "
                    "no seal or owner choice.")
        lines = read_raw(LEDGER).split("\n")
        hits = [i for i, line in enumerate(lines) if line.strip() and json.loads(line).get("event_type") == et]
        if len(hits) != 1:
            raise SystemExit("ledger row not unique: " + et)
        line = lines[hits[0]]
        ending = "\r" if line.endswith("\r") else ""
        ledger_row = json.loads(line)
        if json.dumps(ledger_row, ensure_ascii=False) + ending != line:
            raise SystemExit("ledger row serialization does not round-trip: " + et)
        if ledger_row.get("disposition") != "KEEP_QUARANTINED" or ledger_row.get("bucket") != "confirmed_persisted_unregistered":
            raise SystemExit("ledger row is not a quarantined confirmed_persisted_unregistered row: " + et)
        original_row = copy.deepcopy(ledger_row)
        evidence = ledger_row.get("evidence")
        if not isinstance(evidence, dict) or set(evidence) != set(EVIDENCE_FIELDS):
            raise SystemExit("ledger row does not carry exactly the twelve evidence cells: " + et)
        ledger_row["disposition"] = "KEEP_REGISTERED"
        if "provisional" in ledger_row:
            ledger_row["provisional"] = False
        ledger_row["evidence"] = {field: ledger_cell(cells[field], et) for field in evidence}  # the row's own key order
        ledger_row["disposition_rationale"] = ledger_row["disposition_rationale"] + sentence
        lines[hits[0]] = json.dumps(ledger_row, ensure_ascii=False) + ending
        before_lines = read_raw(LEDGER).split("\n")
        if len(before_lines) != len(lines) or sum(a != b for a, b in zip(before_lines, lines)) != 1:
            raise SystemExit("ledger edit would change more than the family's own line: " + et)
        write_text(LEDGER, "\n".join(lines))
        touched.append(LEDGER)
        row_rel = f"{LEDGER_ROWS}/ROW_{et}.json"
        row_raw = (REPO / row_rel).read_bytes().decode("utf-8")
        crlf = "\r\n" in row_raw
        row_doc = json.loads(row_raw)
        if json.dumps(row_doc, indent=2, ensure_ascii=False) + "\n" != row_raw.replace("\r\n", "\n"):
            raise SystemExit("ledger row file serialization does not round-trip: " + row_rel)
        if row_doc != original_row or list(row_doc) != list(original_row):
            raise SystemExit("ledger row file and LEDGER.jsonl disagree before the edit: " + et)
        write_text(row_rel, json.dumps(ledger_row, indent=2, ensure_ascii=False) + "\n", crlf=crlf)
        touched.append(row_rel)
    else:
        path = REPO / OUTCOMES
        if path.exists():
            doc = json.loads(path.read_text(encoding="utf-8"))
        else:
            doc = {"schema_id": "pm.assurance.event_authority.recount_outcomes.v1",
                   "recount_receipt_sha256": sha256_file(REPO / RECOUNT_RECEIPT),
                   "recount_list_sha256": sha256_file(REPO / RECOUNT_LIST), "rows": []}
            path.parent.mkdir(parents=True, exist_ok=True)
        if any(r.get("event_type") == et for r in doc["rows"]):
            raise SystemExit("recount outcome already present: " + et)
        doc["rows"].append({"event_type": et, "outcome": "registered"})
        doc["rows"].sort(key=lambda r: r["event_type"])
        write_text(OUTCOMES, json.dumps(doc, indent=1, ensure_ascii=False) + "\n")
        touched.append(OUTCOMES)
    # 6. Lane bookkeeping: a coordination ledger row flips to admitted with its prepared row.
    if fam["lane"] == "DCO":
        craw = read_raw(COORDINATION_LEDGER)
        cdoc = json.loads(craw)
        if json.dumps(cdoc, indent=2, ensure_ascii=False) + "\n" != craw:
            raise SystemExit("coordination ledger serialization does not round-trip")
        i, crow = find_by_event(cdoc["rows"], et)
        if crow["admission_status"] != "prepared_not_admitted" or canonical_sha256(crow["registry_row"]) != ctx["row_sha256"]:
            raise SystemExit("coordination ledger row is not the prepared row being appended: " + et)
        reordered = {}
        for key, value in crow.items():
            reordered[key] = "admitted_static_contract" if key == "admission_status" else value
            if key == "runtime_producer_status":
                reordered["authority_contract_ref"] = "Plans/coordination_projection_contracts.schema.json#/x-pm-event-authority-binding"
        if "authority_contract_ref" not in reordered:
            reordered["authority_contract_ref"] = "Plans/coordination_projection_contracts.schema.json#/x-pm-event-authority-binding"
        cdoc["rows"][i] = reordered
        write_text(COORDINATION_LEDGER, json.dumps(cdoc, indent=2, ensure_ascii=False) + "\n")
        touched.append(COORDINATION_LEDGER)
    if fam["lane"] == "S4B":
        rel = "Plans/browser_event_admission.json"
        doc = load(rel)
        index, admission = find_by_event(doc["rows"], et)
        if admission["admission_status"] != "prepared_not_admitted":
            raise SystemExit("Browser row is not prepared: " + et)
        contract = lane_contract("S4B", et)
        admission["admission_status"] = "admitted_static_contract"
        admission["authority_contract_ref"] = contract["owners"]["storage"]
        write_text(rel, json.dumps(doc, indent=2, ensure_ascii=False) + "\n")
        touched.append(rel)
    if fam["lane"] == "DC":
        rel = "Plans/collaboration_event_admission.json"
        doc = load(rel)
        index, admission = find_by_event(doc["rows"], et)
        if admission["admission_status"] != "prepared_not_admitted" or canonical_sha256(admission["registry_row"]) != ctx["row_sha256"]:
            raise SystemExit("Collaboration row is not the exact prepared registry row: " + et)
        admission["admission_status"] = "admitted_static_contract"
        admission["authority_contract_ref"] = admission["storage_owner_unit"]
        write_text(rel, json.dumps(doc, indent=2, ensure_ascii=False) + "\n")
        touched.append(rel)
    # 7. DL-078 checkpoint pins.
    cur = read_raw(CURRENTNESS)
    cur, n1 = re.subn(r'(?m)^EVENT_FAMILY_REGISTRY_REVISION = "[^"]+"$', f'EVENT_FAMILY_REGISTRY_REVISION = "{after["revision"]}"', cur)
    cur, n2 = re.subn(r"(?m)^EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT = \d+$", f"EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT = {after['family_count']}", cur)
    if (n1, n2) != (1, 1):
        raise SystemExit("checkpoint pins not found exactly once in " + CURRENTNESS)
    paragraph = (
        f"{PIN_MARKER} {args.merge.rsplit('-', 1)[-1]} (Jared, EA-P2 B, 2026-11-14), one family per commit, each with its own\n"
        f"# Decision Log entry and DL-077 admission record; latest {et} (Plans/Decision_Log.md#{dl}):\n"
        f"# registry {after['revision']}, {after['family_count']} families, SHA-256\n"
        f"# {after['sha256']} (predecessor\n"
        f"# {before['sha256']}). The audit status file's pinned revision and hash\n"
        "# move with the next reseal, not here.\n"
    )
    start = cur.find(PIN_MARKER)
    if start >= 0:
        end = cur.index("# move with the next reseal, not here.\n", start) + len("# move with the next reseal, not here.\n")
        cur = cur[:start] + paragraph + cur[end:]
    else:
        anchor = "# Checkpoint data only: denominator and contract-depth clearance remain false.\n"
        if cur.count(anchor) != 1:
            raise SystemExit("checkpoint provenance anchor not found in " + CURRENTNESS)
        cur = cur.replace(anchor, paragraph + anchor)
    write_text(CURRENTNESS, cur)
    touched.append(CURRENTNESS)
    for rel in TEST_PINS:
        text = read_raw(rel)
        text, n = TEST_PIN.subn(f"APPROVED_CHECKPOINT_FAMILY_COUNT = {after['family_count']}  # moved under DL-078 by each registration", text)
        if n != 1:
            raise SystemExit("approved checkpoint pin not found exactly once in " + rel + " (run the census generalization first)")
        write_text(rel, text)
        touched.append(rel)
    golden = read_raw(LEGACY_GOLDEN)
    label = f'\n  "registry_revision": "{before["revision"]}",\n'
    if golden.count(label) != 1:
        raise SystemExit("legacy golden fixture does not name the registry revision before this commit exactly once")
    write_text(LEGACY_GOLDEN, golden.replace(label, f'\n  "registry_revision": "{after["revision"]}",\n'))
    touched.append(LEGACY_GOLDEN)
    state["results"].append({"event_type": et, "dl": dl, "registry_after": after, "record": ctx["record_path"],
                             "depth": depth_rel, "row_sha256": ctx["row_sha256"],
                             "record_problems": state.pop("record_problems"), "merge": args.merge})
    return touched


def commit_message(fam: dict, dl: str, result: dict) -> str:
    et = fam["event_type"]
    what = "ledger row moved to KEEP_REGISTERED" if fam["kind"] == "cpu" else "recount OUTCOMES row"
    return (
        f"plans: {dl} registers {et} ({result.get('merge', 'admission-merge-1')}, EA-P2 B)\n\n"
        f"One commit per family ({WRITER_ID}): registry {result['registry_after']['revision']} with "
        f"{result['registry_after']['family_count']} families (SHA-256 {result['registry_after']['sha256'][:12]}...), "
        f"the row appended with canonical SHA-256 {result['row_sha256'][:12]}...; its Decision Log entry {dl} "
        f"(DL-096 decision entry); its DL-077 admission record {result['record']}; its 12/12 depth assessment "
        f"{result['depth']}; its {what}; the DL-078 checkpoint pins. The frozen seal check's own "
        "admission_record_problems returns " + (json.dumps(result["record_problems"]) if result["record_problems"] else "no problem")
        + " for the record. Shards and the plan index are regenerated once per merge, not here.\n"
    )


def apply(args) -> int:
    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    for family in manifest["families"]:
        if family.get("grade"):
            SELF_GRADES[family["lane"]] = family["grade"]["path"]
    ready = [f for f in manifest["families"] if f["status"] == "ready"]
    if args.only:
        wanted = set(args.only.split(","))
        ready = [f for f in ready if f["event_type"] in wanted]
    ids = dl_numbers(args.dl_ids)
    if args.limit:
        live_now = {f["event_type"] for f in load(REGISTRY)["families"]}
        done = sum(f["event_type"] in live_now for f in ready)
        ready = ready[: done + args.limit]
    if len(ids) < len(ready):
        raise SystemExit(f"{len(ready)} admissions need {len(ready)} DL ids; --dl-ids gives {len(ids)}")
    if args.require_three_digit and any(not re.fullmatch(r"DL-\d{3}", i) for i in ids[: len(ready)]):
        raise SystemExit("the frozen seal check accepts only DL-\\d{3} decision refs (validator line 443)")
    if git("status", "--porcelain", "--untracked-files=no").strip():
        raise SystemExit("working tree not clean")
    head = git("rev-parse", "HEAD").strip()
    if manifest["base"] != head and not args.allow_new_base:
        raise SystemExit(f"manifest was prepared at {manifest['base']}, HEAD is {head}; prepare again")
    state = {
        "base": manifest["base"],
        "grades": {lane: grade_rows(lane) for lane in SELF_GRADES},
        "recount": {row["name"]: row for row in load(RECOUNT_LIST)},
        "frozen": load_module("pm_ea_frozen_check_for_writer", FROZEN),
        "results": [],
    }
    live = {f["event_type"] for f in load(REGISTRY)["families"]}
    for fam, dl in zip(ready, ids):
        if fam["event_type"] in live:
            # Resume: a family already written by this writer keeps the id it was given.
            record_path = REPO / RECORD_DIR / (fam["event_type"] + ".json")
            record = json.loads(read_raw(str(record_path.relative_to(REPO)))) if record_path.is_file() else {}
            if record.get("decision_ref") != f"Plans/Decision_Log.md#{dl}":
                raise SystemExit(f"{fam['event_type']} is registered without this run's record for {dl}")
            continue
        try:
            touched = apply_family(fam, dl, args, state)
        except Gap as gap:
            git("checkout", "--", ".")
            git("clean", "-fdq", "--", args.report_dir, RECORD_DIR, AUDIT + "/recount")
            raise SystemExit(f"{fam['event_type']}: {gap}")
        if args.commit:
            audit = sorted(p for p in set(touched) if p.startswith(AUDIT + "/"))
            other = sorted(p for p in set(touched) if not p.startswith(AUDIT + "/"))
            git("add", "--", *other)
            if audit:
                # Plans/.audits/* is ignored for new files; these ledger and outcome files are tracked canon.
                git("add", "-f", "--", *audit)
            msg = commit_message(fam, dl, state["results"][-1])
            git("commit", "-q", "-m", msg)
            state["results"][-1]["commit"] = git("rev-parse", "HEAD").strip()
        print(json.dumps(state["results"][-1]))
        if args.results:
            Path(args.results).write_text(json.dumps(state["results"], indent=1) + "\n", encoding="utf-8")
    if args.results:
        Path(args.results).write_text(json.dumps(state["results"], indent=1) + "\n", encoding="utf-8")
    return 0


# ---------------------------------------------------------------- verify

def verify(args) -> int:
    frozen = load_module("pm_ea_frozen_check_for_verify", FROZEN)
    readiness = load_module("pm_impl_readiness_for_verify", "scripts/pm-implementation-readiness.py")
    registry = load(REGISTRY)
    live = {f["event_type"]: f for f in registry["families"]}
    known37 = load(AUDIT + "/known37_event_types.json")
    known = known37.get("event_types") if isinstance(known37, dict) else known37
    admitted, issues, _ = frozen.validate_post_august_admissions(registry, known)
    global_issues = [i for i in issues if ": " not in i or i.split(": ", 1)[0] not in live]
    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    rows = []
    for fam in manifest["families"]:
        et = fam["event_type"]
        own = [i.split(": ", 1)[1] for i in issues if i.startswith(et + ": ")]
        record_path = REPO / RECORD_DIR / (et + ".json")
        record_problems = None
        if et in live and record_path.is_file():
            # The record's own completeness, judged by the frozen check's own function; independent of
            # the receipt chain the whole-set check also needs (S1).
            record_problems = frozen.admission_record_problems(json.loads(record_path.read_text(encoding="utf-8")), live[et])
        rows.append({"event_type": et, "lane": fam["lane"], "kind": fam.get("kind"), "prepared": fam["status"],
                     "gaps": fam["gaps"], "registered": et in live, "record_problems": record_problems,
                     "frozen_check_admitted": et in admitted, "frozen_check_problems": own})
    failures = readiness.event_family_registry_data_failures(registry, load(REGISTRY_SCHEMA), path_label=REGISTRY,
                                                             include_residuals=False)
    out = {"head": git("rev-parse", "HEAD").strip(), "registry": {"revision": registry["registry_revision"],
           "family_count": len(registry["families"]), "sha256": sha256_file(REPO / REGISTRY)},
           "readiness_registry_failures": failures,
           "frozen_check_global_issues": global_issues,
           "frozen_check_post_august_issues_outside_manifest": [i for i in issues if i.split(": ", 1)[0] not in
                                                               {f["event_type"] for f in manifest["families"]}],
           "families": rows,
           "counts": {"registered": sum(r["registered"] for r in rows),
                      "record_complete": sum(r["record_problems"] == [] for r in rows),
                      "admitted_by_frozen_check": sum(r["frozen_check_admitted"] for r in rows),
                      "blocked_at_prepare": sum(r["prepared"] == "blocked" for r in rows)}}
    text = json.dumps(out, indent=1, ensure_ascii=False) + "\n"
    if args.out:
        Path(args.out).write_text(text, encoding="utf-8")
    print(json.dumps(out["counts"]))
    return 0


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("prepare")
    p.add_argument("--merge", default="admission-merge-1")
    p.add_argument("--out", required=True)
    p.add_argument("--readiness-list")
    p.add_argument("--readiness-sha256")
    p.set_defaults(func=prepare)
    a = sub.add_parser("apply")
    a.add_argument("--manifest", required=True)
    a.add_argument("--dl-ids", required=True, help="e.g. DL-600..DL-772 or a comma list")
    a.add_argument("--revision-date", required=True)
    a.add_argument("--recorded-at", required=True)
    a.add_argument("--recorded-by", default="claude-opus-5.5:ea-pnc-s5w-20261114")
    a.add_argument("--branch", required=True)
    a.add_argument("--merge", default="admission-merge-1")
    a.add_argument("--report-dir", default="reports/event-authority-20261114/admission-merge-1")
    a.add_argument("--landing-record", default="reports/event-authority-20261114/admission-merge-1/LANDING.md")
    a.add_argument("--only", default="")
    a.add_argument("--limit", type=int, default=0)
    a.add_argument("--require-three-digit", action="store_true")
    a.add_argument("--accept-record-problem", action="append", default=[],
                   help="a frozen-check record problem this run may leave (dry runs only, e.g. decision_ref for DL ids above 999)")
    a.add_argument("--allow-new-base", action="store_true")
    a.add_argument("--commit", action="store_true")
    a.add_argument("--results", default="")
    a.set_defaults(func=apply)
    t = sub.add_parser("self-test", help="the standing negatives of evidence relocation (T221)")
    t.set_defaults(func=lambda _args: (print(json.dumps({"problems": self_test()})), 1 if self_test() else 0)[1])
    v = sub.add_parser("verify")
    v.add_argument("--manifest", required=True)
    v.add_argument("--out", default="")
    v.set_defaults(func=verify)
    d = sub.add_parser("refresh-dispositions", help="refresh existing CPU evidence projections without admission")
    d.add_argument("--report-dir", default="reports/event-authority-20261116/admission-merge-2")
    d.add_argument("--check", action="store_true")
    d.add_argument("--out", default="")
    d.set_defaults(func=refresh_dispositions)
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
