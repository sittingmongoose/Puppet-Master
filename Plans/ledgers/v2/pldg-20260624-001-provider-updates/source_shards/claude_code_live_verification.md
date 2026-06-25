# Claude Code Live Verification

- ledger_id: `pldg-20260624-001-provider-updates`
- created_at_utc: `2026-06-25T16:37:50Z`
- source_ref: `chat:claude`
- scope: Ledger-only planning evidence. Do not edit canonical Plans from this shard.

## User prompt

Jared said: `claude`

Interpreted in the active provider-testing thread as: retry Claude Code provider tests after Cursor OAuth was verified.

## Test hygiene

- Account email and org identifiers were observed in `claude auth status` output but are redacted from this shard.
- No API key was printed or used.
- No canonical Plans, PlanUnit index, WorkNodes, NodeSeeds, executable queues, Spec Lock, shards, evidence, plan_graph, or auto_decisions were touched.
- No long-running `claude` process remained after testing.

## Local command surface

Installed binary:

- `/Users/jaredsmacbookair/.local/bin/claude`

Version:

- `2.1.49 (Claude Code)`

Relevant command surface from `claude --help`:

- `-p`, `--print`
- `--output-format text|json|stream-json`
- `--input-format text|stream-json`
- `--model <model>`
- `--effort <level>` with `low`, `medium`, `high`
- `--permission-mode <mode>`
- `--tools <tools...>`
- `--max-budget-usd <amount>`
- `auth login`, `auth logout`, `auth status`
- `doctor`

## Auth state

`claude auth status` returned:

- `loggedIn: true`
- `authMethod: claude.ai`
- `apiProvider: firstParty`
- subscription was present
- account email and org identifiers were redacted

Planning disposition:

- Claude Code should be modeled as a first-party `claude.ai` session-auth provider route in this local setup, not only as an API-key provider route.

## Prompt verification

JSON-mode prompt:

- Command shape: `claude -p --output-format json --permission-mode plan --tools "" --model sonnet "Reply with exactly: claude-ok"`
- Result: `subtype: success`
- `is_error: false`
- Result text: `claude-ok`
- Model usage included `claude-sonnet-4-6`.

Stream-json prompt:

- Initial command without `--verbose` failed with: `Error: When using --print, --output-format=stream-json requires --verbose`
- Rerun command shape: `claude -p --verbose --output-format stream-json --permission-mode plan --tools "" --model sonnet --effort low "Reply with exactly: claude-stream-low-ok"`
- Result: success
- Result text: `claude-stream-low-ok`
- Stream init event included:
  - `model: claude-sonnet-4-6`
  - `permissionMode: plan`
  - `apiKeySource: none`
  - `claude_code_version: 2.1.49`
  - tools list was empty because the test used `--tools ""`

Effort selector verification:

- `--effort low` succeeded via stream-json prompt.
- `--effort medium` succeeded via JSON prompt and returned exactly `claude-effort-medium-ok`.
- `--effort high` succeeded via JSON prompt and returned exactly `claude-effort-high-ok`.

## Doctor check

`claude doctor` was retried and still failed in this non-interactive execution context with an Ink/raw-mode error:

- `Raw mode is not supported on the current process.stdin`

Planning disposition:

- Do not use `claude doctor` as the PM provider live-prompt readiness gate in non-interactive automation.
- Use `claude -p` prompt probes for provider liveness.
- Preserve the `stream-json requires --verbose` harness rule.

## Ledger disposition

- Claude Code first-party auth and non-interactive prompt execution are locally live-verified.
- Claude Code supports PM's thinking-effort selector requirement through `--effort low|medium|high`.
- Claude Code should be removed from the active CLI-bridged/live-prompt blocker for the first-party session route.
- Any future API-key Claude provider route remains separate from this first-party `claude.ai` session-auth route.

## Negative constraints

- Do not preserve account email, org identifiers, API keys, or local credential material.
- Do not require Anthropic API-key proof for the first-party Claude Code `claude.ai` session route.
- Do not treat `claude doctor` raw-mode failure as prompt-route failure.
- Do not use `stream-json` without `--verbose` in automation.
- Do not claim every Claude route is verified; this verifies local Claude Code first-party session auth and prompt execution.

`gui_related`: `false`; this is provider/auth CLI verification evidence, not GUI/UI/visual presentation.
