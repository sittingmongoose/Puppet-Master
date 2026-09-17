# Evidence — the runs that establish each promise

Every measured figure in `Plans/External_Research.md` comes from the September 2026 external research
campaign on one frozen Jujutsu case. Sources as read on 2026-09-17:

| Source | SHA-256 | What it establishes |
|---|---|---|
| `reports/jujutsu-research-2026-09-11/README.md` | `f5b76807ca163bfe31cabeb41ff401f23f7f9118ff3ad671d55c59bd98668c27` | The campaign result index and the 110-finding union |
| `reports/jujutsu-research-2026-09-11/continuation3/final/README.md` | `fb775eb0f26ded27d835d8ecface357a3f1ab8a65adc612da5685bfd1e446e53` | Finding classes, class totals, the five union additions, and that unsupported-or-covered is not a false-positive rate |
| `reports/jujutsu-research-2026-09-11/continuation3/gate/README.md` | `7b7dba73a1892ab920ec69b6e25a0a2c127780a03a6418d5ae1e014589a03b75` | Admission against captured usage plus allowances plus unresolved charges, and that DL-043 and D5 stay outside research inputs |
| `reports/jujutsu-research-2026-09-11/continuation3/gate/cost-policy.json` | `d096dac1ddd552aa1cfa026981151b2162c73070307ec4083beb90812edf1247` | Cold allowance, two-job average rule, job-end native valuation, retained unresolved charge, per-job 40 responses and 2,400 seconds, lifetime caps |
| `reports/jujutsu-research-2026-09-11/continuation3-landing/README.md` | `29dbe5b397a76fd60f37916d6662841a28980358333c326cb4919423886eba95` | The correction landing path: currentness re-check, independent review, ledger, and owner obligations where no contract surface exists |
| `reports/jujutsu-research-2026-09-11/continuation4/README.md` | `cd82616315cb33466cfe5716c287bc6630d705b96011ccee02ab922c00461475` | Per-arm stage timing, wall, summed job time and average concurrency; job status and bound_by; cost table; the four accounting defects D1 to D4 |
| `reports/jujutsu-research-2026-09-11/continuation4/adjudication/README.md` | `c07c545ddc4588b65ba95a28868a46a30406fc3d70439f55050c27ac51d46d87` | Review-arm recall at 40 and 160 responses per job, the proper-subset result, admissions as the bound, candidate discipline, the same-family disclosure and the source-verified code fact |
| `reports/jujutsu-research-2026-09-11/continuation4/adjudication/cross-arm.json` | `04c6667ac9bd788fdc2a673f4b7b512682ecad1ddeeff017c3fce65f06d5318b` | Recall, nesting, unions and the seven cross-arm factual verifications |
| `reports/jujutsu-research-2026-09-11/continuation4/adjudication/consolidated-candidates.json` | `f09790f1e3b83a3675043741707ebbdc50d4c10e01bea7fdfe9fc38bbe40879c` | The 27 out-of-union candidates with classification and rejection checks |
| `reports/jujutsu-research-2026-09-11/continuation4/corrections.json` | `65791bf0123199a97097e1dbdd2a08ef6f246e236fd13ad08d7753d855c2d1ec` | The stream-block response count, the post-response boundary defect, the shared temp-file name, the hardcoded runtime version, and the 41-against-40 reading |
| `reports/jujutsu-research-2026-09-11/continuation4/freeze-history.json` | `d58711ac3fbf0f621429e5076ab22fed125ed37232367d54904ef311711a7143` | Protocol freezes in order and which arms ran under each |
| `reports/jujutsu-research-2026-09-11/continuation4/runtime-identity.json` | `4263d70d78206e0b082619dd6a7e1f35311b1a399151d17684ccd71cf377f186` | Binary path, self-reported version and hash per arm |
| `reports/jujutsu-research-2026-09-11/continuation4/output-manifests.json` | `ddd20a45398aeff7176a460b6a042d6cbf13a22c00f42dcb7f536a7e8ed1d429` | Frozen output tree manifests and the quiesce-before-hashing rule |
| `reports/jujutsu-research-2026-09-11/continuation4/protocol-fingerprints.json` | `cd23bfaaf68d34110c79dff936f367e5d89028c7c8df4b6105eef478b229ab52` | Per-run pinned protocol hashes and the recomputable fingerprint |
| `reports/jujutsu-research-2026-09-11/d5/README.md` | `28aca2dee2fee3cddd9f5df423c25aca44936b477e7465e9391621a882b275ea` | The 44 preserved answers and their dispositions |
| `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/REVIEW_ADJUDICATION_20260916.md` (appended to after this reading; the hash is the 2026-09-17 snapshot, not a frozen file) | `8a7358bcd7883c6d6f93a986a488f3504ac36e1716e960bdf7690b88f29d10ac` | The independent review that withdrew three credits and added one, and the reviewer-independence rule |
| `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS_PLAIN_20260909.md` | `98c7c005b490904a33f1ec0ec88c6402db48f33ec7ce0cb82ee3d01cf87e7847` | The plain-language decision form behind DL-036 |
| `Plans/Decision_Log.md` | `a386cfe3da2297d6132cee6531321d1fd2dbc709180eb4c26fe543a8102e11ba` | DL-036 packet flow and DL-043's note that the one correction landed under the existing repair authorization |

Specific figures carried into canon, each with the unit that carries it:

- `ERS-010`: an arm capped at 40 responses per job stopped 11 of 12 jobs at the ceiling and reached 18 of 110;
  its control at 160 responses finished all 12 using 37 to 110 responses per job and reached 45, and the capped
  arm's set is a proper subset of the control's.
- `ERS-011`: three cheap review arms reached 34, 36 and 40 of 110 for $0.5315, $0.8195 and $0.1644 captured,
  against $82.5164 for the uncapped strong arm's 45; the $0.8195 arm held three findings no other review arm reached.
- `ERS-012`: the full five-stage pipeline ran 6,378.3 s wall at average concurrency 2.620, with discovery 595.1 s,
  implementation 1,889.2 s, history 2,079.6 s, reconcile 3,699.3 s and compare 658.3 s; review-only arms ran
  between 668.7 s and 3,535.2 s. The 60-to-75-minute per-topic target with two to four agents is the product
  target set by Jared and recorded in the goal 3 brief.

Continuation 5 has not reported. Its review-configuration and latency results are open questions `q-001` and
`q-002` here, and `ERS-010` and `ERS-012` carry continuation 4's numbers with their run named until it does.
