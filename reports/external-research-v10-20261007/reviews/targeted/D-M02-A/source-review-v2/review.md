# D-M02-A independent frozen-output source review

**X: complete-final scientific correctness UNASSESSED.** The mapped final is null. Both required intermediates were reviewed diagnostically; their core cache rules are supported, with the no-store exception and validation-detail qualifications below. Missing final scope is an artifact limitation, never correctness, lifecycle, method-success, or comparison evidence.

**Y: fully assessed available scientific scope; not fully correct as an unqualified normative recommendation.** Final and required intermediate are byte-identical. Core freshness/stale, key matching, Authorization, and 304 rules are supported. The response no-store rule omits a governing exception, and validator detail / Vary norm-versus-policy wording require qualification. This finding does not prove unsafe execution or an implementation defect.

The assessment concerns the supplied RFC-based bounded recommendation, not a complete cache implementation. It draws no winner, rank, cost, target-metric, or lifecycle conclusion.

## Coverage and declared obligations

Counts are grouped review units, not assertion scores. X: **2/2 intermediates, 6/6 existing-artifact obligations, 13/13 available scientific claim groups assessed**; **0/6 final obligations assessed, all 6 UNASSESSED**. Unknown absent-final claim count is null. Y: **1/1 intermediate plus final, 6/6 obligations, 13/13 available scientific claim groups assessed**, zero available scientific groups unassessed. Identical Y files are not independent confirmations. For each label, three process-history claim groups remain unverified.

X's diagnostic obligation dispositions follow. Every row's complete-final disposition is **UNASSESSED_MISSING_FINAL**.

| ID | Declared obligation | Existing X artifacts | Claim groups |
| --- | --- | --- | --- |
| O1 | Q1 disposition: freshness, validation, stale reuse | addressed with validator detail gap | C01, C02, C03, C04, C05 |
| O2 | Q2 disposition: Vary and cache-key matching | supported | C01, C06 |
| O3 | Private versus shared Authorization rules | supported | C07 |
| O4 | no-cache, no-store, private in applicable contexts | addressed with governing exception omitted | C08, C09, C10 |
| O5 | Preserve cross-question conditions after a 304 | supported with optional conservative policy | C11, C12 |
| O6 | Boundary fixtures and unresolved origin behavior | supported proposals and uncertainty | C13 |

Y's independent obligation dispositions follow.

| ID | Declared obligation | Y disposition | Claim groups |
| --- | --- | --- | --- |
| O1 | Q1 disposition: freshness, validation, stale reuse | addressed with validator detail gap | C01, C02, C03, C04, C05 |
| O2 | Q2 disposition: Vary and cache-key matching | addressed with normative wording qualification | C01, C06 |
| O3 | Private versus shared Authorization rules | supported | C07 |
| O4 | no-cache, no-store, private in applicable contexts | addressed with governing exception omitted | C08, C09, C10 |
| O5 | Preserve cross-question conditions after a 304 | addressed with norm versus policy qualification | C11, C12 |
| O6 | Boundary fixtures and unresolved origin behavior | supported proposals and uncertainty with f01 f03 conditions | C13 |

The brief also requires one complete source-linked bounded recommendation, conditions/uncertainty/proposed checks and a soft 1100-word/eight-finding ceiling. Y has six numbered findings and approximately 1050 whitespace-delimited words, source URLs/hash/path identities, explicit uncertainty and proposed checks; no application plan or implementation result. X's complete delivery, integrated preservation and final limit adherence are UNASSESSED; intermediate counts are 852 and 906 words and do not substitute for a final.

## Consequential qualifications

