// Which PM7 kit checks a changed file can affect, for `browser-check run <kit> --changed <range>`.
//
// The engine reads three names from this file (README "Run only what a change affects"):
//   affects        rows {files: [repo-relative globs], checks: [kit-relative check globs], why}; a changed file selects
//                  the checks of every row whose files match it (the union). A row with checks: [] places a file that no
//                  check can see (docs, the map itself), so changing it selects nothing.
//   affectsAlways  checks every --changed run includes: boot and the two cheapest smoke checks.
//   affectsAll     files whose change means run everything.
// A changed check file selects itself. Any changed file no row places makes the engine run everything.
// Globs use only `*` (any characters inside one path segment) and `**` (any number of whole segments, none included).
//
// How the rows are made, so they can be kept true:
//   1. checkSurfaces says what each check exercises (the onboarding window, the Demo Studio, the chat, Settings, ...),
//      read from its code: the selectors, page globals, helpers and looks it uses. surfaceEvidence holds the patterns;
//      tools/affects-check.mjs fails when a check's code (with the kit files it imports) matches a surface its entry
//      here lacks. Extra surfaces are allowed: a wrong inclusion costs a little browser time, a wrong exclusion a round.
//   2. sourceRows says which surfaces each product source controls, from how Concepts/onboarding/opus-5.5/tools/build.py
//      assembles Concepts/PMConcept7.html (the base shell, the O55 module, Settings, Usage, the rail, glyphs, Home, the
//      5.6 Pro chat, Liquid Glass, wallpapers) and what each source file says it owns. A row selects every check that
//      has one of its surfaces.
//   3. kitRows place the kit's own files and the repository files checks read at run time (imports and file reads),
//      verified against the real import graph by the self-check.
//   4. noCheckRows place files that neither the build nor any check reads. The self-check's --trace mode runs the build
//      with every opened file recorded and fails if one of them is placed only here.
// Adding a check: give it an entry in checkSurfaces (run `node tools/affects-check.mjs`; it names the surfaces its code
// shows). Adding a kit helper or a cross-check import: add a kitRows row. Adding a source file: put it in a sourceRows row.

const O = 'Concepts/onboarding/opus-5.5';
const C56 = 'Concepts/chat-assistant-concepts/5.6 Pro';
const KIT = 'Concepts/pm7-tools/browser-check';

// ---- surfaces ---------------------------------------------------------------------------------------------------
export const surfaces = {
	window: 'the onboarding window: its screens, header, look menu, components, Pip\'s stage and copy',
	studio: 'the Demo Studio sheet and its "Open at one screen" and scenario controls',
	tour: 'the Guided Tour (its bar, callouts, look menu and the Teacher in the chat)',
	chat: 'the hosted 5.6 Pro chat: transcript, Activity, Crew and other sheets, plates, Pod, the chat\'s Pip',
	home: 'Home: the universal panels, board, editor and the overlay root',
	terminal: 'the Home terminal',
	usage: 'the Usage page and the Usage widgets Home hosts',
	rail: 'the left rail, its panels, shelves and menus, and the title bar\'s menus',
	settings: 'Settings: the panel, its engine (PM12_KIMI, PM51), managers, setup window and family pickers',
	notify: 'the bell, the inbox and toasts',
	sound: 'the sound engine (O55.sound, Pip\'s voice, the chat\'s sound)',
	timing: 'frame, idle and motion timing (O55.motion, PM_BUSY, the look change cover, films and traces)',
	looks: 'switching looks (t.app.look, the ten LOOKS, look menus)',
	glass: 'a Liquid Glass look is painted',
	nier: 'a NieR look is painted',
	glyphs: 'the glyph system: PMG icons, the neon renderer, PMLogo (Pip\'s logo)',
	shell: 'the app page itself: boot, layout at a width, the title bar, page audits'
};

