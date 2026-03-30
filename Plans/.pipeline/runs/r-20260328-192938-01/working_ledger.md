# Working Ledger

## Work Item
w-20260328-192938

## Mode
research

## Topic / Scope
Two-part scope:
1. **Primary**: Integrate Cursor-style "Instant Grep" — a sparse n-gram regex index — as an agent/subagent tool and user-facing search accelerator so regex code search is near-instant on all repo sizes.
2. **Secondary**: Verify that Plans docs adequately account for fast user-facing search in Search panel, command palette, and find-in-files.

Reference: https://cursor.com/blog/fast-regex-search

## Objective
- Design a sparse n-gram regex index for PM that transparently accelerates `grep` calls
- Define storage layout, freshness model, build lifecycle, remote-mode behavior
- Define integration points with existing tools, file watcher, and search panel
- Produce a specification complete enough for implementation

## Constraints / Non-Goals
- Not designing search UI/UX — only the indexing/engine layer and its integration points
- Not replacing the existing Tantivy code index or `codesearch` tool; this is a separate, complementary regex index
- Not designing the command palette or Search panel UX; only specifying the backend the Search panel's regex mode would call
- The primary consumer is agents/subagents; user-facing find-in-files regex is secondary consumer of the same index

---

## Key Facts and Findings

