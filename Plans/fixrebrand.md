# Prompt: Fix rebrand artifacts (Docs + JSON)

You are a **Recovery + Compliance Fixer** working in the **Puppet Master** repo.

## Scope (strict)

Edit **only** these files (unless you find a single, clearly-broken reference that must be fixed for correctness):

- `Plans/rebrand.md`
- `Plans/Rebrand_Chunked_Playbook.md`
- `Plans/rebrand_chunks.json`

Do **not** edit Rust code in this pass.

## Hard rules (must obey)

### 1) ABSOLUTE NAMING RULE

- Platform/product name is **Puppet Master** only.
- Do **not** mention any prior/legacy name(s) anywhere in the repo content you modify or create.
- If historical reference is required, use the phrase **legacy naming** (do not quote older names).

### 2) No placeholders

Eliminate unresolved placeholders in the two Markdown docs:
- `TODO`, `TBD`, `FIXME`
- `ContractRef: <...>` / `ContractRef: ...` placeholder targets

### 3) Autonomy

No “Open Questions” sections. If ambiguity exists, state a deterministic default.

### 4) DRY / SSOT

Do not duplicate canonical definitions. Prefer referencing the existing SSOT docs under `Plans/` (contracts, invariants, DRY rules, glossary, gates, schemas, project output artifacts).

## What “done” looks like

After your edits:

1. `Plans/rebrand.md` and `Plans/Rebrand_Chunked_Playbook.md` pass the doc compliance checks A–F:
   - **A** Naming compliance (Puppet Master only; legacy naming redaction)
   - **B** Path hygiene (`Plans/` paths; no `Plan/` filesystem references)
   - **C** Placeholder elimination
   - **D** Executability (at least one clear Acceptance/Verification section)
   - **E** Autonomy (no Open Questions)
   - **F** DRY enforcement (SSOT references present; avoid duplicated canon)
2. `Plans/rebrand_chunks.json` is valid JSON and is consistent with the chunk list in `Plans/Rebrand_Chunked_Playbook.md`.
3. None of the three files contain legacy naming strings (use “legacy naming” instead).

## Current known issues to fix (high-signal)

These come from the latest recovery audit; use them as a starting point:

- `Plans/rebrand.md`
  - Contains legacy naming throughout (including the title and token inventory).
  - Has an “old value” column that must be removed or fully redacted to **legacy naming**.
  - Missing SSOT/DRY references (add a References/SSOT section).
- `Plans/Rebrand_Chunked_Playbook.md`
  - Contains legacy naming in success-criteria commands and/or prompts; must be removed/redacted.
  - Missing SSOT/DRY references (add a References/SSOT section).
- `Plans/rebrand_chunks.json`
  - Contains legacy naming in acceptance checks and likely needs to be regenerated to match the updated chunked playbook.

## File-by-file requirements

### A) `Plans/rebrand.md` (canonical)

Goal: keep this as the canonical rebrand plan, but make it compliant.

Required changes:
- Replace the title with a naming-compliant one (e.g., “legacy naming -> Puppet Master”).
- Remove **all** explicit legacy tokens/strings (including in code blocks and commands).
- Convert the token inventory into **canonical new values only**:
  - Prefer a 2-column table: `Token` | `Value`
  - If you keep an “old value” column, it must contain only `legacy naming` (no quoted legacy strings).
- Ensure there is at least one explicit **Acceptance Criteria / Verification** section that is executable without embedding legacy strings.
- Add an explicit **SSOT references** section that links to relevant canonical docs (examples):
  - `Plans/DRY_Rules.md`
  - `Plans/Progression_Gates.md`
  - `Plans/Decision_Policy.md`
  - `Plans/Project_Output_Artifacts.md`
  - `Plans/Contracts_V0.md`
  - `Plans/Spec_Lock.json`

### B) `Plans/Rebrand_Chunked_Playbook.md` (chunked execution plan)

Goal: keep it chunked and agent-executable, but naming-compliant and consistent with the canonical token table.

Required changes:
- Remove any legacy naming from:
  - grep/rg patterns in success criteria
  - builder/verifier prompts
  - any “find/replace old -> new” wording that quotes legacy strings
- Ensure each chunk has:
  - Scope (file list)
  - Success criteria (commands)
  - Evidence artifact (what to record)
  - Builder prompt
  - Verifier prompt
- Add a short **Global Verification** section at the end:
  - It should verify the chunk list is consistent with `Plans/rebrand_chunks.json`.
  - It should include naming-compliance heuristics that do not embed legacy strings.
- Add an explicit **SSOT references** section.

### C) `Plans/rebrand_chunks.json` (machine-readable chunks)

Goal: keep this JSON as the structured representation of the chunk list.

Required changes:
- Ensure JSON is valid (`python3 -m json.tool Plans/rebrand_chunks.json`).
- Ensure it matches the chunk list in `Plans/Rebrand_Chunked_Playbook.md`:
  - Same `chunk_id` set (no missing; no extras)
  - Same allowed paths per chunk
  - Acceptance checks are aligned with the updated success criteria
- Remove legacy naming from `acceptance_checks` entries. If a check previously depended on matching legacy strings, replace it with:
  - Positive checks for canonical new values, plus
  - Manual review steps or naming-drift heuristics that do not embed legacy strings.

## Required verification commands (safe)

Run these from repo root and ensure they pass before you finish:

```bash
# 1) Placeholder scan (these must have no matches in the 3 target files)
rg -n "\\b(TODO|TBD|FIXME)\\b|ContractRef:\\s*<|ContractRef:\\s*\\.\\.\\." \\
  Plans/rebrand.md Plans/Rebrand_Chunked_Playbook.md Plans/rebrand_chunks.json -i || true

# 2) Autonomy scan (no open-questions headings in the 2 markdown files)
rg -n "^\\s{0,3}#+\\s+.*open questions\\b" \\
  Plans/rebrand.md Plans/Rebrand_Chunked_Playbook.md -i || true

# 3) Naming drift heuristics (acronym-prefixed variants)
rg -n "\\b[A-Z]{2,}[-\\s]+Puppet Master\\b" \\
  Plans/rebrand.md Plans/Rebrand_Chunked_Playbook.md Plans/rebrand_chunks.json || true

# 4) JSON validity
python3 -m json.tool Plans/rebrand_chunks.json >/dev/null
```

Chunk list consistency check (recommended):

```bash
python3 - <<'PY'
import json
import re
from pathlib import Path

md = Path('Plans/Rebrand_Chunked_Playbook.md').read_text(encoding='utf-8', errors='replace')
md_ids = set(re.findall(r'^###\\s+(rebrand-[0-9][a-z0-9-]*)\\b', md, flags=re.MULTILINE))

data = json.loads(Path('Plans/rebrand_chunks.json').read_text(encoding='utf-8'))
json_ids = {obj.get('chunk_id') for obj in data if isinstance(obj, dict)}

missing_in_json = sorted(md_ids - json_ids)
extra_in_json = sorted(json_ids - md_ids)

print('missing_in_json', missing_in_json)
print('extra_in_json', extra_in_json)
PY
```

## Output requirements

When you finish, provide:
- A short summary in chat of what you changed in each file.
- Confirmation that the verification commands above were run and their results (pass/fail) in chat.
