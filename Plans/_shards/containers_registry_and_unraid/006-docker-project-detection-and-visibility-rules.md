# Shard 006: Docker project detection and visibility rules

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L246-L261

Source SHA256: `9c4d7fcc59a90b861da7f38a2a2d8ebe9fdb292cab463c2c56d5bfa31006d9f4`

---

## Docker project detection and visibility rules
A project is treated as Docker-related when Puppet Master detects a container-oriented workflow such as:
- a `Dockerfile`
- compose configuration
- container-based preview/build target
- container publish settings already configured for the project
- an existing managed Unraid template repository associated with the project

When detection is positive:
- show the contextual Docker Manager surface
- enable DockerHub repository, preview, publish, and Unraid template actions
- retain the user’s last-used Docker surface state for that project

When detection is negative and `Hide Docker Manager when not used in Project.` is enabled:
- hide the contextual Docker Manager surface from normal project navigation
- retain settings and state, but do not foreground Docker workflows
