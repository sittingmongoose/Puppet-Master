# SafePoint summary retention clock

Card ID: `EA-S8-SAFEPOINT-SUMMARY-CLOCK-001`

Status: **QUEUED_UNANSWERED**. This card has not been presented for an answer. The existing pending decision remains first under DL-036; this record neither replaces it nor records consent.

Owner: Storage, with FileSafe. Registered family affected: `safe_point.recovery_unavailable`. No J248 row is classified by this card.

**Name:** When the 365-day SafePoint summary window starts.

**Question:** Should the small hash summary left after eligible SafePoint cleanup be kept for 365 days after that summary is first durably saved, or should its clock start when the SafePoint's last hold was released?

**Why:** Storage already specifies 90 days after the last hold release for a full SafePoint and 365 days for its retained hash summary. It does not name the summary's clock anchor. Cleanup can happen later than the earliest eligible date, so the choice changes when summary evidence can disappear. DL-045 permits technical bindings but leaves retention/deletion policy choices to Jared.

**What you get:** One explicit rule for when the existing content-free summary becomes eligible for cleanup, with the original timestamp preserved across retries and recovery. Existing holds still block cleanup.

**What it costs:** Starting at summary publication keeps the small summary longer when cleanup is delayed. Starting at hold release can leave less than 365 days of summary availability after full SafePoint cleanup, and a sufficiently delayed cleanup can produce an immediately age-eligible summary. Neither option keeps a full snapshot for an extra 365 days or changes the existing 90-day full-SafePoint minimum.

**Options:**

1. **First durable summary publication — recommended.** Keep the summary for 365 days after its first successful durable publication. Preparation and retries do not start or reset the clock.
2. **Last hold release.** Use the SafePoint's final durable hold-release instant for the summary's 365-day clock as well; current holds continue to override age eligibility.
3. **Specify another rule.** Name the intended anchor explicitly for Storage to implement and validate.

**Recommendation:** Option 1 gives the stated retained summary a full 365-day window after it exists and has a concrete durable boundary. This recommendation is not an approved policy.

**Answer:** ____________________

Until answered and applied, the proposed summary policy and native summary expiry/purge remain unadmitted. Unresolved summary publication cannot authorize destruction of its required source evidence. Existing event membership, retention policy objects, hold rules and the full SafePoint window remain unchanged.

Evidence: `Plans/storage-plan.md`, Case L-3, **Retention authority and defaults**, specifies “retained hash summary 365 days” and inclusive expiry at anchor plus TTL. `Plans/Decision_Log.md`, DL-045, reserves retention/deletion choices. Exact current source spans, hashes, the external clock search and frozen proposal are recorded in `step-08-safe-point-summary-clock-review.json` alongside this card. The search establishes an absent explicit clock within its declared scope, not a repository-wide proof of absence.

Step 8 remains incomplete. This records one registered-family product blocker; it admits no event or physical family, changes no frozen accounting, and claims no native, readiness or governance result.

Cost: root source adjudication and card preparation; no native runs. Exact billed cost is not available in the task tools.
