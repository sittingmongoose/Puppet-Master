# Recovery Audit Report (Docs)

## Summary counts

**Scanned scope:** `Plans/` (47 files) + `README.md` + `AGENTS.md` = **49 files**.

| Status | Count |
|---|---:|
| OK | 13 |
| Needs Fix | 36 |
| Missing | 0 |
| Corrupted | 0 |

**Plans inventory (by type):** json=3, json-schema=3, jsonl=1, markdown=40

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
| `Plans/DRY_Rules.md` | markdown | Needs Fix | CD | Unresolved placeholder markers at lines [52, 96] / Missing acceptance/verification section |
| `Plans/Decision_Log.md` | markdown | Needs Fix | D | Missing acceptance/verification section |
| `Plans/Decision_Policy.md` | markdown | Needs Fix | D | Missing acceptance/verification section |
| `Plans/FileManager.md` | markdown | OK | OK | — |
| `Plans/FileSafe.md` | markdown | Needs Fix | C | Unresolved placeholder markers at lines [1306, 1432, 1433] |
| `Plans/FinalGUISpec.md` | markdown | OK | OK | — |
| `Plans/GitHub_API_Auth_and_Flows.md` | markdown | Needs Fix | S | SSOT coverage gap: references ConfigKey `github.api_version` and PolicyRule `no_secrets_in_storage`, but Decision Policy does not currently define them. |
| `Plans/Glossary.md` | markdown | Needs Fix | S | SSOT coverage gap: missing primitive definitions referenced by ContractRef (`DRYRules`, `PatchPipeline`, `SessionStore`). |
| `Plans/LSPSupport.md` | markdown | Needs Fix | E | Open-questions heading present at lines [297] |
| `Plans/MiscPlan.md` | markdown | Needs Fix | F | No SSOT references detected (DRY risk) |
| `Plans/Multi-Account.md` | markdown | Needs Fix | DF | Missing acceptance/verification section / No SSOT references detected (DRY risk) |
| `Plans/OpenCode_Deep_Extraction.md` | markdown | Needs Fix | F | No SSOT references detected (DRY risk) |
| `Plans/PlanPathAudit_Report.md` | markdown | Needs Fix | D | Missing acceptance/verification section |
| `Plans/Progression_Gates.md` | markdown | OK | OK | — |
| `Plans/Rebrand_Chunked_Playbook.md` | markdown | Needs Fix | AF | Naming noncompliance (legacy naming) at lines [128, 134, 247, 264, 281, 315, 320, 364, 380, 396]... / Naming drift (no-space variant) at lines [179, 180, 185, 381, 385] / No SSOT references detected (DRY risk) |
| `Plans/Spec_Lock.json` | json | OK | OK | — |
| `Plans/Tools.md` | markdown | Needs Fix | S | SSOT coverage gap: missing ToolID `GitHubApiTool` definition referenced by `Plans/Crosswalk.md`. |
| `Plans/UI_Command_Catalog.md` | markdown | Needs Fix | D | Missing acceptance/verification section |
| `Plans/WorktreeGitImprovement.md` | markdown | Needs Fix | F | No SSOT references detected (DRY risk) |
| `Plans/agent-rules-context.md` | markdown | Needs Fix | DF | Missing acceptance/verification section / No SSOT references detected (DRY risk) |
| `Plans/assistant-chat-design.md` | markdown | OK | OK | — |
| `Plans/auto_decisions.jsonl` | jsonl | OK | OK | File contains 0 JSONL records (empty) |
| `Plans/chain-wizard-flexibility.md` | markdown | Needs Fix | AF | Naming noncompliance (legacy naming) at lines [723] / No SSOT references detected (DRY risk) |
| `Plans/change_budget.schema.json` | json-schema | OK | OK | — |
| `Plans/evidence.schema.json` | json-schema | OK | OK | — |
| `Plans/feature-list.md` | markdown | OK | OK | — |
| `Plans/geminigui-spec.md` | markdown | Needs Fix | D | Missing acceptance/verification section |
| `Plans/gui-layout-architecture.md` | markdown | Needs Fix | D | Missing acceptance/verification section |
| `Plans/human-in-the-loop.md` | markdown | Needs Fix | F | No SSOT references detected (DRY risk) |
| `Plans/interview-subagent-integration.md` | markdown | Needs Fix | S | Special-topic gap: missing user-project plan graph shard paths under `.puppet-master/project/plan_graph/...`. |
| `Plans/newfeatures.md` | markdown | Needs Fix | AF | Naming noncompliance (legacy naming) at lines [7] / No SSOT references detected (DRY risk) |
| `Plans/newtools.md` | markdown | Needs Fix | F | No SSOT references detected (DRY risk) |
| `Plans/opusgui-redesign-spec.md` | markdown | Needs Fix | D | Missing acceptance/verification section |
| `Plans/orchestrator-subagent-integration.md` | markdown | Needs Fix | C | Unresolved placeholder markers at lines [4873, 5273] |
| `Plans/plan_graph.json` | json | Needs Fix | S | Special-topic gap: plan-graph doc describes repo `Plans/` graph only; missing user-project sharded plan graph paths and schema expectations. |
| `Plans/plan_graph.schema.json` | json-schema | Needs Fix | S | Special-topic gap: schema does not cover user-project sharded plan graph (`index.json`, `nodes/<id>.json`, optional `edges.json`). |
| `Plans/rebrand.md` | markdown | Needs Fix | AF | Naming noncompliance (legacy naming) at lines [21, 24, 62, 65, 85, 103, 116, 179, 180, 184]... / Naming drift (no-space variant) at lines [140, 257] / No SSOT references detected (DRY risk) |
| `Plans/rebrand_chunks.json` | json | OK | OK | — |
| `Plans/rewrite-tie-in-memo.md` | markdown | Needs Fix | DF | Missing acceptance/verification section / No SSOT references detected (DRY risk) |
| `Plans/storage-plan.md` | markdown | Needs Fix | S | Special-topic gap: lacks explicit artifact-content canonicalization semantics (chunking/hashes/logical paths) and does not mention user-project plan graph shard paths. |
| `Plans/usage-feature.md` | markdown | Needs Fix | CDF | Unresolved placeholder markers at lines [156, 187, 191, 478] / Missing acceptance/verification section / No SSOT references detected (DRY risk) |

