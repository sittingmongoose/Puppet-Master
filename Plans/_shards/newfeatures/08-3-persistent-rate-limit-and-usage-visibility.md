## 3. Persistent Rate Limit and Usage Visibility

### 3.1 Concept

**Always-visible usage metrics** (e.g. 5-hour and 7-day windows) in the UI, so the user does not have to run a manual "usage" command. Data comes from the same sources we already use (or will use): platform-specific APIs or error-message parsing, refreshed in the background.

### 3.2 Relevance to Puppet Master

We already have "Usage Tracking & Plan Detection" in AGENTS.md and usage-related code. This idea is about **persistent visibility** in the GUI:

- **Dashboard or header:** Show 5h/7d usage (and optionally plan type) for the selected platform(s).
- **Tier config / setup:** When choosing a platform for a tier, show current usage so the user can avoid platforms near limit.
- **Alerts:** Optional warning when approaching limit (e.g. 80% of 5h window), so the user can switch tier or pause.

### 3.3 Implementation Directions

- **Data layer:** Reuse and extend existing usage/plan-detection logic; ensure we have a clear "current usage" API (per platform) that the GUI can poll or subscribe to.
- **State-file-first:** Prefer aggregating from `.puppet-master/usage/usage.jsonl` (and optional `summary.json`) for 5h/7d and ledger; platform APIs augment when env vars are set. **See Plans/usage-feature.md** for full scope, GUI placement options, and current gaps (5h/7d not in GUI, ledger vs usage_tracker schema, alert threshold); that plan is the single source for Usage feature scope and acceptance.
- **GUI:** Add a small "usage" widget (e.g. in header or dashboard) that shows at least "5h: X / Y" and "7d: X / Y" and, if available, "Plan: ...". Use existing widgets (e.g. `status_badge`, `selectable_label`) for consistency.
- **Refresh:** Background refresh (e.g. every few minutes or after each run) so the numbers stay up to date without blocking the main thread.
- **No new backends:** Prefer existing mechanisms (Admin API, Copilot metrics, Gemini quotas, Codex/Gemini error parsing). Document which platforms support "live" vs "after-run" stats.

---

