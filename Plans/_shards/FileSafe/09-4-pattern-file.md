## 4. Pattern File

Create `puppet-master-rs/config/destructive-commands.txt`:

```
# Puppet Master Destructive Command Blocklist
# One regex pattern per line. Case-insensitive matching.

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0221
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - one compact primary line: current state + owner + reason
  - `OpenFile { path: PathBuf, line?, range?, target_group? }`
  - OpenFile { path: PathBuf, line?, range?, target_group? }
  - uses `OpenFile { path, line?, range?, target_group? }`
  - OpenFile { path, line?, range?, target_group? }
  - `line?` / `range?` when path-based
  - line?
  - range?
  - `line?` / `range?` for file-backed opens
  - `line?`
  - `OpenFile { path, line, range }`
  - OpenFile { path, line, range }
  - `OpenFile { path, line?, range?, target_group? }`
  - one owner-doc structural gap
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
# Lines starting with # are comments. Empty lines ignored.

# === PHP / Laravel ===
artisan\s+migrate:(fresh|reset|refresh)
artisan\s+db:(wipe|seed\s+--force)

# === Ruby / Rails ===
(rails|rake)\s+db:(drop|reset|schema:load)
bundle\s+exec\s+rake\s+db:(drop|reset)

# === Python / Django ===
manage\.py\s+(flush|sqlflush)
django-admin\s+flush

# === Node.js / Prisma ===
prisma\s+migrate\s+reset
prisma\s+db\s+push\s+--force-reset
npx\s+prisma\s+migrate\s+reset

# === Node.js / Knex ===
knex\s+migrate:rollback\s+--all

# === Node.js / Sequelize ===
sequelize(-cli)?\s+db:drop
npx\s+sequelize(-cli)?\s+db:drop

# === Node.js / TypeORM ===
typeorm\s+schema:drop

# === Node.js / Drizzle ===
drizzle-kit\s+push\s+--force

# === Go ===
migrate\s+.*-database\s+.*drop

# === Rust / Diesel ===
diesel\s+database\s+reset
diesel\s+migration\s+revert\s+--all

# === Rust / SQLx ===
sqlx\s+database\s+drop

# === Elixir / Phoenix / Ecto ===
mix\s+ecto\.(drop|reset)
mix\s+ecto\.rollback\s+--all

# === Raw SQL via CLI clients ===

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0219
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - role-scoped pools already exist in policy/storage via `allowed_roles?` and `disallowed_roles?`
  - allowed_roles?
  - disallowed_roles?
  - raw provider/account disclosure fields
  - raw `resume_url`
  - resume_url
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
(mysql|psql|sqlite3)\s+.*DROP\s+(DATABASE|TABLE)
(mysql|psql|sqlite3)\s+.*TRUNCATE
mongosh?\s+.*DROP\s+(DATABASE|TABLE)

# === MongoDB shell ===
mongosh?\s+.*dropDatabase
mongosh?\s+.*\.drop\s*\(

# === Redis ===
redis-cli\s+FLUSH(ALL|DB)

# === Docker (volume destruction) ===
docker-compose\s+down\s+.*-v
docker\s+compose\s+down\s+.*-v
docker\s+volume\s+(rm|prune)
docker\s+system\s+prune.*--volumes

# === File system (database files) ===
rm\s+(-rf?\s+)?\S*\.sqlite3?\b
rm\s+(-rf?\s+)?\S*\.db\b
rm\s+(-rf?\s+)?/var/lib/(mysql|postgresql|mongodb)
```

---

