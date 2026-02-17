#!/usr/bin/env bash
# Install this repo's MCP servers into Cursor's GLOBAL config so Cursor sees them
# regardless of which folder is open or how project root is resolved.
# Run once from this repo: ./scripts/install-mcp-global-cursor.sh

set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CURSOR_DIR="${CURSOR_CONFIG_DIR:-$HOME/.cursor}"
MCP_FILE="$CURSOR_DIR/mcp.json"

mkdir -p "$CURSOR_DIR"

if [[ -f "$MCP_FILE" ]]; then
  cp "$MCP_FILE" "$MCP_FILE.bak"
  echo "Backed up existing config to $MCP_FILE.bak"
fi

cat > "$MCP_FILE" <<EOF
{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "Accept": "text/event-stream"
      }
    },
    "context7-local": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "env": {}
    },
    "gui-automation": {
      "type": "stdio",
      "command": "node",
      "args": ["$REPO_ROOT/scripts/mcp-gui-automation-server.js"],
      "env": {}
    }
  }
}
EOF

echo "Wrote MCP config to: $MCP_FILE"
echo ""
echo "Next: Restart Cursor completely (quit and reopen) so it loads the global config."
echo "Servers installed: context7, context7-local, gui-automation"
