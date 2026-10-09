# Critic pass on draft.md

**Critique target:** draft SHA-256 a469d8443c5d50c92c6a682619ba9d4103877e10832ee1c5f0e8c434dc684597  
**Pass:** completed 2026-10-09, before revision  
**Method note:** The assignment calls for a fresh critic and a separate fresh reviser while also prohibiting nested agents. These are separate sequential role passes by the same thread agent; they are not independent model or human reviews.

## Findings

1. **High — recommendation outruns the comparative evidence.** The opening recommends a volunteer-management suite as the first implementation path, while the source set establishes only vendor-described capabilities and leaves price, live behavior, import fit, accessibility, and configuration unknown. Reframe this as a recommended workflow to evaluate and keep product selection open pending the same-scenario demo and written quote.

2. **High — preserve all consequential hosted API defaults and units in the final.** The draft gives the soft weight defaults and cap plus the fairness unit/formula, but omits two details recorded in the evidence: employee-tag matching defaults to ALL; configured FTE is bounded from 0.001 to 1.000 in three-decimal increments. Add these with the versioned-doc caveat, and state that the factor of 100 applies to the standard deviation of FTE-adjusted minutes. This satisfies the brief’s request to retain mechanism defaults/types/limits rather than only name the product.

3. **Medium — explicitly show the full disposition vocabulary.** The P table directly handles correction, rejection, retention with conditions, and user decisions. It does not explicitly identify what is already covered by the brief, which capabilities are optional enhancements, or what remains uncertain. Add a compact cross-cutting disposition key after the P table: recurring schedules/mobile/reminders/privacy/import are already brief requirements; waitlists or self-signup caps are optional; vendor implementation/tier/accessibility/import claims and the eventual fairness policy remain uncertain.

4. **Medium — narrow P4’s privacy rationale.** “Full roster” certainly broadens peer-name/assignment sharing; the current phrasing also suggests it may expose availability without evidence that availability is part of the roster. Say “could expose names and assignment details” and reserve private availability as an explicit field that must not be added to the roster.

5. **Medium — distinguish WCAG web scope from message-copy review.** The draft proposes WCAG checks on both responsive web and email paths. Keep WCAG 2.2 AA as an optional target for responsive web content and scheduling flows. Review email/SMS separately for readable text, useful subject/date/time, non-color meaning, privacy, and opt-out handling; do not imply the cited web-content standard proves email conformance.

6. **Low — make the policy inference visible.** P2 correctly labels the alphabetical-priority disadvantage as a design inference, and P6 labels all proposed checks unexecuted. Preserve those statements through revision.

7. **Low — maintain recurrence/timezone distinction.** The draft correctly distinguishes a local recurring rule from a computed dated occurrence and reports RFC 5545’s repeated-time and nonexistent-time semantics. Keep the operational decision open and require gap alerting; do not adopt recurrence omission without alerting.

8. **Low — retain source-evolution boundaries.** The issue-to-implementation-to-required-fix chain is relevant but is not a production incident. Current wording is appropriately limited; keep the statement that no solver run, performance measurement, product trial, import, API call, or accessibility audit occurred.

## Revision requirements

Revise findings 1–5. Keep findings 6–8 and the complete exact P1–P6 clauses. Do not add implementation or purchase claims. Update the final artifact hash after revision.
