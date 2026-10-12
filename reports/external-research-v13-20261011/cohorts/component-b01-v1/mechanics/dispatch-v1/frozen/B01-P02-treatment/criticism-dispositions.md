# Criticism dispositions — B01-P02

## Method and decision key

This records every material item in the common source-backed critique. Decisions apply to the supplied draft text: **amend** means preserve supported intent and replace unsupported wording; **keep** means retain the control with any stated conditions; **reject** means remove a claim or rule that conflicts with evidence. Primary citations point to the pinned CPython 3.13.9 sources or Microsoft Learn. The source excerpts and hashes are indexed in source-map.json.

## C1 — CPython extraction does modify names

**Disposition: AMEND; reject the draft's factual claim and keep its stricter product policy.**

The draft said extractall passes names through without modification and offers no traversal protection. That is false for the pinned version. CPython documentation says extract strips absolute paths, drive/UNC prefixes and parent components, and replaces certain illegal Windows characters. The implementation removes empty, dot and parent components, applies splitdrive and Windows sanitization, then normalizes the target. The upstream tests exercise POSIX and Windows examples. The docs still warn to inspect untrusted archives.

The proposal now accurately describes those transformations. It does not rely on them as the product policy: they silently change names, can cause aliases, do not provide the required selection collision rules, byte quotas, cancellation or publication transaction. V1 therefore uses its own preflight and writer, not because extractall performs no sanitization but because those behaviors do not satisfy the product contract.

**Primary evidence:** S1 lines 339–380; S2 lines 1791–1852; S3 lines 1628–1683. Exact links and hashes: source-map.json.

## C2 — zipfile.Path does not inherit extraction sanitization

**Disposition: AMEND; reject the draft's inheritance claim.**

The pinned documentation explicitly says zipfile.Path does not sanitize names and assigns validation/sanitization to the caller, unlike extract/extractall. The proposal removes Path as an extraction boundary and builds the preview namespace from ZipInfo. Path may be used only for navigation after explicit name validation; V1 does not need it.

**Primary evidence:** S1 lines 536–553. The library distinction is also visible in S1 lines 339–380.

## C3 — keep-first/overwrite/checksum collision rule is unsafe and inconsistent

**Disposition: AMEND; reject keep-first, same-path overwrite, and checksum-as-intent.**

The supplied brief rejects ambiguous collisions. The draft proposed keeping the first member and writing later colliding members to the same output path, then relying on a checksum. That can overwrite selected data and cannot encode user intent. CPython's directory load retains all ZipInfo entries but maps a repeated filename to the latest object in NameToInfo; open by string uses that lookup, while open with a ZipInfo uses the specific object. The extractor opens destination files with wb. CRC validation detects corruption in the bytes read; it cannot determine which colliding entry the user meant.

The proposal now identifies entries by stable ZipInfo identity, previews each separately, calculates the complete selected destination namespace before writing, and blocks any two selected entries that resolve to the same destination or file/directory conflict. A user may select one visibly identified member from a duplicate group; there is no keep-first, overwrite or implicit rename. An explicit rename mapping is deferred unless every resulting path is previewed and collision-free.

**Primary evidence:** S2 lines 1485–1514, 1605–1639, and 1831–1852; CRC behavior S2 lines 1025–1034 and S3 lines 2522–2550.

## C4 — safety, failure, alternatives, history and validation conditions

### C4a — Count actual output; declared sizes are hints

**Disposition: KEEP, with an added pre-parse bound.**

Keep per-member and aggregate byte quotas, and use file_size/compress_size only for preview and early rejection. Count bytes during streaming and abort on actual output caps. A further implementation finding matters: CPython reads the central-directory region into memory and creates ZipInfo objects before the app can apply a member-count limit. The plan therefore requires a finite archive snapshot byte cap before ZipFile parsing, plus measured memory limits for many-entry archives; a post-open entry limit alone is insufficient.

**Primary evidence:** S2 lines 1444–1518; S1 lines 998–1005.

### C4b — Read selected members through EOF for CRC

**Disposition: KEEP, with an explicit completion condition.**

Keep CRC checking and require each accepted selected member to reach EOF, compare returned length with declared file_size, and verify compressed-stream termination/consumption. The pinned ZipExtFile updates/checks CRC at EOF, and upstream tests expect BadZipFile on bad CRC for full and small reads. However, the implementation can mark EOF when its declared output counter is exhausted; EOF/CRC alone does not independently prove that actual stream length matches metadata. If a version-pinned adapter cannot establish exact stream completion, fail the member or use a bounded decoder adapter. Cancellation or a quota stop before EOF fails the whole operation and cannot be reported as CRC-validated.

**Primary evidence:** S2 lines 1025–1034 and 1072–1106; S3 lines 2522–2550.

