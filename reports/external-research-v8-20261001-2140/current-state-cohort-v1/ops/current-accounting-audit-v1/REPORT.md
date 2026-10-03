**Helper cutoff missed; accounting reconciliation is valid only within its stated metadata scope.**

Read-only ER8 accounting reconciliation, frozen at 2026-10-03T02:51:39.195013+00:00 (ledger SHA-256 `5855009a66329f4160e9b1821dfa20ee4907e9e9e01d3ea46da3b593978b91ac`).

The pinned live ledger contains **40 actual native activation receipts, 42 admissions, and 29,488.13831925392 occupied slot seconds**. All 40 activation receipt IDs are unique. Two research stages are active in family Z; six cases / three pairs have operational completion metadata.

| Group | Actual starts | Occupied slot seconds |
|---|---:|---:|
| canaries | 3 | 1427.4393529891968 |
| setup_failed_before_native_start | 0 | 5.5069580078125 |
| V3 | 4 | 6621.72424530983 |
| V6 | 13 | 9168.79368019104 |
| V7 | 20 | 12264.674082756042 |

The immutable 02:43:30 snapshot (SHA-256 `6f1c8c4f1fcf895f13897588cfff1b4bd4b2910b5eb405726c21c74953f97097`) reconstructs exactly to **38 starts and 28,511.346881866455 occupied seconds**, with zero cost delta. Its accounting instant precedes creation by 31.128 ms. It records four completed cases / two pairs, four independent FAILED_SCREEN results, zero full PASS, and zero qualified efficiency comparisons. Later operational completions do not change those pinned quality results.

The clock remains original start **1790905209**, with only the explicit **64,621.83037877083-second** pause excluded and deadline **1791013030.8303788**. At the first read, work elapsed was **26,068.364634037018 seconds**, leaving **17,131.635365962982 seconds** of the original 43,200-second work clock.

Failed canaries, two no-start setup failures, and old orphan critics remain charged from original birth through actual first current release. The two late orphan critics retain 600-second caps but cost 2,543.2560338974 and 2,521.8393959999084 occupied seconds. All nine historical 600-second components remain unchanged. Observed V7 caps are 1200/1200/900; this audit performs no cap or outcome rewrite.

All six current completions have `GLOBAL_PARENT_FINAL_RECEIPT.json`, `EXTERNAL_CASE_CLOSE.json`, and reservation `completed=true`, with positive exit/group absence and original-cutoff metadata. No nonexistent `CASE_COMPLETE` artifact is required. The standby receipt is pinned as ACTIVE_STANDBY_WAITER / PREDECESSOR_REMAINS_OWNER, with native launch and exclusive ownership false; its unchanged-cutoff attestation does not establish a later ownership handoff.

Generated output is only a reported lower bound of **836,737 tokens** across 28 jobs; 14 jobs remain unknown. Full usage, account identity attestation, and actual model consumption are **UNKNOWN**. Assigned ceiling comparison is 144 starts / 172800 occupied seconds / two slots per family; authority contents and later helper-enforcement changes were outside this audit.

API source SHA-256: `a98cf53c1826f1f4c9fa47a9e181eaae8beb971ea41e6564578a253059450b61`. Full path/hash pins and selected positive metadata are in REPORT.json and CASE_COMPLETION_METADATA.json. No native/provider action, quality regrade, repeated settlement, ledger/canon/git mutation, private profile/log/stream or candidate-content inspection occurred. Actual end: **2026-10-03T02:59:55.407011+00:00**. The original 600-second helper deadline was missed by **56.580358 seconds** including terminal correction; core report generation ended 1.075321 seconds late. No deadline reset occurred.
