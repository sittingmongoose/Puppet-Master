# Plans GUI Synthesis — Usage-page prototypes (GUI surfaces)

Scope: READ-ONLY canonical research for the Usage-page prototypes (U3–U9). Domain: Context Lens popup, context ring, More Details/Context Detail, widgets, top-tabs, themes, scrollbars, motion tokens, icon rules, command IDs, DRY ownership, Slint mapping. Verified against the CURRENT corpus on 2026-07-30. Line numbers are to live files, not handoffs.

> Naming alert (read first): the corpus distinguishes two different chat-header controls that the prototype work sometimes conflates:
> - **Context Lens** = the mute/focus/subcompact message-selection control, top-right of Chat next to search (icon + dropdown arrow). Owner: assistant-chat-design §176; FinalGUISpec F3-306; UI_Command_Catalog `cmd.chat.context_lens.*`.
> - **Context ring / context circle** = the context-usage indicator whose click opens the **context status module** (Usage / Tokens / Cost / Compact Now / More Details). Owner: usage-feature §5 + UF-011; assistant-chat-design ACD-434/ACD-441; FinalGUISpec F3-132.
> The popup that carries Compact Now + More Details is the **context ring status module**, not "Context Lens". Both share the same click-to-open corner-origin sprout chrome (ACD-442). The build plan's phrase "Context-Lens popover = the one standard popup for the whole app" means the Context-Lens *popover chrome contract* (ACD-442/439) is the app-wide popup standard — not that the usage popup is the Context Lens control.

---

## Q1. Context Lens popup + context ring status module

### Context Lens control (canonical)
- Placement fixed: top-right of the Chat panel, immediately right of the search bar; renders as icon + dropdown arrow; multi-select in all modes; exposes `Mute`, `Focus`, `Subcompact`, `Turn Off`. — `Plans/FinalGUISpec.md` L3336; PlanUnit **F3-306 "Context Lens Chat Placement And Modes"** L20513–20560.
- One active mode at a time (`mute | focus | subcompact`). — `Plans/Wiring_Matrix.md` L347 ("Establishes one active Context Lens mode at a time"); UI_Command_Catalog L705–711.
- Subcompact is an **explicit apply/revert** path, distinct from automatic dynamic context shrinking; `apply_subcompact` requires explicit user confirmation (creates a local summary artifact). — Wiring_Matrix.md L354; UI_Command_Catalog L710–711.
- Command IDs: `cmd.chat.context_lens.toggle | set_mode | turn_off | toggle_message_selection | clear_selection | apply_subcompact | revert_subcompact`. — UI_Command_Catalog §2 L705–711; Wiring_Matrix.md L346–349.

### Context ring / status module (the popup that shows usage + Compact + More Details)
- The chat-header context indicator is the GUI entrypoint. Hover opens a lightweight usage/status module historically; **current canon (PMConcept7):** hover shows **an accent glow only** and never opens the module; **click** (or Enter/Space when focused) toggles the status module as a **corner-origin sprout popout anchored to the ring**; `aria-expanded` tracks state; ring renders at **15px**; **no numeric token label beside the ring** (figures render inside the module). — assistant-chat-design **ACD-441 "Context Ring Click Sprout And Glow"** L24154–24209; usage-feature L168–174, L1433 (UF-011); FinalGUISpec L1603.
- Module content: `Usage`, `Tokens`, estimated `Cost`, `Compact Now`, `More Details`. Stateful usage/tokens/context/cost/quota/freshness + hidden/background contribution summaries from UsageRecord projections. — usage-feature L170, L1433; assistant-chat-design L23732 (ACD-434 content owner).
- "Sprout" open style: corner-origin sprout motion family — opens ~300ms with overshoot easing from a non-uniform closed scale; closes ~220ms with opacity held until late then short fade; reduced motion = instant show/hide. — assistant-chat-design **ACD-439 "Corner-Origin Sprout Popout Motion Contract"** L24043–24099.
- **One-popup-at-a-time rule:** "At most one popout, flyout, or fan-out is open at a time" (single-overlay invariant, **ACD-438**); restated in ACD-439 L24070 and ACD-442 L24234 ("opening one header menu closes the others"). Worktree menu, Context Lens popover, context status module, and more-options menu are all click-to-open corner-origin sprouts; click outside / item pick closes. — assistant-chat-design **ACD-442** L24211–24267.
- Popout chrome contract: surface-elevated fill, border edge, radius-md corner, elev-3 shadow; glass themes share one plate rule with selector portals; **retro zeroes the radius**. No hardcoded per-menu radii/shadows; no inline-style trigger colors. — ACD-442 L24222–24235, negative constraints L24257–24258.