**Checks legend:**
- **A** Naming compliance (must be “Puppet Master” only; legacy naming must not appear)
- **B** Path hygiene (filesystem path/link issues)
- **C** Placeholder elimination (TODO/TBD/FIXME/placeholder ContractRef)
- **D** Executability (missing acceptance/verification section)
- **E** Autonomy (open-questions heading/section)
- **F** DRY enforcement risk (SSOT references not detected)
- **S** Special-topic / SSOT coverage gap (content missing vs required baseline)

## Top 20 Priority Fixes

1. `Plans/Decision_Policy.md` — Missing acceptance/verification section
2. `Plans/DRY_Rules.md` — Unresolved placeholder markers at lines [52, 96] / Missing acceptance/verification section
3. `Plans/Contracts_V0.md` — Missing acceptance/verification section
4. `Plans/Architecture_Invariants.md` — Missing acceptance/verification section
5. `Plans/UI_Command_Catalog.md` — Missing acceptance/verification section
6. `Plans/Glossary.md` — SSOT coverage gap: missing primitive definitions referenced by ContractRef (`DRYRules`, `PatchPipeline`, `SessionStore`).
7. `Plans/Tools.md` — SSOT coverage gap: missing ToolID `GitHubApiTool` definition referenced by `Plans/Crosswalk.md`.
8. `Plans/plan_graph.schema.json` — Special-topic gap: schema does not cover user-project sharded plan graph (`index.json`, `nodes/<id>.json`, optional `edges.json`).
9. `Plans/plan_graph.json` — Special-topic gap: plan-graph doc describes repo `Plans/` graph only; missing user-project sharded plan graph paths and schema expectations.
10. `Plans/interview-subagent-integration.md` — Special-topic gap: missing user-project plan graph shard paths under `.puppet-master/project/plan_graph/...`.
11. `Plans/storage-plan.md` — Special-topic gap: lacks explicit artifact-content canonicalization semantics (chunking/hashes/logical paths) and does not mention user-project plan graph shard paths.
12. `Plans/GitHub_API_Auth_and_Flows.md` — SSOT coverage gap: references ConfigKey `github.api_version` and PolicyRule `no_secrets_in_storage`, but Decision Policy does not currently define them.
13. `Plans/Rebrand_Chunked_Playbook.md` — Naming noncompliance (legacy naming) at lines [128, 134, 247, 264, 281, 315, 320, 364, 380, 396]... / Naming drift (no-space variant) at lines [179, 180, 185, 381, 385] / No SSOT references detected (DRY risk)
14. `Plans/rebrand.md` — Naming noncompliance (legacy naming) at lines [21, 24, 62, 65, 85, 103, 116, 179, 180, 184]... / Naming drift (no-space variant) at lines [140, 257] / No SSOT references detected (DRY risk)
15. `Plans/newfeatures.md` — Naming noncompliance (legacy naming) at lines [7] / No SSOT references detected (DRY risk)
16. `Plans/chain-wizard-flexibility.md` — Naming noncompliance (legacy naming) at lines [723] / No SSOT references detected (DRY risk)
17. `AGENTS.md` — Naming noncompliance (legacy naming) at lines [40]
18. `Plans/orchestrator-subagent-integration.md` — Unresolved placeholder markers at lines [4873, 5273]
19. `Plans/usage-feature.md` — Unresolved placeholder markers at lines [156, 187, 191, 478] / Missing acceptance/verification section / No SSOT references detected (DRY risk)
20. `Plans/FileSafe.md` — Unresolved placeholder markers at lines [1306, 1432, 1433]

