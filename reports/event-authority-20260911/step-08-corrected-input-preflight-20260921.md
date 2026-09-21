# Step 08 — corrected historical-input landing preflight

**Main push remains held.** The latest unmodified full-checkout isolated landing preflight returned exit 2 with **15 blocking items**: thirteen sampled on-branch Event Authority currentness mismatches and two truncated readiness totals of 179 against baseline 124. The missing historical widget-report input is now supplied with authenticated identical bytes and both relevant validators pass. A first rerun exposed an external-symlink path error; supplying the same ignored report as a regular local file removed that error in the second full rerun. The baseline, checkpoint approval, canonical sources and shared main were unchanged. Step 08 remains open; Step 09 remains 0 registered, 6 excluded, 20 carded and 226 remaining, and Step 10 has not run.

Cost: two full isolated preflights, 508.251 and 494.830 seconds; corrected-layout reference and web-capability checks, 43.174 and 3.033 seconds. Monetary attribution unavailable.

The final run used `python3 scripts/pm-landing-check.py --base origin/main --json` at `04082f9efab72d452bb4a8da50ae8c860e874196`, with `origin/main` still `478cd2aa0fa5a5660961f351918739d43643bbac`. It ran on the full isolated tree. HEAD, base, clean tracked state, baseline/current-run hashes and authenticated input custody were equal before and after. No baseline was refreshed; its SHA-256 remains `3dd4b5a07595072250a76e332a57544614e479d934915f29def46696d527b92f`.

| Check | Current failures | Recorded baseline |
|---|---:|---:|
| run-gates | 4,947 | 4,912 |
| audit-governance | 4,947 | 4,895 |
| current plan-migration validation | 28,298 | 28,128 |

The thirteen non-staleness on-branch samples concern the Plans index, Automated Testing, Backup/Restore, Contracts, Executor, Goal Runtime and Event family registry. Both readiness aggregates report 179, with only 50 and 100 failures sampled respectively. Those two increases remain blocking under the unchanged truncated-total rule. Twelve subchecks are compared by totals; no unseen failure identities or baseline input equivalence are certified. All eight newly keyed failures and all eleven grown buckets are classified as staleness by the unchanged checker; 9,197 reported on-branch items are excused staleness. Source currentness and exact checkpoint approval remain independent unresolved obligations.

The first rerun at `d4de267cc131b0ae8b65d11b67481efecbef3117` also reported 15 blockers, but its web-capability validator could not convert the external widget-report symlink target into a repository-relative path. That added one validator-no-output finding to each aggregate, leaving each total at 4,948. The task-owned ignored symlink was replaced with an identical 13,236-byte regular file at `Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json`; its SHA-256 before and after is `ef4eeb5f4c13a9baa23ed08f37c04a19c758dedc1dc84508b77169701ed2d294`. The immutable external snapshot is unchanged. Both `lint-contractrefs` and `validate-web-capability-contracts` then passed with zero failures, and the final full run removed both validator-no-output findings. No validator was edited and no input was hidden or removed.

| Evidence | Path | SHA-256 |
|---|---|---|
| First rerun with symlink limitation | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-08/corrected-input-preflight-20260921/manifest.json` | `443879574752b437dceed70a31719b85dc826d1a68d98008b8e73b6a196f1c39` |
| Final run, input-layout custody and targeted checks | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-08/local-report-input-preflight-20260921/manifest.json` | `d7dd58e270cf4b1887ec6b8fadfaf2217e760b471bccbc5f2c362cd947062159` |
| Final complete landing output | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-08/local-report-input-preflight-20260921/landing-check.stdout` | `d103b9c4d7039f45fb59ba7443ad42be995afa84b6f3cc21c457ca8b69f26e1c` |
| Final bounded summary | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-08/local-report-input-preflight-20260921/summary.json` | `d5e2ffa03fe7a95dbb9e5d08f285b7f2f6ac6cd3a7ecc23a7ec9f63bde74db67` |

This supersedes only the earlier report's “full check not rerun after input correction” status. It does not refresh the historical currentness audit, approve the 42-row live checkpoint, prove unavailable baseline inputs, seal governance or authorize landing. This source branch is not the eventual combined tree containing the separate post-audit repairs and shared checkout changes. That selected tree still requires the prescribed shared-checkout shard and landing checks before any main push.
