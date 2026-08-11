# Spec gaps — Grok 4.5 Assistant Chat concepts

## Purpose

Record under-specified or conflicting behavior discovered while building this isolated concept workspace. Cite handoff register [`09_LATER_CANON_UPDATE_REGISTER.md`](file:///tmp/pm-chat-handoff/Puppet_Master_Chat_Concept_Handoff/09_LATER_CANON_UPDATE_REGISTER.md) and supersessions in [`02_PLANS_CANON_AND_SUPERSESSIONS.md`](file:///tmp/pm-chat-handoff/Puppet_Master_Chat_Concept_Handoff/02_PLANS_CANON_AND_SUPERSESSIONS.md).

## Non-goals

- Do **not** edit `Plans/**`, command catalogs, wiring, schemas, DRY Method, or Usage redesign from this folder.
- Do **not** “resolve” gaps by rewriting canon in-place; a later integration agent owns canon updates (handoff `09` §1).

## Authority stack

1. Explicit user supersessions (`02` §5)
2. Newer PlanUnits
3. Older PlanUnits
4. PMConcept7 evidence

## Gap registry

| Gap ID | Feature | Description | Evidence | PlanUnit / command | Class | Prototype impact | Later owner | Provisional? |
|--------|---------|-------------|----------|--------------------|-------|------------------|-------------|--------------|
| GAP-001 | Resend retired | Handoff retires Resend; Plans / PM7 still surface Resend in message controls. | `09` §2 Message controls; `02` §5 | Message-control PlanUnits; PM7 Resend affordance | conflicting | Omit Resend; no Resend-era disabled UX | Canon / catalog integration | no |
| GAP-002 | Left accent borders retired | User supersession retires colored left accents; live Plan text still describes them. | `02` §5; `09` later-canon accents | `ACD-444` / `F3-469` | conflicting | Selection without left accent bars | Plans retirement | no |
| GAP-003 | Questionnaire expire family | Expire family missing or retired; Cancel/Skip replace passive expire. | `02` §6 Questionnaire; `09` | `cmd.questionnaire.expire*` (stale / catalog-missing) | stale | Never demo passive expire; stub Cancel/Skip | Catalog / Plans | no |
| GAP-004 | Thread command ID drift | Lifecycle prose uses `cmd.chat.thread.*`; catalog / other docs may use different `cmd.chat.*` forms. | `09`; ACD thread lifecycle table | `cmd.chat.thread.*` vs catalog | ambiguous | Prototype maps UI intents → stub IDs; log uncataloged | Catalog / wiring | yes |
| GAP-005 | Edit eligibility criteria | Edit eligibility and rewind/supersession not canonized. | `09` §2; `02` §5 | Edit control PlanUnits (deferred) | missing | Show Edit only when demo `eligibleForEdit`; label provisional | Plans / acceptance | yes |
| GAP-006 | Context Ring details | Ring entry opens UsageRecord-shaped popover; Detail redesign owned elsewhere. Peer claim requires popover (not toast-only). | `02` §8; `09` ownership; chrome `data-action=context-ring` | Usage redesign / Context Ring | implementation-only | Popover + stub “Open Usage”; Detail stays elsewhere | Usage redesign | no |
| GAP-007 | Draft revision history commands | Bounded draft revision history required; commands uncataloged. | `09` §2 Composer spellcheck and durable revisions | draft-history commands (catalog-missing) | missing | Local demo handlers; no production ID claim | Catalog / storage | yes |
| GAP-008 | Long-message expand | Expand/collapse may be local view state vs a cataloged command. | `09` §2 Long-message collapse | expand/collapse (event-not-command / catalog-missing) | ambiguous | Local store `expandedMessageIds`; survive remount | Plans / catalog | yes |
| GAP-009 | Command façade stubs | Many chrome actions are local demo handlers without catalog command IDs (window close, artifact editor tab, copy, goal stop). Export must download JSON for peer claim (not toast-only). | Build emit / download / tab paths; `09` ownership | assorted `cmd.*` (uncataloged / stubbed) | missing | Map UI intents → local demo behavior; never claim production IDs | Catalog / wiring | yes |
| GAP-010 | Demo sessionStorage persistence | Simulated restart uses `pm.chat.grok45.store` + `?restore=1`; not a product storage contract. | host-boot persist hook | durable draft / session storage (deferred) | implementation-only | Concept-only persistence for remount/restart demos | Storage / Plans | yes |
| GAP-011 | Demo corpus enrichment | Base `demoData.json` is thin (median ~105ch bodies; sparse thoughts/activity). `_shared/demo-extend.js` adds markdown samples, thoughts, activity, collapse, surfaces, timestamp spread at load. | demo-extend.js; FINDINGS baseline | demo fixtures | implementation-only | Additive clone mutation only; disclosed in behaviorNotes | Demo / Plans | yes |
| GAP-012 | Search / Lens UI façades | Search results popup + Lens selection bar are concept UI over store ops; not cataloged production chrome. | search.js; context-lens.js; window-kit | catalog-missing | missing | Local emit/jump/apply; no production command IDs | Catalog / wiring | yes |
| GAP-013 | Markdown body renderer | Transcript uses local `renderBodyHtml` (fences, bold, lists) — not a full product markdown engine. | _thread-kit.js | renderer PlanUnits | implementation-only | Sufficient for concept readability demos | Plans / editor | yes |
| GAP-014 | Custom questionnaire controls | Native checkbox/radio replaced with ARIA toggles for theme/Slint portability; answer collection is local. | _thread-kit.js | questionnaire UI | implementation-only | Keep Submit/Skip/Cancel; no expire family | Catalog / UI | yes |
| GAP-015 | Feature SHOT theme coverage | Feature suite asserts all 32 theme×widths in DOM; PNG capture uses critical set (4 themes × 520/750) when `SHOT=1`. | run-feature-states.mjs; feature-state-map `shotCoverage` | 08 testing contract §4 | implementation-only | Expand PNG matrix later if needed; evidence map lists captured files | Verification | yes |
| GAP-016 | themes.css provenance | Base `themes.css` remains byte-compatible with rail-concepts; chat look diverges via additive `chat-tokens.css`. | chat-tokens.css | originality / theming | implementation-only | Prefer evolving chat-tokens; avoid silent full-file clone claims | Design system | yes |
| GAP-017 | Chrome polish baseline | Pre-polish headers used literal Cur/All and bare Attach/Copy labels; hover expand always-visible; search panel non-sprout. | FINDINGS polish pass; screenshots/polish | handoff §10–17, §28, §31 | implementation-only | Iconized shared kits + search sprout + hover expand shipped; Ring/export still GAP-006/009 | Concept / verification | no |
| GAP-018 | Layout integrity baseline | Overlay-under-dock, absolute hover clip, dock max-height crush, composer icon wipe, Jump hard-offset, empty scope-seg ghosts. | FINDINGS layout integrity; geometry-probe-results.json; interactive-audit/ | handoff §08, §12, §14, §28, §31 | implementation-only | Geometry probe 64/64; in-flow hover; dock scroll; overflow More; FULL interactive audit required before peer claim | Concept / verification | no |
| GAP-019 | Host theme / settings chrome | Standalone `host.html` had no theme switcher (gallery/`?theme=`/bridge only); Settings absent; shell `.pm-titlebar-theme` unused. | FINDINGS missing affordances; shell.js / host-boot.js | handoff gallery vs host | missing | Titlebar + More Theme; Settings panel (theme, reduced motion); persist `pm.theme` | Concept chrome | yes |

## Provisional assumptions used by this concept

See Build stubs for Edit eligibility, command façades, Context Ring stub, expire retirement, and left-accent omission. Mark new assumptions here as they appear.

- Command stubs (GAP-009) may toast or no-op; they do not invent catalog IDs.
- `eligibleForEdit` on demo messages gates Edit (GAP-005).
- Session restore via `sessionStorage` is demo-only (GAP-010).

## Deferred to later integration

Map closed gaps to handoff `09` register sections when an integration agent updates Plans, catalog, wiring, schemas, and DRY.
