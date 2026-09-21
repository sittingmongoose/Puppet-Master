# What remains after moving the last terminal workgroup

Card ID: `EA-S8-TERMINAL-MOVE-SOURCE-001`

Status: **QUEUED_UNANSWERED**. This card has not been presented for an answer. The existing pending decision remains first under DL-036; this record does not replace it or record consent.

Owner: Section15 terminal semantics, with Final GUI, Storage and command owners. Registered family affected: `terminal.workgroup_moved`. No J248 row is classified by this card.

**Name:** The terminal section left behind by a move.

**Question:** After moving the last workgroup to a new section, should the old section stay empty, receive an empty replacement workgroup, or open a new terminal session?

**Why:** The terminal specification says the old section remains empty and reusable. A later GUI amendment says the same move creates a fresh workgroup, while another current rule says layout movement never creates workgroups, panes or terminal sessions. The current text does not resolve these different results or say whether a replacement group starts a session.

**What you get:** One consistent result for the move, with the moved workgroup's existing panes, sessions, transcript and process ownership preserved. Section and pane limits remain enforced, and the old section is never silently deleted.

**What it costs:** An empty section needs a separate action when you want another terminal there. A replacement group adds a new saved identity. Opening a replacement terminal also starts a new session and requires its own terminal-owner creation, failure and recovery contract within the operation.

**Options:**

1. **Leave the old section empty — recommended.** Show its reusable empty state; creating another workgroup or terminal remains a separate action.
2. **Create an empty replacement workgroup.** Allocate the group only, without starting a new terminal session or PTY. Keep the existing limit fallback to the empty guidance state.
3. **Open a replacement terminal.** Create a replacement group and a new terminal session through the terminal owner. Keep the existing limit fallback to the empty guidance state; never duplicate the moved session.

**Recommendation:** Option 1 keeps a move focused on the existing workgroup and preserves the terminal owner's current empty-state/no-new-session rule. This recommendation is not an approved decision.

**Answer:** ____________________

This card concerns the move only. Reset and recovery do not gain new creation authority from its answer. Until an answer is recorded and applied, no product-dependent reseed behavior, new session creation or completed terminal Event contract is accepted.

Evidence: root adjudication and independent review pinned alongside this card. The independent source package preserves exact whole Git files and unabridged passages, including the strongest later reseed counterevidence. Current product choice is separate from the missing original terminal membership/currentness/move-source contract.

Frozen source card: `/mnt/Cursor/PM-Experiments/terminal-workgroup-source-root-adjudication-20260921/v1/decision-card.md`, SHA-256 `27b5eaace51e985788f23dc9427251a5f9afb946e843c059af24afe24442805e`. Full review manifests are pinned in `step-08-source-composition-review-20260921.md`.

Cost: root and independent source review plus card preparation; monetary attribution unavailable.
