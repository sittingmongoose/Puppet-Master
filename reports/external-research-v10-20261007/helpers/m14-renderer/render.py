#!/usr/bin/env python3
"""Mechanical Markdown projections of one candidate-authored JSON finding set."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

VERSION = "m14-renderer-1.0.0"
VIEWS = (
    ("evidence", "Evidence"), ("conditions", "Conditions"),
    ("options", "Options"), ("optional_leads", "Optional leads"),
    ("validation", "Validation"), ("uncertainty", "Uncertainty"),
    ("sources", "Sources"),
)
REQUIRED = ("id", "summary", "disposition") + tuple(k for k, _ in VIEWS)


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def invalid_constant(value):
    raise ValueError(f"non-JSON constant: {value}")


def load(raw):
    doc = json.loads(raw, object_pairs_hook=unique_object,
                     parse_constant=invalid_constant)
    if not isinstance(doc, dict) or not isinstance(doc.get("findings"), list):
        raise ValueError("required: object with findings array")
    if not doc["findings"]:
        raise ValueError("findings must not be empty")
    seen = set()
    for index, record in enumerate(doc["findings"], 1):
        if not isinstance(record, dict):
            raise ValueError(f"finding {index}: required object")
        missing = [k for k in REQUIRED if k not in record]
        if missing:
            raise ValueError(f"finding {index}: missing {', '.join(missing)}")
        identity = record["id"]
        if not isinstance(identity, str) or not re.fullmatch(
                r"[A-Za-z0-9][A-Za-z0-9_.:-]{0,63}", identity):
            raise ValueError(f"finding {index}: invalid id")
        if identity in seen:
            raise ValueError(f"identity collision: {identity}")
        seen.add(identity)
        for key in ("summary", "disposition"):
            if not isinstance(record[key], str) or not record[key].strip():
                raise ValueError(f"{identity}: required nonblank {key}")
        for key, _ in VIEWS:
            value = record[key]
            if not isinstance(value, (str, list, dict)) or (
                    isinstance(value, str) and not value.strip()):
                raise ValueError(f"{identity}: {key} requires text, list, or object")
    return doc


def anchor(identity):
    return "finding-" + hashlib.sha256(identity.encode("utf-8")).hexdigest()


def fenced(text, language=""):
    # User text cannot close its fence and inject presentation structure.
    longest = max((len(m.group()) for m in re.finditer(r"`+", text)), default=0)
    fence = "`" * max(3, longest + 1)
    return fence + language + "\n" + text + "\n" + fence + "\n"


def value_view(value):
    if isinstance(value, str):
        return fenced(value)
    return fenced(json.dumps(value, ensure_ascii=False, indent=2), "json")


def render(raw):
    doc = load(raw)
    records = doc["findings"]
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    out = [f"# Mechanical finding views\n\nRenderer: {VERSION}\n",
           f"Input SHA-256: {digest}\n",
           "Candidate-authored content; no substantive adjudication by renderer.\n",
           "\n## Decision view\n"]
    # Every finding appears, in authored order, irrespective of disposition.
    for record in records:
        identity = record["id"]
        out += [f"\n### {identity}\n",
                f"[Complete record](#{anchor(identity)})\n",
                "\nSummary\n", value_view(record["summary"]),
                "\nDisposition\n", value_view(record["disposition"]),
                "\nGoverning conditions (complete)\n", value_view(record["conditions"])]
    for key, title in VIEWS:
        out.append(f"\n## {title} view\n")
        for record in records:
            identity = record["id"]
            out += [f"\n### {identity}\n",
                    f"[Complete record](#{anchor(identity)})\n",
                    value_view(record[key])]
    out.append("\n## Complete record detail view\n")
    for record in records:
        out += [f'\n<a id="{anchor(record["id"])}"></a>\n',
                f'\n### {record["id"]}\n', value_view(record)]
    # Retains unknown document fields and exact original source-binding spelling.
    out += ["\n## Exact authored input\n",
            "The fenced payload retains the complete UTF-8 input text, including "
            "unknown fields. The separator newline before the closing fence is "
            "renderer framing.\n",
            fenced(raw, "json")]
    return "\n".join(out)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", nargs="?", default="-", help="UTF-8 JSON file or - for stdin")
    parser.add_argument("-o", "--output", default="-", help="new Markdown file or - for stdout")
    parser.add_argument("--version", action="store_true")
    args = parser.parse_args()
    if args.version:
        digest = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
        print(f"{VERSION} sha256:{digest}")
        return 0
    try:
        data = sys.stdin.buffer.read() if args.input == "-" else Path(args.input).read_bytes()
        raw = data.decode("utf-8")
        output = render(raw).encode("utf-8")
        if args.output == "-":
            sys.stdout.buffer.write(output)
        else:
            # Validate everything first; never overwrite input or existing output.
            with Path(args.output).open("xb") as target:
                target.write(output)
    except (ValueError, OSError) as error:
        print(f"render error: {error}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
