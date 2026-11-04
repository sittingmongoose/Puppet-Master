# Shard 003: Relationship to existing plans

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L18-L24

Source SHA256: `328030c2670761871b6898ab1d66211f4d376308d4ea5b132a87582d68a70dc0`

---

## Relationship to existing plans


- `Plans/newtools.md` remains canonical for runtime/tool/preflight/evidence behavior, but must reference this plan for DockerHub browser auth, repository management, and Unraid template publishing.
- `Plans/FinalGUISpec.md` remains canonical for settings, controls, dialogs, and layout, but must reference this plan for Docker Manage surface requirements.
- `Plans/Orchestrator_Page.md` remains canonical for orchestrator control widgets and UICommand IDs, but must reference this plan for container-publish and template-repo actions.
- `Plans/feature-list.md` and `Plans/GUI_Rebuild_Requirements_Checklist.md` must register the new first-class GUI/runtime scope introduced here.
