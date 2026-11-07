# Shard 014: Safety and constraints

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L916-L922

Source SHA256: `3654bd33b07a198e050bf21f93becb3c441a49049158d83df585c3a5924c8a7a`

---

## Safety and constraints
- repository creation uses Regular protected confirmation or typed PS-146/147 mode/build authority; protected auth/secrets/trust/target gates still apply
- secrets must not be written to redb, project files, YAML, or evidence
- publish/template-repo flows must redact secrets in logs/evidence
- docs must distinguish DockerHub image distribution from Unraid template distribution
- browser login and PAT must be documented as different inputs that may lead to different effective capability
- the UI must not claim full repository-management support when validation shows only partial capability
