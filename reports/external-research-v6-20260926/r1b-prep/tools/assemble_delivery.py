#!/usr/bin/env python3
"""R1b delivery protocol (both arms): immutable draft blocks + explicit verifier decisions -> host-assembled final.

segment(): splits the frozen stage-1 draft into blocks deterministically by markdown structure
(### and deeper headings, top-level list items, table rows, and loose paragraphs under a section).
Every draft line is assigned exactly once (checked). `#`/`##` headings, table headers and separators
are carried as context. Blocks get host IDs B-001.. and are shown to the verifier in draft-blocks.md.

assemble(): delivered.md reproduces every block verbatim with its explicit decision. A block without a
decision is shown as UNVERIFIED, never confirmed. qualify/reject carry the verifier's complete replacement
text; an absence-based rejection without a recorded search scope is flagged. The verifier's additions
file is appended. This is mechanical completeness only; semantic fidelity is judged by the evaluators.
"""
import json
import re
import sys
from pathlib import Path

SECTION = re.compile(r"^#{1,2}\s")
SUBHEAD = re.compile(r"^#{3,6}\s")
LISTITEM = re.compile(r"^(?:[-*+]|\d+[.)])\s+\S")
TABLEROW = re.compile(r"^\s*\|")
TABLESEP = re.compile(r"^\s*\|[\s:|-]+\|?\s*$")
DECISIONS = {"confirm", "qualify", "reject", "unresolved", "not_a_claim"}


def segment(text):
    lines = text.split("\n")
    blocks, context = [], []
    cur = None
    section = None
    table_header = None
    assigned = [None] * len(lines)

    def close():
        nonlocal cur
        if cur and any(l.strip() for l in cur["lines"]):
            cur["text"] = "\n".join(cur["lines"]).rstrip("\n")
            blocks.append(cur)
        elif cur:  # blank-only fragment: give its lines back to context
            for i in cur["line_numbers"]:
                assigned[i - 1] = "context"
        cur = None

    def start(i, kind):
        nonlocal cur
        close()
        cur = {"kind": kind, "section": section, "table_header": table_header if kind == "table_row" else None,
               "lines": [], "line_numbers": []}

    for i, line in enumerate(lines, 1):
        is_sep = bool(TABLESEP.match(line))
        next_is_sep = i < len(lines) and bool(TABLESEP.match(lines[i]))
        if SECTION.match(line):
            close()
            section = line.strip()
            table_header = None
            context.append(i)
            assigned[i - 1] = "context"
            continue
        if TABLEROW.match(line) and (is_sep or next_is_sep):
            close()
            if next_is_sep:
                table_header = line
            context.append(i)
            assigned[i - 1] = "context"
            continue
        if not TABLEROW.match(line):
            if table_header is not None and line.strip():
                table_header = None
        if SUBHEAD.match(line):
            start(i, "heading")
        elif TABLEROW.match(line):
            start(i, "table_row")
        elif LISTITEM.match(line):
            start(i, "list_item")
        elif cur is None:
            if not line.strip():
                context.append(i)
                assigned[i - 1] = "context"
                continue
            start(i, "paragraph")
        elif cur["kind"] == "table_row" and line.strip():
            start(i, "paragraph")
        cur["lines"].append(line)
        cur["line_numbers"].append(i)
        assigned[i - 1] = "block"
    close()
    for n, b in enumerate(blocks, 1):
        b["id"] = f"B-{n:03d}"
        b["first_line"], b["last_line"] = b["line_numbers"][0], b["line_numbers"][-1]
        del b["lines"]
    if any(a is None for a in assigned):
        raise AssertionError("unassigned draft lines: " + str([i + 1 for i, a in enumerate(assigned) if a is None][:10]))
    covered = sorted([n for b in blocks for n in b["line_numbers"]] + [i + 1 for i, a in enumerate(assigned) if a == "context"])
    if covered != list(range(1, len(lines) + 1)):
        raise AssertionError("draft lines not covered exactly once")
    return blocks


def render_blocks_view(text, blocks):
    """draft-blocks.md: the verbatim draft with [B-nnn] markers before each block."""
    starts = {b["first_line"]: b["id"] for b in blocks}
    out = []
    for i, line in enumerate(text.split("\n"), 1):
        if i in starts:
            out.append(f"[{starts[i]}]")
        out.append(line)
    return "\n".join(out)


FIELD = re.compile(r"^\s*[-*]?\s*\**(decision|basis|reason|evidence|searched|replacement)\**\s*:\s*(.*)$", re.I)
HEAD = re.compile(r"^#{2,4}\s*(B-\d{3})(?:\s*(?:\.\.|-|–|to)\s*(B-\d{3}))?\s*$")


