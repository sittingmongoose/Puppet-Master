# Shard 025: PMConcept7 Deferred Token Hygiene Addendum - 2026-07-29

Source: `Plans/UI_Command_Catalog.md`

Source lines: L10910-L10934

Source SHA256: `f93f6e4068b3fbc187156116ccdcce168571267d7048d1a50ba2ce87d7de25a2`

---

## PMConcept7 Deferred Token Hygiene Addendum - 2026-07-29

This addendum adjudicates the 6 tokens recorded in the scope note of `Plans/CozyShelves_PM7_Control_Reconciliation.json` (the historical 2026-07-28 PM7 census). Each token is classified as newly registered, parser-false-positive, or generic family root, following the PMConcept6 census addendum mechanism (2026-07-16) and the Cozy Shelves command reconciliation table pattern (2026-07-27). These token dispositions do not make the historical PM7 census current against the rebaselined sources. No existing PlanUnit block, preserved exact token, canonical text, or retired bridge is edited. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, final manifests, or production build tasks.

### Deferred token reconciliation

| Token | Disposition | Canonical target and notes |
|---|---|---|
| `cmd.chat.debug_investigation.promote` | newly registered | Promote-investigation button on the assistant chat debug card (`Concepts/pm6-build/parts/29x-pm6-js-chat-data.part.html`); semantics per `Plans/assistant-chat-design.md` (promote a debug investigation to user-visible attention); registration row supplied below |
| `cmd.chat.debug_investigation.dismiss` | newly registered | Dismiss-investigation button on the same card; evidence bundle kept on dismiss per `Plans/assistant-chat-design.md`; registration row supplied below |
| `cmd.notifications.mapping` | parser-false-positive (generic family root) | Bare reference in PM_SETTINGS_DATA (`Concepts/pm6-build/parts/28-js-settings-data.part.html`); canonical verb `cmd.notifications.mapping.update` unchanged; recorded in `Plans/Wiring_Matrix.production.exclusions.json` as a generic family root |
| `cmd.sound.mapping` | parser-false-positive (generic family root) | Bare reference in PM_SETTINGS_DATA; canonical verb `cmd.sound.mapping.set` unchanged; recorded in `Plans/Wiring_Matrix.production.exclusions.json` as a generic family root |
| `cmd.plan_compile.open_build.` | parser-false-positive (prose punctuation) | Trailing-dot capture from the sentence-final period after `cmd.plan_compile.open_build` in PRD mock prose (`Concepts/pm6-build/parts/26-js-prd-annotations.part.html`); the canonical no-dot id is registered (PRD/Planning launch table) and unchanged |
| `cmd.chat.web.` | parser-false-positive (prefix string) | Trailing-dot capture from the comment prefix reference "Commands live under cmd.chat.web.*." in `Concepts/pm6-build/parts/29x-pm6-js-demo-engine-a.part.html`; the `cmd.chat.web` family and its exclusions-registered root are unchanged |

### Debug investigation registration rows

The `cmd.chat.debug_investigation.*` pair registers as assistant-chat-scoped domain actions over the Debug Mode investigation card. `Plans/assistant-chat-design.md` owns the surface semantics; the `Plans/Commands_System.md` section 7 boundary keeps `cmd.run_debug.*` as the sole classical DAP namespace (CS-009), and these ids never re-scope to classical debugging.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.chat.debug_investigation.promote` | Promote Debug Investigation | `domain_action` | selection (`debug_investigation_card_visible`) | none | `stale_projection` | assistant_chat |
| `cmd.chat.debug_investigation.dismiss` | Dismiss Debug Investigation Card | `domain_action` | selection (`debug_investigation_card_visible`) | none | `stale_projection` | assistant_chat |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md
