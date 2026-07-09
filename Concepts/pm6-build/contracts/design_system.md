# PMConcept6 design system + theme architecture (authoritative for theme/polish agents; TOKENS.md is the distilled var contract)

## 0. Measured baseline (PMConcept4)
143 backdrop-filter declarations (~71 surfaces, 3–26px, two saturate(1.3)); 13 rules stack `filter: url(#glass-distortion*)` on top of backdrop-blur pseudo-layers (bento-card 483, widget-card 515, floating-chat 543, project-card 572, title-bar 600, chat-panel 626, files-panel 652, psm/inspector 1194–1382); `.app-shell::before` fixed inset -20% animated with transform AND hue-rotate (re-rasterizes per frame); `::after` inset -15% wave + shared glassRayRotate full-screen; shimmer canvas = per-pixel JS raytrace ~57k px/frame, always-running rAF even in non-glass themes, full-viewport mix-blend-mode:soft-light; `contain` once; reduced-motion only 5 scoped blocks; theme switch = #themeSelect → documentElement data-theme, no persistence. Var census (NEVER rename): --sm×536 --md×423 --accent-blue×369 --border-light×365 --text-muted×355 --accent-lime×309 --xs×265 --surface-elevated×259 --text-primary×235 --text-secondary×227 --surface×196 --accent-orange×163 --border×137 --border-radius×133 --border-width×109 --display-font×99 --accent-magenta×99 --lg×97 --xl×72 --wg-accent×58 --body-font×50 --pm-tab-hi×36 --accent-error×33 --accent-warning×26 --shadow×23 + --terminal-*, --graph-*, --background, --surface-alt, --mono-font.

## 1. Token architecture (add to :root; themes override; never rename existing)
```
--radius-xs:2px; --radius-sm:6px; --radius-md:10px; --radius-lg:16px; --radius-xl:22px; --radius-pill:999px;
--accent-primary:var(--accent-blue); --accent-primary-rgb:0,71,171;
--accent-soft:color-mix(in srgb, var(--accent-primary) 12%, transparent);
--accent-glow:color-mix(in srgb, var(--accent-primary) 25%, transparent);
--elev-1:0 1px 2px rgba(0,0,0,.12); --elev-2:0 4px 14px rgba(0,0,0,.16);
--elev-3:0 12px 36px rgba(0,0,0,.22); --elev-hover:0 10px 30px var(--accent-glow);
--motion-fast:120ms; --motion-med:240ms; --motion-slow:420ms;
--ease-out:cubic-bezier(.22,1,.36,1); --ease-spring:cubic-bezier(.34,1.56,.64,1);
--ease-smooth:cubic-bezier(.4,0,.2,1); --ease-snap:cubic-bezier(.2,0,0,1);
--ease-default:var(--ease-smooth); --sheen-dur:.6s;
--fs-2xs:10px; --fs-xs:11px; --fs-sm:12px; --fs-md:14px; --fs-lg:16px; --fs-xl:20px; --fs-2xl:26px; --fs-3xl:32px;
--lh-tight:1.2; --lh-body:1.55; --2xl:24px; --3xl:32px; --density:1;
--activity-bar-w:72px; --files-panel-w:260px; --chat-panel-w:550px; --chat-sidebar-w:200px;
--tile-size:220px; --floating-chat-w:550px;
--glass-alpha:.55; --glass-tint-rgb:16,20,34; --panel-blur:16px; --panel-blur-sm:10px;
--glass-edge:rgba(255,255,255,.35); --glass-hairline:rgba(255,255,255,.08);
```
Glass bg mode: `data-glass-bg="mesh|depth|minimal"` on <html> (default mesh) + single `<div id="glass-bg" aria-hidden="true">` first-in-body (position:fixed; inset:0; z-index:0; contain:strict) with 3 mode sub-trees (inactive display:none). Transparency: slider writes `--glass-alpha` on documentElement + localStorage pm.glassAlpha (range dark .35–.85, light .45–.88). Boot snippet (inline <script> in head before CSS): read pm.theme (default friendly-dark), pm.glassBg, pm.glassAlpha → set attributes. <html> tag ships `data-theme="friendly-dark" data-glass-bg="mesh"`.

