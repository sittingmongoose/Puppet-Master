#!/usr/bin/env bash
# Add this repo's MCP servers to Claude Code USER scope in ~/.claude.json
# so the EXTENSION sees them regardless of which path Cursor reports as workspace.
# CLI uses cwd to find .mcp.json; extension uses Cursor's workspace path — they can differ.
# Run once: ./scripts/add-claude-user-mcp.sh

set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLAUDE_JSON="${CLAUDE_JSON:-$HOME/.claude.json}"

if [[ ! -f "$CLAUDE_JSON" ]]; then
  echo "No $CLAUDE_JSON found. Run 'claude' once to create it, then run this script again."
  exit 1
fi

BACKUP="$CLAUDE_JSON.bak.$(date +%Y%m%d%H%M%S)"
cp "$CLAUDE_JSON" "$BACKUP"
echo "Backed up to $BACKUP"

export CLAUDE_JSON REPO_ROOT
node -e "
var fs = require('fs');
var path = require('path');
var p = process.env.CLAUDE_JSON || path.join(process.env.HOME, '.claude.json');
var repo = process.env.REPO_ROOT;
var j = JSON.parse(fs.readFileSync(p, 'utf8'));
j.mcpServers = j.mcpServers || {};
Object.assign(j.mcpServers, {
  'context7': {
    type: 'http',
    url: 'https://mcp.context7.com/mcp',
    headers: { 'Accept': 'text/event-stream' }
  },
  'context7-local': {
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@upstash/context7-mcp'],
    env: {}
  },
  'gui-automation': {
    type: 'stdio',
    command: 'node',
    args: [repo + '/scripts/mcp-gui-automation-server.js'],
    env: {}
  }
});
fs.writeFileSync(p, JSON.stringify(j, null, 2));
console.log('Added context7, context7-local, gui-automation to top-level mcpServers in', p);
"

echo "Done. Restart Cursor and open a new Claude Code session; run /mcp to confirm."
