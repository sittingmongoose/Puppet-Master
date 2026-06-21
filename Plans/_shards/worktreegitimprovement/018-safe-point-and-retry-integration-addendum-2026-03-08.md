# Shard 018: Safe-Point and Retry Integration Addendum (2026-03-08)

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L693-L716

Source SHA256: `a7d2273c08de3321166347b4a05d314b40aca1a6c5fc24957594e1c2e70d47f9`

---

## Safe-Point and Retry Integration Addendum (2026-03-08)

### 1. Worktree-native safe points

Runtime safe points for mutation-capable attempts should be implemented on top of the existing worktree / isolated execution model.

Required properties:
- no `git reset --hard` style shared-workspace rollback contract
- preserve isolation within the active worktree/runtime root
- support restoring a failed attempt to its pre-attempt baseline for retry-from-safe-point behavior

### 2. Retry posture visibility

Worktree/branch status surfaces should be able to explain whether a pending retry is:
- waiting on backoff
- waiting on remediation
- ready for retry from safe point
- requiring a fresh attempt

### 3. Acceptance criteria

- Safe-point recovery reuses the worktree-native isolation model.
- Retry-from-safe-point does not rely on destructive shared-workspace reset semantics.
- Worktree-oriented status surfaces can explain retry posture.
