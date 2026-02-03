# Platform and GitHub Authentication: OAuth Confirmation

**Date:** 2026-02-03  
**Purpose:** Confirm that all coding platforms and GitHub used by RWM Puppet Master sign users in via OAuth (or OAuth-like browser/device flows) where interactive login is available.

---

## Summary

| Platform   | Primary interactive sign-in | OAuth / browser flow | Headless / CI fallback      |
|-----------|-----------------------------|----------------------|-----------------------------|
| **Cursor** | App / web dashboard         | Web-based (OAuth typical) | `CURSOR_API_KEY` env       |
| **Codex**  | `codex login`               | ✅ OAuth (browser + localhost callback) | `OPENAI_API_KEY` / device flow requested |
| **Claude Code** | `claude login`      | ✅ OAuth (browser; port 54545) | `ANTHROPIC_API_KEY`        |
| **Gemini** | `gemini auth login`         | ✅ OAuth ("Login with Google") | `GEMINI_API_KEY` / Vertex  |
| **GitHub** | `gh auth login --web`       | ✅ OAuth (device flow; PKCE as of 2025) | `GH_TOKEN` / `GITHUB_TOKEN` |
| **Copilot**| `copilot /login` or `gh auth` | ✅ OAuth (GitHub OAuth) | `GH_TOKEN` with Copilot scope |

---

## Per-platform details

### Cursor

- **Sign-in:** Cursor IDE and account sign-in via cursor.com/dashboard; supports SSO for teams.
- **Mechanism:** Web-based login; modern SaaS typically uses OAuth/OpenID for “Sign in with Google” etc. Cursor does not publish a single “OAuth only” spec; in practice, account login is browser-based and team SSO is explicitly supported.
- **Puppet Master:** Detects auth via `~/.cursor-server` / `~/.cursor` or `CURSOR_API_KEY`. No CLI login command; user signs in via the app.

### Codex (OpenAI)

- **Sign-in:** `codex login` opens a browser and uses `http://localhost:<port>/auth/callback`.
- **Mechanism:** OAuth-based (OpenAI docs: [Authentication](https://developers.openai.com/codex/auth/)). Headless/remote flow (e.g. device flow) is a requested enhancement.
- **Puppet Master:** Uses `codex login` for interactive login; env `OPENAI_API_KEY` for headless/CI.

### Claude Code (Anthropic)

- **Sign-in:** `claude login` opens a browser; optional `--no-browser` prints the login URL.
- **Mechanism:** OAuth with browser; local callback on port 54545.
- **Puppet Master:** Uses `claude login` for interactive; `ANTHROPIC_API_KEY` for headless/CI.

### Gemini (Google)

- **Sign-in:** First run offers “Login with Google”; browser opens for OAuth.
- **Mechanism:** OAuth (“Login with Google”); credentials cached locally. API key and Vertex AI are alternatives.
- **Puppet Master:** Uses `gemini auth login` for interactive; `GEMINI_API_KEY` / `GOOGLE_API_KEY` / Vertex for headless.

### GitHub

- **Sign-in:** `gh auth login`; default is web-based; `--web` explicitly opens browser.
- **Mechanism:** OAuth device flow (CLI polls while user authorizes in browser); PKCE support (2025).
- **Puppet Master:** Uses `gh auth login --web` for Git and for Copilot when using GitHub identity; `GH_TOKEN` / `GITHUB_TOKEN` for automation.

### GitHub Copilot

- **Sign-in:** `copilot /login` in terminal or GitHub-based OAuth via `gh auth login`.
- **Mechanism:** Same GitHub OAuth as above; Copilot requires appropriate scopes/subscription.
- **Puppet Master:** Login instructions point to `gh auth login --web` or `GH_TOKEN` with Copilot permission.

---

## Conclusion

All coding platforms and GitHub that support interactive sign-in use **OAuth** (or OAuth device flow) for that flow. Cursor uses web/app-based sign-in (OAuth/SSO in practice). Headless and CI use API keys or tokens as documented in AGENTS.md and in `src/gui/routes/login.ts` / `src/platforms/auth-status.ts`.

---

## References

- AGENTS.md (platform CLI commands, auth env vars, login commands)
- `src/gui/routes/login.ts` (PLATFORM_AUTH_CONFIG, login commands)
- `src/platforms/auth-status.ts` (auth detection and verification)
- Web/docs: Cursor docs (auth/dashboard); OpenAI Codex auth; Anthropic Claude Code CLI; Gemini CLI authentication; GitHub CLI `gh auth login`; GitHub Copilot CLI setup
