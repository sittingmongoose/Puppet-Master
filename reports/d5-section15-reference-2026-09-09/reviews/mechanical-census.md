# D5 frozen Section 15 mechanical census

Frozen source mechanical evidence only; no semantic neutrality, necessity, correctness, or product classification decisions.

All references below use frozen source files and inclusive, 1-based lines. `mechanical-census.json` contains exact unit text, YAML text, parsed values, every top-level field and recursive mapping field, exact slices, line spans, YAML tags, and SHA-256 hashes. No current Plans files were read. METHOD.md was absent when this census began and was read before completion; its final-read hash is recorded in JSON.

## Integrity and counts

| Source | SHA-256 | Bytes | Lines | Unit headings | YAML IDs | Distinct units |
|---|---|---:|---:|---:|---:|---:|
| june11 | `8ae652cad15d3b8183532cfe5df3b3b36c9f904eff957a4c91632a038ad1cacf` | 117646 | 989 | 1 | 1 | 1 |
| july04 | `e09970932e63fb5b7698366d909c24ed399a794e0c7ba5e23368b01a02774e8a` | 494802 | 9212 | 137 | 137 | 137 |

All SHA-256, byte, line-count, and Git blob checks match source-freeze.json. The freeze requested counts 2 and 274 equal heading-plus-YAML occurrences; they do not equal distinct unit counts. Heading/declaration pairs are not separate units. All unit heading IDs match YAML declaration IDs one-to-one.

## Body lines 1–807

Exact equality: False. Positional differing lines: 1. Sequence-aligned diff operations: 1.

```diff
--- june11:1-807
+++ july04:1-807
@@ -153,7 +153,7 @@
 - `Plans/WorktreeGitImprovement.md` is the implementation cross-reference for assistant-created worktree lifecycle, temporary naming, rename, cleanup, soft worktree-limit warnings, and Doctor orphaned-worktree checks.
 - GUI placement remains split intentionally: `Plans/FinalGUISpec.md` owns the thread selector worktree icon, Source Control accordion reference, Appendix A `WorktreeGitImprovement` cross-ref, and Settings > Branching > Assistant Worktrees with 10 settings in 3 groups.
 - Worktrees are visible from Orchestrator and Source Control without forcing one cramped Source Control side-panel design. Orchestrator-managed worktrees stay distinguishable from user-created and assistant-created worktrees, while Source Control may use compact rows, filters, or tabs only when those controls preserve the same worktree object identity.
-- Multiple projects and /repos may run orchestration concurrently. Presented orchestration data is per-project, multi-account aware, and app-level only through shell aggregation; project status cards stay project-scoped, and project differences such as settings, /themes/snapshots/etc, /storage, /provider state, and worktree inventory do not leak across project boundaries. Existing Orchestrator tab structure may keep its 4-6 tabs while the current spec stays weak and avoids deep redesign in this promoted-feature registration.
+- Multiple projects and /repos may run orchestration concurrently. Presented orchestration data is per-project, multi-account aware, and app-level only through shell aggregation; project status cards stay project-scoped, and project differences such as settings, /themes/snapshots/etc, /storage, /provider state, and worktree inventory do not leak across project boundaries. Orchestrator shell references consume the current seven-tab structure (`Progress`, `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, `Ledger`) from `Plans/Orchestrator_Page.md`; this promoted-feature registration does not re-open or weaken that shell.
 - `chain-wizard-flexibility.md` keeps worktree policy conditional on run intent rather than globally uniform: isolated worktrees are the default for parallel or risky work, but wizard/chain flows may reuse or route worktrees when the owner docs declare that exception explicitly.
 
 **Non-MVP boundaries:** Section 15 registers the promoted feature but does not widen the owner scope: Assistant Chat W.17 remains the explicit non-goal owner for no arbitrary "Bind Existing" MVP, no unbind/merge undo, no per-merge command override, no worktree-scoped Changes section, no thread export of worktree binding metadata, and no orchestrator-to-assistant worktree transfer on handoff.
