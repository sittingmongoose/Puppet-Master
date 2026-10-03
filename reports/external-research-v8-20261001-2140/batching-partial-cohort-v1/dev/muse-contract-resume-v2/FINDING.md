# Muse managed MCP contract: source-only HOLD

The assigned-only capture route remains **HOLD** for the pinned Muse Code
1.4.2-R4684.1 executable. No supported managed-rule identity or enforcement
contract for dynamic session MCP tools was established. This additive finding
preserves `dev/muse-route-v1` unchanged; it does not claim Muse is unconfineable.

The native public executable remains
`USER_HOME/.local/bin/muse-bin-1.4.2-R4684.1`, SHA-256
`dfb3096c91f4767c4d98006460800b7ba906a0b1a408280a926a8dc19a1af64f`.
Source paths, URL body hashes, small permitted exact excerpts, validator commands,
exit codes and file-syscall receipts are retained in the files named below.

## Source and version applicability

The current [configuration manual](https://dev.meta.ai/docs/muse-code/configuration)
and pinned `config --help` both define offline `config validate --plane
<defaults|policy> --file <path>` and `config status`. They supply no accepted
managed MCP identity grammar. The current
[changelog](https://dev.meta.ai/docs/muse-code/changelog) confirms enterprise
validation exists, but neither `tool_rules` nor `tool_rule_fallback` occurs in the
current inspected rendered page. The old finding's attribution of their
per-model-call semantics to that page cannot be reproduced from today's content.
This is a current-source limitation, not a claim about what its earlier page said.

The [current developer site](https://meta-models.github.io/muse-code-sdk/next/)
is stamped upstream commit `683bbecb4f3e38dc5a1584408fe79dca77ba9af6` and schema
fingerprint `sha256:9f26334d69f06c3ad05d54a44710a41442bf13a336f14b67f9123919ea321e4f`.
The site root redirects there. That fingerprint differs from the pinned host.
The [MCP guide](https://meta-models.github.io/muse-code-sdk/next/guides/extend/mcp-servers/)
identifies its examples as 1.3.0. It describes registered model names in
`mcp__<server>__<tool>` form, approval matching, and inert enabled/disabled tool
filters in that example version. It does not define `execution.tool_rules`
identities. Its [approval guide](https://meta-models.github.io/muse-code-sdk/next/guides/msp-concepts/approvals/)
describes choosing preconfigured wire modes rather than authoring a policy.
Neither page proves enterprise managed-rule dispatch for this pinned executable.

The official [SDK source mirror](https://github.com/meta-models/muse-code-sdk)
was read without Git or authentication. Its tree snapshot is commit
`bb44be3d36de46d2411bd9eaa4aee99006092546`. The public publish anchor says
host version 1.4.2, upstream `fda770fcbb7d5c47b11c3d19e54929abc5372473`, published
2026-09-30T20:07:25Z. Its stable manifest fingerprint
`sha256:61afea3112e0906e9dc3a536144278a74cb4b36fc6e20901a91d4432ba3568e2`
exactly matches the pinned manifest, and its stable schema is byte-identical to
the pinned schema: SHA-256
`453e6761f8dece17730145cb315d2ffe068afab36bccd3aa2706deb429c00632`.
This resolves SDK wire-schema lineage, not managed tool enforcement. The mirror's
README says the native Rust host is absent from this closure. The matching schema
recognizes only `SessionConfig.mcpServers`, ignores unknown wire config keys, and
contains no `tool_rules` surface. The pinned SDK approval facade selects choices
from server-offered choices; it does not implement host tool-rule dispatch.

## Exact offline discriminator

The unchanged source-capture binding lists `read_file`, `write_file`, `mechanical`,
and `public_https_get`. Using the previously frozen `pm_boundary` server identity
and public registered naming rule produces the four keys below. This is a grammar
probe derived from the assigned binding, not an observation of live tool inventory.

| Policy input | Exit | Result |
| --- | ---: | --- |
| `update_goal` allow, fallback deny | 0 | Active, non-user-overridable managed members |
| `mcp__pm_boundary__read_file` allow, fallback deny | 1 | `semantic_invalid location=execution.tool_rules` |
| `mcp__pm_boundary__write_file` allow, fallback deny | 1 | Same rejection |
| `mcp__pm_boundary__mechanical` allow, fallback deny | 1 | Same rejection |
| `mcp__pm_boundary__public_https_get` allow, fallback deny | 1 | Same rejection |
| All four capture keys together, fallback deny | 1 | Same rejection |
| Native `read_file` plus six source-defined `subagent_*` deny keys, fallback deny | 0 | Managed grammar accepted |
| Process-private read-only `/etc/muse` policy bind, `config status` | 0 | System policy source valid |

The builtin deny keys were taken from the frozen public executable vocabulary:
`read_file`, `subagent_spawn`, `subagent_status`, `subagent_send_message`,
`subagent_wait`, `subagent_read_result`, `subagent_cancel`. Their acceptance proves
only those identities and decisions parse; no builtin read, subagent action or
runtime denial was exercised. The vocabulary fragment is not an exhaustive
current/future tool inventory.

All eight checks reused the already accepted v1 bubblewrap user/PID/private mount
recipe with a newly generated synthetic HOME and read-only policy bind. The real
system policy, shared profiles, executable and AppArmor configuration were not
modified. Native post-exec file-syscall paths were audited: only public system
memory settings, synthetic policy inputs and private configuration traversal
occurred. No existing authentication file was read, projected, hashed or recorded.
No sandbox bypass flags, upgrades or alternative policy aliases were used.

## Precise unresolved contract and next input

A useful next input is a public, version-applicable contract from Muse's owner
for 1.4.2-R4684.1 (or an explicitly authorized replacement version) that answers:

1. Which exact managed `execution.tool_rules` key binds each registered session
   MCP tool, and how can the offline validator accept that key before session
   tool registration? If unsupported, state that limitation directly.
2. Do dynamic MCP calls traverse the managed rule lookup and fallback before
   execution, and what order applies relative to ordinary approval rules,
   read-only hints, automatic native file reads, wrappers and subagent dispatch?
3. What policy handles unknown or later-registered tools, name collisions,
   session MCP registration, plugin tools and tools outside the builtin ID set?

Until that contract exists, the supported default-deny capture allowlist cannot
be assembled from validated identities. Fallback allow would require a complete
source-proven deny inventory and future-tool semantics; those are absent and no
such policy was created. Wire approval modes, server tool annotations, inert
filters, shell/write flags and public string fragments do not fill this gap.

After a valid exact contract, the next authorized source-only step is to validate
only its exact assigned identities under the same private mount. Runtime positive
inventory, synthetic private-read/subagent denial checks, independent route review
and any root-authorized canary remain later distinct gates. This task releases
no native adapter, launch recipe or candidate start.

`offline-probe-result.json` and `filetrace-audit.json` contain the eight checks and
auth-free access receipts. `public-source-inspection.json` and
`sdk-source-receipts.json` contain public URLs, SHA-256 pins and bounded source
excerpts; `SNAPSHOT.json` and `FREEZE.json` bind this additive result.

Birth `1790987167.0349553`; hard deadline `1790988067.0349553`, including preparation
and reporting. The helper completed before that deadline. Candidate/native Goals,
serve/session starts and provider requests: zero. Existing campaign clocks,
budgets, prior costs, GLM queue and old Muse finding remain unchanged. Actual model
token use is unknown.
