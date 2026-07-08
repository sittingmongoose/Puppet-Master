# Shard 014: Safety and constraints

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L935-L941

Source SHA256: `6b154994648054c552e3b3a762882042df11eb6875b7a86224ae271a0bd0de68`

---

## Safety and constraints
- repository creation confirmation is mandatory and non-bypassable
- secrets must not be written to redb, project files, YAML, or evidence
- publish/template-repo flows must redact secrets in logs/evidence
- docs must distinguish DockerHub image distribution from Unraid template distribution
- browser login and PAT must be documented as different inputs that may lead to different effective capability
- the UI must not claim full repository-management support when validation shows only partial capability