### Compact command + the "must NOT compact on open/hover" rule
- Exact command: **`cmd.chat.compact_context`** `{ thread_id }`; events `context.compaction.started | completed | failed`; result status `started | already_running | cancelled | no_op | degraded | unavailable | retry_scheduled | completed | failed`. Source surfaces: "Chat context circle Compact Now action, command palette". — UI_Command_Catalog §2 L745; Wiring_Matrix.md L385.
- Rule: **"Compact Now must not dispatch from hover or from the ring's opening click alone."** — usage-feature UF-011 negative_constraints L1474; FinalGUISpec F3-132 negative_constraints L11126 ("Compact Now must not dispatch compaction until the user chooses that action"); assistant-chat-design L11875 ("dispatches cmd.chat.compact_context only after explicit user choice"). "Compact Now failure must not be silent or logs-only." — UF-011 L1475; F3-132 L11127.
- More Details command: **`cmd.chat.open_thread_context_details`** `{ thread_id }` → "layout/UI state only"; "choosing More Details dispatches cmd.chat.open_thread_context_details". — UI_Command_Catalog L746, L752; Wiring_Matrix.md L384. The detail surface never opens directly from the ring click — only via the module's More Details action. — usage-feature L170, L429, L2466.

---

## Q2. More Details / Context Detail Pane

### Canonical information architecture
- Editor-tab pane with top-level **`Curated`** and **`Raw`** views. — assistant-chat-design §12.0 "Context Detail Pane contract" L20–57 (shard 018 L34–40); F3-132 tokens `Curated`/`Raw` L11120–11121.
- `Curated` = `Overview` + `Breakdown` + `Messages`:
  - Overview: thread/session title, message counts, headline provider/model/mode/persona (`/model/mode/persona`), effort/worker summary, headline tokens/context/cost (`/context/cost`).
  - Breakdown: **the context usage bar, token buckets, grouped breakdowns by role, tools, provider, model** (this is the canonical "stacked bar + by-role legend"). — shard 018 L38.
  - Messages: one expandable row per message — role, worker type, mode, model, time/duration, total tokens, cost. — shard 018 L39.
- `Raw` = accordion list of messages; expanding exposes the full serialized payload + tool-part payloads + provider metadata blobs + path/runtime data. — shard 018 L40.
- Required breakdown coverage: system/instruction blocks; user/assistant messages; compiled attachments + forwarded doc selections; tool/activity-derived context; run/message usage snapshots from `usage.event` + `run.completed.usage`; debug-only Investigation Context for debug threads. — shard 018 L42–48.
- PlanUnit owners: **UF-012 "Context Detail Pane Inspection"** (curated overview cards, grouped breakdowns, per-message inspection, raw payload toggles, provider/model/mode/persona drill-downs, side-by-side **Expert/ELI5** help copy) — usage-feature L1488–1543. **F3-132** (FinalGUISpec) owns the visible surfaces + Compact Now feedback states.

### Density guidance / "calm editorial" (prototype build plan, not yet canonical prose)
- The "calm, editorial" density (one stacked bar + collapsible by-role legend, three cost figures, per-window remaining, messages collapsed behind "show N", Raw redacted at the bottom) is locked in `Concepts/usage-concepts/BUILD_PLAN.md` L16–19 — a governing **build plan**, source-lineage for the prototypes, NOT canonical Plans prose. Canonical anchor is the expandable per-message rows + Breakdown bar above; "show N messages" is prototype phrasing over canonical per-message expansion + deep-link.

