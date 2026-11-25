# Shard 035: Markdown Preview Chunking, Automatic Inert Option, And Path Disambiguation Addendum (2026-11-23, DL-2601)

Source: `Plans/FileManager.md`

Source lines: L7584-L7677

Source SHA256: `5a619c6ddfd93b9399867c5a55288f98904bf219054aa01cd3f9514d2ceafa19`

---

## Markdown Preview Chunking, Automatic Inert Option, And Path Disambiguation Addendum (2026-11-23, DL-2601)

### F-162 - Large Chunked Markdown Previews, Automatic Inert Option, And Path Disambiguation

```yaml
plan_unit_id: F-162
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  Large and untrusted Markdown file previews in FileManager (§6, §11.5, §14) use the standalone shared Rust Markdown
  pipeline (DR-093, ACD-641, ACD-643, DL-2601) with three required protections: (1) Block-boundary chunked
  virtualization within F-028 limits: preserve F-028's configured hard file cap and truncation (5 MB default),
  virtualizing admitted Markdown content at parser-confirmed closed block boundaries into roughly 4 KiB UTF-8 byte
  chunks, rendering any single block over 128 KiB UTF-8 bytes as raw source, extracting link and footnote reference
  definitions once strictly across the admitted buffer revision (never scanning beyond F-028 truncation; out-of-range
  definitions stay unresolved until an authorized load expands the admitted range) and propagating them to every
  admitted chunk (rebinding spans, revisions, references, and capabilities per subject), ensuring Select All selects
  the full admitted canonical range and Copy writes it to the clipboard, and allowing revision-checked preview task
  checkbox edits (RTIM-033 toggle_checkbox mapped to canonical file byte offsets) strictly in writable workspace
  buffers (read-only in inert and snapshot previews). (2) Automatic inert pipeline option: derived automatically by
  the preview host before rendering whenever trust_state is preview_untrusted (F-070) or the subject is a Backup
  snapshot browse (§11.5 cmd.backup.browse), with no user toggle, command, or Settings row; inert rendering shows
  links as non-navigable text, renders images as alt text or placeholders with zero network or filesystem fetches,
  suppresses all content mutation actions, and escapes raw HTML as literal text. (3) Deterministic literal-first
  path-vs-:line[:col] resolution order integrated with ACD-643 URL dispatch: image paths are always treated literally
  and never stripped of trailing :line[:col] suffixes; for preview file and code links/citations that are not
  forbidden schemes (javascript:, vbscript:, data:), protocol-relative //host, same-document #fragment anchors, or
  explicit web schemes (https:, http:, mailto:), ACD-643 dispatches to this subject-bound FileManager resolver BEFORE
  unknown-scheme rejection so that (a) Windows drive paths (C:\...) and UNC paths (\\host\share) are detected first
  (drive letters are never parsed as URL schemes and UNC paths never trigger network fetches), (b) the literal
  relative path is tested against the containing file's directory first (preserving POSIX filenames such as notes:12,
  timestamped folders such as 2026-11-23T14:05/README.md, and paths containing spaces), (c) a trailing :\d+(:\d+)?$
  locator is stripped only when the literal path does not exist and the stripped target resolves, and (d) workspace-
  root fallback applies only on a leading / or an explicit containing-directory miss (including root-level README.md),
  emitting a typed PM internal route to the exact PreviewSession subject or rendering unresolved targets as
  non-navigable plain text without silent directory misrouting.
gui_related: true
gui_classification_reason: Defines visible Markdown file preview chunking, automatic inert untrusted presentation, and relative link/image resolution.
split_recommended: false
depends_on:
- DL-2601
- DR-093
- F-028
- F-043
- F-070
- RTIM-027
- RTIM-033
- ACD-641
- ACD-643
unblocks: []
acceptance_criteria:
- "Large Markdown previews preserve F-028's hard file cap/truncation, virtualize admitted content at parser-confirmed closed block boundaries (~4 KiB UTF-8 byte chunks), render single blocks over 128 KiB UTF-8 bytes as raw source, extract and propagate reference definitions strictly across the admitted buffer revision (leaving definitions beyond truncation unresolved), select the full admitted canonical range on Select All (Copy writes clipboard), and restrict revision-checked RTIM-033 task edits to writable buffers."
- "F-070 preview_untrusted subjects and §11.5 Backup snapshot previews automatically set the inert pipeline option before rendering (no command, toggle, or Settings row) with non-navigable links, zero network/filesystem image fetches, suppressed mutation actions, and escaped raw HTML."
- "Image paths stay literal, while file/code link resolution runs inside ACD-643 dispatch before unknown-scheme rejection, detecting Windows drive/UNC paths first (blocking UNC fetches), testing literal containing-directory paths (notes:12, 2026-11-23T14:05/README.md, spaces) before stripping trailing :line[:col] locators, and using workspace-root fallback only on leading / or explicit miss."
- "No WorkNodes, NodeSeeds, executable queues, implementation files, or governance reseals are created by this unit."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: preview_scaling_security_and_path_misrouting
reasoning_tier: high
context_scope: markdown_streaming_and_preview_hardening_20261123
implementation_surfaces:
- Plans/FileManager.md
- Plans/rewrite-tie-in-memo.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: file_markdown_preview_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-2601
- Plans/FileManager.md#F-028
- Plans/FileManager.md#F-043
- Plans/FileManager.md#F-070
- Plans/rewrite-tie-in-memo.md#RTIM-033
preserved_exact_tokens:
- "4 KiB"
- "128 KiB"
- "inert"
- "2026-11-23T14:05/README.md"
- "PreviewSession"
- "Select All"
negative_constraints:
- Do not allow inert Markdown previews to perform network or filesystem fetches, activate link navigation, or expose content mutation actions.
- Do not add a user toggle, command, or Settings row for inert mode; derive it automatically from F-070 preview_untrusted and §11.5 snapshot identity.
- Do not strip :line[:col] suffixes from image paths or misparse colons in literal filenames, timestamped folders, or Windows drive letters as locators or URL schemes.
- Do not exceed F-028 hard file caps, scan past truncation for reference definitions, or break full-admitted-range Select All when chunking large Markdown previews.
owner_hints:
- Plans/FileManager.md
- Plans/Automated_Testing_System.md#ATS-086
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-2601, ContractName:Plans/DRY_Rules.md#DR-093, ContractName:Plans/assistant-chat-design.md#ACD-641, ContractName:Plans/assistant-chat-design.md#ACD-643, ContractName:Plans/rewrite-tie-in-memo.md#RTIM-033, ContractName:Plans/Automated_Testing_System.md#ATS-086
