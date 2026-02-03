#!/usr/bin/env bash
# Driver: sync repo to Linux, macOS, Windows and run Tauri build on each in parallel.
# Uses env credentials (no credentials in repo):
#   SSH_PASS_LINUX, SSH_PASS_MAC, SSH_PASS_WIN (optional; for sshpass)
#   SUDO_PASS_LINUX (optional; for installing Tauri apt deps on Linux)
#   LINUX_HOST, MAC_HOST, WIN_HOST (optional; defaults below)
#   REMOTE_REPO (optional; default RWM-Puppet-Master in home dir)
#
# Usage: from repo root,
#   export SSH_PASS_LINUX='...' SSH_PASS_MAC='...' SSH_PASS_WIN='...'
#   ./scripts/remote-build-ssh-driver.sh
#
# Or run without passwords if you have SSH keys or agent.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

LINUX_HOST="${LINUX_HOST:-sittingmongoose@192.168.50.72}"
MAC_HOST="${MAC_HOST:-jaredsmacbookair@192.168.50.115}"
WIN_HOST="${WIN_HOST:-sitti@192.168.50.253}"
REMOTE_REPO="${REMOTE_REPO:-RWM-Puppet-Master}"

# sshpass for password auth when SSH_PASS_* set (do not commit passwords)
run_ssh_linux() {
  if [ -n "${SSH_PASS_LINUX:-}" ]; then
    command -v sshpass &>/dev/null || { echo "Install sshpass (e.g. apt install sshpass)" >&2; exit 1; }
    sshpass -p "$SSH_PASS_LINUX" ssh -o StrictHostKeyChecking=accept-new "$LINUX_HOST" "$@"
  else
    ssh -o StrictHostKeyChecking=accept-new "$LINUX_HOST" "$@"
  fi
}
run_scp_linux() {
  if [ -n "${SSH_PASS_LINUX:-}" ]; then
    sshpass -p "$SSH_PASS_LINUX" scp -o StrictHostKeyChecking=accept-new "$@"
  else
    scp -o StrictHostKeyChecking=accept-new "$@"
  fi
}
run_ssh_mac() {
  if [ -n "${SSH_PASS_MAC:-}" ]; then
    sshpass -p "$SSH_PASS_MAC" ssh -o StrictHostKeyChecking=accept-new "$MAC_HOST" "$@"
  else
    ssh -o StrictHostKeyChecking=accept-new "$MAC_HOST" "$@"
  fi
}
run_scp_mac() {
  if [ -n "${SSH_PASS_MAC:-}" ]; then
    sshpass -p "$SSH_PASS_MAC" scp -o StrictHostKeyChecking=accept-new "$@"
  else
    scp -o StrictHostKeyChecking=accept-new "$@"
  fi
}
run_ssh_win() {
  if [ -n "${SSH_PASS_WIN:-}" ]; then
    sshpass -p "$SSH_PASS_WIN" ssh -o StrictHostKeyChecking=accept-new "$WIN_HOST" "$@"
  else
    ssh -o StrictHostKeyChecking=accept-new "$WIN_HOST" "$@"
  fi
}
run_scp_win() {
  if [ -n "${SSH_PASS_WIN:-}" ]; then
    sshpass -p "$SSH_PASS_WIN" scp -o StrictHostKeyChecking=accept-new "$@"
  else
    scp -o StrictHostKeyChecking=accept-new "$@"
  fi
}

TARBALL="/tmp/pm-sync-$$.tar.gz"
cleanup_tarball() { rm -f "$TARBALL"; }
trap cleanup_tarball EXIT

echo "Creating sync tarball (excluding node_modules, dist, .git, .claude, src-tauri/target, ...)..."
tar czf "$TARBALL" \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=installer-work \
  --exclude=.puppet-master \
  --exclude=.git \
  --exclude=.claude \
  --exclude=src-tauri/target \
  -C "$REPO_ROOT" .

sync_and_build_linux() {
  echo "[Linux] Copying tarball..."
  run_ssh_linux "mkdir -p ~/$REMOTE_REPO"
  run_scp_linux -q "$TARBALL" "$LINUX_HOST:~/pm-sync.tar.gz"
  echo "[Linux] Extracting and building..."
  run_ssh_linux "cd ~/$REMOTE_REPO && tar xzf ~/pm-sync.tar.gz && rm ~/pm-sync.tar.gz && chmod +x scripts/remote-build-linux.sh && SUDO_PASS='${SUDO_PASS_LINUX:-}' bash scripts/remote-build-linux.sh"
  echo "[Linux] Done."
}

sync_and_build_mac() {
  echo "[Mac] Copying tarball..."
  run_ssh_mac "mkdir -p ~/$REMOTE_REPO"
  run_scp_mac -q "$TARBALL" "$MAC_HOST:~/pm-sync.tar.gz"
  echo "[Mac] Extracting and building..."
  run_ssh_mac "cd ~/$REMOTE_REPO && tar xzf ~/pm-sync.tar.gz && rm ~/pm-sync.tar.gz && chmod +x scripts/remote-build-macos.sh && bash scripts/remote-build-macos.sh"
  echo "[Mac] Done."
}

sync_and_build_win() {
  echo "[Windows] Copying tarball..."
  run_ssh_win "if not exist \"C:\\Users\\sitti\\$REMOTE_REPO\" mkdir \"C:\\Users\\sitti\\$REMOTE_REPO\""
  run_scp_win -q "$TARBALL" "$WIN_HOST:pm-sync.tar.gz"
  echo "[Windows] Extracting and building..."
  run_ssh_win "cd /d \"C:\\Users\\sitti\\$REMOTE_REPO\" && tar xzf C:\\Users\\sitti\\pm-sync.tar.gz -C \"C:\\Users\\sitti\\$REMOTE_REPO\" && del C:\\Users\\sitti\\pm-sync.tar.gz && powershell -ExecutionPolicy Bypass -File \"C:\\Users\\sitti\\$REMOTE_REPO\\scripts\\remote-build-windows.ps1\""
  echo "[Windows] Done."
}

echo "Starting parallel builds (Linux, Mac, Windows)..."
sync_and_build_linux & P1=$!
sync_and_build_mac   & P2=$!
sync_and_build_win  & P3=$!

FAIL=0
wait $P1 || FAIL=1
wait $P2 || FAIL=1
wait $P3 || FAIL=1

if [ $FAIL -eq 0 ]; then
  echo "All three builds completed successfully."
else
  echo "One or more builds failed (see above)."
  exit 1
fi
