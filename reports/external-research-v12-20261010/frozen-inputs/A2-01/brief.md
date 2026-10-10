# Reconnect-safe volunteer observation intake

## Assignment

A small ecology charity has 25 volunteers surveying footpaths with intermittent connectivity. Each visit records a site code, observation time, structured answers and up to three photographs. Coordinators need to reconcile late submissions and corrected observations without overwriting the original record. Devices are personal Android phones; an occasional desktop import is acceptable.

You have a 60-minute whole-topic research envelope. Produce a planning proposal, not an implementation. Use public primary documentation, relevant public source code and released issue/fix history where they bear on the proposal. Discover realistic products, mechanisms and alternatives independently; no product, source or conclusion is preselected. A bounded historical example and useful unfamiliar opportunities matter more than an exhaustive catalogue. Clearly distinguish observed external behavior, your inference and a local product choice.

## Exact numbered obligations

1. Explain how offline creation, retry, late arrival and an explicit correction become distinct coordinator-visible states.
2. Compare two usable survey products and one analogous queue/synchronization mechanism, including deployment and export tradeoffs.
3. Bind observations to site, visit, form version and attachment identity; address device-clock uncertainty and duplicate detection.
4. Describe a bounded failure/release-history example relevant to reconnect or correction, and its actual applicability.
5. Preserve and investigate this supported optional scope: coordinator-reviewed CSV import of legacy observations. It is an authorized option, not a mandatory feature or an established technical capability; recommend conditions, retain it when supported, and explain any evidence-based exclusion.
6. Make owner decisions explicit: The field coordinator accepts duplicates for investigation; the data steward decides whether a correction replaces the current view or appears beside it. No silent automatic merge is approved.
7. Preserve negative constraints: Do not require volunteers to remain online, infer precise location from photographs, change personal-device settings, or propose remote deletion of their originals.
8. Deliver one coherent evidence-backed research proposal covering obligations 1–8, with recommendations, source/version applicability, useful discoveries, unresolved owner inputs, and a validation table separating checks actually executed from checks merely proposed. Do not report research sources or future tests as executed product validation.

## Research boundaries and deliverable

Keep the investigation at the pilot scale above. No installs, accounts, production access, purchases or live writes are needed. Read-only public retrieval is appropriate; any permitted local discriminating check must be disclosed with its actual inputs and result. A check you did not run remains proposed or NOT_RUN. Deliver a complete proposal with a compact comparison, evidence-linked recommendations and prioritized validation; there is no requirement to build a prototype. Owner inputs may remain explicit decisions, but they do not excuse investigating publicly answerable questions. This brief is the complete discovery input.
