# W2_LEDGER.md — Wave-1 request sweep (requests-sweeper, 2026-07-09)

Every bullet in notes/*.requests.md is accounted for below. Statuses:
- **done** — already satisfied in the current tree (verified by grep/gate this sweep; "by W1" unless noted)
- **executed-by-sweeper** — done in this W2 pass (checks/contracts only)
- **routed:css-integration** — frozen CSS parts 05-08 (that agent's W2 scope)
- **routed:js-integration** — frozen JS parts 24/26 + part-25 shims (that agent's W2 scope)
- **routed:W3-polish** — deferred to Wave 3 (either the note itself says W3, or it is a page/theme/chat/terminal part outside W2 scope)
- **info** — coordination/FYI note, no action required; recorded as a constraint

## bottom-panel.requests.md
| request | status |
|---|---|
| [29x-pm6-js-globals] add `bell` key to PM_ICONS (consumer switch planned for W3) | routed:W3-polish — pair the icon addition with the `#pm6StatusBell` switch the note already schedules for W3 |
| [part 05] `.debug-phase-badge` vocab rename | done — part 05:776 now `.debug-stage-badge`; part 25:316 emits it; check_vocab PASS |

## chat.requests.md
| request | status |
|---|---|
| [part 05] `.debug-phase-badge` rename | done (same as above) |
| [part 25] modernize pre-PM173 wording in mockThreads canned HTML | routed:js-integration — no gate-regex hits remain (copy modernization only; keep `thread-*` ids, `th-*` stay chat-owned) |
| [settings] emit `chat.layout` from Settings | done — 29-js-settings-engine emits (2 hits), pm6-js-chat listens (6 hits) |
| [side-panels] typed `api_web_call` rows for `art-op-web-s1/r1` | done — part 12 carries the rows/action hooks (3 hits), pm6-js-panels renders `runtime_artifact.created` (`renderLiveArtifact`, api_web_call typed) |

## dashboard.requests.md
| request | status |
|---|---|
| [part 05] prune dead `.customize-widgets-btn`/`.add-widget-btn` | routed:W3-polish (note designates W3 prune) |
| [part 06] prune dead `.pm-tab-model-strip`/`.pm-route-chip` | routed:W3-polish (note designates W3 prune) |
| [part 03] prune dead glass `.customize-widgets-btn:hover` | routed:W3-polish (theme part) |
| [part 09] prune dead `.bento-dashboard` overrides | routed:W3-polish (note designates W3 prune) |
| [demo-engine] PM_DEMO_TEXT.files consumption contract | info — contract recorded; engine already ships files |
| [demo-engine] payload field shapes dashboard reads | info — engine payloads conform (runSnapshot exposes state/stage/pct-compatible fields) |
| [side-panels] prefer full-path `data-filename` values | info — side panels rebuilt in W1; residual QA in W3 matrix |
| [theme-tokens] prune `:where(:root)` fallback in pm6-css-dashboard once part 02 lands | done — no `:where(:root)`/fallback block remains in 10x-pm6-css-dashboard |
| [part 05] `.debug-phase-badge` | done (duplicate of above) |
| [part 21] "Phase: Root Cause"/"shell tier" copy | done — 0 hits in part 21; check_vocab PASS |
| [part 23] same copy in floating chat | done — 0 hits in part 23 |

## demo-engine.requests.md
| request | status |
|---|---|
| [part 05] extend/rename `.debug-phase-badge` selector for `debug-stage-badge` | done — selector renamed outright in part 05:776 |
| [part 20] fake gate workgroup pane via `PM_DEMO.on('run.gate')` | done — 29x-pm6-js-bottom subscribes `run.gate` (line 417) |
| [pm6-css-global] prettier dev panel styling | routed:W3-polish — note says "fine to leave as-is"; optional |
| [chat] web operation cards wiring (chat.card/web.op/web.sources) | done — chat W1 shipped; chat note confirms consumption |
| [side-panels] Runtime Artifacts api_web_call rows + live event | done — see chat section above |

## orchestrator.requests.md
| request | status |
|---|---|
| [part 05] `.debug-phase-badge` | done (duplicate) |
| [part 21] "Phase: Root Cause" copy | done (duplicate) |
| [part 23] vocab leftovers | done (duplicate) |
| [part 25] keep `.orch-tab[data-tab]` plain `.click()` semantics if handler rewritten | info — constraint recorded for js-integration; part-25 handler currently intact |

## projects.requests.md
| request | status |
|---|---|
| [29x-pm6-js-demo-engine] `run.state` payloads carry `state` string | done — `runSnapshot()` returns `state: S.run.stage` (documented in-source as coordination contract) |
| [29x-pm6-js-demo-engine] initial `run.state` emit on engine boot | routed:W3-polish — `init()` emits `demo.ready` but not `run.state`; optional sync nicety (jump/beat paths already emit) |
| [pm6-css-global] prune `#pm6-proj-token-standin-w2prune` in pm6-css-projects | routed:W3-polish — zero-risk deletion confirmed (part 02 defines all TOKENS.md vars; every usage has inline fallback); lives in a page part outside sweeper scope |
| [29-js-settings-engine] keep `.s4-psm-title` stable | done — engine never touches it; class present in part 15 |

## settings.requests.md
| request | status |
|---|---|
| [part 11] add friendly-dark/light to `#themeSelect`, friendly-dark default | done — options present, `friendly-dark` has `selected` |
| [part 25] `#themeSelect` handler persist `localStorage['pm.theme']` + refresh glass lock | routed:js-integration — handler (part 25 ~line 2140) still sets `data-theme` only |
| [part 02/pm6-css-global] map `data-density` onto `--density` | routed:W3-polish (note designates polish) |
| [chat parts] listen for `chat.layout` | done — pm6-js-chat listens (6 hits) |

## side-panels.requests.md
| request | status |
|---|---|
| [part 05] `.debug-phase-badge` | done (duplicate) |
| [pipeline/checks] check_structure.py KeyError on lock-missing sibling parts | executed-by-sweeper — missing-from-lock parts now expected balanced-zero + advisory (docstring documents the rule); unit-tested both branches; manifest.lock NOT regenerated |
| [part 20] keep terminal session `ts-sess-alpha` alive | done — present in part 20 (x4), pm6-js-bottom, part 24 |
| [part 17] registerSubtab('orchestrator') accepting node_graph/evidence | done — 29x-pm6-js-orchestrator:1301 registers; node_graph/evidence handled (15 hits) |
| [part 21/23] keep `#chatPanel` + `.hidden` toggle contract | done — id present exactly once; hidden-class contract intact; check_hooks PASS |
| [demo-engine] keep subscribed topic names stable | info — topic list recorded; engine unchanged |

## theme-glass.requests.md
| request | status |
|---|---|
| [part 06] demote backdrop-filters at ~67/68/69/567/669/691/697/1245/1294 to pre-baked fills | routed:css-integration — all nine verified still present |
| [part 07] `.context-menu-mock` ~484 drop blur | routed:css-integration — still present |
| [part 08] `.project-settings-modal` scrim ~1108 drop blur, darken scrim | routed:css-integration — still present |
| [part 06] optional single inset ring for `.tab.tab-focused` | routed:css-integration (optional) |
| [part 11] remove `.gl-shimmer-overlay` markup | done — 0 hits in part 11 |
| [part 02] delete dangling shimmer keyframe references | done — 0 hits of glassRayRotate/Aurora/Wave/ColorShift |
| [part 02] prune duplicate glass token safety copies | routed:W3-polish (note designates W3; theme part) |
| [part 02] prune `--gd-teal`/`--gd-pink` after checking frozen parts | routed:W3-polish — sweep verified: zero `var(--gd-teal/pink)` references outside part 02, prune is safe |

## theme-retro-basic.requests.md
| request | status |
|---|---|
| [part 02] retro `--display-font-sm`/`--border-width-inner` in both retro blocks | done — part 02 lines 127/133 (retro-dark) + 179/185 (retro-light); part-09 bootstrap prune stays W3 |
| [part 02] retro `--shadow` soften to 3px 3px | done — part 02 lines 120/172 match spec values |
| [part 05] retro chat-thread shadows 4px→3px + alpha drop (~570/684/692/697/702) | routed:css-integration — all still `4px 4px 0` |
| [part 05] Orbitron-below-12px repoints (activity-bar icons, files-panel-header) | routed:css-integration |
| [part 05] retro input `border-radius: 0` → `2px` | routed:css-integration |
| [part 06] `.terminal-section-title`/`.pm-dock-pill` retro font repoint | routed:css-integration |
| [part 06] `.ac-nav-item` `--mono-font` dependency | done — part 02 now defines `--mono-font` in :root; no local change needed |
| [part 07] retro shadows soften ~196/282/425 | routed:css-integration — still `4px 4px 0` |
| [part 07] `.remote-badge` `var(--font-mono)` → `var(--mono-font)` when touched | routed:css-integration — alias exists so it renders; canonical rename when touched |
| [part 08] retro shadows soften ~158/1295/1771 | routed:css-integration — still `4px 4px 0` |
| [part 08] Orbitron repoints (browser badges/subtabs) | routed:css-integration |
| [part 08] AA fix `color:#999` → `var(--text-muted)` | routed:css-integration |

## theme-tokens.requests.md
| request | status |
|---|---|
| [part 11] `#glass-bg` div first in body | done — present (x1) with sub-tree |
| [part 11] remove shimmer overlay | done (duplicate) |
| [part 11] friendly `#themeSelect` options + JS persistence | done (options) / routed:js-integration (part-25 handler persistence — duplicate of settings item) |
| [part 05] responsive px→var swaps (activity-bar/files/chat widths, tile grid) | routed:W3-polish (note designates "part 05 / polish") |
| [any glass/panels] pointer-parallax writing `--par-x/--par-y` | done — 29x-pm6-js-panels ~499-515: throttled rAF, reduced-motion gated |
| [checks] prune BASELINE_UNDEFINED allowlist | executed-by-sweeper — all six verified defined in part 02 (lines 60-65); allowlist now empty; TOKENS.md §2 updated to RESOLVED |

## Sweep-time verifications (task-mandated)
- Sidecar: 817 settings across 12 categories, **zero duplicate setting ids, zero duplicate category ids**; check_settings_data PASS.
- Assembled PM_SETTINGS_DATA: `general.visual.theme` renders **8 options** (Friendly/Glass/Retro/Basic × Dark/Light), `default`/`value`/`recommended` = **"Friendly Dark"**.
- Gate: `python3 assemble.py --gate g2` PASS with all checks hard (see final run in W2 report).
