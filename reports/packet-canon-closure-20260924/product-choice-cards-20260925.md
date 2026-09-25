# Packet closure decision cards — 2026-09-25

Status: queued, unanswered

Approve selects the recommended option. To choose a different option, answer Deny with changes and state the change. Ask leaves the card unanswered until it is re-presented. Only your submitted answer counts; no choice is preselected.

## Assistant Chat — Card 1

**Name:** Where your personal dictionary follows you

**Question:** Should words you add to your personal dictionary stay on this installation or be shared between your installations?

**Why it came up:** Assistant Chat’s “Passive spelling and dictionary routing” separates personal and project dictionaries, but does not choose how personal words are shared.

**What you get:** Approving keeps your personal words on this installation, available across your projects, without sending them to another installation.

**What it costs:** Local-only means adding words again elsewhere. Sharing needs an agreed user identity, synchronization, access rules and conflict handling.

**Options:**

- Recommended — Keep personal words local to this installation.
- Share personal words between installations belonging to the same user; define the sharing boundary before enabling it.

**Recommendation:** Local-only for now: it is predictable and private, and does not invent a shared account boundary. This does not change project dictionaries or ordinary spellchecking.

**Answer:**

Sources: Plans/assistant-chat-design.md, “Passive spelling and dictionary routing,” lines 25811–25821; Plans/Settings_System.md §3.1; card PCC-DICTIONARY-001.

## Settings — Card 2

**Name:** What Replace does with settings missing from an import

**Question:** When importing with Replace, should settings missing from the file return to their defaults within the chosen import scope?

**Why it came up:** Settings’ “Transfer preview” requires a reviewed, exact set of changes, but does not say whether Replace resets, preserves or refuses missing values.

**What you get:** Approving makes Replace reset missing ordinary settings within the chosen categories, with every reset shown before applying; settings outside that scope and excluded local or credential values remain untouched.

**What it costs:** Resetting can remove custom choices after you approve the preview. Preserving leaves a mixture of old and imported values. Refusing incomplete files means more preparation before importing.

**Options:**

- Recommended — Reset missing settings inside the chosen scope, after an explicit preview.
- Preserve missing settings, even in Replace mode.
- Refuse Replace unless the file covers every eligible setting in the chosen scope.

**Recommendation:** Reset within the chosen scope: it gives Replace a distinct meaning from Merge while keeping the effects visible and bounded.

**Answer:**

Sources: Plans/Settings_System.md §§3.1–3.3, lines 1199–1215; packet requirement SET-013; card PCC-SETTINGS-REPLACE-001.

## Source Control — Card 3

**Name:** Restoring a stash’s staged changes

**Question:** When applying a saved stash, should you choose whether to restore which changes were staged for the next commit?

**Why it came up:** Source Control’s command and receipt contract preserves the selected stash and an effects preview, but leaves restoration of its staged selections unspecified.

**What you get:** Approving adds an explicit choice to the existing apply flow: restore file changes only, or also restore the stash’s saved staged selections; neither choice is silently assumed.

**What it costs:** An explicit choice adds one decision when applying. Always restoring only files loses the saved staged selection. Always restoring staged selections can change what is prepared for your next commit.

**Options:**

- Recommended — Choose file changes only or file changes plus saved staged selections.
- Always restore file changes only.
- Always restore file changes and saved staged selections.

**Recommendation:** An explicit choice makes both useful behaviors available without borrowing a command-line default. Applying still keeps the stash; it does not become Pop or Delete.

**Answer:**

Sources: Plans/Source_Control_System.md, “Writer Leases, Credential Leases, Commands, Events, And Receipts,” lines 119 and 213–220; Plans/UI_Command_Catalog.md, stash actions; packet ACT-019; card PCC-STASH-APPLY-001.

## Forge Integrations — Card 4

**Name:** Where to check out a review

**Question:** Should checking out a pull request or review always use a separate workspace, or may you explicitly choose your current workspace?

**Why it came up:** Forge Integrations’ selected-command requirements demand an exact checkout preview and protection of local work, but do not choose where the checkout may happen.

**What you get:** Approving opens the reviewed code in a separate workspace, leaving the current workspace and its uncommitted work unchanged.

**What it costs:** Separate workspaces use more disk space and need cleanup. Allowing the current workspace avoids that extra workspace, but needs a clear choice, preview and safeguards against disturbing local work.

**Options:**

- Recommended — Always use a separate workspace for review checkout.
- Also allow an explicitly chosen current-workspace checkout after the existing safety preview.

**Recommendation:** Separate workspaces keep review work isolated and reduce accidental disruption. This changes checkout placement, not merely opening a review page.

**Answer:**

Sources: Plans/Forge_Integrations.md, selected review-checkout requirement, line 589; Plans/Source_Control_System.md, mutation safety; packet ACT-060; card PCC-REVIEW-CHECKOUT-001.

## Usage — Card 5

**Name:** Consistent Ledger search, sorting and export

**Question:** Should the Usage Ledger use the following explicit search, sorting and export rules?

**Why it came up:** Usage’s “Ledger analytics reporting and retention” requires filtering and export, but the remaining search, ordering and selected-versus-visible rules are not fully defined.

**What you get:** Approving uses real recorded project, provider, account, model, run, thread and event-type values for filters; chosen filters must all match. Search is case-insensitive literal text over displayed labels and identifiers, not prompts or secrets. Sort by time, tokens or cost, newest first initially, unknown values last, and stable record identity for ties. Export Selected means exactly the selected records; Export Filtered means all matching records, not just rows currently drawn on screen.

**What it costs:** These rules need query and export tests. Advanced patterns and prompt-content search are excluded. Keeping only existing filters leaves the additional search and export distinctions unavailable.

**Options:**

- Recommended — Adopt this bounded Ledger query and export behavior.
- Keep existing admitted filters only; leave the additional behavior unavailable pending a different proposal.

**Recommendation:** The explicit rules make results reproducible and prevent scrolling from silently changing an export. Old session or tier labels are not guessed into current identities; quota-only rows do not acquire invented run or event identities.

**Answer:**

Sources: Plans/usage-feature.md, UF-010, “Rewrite alignment (2026-02-21),” “Same-frame acknowledgement, bounded lists, and hidden surfaces,” lines 29, 1393 and 6572–6576; card PCC-USAGE-QUERY-001.

## Your answers, ready to paste

Card 1 (PCC-DICTIONARY-001): 

Card 2 (PCC-SETTINGS-REPLACE-001): 

Card 3 (PCC-STASH-APPLY-001): 

Card 4 (PCC-REVIEW-CHECKOUT-001): 

Card 5 (PCC-USAGE-QUERY-001): 
