# Arm C adjudication progress (Opus 5 adjudicator, 2026-09-16)

Brief: /mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/BRIEF_ADJUDICATE_NEW_ARMS_20260916.md
Scope this session: Arm C (claude) only. deepseek41 / glm53 / muse13 / union still running; to be scored on resume.

## Stage 1 — verification of the arm's durable state: DONE
- arm-outputs/arm-c-manifest.json: file bytes sha256 bda960668eda9c08b2d1c0a2c2e6831694f1b744da7bc76011f46b588fdf2f59;
  internal manifest_sha256 = a0d3b38cb37ee3dfa47ec5ac878ce903f0ff15a0166d51c235af82613c01dd39 (this is the value the
  runner reported; it is the digest over the sorted file rows, NOT the manifest file's own bytes).
- Recomputed manifest_sha256 from the rows: MATCH.
- Independently re-hashed runs/jujutsu-claude-20260916b with the same algorithm (6,234 files, 167,320,784 bytes):
  digest a0d3b38c... MATCH. The frozen tree is unaltered since the freeze at 2026-09-16T20:02:24Z.
- Job table rebuilt from jobs/*/outcome.json + raw-claude/claude-usage.json, not from the runner's summary:
  12 new jobs J0017-J0028 = 8 reconcile (J0017,18,19,20,21,22,23,25) + 4 compare (J0024,26,27,28). CONFIRMED.
  11 request_limit_reached + 1 completed (J0019, 38 requests, 641.0 s). CONFIRMED.
  Requests 478 total (40 x 11 + 38); receipts == requests in all 12. CONFIRMED.
  Summed elapsed 4,888.9 s. timing.json: reconcile wall 1386.18 s, compare wall 1215.92 s, arm wall 1867.96 s,
  avg concurrency 2.6173. CONFIRMED.
  Captured usage upper $36.124045 (= CLI reported). CONFIRMED.
  notes.md written by 4 of 12: J0019, J0022, J0025, J0026. CONFIRMED.
- J0001-J0016 carry no raw-claude/ and are the inherited premium upstream artifacts, as the runner stated.

## Stage 2 — read continuation-3 union and crediting rules: IN PROGRESS
Union read (all in /mnt/Cursor/PuppetMaster/reports/jujutsu-research-2026-09-11/continuation3/final/):
- comparison.json    c3006253a5c68074109312747feb67130fb6e12d4f82c66132b268487156370b  (110 findings; expanded union
  class denominators correction 5 / optional_capability 36 / product_choice 6 / unsupported_or_rejected 63)
- closing-job-reviews.json e3c64edd60a6ea7664fc98d1541f649665ef2b681915bf249e50046e6917d5e1
- symmetric-adjudication.json 531c6d831890598a99b159ae160aa7bd501d13c2885ef1344f51acaaea74bcc2
- independent-review.json 923df1b300d4de20d29eff414046661590835902074e95a36df3e350161bf28b
- README.md fb775eb0f26ded27d835d8ecface357a3f1ab8a65adc612da5685bfd1e446e53
- job-coverage.json 8a9a264ab287c8f22546a953e24d9703d2621bc6e1b0df0137ad4286367831fa
Crediting rules taken from these: credit only when a delivered assertion states the same proposition cited to a
passage; partials recorded not credited; new propositions recorded as candidates, never added to the union;
source locator inventories (research-evidence/sources/**, evidence-index.md) are explicitly NOT assertion documents.

## Stage 2 — DONE. Arm C assertion corpus identified: 18 documents in 4 of 12 jobs.
- Assertion documents exist only in J0019-reconcile, J0022-reconcile, J0025-reconcile, J0026-compare
  (4 notes.md + 14 leads/*.md). notes_sha256 in each delivery.json matches the file on disk in all four.
- The other 8 jobs (J0017, J0018, J0020, J0021, J0023, J0024, J0027, J0028) produced ONLY
  research-evidence/sources/** locator inventories and a truncated last_assistant_text.md (16-55 bytes);
  zero assertion documents, zero lead deliveries. All 8 ended request_limit_reached / aborted_streaming.
- navigation.md in every compare job hashes to run.json navigation_sha256 (0eb77a4d...): it is an INPUT fixture.
  handoff.md differs per job and is the upstream handoff input, also not arm-authored.

## Stage 3 — read the 18 assertion documents and score: IN PROGRESS

## Stage 3 — DONE. All 18 assertion documents read in full; scoring settled.
Credited (18): F004 F006 F010 F030 F050 F051 F059 F061 F062 F066 F072 F079 F080 F081 F082 F084 F092 F102
Partial (13): F001 F002 F007 F011 F029 F069 F074 F083 F087 F088 F089 F094 F097
Out-of-union candidates (5, all J0026-compare): R1 verification depth, R2 machine-local store entries,
R3 in-store pointer rebinding, R4 present-but-unloadable metadata blocker, R5 gc-fence covered paths.
Lead-assignment table rebuilt from jobs/*/job.json + delivery.json: 11 distinct leads assigned at
reconcile (9 delivered), 9 at compare (3 delivered). J0028-compare held exactly the graph leads that
produce F107 in premium/hybrid and died at the ceiling with zero delivery.

## Stage 4 — write adjudication files + manifest: IN PROGRESS

## Stage 4 — DONE. Adjudication written.
adjudication/claude/{README.md, arm-c-findings.json, arm-c-candidates.json, arm-c-scoring.json, PROGRESS.md}
Hash manifest: adjudication/claude-manifest.json, internal manifest_sha256
138424216690b85865ddd4d7227796ca24ec33c1c65a80204226c2d1bbe55a62 (5 files; manifest excludes itself).
NOTE: this PROGRESS.md was hashed into the manifest before this line was appended, so the manifest must be
regenerated after any further append. Regenerate with:
  python3 hash_manifest.py adjudication/claude adjudication/claude-manifest.json \
    --label "Arm C (Claude Opus 5) adjudication against the continuation-3 union, 2026-09-16" \
    --exclude claude-manifest.json

Headline: 18/110 credited (16.36%); corrections 0/5, optional 1/36, product choice 0/6, unsupported 17/63.
Zero findings unique to Claude; all 18 are inside premium's 78. 9/11 admitted leads delivered a reconcile
assertion, 3/9 delivered a comparison; 3/88 input leads reached the compare stage at all.
Cost $36.124043 of $100, zero unresolved, 12/12 job-end reconciled.

## Stage 5 — repo bundle on research/jj-c4-adjudication-20260916: IN PROGRESS

## Stage 5 — DONE. Branch pushed; NOT landed (per the brief).
- Worktree ~/pm-worktrees/jj-c4-adjudication-20260916 (VM local disk, 29 MB, sparse set `reports`),
  branch research/jj-c4-adjudication-20260916 from origin/main b0977cd8518145dea45bc242dc5f221b5e62f141.
- Bundle: reports/jujutsu-research-2026-09-11/continuation4/adjudication/
  {README.md, arm-c-findings.json, arm-c-candidates.json, arm-c-scoring.json, evidence-manifest.json, SHA256SUMS}
- Commits ebdc15c4b2 (bundle) and 8c5bebd37e (claude-hicap control-arm note). Pushed to both remotes;
  remote head 8c5bebd37e00a5e7b839ef3e33b50547d09c0bbb. Do NOT land until told.
- Worktree deliberately LEFT IN PLACE: the branch has not landed, and the remaining arms will be added
  to this same branch on resume. Remove it only after landing.

## To resume for the other arms
1. Each new arm: verify its manifest the same way (the runner reports the manifest's INTERNAL
   manifest_sha256 over the sorted rows, not the manifest file's bytes), then re-hash the run tree with
   continuation4/hash_manifest.py and compare.
2. Rebuild the job table from jobs/*/{outcome,job,delivery,native-job-end-accounting}.json plus the
   adapter usage sidecar; do not take the runner's summary.
3. Identify the assertion corpus: notes.md + workspace/leads/*.md only. navigation.md hashes to
   run.json navigation_sha256 and handoff.md/brief.md/assignment.md/sources.md/tool-help.md/research.py
   are inputs. research-evidence/sources/** are locator inventories, NOT assertions.
4. Score against /mnt/Cursor/PuppetMaster/reports/jujutsu-research-2026-09-11/continuation3/final/
   comparison.json (110 findings, sha256 c3006253a5...). Credit only a stated proposition with a cited
   passage; record partials and out-of-union candidates separately; never add to the union.
5. Write adjudication/<arm>/ with the same four files, regenerate that arm's manifest, extend the
   comparison table in every arm README (or add a top-level adjudication/README.md rollup), commit to
   research/jj-c4-adjudication-20260916 and push.
6. Watch for claude-hicap: it is the ceiling control for Arm C and its comparison against Arm C is the
   single most informative number this experiment will produce.

## AMENDED 2026-09-16 while scoring deepseek41
Arm C's UNIX_EPOCH garbage-collection claim (J0019, J0022, J0026 and two leads) is factually wrong; verified
by the adjudicator against jj lib/src/simple_op_store.rs:285-298, where a file is kept when mtime > keep_newer.
F079 and F004 credits stand on independent Plans citations. Arm C's lead
dojjo-sync-complete-prunes-operation-history.md is materially false. Candidate C4C-05 loses one of two
external legs and survives on the other. README.md, arm-c-findings.json, arm-c-candidates.json and
arm-c-scoring.json all carry the amendment. Arm C's credited total is unchanged at 18/110.

## Post-review revision — 2026-09-17

Independent review REVIEW_ADJUDICATION_20260916.md returned "fix first". It upheld the method, the
nesting (including its set-equality form), the manifests, the quarantine discipline, the frozen-input
boundary, the garbage-collection reading and the absence of family bias, and re-derived 80 credits
including every correction. I re-verified each item against the run state before applying it.

Credit changes: claude-hicap -F001 (B4), glm53 -F068 (B5), union -F015 (B6), deepseek41 +F043 at 2 of
3 clauses with the third disclosed (S10). Post-review recall: 18 / 34 / 36 / 40 / 42 / 45.
Four-arm review union 45, still set-equal to claude-hicap; five-arm 48; six-arm 57; no arm 53.
Every structural conclusion survives. Text and pointer items S1-S9, S11, S12 and N1 applied.
