# Recovery Audit Report (Docs)

**Audit target:** current repo state at commit `91dca72`.

## Summary counts

**Scanned scope:** `Plans/` (55 files) + `README.md` + `AGENTS.md` = **57 files**.

| Status | Count |
|---|---:|
| OK | 34 |
| Needs Fix | 23 |
| Missing | 0 |
| Corrupted | 0 |

**Plans inventory (by type):** json=3, json-schema=8, jsonl=1, markdown=43

## Onboarding docs status

- `README.md`: **OK**
- `AGENTS.md`: **Needs Fix** — Naming noncompliance (legacy naming) at lines [40]

## Plans file-by-file audit table

| Path | Type | Status | Checks | Notes |
|---|---|---|---|---|
| `Plans/00-plans-index.md` | markdown | Needs Fix | D | Missing acceptance/verification section |
| `Plans/Architecture_Invariants.md` | markdown | Needs Fix | D | Missing acceptance/verification section |
| `Plans/BinaryLocator_Spec.md` | markdown | OK | OK | — |
| `Plans/CLI_Bridged_Providers.md` | markdown | OK | OK | — |
| `Plans/Contracts_V0.md` | markdown | Needs Fix | D | Missing acceptance/verification section |
| `Plans/Crosswalk.md` | markdown | Needs Fix | D | Missing acceptance/verification section |
| `Plans/DRY_Rules.md` | markdown | Needs Fix | CD | Unresolved placeholder markers at lines [52] (line 98 placeholder resolved 2026-02-23) / Missing acceptance/verification section |
| `Plans/Decision_Log.md` | markdown | Needs Fix | D | Missing acceptance/verification section |
| `Plans/Decision_Policy.md` | markdown | Needs Fix | D | Missing acceptance/verification section (SSOT gap resolved 2026-02-23: PolicyRule:no_secrets_in_storage added) |
| `Plans/FileManager.md` | markdown | OK | OK | — |
| `Plans/FileSafe.md` | markdown | Needs Fix | C | Unresolved placeholder markers at lines [1306] |
| `Plans/FinalGUISpec.md` | markdown | OK | OK | — |
| `Plans/GitHub_API_Auth_and_Flows.md` | markdown | OK | OK | — |
| `Plans/Glossary.md` | markdown | OK | OK | SSOT gap resolved 2026-02-23: DRYRules, PatchPipeline, SessionStore primitives added to §6. |
| `Plans/LSPSupport.md` | markdown | Needs Fix | E | Open-questions heading present at lines [298] |
| `Plans/MiscPlan.md` | markdown | Needs Fix | F | No SSOT references detected (DRY risk) |
| `Plans/Multi-Account.md` | markdown | Needs Fix | DF | Missing acceptance/verification section / No SSOT references detected (DRY risk) |
| `Plans/OpenCode_Deep_Extraction.md` | markdown | Needs Fix | F | No SSOT references detected (DRY risk) |
| `Plans/Progression_Gates.md` | markdown | Needs Fix | C | Unresolved placeholder markers at lines [85] |
| `Plans/Project_Output_Artifacts.md` | markdown | OK | OK | — |
| `Plans/RECOVERY_AUDIT_REPORT.md` | markdown | OK | OK | — |
| `Plans/RECOVERY_FIX_QUEUE.md` | markdown | OK | OK | — |
| `Plans/Rebrand_Chunked_Playbook.md` | markdown | Needs Fix | AF | Naming noncompliance (legacy naming) at lines [128, 134, 247, 264, 281, 315, 320, 364, 380, 396]... / Naming drift (no-space variant) at lines [179, 180, 185, 381, 385] / No SSOT references detected (DRY risk) |
| `Plans/Spec_Lock.json` | json | OK | OK | — |
| `Plans/Tools.md` | markdown | OK | OK | SSOT gap resolved 2026-02-23: ToolID:GitHubApiTool added to §3.6. |
| `Plans/UI_Command_Catalog.md` | markdown | Needs Fix | D | Missing acceptance/verification section |
| `Plans/WorktreeGitImprovement.md` | markdown | Needs Fix | F | No SSOT references detected (DRY risk) |
| `Plans/acceptance_manifest.schema.json` | json-schema | OK | OK | — |
| `Plans/agent-rules-context.md` | markdown | Needs Fix | DF | Missing acceptance/verification section / No SSOT references detected (DRY risk) |
| `Plans/assistant-chat-design.md` | markdown | OK | OK | — |
| `Plans/auto_decisions.jsonl` | jsonl | OK | OK | — |
| `Plans/auto_decisions.schema.json` | json-schema | OK | OK | — |
| `Plans/chain-wizard-flexibility.md` | markdown | OK | OK | — |
| `Plans/change_budget.schema.json` | json-schema | OK | OK | — |
| `Plans/contracts_index.schema.json` | json-schema | OK | OK | — |
| `Plans/evidence.schema.json` | json-schema | OK | OK | — |
| `Plans/feature-list.md` | markdown | OK | OK | — |
| `Plans/human-in-the-loop.md` | markdown | OK | OK | — |
| `Plans/interview-subagent-integration.md` | markdown | OK | OK | — |
| `Plans/newfeatures.md` | markdown | Needs Fix | AF | Naming noncompliance (legacy naming) at lines [7] / No SSOT references detected (DRY risk) |
| `Plans/newtools.md` | markdown | Needs Fix | F | No SSOT references detected (DRY risk) |
| `Plans/orchestrator-subagent-integration.md` | markdown | OK | OK | — |
| `Plans/plan_graph.json` | json | OK | OK | — |
| `Plans/plan_graph.schema.json` | json-schema | OK | OK | — |
| `Plans/project_plan_graph_index.schema.json` | json-schema | OK | OK | — |
| `Plans/project_plan_node.schema.json` | json-schema | OK | OK | — |
| `Plans/rebrand.md` | markdown | Needs Fix | AF | Naming noncompliance (legacy naming) at lines [21, 24, 62, 65, 85, 103, 116, 179, 180, 184]... / Naming drift (no-space variant) at lines [140, 257] / No SSOT references detected (DRY risk) |
| `Plans/rebrand_chunks.json` | json | OK | OK | — |
| `Plans/rewrite-tie-in-memo.md` | markdown | Needs Fix | DF | Missing acceptance/verification section / No SSOT references detected (DRY risk) |
| `Plans/storage-plan.md` | markdown | OK | OK | — |
| `Plans/usage-feature.md` | markdown | Needs Fix | DF | Missing acceptance/verification section / No SSOT references detected (DRY risk) |