### Stacked context bar + legend, three-way cost, deep-link
- Stacked bar + by-role legend → canonical Breakdown "context usage bar, token buckets, grouped breakdowns by role…" (shard 018 L38) + build-plan `contextByRole{}` (Rebuild Plan L35).
- Three-way cost: build plan L20–22 locks **three projections (API-billed / plan-included / combined)** as **GUI projections over the single UsageRecord cost authority (UF-087), not a second cost model**. Canonical cost authority: `cost_microdollars` (and/or provider minor units), `cost_status`, pricing snapshot refs; **`cost_usd` is display/migration only** — usage-feature L520; **UF-087 "UsageRecord GUI Projection And Alias Contract"** L5421, L5619. Per-thread estimated-cost rule (UF-013, usage-feature L1545+): consume UsageRecord projections first; OpenCode-style normalization is a display fallback only when marked `pricing_estimated`.
- "show N messages" deep-link: thread-scoped detail deep-links land on the editor-tab Context Detail Pane via `cmd.chat.open_thread_context_details` (and focus/close family `cmd.chat.focus_thread_context_details` / `cmd.chat.close_thread_context_details` — UI_Command_Catalog shard 019 L32); app-wide navigation normalizes to `cmd.nav.open_usage_subject` (Crosswalk L267; UI_Command_Catalog L92, shard 019 L23).

### Redacted Raw placement + redaction rules
- Raw view renders **redacted** `raw_payload_ref`, `redaction_status`, `provider_payload_hash`, omitted evidence counts, and permission state **without exposing secrets**. — assistant-chat-design L23732 (ACD-434).
- "Raw/debug affordances show redaction_status, provider_payload_hash, raw_payload_ref, omitted count, and permissioned-unavailable state rather than unredacted payload content." — FinalGUISpec L27763. "Do not expose unredacted raw provider payloads in GUI debug views." — FinalGUISpec L27810.
- Clipboard must never copy redacted/hidden-secret placeholders as the real value. — FinalGUISpec L1973, L13753.
- Account-identity redaction: account handles, namespace ownership, kube user/context names, SSH usernames/host aliases masked by default unless export profile permits. — FinalGUISpec L713. Production fixtures must not expose local machine paths, localhost URLs, demo DB strings, sample secrets, raw account details. — FinalGUISpec L284.
- Acceptance fixture: **GUI-RAW-001 "Raw/Curated redaction"** is part of the closed Usage GUI fixture matrix (UF-088). — usage-feature L5521.
- Build plan: "Raw redacted tucked at the bottom" (Rebuild Plan L19). No-credentials/account-IDs/sensitive-paths/raw-payloads is the combined effect of L23732 + L27763 + L713 + L284.

---

## Q3. Widget system

### Two catalogs (don't confuse them)
- **Atomic UI components** = FinalGUISpec §8 "Widget Catalog" (StyledButton, TreeView, CodeBlock, SelectableText, etc.) — reusable primitives, NOT page widgets. — FinalGUISpec §8 L1797–1823 (shard 015).
- **Composed page widgets** = Widget_System §2 (OrchestratorStatus, BudgetDonuts, NodeTree, LedgerTable…) — what users add/remove/move/resize on **Dashboard, Usage page, and Orchestrator `Progress` only**. — FinalGUISpec §C.4.2 L69–76; Widget_System.md §1 L12–27 (WS-002).

### Widget chrome: kebab/overflow menu (Focus / S/M/L/XL / Configure / Remove)
- **Canonical Plans do NOT define a per-widget kebab with Focus / S/M/L/XL / Configure / Remove.** That exact menu is a **prototype/build-plan contract**: `PMWidgets` "kebab (focus / S/M/L/XL / close)" — `Concepts/usage-concepts/BUILD_PLAN.md` L52–53. Treat S/M/L/XL presets and widget "focus mode" as **prototype-only** (see gaps).
- The only canonical chat kebab is **ACD-443 "Chat More-Options Kebab Menu"** (vertical-ellipsis inline-SVG; docked menu = Duplicate thread / Archive thread / Pop out / Close chat; floating = Cycle layout / Close chat; only Archive is a cataloged command, `cmd.chat.archive`). — assistant-chat-design L24269–24327. This is the kebab *pattern/chrome* reference (sprout + ACD-442 chrome), not a widget menu.

### Sizing model: presets vs free grid-span
- Canonical sizing = **free `col_span` / `row_span` with grid-snapping resize**, responsive column counts (2 at <1200px, 3 at 1200–1600px, 4 at >1600px), 8px gutters (MD spacing token). — FinalGUISpec Appendix C §C.1 L18–24; `cmd.widget.resize { page, instance_id, col_span, row_span }` UI_Command_Catalog L377.
- Prototype refinement: "free resize with **coarse-grid snap only on pointer-up**, FLIP no-flash" — Rebuild Plan L53. S/M/L/XL are prototype presets over col_span/row_span (not canonical).

