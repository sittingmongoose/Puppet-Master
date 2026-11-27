# Shard 040: Shared Rust Markdown Pipeline Invariant Addendum (2026-11-23, DL-2601)

Source: `Plans/DRY_Rules.md`

Source lines: L5407-L5492

Source SHA256: `193ec4e4be174ed616d752a7772ac46ae739f451217df8f2ee945ee04ae73b86`

---

## Shared Rust Markdown Pipeline Invariant Addendum (2026-11-23, DL-2601)

### DR-093 - One Shared Rust Markdown Pipeline And Policy Owner

```yaml
plan_unit_id: DR-093
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Markdown parsing, typed Rust IR/source-span provenance, sanitization, URL/image trust validation, TeX-to-SVG math
  layout, Mermaid validation, and copy/plain-text extraction live in one standalone shared Rust Markdown crate linked
  by both Puppet Master's shared interface-model crate (F3-583, DL-139, DL-2601) and the local daemon (so daemon
  Tantivy search text indexing binds the same parser without pulling GUI dependencies), built strictly on the
  canonical Rust rendering stack (RTIM-029: pulldown-cmark with bounded deterministic extensions, syntect, ammonia,
  Mermaid validation, resvg/usvg/tiny-skia, and a pre-build selected Rust TeX-to-SVG layout crate with one bundled
  math font). Any future parser replacement (such as comrak) requires a new owner decision switching every consumer
  at once and passing the ATS-086 corpus gate; only one parser may ever be linked. Because pulldown-cmark emits an
  event stream with byte spans rather than an AST, the shared crate constructs and retains a typed Rust Markdown IR
  tree as the sole query surface for HTML comments, reference definitions, math ranges, and structured directives.
  That one pipeline feeds every consumer: chat and read-only subagent transcripts (DR-052) across Slint desktop
  StyledText/native cards (F3-582) and Leptos web elements (F3-583), FileManager and generated previews (F-162,
  RTIM-027), clipboard copy/serialization, and daemon Tantivy search-text projectors (ACD-061) plus future composer
  math/mention/directive consumers, all of which must bind DR-093. No consumer may ship a second Markdown parser, a
  separate web-only JavaScript/WebAssembly (JS/Wasm) Markdown engine, a second sanitizer allowlist, or ad-hoc regex
  scanners where the typed Rust IR tree is authoritative. All surfaces reuse the same parser-provenance security
  boundary (ACD-641) and URL/image/SVG policy (ACD-643); per-surface differences (such as user-message single-tilde
  preservation, automatic inert preview option for preview_untrusted/snapshot subjects, or collapsed summary
  rendering) are typed pipeline options, never forked parsers.
gui_related: true
gui_classification_reason: Keeps desktop Slint, web Leptos, previews, search, and copy bound to one shared Markdown pipeline and policy owner.
split_recommended: false
depends_on:
- DL-2601
- DL-139
- DR-052
- F3-582
- F3-583
- RTIM-029
unblocks: []
acceptance_criteria:
- One standalone shared Rust Markdown crate linked by both the interface-model crate and the local daemon serves Slint desktop, Leptos web, subagent transcripts (DR-052), FileManager previews, clipboard copy, daemon Tantivy search text (ACD-061), and future composer detection on pulldown-cmark.
- Per-surface behavior switches use typed pipeline options rather than separate parsers or JavaScript/WebAssembly (JS/Wasm) web-only Markdown engines; any future parser replacement requires a new owner decision switching every consumer at once.
- HTML comments, reference definitions, math ranges, and structured directives are queried from the shared crate's typed Rust IR tree rather than ad-hoc regexes over raw Markdown.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: multi_parser_and_policy_divergence
reasoning_tier: high
context_scope: markdown_streaming_and_preview_hardening_20261123
implementation_surfaces:
- Plans/DRY_Rules.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/FileManager.md
- Plans/rewrite-tie-in-memo.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-2601
- Plans/rewrite-tie-in-memo.md#RTIM-029
- Plans/FinalGUISpec.md#F3-583
preserved_exact_tokens:
- interface-model crate
- pulldown-cmark
- syntect
- ammonia
- resvg
- usvg
- tiny-skia
- Tantivy
- inert
negative_constraints:
- Do not ship a separate Markdown parser for web, desktop, previews, or server search text.
- Do not ship @pierre/words or another JavaScript/WebAssembly (JS/Wasm) Markdown renderer as a product dependency.
- Do not duplicate sanitizer allowlists or URL-validation rules across Slint and Leptos consumers.
owner_hints:
- Plans/DRY_Rules.md
- Plans/assistant-chat-design.md#ACD-641
- Plans/assistant-chat-design.md#ACD-643
- Plans/FileManager.md#F-162
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-2601, ContractName:Plans/assistant-chat-design.md#ACD-641, ContractName:Plans/assistant-chat-design.md#ACD-642, ContractName:Plans/assistant-chat-design.md#ACD-643, ContractName:Plans/FileManager.md#F-162, ContractName:Plans/rewrite-tie-in-memo.md#RTIM-029
