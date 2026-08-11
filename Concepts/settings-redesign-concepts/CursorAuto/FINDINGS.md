# FINDINGS — CursorAuto Settings Bakeoff

Per packet `06`: IA choices, deliberate divergence, inventory/Plans conflicts, simulated functionality, and Slint risks. **No ranking.**

## 0. Originality note (fixed)

An earlier CursorAuto delivery still carried peer bakeoff class systems (`ldg-` / `cl-` / `wb-`) and peer IA metaphors (chapter/index, minimap, constellation, workbench, ops-console, “Clear skies”, “Front page”, ledger language). That was rejected. This folder was rewritten so concept chrome uses only `hb-` / `sc-` / `sw-` / `ar-`, shared primitives use `ca-*`, and those peer DNA strings are absent outside this admission. Peer bakeoff folders were not used as layout sources for the rewrite. Home/Workspace shells were rebuilt as true pier / cue-plate / jack-patch / finding-aid IA (not renames), then exercised with isolated interactive QA (`scripts/ca-interactive-qa.py`).

Exact deep-link honesty: search hits emit `data-setting-id`; harness asserts `getElementById('row-' + id)` (no document-order soft selector). Workspace render captures focus before clear and skips scroll restore when deep-linking. Packet-06 CDP now covers full States + Refresh/Reconnect, scrollspy, jump offset, LKG refresh, activate toast, effort/Normal-Fast gating, badges/reset, and a second dedicated manager per concept. Targeted polish: Free Models six auth-route labels, spellcheck Normal/Advanced Manage rows, Switchboard/Archive `noticeHtml`, and `.ca-disclose` on diagnostics/advanced surfaces.

## 1. Major information-architecture choices

### Harbor (Concept 01)
- Home hierarchy: pier-desk search → small triage → berth cards → recents.
- Workspace: pier slips + cargo document; docking motion.
- Managers as drydocks/lockers: Providers, Memory, Terminal; LSP checklist on open.
- Motion: docking (settle before text).

### Score (Concept 02)
- Home: hero cue search; cue notices; movement plates.
- Workspace: single-column score + top rehearsal-mark rail + light side index.
- Managers: Ensemble Providers, Personas cast, MCP instruments.
- Motion: cueing.

### Switchboard (Concept 03)
- Home: docked `/` search; jack column; compact triage.
- Workspace: jack strip + patch-sheet document; patching motion.
- Managers: Patch-bay Providers (collapsed expand), Context matrix, Skills/Tools bay.
- Motion: patching (no endless pulse).

### Archive (Concept 04)
- Home: finding-aid search; tickets; collection-guide grid.
- Workspace: outline + box document + running header (+ provenance inspector).
- Managers: Catalog Providers, Crew boxes, Media archive.
- Motion: retrieval.

## 2. What each concept deliberately explores differently

| Axis | Harbor | Score | Switchboard | Archive |
|---|---|---|---|---|
| Home hierarchy | Pier desk + berths | Cue search + plates | Docked `/` + jacks | Finding-aid + guides |
| Destinations | Berth cards | Movement plates | Jack rows | Collection guides |
| Workspace space | Split pier | Single-column score | Jack strip + sheet | Outline + box |
| Nav/scrollspy | Slips | Rehearsal marks | Lit jacks | Folders / running header |
| Managers vs settings | Drydocks / lockers | Ensemble / cast / instruments | Patch bays + matrix | Special collections |
| Density / motion | Medium / docking | Editorial / cueing | Operator / patching | Catalog / retrieval |

## 3. Inventory / Plans conflicts found

Recorded in `IMPACT_REGISTER.json` (not applied). Headlines:

1. Primary category pills → destinations-as-places.
2. Nine explicit row states vs empty-field Auto/Inherit ambiguity.
3. Humanized taxonomy vs implementation-bound inventory categories.
4. Provider hierarchy (family → account → connection → product/entitlement → model) vs flat API-key lists.
5. Claude/Antigravity CLI-owned OAuth (no PM-direct) vs any PM-OAuth paths.
6. Free Models as grouping, not billing identity.
7. Usage owns measurement; Settings shows snapshot + deep-link only.
8. Spellcheck as shared local service (no permanent composer button, no autocorrect).
9. Crew/Goal requested vs effective concurrency.
10. Assistant Gist half-life = fades from active context (not expires/false).

## 4. Functionality that remains simulated

Interactive but not backed by real systems (honest receipts):

- Provider OAuth/CLI login, install/update/rescan, reconnect, readiness probes.
- Catalog network refresh (UI preserves last-known-good during loading).
- Usage balances/projections (fixture snapshots; deep-link to Usage is conceptual).
- Manager add/connect/rebuild/diagnostics.
- States drawer fixtures (calm, attention-heavy, usage exhausted, invocation failed, managed).
- Spellcheck uses demo dictionaries + underlines; Appearance Input now includes Personal/Project dictionary Manage, project Use, language packs, and thread/project override Manage (simulated receipts). Production still needs a Slint-portable spelling service (HTML `spellcheck` may assist simulation only). No multi-surface Chat/PRD spellcheck, thread-overflow disable, or grammar/style separate control in this pass.
- Theme/motion/width preferences via Hub bridge or local controls; demo edits in sessionStorage.

No silent no-ops: controls either mutate demo state visibly or report simulation/unavailable.

## 5. Slint 1.17.1 translation risks

- Scrollspy may use IntersectionObserver in HTML; semantic model is section registry + offset (portable). Documented as web preview aid.
- Glass theme may use limited backdrop-filter; avoid nested stacks; production should prefer opaque/plate fallbacks.
- Long lists should stay data-backed/virtualized in production; demo instantiates modest fixture counts.
- Terminal live preview is CSS-styled HTML, not a real PTY — production maps to native terminal profile preview widgets.
- Avoid DOM geometry as semantic state; concept store keeps overrides/providers separate from layout.
