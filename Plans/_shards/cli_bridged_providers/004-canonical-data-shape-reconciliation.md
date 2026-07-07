# Shard 004: Canonical data-shape reconciliation

Source: `Plans/CLI_Bridged_Providers.md`

Source lines: L36-L67

Source SHA256: `343107263a39fdf98bdde8b8ece01c26d3f7c26664a0af42a24432be3abdde2c`

---

## Canonical data-shape reconciliation

### Required data shape


### Contract shape (facade)

The contract shape is the provider facade handoff record used by bridge launchers, HTTP adapters, and normalized stream consumers.

The `BRIDGE_INVOKE_OPTIONS` record passed through the shell command line MUST preserve these fields:

```typescript
BRIDGE_INVOKE_OPTIONS {
  persona: string;            // Which Persona is active
  model: string;              // AI model requested (no provider precompute)
  model_variant?: string;     // Optional variant (effort, reasoning, etc.)
  provider_override?: string; // Explicitly requested provider
  run_mode: string;           // 'automate' | 'interactive' | 'diagnostic'
  trace_level: string;        // 'none' | 'summary' | 'detailed' | 'debug'
  account_id?: string;        // Requested GitHub account context
  dag_input?: string;         // Serialized DAG for this stage
  execution_role: string;     // Executor identity for permission/quota/logs
  shell_env?: Record;         // Safe shell environment snapshot
  worktree_id?: string;       // Assigned worktree for this node
  approve_mode?: string;      // 'auto_approve' | 'require_approval' | 'suggest_only'
  approval_id?: string;       // ID for prior approval context if resuming
  mutation_policy: string;    // 'conservative' | 'standard' | 'aggressive'
  timeout_ms?: number;        // Explicit timeout if scoped
  retry_policy?: string;      // 'backoff' | 'immediate' | 'custom'
  max_retries?: number;       // Retry ceiling for this provider
}
```