def parse_decisions(text):
    decisions, errors, current = {}, [], None
    for raw in text.split("\n"):
        m = HEAD.match(raw.strip())
        if m:
            a = int(m.group(1)[2:])
            b = int(m.group(2)[2:]) if m.group(2) else a
            current = {"ids": [f"B-{k:03d}" for k in range(min(a, b), max(a, b) + 1)], "fields": {}, "in_replacement": False}
            for bid in current["ids"]:
                if bid in decisions:
                    errors.append(f"duplicate decision for {bid}")
                decisions[bid] = current
            continue
        if raw.startswith("#"):
            current = None
            continue
        if current is None:
            continue
        f = FIELD.match(raw)
        if f and not current["in_replacement"]:
            key = f.group(1).lower()
            current["fields"][key] = f.group(2).strip()
            current["in_replacement"] = key == "replacement"
        elif current["in_replacement"]:
            current["fields"]["replacement"] = (current["fields"].get("replacement", "") + "\n" + raw).strip("\n")
        elif raw.strip() and "reason" in current["fields"]:
            current["fields"]["reason"] += " " + raw.strip()
    for bid, d in decisions.items():
        dec = d["fields"].get("decision", "").strip().strip("*`").lower()
        d["fields"]["decision"] = dec
        if dec not in DECISIONS:
            errors.append(f"{bid}: invalid decision {dec!r}")
    return decisions, errors


def assemble(draft_text, blocks, decisions_text, additions_text, slot_label="result"):
    decisions, errors = parse_decisions(decisions_text)
    lines = draft_text.split("\n")
    known = {b["id"] for b in blocks}
    unknown = sorted(set(decisions) - known)
    report = {"blocks": len(blocks), "decided": 0, "unverified": [], "unknown_ids": unknown, "parse_errors": errors,
              "absence_without_search": [], "qualify_or_reject_without_replacement": [], "by_decision": {}}
    out = [f"# Delivered result ({slot_label})\n",
           "Host-assembled (TEST_ONLY_NEVER_PROMOTE) from the immutable stage-1 draft blocks and the same-model verifier's "
           "explicit decisions. Draft text is reproduced verbatim; a block without a decision is UNVERIFIED, not confirmed. "
           "Rejected or qualified text is followed by the verifier's replacement. Verifier additions follow at the end.\n"]
    last_section, last_table = None, None
    for b in blocks:
        if b["section"] != last_section:
            out.append(f"\n{b['section'] or ''}\n")
            last_section, last_table = b["section"], None
        d = decisions.get(b["id"])
        body = "\n".join(lines[n - 1] for n in b["line_numbers"])
        if b["kind"] == "table_row" and b["table_header"] and b["table_header"] != last_table:
            last_table = b["table_header"]
        if d is None:
            report["unverified"].append(b["id"])
            label = "UNVERIFIED: no verifier decision recorded (not confirmed)"
        else:
            f = d["fields"]
            dec = f["decision"]
            report["decided"] += 1
            report["by_decision"][dec] = report["by_decision"].get(dec, 0) + 1
            label = {"confirm": "CONFIRMED", "qualify": "QUALIFIED (use the replacement below)",
                     "reject": "REJECTED (do not rely on the draft text)", "unresolved": "UNRESOLVED",
                     "not_a_claim": "NOT A CLAIM (bookkeeping)"}.get(dec, f"INVALID DECISION {dec!r}")
            if f.get("basis", "").lower().startswith("absence") and not f.get("searched", "").strip():
                report["absence_without_search"].append(b["id"])
                label += "; absence-based, search scope NOT recorded"
            if dec in {"qualify", "reject"} and not f.get("replacement", "").strip() and dec == "qualify":
                report["qualify_or_reject_without_replacement"].append(b["id"])
                label += "; replacement text MISSING"
        out.append(f"\n**[{b['id']}] Verifier: {label}**\n")
        if b["kind"] == "table_row" and b["table_header"]:
            out.append(f"\nTable columns: {b['table_header'].strip()}\n")
        out.append("\nDraft text (verbatim):\n\n" + body + "\n")
        if d is not None:
            f = d["fields"]
            for key, title in (("basis", "Basis"), ("reason", "Reason"), ("evidence", "Evidence"), ("searched", "Search scope")):
                if f.get(key):
                    out.append(f"\n{title}: {f[key]}\n")
            if f.get("replacement", "").strip():
                out.append("\nVerified replacement text:\n\n" + f["replacement"].strip() + "\n")
    out.append("\n---\n\n## Verifier additions\n\n" + (additions_text.strip() or "(no additions file)") + "\n")
    out.append("\n---\n\n## Host assembly report (mechanical completeness only)\n\n"
               f"- blocks: {report['blocks']}; decided: {report['decided']}; unverified: {len(report['unverified'])} "
               f"{report['unverified'][:40]}\n- decisions: {report['by_decision']}\n- unknown decision IDs: {unknown}\n"
               f"- absence-based without recorded search: {report['absence_without_search']}\n"
               f"- qualify without replacement: {report['qualify_or_reject_without_replacement']}\n"
               f"- parse errors: {errors[:20]}\n")
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
                                additions.read_text(errors="replace") if additions.exists() else "",
                                sys.argv[7] if len(sys.argv) > 7 else "result")
        out.write_text(text, encoding="utf-8")
        (out.parent / "assembly-report.json").write_text(json.dumps(report, indent=1) + "\n")
        print(json.dumps({k: report[k] if not isinstance(report[k], list) else len(report[k]) for k in report}))


if __name__ == "__main__":
    main()