### Add-widget flow (content + initial size)
- Canonical flow: Dashboard menu → "Add Widget" → select from named catalog → confirm placement and sizing → widget appears with default configuration. — FinalGUISpec §C.3 L41–47. Named catalog = `widget-orchestrator-progress`, `widget-active-lanes`, `widget-recent-results`, `widget-custom-metrics` (core vs custom). — §C.4 L49–59. The repaired canonical entrypoint dispatches **`cmd.dashboard.add_widget`** through `catalog.dashboard_add_widget` ("opens catalog, chooses widget, chooses or accepts slot/size, persists layout"). — FinalGUISpec L27735.
- Prototype refinement: add-widget picker = "choose type + content + size" — Rebuild Plan L52.

### Per-widget config + persistence schema/versioning
- Widget config "changes presentation, local filtering, and layout only"; widget-level filters inherit page/project/focused-run context. — Widget_System.md §2 L34–37 (WS-004).
- Widget shell data-contract fields: widget identity `/type`, scope, filter `/sort/display` config, projection ref. — Widget_System.md L64 (WS-006).
- Persistence: app-default with project override; canonical Dashboard writes go to **`widget_layout:v1:dashboard`**; legacy `dashboard_layout:v1` is import/rollback only; `orchestrator:progress` has its own namespace. — Widget_System.md §3 L74–83 (WS-009); FinalGUISpec §C.5 redb migration L78–90; persistence key `theme:v1` etc. in FinalGUISpec §15 (shard 022 L22). Prototype: "per-widget gear persisted, layout keyed per page-id" — Rebuild Plan L54–55.

### Focus mode + future reuse
- Widget "focus mode": prototype-only (Rebuild Plan kebab "focus", L53). No canonical `cmd.widget.focus`.
- Future reuse by Home/Orchestrator: prototype modules are "reusable, host-agnostic so Home/Orchestrator can adopt later" — Rebuild Plan L47. Canonical hostability: Dashboard may host a curated subset of Progress + some Usage widgets; deep inspection surfaces stay non-hostable native tabs; **only Orchestrator `Progress` is widget-composed** (`widget-orchestrator-progress`). — Widget_System.md L65 (WS-013), §4 L88–100 (WS-010/WS-011); 13-widget Progress catalog L102–115.

---

## Q4. Themes

### The 8 theme names (canonical, locked)
- Exactly eight built-in choices across four families: **Friendly Dark (default), Friendly Light, Glass Dark, Glass Light, Retro Dark, Retro Light, Basic Dark, Basic Light**. — FinalGUISpec §6.1 L24; Appendix B locked decision #5 (shard 027 L19); F3-271. Supersedes the prior three-family lock (Retro Dark/Light/Basic) per dec-2026-07-16-pm6-theme-settings-canon-promotion-seal. Custom themes via TOML in `~/.puppet-master/themes/` (§6.6).

### Spacing / shape variance rules (canonical tokens)
- Per-variant tokens (FinalGUISpec §6.2 table, shard 013 L29–58): `padding-scale` (Retro 1.0 / Basic 1.25), `border-radius` (Retro 0px / Basic 4px), `border-width` (Retro 2px / Basic 1px), `base-font-size` (Retro 14px / Basic 15px), `line-height` (1.4 / 1.6), `letter-spacing`, `scrollbar-width` (Retro 12px styled / Basic 8px system-like). Friendly/Glass variant tables live in the Theme System addendum 2026-07-16 (shard 060). Theme switching: live for colors/spacing/borders/overlays; **restart required for cross-family font changes** (Retro Orbitron/Rajdhani, Friendly Cal Sans/Quicksand/Nunito); same-family + Glass/Basic system-font switches stay live (§6.4; shard 060 L336–379).

### Friendly grid ground + glass containment (canonical)
- **Friendly** = "paper ground + 18px dot grid, category pastel tints, frosted chrome blur limited to title/status/bottom bars" (the "friendly grid ground"). — FinalGUISpec §6.1 L18.
- **Glass** = "one-pane glass slab: single backdrop blur over a pre-blurred wallpaper asset, alpha-derived transparency steps, glass-alpha slider, background modes mesh/depth/minimal" (the "glass containment"). — §6.1 L19. Glass alpha + reduce-animations apply live with no reload (FinalGUISpec L29698, L29708).

