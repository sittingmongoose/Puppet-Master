# Shard 003: Relationship to existing plans

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L18-L24

Source SHA256: `2644e5acf6b9f0f29a823904c98482ebcc13dbdba30c83855b5110ff9f3e9c38`

---

## Relationship to existing plans


- `Plans/newtools.md` remains canonical for runtime/tool/preflight/evidence behavior, but must reference this plan for DockerHub browser auth, repository management, and Unraid template publishing.
- `Plans/FinalGUISpec.md` remains canonical for settings, controls, dialogs, and layout, but must reference this plan for Docker Manage surface requirements.
- `Plans/Orchestrator_Page.md` remains canonical for orchestrator control widgets and UICommand IDs, but must reference this plan for container-publish and template-repo actions.
- `Plans/feature-list.md` and `Plans/GUI_Rebuild_Requirements_Checklist.md` must register the new first-class GUI/runtime scope introduced here.
