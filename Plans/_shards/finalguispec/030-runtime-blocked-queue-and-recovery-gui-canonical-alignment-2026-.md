# Shard 030: Runtime Blocked, Queue, and Recovery GUI Canonical Alignment (2026-03-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L2948-L2975

Source SHA256: `e757b69c58378f86efe32340625f8e1dcb9687b43bc8ce1739a5ad9712b3435e`

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
