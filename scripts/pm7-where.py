#!/usr/bin/env python3
"""Name the source that produced a snippet of Concepts/PMConcept7.html.

Given a text snippet (argument or stdin), find it in the built page, then name
the source that produced it. Search stages, in order, stopping at the first
stage that contains the snippet:

  1. O55 sources: Concepts/onboarding/opus-5.5/src (including copy.json and copy.d)
  2. rail: Concepts/leftrail-redesign
     Generated src/concepts/d/d.css is not an edit target. A snippet that
     lands there is mapped back to the .src.css line whose build_d_css.py
     macro expanded into it. d.css is printed afterwards as a generated
     intermediate.
  3. glyphs: Concepts/glyph-system/opus-5.5/src/bridge and the 5.6 Pro neon CSS
  4. home: Concepts/home-redesign
  5. usage: Concepts/usage-redesign
  6. Settings generator: Concepts/onboarding/opus-5.5/tools/settings_layer.py
  7. live shell: base/shell.html and the active sources named by base/manifest.json

Every match is printed as file:line. Base hits name editable source files.
CSS slot comments are followed to their Liquid Glass-owned fragments.
Harness and snapshot copies are excluded from producing-source searches.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "Concepts" / "PMConcept7.html"
BASE = ROOT / "Concepts" / "onboarding" / "opus-5.5" / "base"
O55_SRC = ROOT / "Concepts" / "onboarding" / "opus-5.5" / "src"
RAIL = ROOT / "Concepts" / "leftrail-redesign"
HOME = ROOT / "Concepts" / "home-redesign"
USAGE = ROOT / "Concepts" / "usage-redesign"
GLYPHS = ROOT / "Concepts" / "glyph-system" / "opus-5.5" / "src" / "bridge"
NEON_CSS = ROOT / "Concepts" / "chat-assistant-concepts" / "5.6 Pro" / "neon-icons.css"
SETTINGS_LAYER = ROOT / "Concepts" / "onboarding" / "opus-5.5" / "tools" / "settings_layer.py"
sys.path.insert(0, str(SETTINGS_LAYER.parent))
import base_source  # noqa: E402

D_CSS = RAIL / "src" / "concepts" / "d" / "d.css"
BUILD_D_CSS = RAIL / "tools" / "build_d_css.py"
GENERATED_D_NOTE = (
    "generated intermediate: Concepts/leftrail-redesign/src/concepts/d/d.css "
    "(Concepts/leftrail-redesign/tools/build_d_css.py; edit .src.css or its referenced LG fragment, never d.css)"
)


SKIP_DIRS = {".git", "node_modules", "__pycache__", ".pytest_cache", "proposed.d", "harness", "snapshots"}
SKIP_SUFFIXES = {
    ".woff", ".woff2", ".ttf", ".otf", ".png", ".jpg", ".jpeg", ".gif", ".webp",
    ".ico", ".mp3", ".wav", ".mp4", ".bin", ".zip", ".pdf",
}
# Generated pages. Searching them would name the page as its own source.
SKIP_NAMES = {
    "PMConcept7.html",
    "TestPMConcept.html",
    "UsageTestPMConcept7.html",
}

BASE_NOTE = "edit the live base source; rebuild with tools/build.py"


def rel(path: Path) -> str:
    try:
        return path.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def line_hits(text: str, snippet: str) -> list[int]:
    """1-based line numbers of every occurrence of snippet in text."""
    lines: list[int] = []
    start = 0
    while True:
        index = text.find(snippet, start)
        if index < 0:
            break
        lines.append(text.count("\n", 0, index) + 1)
        start = index + max(1, len(snippet))
    return lines


def unique(lines: list[int]) -> list[int]:
    seen: set[int] = set()
    out: list[int] = []
    for line in lines:
        if line not in seen:
            seen.add(line)
            out.append(line)
    return out


def read_text(path: Path) -> str | None:
    try:
        data = path.read_bytes()
    except OSError:
        return None
    if b"\0" in data[:4096]:
        return None
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        return None


def search_file(path: Path, snippet: str) -> list[int]:
    text = read_text(path)
    if text is None:
        return []
    return unique(line_hits(text, snippet))


def source_paths(path: Path):
    """A source and the LG fragments referenced at its authored CSS slots."""
    yield path
    if path.suffix == ".css":
        for match in base_source.CSS_SLOT.finditer(read_text(path) or ""):
            fragment = (base_source.LG_SLOTS / match.group(1)).resolve()
            if not fragment.is_relative_to(base_source.LG_SLOTS.resolve()):
                raise ValueError(f"{rel(path)}: Liquid Glass slot outside package")
            yield fragment


def iter_files(root: Path):
    if not root.is_dir():
        return
    for dirpath, dirnames, filenames in os_walk(root):
        dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS and not d.startswith("."))
        for name in sorted(filenames):
            if name in SKIP_NAMES or name.startswith("."):
                continue
            path = Path(dirpath) / name
            if path.suffix.lower() in SKIP_SUFFIXES:
                continue
            yield path


def os_walk(root: Path):
    import os
    return os.walk(root, followlinks=False)


def search_tree(root: Path, snippet: str) -> list[tuple[Path, int]]:
    found: list[tuple[Path, int]] = []
    for path in iter_files(root):
        for source in source_paths(path):
            for line in search_file(source, snippet):
                found.append((source, line))
    return found


def is_generated_d_css(path: Path) -> bool:
    return path.resolve() == D_CSS.resolve()


def dedupe_hits(hits: list[tuple[Path, int]]) -> list[tuple[Path, int]]:
    seen: set[tuple[Path, int]] = set()
    out: list[tuple[Path, int]] = []
    for path, line in hits:
        key = (path.resolve(), line)
        if key in seen:
            continue
        seen.add(key)
        out.append((path, line))
    return out


def load_build_d_css():
    spec = importlib.util.spec_from_file_location("pm7_where_build_d_css", BUILD_D_CSS)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {rel(BUILD_D_CSS)}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def macro_source_hits(snippet: str) -> list[tuple[Path, int]]:
    """Source lines whose build_d_css expansion contains snippet.

    Each .src.css line is expanded on its own. The macro syntax does not cross
    lines, so a hit on expanded line N is authored on source line N.
    """
    module = load_build_d_css()
    found: list[tuple[Path, int]] = []
    src = module.SRC
    if not src.is_dir():
        return found
    for path in (source for path in sorted(src.glob("*.src.css")) for source in source_paths(path)):
        text = read_text(path)
        if text is None:
            continue
        lines = text.splitlines()
        expanded = "\n".join(module.expand(line) for line in lines)
        start = 0
        while True:
            index = expanded.find(snippet, start)
            if index < 0:
                break
            first = expanded.count("\n", 0, index) + 1
            last = expanded.count("\n", 0, index + max(len(snippet), 1) - 1) + 1
            for line in range(first, last + 1):
                found.append((path, line))
            start = index + max(1, len(snippet))
    return dedupe_hits(found)


def search_rail(snippet: str) -> tuple[list[tuple[Path, int]], list[tuple[Path, int]]]:
    """Authored rail hits, plus d.css hits when the snippet only exists after macro expansion.

    d.css is never returned as an authored hit. Those lines are mapped through
    build_d_css.expand back to the .src.css files.
    """
    raw = search_tree(RAIL, snippet)
    generated = [hit for hit in raw if is_generated_d_css(hit[0])]
    authored = [hit for hit in raw if not is_generated_d_css(hit[0])]
    if generated:
        authored.extend(macro_source_hits(snippet))
        if not any(hit[0].name.endswith(".src.css") or hit[0].is_relative_to(base_source.LG_SLOTS) for hit in authored):
            # The snippet is in the generated file but not in any expanded source line
            # (the generator header). Name the generator so d.css is not the only answer.
            header = search_file(BUILD_D_CSS, snippet)
            authored.append((BUILD_D_CSS, header[0] if header else 1))
    return dedupe_hits(authored), generated


def search_paths(paths: list[Path], snippet: str) -> list[tuple[Path, int]]:
    found: list[tuple[Path, int]] = []
    for path in paths:
        if path.is_file():
            for source in source_paths(path):
                for line in search_file(source, snippet):
                    found.append((source, line))
        elif path.is_dir():
            found.extend(search_tree(path, snippet))
    return found


STAGES: list[tuple[str, str]] = [
    ("O55 source", "o55"),
    ("rail layer", "rail"),
    ("glyph layer", "glyph"),
    ("home layer", "home"),
    ("usage layer", "usage"),
    ("settings layer", "settings"),
    ("live base source", "base"),
]


def stage_hits(kind: str, snippet: str) -> list[tuple[Path, int]]:
    if kind == "o55":
        return search_tree(O55_SRC, snippet)
    if kind == "rail":
        authored, generated = search_rail(snippet)
        stage_hits.generated = generated
        return authored
    if kind == "home":
        return search_tree(HOME, snippet)
    if kind == "glyph":
        return search_paths([GLYPHS, NEON_CSS], snippet)
    if kind == "usage":
        return search_tree(USAGE, snippet)
    if kind == "settings":
        return search_paths([SETTINGS_LAYER], snippet)
    if kind == "base":
        manifest = json.loads((BASE / 'manifest.json').read_bytes())
        return search_paths([BASE / manifest['skeleton']] + [BASE / b['file'] for b in manifest['blocks']], snippet)
    return []


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="pm7-where.py",
        description="Find a snippet of Concepts/PMConcept7.html and name the source that produced it.",
        epilog=(
            "Search order: O55 src (copy.json and copy.d included), then the rail, glyphs, home, usage, "
            "the Settings generator, then the active live base sources. "
            "The first stage that contains the snippet wins, and every match in that stage is printed. "
            "A rail snippet that exists only in generated d.css is answered from the .src.css line "
            "build_d_css.py expands, and d.css is named afterwards as a generated intermediate. "
            f"When that stage is the live base, the tool adds: {BASE_NOTE}"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "snippet",
        nargs="?",
        help="text to find in Concepts/PMConcept7.html; read from stdin when omitted",
    )
    return parser


def snippet_from(args: argparse.Namespace) -> str | None:
    if args.snippet is not None:
        return args.snippet
    if sys.stdin.isatty():
        return None
    # One trailing newline is what echo and a heredoc add; the snippet itself is kept intact.
    data = sys.stdin.read()
    if data.endswith("\n") and not data.endswith("\n\n"):
        data = data[:-1]
    return data


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(sys.argv[1:] if argv is None else argv)
    snippet = snippet_from(args)
    if snippet is None:
        parser.print_help()
        return 2
    if snippet == "":
        print("pm7-where: empty snippet", file=sys.stderr)
        return 2
    if not PAGE.is_file():
        print(f"pm7-where: missing {rel(PAGE)}", file=sys.stderr)
        return 2

    page_text = read_text(PAGE)
    if page_text is None:
        print(f"pm7-where: cannot read {rel(PAGE)}", file=sys.stderr)
        return 2
    page_lines = unique(line_hits(page_text, snippet))
    if not page_lines:
        print(f"not found in {rel(PAGE)}")
        return 1
    for line in page_lines:
        print(f"{rel(PAGE)}:{line}")

    for title, kind in STAGES:
        hits = stage_hits(kind, snippet)
        if not hits:
            continue
        print()
        print(f"source: {title} ({len(hits)} match{'es' if len(hits) != 1 else ''})")
        for path, line in hits:
            print(f"{rel(path)}:{line}")
        generated = getattr(stage_hits, "generated", []) if kind == "rail" else []
        if generated:
            print(GENERATED_D_NOTE)
            for path, line in generated:
                print(f"{rel(path)}:{line}")
        if kind == "base":
            print(BASE_NOTE)
        return 0

    print()
    print("no producing source found")
    return 1


if __name__ == "__main__":
    sys.exit(main())
