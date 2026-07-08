# Shard 002: Canonical owner-section requirements

Source: `Plans/GitHub_Integration.md`

Source lines: L4-L30

Source SHA256: `6859cad9e197dd144a2ce1ef3d0be988354d8527b30ccaf5bf7abc22f0cefcf8`

---

## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Source Control and worktree handshake


### GitHub stable account identity


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

<!--
PUPPET MASTER -- GITHUB INTEGRATION SPEC

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).

LOCKED DECISIONS (DO NOT CHANGE IN THIS DOC):
- GitHub operations: GitHub API provider only; no external auth-shell dependency
- Default auth flow: OAuth device-code (realm: github_api)
- No secrets in seglog/redb/Tantivy or logs; secrets live only in OS credential store
- Local git operations use the local `git` binary (not the GitHub API)
- SSH remote execution: git commands run on the remote via SSH subprocess
- All interactive UI elements dispatch UICommand IDs; no business logic in the UI layer
-->
