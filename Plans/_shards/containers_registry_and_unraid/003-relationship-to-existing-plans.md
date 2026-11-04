# Shard 003: Relationship to existing plans

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L18-L24

Source SHA256: `75d9a47bd5c989f47381a983d2a252c904be9c6e7e432031824a3d198644870c`

---

## Relationship to existing plans


- `Plans/newtools.md` remains canonical for runtime/tool/preflight/evidence behavior, but must reference this plan for DockerHub browser auth, repository management, and Unraid template publishing.
- `Plans/FinalGUISpec.md` remains canonical for settings, controls, dialogs, and layout, but must reference this plan for Docker Manage surface requirements.
- `Plans/Orchestrator_Page.md` remains canonical for orchestrator control widgets and UICommand IDs, but must reference this plan for container-publish and template-repo actions.
- `Plans/feature-list.md` and `Plans/GUI_Rebuild_Requirements_Checklist.md` must register the new first-class GUI/runtime scope introduced here.
