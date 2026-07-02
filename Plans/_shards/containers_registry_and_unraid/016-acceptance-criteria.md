# Shard 016: Acceptance criteria

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L950-L964

Source SHA256: `fdbce2e83dc53773be18beff37e23dcc26b1e0ec557067d1ae39b9b20e162d2b`

---

## Acceptance criteria
- The GUI exposes both browser login and PAT entry, with PAT-recommended helper text and clear guidance.
- The GUI shows requested auth mode and effective capability separately.
- DockerHub namespace and repository discovery works from supported auth inputs.
- Missing DockerHub repo creation is guarded by a mandatory non-bypassable confirmation showing namespace, repo name, and privacy.
- New repository creation defaults to private.
- Puppet Master can build and run project containers for testing and provide user-openable access points when available.
- Docker publish results surface digest/tag/registry info without leaking credentials.
- Unraid XML auto-generation/update is enabled by default after successful publish and can be disabled near DockerHub settings.
- Managed Unraid template-repo workflow is enabled by default and can be disabled.
- The default template-repo layout is root `ca_profile.xml` plus maintainer folder plus `project-name.xml`.
- The default maintainer folder source is the DockerHub namespace, but the user can override it.
- `ca_profile.xml` is generated if missing, all fields are editable, shared cross-project scope is default, and per-project override is available.
- Profile images can be either repo-managed uploaded assets or externally hosted URLs; uploaded images default to repo-managed assets.
- Template-repo changes auto-commit by default, do not auto-push by default, and expose a one-click push action in the UI.
