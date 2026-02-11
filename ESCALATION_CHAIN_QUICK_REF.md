# Escalation Chain Quick Reference

## Overview

Configurable escalation chains allow you to define how the orchestrator responds to failures at different attempt numbers. Instead of hardcoded retry logic, you can specify a sequence of actions for each failure type.

## Configuration Structure

```yaml
escalation:
  chains:
    <failure_type>:
      - action: <action>
        maxAttempts: <number>
        to: <target>
        notify: <boolean>
```

## Failure Types

| Type | Description | Triggered By |
|------|-------------|--------------|
| `testFailure` | Test suite failures | Test failures, assertion errors |
| `acceptance` | Gate/acceptance failures | Gate verification fails |
| `timeout` | Operation timeouts | Timeout exceeded |
| `structural` | Structural issues | Architecture problems |
| `error` | General errors | Other errors |

## Actions

| Action | Description | Behavior |
|--------|-------------|----------|
| `retry` | Retry at current tier | Try again with same agent |
| `selfFix` | Self-fix attempt | Autonomous resolution attempt |
| `kickDown` | Delegate to subordinate | Pass to lower-tier agent |
| `escalate` | Escalate to parent | Pass to higher-tier agent |
| `pause` | Pause for user | Stop and wait for manual intervention |

## Configuration Fields

### `action` (required)
The action to take at this step in the chain.

### `maxAttempts` (optional)
Number of attempts this step covers. If omitted or `null`, covers all remaining attempts (infinite).

### `to` (optional, required for `escalate` and `kickDown`)
Target tier type for escalation:
- `phase` - Escalate to phase level
- `task` - Escalate to task level  
- `subtask` - Escalate to subtask level

### `notify` (optional, default: false)
If `true`, log a warning when this step is triggered.

## Step Selection Algorithm

Steps define contiguous attempt ranges in order:

```
Step 1: maxAttempts=2  → Covers attempts 1-2
Step 2: maxAttempts=1  → Covers attempt 3
Step 3: maxAttempts=null → Covers attempts 4+
```

If all steps have finite maxAttempts and the attempt exceeds the sum, the last step is used.

## Examples

### Example 1: Basic Retry → Escalate

```yaml
escalation:
  chains:
    testFailure:
      - action: retry
        maxAttempts: 3
      - action: escalate
        to: task
        notify: true
```

- Attempts 1-3: Retry at current tier
- Attempts 4+: Escalate to task tier

### Example 2: Progressive Escalation

```yaml
escalation:
  chains:
    timeout:
      - action: retry
        maxAttempts: 2
        notify: false
      - action: selfFix
        maxAttempts: 1
        notify: true
      - action: escalate
        to: phase
        notify: true
```

- Attempts 1-2: Silent retry
- Attempt 3: Self-fix with notification
- Attempts 4+: Escalate to phase with notification

### Example 3: Immediate Escalation

```yaml
escalation:
  chains:
    structural:
      - action: escalate
        to: phase
        notify: true
```

- All attempts: Escalate immediately to phase

### Example 4: Pause for Critical Issues

```yaml
escalation:
  chains:
    error:
      - action: retry
        maxAttempts: 1
      - action: pause
        notify: true
```

- Attempt 1: One retry
- Attempts 2+: Pause for user intervention

### Example 5: Kick Down to Subordinate

```yaml
escalation:
  chains:
    testFailure:
      - action: retry
        maxAttempts: 2
      - action: kickDown
        to: subtask
        maxAttempts: 2
      - action: escalate
        to: task
        notify: true
```

- Attempts 1-2: Retry
- Attempts 3-4: Kick down to subtask tier
- Attempts 5+: Escalate to task tier

## Tier-Level Fallback

If no chain is configured for a failure type, the tier-level `escalation` field is used:

```yaml
tiers:
  subtask:
    platform: claude
    model: claude-sonnet-4-20250514
    escalation: task  # Fallback escalation target
```

## Event Emission

When escalation is triggered, a `PuppetMasterEvent::Escalation` is emitted:

```json
{
  "type": "escalation",
  "from_tier_id": "1.2.3",
  "to_tier_id": "1.2",
  "reason": "Escalating from Subtask to Task",
  "timestamp": "2025-02-03T10:30:45.123Z"
}
```

## Monitoring & Logging

### With `notify: true`
```
[WARN] Escalation step 2 for 1.2.3 at attempt 3: action=EscalateToParent
[INFO] Escalation triggered: 1.2.3 (Subtask) -> 1.2 (Task)
```

### Without `notify: false`
```
[INFO] Escalation triggered: 1.2.3 (Subtask) -> 1.2 (Task)
```

## Best Practices

1. **Start with retries**: Give the agent a chance to self-correct
2. **Use notifications for important steps**: `notify: true` for escalations
3. **Define infinite final step**: Use `maxAttempts: null` for the last step
4. **Match failure types**: Configure chains for common failures in your workflow
5. **Test your chains**: Simulate failures to verify behavior

## Common Patterns

### Conservative (minimal escalation)
```yaml
- action: retry
  maxAttempts: 5
- action: pause
  notify: true
```

### Aggressive (quick escalation)
```yaml
- action: retry
  maxAttempts: 1
- action: escalate
  to: task
  notify: true
```

### Balanced (graduated response)
```yaml
- action: retry
  maxAttempts: 2
- action: selfFix
  maxAttempts: 1
- action: escalate
  to: task
  notify: true
```

## Migration from Legacy

If you don't configure `escalation.chains`, the system falls back to the legacy `EscalationEngine` behavior:

```rust
// Legacy behavior (automatic fallback)
- Transient failures: 2 self-fix attempts, then escalate
- Technical failures: 1 retry, then escalate
- Conceptual failures: Escalate immediately
- Critical failures: Pause immediately
```

To migrate, convert your expected behavior to chain configuration.

## Troubleshooting

### Escalation not triggering
- Check that failure type matches your chain key (case-sensitive in YAML)
- Verify `to` field is specified for `escalate` action
- Ensure parent tier of target type exists

### Wrong action selected
- Review `maxAttempts` ranges - they should be contiguous
- Check that attempt number is within expected range
- Verify last step has `maxAttempts: null` if you want it to catch all

### Events not emitted
- Verify `PuppetMasterEvent` variant added to `OrchestratorEvent`
- Check event receiver is subscribed
- Look for errors in orchestrator logs

## API Reference

### Helper Functions

```rust
// Map failure type to chain key
pub fn map_failure_type_to_chain_key(
    failure_type: EscalationChainFailureType
) -> EscalationChainKey

// Select step based on attempt
pub fn select_escalation_chain_step(
    chain: &[EscalationChainStepConfig],
    attempt: u32
) -> Result<EscalationChainSelection>

// Convert target to tier type
pub fn to_tier_type(
    value: Option<EscalationTarget>
) -> Option<TierType>
```

### Orchestrator Methods

```rust
// Determine action using config
async fn determine_escalation_action_from_config(
    &self,
    escalation_config: &EscalationChainsConfig,
    signal: &CompletionSignal,
    attempt: u32,
    tier_id: &str,
    tier_type: TierType
) -> Result<EscalationAction>

// Trigger escalation and emit event
async fn trigger_escalation(
    &self,
    from_tier_id: &str,
    from_tier_type: TierType,
    to_tier_type: TierType
) -> Result<()>
```

---

For full implementation details, see `ESCALATION_CHAIN_IMPLEMENTATION.md`.
