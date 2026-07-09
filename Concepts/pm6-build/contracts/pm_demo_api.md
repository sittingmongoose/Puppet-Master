# PM_DEMO — fake-functional demo engine contract (authoritative for demo-engine + all page agents)

Fork base = PMConcept4.html. PM_TERMINAL_DEMO (js-terminal-demo part) is preserved; wrap, don't rewrite.

## Global hoists (pm6-js-globals block, FIRST new script)
- `window.PM_ICONS` — the SVG icon map (see ICONS.md); the s4 settings engine keeps working via `const PM_ICONS = window.PM_ICONS` (1-line change in js-settings-engine, settings agent owns).
- `window.toast(msg)` — single toast impl (promote existing); PM_TERMINAL_DEMO's local toast aliases it.
- `window.PM_PAGES.go(pageId, subTab?)` — extracted page switching (page-tab handler delegates); emits `page.changed`. Enables Approve-And-Build → `PM_PAGES.go('orchestrator','plan_compile')`.

## Engine modules (pm6-js-demo-engine block, SECOND)
- **bus:** `PM_DEMO.on(topic, fn)` / `.emit(topic, payload)`; exact topic + `'*'`. Topics: `wizard.*`, `run.node`, `run.state`, `run.gate`, `chat.stream`, `chat.card`, `git.*`, `docker.*`, `usage.tick`, `usage.alert`, `page.changed`, `term.feed`.
- **store:** `PM_DEMO.state = { clock:{t,playing,speed}, wizard:{revision, topics:{}, pack, hashes}, run:{id:'pcr-47', phase, lanes[], nodes:{}, gates:{}, freshness, history[]}, chat:{threads, queue[], busy, context:{used:42000,max:128000}}, git:{staged[], unstaged[], worktrees[], prs[], actions[], auth}, docker:{containers{}, publishChain:{stage}, templateRepo}, usage:{quotas{}, ledger[], anomalies[]}, files:{openTabs[], activeTab} }` — the ONLY source of truth for renderers. Plus append-only applied-beat log `PM_DEMO.log[]` ({t, action, args}) — renders the Orchestrator Ledger tab directly.
- **clock:** one `setInterval(250ms)`; `state.clock.t += 250*speed` while playing; Page Visibility API pauses/resumes; reduced-motion leaves clock alone (renderers go instant).
- **director:** tracks = ambient (looping from load) + main story (chapters below) + micro-tracks (spawned by user actions). Beat = `{id, at|after, action, args, hold?}` — actions are string-keyed mutators registered by facades; `hold` pauses the track until released (HITL). `PM_DEMO.director.ensure(marker)` silently fast-forwards main-track beats up to a chapter marker (animations suppressed) — the out-of-order backbone. Markers: `c1_wizard_done, c2_compiled, c3_run_complete, c4_pr_merged, c5_published`.
- **stream:** `PM_DEMO.stream.start(sinkEl, textOrChunks, opts) → {cancel(), finish()}`; auto-chunk 2–6 words, 30–90ms jittered; inline markers `[[card:subagent:NAME]]`, `[[card:operation:ID]]`, `[[files:...]]` split segments and insert cards; cancel → message marked stopped; reduced-motion → finish() immediately.
- **guard:** `PM_DEMO.guard.attempt(actionId, ctx) → {ok:true} | {toast:'…'} | {disabled:true, reason}` with closed reasons: `unsupported, not_configured, not_signed_in, busy, blocked_by_gate, already_done, stale, rate_limited, demo_scope`. ONE delegated document click router handles every `[data-demo-action="…"]` element — zero dead clicks. Page agents: put `data-demo-action` + optional `data-demo-arg` on controls, register handlers via `PM_DEMO.actions.register(actionId, fn)`.
- **dev panel:** Ctrl+Shift+D toggles mini panel: play/pause, speed 1x/2x/4x, jump-to-chapter (uses ensure), reset (full re-init), beat-log tail. No persistence anywhere (reload = pristine).

## Facades (registered by demo-engine; page agents CALL these, never mutate state directly)
`PM_DEMO.wizard`: openTopic(id), answer(topicId, qId, value), acceptTopic(id), integrate(), approveAndBuild() (CAS mock; second call → already_done).
`PM_DEMO.run`: bind(), approveGate(id), declineGate(id), safePointRetry(nodeId), pause(), resume(), focusRun(runId).
`PM_DEMO.chat`: send(threadId, text), stop(threadId), queue(threadId, text), newThread(kind), resolveGateByText(text).
`PM_DEMO.git`: stage(f), commit(msgOrAI), createPR(), rerunWorkflow(id), deviceLogin().
`PM_DEMO.docker`: start(id), stop(id), logs(id), composeUp(), build(), push(), templateCommit(), templatePush().
`PM_DEMO.usage`: tick handled internally; export(), configureWidget(id, opts).
`PM_DEMO.term`: (adapter over PM_TERMINAL_DEMO) feeds sessions from run beats. PM_TERMINAL_DEMO gains ONLY: `appendToSession(sessionId, lineHtml)`, `setProblems(rows)`, `setPorts(rows)`.
`PM_DEMO.files`: open(path) → editor tab with authored content (PM_DEMO_TEXT.files[path]).
`PM_DEMO.dash`: addWidget(kind), catalog().

