## C. SSH Remote Dev Servers

Puppet Master supports running projects on remote servers accessed via SSH. When a
project is configured for a remote, all Git operations, file browsing, and agent execution
occur on the remote machine; the Puppet Master UI runs locally.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/WorktreeGitImprovement.md

---

### C.1 Adding an SSH Target

**Entry point:** Settings → SSH Remotes → "Add Remote"

This flow MUST NOT require the Chain Wizard.

ContractRef: ContractName:Plans/chain-wizard-flexibility.md, PolicyRule:Decision_Policy.md§2

**GUI flow (sequential steps, no branching ambiguity):**

**Step 1 — Required fields (all REQUIRED; form MUST NOT advance until all are valid):**

| Field | Type | Validation | Default |
|---|---|---|---|
| Host | text | Valid hostname or IP address | *(none)* |
| User | text | Non-empty, no whitespace | *(none)* |
| Auth method | select | `ssh_key` or `ssh_agent` | `ssh_key` |
| Remote folder | text | Absolute path (starts with `/`) | *(none)* |
| Nickname | text | Non-empty; auto-suggested as `user@host` | `user@host` |

ContractRef: PolicyRule:Decision_Policy.md§2

**Step 2 — Optional fields:**

| Field | Type | Default |
|---|---|---|
| SSH port | integer | `22` |
| Proxy jump host | text | *(empty = no jump)* |

ContractRef: PolicyRule:Decision_Policy.md§2

**Step 3 — Auth method detail (conditional on Step 1 auth method selection):**

- `ssh_key` selected: show a key-file picker listing key files found in `~/.ssh/` (files
  matching `id_*`, `*.pem`, `*.key`); user may also browse for any file. MUST NOT require
  the user to enter a passphrase here; the OS SSH agent or OS keychain handles passphrases.
  ContractRef: PolicyRule:no_secrets_in_storage, Invariant:INV-002
- `ssh_agent` selected: no additional input required; Puppet Master uses the running SSH
  agent (`$SSH_AUTH_SOCK`).
  ContractRef: PolicyRule:Decision_Policy.md§2

**Step 4 — Validation:**

Puppet Master MUST attempt a validation connection before saving. The connection test MUST
execute: `ssh -q -o BatchMode=yes -o ConnectTimeout=10 [-p <port>] [-J <jump>] <user>@<host> exit`.

ContractRef: PolicyRule:Decision_Policy.md§2

Validation MUST report one of the following deterministic outcomes:

| Outcome | Display text | Action(s) |
|---|---|---|
| Success | `Connection successful — remote is reachable` | `Save` |
| Connection refused | `Port closed or SSH not running on host` | `Back`, `Retry` |
| Auth failed | `Auth failed — check key or user` | `Back`, `Retry` |
| Host key mismatch | `Host key changed — verify and accept or reject` | `Accept` (saves key), `Reject` (cancels) |
| Timeout | `Connection timed out` | `Back`, `Retry` |

ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

- The `Accept` action for host key mismatch MUST present the new key fingerprint for user
  review before accepting. MUST NOT auto-accept changed host keys.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

**Step 5 — Save:**

On successful validation, the SSH remote MUST be saved to redb under the key
`ssh_remotes/{id}` where `{id}` is a stable UUID generated at save time.

ContractRef: ConfigKey:ssh_remotes, ContractName:Plans/storage-plan.md, PolicyRule:Decision_Policy.md§2

The saved record MUST contain: `id`, `nickname`, `host`, `port`, `user`, `auth_method`,
`key_path` (if `ssh_key`), `remote_folder`, `jump_host` (if set). MUST NOT contain
passphrases or private key content.

ContractRef: PolicyRule:no_secrets_in_storage, Invariant:INV-002

---

### C.2 Managing SSH Targets

**Entry point:** Settings → SSH Remotes

- The SSH Remotes settings page MUST list all saved remotes as a table with columns:
  Nickname, Host, User, Status badge.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003
- Status badge per remote (deterministic set):
  ContractRef: PolicyRule:Decision_Policy.md§2

  | Badge | Display | Condition |
  |---|---|---|
  | `connected` | ✓ Connected | Last test or active session succeeded |
  | `disconnected` | ○ Disconnected | Not tested; or session ended cleanly |
  | `error` | ✕ Error · <reason> | Last test or session failed |

- Per-remote actions (right-click or row action menu): `Edit`, `Remove`, `Test connection`,
  `Set as active`.
  ContractRef: UICommand:cmd.ssh.remote_edit, UICommand:cmd.ssh.remote_remove, UICommand:cmd.ssh.remote_test, UICommand:cmd.ssh.remote_set_active, Invariant:INV-011
- **Test connection:** re-runs the validation check from §C.1 Step 4 and updates the
  status badge with the result. MUST complete within 15 seconds; on timeout, show
  `Connection timed out` with `Retry`.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003
- **Remove:** prompts `Remove remote "<nickname>"? This will not affect the remote server.`
  with `Remove` (confirm) and `Cancel`. MUST NOT remove any files from the remote.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

---

### C.3 Remote Project Context

When a project is configured to use an SSH remote, the following rules MUST apply:

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, PolicyRule:Decision_Policy.md§2

**Git Panel:**

- The status bar working folder MUST display `user@host:remote/path`.
  ContractRef: PolicyRule:Decision_Policy.md§2
- All `git` commands MUST be executed on the remote via SSH subprocess:
  `ssh [-p <port>] [-J <jump>] <user>@<host> "cd <remote_folder> && git <args>"`.
  MUST NOT run `git` locally for remote-mode projects.
  ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/WorktreeGitImprovement.md

**File Manager:**

- The file tree MUST show the remote filesystem. File listing MUST use SFTP or an
  SSH `find`/`ls` pipeline; the choice is implementation-defined (deterministic default:
  SFTP when available, SSH pipeline as fallback).
  ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/FileManager.md
- File edits MUST be applied on the remote (write via SFTP or heredoc over SSH).
  MUST NOT create a local checkout for remote-mode projects.
  ContractRef: PolicyRule:Decision_Policy.md§2

**Terminal:**

- The local terminal tab MUST open an SSH session to the remote; no local shell MUST be
  opened for remote-mode projects.
  ContractRef: PolicyRule:Decision_Policy.md§2

**Agents and execution:**

- Puppet Master agents MUST run on the remote machine, not locally, in remote mode.
  ContractRef: PolicyRule:Decision_Policy.md§2

---

### C.4 Tool & Provider Execution on Remote

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, PolicyRule:Decision_Policy.md§2

- **Git operations:** run via SSH command on remote as specified in §C.3.
  ContractRef: ContractName:Plans/WorktreeGitImprovement.md
- **File browsing:** SFTP or SSH `find`/`ls` pipeline (deterministic default: SFTP when
  available; SSH pipeline as fallback).
  ContractRef: PolicyRule:Decision_Policy.md§2
- **AI provider CLIs:** MUST be installed on the remote machine. Puppet Master MUST invoke
  them via SSH subprocess and MUST stream stdout/stderr back over SSH to the local UI in
  real time.
  ContractRef: PolicyRule:Decision_Policy.md§2
- Error — provider CLI not found on remote: show
  `Provider CLI not found on remote — install <provider_name> on <host>` with a `Dismiss`
  action. MUST NOT attempt to install the CLI automatically without explicit user consent.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003
- Error — SSH session drops mid-run: show `SSH session lost — reconnecting…` and
  auto-retry the connection once (bounded: 1 auto-retry, then show `Reconnect` button for
  manual retry). MUST NOT silently swallow the disconnect.
  ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

---

