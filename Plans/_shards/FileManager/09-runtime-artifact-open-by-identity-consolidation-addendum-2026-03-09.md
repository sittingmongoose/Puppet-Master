## Runtime Artifact Open-by-Identity Consolidation Addendum (2026-03-09)

Artifacts are now opened, stored, and indexed by identity (content hash, metadata) rather than by filesystem path. This consolidation allows artifacts to follow concerns and approvals without being scattered across worktrees.

**Artifact storage structure:**
```typescript
Artifact {
  artifact_id: string,                 // Content hash or UUID
  concern_id?: string,                 // If produced by a concern/escalation
  blocked_episode_id?: string,         // Which episode produced this artifact
  artifact_type: string,               // 'log' | 'diff' | 'output' | 'input' | 'trace'
  content_hash: string,                // SHA256 or similar
  route_target: string,                // Where it should be saved/shared
  visibility: enum,                    // 'public' | 'team' | 'private' | 'escalation_only'
  created_at_utc: string,
  expires_at_utc?: string,             // Retention policy
  lineage_path: string[],              // Which execution units contributed to this artifact
}
```

ContractRef: Primitive:RouteTarget, Primitive:OpenSubject, ContractName:Plans/Contracts_V0.md
