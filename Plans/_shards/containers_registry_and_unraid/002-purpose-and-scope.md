# Shard 002: Purpose and scope

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L4-L16

Source SHA256: `3ca157a3ab590fb8caab62539b9ff912052fa91b20cfc3309e6e48738f7d698b`

---

## Purpose and scope
This document makes Docker support first-class in the Puppet Master rewrite. The scope is broader than the current runtime/build defaults: Puppet Master must be able to build container images, run them for preview/testing, let the user open the running container when the project supports user-facing access, publish images to DockerHub, generate and maintain Unraid template XML, and manage the related Unraid template repository workflow.

This plan is the canonical SSOT for:
- DockerHub authentication UX and state modeling.
- Requested vs effective Docker auth capability.
- DockerHub namespace and repository discovery/selection/creation behavior.
- Protected repository-creation rules.
- First-class Docker management GUI behavior.
- Unraid template generation defaults and managed template-repository workflow.
- `ca_profile.xml` defaults, scope, editability, and image handling.

This plan does not replace the existing preview/build/runtime sections in `Plans/newtools.md`, the settings UI in `Plans/FinalGUISpec.md`, or the orchestrator control surface in `Plans/Orchestrator_Page.md`; it supplies the canonical detailed contract those docs must reference.
