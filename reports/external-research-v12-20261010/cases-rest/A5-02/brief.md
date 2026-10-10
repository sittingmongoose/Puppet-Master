# Returnable crate receiving labels

## Assignment

A food cooperative loans reusable delivery crates among three depots. Staff scan a crate label to see its inventory identity and record a receipt or return; a damaged label can be replaced. The cooperative wants readable printed identifiers even when a scanner is offline. Its legacy sheet records crate identity separately from each shipment. This research is about identifiers and scanning workflows, not payment or food-safety decisions.

You have a 60-minute whole-topic research envelope. Produce a planning proposal, not an implementation. Use public primary documentation, relevant public source code and released issue/fix history where they bear on the proposal. Discover realistic products, mechanisms and alternatives independently; no product, source or conclusion is preselected. A bounded historical example and useful unfamiliar opportunities matter more than an exhaustive catalogue. Clearly distinguish observed external behavior, your inference and a local product choice.

## Exact numbered obligations

1. Compare two receiving/asset-label workflows and an analogous identifier/resolver mechanism, including offline and low-cost scanner tradeoffs.
2. Distinguish reusable crate identity, shipment identity, product identity and receipt event identity.
3. Research optional QR/resolver links alongside readable identifiers, including supported decoding paths, redirection and label replacement.
4. Investigate a relevant parsing/format migration or released scanner behavior change and bound its applicability.
5. Preserve and investigate this supported optional scope: a QR link to a public crate-care page in addition to the staff-readable inventory identifier. It is an authorized option, not a mandatory feature or an established technical capability; recommend conditions, retain it when supported, and explain any evidence-based exclusion.
6. Make owner decisions explicit: The inventory steward selects the identifier namespace; depot managers decide whether scans can queue offline. The web owner governs resolver redirects, while a shipment number cannot silently replace a crate ID.
7. Preserve negative constraints: Do not buy identifier allocations, print production labels, claim that any QR scan is a verified receipt, or publish depot movement history through the public care link.
8. Deliver one coherent evidence-backed research proposal covering obligations 1–8, with recommendations, source/version applicability, useful discoveries, unresolved owner inputs, and a validation table separating checks actually executed from checks merely proposed. Do not report research sources or future tests as executed product validation.

## Research boundaries and deliverable

Keep the investigation at the pilot scale above. No installs, accounts, production access, purchases or live writes are needed. Read-only public retrieval is appropriate; any permitted local discriminating check must be disclosed with its actual inputs and result. A check you did not run remains proposed or NOT_RUN. Deliver a complete proposal with a compact comparison, evidence-linked recommendations and prioritized validation; there is no requirement to build a prototype. Owner inputs may remain explicit decisions, but they do not excuse investigating publicly answerable questions. This brief is the complete discovery input.