## 2. Per-theme specs
### friendly-dark (DEFAULT)
--background:#16171D; --surface:#1E2027; --surface-elevated:#262932; --surface-alt:#1A1C22; --text-primary:#F2F3F7; --text-secondary:#ABB0BE; --text-muted:#7E8494; --border:rgba(255,255,255,.09); --border-light:rgba(255,255,255,.06); --accent-blue:#6D8DFF; --accent-primary-rgb:109,141,255; --accent-lime:#3DDC97; --accent-magenta:#FF7AB6; --accent-orange:#FFA94D; --accent-warning:#FFC24B; --accent-error:#FF6B6B; --graph-pending:#7E8494 --graph-running:#FFA94D --graph-passed:#3DDC97 --graph-failed:#FF6B6B --graph-planning:#6D8DFF --graph-gating:#B78CFF; --border-radius:12px; --radius-md:12px; --radius-lg:18px; --border-width:1px; --display-font:'Nunito' (800); --body-font:'Nunito'; --base-font-size:14.5px; line-height 1.55; --grid-gap:20px; --shadow/--elev-2:0 2px 6px rgba(0,0,0,.30), 0 10px 24px rgba(0,0,0,.22); --elev-hover:0 12px 30px rgba(109,141,255,.22); --ease-default:var(--ease-spring); --motion-med:260ms.
Character (skin block): pill nav tabs; activity icons in 40px radius-14 tiles that scale on hover (Switch home-row); active = --accent-soft fill + 3px pill indicator (never glow); chips/badges radius-pill; buttons r10, pressed scale(.97); cards borderless elevation-only + `inset 0 1px 0 rgba(255,255,255,.04)` top-light.
### friendly-light
--background:#EEF1F6; --surface:#F7F9FC; --surface-elevated:#FFFFFF; --surface-alt:#E8EBF2; --text-primary:#23262E; --text-secondary:#565D6D; --text-muted:#7A8194; --border:rgba(35,38,46,.10); --border-light:rgba(35,38,46,.06); --accent-blue:#4C5FE8; --accent-primary-rgb:76,95,232; --accent-lime:#12B879; --accent-magenta:#E85D9E; --accent-orange:#F08C2E; --accent-warning:#DE9B0E; --accent-error:#E5484D; graph: #9AA1B0/#F08C2E/#12B879/#E5484D/#4C5FE8/#9B6DE8; geometry/motion = friendly-dark; --shadow:0 2px 6px rgba(35,40,60,.06), 0 12px 28px rgba(35,40,60,.10); --elev-hover:0 12px 30px rgba(76,95,232,.18). Wii-white energy: white cards on cool-gray canvas, hierarchy without borders.
### glass-dark (liquid glass)
--background:#0A0E1A; --glass-tint-rgb:16,20,34; --glass-alpha:.60; --surface:rgba(16,20,34,var(--glass-alpha)); --surface-elevated:rgba(24,29,46,calc(var(--glass-alpha) + .08)); --text-primary:#F0F4FA; --text-secondary:#A8B3C7; --text-muted:#7C8AA0; --accent-blue:#2DD4BF; --accent-magenta:#F472B6; --accent-lime:#34D399; --accent-orange:#FB923C; --accent-warning:#FBBF24; --accent-error:#F87171; --border:rgba(255,255,255,.10); --border-light:rgba(255,255,255,.06); --border-radius:14px; --panel-blur:16px; fonts Inter 14px lh1.5; --shadow:0 8px 24px rgba(0,0,0,.38); --ease-default:var(--ease-out); --motion-med:320ms.
Surface recipe (single element, no pseudo-blur, no SVG filter):
background: linear-gradient(180deg, rgba(var(--glass-tint-rgb), calc(var(--glass-alpha) + .06)), rgba(var(--glass-tint-rgb), var(--glass-alpha)));
backdrop-filter: blur(var(--panel-blur)) saturate(1.5);
box-shadow: inset 0 1px 0 var(--glass-edge), inset 0 0 0 1px var(--glass-hairline), inset 0 -12px 24px -18px rgba(255,255,255,.10), 0 8px 24px rgba(0,0,0,.38);
Hero surfaces (floating-chat, active modal) add gradient-hairline ::after (padding:1px + mask-composite:exclude; linear-gradient(135deg, rgba(255,255,255,.35), rgba(255,255,255,.05) 40%, rgba(45,212,191,.25))).
### glass-light
--background:#D7E0EC; --glass-tint-rgb:255,255,255; --glass-alpha:.55; --text-primary:#1C2230 (solid!); --text-secondary:#485468; --text-muted:#6B7688; --accent-blue:#0E7DD8; --accent-magenta:#D6379B; --accent-lime:#0B9E6E; --accent-orange:#E0740F; --accent-warning:#C8860B; --accent-error:#D93843; --glass-edge:rgba(255,255,255,.85); --glass-hairline:rgba(28,34,48,.08); --shadow:0 8px 24px rgba(40,55,90,.14); saturate(1.35). Slider floor .45 = legibility guarantee.
### retro deltas (identity: square corners, hard offsets, Orbitron display ≥12px only)
--border-width 3→2px + new --border-width-inner:1px (list rows, inputs, chat message borders, table cells); retro-dark --border #E0E0E0→#A8ACB3, --border-light #333→#3A3D42, --text-secondary #888→#A6A6A6, --text-muted→#909090; retro-light --border #1A1A1A→#4A463F, --text-muted→#524F49; --base-font-size 14→15px, lh 1.55, body weight 500; sub-12px display uses (role-badge 9px, activity labels 9px, kickers) → --display-font-sm:'Rajdhani' 700 +.08em tracking; --shadow 4px 4px 0 → 3px 3px 0 (dark rgba(224,224,224,.55), light rgba(26,26,26,.30)); inputs get radius 2px; scanline/texture overlays opacity ≤.04, none under reduced-motion.
### basic
Inherit tokens (--radius-* 4/6px, --elev mapped to flat shadows) + sheen; basic-light --text-muted #666→#5C6470.

