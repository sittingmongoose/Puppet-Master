## 13. Enhancements

### 13.1 Git Destructive Commands Guard

Extend bash guard to block destructive git commands:

```rust
// Add to destructive-commands.txt
git\s+reset\s+--hard
git\s+push\s+.*--force
git\s+push\s+.*-f
git\s+branch\s+-D
git\s+clean\s+-fd
```

### 13.2 SQL Injection Pattern Detection

Detect SQL injection attempts in prompts:

```rust
// DRY:FN:check_sql_injection — Detect SQL injection patterns
pub fn check_sql_injection(prompt: &str) -> Result<(), GuardError> {
    // Check for common SQL injection patterns
    // UNION SELECT, DROP TABLE, etc.
}
```

### 13.3 Rate Limiting for Blocked Commands

**Enhancement:** If an agent repeatedly tries destructive commands, temporarily increase guard strictness or block the agent.

```rust
// DRY:DATA:GuardRateLimiter — Rate limit guard violations
pub struct GuardRateLimiter {
    violations: HashMap<String, Vec<DateTime<Utc>>>,
    max_violations: usize,
    window_seconds: i64,
}
```

### 13.4 GUI Integration (configurable, easy on/off)

FileSafe settings must be **configurable in the GUI** and **easy to turn on or off**. All FileSafe controls live in one place (dedicated FileSafe tab or clearly grouped section).

**Required:**
- **Single entry point:** One FileSafe section or tab in Config. User can open it and see all FileSafe toggles at a glance.
- **Granular controls:** Separate on/off per feature so the user can enable only what they need:
  - **Command blocklist** -- "Block destructive commands" (on/off). When off, destructive CLI commands are not blocked.
  - **Write scope** -- "Restrict writes to plan" (on/off). When off, writes are not restricted to plan-declared files.
  - **Security filter** -- "Block sensitive files" (on/off). When off, access to `.env`/credentials is not blocked.
  Each feature can be toggled independently; optional sub-options (e.g. strict mode for Write scope, allow-during-interview for Security filter) stay under that feature's subsection.
- **Override:** "Allow destructive commands" (with prominent warning) for Command blocklist.
- **Optional:** Pattern path override, "Allow sensitive files during interview" for Security filter.
- **Optional:** Pattern management (view/edit), event log viewer (browse blocked commands).

**Approved-commands list (Assistant chat):**
- When a command is blocked by the Command blocklist in Assistant chat, the user can **approve this run** and optionally **add to approved list**. Approved commands are stored in settings and are then allowed by the command blocklist (whitelist overrides blocklist for matching commands).
- In Config (FileSafe section), the user can **view** the list of approved commands, **remove** entries, and (optionally) **add** entries manually. List is persisted (e.g. in `puppet-master.yaml` under `filesafe.approvedCommands` or a dedicated file).
- Implementation: Command blocklist checks the approved list before blocking; exact match or normalized match (e.g. strip extra whitespace) counts as approved. UX: In chat, show "Blocked: &lt;command&gt;" with actions "Approve once" and "Approve and add to list"; in settings, show scrollable list with remove button per row.

**Widget reuse:** Use existing widgets from `src/widgets/` per DRY Method.

---

