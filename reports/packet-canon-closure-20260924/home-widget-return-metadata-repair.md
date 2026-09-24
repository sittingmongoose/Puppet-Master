# Home/widget ordinary-return metadata repair

Base: `c637ee5000`. Only `return_route` in TCP-PANEL and TCP-WIDGET changes.
Both now reflect the ordinary Home/owning panel host or Usage/Dashboard host
focus return already required by production wiring. Existing Guided Tour target
and captured pre-tour restoration remain. No owner behavior, command, handler,
event, persistence contract, availability or runtime certification changes.

The previous summaries mentioned only Tour return despite ordinary consumers in
their own triggers. This was a metadata inconsistency, not missing product
behavior. TCP-WIDGET-MOTION and TCP-HOME-LAYOUT already describe ordinary return
and remain unchanged. The historical Home/Widget reviews' 114 dimensions are not
114 defects; typed widget exchange/storage materialization and exhaustive reverse
coverage remain unverified, not declared absent globally.

The independent read-only currentness overlay compares these exact profiles and
rows with main `9f0da5c2b19e673f0ac9ff0c904489d04ef14555`. It also identifies
the newer DL-076 nine-field durable Home checkpoint, excluding persisted
`redb_snapshot_id`. That newer contract must be retained at reconciliation; this
metadata patch touches no checkpoint schema and does not copy an older one back.

Verification:

- Three metadata tests: two expected failures before, all three pass after.
- Full decoded registry comparison is identical after excluding just those two
  return strings. Every other field and row is unchanged.
- Full Touch verifier reports exactly the same single existing Settings fixture
  hash-drift failure before and after. The full report bytes are identical; no
  binding was refreshed and no additional failure was suppressed.
- Whitespace check passes. These checks are not native focus/restoration proof,
  a repository-wide landing delta, or authorization to bypass landing gates.

Evidence root:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/packet-wide-rebaseline/`.

| Evidence | SHA-256 |
| --- | --- |
| `home-widget-currentness-20260924.md` | `e6adfce56a87acd88083cee580f806458dd26625e6ccb977199c019b77ac1cc2` |
| `home-return-before.json` | `ab9ce85ae9a07673862bc1184cd074c5b519f4caa3a96aebf30aacaae7d05b46` |
| `home-return-after.json` | `ab9ce85ae9a07673862bc1184cd074c5b519f4caa3a96aebf30aacaae7d05b46` |

The PM planning-ledger workflow kept existing canonical behavior separate from
the summary repair and implementation evidence. No governance reseal or main
landing occurred. The newer-authority freezes remain effective.
