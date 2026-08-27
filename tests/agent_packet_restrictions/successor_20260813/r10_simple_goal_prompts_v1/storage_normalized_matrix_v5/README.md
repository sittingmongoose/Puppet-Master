# Storage Normalized Matrix V5

This is a fresh, frozen, pre-WorkNode 12-route-by-two-pass Storage matrix. It is a thin adapter over pushed code:

- `storage_native_matrix_v2/controller.py` and its Codex App receipt lane;
- `storage_glm53_max_normalized_canary_v6/controller.py`, `models.yml`, and recursively order-sensitive `result_normalizer.py`;
- the frozen `system_pipeline_sandbox_v7` pipeline, OMP session parser/runner, and matrix verifier.

It does not import `storage_normalized_matrix_v3`; V3 is lineage evidence only. V1 and V2 failures remain permanent failures with no retry or credit, and V3 has no evidence or credit. V4 is pinned at source commit `3a5709e0d0c55db42d8fd362cd55595bb7fef512` and failure-custody commit `9bffa9b920e24a14469e7217357de3d283784aa1`: its row 1 remains a zero-credit PASS, its row-2 wrapper-profile failure remains a permanent matrix stop, and its design note grants no successor authority.

## Frozen order

Each pass uses the same order:

1. `opencode-go/glm-5.3-flash|max`
2. `cursor/default|auto`
3. `opencode-go/muse-spark-1.2-contributor|xhigh`
4. `opencode-go/deepseek-v4-flash|max`
5. `google-antigravity/gemini-3.7-flash|high`
6. `gpt-5.6-luna|max`
7. `gpt-5.6-luna|medium`
8. `gpt-5.4|xhigh`
9. `gpt-5.4|medium`
10. `gpt-5.4-mini|xhigh`
11. `gpt-5.4-mini|medium`
12. `alibaba-token-plan/qwen3.8-max|xhigh`

All 24 attempts, nonces, OMP runtime paths, evidence identities, and Codex projectless directory/title identities are preregistered and globally fresh. Only the exact next ordinal can be used. Any consumed failure blocks every suffix row. There is no retry, replacement, best-of, choreography, follow-up, retro-credit, WorkNode, Plan/ledger, Assistant Chat, or Windows OMP authority. Qualification credit is possible only after exact 24/24 PASS on unchanged pushed bytes.

## Runtime and verification

Every OMP launch is native/default, uses one exact 3,036-byte `/goal` prompt, has advisor controls off, disables ordinary tools/skills/rules/extensions, uses an isolated Linux profile and environment, and requires a normal exit within 3,600 seconds. Before each OMP reservation the controller checks the complete V5 prefix, the current OMP 18.0.7 binary and effective `advisor.enabled=false` plus `task.agentAdvisor={task:off}`, then rechecks source custody. The inherited runner's inner pre-reservation gate is bound to the same complete V5 prefix verifier: each persisted row is selected independently for structural, receipt, and GLM formal/private-HTTP verification, then the selected current row is restored and the journal length must equal `ordinal-1`. Row preflight and the Popen boundary repeat pushed-source custody.

The GLM53/max route imports the V6 max-model override, request/response formal lane, structural verifier, and ordered normalizer. Other OMP routes use V7 provider-specific native Goal structure plus that same V6 normalizer. Session errors remain transient until the original structure passes or an explicit `session_exit` closes the trace; retry-recovery and assistant provider errors are immediately permanent. A PASS terminal is never altered or supplemented by post-PASS failure preservation.

Codex rows use the pushed V2 host-receipt adapter. The only parent calls allowed are `create_thread`, `wait_threads`, and `read_thread`. The ordinary prompt begins `Create a goal that`. Every admitted assistant text block is normalized in chronological order; exactly one final answer must be the last assistant terminal after Goal completion. Create request issuance is row-bound, atomic, immutable, and cannot be emitted twice.

The V6 canary is verified independently from pinned Git objects at source commit `0b3ea03b801778aed7e35f7fd7f70a745dbbbb7e`, evidence commit `6ee1f202f7074a3ed7be2da6052b433e25d1b74b`, and detached-custody commit `705e1212ed29fbe81048231cc48885cd2752d182`. Verification uses `cat-file`, `ls-tree`, and `diff-tree`, plus the committed authority and push-custody receipts. It never invokes the consumed V6 canary's `verify-prefix` at a later HEAD. The canary receipt explicitly grants no matrix authority; matrix authority is separately frozen from the current user's exact matrix directions and active Goal.

The completed GLM row's formal verification intentionally remains fail-closed on its six private mode-0600 request/response raw files under the row's mode-0700 `/tmp` capture directory. They are not copied into repo evidence. Loss of that private runtime custody blocks resumption; it does not weaken or reconstruct evidence.

## Zero-subject commands

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py lint
PYTHONDONTWRITEBYTECODE=1 python3 -B selftest.py
PYTHONDONTWRITEBYTECODE=1 python3 -O -B selftest.py
PYTHONDONTWRITEBYTECODE=1 python3 -B controller.py verify-prefix
```

Subject runtime commands are separate and require the exact next frozen ordinal. Lint/selftest may execute the zero-subject OMP version/config preflight, but never create a reservation, Popen an OMP subject, call a provider, or create an App thread.
