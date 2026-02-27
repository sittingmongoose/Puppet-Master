## 21. Updating Puppet Master

**Concept:** Users need a clear way to **update the Puppet Master application itself** to a new version. This covers version visibility, update discovery, and the upgrade path -- not updates to plugins or target projects.

**Relevance:** Without an update story, users rely on ad-hoc methods (re-download, `cargo install`, package manager) and may miss security or feature releases. A minimal in-app story (version shown, optional "Check for updates" / release notes link) improves trust and upgrade rates.

**Scope (planning only):**
- **Version visibility:** Show application version in the UI (e.g. About dialog, Settings footer, or Help). Single source of truth required (e.g. from Cargo.toml or build-time env) so it should be consistent everywhere.

- **Update discovery:**

**Update Discovery (Resolved):**
- **Check source:** GitHub Releases API for the Puppet Master repository.
- **URL:** `https://api.github.com/repos/{owner}/{repo}/releases/latest` (owner/repo configurable via `app.update.github_repo`).
- **Frequency:** Once per app launch. Result cached in redb (`app.update.last_check`) for **24 hours**. No background polling.
- **Behavior:** If a newer version is found, show a non-blocking notification: "Puppet Master [version] is available. [View release notes] [Dismiss]." No auto-download, no auto-install.
- **Opt-out:** `app.update.check_enabled`, default `true`. Set to `false` to disable update checks entirely.
- **Upgrade path:** Document or link to how to upgrade per distribution: e.g. re-run installer, `cargo install --force`, or system package manager (`apt`, `brew`, etc.). If we ship a package (deb, rpm, AppImage), document update procedure for that package.
- **Config and state across versions:** When the app version changes, config and state files (e.g. `.puppet-master/config.yaml`, GUI state) may need compatibility handling. Prefer backward compatibility (new version reads old config); if a breaking config change is required, document migration or provide a one-time migration step. Do not delete or overwrite user config on upgrade without explicit user action or a clear migration path.

**Implementation directions:**
- **Version:** Read version at build time (e.g. `env!("CARGO_PKG_VERSION")`) and expose it in one place; About/Settings read from there.
- **Check for updates:** Optional background or on-demand request to a well-known URL (or GitHub Releases API); compare with current version; if newer, show a small banner or Settings message with "What's new" link. Respect user preference (e.g. "Check for updates" off, or only on manual "Check now").
- **Docs:** README or docs section "Updating Puppet Master" that describes upgrade per install method (cargo, package, installer). Link from in-app "New version available" message when shown.
- **DRY:** Single version constant or module required; hardcoded version strings in multiple views never permitted.


**Non-goals for this section:** Auto-update (download and replace binary without user confirmation), in-app package management for plugins (that's §6 / §15.14). This section is only about **the application's own** update story.

---

