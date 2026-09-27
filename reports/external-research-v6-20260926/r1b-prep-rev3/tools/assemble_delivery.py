#!/usr/bin/env python3
"""R1b rev2 delivery protocol (both arms): immutable draft blocks + explicit verifier decisions -> host-assembled final.

segment(): deterministic split of the frozen stage-1 draft. Every heading (any level) and every top-level list
item, table row or loose paragraph starts a block; fenced code (``` or ~~~) never starts or splits blocks. Only
blank lines and table header/separator rows are context. Every line is assigned exactly once (checked) and each
block records its parent heading path.

parse_decisions(): entries are `### B-012` or `### B-020..B-024` headers; an entry runs to the next entry header.
Fields: decision, basis, reason, evidence, searched (multi-line continuation allowed) and replacement, which must be
delimited by lines `<<<` and `>>>` (captured byte for byte, headings and fences included). A one-line inline
replacement is accepted only when nothing else follows it inside the entry. Anything else is a carrier defect:
the raw record is preserved and the block is NOT authoritative. Duplicate records or duplicate fields for a block
are a carrier conflict, never "last one wins".

assemble(): neutral title; a CURRENT FINDINGS view holding only the active asserted version of each block
(confirm -> draft text; qualify -> replacement; reject + replacement -> the replacement as a verifier assertion);
separate sections for rejected draft assertions, and for unresolved / UNVERIFIED / carrier-defect blocks (no
verified-retention credit); verifier additions (new assertions, checked like any claim); and a HISTORY appendix
with every draft line in order and every raw non-authoritative record.
"""
import json
import re
import sys
from pathlib import Path

HEADING = re.compile(r"^(#{1,6})\s+\S")
LISTITEM = re.compile(r"^(?:[-*+]|\d+[.)])\s+\S")
TABLEROW = re.compile(r"^\s*\|")
TABLESEP = re.compile(r"^\s*\|[\s:|-]+\|?\s*$")
FENCE = re.compile(r"^\s*(```|~~~)")
DECISIONS = {"confirm", "qualify", "reject", "unresolved", "not_a_claim"}
BASES = {"supported", "counterevidence", "absence", "insufficient"}


def segment(text):
    lines = text.split("\n")
    blocks, assigned = [], [None] * len(lines)
    cur, table_header, in_fence, parents = None, None, False, []

    def close():
        nonlocal cur
        if cur:
            while cur["line_numbers"] and not lines[cur["line_numbers"][-1] - 1].strip():
                n = cur["line_numbers"].pop()  # trailing blanks go back to context
                assigned[n - 1] = "context"
            if cur["line_numbers"]:
                blocks.append(cur)
        cur = None

    def start(kind, level=None):
        nonlocal cur
        close()
        cur = {"kind": kind, "level": level, "parents": [p[1] for p in parents],
               "table_header": table_header if kind == "table_row" else None, "line_numbers": []}

    for i, line in enumerate(lines, 1):
        if in_fence:
            cur["line_numbers"].append(i)
            assigned[i - 1] = "block"
            if FENCE.match(line):
                in_fence = False
            continue
        if FENCE.match(line):
            if cur is None or cur["kind"] == "table_row":
                start("paragraph")
            cur["line_numbers"].append(i)
            assigned[i - 1] = "block"
            in_fence = True
            continue
        h = HEADING.match(line)
        if h:
            level = len(h.group(1))
            parents[:] = [p for p in parents if p[0] < level]
            start("heading", level)
            parents.append((level, line.strip()))
            table_header = None
        elif TABLEROW.match(line) and (TABLESEP.match(line) or (i < len(lines) and TABLESEP.match(lines[i]))):
            close()
            if not TABLESEP.match(line):
                table_header = line
            assigned[i - 1] = "context"
            continue
        elif TABLEROW.match(line):
            start("table_row")
        elif LISTITEM.match(line):
            table_header = None
            start("list_item")
        elif not line.strip():
            if cur is None:
                assigned[i - 1] = "context"
                continue
        elif cur is None or cur["kind"] == "table_row":
            table_header = None if cur is None else table_header
            start("paragraph")
        cur["line_numbers"].append(i)
        assigned[i - 1] = "block"
    close()
    if in_fence:
        pass  # an unterminated fence stays inside its block; nothing is dropped
    for n, b in enumerate(blocks, 1):
        b["id"] = f"B-{n:03d}"
        b["first_line"], b["last_line"] = b["line_numbers"][0], b["line_numbers"][-1]
    if any(a is None for a in assigned):
        raise AssertionError("unassigned draft lines: " + str([i + 1 for i, a in enumerate(assigned) if a is None][:10]))
    covered = sorted([n for b in blocks for n in b["line_numbers"]] + [i + 1 for i, a in enumerate(assigned) if a == "context"])
    if covered != list(range(1, len(lines) + 1)):
        raise AssertionError("draft lines not covered exactly once")
    for i, a in enumerate(assigned):
        if a == "context" and lines[i].strip() and not TABLEROW.match(lines[i]):
            raise AssertionError(f"substantive line {i + 1} left as context")
    return blocks


