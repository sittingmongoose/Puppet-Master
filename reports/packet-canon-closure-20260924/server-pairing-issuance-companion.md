# Server-issued pairing invitation companion

Base: `1e5d9b097b46aa58e7af488a9c38a87efb780d5f`. Scope: PA01 only, SRV-004 and Server System's protected pairing-material owner subsection. No command, EventRecord, physical family, retention policy, vendor integration, native secret generator or runtime handler is added.

Source: `05_REMOTE_ACCESS_DISCOVERY_AND_PAIRING.md` §§3–4 in the September 3 complete onboarding handoff. SHA-256 `ce914d8708068acbcd218d30c865f6af76f1e7dffc70ec8809b47c435af0ebf7`; exact custody path is recorded in the external `packet-wide-rebaseline/remaining-nongui-fixed-bc64-triage-001.md` report, SHA-256 `119d9d2540928d4db00df29f4fb0ee12a1309abdff96f447abfd978d1424a1a0`. The source's illustrative expiry display is not made a timeout default. Existing bundled PM tailnet connector, Server identity and all 26+6 existing Server commands remain unchanged.

Owner prose was applied before companions. The additive schema has original issuance requests, nonsecret invitation state, original issuance results and protected-display request metadata. Semantic APIs independently resolve original owner values; require original admission, transition, completed pairing and current disclosure proofs; and separate current protected-read/final-fence validation from immutable historical result inspection. Complete actual predecessor PairingRun/PairingReceipt/ClientTrustRecord schemas are used for consumption, not caller status booleans. Manual-link legacy nullable material fields still require authentic protected-input proof. Static fixture adapters are fabricated relationship tests, not production authority.

## Verification

- 15 focused unittest cases pass, including 6 accepted and 14 rejected authored fixture cases, same-session newer-generation replacement, no fixed increment, cancellation/expiry, no-effect refusal, unknown recovery, all three display views, current permission/source fences, actual typed pairing/trust composition and native-proof refusal.
- Independent review found QR/short-code receipts could erase their digest and terminal timestamps could predate the request. Both are corrected with paired schema-valid regression cases; manual-link nullable predecessor behavior remains intact.
- Final independent review passed after both corrections: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/packet-wide-rebaseline/server-pairing-pa01-independent-review.md`, SHA-256 `4ad6ffa983981d95656ebfca4d59a0813ab0a248b4b3b1097bd6b60b95acfa3a`.
- Plan shard generation/check: 99 docs, 2,722 shards, pass. No generated shard changed for an unrelated document.
- Plan index generation/validation: 6,728 units, 26,262 acceptance units, pass. Changed PlanUnit rows belong only to Server_System; SRV-004 contains the semantic change, other Server rows only location/hash updates. Runtime readiness remains blocked.
- Whole central fixture/gate registration belongs to the integrating root and is not claimed by this isolated branch.

## Exact root integration handoff

Add schema/fixture pair `Plans/server_pairing_issuance_contracts.schema.json` and `Plans/server_pairing_issuance_contract_fixtures.json` to the central contract manifest. Import `pairing_issuance_semantic_failures(definition, value)` from `scripts/pm_server_pairing_issuance_semantics.py`; joined negative cases use definition `issuance_fixture`. The wrapper is fixture-only and excluded from runtime storage classification.

Runtime IDs, all schema_version 1.0.0:

- `pm.server_pairing.issuance_request.v1`: internal nonpersisted operation input; actual admitted original request custody is separately required for historical verification.
- `pm.server_pairing.protected_display_request.v1`: internal nonpersisted protected-read metadata, not a secret carrier or bearer permit.
- `pm.server_pairing.invitation_state.v1` and `pm.server_pairing.issuance_result.v1`: nonsecret original state/result requiring exact Server-owned durable custody and physical/writer/reader/recovery admission. The current registry has no pairing-named physical family; do not claim a closed predecessor PairingRun admits these values, select a peer key, or invent a retention policy to pass registration. Declare pending physical admission truthfully.

The public APIs are `validate_issuance_result(result_ref, *, resolve_record, verify_original_admission, verify_transition, verify_pairing_completion, check_current_disclosure)` and `validate_protected_display(request_ref, *, resolve_display_request, resolve_current_invitation, now_utc, verify_protected_read, final_display_fence)`. The latter returns metadata-validation failures only; native protected material emission must remain under the same genuine owner fence, never treat an empty failure list as a transferable grant.

Missing public issuance route admission, protected native secret generation/delivery, real policy/rate-limit/authority issuance, atomic current-generation/one-use arbitration, durable original state/result custody and restore-safe recovery remain explicit. These prerequisites prevent claiming PA01 native availability or whole-feature closure. No new central command ID, fake trust grant, automatically reissued recovery token or EventRecord is introduced.

## Central integration checkpoint (landing held)

Rebased onto the verified packet repair `bad5718eede2686cc573cbc200c771f232a45815`
as `6b080c2e8`; only generated index conflicts were regenerated. This separate
worktree does not alter the frozen repair capture or its complete delta.

The central manifest now enrolls this exact pair once and dispatches its semantic
rules. All 40 pairs pass: 1,283 positive and 4,377 negative cases. Sixteen focused
pairing tests and nine central-manifest regressions pass. Two storage disposition
rows classify four runtime metadata kinds, excluding the fixture wrapper; the
regression checks all physical family values, retention policies and predecessor
dispositions against the pinned repair tree. No physical family is added or
changed. Physical issuance custody remains explicitly pending.

Shard generation changes only the edited storage registry's derived root; Server
is not a configured shard source. Index generation passes with 6,733 PlanUnits
and 26,387 acceptance units, runtime certification still blocked.

Full gate evidence:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/server-pairing-integrated-gate-001/stdout`,
SHA-256 `c66537d81ea9758dd1a549c0131e71e1f6c982655c6abc8eff0104c14e87d863`.
Focused test evidence: sibling `server-pairing-integrated-tests-001/stderr`,
SHA-256 `52c401e437b9c47ec9a5bf7695582dce1ab4aa3ed69bc8e6e2b02d46f87dfdd4`.

Landing is stopped by the earlier repair batch's complete-delta findings, not
waived by these focused checks. This checkpoint preserves already-started work
on a branch only; it does not claim a main landing, complete Server feature,
governance refresh or whole-packet closure.
