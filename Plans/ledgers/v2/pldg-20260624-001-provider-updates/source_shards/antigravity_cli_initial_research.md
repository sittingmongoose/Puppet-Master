# Antigravity CLI Initial Research

Ledger: `pldg-20260624-001-provider-updates`
Captured: 2026-06-24T10:15:06Z

## Live Sources

- Google Developers Blog, "An important update: Transitioning Gemini CLI to Antigravity CLI", published 2026-05-19.
- GitHub discussion `google-gemini/gemini-cli#27274`, transition announcement mirrored by Gemini CLI maintainers.
- Official GitHub repo `google-antigravity/antigravity-cli`, cloned at `5a7b8ef88e99e62a4d68a7cdf056c21a5fcc2d53` from `main`, tag `1.0.11`.
- Antigravity CLI installer `https://antigravity.google/cli/install.sh`.
- Antigravity CLI release manifests checked for `darwin_arm64` and `linux_amd64`, both returning version `1.0.11`.
- Google codelab `https://codelabs.developers.google.com/antigravity-cli-hands-on`.

## Observed Facts

- Google announced transition from Gemini CLI to Antigravity CLI for consumer/free/Google AI Pro/Ultra paths, with June 18, 2026 stop-serving date for affected Gemini CLI and Gemini Code Assist IDE extension use.
- Enterprise access remains a carveout in the announcement: Gemini CLI and Gemini Code Assist stay supported for Standard/Enterprise/Google Cloud paths, and Gemini CLI remains accessible via paid Gemini and Gemini Enterprise Agent Platform API keys.
- Public `google-antigravity/antigravity-cli` repo is documentation/distribution evidence, not full implementation source. It contains README, CHANGELOG, demo media, and example statusline/title scripts.
- CLI binary name is `agy`. Installer defaults to `$HOME/.local/bin/agy`, fetches a per-platform manifest, downloads from Google storage, verifies SHA-512, and then runs `agy install`.
- README describes Antigravity CLI as a terminal TUI sharing the core Antigravity agent engine, settings, and permissions with Antigravity 2.0.
- README says auth uses system keyring and falls back to Google Sign-In; local login opens a browser; remote/SSH prints an authorization URL; `/logout` clears credentials.
- Changelog 1.0.11 adds ADC auth via `USE_ADC=1 agy`.
- Codelab shows first-run login choices: `Google OAuth` and `Use a Google Cloud project`.
- Codelab and changelog show model selection via `agy models`, `--model`, and `/model`.
- Codelab sample model list includes Gemini 3.5 Flash variants, Gemini 3.1 Pro variants, Claude Sonnet 4.6, Claude Opus 4.6, and GPT-OSS 120B.
- Changelog 1.0.5 added `--model` and `models`.
- Changelog/README/codelab show provider capability surfaces: subagents, hooks, skills, plugins, MCP config, permissions, sandbox, artifacts, statusline/title JSON payloads, `/settings`, `/config`, and non-interactive `-p`.

## Current PM Docs That Still Mention Gemini CLI

- `Plans/CLI_Bridged_Providers.md`
- `Plans/Multi-Account.md`
- `Plans/Models_System.md`
- `Plans/Contracts_V0.md`
- `Plans/usage-feature.md`
- `Plans/00-plans-index.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/FinalGUISpec.md`
- `Plans/Permissions_System.md`
- `Plans/Tools.md`

## Planning Pressure Points

- Decide whether Antigravity CLI becomes a new concrete provider entry, likely `antigravity_cli`, while `gemini_cli` becomes compatibility/enterprise/source-lineage.
- Decide whether non-Gemini models brokered through Antigravity CLI remain under one Antigravity provider entry with upstream vendor/model identity preserved as requested/effective evidence.
- Preserve enterprise/API-key Gemini CLI carveouts intentionally instead of blindly deleting or retaining old `gemini_cli` canon.
- Account isolation must not assume `GEMINI_CLI_HOME` applies to `agy`; evidence currently points to `~/.gemini/antigravity-cli/` paths and shared `~/.gemini/config/` hooks, but a supported Antigravity-specific home override has not been proven.