def block_text(lines, b):
    return "\n".join(lines[n - 1] for n in b["line_numbers"])


def render_blocks_view(text, blocks):
    """draft-blocks.md: the verbatim draft with [B-nnn] markers before each block."""
    starts = {b["first_line"]: b["id"] for b in blocks}
    out = []
    for i, line in enumerate(text.split("\n"), 1):
        if i in starts:
            out.append(f"[{starts[i]}]")
        out.append(line)
    return "\n".join(out)


ENTRY = re.compile(r"^#{2,4}\s*(B-\d{3})(?:\s*(?:\.\.|–|-|to)\s*(B-\d{3}))?\s*$")
FIELD = re.compile(r"^\s*[-*]?\s*\**(decision|basis|reason|evidence|searched|replacement)\**\s*:\s?(.*)$", re.I)


REQUIRED = {"confirm": ("basis", "evidence"), "qualify": ("basis", "reason", "evidence", "replacement"),
            "reject": ("basis", "reason"), "unresolved": ("reason",), "not_a_claim": ()}
ALLOWED_BASIS = {"confirm": {"supported"}, "reject": {"counterevidence", "absence"}}


def parse_decisions(text):
    """Single pass, payload-aware. Between a `<<<` line and the matching `>>>` line every byte is replacement
    payload: apparent entry headers and field names inside it are text, never records. An entry is authoritative
    only if its carrier is complete: fields required for its disposition (REQUIRED), a basis consistent with the
    disposition, evidence for counterevidence rejections, a recorded search for absence bases, and a closed payload.
    Returns (records_by_block, report)."""
    lines = text.split("\n")
    entries, outside, cur = [], [], None
    state = "fields"          # fields | await_open | payload | inline_repl
    for n, raw in enumerate(lines, 1):
        if cur is not None and state == "payload":
            if raw.strip() == ">>>":
                cur["fields"]["replacement"] = "\n".join(cur["payload"])
                cur["payload_closed"], state = True, "fields"
            else:
                cur["payload"].append(raw)
            cur["raw"].append(raw)
            continue
        m = ENTRY.match(raw.strip())
        if m:
            if cur is not None and state == "await_open":
                cur["defects"].append("replacement: given without a <<< payload")
            a = int(m.group(1)[2:])
            b = int(m.group(2)[2:]) if m.group(2) else a
            cur = {"header": raw.strip(), "ids": [f"B-{k:03d}" for k in range(min(a, b), max(a, b) + 1)], "raw": [],
                   "first_line": n, "fields": {}, "defects": [], "payload": None, "payload_closed": None, "mode": None}
            entries.append(cur)
            state = "fields"
            continue
        if cur is None:
            if raw.strip():
                outside.append(n)
            continue
        cur["raw"].append(raw)
        if state == "await_open":
            if not raw.strip():
                continue
            if raw.strip() == "<<<":
                cur["payload"], cur["payload_closed"], state = [], False, "payload"
                continue
            cur["defects"].append("replacement not delimited with <<< >>>")
            cur["fields"]["replacement"] = raw
            state = "inline_repl"
            continue
        f = FIELD.match(raw)
        if f:
            key, val = f.group(1).lower(), f.group(2).strip()
            if key in cur["fields"]:
                cur["defects"].append(f"duplicate field '{key}'")
            if key == "replacement":
                if val == "<<<":
                    cur["payload"], cur["payload_closed"], state = [], False, "payload"
                    cur["fields"]["replacement"] = ""
                elif not val:
                    cur["fields"]["replacement"] = ""
                    state = "await_open"
                else:
                    cur["fields"]["replacement"] = val
                    state = "inline_repl"
            else:
                cur["fields"][key] = val
                cur["mode"], state = key, "fields"
            continue
        if not raw.strip():
            continue
        if state == "inline_repl":
            cur["defects"].append("inline replacement followed by further undelimited lines")
            cur["fields"]["replacement"] += "\n" + raw
        elif cur["mode"]:
            cur["fields"][cur["mode"]] += "\n" + raw.strip()
        else:
            cur["defects"].append("text outside any field")
    if cur is not None and state == "await_open":
        cur["defects"].append("replacement: given without a <<< payload")
    for e in entries:
        fields, defects = e["fields"], e["defects"]
        if e["payload_closed"] is False:
            defects.append("replacement opened with <<< but never closed with >>>")
            fields["replacement"] = "\n".join(e["payload"])
        dec = fields.get("decision", "").strip().strip("*`").lower()
        basis_raw = fields.get("basis", "").strip().strip("*`").lower()
        basis = basis_raw.split()[0] if basis_raw else ""
        if dec not in DECISIONS:
            defects.append(f"invalid or missing decision {dec!r}")
        else:
            for req in REQUIRED[dec]:
                if not fields.get(req, "").strip():
                    defects.append(f"{dec} without required field '{req}'")
            if dec in ALLOWED_BASIS and basis and basis not in ALLOWED_BASIS[dec]:
                defects.append(f"{dec} with inconsistent basis {basis!r}")
        if basis and basis not in BASES:
            defects.append(f"invalid basis {basis!r}")
        if basis == "counterevidence" and dec == "reject" and not fields.get("evidence", "").strip():
            defects.append("counterevidence rejection without evidence")
        if basis == "absence" and not fields.get("searched", "").strip():
            defects.append("absence basis without recorded search")
        e.update({"decision": dec, "basis": basis})
        e.pop("payload", None)
    by_block = {}
    for e in entries:
        for bid in e["ids"]:
            by_block.setdefault(bid, []).append(e)
    return by_block, {"entries": len(entries), "lines_outside_entries": outside}


