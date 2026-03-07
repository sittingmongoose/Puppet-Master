## 4. Requirements: Multiple Uploads and Storage

### 4.1 Multiple Uploads

- **UI:** In the requirements step, allow **multiple** file uploads (e.g. "Add file" or multi-file picker). Display a list of added files with optional remove/reorder.
- **Limits (exact):**
  - **Max number of uploads:** **10**. Reject or disable "Add file" when the list already has 10 entries. Show a short message: "Maximum 10 files."
  - **Max file size per file:** **5 MiB** (5 × 2^20 bytes). Reject any file larger than this before saving; show a clear error (e.g. "File X exceeds 5 MB limit").
- **Order:** Merge order is the **list order** in the UI. User can reorder (e.g. drag-and-drop or up/down); that order is the only ordering used for canonical merge (see §4.2). No "primary" vs "supplements" -- list order is the precedence.
- **Formats:** Same as REQUIREMENTS.md: md, pdf, txt, docx. Per-file type validation and optional normalization (e.g. to markdown) for downstream consumption.
- **Normalization (normative):**
  - Original uploads are preserved byte-for-byte under `.puppet-master/requirements/uploaded/`.
  - Canonical merge input is the **normalized UTF-8 text projection** of each upload, never raw bytes.
  - `md` and `txt` normalize by UTF-8 decode + newline canonicalization.
  - `pdf` and `docx` normalize via deterministic text extraction into `.puppet-master/requirements/normalized/<upload_id>.md`.
  - If extraction fails, the wizard remains on the requirements step and surfaces an upload-specific error; failed files are excluded from merge until replaced or removed.

### 4.2 Canonical Input for Interview/PRD

**Single merge order and precedence:**

1. **User uploads multiple files ONLY (no Builder):** Merge order = **list order** in the UI. Produce one canonical doc by **concatenating normalized text** in that order, with a separator between each: `\n\n--- Requirements doc N ---\n\n` where N is 1-based index (e.g. first file gets "Requirements doc 1", second "Requirements doc 2"). No AI merge; no conflict resolution. If the user wants a different order, they reorder in the UI and we re-run the merge.

2. **User uses Requirements Doc Builder ONLY (no uploads):** Builder output is staged at **`.puppet-master/requirements/requirements-builder.md`**. Canonical promotion then writes **`.puppet-master/project/requirements.md`**. Interview and start chain read only `.puppet-master/project/requirements.md`.

3. **User has BOTH uploads and Builder:** **Uploads first** (in list order): concatenate all uploaded normalized texts with separator `\n\n--- Requirements doc N ---\n\n` (N = 1..upload count). **Then** append the Builder output with separator `\n\n--- Requirements Doc Builder ---\n\n`. Write the merged staging result to `.puppet-master/requirements/canonical-requirements.md`, then promote canonical user-project requirements to `.puppet-master/project/requirements.md`, and set `canonical_requirements_path` to `.puppet-master/project/requirements.md`.

**Conflicting content:** There is no "conflicting content" merge. Merge is **always** concatenation in the order above. We do not run AI or rule-based conflict resolution. If the user wants a different order or to drop a doc, they reorder or remove files in the UI and the app regenerates `canonical-requirements.md` and then re-promotes `.puppet-master/project/requirements.md`.

**Single source:** Interview and start chain read only from `canonical_requirements_path` (always `.puppet-master/project/requirements.md` after promotion). Canonical artifact reference (or content hash) may be stored in redb for the current flow/session so the Interview and start chain read from the same canonical artifact as the event stream.

### 4.3 Storage

- **Seglog/redb:** Requirements uploads, merge result, and Builder output should be represented as **artifacts** in the event stream (seglog): emit an event when a requirements doc is added, merged, or set as canonical. Projectors can mirror to JSONL and maintain redb projections (e.g. current canonical requirements ref or artifact index) for fast lookup. Implementation should follow storage-plan.md (seglog writer, redb schema, projectors) so requirements artifacts are queryable and replayable like other app artifacts.
- **Path:** Per REQUIREMENTS.md, store under `.puppet-master/requirements/`.
- **Exact storage paths:**
- **Uploaded files (one per upload):** `.puppet-master/requirements/uploaded/<sanitized_filename>`. `<sanitized_filename>`: take the original filename, remove or replace characters that are invalid or unsafe for the filesystem (e.g. path separators, control chars). Prefer a convention that keeps names unique (e.g. prepend index or hash if duplicate names). Example: `my-spec.md` → `my-spec.md`; `my spec (1).md` → `my_spec_1.md` or similar.
- **Normalized text projection (one per upload):** `.puppet-master/requirements/normalized/<two_digit_index>-<sanitized_stem>.md`. Duplicate filenames are disambiguated by the prefixed stable list index; merge and hashing operate on these normalized files.
  - **Requirements Doc Builder output:** `.puppet-master/requirements/requirements-builder.md`.
  - **Contract Layer seed pack (Builder output; staging only):** `.puppet-master/requirements/contract-seeds.md`. This is an input to the interview’s contract unification pass (§6.6) and MUST NOT be treated as the canonical project contract pack (which lives under `.puppet-master/project/contracts/`; SSOT: `Plans/Project_Output_Artifacts.md`).
    ContractRef: ContractName:Plans/Project_Output_Artifacts.md
  - **Merged staging result (always written when merge runs):** `.puppet-master/requirements/canonical-requirements.md`.
  - **Canonical user-project requirements (always written before Interview/start-chain execution):** `.puppet-master/project/requirements.md`.
- All paths are relative to the **project root** (where `.puppet-master/` lives). Implementation must create `.puppet-master/requirements/` and `.puppet-master/requirements/uploaded/` as needed.
- **Builder output:** When the Requirements Doc Builder produces a doc, write it to `requirements-builder.md`; merge step (when uploads + Builder) writes the concatenated staging result to `canonical-requirements.md`; canonical promotion then writes `.puppet-master/project/requirements.md` as the next-step input.

### 4.4 Gaps and Edge Cases

- **Max number of uploads:** **10** (see §4.1). Enforced in UI and on add.
- **Large files:** **Max file size per file = 5 MiB** (5 × 2^20 bytes). Reject larger files with a clear error; do not store or stream them. No "reference only" or sampling for MVP.
- **Conflicting content:** Resolved. Merge is **always concatenation** in the defined order (§4.2). No AI merge. User controls order by reordering in the UI; no open questions.

---

