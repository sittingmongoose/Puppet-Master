# Task N7: blind fixed-form review versus the scoped custody review, on R7-A

STATUS: COMPLETE (matcher done 2026-09-18 07:48 UTC).

Written 2026-09-18 by the coordinator. Brief: `N7_BLIND_REVIEW_COMPARISON_BRIEF.md`. Package:
`/home/sittingmongoose/PM-Experiments/r7a-blind-review-20260918-v1/` (README.md records what was
built, its sizes and every deviation from the brief).

## 1. Question and design

The Jev pilot thread reported that two blind Opus reviewers with a fixed findings form, about ten
minutes and 150K tokens each, found 19 + 19 issues on a landed compile whose landed review had found
none. Our accepted review method (method-003: host custody, byte-verified citations, sealed
controls, a 3600 s allowance, then an independent adjudicator) cost 544,404 reviewer tokens and
3,159 s of wall clock on R7-A plus an adjudicator, and produced five supported findings. This task
runs the cheap form on the same candidate and scores it against the expensive one.

- **Subject:** candidate R7-A on the known-defect subject `gitlab-small-v1`: the frozen source, its
  first-seal revision R1 and second-seal revision R2, from the scoped review's frozen package.
- **Reference (the key):** the scoped review's adjudicated findings F1 to F5 and its two bounded
  unknowns U1, U2, written to `key/KEY.json` and sealed at 2026-09-18T07:03:20Z
  (SHA-256 `94dd26d2c5f7ea4e9e08c5daa17c3e999d78b54dcd068033e9ba73b7dc86f6c5`) **before any packet
  file existed**. F3 (the harness's own failure census) and F4 (event-authority currentness) need
  mechanical evidence the packet does not carry and are marked unreachable in the key; the fair
  denominator for the blind form is therefore F1, F2, F5, U1, U2.
- **Packets:** two byte-identical packets (apart from `MANIFEST.json`), 41 files, 702,365 bytes,
  about 175K tokens each: the six authority files the candidate saw; the R2 text of the five
  authored files plus the base text of the three small ones; unified diffs source→R1 (five files)
  and R1→R2 (three); the amendment with a reduced READY record; a census of the 246 derived paths;
  and the three consumer excerpts that fit (Source Control, Plan Document System, and the 63
  `forge`/`gitlab` rows of the production wiring matrix with their certification scaffolding
  trimmed). Four consumers named by the topic packet were excluded for size and are listed in the
  manifests. Package manifest `MANIFEST.sha256.json` digest
  `166e01aba35d6a9faa073d3912504c0e98202fc9ea1daf80ffee974543067bb6`.
- **Form:** the Jev reviewer form adapted to a candidate change: one JSON line per finding with
  file, unit, kind, **charge** (candidate / subject / unknown, decided from the diffs), revision,
  severity, claim, quoted evidence and a one-sentence repair; a summary line with verdict. Reviewers
  were told to read only the manifest's files and nothing about any earlier review.
- **Matcher:** a third agent maps every finding to the other reviewer, to the key, and to a
  mechanical check it performs itself in the packet (`packets/matcher/INSTRUCTIONS_MATCHER.md`).
- **Blinding audit:** `tools/audit_reads.py` scans each reviewer's full tool transcript for any
  path outside its packet directory and any network tool.

## 2. The two reviewer runs

| | Reviewer A | Reviewer B |
|---|---|---|
| model / dispatch | Opus, 07:17:56 UTC, same minute as B | Opus, 07:17:56 UTC |
| wall clock | 730 s | 690 s |
| tokens (harness-reported) | 197,800 | 183,777 |
| tool calls | 54 | 44 |
| files reviewed (own summary) | 41 | 42 |
| findings | **15** (9 charged to the candidate) | **11** (7 charged to the candidate) |
| severities | 8 should-fix, 7 notes, 0 blocking | 7 should-fix, 4 notes, 0 blocking |
| verdict | fix_then_accept | fix_then_accept |

**Blinding audit.** Reviewer A: 54 tool calls, 60 path tokens, 7 outside the packet: a harness
tool-result spill file it was handed by the runtime, `/dev/null`, its scratch directory, the URL
string `json-schema.org` quoted from the schema text, and two relative tokens. Reviewer B: 44 calls,
61 tokens, 8 outside: helper files it wrote under its scratch directory instead of inside the packet
(a procedural deviation from the form, not a blinding breach) and `/dev/null`. **Neither reviewer
read the repository, any experiment directory, the key, or the web.** Rows in
`audit/reviewer-a-reads.txt` and `audit/reviewer-b-reads.txt`.

**Cost against the custody method, same candidate.**

| Method | Model time | Tokens | Records / findings | Independent check |
|---|---|---|---|---|
| Scoped custody review (F) | 3,159 s reviewer + adjudicator | 544,404 reviewer + adjudicator | 72 sealed records, 360 byte-verified citations, 5 supported findings | adjudicator re-verified every citation and control |
| Blind fixed form, A + B | 730 s + 690 s in parallel | 381,577 | 26 findings with quoted evidence, no custody | matcher's mechanical checks (section 4) |

## 3. The findings as filed

Raw lists, before matching. Claims are the reviewers' own and are not yet verified here.

### Reviewer A, 15 findings

| id | severity | charge | kind | file | claim |
|---|---|---|---|---|---|
| A-01 | should_fix | candidate | candidate_introduced_defect | `authored/r2/Plans/forge_integration_contracts.schema.json` | R1 added a new definition `adapter_profile_audit_fidelity` to the common Forge contract schema that nothing references. It is the only unreferenced definition of the 46 in the file, so it validates nothing and is structural filler in a closed common contract t |
| A-02 | should_fix | candidate | candidate_introduced_defect | `authored/r2/Plans/forge_integration_contracts.schema.json` | The new definition pins `schema_id` to the same const `pm.forge.provider_adapter_profile.v1` already owned by `#/$defs/provider_adapter_profile`, but declares an incompatible shape (7 properties, `additionalProperties: false`, and a `review_noun` enum widened  |
| A-03 | should_fix | subject | pre_existing_defect | `authored/r2/Plans/forge_integration_contracts.schema.json` | The common provider capability matrix cannot represent GitLab Dedicated at all, and names GitLab.com with a token the owner does not use. That contradicts GLI-001, whose acceptance criterion is that all three variants stay distinguishable, and the candidate le |
| A-04 | should_fix | subject | pre_existing_defect | `consumers/excerpts/Wiring_Matrix.production.json.md` | Two production wiring rows for provider-neutral cmd.forge.review.* commands are written in GitHub-only vocabulary, so a GitLab MR has no correct generic control there. GLI-005 names Plans/Wiring_Matrix.production.json as an implementation surface, but neither  |
| A-05 | note | subject | inconsistency | `authority/TOPIC_INPUTS.md` | The host-built topic packet asserts the subject declares no SchemaID tokens and delivers zero ContractRef rows, but the subject's section 0 declares one. The owner passage for that SchemaID was therefore never delivered to the candidate, and TOPIC_INPUTS.md it |
| A-06 | should_fix | candidate | candidate_introduced_defect | `authored/r2/Plans/GitLab_Integration.md` | R1 wrote experiment-workspace paths into canonical Plans prose. The lineage paragraph cites `source/Plans/...` copies of the frozen snapshot, including a `source/` copy of the very document it sits in. Those paths exist only inside the sandbox and do not resol |
| A-07 | note | candidate | wrong_reference | `authored/r2/Plans/GitLab_Integration.md` | R2 pins canonical source_lineage of two accepted PlanUnits to sandbox amendment paths rather than to a source identity. The amendment file itself declares it is a development fixture and not a real product approval, so canon now cites a fixture path that will  |
| A-08 | should_fix | candidate | weakened_obligation | `authored/r2/Plans/GitLab_Integration.md` | R2 grew GLI-003's canonical_text by sixteen lines and its acceptance_criteria from three to fifteen, all of them about discussion-census completeness, same-head invalidation and the currentness fence, but left validation_surfaces untouched. The unit's machine- |
| A-09 | note | candidate | inconsistency | `authored/r2/Plans/Forge_Integrations.md` | The common Forge owner now restates GitLab's substantive discussion policy, not only the typed evidence and admission boundary the amendment assigns it, and in the same paragraph declares that policy solely GitLab-owned. The common document therefore both asse |
| A-10 | should_fix | candidate | candidate_introduced_defect | `authored/r2/Plans/GitLab_Integration.md` | R1 made GLI-005 normatively depend on the AutomationBinding / repository_automation / Actions & Pipelines contract, which FGI-012 owns, but did not add FGI-012 to depends_on or the three new exact tokens to preserved_exact_tokens. The candidate's own lineage p |
| A-11 | note | subject | pre_existing_defect | `authored/r2/Plans/sharding_config.json` | Plans/Forge_Integrations.md is a top-level live owner doc bearing FGI-001..FGI-015 yet is not registered in the shard source list, so it has no shard output and the R2 amendment edits to the common owner never reach the derived surface. R1 applied exactly this |
| A-12 | note | candidate | candidate_introduced_defect | `authored/r2/Plans/GitLab_Integration.md` | R1 put Markdown bold markup inside a PlanUnit canonical_text. It is the only one of the nineteen canonical_text blocks across the two authored owner documents that carries display markup, and the emphasis spans a folded line break, so the machine-extracted can |
| A-13 | should_fix | candidate | candidate_introduced_defect | `authored/r2/Plans/forge_integration_contracts.schema.json` | R1 added GitLab variant-to-host_class and signed-catalog enforcement to a shape in the common Forge-owned schema, and neither revision gave that shape any coverage in its owner document. The GitLab owner explicitly disclaims defining common forge shapes, and R |
| A-14 | note | subject | pre_existing_defect | `authored/r2/Plans/Forge_Integrations.md` | The common forge-binding requirements row for GitLab recognizes only GitLab.com and self-managed, omitting the Dedicated variant that GLI-001 requires to stay distinguishable. Unrepaired in both revisions; this is the second place, with the capability matrix i |
| A-15 | note | unknown | record_or_receipt | `derived/CENSUS.md` | A complete plan-migration run directory appears between R1 and R2, together with a changed current_run.json. Its ten artifacts are exactly the PDS-010 lossless-migration set that `pm-plan-migration.py snapshot-current` writes, and that command is on the task's |

### Reviewer B, 11 findings

| id | severity | charge | kind | file | claim |
|---|---|---|---|---|---|
| B-01 | should_fix | candidate | weakened_obligation | `authored/r2/Plans/GitLab_Integration.md` | The amendment's G05 visible-presentation requirement was written only into section 4 body prose; GLI-005, the PlanUnit that owns visible placement, vocabulary, health and acceptance, is byte-identical to R1. The obligation is therefore carried by no addressabl |
| B-02 | should_fix | candidate | unauthorized_change | `authored/r2/Plans/forge_integration_contracts.schema.json` | R1 added a new provider-neutral object definition to the Forge-owned common schema that nothing references and no fixture exercises, in an artifact the GitLab owner explicitly disclaims defining. |
| B-03 | should_fix | candidate | candidate_introduced_defect | `authored/r2/Plans/forge_integration_contracts.schema.json` | The definition R1 added cannot name a GitLab Dedicated profile: its target_profile_id enum carries gitlab_saas and gitlab_self_managed but no gitlab_dedicated, while its own host_class enum offers 'dedicated'. It also uses gitlab_saas where the GitLab owner's  |
| B-04 | should_fix | subject | pre_existing_defect | `consumers/excerpts/Wiring_Matrix.production.json.md` | Production wiring binds the provider-neutral cmd.forge.review.create and cmd.forge.review.merge to GitHub-only UI labels and GitHub-only disabled conditions, so a GitLab review control would be labeled 'pull request'. This directly contradicts GLI-003 and GLI- |
| B-05 | should_fix | candidate | weakened_obligation | `authored/r2/Plans/GitLab_Integration.md` | R2 added twelve acceptance criteria and a large new policy block to GLI-003 but left validation_surfaces and negative_constraints at their base values, so none of the new census, same-head-invalidation or final-fence criteria is bound to a validation surface o |
| B-06 | should_fix | candidate | inconsistency | `authored/r2/Plans/GitLab_Integration.md` | R1 made the independent AutomationBinding and the single repository_automation / Actions & Pipelines shell normative in GLI-005 and section 4, but left GLI-004, the unit that owns GitLab pipelines and jobs, with no automation-binding obligation, no matching ne |
| B-07 | should_fix | candidate | weakened_obligation | `authored/r2/Plans/Forge_Integrations.md` | R2 makes an authoritative complete discussion census, completeness evidence and a final-fence capability mandatory for cmd.forge.review.mark_ready admission, while recording a no-change decision on the common schema whose request and target objects are both cl |
| B-08 | note | subject | pre_existing_defect | `authored/base/Plans/GitLab_Integration.md` | The section 8 lineage roll-up names only SCM-05, UI-01, UI-03 and CT-01..02 while the document's own PlanUnits cite SCM-012..017, ORI-03 and ORI-04; the candidate rewrote section 8 in both revisions without repairing the omission. |
| B-09 | note | subject | pre_existing_defect | `authored/base/Plans/GitLab_Integration.md` | GLI-005's preserved exact tokens 'Ready with limits', 'Needs attention', 'Not available' and 'Connect GitLab' occur exactly once each in the whole document, inside the token list itself, and are never defined or used, so the visible health vocabulary the unit  |
| B-10 | note | subject | wrong_reference | `authority/TOPIC_INPUTS.md` | The host packet asserts that the subject declares no SchemaID token and delivers zero ContractRef rows, but the subject's section 0 declares SchemaID:pm.forge.provider_adapter_profile.v1; the owner passage for that schema id was therefore never delivered to th |
| B-11 | note | candidate | inconsistency | `authored/r2/Plans/Forge_Integrations.md` | FGI-004's new canonical_text names GLI-003 normatively, embedding a provider-owned policy reference inside a provider-neutral common unit, while FGI-004's depends_on and unblocks are unchanged, so the dependency index records no edge for that reference and the |

**Read at a glance, before the matcher:** both reviewers found the scoped review's one
candidate-introduced defect (A-01 and A-02; B-02 and B-03: the orphan `adapter_profile_audit_fidelity`
definition and its missing dedicated-instance variant), both found the two pull-request wiring rows
(A-04, B-04), A found the sharding registration gap (A-11), and **both independently found a harness
packager defect the custody review did not raise** (A-05, B-10): the topic packet tells the
candidate the subject names no SchemaID token and delivers zero ContractRef rows, while the subject's
section 0 declares `SchemaID:pm.forge.provider_adapter_profile.v1`. Verified by the coordinator
against the packet and the harness: `pwflow/topic_inputs.py` collects ContractRefs only from
PlanUnit `preserved_contractrefs` (line 200) and never scans the document-level `ContractRef:` line,
so the schema owner's passage was never delivered to a candidate whose task was to change that
schema. Filed as harness item B12. Neither reviewer rated anything blocking; the custody review
rated the orphan definition blocking.

## 4. Matcher results

A third Opus agent (784 s, 189,060 tokens) read only the two findings files, the sealed key and the
reviewers' packet, and wrote one row per finding with a mechanical check it performed itself
(`packets/matcher/matches.jsonl`). **All 26 findings are confirmed on their facts**: every count,
quote, `$ref` search and byte comparison the reviewers stated reproduces. What the matcher then
judged is whether the confirmed fact is a defect, and whose.

| | |
|---|---|
| findings | 26 (A 15, B 11) |
| distinct issues | 22; **4 raised by both reviewers** (F1, F2, the U2 trap, the packager defect) |
| matched to the key | F1: A-04, B-04 · F2: A-01, A-02, B-02, B-03 · F5: A-11 · U1: B-07 · U2: A-08, B-05 |
| key items reachable but found by neither | none (F3 and F4 were unreachable by construction) |
| real findings not in the key | **10**: A-03, A-05, A-06, A-10, A-12, A-13, A-14, B-08, B-09, B-10 |
| unclear (facts right, defect status arguable) | 6: A-07, A-09, A-15, B-01, B-06, B-11 |
| false findings | **3**: A-08, B-05 (the key's U2), B-07 (the key's U1) |
| charge correct | 24 of 26; the two errors are A-05 and B-10, charged to the subject where the defective bytes are the harness's own packet |
| by type | candidate-introduced 5, pre-existing 6, inconsistency 4, lost or weakened obligation 4, naming or reference 3, record or receipt 3, task obligation missing 1 |

The ten real findings the custody review did not raise:

- **Candidate-charged, correctly:** A-06 run-local sandbox paths (`source/Plans/...`) written into
  canonical prose; A-10 GLI-005 made to depend normatively on the Actions and Pipelines contract
  without carrying the dependency; A-12 Markdown bold inside a PlanUnit `canonical_text`, the only
  such block in the corpus; A-13 variant-to-host-class enforcement tightened in the common schema
  with nothing recorded in the Forge owner, against the task's own rule.
- **Subject-charged, correctly:** A-03 and A-14, the common capability matrix and the common
  forge-binding row cannot represent GitLab Dedicated although GLI-001 preserves it as an exact
  token; B-08 the section-8 lineage roll-up names units the document's PlanUnits do not cite;
  B-09 GLI-005 preserves four health-vocabulary tokens that occur nowhere else.
- **Harness-charged (mis-charged as subject by both):** A-05 and B-10, the topic packager never
  scans the document-level `ContractRef:` line, so the schema the task was about had its owner
  passage withheld. Verified by the coordinator against `pwflow/topic_inputs.py`; filed as B12.

The three false findings are instructive: each is one of the custody review's **bounded
unknowns**, where that reviewer recorded that the committed bytes cannot establish the typed
evidence mapping and declined to call it a defect. The blind form has no UNKNOWN verdict, so both
blind reviewers turned the same uncertainty into a "weakened obligation" claim; the matcher found
the task text (TASK.md lines 202–203) explicitly permits what they flagged.

## 5. What the comparison shows

1. **Recall on the thing that matters.** Both blind reviewers found the candidate's one
   introduced defect, in two independent halves each, in about twelve minutes, at roughly a third
   of the custody reviewer's tokens each. They also found the wiring rows and the registration
   gap. Nothing reachable in the key was missed by both.
2. **Residue.** The cheap form found ten more real defects, four of them the candidate's own and
   correctly charged, that a one-hour custody review with 360 verified citations did not raise. The
   custody reviewer spent its hour proving what it found; the blind reviewers spent theirs finding.
3. **Severity is not calibrated by the form.** Neither blind reviewer rated anything blocking,
   including the defect the custody adjudicator rated blocking. The acceptance rule turns on that
   word, so a blind form cannot feed DL-066 without a severity and charge adjudication step.
4. **Restraint is not in the form either.** Three findings were false for one reason: the form
   forces a claim where the custody method allowed a bounded unknown. Adding a permitted
   `bounded_unknown` kind would remove that class.
5. **Reviews still do not converge.** Four shared issues across 22: the second reviewer adds as
   much as it confirms, exactly as the Jev pilot measured. One review's findings are a sample.
6. **Cost.** Blind A and B in parallel: 12.2 min wall, 381,577 tokens. Matcher: 13.1 min,
   189,060 tokens. Custody: 52.7 min reviewer wall, 544,404 tokens, plus an adjudicator of
   comparable size, for 5 findings with byte-verified custody.

What this recommends for the production review step, for Jared to weigh: the *one scoped review*
DL-066 requires can be two blind fixed-form reviewers in parallel followed by one adjudicator that
performs the mechanical checks, assigns severity and charge from the diffs, and keys the findings,
at about twenty-five minutes and under 600K tokens; the custody host's byte citations are then
computed by the adjudicator for the findings that survive, rather than by every reviewer for
every claim. This is a proposal from one candidate's data, not a measured method; it needs the
same treatment the custody method got (fresh controls, a sealed key, a second subject) before it
replaces anything.

## 6. Where everything is

- Package: `/home/sittingmongoose/PM-Experiments/r7a-blind-review-20260918-v1/` — `README.md`,
  `key/` (sealed 07:03:20Z), `packets/reviewer-a`, `packets/reviewer-b` (findings.jsonl in
  each), `packets/matcher/matches.jsonl`, `audit/` (blinding audits and costs), `tools/`.
- Reference: `reports/F_R7A_SCOPED_REVIEW_REPORT.md` section 4 and the adjudication under
  `gitlab-r7a-scoped-review-20260917-v1/adjudication-001/`.
- Harness follow-up: `B12_PACKAGER_CONTRACTREF_BRIEF.md`.
- This report is mirrored to `/mnt/Cursor/PuppetMaster-Evidence/tests/harness-latency-20260916/reports/`.
