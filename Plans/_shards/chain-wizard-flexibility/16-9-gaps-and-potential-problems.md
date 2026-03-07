## 9. Gaps and Potential Problems

### 9.1 Flow and State

- **Intent change mid-flow:** If user switches intent after entering requirements or interview, we need a clear policy: reset requirements and interview state, or prompt and allow keep/discard. Recommend: "Changing intent will clear requirements and interview progress; continue?" and then reset.
  **Resolution:** Show modal: "Changing intent will clear requirements and interview progress. Continue?" [Continue] [Cancel]. On Continue: clear requirements list, canonical path, Builder handoff flag, interview state; set wizard step to project setup; keep project_path and intent (new value). On Cancel: close modal, no change.

- **Recovery with intent:** Recovery snapshot (newfeatures §4) must include `intent` and `wizard_step` so we don't restore to "New project" when the user was in "Contribute (PR)."
  **Resolution:** Recovery snapshot schema includes `intent` (enum) and `wizard_step` (step index or id). Restore logic uses these when rehydrating; never default to New project when snapshot has Contribute (PR).

- **Builder and Interview in one session:** If user opens Builder, hands off, then we go to Interview, ensure project path and intent are still set when Interview starts (no stale "no project" state).
  **Resolution:** On handoff from Builder, persist project_path and intent in the same state used by Interview. When transitioning to Interview step, pass or read that state; Interview initialization must not overwrite with empty/default. Add assertion or guard: if handoff occurred, project_path and intent are required.

### 9.2 Requirements and Builder

- **Multiple uploads + Builder:** If we allow both "upload 2 files" and "Builder output," merge order and precedence must be defined (e.g. uploads first, Builder last, or "Builder replaces" for MVP).
  **Resolution:** Merge order: uploaded files first (in list order), then Builder output appended. Single canonical doc = merge(uploads, builder_path) → path. Precedence: later in merge order wins on conflicting sections if we do semantic merge; for MVP concatenate with section separators and document "uploads first, Builder last."

- **Builder output format:** Template for Builder output (sections, headings) should be defined so PRD generator and Interview can rely on structure. Otherwise we risk inconsistent parsing.
  **Resolution:** Define and document a single Builder output template: required top-level sections (e.g. Scope, Goals, Out of scope, Acceptance criteria, Non-goals). Assistant/Builder prompt and any post-processing must emit this structure. PRD generator and Interview assume this template; add a validation step that warns if sections are missing.

- **Abandonment:** Builder opened but never "hand off" leaves requirements step incomplete. Consider timeout or "Cancel and return to requirements" with no save.
  **Resolution:** Provide explicit "Cancel and return to requirements" control (no save). Optionally: after a configured idle timeout (e.g. 30 minutes), show a prompt "Return to requirements without saving?" [Yes] [No]. No automatic save or handoff.

### 9.3 Interview and Phases

- **Phase selector failure:**

**Phase Selector Failure Fallback (Resolved):**
If the selector returns an invalid/empty plan or fails to respond:
1. Use the deterministic per-intent fallback from §6.3 (all phases Full for New/Fork/Enhance; Contribute = Scope + Architecture + Testing at Short depth).
2. Log the failure as a `phase_selector.fallback` seglog event with the original error and the normalized fallback plan.
3. Surface a warning in the interview UI: "Phase selection used fallback. You can manually adjust the phase checklist if needed."
4. Never synthesize an ad-hoc phase subset outside the canonical fallback table.
5. If fallback phases also fail to execute, surface an error to the user and halt the interview.

- **Depth semantics:** "Short" vs "full" depth must be defined per phase (e.g. "short = 1-2 questions") so the Interview agent has clear instructions.
  **Resolution:** Full = all questions for phase, research if configured. Short = max 2 questions for that phase, no research. Skip = do not run phase. Document in phase manager and interviewer prompt; enforce cap in phase runner (e.g. question count or token budget for Short).

- **Resume with adaptive phases:** If we add "resume interview" (newfeatures §14), stored state must include the **phase plan** so we don't re-run phase selection and change the set on resume.
  **Resolution:** Interview state (and/or `.puppet-master/interview/phase_plan.json`) stores `phase_plan`. On resume, load phase_plan from state and run only those phases/depths; do not call phase selector again.

### 9.4 GitHub and Fork/PR

- **Auth scope:** Fork creation and PR creation may require different scopes (e.g. `repo`, `workflow`). Document required scopes and surface "Permission denied" clearly.
  **Resolution:** Document required GitHub scopes (e.g. `repo` for fork/create/PR; add to Doctor/Setup or docs). On API permission errors, show user-facing message: "Permission denied: ensure GitHub token has repo (and workflow if needed) scope" with link to token settings.

- **Upstream default branch:** We assume upstream default branch is `main` or `master`; we should detect it (GitHub API: `GET /repos/{owner}/{repo}` → `default_branch`) when opening the PR so we target the correct branch.
  **Resolution:** Before opening PR, call GitHub API `GET /repos/{owner}/{repo}` and use the returned `default_branch` as PR target. Do not hardcode `main` or `master`.

