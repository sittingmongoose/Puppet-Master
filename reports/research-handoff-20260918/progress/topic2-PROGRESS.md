# Topic 2 progress (Opus 5 agent, 2026-09-17)

I am an Opus 5 agent. Brief: /mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/BRIEF_TOPIC2_20260917.md
Brief sha256: 00c1ad2d657028f6524b79846dc1f38ac1cdfea329051e4a9981176e6c298546
Amendment from the coordinator (overrides the brief's retry rule): two other Claude Code threads share this
account tonight; on a usage or rate limit from the Claude CLI wait 15 minutes ONCE, and if it persists stop the
arm cleanly through the designed gate, record the state and report. Do not loop.

Arms: S (Opus 5 everywhere, effort max, 20 admissions, 160 responses / 3600 s / $20 per job, $250 cap) and
H2 (Muse Spark research at standard limits then Opus 5 review, 12 admissions, $150 cap). Both concurrent.
Working dir: ~/PM-Experiments/topic2-20260917/. NEVER touch continuation4/ or continuation5/.

## Step log
- [2026-09-17] Read the brief, AGENTS.md, continuation4/PROGRESS.md (all 338 lines) and continuation5/PROGRESS.md.
  Machinery inherited: protocol copy + re-freeze, claude_native adapter (distinct-response-id counting, per-response
  Meter boundary), oh-my-pi selectors (muse-code/muse-spark-1.3-contributor at xhigh; max is NOT offered for muse),
  credential rule (keys only as process env read from a 600 key file, never into any artifact), the shared slot lock
  (accounting/slot.lock across check-and-launch), the freeze + quiesce rule (stop the monitor and telemetry writers
  before hashing), and the runtime-identity gate (binary hash read live, fails closed if it changes between gate and
  campaign).
- [2026-09-17] NOTE: continuation5 is LIVE right now (Arm P depth, Opus 5 via the Claude CLI, launched 04:38Z).
  Its campaign.lock and slot.lock are in ITS directory, so my campaigns do not collide on the lock, but we share the
  Claude account. This is exactly what the coordinator's retry amendment is about.
- [2026-09-17 05:05Z] Runtimes verified on this VM: Claude Code CLI 2.1.226 (`claude auth status` loggedIn=true,
  claude.ai, jared@platyr.com), binary ~/.local/share/claude/versions/2.1.226; omp/18.2.2 from
  /mnt/Cursor/PM-Experiments/omp-runtimes/omp-18.1.12-linux-x64/omp-linux-x64. `claude --help` lists
  `--effort <level>` with max, so BOTH Opus 5 stages run at effort **max**, not the xhigh fallback.
- [2026-09-17 05:05Z] Copied the continuation-5 protocol + tooling into topic2-20260917/_template/ (rsync,
  excluding __pycache__/arm-budgets/campaign.lock). Two campaign directories will be instantiated from it
  (arm-s/ and arm-h2/) because protocol/campaign.lock is one exclusive lock per protocol directory, so two
  concurrent campaigns need two protocol copies. The case is prepared once and byte-copied into both.

## Topic selection (brief rule (a)/(b)/(c))
- Corpus statistics computed from Plans/.plan_index/plan_units.jsonl (6,653 units) and acceptance_units.jsonl
  (25,872 units) over the 95 owner .md documents, plus fixture references counted by each document's PlanUnit
  id prefix across every Plans/*fixture*.json file.
- Corpus median acceptance units per PlanUnit = 3.948. Fixtures per PlanUnit: median 0 (52 of 95 documents have
  no fixture reference at all), mean 0.0782 — so the fixture axis is normalized by the mean, the median being
  degenerate. Thinness score = (AU/PU)/median + (fix/PU)/mean; lower is thinner.

### Ranking, both fixture metrics (the metric choice moves the order, so both are recorded)
- Metric 1, fixture REFERENCES to the document's own PlanUnit ids across every Plans/*fixture*.json.
- Metric 2, fixture CASES in the fixture files attributable to the document (own file, or a file naming it).
- On BOTH, one fact is stable: no fixture file anywhere contains an `ADO-00N` reference. The Azure DevOps
  document has no acceptance fixture written against its own units. Its 3 "cases" are provider-profile rows
  enrolled under the SHARED forge schema by a 2026-09-11 validator-bookkeeping fix whose own claim_boundary
  reads "Static fixture enrollment and validator bookkeeping only. No provider API ... proof."

### SELECTED TOPIC: Plans/Azure_DevOps_Integration.md
- Numbers: 5 PlanUnits (ADO-001..005), 15 acceptance units, 3.000 AU/PU = 0.760x the corpus median of 3.948;
  0 fixture references to its own unit ids; 15,967 bytes.
- (a) SATISFIED, most strongly of any candidate: Azure DevOps REST API 7.x, Services vs Server/on-prem,
  Entra ID / PAT / SSH scopes, PR threads/votes/iterations, branch policies and status checks, Azure
  Pipelines, Service Hooks delivery/dedupe, ADO Server version and licensing gating. None of that body of
  knowledge is pre-extracted into the corpus (unlike OpenCode, which has two extraction documents already).
- (b) SATISFIED, and it is the cleanest candidate on this test. ZERO mentions in the Section 15 sources and
  ZERO in the event-authority material (both explicitly excluded by the brief). Its only reports/ mentions are
  one blanket corpus list (jujutsu d1/selection.json, 69 docs) and the fixture-enrollment bookkeeping fix above.
  No campaign was ever about it.
- (c) Thinnest satisfying (a)+(b) on the acceptance-unit axis, the axis both fixture metrics agree on.
- GENRE MATCH: it is the same kind of document as Jujutsu Integration (a small third-party-integration owner
  doc: 5 PU / 15 AU / 16 KB against Jujutsu's 22 PU / 123 AU / 108 KB), which is what "run the way goal 2 ran
  the first" needs for the two topics to be comparable.

### Five runners-up, with their numbers
1. Bitbucket_Integration.md      - 5 PU, 15 AU, 3.000 AU/PU (0.760x median), 0 own-unit fixture refs, 3 shared-schema cases, 15,853 B. (a) YES (Bitbucket Cloud REST 2.0 vs Data Center REST, workspace/project hierarchy, OAuth/app passwords/PAT, Pipelines vs Checks, DC licensing). (b) clean. Lost only the substance tie-break: a narrower external surface than ADO's Services+Server split.
2. GitLab_Integration.md         - 5 PU, 15 AU, 3.000 AU/PU (0.760x), 0 own-unit refs, 4 shared-schema cases, 16,062 B. (a) YES (REST v4 + GraphQL, MR versions/discussions/approval rules, CI/CD, Free/Premium/Ultimate tiers, Dedicated vs self-managed). (b) clean. Thickest of the trio on the fixture axis.
3. Provider_OpenCode.md          - 51 PU, 156 AU, 3.059 AU/PU (0.775x), 0 fixtures of any kind, 182 KB. (a) YES (OpenCode server OpenAPI 3.1 + SSE, /provider/auth, OPENCODE_CONFIG_DIR). (b) only two event-authority CANDIDATE lists, not applied material. Rejected because OpenCode's external body of knowledge is ALREADY deeply extracted into the corpus (OpenCode_Deep_Extraction.md, OpenCode_Coverage_Matrix.md), so a discovery arm would rediscover what Plans already holds - a poor test of whether the process generalizes.
4. Formatters_System.md          - 15 PU, 60 AU, 4.000 AU/PU (1.013x), 0 own fixtures, 49 KB. (a) YES (a roster of ~21 real external binaries: prettier, biome, rustfmt, gofmt, ruff, shfmt, clang-format, ktlint, rubocop, ocamlformat, terraform fmt ...). Rejected on (c): at 1.013x it is exactly AT the corpus median, not thin. Also 8 substantive event-authority mentions.
5. Tools.md                      - 184 PU, 509 AU, 2.766 AU/PU (0.701x) - the thinnest document in the corpus that satisfies (a) (OpenCode tools/permissions docs, the MCP specification, the Firecrawl API, Exa/Tavily/DuckDuckGo, LSP and DAP, VS Code extension parity). EXCLUDED BY (b): it is named in 12 files across the two explicitly excluded bodies - the Section 15 sources (june11-Section15.md, july04-Section15.md, mechanical-census.json) and the event-authority applied material (step-09-root-application.json, step-08-09-binding-authority-approval.json and seven more). Tools.md content IS part of that material.
- (Decision_Policy.md is thinnest overall at 2.000 AU/PU but FAILS (a): pure internal governance and ambiguity
  precedence, with no third-party API, protocol, format or competing product to research. Personas.md, 3.018
  AU/PU, is excluded by (b) on the same two bodies as Tools.md and is only a weak (a).)

## Case frozen - azure-devops-frozen-20260917
- Plans snapshot commit a6162b559b502278458a56e95c5c0891c3e2a505 (= origin/main; Plans/ clean in the shared
  checkout at capture, verified with `git status --porcelain -- Plans/`).
- Product brief: 1,263 words of 1,500. Written from the owner document's stated purpose and the user-facing
  behaviour it promises. Scanned clean of unit ids, `cmd.*` identities, ContractRef/PlanUnit/schema_id markers
  and acceptance criteria. sha256 a69e129dfb6e39ea6577739bd4a912599d70e70064c3e9d566ac33e5f1af74ae
  (brief.md and external/product-brief.md are the same bytes, as in the Jujutsu case).
- Owner passages that enter at reconcile: 200 files (43 .md + 157 .json), the same corpus SHAPE the Jujutsu
  case froze (199 files, 43 .md), so the two topics stay comparable - with every Jujutsu artifact removed
  (Jujutsu_Integration.md and both jujutsu contract/fixture files) and the current Azure/forge artifacts
  present (Azure_DevOps_Integration.md, Forge_Integrations.md, azure_devops_integration_fixtures.json,
  forge_integration_contracts.schema.json + fixtures, forge_backup_tsnet_acceptance + schema).
- Every file carries its git blob id and sha256 in source-provenance.json; zero unresolved blobs.
- Hashes: case tree 0aabcb80a77c9f94704aef9003d444d3f3e00b3f860a7b7297fb2b787c71112b;
  plans/manifest.json 81ea1621b9187c973d51c7be2efd0082ddfe57a9d66db788b904b0712f684d57;
  navigation.md 3b9a6215db90848915cde20a5118bf3f78649d4f0b6549c08b6a6401826f84e3;
  source-provenance.json efadbae42211a0bd0c2ea676dcab3df9fc48b2e4ceb5e691986dd4967e57c637.

## Protocol patched and re-frozen for topic 2
- patch_protocol_for_topic2.py adds three arms and moves GLOBAL_PHASE to 'topic2' (so a continuation-5
  allowance file cannot launch a topic-2 arm, or the reverse):
    s-full       all five stages, claude/opus/effort max, 20 admissions (9 reserved for review),
                 160 responses / 3600 s / $20 per job, $250 arm cap, 21600 s of arm processing.
    h2-research  discovery+implementation+history only, omp muse-code/muse-spark-1.3-contributor at xhigh,
                 12 admissions, standard 40 responses / 2400 s, $50 arm cap.
    h2-review    reconcile+compare only, claude/opus/effort max, 12 admissions, 160/3600/$20, $150 arm cap.
  s-full and h2-research are declared in RESEARCH_ROUTES as well (they run research stages), and
  bounded_campaign's researcher==premium rule is satisfied because prepare_arm writes both from one route.
- NEW FREEZE: protocol/freeze.json sha256 2ba0b1923779a315b05d13784b71ea2e8ba9f0a81aaeb409d0daf137b3f743a2.
- TESTS: 108 tests, 29 failures / 14 errors - the SAME failure names as the untouched continuation-5 protocol
  (the pre-existing suites written against the old before_request/after_request semantics and the fail-closed
  codex transport gate). test_worker_record_races passes.
- A research-only arm terminates cleanly: the reviews loop iterates only admitted review phases, so
  h2-research finds none, admits nothing, and the campaign breaks out normally instead of raising Stop.

## Two campaign directories instantiated, both arms LAUNCHED — 2026-09-17 05:15Z
- arm-s/ and arm-h2/ are independent copies of the patched protocol; the frozen case tree hashes IDENTICAL in
  both (0aabcb80a77c9f94704aef9003d444d3f3e00b3f860a7b7297fb2b787c71112b) and both freeze.json are
  2ba0b1923779a315b05d13784b71ea2e8ba9f0a81aaeb409d0daf137b3f743a2. Each has its own campaign.lock, arm-budgets,
  accounting and allowance heartbeat, so the two campaigns cannot collide on a lock. continuation5 is running in
  its OWN directory with its own lock and is untouched.
- refresh_allowance.py re-stamped for phase 'topic2' in both (a continuation-5 allowance file cannot launch a
  topic-2 arm and the reverse), heartbeats started: arm-s pid 2660767, arm-h2 pid 2660770.
- LAUNCH PROBES (one request each, non-arm spend, recorded in both accounting/control.json with an explicit note
  that it is ONE $0.24 of real spend recorded twice, not $0.48):
    Claude CLI `claude -p --model opus --effort max` -> "PROBE_OK", is_error false, model claude-opus-5,
    CLI-reported $0.235545. The CLI ACCEPTS effort max, so both Opus 5 stages run at max, not the xhigh fallback.
    `omp -p --model muse-code/muse-spark-1.3-contributor --thinking xhigh` -> "PROBE_OK".
- ARM S LAUNCHED 2026-09-17T05:15:37Z. Run arm-s/runs/topic2-s-full-20260917-051531; gate launch-gate-s-full.json.
  Route {'adapter':'claude','model':'opus','effort':'max'} -> claude-opus-5 via Claude Code CLI 2.1.226
  (binary sha 4e9bec1177ce9690e8bd988b710ac24105e70da428dd094c5adcbbe786a55555, read LIVE by the runtime-identity
  gate, so an in-place runtime change between gate and campaign fails closed). Boundary native_boundary_available.
  Limits: 20 admissions (9 reserved for review), 3 workers, 160 responses / 3600 s / --max-budget-usd 20 per job,
  $250 arm cap, 21600 s of arm processing, frozen batching (10000 chars / 3 leads). pids campaign=2662645
  monitor=2662875. VERIFIED LIVE: argv carries `--effort max`, session_init reports model claude-opus-5 and
  cwd = the job workspace.
- ARM H2 RESEARCH HALF LAUNCHED 2026-09-17T05:15:46Z. Run arm-h2/runs/topic2-h2-research-20260917-051541; gate
  launch-gate-h2-research.json. Route {'adapter':'omp','model':'muse-code/muse-spark-1.3-contributor',
  'effort':'xhigh'} -> omp/18.2.2 (binary sha 77c3520ab8ef8318dda02a0715e3b6e69589c427dc23f90a4bb97650caa72f72).
  Boundary native_boundary_bounded_tariff. Limits: 12 admissions, 3 workers, 40 responses / 2400 s per job,
  $50 arm cap, 14400 s of arm processing. pids campaign=2663597 monitor=2663636. raw-omp capture present.
- Inputs to both: the frozen case ONLY. Discovery and study workers receive the product brief; the frozen owner
  passages enter at reconcile and compare. Nothing from any other arm, and no Jujutsu material at all.
- RETRY RULE IN FORCE (coordinator amendment, overrides the brief): on a Claude usage or rate limit, wait 15
  minutes ONCE; if it persists, stop the arm cleanly through the designed gate (accounting/control.json
  launch_allowed=false, wait up to 30 s for the heartbeat, never SIGTERM the campaign), record the state, report.
- [2026-09-17 05:20Z] Bundle worktree created per AGENTS.md: ~/pm-worktrees/topic2-20260917 on the VM's local
  disk, branch research/topic2-20260917 from origin/main (a6162b559b, the same commit the case snapshots),
  sparse set `reports` only, 30 MB. First commit 454ac6a457 pushed: README.md, topic-selection.json,
  case-freeze.json, arm-reports/ (empty until the terminals). NOT landed, and it will not be landed.
- [2026-09-17T05:16:01Z] Arm U stage boundary: no jobs yet; admitted 0; leads 0; counts {}; statuses {}; captured $0; processing 0s
- [2026-09-17T05:17:01Z] Arm U stage boundary: discovery:0done/1live; admitted 1; leads 0; counts {'discovered': 0, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {}; captured $0.0; processing 84.7s
- [2026-09-17T05:16:17Z] Arm U stage boundary: no jobs yet; admitted 0; leads 0; counts {}; statuses {}; captured $0; processing 0s
- [2026-09-17T05:17:17Z] Arm U stage boundary: discovery:0done/1live; admitted 1; leads 0; counts {'discovered': 0, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {}; captured $0.0; processing 91.7s
- [2026-09-17T05:19:17Z] Arm U stage boundary: discovery:1done/0live implementation:0done/2live history:0done/1live; admitted 4; leads 10; counts {'discovered': 10, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'budget_truncated': 1}; captured $0.010307; processing 211.4s
- [2026-09-17T05:21:17Z] Arm U stage boundary: discovery:1done/0live implementation:2done/2live history:0done/1live; admitted 6; leads 14; counts {'discovered': 14, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'budget_truncated': 3}; captured $0.032544; processing 331.7s
- [2026-09-17 05:22Z] Arm H2 discovery (Muse) finished in 170.8 s using 40 of 40 responses and delivered 10
  leads; studies are running. Its adapter status is `budget_truncated`, which is the omp adapter's label
  whenever the durable Meter denies the next response - it is NOT a money stop here. The meter records
  stop_reason `model_request_limit` for the job, and arm_report.classify() resolves that to bound_by
  **responses**, which is what the bound-by table will show. The job reconciled with $0.00 unresolved at
  $0.010307 captured of the $50 cap. Verified by running job_detail/classify against the live records.
- [2026-09-17 05:23Z] Arm S discovery live and productive: 25 of 160 responses, 40 tool calls (30 Bash, 6 Read,
  4 Write), four leads written so far - L001 policy scope specificity, L002 policy evaluations
  artifactId/projectId, L003 PR iterations, L004 service hooks delivery semantics. That is exactly the external
  body of knowledge the topic selection predicted, which is a live check that criterion (a) was read right.
  The claude adapter records cost at job end from the CLI result, so the meter reads $0.00 until the job ends.
- [2026-09-17 05:23Z] finish_arm.py written beside the two campaign directories (not part of the freeze): at an
  arm's terminal it QUIESCES that arm's monitor first (the continuation-4 freeze rule - stop the telemetry
  writer before hashing, or a heartbeat written seconds later invalidates the manifest), then runs arm_report,
  hash_manifest and collect_identity and copies the machine files into the bundle.
- [2026-09-17T05:22:17Z] Arm U stage boundary: discovery:1done/0live implementation:2done/2live history:1done/1live; admitted 7; leads 14; counts {'discovered': 14, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'budget_truncated': 4}; captured $0.047075; processing 391.3s
- [2026-09-17 05:26Z] h2-review verified ready WITHOUT staging anything: policy reconcile+compare / 12 admissions
  / 3600 s / 160 responses / $20 per job / $150 cap; route claude+opus+max; adapters ['claude']; NOT in
  RESEARCH_ROUTES (review-only, as required); and verify_review_route() passes against a simulated config built
  from h2-research's actual run.json. The record keeps `researcher` = muse, which is correct and honest: it says
  which model did the research, and it is never used because no research phase is admitted.
- [2026-09-17T05:23:17Z] Arm U stage boundary: discovery:1done/0live implementation:3done/1live history:1done/2live; admitted 8; leads 14; counts {'discovered': 14, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'budget_truncated': 5}; captured $0.054492; processing 451.2s
- [2026-09-17 05:28Z] tables.py written: every figure in the bundle README is generated from the arm-report JSON
  rather than hand-transcribed. The continuation-4 review found three provenance defects and all three were
  hand-copied numbers, so this closes that class by construction. It emits the per-stage timing table WITH the
  75-minute review target and 3-hour pipeline target evaluated, the job-status + bound-by table, cost, the
  responses/duration/budget-against-ceiling table, and the delivery counts.
- [2026-09-17T05:24:17Z] Arm U stage boundary: discovery:1done/0live implementation:4done/1live history:1done/2live; admitted 9; leads 18; counts {'discovered': 18, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'budget_truncated': 6}; captured $0.068558; processing 511.2s
- [2026-09-17T05:25:17Z] Arm U stage boundary: discovery:1done/0live implementation:4done/1live history:3done/2live; admitted 11; leads 19; counts {'discovered': 19, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'budget_truncated': 8}; captured $0.095159; processing 571.1s
- [2026-09-17T05:26:18Z] Arm U stage boundary: discovery:1done/0live implementation:5done/1live history:3done/2live; admitted 12; leads 23; counts {'discovered': 23, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'budget_truncated': 8, 'completed': 1}; captured $0.107606; processing 631.3s

## 429 signal investigated — FALSE POSITIVE, but it uncovered a real account condition (05:30Z)
- MY WATCHER'S 429 ALERT ON ARM S WAS A FALSE POSITIVE, and an instructive one. All ten "429" hits are in
  claude-stream.jsonl and NONE is an API error: adapter.stderr and worker.stderr are both ZERO bytes, and a
  parse of every stream event finds 0 error events and 0 API error envelopes. The hits are (1) coincidental
  digits inside uuids, timestamps and base64 thinking signatures, (2) line numbers in files the worker read
  ("429: string", "1429: quality?"), and (3) THE RESEARCH TOPIC ITSELF - the worker reading Azure DevOps's own
  rate-limit documentation: HTTP 429, TF400733, Retry-After, X-RateLimit-Resource. A rate-limit detector that
  greps for "429" cannot research rate limits. Detector replaced, see below.
- REAL CONDITION FOUND WHILE CHECKING, and it matters tonight. The Claude CLI emits typed `rate_limit_event`
  events. Arm S's discovery job has two, both:
      status "allowed", rateLimitType "five_hour", resetsAt 1789633800 = 2026-09-17T08:30:00Z,
      overageStatus "rejected", overageDisabledReason "out_of_credits", isUsingOverage false.
  So we are NOT limited right now, but THE ACCOUNT HAS NO OVERAGE TO FALL BACK ON: it is out of credits, so
  when the five-hour window is exhausted requests are BLOCKED rather than billed as overage. With two other
  Claude Code threads on this account plus continuation 5's Opus 5 arm plus my two Opus 5 stages, that window
  is the real constraint tonight, not the $250 and $150 arm caps. The same event type appears once per job in
  continuation 5's runs, so this is the account condition, not something my arms caused.
- CONSEQUENCE FOR THE RETRY RULE: the coordinator's amendment is exactly right and is unchanged - on a usage or
  rate limit, wait 15 minutes ONCE, and if it persists stop the arm cleanly through the designed gate
  (accounting/control.json launch_allowed=false, wait up to 30 s for the heartbeat, NEVER SIGTERM the campaign),
  record the state and report. A five-hour-window block would not clear inside 15 minutes, so in that case the
  correct action is the clean stop, not a wait.
- DETECTOR REPLACED: the watcher now reads typed evidence only - `rate_limit_event` with status != "allowed",
  stream events with is_error, a result event whose subtype is not success, an API error envelope, and any
  non-empty adapter.stderr or worker.stderr. It no longer greps prose for "429".
- [2026-09-17 05:36Z] Arm H2 research reached its 12-admission cap (1 discovery + 5 implementation + 3 history
  done, 3 live); it will stop at admitted_attempt_cap once those finish. 23 leads, $0.1076 of the $50 cap.
  Arm S discovery still live at 624 s. New typed detector reports no rate-limit and no API error on either arm.
- [2026-09-17T05:27:18Z] Arm U stage boundary: discovery:1done/0live implementation:5done/1live history:4done/1live; admitted 12; leads 23; counts {'discovered': 23, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'budget_truncated': 9, 'completed': 1}; captured $0.116391; processing 691.1s
- [2026-09-17T05:28:18Z] Arm U stage boundary: discovery:1done/0live implementation:5done/1live history:5done/0live; admitted 12; leads 27; counts {'discovered': 27, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'budget_truncated': 10, 'completed': 1}; captured $0.131747; processing 751.1s
- [2026-09-17T05:29:18Z] Arm U campaign terminal: discovery:1done/0live implementation:6done/0live history:5done/0live; admitted 12; leads 32; counts {'discovered': 32, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'budget_truncated': 10, 'completed': 2}; captured $0.154507; processing 772.4s; STOP Stop: admitted_attempt_cap

## COORDINATOR RULE CHANGE (supersedes the 15-minute wait) — recorded 05:30Z
New rule, both arms: read the CLI's typed rate_limit_event on every job; if it reports anything other than
`allowed`, or a utilization field at or above 80% of the five-hour window, STOP ADMITTING new jobs cleanly
through the gate, LET LIVE JOBS FINISH, record the state, report. No waiting, no retry. Resume admissions only
after the 08:30Z reset and only if the event shows utilization under 50%. Continue otherwise. Leave headroom:
two other threads share this window.

### Finding 1: THE UTILIZATION HALF OF THE RULE CANNOT BE EVALUATED. No such field exists.
- I surveyed EVERY rate_limit_event on this VM tonight: 40 records across three campaign directories
  (topic2 arm-s, topic2 arm-h2, continuation4, continuation5). All 40 carry exactly SIX fields and no others:
  status, resetsAt, rateLimitType, overageStatus, overageDisabledReason, isUsingOverage.
  There is NO utilization, percent, used, remaining or quota field, in any record.
- Nor does the CLI expose utilization anywhere else: `claude --help` lists no usage/quota/limit command, and
  `claude auth status` returns only loggedIn, authMethod, apiProvider, email, orgId, orgName, subscriptionType.
- So the 80%-stop and 50%-resume thresholds are NOT MEASURABLE from any surface this CLI offers. I implement
  the half that is typed and exact (status != "allowed") and add isUsingOverage==true as a second trigger,
  since the account is out of credits and going into overage means the window is gone. The percentage
  thresholds are reported as unmeasurable rather than approximated by something that is not utilization.
- Two distinct windows are visible in the data, which confirms the field is a real rolling five-hour window:
  resetsAt 1789597800 = 2026-09-16T22:30:00Z (continuation 4/5 jobs) and 1789633800 = 2026-09-17T08:30:00Z
  (tonight's, mine and continuation 5's current). Every record still says status "allowed".

### Finding 2: the allowance gate is the WRONG gate for this rule; the Meter is the right one.
- accounting/control.json launch_allowed=false raises Stop at the TOP of the scheduler loop, which runs
  cancel.set() and KILLS every live worker. Continuation 4 recorded exactly that: union J0001-discovery
  interrupted after 547.1 s. That violates "let live jobs finish".
- The durable Meter is the correct lever and needs NO protocol change (so it cannot invalidate the running
  arms' pinned protocol hashes). cost_watch.Meter.reserve() opens its state file UNDER A LOCK on every call
  and compares committed + allowance against state['cap_usd'] READ FROM THAT FILE. Lowering cap_usd to the
  committed total makes every FUTURE reservation fail with 'captured_plus_live_cap', so
  bounded_campaign.launch() returns False and admits nothing, while live jobs are untouched and run to their
  own terminal receipts. The campaign then ends on Stop('insufficient_priced_usage_headroom') once the last
  live job finishes - a DESIGNED gate, the same terminal continuation 4's deepseek41 attempt ended on.
- drain_arm.py implements exactly that, with a dry-run default. It alters NO captured figure and records the
  original cap, the committed total, the live jobs left running, the reason and the typed evidence under
  'cap_reductions' in the meter state, so no report can silently show a cap that was never authorized.
  Dry-run verified against both live meters at 05:29Z.

### Decision under the new rule, right now: CONTINUE.
Every one of the 40 typed records says status "allowed" and isUsingOverage false. The stop condition is not
met and the unmeasurable half cannot be asserted either way. The rule says continue otherwise, so Arm S keeps
running and Arm H2's review half launches. Headroom is honored by arming an automatic sentinel (below) rather
than by eyeballing: if the window tightens, both arms drain themselves without waiting for me to notice.

## Arm H2 RESEARCH HALF COMPLETE — 2026-09-17T05:28:38Z (stop: admitted_attempt_cap)
- 12 of 12 admissions used; 1 discovery + 6 implementation + 5 history jobs done; 32 leads; captured
  $0.154507 of the $50 cap. Statuses 10 budget_truncated + 2 completed.
- [2026-09-17T05:32:49Z] Arm U stage boundary: no jobs yet; admitted 0; leads 0; counts {}; statuses {}; captured $0; processing 0s
- Per-job (all 12 reconciled, receipts == requests, $0.00 unresolved): bound_by responses 10, finished 2.
  Requests per job 33-41 against the 40 ceiling; longest job 177.5 s of the 2400 s cap; dearest $0.0228.
  2 of 12 jobs delivered leads; 6 of 12 wrote notes.md.
- Frozen outputs: arm-h2/runs/topic2-h2-research-20260917-051541; manifest
  arm-outputs/h2-research-manifest.json sha256 c1e7a066c8f21d3561d64020eeb87f0e737495fd02b380fe4796789d1ff2481c
  (8214 files). FREEZE VERIFIED CLEAN: no file inside the run is newer than the manifest.
- Runtime identity: omp/18.2.2, binary sha 77c3520ab8ef8318..., on all 12 jobs, matching installed_now.
  Protocol fingerprint e59e71488db37fb5.

### DEFECT FOUND AND FIXED in the inherited tooling: collect_identity.py had the wrong path
- It built the record path as `run / job.name / raw / 'run.json'`, missing the `jobs/` level, so
  `is_file()` was always False and EVERY run reported `runtimes: []` - runtime identity silently empty.
- The same line exists in continuation 5's copy (line 61), so this is INHERITED, not introduced here.
  Anyone reading a continuation-5 runtime-identity file should re-check it against this defect.
- Fixed in both of my copies; regenerated: 12 of 12 jobs now carry their native record and the arm reports
  omp/18.2.2 with the binary hash, matching the live installed reading.

## Arm H2 REVIEW HALF LAUNCHED — 2026-09-17T05:32:39Z
- Decision taken under the coordinator's new rule: CONTINUE. Every typed rate_limit_event says status
  "allowed" and isUsingOverage false; the unmeasurable utilization half cannot be asserted either way.
- Run arm-h2/runs/topic2-h2-review-20260917-053231, staged from the research half's frozen run (byte copies,
  every file hashed both sides; 32 leads inherited). Gate launch-gate-h2-review.json.
- Route {'adapter':'claude','model':'opus','effort':'max'} -> VERIFIED LIVE: argv carries `--effort max`,
  session_init reports model claude-opus-5, cwd = the job workspace. Boundary native_boundary_available at
  the 160-response ceiling. Limits 12 admissions, 3 workers, 160 responses / 3600 s / $20 per job, $150 cap.
  The gate records limits_differ_from_goal2 for all three raised ceilings.
- SENTINEL ARMED BEFORE LAUNCH (rate_limit_sentinel.py, detached, logs/rate-limit-sentinel.log): every 20 s it
  reads every job's typed rate_limit_event across both campaign directories and, on status != "allowed" or
  isUsingOverage == true, runs drain_arm.py --apply on every live arm, which stops admissions while live jobs
  finish. It writes the trigger, the typed evidence and the drained arms into this file automatically. It
  never approximates the utilization percentage it cannot measure. First state: watching, all allowed.
- SHELL TRAP RE-ENCOUNTERED (recorded because it cost two dead shells): `pgrep -f` / `pkill -f` with a pattern
  that appears in my own command line kills my own shell - the exact trap continuation 4 recorded at 19:07Z.
  Detached processes are now started with setsid and located by their state files, not by pgrep patterns.
- [2026-09-17T05:33:49Z] Arm U stage boundary: reconcile:0done/3live; admitted 3; leads 32; counts {'discovered': 32, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {}; captured $0.0; processing 69.5s
- [2026-09-17 05:35Z] Both campaigns live. Arm S discovery 84 of 160 responses, 1120 s of its 3600 s cap,
  16 leads, stream active 23 s ago - a deep discovery, not a stall. Arm H2 review: 3 reconcile jobs live at
  12-14 responses each, $0.00 captured so far (the claude adapter prices at job end). Sentinel: 8 typed
  records, all allowed.
- PROJECTION and the real risk. Arm S has 20 admissions with 9 reserved for review, so discovery(1) + up to 10
  studies, then 9 review jobs. At ~19 min per job over 3 workers that is roughly 2.5 h, finishing near
  07:45-08:00Z against the 08:30Z window reset - feasible but tight. The binding risk is the shared five-hour
  window, not the $250 cap or the 21600 s arm clock. That is what the sentinel exists for.
- [2026-09-17 05:37Z] finish_arm.py HARDENED before Arm S's freeze, where the monitor WILL still be alive:
  (1) quiesce now reads /proc directly instead of pgrep, because a pgrep pattern that appears in the calling
  process's own command line matches itself - the trap that killed two of my shells earlier; (2) a new
  assert_frozen() check runs AFTER hashing and reports any file in the run newer than its manifest, which is
  the property that actually matters (arm_monitor writes monitor-state.json INSIDE the run directory, and
  continuation 4's S15 finding was exactly a monitor-state.json written 4 s after a freeze).
  Re-ran the h2-research freeze with the hardened tool: manifest sha256 REPRODUCES byte-identically at
  c1e7a066c8f21d3561d64020eeb87f0e737495fd02b380fe4796789d1ff2481c, and freeze_verified reports no file newer
  than the manifest. quiesced_monitor_pids [] is correct here: that monitor had already exited with its campaign.

## COORDINATOR RULE — 05:40Z: report only at terminals, sentinel stops, or decision points
No interim heartbeats, so the coordinator's own usage stays in reserve. PROGRESS.md logging continues as before
(arm_monitor still appends every stage boundary here, and I keep writing step notes).
- WHAT CHANGED MECHANICALLY: my watcher emitted on EVERY state change - admitted counts, processing seconds -
  and each emission became a message. It is re-armed to emit ONLY on: (1) an arm writing campaign-terminal.json,
  (2) the sentinel leaving its 'watching' state, (3) a typed rate_limit_event with status != allowed or
  isUsingOverage true, or a stream event with is_error - the conditions that need a decision, (4) a campaign
  that disappeared WITHOUT writing a terminal, which is a crash and also needs a decision, (5) all campaigns
  ended. Silence now means "running normally", and the failure cases above still speak.
- [2026-09-17T05:41:02Z] Arm U stage boundary: discovery:1done/0live implementation:0done/2live history:0done/1live; admitted 4; leads 22; counts {'discovered': 22, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 1}; captured $12.046643; processing 1524.4s

## RATE-LIMIT RULE FIRED — 2026-09-17T05:43:19Z
- Trigger: status_not_allowed
- Typed evidence: {"dir": "arm-s", "job": "J0004-implementation", "info": {"status": "allowed_warning", "resetsAt": 1789633800, "rateLimitType": "five_hour", "utilization": 0.9, "isUsingOverage": false}}
- Arms drained (admissions stopped, live jobs left to finish): ["h2-research", "h2-review"]
- [2026-09-17T05:43:49Z] Arm U stage boundary: reconcile:1done/2live; admitted 3; leads 32; counts {'discovered': 32, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'interrupted': 1}; captured $7.178838; processing 640.2s
- [2026-09-17T05:45:02Z] Arm U stage boundary: discovery:1done/0live implementation:1done/1live history:0done/1live; admitted 4; leads 22; counts {'discovered': 22, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 1, 'interrupted': 1}; captured $14.898668; processing 1730.4s

## RATE-LIMIT RULE FIRED — 2026-09-17T05:45:20Z
- Trigger: status_not_allowed
- Typed evidence: {"dir": "arm-s", "job": "J0002-implementation", "info": {"status": "allowed_warning", "resetsAt": 1789633800, "rateLimitType": "five_hour", "utilization": 0.9, "isUsingOverage": false, "surpassedThreshold": 0.9}}
- Arms drained (admissions stopped, live jobs left to finish): ["s-full", "h2-review"]

## SENTINEL FIRED — 2026-09-17T05:43Z. Both live arms drained. TWO DEFECTS FOUND, ONE OF THEM MINE.
- TRIGGER: the Claude CLI began emitting `status: "allowed_warning"` with `utilization: 0.9` and
  `surpassedThreshold: 0.9` on the five-hour window resetting 08:30Z, observed on arm-s J0002-implementation,
  J0003-history and J0004-implementation. Utilization reached 0.91 within two minutes. Both of the
  coordinator's triggers were breached: status is not "allowed", and utilization 0.90 >= 0.80.

### CORRECTION TO MY EARLIER FINDING: the utilization field DOES exist. The schema is CONDITIONAL.
- I reported at 05:30Z that no utilization field exists anywhere. That was true of the 40 records I had then -
  every one of them status "allowed" - but it was WRONG as a general claim, and I am correcting it explicitly.
- The payload shape depends on status. Measured over the topic-2 records:
      status "allowed"          -> overageStatus + overageDisabledReason, NO utilization       (8 records)
      status "allowed_warning"  -> utilization (0..1), usually surpassedThreshold, NO overage  (8 records)
  So utilization is reported, but ONLY once a threshold is passed, which is exactly why it was invisible while
  everything was healthy. The coordinator's rule was fully implementable all along; I could not see the field
  until it mattered. Observed values: 0.9 (x5), 0.91 (x3).
- CONSEQUENCE: the 50%-resume half of the rule is also affected. Below the warning threshold the CLI reports
  NO utilization at all, so "utilization under 50%" cannot be confirmed positively after the reset - the
  absence of the field is consistent with any value below the warning threshold. The honest reading is that a
  record showing status "allowed" with NO utilization field means utilization is below the warning threshold
  (0.9), not that it is below 0.5. I will not claim <50% from an absent field.

### DEFECT IN MY SENTINEL: it drained the wrong arm and reported success.
- live_arms() matched on the campaign DIRECTORY, not the arm. For arm-h2 it returned the first entry in the
  table, h2-research - ALREADY TERMINAL - and h2-review; for arm-s it matched NOTHING. So the arm whose own
  jobs produced the evidence, s-full, was left running and admitting, while the sentinel recorded ok:true.
  A stop that reports success while the offending arm keeps running is worse than no stop.
- I caught it from the notification payload and drained s-full by hand at 05:44Z:
  cap 250 -> 48.046643 (its committed total), live jobs J0002/J0003/J0004 left running.
- FIXED: the arm name now comes from each run's own run.json and liveness from whether that run has written
  campaign-terminal.json - the same durable evidence the campaign itself uses - instead of a path substring.
  Drains are now idempotent (an arm with cap_reductions is left alone). The utilization >= 0.80 trigger was
  added now that the field is known to exist.
- FIX VERIFIED LIVE: the restarted sentinel resolved BOTH live arms correctly - arm-s/s-full and
  arm-h2/h2-review - and reported "already drained; left alone" for each. That is the exact case the buggy
  version got wrong.

### STATE AFTER THE DRAIN (admissions stopped, live jobs finishing, nothing cancelled)
- s-full:     cap 250 -> 48.046643, 3 live jobs (J0002-implementation, J0003-history, J0004-implementation),
              4 jobs total. Authorized cap remains $250; the reduction is an admission drain, not a money event.
- h2-review:  cap 150 -> 36.0, 3 live jobs (J0013/J0014/J0015-reconcile), 3 jobs total. Authorized cap $150.
- h2-research: already terminal before the breach; drained record is a no-op on a finished arm.
- Both campaigns will end on the designed Stop('insufficient_priced_usage_headroom') when their last live job
  finishes. No worker was cancelled.
- RESUME IS GATED and NOT automatic: only after the 08:30Z reset and only if utilization is under 50%, which
  per the correction above cannot be positively confirmed from an absent field. This needs a coordinator
  decision, recorded here rather than assumed.

## COORDINATOR RESUME PLAN — 05:47Z (recorded before building it)
1. The drain STANDS until the window resets at 08:30Z.
2. At 08:35Z, if no record since the reset shows anything other than `allowed`, resume admissions on ARM S ONLY,
   from durable state: completed jobs stay complete, pending leads resume under the same counters.
3. When Arm S reaches its terminal, resume Arm H2's review half the same way.
4. NEVER more than one Opus arm admitting at a time from here on - continuation 5 resumes after the reset too
   and other threads share the window.
5. Stop admissions again at the FIRST `allowed_warning` record, WHATEVER the utilization value, and report.
6. Freeze and report each arm at its terminal, as briefed.
7. If either arm's remaining work cannot complete before 12:00Z, report the partial coverage with pending leads
   VISIBLE rather than pushing past the window.

### State at 05:47Z (neither arm terminal yet; resume matters for coverage)
- s-full:    4 of 20 admissions used, 3 live (J0002-implementation, J0003-history, J0004-implementation).
- h2-review: 3 of 12 admissions used, 3 live (J0013/J0014/J0015-reconcile).
- Both durable stop_reason are still None: the drain denies FUTURE reservations, it does not stop a campaign
  that still has live work. Each will write its terminal when its last live job finishes.

### TWO PROBLEMS THE RESUME HAS TO SOLVE, and how
(a) A DRAINED ARM CANNOT SIMPLY BE RESTARTED. Budget.restart() clears stop_reason only when stop_kind is
    'workflow_error'; ours will be 'limit_or_gate', so check() would immediately re-raise the same Stop.
    Resuming therefore requires restoring BOTH durable facts the drain changed: the meter cap back to the
    AUTHORIZED cap, and the induced stop_reason cleared. Both are recorded as explicit, reasoned entries
    (cap_restorations, prior_stops) so the record shows an operator-induced drain and its exact reversal,
    never a cap or a stop that silently changed. The admission counters are NOT touched: attempts stay, so
    remaining admissions are cap minus already-admitted, and completed jobs and leads are untouched.
(b) THE OLD WARNING RECORDS ARE STILL IN THE STREAM FILES. A restarted sentinel would re-read the 05:43Z
    allowed_warning records and drain again within seconds. The sentinel is therefore EPOCH-SCOPED: it
    considers only records from jobs whose meter started_at is at or after the current resume epoch. Without
    this the resume would be self-defeating.
### AMBIGUITY I AM RESOLVING WITH EVIDENCE, NOT WITH A VACUOUS TRUTH
   "If no record since the reset shows anything other than allowed" is vacuously true when NO post-reset record
   exists - and none will exist if both arms are terminal and nothing is running. Rather than resume on an
   absence, the gate takes ONE cheap probe request at 08:35Z with --output-format stream-json, which makes the
   CLI emit a FRESH rate_limit_event, and resumes only on positive evidence that it says `allowed`. The probe
   is recorded as non-arm spend like the launch probes.
- [2026-09-17T06:13:49Z] Arm U heartbeat: reconcile:1done/2live; admitted 3; leads 32; counts {'discovered': 32, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'interrupted': 1}; captured $7.178838; processing 640.2s
- [2026-09-17T06:15:02Z] Arm U heartbeat: discovery:1done/0live implementation:1done/1live history:0done/1live; admitted 4; leads 22; counts {'discovered': 22, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 1, 'interrupted': 1}; captured $14.898668; processing 1730.4s
- [2026-09-17T06:43:50Z] Arm U heartbeat: reconcile:1done/2live; admitted 3; leads 32; counts {'discovered': 32, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'interrupted': 1}; captured $7.178838; processing 640.2s
- [2026-09-17T06:45:03Z] Arm U heartbeat: discovery:1done/0live implementation:1done/1live history:0done/1live; admitted 4; leads 22; counts {'discovered': 22, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 1, 'interrupted': 1}; captured $14.898668; processing 1730.4s
- [2026-09-17T07:13:50Z] Arm U heartbeat: reconcile:1done/2live; admitted 3; leads 32; counts {'discovered': 32, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'interrupted': 1}; captured $7.178838; processing 640.2s
- [2026-09-17T07:15:03Z] Arm U heartbeat: discovery:1done/0live implementation:1done/1live history:0done/1live; admitted 4; leads 22; counts {'discovered': 22, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 1, 'interrupted': 1}; captured $14.898668; processing 1730.4s
- [2026-09-17T07:43:51Z] Arm U heartbeat: reconcile:1done/2live; admitted 3; leads 32; counts {'discovered': 32, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'interrupted': 1}; captured $7.178838; processing 640.2s
- [2026-09-17T07:45:04Z] Arm U heartbeat: discovery:1done/0live implementation:1done/1live history:0done/1live; admitted 4; leads 22; counts {'discovered': 22, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 1, 'interrupted': 1}; captured $14.898668; processing 1730.4s
- [2026-09-17T08:13:51Z] Arm U heartbeat: reconcile:1done/2live; admitted 3; leads 32; counts {'discovered': 32, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'interrupted': 1}; captured $7.178838; processing 640.2s
- [2026-09-17T08:15:04Z] Arm U heartbeat: discovery:1done/0live implementation:1done/1live history:0done/1live; admitted 4; leads 22; counts {'discovered': 22, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 1, 'interrupted': 1}; captured $14.898668; processing 1730.4s
- [2026-09-17T08:43:51Z] Arm U heartbeat: reconcile:1done/2live; admitted 3; leads 32; counts {'discovered': 32, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'interrupted': 1}; captured $7.178838; processing 640.2s
- [2026-09-17T08:45:05Z] Arm U heartbeat: discovery:1done/0live implementation:1done/1live history:0done/1live; admitted 4; leads 22; counts {'discovered': 22, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 1, 'interrupted': 1}; captured $14.898668; processing 1730.4s
- [2026-09-17T09:13:52Z] Arm U heartbeat: reconcile:1done/2live; admitted 3; leads 32; counts {'discovered': 32, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'interrupted': 1}; captured $7.178838; processing 640.2s
- [2026-09-17T09:15:05Z] Arm U heartbeat: discovery:1done/0live implementation:1done/1live history:0done/1live; admitted 4; leads 22; counts {'discovered': 22, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 1, 'interrupted': 1}; captured $14.898668; processing 1730.4s
- [2026-09-17T09:43:52Z] Arm U heartbeat: reconcile:1done/2live; admitted 3; leads 32; counts {'discovered': 32, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'interrupted': 1}; captured $7.178838; processing 640.2s
- [2026-09-17T09:45:06Z] Arm U heartbeat: discovery:1done/0live implementation:1done/1live history:0done/1live; admitted 4; leads 22; counts {'discovered': 22, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 1, 'interrupted': 1}; captured $14.898668; processing 1730.4s
- [2026-09-17T10:13:53Z] Arm U heartbeat: reconcile:1done/2live; admitted 3; leads 32; counts {'discovered': 32, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'interrupted': 1}; captured $7.178838; processing 640.2s
- [2026-09-17T10:15:07Z] Arm U heartbeat: discovery:1done/0live implementation:1done/1live history:0done/1live; admitted 4; leads 22; counts {'discovered': 22, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 1, 'interrupted': 1}; captured $14.898668; processing 1730.4s
- [2026-09-17T10:43:53Z] Arm U heartbeat: reconcile:1done/2live; admitted 3; leads 32; counts {'discovered': 32, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'interrupted': 1}; captured $7.178838; processing 640.2s
- [2026-09-17T10:45:07Z] Arm U heartbeat: discovery:1done/0live implementation:1done/1live history:0done/1live; admitted 4; leads 22; counts {'discovered': 22, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 1, 'interrupted': 1}; captured $14.898668; processing 1730.4s

## SESSION RESUMED after an Opus session-limit termination — 2026-09-17 11:03Z
I am an Opus 5 agent. I was terminated mid-task while building the resume path. Read PROGRESS.md first, per
the standing instruction. Both campaigns had died; only their monitors survived, heartbeating the SAME frozen
snapshot into this file every 30 minutes from 06:13Z to 10:45Z. Those two monitors are now stopped. The
repeated "Arm U heartbeat" lines between 06:13Z and 10:45Z are that stale loop, not progress; the monitor's
default label is "Arm U", which is cosmetic and not the continuation-4 union arm.

### DURABLE STATE OF THE INTERRUPTION, verified job by job
s-full (run topic2-s-full-20260917-051531): NO campaign-terminal.json, durable stop_reason None, 4 of 20 admitted.
  J0001-discovery       completed    terminal_at yes  105 req / 105 receipts  reconciled  $12.0466  notes.md yes
  J0002-implementation  interrupted  terminal_at yes   26 req /  26 receipts  NOT recon   $0.9730   notes.md yes
  J0003-history         admitted     terminal_at NO    26 req /  26 receipts  NOT recon   $0.8160   notes.md no
  J0004-implementation  admitted     terminal_at NO    36 req /  36 receipts  NOT recon   $1.0630   notes.md no
  23 leads produced by discovery. Captured $14.8987. Three jobs carry a $12 cold allowance each = $36 unresolved.
h2-review (run topic2-h2-review-20260917-053231): NO campaign-terminal.json, stop_reason None, 3 of 12 admitted.
  J0013-reconcile       interrupted  terminal_at yes   53 req /  53 receipts  NOT recon   $2.6263   notes.md no
  J0014-reconcile       admitted     terminal_at NO    42 req /  42 receipts  NOT recon   $2.4690   notes.md yes
  J0015-reconcile       admitted     terminal_at NO    46 req /  46 receipts  NOT recon   $2.0835   notes.md yes
  32 leads inherited. Captured $7.1788. Three jobs x $12 = $36 unresolved.
HONEST READING: J0001-discovery is the only job that finished cleanly. The two "interrupted" jobs got a terminal
receipt from the campaign's own shutdown path; the four still marked "admitted" with terminal_at NO were killed
with the campaign and never received one. All six have real usage and real receipts, so nothing was lost - but
the accounting is open until a recovery pass closes it.

### CLI PROBE AT 11:05:36Z - THE WINDOW SITUATION CHANGED SHAPE
- The CLI ANSWERS: is_error false, "PROBE_OK", CLI-reported $0.235545. It is NOT blocked.
- But the typed record is: {"status": "allowed_warning", "resetsAt": 1789646400, "rateLimitType": "SEVEN_DAY",
  "utilization": 0.82, "isUsingOverage": false, "surpassedThreshold": 0.75}
- CURRENT TIME 2026-09-17T11:05:36Z. CLI-REPORTED RESET 2026-09-17T12:00:00Z.
- TWO THINGS CHANGED. (1) The five-hour window that drove last night's drain HAS reset and is no longer the
  constraint. (2) A different, longer window is now the constraint: a SEVEN-DAY window at 0.82 utilization,
  past its 0.75 warning threshold, resetting at 12:00:00Z. The 12:00Z figure in the coordinator's own deadline
  coincides exactly with this seven-day reset.

### DECISION: DO NOT RESUME. The rule decides it, and the deadline agrees.
- The standing rule is "stop admissions at the first allowed_warning record, WHATEVER the utilization value".
  The only post-reset record in existence is this probe, and it is an allowed_warning. So admissions stay
  stopped. I am not resuming Arm S, and therefore not Arm H2's review half either.
- Item 7 of the plan points the same way independently: Arm S has 16 of 20 admissions left and its jobs run
  about 19 minutes each over three workers, so its remaining work cannot complete in the 54 minutes to 12:00Z.
  The instruction for that case is to report partial coverage with pending leads visible rather than push past
  the window.
- WHAT I AM DOING INSTEAD: an accounting close-out that dispatches NO model request. Each campaign is relaunched
  with its meter cap held at its current observed total, so recover_interrupted() gives the six orphaned jobs
  their terminal receipts and reconciles them, and the very next admission attempt is denied for lack of
  headroom, ending the campaign on the designed Stop('insufficient_priced_usage_headroom'). That converts $72
  of phantom cold-allowance liability into settled accounting and produces the campaign-terminal.json each arm
  needs for an honest freeze. It buys no research and costs no tokens.

## CLOSE-OUT DONE, BOTH OPUS ARMS FROZEN AS INTERRUPTED — 2026-09-17 11:10Z
- closeout_arm.py relaunched each killed campaign WITHOUT --restart. recover_interrupted() at
  bounded_campaign line 527 gave all six orphaned jobs their terminal receipts; line 529 then raised
  Stop('Existing campaign requires explicit restart') before a single admission. ZERO model requests.
- ONE PROTOCOL SAFETY CHECK I HAD NOT ANTICIPATED, and it matters for the drain design:
  cost_watch.Meter.locked() refuses to open a journal whose cap_usd differs from the arm's authorized cap
  ('Arm monetary identity changed'). A DRAINED METER THEREFORE CANNOT BE REOPENED BY THE CAMPAIGN AT ALL -
  the drain is not merely an admission brake, it locks the arm until the authorized cap is restored. My
  resume_arm.py already restored the cap first, so the designed resume path was correct; but any future user
  of drain_arm.py must know the arm is unusable until the cap is put back. Recorded in closeout_arm.py's
  docstring and in each meter's cap_restorations entry.
- RESIDUES LEFT HONEST, NOT TIDIED:
  (1) $36.00 unresolved on EACH Opus arm. Jobs killed mid-flight never got their adapter's final usage.json,
      so completeness cannot be proven and each keeps its $12 cold allowance. Receipts equal requests in every
      one, so no usage is missing - only the proof of settlement. Continuation 4's union arm had this shape.
  (2) NO campaign-terminal.json for either Opus arm. A campaign killed with its process never reaches the
      finally block that writes one, and the close-out stops at line 529, outside that try. finish_arm.py was
      changed to freeze and report such an arm LABELLED as interrupted rather than refuse (which would leave
      real work unreported) or fabricate the file.
- FROZEN: s-full manifest 4b14ae0eb765ef81bbef49ad1c74d814f07fd2b9635834a7c0869a94fbd5162e (5928 files);
  h2-review manifest 076f894af6d52939802fe02863c482c59d797a76f8ef70404216ec83c4891239 (5723 files);
  h2-research manifest c1e7a066c8f21d3561d64020eeb87f0e737495fd02b380fe4796789d1ff2481c (8214 files).
  All three verified with the monitor stopped first and an explicit "no file newer than its manifest" assertion.
- BUNDLE: commit ca427ac0d7 pushed on research/topic2-20260917. NOT landed.
- PARTIAL COVERAGE, stated plainly: only h2-research reached a designed terminal. Arm S used 4 of 20
  admissions (1 completed discovery, 22 leads, 0 reviews) and Arm H2's review half 3 of 12 (3 interrupted
  reconciles). 22 leads pending reconcile and compare on Arm S; 32 on Arm H2. The blind union and per-arm
  recall the brief wants CANNOT be built from this: neither Opus arm produced review output.

## COORDINATOR PLAN — 11:11Z: resume after the 12:00Z seven-day reset
1. Wait on a background timer to 12:05Z, then probe ONCE.
2. If the typed record is status `allowed` with NO warning: restore caps, resume ARM S from durable state
   (its 16 remaining admissions), then Arm H2's review half when Arm S is terminal.
3. One-arm rule RELAXED after the reset to two Opus arms ACCOUNT-WIDE; continuation 5 runs one in parallel
   with mine, so I still run only ONE of my arms at a time.
4. Stop admissions at the first `allowed_warning` on ANY window, and report.
5. The 12:00Z deadline is LIFTED; the arms may run to their designed stops.
6. Freeze and report each at its terminal. Keep the $36 unresolved residues and the missing campaign-terminal
   files labelled exactly as they are - they are facts about what happened, not defects to clean up.

### GAP FOUND IN MY OWN RESUME PATH, fixed before the timer
resume_arm.py relaunched the campaign WITHOUT --restart. That is the CLOSE-OUT path: bounded_campaign line 529
raises Stop('Existing campaign requires explicit restart') for any run with existing admitted attempts, so the
"resume" would have settled the arm again and admitted NOTHING, silently doing the opposite of its name. A real
resume needs --restart, which calls Budget.restart(): both arms have stop_reason None and continuation_restarts
0 against max_restarts 2, so it is available. Fixed and verified against the durable state before use.
- [2026-09-17 11:12Z] ORCHESTRATOR ARMED (pid 2917050, detached, survives a session-limit termination of the
  runner). orchestrate_resume.py sleeps to 12:05:00Z, takes ONE probe with --output-format stream-json, and
  resumes ONLY on status "allowed" with no warning of any kind on ANY window; anything else closes the gate,
  is recorded, and the chain stops. On a clean gate it sets the resume epoch, arms the sentinel, resumes Arm S
  with --restart from durable state (16 remaining admissions), waits for its terminal, then resumes Arm H2's
  review half. Every step is appended here, so a resumed session picks it up from this file.
- PRE-FLIGHT VERIFIED before arming: caps are already back at authorized (s-full $250, h2-review $150 - the
  close-out restored them); s-full has 16 of 20 admissions left, 0 live jobs, stop_reason None, restarts 0 of 2;
  sentinel epoch scoping proven (19 records visible at epoch 0, 0 visible with epoch=now, no breach), so the
  05:43Z warnings cannot re-trigger the drain the moment the resume starts.
- SENTINEL TRIGGER for this run: first `allowed_warning` on ANY window (five-hour or seven-day), whatever the
  utilization - the status test already covers every rateLimitType.
- [2026-09-17 11:14Z] FALSE ALARM investigated and cleared, plus a self-inflicted repeat of a known trap.
  (1) My watcher reported a SENTINEL breach. It was the 05:45:20Z state file - 5.5 hours stale, and its
      evidence was the FIVE-HOUR window that reset at 08:30Z. Not a new breach. Archived to
      arm-history/rate-limit-sentinel-state-20260917T054520Z.json and the live file now reads `not_armed`, so
      neither my watcher nor a resumed session can read a stale breach as current.
  (2) While checking it, my own inspection process matched its own command line - the check
      `'rate_limit_sentinel' in cmdline` was running INSIDE a python3 -c whose source contains that literal,
      so it reported a sentinel running when none was. Same self-match trap as the earlier pkill incidents,
      this time in DETECTION rather than in a kill. The process was gone a second later, which is the tell.
      Any future check must exclude its own pid and parents, as finish_arm.py's quiesce already does.
  VERIFIED NO HARM: caps are intact at authorized ($250 s-full, $150 h2-review), each with exactly 1 reduction
  and 1 restoration and last event `terminal`; nothing was re-drained; resume-epoch is still 0 awaiting the
  gate; orchestrator 2917050 is waiting normally for 12:05:00Z.
- [2026-09-17 11:15Z] Watcher filter corrected: `not_armed` is a QUIET sentinel state alongside `watching`, so
  only a real stop speaks. It had alerted on my own cleanup write. The liveness check also now excludes its own
  pid and builds the match string by concatenation so it cannot match its own command line - the same
  self-match trap, closed in the watcher too. Orchestrator still waiting for 12:05:00Z.
- [2026-09-17T12:04:59Z] ORCHESTRATOR: wake at the seven-day reset + 5 min; probing once
- [2026-09-17T12:05:04Z] ORCHESTRATOR: probe: is_error=False records=[{"status": "allowed", "resetsAt": 1789651800, "rateLimitType": "five_hour", "overageStatus": "rejected", "overageDisabledReason": "out_of_credits", "isUsingOverage": false}]
- [2026-09-17T12:05:04Z] ORCHESTRATOR: GATE OPEN. Resume epoch set; sentinel armed (stops admissions at the first allowed_warning on ANY window).
- [2026-09-17T12:05:07Z] ORCHESTRATOR: s-full: RESUMED with --restart from durable state. mmitted_usd": 14.898668,
  "admitted": 4,
  "admission_cap": 20,
  "remaining_admissions": 16,
  "durable_stop_reason": null,
  "stop_kind": null,
  "live_jobs_now": [],
  "campaign_terminal_present": false,
  "continuation_restarts": 0,
  "max_restarts": 2
}
- [2026-09-17T12:05:07Z] Arm U stage boundary: discovery:1done/0live implementation:2done/0live history:1done/0live; admitted 4; leads 22; counts {'discovered': 22, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 1, 'interrupted': 2, None: 1}; captured $14.898668; processing 1730.4s
- [2026-09-17T12:05:27Z] ORCHESTRATOR: s-full: TERMINAL - no campaign-terminal.json. Freeze and report it.
- [2026-09-17T12:05:30Z] ORCHESTRATOR: h2-review: RESUMED with --restart from durable state. committed_usd": 7.178839,
  "admitted": 3,
  "admission_cap": 12,
  "remaining_admissions": 9,
  "durable_stop_reason": null,
  "stop_kind": null,
  "live_jobs_now": [],
  "campaign_terminal_present": false,
  "continuation_restarts": 0,
  "max_restarts": 2
}
- [2026-09-17T12:05:30Z] Arm U stage boundary: reconcile:3done/0live; admitted 3; leads 32; counts {'discovered': 32, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'interrupted': 3}; captured $7.178838; processing 640.2s
- [2026-09-17T12:05:50Z] ORCHESTRATOR: h2-review: TERMINAL - no campaign-terminal.json. Freeze and report it.
- [2026-09-17T12:05:50Z] ORCHESTRATOR: CHAIN COMPLETE: both arms reached a terminal.

## 12:05Z GATE OPENED, BUT BOTH RESUMES FAILED — `Stop: continuation_elapsed_cap`
### CORRECTION: the orchestrator's own lines above are WRONG and must not be believed.
The orchestrator logged "s-full: TERMINAL - no campaign-terminal.json", the same for h2-review, and then
"CHAIN COMPLETE: both arms reached a terminal". NONE of that is true. Neither arm ran at all. Both campaigns
died about two seconds after launch with Stop: continuation_elapsed_cap. The orchestrator was fooled by a
defect of mine, below. The true state is that the resume did not happen.

### THE GATE ITSELF PASSED
The 12:05:00Z probe was clean: the orchestrator resumed only because the typed record showed status `allowed`
with no warning on any window. The seven-day window did reset at 12:00Z as expected. The block is not a rate
limit; it is the arms' own processing clocks.

### WHY BOTH ARMS ARE BLOCKED
Budget.processing_seconds() is WALL-CLOCK since continuation_started_at, minus only intervals recorded in
`verified_human_waits`. The arms' clocks kept running through the outage even though nothing was executing:
   s-full    started 05:15:37Z, arm_seconds 21600 (6.0 h), processing now 24650 s (6.85 h) -> OVER by 0.85 h
   h2-review started 05:32:39Z, arm_seconds 14400 (4.0 h), processing now 23627 s (6.56 h) -> OVER by 2.56 h
   Neither has any verified_human_waits recorded (0 s excluded).
Budget.restart() calls check() before anything else, and check() raises continuation_elapsed_cap first, so
--restart cannot get past it. The restart budget itself is untouched (0 of 2 used on both arms).
LAST REAL MODEL ACTIVITY was 2026-09-17T05:44:22Z (s-full J0002-implementation). Everything after that is my
close-out bookkeeping, not work. The dead interval from 05:44:22Z to now is 6.37 h.

### DEFECT OF MINE THAT HID THIS, now fixed
resume_arm.py launches the campaign DETACHED and returned success without ever checking that it survived. The
orchestrator then slept 20 s, saw no live process, and concluded "TERMINAL". A campaign that died in two
seconds is indistinguishable from one that finished, under that test. Both are fixed: resume_arm.py now waits
for the campaign to prove it is alive and reports the failure with its stop reason, and the orchestrator
treats "no campaign-terminal.json and no process" as a FAILURE, not a terminal.

### DECISION NEEDED - I am not doing this unilaterally
The protocol has a designed mechanism for exactly this situation: `verified_human_waits`, a list of intervals
with `verified: true` and an `evidence_ref` that processing_seconds() subtracts. Recording the outage as such
an interval would restore the clock to its intended meaning, since the arms did no work during it. But it
RELAXES A GOVERNANCE CAP by editing durable state, and the field's own name says a human verified it, so I am
preparing it and stopping rather than applying it. The exact record I would write is in
pending-verified-wait.json, dry-run only, nothing applied.
- [2026-09-17 12:08Z] Orchestrator fixed too: "no campaign-terminal.json and no process" is now recorded as
  arm_failed_no_terminal and the chain STOPS, instead of being treated as a terminal and advancing. That
  conflation is what produced the false "CHAIN COMPLETE" for two arms that never ran a job.
- [2026-09-17 12:08Z] pending-verified-wait.json written, DRY RUN ONLY, nothing applied. Excluding the outage
  interval 05:44:22Z -> now would put s-full at 0.48 h of its 6.0 h clock (5.52 h headroom) and h2-review at
  0.20 h of its 4.0 h clock (3.80 h headroom); both intervals satisfy the protocol's
  continuation_started_at <= start <= end <= now constraint. Awaiting authorization.
- [2026-09-17T12:11:07Z] Arm U stage boundary: no jobs yet; admitted 0; leads 22; counts {'discovered': 22, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {}; captured $0; processing 1730.4s
- [2026-09-17T12:11:30Z] Arm U stage boundary: no jobs yet; admitted 0; leads 32; counts {'discovered': 32, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {}; captured $0; processing 640.2s

## BOTH PATHS PREPARED — 2026-09-17 12:13Z. NOTHING LAUNCHED, NO CLOCK RUNNING.
The verified wait is NOT applied; that assertion is Jared's and is with him.

### Attempts archived (so a fresh arm of the same name can be activated at all)
prepare_continuation.activate() refuses while protocol/arm-budgets/<arm>.json exists, so each attempt's
budget and meter were MOVED into arm-history/<arm>-attempt-1/ together with its launch gate and an
attempt.json recording the outcome exactly as it stands - per-job status, whether each got a terminal
receipt, requests, receipts, captured cost, the $12-per-job unresolved residues, the absent
campaign-terminal.json with the reason it is absent, and the cap reduction and restoration history.
  arm-s/arm-history/s-full-attempt-1      manifest 77ca10d3310fa6f7664d1295f753058c92e354e8e6e2517b6b07a978aa6e7ea2
  arm-h2/arm-history/h2-review-attempt-1  manifest 86ff2257ea983f55717b8627b68df14edd09dc4ba70721f5349abde12e205e02
The FROZEN RUN DIRECTORIES ARE LEFT IN PLACE, not moved: each already carries its own terminal-freeze
manifest (s-full 4b14ae0e..., h2-review 076f894a...) and moving them would make every recorded path stale.
Nothing is deleted under either path.

### PATH A - fresh arms. READY. One command: `python3 launch_fresh.py`
  arm-s/runs/topic2-s-full-fresh-20260917-121113      s-full,    20 admissions, 160 resp / 3600 s / $20, $250 cap
  arm-h2/runs/topic2-h2-review-fresh-20260917-121121  h2-review, 12 admissions, 160 resp / 3600 s / $20, $150 cap
- Same frozen case (brief a69e129d..., input manifest 81ea1621...); h2-review staged --from the SAME
  h2-research frozen run, 2595 artifacts byte-copied and hashed on both sides.
- STAGED BUT DELIBERATELY NOT ACTIVATED. activate() is what sets continuation_started_at, so no clock is
  running: every readiness check confirms NO live budget and NO live meter for either arm. Staging through
  prepare_arm.py would have started a 6 h and a 4 h clock at 12:11Z and burned them while waiting for the
  decision - which is precisely how both attempt-1 arms were lost.
- launch_fresh.py probes the window once, proceeds only on status `allowed` with no warning on any window,
  arms the sentinel on a fresh epoch, activates and runs Arm S to its designed stop, then Arm H2's review
  half; it treats a missing campaign-terminal.json with no process as a FAILURE and stops the chain.

### PATH B - verified wait. READY. One command: `python3 apply_verified_wait.py --authorized-by "<name>" --apply`
- Inert without --apply and refuses without --authorized-by. It restores each attempt's budget and meter from
  the archive, appends the outage interval to verified_human_waits with verified=true, the evidence_ref and
  the authorizer, then resumes the ORIGINAL arms with --restart and verifies each campaign survived.
- It also rewrites fresh-plan.json to `abandoned`, so the staged fresh runs can never later be mistaken for
  arms that ran.
- Effect if applied: s-full 0.48 h of its 6 h clock (5.52 h headroom), h2-review 0.20 h of its 4 h clock
  (3.80 h headroom). Both intervals satisfy continuation_started_at <= start <= end <= now.

### COST DISCARDED UNDER PATH A (fresh arms) - full detail in discarded-cost.json
  TOTAL: $22.0775 captured, 334 Opus 5 responses, 7 jobs, 4 of them with notes.md.
  s-full    $14.8987, 193 responses, 4 jobs - including THE ONE JOB THAT COMPLETED CLEANLY ANYWHERE ON THE
            OPUS SIDE: J0001-discovery, 105 responses, $12.0466, which produced the 23-lead set.
  h2-review $7.1788, 141 responses, 3 reconcile jobs, none completed, 2 with notes.md.
  The $72 unresolved is a LIABILITY on the archived attempts, not cash spent again; it stays on the attempt
  record under either path.
  NOT DISCARDED under either path: the h2-research half ($0.1545, 12 jobs, 32 leads, designed terminal), the
  frozen case, and both frozen attempt runs with their manifests.
- [2026-09-17T12:18:06Z] Arm U stage boundary: discovery:1done/0live implementation:2done/2live history:1done/1live; admitted 7; leads 23; counts {'discovered': 23, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 1, 'interrupted': 2, None: 1}; captured $14.898668; processing 1736.7s
- [2026-09-17T12:18:07Z] Arm U stage boundary: discovery:1done/0live implementation:2done/2live history:1done/1live; admitted 7; leads 23; counts {'discovered': 23, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 1, 'interrupted': 2, None: 1}; captured $14.898668; processing 1738.1s
- [2026-09-17T12:18:18Z] Arm U stage boundary: reconcile:3done/1live compare:0done/2live; admitted 6; leads 41; counts {'discovered': 39, 'studied': 0, 'reconciled': 2, 'comparison_delivered': 0}; statuses {'interrupted': 3}; captured $7.178838; processing 726.4s
- [2026-09-17T12:18:30Z] Arm U stage boundary: reconcile:3done/1live compare:0done/2live; admitted 6; leads 41; counts {'discovered': 39, 'studied': 0, 'reconciled': 2, 'comparison_delivered': 0}; statuses {'interrupted': 3}; captured $7.178838; processing 739.0s
- [2026-09-17T12:19:18Z] Arm U stage boundary: reconcile:3done/1live compare:1done/1live; admitted 6; leads 41; counts {'discovered': 39, 'studied': 0, 'reconciled': 2, 'comparison_delivered': 0}; statuses {'interrupted': 4}; captured $8.154711; processing 773.6s
- [2026-09-17T12:19:30Z] Arm U stage boundary: reconcile:3done/1live compare:1done/1live; admitted 6; leads 41; counts {'discovered': 39, 'studied': 0, 'reconciled': 2, 'comparison_delivered': 0}; statuses {'interrupted': 4}; captured $8.154711; processing 773.6s

## PATH B APPLIED — Jared verified the wait. 2026-09-17 12:17:54Z
- AUTHORIZER RECORDED: "Jared, verified 2026-09-17 via coordinator relay (answer: option 1)", written into
  each arm's verified_human_waits entry alongside verified=true and the evidence_ref.
- INTERVAL, verified BEFORE certifying it rather than asserted: start pinned to 2026-09-17T05:44:22Z, the
  EXACT completion time of the last model request dispatched inside any arm (s-full J0002-implementation), so
  no arm request lies strictly inside; end 12:17:54Z. I checked every request record in both arms' live and
  archived meters: ZERO model requests inside the interval, and the newest arm stream file is 05:44:27Z.
  The record also states plainly that TWO NON-ARM PROBES (11:05:36Z, 12:05Z) WERE dispatched in that window
  outside any arm run - the interval asserts the ARMS did no work, not that the account was idle. Overclaiming
  that would have been the easy thing to write and it would have been false.
- EFFECT: 6.56 h excluded on each arm. s-full and h2-review both restarted (continuation_restarts 1 of 2), the
  archived budgets and meters moved back into protocol/arm-budgets, caps at authorized $250 and $150,
  admission counters preserved: s-full resumed at 4 admitted of 20, h2-review at 3 of 12.
- fresh-plan.json rewritten to `abandoned`, so the staged fresh runs can never be mistaken for arms that ran.

### MY ERROR, CAUGHT AND CORRECTED WITHIN A MINUTE
apply_verified_wait.py resumed BOTH arms in its loop. The coordinator's rule is ONE OPUS ARM ADMITTING AT A
TIME, Arm S first and Arm H2's review half only when Arm S is terminal. At 12:18Z there were SIX concurrent
Opus jobs: s-full J0005/J0006/J0007 and h2-review J0016/J0017/J0018.
- CORRECTION APPLIED: h2-review DRAINED at 12:18Z (cap 150 -> 79.178838, its committed total). Admissions stop
  immediately, which is what the rule governs, and its three already-admitted jobs were LEFT TO FINISH rather
  than cancelled - cancelling would have wasted three jobs about thirty seconds old and created three more $12
  residues for nothing. Arm S is now the only arm admitting.
- h2-review will end on Stop(insufficient_priced_usage_headroom) when its last live job finishes, and can be
  resumed after Arm S's terminal with its remaining restart (1 of 2 used).
- The script is the defect, not the decision: it was written to restore-and-resume both, before the ordering
  rule existed. Fixed below.
- [2026-09-17 12:20Z] SENTINEL CONFIRMED ARMED and in scope: it was started by the orchestrator when its gate
  opened at 12:05:04Z, is writing `watching` every 20 s, and its epoch (12:05:04Z) PRECEDES the resumed jobs
  (admitted ~12:17:54Z), so their rate_limit_event records are inside its window. It stops admissions on the
  first allowed_warning on ANY window. My earlier check reported "NONE" only because it matched the command
  line exactly rather than by substring; the state file's 10-second age was the real evidence.

## RATE-LIMIT RULE FIRED — 2026-09-17T12:22:31Z
- Trigger: status_not_allowed
- Typed evidence: {"dir": "arm-s", "job": "J0007-implementation", "info": {"status": "allowed_warning", "resetsAt": 1789651800, "rateLimitType": "five_hour", "utilization": 0.9, "isUsingOverage": false, "surpassedThreshold": 0.9}}
- Arms drained (admissions stopped, live jobs left to finish): ["s-full", "h2-review"]

## SENTINEL FIRED on a NEW five-hour window — 12:22Z. AND MY SENTINEL FAILED TO DRAIN ARM S.
- TRIGGER (real, in scope: epoch 12:05:04Z, job admitted 12:17:54Z): status `allowed_warning`,
  rateLimitType **five_hour**, resetsAt 1789651800 = 2026-09-17T13:30:00Z, utilization 0.90,
  surpassedThreshold 0.90, observed on s-full J0007-implementation. A NEW five-hour window opened after the
  12:00Z seven-day reset and reached 0.90 within five minutes of Arm S resuming.
- SECOND DEFECT IN MY SENTINEL, worse than the first. Its idempotency test was `if meter has cap_reductions:
  already drained, leave alone`. "Has EVER been drained" is not "is CURRENTLY drained". Arm S carried one
  reduction from 05:44Z AND three restorations, so it was admitting normally - and the sentinel skipped it and
  recorded ok:true. For the second time tonight a stop reported success while the offending arm kept running.
  h2-review was correctly left alone because it genuinely was drained.
- I drained Arm S BY HAND at 12:23Z: cap 250 -> 86.898668 (its committed total), live jobs J0005/J0006/J0007
  left running to their own terminal receipts.
- FIXED: the test now compares the CURRENT cap against the authorized cap from cost_watch.LIFETIME_CAPS, which
  is the only thing that actually decides whether a reservation can still succeed. Both earlier sentinel
  defects were the same class of mistake - inferring "this arm is handled" from something that was not the
  arm's live admission state (first a path substring, now a historical field).
- STATE: both arms drained, admissions stopped on both, six live jobs finishing. Arm S 7 of 20 admitted,
  $14.90 captured of an authorized $250. h2-review 6 of 12 admitted, $8.16 captured of an authorized $150.
- [2026-09-17T12:24:06Z] Arm U stage boundary: discovery:1done/0live implementation:3done/1live history:1done/1live; admitted 7; leads 23; counts {'discovered': 23, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 1, 'interrupted': 3, None: 1}; captured $18.686088; processing 2059.0s
- [2026-09-17T12:24:07Z] Arm U stage boundary: discovery:1done/0live implementation:3done/1live history:1done/1live; admitted 7; leads 23; counts {'discovered': 23, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 1, 'interrupted': 3, None: 1}; captured $18.686088; processing 2059.0s

## MAJOR CORRECTION — MY DRAIN KILLED EVERY CAMPAIGN. The session limit did not. 2026-09-17 12:26Z
This corrects statements I made earlier in this file and in the bundle, and a statement the coordinator made
to me that I accepted and repeated. The evidence is four campaign logs, all ending in the same traceback.

### WHAT ACTUALLY HAPPENS WHEN drain_arm.py RUNS AGAINST A LIVE CAMPAIGN
cost_watch.Meter.locked() validates `state['cap_usd'] == self.cap` on EVERY access, and a running campaign
holds a Meter constructed with self.cap = POLICY[arm+'_usd'] (250 or 150). Lowering cap_usd in the file
therefore makes the campaign's very next meter access raise ValueError('Arm monetary identity changed'). That
is not a Stop, so it is a workflow_error that propagates out of the finally block at bounded_campaign line 605
(`meter.terminal(job.name, outcome)`) - the campaign dies INSIDE ITS OWN CLEANUP, writes no
campaign-terminal.json, and leaves its live jobs unreconciled.

### THE TIMING, four for four
    s-full    original: drain 05:44:27Z -> campaign dead 05:44:30Z   (3 s)
    h2-review original: drain 05:43:19Z -> campaign dead 05:43:21Z   (2 s)
    s-full    resume  : drain 12:23:28Z -> campaign dead 12:23:32Z   (4 s)
    h2-review resume  : drain 12:19:05Z -> campaign dead 12:19:06Z   (1 s)
Every campaign this topic ever ran died within four seconds of a drain I applied. None died of anything else.

### WHAT I GOT WRONG, precisely
- I read Meter.reserve(), saw it re-reads state['cap_usd'] from the file under a lock, and concluded that
  lowering the cap would gracefully deny FUTURE reservations while live jobs finished. I never checked
  locked()'s identity guard, which makes ANY external cap change fatal to a running campaign.
- I then documented that belief repeatedly and confidently - "live jobs are untouched and keep their
  receipts", "the campaign ends on the designed Stop(insufficient_priced_usage_headroom)" - in drain_arm.py's
  docstring, in PROGRESS.md, in the bundle README and in every report I gave the coordinator. It was never
  true. I never verified the post-condition I was asserting.
- I accepted and repeated the account that "both campaigns died when the Claude CLI hit the limit". The Opus
  session limit did terminate MY SESSION, but the campaigns were already dead, killed by my drain minutes
  earlier. The $36-per-arm residues I reported as an honest consequence of the session limit are in fact the
  consequence of my own tool.
- MY DRAIN WAS STRICTLY WORSE THAN THE MECHANISM I REJECTED. I rejected the allowance gate
  (control.json launch_allowed=false) because it cancels live workers. It does - but it raises a Stop at the
  loop head, so the finally block RUNS: every live job gets a terminal receipt, the meter is reconciled, and
  campaign-terminal.json is written. My drain skipped all of that. I replaced a clean stop that cancels jobs
  with a crash that cancels jobs AND loses their accounting, while reporting it as the gentler option.

### CONSEQUENCES FOR THE RECORD
- The absent campaign-terminal.json on every Opus run, and the $72-per-arm unresolved residues, are caused by
  drain_arm.py. They are not evidence about the Claude session limit or about the provider.
- The "close-out" path I built is unaffected and still correct: it restores the authorized cap first, which is
  precisely why it works.
- The drain DID stop admissions, but only by killing the process, which is not what "stop admitting cleanly
  through the gate, let live jobs finish" asked for. The coordinator's instruction was never actually carried
  out as written; I only believed it was.

### BOTH ARMS CLOSED OUT (12:26Z) - all six orphaned jobs settled, no model requests
  s-full    7 of 20 admitted, captured $18.6861 of an authorized $250, unresolved $72, all jobs terminal.
  h2-review 6 of 12 admitted, captured $8.1547  of an authorized $150, unresolved $72, all jobs terminal.

## ADMISSION HOLD PORTED FROM CONTINUATION 5 AND TESTED — 2026-09-17 12:35Z
The continuation-5 runner hit the identical Meter identity guard at about 06:00Z and built the only mechanism
that denies admissions while live jobs finish. Ported from ~/PM-Experiments/jujutsu-followup-20260911/
continuation5/hold_admissions.py (read only; that directory was not modified).

### WHAT MAKES IT WORK, and what I had missed
`Meter(journal)` with **cap=None** makes Meter.locked() skip its `cap_usd == self.cap` assertion, so the journal
can be edited while a live campaign holds it. The hold then adds ONE explicitly named non-terminal reservation,
`HOLD-admission-sentinel`, with allowance = remaining headroom + $1. Meter.reserve's test is
`committed(state) + allowance > cap_usd` and committed() counts non-terminal jobs, so every further admission is
denied while live jobs run to their own terminal receipts, and the campaign ends on the designed
Stop('insufficient_priced_usage_headroom') once idle. It is a scheduler hold, not spend: no adapter, no
receipts, no request count, never terminal, and `--release` removes it.
MY ERROR IN ONE LINE: I changed `cap_usd`, the one field the guard compares. The hold never touches it.

### PORTED AND REMOVED
- hold_admissions.py added, adapted only so the Meter class is resolved from the protocol that OWNS the journal
  (topic 2 has two campaign directories, each with its own protocol copy; a fixed path could place a hold with
  one directory's cost_watch against the other's journal).
- drain_arm.py REWRITTEN as a thin wrapper over the hold. It no longer contains any path that writes cap_usd.
  The retired implementation is preserved as evidence at arm-history/drain_arm.py.RETIRED.
- rate_limit_sentinel.py now places the hold, and its idempotency test asks whether the HOLD IS PRESENT - the
  live admission state - instead of the two wrong proxies it used before (a path substring, then a historical
  cap_reductions field), each of which let an admitting arm through while reporting success.
- LAST CAP-LOWERING REMOVED FROM STATE: h2-research's journal still carried cap 0.154507 from the 05:43Z sweep
  (applied after that arm had already reached its designed terminal, so it never affected the run). Restored to
  the authorized $50 with the reason recorded; observed_upper_usd unchanged at $0.154507.

### TESTS - both pass, and both include a negative control that reproduces the defect
test_admission_hold.py, 6 tests, Meter-level at the exact crash site:
  hold denies admission while the live job stays live; the campaign's own Meter still reserves, snapshots and
  TERMINALS the live job (bounded_campaign line 605, where all four crashes died); cap never modified; the hold
  records an admission_hold_placed event and registers as zero spend; --release restores admissions; a second
  hold refuses. CONTROL: the retired cap-lowering raises ValueError('Arm monetary identity changed') at line
  605 and is NOT a Stop, so a campaign dies as a workflow_error.
test_hold_stub_campaign.py, END TO END: a REAL bounded_campaign in an isolated sandbox copy of the protocol,
with only the worker stubbed, holding a job live across the hold. Results:
  WITH THE HOLD      crash None | stop 'Stop: insufficient_priced_usage_headroom' | campaign-terminal.json
                     WRITTEN | live job J0001-discovery SETTLED with its record | nothing left live | cap 250
                     unchanged | admitted 1 (no further admission)
  CONTROL (cap drop) crash 'ValueError: Arm monetary identity changed' | NO campaign-terminal.json | the live
                     job left UNSETTLED | cap 12.0
  The control reproduces exactly what happened to all four real campaigns, including the unsettled live job
  and the missing terminal file. All 8 assertions pass.

### HOLD IN FORCE
No Opus admissions on this topic until the coordinator gives a time when Jared's other threads are quiet.
The arms resume from their frozen state: Arm S has 13 of 20 admissions left, h2-review 6 of 12, each with
1 of 2 restarts used. Nothing is running.

## RESUME GATE PROBE — 2026-09-17T14:49:59Z. CLEAN.
- Typed record: {"status": "allowed", "rateLimitType": "five_hour", "resetsAt": 1789669800 =
  2026-09-17T18:30:00Z, "overageStatus": "rejected", "overageDisabledReason": "out_of_credits",
  "isUsingOverage": false}. No warning on any window; no utilization field, which is consistent with being
  below the warning threshold (the schema only reports utilization once a threshold is passed).
- is_error false, "PROBE_OK", CLI-reported $0.235545, recorded as non-arm spend.
- Continuation 5's compare arm is terminal, so this topic is now the only Opus arm admitting account-wide.
- The account is still out of credits (overageStatus rejected), so an exhausted window still blocks rather
  than billing. Unchanged from last night; it is why the hold matters.
- [2026-09-17T14:50:38Z] Arm U stage boundary: discovery:1done/0live implementation:4done/1live history:2done/2live; admitted 10; leads 24; counts {'discovered': 24, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 1, 'interrupted': 5, None: 1}; captured $18.686088; processing 10889.0s
- [2026-09-17T14:50:26Z] ARM S RESUMED on its LAST restart (continuation_restarts now 2 of 2). 13 admissions
  remaining of 20; three new jobs admitted immediately (J0008-history, J0009-implementation, J0010-history),
  all three verified dispatching with `--effort max` in argv. Cap at the authorized $250, committed $18.686,
  no hold in place. Verified wait excluding 6.56 h still in force. Campaign alive and confirmed by
  resume_arm.py's own survival check - the check I added after the silent-failure defect.
- SENTINEL ARMED on a fresh epoch (14:50:15Z) using the PORTED HOLD. At the first allowed_warning on ANY
  window it places HOLD-admission-sentinel, which denies further admissions while live jobs finish and ends
  the campaign on Stop(insufficient_priced_usage_headroom) with its terminal record written. No cap is touched.
- NOTE ON THE RESTART BUDGET: Arm S has now used BOTH restarts. If this campaign is interrupted again it
  cannot be resumed under max_restarts=2 without an explicit authorization to raise that cap.
- [2026-09-17T15:04:38Z] Arm U stage boundary: discovery:1done/0live implementation:5done/1live history:2done/2live; admitted 11; leads 35; counts {'discovered': 35, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 2, 'interrupted': 5, None: 1}; captured $24.271926; processing 11729.6s
- [2026-09-17T15:08:38Z] Arm U stage boundary: discovery:1done/0live implementation:5done/1live history:3done/1live; admitted 11; leads 44; counts {'discovered': 44, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 3, 'interrupted': 5, None: 1}; captured $30.930853; processing 11969.4s
- [2026-09-17T15:10:39Z] Arm U stage boundary: discovery:1done/0live implementation:5done/1live history:4done/0live; admitted 11; leads 51; counts {'discovered': 50, 'studied': 1, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 4, 'interrupted': 5, None: 1}; captured $39.134707; processing 12089.1s
- [2026-09-17T15:21:56Z] Arm S healthy 31 min after resume: 11 of 20 admitted, 10 already terminal, 1 live
  (J0011-implementation, stream written 1 s ago). Captured $39.1347 of $250. No hold; sentinel watching.
  Lead counts discovered 50 / studied 1 - the lead set has grown from 23 to 50 as study jobs ingest new leads.
  11 admissions is the STUDY CAP (new_admissions 20 minus review_attempt_reservation 9), so once the studies
  finish the arm moves to reconcile and compare with its 9 reserved admissions.
- [2026-09-17T15:24:39Z] Arm U stage boundary: discovery:1done/0live implementation:6done/0live history:4done/0live reconcile:0done/3live; admitted 14; leads 65; counts {'discovered': 64, 'studied': 1, 'reconciled': 0, 'comparison_delivered': 0}; statuses {'completed': 5, 'interrupted': 5, None: 1}; captured $46.290369; processing 12930.0s
- [2026-09-17T15:38:40Z] Arm U stage boundary: discovery:1done/0live implementation:6done/0live history:4done/0live reconcile:1done/2live compare:0done/1live; admitted 15; leads 75; counts {'discovered': 74, 'studied': 0, 'reconciled': 1, 'comparison_delivered': 0}; statuses {'completed': 6, 'interrupted': 5, None: 1}; captured $53.045488; processing 13771.1s
- [2026-09-17T15:40:40Z] Arm U stage boundary: discovery:1done/0live implementation:6done/0live history:4done/0live reconcile:2done/1live compare:0done/2live; admitted 16; leads 79; counts {'discovered': 77, 'studied': 0, 'reconciled': 2, 'comparison_delivered': 0}; statuses {'completed': 7, 'interrupted': 5, None: 1}; captured $59.978788; processing 13890.6s
- [2026-09-17T15:42:40Z] Arm U stage boundary: discovery:1done/0live implementation:6done/0live history:4done/0live reconcile:3done/0live compare:0done/3live; admitted 17; leads 86; counts {'discovered': 83, 'studied': 0, 'reconciled': 3, 'comparison_delivered': 0}; statuses {'completed': 8, 'interrupted': 5, None: 1}; captured $66.591193; processing 14011.1s
- [2026-09-17T15:52:39Z] ARM S IS NOW PRODUCING REVIEW OUTPUT - the thing this topic has lacked all along.
  17 of 20 admitted, 14 terminal, 3 live. Three reconcile jobs COMPLETED (J0012, J0013, J0014) and three
  compare jobs are live (J0015, J0016, J0017). Captured $66.5912 of $250. No hold; sentinel watching.
  Lead counts discovered 83 / reconciled 3. Three admissions remain, so the arm should reach
  admitted_attempt_cap shortly.
- [2026-09-17T15:55:41Z] Arm U stage boundary: discovery:1done/0live implementation:6done/0live history:4done/0live reconcile:3done/1live compare:1done/2live; admitted 18; leads 92; counts {'discovered': 89, 'studied': 0, 'reconciled': 2, 'comparison_delivered': 1}; statuses {'completed': 9, 'interrupted': 5, None: 1}; captured $75.144154; processing 14791.6s
- [2026-09-17T15:56:41Z] Arm U stage boundary: discovery:1done/0live implementation:6done/0live history:4done/0live reconcile:3done/2live compare:2done/1live; admitted 19; leads 92; counts {'discovered': 89, 'studied': 0, 'reconciled': 1, 'comparison_delivered': 2}; statuses {'completed': 10, 'interrupted': 5, None: 1}; captured $81.514603; processing 14850.1s
- [2026-09-17T16:00:41Z] Arm U stage boundary: discovery:1done/0live implementation:6done/0live history:4done/0live reconcile:3done/3live compare:3done/0live; admitted 20; leads 97; counts {'discovered': 94, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 3}; statuses {'completed': 11, 'interrupted': 5, None: 1}; captured $91.963379; processing 15090.8s
- [2026-09-17T16:07:42Z] Arm U stage boundary: discovery:1done/0live implementation:6done/0live history:4done/0live reconcile:4done/2live compare:3done/0live; admitted 20; leads 103; counts {'discovered': 99, 'studied': 0, 'reconciled': 1, 'comparison_delivered': 3}; statuses {'completed': 12, 'interrupted': 5, None: 1}; captured $95.303583; processing 15512.0s
- [2026-09-17T16:14:42Z] Arm U stage boundary: discovery:1done/0live implementation:6done/0live history:4done/0live reconcile:5done/1live compare:3done/0live; admitted 20; leads 117; counts {'discovered': 112, 'studied': 0, 'reconciled': 2, 'comparison_delivered': 3}; statuses {'completed': 13, 'interrupted': 5, None: 1}; captured $106.136548; processing 15927.4s

## ARM S COMPLETE — 2026-09-17T16:14:46Z, Stop: admitted_attempt_cap (the designed gate)
- Model claude-opus-5 at effort MAX via Claude Code CLI 2.1.226 (binary sha 4e9bec1177ce9690...), read from
  each job's own record. Protocol fingerprint e59e71488db37fb5.
- ALL 20 ADMISSIONS USED. 14 completed, 5 interrupted, 1 null - the 6 non-completions are the jobs my retired
  drain crashed earlier today, not failures of this run. Every job admitted AFTER the 14:50Z resume completed.
- PER-STAGE WALL TIME AGAINST THE 75-MINUTE REVIEW TARGET - both review stages came in UNDER:
      reconcile  wall 50m 46s  summed 1h 32m 30s  concurrency 1.822  = 0.68x of target
      compare    wall 21m 43s  summed    50m 37s  concurrency 2.331  = 0.29x of target
      discovery  wall 24m 24s  summed    24m 23s  concurrency 0.999
      implementation / history spans include the outage and are not meaningful as wall time.
  ARM TOTAL wall 10h 59m against a 3-hour pipeline target reads 3.66x OVER, but that wall spans the ~6.5 h
  outage and the hold; SUMMED JOB TIME is 4h 26m 47s and average concurrency 0.405. The summed figure is the
  honest one for this arm; the wall figure is an artifact of the interruption.
- BOUND BY: finished 14, interrupted 5, null 1. NOTHING hit a ceiling. Responses per job 25-107 (mean 60.3)
  against the 160 ceiling; longest job 1463.2 s of the 3600 s cap; dearest job $12.05 of the $20 per-job budget.
- COST: captured upper $111.6301 of the $250 cap; runtime-reported $104.9907.
- ACCOUNTING: 14 of 20 reconciled with receipts equal to requests. $72.00 unresolved, all of it the six jobs
  the retired drain crashed; no job from the resumed run carries any unresolved charge.
- DELIVERY (counts only, nothing adjudicated): 16 of 20 jobs wrote notes.md; 13 lead deliveries receipted;
  lead stages discovered 115 / reconciled 3 / comparison_delivered 3. 115 leads pending reconcile, 118 pending
  compare - the arm's 20 admissions cannot cover a lead set that grew from 23 to 115 as studies ingested leads.
- FROZEN: arm-s/runs/topic2-s-full-20260917-051531; manifest arm-outputs/s-full-manifest.json sha256
  4bfc2dcfb6b08f402dbcc48daf94b9172d38d5b5f33970cdb3a2476348e2c3b1 (14089 files). Monitor quiesced first
  (pid 3118998) and the freeze verified: no file in the run is newer than its manifest.
- THE HOLD WAS NEVER NEEDED: no allowed_warning appeared on any window for the whole 84-minute run.

## H2 REVIEW HALF NOT RESUMED — probe at 16:16:00Z shows a warning. HOLDING.
- Typed record: {"status": "allowed_warning", "rateLimitType": "five_hour", "resetsAt": 1789669800 =
  **2026-09-17T18:30:00Z**, "utilization": 0.9, "isUsingOverage": false}.
- The rule is to stop at the first allowed_warning on any window, so Arm H2's review half is NOT resumed and
  nothing was activated. RESET TIME TO REPORT: 2026-09-17T18:30:00Z, the same five-hour window that read
  `allowed` with no utilization field at 14:49Z, 86 minutes earlier.
- ARM S IS THE CAUSE, and that is the expected trade: it used all 20 admissions and $111.63 in 84 minutes,
  which is what drove this window from below-threshold to 0.90. My own two probes are part of that load too.
- NO HOLD WAS PLACED: a hold denies admissions on a LIVE campaign, and nothing is running. Arm S reached its
  designed terminal on its own and is frozen. There is nothing to hold.
- h2-review remains frozen and resumable: 6 of 12 admissions left, 1 of 2 restarts unused, cap at the
  authorized $150, no hold in its journal.
- Sentinel stopped: with no campaign running it has nothing to protect, and leaving it armed would place a
  hold on an idle journal at the next warning.
- [2026-09-17T18:34:59Z] H2REVIEW: wake at 18:35Z; taking one typed probe
- [2026-09-17T18:35:03Z] H2REVIEW: probe: is_error=False records=[{"status": "allowed", "resetsAt": 1789687800, "rateLimitType": "five_hour", "overageStatus": "rejected", "overageDisabledReason": "out_of_credits", "isUsingOverage": false}]
- [2026-09-17T18:35:16Z] H2REVIEW: resume FAILED: PM-Experiments/topic2-20260917/arm-h2/runs/topic2-h2-review-20260917-053231",
  "authorized_cap_usd": 150.0,
  "current_cap_usd": 150.0,
  "committed_usd": 8.154711,
  "admitted": 6,
  "admission_cap": 12,
  "remaining_admissions": 6,
  "durable_stop_reason": null,
  "stop_kind": null,
  "live_jobs_now": [],
  "campaign_terminal_present": false,
  "continuation_restarts": 1,
  "max_restarts": 2
}


## 18:35Z GATE PASSED, BUT H2-REVIEW COULD NOT RESUME — its own clock refused. DECISION NEEDED.
- THE PROBE WAS CLEAN: {"status": "allowed", "rateLimitType": "five_hour", "resetsAt": 1789687800 =
  2026-09-17T23:30:00Z, "overageStatus": "rejected", "overageDisabledReason": "out_of_credits"}. No warning on
  any window. So the window is NOT the blocker this time.
- THE RESUME WAS REFUSED with Stop: continuation_elapsed_cap, caught by resume_arm.py's own survival check -
  the check I added after the silent-failure defect. It reported resume_failed rather than pretending success,
  and the orchestrator correctly did NOT arm the sentinel and did NOT chain onward. The ordering fix worked.
- THE ARITHMETIC: h2-review started 05:32:39Z with a 4.0 h arm_seconds cap and already carries one verified
  wait excluding 6.56 h. Processing now reads 6.51 h, OVER by 2.51 h. Its clock has been running since
  12:18:50Z - the last model request dispatched inside it - while the arm did nothing, because my retired
  drain crashed it at 12:19:06Z and it was then held by instruction until the 18:30Z reset.
- PREPARED AND NOT APPLIED: pending-verified-wait-h2review.json. Excluding 12:18:50Z -> now would put the arm
  at 0.21 h of its 4.0 h clock with 3.79 h of headroom. I verified BEFORE writing it that NO model request was
  dispatched inside this arm in that interval.
- WHY I AM NOT APPLYING IT: this is the SECOND such wait for this arm, a further relaxation of the same
  governance cap, and the field asserts a human verified it. Jared verified the first one; this one is his
  call too, not mine. Nothing has been activated and no clock has been started.
- ALSO WORTH KNOWING: h2-review has 1 of 2 restarts left, so it can be resumed exactly ONCE more. If it is
  interrupted again after that, it cannot be resumed without raising max_restarts.
- STATE: nothing running, no sentinel armed, no hold placed, cap at the authorized $150, journal clean.
  Arm S remains complete and frozen.

## RULE CHANGE — 2026-09-17 18:40Z: gate on the FIVE-HOUR window only
- WHAT CHANGES: the launch probe and the sentinel now trigger on the FIVE-HOUR window's `allowed_warning`
  only. The seven-day window is INFORMATIONAL unless its utilization is at or above 0.75, in which case hold.
- WHY: after the 12:00Z weekly reset the seven-day window reports `allowed_warning` at utilization 0.25. That
  is a PACING signal, not an exhaustion signal - a quarter of a week's budget used is not a reason to stop -
  but under the previous "first allowed_warning on ANY window" rule it is indistinguishable from a real
  five-hour exhaustion, and it cut the continuation-5 sweep. Seven-day reset: 2026-09-24T12:00:00Z.
- The old rule was right when it was written: at 05:43Z and 12:22Z the warnings WERE five-hour exhaustion at
  0.90. It became wrong only once a fresh weekly window started emitting low-utilization pacing warnings.

## DEFECT IN THE HOLD I PORTED, reported by the continuation-5 runner and confirmed here
- THE HOLD TRUNCATES LIVE JOBS. Meter.request_boundary (cost_watch line 226) uses the SAME monetary test as
  admission, `committed(state) > cap_usd`, to decide whether a LIVE job may make its next request. The
  whole-cap hold sets the reservation to headroom + $1, so committed lands ABOVE cap and every live job's next
  request is denied with `captured_plus_live_cap` and its runtime_status is rewritten to `budget_truncated`.
  It stops live jobs cleanly rather than letting them finish - which is most of the point of the hold.
- MY OWN TEST GAVE ME FALSE CONFIDENCE, and I should say so plainly. test_hold_stub_campaign.py asserted "the
  live job settled and kept its record" and passed - but its stub worker only slept and wrote an outcome. It
  NEVER called request_boundary, so the one path that truncates live jobs was never exercised. A test that
  cannot fail on the defect it is supposed to cover is not evidence. Both hold tests are being extended to
  drive request_boundary directly.
- THE ARITHMETIC. committed = observed_upper_usd + reserved + unresolved, where reserved counts each
  non-terminal job's FULL allowance and observed grows as live jobs spend. Admission is denied when
  committed + allowance_new > cap; a live job's next request is denied when committed > cap. So the hold must
  land committed in the window (cap - allowance_new, cap], and must also leave room for the live jobs' future
  spend, or their own growth pushes committed past cap later.

## HOLD SIZING CORRECTED AND TESTED — 18:45Z. The remedy I was given rests on a false premise.
- I implemented the instructed formula first (hold = cap - committed - live jobs' remaining per-job budgets)
  and MY OWN TEST FAILED IT: with one live job it sizes the hold at $218 of a $238 headroom, leaving committed
  at $230 against a $250 cap, so a new $12 admission still fits - THE HOLD STOPS DENYING ADMISSIONS. The tool
  now reports that case explicitly rather than holding silently and uselessly.
- WHY THE PREMISE IS WRONG, measured not argued: a live job's spending does NOT raise `committed`.
  committed = observed_upper_usd + reserved + unresolved, and observed_upper_usd is incremented ONLY AT JOB END
  (cost_watch line 448), while a live job's allowance sits in `reserved` unchanged. Measured directly:
  committed stayed at exactly 12.0000 across five request_boundary calls on a live job. So there is no growth
  to leave room for.
- CORRECT SIZING, and it is simply the FULL HEADROOM: request_boundary denies a live job at committed > cap,
  reserve denies a new job at committed + allowance_new > cap, so committed must land in
  (cap - allowance_new, cap]. A hold of exactly the headroom lands it at cap: live jobs keep running, new
  admissions are denied. Not headroom + $1, which lands ABOVE cap and truncates (the reported defect), and not
  headroom minus live budgets, which lands too low to deny anything.
- SECOND-ORDER CASE RECORDED, NOT ENGINEERED AROUND: committed can still rise if a job settles ABOVE its
  allowance at job end (~$12 allowance against a $20 per-job budget), which could then deny a request to a
  job still live. That happens only at a job end and is recorded in the tool's output.
- TESTS: test_hold_spares_live_jobs.py, 7 tests, all passing, driving Meter.request_boundary directly - the
  path my earlier stub test never touched. It proves the whole-cap hold TRUNCATES a live job (stop_reason
  captured_plus_live_cap, runtime_status rewritten to budget_truncated), that the corrected hold lets a live
  job continue across ten further requests while denying new admissions, that committed does not move during a
  live job, that the cap is never written, and that the tool says so when it cannot do both.
  REGRESSIONS: test_admission_hold.py 6/6 and test_hold_stub_campaign.py 8/8 still pass.
- GATING RULE APPLIED in both the sentinel and the orchestrator's launch probe: five-hour `allowed_warning`
  triggers; seven-day is informational unless utilization >= 0.75.
- STILL WAITING on Jared's decision on the second verified wait before h2-review can resume. Nothing running.
- [2026-09-17T19:50:10Z] AFTER-C5: waiting for continuation 5 run jujutsu-t80-20260917-191342 to reach its terminal (read-only: its own terminal file and process)

## SECOND VERIFIED WAIT APPLIED for h2-review — 2026-09-17 19:49Z
- AUTHORIZER: "Jared, verified 2026-09-17 via coordinator relay (answer: \"verified\")", written into the
  budget's verified_human_waits entry with verified=true and the evidence_ref I prepared.
- INTERVAL: 12:18:50Z (exact completion of the last model request dispatched inside this arm, J0017-compare)
  to 18:35:00Z. I used THE INTERVAL JARED VERIFIED as the end, NOT the moment of application. Clock time after
  18:35Z counts as processing, and if a further wait is ever needed it is a NEW interval requiring its own
  verification - I will not quietly extend an authorization to cover time it did not cover.
- Verified before applying: no model request was dispatched inside this arm in the interval.
- EFFECT: two waits now exclude 12.83 h in total. h2-review reads 1.45 h of its 4.0 h clock with 2.55 h of
  headroom, and is resumable.

## COORDINATION: continuation 5 IS LIVE, so h2-review waits
- Checked read-only: continuation5/runs/jujutsu-t80-20260917-191342 has NO campaign-terminal.json and a live
  bounded_campaign process (pid 3285416). Its five siblings are all terminal, including t80 attempt 1 which
  ended on insufficient_priced_usage_headroom. Nothing of continuation 5's was written, signalled or touched.
- WATCHER ARMED (orchestrate_after_c5.py, detached): waits for their terminal, then takes ONE typed probe
  under the FIVE-HOUR-ONLY rule, then resumes h2-review with --restart and arms the headroom-sized hold ONLY
  after confirming the campaign is live.
- A GUARD I ADDED, because h2-review has ONE restart left: before resuming, the watcher checks h2-review's own
  processing clock, which keeps running while we wait. If under 30 minutes of the 4 h arm clock remain it
  REFUSES to resume and says so, rather than spending the arm's last restart on a run that cannot finish.
  At 19:50Z the headroom is 2.55 h, so there is room; but the clock is now the scarce resource, not the window.
- [2026-09-17T20:59:10Z] AFTER-C5: continuation 5 jujutsu-t80-20260917-191342 is terminal (Stop: admitted_attempt_cap); this topic is now the only Opus arm
- [2026-09-17T20:59:13Z] AFTER-C5: probe (five-hour rule): is_error=False records=[{"status": "allowed_warning", "resetsAt": 1790251200, "rateLimitType": "seven_day", "utilization": 0.37, "isUsingOverage": false}]
- [2026-09-17T20:59:25Z] AFTER-C5: RESUMED with --restart (last restart, 6 admissions).
- [2026-09-17T20:59:25Z] AFTER-C5: sentinel armed AFTER confirming the campaign is live; headroom-sized hold, five-hour rule
- [2026-09-17T20:59:25Z] Arm U stage boundary: reconcile:4done/1live compare:2done/2live; admitted 9; leads 41; counts {'discovered': 39, 'studied': 0, 'reconciled': 2, 'comparison_delivered': 0}; statuses {'interrupted': 6}; captured $8.154711; processing 9423.7s

## H2-REVIEW RESUMED — 2026-09-17T20:59:25Z, on its LAST restart
- Continuation 5's jujutsu-t80-20260917-191342 reached its terminal (Stop: admitted_attempt_cap) at 20:59:10Z;
  this topic became the only Opus arm admitting account-wide, and the watcher moved within 15 seconds.
- THE RULE CHANGE EARNED ITS KEEP IMMEDIATELY. The gate probe returned exactly one record:
  {"status": "allowed_warning", "rateLimitType": "SEVEN_DAY", "utilization": 0.37, "resetsAt": 1790251200 =
  2026-09-24T12:00:00Z}. No five-hour record at all, i.e. that window is healthy. Under the OLD "first
  allowed_warning on ANY window" rule this resume would have been BLOCKED by a 0.37 weekly pacing signal -
  the same way that rule cut the continuation-5 sweep. Under the new rule the seven-day warning is
  informational below 0.75, so the gate correctly passed.
- Resumed with --restart: continuation_restarts is now 2 of 2. THIS IS THE LAST ATTEMPT THIS ARM CAN MAKE.
- The sentinel was armed only AFTER the campaign was confirmed live, with the headroom-sized hold and the
  five-hour rule.

## RATE-LIMIT RULE FIRED — 2026-09-17T21:18:18Z
- Trigger: five_hour_status_not_allowed
- Typed evidence: {"dir": "arm-h2", "job": "J0022-reconcile", "info": {"status": "allowed_warning", "resetsAt": 1789687800, "rateLimitType": "five_hour", "utilization": 0.96, "isUsingOverage": false, "surpassedThreshold": 0.9}}
- Arms drained (admissions stopped, live jobs left to finish): ["s-full", "h2-review"]
- [2026-09-17T21:18:26Z] Arm U stage boundary: reconcile:5done/2live compare:4done/1live; admitted 12; leads 53; counts {'discovered': 50, 'studied': 0, 'reconciled': 1, 'comparison_delivered': 2}; statuses {'interrupted': 6, 'completed': 3}; captured $36.449632; processing 10563.7s
- [2026-09-17T21:23:26Z] Arm U stage boundary: reconcile:6done/1live compare:5done/0live; admitted 12; leads 53; counts {'discovered': 47, 'studied': 0, 'reconciled': 4, 'comparison_delivered': 2}; statuses {'interrupted': 6, 'completed': 3, 'cli_error': 2}; captured $41.542295; processing 10863.6s
- [2026-09-17T21:25:26Z] Arm U campaign terminal: reconcile:7done/0live compare:5done/0live; admitted 12; leads 53; counts {'discovered': 44, 'studied': 0, 'reconciled': 7, 'comparison_delivered': 2}; statuses {'interrupted': 6, 'completed': 3, 'cli_error': 3}; captured $43.715604; processing 10972.1s; STOP Stop: admitted_attempt_cap
- [2026-09-17T21:25:28Z] AFTER-C5: TERMINAL - Stop: admitted_attempt_cap. Freeze and report; this is the last arm.

## ARM H2 REVIEW HALF COMPLETE — 2026-09-17T21:25:13Z, Stop: admitted_attempt_cap (the designed gate)
Answering the coordinator's questions directly.

### DID IT REACH A TERMINAL? YES - it did NOT die with its jobs.
campaign-terminal.json is present: {"at": "2026-09-17T21:25:13.286632+00:00",
"stop_reason": "Stop: admitted_attempt_cap", "partial": true}. Durable stop_kind limit_or_gate. All 12
admissions used. No job was left non-terminal. The Opus session limit killed MY SESSION, not this campaign.

### THE HOLD WORKED IN PRODUCTION, which is the first real test it has had
- At 21:18:18Z the sentinel fired on a GENUINE five-hour exhaustion: {"status": "allowed_warning",
  "rateLimitType": "five_hour", "utilization": 0.96, "surpassedThreshold": 0.9} on job J0022-reconcile, and
  placed the headroom-sized hold on both arms.
- The campaign then ran on and reached its OWN designed terminal seven minutes later. Live jobs were not
  truncated and not cancelled; every one settled. That is exactly the behaviour the corrected sizing was
  supposed to produce, and the behaviour the retired cap-lowering drain destroyed four times today.
- The gate also proved the five-hour-only rule twice in one evening: it let the 20:59Z resume through a 0.37
  seven-day pacing warning, and it still fired on a real 0.96 five-hour exhaustion 19 minutes later.

### THE SIX JOBS OF THE LAST ATTEMPT (admitted from 20:59Z)
  J0019-compare    completed  46 req  $7.0259  reconciled  notes.md yes
  J0020-compare    completed 100 req $13.2072  reconciled  notes.md yes
  J0021-reconcile  completed  93 req  $8.0618  reconciled  notes.md yes
  J0022-reconcile  cli_error  27 req  $1.7471  reconciled  notes.md yes
  J0023-compare    cli_error  36 req  $3.3455  reconciled  notes.md no
  J0024-reconcile  cli_error  35 req  $2.1733  reconciled  notes.md yes
THREE COMPLETED CLEANLY. The three cli_error jobs are the Claude CLI hitting the account limit mid-job, as
anticipated - and notably ALL SIX reconciled with $0.00 unresolved, so nothing about this attempt is
unaccounted. Five of the six wrote notes.md.

### CAPTURED COST, RESTARTS, ARM CLOCK
- Captured upper $43.7156 of the authorized $150 cap; runtime-reported $35.5609.
- RESTARTS: 2 of 2 used. NONE LEFT.
- ARM CLOCK: 5.17 h against a 4.0 h cap - EXHAUSTED, over by 1.17 h.
- So this arm cannot be resumed at all: it has neither a restart nor clock. Raising max_restarts or granting a
  third wait is Jared's decision and I am not asking for one; the arm reached its designed terminal with all
  12 admissions spent, which is a proper ending rather than an interruption.
- Whole-arm statuses across both attempts: completed 3, cli_error 3, interrupted 6 (the six are the jobs my
  retired drain crashed this morning). $72.00 unresolved, all of it those same six.
- Lead stages: discovered 44 / reconciled 7 / comparison_delivered 2.

### FROZEN
arm-h2/runs/topic2-h2-review-20260917-053231; manifest arm-outputs/h2-review-manifest.json sha256
88da881acae5f2835c6f2be6b9fc1b16750e605bf48eb58e41bb1ecb490a9649 (7458 files). Freeze verified: no file in
the run is newer than its manifest. Runtime identity 2.1.226 (Claude Code) from the jobs' own records.

### TWO READING NOTES FOR THE ADJUDICATOR
- The arm report counts 13 "jobs" because the meter journal contains the HOLD-admission-sentinel entry
  alongside the 12 admissions. It is a scheduler hold, NOT a model job: adapter null, 0 requests, $0.00
  observed, never terminal. Twelve jobs ran.
- Wall-clock stage times (reconcile 15h52m, compare 9h05m) span the whole day including the outage, the holds
  and the waits, and are NOT meaningful. Summed job time is reconcile 1h 03m 29s and compare 44m 18s.

## LANDED — 2026-09-18. main is fc41ed035c4c3c44bdb7c333e44c1340f9ff18b3
- Re-read AGENTS.md's landing section immediately before landing, not from this session's memory of it.
- Review verdict confirmed first: REVIEW_EXPERIMENT_BUNDLES_20260918.md section 3 gives research/topic2-20260917
  at 4742fc84fb a verdict of **land** with no fixes requested; the reviewer reproduced all three arms to full
  float precision and confirmed both cross-bundle corrections were already in my README.
- SHARED CHECKOUT PRECONDITIONS, checked and re-checked immediately before the merge: `git diff --cached` EMPTY;
  `git diff HEAD` naming ONLY .omp/lsp.json; main = origin/main = 80dddf28a4; no MERGE_HEAD, no rebase
  directory, no index.lock; no other landing in progress.
- REBASED AS A FRESH -land1 BRANCH; the reviewed branch was never force-pushed. The bundle tree hash is
  IDENTICAL before and after the rebase (cc4f59e9f92482974b514a09df5c1b87921cde00), the diff against the
  reviewed tip is empty, and all 12 commits touch ZERO paths outside reports/research-topic2-20260917/
  (22 files).
- SHARD CHECK IN MY OWN WORKTREE FIRST, as the rule requires so a failure at landing can only be someone
  else's: 99 docs, 2690 shards, ZERO failures. Then ff-only merge, then the same check with
  --config Plans/sharding_config.json in the shared checkout: ZERO failures again.
- THE THREE READ-ONLY REPOSITORY-WIDE CHECKS: all three FAIL, and NOT ONE failure names a file my branch
  touches. Zero paths under reports/ appear in any of them.
      run-gates                13 failing entries over 136 distinct paths
      audit-governance         12 failing entries over 215 distinct paths
      plan-migration validate  28129 failing entries over 107 distinct paths
        (--run-dir Plans/.plan_migration/pds-20260906-017-current-planunit-snapshot)
  This is the known Plans staleness class continuation 4 recorded at its own landing (13/136, 12/216,
  27462/61). Pushed main anyway, exactly as AGENTS.md directs, and reported the counts.
  While waiting I listed live pm- processes with their working directories rather than pgrep-ing for a string
  my own command line contains - the self-match trap that cost two shells earlier in this session.
- PUSHED: 80dddf28a4..fc41ed035c to both remotes (GitHub and the local mirror). 22 bundle files verified present
  on main.
- CLEANUP: worktree ~/pm-worktrees/topic2-20260917 removed; research/topic2-20260917 and
  research/topic2-20260917-land1 deleted locally; research/topic2-20260917 deleted on origin. No topic-2
  worktree or branch remains.
