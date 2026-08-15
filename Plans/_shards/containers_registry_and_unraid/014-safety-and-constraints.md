# Shard 014: Safety and constraints

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L935-L941

Source SHA256: `3ca157a3ab590fb8caab62539b9ff912052fa91b20cfc3309e6e48738f7d698b`

---

## Safety and constraints
- repository creation confirmation is mandatory and non-bypassable
- secrets must not be written to redb, project files, YAML, or evidence
- publish/template-repo flows must redact secrets in logs/evidence
- docs must distinguish DockerHub image distribution from Unraid template distribution
- browser login and PAT must be documented as different inputs that may lead to different effective capability
- the UI must not claim full repository-management support when validation shows only partial capability