- **Conflict with WorktreeGitImprovement:** Orchestrator may create worktrees and branches for tiers; "Contribute (PR)" uses a single feature branch. Ensure we don't create a worktree that clashes with the user's feature branch.
  **Resolution:** Contribute (PR) flow uses the main clone's feature branch for user work. Tier/worktree orchestration (if any) uses separate worktrees or branches; document that PR branch is the user-facing branch and is not replaced by orchestrator worktrees. Implementation: PR branch is the checked-out branch in the single clone; worktrees for subtasks (if used) are distinct and do not replace the PR branch ref.

### 9.5 GUI and UX

- **Wizard length:** Adding intent selection and more project setup may make the wizard feel longer. Consider **progress indicator** (e.g. "Step 1 of N") and optional **skip** for advanced users.
  **Resolution:** Add a progress indicator showing current step index and total (e.g. "Step 2 of 6"). Skip-to-execution ("I already have requirements and prd.json") is deferred to a later phase; document as future work.

- **Agent activity and progress (§3.5):** Implement embedded **agent activity view** and **progress indicator** for Requirements Doc Builder and Multi-Pass Review.
  **Resolution:** Implement one shared "agent activity view" component (non-interactive, streaming). Use it on the requirements/wizard page for Builder and Multi-Pass Review (requirements), and on the Interview page for document creation and Multi-Pass Review (interview). Progress indicator shows current document/step and remaining count. Provide pause, cancel, resume; persist "in progress" in recovery so user sees "interrupted" and can resume or start over.
- **Agent activity pane (layout and a11y):** Minimum pane height: 120px when embedded in wizard or Interview. Max visible lines in stream: 500 (then virtualize or "Show older"). Use monospace font for stream content. Progress bar or status strip must have `aria-live="polite"` and `role="progressbar"` with `aria-valuenow` / `aria-valuemax` when determinate; announce state changes (e.g. "Review pass 2 of 3") to screen readers. Pause/Cancel/Resume buttons must be keyboard-focusable and have clear labels for assistive tech. When reduced-motion is preferred, do not animate progress bar fill; use instant updates.

- **Accessibility:** Intent selection and new buttons (Builder, Create fork, Open PR) must be keyboard-accessible and screen-reader friendly.
  **Resolution:** Use existing widget catalog and patterns; ensure focus order, labels, and ARIA where needed. All new controls must be focusable and activatable via keyboard; screen reader text for intent options and primary actions.

- **i18n:** New strings (intent labels, buttons, help text) should be in a place that supports future localization.
  **Resolution:** Put all new user-facing strings in a single module or resource file (e.g. `strings.rs` or locale files) keyed by id; no inline hardcoded strings in view code for these features.

### 9.6 Security and Safety

- **No secrets in handoff:** Requirements doc and Builder output must not be used to pass tokens or secrets; Interview and PR body must not include them (MiscPlan §3.6).
  **Resolution:** Builder and Interview do not accept or embed tokens/secrets in generated docs. PR body template (WorktreeGitImprovement/MiscPlan) must not include secrets; sanitize or exclude sensitive fields before opening PR. Add checklist item in implementation: no secrets in requirements doc, Builder output, or PR body.

- **Fork/PR from untrusted upstream:** We don't execute code from upstream; we only clone and create a branch.
  **Resolution:** Document clearly: we only clone and create a branch; we do not run upstream scripts or hooks during fork/clone. No execution of code from upstream; low risk. No code change required beyond documentation.

### 9.7 Summary of Gaps to Resolve in Implementation

- Define **merge order and precedence** for multiple uploads + Builder.
  **Resolution:** See §9.2 (merge order: uploads first, Builder last; canonical = merge result).

- Define **Builder output template** (sections).
  **Resolution:** See §9.2 (required sections: Scope, Goals, Out of scope, Acceptance criteria, Non-goals).

- Define **phase selector** output schema and **depth** semantics per phase.
  **Resolution:** See §6.3 (PhasePlanEntry, depth Full/Short/Skip, fallback by intent).

- Define **fallback** when phase selector fails.
  **Resolution:** See §6.3 and §9.3 (rule-based by intent, no re-invoke).

- Document **GitHub auth scopes** and **upstream default branch** detection.
  **Resolution:** See §9.4 (scopes in docs/Doctor; detect default branch via GitHub API `GET /repos/{owner}/{repo}`).

- Add **intent** and **wizard_step** to recovery snapshot.
  **Resolution:** See §9.1 (recovery schema includes intent and wizard_step).

- Define **"intent change mid-flow"** policy and UI.
  **Resolution:** See §9.1 (modal Continue/Cancel; clear requirements and interview state on Continue).

- Implement **agent activity view** and **progress indicator** (§3.5); **pause, cancel, resume** and recovery.
  **Resolution:** See §9.5 (single shared component, placement, pause/cancel/resume, recovery state).

---