**Checks legend:**
- **A** Naming compliance (must be “Puppet Master” only; legacy naming must not appear)
- **B** Path hygiene (filesystem path/link issues)
- **C** Placeholder elimination (unresolved placeholder markers and placeholder ContractRef targets)
- **D** Executability (missing acceptance/verification section)
- **E** Autonomy (open-questions heading/section)
- **F** DRY enforcement risk (SSOT references not detected)
- **S** SSOT coverage gap (missing/invalid canonical definitions referenced elsewhere)

## Top 20 Priority Fixes

1. `Plans/Decision_Policy.md` — ~~SSOT coverage gap~~ (resolved 2026-02-23) / Missing acceptance/verification section
2. `Plans/DRY_Rules.md` — Unresolved placeholder markers at lines [52] (line 98 resolved 2026-02-23) / Missing acceptance/verification section
3. `Plans/Contracts_V0.md` — Missing acceptance/verification section
4. `Plans/Architecture_Invariants.md` — Missing acceptance/verification section
5. `Plans/UI_Command_Catalog.md` — Missing acceptance/verification section
6. ~~`Plans/Glossary.md` — SSOT coverage gap~~ ✅ Resolved 2026-02-23: primitives added to §6.
7. ~~`Plans/Tools.md` — SSOT coverage gap~~ ✅ Resolved 2026-02-23: ToolID:GitHubApiTool added to §3.6.
8. `Plans/Progression_Gates.md` — Unresolved placeholder markers at lines [85]
9. `Plans/FileSafe.md` — Unresolved placeholder markers at lines [1306]
10. `Plans/LSPSupport.md` — Open-questions heading present at lines [298]
11. `Plans/Rebrand_Chunked_Playbook.md` — Naming noncompliance (legacy naming) at lines [128, 134, 247, 264, 281, 315, 320, 364, 380, 396]... / Naming drift (no-space variant) at lines [179, 180, 185, 381, 385] / No SSOT references detected (DRY risk)
12. `Plans/rebrand.md` — Naming noncompliance (legacy naming) at lines [21, 24, 62, 65, 85, 103, 116, 179, 180, 184]... / Naming drift (no-space variant) at lines [140, 257] / No SSOT references detected (DRY risk)
13. `Plans/newfeatures.md` — Naming noncompliance (legacy naming) at lines [7] / No SSOT references detected (DRY risk)
14. `AGENTS.md` — Naming noncompliance (legacy naming) at lines [40]
15. `Plans/usage-feature.md` — Missing acceptance/verification section / No SSOT references detected (DRY risk)
16. `Plans/newtools.md` — No SSOT references detected (DRY risk)
17. `Plans/00-plans-index.md` — Missing acceptance/verification section
18. `Plans/Crosswalk.md` — Missing acceptance/verification section
19. `Plans/Decision_Log.md` — Missing acceptance/verification section
20. `Plans/MiscPlan.md` — No SSOT references detected (DRY risk)

## SSOT Coverage

