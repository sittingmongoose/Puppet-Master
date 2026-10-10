# Independent ER12 Track B finalization assessment

Source judgment: **FAIL** — one material failure-state assertion remains (F1). Delivery is complete and the assigned semantic review is complete. This judgment concerns only B-FINAL-G-01 treatment, not a paired comparison, full pipeline qualification, native success, or ER11.

## Material finding F1

Candidate `final-section.md:14` says cancellation/failure leaves partial data in hidden `.~tmp~` holding directories; line29 defers interruption ordering to a future fixture. This is an unconditional recovery-state assertion, not merely a statement that retained unfinished regular-file bytes can use a partial directory.

For the exact3.2.7 peers, ordinary `--delete` defaults to deletion during transfer, before updates to each directory. Delayed regular-file installation does not postpone all directory changes or deletions. The versioned implementation installs completed delayed files at phase2; individual transfer errors can continue and final cleanup can still return a partial-transfer error. A holding-directory creation error explicitly discards completed/partial bytes. Failure therefore does not imply a wholly hidden temporary state or guaranteed retention. See the [independently retrieved release](https://download.samba.org/pub/rsync/src/rsync-3.2.7.tar.gz), member `rsync.1` lines1992–2023 and3506–3539; `receiver.c` lines421–448,559–584,789–797,901–918; `cleanup.c` lines210–219; and `generator.c` lines1520–1525. Exact saved locators are in [source-map.json](source-map.json).

This matters to the required cancellation/failure handling: recovery must reconcile the actual staged tree, which can already contain deletions/updates and can have retained or discarded temporaries. Correctly retaining diagnostics, preventing publication, and rejecting whole-tree atomicity mitigates the risk but does not support the temporary-state guarantee. The bounded checked claim is that staging remains unpublished after failure and its actual partial state must be determined before reconciliation. No rollback feature, deployment, or execution experiment is invented as an obligation. The candidate was not edited or given feedback.

A source-code counterexample is distinct from a run observation: these paths were read independently; no rsync transfer or interruption fixture was executed. `--delay-updates` really does set the default partial directory and enable `keep_partial` (`options.c:2384–2425`), so the review does not make the opposite wrong correction that partial bytes are never retained.

## Every original obligation and format condition

- O1: satisfied. Exact `Staged asset mirror` subsection,3.2.7 both peers, receiver staging, contents at intended depth. Source-directory trailing slash supported by pinned manual USAGE137–174. Bare host/module default-directory exceptions do not validate critique4's universal claim.
- O2: satisfied. Exact `protected_dir=local-notes`, `publish_mode=explicit`, `preview_required=true` retained at candidate line8.
- O3: satisfied within the declared filter scope. Scoped receiver deletion uses recursion; ordinary unqualified `local-notes/` exclusion protects receiver notes and hides matching source directories. Dropping `--delete-excluded` corrects the draft. Manual1971–1986,2050–2068,4111–4122,4221–4239. Explicit receiver protect rules could work even with delete-excluded; no universal prohibition inferred. An unanchored directory-name rule matches at any depth; no unstated root-only promise assumed.
- O4: satisfied with L1 wording limitation. An inspectable mandatory dry-run deletion preview precedes the destructive product operation; the candidate labels checks unexecuted. No executed mirror or actual application preview credited. Pinned manual1814–1828,3148–3180,3253–3256 supports preview and itemized deletion output.
- O5: satisfied. Successful transfer and separate explicit product publication are distinct, automatic publish rejected, and delayed per-file renames do not imply an atomic whole-tree transaction. Product obligation governs publish; pinned manual3506–3539 governs delay-updates.
- O6: all required subjects are included, but failure-state meaning fails F1. Candidate line16 includes exactly three meaningful prospective checks and identifies needed evidence; line29 carries remaining uncertainty. Failed/unpublished state and diagnostics are preserved.

The standalone replacement is546 whitespace-delimited words (within400–650); the entire deliverable is1016 (below1100). Full replacement, all numbered dispositions, short uncertainty statement, source map and one complete sources member exist. Exact title appears as a subsection despite the longer wrapper title. No missing subsection, patch-only answer, or silent exact-token deletion.

## Every received critique

1. Accept is supported for the draft's unqualified exclusion. Receiver-protection exceptions remain distinct (`--delete`/`--delete-excluded`). Candidate line20.
2. Reject is supported: restoration from memory does not authorize deleting mandatory preview. `--dry-run` is the no-change trial; max-delete zero only prevents deletions. Candidate line21.
3. Accept is supported: explicit publish must remain separate; delayed rapid per-file renames are not a whole-directory transaction. Candidate line22. F1 concerns an added failure assertion, not this correct acceptance.
4. Reject is supported: directory trailing slash changes layout and O1 requires contents. Whole-directory selection rather than wildcard expansion also matters for deletion. Candidate line23, pinned USAGE and `--delete`.
5. Accept with qualification is directionally supported. Candidate acknowledges no lock and re-runs identical preview, which is a recheck. Calling the final preview binding has the L1 ambiguity below. The critic's warning does not itself authorize a new product constraint. Candidate line24, pinned `--dry-run`.
6. Reject is supported: delete operates on receiver; sender removal is a distinct `--remove-source-files` option with different conditions. Candidate line25, pinned1971–2003 and1949–1970.

## Limitations that do not independently drive FAIL

L1: Candidate lines12/24 give no comparison/abort or approval rule for the final preview. Temporal adjacency cannot bind mutable tree contents. Because it explicitly denies a lock and performs a recheck, this is recorded as ambiguous wording rather than an invented second material finding. Credit only the latest inspectable preview for identical intended arguments, not tree stability.

L2: Candidate line12 says error25 occurs when the max-delete cap is hit. Manual2098–2110 says further removals exceeding NUM files/directories are skipped; exactly NUM allowed removals need not produce25, and a more important error overrides25. Zero-deletion warning mode is correct for3.2.7 (pre3.0.0 unlimited behavior does not apply). Zero mode is not a general no-write dry run.

L3: Later critique items rely on the preamble's pinned-manual citation and option names, unlike item1's explicit section citation. The source map resolves them; this is a minor locator issue.

## All assigned review axes

A1 original obligations/negative constraints: complete, O1–O6 and output bounds above. A2 consequential applicability: complete, all grouped claimsC1–C8 in the JSON/source map cover version, operation, defaults, types, domains and exceptions. A3 discoveries/alternatives/implementation/history/opportunity: complete for this bounded final role; exact-version pin and max-delete are useful candidate discoveries. Broad discovery was not separately required. Reviewer inspected pinned implementation and3.2.7 NEWS; receiver protect, deletion-delay versus update-delay, and parallel-tree link-dest remain leads, not demanded features. A4 fallible critique adjudication: all six reviewed without automatic acceptance. No Plans/WorkNodes assigned. A5 supported meaning: version, paths, controls, depth, local notes, scope, explicit publish and checks retained; F1 is an unsupported added guarantee. A6 validation/oracle: meaningful three checks labeled prospective; no retrieval or source extraction counted as service validation, and no nonexistent deployment demanded. A failure oracle would inspect actual destination changes and temporary retention, not exit status alone.

## Separate delivery, source, coverage, native, protocol and time

Delivery: present, complete; parent/user reports actual T3 task completed with no pending runs. Actual host terminal-science-freeze was found on recheck, read completely and preserved byte-for-byte. Its science hashes match inspected bytes. This is a host observation, not a native receipt.

Source: FAIL/F1. Coverage: complete assigned finalization review; not full-pipeline qualification. Native: candidate reports unavailable tool and no Goal; actual native activation/completion/effective outcome remain UNKNOWN. Transport, effective model/reasoning and billing remain UNKNOWN. The freeze contains a requested AUTHORIZED_PROVIDER_INSTANCE GLM-5.3-Flash route only. T3 completion supplies no native-success inference. The reviewer's own actual native Goal is separate and will complete only after this judgment is saved.

Protocol: bounded independent read/retrieval; no delegation, candidate feedback/repair, account changes, Git/publication, other arms/results/history or ER11 rescore. All writes are under this assessment root. Candidate unavailable-tool fallback is expressly allowed; full candidate action compliance cannot be independently established without an unrequested transcript audit.

Time: reviewer started04:12:08Z,25-minute deadline04:37:08Z. Candidate contract prepared04:02:11Z, writing boundary04:12:11Z, deadline04:17:11Z. Host science observation04:13:02.625852Z precedes that deadline but is not original save/terminal time. Source map self-timestamp04:07:30Z is attributed, not trusted telemetry. Candidate occupancy, exact terminal time and writing-reserve compliance remain UNKNOWN; no latency/inference/billing savings inferred.

## Independent evidence and all inspected hashes

Official3.2.7 tarball independently retrieved by HTTPS at04:13:02.839875Z–04:13:03.771651Z,HTTP200,1,149,787 bytes,SHA256 `4e7d9d3f6ed10878c58c5fb724a67dacf4b6aac7340b13e488fb2dc41346f2bb`. The extracted manual matches candidate source bytes, but source judgment rests on passages and code, not hash agreement. Live manual and FAQ independently captured with headers/timestamps; live manual is3.5.1, supplemental only. No downloaded code executed.

[Evidence index](evidence-index.md), [source map](source-map.json), [all inspected artifact hashes](inspected-artifacts.json), and [freeze/hash/format rechecks](inspection-checks.json) are navigable. The following entries include every fully read science input/output; all raw independent-source hashes and semantic read ranges are additionally listed in source-map.json. Original terminal-science-freeze remains untouched.

- `ER12_RUNTIME/assessment/RUBRIC-v1.md` — 2790 bytes; SHA256 `a93d0456d53b3519883ec517135688d2bbb4c12eb62f9a0b6fbe1bf2615fe19b`; [preserved inspected bytes](evidence/inspected-science/001-RUBRIC-v1.md).
- `ER12_RUNTIME/runs/B-FINAL-G-01/treatment/stages/role/input-map.json` — 626 bytes; SHA256 `1238fd6c2bfcae3453c971f28d4e30a7e5bc35e12765b912b7b586db203d17de`; [preserved inspected bytes](evidence/inspected-science/002-input-map.json).
- `ER12_RUNTIME/runs/B-FINAL-G-01/treatment/stages/role/assignment.md` — 1810 bytes; SHA256 `22b67443a769550a84b6dc2e9e444c83b2a1d890878a88b721d735a7392419ef`; [preserved inspected bytes](evidence/inspected-science/003-assignment.md).
- `ER12_RUNTIME/runs/B-FINAL-G-01/treatment/stages/role/freeze.json` — 2849 bytes; SHA256 `5c7d4746092117fb093b71b607035003739d33385c52519c143714700b4d6824`; [preserved inspected bytes](evidence/inspected-science/004-freeze.json).
- `ER12_RUNTIME/runs/B-FINAL-G-01/inputs/assignment.md` — 5043 bytes; SHA256 `4f14d106f3d271031fd14911c24464e17e474d0086c22903465825e90deeaa6d`; [preserved inspected bytes](evidence/inspected-science/005-assignment.md).
- `ER12_RUNTIME/runs/B-FINAL-G-01/inputs/fixture.json` — 1652 bytes; SHA256 `f10e0f5913123f0e0b0e98d6527053ded694d2c74ffc2b92c1cad598640aad20`; [preserved inspected bytes](evidence/inspected-science/006-fixture.json).
- `ER12_RUNTIME/runs/B-FINAL-G-01/inputs/manifest.json` — 624 bytes; SHA256 `b5ef2cef29e5f924f79d05cb4cbacd2cb0d0df209bc7430d1a52321690010bb6`; [preserved inspected bytes](evidence/inspected-science/007-manifest.json).
- `ER12_RUNTIME/runs/B-FINAL-G-01/inputs/corpus/S1.md` — 944 bytes; SHA256 `95f8e558d6b96ab11ce68b3a1b6c8438309f7dda71ea23212ddacf58c465ad92`; [preserved inspected bytes](evidence/inspected-science/008-S1.md).
- `ER12_RUNTIME/runs/B-FINAL-G-01/inputs/corpus/S2.md` — 795 bytes; SHA256 `a29d011459dc3bb1503fe4cbada7ec85b3566ee1c6389f486d7c26125f956e92`; [preserved inspected bytes](evidence/inspected-science/009-S2.md).
- `ER12_RUNTIME/runs/B-FINAL-G-01/inputs/corpus/index.json` — 1281 bytes; SHA256 `f45e897cf2df2eb5eb94ef9438bca253cdae0c78d75098ee303254c7f3253732`; [preserved inspected bytes](evidence/inspected-science/010-index.json).
- `ER12_RUNTIME/runs/B-FINAL-G-01/treatment/stages/role/final-section.md` — 7111 bytes; SHA256 `ca88eea59836abdae6bf4e3c232e7f4265b1bca654dffec67f0f28a0da2832f7`; [preserved inspected bytes](evidence/inspected-science/011-final-section.md).
- `ER12_RUNTIME/runs/B-FINAL-G-01/treatment/stages/role/source-map.json` — 5911 bytes; SHA256 `b9e63c23ebea762a30693399791d742d0935dfb49679512bdec7f64b135310eb`; [preserved inspected bytes](evidence/inspected-science/012-source-map.json).
- `ER12_RUNTIME/runs/B-FINAL-G-01/treatment/stages/role/goal-record.md` — 1929 bytes; SHA256 `cfce03efbe99bd8311411fddc38a83912e20f4a8bcd2f9cb470a1bc205167a83`; [preserved inspected bytes](evidence/inspected-science/013-goal-record.md).
- `ER12_RUNTIME/runs/B-FINAL-G-01/treatment/stages/role/sources/rsync-3.2.7-man.txt` — 233638 bytes; SHA256 `f2d70e3b57214cb26519a88e2b6118dd2c05386838009f9888f48876a087690c`; [preserved inspected bytes](evidence/inspected-science/014-rsync-3.2.7-man.txt).
- `ER12_RUNTIME/runs/B-FINAL-G-01/treatment/stages/role/terminal-science-freeze.json` — 9867 bytes; SHA256 `fc57667cbea26e7c81fe50d89ebbc364439bd4787b6d24f71f6f2e8401a4cf48`; [preserved inspected bytes](evidence/inspected-science/015-terminal-science-freeze.json).