### C4c — Owned staging, cancellation, and existing-project protection

**Disposition: KEEP, conditioned on an unpublished stage and tested commit point.**

Keep per-attempt private staging, cancellation between chunks, cleanup of only owned staging, and the no-overwrite existing-project invariant. The final proposal makes publication a same-volume, no-replace atomic commit requirement and documents recovery if cleanup fails. CPython documentation warns interruption can leave incomplete extraction and repeated extraction overwrites files. No cross-platform race, atomicity or durability guarantee is claimed until Linux/Windows target-filesystem tests pass.

**Primary evidence:** S1 lines 1007–1019; S2 lines 1831–1852. Publication details are product requirements pending implementation tests.

### C4d — Do not execute or trust imported content

**Disposition: KEEP.**

Retain inert copy-only import, do not apply executable permissions from archive metadata, and do not set a trust bit. A file extension or bounded signature check classifies a candidate but never proves safety. A future media viewer needs a separate bounded safe-preview policy.

**Primary evidence:** This is a required product constraint from the brief; the pinned ZIP sources expose archive names/metadata but do not establish safety of imported payloads. No source-backed claim that content is safe is made.

### C4e — Explicit unsupported and encrypted content

**Disposition: KEEP, with precise Python/product distinction.**

Keep visible unsupported-item diagnostics and the product decision to reject encrypted selected entries. CPython can decrypt traditional encrypted files, but its docs say this is extremely slow and it cannot write encrypted files; the implementation rejects strong encryption. V1's no-password policy is a product choice, not a Python capability claim. V1 also limits compression to STORED/DEFLATED because the pinned BZIP2/LZMA path lacks DEFLATE's per-call decompressor output cap. Users must explicitly deselect unsupported items; selected unsupported items block commit.

**Primary evidence:** S1 lines 19–24 and 96–127; S2 lines 1072–1106 and 1666–1711.

### C4f — Keep standard extraction and streaming importer as alternatives

**Disposition: KEEP both as alternatives; choose validated streaming for V1.**

Standard extract/extractall into private staging remains a real option and has documented lexical name sanitization. It lacks the app's actual-byte counters, chunk cancellation and no-overwrite collision namespace, so it is not the selected writer. A custom stream importer around ZipFile.open(ZipInfo) offers product controls while retaining the library's selected-entry checks and CRC; it adds maintenance work and remains version-specific. A fully custom parser/decompressor could bound more internals but enlarges the security-sensitive implementation. The new proposal records those costs rather than treating a custom implementation as automatically safer.

**Primary evidence:** S1 lines 339–380 and 536–553; S2 lines 1605–1639 and 1831–1852.

### C4g — History and useful ZIP content

**Disposition: KEEP.**

Retain rejection of earlier one-click extraction into an existing project, retain ordinary ZIP import, useful nested directories and explicitly selected empty directories, and preserve the future manifest-package alternative without using it to replace ZIP. No general ZIP ban is introduced.

**Primary evidence:** These are accepted product-history/brief constraints; S1 lines 785–790 confirms directory status is name-based, and the actual implementation selection is described in final.md.

### C4h — Content-type checks and provenance

**Disposition: KEEP, with limited claims.**

Keep a supported text/media candidate list and bounded content sniffing only as diagnostics. Neither filename nor signature establishes trust. Provenance can store snapshot digest and selected entry identities/names without an absolute local path or password. The proposal does not claim that a prefix validates full media content.

**Primary evidence:** Product brief and threat model; no ZIP-source claim is used to imply content safety.

### C4i — Cross-platform races, durability, and numeric resource defaults

**Disposition: UNCERTAIN until implementation evidence; keep as explicit release gates.**

The docs, code and test excerpts do not prove concurrent filesystem-substitution resistance, no-replace directory publication, crash durability, or behavior on every Linux/Windows filesystem. The proposal requires private staging, handle-relative/no-follow writes where supported, same-volume no-replace commit, and target-specific fault injection, while stating these are not yet proven. CPython source justifies bounded-method filtering and pre-parse central-directory accounting, but neither the brief nor sources supply numeric archive/member/output/time limits. Those values remain release-blocking product decisions rather than invented facts.

**Primary evidence:** S2 lines 1444–1518; S1 lines 980–1019; Microsoft Learn naming/path constraints in source-map.json. No implementation witness was run.

## Overall result

All supplied material criticism is resolved in the complete final proposal. C1/C2's factual errors are corrected, C3's overwrite policy is removed, and C4's supported controls are retained with precise conditions. Unvalidated cross-platform behavior and numeric limits are marked uncertain/release-blocking. The research inspected pinned primary source text and upstream tests only; no importer tests or penetration work ran.
