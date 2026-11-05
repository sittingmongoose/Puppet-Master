# Shard 008: DockerHub repository discovery, selection, and creation

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L354-L384

Source SHA256: `83d52b9829ddf4e27e648894a87b3945fe97a4e8ce9249be5cbb9f5d92c95948`

---

## DockerHub repository discovery, selection, and creation

### Repository selection behavior
Puppet Master must let the user:
- view discovered namespaces
- select the target namespace
- view repositories within the selected namespace
- refresh repository lists on demand
- choose an existing repository for push
- create a missing repository if needed for first publish

DockerHub API behavior must be documented clearly:
- use Docker CLI / Buildx for local build, run, login, and push behavior
- use Docker Hub API for namespace/repository discovery and repository creation when app-managed listing/creation is needed
- do not conflate image registry push with template distribution

### Missing repository behavior

If the selected repository is missing, creation is a separate explicit visible effect naming namespace/repository/privacy and private default. It must be needed by the task or exactly selected in the current PS-147 grant.

#### Repository creation confirmation flow

`cmd.docker.create_repository` validates/preflights at its existing owner. In Regular, an unsatisfied create decision emits docker.repository.create.confirmation_requested and uses existing .confirm/.cancel human controls. In task YOLO or an exact approved build grant, typed current authority invokes the same domain creation writer directly and records actual mode/grant provenance; no fake click or model-call to .confirm resolves a protected human wait. No confirmation_requested is emitted unless waiting for a real person. Capability/auth/current target and private-by-default disclosure still apply.

Image-push and repository-create are separately evaluated effects. Regular Push image does not by itself approve a missing create. YOLO/grant authority may admit each needed effect without another human click, under CRAU-104/PS-146/147/148.
### Default repository privacy


- default privacy for newly created repositories: private
- the preview/result and any actual human confirmation make the private default explicit
- the user may change privacy before creation through the reviewed target; task/grant execution cannot silently substitute destination or visibility