### Cursor's Technique (from blog post)
- **Problem**: Agents call ripgrep constantly; in large monorepos rg takes 15+ seconds, stalling agent workflows
- **Solution**: Local sparse n-gram index. NOT classic trigrams, NOT suffix arrays, NOT trigram+bloom masks
- **Sparse n-grams**: Variable-length n-grams extracted using deterministic weight function. High-weight character-pair boundaries define segment edges. Unlike fixed trigrams (always 3 chars), sparse n-grams vary in length, giving higher specificity
- **Weight function**: Assigns a deterministic weight to every pair of adjacent characters. N-gram boundaries are placed where edge weights are strictly greater than all interior weights. Using char-pair frequency from a real code corpus (rare pairs get high weight) produces the most selective boundaries
- **Index time**: Extract ALL sparse n-grams from each file using the `build_all` algorithm. More n-grams than trigrams, but each is more specific
- **Query time**: "Covering" algorithm extracts only the MINIMAL set of n-grams needed to match the regex. Far fewer lookups than classic trigram decomposition. This asymmetry (exhaustive indexing, minimal querying) is what makes the approach practical
- **Storage**: Two files per project — (1) posting lists file flushed sequentially to disk, (2) sorted hash→offset lookup table (mmap'd in process). Binary search on hash table → read postings at offset. Hashes stored instead of full n-grams — collisions broaden results but never produce incorrect matches. Only the lookup table lives in process memory
- **Freshness**: Index anchored to Git commit SHA + dirty layer for uncommitted changes. Agent writes immediately searchable
- **Entirely local**: No server roundtrips. Chosen over server-side for: latency (agents grep in parallel, constantly), privacy/security, and freshness (agents must read their own writes)
- **Results**: Investigation in Chromium ~240s→~150s. Grep latency essentially eliminated. 5-20ms query time regardless of repo size

### Why Cursor Rejected Alternatives
- **Classic trigrams** (Zobel/Moffat/Sacks-Davis 1993, Russ Cox 2012): Posting lists too large at scale. Query decomposition is accuracy-vs-lookup-count tradeoff — few trigrams = too many candidates, many trigrams = too many lookups
- **Suffix arrays** (Elhage/livegrep 2015): Must concatenate all files into one string. Can't incrementally update. Doesn't scale to multiple repos or dynamic codebases
- **Trigram + probabilistic bloom masks** (GitHub Project Blackbird): Each posting augmented with 2 bytes — `nextMask` (bloom filter of 4th char, enables near-quadgram queries) + `locMask` (position mod 8, verifies adjacency). Extremely compact. BUT bloom filters saturate on updates — once all bits set, matches everything, performance degrades to full scan. Painful for dynamic indexes that need frequent updates
- **Sparse n-grams win** because: variable-length gives higher specificity than fixed-3; frequency weighting minimizes query lookups; covering algorithm at query time is very cheap; index supports incremental updates without saturation

### PM's Current Search Architecture
- **User-facing search**: Search side panel owns find-in-files (persistent results, state in redb). Command palette is transient fuzzy search for navigation/commands/files. Search panel supports regex/case/whole-word toggles
- **Agent search tools**: `grep` (ripgrep, 30s timeout, 1000 match limit), `glob` (15s, 2000 paths), `codesearch` (Tantivy + LSP + ripgrep fallback, 15s, 100 results), `chatsearch`, `logsearch`
- **Tantivy code index**: File-watcher fed, 4-16 KiB chunks, per-project under `storage/tantivy/projects/{project_id}/code/`. Full-text/keyword search, NOT regex
- **Subagent access**: Full read-only access to grep, glob, codesearch, chatsearch, logsearch
- **Remote mode**: Search execution runs on remote host via SSH; no silent local fallback; explicit degradation states (stale/degraded/unavailable)
- **Tool registry**: Central registry, all tools share policy and seglog events
- **Rate limits**: Per-tool rate limits planned (e.g. max 100 grep calls per run/session)
- **Secrets**: All indexed content must pass through mandatory secrets scrubber. .env/.env.* excluded from indexing

### Index Size Benchmarks (from web research)
- Sparse n-gram index: **1-10% of source code size**
- Small app (50 MB source) → ~0.5-5 MB index
- Medium project (500 MB) → ~5-50 MB index
- Linux kernel (1 GB) → ~50-100 MB index
- Chromium (3 GB) → ~150-300 MB index
- Large monorepo (50 GB) → ~2-5 GB index
- Memory: Only hash→offset lookup table is mmap'd. OS pages in what's needed per query. Peak RAM typically hundreds of MB, rarely >2-4 GB even on huge repos
- Query latency: **5-20ms** regardless of repo size

### Remote Project Local Cache Sizes
- Full bare clone ≈ source size (compressed Git objects, no working tree)
- Shallow bare clone (--depth=1) ≈ current tree only, no history — significantly smaller
- Partial clone (--filter=blob:none) ≈ tree listing only, blobs fetched lazily — near-zero initial footprint
- Total local footprint for remote project: Git cache + sparse n-gram index (~1-10% of source)

### Gaps Found in Current Plans for User-Facing Search
- No regex-specific indexing for find-in-files — regex search falls through to raw ripgrep
- No latency targets or performance benchmarks specified for search
- No incremental index update strategy documented for the Tantivy code index
- No regex complexity limits or DFA size bounds
- No index versioning/migration strategy
- No cache invalidation policy for code index on file changes

---

## Gaps / Problems Identified
1. **Agent grep is unindexed**: `grep` tool runs raw ripgrep on all files. On large repos this will be 15+ seconds — same problem Cursor solved
2. **No regex index anywhere in PM plans**: Neither user-facing nor agent search has regex-specific indexing
3. **Tantivy is full-text, not regex**: `codesearch` uses Tantivy for keyword/phrase search. Agents calling `grep` with regex patterns bypass it entirely — different domain
4. **No freshness contract for code index**: Tantivy code index uses a file watcher but no documented freshness guarantee for agents reading their own writes
5. **User-facing regex find-in-files has no performance story**: Falls to ripgrep with no acceleration

---

## Design Specification

### Architecture: Transparent Index-Accelerated Grep (Direction A)

**Principle**: The sparse n-gram index is a transparent acceleration layer inside the existing `grep` tool. Agents and the Search panel call the same interface. When the index is available, grep is fast. When it's not (building, corrupted, missing), grep falls back to raw ripgrep. Correctness is always guaranteed by ripgrep — the index only narrows candidates.

### Query Flow (agent `grep` or Search panel regex)
1. Agent/UI calls `grep` with pattern + optional path/glob filters. Project context determined by tool registry (active project, or project owning the `path` param)
2. If sparse n-gram index is available for that project:
   a. Parse regex via `regex-syntax` → HIR → extract literal substrings via `regex_syntax::literal` module
   b. If **no literals extractable** (e.g., `.*`, `[a-z]+`, `\d{3}`): **skip index entirely** → full ripgrep scan (same as index-missing path). This is the natural fallback for patterns that can't be narrowed
   c. **Non-ASCII case-insensitive check**: If the query has the case-insensitive flag AND extracted literals contain any non-ASCII byte (≥0x80): **skip index** → full ripgrep scan. ASCII-only lowercasing cannot correctly normalize non-ASCII case variants (e.g., Ü/ü are different byte sequences). Rare in code, safe fallback
   d. **Lowercase all extracted literals** (ASCII-only: `u8::to_ascii_lowercase()`) before n-gram computation. **Strip `\r` bytes** (0x0D) from literals before lowercasing. The index is built on CRLF-stripped, lowercased content (see Indexing Model below), so queries always operate in the same normalized space
   e. **Classify literal structure**: Check if `regex_syntax::literal::Seq` represents a conjunction (all required) or disjunction (alternation, e.g., `foo|bar`). This determines set operations in step 2i
   f. Compute covering set of sparse n-grams from normalized literals using project frequency table
   g. If covering set exceeds **64 n-grams** (per alternative for alternations, total for conjunctions), skip index → full ripgrep scan. Prevents degenerate performance. 64 is well above normal (typical: 1-5). Internal constant, not configurable
   h. Hash each n-gram with **xxHash (xxh3, 64-bit)** via `xxhash-rust` crate
   i. Binary search mmap'd lookup table for each n-gram hash → get posting list offsets
   j. Read posting lists (Roaring Bitmaps of u32 file IDs) from postings file → **set operations depend on literal structure** (step 2e):
      - **Conjunction** (all literals required): **intersect** all posting lists → candidate file ID set
      - **Disjunction** (alternation): **union-of-intersections** — intersect within each alternative's n-gram posting lists, then union across alternatives. This ensures `foo|bar` returns files containing "foo" OR "bar", not files containing both
   k. Resolve file IDs to paths via file_id→path table (stored in `file_map.bin`)
   l. Apply path/glob filters to candidate set
   m. Add all dirty-layer paths to candidate set unconditionally
   n. Run ripgrep ONLY on candidate files (from local filesystem / local Git cache via `git cat-file` / dirty staging area) → return results
3. If index unavailable (building, corrupted, missing, disabled):
   a. Run ripgrep on all files (existing behavior) → return results
   b. No error surfaced to agent — transparent fallback

### Indexing Model: Lowercase-Normalized, CRLF-Stripped

All n-gram extraction operates on **CRLF-stripped, lowercased bytes**, both at index time and query time. The normalization pipeline is: **read bytes → strip `\r` (0x0D) → ASCII-lowercase → extract n-grams**. This is critical for correctness:
- **CRLF stripping**: Removes `\r` bytes before any other processing. Makes the index line-ending-agnostic — bare Git clones (LF) and Windows working trees (CRLF) produce identical n-grams for the same content. Single-pass filter with minimal performance impact
- **Index time**: File content is CRLF-stripped and lowercased before n-gram extraction. The n-grams and their hashes represent normalized byte sequences. The `file_map.bin` still points to real file paths (original case). The actual file content is NOT modified on disk — only the n-gram extraction step normalizes
- **Query time**: Pattern literals are CRLF-stripped and lowercased before n-gram extraction. This ensures hashes match between index and query time
- **Lowercasing is ASCII-only** (`u8::to_ascii_lowercase()` — maps 0x41-0x5A → 0x61-0x7A, all other bytes unchanged). This means non-ASCII case variants (Ü/ü, Ñ/ñ) are NOT normalized. Case-insensitive queries with non-ASCII literals skip the index and fall through to ripgrep (see Query Flow step 2c). This is acceptable for code-dominant workloads where non-ASCII case-insensitive search is rare
- **Why lowercase**: If the index stored original-case n-grams, a case-insensitive query for `(?i)foobar` would need to query all case variants (exponential blowup) or miss results entirely (hash("fo") ≠ hash("Fo")). Lowercase normalization avoids both problems
- **Trade-off**: Case-sensitive queries may produce slightly more candidates than a case-sensitive index would (files matching in different case are included). Ripgrep verification on original files ensures correctness. The false-positive increase is negligible in practice
- **Frequency table**: Also computed on CRLF-stripped, lowercased content, for consistency. The base table (shipped in binary) and per-project blend both use normalized byte-pair frequencies

### Storage Layout

```
Local projects:
  .puppet-master/project/state/
    regex_index/
      frequency_table.bin     # Project-specific blended frequency table (~128 KB, 256×256 u16 matrix)
      gen-{N}/                # Generation-numbered directory (N = monotonic u64). All binary files inside
        postings.bin          # Posting lists (Roaring Bitmaps of u32 file IDs), flushed sequentially per n-gram
        lookup.bin            # Sorted xxh3-hash→offset table (mmap'd). Binary search to find posting list offset
        file_map.bin          # Sequential u32 file_id → relative file path mapping (forward-slash normalized)
        index_meta.json       # Anchor SHA, timestamps, schema version, file count, checksums, generation

Remote projects (Git-based):
  .puppet-master/cache/r/{hash8}/           # hash8 = first 8 chars of xxh3(project_id), avoids MAX_PATH
    git/                      # Bare Git clone (full, shallow, or partial per settings)
    git/m/{hash8}/            # Bare Git clones of submodule repos (hash8 of submodule_path)
    dirty/                    # Local staging area for dirty file content (cleared on re-anchor)
    regex_index/              # Same structure as local
      frequency_table.bin
      gen-{N}/
        postings.bin
        lookup.bin
        file_map.bin
        index_meta.json
    manifest.json             # Maps hash8 → full project_id/submodule_path for recovery

Remote projects (non-Git):
  Index built on remote host, transferred to:
  .puppet-master/cache/r/{hash8}/
    regex_index/
      frequency_table.bin     # Blended table (remote indexer computes per-project blend during full scan)
      gen-{N}/
        postings.bin
        lookup.bin
        file_map.bin
        index_meta.json
```

### Posting List Format

- **Entries**: Posting lists contain **file IDs only** (u32). No byte offsets — line-level precision comes from the ripgrep verification pass. This keeps posting lists compact
- **Compression**: Each posting list is a Roaring Bitmap (`roaring` crate). Highly compressed for both dense and sparse sets. Supports fast intersection/union for multi-n-gram queries
- **File ID assignment**: Sequential u32 integers, assigned during build in filesystem walk order. The `file_map.bin` file stores the ordered list of file paths — file_id N maps to the Nth path entry
- **Hash function**: N-grams are hashed with **xxHash (xxh3, 64-bit)** via the `xxhash-rust` crate. Fast non-cryptographic hash with excellent distribution. 64-bit hashes stored in `lookup.bin`. Collisions broaden candidate sets but never affect correctness (ripgrep verifies)
- **Hash collision handling**: When two distinct n-grams produce the same xxh3 64-bit hash, their posting lists are **merged at index time** (union of Roaring Bitmaps). The lookup table has exactly one entry per unique hash. Binary search finds this single entry. Merged posting list broadens candidates, never produces false negatives

### Binary File Format Specifications

All binary files use **little-endian** byte order, no padding between fields.

- **`file_map.bin`**:
  - Header: magic bytes `PMFM` (4 bytes) + schema_version (u32) + entry_count (u32) = 12 bytes
  - Entries: length-prefixed UTF-8 paths: path_byte_length (u32) + UTF-8 path bytes. File ID N = Nth entry after header
  - All paths normalized to forward slashes (`/`), regardless of OS. Convert to native separators only at query/I/O time
  - Design invariant: file IDs are NOT stable across builds — all binary files are always written and swapped together

- **`lookup.bin`**:
  - Header: magic bytes `PMLK` (4 bytes) + schema_version (u32) + entry_count (u32) = 12 bytes
  - Entries: sorted array of (xxh3_hash: u64, postings_offset: u64) pairs = 16 bytes each
  - Sorted by hash for binary search. One entry per unique hash (collisions merged at index time)
  - Design invariant: MUST remain a separate file, memory-mapped from offset 0. If future optimization combines files, lookup section MUST start at 64 KB-aligned offset for Windows `MapViewOfFile` compatibility

- **`postings.bin`**:
  - Header: magic bytes `PMPL` (4 bytes) + schema_version (u32) = 8 bytes
  - Entries: length-prefixed Roaring Bitmap serializations: bitmap_byte_length (u32) + serialized Roaring Bitmap bytes (using portable serialization format)
  - Offset in lookup.bin points to start of bitmap_byte_length field
  - Roaring serialization format pinned to "portable" (`RoaringBitmap::serialize_into` portable mode). Format identifier stored in index_meta.json: `roaring_format: "portable"`

- **`index_meta.json`**:
  - JSON object with fields:
    - `anchor_sha`: string | null (Git HEAD SHA, null for non-Git)
    - `build_timestamp_utc`: string (ISO-8601 with Z)
    - `schema_version`: u32 (starts at 1, incremented on format-breaking changes)
    - `file_count`: u32
    - `generation`: u64 (matches gen-{N} directory name)
    - `checksums`: object with per-file xxh3 hex strings: `{ "file_map": "<hex>", "lookup": "<hex>", "postings": "<hex>" }`
    - `case_sensitive_fs`: bool (detected during build, stored for query awareness)
    - `roaring_format`: string (currently "portable")
  - Dirty file list is NOT stored here — it's in-memory only (per Q18/Q19)

### Frequency Table: Hybrid Base + Per-Project

- **Base table**: 256×256 matrix of char-pair frequencies (~128 KB, u16 entries). Pre-computed during PM development from a broad open-source code corpus across multiple languages, **lowercased before counting**. Compiled into the PM binary as a static const. Acts as the weight function for sparse n-gram boundary detection
- **Per-project adjustment**: On first full index build, compute the project's actual char-pair frequencies from all indexed files (**lowercased before counting**, consistent with base table). Blend with base table using formula: `effective[a][b] = α × base[a][b] + (1-α) × project[a][b]` where α is a tunable weight (default 0.5). This makes the index more selective for projects with unusual naming conventions, DSLs, or non-English identifiers
- **Stored per-project**: The blended table is written to `frequency_table.bin` alongside the index files. Both indexing and querying MUST use the same table
- **Stability rule**: The frequency table is computed once per full index build. It is NOT recomputed on incremental updates (that would invalidate the entire index). Recomputed only on explicit full rebuild
- **Zero-weight fallback**: If the blended frequency table produces all-equal weights for a byte segment (all zeros or uniform values), the n-gram boundary algorithm cannot place boundaries (no weight is "strictly greater" than interior). Fallback: when no boundaries can be placed for a segment ≥3 bytes, use fixed-width 3-character boundaries (classic trigram behavior). This ensures every file produces at least some n-grams and remains discoverable
- **Non-Git remote**: Remote indexer computes per-project frequency table during its full-scan pass (it reads all files anyway — frequency counting adds negligible cost). Blended table transferred to local alongside other index files

### Index Build Lifecycle

**Build state machine** (per-project):
- `no_index` → `building_full` → `ready`
- `ready` → `rebuilding_incremental` → `ready`
- `ready` → `building_full` → `ready` (forced rebuild)
- Any state → `error` (on failure) → `building_full` (on retry)
- `building_full` / `rebuilding_incremental` → `cancelling` → `no_index` / `ready` (build cancelled)
- **Single-build-slot**: Only one build runs at a time per project. If a new trigger fires during a build, the new build is queued as "supersede" — current build is cancelled via CancellationToken (checked between file-processing iterations), then superseding build starts. No concurrent writes to gen directories
- **Multi-project**: Each project has its own build slot. Shared thread pool across projects. If thread pool is saturated, builds queue FIFO

**Triggers**:
- **Project open**: Background build starts after project-ready signal (file watcher established, LSP initialized, Tantivy started). Index is anchored to current HEAD commit SHA (Git) or filesystem snapshot timestamp (non-Git)
- **Subsequent opens**: If `index_meta.json` anchor matches current HEAD, index is valid — no rebuild needed. If HEAD has advanced, incremental update
- **Full rebuild**: On index schema version mismatch (PM upgrade), on explicit user "Rebuild Index" action, or on frequency table recompute
- **Timer-based fetch**: Timer resets after the previous fetch+build cycle completes, not on a fixed wall-clock interval. If a fetch+build takes 8 minutes, next fetch starts 5 minutes after completion
- **Project close/shutdown**: Cancel any in-progress build via CancellationToken. Clean up partial gen directories

**Startup recovery sequence** (runs on PM launch or project open, before first grep):
1. Scan `regex_index/` directory
2. Identify current generation from highest valid `gen-{N}/` directory with matching `index_meta.json`
3. Delete orphaned generation directories (incomplete builds, old generations with no readers)
4. Validate checksums in `index_meta.json` against actual file hashes (xxh3) — if mismatch, delete corrupt gen directory
5. If valid generation found: create IndexSnapshot, mmap `lookup.bin`, mark index as `ready`
6. If no valid generation: mark as `no_index`, begin background full build

**Build process** (background, dedicated thread pool using `thread-priority` crate — `ThreadPriority::Min` on all platforms, plus `QOS_CLASS_UTILITY` on macOS Apple Silicon — to avoid starving the editor):
1. Resolve anchor: current Git HEAD SHA (or filesystem snapshot for non-Git)
2. If first build or schema version mismatch: compute project frequency table (blend base + project, both on CRLF-stripped + lowercased content), write `frequency_table.bin`
3. If incremental (anchor changed but schema same): diff changed files since last anchor. Load forward index into memory for rebuilding (O(index_size) RAM — documented cost)
4. For each file to index (check CancellationToken between files):
   a. Read content (from local filesystem or `git cat-file --batch` for bare clone content)
   b. Pass through secrets scrubber (mandatory — same policy as Tantivy)
   c. Strip `\r` bytes (CRLF normalization)
   d. Lowercase all bytes (ASCII-only: `u8::to_ascii_lowercase()`)
   e. Extract all sparse n-grams using project frequency table
   f. Generate posting entries
5. Write all files into new generation directory `gen-{N+1}/`: `postings.bin` (sequential flush), `lookup.bin` (sorted hash table), `file_map.bin` (file ID → path mapping), `index_meta.json` (with checksums, generation, case_sensitive_fs)
6. **fsync** all files (`File::sync_all()`) before publishing — ensures data is on durable storage
7. Construct new `IndexSnapshot` (mmap lookup.bin from new gen dir). Publish via `ArcSwap` atomic pointer swap. Old snapshot remains accessible to in-flight queries via their `Arc`
8. Clean up old generation directories once no readers remain (tracked via `Arc` refcounts)
9. On **disk full during build**: detect write failure, clean up partial gen directory, log error, fall back to ripgrep. Retry on next trigger
10. On **cancellation**: clean up partial gen directory, exit build thread

**OS indexer exclusion**: On generation directory creation, set platform-specific attributes to prevent OS file indexing/scanning:
- Windows: `FILE_ATTRIBUTE_NOT_CONTENT_INDEXED` via `SetFileAttributesW`
- macOS: create `.metadata_never_index` file in the directory (Spotlight convention)
- Linux: not needed (no default system indexer)

**Progress indicator**:
- Status bar "Indexing" indicator shown only for builds lasting >2 seconds (suppress flashes on sub-second incremental updates)
- First-run: status bar shows "Building search index — first build may take several minutes" with progress percentage
- Disappears on completion
- While building, `grep` falls back to raw ripgrep (transparent to caller)

### Freshness Model: Git Anchor + Dirty Layer

**Git anchor**: Index is built against a specific commit SHA. All file contents at that commit are indexed. When HEAD advances (new commits, branch switch), PM detects the delta and performs incremental update

**Dirty layer**: Uncommitted changes (from agent writes, user edits) must be searchable immediately. Implemented as:
- **Path set with generation stamps**: Each dirty entry is `(path, generation: u64)` where generation is a monotonically increasing counter. Used for safe clearing during re-anchor
- **Dual write sources**:
  - **PM-mediated writes** (agent/tool writes): Dirty layer updated **synchronously** — path inserted BEFORE returning success to the caller. This guarantees agent write → grep freshness. The file watcher is NOT the notification path for PM-mediated writes
  - **External changes** (user editing in another tool, git operations): File watcher detects changes asynchronously, adds paths to dirty layer. File watcher is backup/dedup for paths already inserted by PM-mediated writes
- Dirty layer is a **path set** (HashMap of path → generation), NOT a content store. Ripgrep reads actual file contents from disk during verification
- On grep query: index returns candidate file IDs from the base index, PLUS all dirty-layer paths are added to the candidate set unconditionally (they may have changed since indexing)
- Deleted files are tracked separately in the dirty layer (exclude from results even if still in base index)
- When the dirty layer grows large (e.g., >1000 files), trigger a background re-anchor (incremental rebuild incorporating dirty files into the base index)
- **Re-anchor clearing**: On re-anchor build start, record current generation as `build_generation`. On build completion, clear only entries with `generation ≤ build_generation`. Entries added during the build (generation > build_generation) survive. Eliminates the race between long-running builds and concurrent dirty additions
- **Crash recovery**: Dirty layer is in-memory only. If PM crashes, it's lost. On restart, the anchor SHA check detects HEAD has advanced → triggers incremental update automatically. First grep after a crash may be slightly slower (ripgrep fallback until rebuild completes). No data loss risk — the index is a cache, not a source of truth

**File watcher overflow handling**: When the OS file watcher emits an overflow/rescan event (inotify `IN_Q_OVERFLOW`, FSEvents "must scan", Windows RDCW buffer overflow): mark ALL indexed files as dirty (effectively invalidating the dirty layer). This triggers the >1000-file re-anchor threshold immediately. On Windows: use a generous watcher buffer size (64 KB) to reduce overflow frequency

**Freshness guarantee**: An agent write followed by a grep for the written content MUST return the write. The synchronous dirty-layer insert (not the file watcher) ensures this — PM-mediated writes are in the dirty layer before the write call returns, so the subsequent grep unconditionally includes the file in its candidate set

### Incremental Updates

- **File created**: Add to dirty layer immediately. Include in next incremental rebuild
- **File modified**: Add to dirty layer (replaces any existing dirty entry for that path). Include in next incremental rebuild
- **File deleted**: Mark as deleted in dirty layer. Exclude from results even if still in base index
- **Git commit/branch switch**: Detect new HEAD → compute diff → incremental rebuild of changed files → re-anchor → clear dirty layer
- **Incremental rebuild**: Only re-extract n-grams from changed files (the expensive part — file I/O + n-gram extraction). However, **the serialization is always a full rewrite** of `postings.bin`, `lookup.bin`, and `file_map.bin` — the sorted hash table and sequential posting lists can't be patched in place. New files are written into a new generation directory (`gen-{N+1}/`), then published via ArcSwap atomic pointer swap. This is still much faster than a full rebuild because extraction (not serialization) dominates build time
- **Frequency table is NOT recomputed** on incremental updates (stable across incremental updates). This is critical — changing the frequency table would invalidate all existing n-gram hashes

### File Filtering and Ignore Rules

- **Same rules as existing `grep` tool**: Respect `.gitignore` by default. `.ignore` file can override (e.g., `!node_modules/`)
- **Mandatory exclusions**: `.env`, `.env.*` (allow `.env.example`), `*.pem`, `*.key`, `id_rsa*` — consistent with existing secrets policy
- **Binary file exclusion**: Detect binary files (same heuristic as ripgrep — null byte detection) and exclude from indexing
- **Large file threshold**: 10 MB default. Files above this size are excluded from the index but still searchable via ripgrep fallback. Configurable in project settings under the dedicated **Indexing** section
- **Index exclusion patterns**: A **separate** pattern list specifically for index exclusions (NOT shared with grep ignore rules). Managed in the dedicated **Indexing** section of project settings. Default patterns:
  - `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
  - `*.min.js`, `*.min.css`
  - `*.map` (source maps)
  - `*.generated.*`, `*.g.dart`, `*.pb.go` (common generated file patterns)
  - Users can add/remove patterns. Files matching these patterns are excluded from the index but remain searchable via ripgrep fallback
- **Rationale for separate list**: Grep ignore rules control what files ripgrep scans. Index exclusion patterns control what files the sparse n-gram index indexes. These are different concerns — a file may be useful to grep directly but wasteful to index (e.g., generated files that change every build)

### Integration: Agent `grep` Tool

- **No tool interface changes**: `grep` signature remains `{ pattern: string, path?: string, glob?: string }` → `matches: Array<{ path, line_number, line }>`
- **Transparent acceleration**: The grep tool implementation checks for index availability internally. Agent/subagent never knows whether the index was used
- **Same limits**: Result limit (1000), timeout (30s) — unchanged
- **Same permissions**: grep remains `allow` for all run modes including ask/plan (read-only)
- **Seglog events**: `tool.invoked` event for grep gains an optional `index_used: boolean` field for analytics. No other event changes
- **Project scoping**: `grep` call carries a project context (set by tool registry based on active project or `path` param). Index engine queries that project's index. No cross-project index merging

### Integration: User-Facing Search Panel (Find-in-Files Regex)

- **When regex toggle is ON** in the Search panel, the same sparse n-gram index accelerates the search
- **Flow**: Parse user regex → query index → candidate files → ripgrep on candidates → stream results to Search panel UI
- **Same freshness guarantees**: Dirty layer ensures recently edited files are always searched
- **Fallback**: If index unavailable, run ripgrep on all files (same as today's plan, just slower)

### Integration: `codesearch` Tool

- **No change to `codesearch`**: It stays Tantivy + LSP + ripgrep fallback. It serves keyword/phrase/symbol search — different domain from regex
- **No overlap**: `grep` is for regex pattern matching over raw text. `codesearch` is for semantic/keyword code search. Different tools, different indexes, different use cases

### Remote Mode: Git-Based Projects

**Architecture**: Local Git cache + local index. Near-zero SSH during grep (guaranteed for ≤1 MB dirty files; best-effort for >1 MB).

1. **On remote project open**: PM initiates a bare Git clone of the remote repo to local cache directory (`.puppet-master/cache/r/{hash8}/git/`). Clone type depends on settings (full/shallow/partial). **Git auth**: clone uses SSH agent forwarding through PM's existing SSH connection — `git clone --bare ssh://remote_host/path/to/repo` or `git -c core.sshCommand="ssh -J remote_host" clone --bare`. If the remote repo is only accessible from the remote host's network (corporate firewall), the clone is initiated on the remote host and streamed to local via `git bundle` over SSH. **Fallback**: if local bare clone fails for any auth/network reason, fall back to Option 2 (same as non-Git remote). **Submodule handling**: `--recurse-submodules` does not work with bare clones (no working tree). Instead, after cloning the main repo, PM parses `.gitmodules` from the bare repo (with path traversal validation — reject paths containing `..`), then separately bare-clones each submodule repo into `.puppet-master/cache/r/{hash8}/git/m/{sub_hash8}/`. Recursive: submodule repos are also parsed for nested submodules (max depth: 5). If a submodule is removed from `.gitmodules` on update, its files are treated as deleted. If a submodule URL changes, old bare clone is replaced
2. **Index build**: Runs locally against the local Git cache. Content read via `git cat-file --batch` (NOT filesystem walk — bare clone has no working tree). Same build pipeline as local projects (CRLF-strip → lowercase → n-gram extraction)
3. **Bare clone verification**: Ripgrep cannot search a bare Git clone directly (no working tree). Verification of candidate files uses `git show {anchor}:{path}` piped to ripgrep stdin. For each candidate file: resolve file_id → path → `git show {anchor_sha}:{path}` → pipe content to ripgrep. This preserves zero-SSH without requiring a working tree checkout
4. **Dirty layer**: File-change notifications arrive over SSH from the remote host (shared SSH file watcher, cross-referenced in GitHub_Integration.md §C). Dirty file content handling:
   - **Files ≤1 MB**: Content included with notification, written to local staging area at `.puppet-master/cache/r/{hash8}/dirty/{relative_path}`. Immediately searchable. Zero SSH during grep
   - **Files >1 MB**: Path recorded immediately in dirty layer. Content fetched **asynchronously** as background prefetch (not on-demand during grep). If grep runs before prefetch completes: block briefly (up to 5s), then fall back to SSH ripgrep for that single file. Near-zero SSH guarantee, documented exception for >1 MB files
   - Staging area cleared on re-anchor (after merging staged content into re-anchor build — see below)
5. **Agent grep**: Primarily local — query index + ripgrep verification via `git show` piping (base index files) + local dirty staging area (dirty files). SSH only for >1 MB dirty files whose prefetch hasn't completed
6. **Git fetch frequency**: Three triggers keep the local cache current:
   - **On project open** (always fetch)
   - **On timer**: Every **5 minutes** after previous fetch+build cycle completes (not fixed interval). Internal implementation detail, not configurable
   - **On user action**: Explicit pull/sync/refresh
   - **Aspirational (not MVP-required)**: Webhook/push notification from Git host for instant updates
   - Each fetch that detects new commits: immediately compute `git diff --name-only old_anchor..new_HEAD` and add changed paths to dirty layer BEFORE incremental rebuild starts. This closes the false-negative window between fetch and rebuild completion
7. **Agent writes**: PM-mediated writes synchronously add path to dirty layer + write content to staging area BEFORE returning to agent. Immediately searchable. File watcher is backup only
8. **Re-anchor for remote Git**: During re-anchor: (a) merge dirty staging area content into the rebuild — treat staged files as "changed files" in the incremental rebuild, (b) build new index incorporating both Git content and staged content, (c) only THEN clear staging area and dirty layer entries (generation-stamped clearing). This prevents loss of uncommitted remote changes
9. **Git repo without public remote URL**: If the remote project is a Git repo initialized locally on the remote host (no public clone URL), PM cannot bare-clone it via URL. Falls back to **Option 2** (remote-build, local-query, remote-verify) — same as non-Git projects

**Remote cache settings** (per-project, with global defaults):
- **Shallow clone toggle** (OFF by default): When ON, uses `--depth=1`. Reduces disk usage for repos with long history. Trade-off: branch switches may require additional fetches
- **Partial clone toggle** (OFF by default): When ON, uses `--filter=blob:none`. Lazy blob fetching — minimal initial footprint. Trade-off: first index build slower (must fetch blobs), but blobs are cached once fetched
- Both toggles are **independent** — can be combined for minimum footprint
- **Setting scope**: Global default + per-project override
- **UI visibility**: Greyed out for local projects, active only for remote SSH projects
- **Disk usage indicator**: Show per-project remote cache size in project settings (e.g., "Remote cache: 2.3 GB — Index: 150 MB, Git: 2.15 GB")

### Remote Mode: Non-Git Projects

**Architecture**: Option 2 — remote-build, local-query, remote-verify.

1. **Index built on remote host** (where files are). PM ships a small standalone indexer binary per target architecture (same core engine, stripped to build-only logic). **Architecture detection**: run `uname -m` over SSH before scp. PM ships binaries for x86_64 and aarch64 (covers >99% of dev servers). If no matching binary available: log warning, fall back to unindexed ripgrep over SSH. On first use for a remote project, PM scp's the binary to the remote host. The indexer runs over SSH, reading files locally on the remote. Indexer computes per-project frequency table during its full scan (same blending formula as local builds)
2. **Index files transferred to local**: `postings.bin`, `lookup.bin`, `file_map.bin`, `frequency_table.bin` (blended — remote indexer has full file access), `index_meta.json`
3. **Query locally**: Agent grep decomposes regex → queries local index → gets candidate file paths
4. **Verify remotely**: Run ripgrep only on candidate files over SSH. Dramatically fewer remote operations than full scan
5. **Dirty layer**: File-change notifications over SSH (from PM's SSH file watcher, same as used for Tantivy) → dirty file paths tracked locally → dirty files always included in remote ripgrep verification
6. **Incremental updates**: File watcher notifications mark paths dirty (synchronously for PM-mediated writes). When dirty layer exceeds 1000 files or a configurable interval elapses (default 30 minutes while project is open), trigger remote re-index of dirty files + full rewrite of binary files + transfer. If SSH file watcher is unavailable (degraded), fall back to periodic full remote rebuild (every 30 minutes)
7. **Remote artifact cleanup**: Indexer binary (~5 MB) left on remote host for reuse. On PM project close or disconnect, offer optional cleanup. On PM uninstall: best-effort cleanup via SSH
8. **Trade-off**: Not zero-SSH, but far fewer SSH operations than unindexed grep. Acceptable for the rare non-Git case

### Concurrent Access

- **Atomic index publishing via ArcSwap**: Index is accessed through `ArcSwap<Arc<IndexSnapshot>>` (using `arc-swap` crate). `IndexSnapshot` holds: mmap handle (lookup.bin), postings file handle, file_map data, index_meta. Readers acquire an `Arc` to the current snapshot at query start — guaranteed consistent view across all index files. Builder constructs a new snapshot from new generation directory, then publishes via single atomic pointer swap. In-flight queries continue on their old Arc until they drop it. Wait-free reads, no locks
- **Generation-numbered directories**: Each build writes to `gen-{N+1}/`. The ArcSwap publishes the new snapshot. Old generation directories cleaned up when the last `Arc` reference is dropped (no readers). Eliminates multi-file rename atomicity issues entirely. On Windows: no `rename` of mmap'd files needed — each generation is its own directory, old generations persist until readers finish
- **Dirty layer concurrency**: `RwLock<HashMap<PathBuf, DirtyEntry>>` where `DirtyEntry` includes generation counter and deleted flag. Write lock held briefly for inserts (synchronous on PM-mediated writes, async from file watcher). Read lock for query snapshots. Readers clone the relevant entries at query start
- **Index rebuild during queries**: Rebuild writes to new generation directory (no interaction with current gen). Only the `ArcSwap::store()` call affects live queries — and it's wait-free
- **Platform-specific notes**: On Linux/macOS, mmap'd file deletion is safe (old inode accessible via fd). On Windows, generation directories avoid the problem entirely — old gen directory is deleted only after last reader drops its Arc. `memmap2` file handles opened with `FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE` on Windows (via `std::os::windows::fs::OpenOptionsExt::share_mode(0x7)`) as defense-in-depth

### Error Handling and Degradation

- **Index corrupted**: Detected by checksum validation in startup recovery sequence (Q44) — per-file xxh3 checksums in `index_meta.json` compared against actual file contents. On mismatch: delete corrupt generation directory and trigger full rebuild. Fall back to ripgrep until ready
- **Anchor SHA unreachable**: If `git cat-file -t {anchor_sha}` fails (garbage collected, rebased away, shallow clone pruned): treat index as invalid, trigger full rebuild from current HEAD. Log info-level message, no user-visible error
- **Index stale**: Anchor SHA doesn't match current HEAD and no incremental update has run. **Use index anyway** — dirty layer covers recent changes for correctness. Trigger background incremental update. No commit-count-based fallback threshold — the index is always usable when present. The degradation model:
    - Index available + current HEAD → full acceleration (normal path)
    - Index available + HEAD advanced → use index + dirty layer. Background incremental update. Still fast
    - Index available + dirty layer large (>1000 files) → background re-anchor. Still usable during rebuild
    - Index missing/corrupted/building → full ripgrep fallback, silent
- **Index missing**: First project open, or cache evicted. Fall back to ripgrep. Background build starts immediately
- **Build failure**: Log error, fall back to ripgrep. Retry on next project open or manual trigger
- **All degradation is silent to agents**: No errors surfaced. `grep` always returns results — just potentially slower when unindexed

### Performance Targets

- **Index query latency**: <20ms for any repo size (binary search on mmap'd table + posting list intersection/union)
- **Full build time**: Background, non-blocking. Status bar indicator (after 2s). Targets: **<2 min** for repos ≤500 MB, **<10 min** for repos ≤5 GB, **<30 min** for repos ≤50 GB
- **Incremental update time**: Proportional to number of changed files, but serialization is always O(index_size) I/O (full rewrite of postings.bin, lookup.bin, file_map.bin). For 50 GB repos (~2-5 GB index): 1-3s on NVMe, 3-7s on SATA SSD. **SSD strongly recommended for repos >5 GB source. HDD performance is not targeted.** Consider append-only/log-structured posting format for v2 if write amplification becomes a bottleneck
- **Incremental rebuild memory**: During rebuild, forward index loaded into memory for remapping — O(index_size) RAM spike (~1.5× index size). For 50 GB repo: ~3-7 GB temporary. Consider adding `reverse_map.bin` in v2 to reduce rebuild memory
- **Dirty layer update**: Synchronous with PM-mediated writes. <1ms to add a file to the dirty layer
- **Memory**: Only lookup table mmap'd. Peak RSS contribution typically <500 MB even for large repos
- **Ripgrep per-file errors**: During verification, if ripgrep fails to open an individual candidate file (ENOENT, permission denied): silently skip that file, continue with remaining candidates. Do NOT propagate per-file errors as query failures

### Security Hardening

- **Path traversal prevention**: All paths derived from `.gitmodules`, dirty staging notifications, or remote file-change events are canonicalized and validated with `starts_with(project_root)` / `starts_with(cache_root)` before use. Submodule paths containing `..` are rejected with a logged warning
- **Symlink policy**: Default: `--no-follow` for both filesystem walks (index build) and ripgrep verification. Symlinks are NOT followed into directories outside the project root. Configurable: "Follow symlinks" toggle in Indexing settings section, OFF by default. When ON, the `starts_with` validation still applies after canonicalization
- **Secrets scrubber**: All file content passes through the mandatory secrets scrubber BEFORE n-gram extraction. N-grams are extracted from scrubbed content. `file_map.bin` stores relative file paths (not content) — paths are not scrubbed but are scoped to the project tree. Scrubber integration is the same pipeline used for Tantivy
- **Remote indexer binary**: The scp'd indexer binary is integrity-checked (xxh3 hash comparison after transfer). PM never executes binaries received FROM the remote host — only sends its own pre-built binaries TO the remote
- **mmap safety**: Before mmap'ing `lookup.bin`, validate file size is consistent with `index_meta.json` entry_count (expected size = 12 + entry_count × 16). If inconsistent, treat as corrupt — delete and rebuild. Bounds-check all offsets read from `lookup.bin` before using them to seek into `postings.bin`

### UX: Status Indicators and Settings

- **Status bar**: "Indexing" indicator shown only for builds lasting >2 seconds. First-run shows "Building search index — first build may take several minutes" with progress %. Disappears on completion
- **Search panel fallback indicator**: When search uses ripgrep fallback (no index): show subtle "(unindexed)" annotation next to result count in Search panel. Not shown for agent grep (transparent)
- **"Rebuild Index" button**: In project settings Indexing section. Triggers full rebuild (deletes existing index + fresh build). No confirmation needed (non-destructive — index is a cache)
- **Cache eviction confirmation**: Manual cache eviction shows dialog: "Delete remote cache for {project_name}? ({size}). Will rebuild on next open."
- **Toggle-OFF during build**: If user disables "Enable regex index" while a build is in progress: cancel build via CancellationToken, clean up partial generation directory, stop. On re-enable: start fresh build
- **Disk usage**: Show per-project cache size in project settings for BOTH local and remote projects: "Index: {size}" for local, "Remote cache: {total} — Index: {idx_size}, Git: {git_size}" for remote

### Case-Insensitive Filesystem Handling

- **Detection**: During index build, detect filesystem case sensitivity via probe (create temp file, open with different case). Store result as `case_sensitive_fs: bool` in `index_meta.json`
- **Bare clone deduplication**: When building from `git ls-tree` on a case-insensitive filesystem: deduplicate entries by lowercased path, keeping first entry encountered. Log warning when case-collisions detected
- **Local builds**: OS filesystem walk naturally returns one file per path — no deduplication needed

---

## Impacted Docs
- `Plans/Tools.md` — grep tool: add index-acceleration behavior, `index_used` analytics field, large-file threshold setting. codesearch: no changes but document the boundary (codesearch = keyword/Tantivy, grep = regex/sparse-n-gram)
- `Plans/storage-plan.md` — new `regex_index/` storage layout under project state. Generation-directory scheme. Freshness model (Git anchor + dirty layer with generation stamps). File watcher integration (shared with Tantivy, overflow handling). Frequency table storage. Remote cache layout under `.puppet-master/cache/r/{hash8}/`. Cache manifest.json
- `Plans/FinalGUISpec.md` — Search panel regex mode: document that it uses the same sparse n-gram index as agent grep. Search panel "(unindexed)" fallback annotation. Status bar: add "Indexing" progress indicator (>2s threshold, first-run messaging). **Project settings**: add dedicated **Indexing** section containing: enable/disable toggle, large file threshold, index exclusion patterns list, follow-symlinks toggle (OFF default), remote cache settings (shallow/partial toggles), disk usage indicator (local + remote), manual cache eviction with confirmation, "Rebuild Index" button. Indexing section adapts for local projects (only toggle + threshold + exclusion patterns + symlinks shown)
- `Plans/GitHub_Integration.md` — Remote mode: local Git cache for search acceleration. Git auth via SSH forwarding / git bundle fallback. Cache lifecycle (clone on open, fetch on sync, evict on close). Shallow/partial clone settings. Non-Git fallback (Option 2) with architecture detection. SSH file watcher cross-reference. Reconciliation with "no silent local fallback" rule (this is acceleration, not fallback). Remote indexer binary lifecycle (scp, integrity check, cleanup)
- `Plans/Run_Modes.md` — no structural changes needed (agents already have grep access in all modes)
- `Plans/assistant-chat-design.md` — no structural changes needed (agent tool access unchanged)
- `Plans/Permissions_System.md` — possibly: remote cache settings as new permission-adjacent config (global + per-project)

## Decisions Already Resolved
- **Go decision**: Yes — integrate sparse n-gram indexed grep into PM as MVP feature
- **Target scale**: All repo sizes — enterprise monorepos to small apps
- **MVP scope**: Yes, this is MVP-critical, not a post-launch optimization
- **Direction**: Direction A — transparent acceleration of existing `grep` tool. Same tool interface, index used when available, fallback to raw ripgrep when not
- **Dual-use**: Same index serves both agent `grep` and user-facing find-in-files regex search
- **Local index**: Index always lives on the local PM install, even for remote projects
- **"No local fallback" reconciliation**: The index is a transparent acceleration cache (like a CDN), not "local search." Correctness verified against actual files. No silent behavioral change — just faster. This is acceleration, not fallback
- **Frequency table**: Hybrid — ship pre-computed base table (256×256, ~128 KB u16 matrix, from broad open-source code corpus, **lowercased before counting**) + blend with per-project frequencies (also lowercased) on first full build. Stored per-project. Stable across incremental updates; recomputed only on full rebuild. Blending formula: `effective[a][b] = α × base[a][b] + (1-α) × project[a][b]`, α=0.5 default. Non-Git remote uses base table only
- **Remote project default**: Full bare Git clone to local cache (both optimization toggles OFF by default)
- **Remote cache settings — two independent toggles**:
  - **Shallow clone** (OFF by default): Controls depth of history. ON = `--depth=1`, smaller footprint, no history
  - **Partial clone** (OFF by default): Controls blob fetching strategy. ON = `--filter=blob:none`, lazy blob fetching, minimal initial footprint
  - Can be combined: shallow + partial = absolute minimum footprint
  - **Setting scope**: Global default + per-project override
  - **Visibility**: Greyed out for local projects, active only for remote SSH projects
  - **Disk usage indicator**: Show per-project remote cache size in project settings (e.g., "Remote cache: 2.3 GB")
- **Non-Git remote projects**: Fall back to Option 2 (remote-build index, transfer to local, query locally, verify candidates remotely via SSH)
- **Progress indicator**: Small status bar indicator at bottom of platform during index build. Shows progress percentage. Disappears on completion
- **codesearch unchanged**: Different domain (keyword/Tantivy), different tool, no overlap with regex index
- **Q1 — Rust ecosystem / build approach**: PM builds its own core engine, assembling proven crates:
  - `regex-syntax` (from the official Rust `regex` crate family, Andrew Gallant): regex parsing → HIR → literal extraction via `regex_syntax::literal` module. This is the foundation for the covering algorithm at query time
  - `roaring` crate: Roaring Bitmaps for compressed posting lists. Production-proven, fast intersection/union
  - `memmap2` crate: mmap of the lookup table
  - Algorithmic reference: `trigrep` (Rust, trigram + sparse n-gram indexed CLI, disk-backed) and `fast-grep-rust` (Rust, sparse n-gram + Roaring Bitmaps + mmap + SIMD). These are study references, not dependencies
  - NOT a from-scratch novel algorithm build. Assembling well-understood pieces with mature crates. The algorithm is proven in production at Cursor, ClickHouse, and GitHub Code Search
- **Q2 — Frequency table corpus**: Use **The Stack Smol** dataset (Hugging Face `bigcode/the-stack-smol`, ~2.6 GB, multi-language random subset of The Stack). One-time dev task: run a char-pair counting script → produce the 256×256 matrix → embed as `static const [u16; 65536]` in the PM binary (~128 KB). No pre-computed table exists publicly; PM computes its own. Table can be refreshed on new Stack releases but changes will be minor (code char-pair distributions are stable)
- **Q3 — Blending weight α**: **Hardcoded at 0.5**. Not user-configurable. Equal weight to general corpus and project-specific patterns. Internal implementation detail — can be tuned by PM engineers based on benchmarks later. No setting exposed
- **Q4 — Large file threshold and generated files**: Two mechanisms:
  - **Size threshold**: 10 MB default, configurable in dedicated **Indexing** section of project settings
  - **Index exclusion patterns**: Separate list (NOT shared with grep ignore rules) in the Indexing section. Default patterns: `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `*.min.js`, `*.min.css`, `*.map`, `*.generated.*`, `*.g.dart`, `*.pb.go`. User can add/remove
  - Files matching either rule are excluded from the index but remain searchable via ripgrep fallback
- **Q5 — Stale threshold**: **Eliminated entirely**. No commit-count-based ripgrep fallback. The index is always usable when present — dirty layer guarantees correctness regardless of how stale the base index is. A stale index just produces more candidates (less efficient), not incorrect results. Degradation model: index always used → dirty layer covers correctness → background incremental updates keep it fresh → re-anchor on dirty layer >1000 files
- **Q6 — Remote file-change notification content**: **Path + content for files ≤1 MB** (covers >99% of source files). Path-only for files >1 MB (content fetched via background prefetch — **SUPERSEDED by Q40** which changes from on-demand to async prefetch). 1 MB threshold is internal, not configurable. Agent writes always include content (PM already has it from the write operation) — dirty layer updated immediately with zero additional fetch
- **Q7 — Cache eviction policy**: Three triggers:
  - **Inactivity-based** (primary): Evict remote project cache after 30 days of no project opens. Configurable in global settings (Global → Storage → Remote Cache Retention)
  - **Disk pressure**: PM monitors total cache directory size. Global cache size limit (default: 50 GB or 10% of free disk space at first cache creation, whichever is smaller). When exceeded, evict LRU project caches until under limit. Limit configurable in global settings
  - **Manual**: User can evict individual project cache from project settings (next to disk usage indicator). Also "Clear All Remote Caches" action in global settings
  - Cache is NOT evicted on project close. Eviction deletes both Git cache and regex index for that project. On next open after eviction: fresh clone + index build (background)
- **Project settings — Indexing section**: Dedicated section in project settings for all index-related configuration. Contains: large file threshold, index exclusion patterns, remote cache toggles (shallow/partial — greyed out for local), disk usage indicator, manual cache eviction button. For local projects: only threshold + exclusion patterns are shown
- **Q8 — Non-literal regex patterns**: When `regex-syntax::literal` extracts no literals (e.g., `.*`, `[a-z]+`, `\d{3}`), the covering set is empty → skip index entirely → full ripgrep scan. Same behavior as index-missing. Natural fallback, no special handling needed
- **Q9 — Case-insensitive patterns**: **SUPERSEDED by Q23**. Index operates in lowercase space. Both case-sensitive and case-insensitive queries work correctly against the lowercase-normalized index. Ripgrep verifies actual case on original files
- **Q10 — Posting list entry format**: File IDs only (u32). No byte offsets — ripgrep provides line-level precision during verification. Each posting list is a Roaring Bitmap of u32 file IDs. File IDs are sequential integers assigned during build in filesystem walk order
- **Q11 — File ID ↔ path mapping**: Stored in `file_map.bin` — an ordered list of relative file paths. File ID N = Nth entry. Rebuilt on every index build (full or incremental)
- **Q12 — Hash function**: **xxHash (xxh3, 64-bit)** via `xxhash-rust` crate. Fast non-cryptographic hash with excellent distribution. 64-bit hashes stored in `lookup.bin`. Collisions broaden results but never affect correctness
- **Q13 — Incremental serialization**: "Incremental" means fewer files to re-extract n-grams from (extraction is the expensive part). Serialization is always a full rewrite of `postings.bin`, `lookup.bin`, and `file_map.bin` — sorted structures can't be patched in place. New files written into new generation directory, published via ArcSwap. **SUPERSEDED by Q34** for the swap mechanism (generation dirs + ArcSwap instead of .new + rename)
- **Q14 — Non-Git remote indexer mechanism**: PM ships a standalone indexer binary per target architecture (stripped-down build-only engine). scp'd to remote on first use. Runs over SSH. Same pattern PM uses for other remote capabilities
- **Q15 — Non-Git incremental updates**: SSH file watcher marks paths dirty. Re-index triggers: dirty layer >1000 files OR 30-minute interval while project is open. If SSH file watcher unavailable (degraded), periodic full remote rebuild every 30 minutes
- **Q16 — Git fetch frequency**: On project open (always), every 5 minutes while active (timer, not configurable), on explicit user action (pull/sync). Aspirational: webhook from Git host (not MVP-required)
- **Q17 — Git repos without public remote URL**: Falls back to Option 2 (same as non-Git projects). Can't bare-clone without a clone URL
- **Q18 — Dirty layer is a path set**: HashSet of file paths. NOT a content store. Ripgrep reads actual files from disk during verification. Deleted files tracked separately (exclude from results)
- **Q19 — Crash recovery**: Dirty layer lost on crash (in-memory only). On restart, anchor SHA mismatch detected → automatic incremental rebuild. First grep may use ripgrep fallback until rebuild completes. No data loss — index is a cache
- **Q20 — Git submodules**: **SUPERSEDED by Q24**. Bare clones don't support `--recurse-submodules`. PM separately bare-clones each submodule repo after parsing `.gitmodules`. Stored in `git/modules/{submodule_path}/`. Index builder reads submodule content via `git show` at the gitlink commit
- **Q21 — Byte-level operation**: Frequency table and n-gram extraction operate on raw bytes, not Unicode characters. This handles all encodings naturally. Implementers must not decode to Unicode for the frequency table or n-gram extraction
- **Q22 — Windows mmap lifecycle**: **SUPERSEDED by Q34**. Generation-directory scheme eliminates need for .old rename. Old gen dirs persist until last reader drops Arc. memmap2 files opened with FILE_SHARE_DELETE on Windows as defense-in-depth
- **Q23 — Case-insensitive correctness (CRITICAL FIX)**: Index is built on **lowercased bytes**, NOT original case. Both index-time and query-time operate in lowercase space. This guarantees that case-insensitive queries (`(?i)`) produce correct candidates (hash("fo") at query time matches hash("fo") from indexing "Fo"). Case-sensitive queries also work — slightly more candidates, ripgrep verifies actual case. Frequency table also computed on lowercased content. Without this fix, case-insensitive queries would miss results (different hashes for different cases)
- **Q24 — Bare clone + submodules (CRITICAL FIX)**: `--recurse-submodules` is silently ignored with `--bare` clones (no working tree). Fix: after bare clone of main repo, parse `.gitmodules`, separately bare-clone each submodule repo into `git/modules/{submodule_path}/`. Index builder reads submodule content from their repos at the gitlink-referenced commit via `git show`
- **Q25 — Dirty file content locality (remote Git)**: Dirty file content is written to a **local staging area** at `.puppet-master/cache/r/{hash8}/dirty/{relative_path}`. Content arrives with notification (≤1 MB) or fetched via background prefetch (>1 MB — **see Q40**). Ripgrep reads from this local staging area. Staging area merged into re-anchor build before clearing (**see Q53**). Near-zero-SSH-during-grep guarantee
- **Q26 — Multi-project scope**: `grep` call carries a project context (from tool registry — active project or project owning the `path` param). Index engine queries that specific project's index. No cross-project index merging
- **Q27 — Index disable toggle**: "Enable regex index" toggle in the Indexing settings section. ON by default. When OFF: no index build, no index query, grep always uses raw ripgrep. Per-project with global default
- **Q28 — Regex complexity limit**: If covering set exceeds **64 n-grams**, skip index → full ripgrep scan. Prevents degenerate performance. 64 is well above normal (typical: 1-5). Internal constant, not configurable
- **Q29 — Schema version format**: u32 integer stored in `index_meta.json`. Starts at 1. Incremented on format-breaking changes. Mismatch triggers full rebuild
- **Q30 — Build thread model**: **SUPERSEDED by Q69**. Use `thread-priority` crate for portable priority management. ThreadPriority::Min on all platforms. QOS_CLASS_UTILITY on macOS Apple Silicon
- **Q31 — Disk full during build**: Detect write failure, clean up partial generation directory, log error, fall back to ripgrep. Retry on next trigger
- **Q32 — Bare clone ripgrep verification (CRITICAL FIX)**: Ripgrep CANNOT search a bare Git clone — bare clones have no working tree, only Git objects. The entire remote-Git verification architecture required this fix. Solution: verification of candidate files uses `git show {anchor_sha}:{path}` piped to ripgrep (via stdin or temp extraction). For each candidate: resolve file_id → path → `git show` → pipe to rg. Same approach for submodule content (using the submodule's bare repo at the gitlink commit). No persistent working tree needed — disk footprint stays low. This applies to both base-index verification AND index-build content reading (via `git cat-file --batch` for bulk reads)
- **Q33 — Regex alternation set operations (CRITICAL FIX)**: Query flow uses **union-of-intersections**, NOT pure intersection. The `regex_syntax::literal::Seq` is checked for alternation structure. For alternation patterns (e.g., `foo|bar`): intersect within each alternative's n-gram posting lists (files matching "foo" must contain all of foo's n-grams), then UNION across alternatives (a match needs "foo" OR "bar"). Without this fix, `foo|bar` would require files to contain n-grams of BOTH, causing silent false negatives — violating the core correctness guarantee
- **Q34 — Index snapshot atomic swap (CRITICAL FIX)**: Use `ArcSwap<Arc<IndexSnapshot>>` (`arc-swap` crate). IndexSnapshot holds: mmap handle (lookup.bin), postings file handle, file_map data, index_meta. Builder constructs new snapshot from new generation directory `gen-{N+1}/`. Single atomic pointer swap publishes it. Readers hold Arc to their snapshot until query completes — guaranteed consistent view. On Windows: generation-numbered directories eliminate the rename-of-mmap'd-file problem entirely. Old gen dirs cleaned on last reader exit (Arc refcount). Eliminates ALL multi-file rename atomicity issues
- **Q35 — Synchronous dirty-layer insert on PM-mediated writes (CRITICAL FIX)**: Any PM-mediated file write (agent tool, editor save, remote write relay) MUST synchronously add the written path to the dirty layer BEFORE returning success to the caller. This guarantees agent-write-then-grep freshness. The file watcher is backup/dedup for external changes only. Without this fix, file watcher async latency (1-100ms+) creates a race where agent write → immediate grep misses the write
- **Q36 — Generation-stamped dirty-layer clearing (CRITICAL FIX)**: Dirty layer entries carry a monotonically increasing `generation: u64` counter. On re-anchor build start, record current generation as `build_generation`. On build completion, clear ONLY entries with `generation ≤ build_generation`. Entries added during the build (generation > build_generation) survive. Without this fix, a long-running build that clears ALL dirty entries on completion would lose files dirtied during the build — violating freshness
- **Q37 — Path traversal / symlink security**: All paths derived from `.gitmodules`, dirty staging, remote notifications, or file watcher events are canonicalized and validated with `starts_with(project_root)` or `starts_with(cache_root)`. Submodule paths containing `..` are rejected (log warning, skip). Symlinks: default `--no-follow` for filesystem walks and ripgrep. "Follow symlinks" toggle in Indexing settings, OFF by default. Even when ON, `starts_with` validation applies after canonicalization
- **Q38 — Build state machine and concurrency control**: Explicit FSM: `no_index → building_full → ready → rebuilding_incremental → ready`. Any → `error` on failure. Single-build-slot per project: only one build runs at a time. New trigger during build = "supersede" — cancel current build via CancellationToken (checked between file iterations), start new build. Multi-project: shared thread pool, per-project build slots, FIFO queue when saturated. Build cancellation cleans up partial gen directories
- **Q39 — Binary file format specifications**: All files LE, no padding. file_map.bin: `PMFM` magic + schema_version(u32) + entry_count(u32) + length-prefixed UTF-8 paths (u32 len + bytes), forward-slash normalized. lookup.bin: `PMLK` magic + schema_version(u32) + entry_count(u32) + sorted (xxh3_hash:u64, offset:u64) pairs, one entry per unique hash (collisions merged). postings.bin: `PMPL` magic + schema_version(u32) + length-prefixed Roaring Bitmaps (u32 len + portable-format serialized bytes). index_meta.json: JSON with anchor_sha, build_timestamp_utc, schema_version, file_count, generation(u64), checksums(per-file xxh3 hex), case_sensitive_fs(bool), roaring_format("portable"). Dirty file list is NOT in index_meta.json (in-memory only)
- **Q40 — Zero-SSH >1MB dirty file handling**: For remote Git dirty files >1 MB: content fetched asynchronously as background prefetch immediately after notification (NOT on-demand during grep). If grep runs before prefetch completes: block up to 5s, then fall back to SSH ripgrep for that single file. The zero-SSH guarantee is: zero SSH for files ≤1 MB (guaranteed), near-zero for >1 MB (background prefetch, SSH fallback if incomplete). SUPERSEDES the "zero SSH" absolute claim — now documented as best-effort for large dirty files
- **Q41 — Non-ASCII case-insensitive handling**: Lowercasing is ASCII-only (`u8::to_ascii_lowercase()`). For case-insensitive queries: if extracted literals contain any non-ASCII byte (≥0x80), skip index → full ripgrep fallback. This prevents false negatives from non-ASCII case pairs (Ü/ü = different byte sequences after ASCII-only lowercase). Rare in code. Documented: "ASCII-only normalization; non-ASCII case-insensitive queries fall through to ripgrep"
- **Q42 — Remote Git auth bootstrapping**: Uses SSH agent forwarding through PM's existing SSH connection. `git clone --bare` via SSH transport using PM's connection. If repo only accessible from remote network: clone on remote host → `git bundle` → transfer to local via SSH. Fallback: if bare clone fails for any auth/network reason → Option 2 (same as non-Git remote). No new credential storage needed — leverages existing SSH session
- **Q43 — SSH file watcher cross-reference**: The SSH file watcher for remote projects is specified in `Plans/GitHub_Integration.md` §C. Both the regex index dirty layer and the Tantivy code index subscribe to the same notification channel. No duplicate watcher needed. Add cross-reference to impacted docs
- **Q44 — Startup recovery sequence**: On PM launch or project open, before first grep: (1) scan regex_index/ directory, (2) identify current generation from highest valid gen-{N}/ with matching index_meta.json, (3) delete orphaned gen dirs (incomplete builds, old gens with no readers), (4) validate checksums in index_meta.json vs actual file xxh3 hashes — mismatch = delete corrupt gen, (5) if valid: create IndexSnapshot, mmap lookup.bin, mark ready, (6) if none valid: mark no_index, begin background full build
- **Q45 — Remote fetch HEAD advance dirty-layer fix**: When git fetch detects HEAD has advanced: immediately compute `git diff --name-only old_anchor..new_HEAD` → add all changed paths to dirty layer BEFORE incremental rebuild starts. Closes the false-negative window between fetch and rebuild completion. Cheap operation (commit tree diff). These entries cleared by generation-stamped clearing when rebuild re-anchors
- **Q46 — Full postings.bin rewrite at scale**: Incremental update is O(index_size) I/O (full rewrite). At 50 GB repo (~2-5 GB index): 1-3s NVMe, 3-7s SATA SSD. SSD strongly recommended for repos >5 GB. HDD performance not targeted. Consider append-only/log-structured posting format for v2 if write amplification becomes a bottleneck
- **Q47 — File watcher overflow handling**: On overflow/rescan event (inotify IN_Q_OVERFLOW, FSEvents "must scan", Windows RDCW buffer overflow): mark ALL indexed files as dirty. Triggers >1000-file re-anchor threshold immediately. On Windows: 64 KB watcher buffer to reduce frequency. Equivalent to crash-recovery path (same as losing the dirty layer)
- **Q48 — Windows MAX_PATH mitigation**: Hash-based short paths: `.puppet-master/cache/r/{hash8}/git/m/{hash8}/` where hash8 = first 8 chars of xxh3(full_id). Full mapping in `manifest.json`. Additionally: `<longPathAware>true</longPathAware>` in Windows app manifest. Both mitigations applied together
- **Q49 — CRLF normalization**: Strip `\r` (0x0D) bytes before lowercasing and n-gram extraction, at both index time and query time. Pipeline: read → strip `\r` → ASCII-lowercase → extract n-grams. Makes index line-ending-agnostic. Bare clones (LF) and Windows working trees (CRLF) produce identical n-grams. Ripgrep verification on original files handles CRLF natively
- **Q50 — Query flow step ordering fix**: Steps 2d and 2e from original spec were swapped (checked covering set size before computing it). Corrected: compute covering set first (now step 2f), THEN check 64-n-gram cap (now step 2g). See updated Query Flow section
- **Q51 — Reverse mapping for incremental rebuild**: Incremental rebuild needs to know which n-grams each unchanged file contributed. MVP: load forward index into memory during rebuild (O(index_size) RAM — ~1.5× index size). For 50 GB repo: ~3-7 GB temporary spike. Acceptable given build runs on background low-priority threads. Consider `reverse_map.bin` for v2 to reduce rebuild memory
- **Q52 — Non-Git remote frequency table correction**: Previous justification ("can't cheaply access all files") was wrong — remote indexer already reads ALL files during its full scan. Corrected: remote indexer DOES compute per-project blended frequency table (counting char-pairs on CRLF-stripped, lowercased content during the same pass). Blended table transferred to local alongside other index files
- **Q53 — Re-anchor staging merge for remote Git**: During re-anchor: (1) merge dirty staging content into rebuild (treat staged files as "changed files"), (2) build new index incorporating both Git content and staged content, (3) ONLY THEN clear staging area (with generation-stamped clearing). Prevents loss of uncommitted remote changes that exist only in staging. For local projects: moot — re-anchor reads from filesystem which includes uncommitted changes
- **Q54 — Checksum definition**: index_meta.json stores per-file checksums: `{ "file_map": "<xxh3_hex>", "lookup": "<xxh3_hex>", "postings": "<xxh3_hex>" }`. xxh3 over full file contents (same hash as n-grams, already a dependency). Validated during startup recovery (Q44 step 4). Mismatch = delete corrupt gen dir, trigger full rebuild
- **Q55 — Roaring Bitmap serialization pinning**: Use portable serialization format (`RoaringBitmap::serialize_into` portable mode). Store `roaring_format: "portable"` in index_meta.json. Ensures old indices remain readable across crate upgrades
- **Q56 — Case-insensitive FS deduplication**: During bare-clone build: detect FS case sensitivity via probe (create temp file, open with different case). If case-insensitive: deduplicate `git ls-tree` by lowercased path, keep first encountered. Log warning on collisions. Store `case_sensitive_fs: bool` in index_meta.json. Local builds: OS walk returns one file per path naturally
- **Q57 — Hash collision posting list merge**: Colliding xxh3 hashes: posting lists merged at index time (union of Roaring Bitmaps). Lookup table has one entry per unique hash. Broadens candidates, never false negatives. No special query-time handling
- **Q58 — UX: status indicators and rebuild button**: (a) Status bar "Indexing" shown only after 2s (suppress sub-second flashes). First-run: "Building search index — first build may take several minutes" + progress %. (b) Search panel "(unindexed)" annotation on fallback — not shown for agent grep. (c) "Rebuild Index" button in Indexing settings. (d) Cache eviction confirmation dialog. (e) Toggle-OFF during build: cancel build, clean up partial gen dir. (f) Disk usage shown for both local and remote projects
- **Q59 — fsync before rename**: All new files fsync'd (`File::sync_all()`) before ArcSwap publish. Ensures data on durable storage before swap makes it visible. Prevents crash-after-swap-before-flush leaving truncated content behind valid filenames
- **Q60 — Frequency table zero-weight fallback**: If blended weights are all-equal for a byte segment: no boundaries can be placed. Fallback: fixed-width 3-character boundaries (classic trigram) for segments where boundary algorithm fails. Ensures every file produces n-grams and remains discoverable
- **Q61 — file_map.bin path normalization**: All paths forward-slash (`/`), regardless of OS. Convert to native separators only at query/I/O time. Matches Git internal convention. Makes index format platform-independent
- **Q62 — Remote indexer architecture detection and fallback**: `uname -m` over SSH before scp. Ship x86_64 + aarch64 binaries. No match → fall back to unindexed ripgrep over SSH. Binary integrity-checked (xxh3) after transfer. Remote cleanup: optional on disconnect, best-effort on uninstall
- **Q63 — OS indexer exclusion**: Set platform attrs on regex_index/ directory: Windows `FILE_ATTRIBUTE_NOT_CONTENT_INDEXED` via SetFileAttributesW, macOS `.metadata_never_index` file, Linux not needed. Prevents Spotlight/Defender I/O contention and file locks during builds
- **Q64 — regex_index/ gitignore**: Not needed — regex_index/ lives under `.puppet-master/` which is PM's managed state directory, never inside the user's repo/Git working tree
- **Q65 — index_meta.json in atomic swap**: Included in generation-directory scheme (Q34). All files in gen-{N}/ are published together via ArcSwap. No inconsistency window
- **Q66 — Submodule edge cases**: (a) Nested: recursively parse .gitmodules in each submodule repo (max depth: 5). (b) Removed: if submodule removed from .gitmodules, treat its files as deleted. (c) URL changed: delete old bare clone, fresh-clone from new URL. (d) Circular reference protection via depth limit
- **Q67 — Anchor SHA unreachable**: If `git cat-file -t {sha}` fails (GC'd, rebased, shallow-pruned): treat index as invalid, trigger full rebuild from current HEAD. Info-level log, no user-visible error
- **Q68 — Timer reset after build**: Git fetch timer resets after previous fetch+build cycle completes (not fixed interval). 8-min build → next fetch at 13 min (8+5), not at next 5-min mark
- **Q69 — Thread priority crate**: `thread-priority` crate added to dependency list (alongside regex-syntax, roaring, memmap2, xxhash-rust, arc-swap). Cross-platform: wraps setpriority/pthread_setschedparam on Unix, SetThreadPriority on Windows. On macOS Apple Silicon: additionally `pthread_set_qos_class_self_np(QOS_CLASS_UTILITY)` for Energy-efficient scheduling
- **Q70 — Windows mmap allocation granularity**: Design invariant: `lookup.bin` MUST remain a separate file, mmap'd from offset 0. If future optimization combines files, lookup section MUST start at 64 KB-aligned offset for Windows MapViewOfFile. Documented as a persistent constraint
- **Q71 — Build gate on project init**: Index build waits for project-ready signal (file watcher established, LSP initialized, Tantivy started). Prevents build triggering before file watcher exists (changes during build would be invisible)
- **Q72 — Ripgrep per-file error handling**: During verification, if ripgrep fails on individual candidate file (ENOENT, permission denied, I/O error): silently skip, continue with remaining candidates. Do NOT propagate per-file errors as query failures. Deleted-between-candidate-and-verify is normal — dirty layer captures the deletion eventually
- **Q73 — arc-swap crate dependency**: `arc-swap` added to dependency list. Production-proven wait-free read-mostly data structure crate. Used by tokio, hyper, many production Rust projects. Provides `ArcSwap<T>` for the IndexSnapshot atomic publish pattern

## Open Questions / Uncertainties
All resolved — see Decisions Already Resolved.

## Packetization Notes
- This is an additive feature — no existing contracts need to break
- Touches 4-5 planning docs (Tools.md, storage-plan.md, FinalGUISpec.md, GitHub_Integration.md, possibly Permissions_System.md)
- The index is a performance optimization layer; correctness is always guaranteed by ripgrep fallback
- Could be packeted as a single feature unit ("Instant Grep") that cuts across these docs
- The remote cache architecture (local Git mirror) is the most novel piece and may warrant its own section in GitHub_Integration.md

## Do-Not-Forget Details
- Cursor's approach is specifically "sparse n-grams" with frequency-weighted boundaries, NOT classic fixed trigrams
- The "covering" algorithm at query time is what makes it practical — index time extracts ALL n-grams, query time extracts MINIMAL set. This asymmetry is the key insight
- Index freshness is critical: agents reading their own writes MUST find them. The dirty layer guarantees this by always including dirty files in the verification pass
- mmap only the lookup table, not the full postings — this keeps editor memory minimal
- Hash collisions in the lookup table broaden results but NEVER produce incorrect matches — correctness is guaranteed by ripgrep verification
- Per-tool rate limits (max 100 grep calls) already planned — fast grep reduces pressure but doesn't eliminate the need for limits
- Remote mode: index lives LOCAL, not on remote host. Local Git mirror provides content. This is acceleration, not fallback
- Non-Git remote projects use Option 2 (remote-build, local-query, remote-verify) as fallback
- The sparse n-gram technique is proven in production: Cursor (editor), ClickHouse (database), GitHub Code Search (web). Not novel research
- Remote cache settings are TWO INDEPENDENT TOGGLES (shallow clone + partial clone), not radio buttons. Both OFF by default
- Settings: global default + per-project override. Greyed out for local projects
- Disk usage indicator in project settings for remote cache size
- The blog post covered four approaches with detailed tradeoffs: (1) classic trigram inverted index, (2) suffix arrays, (3) trigram + probabilistic bloom masks (Blackbird — 2 bytes per posting: nextMask + locMask, rejected because bloom filters saturate on updates), (4) sparse n-grams (chosen). All four should be understood by implementers for context
- Atomic index swap on rebuild uses **ArcSwap + generation-numbered directories** — NOT bare rename. Readers hold Arc, builder publishes via atomic pointer swap. No multi-file rename atomicity issues. Windows-safe
- Secrets scrubber is mandatory for all indexed content — same policy as Tantivy code index. N-grams extracted from scrubbed content
- The frequency table blending formula must be deterministic — same inputs always produce same outputs. The table is computed once per full build and stored; it does NOT change during incremental updates
- **Rust crates**: `regex-syntax`, `roaring`, `memmap2`, `xxhash-rust`, `arc-swap`, `thread-priority`. These are dependencies. `trigrep` and `fast-grep-rust` are algorithmic references only, not dependencies
- **Frequency table source**: The Stack Smol (Hugging Face). One-time dev task. No public pre-computed table exists. Embed as static const in binary
- **Index exclusion patterns are SEPARATE from grep ignore rules** — different concerns, different lists, both configurable independently
- **No stale threshold** — the index is always used when present. No commit-count cutoff. Dirty layer is the correctness guarantee
- **Remote file notifications**: include content for files ≤1 MB, path-only for larger (background prefetch, not on-demand). Agent writes always include content (zero extra fetch)
- **Cache eviction**: 30-day inactivity default + disk pressure (50 GB or 10% free) + manual. NOT on project close
- **Project settings Indexing section**: dedicated section, not mixed into search settings or general settings. Includes: toggle, threshold, exclusion patterns, symlinks toggle, rebuild button, disk usage, cache eviction (remote)
- **xxHash (xxh3)**: the hash function for n-gram hashing. `xxhash-rust` crate. 64-bit. Non-cryptographic. Fast with excellent distribution
- **file_map.bin**: the file_id → path mapping file. Forward-slash normalized paths. Must be rebuilt alongside postings.bin and lookup.bin on every build. Full binary format specified (PMFM header, LE, length-prefixed UTF-8)
- **Posting lists are Roaring Bitmaps of u32 file IDs** — NOT byte offsets. Line-level precision comes from ripgrep verification. Portable serialization format pinned
- **Incremental = incremental extraction, full-rewrite serialization** — sorted structures can't be patched in place. Written to new generation directory, published via ArcSwap
- **Non-literal regex patterns → skip index → ripgrep** — empty covering set means index can't help
- **Case-insensitive → query lowercase forms → superset candidates → ripgrep verifies** — no case-variant explosion. **ASCII-only** lowercasing; non-ASCII case-insensitive queries skip index
- **Dirty layer is a HashMap with generation stamps**, NOT a plain HashSet — enables safe re-anchor clearing. PM-mediated writes insert SYNCHRONOUSLY (not via file watcher)
- **Crash recovery is automatic** — startup recovery sequence validates checksums, cleans orphans. Anchor SHA mismatch → incremental rebuild. No data loss possible
- **Git submodules: included recursively** in bare clone and index. Max depth: 5. Path traversal protection on all submodule paths
- **Byte-level operation** — do NOT decode to Unicode for frequency table or n-gram extraction. ASCII-only lowercasing
- **Windows: generation-directory scheme eliminates all rename-of-mmap'd-file issues** — SUPERSEDES Q22 .old rename approach. memmap2 files opened with FILE_SHARE_DELETE as defense-in-depth
- **Non-Git remote: PM ships standalone indexer binary** — architecture detected via `uname -m`, integrity-checked after transfer. Remote indexer computes per-project frequency table (corrected from "base table only")
- **Non-Git incremental: 1000 dirty files OR 30 min interval** — periodic full rebuild if file watcher unavailable
- **Git fetch cadence: on open + every 5 min after last cycle completes + on user action** — timer resets after build completion, not fixed interval
- **Git repos without public clone URL → Option 2 fallback** — same as non-Git
- **CRITICAL: Index operates on CRLF-stripped, ASCII-lowercased bytes** — pipeline: strip `\r` → `u8::to_ascii_lowercase()`. Both build and query. Without CRLF strip, bare clone (LF) vs Windows working tree (CRLF) produce different n-grams. Without lowercase, case-insensitive queries miss results
- **CRITICAL: Bare clones don't support --recurse-submodules** — PM must parse .gitmodules and separately bare-clone each submodule repo
- **CRITICAL: Ripgrep CANNOT search bare Git clones** — no working tree. Verification uses `git show {sha}:{path}` piped to ripgrep. Index build reads content via `git cat-file --batch`
- **CRITICAL: Regex alternation requires union-of-intersections** — NOT pure intersection. `foo|bar` = intersect within each alt, union across alts. Pure intersection causes false negatives
- **CRITICAL: PM-mediated writes update dirty layer SYNCHRONOUSLY** — not via file watcher. File watcher is backup for external changes only. This is the freshness guarantee mechanism
- **CRITICAL: Re-anchor dirty clear uses generation stamps** — only clears entries ≤ build_generation. Entries added during build survive
- **Dirty staging area for remote Git**: dirty file content cached locally at `dirty/{relative_path}`. Merged into re-anchor build before clearing. >1MB files: background prefetch, SSH fallback if incomplete
- **Index disable toggle**: "Enable regex index" in Indexing settings, ON by default. Per-project + global default. OFF during build → cancel + cleanup
- **Regex complexity cap: 64 n-grams max** — skip index beyond this. Internal constant
- **Schema version: u32 in index_meta.json**, starts at 1, mismatch → full rebuild
- **Build threads: `thread-priority` crate** — ThreadPriority::Min on all platforms, QOS_CLASS_UTILITY on macOS Apple Silicon. Don't starve the editor
- **Build state machine**: no_index → building_full → ready → rebuilding_incremental → ready. Single-build-slot per project with supersede pattern
- **Disk full: clean up partial gen dir, log, fall back to ripgrep**
- **Build time targets**: <2 min for ≤500 MB, <10 min for ≤5 GB, <30 min for ≤50 GB
- **Multi-project**: grep queries the project determined by tool registry context. No cross-project index merging. Shared thread pool, per-project build slots
- **Binary formats fully specified**: PMFM/PMLK/PMPL magic bytes, LE throughout, length-prefixed entries, per-file xxh3 checksums in index_meta.json
- **fsync before ArcSwap publish** — ensures data on durable storage before making new generation visible
- **Startup recovery**: scan → clean orphans → validate checksums → mmap or rebuild
- **Watcher overflow → mark all dirty → immediate re-anchor trigger**
- **Path normalization: forward-slash in file_map.bin, native at I/O time**
- **OS indexer exclusion**: NOT_CONTENT_INDEXED (Win), .metadata_never_index (macOS) on regex_index dir
- **Remote cache: hash-based short paths** `.puppet-master/cache/r/{hash8}/` + long path manifest on Windows
- **Frequency table zero-weight fallback: fixed 3-gram boundaries** when weight algorithm can't place boundaries
- **Hash collision: merge posting lists at index time** (union of bitmaps), single lookup entry per hash
- **Build gate: wait for project-ready signal** before first build (file watcher must exist first)
- **Remote fetch HEAD advance: git diff old..new → dirty layer** before rebuild starts

---

## Reconciliation Pass — Cross-Doc Coverage

### Data Sources
- Legacy Canon Readiness Check: 16 items, 5 supersession risks, 8 terms to retire
- 6 targeted greps (grep/ripgrep, file watcher, Tantivy, tool.invoked, secrets scrubber, status bar)
- 4 cross-doc search agents (23 search terms total across all Plans/*.md)
- 2 doc-scanning agents (16 docs analyzed individually)
- Total unique Plans/*.md files with matches: 34+

### Three-Bucket Register

#### MUST CHANGE (4 docs)
1. `Plans/Tools.md` — Owner of grep/codesearch tool specs. 5 legacy canon items (L1-L5), 2 supersession risks (R1-R2)
2. `Plans/storage-plan.md` — Owner of storage layout, file watcher, Tantivy. 3 legacy items (L6-L8), 2 supersession risks (R3, R5)
3. `Plans/FinalGUISpec.md` — Owner of UI: status bar, project settings, search panel. 4 legacy items (L9-L12)
4. `Plans/GitHub_Integration.md` — Owner of remote mode. 2 legacy items (L13-L14), 1 supersession risk (R4)

#### MUST RECONCILE (8 docs)
5. `Plans/assistant-chat-design.md` — "ripgrep fallback" at ~line 490 misleads agents. CRITICAL drift
6. `Plans/UI_Command_Catalog.md` — cmd.search.* family needs index rebuild command. HIGH drift
7. `Plans/Glossary.md` — Missing: sparse n-gram index, Instant Grep, grep-vs-keyword distinction
8. `Plans/Architecture_Invariants.md` — INV-002/INV-006 list Tantivy but not n-gram index. Secrets scrubbing gap
9. `Plans/BinaryLocator_Spec.md` — CRITICAL gap: no spec for remote indexer binary location/deployment
10. `Plans/usage-feature.md` — Missing `index_used: boolean` field in grep analytics
11. `Plans/Wiring_Matrix.md` — Search panel wiring needs index-accelerated grep notation
12. `Plans/00-plans-index.md` — No index entry for sparse n-gram index or grep enhancements

#### MUST VERIFY (10 docs)
13. `Plans/Permissions_System.md` — grep = allow policy. Verify no new permission keys needed
14. `Plans/Run_Modes.md` — Verify no run-mode-specific grep interactions drift
15. `Plans/FileSafe.md` — Verify dirty-layer insert doesn't conflict with FileSafe mutation contracts
16. `Plans/FileManager.md` — File watcher §10.7 reference, symbol index vs grep index distinction
17. `Plans/newtools.md` — Tool projections mention Tantivy. Verify n-gram doesn't need separate mention
18. `Plans/LSPSupport.md` — Status bar indicator precedence/layout with new "Indexing" indicator
19. `Plans/Contracts_V0.md` — Section 3.1 tool.invoked schema. Verify `index_used` alignment
20. `Plans/MiscPlan.md` — Tantivy in secrets context. Verify coverage by Architecture_Invariants update
21. `Plans/CLI_Bridged_Providers.md` — tool.invoked event payload shapes. Verify `index_used` passthrough
22. `Plans/interview-subagent-integration.md` — Tantivy ref for interview artifacts. Verify no confusion with grep index

#### DERIVED / REGEN-ONLY
- `Plans/_shards/**` — Must regenerate after primary doc changes (not a packet doc)

### Packetization Reminders
- Replace/retire stale canon in Tools.md, storage-plan.md, GitHub_Integration.md (don't just append)
- assistant-chat-design.md "ripgrep fallback" is a one-line change but CRITICAL for agent behavior
- BinaryLocator_Spec.md is additive but blocks remote indexer implementation
- All 4 MUST CHANGE docs have same-file supersession risks — packetizer must replace in-line, not append
- Glossary entries establish terminology that all other docs depend on — reconcile early
- 00-plans-index.md update is mechanical but prevents future agents from missing the feature
