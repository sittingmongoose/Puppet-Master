#!/usr/bin/env bash
# Add project MCP servers to Claude Code USER scope so the extension sees them
# even when project .mcp.json is not loaded (e.g. in Cursor).
# Run once: ./scripts/setup-claude-mcp-user-scope.sh

set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if ! command -v claude &>/dev/null; then
  echo "Claude CLI not found. Install: npm install -g @anthropic-ai/claude-code"
  exit 1
fi

echo "Adding MCP servers to Claude user config (scope=user)..."

# Context7 HTTP (remote)
claude mcp add --transport http --scope user context7 https://mcp.context7.com/mcp 2>/dev/null || true

# Context7 local (stdio) - use npx so it works from any cwd
claude mcp add --transport stdio --scope user context7-local -- npx -y @upstash/context7-mcp 2>/dev/null || true

# GUI automation - must run from repo root; use full path
claude mcp add --transport stdio --scope user gui-automation -- node "$REPO_ROOT/scripts/mcp-gui-automation-server.js" 2>/dev/null || true

echo "Done. List with: claude mcp list"
claude mcp list