// Patterns that show a surface in a check's code (and the kit files it imports). The self-check requires every
// surface whose pattern matches to be in that check's checkSurfaces entry.
export const surfaceEvidence = {
	window: /o55=screen|#pm-o55-onboarding|onboarding:\s*true|\bO55\.(ui|open|S|screens|draft|c|flow|lookMenu|pipStage|pipScenes)\b|\.o55-(pane|layer|choice|btn|card|tile|win)\b|onboarding-fields|openAt\(/,
	studio: /pmds|O55\.studio\b/,
	tour: /O55\.tour\b|data-o55t|\.o55t-/,
	chat: /#pmRoot|PM56_|\.pmx-|#chatPanel|\.pm56-|activity-panel|data-action="collab/,
	home: /\bPMW\b|\.pmw-|#pmw-|\.pmed-|PM_EDITOR_CUSTOMIZE|#panel-home/,
	terminal: /\.pmt-|PM_TERMINAL/,
	usage: /\.pmu-|#panel-usage|data-pmu/,
	rail: /\bPMR\b|\.pmr-|data-rail|#panel-(docker|search|git|files|projects)\b/,
	settings: /PM12_KIMI|\bPM51\b|\.pm51-|#pm-settings-root|#tab-settings|data-setting|setSettingFromHost|PM7_SETTINGS_TOME/,
	notify: /#pmn|\.pmn-|PM_TITLEBAR_NOTIFY/,
	sound: /O55\.sound\b|AudioContext|AudioScheduledSourceNode|PM56_SOUND/,
	timing: /PM_BUSY|Tracing\.start|O55\.motion\b|PM_THEME_TRANSITION|PM_LOOK_COVERED|frame-clock|activity-paint/,
	looks: /t\.app\.look\(|\bLOOKS\b|setFamily\(|PM_NIER\.set\(/,
	glass: /glass-(light|dark)|data-lg\b|\bLOOKS\b/,
	nier: /nier-(light|dark)|PM_NIER|data-o55-nier|\bLOOKS\b/,
	glyphs: /PMLogo|\bPMG\b|\.pmg-|PM_PIP_PARTS/
};

// ---- what each check exercises ------------------------------------------------------------------------------------
// From each check's code and its README row. `shell` marks checks that judge the app page itself.
export const checkSurfaces = {
	'checks/activity-speed-film.check.mjs': ['chat', 'settings', 'timing', 'looks', 'shell'],
	'checks/ai-token-ownership.check.mjs': ['window', 'studio', 'timing', 'looks', 'glass', 'nier'],
	'checks/back-after-change.check.mjs': ['window', 'studio', 'notify', 'timing', 'looks', 'glass', 'nier'],
	'checks/boot.check.mjs': ['shell'],
	'checks/browser-fallback.check.mjs': ['window', 'notify'],
	'checks/button-anchor-face.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/button-checkbox-producers.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/button-consent-face.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/button-copy-face.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/button-editor-face.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/button-press-edges.check.mjs': ['window', 'tour', 'studio', 'timing', 'looks', 'glass', 'nier'],
	'checks/button-press-faces.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/button-server-guest-face.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/button-server-self-face.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/chat-demo-dispatch.check.mjs': ['chat', 'studio', 'tour', 'shell'],
	'checks/chat-detail-film.check.mjs': ['chat', 'home', 'settings', 'timing', 'nier', 'shell'],
	'checks/chat-detail-matrix.check.mjs': ['chat', 'home', 'timing', 'looks', 'glass', 'nier', 'shell'],
	'checks/chat-gaze.check.mjs': ['chat', 'settings', 'timing', 'looks', 'glass', 'shell'],
	'checks/chat-resize-raster.check.mjs': ['chat', 'home', 'timing', 'shell'],
	'checks/chat-sweep-project.check.mjs': ['window', 'chat', 'notify', 'looks', 'glass', 'nier', 'glyphs', 'shell'],
	'checks/chat-sweep-surfaces.check.mjs': ['chat', 'settings', 'sound', 'looks', 'glass', 'nier', 'glyphs', 'shell'],
	'checks/chat-sweep.check.mjs': ['chat', 'home', 'settings', 'sound', 'timing', 'nier', 'shell'],
	'checks/cheer-endpoint.check.mjs': ['window', 'notify'],
	'checks/choice-boundary-film.check.mjs': ['window', 'timing', 'looks', 'glass'],
	'checks/choice-help-press.check.mjs': ['window', 'timing', 'looks', 'glass'],
	'checks/choice-hit-bounds.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/choice-hover-film.check.mjs': ['window', 'timing', 'looks', 'glass'],
	'checks/choice-press-edges.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/choice-visuals.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/choice-width-press.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/cold-bell.check.mjs': ['notify', 'sound', 'timing', 'looks', 'glass', 'rail', 'shell'],
	'checks/copied-install-failure.check.mjs': ['window', 'studio', 'notify'],
	'checks/editor-build-completion.check.mjs': ['home', 'chat', 'sound', 'usage', 'timing', 'shell'],
	'checks/editor-build-input.check.mjs': ['home', 'chat', 'sound', 'usage', 'timing', 'shell'],
	'checks/editor-style-scope.check.mjs': ['window', 'studio', 'looks', 'glass', 'nier'],
	'checks/empty-server.check.mjs': ['window', 'notify'],
	'checks/failed-status-contrast.check.mjs': ['window', 'studio', 'timing', 'looks', 'glass', 'nier', 'glyphs'],
	'checks/field-ring.check.mjs': ['window', 'looks', 'glass', 'nier'],
	'checks/followup-routes-matrix.check.mjs': ['window', 'studio', 'rail', 'notify', 'looks', 'glass', 'nier', 'shell'],
	'checks/glass-backing.check.mjs': ['chat', 'home', 'settings', 'rail', 'notify', 'looks', 'glass', 'nier', 'glyphs', 'shell'],
	'checks/glass-frost-resize.check.mjs': ['window', 'looks', 'glass'],
	'checks/home-chart-labels.check.mjs': ['home', 'usage', 'looks', 'glass', 'nier', 'shell'],
	'checks/hover-light.check.mjs': ['chat', 'looks', 'glass', 'nier', 'shell'],
	'checks/identity.check.mjs': ['window', 'notify'],
	'checks/idle-in-drag.check.mjs': ['home', 'usage', 'timing', 'looks', 'glass', 'nier', 'shell'],
	'checks/inbox-prewarm.check.mjs': ['home', 'notify', 'timing', 'shell'],
	'checks/look-help-body.check.mjs': ['window', 'settings', 'timing', 'looks', 'glass', 'nier', 'glyphs'],
	'checks/look-menu-input.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/look-menu-open-resize.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/look-menu-targets.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/look-palette-bounds.check.mjs': ['window', 'tour', 'settings', 'timing', 'looks', 'glass', 'nier', 'glyphs'],
	'checks/looks.check.mjs': ['looks', 'glass', 'nier', 'shell'],
	'checks/motion-token-speed.check.mjs': ['chat', 'settings', 'timing', 'looks', 'shell'],
	'checks/nas-pair-instead.check.mjs': ['window', 'notify', 'looks', 'glass', 'nier'],
	'checks/nas-review.check.mjs': ['window', 'notify', 'looks', 'glass', 'nier'],
	'checks/native-dialogs.check.mjs': ['chat', 'home', 'terminal', 'notify', 'shell'],
	'checks/nier-cold-open-cut.check.mjs': ['window', 'timing', 'looks', 'nier'],
	'checks/nier-help-on-chosen.check.mjs': ['window', 'looks', 'nier'],
	'checks/nier-loader-phase.check.mjs': ['studio', 'chat', 'timing', 'looks', 'nier', 'glyphs'],
	'checks/onboarding-audit.check.mjs': ['window', 'notify', 'looks', 'glass', 'nier'],
	'checks/onboarding-auto.check.mjs': ['window', 'settings', 'timing', 'looks', 'glass', 'nier', 'glyphs'],
	'checks/onboarding-copy.check.mjs': ['window', 'sound', 'looks', 'glass', 'nier', 'glyphs'],
	'checks/own-servers.check.mjs': ['window', 'settings', 'notify'],
	'checks/performance-default-route.check.mjs': ['studio', 'chat', 'home', 'notify', 'sound', 'timing', 'looks', 'glass', 'nier', 'rail', 'shell'],
	'checks/performance-round2.check.mjs': ['studio', 'chat', 'home', 'notify', 'sound', 'timing', 'looks', 'glass', 'nier', 'rail', 'shell'],
	'checks/performance-stalls.check.mjs': ['studio', 'chat', 'home', 'notify', 'sound', 'timing', 'looks', 'glass', 'nier', 'rail', 'shell'],
	'checks/performance-surfaces.check.mjs': ['studio', 'chat', 'home', 'usage', 'notify', 'sound', 'timing', 'looks', 'glass', 'nier', 'rail', 'shell'],
	'checks/pip-bubble-clear.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/pip-census.check.mjs': ['chat', 'glyphs', 'shell'],
	'checks/pip-nas-lines.check.mjs': ['window', 'studio', 'timing', 'looks', 'glass', 'nier'],
	'checks/pip-speech-owner.check.mjs': ['window', 'studio', 'timing', 'looks', 'glass', 'nier'],
	'checks/pip-voice-room.check.mjs': ['sound', 'chat', 'looks', 'glass', 'nier', 'shell'],
	'checks/place-seed-boundaries.check.mjs': ['window'],
	'checks/plate-style.check.mjs': ['chat', 'timing', 'looks', 'glass', 'nier', 'shell'],
	'checks/plate-text.check.mjs': ['chat', 'looks', 'glass', 'nier', 'shell'],
	'checks/pod-clearance.check.mjs': ['chat', 'home', 'settings', 'timing', 'looks', 'nier', 'shell'],
	'checks/pod-setup-repeat.check.mjs': ['chat', 'home', 'settings', 'timing', 'looks', 'nier', 'shell'],
	'checks/project-menu-route.check.mjs': ['rail', 'looks', 'glass', 'shell'],
	'checks/qa2-chatpip.check.mjs': ['studio', 'chat', 'settings', 'looks', 'glass', 'nier', 'shell'],
	'checks/rail-chip.check.mjs': ['window', 'sound', 'timing', 'looks', 'glass', 'nier'],
	'checks/reduced-motion.check.mjs': ['timing', 'shell'],
	'checks/resize-budget-ab.check.mjs': ['home', 'chat', 'rail', 'timing', 'looks', 'shell'],
	'checks/sandbox.check.mjs': ['shell'],
	'checks/settings-scope.check.mjs': ['settings', 'studio', 'home', 'notify', 'looks', 'glass', 'nier', 'shell'],
	'checks/setup-window.check.mjs': ['settings', 'rail', 'looks', 'glass', 'nier', 'shell'],
	'checks/shelf-route.check.mjs': ['rail', 'chat', 'looks', 'shell'],
	'checks/shell-contrast.check.mjs': ['window', 'studio', 'looks', 'glass', 'nier', 'glyphs'],
	'checks/shell-loader-phase.check.mjs': ['studio', 'timing', 'looks', 'glass'],
	'checks/shell-scroll-contrast.check.mjs': ['window', 'studio', 'looks', 'glass', 'glyphs'],
	'checks/shell-state.check.mjs': ['window', 'studio', 'chat', 'home', 'settings', 'notify', 'looks', 'glass', 'nier', 'glyphs', 'shell'],
	'checks/sound-prime.check.mjs': ['sound', 'shell'],
	'checks/stage-keepoff.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/studio-contrast-edge.check.mjs': ['studio', 'window', 'tour', 'chat', 'sound', 'looks', 'nier'],
	'checks/studio-screens.check.mjs': ['window', 'studio', 'looks'],
	'checks/studio-scroll-overflow.check.mjs': ['studio', 'window', 'home', 'looks', 'glass', 'shell'],
	'checks/theme-family.check.mjs': ['settings', 'rail', 'timing', 'looks', 'glass', 'nier', 'glyphs', 'shell'],
	'checks/theme-header.check.mjs': ['tour', 'settings', 'timing', 'looks', 'glass', 'nier', 'glyphs'],
	'checks/token-signin-intro.check.mjs': ['window', 'studio', 'looks', 'glass', 'nier', 'glyphs'],
	'checks/welcome-look-pip.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/widths.check.mjs': ['shell'],
	'checks/wizard-chip-moments.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'checks/wizard-header.check.mjs': ['window', 'sound', 'timing', 'looks', 'glass', 'nier'],
	'checks/work-projection.check.mjs': ['studio', 'chat', 'looks', 'shell'],
	'diagnostics/button-covered-negative.check.mjs': ['window', 'tour', 'studio', 'timing', 'looks', 'glass', 'nier'],
	'diagnostics/choice-help-paired-film.check.mjs': ['window', 'timing', 'looks', 'glass'],
	'diagnostics/choice-hit-bounds.check.mjs': ['window', 'timing', 'looks', 'glass', 'nier'],
	'providers/app.check.mjs': ['window', 'tour', 'chat', 'usage', 'settings', 'notify', 'shell'],
	'providers/providers.check.mjs': ['window', 'studio', 'settings', 'notify', 'looks']
};

// ---- what each product source controls ---------------------------------------------------------------------------
// files: repo-relative globs; surfaces: the checks with any of these surfaces are selected.
export const sourceRows = [
	// the O55 module (Concepts/onboarding/opus-5.5/src, spliced in as pm-o55-css / pm-o55-js with window.O55_COPY)
	{ files: [`${O}/src/js/5*.js`, `${O}/src/js/6*.js`, `${O}/src/js/7*.js`, `${O}/src/js/20-store.js`, `${O}/src/js/25-fixtures.js`, `${O}/src/js/30-owners.js`, `${O}/src/js/32-project-recovery.js`, `${O}/src/js/35-draft.js`, `${O}/src/js/36-endpoint.js`, `${O}/src/js/40-stages.js`, `${O}/src/css/00-tokens.css`, `${O}/src/css/1*.css`, `${O}/src/css/20-motion.css`, `${O}/src/css/25-glyphs.css`, `${O}/src/css/30-art.css`, `${O}/src/css/68-srv.css`, `${O}/src/copy.json`, `${O}/src/copy.d/*.json`, `${O}/src/coverage.json`, `${O}/src/coverage.map.json`],
		surfaces: ['window'], why: 'the onboarding window: screens (65-76), UI core and components (60-62), look menu (63-64), Pip\'s stage (50-59), draft, owners, fixtures, store, its styles and copy (the Studio\'s Onboarding section lists its screens, so checks that read that list carry window too)' },
	{ files: [`${O}/src/js/63-look-menu.js`, `${O}/src/js/64-nier-look.js`, `${O}/src/css/13-nier-look.css`, `${O}/src/js/16-nier-fx.js`, `${O}/src/css/05-nier-fx.css`, `${O}/src/css/45-glass-controls.css`, `${O}/src/css/25-glyphs.css`, `${O}/src/js/20-store.js`, `${O}/src/js/21-talk.js`, `${O}/src/copy.json`, `${O}/src/copy.d/10-nier-fx.json`, `${O}/src/copy.d/40-nier-look.json`],
		surfaces: ['window', 'tour'], why: 'shared by the onboarding window and the Guided Tour: the look menu and NieR look, NieR effects, Glass controls, glyph hosts, the store, Plain English / Expert' },
	{ files: [`${O}/src/js/21-talk.js`, `${O}/src/copy.d/49-pip-settings.json`, `${O}/src/copy.d/55-nier-chips.json`, `${O}/src/copy.d/60-tour-settings.json`, `${O}/src/js/25-fixtures.js`], surfaces: ['settings'], why: 'Settings rows and editors that read O55 copy, talk mode and fixtures' },
	{ files: [`${O}/src/js/8*.js`, `${O}/src/css/40-tour.css`, `${O}/src/css/41-tour-nier.css`, `${O}/src/css/43-chat-labels.css`, `${O}/src/copy.d/50-nier-tour.json`, `${O}/src/copy.d/60-tour-settings.json`], surfaces: ['tour'], why: 'the Guided Tour (80-85) and its styles' },
	{ files: [`${O}/src/js/81-tour-chat.js`, `${O}/src/js/84-pod042-chat.js`, `${O}/src/css/43-chat-labels.css`, `${O}/src/copy.json`], surfaces: ['chat'], why: 'the Teacher and Pod 042 in the real chat, the guided-message labels, pod042 copy' },
	{ files: [`${O}/src/js/9*.js`, `${O}/src/css/5*.css`, `${O}/src/copy.d/75-demo-studio.json`], surfaces: ['studio', 'shell'], why: 'the Demo Studio (90-92) and its "Concept demo" item in the status bar' },
	{ files: [`${O}/src/js/10-motion.js`], surfaces: ['window', 'tour', 'studio', 'timing'], why: 'O55.motion: the JS motion clock, Reduced Motion and low-resource detection' },
	{ files: [`${O}/src/js/12-theme-transition.js`, `${O}/src/css/21-look-veil.css`], surfaces: ['looks', 'timing'], why: 'the cover a look change crosses through (PM_THEME_TRANSITION, PM_LOOK_COVERED)' },
	{ files: [`${O}/src/js/13-page-layer.js`], surfaces: ['shell', 'rail', 'settings', 'home'], why: 'the page in front gets its own layer near the title bar: page switches' },
	{ files: [`${O}/src/js/15-sound.js`, `${O}/src/js/15-sound-pip.js`, `${O}/src/copy.d/30-sound.json`], surfaces: ['sound', 'window', 'tour', 'studio', 'chat'], why: 'O55.sound and Pip\'s voice: sound buttons in the window and tour, the Studio\'s sound kits, the shared sound switch' },
	{ files: [`${O}/src/js/19-notify.js`, `${O}/src/css/26-notify-*.css`, `${O}/src/copy.d/70-notify.json`], surfaces: ['notify', 'shell'], why: 'PM Notify: the bell, the inbox and every toast, in the title bar of every page' },
	{ files: [`${O}/src/js/48-work.js`, `${O}/src/css/48-work.css`, `${O}/src/copy.d/49-work.json`], surfaces: ['chat', 'studio', 'home', 'shell'], why: 'the agents and processes panel in the overlay root, the Studio\'s work scenarios' },
	{ files: [`${O}/src/css/21-shell-perf.css`], surfaces: ['chat', 'tour', 'shell'], why: 'the shell\'s original chat hidden under the hosted chat (the tour takes it off)' },
	{ files: [`${O}/src/css/03-retro-light-readability.css`], surfaces: ['chat'], why: 'chat message colours in Retro Light' },
	{ files: [`${O}/src/css/24-no-pills-projects.css`], surfaces: ['shell', 'rail'], why: 'the Projects page without pill labels' },
	{ files: [`${O}/src/js/27-wizard-stage.js`, `${O}/src/css/27-wizard-orch.css`, `${O}/src/css/29-wizard-stage.css`], surfaces: ['window', 'tour', 'rail', 'shell'], why: 'the Planning Wizard and Orchestrator pages (opened after onboarding, by the tour\'s practice run and from the rail)' },
	{ files: [`${O}/src/css/28-theme-menu-chosen.css`], surfaces: ['shell', 'settings', 'looks'], why: 'the title-bar theme menu\'s Light / Dark / Auto' },
	// Settings (src/settings, the fork that replaces the T50 bands; settings_layer.py splices it)
	{ files: [`${O}/src/settings/**`], surfaces: ['settings'], why: 'Settings: engine kit, managers, rows, placement, data, its styles and editors' },
	{ files: [`${O}/src/settings/kit.d/18-nier.js`, `${O}/src/settings/kit.d/23-nier-theme-menu.js`, `${O}/src/settings/styles.d/12-look.css`, `${O}/src/settings/styles.d/18-nier-theme-menu.css`, `${O}/tools/nier_palette.py`, `${O}/tools/nier_registry.py`],
		surfaces: ['nier', 'looks', 'shell'], why: 'NieR\'s engine, which every family switch passes through (PM_NIER), its title-bar menu rows, its palette and the lists every layer registers; the look settings\' root styles' },
	{ files: [`${O}/src/settings/kit.d/19-nier-parts.js`, `${O}/src/settings/kit.d/20-nier-world.js`, `${O}/src/settings/kit.d/21-nier-scenes.js`, `${O}/src/settings/styles.d/13-nier.css`, `${O}/src/settings/styles.d/14-nier-parts.css`, `${O}/src/settings/styles.d/15-nier-world.css`, `${O}/src/settings/styles.d/16-nier-scenes.css`, `${O}/src/settings/styles.d/29-nier-calm.css`, `${O}/src/settings/nier/**`, `${O}/tools/nier_scene_art.py`, `${O}/tools/nier_scenes.py`],
		surfaces: ['nier'], why: 'what NieR paints while it is on: tokens, parts, world, scenes, fonts (the parts editor, kit.d/22-nier-chips.js, has a row of its own below)' },
	// Settings code the O55 module calls (found by the page globals each O55 file uses and where each is defined)
	{ files: [`${O}/src/settings/managers/50-servers.js`, `${O}/src/settings/managers/53-transfer.js`], surfaces: ['window'], why: 'the away screen calls PM51.sysAway (50-servers) and the project screen reads PM_SETTINGS_PROJECT_SNAPSHOTS (53-transfer)' },
	{ files: [`${O}/src/settings/kit.d/22-nier-chips.js`], surfaces: ['window', 'tour'], why: 'the NieR look in the window and the tour bar opens PM_NIER_CHIPS' },
	{ files: [`${O}/src/settings/kit.d/10-values.js`, `${O}/src/settings/kit.d/40-bound.js`], surfaces: ['notify'], why: 'PM Notify reads settings through PM51.value' },
	{ files: [`${O}/src/settings/kit.d/16-pages.js`], surfaces: ['tour'], why: 'O55 boot calls PM51.refreshTourRows' },
	{ files: [`${O}/src/settings/kit.d/28-chat-port.js`, `${O}/src/settings/o55/*/64-chat-port.json`, `${O}/src/settings/kit.d/70-personas.js`], surfaces: ['chat'], why: 'the hosted chat reads and writes Settings through this adapter; the persona library' },
	{ files: [`${O}/src/settings/kit.d/24-terminal-look.js`], surfaces: ['terminal', 'home'], why: 'the Terminal look rows and the terminal' },
	{ files: [`${O}/src/settings/kit.d/25-editor-look.js`, `${O}/src/settings/kit.d/27-panel-rows.js`, `${O}/src/settings/proposed.d/*.json`], surfaces: ['home'], why: 'the Editor look rows and the Home panels\' own rows' },
	{ files: [`${O}/src/settings/kit.d/28-pip-parts.js`, `${O}/src/settings/kit.d/29-pip-editor.js`, `${O}/src/settings/styles.d/17-pip-editor.css`], surfaces: ['glyphs', 'chat', 'window'], why: 'Pip\'s parts (PM_PIP_PARTS) and their editor' },
	{ files: [`${O}/src/settings/kit.d/47-status-words.js`], surfaces: ['shell'], why: 'words beside the status bar\'s agent and process counts' },
	{ files: [`${O}/src/settings/managers/05-notifications.js`, `${O}/src/settings/styles.d/19-sound-library.css`], surfaces: ['notify', 'sound'], why: 'Notifications & Sounds and the sound library' },
	// Usage (Concepts/usage-redesign, usage_layer.py: the Usage page and the widgets Home hosts)
	{ files: ['Concepts/usage-redesign/src/**', 'Concepts/usage-redesign/tools/usage_layer.py'], surfaces: ['usage', 'home', 'shell'], why: 'the Usage page and the Usage widgets on Home\'s board' },
	// the left rail (Concepts/leftrail-redesign, rail_layer.py: concept D's skin over the shell's rail panels, PMR.menu)
	{ files: ['Concepts/leftrail-redesign/src/**', 'Concepts/leftrail-redesign/tools/rail_layer.py', 'Concepts/leftrail-redesign/tools/build_d_css.py'], surfaces: ['rail', 'shell', 'home', 'chat', 'settings', 'usage'], why: 'the rail, its panels and PMR.menu, which replaces the shell\'s menus' },
	// Home (Concepts/home-redesign, home_layer.py: the universal panels, the terminal and guarded app patches)
	{ files: ['Concepts/home-redesign/src/**', 'Concepts/home-redesign/tools/home_layer.py'], surfaces: ['home', 'terminal', 'usage', 'chat', 'shell'], why: 'Home: the panels, editor, terminal and the overlay root; the chat sits in Home\'s column' },
	// the 5.6 Pro chat (chat56_layer.py mounts it in #chatPanel; its sources are 5.6 Pro's own files in build.py's order)
	{ files: [`${C56}/*.js`, `${C56}/*.css`, `${C56}/build.py`, `${C56}/pm7-port/**`], surfaces: ['chat', 'home', 'shell'], why: 'the hosted 5.6 Pro chat and its PM7 port' },
	{ files: [`${C56}/nier*.css`, `${C56}/retro.css`, `${C56}/pm7-port/tools/chat56_nier.py`, `${C56}/pm7-port/tools/patches_nier.py`], surfaces: ['looks', 'nier'], why: 'the chat in NieR and Retro' },
	{ files: [`${C56}/chat-sound.js`, `${C56}/chat-sound.css`], surfaces: ['sound'], why: 'the chat\'s sound' },
	// Liquid Glass (build_proto.py: glass.css with its slot fragments, glass.js) and the wallpapers (build_walls.py)
	{ files: ['Concepts/liquid-glass/opus-5.5/src/**', 'Concepts/liquid-glass/opus-5.5/tools/build_proto.py'], surfaces: ['glass', 'looks'], why: 'Liquid Glass: gated on html[data-lg] and a Glass look' },
	{ files: ['Concepts/wallpapers/opus-5.5/src/**', 'Concepts/wallpapers/opus-5.5/catalog.d/*.json', 'Concepts/wallpapers/opus-5.5/index.html', 'Concepts/wallpapers/opus-5.5/tools/build_walls.py'], surfaces: ['looks', 'glass', 'settings', 'shell'], why: 'every look\'s wallpaper prints, the catalog and the Settings gallery' }
];

// Files whose change means run everything: the page every check loads, the build and its whole-page passes, the shell,
// the O55 core every O55 part uses, fonts and the hover engine (every painted text and control), the page-wide motion
// start, idle and after-layout service, the look settings, the glyph system, and the kit config.
export const affectsAll = [
	'Concepts/PMConcept7.html',
	`${O}/tools/build.py`, `${O}/tools/base_source.py`, `${O}/tools/settings_layer.py`, `${O}/tools/settings_restore.js`,
	`${O}/tools/motion_finish.js`, `${O}/tools/active_descendant_rewrite.py`, `${O}/tools/active_descendant_rules.json`,
	`${O}/tools/css_bucket_split.py`, `${O}/tools/css_media_split.py`,
	`${O}/base/**`,
	`${O}/src/js/00-namespace.js`, `${O}/src/js/05-util.js`, `${O}/src/js/11-motion-start.js`, `${O}/src/js/18-hover.js`, `${O}/src/js/95-boot.js`,
	`${O}/src/css/01-webfonts.css`, `${O}/src/css/02-control-fonts.css`, `${O}/src/css/03-symbols.css`, `${O}/src/css/06-corners.css`,
	`${O}/src/css/22-hover.css`, `${O}/src/css/23-hover-perf.css`, `${O}/src/css/24-no-pills.css`, `${O}/src/css/25-hover-controls.css`,
	`${O}/src/css/60-switcher-looks.css`, `${O}/src/css/61-look-palette.css`, `${O}/src/fonts/**`,
	`${O}/src/settings/kit.d/05-fixes.js`, `${O}/src/settings/kit.d/17-look.js`,
	'Concepts/pm7-tools/settings_refresh_source.py', 'Plans/settings_inventory.json',
	'Concepts/glyph-system/opus-5.5/src/**', 'Concepts/glyph-system/opus-5.5/tools/glyph_layer.py',
	`${C56}/neon-icons.js`, `${C56}/neon-icons.css`, `${C56}/pm56-neon-live.css`,
	`${KIT}/browser-check.config.mjs`
];

// Checks every --changed run includes.
export const affectsAlways = ['checks/boot.check.mjs', 'checks/sandbox.check.mjs', 'checks/reduced-motion.check.mjs'];

// ---- the kit's own files and the repository files checks read at run time -----------------------------------------
const ONBOARDING_FIELDS = ['back-after-change', 'browser-fallback', 'cheer-endpoint', 'chat-sweep-project', 'empty-server', 'identity', 'nas-pair-instead', 'nas-review', 'onboarding-audit', 'own-servers', 'followup-routes-matrix'];
const ACTIVITY_CLOCK = ['chat-detail-film', 'chat-sweep', 'editor-build-input'];
const PAINTED_TEXT = ['failed-status-contrast', 'shell-scroll-contrast', 'shell-state'];
const c = (names) => names.map((n) => (n.includes('/') ? n : `checks/${n}`) + '.check.mjs');
export const kitRows = [
	{ files: [`${KIT}/helpers/onboarding-fields.mjs`], checks: c(ONBOARDING_FIELDS), why: 'imported (followup-routes-matrix through empty-server, cheer-endpoint and browser-fallback)' },
	{ files: [`${KIT}/helpers/activity-paint.mjs`, `${KIT}/helpers/activity-frame-clock.mjs`], checks: c(ACTIVITY_CLOCK), why: 'imported' },
	{ files: [`${KIT}/helpers/activity-cover-pixels.mjs`], checks: c([...ACTIVITY_CLOCK, 'chat-resize-raster']), why: 'imported through activity-frame-clock and resize-raster' },
	{ files: [`${KIT}/helpers/resize-raster.mjs`], checks: c(['chat-resize-raster']), why: 'imported' },
	{ files: [`${KIT}/helpers/look-menu-lines.mjs`], checks: c(['look-menu-open-resize', 'look-menu-input', 'onboarding-copy']), why: 'imported' },
	{ files: [`${KIT}/helpers/painted-text.mjs`], checks: c(PAINTED_TEXT), why: 'imported' },
	{ files: [`${KIT}/helpers/studio-contrast-pixels.cjs`], checks: c(['studio-contrast-edge']), why: 'imported' },
	{ files: [`${KIT}/checks/choice-press-edges.check.mjs`], checks: c(['choice-width-press']), why: 'imported by another check' },
	{ files: [`${KIT}/checks/empty-server.check.mjs`, `${KIT}/checks/cheer-endpoint.check.mjs`, `${KIT}/checks/browser-fallback.check.mjs`, `${KIT}/checks/shelf-route.check.mjs`, `${KIT}/checks/studio-screens.check.mjs`], checks: c(['followup-routes-matrix']), why: 'imported by another check' },
	{ files: [`${KIT}/checks/look-menu-open-resize.check.mjs`], checks: c(['look-menu-input']), why: 'imported by another check' },
	{ files: [`${KIT}/checks/performance-stalls.check.mjs`], checks: c(['performance-default-route', 'performance-round2', 'performance-surfaces']), why: 'imported by other checks (performance-surfaces through performance-default-route)' },
	{ files: [`${KIT}/checks/work-projection.check.mjs`, `${KIT}/checks/sound-prime.check.mjs`], checks: c(['performance-round2', 'performance-surfaces']), why: 'imported by other checks' },
	{ files: [`${KIT}/checks/looks.check.mjs`, `${KIT}/checks/widths.check.mjs`, `${KIT}/checks/reduced-motion.check.mjs`, `${KIT}/checks/plate-style.check.mjs`, `${KIT}/checks/performance-default-route.check.mjs`, `${KIT}/checks/idle-in-drag.check.mjs`], checks: c(['performance-surfaces']), why: 'imported by another check' },
	{ files: [`${KIT}/checks/pod-clearance.check.mjs`], checks: c(['pod-setup-repeat']), why: 'imported by another check' },
	{ files: [`${KIT}/checks/button-press-edges.check.mjs`], checks: c(['diagnostics/button-covered-negative']), why: 'imported by a diagnostic' },
	{ files: [`${KIT}/checks/choice-hit-bounds.check.mjs`], checks: c(['diagnostics/choice-hit-bounds']), why: 'imported by a diagnostic' },
	{ files: [`${KIT}/checks/glass-backing.check.mjs`], checks: c(['project-menu-route']), why: 'read as text by another check (its locator)' },
	{ files: [`${O}/tools/pm7_parity_png.mjs`], checks: c(['failed-status-contrast', 'field-ring', 'glass-backing', 'setup-window', 'shell-contrast', ...ACTIVITY_CLOCK, 'chat-resize-raster', ...PAINTED_TEXT]), why: 'the PNG reader, imported directly and through activity-cover-pixels and painted-text' },
	{ files: [`${C56}/tests/pmx-verify.mjs`], checks: c(['pip-census']), why: 'its loop-census lint body runs on the page' },
	{ files: [`${C56}/PM_Chat_Assistant_5.6_Pro_Standalone.html`], checks: c(['chat-sweep-project']), why: 'the standalone chat it compares with' },
	{ files: [`${O}/tools/perf/resize_perf.py`], checks: c(['resize-budget-ab']), why: 'its gesture amplitudes and durations are read from this file' },
	{ files: ['Plans/pip_parts.json'], checks: c(['onboarding-copy']), why: 'the Pip part help it compares with' },
	{ files: ['Concepts/settings-scope/opus-5.5/**'], checks: c(['settings-scope']), why: 'the settings-scope layer it tests (build_standalone.py builds its page)' }
];

// Files that neither the build nor any check reads. Changing them selects nothing.
export const noCheckRows = [
	{ files: [`${KIT}/README.md`, `${KIT}/affects.mjs`, `${KIT}/tools/affects-check.mjs`, `${KIT}/tools/calibrate-activity-paint.mjs`], checks: [], why: 'the kit\'s docs, this map, its self-check and the paint calibration tool' },
	{ files: [`${O}/*.md`, `${O}/tools/*.md`, `${O}/tools/*.mjs`, `${O}/tools/*.test.py`, `${O}/tools/perf/**`, `${O}/tools/inert_sources.json`, `${O}/tools/page_lint_baseline.json`, `${O}/tools/pm7_parity_states.json`, ...['artlab', 'audit_rules', 'motioncheck', 'schema_check', 'sheet', 'shell_motion', 'sound_board', 'sound_catalog', 'split_base', 'symbols_font', 'wizorch_layer'].map((n) => `${O}/tools/${n}.py`), `${O}/tools/nier_fx_bench.js`], checks: [], why: 'the O55 package\'s docs, test, perf, audit and generator tools, and the build\'s --check baselines (named one by one: a new tool is unplaced until someone says what it is)' },
	{ files: ['Concepts/usage-redesign/tools/boards.py', 'Concepts/usage-redesign/tools/build_usage.py', 'Concepts/leftrail-redesign/tools/build_rail.py', 'Concepts/leftrail-redesign/tools/parity.py', 'Concepts/leftrail-redesign/tools/rail_perf.py', 'Concepts/leftrail-redesign/tools/mac/**', 'Concepts/home-redesign/tools/build_home.py', ...['build_catalog', 'build_map', 'extract_looks', 'family_sheet', 'tune_inks'].map((n) => `Concepts/glyph-system/opus-5.5/tools/${n}.py`), 'Concepts/liquid-glass/opus-5.5/tools/warm_catalog.py', 'Concepts/liquid-glass/opus-5.5/tools/warm_splits.json', 'Concepts/wallpapers/opus-5.5/tools/art.js'], checks: [], why: 'the layers\' standalone builders, review and tuning tools, which build.py does not read' },
	{ files: [`${C56}/tests/**`, `${C56}/handoff/**`, `${C56}/reports/**`, `${C56}/evidence/**`, `${C56}/history/**`, `${C56}/*.md`, `${C56}/*.json`, `${C56}/*.mjs`, `${C56}/*.html`, `${C56}/*.csv`], checks: [], why: '5.6 Pro\'s tests, handoffs, reports, docs and standalone pages' },
	{ files: ['Concepts/pm7-tools/verify/**'], checks: [], why: 'the retired PM7 verifiers' },
	{ files: ['Plans/**'], checks: [], why: 'plans; the two Plans files the build or a check reads have rows of their own' }
];

// The product sources: everything build.py reads to make the page (traced with tools/affects-check.mjs --trace).
// Every tracked file these match must be placed by a sourceRows row or affectsAll.
export const productSources = [
	`${O}/base/**`, `${O}/src/**`, `${O}/tools/build.py`, `${O}/tools/base_source.py`, `${O}/tools/settings_layer.py`,
	`${O}/tools/settings_restore.js`, `${O}/tools/motion_finish.js`, `${O}/tools/active_descendant_rewrite.py`,
	`${O}/tools/active_descendant_rules.json`, `${O}/tools/css_bucket_split.py`, `${O}/tools/css_media_split.py`,
	`${O}/tools/nier_palette.py`, `${O}/tools/nier_registry.py`, `${O}/tools/nier_scene_art.py`, `${O}/tools/nier_scenes.py`,
	'Concepts/usage-redesign/src/**', 'Concepts/usage-redesign/tools/usage_layer.py',
	'Concepts/leftrail-redesign/src/**', 'Concepts/leftrail-redesign/tools/rail_layer.py', 'Concepts/leftrail-redesign/tools/build_d_css.py',
	'Concepts/glyph-system/opus-5.5/src/**', 'Concepts/glyph-system/opus-5.5/tools/glyph_layer.py',
	'Concepts/home-redesign/src/**', 'Concepts/home-redesign/tools/home_layer.py',
	`${C56}/*.js`, `${C56}/*.css`, `${C56}/build.py`, `${C56}/pm7-port/**`,
	'Concepts/liquid-glass/opus-5.5/src/**', 'Concepts/liquid-glass/opus-5.5/tools/build_proto.py',
	'Concepts/wallpapers/opus-5.5/src/**', 'Concepts/wallpapers/opus-5.5/catalog.d/*.json', 'Concepts/wallpapers/opus-5.5/index.html',
	'Concepts/wallpapers/opus-5.5/tools/build_walls.py',
	'Concepts/pm7-tools/settings_refresh_source.py', 'Plans/settings_inventory.json', 'Concepts/PMConcept7.html'
];

// ---- the rows the engine reads -------------------------------------------------------------------------------------
// Source rows first, in sourceRows' order, then kitRows, then noCheckRows (tools/affects-check.mjs relies on it).
export function buildRows(parts) {
	const checksWith = (wanted) => Object.keys(parts.checkSurfaces).filter((file) => parts.checkSurfaces[file].some((s) => wanted.includes(s)));
	return [
		...parts.sourceRows.map((row) => ({ files: row.files, checks: checksWith(row.surfaces), why: `${row.why} (surfaces: ${row.surfaces.join(', ')})` })),
		...parts.kitRows,
		...parts.noCheckRows
	];
}
export const affects = buildRows({ checkSurfaces, sourceRows, kitRows, noCheckRows });