### No-colored-edge-strip rule — NUANCE / partial conflict
- The blanket "no colored edge strip / no left status edge-bars" is **prototype build-plan guidance** (Rebuild Plan L28 "No left status edge-bars"), specifically about not using colored edge strips as *status* indicators on usage cards/widgets.
- Canonical Plans DO use left-edge accent stripes/bars for **selection** (not status): activity-bar "Active/selected indicator: 3px left-edge accent stripe" (FinalGUISpec L615; shard 010 L106); chat rail active collapsed rows "left accent bar", expanded selected threads "inset left accent bar" (ACD-444 L24346–24347). Record as a reconciliation note, not a canonical prohibition.

### Settings scrollbar design
- Canonical: `scrollbar-width` theme token (Retro 12px styled / Basic 8px system-like) — FinalGUISpec §6.2 (shard 013 L58, L108). "Settings-page scrollbar treatment on every scroller" is **prototype build-plan guidance** (Rebuild Plan L25) layered on that token; no separate canonical "every scroller" rule found.

### Icon-only-control tooltip rule (canonical)
- "Every icon-only control has an accessible label, tooltip or equivalent label projection, keyboard/focus behavior, and nearby or programmatic state text." — FinalGUISpec L241 (F3-417 icon contract). Icons never the sole carrier of state. Usage page head Refresh/Export render icon-only with `title` + `aria-label` (UF-089, usage-feature L6191–6231; UI_Command_Catalog shard 020 L113–114 "GATE-010 icon-only rules"). Prototype: "every icon-only control gets title + aria-label + data-tip" (Rebuild Plan L90).

### No-user-facing-underscore rule
- **Prototype/build-plan only:** "No user-facing string may contain `_` (humanize at the view layer via `R.human`)" — Rebuild Plan L27. No equivalent canonical Plans prose found (machine command IDs explicitly allow underscores: Wiring_Matrix.schema L76; Wiring_Matrix.md L152). Record as a gap.
- Related canonical: **no emoji / SVG-only** IS canonical — "Do not use emoji, emoji-like pictographs, Unicode pseudo-icons, network/CDN icons, or icon-only state carriers in production GUI source" (FinalGUISpec L27644; F3-417). Kebab glyph must be inline SVG, not emoji (ACD-443 L24319).

---

## Q5. Motion

### Canonical motion contract (sprout family)
- Corner-origin sprout: open ~300ms overshoot from non-uniform closed scale; close ~220ms opacity-held-then-fade; search-driven height changes spring with overshoot + brief size-bounce; reduced motion = instant show/hide. — ACD-439 L24050–24060. Single-overlay invariant (one popout at a time) per ACD-438.
- Web-idiom → Slint motion portability map (canonical owner = FinalGUISpec, via Cozy Shelves addendum shard 064): **F3-473 "Expander Motion Portability Map"** L31247–31289 — grid-rows spring → animated height on clipped rect; max-height tween → animation to measured content height; box-shadow pulse → opacity/scale ring overlay; underline width ink → scaleX/x transform on ink rect; **corner sprout menu → PopupWindow with corner-origin transform**; scroll-reveal → one-shot entrance stagger on first model paint (never re-triggered on scroll). "No DOM-shaped emulation."

### Detailed motion tokens (durations/easing) — prototype/build-plan
- The explicit token table (entrance `cubic-bezier(0,.4,0,1)` 160–300ms; exit `cubic-bezier(.6,0,.8,.6)` ~70% of enter; interactive `cubic-bezier(.4,1,.6,1)` 80–140ms; scale-in 220–300ms; pulse 1.6–2s; count-up 900–1100ms; stagger 30–45ms capped ~6/group; FLIP transform+opacity only) is in `Concepts/usage-concepts/BUILD_PLAN.md` L59–75 — a researched build plan, **not yet a canonical Plans motion annex** (the plan itself notes L124–125: "record native spring()/linear() as the canonical easing approach for a future spec motion annex"). Treat specific cubic-beziers as prototype-only; the sprout durations (~300/~220ms) and reduced-motion-instant ARE canonical (ACD-439).

### Reduced-motion contract (canonical)
- `prefers-reduced-motion` respected (no animations/transitions) — FinalGUISpec L2120. Reduced motion renders sprout open/close as instant show/hide (ACD-439 L24070). F3-473 L31262–31264: reduced-motion parity completes all mapped animations instantly, zero transition-delay equivalents. Shell hover jiggle/sheen/parallax killed under reduced motion (F3-446, FinalGUISpec L3104); toast reduced-motion instant (F3-447). `reduce-animations` setting drives application reduced-motion (FinalGUISpec L29698). Terminal reduced-motion handling active for enter animations (FinalGUISpec L841; shard 012 L34).
- Prototype keeps both a manual MOTION toggle AND `prefers-reduced-motion` (Rebuild Plan L26).

