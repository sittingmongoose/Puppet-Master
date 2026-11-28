# Shard 081: Markdown Pipeline, Streaming Correctness, Sanitization, And Math Addendum (2026-11-23, DL-2601)

Source: `Plans/assistant-chat-design.md`

Source lines: L33493-L33870

Source SHA256: `d1e223940532c46a95560fcdb33453ff83f1d46607025003fcd20cb1aca0e1cb`

---

## Markdown Pipeline, Streaming Correctness, Sanitization, And Math Addendum (2026-11-23, DL-2601)

This addendum records the canonical owner contracts adopted under `Plans/Decision_Log.md#DL-2601` and `Plans/DRY_Rules.md#DR-093` for Puppet Master's standalone shared Rust Markdown pipeline, streaming block sealing, incremental syntax highlighting, bounded caches, sanitizer/URL/image/SVG allowlists, and TeX-to-SVG math rendering across Slint desktop (`F3-582`) and Leptos web (`F3-583`). It introduces no new command ID, event family, Settings row, native runtime execution claim, or governance reseal.

### ACD-641 - Shared Rust Markdown Pipeline, Provenance, Parser Caps, And Agent Syntax

```yaml
plan_unit_id: ACD-641
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Puppet Master's Markdown pipeline lives in one standalone shared Rust Markdown crate linked by both the shared
  interface-model crate and the local daemon (DR-093, F3-583, DL-2601), built strictly on pulldown-cmark (RTIM-029;
  any future parser replacement such as comrak requires a new owner decision switching every consumer at once and
  passing the ATS-086 corpus gate). Because pulldown-cmark emits an event stream with byte offsets rather than an
  AST, the shared crate builds and retains a typed Rust Markdown IR tree as the sole query surface (for HTML
  comments, reference definitions, math ranges, and structured directives—never ad-hoc regexes over raw Markdown),
  with deterministic bounded extensions layered cleanly on top: GFM tables, strikethrough, tasklists, footnotes,
  bounded post-pass GFM bare-URL autolinking over plain text outside code spans/fences/links (stopping cleanly
  before trailing CJK, Arabic, and ASCII punctuation), CJK-flanked emphasis (**重要。**请阅读。), Pandoc $ and
  \(...\)/\[...\] math delimiters (ACD-643), GitHub alerts, ★ Insight callouts, and Codex file citations/directives
  (while ::: fences stay literal text and act only as a whole-document fallback trigger unless a future owner
  decision admits container directives). That one parse feeds chat and subagent transcripts (DR-052) on Slint
  StyledText/native cards (F3-582) and Leptos web elements (F3-583), daemon Tantivy search text indexing (ACD-061),
  clipboard copy, FileManager/generated previews (F-162, RTIM-027), and future composer detection. Parser provenance
  is a security boundary: only parser-emitted typed IR byte spans may carry trusted metadata (data-pm-node-id,
  data-pm-block-kind, data-pm-source-start, data-pm-source-end, data-pm-parse-revision, data-pm-capabilities,
  parser-only prefixed id and pm-md-* structural class tokens, directive payloads, data-pm-math-tex, and
  data-pm-code-source); raw HTML events can never claim or forge those attributes, and any authored markup
  attempting to inject them is stripped and loses all trust (RTIM-027, RTIM-033). Hard adversarial caps prevent parser or layout DoS and degrade cleanly to raw source/plain text without
  panicking or OOM: container nesting depth <=250, table columns <=512, auto-filled sparse table cells <=524,288
  (subsequent rows parse as normal Markdown text), link/footnote reference label length <=999 chars with a
  per-instance randomized reference-label hash seed, code-span backtick runs <=255, open bracket stack <=256 per
  leaf, and native desktop scratch-arena shrinking above 8 MiB on subsequent small inputs (Leptos WebAssembly memory
  is bounded separately per ACD-642/F3-583 because WASM linear memory never shrinks). Agent-authored and rich-text
  fidelity rules cover single-tilde literal preservation in user bubbles, Windows path preservation (C:\..., UNC
  literal display with network fetches blocked per ACD-643), CJK-flanked emphasis (**重要。**请阅读。), BiDi
  per-block RTL direction when opening with Latin/technical tokens, inline chip punctuation binding so line-wrap
  never strands trailing punctuation, GitHub alerts, provider-emitted structured syntax (★ Insight callouts, Codex
  file citations/directives), and exact raw-source-byte code-block copy via data-pm-code-source (never reading
  rendered DOM textContent, F3-414).
gui_related: true
gui_classification_reason: Defines shared Markdown parsing, typed IR provenance, DoS degradation, agent-syntax formatting, and source-byte copy fidelity across desktop and web chat/preview surfaces.
split_recommended: false
depends_on:
- DL-2601
- DR-093
- RTIM-027
- RTIM-029
- F3-414
unblocks: []
acceptance_criteria:
- "One standalone shared Rust Markdown crate on pulldown-cmark constructs a typed Rust IR tree with bounded GFM bare-URL autolinking (CJK/Arabic/ASCII boundaries), CJK-flanked emphasis, math delimiters, and agent-syntax extensions feeding desktop, web, daemon Tantivy search text, copy, previews, and composer detection."
- "Parser provenance prevents raw HTML from forging data-pm-* attributes, directives, data-pm-math-tex, or data-pm-code-source wrappers."
- "Adversarial parser caps (250 nesting, 512 cols, 524,288 auto-cells, 999-char labels with randomized hash seed, 255 backticks, 256 brackets, native desktop arena shrinking above 8 MiB) fail closed to plain text/source without panic or unbounded RSS."
- "Agent syntax (★ Insight, Codex citations/directives, GitHub alerts), user-message single-tilde, Windows paths, CJK emphasis, BiDi RTL-with-Latin-lead, chip punctuation binding, and raw-source code-block copy are handled through the typed Rust IR tree."
- "No WorkNodes, NodeSeeds, executable queues, implementation files, or governance reseals are created by this unit."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: parser_provenance_dos_or_syntax_drift
reasoning_tier: high
context_scope: markdown_streaming_and_preview_hardening_20261123
implementation_surfaces:
- Plans/assistant-chat-design.md
- Plans/DRY_Rules.md
- Plans/FinalGUISpec.md
- Plans/rewrite-tie-in-memo.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: shared_markdown_pipeline_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-2601
- Plans/DRY_Rules.md#DR-093
- Plans/rewrite-tie-in-memo.md#RTIM-029
preserved_exact_tokens:
- "pulldown-cmark"
- "data-pm-source-start"
- "524,288"
- "★ Insight"
- "BiDi"
- "CJK"
negative_constraints:
- Raw HTML MUST NEVER forge or claim parser-emitted data-pm-*, directive, or math/code copy metadata.
- Do not copy code blocks from rendered DOM textContent; always copy exact canonical source bytes.
- Do not replace typed Rust IR queries for comments, reference definitions, math ranges, or directives with ad-hoc regexes over raw Markdown.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/DRY_Rules.md#DR-093
- Plans/Automated_Testing_System.md#ATS-086
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-2601, ContractName:Plans/DRY_Rules.md#DR-093, ContractName:Plans/FinalGUISpec.md#F3-414, ContractName:Plans/rewrite-tie-in-memo.md#RTIM-027, ContractName:Plans/rewrite-tie-in-memo.md#RTIM-029, ContractName:Plans/Automated_Testing_System.md#ATS-086

### ACD-642 - Intra-Message Block Sealing, Streaming Highlighting, Caches, And Selection Pinning

```yaml
plan_unit_id: ACD-642
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Streaming chat rendering (§24.1-§24.3, ACD-238, ACD-239, ACD-240, ACD-243, ACD-470, DL-2601) enforces
  intra-message incremental efficiency without breaking exact prefix equivalence or selection: (1) Parser-confirmed
  block sealing, fallback, and rebinding: seal only parser-confirmed closed top-level blocks (stable)—a blank line
  closes open blocks only once the next non-blank line is confirmed to start a new top-level block, because list
  continuations, indented code, and loose-list transitions can reopen containers—and reparse only the open trailing
  suffix (pending). Validated plain single-line paragraphs and top-level open code fences may take a literal-append
  fast path ONLY when evaluating the pending line plus incoming chunk together (never the incoming chunk alone)
  proves literal continuation and contains none of the trigger conditions (\r, \n, `, ~, *, _, [, ], (, ), <, >, \,
  $, !, #, -, +, =, |, :, &, @, http://, https://, www., a '.' when the pending line starts with <=3 spaces plus
  1-9 ASCII digits or ends in a partial www/http/https token, or CJK punctuation adjacent to */_); this trigger set
  is necessary but not sufficient—whenever literal continuation cannot be proven, reparse the pending block, with
  ATS-086's prefix-equivalence oracle authoritative. Unseal and fall back to whole-message parsing whenever
  document-wide syntax can retroactively alter earlier blocks—a non-exhaustive trigger set enforced by ATS-086's
  prefix-equivalence oracle that includes link reference definitions, footnote definitions/references, raw HTML
  blocks, HTML comments (<!--), :::, $$ display math, table delimiter rows, --- thematic-break/setext underlines,
  lazy list/blockquote continuations, lists turning loose, and duplicate heading slugs. Cached block parses are
  keyed by (option_set, document_context_fingerprint, block_source) and MUST rebind source byte spans, parse/source
  revisions, resolved references, and edit capabilities to the current subject before reuse. (2) Zero-double-render
  cache promotion and context decoupling: never cache the open pending suffix; promote newly finished blocks into
  the parse cache without changing component/node identity or causing a redundant second render pass; decouple
  derived context keys (such as extracted file-link sets) from raw streaming text so chunks adding no links do not
  invalidate sibling interactive widgets. (3) Strict ACD-470 settled-frame identity: exact prefix rendering is the
  sole canonical streaming behavior so the settled message is strictly identical to the final streamed frame across
  complete, stopped, steered, and error terminal states; speculative closer injection and mid-stream
  incomplete-inline repair are forbidden (any future change requires a separate owner decision preserving
  identical-frame settlement). (4) Closed-fence gating: within UCC-074 preconditions (UI_Command_Catalog.md:991-993,
  ACD-638), code-block mutation actions (cmd.chat.insert_code_block, cmd.chat.apply_code_block) require
  code_block_fence_closed, while cmd.chat.copy_code_block stays available even on open fences copying exact raw
  source bytes received so far (fence closure grants no execution authority). Closed-fence raw-source streaming is
  the sole streaming Mermaid behavior: while a Mermaid fence is open (including when a turn terminates in complete,
  stopped, steered, or error with the fence still unclosed), hold raw fenced source so no malformed-Mermaid error
  card flashes mid-stream or swaps at settle; render either the native card or the visible F3-304 error state only
  for closed Mermaid fences, and expose searchable diagram source through cmd.chat.search (§24.4.3, ACD-247). (5)
  Deterministic incremental syntect highlighting: key highlight palettes to the active F3-425 theme family/variant
  tokens (all ten variants across five families), maintain per-line ParseState/HighlightState checkpoints per open
  fence with convergent-state early exit under an explicit 2 MiB app-global live-checkpoint byte budget (evicting
  oldest checkpoints and degrading to plain monospace until fence close if exhausted), group code lines into
  64-line layout buckets, preserve line-based node identity across stream settlement so active text selection is
  not cleared, and enforce deterministic, interruptible pre/between-line tokenization caps (compatible with
  syntect::parse_line: max 1,000 bytes per line, max 64 nested scope-stack depth checked between lines, and max
  250,000 tokenized bytes per open fence—never wall-clock timers); once any line inside a fence exceeds a cap and
  degrades to plain monospace, keep the remainder of that fence plain monospace until a known lexer checkpoint so
  skipped multiline comments or strings cannot corrupt subsequent highlighting. (6) Bounded app-global caches and
  2-endpoint selection pinning: derived render caches live under separate app-global budgets outside ACD-243's
  per-thread 200-message / 8 MB loaded-page cap—on native desktop, one aggregate completed-block parse LRU across
  all option-sets is capped at 10 MiB retained bytes (~500,000-524,288 source chars at ~20 B/char, rejecting any
  single block over 25% of budget = 2.5 MiB / ~131,072 chars), one app-global 500-entry / 50 MiB finished highlight
  LRU keyed by (content_hash, language, theme_variant), and the 2 MiB live-checkpoint budget above; on Leptos
  WebAssembly (F3-583), parsing and highlighting either execute on the trusted local daemon or stay within a strict
  4 MiB aggregate client Wasm derived-cache cap. Preserve multi-row user text selection by (message_id,
  source_offsets), pin at most the 2 selection-endpoint rows (start and end) within ACD-236 during scroll/recycling
  while reading multi-row copies from the thread model, assign distinct height-estimation buckets (<2 KiB standard,
  2-16 KiB medium, >16 KiB oversized), and render passive prose as static text runs with minimal interactive islands
  and one shared tooltip controller per message.
gui_related: true
gui_classification_reason: Defines visible chat streaming block updates, closed-fence Mermaid/action behavior, syntax highlighting stability, selection pinning, and shared tooltip/island layout.
split_recommended: false
depends_on:
- DL-2601
- UCC-074
- ACD-236
- ACD-238
- ACD-239
- ACD-240
- ACD-243
- ACD-470
- ACD-638
- F3-425
- RTIM-029
unblocks: []
acceptance_criteria:
- "Intra-message streaming seals only parser-confirmed closed top-level blocks, evaluates the fast-path guard over pending line plus incoming chunk (necessary but not sufficient; ATS-086 authoritative), unseals and falls back on non-exhaustive cross-block syntax, rebinds spans/revisions/references/capabilities on cache reuse, and matches a fresh whole-prefix parse at every UTF-8 scalar boundary."
- "Promoting a completed block into the parse cache triggers zero redundant re-renders; open streaming tails are never cached; derived link keys stay decoupled from raw text."
- "Exact prefix rendering is the sole streaming behavior (no incomplete-inline repair); open Mermaid fences stay raw source across complete, stopped, steered, and error; within UCC-074 preconditions cmd.chat.insert_code_block and cmd.chat.apply_code_block enforce code_block_fence_closed while cmd.chat.copy_code_block stays open-fence available."
- "Incremental syntect highlighting keys to active F3-425 theme tokens, uses per-line checkpoints under a 2 MiB app-global live-checkpoint budget with convergent-state exit, 64-line buckets, line-identity preservation across settlement, and deterministic 1,000-byte line / 64-depth / 250,000-byte fence plain-suffix degradation until a known lexer checkpoint."
- "App-global derived caches enforce one aggregate desktop parse LRU (10 MiB / ~500,000-524,288 chars, <=25% = 2.5 MiB per entry), a 500-entry / 50 MiB highlight LRU, and a 2 MiB live-checkpoint budget (Leptos Wasm <=4 MiB aggregate or daemon-offloaded), selection keeps (message_id, source_offsets) with at most 2 pinned endpoint rows in ACD-236 and model-backed copy, and one shared tooltip controller serves each message."
- "No WorkNodes, NodeSeeds, executable queues, implementation files, or governance reseals are created by this unit."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: streaming_jank_selection_loss_or_cache_thrash
reasoning_tier: high
context_scope: markdown_streaming_and_preview_hardening_20261123
implementation_surfaces:
- Plans/assistant-chat-design.md
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: streaming_markdown_and_highlight_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-2601
- Plans/assistant-chat-design.md#ACD-238
- Plans/assistant-chat-design.md#ACD-470
- Plans/UI_Command_Catalog.md#UCC-074
preserved_exact_tokens:
- "stable"
- "pending"
- "64-line"
- "1,000"
- "500,000"
- "50 MiB"
- "convergent-state"
negative_constraints:
- Do not cache the mutable open streaming suffix or allow a single block over 25% of cache budget to evict the parse cache.
- Do not inject speculative closing delimiters or incomplete-inline repair during streaming, or clear active user text selection on stream settlement or virtualized row recycling.
- Do not instantiate one tooltip widget per link, file chip, or code-block button inside a message.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/UI_Command_Catalog.md#UCC-074
- Plans/FinalGUISpec.md#F3-304
- Plans/Automated_Testing_System.md#ATS-086
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-2601, ContractName:Plans/DRY_Rules.md#DR-093, ContractName:Plans/UI_Command_Catalog.md#UCC-074, ContractName:Plans/FinalGUISpec.md#F3-304, ContractName:Plans/FinalGUISpec.md#F3-425, ContractName:Plans/rewrite-tie-in-memo.md#RTIM-029, ContractName:Plans/Automated_Testing_System.md#ATS-086

### ACD-643 - Shared Rust Sanitizer Allowlist, URL And Image Trust Policy, And TeX Math Rendering

```yaml
plan_unit_id: ACD-643
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Reconciling ACD-294, F3-380, and RTIM-029 (DL-2601, DR-093), DOMPurify DEFAULT_ALLOWED_TAGS is the conceptual
  HTML5 safe-tag baseline implemented canonically in Rust by ammonia inside the standalone shared Markdown crate for
  both Slint desktop and Leptos web (never JS DOMPurify as a product owner or Slint path). (1) Explicit positive
  per-context element and attribute allowlist: in message-flow Markdown and generated Markdown previews, ammonia
  permits ONLY these HTML elements—p, br, hr, h1-h6, blockquote, pre, code, ul, ol, li, dl, dt, dd, table, thead,
  tbody, tfoot, tr, th, td, strong, b, em, i, del, s, sub, sup, mark, kbd, abbr, span, div, details, summary, a, img,
  and parser-emitted input[type="checkbox"] (read-only/disabled in chat and inert previews; interactive solely
  through RTIM-033 toggle_checkbox in writable FileManager previews). Permitted per-tag attributes are ONLY:
  a[href] (CommonMark link titles and abbr titles feed the shared tooltip controller via pipeline metadata, never
  raw title attributes), img[src, alt, width, height] (never srcset or sizes), th/td[colspan, rowspan, align],
  ol[start], input[type, checked, disabled] (parser-emitted checkboxes only), abbr[aria-label], global
  dir/lang/aria-label/aria-hidden, plus strictly parser-only attributes that authored raw HTML can NEVER claim or
  inject (ACD-641): prefixed anchor ids on headings and footnote refs/defs (id="pm-h-*", id="pm-fn-*",
  id="pm-fnref-*"), closed structural class tokens prefixed pm-md-* (pm-md-alert, pm-md-callout, pm-md-chip,
  pm-md-code, pm-md-math, pm-md-footnote, pm-md-task; authored raw HTML class and id attributes are always stripped
  so raw HTML cannot spoof alerts, callouts, chips, or anchor targets), and source/copy metadata (data-pm-node-id,
  data-pm-block-kind, data-pm-source-start, data-pm-source-end, data-pm-parse-revision, data-pm-capabilities,
  data-pm-math-tex, data-pm-code-source). All other elements and attributes are stripped or rendered as literal
  escaped text, explicitly including script, iframe, object, embed, style elements AND inline style attributes in
  message-flow Markdown (host-injected --pm-viz-* inline style stays strictly on sandboxed inline visualizer
  containers per §28.2), form, button, select, textarea, video, audio, track, meta, base, link, area, raw authored
  svg and math, all on* handlers, srcdoc, formaction, srcset, sizes, and raw title attributes. Slint desktop maps
  the typed Rust IR tree directly onto Slint StyledText and native cards (F3-582), and any element outside the
  positive allowlist or unmappable to native presentation renders as literal escaped text identically on both Slint
  and Leptos. Generated math and Mermaid SVGs go through a typed Rust SVG builder plus the strict SVG allowlist
  below, never ammonia. (2) Unified non-mutating Rust URL and link dispatch: scoped to user/content-authored URLs
  (separate from the app-controlled pm-preview://session/<preview_session_id>/ origin in RTIM-027) and consumed by
  both Slint link clicks and Leptos sanitization; classifies a normalized copy without ever rewriting displayed link
  text or canonical source bytes, and navigation/HTML emission MUST use ONLY the validator's canonicalized output in
  exact order: (a) trim leading/trailing ASCII whitespace (0x20, \t, \r, \n) and strip ASCII control characters
  (0x00-0x1F, 0x7F); (b) detect Windows drive paths (C:\...) and UNC paths (\\host\share) BEFORE backslash
  conversion so drive letters are never misclassified as URL schemes and literal display text is preserved while UNC
  paths classify as blocked network targets (preventing Windows credential leaks); (c) on non-drive/non-UNC copies,
  normalize backslashes to forward slashes and unconditionally reject protocol-relative //host and forbidden schemes
  (javascript:, vbscript:, data:); (d) resolve in-document fragment links (#pm-h-*, #pm-fn-*, #pm-fnref-*) strictly
  against parser-emitted heading/footnote ids in the current IR tree (unresolved fragments stay non-navigable); (e)
  for links carrying an explicit allowed web scheme (https:, http:, mailto:) emit the validated web URL; (f) for
  preview/file-context links without an explicit allowed web scheme, dispatch to the subject-bound F-162
  literal-first FileManager resolver BEFORE unknown-scheme rejection (so literal POSIX siblings such as notes:12
  and timestamped paths such as 2026-11-23T14:05/README.md resolve to typed PM internal routes registered by
  FileManager/UI_Command_Catalog rather than failing as unknown schemes); and (g) render any remaining unknown-scheme
  or unresolved link as non-navigable plain text. (3) Closed image trust classes ("rendering is not a click") and
  SVG hardening: classify every image source into exactly one of four closed classes in strict precedence order (no
  undefined override or new Settings row)—FIRST, inside an automatic inert preview (F-162), classify every image as
  blocked; OTHERWISE classify in order: workspace_local (canonicalized path resolving strictly inside the active
  Project root or authorized Computer root; escaping symlinks and ~/ home paths are blocked), pm_artifact (ONLY
  after the existing F-035 artifact resolver authorizes the current subject, active execution_role, and
  approval_scope BEFORE reading or serving bytes; any registered artifact failing F-035 authorization classifies as
  blocked), inline_data_image (data:image/png, data:image/jpeg, data:image/gif, or data:image/webp up to 4 MiB
  decoded; never data:image/svg+xml), or blocked (all ~/ paths, UNC \\host\share targets, arbitrary remote
  http/https image URLs, and denied artifacts). Enforce decode-bomb caps across ALL admitted image classes
  (<=4096x4096 px and <=64 MiB decoded RGBA; overshoot fails cleanly to placeholder/alt text). Lift
  <picture><source media="(prefers-color-scheme: dark|light)"> onto validated dark/light image metadata through
  those same classes, drop all <source> elements, and strip img[srcset]/img[sizes] so zero unresolved URLs can leak
  fetches. Mermaid diagrams disable interactive links and external images, emit SVG text labels (foreignObject
  stripped), and inline active F3-425 theme colors directly onto SVG presentation attributes (no <style> elements);
  both Slint desktop and Leptos web validate generated SVGs before either renderer through one explicit per-element
  geometry + presentation allowlist: allowed elements—Mermaid (svg, g, text, tspan, rect, path, circle, ellipse,
  line, polyline, polygon, defs, marker, clipPath) and math (svg, g, text, tspan, rect, path, line, plus defs/use
  if emitted by the selected math crate); allowed geometry/structure attributes—svg[viewBox, width, height, xmlns,
  role, aria-label], g[transform, clip-path], path[d, transform], rect[x, y, width, height, rx, ry, transform],
  circle[cx, cy, r, transform], ellipse[cx, cy, rx, ry, transform], line[x1, y1, x2, y2, transform],
  polyline/polygon[points, transform], text/tspan[x, y, dx, dy, text-anchor, dominant-baseline, transform],
  marker[id, viewBox, refX, refY, markerWidth, markerHeight, orient, markerUnits], clipPath[id, clipPathUnits],
  use[href]; allowed presentation attributes—fill, fill-opacity, fill-rule, stroke, stroke-width, stroke-opacity,
  stroke-linecap, stroke-linejoin, stroke-dasharray, opacity, font-family, font-size, font-weight, font-style,
  marker-start, marker-mid, marker-end, clip-path. Value safety: builder-emitted SVG id attributes MUST use a
  deterministic diagram-scoped prefix (pm-<diagram-hash>-...); fill, stroke, clip-path, marker-start/mid/end, and
  use[href] accept ONLY solid color/keyword values or builder-owned same-diagram fragment references
  url(#pm-<diagram-hash>-...) / #pm-<diagram-hash>-...; all external URLs, data: URLs, filter attributes, <style>,
  <script>, <foreignObject>, <image>, on* handlers, and external href/xlink:href are rejected before both Slint and
  Leptos, and desktop rasterization via resvg/usvg/tiny-skia MUST disable usvg's default filesystem/external
  ImageHrefResolver (returning None for all external/file image hrefs) so desktop SVG rasterization can never read
  local files. (4) First-class Rust TeX-to-SVG math rendering: uses a pre-build selected Rust TeX-to-SVG layout
  crate under RTIM-029 (zero KaTeX/MathJax JS/CSS dependency) shipping one bundled math font across both Slint
  desktop and Leptos web; supports full Pandoc unescaped $...$ inline math (unescaped means preceded by an even
  number of backslashes including zero, so \$ stays literal while \\$x$ opens inline math; opening $ followed by
  non-whitespace; closing unescaped $ not preceded by whitespace and not followed by an ASCII digit so $5 and $10
  stay literal), $$...$$ display math (no blank lines inside display blocks), \(...\) and \[...\] defined as an
  explicit parser extension over CommonMark backslash escapes, and fenced math code blocks (info string "math"); enforces hard numeric
  DoS caps of 16,000 bytes source, 48 nesting levels, 4,096 layout box/node arena entries, and 2048x2048 px maximum
  raster output, degrading overflow or parse failure cleanly to raw TeX code display; wraps rendered math in a
  parser-emitted copy-preserving wrapper carrying exact raw TeX source in data-pm-math-tex (F3-414); and keeps open
  inline $ as literal text until closed while streaming.
gui_related: true
gui_classification_reason: Governs shared chat/preview HTML/SVG sanitization, link/image trust behavior, Mermaid SVG safety, and TeX-to-SVG math display and copy behavior.
split_recommended: false
depends_on:
- DL-2601
- DR-093
- ACD-294
- F-035
- RTIM-027
- RTIM-029
- F3-380
- F3-425
- F3-582
- F3-583
unblocks: []
acceptance_criteria:
- "One explicit positive Rust ammonia element/attribute allowlist (denying all <style> elements and inline style attributes, authored id/class, media/form tags, img[srcset]/sizes, raw svg/math, and raw title attributes; permitting parser-only heading/footnote ids, closed pm-md-* structural classes, and tooltip metadata for links/abbr) and unified URL dispatch govern both Slint desktop and Leptos web without JS DOMPurify, keeping task checkboxes read-only in chat/inert previews and editable solely via RTIM-033 in writable previews."
- "URL dispatch trims ASCII whitespace on normalized copies without rewriting displayed text, preserves Windows drive paths, blocks UNC fetches, resolves same-document #pm-* anchors, dispatches preview links without explicit web schemes to F-162 before unknown-scheme rejection (allowing notes:12), emits only validated targets, enforces image-trust precedence (inert -> blocked; workspace_local; F-035 authorized pm_artifact before byte read; inline_data_image <=4 MiB; blocked) with <=4096x4096 px / 64 MiB RGBA decode-bomb caps, and strips <picture><source>/img[srcset]."
- "Generated Mermaid and math SVGs pass one explicit geometry + presentation allowlist (admitting only builder-owned same-diagram #pm-<diagram-hash>-* refs, inlined F3-425 Mermaid theme attributes, and zero external url(...), <style>, <foreignObject>, or <image> values before both Slint and Leptos) with desktop usvg local-file ImageHrefResolver disabled; TeX math uses a pre-build selected Rust TeX-to-SVG crate with one bundled math font under full Pandoc unescaped $ (odd/even backslash runs), \\(...\\)/\\[...\\], and fenced math (info string 'math') rules, 16,000-byte / 48-depth / 4,096-node / 2048x2048-px caps with raw-TeX fallback, and data-pm-math-tex clipboard copy."
- "No WorkNodes, NodeSeeds, executable queues, implementation files, or governance reseals are created by this unit."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: xss_ssrf_url_smuggling_or_math_dos
reasoning_tier: high
context_scope: markdown_streaming_and_preview_hardening_20261123
implementation_surfaces:
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/FileManager.md
- Plans/rewrite-tie-in-memo.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: shared_sanitizer_url_and_math_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-2601
- Plans/assistant-chat-design.md#ACD-294
- Plans/FileManager.md#F-035
- Plans/FinalGUISpec.md#F3-380
- Plans/rewrite-tie-in-memo.md#RTIM-029
preserved_exact_tokens:
- "ammonia"
- "DEFAULT_ALLOWED_TAGS"
- "rendering is not a click"
- "16,000"
- "48"
- "resvg"
- "usvg"
- "tiny-skia"
negative_constraints:
- Do not ship JS DOMPurify, KaTeX, or MathJax as core chat/preview Markdown dependencies.
- Do not permit raw HTML or Mermaid/math SVGs to contain <script>, <style>, <foreignObject>, on* handlers, or external URL/url(...) fetches, or leave usvg's default filesystem ImageHrefResolver enabled on desktop.
- Do not allow image rendering to read ~/ paths, bypass F-035 execution_role/approval_scope authorization, exceed decode-bomb limits, or fetch arbitrary remote/UNC URLs outside the four closed image trust classes.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md#F3-380
- Plans/FileManager.md#F-035
- Plans/Automated_Testing_System.md#ATS-086
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-2601, ContractName:Plans/DRY_Rules.md#DR-093, ContractName:Plans/FileManager.md#F-035, ContractName:Plans/FinalGUISpec.md#F3-304, ContractName:Plans/FinalGUISpec.md#F3-380, ContractName:Plans/FinalGUISpec.md#F3-414, ContractName:Plans/rewrite-tie-in-memo.md#RTIM-027, ContractName:Plans/rewrite-tie-in-memo.md#RTIM-029, ContractName:Plans/Automated_Testing_System.md#ATS-086
