# Shard 017: Remote Side-Effect Blocked Payload Normalization (2026-03-09)

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L966-L986

Source SHA256: `6c19618bac5e01bd203cecfa94832862fc98fd18b0d540c9542112916d6b7cb5`

---

## Remote Side-Effect Blocked Payload Normalization (2026-03-09)

The Docker/Unraid remote-side-effect contracts remain the reference pattern for blocked remote mutation and must use canonical runtime payload names.

Required runtime-facing rules:
- remote side effects blocked by confirmation/policy remain `blocked`, not `failed`
- preserve completed local work whenever remote publish/creation steps are blocked
- auth expiry during publish blocks the publish path without discarding the completed local build result
- remote-side-effect approval requirements remain blocked until explicitly resolved
- auth recovery alone does not auto-resubmit or auto-publish a blocked remote side effect; explicit resume/retry remains required
- UI must explain when a local artifact exists but remote publish remains blocked
- runtime-facing blocked payloads MUST use canonical `blocked_reason_code` plus ordered `allowed_action_ids[]`
- domain-specific `reason_code` values MAY remain internal detail, but MUST map into canonical runtime taxonomy at shared surfaces

Canonical runtime-facing blocked payload shape:
- `blocked_reason_code`
- ordered `allowed_action_ids[]`
- `preserved_local_work`
- `detail_ref?`

Legacy fields such as `reason_code` and `recovery_options[]` are non-canonical and MUST NOT be copied into new shared runtime contracts.
