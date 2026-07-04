# Shard 017: Plugin Hook Blocked Specification Addendum

Source: `Plans/Plugins_System.md`

Source lines: L612-L634

Source SHA256: `f74358e512cec51f70525720a4b1dd2d46f701a46c8438828994eb0004453a73`

---

## Plugin Hook Blocked Specification Addendum

This section defines plugin Hook Blocked Specification.

### Hooks that may block execution
Only execution-flow hooks may trigger `plugin_hook_blocked`:
- `pre_tool_invoke`
- `pre_attempt_start`
- `pre_node_dispatch`

Observation-only hooks such as `post_tool_invoke` and `post_attempt_complete` cannot create `plugin_hook_blocked`.

### Required metadata
Plugin-blocked payloads MUST include:
- `blocked_reason_code: plugin_hook_blocked`
- `plugin_id`
- `hook_name`
- `block_reason`
- canonical `allowed_action_ids[]`
- `preserved_local_work`

### Recovery scope
Plugins MUST NOT invent plugin-private runtime recovery semantics. They reuse canonical action families and runtime commands.
