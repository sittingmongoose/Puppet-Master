# PNC-019 s6v — prepared setup pass and warning histories

The new exact families are `config.validation.passed@1.0.0` and `config.validation.warning@1.0.0`. OSI-109 supplies the spelling and outcome precedence. Jared selected E8-6 B, signed 2026-11-14 at 15:25 EST; the authority is `decision-answers/ANSWERS_E-CARDS-8_20261114.md` in the Event Authority evidence folder. OSI-680 supplies the failed-family pattern. Jared's signed E9-2 A answer (2026-11-14 15:39 EST) extends the failed-family DL-086 retention policy to both new families; its record is decision-answers/ANSWERS_E-CARDS-9_20261114.md, SHA-256 40195a39ddc086579660c2c2a65d07519e2aed32b4613c3ba5ea385a0cdfeed3.

| Family | Contracts | Storage | Oracles | Retention | Membership |
|---|---|---|---|---|---|
| `config.validation.passed` | CV-3200 | SP-3200 | ATS-3200 | `RP-RUNTIME-365D@1.0.0`, E9-2 A / DL-086 | prepared, no admission |
| `config.validation.warning` | CV-3201 | SP-3201 | ATS-3201 | `RP-RUNTIME-365D@1.0.0`, E9-2 A / DL-086 | prepared, no admission |

The closed payloads preserve OSI-109's StartVerificationResult fields and finding enums, adding the exact existing Orchestrator/Storage identity joins. The outcome predicate follows the owner: any Critical finding fails; otherwise a Major finding warns; otherwise it passes. Info/Minor findings do not prevent a passed result. One immutable operation/result slot settles one outcome.

Both contracts define source-first append ordering, the existing DO identity recipe for their exact names, full-value first-receipt recovery/idempotency, replay without effects, SP-337 whole-payload transport, the sole generic SP-278 index/projector/checkpoint consumer, immutable source/receipt/pack backup custody, redaction, supported frozen reads, withdrawal and successor ordering. Both retention cells bind the same failed-family policy: one year after actual canonical Run completion, with the existing caps, successor rollover, holds and source/body/receipt co-retention.

The new oracle uses file-backed original/store/resource/admission snapshots. Retained reads use RetainedDispatcher and never create a receipt, recognize a Store to guess a recipe or accept a caller recipe label. Missing, ambiguous, foreign, unsupported and tampered originals refuse. Source, envelope, Storage and first-receipt copies join independently; thread/node/attempt/requested/effective account examples are distinct. Numeric slots and timestamp profiles use the gated shared helpers; receipt acknowledgement takes the broad EventRecord profile under E5-2.

## Verification and grade boundary

The final worker report, exact commands, source citations, grade grid, Method B rows and mutation table are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/s6v/REPORT.md`, bound by that directory's SHA256SUMS. Both families grade 11 PASS / 0 PARTIAL / 1 ABSENT (membership). The deterministic checker passes 302 exact-refusal mutations and 621 additional checks; Method B proves all 140 rows. Repository-wide gate results and their limitations are recorded in the external report. No blind-review verdict is claimed. Native authentication, actual redb snapshots/CAS, durable recovery/restore, live access races and production execution remain NOT_RUN.

No registry admission, Decision Log entry, cohort/denominator change, Spec Lock, generated governance evidence, auto-decision or frozen-validator mutation is included. Admission belongs to merge 2; retention binds the signed E9-2 A answer. The lane keeps its worktree until the lead confirms integration.
