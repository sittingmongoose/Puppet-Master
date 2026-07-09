# theme-glass requests (W1)

Backdrop-filter budget is 8 declared / <=6 visible (design_system §3). My glass parts now declare exactly 7 (title-bar, activity-bar, files+left panel, chat-panel, floating-chat, status+bottom chrome, modal/popover layer). The following rules in FROZEN parts still declare backdrop-filter inside blurred ancestors and must be demoted to pre-baked fills `rgba(var(--glass-tint-rgb), calc(var(--glass-alpha) + .10))` + `inset 0 0 0 1px var(--glass-hairline)`:

- [part 06] line ~67 `[data-theme^="glass"] .provider-row { backdrop-filter: blur(10px) ... }` — demote to pre-baked rgba fill.
- [part 06] line ~68 `[data-theme^="glass"] .ac-inspector { backdrop-filter: blur(12px) ... }` — demote.
- [part 06] line ~69 `[data-theme^="glass"] .ac-sidebar { backdrop-filter: blur(10px) ... }` — demote.
- [part 06] line ~567 `.pm-term-overflow { ... backdrop-filter: blur(8px); }` (unthemed rule — applies in ALL themes) — drop the blur, keep the color-mix fill.
- [part 06] line ~669 `[data-theme^="glass"] .pm-term-wg-tab { backdrop-filter: blur(18px); }` — demote.
- [part 06] line ~691 `[data-theme^="glass"] .pm-term-subtab { backdrop-filter: blur(10px); }` — demote.
- [part 06] line ~697 `[data-theme="glass-light"] .pm-term-subtab { backdrop-filter: blur(10px); }` — demote.
- [part 06] line ~1245 `[data-theme^="glass"] .terminal-pane-toolbar { backdrop-filter: blur(4px); }` — demote.
- [part 06] line ~1294 `[data-theme^="glass"] .terminal-pane, [data-theme^="glass"] .terminal-workspace .terminal-section { backdrop-filter: blur(8px); }` — demote (terminal already gets a solid --terminal-bg fill from glass-a).
- [part 07] line ~484 `[data-theme^="glass"] .context-menu-mock { backdrop-filter: blur(12px); background: rgba(30,30,50,0.85); }` — fill is already near-opaque; drop the blur.
- [part 08] line ~1108 `.project-settings-modal { ... backdrop-filter: blur(4px); }` (full-viewport scrim, all themes) — drop the blur, darken the rgba scrim instead (e.g. rgba(0,0,0,.68)); the modal CONTENT keeps real blur via my modal-layer keeper.
- [part 06] lines ~1661/#1665 `.editor-tabs .tab.tab-focused` glass inset glows — static inset shadows, acceptable; optional polish: reduce to a single inset ring `inset 0 -2px 0 rgba(var(--pm6-glass-a-rgb), .4)`.

Shimmer engine deletion follow-ups:

- [part 11] line ~4 `<div class="gl-shimmer-overlay"><canvas id="gl-shimmer-canvas"></canvas></div>` — dead markup: the shimmer engine (old part 27) is deleted. Remove the div (or fold into the new #glass-bg node). Nothing references #gl-shimmer-canvas anymore.
- [part 02] lines ~288-435 — aurora/wave/ray layers + `.gl-shimmer-overlay` CSS reference keyframes that no longer exist (glassRayRotate, glassDarkAurora/Wave/ColorShift, glassLightAurora/Wave/ColorShift were deleted from glass-b per design_system §3). Delete those layer rules/animation properties (already assigned to theme-tokens in design_system §3; flagging because the animation-name references are now dangling).
- [part 02] glass token block: I ship safety definitions of --glass-alpha/--glass-tint-rgb/--panel-blur/--panel-blur-sm/--glass-edge/--glass-hairline/--motion-fast/--motion-med/--ease-out scoped to `[data-theme^="glass"]` (glass-a) plus per-variant overrides (glass-b), values verbatim from design_system §1/§2. When the canonical :root/theme copies land in part 02 / pm6-css-global these duplicates are harmless (identical values) — prune mine in W3 polish if desired.
- [part 02] lines ~226-229 still define --gd-teal/--gd-pink(-rgb); my rewritten parts no longer reference them, but frozen parts 05-08 may — check before pruning.
