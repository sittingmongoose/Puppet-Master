# Local Provider Blocker Follow-up

Ledger: `pldg-20260624-001-provider-updates`
Created: `2026-06-25T14:06:02Z`

## User correction

Jared clarified:

- `Codex and opencode are direct providers`
- `we don’t need to bridge their clis right?`

Accepted interpretation: yes. Codex and OpenCode should not be treated as active CLI-bridged provider routes for core PM support. CLI probes for those tools can still inform optional tooling or local install guidance, but direct-provider verification belongs to direct provider APIs/source/catalog behavior rather than CLI bridge execution.

## Follow-up local probes

All installs below were isolated under `/tmp/pm-provider-cli-tools` unless otherwise noted. Account identifiers, tokens, OAuth URLs, request IDs, and session IDs were redacted or omitted.

| Surface | Follow-up result | Planning disposition |
| --- | --- | --- |
| Codex direct/OpenAI route | Installed `@openai/codex@0.142.2` in the temp prefix. `codex --version` returned `codex-cli 0.142.2`; `codex login status` reported ChatGPT auth; `codex exec -s read-only --ephemeral --skip-git-repo-check "Return exactly: ok"` returned `ok`; `-c model_reasoning_effort='"low"'` changed the reported reasoning effort to `low` and returned `ok`. | Codex local CLI issue from `@openai/codex@0.101.0` is an outdated/broken install issue, not a core direct-provider blocker. PM still should treat Codex/OpenAI as direct provider support, not a required CLI bridge. |
| OpenCode direct/catalog route | Installed current terminal package `opencode-ai@1.17.11`; `opencode --version` returned `1.17.11`; help exposes `opencode run`, `opencode providers/auth`, `opencode models`, `--model provider/model`, and `--variant` for provider-specific reasoning effort. | OpenCode is useful as direct-provider source/catalog reference and optional tooling reference. PM does not need to bridge the OpenCode CLI for core provider support. |
| OpenCode v2 preview service | Installed `@opencode-ai/cli@1.17.11`; it exposes `lildax`, not `opencode`, and describes an OpenCode 2.0 preview command line with `serve`, `service`, `api`, `migrate`, and `debug`. | Record as v2-preview tooling evidence, not the current terminal agent CLI route PM must bridge. |
| Antigravity CLI | Existing `/tmp/pm-agy-bin/agy@1.0.11` remains installed. No local `gcloud` command was found, so ADC verification via `USE_ADC=1 agy` cannot be completed locally. Prior `agy models` and `agy -p` probes remain sign-in/OAuth gated. | Active CLI-bridged route remains blocked on authenticated/local account verification or an explicit auth-gated disposition. |
| Cursor Agent | `cursor-agent update` returned an unauthenticated update error. `cursor-agent status` still reports login success but cannot fetch user details; `cursor-agent models` still reports `No models available for this account`. | Active CLI-bridged route remains blocked by account/model availability and prompt-auth mismatch. |
| Claude Code | Installed `@anthropic-ai/claude-code@2.1.191` in the temp prefix. `claude auth status` reports logged in via `claude.ai`, but `claude -p` prompt mode returned `Not logged in · Please run /login`. | Active CLI-bridged route remains blocked by mismatch between interactive/auth status and non-interactive prompt auth. |
| GitHub Copilot CLI through `gh` | `gh auth status` reports a logged-in GitHub account, but `gh copilot -- -p "Return exactly: ok" -s --no-color --no-alt-screen --available-tools ''` still exited `1` with no useful response. | Active CLI-bridged route remains blocked until prompt execution can return a useful response or is compiled as blocked/unsupported. |
| Gemini CLI | Prior local prompt returned `UNSUPPORTED_CLIENT` / `IneligibleTierError` and migration guidance to Antigravity. | Removed/retired; not a route to repair. |

## Updated blocker scope

`blk-0001` now applies to active CLI-bridged provider routes only:

- Antigravity CLI
- Cursor Agent
- Claude Code
- GitHub Copilot CLI through `gh`

It does not apply to Codex or OpenCode core provider support because Jared clarified those are direct providers and PM does not need to bridge their CLIs.

## Active CLI bridge refinement

Second-pass probes on the remaining CLI-bridged routes produced the following sharper blocker states:

| Surface | Additional probe | Refined blocker |
| --- | --- | --- |
| Antigravity CLI | `USE_ADC=1 agy models` with isolated `HOME` still returned sign-in-required; local `gcloud` was not found. | Antigravity end-to-end verification requires a real signed-in Antigravity session or installed/configured Google Cloud ADC. |
| Cursor Agent | `cursor-agent about` reported `User Email Not logged in`; `cursor-agent --list-models` returned no models; update already returned unauthenticated. | Cursor local state is internally inconsistent: status can report success, but about/models/update/prompt do not prove usable account/model access. |
| Claude Code | Current `@anthropic-ai/claude-code@2.1.191` prompt mode returned `Not logged in`; `claude doctor` produced no output before manual interruption after repeated waits. | Claude non-interactive prompt execution is not verified even though auth status reports a login. Health diagnostics also did not complete in this environment. |
| GitHub Copilot CLI through `gh` | Minimal prompt with `--allow-all`, disabled built-in MCPs, no custom instructions, no alt screen, no color, and stream off exited `1` with no useful output. | Prompt execution remains unverified despite GitHub auth being present. |
