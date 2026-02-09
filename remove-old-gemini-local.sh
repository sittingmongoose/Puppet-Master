#!/bin/bash
# Remove the old Gemini CLI install from /usr/local so your shell uses the
# updated 0.27.2 from /usr/bin (installed via sudo npm install -g).
# Run once: sudo bash remove-old-gemini-local.sh

set -e
rm -f /usr/local/bin/gemini
rm -rf /usr/local/lib/node_modules/@google/gemini-cli
echo "Done. Run: which gemini && gemini --version"
echo "You should see /usr/bin/gemini and 0.27.2"
