Act as the research sub-agent for this task.

Fresh independent ER11 verifier. This task contains exactly your permitted case input: the original brief, the exact released plan, and three verification questions. Read no local files and do not use previous conversation, investigator draft/source files, another verifier/critic/evaluator, or history. Do not delegate or spawn agents. Independently research the three questions using public primary sources (official vendor support/product documentation, released code/docs, official government sources as applicable). Answer neutrally from evidence; separate observed source statements, inference, uncertainty, and any facts that cannot be established. For each source used, provide its exact URL, version/commit if applicable, section/locator, access time in UTC, and operations performed. Return a complete verifier package with one response per question, useful source evidence, conclusions and unresolved questions. Do not write or modify files.

ORIGINAL BRIEF:
# I07

A shared commercial kitchen rents production blocks to twenty small food businesses. Three kitchen coordinators manage keys, equipment availability, and cleanup checks; each business handles its own recipes and sales. The kitchen has set aside $21,000 for a system that can reduce double-bookings and make batch handoffs clearer. Several businesses prepare products containing major allergens, and the kitchen wants a tenant-defined record of equipment use and cleaning signoff without presenting itself as the authority on each tenant's food-safety program. Tenants should not see one another's recipes, customers, or production volumes. A tablet at the entrance is used with wet hands, and one coordinator needs a screen-reader-compatible administrative view. The current calendar does not reliably show setup or cleanup time, so a production block can collide with another tenant's access. The kitchen has internet but will continue with paper signoff sheets during a transition. It wants a pilot with six tenants and a way to export each tenant's own records at the end of the year. The board has not agreed whether coordinators may block a tenant from booking after a missing signoff, or how cleaning procedures should be represented across different equipment.

Required deliverable obligations (equal in both arms):
O1 Independently discover useful unfamiliar tools, products and materially different approaches beyond the thin plan.
O2 Investigate consequential primary source/code behavior and governing defaults, units/types, limits and applicability for selected mechanisms.
O3 Investigate at least one relevant issue/fix/regression/release or evolution chain; say when evidence is absent/inapplicable.
O4 Compare every exact P clause after plan reveal; distinguish correction, optional enhancement, user decision, already-covered, rejected and uncertain findings.
O5 Retain useful alternatives, conditions, original constraints, disagreement and uncertainty in one self-contained coherent final; do not replace text with IDs.
O6 Propose meaningful discriminating validations and separate executed checks from proposed work. No runtime available is honest; do not pretend proposals ran. Scope is this small product brief, not unlimited production guarantees.

EXACT RELEASED PLAN:
# Plan root

P1: Schedule tenant production blocks with setup, production, and cleanup intervals.
P2: Keep each tenant's recipes, customer information, and production volumes private from other tenants.
P3: Record equipment-use and cleaning signoffs using tenant-defined procedures.
P4: Support an accessible coordinator view and a transition period that can coexist with paper signoffs.
P5: Booking restrictions after a missing signoff and the authority to apply them are board decisions.
P6: A common procedure model across equipment types has not been selected.

THREE QUESTIONS (do not infer or add questions):
1. For P1 and P5, under Skedda’s current buffer and booking-approval features, what resource interval is reserved at each state (requested, approved, changed), and what roles or exceptions can bypass it?
2. For P2 and P3, what can one Food Corridor food-business account see about other tenants’ bookings, and what booking, equipment, and signoff records can that account export for its own year, including when inactive?
3. For P3 and P6, how does the FDA Food Code 2026 describe the Code’s status and the role of adoption by the applicable jurisdiction?
