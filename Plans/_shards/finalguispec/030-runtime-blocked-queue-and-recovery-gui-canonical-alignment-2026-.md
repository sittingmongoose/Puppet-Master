# Shard 030: Runtime Blocked, Queue, and Recovery GUI Canonical Alignment (2026-03-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L2900-L2927

Source SHA256: `1074b6a34eb9c96664250a0ebadca7944d9295c74022d594254fceccd385d69e`

---

## Runtime Blocked, Queue, and Recovery GUI Canonical Alignment (2026-03-09)

> **Superseded** — see Canonical Blocked/Recovery Behavior below.

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
