## Verification (AI-executable)

ContractRef: Plans/Progression_Gates.md, Plans/evidence.schema.json

**Pass criteria:** (1) No unresolved decision markers remain in this plan; (2) Evidence bundle exists and validates against `Plans/evidence.schema.json`.

### Checks (run from repo root)

1. **Wrong directory prefix audit (PASS = no matches):**
   - `rg -n 'P.*lan/' Plans/FileManager.md`

2. **Placeholder audit (PASS = no matches):**
   - `rg -n "\\b(TBD|TODO|FIXME)\\b" Plans/FileManager.md`
   - `rg -n "(decide which|document choice|document implementation choice)" Plans/FileManager.md`

3. **Evidence Bundle Path (Resolved):** Path: `.puppet-master/evidence/{run-id}/bundle.json` where `{run-id}` is the seglog run identifier (e.g., `PM-2026-02-23-14-30-00-001`). Must validate against `Plans/evidence.schema.json` and includes `checks[]` entries for (1) and (2) with result PASS/FAIL and `contract_refs` referencing this section and `Plans/Progression_Gates.md`. Created at run completion (success or failure). Persisted across sessions (not cleaned up automatically). Cross-reference: STATE_FILES.md (add entry for this path).

---