## Data blocks
- `window.PM_DEMO_DATA` (JSON, same block as engine or its own): project meta, wizard topics+questionnaires, run lanes/nodes/gates (~40 nodes, 4 lanes), git worktrees/runs, docker assets, usage quotas/ledger/anomalies, files tree, timeline beats, ambient tick specs.
- `window.PM_DEMO_TEXT`: template literals — file bodies (pre-highlighted `<span>` HTML), chat reply scripts per intent (plan/debug/explain/status/deploy/fallback), terminal feed lines, build/log streams.
Size budget: engine ~18KB, adapters ~40KB, DATA ~35KB, TEXT ~45KB, timeline ~8KB ≈ 145KB total; hard cap 200KB.

## THE STORY — "Tastebook" recipe-sharing app (SvelteKit + Rust/Axum + Postgres + Docker)
Run #47 live; #44–46 ambient history. Every surface = ambient baseline (stands alone) + story deltas.
- Wizard: intake GitHub preselect + "Imported from Assistant Chat" banner; 3s discovery (main, clean, Axum/SvelteKit/Postgres); 8 topics — 1 Recipe data model (ready), 2 Auth (ready), 3 Editor & media upload (ready), 4 Search (ready), 5 Comments & ratings (ready), 6 Import-from-URL (auditing "pass 2 of 3, 4 findings fixed" → auto-ready ~20s), 7 Notifications (impacted → review-impact → reopened → ledger_syncing → ready), 8 Deployment & backups (blocked; questionnaire "Where should images/backups live?" chips [AWS S3 | Cloudflare R2 | Local volume] + "Something else"); answer → ledger_syncing 1.5s → compiling → auditing "pass 1 of 2" → ready; integrate → Final Plan Pack (2 findings repaired); final review hashes (planning_run rev 12, topic map v9, PlanUnit idx 8f3a91…, testing policy c41d20…); Approve And Build → toast PlanApproved → pcr-47 → PM_PAGES.go('orchestrator','plan_compile') → pending-launch 1.2s → bind.
- Run player (virtual t, seconds): t0–15 compile streams 8 topics → 23 PlanUnits → seam graph; t15–40 lanes data-model/API/frontend/infra progress, promotions lane_to_package → package_to_seam_available, freshness current→refreshing→current; t40 HITL gate node n-13 "publish package: image-processing" → attention_required + CTA cards (Progress + Dashboard) + auto chat thread "Approval: Package Gate" (hold); approve anywhere or type "approve and continue" → resume (decline → blocked + safe-point CTA); t70 account-switch ledger event "switch reason: rate_limit_pressure" (mirrors usage); t85 n-19 fails → recovering → safe-point retry (auto 4s or click) → degraded → complete; t110 seam_complete ×3 → run complete → History +#47 → unlocks PR chapter.
- Chat: ambient thread w/ history + wizard-recommendation card ("Add a new Feature or Enhancement" → wizard intake + imported banner); send → keyword intent router (plan/debug/explain/status/deploy/fallback) → stream; stop cancels; queue max 2 chips; debug intent → operation card created→running→completed + subagent chip (expandable work stream) + files-touched strip (opens editor tabs); gate thread w/ blocked_notice; context 42k/128k +~1.5k per exchange; edit/resend tombstones.
- GitHub: ambient 3 changed files (2 staged), 4 worktrees w/ owner labels + filter; Actions 2 green + 1 failed run (auto-expanded failing step, cargo test log, Rerun → green 8s); AI commit message 1.2s spinner → conventional commit; story: run complete → Create PR on orch/lane-d-infra → 3 checks queued→running→pass (~10s each) → Merge; standalone fallback = run #46 worktree at "checks passing"; device-code modal ABCD-1234 polling → success 6s.
- Docker: 5 containers (postgres/redis/registry-cache running, 1 exited, 1 restarting); start/stop/logs always work (canned streams); Compose up → 4 services green sequentially; publish chain (standalone baseline = ready_to_push): Build (buildkit stream) → digest sha256:9c1f… → Hub repo user/tastebook:v1.2 → template clean→dirty→committed→ready_to_push → Push → pushed.
- Usage: quotas (Claude 5h @78% orange), cooldown 00:41:12 ticking, ledger ~20 rows + live appends (cache cols cached_input/cache_write/cache_read + measured/estimated/unsupported chips), token_spike anomaly card w/ "why blocked" expander + one allowed example; 80% crossing → dashboard CTA.
- Dashboard: 4 default widgets subscribe to run.*/usage.*; 2 CTA cards (HITL @gate beat, usage warning ambient); Add Widget catalog (8 entries, all render).
- Terminal: run start → cargo build stream in ts-sess-alpha; n-19 fail → cargo test w/ 1 failure → problems +2 (deep-link revealSession) → retry → clear; compose → ports 5173/8080; gate → new workgroup pane "orch: lane-b".
- Files: ~18-file tree (Cargo.toml, src/main.rs, src/routes/recipes.rs, migrations/, web/src/routes/+page.svelte, docker-compose.yml, Dockerfile, unraid-template.xml, README.md…); click → tab w/ highlighted content; README/PRD → preview.

## Failure-proofing rules (all agents)
1. Every clickable: real handler, plausible toast, or disabled+reason (closed vocab). 2. Precondition unmet: (a) silently satisfy from ambient baseline; (b) plausible toast ("Run #47 still compiling — PR unlocks when lane-d completes"); (c) disabled + reason chip. 3. Idempotent: repeats → already_done. 4. Chapter jumps: director.ensure() backfills silently. 5. Renderers try/catch — a render failure never kills the clock.