### No-left-edge-selection rule
- See Q4 nuance: there is **no canonical "no-left-edge-selection" prohibition**; canonical uses left-edge accent stripes for selection (activity bar L615; chat rail ACD-444). The "no left status edge-bars" rule is prototype guidance (Rebuild Plan L28) about status (not selection) edge strips on usage widgets.

---

## Q6. Command IDs — see `plans-command-registry.md` for the full table.
Definitive canonical IDs: `cmd.chat.compact_context`, `cmd.chat.open_thread_context_details` (+ focus/close family), `cmd.chat.context_lens.{toggle,set_mode,turn_off,toggle_message_selection,clear_selection,apply_subcompact,revert_subcompact}`, `cmd.widget.{add,remove,resize,configure,move,reset_layout}`, `cmd.dashboard.{add_widget,catalog}`, `cmd.theme.{set_mode,set_accent,set_density,preview,reset}`, `cmd.usage.{refresh,export}`, `cmd.nav.{open_subject,open_usage_subject,focus_route}`. **Missing/prototype-only:** widget kebab `focus` and S/M/L/XL preset commands; a dedicated reduced-motion toggle command.

## Q7. DRY ownership
- **UI_Command_Catalog owns command IDs**, wrapper normalization, and `normalizes_to_contract`; FinalGUISpec owns app-wide theme tokens + glass plate recipes; Widget_System owns hostability/layout/projection inheritance and is a **drift-amplifier consumer**, not an owner of page semantics; assistant-chat-design + usage-feature own context/usage display. — DRY_Rules §2/§2.1 (shard 004 L46, L59); ACD-442 owner_boundary L24263–24264; Widget_System WS-003/WS-005.
- Anti-duplication: consumers must not restate owner canon; owner docs update before consumers; summary/checklist/feature-list mirrors do not re-own canon. — DRY_Rules §2 L15–19. Context popups/menus: chat header menus bind to FinalGUISpec shared chrome tokens (ACD-442); widgets consume shared projections, not raw events (WS-006); widget actions route through canonical commands + route/open (WS-005). Per-concept duplication of widgets/menus/context popups is prohibited — the prototype's `PMWidgets`/`PMContext`/`PMTabs` are deliberately host-agnostic shared modules (Rebuild Plan L47–55) to satisfy this.

## Q8. Slint 1.17.1 mapping
- Pinned toolkit: **Slint 1.17.1 on Rust stable 1.96.1**, `.slint` compiled via `slint_build`; Winit+Skia default, FemtoVG-wgpu fallback, software emergency; Slint/WASM canvas web GUI via trusted local daemon. — FinalGUISpec L133, L166, L198, L3040; Spec_Lock.json L404 (`toolkit_version: 1.17.1`); 00-plans-index L25/L207; F3-417 (GUI platform currentness owner) L27563+.
- File organization + mapping: FinalGUISpec §14 (shard 021) — `ui/` tree (theme.slint, widgets/, views/ incl. `usage.slint`, panels/, windows/), `src/bridge/` (theme_bridge/model_bridge/callback_bridge/window_bridge), `src/theme/` (palette/tokens/variants/custom_loader). View switching via conditional `if` blocks (zero runtime cost for hidden views); virtualized lists via `ListView`+`VecModel` (custom ring-buffer Model for 100k+).
- Theme global: `ThemeMode` enum {friendly-dark…basic-dark} + `global Theme` tokens applied by Rust `ThemeVariant::apply_to` (§6.5, shard 013 L84–129).
- Web→Slint portability rules (canonical): F3-473 one-for-one motion map (Q5); repeated "Slint portability" notes — popouts/menus render as **opaque precomputed popup surfaces with translate/opacity/height Slint property animations; no arbitrary-content backdrop blur, no SVG filters; color math precomputed** (ACD-439/440/441/442/443; UF-089 L6229; F3-473). Prototype non-portable audit (Rebuild Plan L100–102): no `:has` / container-query / `backdrop-filter` in concept code, no `calc()`-in-`transform`, `linear()`/springs behind `@supports` as web-only enhancements; every motion carries a duration+easing token mappable to a Slint state transition (FLIP → state-driven transition; reveal → property toggle).
