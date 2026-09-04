# Shard 036: Additive Correction v4 — Plan Revisions, Embeds, And Execution Reports (2026-09-03)

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L2678-L2763

Source SHA256: `5dcc95a6d7612a7134741da4fa5e6a32f6c621f3fbb994351902e7460ee7bd51`

---

## Additive Correction v4 — Plan Revisions, Embeds, And Execution Reports (2026-09-03)

This section applies `PM_Assistant_v2_Additive_Correction_v4` (the artifact side of
`PDET-001..012`, `PPROG-015..016`, and `WONV-008`) to this owner.
`Plans/Assistant_Plan_Runtime.md` owns the Plan document and its lifecycle; this document owns
artifact identity, rendering, fallback, retention, and export.

### PDET-004, PDET-006 — One immutable revision per Plan version

Each Assistant Plan version is one immutable shared Runtime Artifact revision referenced by the
thread. Rich Text and Markdown resolve the same structured revision; two independently editable
bodies are never stored, and Plan metadata is not duplicated into Plan storage.

Deleting or hiding a thread card never purges a Plan artifact still referenced by a Planning
Wizard handoff, a Goal, a Crew or Review run, a Usage record, an export, or another artifact.
Retention follows the shared reachability and hold rules already owned here. Card visibility is
not deletion authority.

### PDET-008..010 — `PlanArtifactEmbed` and the shared renderer

```text
pm.assistant_plan.artifact_embed.v1
  block_id            stable Plan block this embed belongs to
  artifact_id
  artifact_version    frozen at approval
  renderer_kind       mermaid | graph | chart | image | diagram | table |
                      code | checklist | video | interactive | <registered>
  display             inline | expanded | thumbnail
  caption
  text_summary        always present, so the block is meaningful without the renderer
  static_fallback_ref used by PDF and by any renderer-unavailable path
  source_ref
```

Every supported kind renders through the shared artifact renderer. The Plan never carries a
private per-type renderer, and a future registered renderer kind is available to Plans without a
Plan-side change.

An embed resolves the frozen `artifact_version`. Changing that artifact later does not change an
approved Plan, and nothing resolves "latest" at render time.

Interactive content runs only in the shared sandbox, with renderer capability and origin checked
against `Plans/Permissions_System.md`. Markdown-embedded HTML is never treated as trusted
application UI, and arbitrary untrusted script is not executed.

### PDET-011..012 — PDF fallback and unavailable blocks

PDF export renders a video or interactive block through its `static_fallback_ref` with the caption
and a stable artifact reference. A supported block is never silently dropped, and the export never
implies that interactivity survived into the PDF.

A missing, stale, permission-denied, or unsupported embed renders an explicit unavailable block
naming which of those four it is. The user can open Details, repair, or re-export; content is
never omitted silently and one artifact version is never substituted for another. Export results
report the same truth as the on-screen block.

### PPROG-015..016 — The execution report is a separate artifact

Plan document export contains the approved document only, and exporting never alters `plan_hash`.

```text
pm.assistant_plan.execution_report.v1
  assistant_plan_id, plan_version, plan_hash, plan_run_id,
  progress_ref, todo_refs[], deviations[], evidence_refs[]
```

The report may include To-Dos, step states, deviations, evidence, attempts, and a completion
summary. It states its own currentness and its source Plan hash, and it is never presented as the
approved Plan. Both exports are produced by `cmd.chat.plan.export` under
`content_kind: plan_document | execution_report`; no peer export command exists.

### BSTALE-009 — Stale browser captures are inspectable, and carry no secrets

A stale browser capture keeps an artifact-side Details record exposing the original
page, session and generation, the capture time, the identity hints that failed to
match, and the typed reason. Protected authentication surfaces stay excluded, and no
credential, cookie or storage value is persisted into that record.
`Plans/Section15_MVP_Promoted_Features_Spec.md` owns the revalidation taxonomy; this
owner owns the durability and disclosure of what it writes down.

### WONV-008 — Research artifacts use Puppet Master identity

Wonderer research and synthesis output is a Puppet Master artifact with progressive disclosure:
a summary, an analysis, and deeper dossiers, each routeable through ordinary artifact identity.
An absolute external profile path is never the deliverable, and no Hermes profile-home handoff is
required to read a lead.
