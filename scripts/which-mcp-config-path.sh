#!/usr/bin/env bash
# Show where MCP config files are and which path to open in Cursor so the app sees them.
# Run from anywhere; script finds repo root.

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

echo "=== MCP config file locations (repo root) ==="
echo "Repo root: $REPO_ROOT"
echo ""

for name in ".mcp.json" "mcp.json" ".cursor/mcp.json" ".claude/mcp.json"; do
  if [[ -f "$REPO_ROOT/$name" ]]; then
    echo "  EXISTS  $name"
  else
    echo "  MISSING $name"
  fi
done

echo ""
echo "=== So the app sees the right file ==="
echo "1. In Cursor: File → Open Folder → choose this path:"
echo "   $REPO_ROOT"
echo ""
echo "2. Do NOT open a parent folder (e.g. 'Cursor' or 'home')."
echo "   The workspace root must be this folder so the app looks for"
echo "   .mcp.json / mcp.json / .cursor/mcp.json here."
echo ""
echo "3. After opening, restart Cursor or reload the window."
echo ""
