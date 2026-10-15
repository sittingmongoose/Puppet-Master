# Phase 18 pre-registration — effort-locked, extraction-first, premise store (2026-10-15)

Unchanged from Phase 17: held-out case frozen before work; gold by Sol
post-freeze; Astra 6 Max x2 blind grades vs same-bundle Sol arm;
success = zero confirmed material errors AND diagnostic >= Sol-5;
repair budget <=3 rounds; read allowlists on every context; no SQLite;
frozen plan snapshots only, no PuppetMaster plan fixes.

Effort and concurrency locks (Jared directive 2026-10-15; audit in
PHASE17-RESULTS correction):
- DeepSeek V4.1 Flash via omp/OpenCode Go: thinking=max (route max).
- Luna 6 via codex_gmail: reasoningEffort=max.
- GLM Flash via zcode ONLY (route offers GLM-5.3-Flash; no 5.2 exists):
  thought=max. Never codex_lexx; no Claude accounts unless instructed.
- Host asserts effort in t3_thread_configuration after EVERY launch;
  a launch missing its max option is cancelled and relaunched.
- Concurrency caps: DeepSeek <=2 and GLM <=2 live at once; Luna many;
  Sol/Astra as needed. Optimize for the flash class/union, no winner.

Changes vs Phase 17 (traced):
1. Extraction-first, picking second (P17 ME1 + 1-point band; P16b
   whole-body fidelity 18/21; P11 residue/overlap levers). Whole-body
   flash record extraction per donor body (depth tier) into a records
   inventory with conditions verbatim; question slices are then built
   from records by host claim-level filtering, not from raw chunks.
   Picker preselection no longer gates what evidence EXISTS.
2. Premise-once store (P10 Astra+Sol): governing premises, mode
   introductions, and version/platform scope lines are extracted once
   per source and mechanically attached to every dependent claim at
   slice build; host auto-includes the preceding premise chunk for any
   list/mode chunk (JOBO-010 rule).
3. Absence discipline: a slice may claim NOT IN SOURCE only after a
   host keyword scan of the full bundle for that subtopic returns zero
   hits; scan results ship with the slice. Subtopic list comes from
   the expanded question, host-checked (setsid rule).
4. Host conditions checklist (Phase 2 lever restored): mechanically
   extracted must-carry conditions from slice CONDITIONS fields,
   given to the integrator as a checklist it must carry or mark N/A.
5. Coverage audit gate: host compares slice-cited chunk/record IDs vs
   final-cited IDs before critics; dropped evidence is listed and the
   integrator must cite or explicitly drop with reason (pidfd rule).
6. Cross-section contradiction critic (P17 ME2): one critic whose only
   job is incompatible operative sentences across dispositions, rules,
   and body. Plus gate-composition check (Phase 3): every acceptance
   rule names exact selected values + independent oracle + blind spots.
7. Repair verification by defect-string count = adjudicated remaining
   count, host-run before re-render; worker logs never suffice.
8. Repairs never convert a rejection into an acceptance (Phase 8);
   separately gated successors only.
9. Discovery: union of angled prompts (category, feature-donor,
   failure-first, dependency-graph) + one dry round (Phases 9/11),
   host-deduped; issue/defect-history slicing per chosen product.
10. Cost discipline (Phase 14 stack): dossier/cache reuse checked
    first (er_records gapcheck + cache hits), tiered depth, records
    inventory reused across questions; per-stage context/token/wall
    accounting against the ~60-75 min/topic anchor. Target: fewer
    total contexts than P17's 44 at equal-or-better quality.

Pre-step (running): effort A/B on frozen Case D materials (Luna Max
integration rerun; DeepSeek thinking=max D8 slice rerun), host-scored
on claim/citation/subfact retention only — not a re-grade. Results
bound how much of the P17 gap was effort vs structure before Case E
launches.
