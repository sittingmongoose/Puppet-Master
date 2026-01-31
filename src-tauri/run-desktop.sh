#!/bin/bash
# Helper script to run Puppet Master with Tauri desktop wrapper
#
# Usage: ./src-tauri/run-desktop.sh [--url URL]

set -e

# Default URL
URL="${PUPPET_MASTER_URL:-http://127.0.0.1:3847}"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --url)
      URL="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--url URL]"
      exit 1
      ;;
  esac
done

echo "================================================"
echo "  Puppet Master Desktop (Tauri v2)"
echo "================================================"
echo ""
echo "Server URL: $URL"
echo ""

# Check if server is running
if ! curl -s -f -o /dev/null "$URL"; then
  echo "⚠️  GUI server not detected at $URL"
  echo ""
  echo "Starting GUI server..."
  echo ""
  
  # Start GUI server in background
  npm run gui &
  SERVER_PID=$!
  
  echo "Waiting for server to start..."
  for i in {1..30}; do
    if curl -s -f -o /dev/null "$URL"; then
      echo "✅ Server is ready!"
      break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
      echo "❌ Server failed to start after 30 seconds"
      kill $SERVER_PID 2>/dev/null || true
      exit 1
    fi
  done
  echo ""
fi

echo "Starting Tauri desktop application..."
echo ""

# Start Tauri with custom URL
PUPPET_MASTER_URL="$URL" npm run tauri:dev

# Cleanup: kill server if we started it
if [ -n "$SERVER_PID" ]; then
  echo ""
  echo "Stopping GUI server..."
  kill $SERVER_PID 2>/dev/null || true
fi