def block_status(records):
    if not records:
        return "UNVERIFIED", None
    if len(records) > 1:
        return "CARRIER_CONFLICT", None
    r = records[0]
    if any(d.startswith("duplicate field") for d in r["defects"]):
        return "CARRIER_CONFLICT", None
    if r["defects"]:
        return "CARRIER_INCOMPLETE", None
    return r["decision"], r


LABEL = {"confirm": "CONFIRMED", "qualify": "QUALIFIED", "reject": "REJECTED", "unresolved": "UNRESOLVED",
         "not_a_claim": "NOT A CLAIM (bookkeeping)", "UNVERIFIED": "UNVERIFIED (no verifier decision; not confirmed)",
         "CARRIER_CONFLICT": "CARRIER CONFLICT (conflicting verifier records; not verified)",
         "CARRIER_INCOMPLETE": "CARRIER INCOMPLETE (malformed verifier record; not verified)"}


def _meta(r):
    out = []
    for key, title in (("basis", "Basis"), ("reason", "Reason"), ("evidence", "Evidence"), ("searched", "Search scope")):
        v = r["fields"].get(key) if key != "basis" else r["basis"]
        if v:
            out.append(f"{title}: {v}")
    return "\n".join(out)


def assemble(draft_text, blocks, decisions_text, additions_text):
    lines = draft_text.split("\n")
    recs, parse_report = parse_decisions(decisions_text)
    known = {b["id"] for b in blocks}
    status = {b["id"]: block_status(recs.get(b["id"], [])) for b in blocks}
    report = {"blocks": len(blocks), "by_status": {}, "unknown_ids": sorted(set(recs) - known),
              "decision_entries": parse_report["entries"], "lines_outside_entries": parse_report["lines_outside_entries"],
              "non_authoritative": sorted(bid for bid, (s, _) in status.items() if s in ("UNVERIFIED", "CARRIER_CONFLICT", "CARRIER_INCOMPLETE"))}
    for s, _ in status.values():
        report["by_status"][s] = report["by_status"].get(s, 0) + 1
    report["carrier_defects"] = sum(report["by_status"].get(k, 0) for k in ("CARRIER_CONFLICT", "CARRIER_INCOMPLETE")) \
        + len(report["unknown_ids"]) + (1 if report["lines_outside_entries"] else 0)
    report["complete"] = report["carrier_defects"] == 0 and report["by_status"].get("UNVERIFIED", 0) == 0

    def ctx(b):
        return " > ".join(b["parents"]) if b["parents"] else "(document top)"

    cur, rej, notv = [], [], []
    for b in blocks:
        s, r = status[b["id"]]
        text = block_text(lines, b)
        head = f"\n#### [{b['id']}] {LABEL[s]}\nContext: {ctx(b)}\n"
        if b["kind"] == "table_row" and b["table_header"]:
            head += f"Table columns: {b['table_header'].strip()}\n"
        if s == "confirm":
            cur.append(head + ("\n" + _meta(r) + "\n" if _meta(r) else "") + "\n" + text + "\n")
        elif s == "qualify":
            cur.append(head + "\n" + _meta(r) + "\n\nActive (verified replacement; the draft text is superseded history):\n\n"
                       + r["fields"]["replacement"] + "\n")
        elif s == "reject":
            rej.append(head + "\n" + _meta(r) + "\n\nRejected draft text (no acceptance credit):\n\n" + text + "\n")
            if r["fields"].get("replacement", "").strip():
                cur.append(f"\n#### [{b['id']}] VERIFIER ASSERTION replacing rejected draft text\nContext: {ctx(b)}\n\n"
                           + r["fields"]["replacement"] + "\n")
        elif s in ("unresolved", "UNVERIFIED", "CARRIER_CONFLICT", "CARRIER_INCOMPLETE"):
            notv.append(head + ("\n" + _meta(r) + "\n" if r else "") + "\nProposal text (not verified):\n\n" + text + "\n")
    out = ["# Delivered research result\n\n",
           "TEST_ONLY_NEVER_PROMOTE. Host-assembled from immutable stage-1 draft blocks and the same-model verifier's "
           "explicit per-block decisions. Only section 1 and section 4 are asserted content. Section 2 records rejected "
           "draft assertions; section 3 holds proposals that were not verified (unresolved, undecided, or with a malformed "
           "verifier record) and earns no verified-retention credit. Section 5 is history.\n",
           "\n## 1. Current asserted findings\n", *cur,
           "\n## 2. Rejected draft assertions (no acceptance credit)\n", *(rej or ["\n(none)\n"]),
           "\n## 3. Not verified: unresolved, undecided or malformed-record proposals (no retention credit)\n",
           *(notv or ["\n(none)\n"]),
           "\n## 4. Verifier additions (new verifier assertions; checked like any claim)\n\n",
           (additions_text.strip() or "(no additions file)") + "\n",
           "\n## 5. History appendix\n\n### 5.1 Complete stage-1 draft with block decisions\n\n"]
    starts = {b["first_line"]: b["id"] for b in blocks}
    for i, line in enumerate(lines, 1):
        if i in starts:
            out.append(f"[{starts[i]}: {LABEL[status[starts[i]][0]]}]\n")
        out.append(line + "\n")
    raws = [(bid, recs[bid]) for bid in sorted(recs) if status.get(bid, ("UNKNOWN",))[0] in ("CARRIER_CONFLICT", "CARRIER_INCOMPLETE")
            or bid not in known]
    out.append("\n### 5.2 Raw verifier records for non-authoritative or unknown blocks\n\n")
    for bid, rs in raws or [("(none)", [])]:
        for r in rs:
            out.append(f"{bid} ({r['header']}; defects: {r['defects']}):\n\n~~~~text\n" + "\n".join(r["raw"]) + "\n~~~~\n\n")
    if not raws:
        out.append("(none)\n")
    out.append("\n### 5.3 Host assembly report (mechanical completeness only)\n\n```json\n" + json.dumps(report, indent=1) + "\n```\n")
    return "".join(out), report


def main():
    cmd = sys.argv[1]
    if cmd == "segment":
        draft, out_dir = Path(sys.argv[2]), Path(sys.argv[3])
        text = draft.read_text(encoding="utf-8", errors="replace")
        blocks = segment(text)
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "draft-blocks.json").write_text(json.dumps(blocks, indent=1, ensure_ascii=False) + "\n")
        (out_dir / "draft-blocks.md").write_text(render_blocks_view(text, blocks), encoding="utf-8")
        print(json.dumps({"blocks": len(blocks), "kinds": {k: sum(1 for b in blocks if b["kind"] == k) for k in {b["kind"] for b in blocks}}}))
    elif cmd == "assemble":
        draft, blocks_json, decisions, additions, out = map(Path, sys.argv[2:7])
        text, report = assemble(draft.read_text(errors="replace"), json.loads(blocks_json.read_text()),
                                decisions.read_text(errors="replace") if decisions.exists() else "",
                                additions.read_text(errors="replace") if additions.exists() else "")
        out.write_text(text, encoding="utf-8")
        (out.parent / "assembly-report.json").write_text(json.dumps(report, indent=1) + "\n")
        print(json.dumps(report["by_status"]))


if __name__ == "__main__":
    main()
