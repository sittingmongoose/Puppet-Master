# Working Ledger

## Work Item
w-20260330-191149

## Mode
audit

## Topic / Scope
Reconciliation audit of previous pipeline runs (`Plans/.pipeline/runs/`). Verify that findings, designs, and specifications produced during prior runs were actually incorporated into the Plans docs as real, substantive content — not left as stubs, placeholders, or shallow summaries.

Exclusions (still in progress):
- w-20260328-192850/working_ledger
- w-20260329-235630
- w-20260328-192905

## Objective
- Inventory all completed previous runs and their working ledgers
- For each run, identify what it was supposed to produce or modify in Plans docs
- Verify the corresponding Plans doc sections contain real, buildable content — not stubs
- Surface any gaps where run findings were lost, compressed, or never written

## Constraints / Non-Goals
- Do NOT edit any planning docs during this audit
- Do NOT treat the ledger as canonical or cite it in planning docs
- This is a verification audit, not a rewrite
- Focus on substance (buildability, completeness) not formatting

## Key Facts and Findings

### Pipeline statistics
- 59 runs scanned, ~1040 raw doc_intents extracted
- Deduplicated to 380 unique intents across 57 Plans docs
- 15 working ledgers audited (68 chunks, ~40K lines total)
- Phase 2A: 57 docs audited by Opus 4.6 subagents (1 doc per agent)
- Phase 2B: 8 GPT 5.4 verification agents on 18 gap docs
- Phase 2C: 10 Opus 4.6 ledger agents + 30 explore agents + 4 unaudited-docs agents
- 100+ agents launched total across all phases; zero failures

### Phase 2A aggregate results (Opus 4.6 — doc_intents pass)
- PRESENT: ~266, SUPERSEDED: ~61, MISSING: 39, PARTIAL: 14, STUB: 4

### Phase 2B cross-model reconciliation (GPT 5.4 verification)
GPT 5.4 verified all 18 gap docs. 12 disagreements (all severity upgrades):
- 8 reclassified MISSING → PARTIAL
- 2 reclassified MISSING → SUPERSEDED
- 2 reclassified PARTIAL → PRESENT

### Phase 2A+2B RECONCILED TALLIES (doc_intents pass)
- PRESENT: ~270 (70%), SUPERSEDED: ~63 (16%), MISSING: 31 (8%), PARTIAL: 20 (5%), STUB: 4 (1%)

### Phase 2C: Ledger-based deep reconciliation
Checked ~345 items across 15 working ledgers against canonical Plans docs.
- ADDRESSED: ~239 (69%)
- PARTIALLY_ADDRESSED: ~46 (13%)
- NOT_ADDRESSED: ~53 (15%)
- UNCLEAR: ~7 (2%)

Breakdown by ledger group:
- w-20260312-203855 (monster): 89 items → 41/23/24/1
- w-20260316-160450 (chat): 39 items → 21/6/12
- w-20260320-170511 + w-20260312-160857 (providers/GHA/Docker): 75 items → 55/8/12
- w-20260318-160350 + w-20260326-015830 + w-20260320-164907 (terminal/worktrees/debug): 70 items → 52/7/7/4
- w-20260313-183219 + w-20260313-152345 + w-20260317-164124 + w-20260318-153036 (small batch): 36 items → 25/6/2/2
- w-20260323-192127 + w-20260328-192938 + w-20260317-181906 (subagents/grep/browser): 21 items → 21/0/0 (PERFECT)
- w-20260318-153036 + w-20260319-030558 (file mgr/editor): 36 items → 34/1/1

### Perfectly reconciled areas (no remediation needed)
- Worktree thread binding (w-20260326-015830): 19/19 PERFECT
- Browser capabilities (w-20260317-181906): 8/8 PERFECT
- Subagent/interview research (w-20260323-192127): 8/8 PERFECT
- Instant grep (w-20260328-192938): 5/5 + 5 FID spot checks PERFECT
- Crosswalk.md: CLEAN, Decision_Log.md: CLEAN, DRY_Rules.md: CLEAN

### Root cause patterns
1. **Full-doc replace_section**: r-20260312-203855-01 used H1-level replace_section, wiping accumulated addenda
2. **Canon-collapse rewrites**: feature-list.md, newfeatures.md replaced detailed content with terse summaries
3. **Missing anchor targets**: insert_after intents targeted headings that never existed
4. **Anchorless/EOF appends never placed**: file_end append intents never executed
5. **Supersession detail loss**: later run replaces section, specific sub-details lost
6. **Tier→Node migration incomplete**: 8+ docs still embed tier-era terminology contradicting node/package/lane model
7. **Ledger content never packetized**: some ledger findings never turned into doc_intents
8. **Addenda-body split-brain**: orchestrator-subagent-integration.md has new model in addenda, old model in body (174 tier refs)