```

## Unit 001 placement

- june11: heading 810; full heading-through-fence span 810–977; literal status `accepted`.
- july04: heading 7989; full heading-through-fence span 7989–8167; literal status `retired`.

June baseline contains only SMPFS-001. July places SMPFS-002–123 first, then retired SMPFS-001, then the Migration Coverage section and ledger addendum containing SMPFS-124–137. July has all IDs 001–137 exactly once. These are placement and literal-field observations only.

## Acceptance criteria exact-template groups

Normalization replaces only the containing unit ID with `<UNIT_ID>`. Whitespace, punctuation, order, and other IDs remain unchanged. Full normalized texts, per-member line spans, hashes, and unified differences from the most frequent group are in JSON.

### AC-01 — 122 occurrences

Members: july04:SMPFS-002, july04:SMPFS-003, july04:SMPFS-004, july04:SMPFS-005, july04:SMPFS-006, july04:SMPFS-007, july04:SMPFS-008, july04:SMPFS-009, july04:SMPFS-010, july04:SMPFS-011, july04:SMPFS-012, july04:SMPFS-013, july04:SMPFS-014, july04:SMPFS-015, july04:SMPFS-016, july04:SMPFS-017, july04:SMPFS-018, july04:SMPFS-019, july04:SMPFS-020, july04:SMPFS-021, july04:SMPFS-022, july04:SMPFS-023, july04:SMPFS-024, july04:SMPFS-025, july04:SMPFS-026, july04:SMPFS-027, july04:SMPFS-028, july04:SMPFS-029, july04:SMPFS-030, july04:SMPFS-031, july04:SMPFS-032, july04:SMPFS-033, july04:SMPFS-034, july04:SMPFS-035, july04:SMPFS-036, july04:SMPFS-037, july04:SMPFS-038, july04:SMPFS-039, july04:SMPFS-040, july04:SMPFS-041, july04:SMPFS-042, july04:SMPFS-043, july04:SMPFS-044, july04:SMPFS-045, july04:SMPFS-046, july04:SMPFS-047, july04:SMPFS-048, july04:SMPFS-049, july04:SMPFS-050, july04:SMPFS-051, july04:SMPFS-052, july04:SMPFS-053, july04:SMPFS-054, july04:SMPFS-055, july04:SMPFS-056, july04:SMPFS-057, july04:SMPFS-058, july04:SMPFS-059, july04:SMPFS-060, july04:SMPFS-061, july04:SMPFS-062, july04:SMPFS-063, july04:SMPFS-064, july04:SMPFS-065, july04:SMPFS-066, july04:SMPFS-067, july04:SMPFS-068, july04:SMPFS-069, july04:SMPFS-070, july04:SMPFS-071, july04:SMPFS-072, july04:SMPFS-073, july04:SMPFS-074, july04:SMPFS-075, july04:SMPFS-076, july04:SMPFS-077, july04:SMPFS-078, july04:SMPFS-079, july04:SMPFS-080, july04:SMPFS-081, july04:SMPFS-082, july04:SMPFS-083, july04:SMPFS-084, july04:SMPFS-085, july04:SMPFS-086, july04:SMPFS-087, july04:SMPFS-088, july04:SMPFS-089, july04:SMPFS-090, july04:SMPFS-091, july04:SMPFS-092, july04:SMPFS-093, july04:SMPFS-094, july04:SMPFS-095, july04:SMPFS-096, july04:SMPFS-097, july04:SMPFS-098, july04:SMPFS-099, july04:SMPFS-100, july04:SMPFS-101, july04:SMPFS-102, july04:SMPFS-103, july04:SMPFS-104, july04:SMPFS-105, july04:SMPFS-106, july04:SMPFS-107, july04:SMPFS-108, july04:SMPFS-109, july04:SMPFS-110, july04:SMPFS-111, july04:SMPFS-112, july04:SMPFS-113, july04:SMPFS-114, july04:SMPFS-115, july04:SMPFS-116, july04:SMPFS-117, july04:SMPFS-118, july04:SMPFS-119, july04:SMPFS-120, july04:SMPFS-121, july04:SMPFS-122, july04:SMPFS-123.

```yaml
acceptance_criteria:
- <UNIT_ID> remains addressable as a fine-grained Section 15 PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
```

### AC-02 — 1 occurrences

Members: june11:SMPFS-001.

```yaml
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
```

### AC-03 — 1 occurrences

Members: july04:SMPFS-001.

```yaml
acceptance_criteria:
- Section15_MVP_Promoted_Features_Spec-S0001 through S0050 remain mapped to fine-grained PlanUnits SMPFS-002 through SMPFS-123 or structural coverage rather than <UNIT_ID>.
- Section15_MVP_Promoted_Features_Spec-S0051, S0052, and S0054 are structurally dispositioned as generated migration metadata.
- Section15_MVP_Promoted_Features_Spec-S0053 is explicitly dispositioned as retired generated bridge lineage.
- <UNIT_ID> no longer uses node_compile_hint.mode=source_preserving_planunit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
```

### AC-04 — 1 occurrences

Members: july04:SMPFS-124.

```yaml
acceptance_criteria:
- VT replay corpus includes OSC 52/8/9;4/133/633, bracketed paste, focus, mouse, alternate screen, synchronized update sequences.
- Parser output is deterministic across macOS/Linux/Windows/WSL fixtures.
- Weak/unknown protocol support downgrades requested-vs-effective state rather than fabricating command blocks.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
```

### AC-05 — 1 occurrences

Members: july04:SMPFS-125.

```yaml
acceptance_criteria:
- A fast-output fixture records byte counts and no silent loss.
- If retention cap prunes, transcript chunk references prove what remains and what was pruned.
- UI thread never blocks on raw PTY ingestion.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
```

### AC-06 — 1 occurrences

Members: july04:SMPFS-126.

```yaml
acceptance_criteria:
- Screen reader projection can read current line, selection, prompt/command boundaries, and latest output without scraping GPU pixels.
- Long-running spam commands throttle announcements without hiding state.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
```

### AC-07 — 1 occurrences

Members: july04:SMPFS-127.

```yaml
acceptance_criteria:
- Pasting mixed URL/plain text chooses plain text unless user selects URI action.
- Pasted Ctrl+C/control chars cannot execute without warning/normalization.
- OSC 52 read/write respects policy and remote trust.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
```

### AC-08 — 1 occurrences

Members: july04:SMPFS-128.

```yaml
acceptance_criteria:
- Relaunch fixtures prove PWD/profile/layout/transcript restoration.
- If live PTY cannot survive, UI says review-limited and offers restart/rerun, not fake continuity.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
```

### AC-09 — 1 occurrences

Members: july04:SMPFS-129.

```yaml
acceptance_criteria:
- OSC133 markers spanning multi-row prompt produce one region
- Bare key param does not crash parser
- tmux passthrough marks command-block confidence degraded when unverified
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
```

### AC-10 — 1 occurrences

Members: july04:SMPFS-130.

```yaml
acceptance_criteria:
- No control sequence bytes leak to visible grid when split across reads
- Synchronized update state closes correctly after arbitrary chunking
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
```

### AC-11 — 1 occurrences

Members: july04:SMPFS-131.

```yaml
acceptance_criteria:
- Accessibility visible range returns viewport, not full scrollback
- Position/bounds queries are O(viewport) and redaction-aware
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
```

### AC-12 — 1 occurrences

Members: july04:SMPFS-132.

```yaml
acceptance_criteria:
- Doctor detects incompatible ConPTY pair
- OSC52 failure identifies local/remote/tmux/policy path
- Prompt markers degrade when tmux passthrough is unverified
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
```

### AC-13 — 1 occurrences

Members: july04:SMPFS-133.

```yaml
acceptance_criteria:
- Terminal byte stream preserves parser state across chunks
- scrollback is not model context
- WebSocket, if used, is UI transport not terminal engine.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
```

### AC-14 — 1 occurrences

Members: july04:SMPFS-134.

```yaml
acceptance_criteria:
- Running a high-output TUI agent does not freeze GUI or explode logs.
- OSC 133/633 marker loss/degradation is visible.
- PM never interprets terminal agent text as PM-native tool receipt without adapter proof.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
```

### AC-15 — 1 occurrences

Members: july04:SMPFS-135.

```yaml
acceptance_criteria:
- Terminal paste/drop/autofill inputs pass through TerminalInputSanitizer with control-code stripping/escaping policy and user-visible preview for dangerous content.
- OTP/autofill/system pasteboard data is blocked from terminal echo/model context unless explicitly approved.
- File URL paste/drag opens are FileSafe checked and do not implicitly execute or read files.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
```

### AC-16 — 1 occurrences

Members: july04:SMPFS-136.

```yaml
acceptance_criteria:
- IME candidate follows cursor cell
- Plain text paste is preferred over URL/file flavors unless explicit
- clear/cls preserves visible prompt/viewport invariants
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
```

### AC-17 — 1 occurrences

Members: july04:SMPFS-137.

```yaml
acceptance_criteria:
- atom-0118 source details remain traceable through source_lineage and preserved source fields.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
```

## Field census

Governance/index metadata is separately indexed by an explicit field-name list in JSON. This organizational list does not determine field semantics or neutrality. All fields, including source/proposal/coverage fields outside that list, remain in the full per-unit inventory.

| Field | June occurrences and YAML tags | July occurrences and YAML tags |
|---|---|---|
| acceptance_criteria | 1; seq:1 | 137; seq:137 |
| canonical_text | 1; str:1 | 137; str:137 |
| compatibility_only_notes | 1; seq:1 | 123; seq:123 |
| compile_disposition | 0 | 14; str:14 |
| context_scope | 1; str:1 | 137; str:137 |
| depends_on | 1; seq:1 | 137; seq:137 |
| external_atom_id | 0 | 13; str:13 |
| finding_family | 0 | 13; str:13 |
| gui_classification_reason | 1; str:1 | 137; str:137 |
| gui_related | 1; bool:1 | 137; bool:137 |
| implementation_surfaces | 1; seq:1 | 137; seq:137 |
| negative_constraints | 1; seq:1 | 137; seq:137 |
| node_compile_hint | 1; map:1 | 137; map:137 |
| observed_signal | 0 | 12; str:12 |
| owner_boundary_notes | 1; seq:1 | 0 |
| owner_doc | 1; str:1 | 137; str:137 |
| owner_hints | 1; seq:1 | 136; seq:136 |
| plan_unit_id | 1; str:1 | 137; str:137 |
| pm_current_coverage | 0 | 10; str:10 |
| pm_gap_or_delta | 0 | 12; str:12 |
| preserved_contractrefs | 0 | 123; seq:123 |
| preserved_exact_tokens | 1; seq:1 | 137; seq:137 |
| priority | 0 | 13; str:13 |
| proposal_or_recommendation | 0 | 7; str:7 |
| reasoning_tier | 1; str:1 | 137; str:137 |
| relationship_to_prior_reports | 0 | 1; str:1 |
| risk_class | 1; str:1 | 137; str:137 |
| source_atom_ids | 0 | 14; seq:14 |
| source_lineage | 1; seq:1 | 137; seq:137 |
| source_repos | 0 | 11; seq:11 |
| source_row_id | 0 | 13; str:13 |
| split_recommendation_reason | 1; str:1 | 0 |
| split_recommended | 1; bool:1 | 123; bool:123 |
| stale_retired_dispositions | 1; seq:1 | 123; seq:123 |
| status | 1; str:1 | 137; str:137 |
| target_docs | 0 | 12; seq:12 |
| unblocks | 1; seq:1 | 137; seq:137 |
| unit_type | 1; str:1 | 137; str:137 |
| validation_surfaces | 1; seq:1 | 137; seq:137 |

## Complete unit span index

| Source | Unit | Heading-through-closing-fence lines | YAML content lines | Top-level fields | Recursive mapping fields |
|---|---|---|---|---:|---:|
| june11 | SMPFS-001 | 810–977 | 813–976 | 25 | 27 |
| july04 | SMPFS-002 | 810–870 | 813–869 | 24 | 26 |
| july04 | SMPFS-003 | 872–924 | 875–923 | 24 | 26 |
| july04 | SMPFS-004 | 926–983 | 929–982 | 24 | 26 |
| july04 | SMPFS-005 | 985–1039 | 988–1038 | 24 | 26 |
| july04 | SMPFS-006 | 1041–1098 | 1044–1097 | 24 | 26 |
| july04 | SMPFS-007 | 1100–1157 | 1103–1156 | 24 | 26 |
| july04 | SMPFS-008 | 1159–1216 | 1162–1215 | 24 | 26 |
| july04 | SMPFS-009 | 1218–1274 | 1221–1273 | 24 | 26 |
| july04 | SMPFS-010 | 1276–1333 | 1279–1332 | 24 | 26 |
| july04 | SMPFS-011 | 1335–1390 | 1338–1389 | 24 | 26 |
| july04 | SMPFS-012 | 1392–1448 | 1395–1447 | 24 | 26 |
| july04 | SMPFS-013 | 1450–1506 | 1453–1505 | 24 | 26 |
| july04 | SMPFS-014 | 1508–1566 | 1511–1565 | 24 | 26 |
| july04 | SMPFS-015 | 1568–1623 | 1571–1622 | 24 | 26 |
| july04 | SMPFS-016 | 1625–1686 | 1628–1685 | 24 | 26 |
| july04 | SMPFS-017 | 1688–1743 | 1691–1742 | 24 | 26 |
| july04 | SMPFS-018 | 1745–1798 | 1748–1797 | 24 | 26 |
| july04 | SMPFS-019 | 1800–1859 | 1803–1858 | 24 | 26 |
| july04 | SMPFS-020 | 1861–1917 | 1864–1916 | 24 | 26 |
| july04 | SMPFS-021 | 1919–1976 | 1922–1975 | 24 | 26 |
| july04 | SMPFS-022 | 1978–2034 | 1981–2033 | 24 | 26 |
| july04 | SMPFS-023 | 2036–2095 | 2039–2094 | 24 | 26 |
| july04 | SMPFS-024 | 2097–2152 | 2100–2151 | 24 | 26 |
| july04 | SMPFS-025 | 2154–2214 | 2157–2213 | 24 | 26 |
| july04 | SMPFS-026 | 2216–2270 | 2219–2269 | 24 | 26 |
| july04 | SMPFS-027 | 2272–2336 | 2275–2335 | 24 | 26 |
| july04 | SMPFS-028 | 2338–2400 | 2341–2399 | 24 | 26 |
| july04 | SMPFS-029 | 2402–2467 | 2405–2466 | 24 | 26 |
| july04 | SMPFS-030 | 2469–2539 | 2472–2538 | 24 | 26 |
| july04 | SMPFS-031 | 2541–2598 | 2544–2597 | 24 | 26 |
| july04 | SMPFS-032 | 2600–2658 | 2603–2657 | 24 | 26 |
| july04 | SMPFS-033 | 2660–2711 | 2663–2710 | 24 | 26 |
| july04 | SMPFS-034 | 2713–2764 | 2716–2763 | 24 | 26 |
| july04 | SMPFS-035 | 2766–2817 | 2769–2816 | 24 | 26 |
| july04 | SMPFS-036 | 2819–2870 | 2822–2869 | 24 | 26 |
| july04 | SMPFS-037 | 2872–2921 | 2875–2920 | 24 | 26 |
| july04 | SMPFS-038 | 2923–2970 | 2926–2969 | 24 | 26 |
| july04 | SMPFS-039 | 2972–3025 | 2975–3024 | 24 | 26 |
| july04 | SMPFS-040 | 3027–3077 | 3030–3076 | 24 | 26 |
| july04 | SMPFS-041 | 3079–3129 | 3082–3128 | 24 | 26 |
| july04 | SMPFS-042 | 3131–3181 | 3134–3180 | 24 | 26 |
| july04 | SMPFS-043 | 3183–3235 | 3186–3234 | 24 | 26 |
| july04 | SMPFS-044 | 3237–3290 | 3240–3289 | 24 | 26 |
| july04 | SMPFS-045 | 3292–3345 | 3295–3344 | 24 | 26 |
| july04 | SMPFS-046 | 3347–3397 | 3350–3396 | 24 | 26 |
| july04 | SMPFS-047 | 3399–3450 | 3402–3449 | 24 | 26 |
| july04 | SMPFS-048 | 3452–3512 | 3455–3511 | 24 | 26 |
| july04 | SMPFS-049 | 3514–3569 | 3517–3568 | 24 | 26 |
| july04 | SMPFS-050 | 3571–3622 | 3574–3621 | 24 | 26 |
| july04 | SMPFS-051 | 3624–3678 | 3627–3677 | 24 | 26 |
| july04 | SMPFS-052 | 3680–3733 | 3683–3732 | 24 | 26 |
| july04 | SMPFS-053 | 3735–3789 | 3738–3788 | 24 | 26 |
| july04 | SMPFS-054 | 3791–3841 | 3794–3840 | 24 | 26 |
| july04 | SMPFS-055 | 3843–3899 | 3846–3898 | 24 | 26 |
| july04 | SMPFS-056 | 3901–3953 | 3904–3952 | 24 | 26 |
| july04 | SMPFS-057 | 3955–4013 | 3958–4012 | 24 | 26 |
| july04 | SMPFS-058 | 4015–4069 | 4018–4068 | 24 | 26 |
| july04 | SMPFS-059 | 4071–4130 | 4074–4129 | 24 | 26 |
| july04 | SMPFS-060 | 4132–4187 | 4135–4186 | 24 | 26 |
| july04 | SMPFS-061 | 4189–4250 | 4192–4249 | 24 | 26 |
| july04 | SMPFS-062 | 4252–4311 | 4255–4310 | 24 | 26 |
| july04 | SMPFS-063 | 4313–4366 | 4316–4365 | 24 | 26 |
| july04 | SMPFS-064 | 4368–4422 | 4371–4421 | 24 | 26 |
| july04 | SMPFS-065 | 4424–4478 | 4427–4477 | 24 | 26 |
| july04 | SMPFS-066 | 4480–4534 | 4483–4533 | 24 | 26 |
| july04 | SMPFS-067 | 4536–4596 | 4539–4595 | 24 | 26 |
| july04 | SMPFS-068 | 4598–4660 | 4601–4659 | 24 | 26 |
| july04 | SMPFS-069 | 4662–4723 | 4665–4722 | 24 | 26 |
| july04 | SMPFS-070 | 4725–4782 | 4728–4781 | 24 | 26 |
| july04 | SMPFS-071 | 4784–4844 | 4787–4843 | 24 | 26 |
| july04 | SMPFS-072 | 4846–4902 | 4849–4901 | 24 | 26 |
| july04 | SMPFS-073 | 4904–4960 | 4907–4959 | 24 | 26 |
| july04 | SMPFS-074 | 4962–5025 | 4965–5024 | 24 | 26 |
| july04 | SMPFS-075 | 5027–5083 | 5030–5082 | 24 | 26 |
| july04 | SMPFS-076 | 5085–5145 | 5088–5144 | 24 | 26 |
| july04 | SMPFS-077 | 5147–5205 | 5150–5204 | 24 | 26 |
| july04 | SMPFS-078 | 5207–5265 | 5210–5264 | 24 | 26 |
| july04 | SMPFS-079 | 5267–5326 | 5270–5325 | 24 | 26 |
| july04 | SMPFS-080 | 5328–5381 | 5331–5380 | 24 | 26 |
| july04 | SMPFS-081 | 5383–5435 | 5386–5434 | 24 | 26 |
| july04 | SMPFS-082 | 5437–5489 | 5440–5488 | 24 | 26 |
| july04 | SMPFS-083 | 5491–5541 | 5494–5540 | 24 | 26 |
| july04 | SMPFS-084 | 5543–5600 | 5546–5599 | 24 | 26 |
| july04 | SMPFS-085 | 5602–5665 | 5605–5664 | 24 | 26 |
| july04 | SMPFS-086 | 5667–5733 | 5670–5732 | 24 | 26 |
| july04 | SMPFS-087 | 5735–5800 | 5738–5799 | 24 | 26 |
| july04 | SMPFS-088 | 5802–5864 | 5805–5863 | 24 | 26 |
| july04 | SMPFS-089 | 5866–5928 | 5869–5927 | 24 | 26 |
| july04 | SMPFS-090 | 5930–5994 | 5933–5993 | 24 | 26 |
| july04 | SMPFS-091 | 5996–6068 | 5999–6067 | 24 | 26 |
| july04 | SMPFS-092 | 6070–6137 | 6073–6136 | 24 | 26 |
| july04 | SMPFS-093 | 6139–6205 | 6142–6204 | 24 | 26 |
| july04 | SMPFS-094 | 6207–6272 | 6210–6271 | 24 | 26 |
| july04 | SMPFS-095 | 6274–6335 | 6277–6334 | 24 | 26 |
| july04 | SMPFS-096 | 6337–6409 | 6340–6408 | 24 | 26 |
| july04 | SMPFS-097 | 6411–6474 | 6414–6473 | 24 | 26 |
| july04 | SMPFS-098 | 6476–6543 | 6479–6542 | 24 | 26 |
| july04 | SMPFS-099 | 6545–6612 | 6548–6611 | 24 | 26 |
| july04 | SMPFS-100 | 6614–6694 | 6617–6693 | 24 | 26 |
| july04 | SMPFS-101 | 6696–6755 | 6699–6754 | 24 | 26 |
| july04 | SMPFS-102 | 6757–6816 | 6760–6815 | 24 | 26 |
| july04 | SMPFS-103 | 6818–6869 | 6821–6868 | 24 | 26 |
| july04 | SMPFS-104 | 6871–6924 | 6874–6923 | 24 | 26 |
| july04 | SMPFS-105 | 6926–6981 | 6929–6980 | 24 | 26 |
| july04 | SMPFS-106 | 6983–7041 | 6986–7040 | 24 | 26 |
| july04 | SMPFS-107 | 7043–7099 | 7046–7098 | 24 | 26 |
| july04 | SMPFS-108 | 7101–7159 | 7104–7158 | 24 | 26 |
| july04 | SMPFS-109 | 7161–7222 | 7164–7221 | 24 | 26 |
| july04 | SMPFS-110 | 7224–7277 | 7227–7276 | 24 | 26 |
| july04 | SMPFS-111 | 7279–7337 | 7282–7336 | 24 | 26 |
| july04 | SMPFS-112 | 7339–7397 | 7342–7396 | 24 | 26 |
| july04 | SMPFS-113 | 7399–7457 | 7402–7456 | 24 | 26 |
| july04 | SMPFS-114 | 7459–7512 | 7462–7511 | 24 | 26 |
| july04 | SMPFS-115 | 7514–7565 | 7517–7564 | 24 | 26 |
| july04 | SMPFS-116 | 7567–7617 | 7570–7616 | 24 | 26 |
| july04 | SMPFS-117 | 7619–7670 | 7622–7669 | 24 | 26 |
| july04 | SMPFS-118 | 7672–7723 | 7675–7722 | 24 | 26 |
| july04 | SMPFS-119 | 7725–7776 | 7728–7775 | 24 | 26 |
| july04 | SMPFS-120 | 7778–7828 | 7781–7827 | 24 | 26 |
| july04 | SMPFS-121 | 7830–7878 | 7833–7877 | 24 | 26 |
| july04 | SMPFS-122 | 7880–7932 | 7883–7931 | 24 | 26 |
| july04 | SMPFS-123 | 7934–7987 | 7937–7986 | 24 | 26 |
| july04 | SMPFS-001 | 7989–8167 | 7992–8166 | 24 | 26 |
| july04 | SMPFS-124 | 8185–8267 | 8188–8266 | 32 | 35 |
| july04 | SMPFS-125 | 8269–8347 | 8272–8346 | 32 | 35 |
| july04 | SMPFS-126 | 8349–8418 | 8352–8417 | 32 | 35 |
| july04 | SMPFS-127 | 8420–8498 | 8423–8497 | 32 | 35 |
| july04 | SMPFS-128 | 8500–8576 | 8503–8575 | 32 | 35 |
| july04 | SMPFS-129 | 8578–8652 | 8581–8651 | 31 | 34 |
| july04 | SMPFS-130 | 8654–8724 | 8657–8723 | 31 | 34 |
| july04 | SMPFS-131 | 8726–8794 | 8729–8793 | 31 | 34 |
| july04 | SMPFS-132 | 8796–8872 | 8799–8871 | 31 | 34 |
| july04 | SMPFS-133 | 8874–8941 | 8877–8940 | 28 | 31 |
| july04 | SMPFS-134 | 8943–9023 | 8946–9022 | 32 | 35 |
| july04 | SMPFS-135 | 9025–9094 | 9028–9093 | 30 | 33 |
| july04 | SMPFS-136 | 9096–9161 | 9099–9160 | 28 | 31 |
| july04 | SMPFS-137 | 9163–9212 | 9166–9211 | 22 | 25 |

## Parsing and coverage limits

Parsing issues: 0. []

Every detected YAML plan_unit_id occurrence is represented by one parsed unit. All YAML mapping fields, including nested node_compile_hint fields, are inventoried. Exact full-unit and YAML text preserve sequence members and formatting, while top-level field slices partition each YAML block. YAML parsing is syntactic; no canonical schema, semantic validation, or acceptance adequacy determination was performed. No tests, runtime sessions, campaign executions, or governance generators were started. Sources were read only.

Mechanical validation passed: all top-level field partitions reconstruct their complete YAML text; all top-level line spans and recursive mapping slices reconstruct exact field text; frozen source hashes were rechecked. No sessions remain running.