### Action grouping (what to re-run vs rebuild)

**Re-run Prompt 1 (Fill-In + Drift Hardening):**
- `Plans/Decision_Policy.md`
- `Plans/DRY_Rules.md`
- `Plans/Glossary.md`
- `Plans/Tools.md`
- `Plans/GitHub_API_Auth_and_Flows.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/usage-feature.md`
- `Plans/FileSafe.md`
- `Plans/newfeatures.md`
- `Plans/chain-wizard-flexibility.md`
- `AGENTS.md`

**Deeper rewrite / recovery (not a trivial fix):**
- `Plans/Rebrand_Chunked_Playbook.md`
- `Plans/rebrand.md`

**Run Review Prompt 2 / targeted repair (high priority but not Prompt 1):**
- `Plans/Contracts_V0.md`
- `Plans/Architecture_Invariants.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/plan_graph.schema.json`
- `Plans/plan_graph.json`
- `Plans/interview-subagent-integration.md`
- `Plans/storage-plan.md`

## SSOT Coverage

### Missing definitions (from ContractRef coverage)
- ConfigKey missing from SSOT: `github.api_version` (referenced in `Plans/GitHub_API_Auth_and_Flows.md`).
- PolicyRule referenced but not defined in Decision Policy: `no_secrets_in_storage` (referenced in `Plans/Architecture_Invariants.md` and `Plans/GitHub_API_Auth_and_Flows.md`).
- ToolID referenced but not defined in `Plans/Tools.md`: `GitHubApiTool` (referenced in `Plans/Crosswalk.md`).
- Primitive identifiers referenced but not defined in Contracts or Glossary: `DRYRules`, `PatchPipeline`, `SessionStore`.
- ContractRef placeholder values present (must be replaced with real targets): `<ref1>`, `<ref2>` (in `Plans/DRY_Rules.md`).

### Contradictions / drift-by-synonym (high-signal)
- **Namespace collision risk:** `cmd.*` appears in non-UI-command contexts (e.g., helper/variable names). Keep UI command IDs exclusively for `cmd.<domain>.<action>` and avoid `cmd.*` for other meanings.
- **Namespace collision risk:** `event.*` appears as DOM/event-object fields (e.g., `event.target`). Avoid using `event.*` as a namespace for persisted event schemas/IDs; prefer `pm.event.*` (schema IDs) and explicit `EventType:*` strings.
- **Special-topic gap:** No plan doc references the required sharded user-project plan graph paths under `.puppet-master/project/plan_graph/` (index + nodes + optional edges).

## Path Hygiene

- **Filesystem path/link hygiene:** No `Plan/...` folder references were found in markdown link/path contexts (checked for link-targets and file-extension paths).
- **Remaining `Plan/` string occurrences (non-filesystem usage):**
  - `Plans/assistant-chat-design.md` (lines 23, 477) — conceptual “Plan/Crew” terminology (not a folder path)
  - `Plans/orchestrator-subagent-integration.md` (line 1125) — subagent category label (not a folder path)
  - `Plans/newtools.md` (lines 199, 207) — “Plan/build ...” phrase (not a folder path)
  - `Plans/feature-list.md` (line 201) — “Plan/build ...” phrase (not a folder path)

## Verification (AI-executable)

Run these commands from repo root to re-check key invariants after recovery work:

```bash
# 1) Ensure no legacy folder-path references exist in Plans docs (link/path contexts)
rg -n "\]\(Plan/" Plans || true
rg -n "`Plan/" Plans || true
rg -n "\bPlan/[^\s\)\]]+\.(md|json|yaml|yml|toml)\b" Plans || true

# 2) Placeholder marker scan (focus on obvious unresolved markers)
rg -n "ContractRef:\s*<" Plans
rg -n "\b(TBD|FIXME|TODO)\b" Plans

# 3) User-project plan graph shard paths should exist in relevant docs (after fixes)
rg -n "\.puppet-master/project/plan_graph" Plans
```
