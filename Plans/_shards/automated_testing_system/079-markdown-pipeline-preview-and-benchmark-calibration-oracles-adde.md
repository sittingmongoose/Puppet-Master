# Shard 079: Markdown Pipeline, Preview, And Benchmark Calibration Oracles Addendum (2026-11-23, DL-2601)

Source: `Plans/Automated_Testing_System.md`

Source lines: L16336-L16492

Source SHA256: `bfe1f88f8f06d79c825a512e7a86472961c45194610f6c9b29ea6c9932314493`

---

## Markdown Pipeline, Preview, And Benchmark Calibration Oracles Addendum (2026-11-23, DL-2601)

### ATS-086 - Markdown Streaming, Provenance, Preview, And Benchmark Calibration Oracles

```yaml
plan_unit_id: ATS-086
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  DL-2601 requires automated test oracles and benchmark discipline across the standalone shared Rust Markdown pipeline
  (DR-093, ACD-641..643), command-catalog gating (UCC-074, ACD-638), FileManager previews (F-162), GUI rendering
  targets (F3-304, F3-380, F3-414, F3-583), replay convergence (SIR-005), and release-gate telemetry (ATS-023,
  ATS-024): (1) UTF-8 scalar-boundary prefix-equivalence oracle: buffering incomplete UTF-8 byte sequences across
  arbitrary chunk partitions, for every valid UTF-8 scalar-boundary prefix of Markdown streaming fixtures (including
  CRLF, leading BOM, emoji, CJK-flanked emphasis asserting exact bold/emphasis output for **重要。**请阅读。,
  CJK/Arabic bare-URL boundaries, BiDi RTL-with-Latin-lead paragraphs, chip punctuation binding, duplicate heading
  slugs, late link and footnote definitions, table delimiter rows, --- thematic-break and setext underlines, HTML
  comments, lazy list/blockquote continuations, lists turning loose, fast-path boundary splits including pending
  "1" + ". Install the tool" and pending "see ww" + "w.example.com", open code fences, GitHub alerts, ★ Insight
  callouts, and Codex directives/citations), incremental block-sealed rendering produces normalized shared Rust IR
  trees, block identities, and source byte spans identical to a fresh whole-prefix parse (including cache rebinding
  across late definitions and subjects), while surface-specific Slint and Leptos layout invariants are asserted
  separately; stopping or erroring inside an unclosed Mermaid fence without another source byte keeps the identical
  raw fenced source frame across complete, stopped, steered, and error terminal states (ACD-470). (2) Block
  render-count and selection-preservation oracles: streaming 30 completed paragraphs renders each finished block
  once with zero cache-promotion double-renders; cmd.chat.insert_code_block and cmd.chat.apply_code_block enforce
  code_block_fence_closed (UCC-074, ACD-638) while cmd.chat.copy_code_block stays available on open fences copying
  raw source bytes received so far; active user text selection survives streaming settlement in both prose and code
  blocks (line-based node identity preserved) and survives virtualized row scrolling via (message_id, source_offsets)
  with at most 2 pinned endpoint rows inside ACD-236 and model-backed multi-row copy (ACD-642). (3) Security,
  provenance, SVG, math, and replay overflow oracles: authored raw HTML containing forged data-pm-node-id,
  data-pm-source-start, data-pm-source-end, data-pm-parse-revision, data-pm-capabilities, data-pm-math-tex,
  data-pm-code-source, id, class, directive, or math-SVG markup loses all trust and fails closed with
  unsupported_region on preview edits (RTIM-027, RTIM-033, ACD-641); positive ammonia sanitizer tests verify all
  <style> elements and inline style attributes, authored id/class, form/media tags, img[srcset]/sizes, raw
  <svg>/<math>, and raw title attributes are stripped in message-flow Markdown while CommonMark link and abbr titles
  feed the shared tooltip controller and parser-only heading/footnote #fragment anchors navigate cleanly; URL tests
  trim ASCII whitespace and inspect normalized copies without rewriting displayed text, preserve Windows drive
  paths, block UNC network fetches, reject control-char/leading-space scheme smuggling, backslash-normalized //host,
  javascript:/vbscript:/data: navigations, ~/ and unauthorized remote image fetches, and <picture><source> leaks,
  and verify [note](notes:12) through full sanitization and activation with both notes and notes:12 present
  (ACD-643, F-162); image-trust tests verify F-035 authorization on both an authorized and an out-of-scope registered
  pm_artifact image across desktop and web plus decode-bomb limits (<=4096x4096 px / 64 MiB RGBA); SVG tests verify
  non-empty rendered geometry for a valid Mermaid flowchart with arrowheads and math fraction + square-root fixtures
  plus zero external network requests from fill="url(https://...)" or desktop usvg ImageHrefResolver; Mermaid tests
  confirm SVG text labels with inlined F3-425 theme attributes, links/external images disabled, closed-fence
  raw-source streaming across terminal states, visible F3-304 malformed-Mermaid error cards for closed invalid
  fences distinct from lazy-chunk init failure notices (including delayed lazy-chunk load when the closing fence
  arrives in the final chunk, F3-583), and cmd.chat.search source lookup for chat-mounted diagrams (F3-304);
  automatic inert preview tests (F-070 preview_untrusted and FileManager §11.5 snapshots) prove zero
  network/filesystem fetches and suppressed mutation actions (F-162); math tests verify Pandoc unescaped $ rules
  with odd and even backslash runs (\$ literal, \\$x$ opening math, $5 and $10 literal) across chunk splits,
  \(...\) and \[...\] extensions, fenced math blocks (info string "math"), 16,000-byte / 48-depth / 4,096-node / 2048x2048-px caps with
  raw-TeX fallback, and data-pm-math-tex copy-back (ACD-643, F3-414); and SIR-005 live-buffer overflow tests
  deliberately separate the durable applied cursor from the buffered cursor range upper bound (e.g. applied=100,
  buffered upper bound=110) and prove zero events 101-110 are skipped on recovery. (4) Adversarial, scaling, memory,
  and preview oracles: linear-time caps enforce <=250 nesting levels, <=512 table columns, <=524,288 auto-filled
  table cells, 400k repeated '[' inputs, randomized reference-label hashing, and bounded syntect highlighting
  (1,000-byte line cap, 64-depth scope stack cap, 250,000-byte fence cap, 2 MiB live-checkpoint budget, including a
  1,001-byte line opening a multiline comment) degrading cleanly to plain monospace for the remainder of the fence
  until a known lexer checkpoint; single growing message scaling across 16,384 / 65,536 / 262,144 characters passes
  linear/sub-quadratic growth (T(4N)/T(N) <= 6), and a 2,048-append test verifies desktop scratch-arena shrinking
  above 8 MiB, peak live memory, and post-release idle RSS settling within warmed baseline + 10 MiB (parse LRU) +
  50 MiB (highlight LRU) + 2 MiB (live checkpoints) + 8 MiB (hot messages) + 8 MiB allocator tolerance (and Leptos
  Wasm <=4 MiB aggregate cache or daemon-offloaded); and large Markdown previews verify F-028 hard caps, 4 KiB /
  128 KiB UTF-8 byte chunking, admitted-buffer-only reference propagation (with a fixture placing a definition
  immediately beyond truncation and asserting it stays unresolved), Select All full admitted range copy,
  writable-only RTIM-033 checkbox edits, literal image paths, and literal-first path disambiguation covering POSIX
  notes:12 versus 2026-11-23T14:05/README.md:42:7, root-level README.md, Windows roots, UNC blocks, and spaces
  (F-162). (5) Pinned corpus equivalence and separated benchmark verdicts: any parser crate upgrade or owner-approved
  replacement passes a real-corpus equivalence diff against a CI-fetched or dev-only corpus pinned by immutable
  revision and SHA-256 digest (recording baseline parser version, option set, and zero unapproved semantic diffs;
  @pierre/words may be used strictly as an unshipped dev-only CI comparator shipping zero product bytes; never copy
  CC BY-SA 4.0 third-party spec JSON into Puppet Master fixtures); turn-pipeline benchmarks separately record
  send-to-provider-request, final-provider-byte-to-client-completion, snapshot bytes, and first readable paint;
  storage release gates (ATS-024) use host load (loadavg <= core_count * 0.75) and same-build A/A noise calibration
  (spread <= 5% or <= 2 ms) for run validity ONLY (noisy/overloaded runs are marked inconclusive and rerun; valid
  runs pass/fail solely against the unchanged 150 ms p95 / 50 ms p99 gates); and Markdown/turn-pipeline relative
  regression checks run separately on valid runners against a pinned prior-commit baseline, emitting a distinct
  markdown_regression verdict that fails when regression exceeds max(A/A p99 spread, 5%). Static plan text claims no
  native runtime execution proof.
gui_related: true
gui_classification_reason: Governs automated GUI rendering, streaming, selection, copy-fidelity, preview, and pre-WASM smoke oracles across Slint and Leptos.
split_recommended: false
depends_on:
- DL-2601
- DR-093
- UCC-074
- ACD-638
- ACD-641
- ACD-642
- ACD-643
- F-035
- F-162
- F3-304
- F3-380
- F3-414
- F3-583
- SIR-005
- ATS-023
- ATS-024
unblocks: []
acceptance_criteria:
- "Every valid UTF-8 scalar-boundary prefix of streaming Markdown fixtures (including table delimiters, ---, HTML comments, lazy continuations, pending '1' + '. Install the tool', pending 'see ww' + 'w.example.com', and **重要。**请阅读。) matches a fresh whole-prefix parse in normalized shared Rust IR and spans, unclosed Mermaid fences stay raw source across terminal states, and 30 streamed paragraphs pass the block render-count check with zero double-renders."
- "Active text selection survives streaming settlement (prose and code) and virtualized scrolling with at most 2 pinned endpoint rows and model-backed multi-row copy; cmd.chat.insert_code_block/apply_code_block enforce UCC-074 code_block_fence_closed while cmd.chat.copy_code_block stays open-fence available; copy preserves raw source bytes (data-pm-code-source, data-pm-math-tex)."
- "Forged raw-HTML data-pm-*/id/class/directive/math-SVG, positive ammonia allowlist, heading/footnote #fragment anchors, URL/UNC/img[srcset]/[note](notes:12) dispatch, F-035 authorized vs out-of-scope pm_artifact images and decode-bomb caps, SVG flowchart/fraction/sqrt geometry + zero external url(...) + desktop usvg local-file refusal, automatic inert-preview zero-fetch, closed Mermaid error card vs delayed lazy-chunk web load, Pandoc odd/even backslash $ and math caps, and SIR-005 overflow (applied cursor != buffered cursor range upper bound) tests pass."
- "Adversarial linear-time caps, bounded syntect plain-suffix degradation after multiline-comment >1,000-byte lines and 2 MiB live-checkpoint budget, 16k/64k/256k scaling (T(4N)/T(N) <= 6), 2,048-append numeric post-release RSS ceiling and Wasm <=4 MiB checks, F-028/4 KiB/128 KiB preview chunking with out-of-range definition truncation check, and literal-first notes:12 vs 2026-11-23T14:05/README.md:42:7 path disambiguation pass."
- "Parser upgrades pass revision/SHA-256-pinned real-corpus equivalence with zero unapproved diffs and zero copied CC BY-SA 4.0 spec corpora; ATS-024 uses host load and A/A noise calibration for run validity only against unchanged 150 ms p95 / 50 ms p99 gates while ATS-086 emits a separate markdown_regression verdict against a pinned baseline."
- "No WorkNodes, NodeSeeds, executable queues, implementation files, or governance reseals are created by this unit."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: unverified_streaming_sanitization_or_benchmark_regression
reasoning_tier: high
context_scope: markdown_streaming_and_preview_hardening_20261123
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/FileManager.md
- Plans/Shared_Integration_Runtime.md
node_compile_hint:
  mode: owner_validation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-2601
- Plans/DRY_Rules.md#DR-093
- Plans/UI_Command_Catalog.md#UCC-074
- Plans/assistant-chat-design.md#ACD-641
- Plans/assistant-chat-design.md#ACD-642
- Plans/assistant-chat-design.md#ACD-643
- Plans/FileManager.md#F-162
- Plans/Shared_Integration_Runtime.md#SIR-005
preserved_exact_tokens:
- "prefix-equivalence"
- "render-count"
- "data-pm-source-start"
- "unsupported_region"
- "2026-11-23T14:05/README.md"
- "A/A noise calibration"
- "CC BY-SA 4.0"
negative_constraints:
- Do not copy CC BY-SA 4.0 third-party CommonMark/GFM spec corpora into Puppet Master fixtures.
- Do not ship @pierre/words in product builds; any CI differential oracle use must ship zero product bytes.
- Do not widen the 150 ms p95 or 50 ms p99 release gates or allow noisy/overloaded benchmark runs to satisfy a gate instead of failing as inconclusive.
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/FileManager.md
- Plans/Shared_Integration_Runtime.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-2601, ContractName:Plans/DRY_Rules.md#DR-093, ContractName:Plans/assistant-chat-design.md#ACD-641, ContractName:Plans/assistant-chat-design.md#ACD-642, ContractName:Plans/assistant-chat-design.md#ACD-643, ContractName:Plans/FileManager.md#F-162, ContractName:Plans/FinalGUISpec.md#F3-304, ContractName:Plans/FinalGUISpec.md#F3-414, ContractName:Plans/FinalGUISpec.md#F3-583, ContractName:Plans/Shared_Integration_Runtime.md#SIR-005