## 3. Glass performance budget (hard rules)
DELETE: all 13 filter:url(#glass-distortion*) + their ::before/::after blur pseudo-layer pattern (collapse to single-element recipe); SVG filter defs (~20123–20153); shimmer engine JS + canvas + .gl-shimmer-overlay CSS; aurora/wave/ray layers (288–435) + keyframes glassBgShift/glassRayRotate/glassDark|LightColorShift/Aurora/Wave (2799–2869); convert any glow pulses to opacity-animated pre-rendered ::after.
Backdrop-filter cap: 8 declared / ≤6 visible — keepers: .title-bar 16px, .activity-bar 14px, .files-panel/.left-panel 12px, .chat-panel 12px, .floating-chat 20px, .status-bar+.bottom-panel 10px, modal/popover layer 20px. Everything else (cards inside blurred panels, buttons, badges, thread items, textareas, tabs, msg bubbles, term tabs) → pre-baked rgba fills: rgba(var(--glass-tint-rgb), calc(var(--glass-alpha) + .10)) + inset specular/hairline.
Backgrounds (children of #glass-bg; inset:-6% max; will-change:transform only on animated node):
- mesh (default): one div, 4 radial gradients (dark: teal .16 @15% 30%, pink .13 @85% 25%, violet .10 @55% 80%, blue .08 @30% 70% over linear-gradient(160deg,#0A0E1A,#101426 60%,#141031); light: .10–.14 alphas over linear-gradient(160deg,#D7E0EC,#CDD9E8,#D3DBEA)); ONE keyframe pm-mesh-drift 90s ease-in-out infinite alternate → translate3d(-2.5%,1.5%,0) scale(1.05).
- depth: static base + 6 gradient-faked-blur shapes (radial-gradient circles 180–520px, no filter) in 2 wrappers (.par-near/.par-far); each shape pm-float-N 45–100s alternate translate3d ±3–6%; pointer parallax via one throttled rAF writing --par-x/--par-y consumed by wrapper transforms (near 10px/6px, far 4px/2px); gated by reduced-motion.
- minimal: static div: --background + vignette radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,.28)) (light rgba(40,55,90,.14)) + grain data-URI (feTurbulence baseFrequency .9, tiled 180px, opacity .03 dark/.05 light).
Containment: contain:layout paint on .bento-card,.widget-card,.bento-widget,.project-card-bento,.chat-panel,.files-panel,.bottom-panel,.floating-chat,.s4-panel,.chat-thread-sidebar. content-visibility:auto + contain-intrinsic-size:auto 600px on inactive .page containers + long scrollers. Target: no >16ms frames, integrated GPU, 1080p.

## 4. Type/spacing/legibility
Type mapping: 10–11px meta/kickers only (tracking +.06em, weight 600+); 12px list meta; body per theme; 16px card titles; 20px panel headers; 26px page titles; 32px hero stats. Spacing: --xs..--xl untouched; new rules quantize to 4px grid; card padding ≥ var(--xl), friendly 20px. Contrast: AA 4.5:1 primary+secondary, 4.0:1 muted (≥12px only), 3:1 boundaries/focus. Focus ring stays (outline 2px) + outline-color:var(--accent-primary). Fonts link: add Nunito 400;600;700;800; drop Exo 2 if grep confirms zero font-family references. Final: Inter, Nunito, Orbitron:700, Rajdhani.

## 5. Motion system
Keyframes: pm-enter-up (opacity 0/translateY(12px)→1/0), pm-enter-scale (.96→1), pm-pop (overshoot 1.06 spring), pm-press (scale .97 90ms), pm-page-in (8px slide+fade 180ms), pm-celebrate (scale pop + expanding 1px ring via ::after opacity/scale), pm-shake-subtle (±3px 300ms). Stagger: animation-delay calc(var(--i,0)*50ms), cap 8.
Sheen hover utility `.pm-sheen` (replaces ALL pink-glow hovers): ::before{content:"";position:absolute;top:0;left:-70%;width:45%;height:100%;background:linear-gradient(105deg,transparent,color-mix(in srgb,var(--text-primary) 8%,transparent),transparent);transform:skewX(-18deg);transition:left var(--sheen-dur) ease;pointer-events:none} hover→left:130%; host hover translateY(-4px) + box-shadow var(--elev-hover); child .pm-hover-icon → scale(1.1) rotate(-4deg) var(--motion-med) var(--ease-spring). Hosts need position:relative; overflow:hidden. Apply to: bento cards, project cards, dashboard tiles, s4 settings cards, widget headers, wizard topic cards. Delete/override existing glass hover glows (bento-card:hover ~497, wizard-btn:hover ~757, glow tabs 733–811) and s4 pink glow (~9134–9138 in pm4-settings-css).
Per-theme personality: friendly --ease-spring 260ms sheen .55s; glass --ease-out 320ms sheen .7s; retro --ease-snap 140ms sheen .35s (fast glint); basic --ease-smooth 200ms.
Reduced motion (append LAST in pm6-css-global): @media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important} #glass-bg *{animation:none!important}} plus same rules under `[data-motion="reduced"]` (settings toggle).

## 6. Responsive tiers
px→var swaps at source (6 edits: .activity-bar 3064, .files-panel 3126, .chat-panel 3331, .chat-thread-sidebar 3381, .floating-chat → min(var(--floating-chat-w),40vw), bento tiles 8029–8031 → repeat(auto-fill,minmax(var(--tile-size),1fr))).
- A ≥2200: current values.
- B 1720–2199: --chat-panel-w:480px; --files-panel-w:240px; --tile-size:200px; --grid-gap:20px.
- C 1440–1719 (PRIMARY 16:9 TARGET): --chat-panel-w:clamp(380px,26vw,440px); --files-panel-w:220px; --chat-sidebar-w:0 (auto-collapse); activity bar collapsed 36px rail by default; --tile-size:190px; --floating-chat-w:440px; --density:.9.
- D 1180–1439: chat = overlay drawer (fixed right, translateX(100%), .open slides over scrim); files = 48px icon rail w/ hover flyout; dashboard 2→1 col; --density:.85; bottom panel 120px.
- E <1180: single-column stage; tabs scroll.
(max-height:800px) modifier applies tier-C heights.
