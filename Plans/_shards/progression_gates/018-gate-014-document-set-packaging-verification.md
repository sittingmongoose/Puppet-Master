# Shard 018: GATE-014 -- Document Set packaging verification

Source: `Plans/Progression_Gates.md`

Source lines: L480-L503

Source SHA256: `ee317f3f4b90686b4b5f04cda15081d9510deb47832c773857b52334b4bdda34`

---

## GATE-014 -- Document Set packaging verification


`GATE-014` verifies packet completeness against the reconciled impacted-doc set.

The gate must fail when any of the following are true:
- a doc marked MUST CHANGE is absent from the packet
- a doc marked MUST RECONCILE is absent from the packet
- a packet uses append-only placement where canon replacement/retirement is required
- a packet targets a structured container indirectly instead of replacing the owning headed section with the final canonical content
- a packet preserves stale tier-era, request-era, or legacy tier-level gate text as a peer option rather than collapsing to the canonical `package_complete_gate`, `seam_complete_gate`, and `lane_complete_gate` model
- For Debug Mode and Investigation Context packetization, GATE-014 treats `Plans/Commands_System.md` (`/Commands_System.md`), `Plans/Glossary.md` (`/Glossary.md`), `Plans/FileManager.md` (`/FileManager.md`), and `Plans/human-in-the-loop.md` (`/human-in-the-loop.md`) as MUST RECONCILE docs whenever the packet touches debug dispatch commands, canonical debug/runtime terms, workspace-file attach/open behavior, or run-scoped investigation approvals.

ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Contracts_V0.md

### 14.1 Packet Document Set Rule

`GATE-014` treats the packet document set as exactly the MUST CHANGE plus MUST RECONCILE docs. `MUST VERIFY` docs are pre-emit consistency checks, not primary packet docs. `protocol/checklist/reference` docs may be `MUST VERIFY` when they are mostly aligned but likely to become misleading if overlooked; they must be checked before packet emission even when they do not become packet write targets. Derived-only regen-only outputs such as `Plans/_shards/**` stay out of the packet intent set.

Verification-only docs may be absent from the packet only when the reconciliation pass explicitly confirmed they do not require edits for the current change set.

Instant Grep packet verification treats `Plans/Architecture_Invariants.md`, `Plans/BinaryLocator_Spec.md`, and `Plans/usage-feature.md` as impacted verification-only references; they may stay out of the packet only when reconciliation confirms their invariants, binary/helper discovery, and usage analytics contracts require no canonical edit.

ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/00-plans-index.md, ContractName:Plans/feature-list.md
