# Shard 026: Canonical owner and consumer reconciliation

Source: `Plans/Tools.md`

Source lines: L2430-L2460

Source SHA256: `151ae97002f04f5abb1a940614750fb3417e0c7ddec0b530358a58b333a2cc6f`

---

## Canonical owner and consumer reconciliation

Tools are defined SSOT in this document. Consumers in other surfaces (UI, CLI, Help, Permissions) reference this document rather than restating tool definitions.

Tools is the single-owner SSOT for tool-level web operation behavior, provider capability tiers, Firecrawl routing, and cache-routing / cache routing decisions. `Plans/storage-plan.md` owns cache persistence and activity payload storage; `Plans/CLI_Bridged_Providers.md`, `Plans/Provider_OpenCode.md`, `Plans/newtools.md`, and OpenCode audit surfaces remain consumer or provider-adjacent references rather than competing tool owners.

OpenCode billing and /caching evidence confirms that extra abstraction layers make tracking HARDER, not easier; Tools therefore owns explicit tool-level cache-routing and provider-capability decisions while usage, storage, prompt-cache, and provider bridge owners keep their narrower accounting and persistence contracts.

- Firecrawl/web operations in `Plans/Tools.md` span `### 3.5C`, `### 3.5D`, `## 10`, `### 10.3`, `### 10.7`, `### 11.1`, and `## 14`. This document owns Firecrawl integration, TODO contract carry-through, provider placement, cache, audit/error mapping, and the traceability obligations `obl-013`, `obl-014`, `obl-041`, `obl-053`, `obl-054`, `obl-062`, `obl-066`, `obl-067`, `obl-029`, `obl-040`, `obl-043`, and `obl-068`.
- Stale permission, LSP, and web-output carry-through markers such as `/LSP/web-output`, `/web-output/LSP/permission`, and legacy `web-output` phrasing are retired as owner text; live tool canon points to the dedicated Contracts and storage owners for WebAction, common web output fields, and blocked-action payloads.

### Consumer propagation

#### Acceptance carry-through
- Expand blocked_notice beyond blocked_family and allowed_action_ids[]
- Carry escalation_level, action_available ownership, and usage observability through blocked surfaces
- Under `## Canonical owner and consumer reconciliation` -> `### Consumer propagation`, blocked surfaces must not stop at `blocked_family` plus `allowed_action_ids[]`.
- Consumer propagation must carry `escalation_level`, `action_available` ownership, and usage observability through blocked_notice handling.
- If `allowed_action_ids[]` remains in this subsection, it must be explicitly subordinate to the richer blocked_notice contract rather than the complete surface definition.

### Required data shape

#### Acceptance carry-through
- Share one attribution family across tool events, runtime artifacts, receipts, and usage records
- Carry run/attempt/thread/node/artifact/provider/usage anchors plus execution/runtime identity fields
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- Carry usage switch-history and usage execution-role follow-through
- Under `## Canonical owner and consumer reconciliation` -> `### Required data shape`, define one attribution family shared across tool events, runtime artifacts, receipts, and usage records.
- Carry run/attempt/thread/node/artifact/provider/usage anchors together with execution/runtime identity fields in the tool record shape.
- Transfer `execution_role`, `requested_account_id`, `operational_identity`, account-switch ownership, pressure ownership, `blocked_sequence` minting, startup recovery handshake, and DAE jail/approval policy into the owner/consumer contract.
- Require usage switch-history and usage execution-role follow-through in the same reconciled owner data shape.
