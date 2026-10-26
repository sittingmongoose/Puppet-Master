# Shard 018: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Media_Generation_and_Capabilities.md`

Source lines: L6446-L6616

Source SHA256: `418bc32eb7b2528e2e8654f6573ff22898801fe0881483bd4b3c18cc9a4115a4`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### MGAC-100 - P0-MULTIMODAL-INPUT-SETTLEMENT

```yaml
plan_unit_id: MGAC-100
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: "P0-MULTIMODAL-INPUT-SETTLEMENT (P0) is compiled as canonical Puppet Master intent for Vision/multimodal input admission and fallback: Add MultimodalInputSettlement: source_surface, media_type, MIME, byte_size, redaction_state, artifact_ref, model_modality_support, requested_route, effective_route, fallback_caption_route, original_retention, provider_payload_shape, and denied_reason. Never silently base64/text-inject unsupported images. The preserved PM gap/delta is: PM\u2019s media/vision coverage should be tied to provider request admission: image/PDF/audio/screenshot/file attachments need a settlement record before they can enter model-visible context. The observed external-repo signal remains source-lineage evidence: OpenCode issues show image attachments going to text-only models, custom OpenAI-compatible providers rejecting images, wrong MIME types, vision-enabled read failures, and auto image-to-text fallback requests. Cline reports CLI/browser automation image-format\
  \ gaps. Codex IDE officially supports image generation/editing and model/context surfaces."
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Text-only model + image file yields denied_or_captioned, never hidden prompt bloat.
- Wrong MIME is blocked before provider request.
- Vision-capable custom provider must prove modality support or fall back.
- GUI can show original artifact and caption/fallback provenance.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Text-only model + image file yields denied_or_captioned, never hidden prompt bloat.
- Wrong MIME is blocked before provider request.
- Vision-capable custom provider must prove modality support or fall back.
- GUI can show original artifact and caption/fallback provenance.
risk_class: p0_multimodal_and_attachments_hardening
reasoning_tier: high
context_scope: multimodal_and_attachments
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
node_compile_hint:
  mode: p0_multimodal_input_settlement
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0063
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0063
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0059/P0-MULTIMODAL-INPUT-SETTLEMENT@line=59
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0059/P0-MULTIMODAL-INPUT-SETTLEMENT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:5
source_atom_ids:
- atom-0063
external_atom_id: extrepo-20260703-0059
source_row_id: P0-MULTIMODAL-INPUT-SETTLEMENT
priority: P0
finding_family: Vision/multimodal input admission and fallback
source_repos:
- OpenCode
- Cline
- Codex
- Pi
target_docs:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
preserved_exact_tokens:
- extrepo-20260703-0059
- P0-MULTIMODAL-INPUT-SETTLEMENT
- P0
- Vision/multimodal input admission and fallback
- OpenCode
- Cline
- Codex
- Pi
negative_constraints: []
observed_signal: OpenCode issues show image attachments going to text-only models, custom OpenAI-compatible providers rejecting images, wrong MIME types, vision-enabled read failures, and auto image-to-text fallback requests. Cline reports CLI/browser automation image-format gaps. Codex IDE officially supports image generation/editing and model/context surfaces.
pm_current_coverage: Media_Generation_and_Capabilities has media route taxonomy, capability telemetry, Vision Bridge eligibility, media tool contracts, and no-stale capability cache. Models_System also has Vision Bridge requested/effective route resolution.
pm_gap_or_delta: "PM\u2019s media/vision coverage should be tied to provider request admission: image/PDF/audio/screenshot/file attachments need a settlement record before they can enter model-visible context."
proposal_or_recommendation: 'Add MultimodalInputSettlement: source_surface, media_type, MIME, byte_size, redaction_state, artifact_ref, model_modality_support, requested_route, effective_route, fallback_caption_route, original_retention, provider_payload_shape, and denied_reason. Never silently base64/text-inject unsupported images.'
compile_disposition: create_new_planunit
```

### MGAC-101 - P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY

```yaml
plan_unit_id: MGAC-101
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: >-
  P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY (P1) is compiled as canonical Puppet Master intent for Fallback captioning/OCR/transcription as explicit route: Define MediaFallbackCaptionPolicy: fallback model/provider, cost/latency, user permission, original artifact retention, caption confidence, redaction, provider payload, and GUI disclosure. The preserved PM gap/delta is: Captioning fallback must be opt-in/visible and produce a separate artifact; it must not pretend the selected model saw the original image. The observed external-repo signal remains source-lineage evidence: OpenCode requested auto image-to-text fallback for non-multimodal providers, while other issues show unsupported images causing context bloat/errors.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- "Non-vision model with image shows \u201Ccaption fallback used,\u201D with caption artifact and cost."
- User can disable fallback.
- Provider request receipt says selected model saw text caption only.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- "Non-vision model with image shows \u201Ccaption fallback used,\u201D with caption artifact and cost."
- User can disable fallback.
- Provider request receipt says selected model saw text caption only.
risk_class: p1_security_release_supply_chain_hardening
reasoning_tier: standard
context_scope: security_release_supply_chain
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/usage-feature.md
node_compile_hint:
  mode: p1_multimodal_fallback_transcription_policy
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0074
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0074
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0070/P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY@line=70
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0070/P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:16
source_atom_ids:
- atom-0074
external_atom_id: extrepo-20260703-0070
source_row_id: P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY
priority: P1
finding_family: Fallback captioning/OCR/transcription as explicit route
source_repos:
- OpenCode
- Cline
- Codex
target_docs:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/usage-feature.md
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/usage-feature.md
preserved_exact_tokens:
- extrepo-20260703-0070
- P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY
- P1
- Fallback captioning/OCR/transcription as explicit route
- OpenCode
- Cline
- Codex
negative_constraints: []
observed_signal: OpenCode requested auto image-to-text fallback for non-multimodal providers, while other issues show unsupported images causing context bloat/errors.
pm_current_coverage: Vision Bridge/media routes exist, but fallback captioning should be governed separately from native vision.
pm_gap_or_delta: Captioning fallback must be opt-in/visible and produce a separate artifact; it must not pretend the selected model saw the original image.
proposal_or_recommendation: 'Define MediaFallbackCaptionPolicy: fallback model/provider, cost/latency, user permission, original artifact retention, caption confidence, redaction, provider payload, and GUI disclosure.'
compile_disposition: create_new_planunit
```
