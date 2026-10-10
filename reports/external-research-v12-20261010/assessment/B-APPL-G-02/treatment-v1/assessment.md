# Independent bounded ER12 B-APPL-G-02 treatment assessment

**Source judgment: FAIL.** One supported material finding remains in the required acceptance checks (M1). The six principal dispositions are otherwise supported. This is an applicability-role judgment, not full-pipeline qualification or an ER11 rescore.

Reviewer: `codex-er12-bappl02-review`. Review started 2026-10-10T05:13:03Z; saved 2026-10-10T05:17:49.072336+00:00. The 25-minute review limit includes saving. One actual reviewer native Goal was activated before scientific review and will be completed only after saving this judgment.

## Material finding M1 — unsupported boot/service-start timing oracle

Exact candidate locator: [verification.md:90](ER12_RUNTIME/runs/B-APPL-G-02/treatment/stages/role/verification.md:90), lines 90–93, especially **“exactly one catch-up start at boot, within the AccuracySec window.”** The timer is only stated to be enabled; the check supplies no bound on timer activation, job dispatch or actual service start.

The pinned [v257 Persistent= passage](https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml#L353-L370) conditions catch-up on timer activation and prior missed calendar activity. [AccuracySec=](https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml#L228-L253) describes timer-expiry coalescing, including a separate timer-slack caveat, not a boot-to-service-start deadline. [Default dependencies](https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml#L73-L91) place calendar activation after sysinit and clock targets. The [implementation](https://github.com/systemd/systemd/blob/v257/src/core/timer.c#L596-L635) submits a JOB_START when the timer dispatches; it does not make that submission an observed ExecStart time. [ExecStartPre=](https://github.com/systemd/systemd/blob/v257/man/systemd.service.xml#L409-L432) can precede the cleanup process. [Manager defaults/slack](https://github.com/systemd/systemd/blob/v257/man/systemd-system.conf.xml#L124-L160) further establish that omitted unit options do not prove an effective one-minute execution SLA.

A source-permitted boot ordering delay of more than one minute can therefore postpone timer activation and still produce correct persistent catch-up. A later service start can also reflect startup work rather than a faulty timer. Even reading “at boot” as broadly “during startup” leaves the invalid use of AccuracySec as a service-start upper bound. This is an inferred counterexample from primary semantics, not an observed laptop failure.

The body correctly names activation, retained state, slack/load and clock uncertainty (lines 15–21, 58–61, 80–82), but does not carry those boundaries into its required pass/fail check. That check can reject correct behavior. This is material under the rubric’s oracle-applicability and supported-scope axes; it is not merely an absent deployment transcript. A valid oracle would keep timer activation/nominal expiry, timer trigger, actual service execution and completion as separate observations, and condition catch-up on prior retained state and target availability. No candidate feedback or repair was performed.

## Assigned axes and complete claim coverage

### Original obligations and negative constraints

Coverage: COMPLETE_STRUCTURAL. All six individually disposed; pinned version/configuration; corrected wording, uncertainty and primary citations present; two concrete checks; 772 whitespace-delimited words <=900. Scope remains the supplied Linux laptop and two alternatives; no architecture redesign.

### Consequential source conditions/version/subject/operation/unit/domain/exceptions

Coverage: COMPLETE_BOUNDED_REVIEW. Core dispositions supported; material acceptance-oracle error M1. Seconds/minutes/microseconds, realtime versus monotonic, service versus timer, persistence and suspend versus power-off checked.

### Useful discovery/alternatives/implementation/history

Coverage: APPLICABILITY_SCOPE_ONLY. Candidate usefully distinguishes the two assigned timer alternatives, RemainAfterExit, clock state, delay and retained timestamp. Reviewer investigated v257 implementation and discovered v257 DeferReactivation; its omission is not a material defect for daily versus a three-minute job. An exhaustive discovery or history essay was not assigned.

### Correct dispositions and wrong corrections/rejections

Coverage: ALL_SIX. 1/4/5 supported with caveats; 2/3/6 correctly refuted. No unsupported rejection of an otherwise valid timer design. M1 concerns a required proposed check.

### Supported-scope preservation

Coverage: COMPLETE_BOUNDED_REVIEW. Preserves supplied laptop/systemd version and missing operational evidence in body; fails to preserve timing/activation boundaries in acceptance check 1 (M1). DISC/APPL/FINAL pipeline propagation and critique disposition are not assigned to this role.

### Proposed versus executed validation and oracle applicability

Coverage: COMPLETE_BOUNDED_REVIEW. Independent primary documentation retrieval and semantic verification observed in saved package. Both service acceptance checks are prospective; no actual deployment observation claimed or shown. First check has material oracle error; second is conceptually useful but omits timer operand and observation details.

### Claim 1

Candidate: SUPPORTED with correction. Review: SUPPORTED_WITH_BOUNDED_CAVEATS. Candidate lines 8-21. Correctly restricts persistence to missed calendar activity and next timer activation, one catch-up rather than replaying each day, with randomized-delay and retained-state caveats. Active-target exclusion in claim 3 applies globally. The acceptance-check problem is separate.

Primary locators: [Persistent=](https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml#L353-L370), [Description / already-active target](https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml#L50-L56), [timer_start / persistent timestamp loading](https://github.com/systemd/systemd/blob/v257/src/core/timer.c#L642-L685), [timer_enter_waiting / calendar base and boot rebasing](https://github.com/systemd/systemd/blob/v257/src/core/timer.c#L393-L431).

### Claim 2

Candidate: REFUTED. Review: SUPPORTED_REFUTATION. Candidate lines 23-35. Correctly rejects identical powered-off catch-up for monotonic OnUnitInactiveSec. WakeSystem changes suspend clock behavior and does not preserve monotonic history across power-off. Its after-boot wording is conditional on an observed deactivation, not an invented automatic initial execution.

Primary locators: [Persistent=](https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml#L353-L370), [Options / OnUnitInactiveSec and monotonic clocks](https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml#L145-L177), [WakeSystem=](https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml#L374-L394), [timer_enter_waiting / TIMER_UNIT_INACTIVE](https://github.com/systemd/systemd/blob/v257/src/core/timer.c#L461-L479).

### Claim 3

Candidate: REFUTED. Review: SUPPORTED_REFUTATION_WITH_MINOR_TERMINOLOGY_LIMITATION. Candidate lines 37-49. Correctly rejects a concurrent additional service instance. A oneshot without RemainAfterExit is formally activating while running and normally never enters active; calling it active informally does not reverse the no-parallel-start decision. Later nonoverlapping runs remain possible.

Primary locators: [Description / already-active target](https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml#L50-L56), [Type=oneshot](https://github.com/systemd/systemd/blob/v257/man/systemd.service.xml#L209-L219), [timer_enter_running / JOB_START submission](https://github.com/systemd/systemd/blob/v257/src/core/timer.c#L596-L635).

### Claim 4

Candidate: SUPPORTED. Review: SUPPORTED_WITH_CAVEATS_PRESERVED_IN_BODY. Candidate lines 51-61. Correct default 1min, host-specific stable placement, timer-elapse scope, 1us best-accuracy option, and slack/load caveats. Effective defaults can be overridden by manager DefaultTimerAccuracySec; candidate explicitly asks for manager defaults. RandomizedDelaySec defaults to 0.

Primary locators: [AccuracySec=](https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml#L228-L253), [DefaultTimerAccuracySec= / TimerSlackNSec=](https://github.com/systemd/systemd/blob/v257/man/systemd-system.conf.xml#L124-L160), [RandomizedDelaySec=; default 0 and interaction with AccuracySec=](https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml#L263-L285).

### Claim 5

Candidate: SUPPORTED. Review: SUPPORTED_WITH_BOUNDED_CAVEATS. Candidate lines 63-72. Correct unit identity and last-deactivation basis. No promise of an automatic post-boot first run is justified; v257 code skips a TIMER_UNIT_INACTIVE value when its base is zero. Normal repeat timing after the target deactivates is interval plus scheduling tolerances.

Primary locators: [Options / OnUnitInactiveSec and monotonic clocks](https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml#L145-L177), [timer_enter_waiting / TIMER_UNIT_INACTIVE](https://github.com/systemd/systemd/blob/v257/src/core/timer.c#L461-L479), [Unit=](https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml#L340-L350).

### Claim 6

Candidate: REFUTED. Review: SUPPORTED_REFUTATION. Candidate lines 74-86. Correctly distinguishes daily midnight syntax/next-occurrence calculation from execution/completion, clock correctness and boot activation. A possible three-minute runtime is enough to disprove a universal two-second completion guarantee; actual runtime is unknown. The midnight ± wording is loose: AccuracySec adds a nonnegative window, not symmetric scheduling jitter. This is minor given claim 4’s explicit after-time wording.

Primary locators: [Calendar Events / daily normalization and analyzer scope](https://github.com/systemd/systemd/blob/v257/man/systemd.time.xml#L260-L315), [AccuracySec=](https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml#L228-L253), [Persistent=](https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml#L353-L370), [Automatic Dependencies / Default Dependencies](https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml#L73-L91), [Type=oneshot](https://github.com/systemd/systemd/blob/v257/man/systemd.service.xml#L209-L219).

## Required output, delivery and limitations

The authored verification is present and is 772 whitespace-delimited words, below the 900-word limit. It includes independent disposition, systemd-257 applicability, primary references, bounded wording and missing-evidence statements for each numbered claim, then two concrete acceptance checks. Both assigned alternatives remain in scope. The full shared assignment, fixture, corpus S1/S2/index, role assignment/input map/freeze, authored verification, source map and both saved source members were read. The APPL deliverable exists; no absent pipeline final is being guessed or graded.

The second check is conceptually useful for overlap and monotonic interval behavior, but its printed `systemctl show -p NextElapseUSecMonotonic` lacks a timer operand and does not specify clock-coordinate comparison. This is a minor command/locator limitation, not a second material finding. A running oneshot without RemainAfterExit is formally activating rather than active; the no-parallel-instance decision remains correct. The “midnight ±” shorthand is loose because AccuracySec adds a nonnegative window, but claim 4 explicitly says after the configured time. These do not independently produce FAIL.

The source map’s “Executed: exactly that” describes documentary verification. Neither acceptance check has a saved execution transcript. Treat both as prospective; no reboot, service log or hardware measurement is inferred. The task did not require executing a nonexistent deployment, so lack of deployment execution is not a semantic failure.

## Useful discoveries and bounded alternatives

- **Default overrides and separate timing layers:** Manager DefaultTimerAccuracySec may override an omitted unit value. Timer expiry, JOB_START submission, ExecStart and cleanup completion are different observables. [DefaultTimerAccuracySec= / TimerSlackNSec=](https://github.com/systemd/systemd/blob/v257/man/systemd-system.conf.xml#L124-L160), [AccuracySec=](https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml#L228-L253), [timer_enter_running / JOB_START submission](https://github.com/systemd/systemd/blob/v257/src/core/timer.c#L596-L635), [ExecStartPre= / ExecStartPost=](https://github.com/systemd/systemd/blob/v257/man/systemd.service.xml#L409-L432)
- **Persistence initialization and invalid future timestamp:** An absent stamp is created rather than loading past trigger history; future file timestamps are rejected. Prior retained state is material to a catch-up test. [timer_start / persistent timestamp loading](https://github.com/systemd/systemd/blob/v257/src/core/timer.c#L642-L685), [timer_enter_waiting / calendar base and boot rebasing](https://github.com/systemd/systemd/blob/v257/src/core/timer.c#L393-L431)
- **OnUnitInactiveSec first-run boundary:** v257 skips unset/zero inactive bases; lack of a deactivation cannot be treated as a guaranteed boot-trigger schedule. [timer_enter_waiting / TIMER_UNIT_INACTIVE](https://github.com/systemd/systemd/blob/v257/src/core/timer.c#L461-L479)
- **v257 DeferReactivation context:** New in v257, default false, calendar-only; relevant when interval is shorter than runtime, not a required alternative for this daily/three-minute scenario. Its existence does not establish parallel active instances. [DeferReactivation=; version-info v257](https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml#L308-L325)

These implementation/history observations sharpen the supplied choices without requiring a new architecture. DeferReactivation’s absence from this candidate is not penalized: the assignment compares daily with 10 minutes after inactivity, and allows only a three-minute cleanup runtime.

## Source evidence and inspected hashes

Independently retrieved six pinned v257 primary files over HTTPS: two assigned manuals and four additional primary files (timer implementation, service manual, manager configuration manual, analyzer manual). No code was executed; no retrieval failures occurred. Full local mirrors, UTC/operation/status and SHA-256 are in [primary/retrievals.json](ER12_RUNTIME/assessment/B-APPL-G-02/treatment-v1/primary/retrievals.json). Navigable per-claim and finding locators are in [source-map.json](ER12_RUNTIME/assessment/B-APPL-G-02/treatment-v1/source-map.json).

All inspected candidate science/native-record/control-input entries match their terminal freeze SHA-256 and byte lengths; all inspected shared-input entries present in the original freeze match as well. Full hashes are in [inspected-hashes.json](ER12_RUNTIME/assessment/B-APPL-G-02/treatment-v1/inspected-hashes.json), also embedded in assessment.json. Hashes establish inspected bytes, not correctness. The terminal freeze’s root observation explicitly records completed T3 task/no pending child runs and disclaims native proof. No shared roster, other outcome/status labels, other arm, dispatch/backups or past campaign answers were inspected.

## Native, effective model, protocol and time — separate from science

The saved candidate receipt-shaped records report one matching frozen objective/Goal ID, active at 05:09:20.332Z and complete at 05:12:15.773Z. The native records’ hashes match the terminal freeze, and science mtimes precede the reported completion. They are evidence of the recorded fields; an independently observed provider tool-call trace and activation-before-input-read order are **UNKNOWN**. Do not promote the separate root T3 completion into native Goal proof.

The fixture display label is GLM 5.3 Flash Max; freeze/requested and root T3 route metadata name AUTHORIZED_PROVIDER_INSTANCE / muse-spark-1.3-contributor, max reasoning. The effective underlying inference model is **UNKNOWN**. The raw completion field `tokens_used=2370902` is preserved without interpreting it as attempt inference or billed usage. Billing, inference savings and account provenance are **UNKNOWN**.

No prohibited assistance or operation appears in inspected science, but complete candidate action-level protocol compliance cannot be certified without its trace. The reviewer used no delegation, candidate contact, repair, accounts, Git or publication and read only its own pm-mail inbox. All assessment/evidence writes remain under the reserved assessment directory.

Candidate preparation: 05:09:08.505Z; absolute deadline: 05:24:08.505Z. Latest frozen science mtime: 05:12:06.549904Z. Root completed/no-pending observation: 05:12:50.060893Z, 221.555893 seconds after preparation and before deadline. Exact actual delivery latency is unknown; this is an observed upper bound. The candidate-recorded native interval is 175.441 seconds, not billing or effective inference telemetry. No paired-arm or speed comparison was made.

## Unknown deployment evidence

Full effective units/drop-ins and manager defaults, persistent state and prior trigger history, service activation/execution/exit status and logs, exact boot/timer activation times, time synchronization and hardware timing remain unavailable. These unknowns bound operational confirmation; they do not reverse the source-supported six dispositions or excuse M1’s unsupported timing oracle.
