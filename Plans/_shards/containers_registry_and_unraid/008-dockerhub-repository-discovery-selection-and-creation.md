# Shard 008: DockerHub repository discovery, selection, and creation

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L354-L397

Source SHA256: `6b154994648054c552e3b3a762882042df11eb6875b7a86224ae271a0bd0de68`

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
If the selected DockerHub repository does not exist:
- Puppet Master may offer to create it automatically as part of first-push preparation
- the creation step must be explicit and visible
- the confirmation step must show:
  - namespace
  - repository name
  - privacy
- the confirmation step is mandatory and cannot be bypassed by YOLO modes, agent autonomy, or any other fast-path setting

#### Repository creation confirmation flow


Repository creation is a two-step flow:

1. `cmd.docker.create_repository` validates the proposed namespace/repository/privacy tuple and emits `docker.repository.create.confirmation_requested`.
2. The confirmation modal shows namespace, repository name, privacy, and the private-by-default notice.
3. Confirm dispatches `cmd.docker.create_repository.confirm`.
4. Cancel dispatches `cmd.docker.create_repository.cancel`.

This confirmation is distinct from image-push approval. Approving an image push MUST NOT implicitly approve creation of a missing DockerHub repository.

### Default repository privacy


- default privacy for newly created repositories: private
- the confirmation dialog must make this default explicit
- the user may change privacy in the dialog before creation