### Missing definitions / invalid references (from ContractRef coverage)
- ConfigKey missing from SSOT docs: `github.api_version`. **Resolved 2026-02-23:** Added to GitHub_API_Auth_and_Flows.md with default, redb storage, and override options.
- PolicyRule referenced but not defined in Decision Policy: `no_secrets_in_storage`. **Resolved 2026-02-23:** Added to Decision_Policy.md with scope, rule, rationale, and cross-references.
- ToolID referenced but not defined in Tools SSOT: `GitHubApiTool`. **Resolved 2026-02-23:** Added to Tools.md §3.6 with purpose, rules, owner, and ContractRef.
- Primitive identifiers referenced but not defined in Contracts or Glossary: `DRYRules`, `PatchPipeline`, `SessionStore`. **Resolved 2026-02-23:** Added to Glossary.md §6 with ContractRef annotations.
- SchemaID references invalid file anchors/paths: `Spec_Lock.json#auth_model`, `Spec_Lock.json#github_operations`. **Resolved 2026-02-23:** Both anchors verified present in Spec_Lock.json (auth_model at line 40, github_operations at line 34).
- Angle-bracket ContractRef tokens were detected and replaced with real targets (see `Plans/DRY_Rules.md`). **Resolved 2026-02-23:** Replaced angle-bracket token at line ~98 with actual references.

### Contradictions / drift-by-synonym (high-signal)
- **Namespace collision risk:** `cmd.*` can appear in non-UI-command contexts; keep UI command IDs exclusively for `cmd.<domain>.<action>`.
- **Namespace collision risk:** `event.*` often appears as UI/DOM event fields (e.g., `event.target`); avoid using `event.*` as a persisted event namespace — prefer `pm.event.*` for schemas and explicit `EventType:*` strings.

## Special Topics Coverage

### Project output paths (user projects)
- Sharded plan graph paths are defined/referenced in: `Plans/Project_Output_Artifacts.md`, `Plans/chain-wizard-flexibility.md`, `Plans/interview-subagent-integration.md`, `Plans/orchestrator-subagent-integration.md`.

### Seglog canonical artifact semantics
- Seglog artifact canonicalization semantics (full content, chunking, hashes, logical paths, filesystem export/cache) appear in: `Plans/Project_Output_Artifacts.md`, `Plans/chain-wizard-flexibility.md`, `Plans/interview-subagent-integration.md`, `Plans/newfeatures.md`, `Plans/orchestrator-subagent-integration.md`.

## Path Hygiene

### Legacy plan folder prefix
- No legacy plan folder prefix occurrences were found in filesystem path/link contexts (good).
- Remaining non-filesystem occurrences exist (conceptual labels); locations: `Plans/assistant-chat-design.md:28`, `Plans/assistant-chat-design.md:483`, `Plans/feature-list.md:201`, `Plans/newtools.md:199`, `Plans/newtools.md:207`, `Plans/orchestrator-subagent-integration.md:1168`.

## Verification

The following checks are safe to run from repo root (they do not require any legacy naming strings):

```bash
# Legacy naming drift (acronym-prefixed variant)
rg -n "\b[A-Z]{2,}[-\s]+Puppet Master\b" Plans AGENTS.md README.md || true

# No-space naming variant (constructed at runtime; does not embed the variant string)
python3 - <<'PY'
from pathlib import Path

needle = ''.join(map(chr, [80, 117, 112, 112, 101, 116, 77, 97, 115, 116, 101, 114]))
roots = [Path('AGENTS.md'), Path('README.md'), Path('Plans')]

hits = []
for r in roots:
    if r.is_dir():
        for f in sorted(r.rglob('*.md')):
            if needle in f.read_text(encoding='utf-8', errors='replace'):
                hits.append(str(f))
    elif r.exists():
        if needle in r.read_text(encoding='utf-8', errors='replace'):
            hits.append(str(r))

print('\n'.join(hits))
PY

# Open-questions headings (autonomy)
rg -n "^\s{0,3}#+\s+.*open questions\b" Plans -i || true

# ContractRef placeholder anchors
rg -n "ContractRef:\s*<" Plans || true
```

## Correction Note (2026-02-23)

This report is amended to correct an implementation-summary accuracy issue discovered during post-audit review:

- The prior summary statement that existing-file edits were "append-only" was inaccurate for the 2026-02-23 widget/orchestrator/doc pass.
- Non-tail edits were present in:
  - `Plans/usage-feature.md` (line 15 area)
  - `Plans/assistant-chat-design.md` (line 96 area)
  - `Plans/FinalGUISpec.md` (line 701 area)
  - `Plans/FinalGUISpec.md` (line 1130 area)
  - `Plans/00-plans-index.md` (line 52 area)
- Accepted remediation choice for this cycle: **claim correction only**. We are not performing a retroactive append-only rewrite for those files.

ContractRef: PolicyRule:Decision_Policy.md§2