**F01 — governing no-store exception, X intermediates and Y.** X1:14, X2:5/15 and Y:13/15/17/21 describe the base response no-store prohibition without RFC 9111's explicit exception. A cache implementing `must-understand` **SHOULD ignore response no-store when it understands and implements the status code's caching requirements**; other storage gates still apply. W05 uses GET/200 with `must-understand, no-store, max-age=60` under those conditions. Storage is allowed, never required. A conservative no-storage policy remains permitted, but no policy excluding must-understand is declared, so the universal RFC prohibition is incomplete. This can misclassify a source-permitted case; no unsafe behavior was observed. E11: [RFC 9111 §§5.2.2.3 and 5.2.2.5](https://www.rfc-editor.org/rfc/rfc9111.txt), pinned lines 1246–1256, 1295–1313.

**F02 — validator detail and replacement shorthand, X intermediates and Y.** ETag validation is correct; X1 also preserves If-None-Match precedence. Neither recommendation expressly carries the Last-Modified / If-Modified-Since **SHOULD** for validation of a single stored response outside a subrange. Y does not state combined-validator precedence. W06 is that date-only boundary. This is missing recommendation detail, not a claim that date validation is forbidden. “Full response replaces it” is correct for satisfying the current request; W07 shows why it cannot mean mandatory or unconditional cache replacement, since storage remains optional and subject to section 3, including no-store. The later directive gates mitigate that shorthand. E07–E08: [RFC 9111 §§4.3.1–4.3.3](https://www.rfc-editor.org/rfc/rfc9111.txt), lines 846–864, 887–892, 938–942; [RFC 9110 §§13.1.3 and 13.2.2](https://www.rfc-editor.org/rfc/rfc9110.txt), lines 5956–5961, 6222–6270.

**F03 — Vary rule versus conservative policy, Y.** Y:9 says language must participate whenever the origin selects by language, but origin Vary emission is a SHOULD with permitted elision; Y's own omitted-Vary statement qualifies this wording. Y:15/21(c) also treats a 304 as categorically unable to broaden a language variant and expects the next fr request never to inherit an en-fetched body. W03 instead assumes a suitable en validation, the same strong ETag/principal/body, fresh metadata, complete original selector context, and an origin deliberately replacing `Vary: Accept-Language` with `Vary: Accept-Encoding`. A later fr request with the same encoding can match the **new** Vary. This is an allowed source-derived scenario, not an observed origin. Invalidation/fetch-full when scope is uncertain remains a legitimate optional stronger policy; it must be distinguished from a universal RFC prohibition. W04 separately confirms that *omitting* Vary from a 304 does not remove the stored field. E03/E09/E14/E15: [RFC 9111 §§3.2 and 4.1](https://www.rfc-editor.org/rfc/rfc9111.txt), lines 375–387, 528–557; [RFC 9110 §§12.5.5 and 15.4.5](https://www.rfc-editor.org/rfc/rfc9110.txt), lines 5714–5725, 7456–7462.

The response no-cache shorthand in stale paragraphs is read with each artifact's qualified-form explanation: field exclusion or successful origin revalidation can permit qualified-form reuse. A successful 304 satisfies the validation condition for that use, not a general grant for later unvalidated uses. Strong validators use a first-match branch: no eligible strong match means no stored update, with no weak fallback merely because the strong match failed. These conditions are in the cited source; no explicit contrary branch was claimed.

## X claim-group assessment

Artifact references are fully detailed in REVIEW.json; X1/X2 denote the two frozen intermediates.

| Group | Disposition | Assessment | Evidence |
| --- | --- | --- | --- |
| C01 | Supported | Conjunctive URI/method/selector/directive and freshness/validation gates; ordinary storage prerequisites remain. | E01–E02 |
| C02 | Supported | Freshness precedence, Date fallback, eligible heuristics, conflicts/invalid-as-stale guidance. | E04 |
| C03 | Supported | Age, Date, response delay, residence, unvalidated-hit Age; strict freshness boundary. | E02, E04–E05 |
| C04 | Under-specified | ETag path/precedence correct; Last-Modified SHOULD not carried; full response does not imply unconditional storage. | E07–E08; F02 |
| C05 | Supported with qualifications | Stale permission/prohibition, disconnection, shared-only rules; qualified no-cache and bounded max-stale still govern. | E06, E10, E16 |
| C06 | Supported | Nominated-field matching, safe normalization, absence, wildcard, origin SHOULD/elision and unknown hidden variance. | E03, E14 |
| C07 | Supported + optional safeguard | Private/shared Authorization grants distinguished; account partitioning explicitly beyond RFC key mandate. | E01, E06, E13–E14 |
| C08 | Supported | Request no-cache preference versus mandatory/qualified response no-cache. | E10 |
| C09 | Exception omitted | Base no-store and existing-entry caveat correct; implemented must-understand override absent. | E10–E11, E16; F01 |
| C10 | Supported | Private/qualified private, remaining constraints, no privacy guarantee. | E01, E12 |
| C11 | Supported with selection conditions | 304 eligibility/validators/header exceptions/current metadata; corresponding-200 header duty correctly stated. | E07, E09, E15 |
| C12 | Supported optional policy | Retain selector context; refuse uncertain updated-Vary reuse; inference explicitly labeled. Omission is not deletion. | E03, E09, E14–E15 |
| C13 | Supported as proposals | Broad boundary proposals; logical amendments/rejections valid; origin behavior unresolved, no fixture result established. | E02–E14 |

X2 retains the core conjunction, Authorization distinction, stale limits, directive distinction, current 304 metadata and future Vary gating from X1. It shortens age/validator details and does not explicitly repeat X1's re-key uncertainty. There is no integrated final to assess end-to-end preservation. X's account partitioning and safe selector-context retention are expressly optional/inferred safeguards; hypothetical supported stale extensions are not executed capabilities.

## Y claim-group assessment

Y below means both identical frozen artifacts.

| Group | Disposition | Assessment | Evidence |
| --- | --- | --- | --- |
| C01 | Supported | Private GET scope; conjunction correct; principal isolation labeled application invariant. | E01–E02 |
| C02 | Supported | Strict freshness, precedence/Date fallback, permitted heuristic and restrictive freshness conflicts. | E04 |
| C03 | Supported summary | Age/transit/residence summary; source supplies Date/apparent-age alternatives; no complete algorithm asserted. | E04–E05 |
| C04 | Under-specified | ETag route correct; Last-Modified SHOULD/precedence absent; full-response storage remains constrained. | E07–E08; F02 |
| C05 | Supported with qualifications | Stale/disconnection/prohibition rules and advisory max-stale implementation; numeric bound still applies. | E06, E10, E16 |
| C06 | Qualification needed | Matching rules correct; unconditional language participation overstates origin SHOULD/permitted elision. | E03, E14; F03 |
| C07 | Supported + optional safeguard | Private/shared grants correct; principal clearing/partitioning a stronger app policy; Vary is not sufficient isolation. | E01, E06, E13–E14 |
| C08 | Supported | Advisory request versus mandatory response no-cache; qualified form and no-cache≠no-store rejection. | E10 |
| C09 | Exception omitted | no-store summary/fixture lacks implemented must-understand override; conservative refusal to store remains allowed. | E10–E11, E16; F01 |
| C10 | Supported | Unqualified/qualified private and secrecy distinction. | E01, E12 |
| C11 | Supported with selection conditions | 304 branches/update rules sound; strong mismatch forbids update and weak fallback; no-cache validation is use-specific. | E07, E09, E15 |
| C12 | Norm/policy qualification | Fail closed on uncertain scope is allowed; valid Vary replacement can broaden future matching. | E03, E09, E14–E15; F03 |
| C13 | Supported as proposals | Three discriminating fixture groups and unresolved origin behavior; F01/F03 qualify fixture oracles. | E02–E14 |

Y's principal clearing/partitioning and discarding uncertain variants are supported optional safeguards. Its same-author cross-pass preserves the conjunctive conditions, subject to F01/F03. The RFC gives header updates and eligibility rules rather than a bespoke re-key or body-deletion procedure; uncertainty about cleanup mechanics does not authorize later reuse despite an applicable no-store prohibition.

## Source integrity and exact reviewed hashes

Both frozen RFC hashes match the manifest. Fresh public downloads of the official [RFC 9111 text](https://www.rfc-editor.org/rfc/rfc9111.txt) (84,477 bytes, captured 20:04:46.137506 UTC) and [RFC 9110 text](https://www.rfc-editor.org/rfc/rfc9110.txt) (502,941 bytes, 20:04:46.116434 UTC) also match. Versions are June 2022; capture date is 2026-10-07. Downloads stayed in memory, bounded at 2 MB / 25 seconds per URL. Browser-rendered lines were not used for citations. Agreement verifies byte identity now, not the historical act of candidate capture/reading.

| Reviewed artifact (exact path) | Bytes | SHA-256 |
| --- | --- | --- |
| [brief](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M02-A/inputs/brief.md) | 1803 | `7e098f7e27253c87adca194aaa0a7cd36012b8bac69bc220518cd078bb0dec19` |
| [manifest](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M02-A/inputs/sources.json) | 1074 | `2ac208038416cc008b1fdc2fab08c74b57bc4b8715b3b16276038b5861b5e9c7` |
| [httpcache](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M02-A/inputs/sources/httpcache.txt) | 84477 | `aeb52adb3279d5f23dae34f68af11bd5cef0a0aff7ffcd014c9ca93c5302cf3e` |
| [httpsem](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M02-A/inputs/sources/httpsem.txt) | 502941 | `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a` |
| [X1](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted/D-M02-A/source-review-v2/frozen/X/intermediate-1.md) | 6845 | `5aaebc18d27f2f13bd22d6c99bf040d2c4c635b0917c9191b828268514c165e8` |
| [X2](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted/D-M02-A/source-review-v2/frozen/X/intermediate-2.md) | 7254 | `535f45c86b3261c235c06a645993c6f45c2204d1693646210c00dca504466d1e` |
| [YF](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted/D-M02-A/source-review-v2/frozen/Y/final.md) | 8129 | `4525479502b381cd8b93b1bf56a3e44158bfc4bb822730d43b7ede6714902b1c` |
| [YI](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted/D-M02-A/source-review-v2/frozen/Y/intermediate-1.md) | 8129 | `4525479502b381cd8b93b1bf56a3e44158bfc4bb822730d43b7ede6714902b1c` |

X1 explicitly supplies source IDs `httpcache`/`httpsem`; X2/Y identify the same manifest sources through correct URLs, hashes and paths. No source substitution or hash discrepancy was found. Y final/intermediate direct byte equality was checked. Recheck of all eight input hashes at 20:08:21.156815 UTC found no changes.

Evidence keys below use **one-based physical newline lines of the pinned raw files**, not web-rendered numbers. All consequential cited sections and the adjacent exceptions were inspected; the JSON records their supported conditions.

| ID | Pinned source ID | Sections | Lines |
| --- | --- | --- | --- |
| E01 | httpcache | §3 | 282–336 |
| E02 | httpcache | §2, §4 | 251–267; 468–524 |
| E03 | httpcache | §4.1 | 528–579 |
| E04 | httpcache | §4.2, §4.2.1, §4.2.2 | 581–717 |
| E05 | httpcache | §4.2.3 | 719–782 |
| E06 | httpcache | §4.2.4, §5.2.2.2, §5.2.2.8, §5.2.2.10 | 784–799; 1222–1244; 1355–1367; 1384–1405 |
| E07 | httpcache | §4.3, §4.3.1, §4.3.2, §4.3.3 | 801–865; 887–928; 930–949 |
| E08 | httpsem | §13.1.3, §13.2.2 | 5956–5961; 6222–6270 |
| E09 | httpcache | §3.2, §4.3.4 | 369–414; 951–988 |
| E10 | httpcache | §5.2.1, §5.2.1.4, §5.2.1.5, §5.2.2, §5.2.2.4 | 1111–1114; 1164–1187; 1203–1206; 1258–1293 |
| E11 | httpcache | §5.2.2.3, §5.2.2.5 | 1246–1256; 1295–1313 |
| E12 | httpcache | §5.2.2.7 | 1321–1353 |
| E13 | httpcache | §3.5, §5.2.2.9 | 453–464; 1369–1382 |
| E14 | httpsem | §11.6.2, §12.5.5 | 5062–5081; 5668–5733 |
| E15 | httpsem | §15.4.5 | 7444–7478 |
| E16 | httpcache | §5.2.1.2, §5.2.3 | 1131–1145; 1408–1439; 326–327; 492–493 |

## Executed checks versus proposals

Reviewer executed: complete brief/manifest/artifact reads; eight-file SHA-256 checks; direct Y byte equality and bounded word/line counts; pinned normative-section inspection; official public text opens and bounded raw-byte fetch/hash checks. At 20:06:53.492088 UTC, reviewer-created Python toy arithmetic/header operations yielded:

| Check | Executed result or source-derived boundary | Limitation |
| --- | --- | --- |
| W01 | lifetime=60, age=60 → not fresh | Arithmetic from E04, no cache implementation. |
| W02 | lifetime=60, age=71, max-stale=10 → allowance exceeded | Only this directive's numeric bound. |
| W03 | Explicit Vary replacement: fr match false → true under stated safe-context assumptions | Toy header comparison, not an origin/cache experiment. |
| W04 | 304 omission leaves stored Vary: Accept-Language | Toy add/replace operation from E09. |
| W05 | Implemented must-understand/status-conformance override permits storage subject to other gates | Source-derived check; no HTTP execution. |
| W06 | Single non-subrange Last-Modified-only entry → SHOULD send If-Modified-Since | Source-derived check; no HTTP execution. |
| W07 | Full 200/no-store → current response used, no unconditional stored replacement | Source-derived check; no HTTP execution. |

Canonical toy/source check-result SHA-256: `a3c333dfb200c72e7343647279fb7e2d2e76ec1c464db33cc037f55ebe0191d4`. This checks record identity, not independent protocol conformance. No candidate implementation, downloaded code, origin behavior fixture, installer or third-party cache suite was executed.

Candidate fixture proposals are **assessed as proposals**: X covers freshness/age, 304/no-store changes, validator precedence, stale outages, Authorization grants, language match/absence/wildcard, request/response directive matrices, 200/304 Vary changes and optional account switching. Y proposes language/wildcard, private/shared Authorization including stale disconnection, and changed 304 max-age/Vary/no-store. F01/F03 qualify the corresponding expected outcomes. None establishes observed cache behavior. Their logical amendments/rejections (fresh alone sufficient, private/no-store secrecy, no-cache=no-store, mandatory Vary: Authorization, unrestricted 304 reuse) are checked as propositions, not as proof of prior draft correction.

Candidate history is **unverified**: claimed source reads/hash checks; claimed non-execution; no predecessor/draft supply; historical accepted/amended/rejected events; Y's “same-author cross-condition pass.” Independently reproducing a hash does not prove a candidate ran it. No lifecycle/provenance inference was made.

## Remaining uncertainty, blinding and timing

UNASSESSED: X's complete final and all six final obligations; unknown absent-final claims; real origin variation/validators/directives/policy changes; actual cache storage/reuse/cleanup/account behavior; candidate execution/history/lifecycle. Support for must-understand, advisory request directives, recognized extensions and out-of-band contracts is unknown. No errata corpus or implementation release was introduced as a new authority.

Visible method clues limit blinding: X titles contain “control,” “question_1-v2,” “question_2-v2”; Y contains “treatment” and “Same-author cross-condition pass”; the supplied map exposes final availability and intermediate structure. No identity map, parent analysis, other grades/reviews/cases, case cards/READY or supervisor/lifecycle/timing files were read. No winner, rank, cost or method-success conclusion follows.

The user attested quiet/held trees and frozen outputs before evaluator work; lifecycle verification remains the parent's scope. This review used no delegates or native Goal engineering and made no candidate changes/feedback. Preparation: **2026-10-07T20:04:13.589881+00:00**; first observed reviewer clock/checks: **20:04:26 UTC**; hard ceiling: **20:24:13.589881 UTC**, without reset. Completion and final delivery validation timestamps are recorded below and in REVIEW.json. Token/usage/cost values are **null**.

Completion / delivery validation: **2026-10-07T20:12:32.451270+00:00**; 498.861389 seconds from preparation, 701.138611 seconds before ceiling. JSON round-trip, reviewed hashes, Y byte equality, obligation/group counts, evidence section/range bounds and candidate line references were verified. No budget exhaustion.
