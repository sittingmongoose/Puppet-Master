# Shard 035: Compatibility/source-lineage - Runtime Blocked, Queue, and Recovery GUI Canonical Alignment (2026-03-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L4245-L4272

Source SHA256: `08f4400cd12ad4bc3a881179aacffcd2c50ed22b15eed2710558f2ecea6fa097`

---

## Compatibility/source-lineage - Runtime Blocked, Queue, and Recovery GUI Canonical Alignment (2026-03-09)

> **Superseded — see Canonical Blocked/Recovery Behavior below. Compatibility/source-lineage only.** This section preserves exact `wizard_blocked`, queue, and recovery tokens while the canonical GUI summary governs precedence.

### `wizard_blocked` CtA card
Add a first-class `wizard_blocked` card alongside `wizard_attention_required`.

Required fields:
- `card_type = wizard_blocked`
- `wizard_id`
- `wizard_step`
- `blocked_reason_code`
- `report_ref`
- `resume_url`
- `thread_id?`

Required UI behavior:
- more severe visual treatment than `wizard_attention_required`
- primary action: `Resume Wizard`
- secondary action: `View report`
- auto-dismiss only when the wizard leaves `blocked`
- priority order: `wizard_blocked > HITL approval > wizard_attention_required > interrupted > rate limit > warnings`
### Thread/status surfaces
Thread and run status surfaces MUST include distinct presentations for:
- `attention_required`
- `blocked`
- `retrying/backoff`
- `remediation`
