# Antigravity CLI Local Verification

Captured for ledger `pldg-20260624-001-provider-updates` on 2026-06-24. This is ledger/source-lineage evidence only and is not canonical Plans prose.

## Install

- Official installer fetched from `https://antigravity.google/cli/install.sh`.
- Installed with isolated environment variables and custom target:
  - `HOME=/tmp/pm-agy-home`
  - `XDG_CONFIG_HOME=/tmp/pm-agy-xdg-config`
  - `XDG_CACHE_HOME=/tmp/pm-agy-xdg-cache`
  - `XDG_DATA_HOME=/tmp/pm-agy-xdg-data`
  - `bash /tmp/pm-agy-install.sh --dir /tmp/pm-agy-bin`
- Installer detected `darwin_arm64`, downloaded latest `1.0.11`, verified checksum, and placed the executable at `/tmp/pm-agy-bin/agy`.
- Installer output also included a misleading setup line saying the binary was placed at `/tmp/pm-agy-home/.local/bin/agy`, but filesystem inspection showed `/tmp/pm-agy-bin/agy` exists and `/tmp/pm-agy-home/.local/bin` does not.

## Verified Commands

- `/tmp/pm-agy-bin/agy --version` returned `1.0.11`.
- `/tmp/pm-agy-bin/agy --help` exposed:
  - `--add-dir`
  - `--continue` / `-c`
  - `--conversation`
  - `--dangerously-skip-permissions`
  - `--log-file`
  - `--model`
  - `--print` / `-p` / `--prompt`
  - `--print-timeout`
  - `--prompt-interactive` / `-i`
  - `--sandbox`
  - subcommands: `changelog`, `help`, `install`, `models`, `plugin`, `plugins`, `update`
- `/tmp/pm-agy-bin/agy models --help` returned usage for `agy models`.
- `/tmp/pm-agy-bin/agy models` returned: `Error: Please sign in to view available models. Launch the CLI without arguments to sign in.`
- `/tmp/pm-agy-bin/agy --print-timeout 10s -p "Return only the word ok."` initiated OAuth, waited for an authorization code, and ended with `Error: authentication timed out.`
- `/tmp/pm-agy-bin/agy --model "Gemini 3.5 Flash (Low)" --print-timeout 10s -p "Return only the word ok."` followed the same OAuth/auth-timeout path. This proves the flag is accepted before auth, not that authenticated generation works.
- `/tmp/pm-agy-bin/agy plugin --help` exposed plugin commands:
  - `list`
  - `import [source]`
  - `install <target>`
  - `uninstall <name>`
  - `enable <name>`
  - `disable <name>`
  - `validate [path]`
  - `link <mp> <target>`
  - `help`
- `/tmp/pm-agy-bin/agy plugin list` returned `No imported plugins.`
- `agy plugin import --help` and `agy plugin validate --help` are not help-aware; they interpret `--help` as an import source/path and return errors.

## State Paths Observed

With `HOME=/tmp/pm-agy-home`, Antigravity wrote under:

- `/tmp/pm-agy-home/.gemini/config/mcp_config.json`
- `/tmp/pm-agy-home/.gemini/config/.migrated`
- `/tmp/pm-agy-home/.gemini/config/projects/<uuid>.json`
- `/tmp/pm-agy-home/.gemini/antigravity-cli/cache/projects.json`
- `/tmp/pm-agy-home/.gemini/antigravity-cli/last_check.timestamp`
- `/tmp/pm-agy-home/.gemini/antigravity-cli/installation_id`
- `/tmp/pm-agy-home/.gemini/antigravity-cli/log/*.log`
- `/tmp/pm-agy-home/.gemini/antigravity-cli/builtin/skills/antigravity_guide/**`
- `/tmp/pm-agy-home/Library/Caches/ms-playwright-go/1.57.0/**`
- `/tmp/pm-agy-home/.cache/antigravity/staging`

The explicit `XDG_CONFIG_HOME`, `XDG_CACHE_HOME`, and `XDG_DATA_HOME` directories remained unused in this test.

The project mapping written for this repo recorded:

- project path: `/Users/jaredsmacbookair/Documents/PuppetMaster`
- folder URI: `file:///Users/jaredsmacbookair/Documents/PuppetMaster`

## Verification Boundary

Authenticated model listing and real prompt execution were not completed because the CLI requires user sign-in. The ledger should treat command existence, auth gating, state paths, and unauthenticated error behavior as verified; it should not treat the authenticated model catalog, quota behavior, or end-to-end generation as locally verified yet.
