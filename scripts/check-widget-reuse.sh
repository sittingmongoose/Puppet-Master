#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CATALOG_OUTPUT="$REPO_ROOT/docs/slint-widget-catalog.md"
SKIP_CATALOG_CHECK=0

usage() {
  cat <<'USAGE'
Usage: bash scripts/check-widget-reuse.sh [--catalog PATH] [--skip-catalog-check]

Check deterministic Slint widget reuse rules.

Rules:
  - The generated Slint widget catalog must be up to date.
  - Slint component names must not be declared in multiple files.
  - Reusable widget files under a widgets/ directory must carry a DRY:WIDGET tag.

Options:
  --catalog PATH        Catalog path to pass to generate-widget-catalog.sh --check.
  --skip-catalog-check  Run only source-level reuse checks.
  -h, --help            Show this help.
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --catalog)
      if [ "$#" -lt 2 ]; then
        echo "Missing value for $1" >&2
        exit 2
      fi
      CATALOG_OUTPUT="$2"
      shift 2
      ;;
    --skip-catalog-check)
      SKIP_CATALOG_CHECK=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

case "$CATALOG_OUTPUT" in
  /*) ;;
  *) CATALOG_OUTPUT="$PWD/$CATALOG_OUTPUT" ;;
esac

if [ "$SKIP_CATALOG_CHECK" -eq 0 ]; then
  bash "$SCRIPT_DIR/generate-widget-catalog.sh" --check --output "$CATALOG_OUTPUT"
fi

TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/pm-widget-reuse.XXXXXX")"
trap 'rm -rf "$TMP_DIR"' EXIT

SOURCES="$TMP_DIR/sources.txt"
COMPONENTS="$TMP_DIR/components.txt"
TAGS="$TMP_DIR/tags.txt"
DUPLICATES="$TMP_DIR/duplicate-components.txt"
UNTAGGED_WIDGET_FILES="$TMP_DIR/untagged-widget-files.txt"

: > "$SOURCES"
: > "$COMPONENTS"
: > "$TAGS"
: > "$DUPLICATES"
: > "$UNTAGGED_WIDGET_FILES"

find "$REPO_ROOT" \
  \( \
    -path "$REPO_ROOT/.git" -o \
    -path "$REPO_ROOT/Plans" -o \
    -path "$REPO_ROOT/docs" -o \
    -path "$REPO_ROOT/target" -o \
    -path "$REPO_ROOT/node_modules" -o \
    -path "$REPO_ROOT/vendor" -o \
    -path "$REPO_ROOT/dist" -o \
    -path "$REPO_ROOT/build" \
  \) -prune -o \
  -type f -name '*.slint' -print |
  awk -v prefix="$REPO_ROOT/" 'index($0, prefix) == 1 { print substr($0, length(prefix) + 1); next } { print }' |
  LC_ALL=C sort > "$SOURCES"

while IFS= read -r rel_path; do
  abs_path="$REPO_ROOT/$rel_path"

  awk -v file="$rel_path" '
    {
      code = $0
      sub(/[[:space:]]*\/\/.*/, "", code)
      if (code !~ /^[[:space:]]*(export[[:space:]]+)?component[[:space:]]+/) {
        next
      }

      declaration = code
      sub(/^[[:space:]]*/, "", declaration)
      if (declaration ~ /^export[[:space:]]+/) {
        sub(/^export[[:space:]]+/, "", declaration)
      }

      sub(/^component[[:space:]]+/, "", declaration)
      name = declaration
      sub(/[[:space:]:={].*$/, "", name)
      if (name ~ /^[A-Za-z_][A-Za-z0-9_]*$/) {
        print file "|" FNR "|" name
      }
    }
  ' "$abs_path" >> "$COMPONENTS"

  awk -v file="$rel_path" '
    /DRY:WIDGET/ {
      print file "|" FNR
    }
  ' "$abs_path" >> "$TAGS"
done < "$SOURCES"

awk -F'|' '
  {
    count[$3]++
    if (locations[$3] == "") {
      locations[$3] = $1 ":" $2
    } else {
      locations[$3] = locations[$3] ", " $1 ":" $2
    }
  }
  END {
    for (name in count) {
      if (count[name] > 1) {
        print name "|" locations[name]
      }
    }
  }
' "$COMPONENTS" | LC_ALL=C sort > "$DUPLICATES"

awk -F'|' '{ print $1 }' "$TAGS" | LC_ALL=C sort -u > "$TMP_DIR/tag-files.txt"
awk -F'|' '{ print $1 }' "$COMPONENTS" | LC_ALL=C sort -u > "$TMP_DIR/component-files.txt"

while IFS= read -r component_file; do
  case "/$component_file" in
    */widgets/*.slint)
      if ! grep -Fqx "$component_file" "$TMP_DIR/tag-files.txt"; then
        printf '%s\n' "$component_file" >> "$UNTAGGED_WIDGET_FILES"
      fi
      ;;
  esac
done < "$TMP_DIR/component-files.txt"

source_count="$(wc -l < "$SOURCES" | tr -d ' ')"
component_count="$(wc -l < "$COMPONENTS" | tr -d ' ')"
tag_count="$(wc -l < "$TAGS" | tr -d ' ')"
duplicate_count="$(wc -l < "$DUPLICATES" | tr -d ' ')"
untagged_count="$(wc -l < "$UNTAGGED_WIDGET_FILES" | tr -d ' ')"

if [ "$source_count" -eq 0 ]; then
  echo "No Slint source files found; widget reuse check passed."
  exit 0
fi

failures=0

if [ "$duplicate_count" -gt 0 ]; then
  failures=1
  echo "Duplicate Slint component names found:" >&2
  while IFS='|' read -r name locations; do
    printf '  - %s: %s\n' "$name" "$locations" >&2
  done < "$DUPLICATES"
fi

if [ "$untagged_count" -gt 0 ]; then
  failures=1
  echo "Reusable widget files with component declarations need DRY:WIDGET tags:" >&2
  while IFS= read -r component_file; do
    printf '  - %s\n' "$component_file" >&2
  done < "$UNTAGGED_WIDGET_FILES"
fi

if [ "$failures" -ne 0 ]; then
  exit 1
fi

echo "Widget reuse check passed: $source_count Slint source file(s), $component_count component declaration(s), $tag_count DRY widget tag(s)."
