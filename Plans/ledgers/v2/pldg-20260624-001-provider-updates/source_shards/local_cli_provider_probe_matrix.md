# Local CLI Provider Probe Matrix

Ledger: `pldg-20260624-001-provider-updates`
Created: `2026-06-25T13:49:46Z`

## User instruction

Jared clarified:

- `There should be no uncertainty.`
- `We should be testing it locally to make sure it works as expected.`
- `The cli providers will need to be tested by you.`

This shard records local, non-destructive CLI probes run from `/Users/jaredsmacbookair/Documents/PuppetMaster`. Account identifiers, OAuth URLs, request IDs, session IDs, and other local/private details are intentionally redacted or omitted.

## Probe summary

| CLI/provider surface | Local command/path | Probe result | Verification state |
| --- | --- | --- | --- |
| Antigravity CLI | `/tmp/pm-agy-bin/agy` | `--version` returned `1.0.11`; help lists `--model`, `--print`, `--print-timeout`, `models`, `plugin`; `agy models` returned sign-in-required; `agy -p` produced OAuth flow and waited for auth. | Installed, command surface verified, model/prompt execution auth-gated and not end-to-end verified. |
| Cursor Agent | `/Users/jaredsmacbookair/.local/bin/cursor-agent` | `--version` returned `2026.02.13-41ac335`; help exposes `--model`, `--list-models`, `models`, `status`, `--print`, `--output-format text|json|stream-json`, `--mode plan|ask`, `--trust`; `status` reported logged in; `models` returned `No models available for this account`; `--print --mode=ask --trust` returned authentication required. | Installed, command surface verified, local account/model execution not passing; status/model/prompt behavior conflict needs follow-up. |
| Claude Code | `/Users/jaredsmacbookair/.local/bin/claude` | `--version` returned `2.1.49 (Claude Code)`; help exposes `--model`, `--effort low|medium|high`, `--print`, `--output-format`, `--input-format`, `--permission-mode`, `--allowed-tools`, `--mcp-config`; auth status reported logged in, but a minimal `-p` prompt returned API authentication error. | Installed, command surface verified, local prompt execution not passing; auth/runtime mismatch needs follow-up. |
| Codex CLI | `/usr/local/bin/codex` -> `/usr/local/lib/node_modules/@openai/codex/bin/codex.js` | package version `@openai/codex@0.101.0`; Node wrapper timed out for `--version`, `--help`, and `status`; direct native binary exited by signal 9 for `--version` and `--help`; `spctl` reported `CSSMERR_TP_CERT_REVOKED`. | Installed but locally unusable in this probe; support cannot be claimed until reinstall/signature/runtime issue is fixed and retested. |
| Gemini CLI | `/usr/local/bin/gemini` | `--version` returned `0.44.0-nightly.20260515.g928a311fb`; help exposes old Gemini CLI surfaces; minimal prompt returned `UNSUPPORTED_CLIENT` / `IneligibleTierError` and migration guidance to Antigravity. | Local probe confirms Gemini CLI should be removed from active support. |
| GitHub Copilot CLI through `gh` | `/opt/homebrew/bin/gh copilot` | `gh` version `2.86.0`; `gh copilot -- --version` returned GitHub Copilot CLI `0.0.421`; help exposes `--model` choices including Claude, Gemini, and GPT/Codex models, `--prompt`, `--acp`, permissions, MCP, and config/log flags; minimal prompt exited non-zero with no useful output. | Installed and command surface verified; prompt execution not passing yet. |
| OpenCode CLI | not found on PATH | `command -v opencode` did not find an installed CLI; `npm view opencode` returned 404 for the unscoped package name. | Not locally installed as `opencode`; install/package route must be identified before CLI execution can be verified. |

## Boundary correction

On `2026-06-25T14:06:02Z`, Jared clarified: `Codex and opencode are direct providers, we don’t need to bridge their clis right?`

Accepted interpretation: yes. Codex and OpenCode are no longer treated as active CLI-bridge support blockers. Their CLI probes are retained as local tooling evidence only unless PM later explicitly chooses to expose optional CLI-bridged tooling for them. See `source_shards/local_provider_blocker_followup.md` for the updated probe disposition.

## Redaction rule applied

Do not write account email, organization IDs, request IDs, session IDs, OAuth state/code-challenge URLs, access tokens, API keys, or credential file contents into the ledger. Local auth/output probes may record pass/fail/auth-gated status and sanitized error class only.

## PM planning implications

- There should be no compiled provider behavior that remains `unknown` or merely source-inferred.
- CLI provider compile readiness requires local proof for:
  - installed command path and version
  - help/command surface
  - auth/readiness state
  - model listing or explicit model-list unavailability
  - minimal non-mutating prompt execution
  - model selection flag behavior
  - thinking-effort flag/variant behavior where supported
  - output format/stream format behavior
  - permission/sandbox/trust flags
  - account root/config isolation behavior
- A CLI route can be compiled as unsupported/blocked/removed if local probes prove that state, as with Gemini CLI.
