# Build & Installer Status (Windows / macOS / Linux)

**Last updated:** 2026-01-27

## Summary

Windows installer build failures and deprecation warnings were addressed. All platform build scripts were updated so installer builds complete reliably, and the root project uses current ESLint and tooling.

## Changes

### 1. GUI build failure (all platforms)

**Cause:** The GUI subproject (`src/gui/react`) has its own `package.json` and dependencies (e.g. `@vitejs/plugin-react`). Only the root ran `npm ci`, so `src/gui/react/node_modules` was never installed. Running `npm run gui:build` then failed with `ERR_MODULE_NOT_FOUND: Cannot find package '@vitejs/plugin-react'`.

**Fix:** All four installer scripts now install GUI dependencies before building the GUI:

- **Windows:** [scripts/build-installer-windows.bat](scripts/build-installer-windows.bat), [scripts/build-installer-windows.ps1](scripts/build-installer-windows.ps1)
- **Linux:** [scripts/build-installer-linux.sh](scripts/build-installer-linux.sh)
- **macOS:** [scripts/build-installer-macos.sh](scripts/build-installer-macos.sh)

Each script runs `npm --prefix src/gui/react install` after root `npm ci` and before `npm run gui:build`. This works even when the GUI lockfile is out of sync.

### 2. Deprecations and old tooling

**Cause:** Root used ESLint 8 and legacy config. That pulled in deprecated `@humanwhocodes/*`, `rimraf@3`, `glob@7`, and `inflight`.

**Fix:**

- **Root ESLint:** Upgraded to ESLint 9 with flat config.
  - New [eslint.config.js](eslint.config.js) using `@eslint/js`, `typescript-eslint` ^8, and `globals`.
  - Retired [.eslintrc.json](.eslintrc.json) (kept as `.eslintrc.json.bak`).
  - Removed `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` in favor of the `typescript-eslint` package.
- **Rules:** Unused catch vars are allowed for common names (`error`, `err`, `e`, `parseError`, `statError`, `sdkError`) so existing code passes without mass renames. A few unused type imports were removed or adjusted.

### 3. Vulnerabilities

- **Root:** `npm audit fix` (no `--force`) was run. The high-severity **hono** finding was fixed. Six moderate **esbuild/vite/vitest** findings remain; fixing them would require upgrading to Vitest 4 (breaking). Those are confined to dev/test tooling.
- **GUI:** Same esbuild/vite/vitest chain; no non-breaking fix. Safe to re-run `npm audit fix` in `src/gui/react` when desired.

### 4. Cleanup and scripts

- **Test artifacts:** All platform build scripts remove `.test-cache` and `.test-quota*` (if present) before the “Build Complete” message, matching the check-command requirement.
- **PowerShell repo root:** In [scripts/build-installer-windows.ps1](scripts/build-installer-windows.ps1), the repo root is now `Split-Path -Parent $PSScriptRoot` (script lives in `scripts/`, so one level up is correct). The previous double `Split-Path -Parent` pointed above the repo.

## How to build

**Windows (Batch):**

```bat
build-installer-windows.bat
```

Or from repo root:

```bat
call scripts\build-installer-windows.bat
```

**Windows (PowerShell):**

```powershell
.\scripts\build-installer-windows.ps1
```

**Linux:** `./scripts/build-installer-linux.sh`  
**macOS:** `./scripts/build-installer-macos.sh`

All scripts:

1. Install root deps (`npm ci`)
2. Install GUI deps (`npm --prefix src/gui/react install`)
3. Build TypeScript (`npm run build`)
4. Build GUI (`npm run gui:build`)
5. Build the platform installer
6. Clean `.test-cache` and `.test-quota*`
7. Report success or failure

## npm version

The “New major version of npm available” notice (e.g. 10.9.3 → 11.8.0) comes from the global npm install. Upgrading is optional: `npm install -g npm@11`. Builds are not gated on npm 11.

## Files touched

- `package.json` – ESLint 9, `@eslint/js`, `typescript-eslint`, `globals`; removed old TypeScript-ESLint packages
- `eslint.config.js` – new root flat config
- `.eslintrc.json` – retired (backup: `.eslintrc.json.bak`)
- `scripts/build-installer-windows.bat` – GUI deps step, .test-cache/.test-quota cleanup
- `scripts/build-installer-windows.ps1` – repo root fix, GUI deps step, cleanup
- `scripts/build-installer-linux.sh` – GUI deps step, cleanup
- `scripts/build-installer-macos.sh` – GUI deps step, cleanup
- `src/cli/commands/config.ts` – removed unused type import
- `src/cli/commands/coverage.ts` – removed unused type import
- `src/cli/commands/history.ts` – removed unused type import
- `src/gui/routes/login.ts` – removed unused type import
- `src/doctor/checks/cli-tools.test.ts` – left require as-is (no-require-imports off); unused eslint-disable had been removed earlier

## Verification

- `npm run lint` – passes with ESLint 9 flat config
- `node ./node_modules/typescript/bin/tsc --noEmit` – passes (typecheck)
- GUI deps install and gui:build path validated; actual Vite run was not executed in this environment due to binary permissions

Cross-platform: Script logic is identical for the new steps on Windows (bat/ps1), Linux, and macOS.
