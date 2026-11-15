# Fifth recorded change to the frozen seal check: four-digit decision numbers (E9-1 A)

Stream E, PNC-019 lane s1v, 2026-11-14. Author: `claude-opus-5.5:ea-pnc-s1v-20261114`, the separate author DL-039 requires. It is not the CA-SEAL or CA-SEAL2 author, their lander or fix workers, or pm-ea-lead.

## Authority

Card **E9-1**, option **A**: "Allow four-digit numbers (DL-1000 and up)". Jared signed it on the AI Account Center Status tab at 20:39:58Z on 2026-11-14 (3:39 PM EST).
- **Card:** `reports/event-authority-20261114/E9-1-card.json`, SHA-256 `b4809cf1361cd13a4adcb09b7ffabce4ad0b56d91d8bcb9c46655daa264cefa6`. It is byte-identical to `/mnt/Cursor/agent-reports/v1/writers/vm.pm-ea-lead/cards/vm.pm-ea-lead--E9-1.json`.
- **Signed answer:** `reports/event-authority-20261114/E9-1-answer.json`, SHA-256 `64e0bb3966b9b4efe353cfc4070922e2a68ca839312a0e2a088258ee0431246f`. The answer's `cardSha256` is the card's hash.
- No Decision Log entry records E9-1. The validator reads these two copies by hash.

**Reading (not Jared's words).** The card's folded technical row reads `DL-\d{3,4}`. The option he chose reads "DL-1000 and up". The pattern below is that row's set less the zero-padded forms DL-0000 to DL-0999. Those forms would let an id such as `DL-0077` stand in for `DL-077`, `DL-078` or `DL-412`, which pass the exclusions because those compare strings.

## What changed

| Validator | SHA-256 |
|---|---|
| before (fourth change, CA-SEAL2) | `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72` |
| after (this change) | `308728929a863eae7c2b8dab0263130e4f7aa8a4ff292a369b29db6e40eb7616` |

1. **The pattern.** `DL_REF = DL-(?:\d{3}|[1-9][0-9]{3})` replaces `DL-\d{3}` at the only two sites that parse a decision reference:
   - `admission_record_problems`, an admission record's `decision_ref`;
   - `recount_outcomes`, a recount exclusion's `decision_ref`.

   The three-digit branch is the old pattern, unchanged. `decision_section_bytes` takes the id it is given, so it needs no change.
2. **The fifth byte link.** `fourth_change_validator_pin` presents `3e98a165…` only when all of these hold; otherwise it presents the live hash:
   - the fifth receipt has one exact-path, canonical Spec Lock anchor matching its complete bytes;
   - its after-hash is the live bytes;
   - its before-hash is `3e98a165…`;
   - the fourth receipt's after-hash is still `3e98a165…`.

   `third_change_validator_pin` compares the fourth receipt with that presented hash. A broken fourth link still exposes the raw live hash, as DL-451 specifies. `recount_change_state` expects the presented hash.
3. **The fifth receipt's own check.** `dl_pattern_change_state` checks that the receipt pins:
   - the signed card and answer, and the bytes they name;
   - the validator path, id, before and after;
   - the fourth receipt's bytes;
   - the pattern;
   - the author and a named lander, both as forbidden seal appliers;
   - false seal, admission and depth flags;
   - the anchor and the byte link.

   `recount_validation` runs it beside the fourth receipt's check. A failure is `dl_pattern_change_receipt_invalid`, which blocks the combined result. The output names the receipt at `named_checks.recount.dl_pattern_change_receipt_sha256`.
4. **Documents.** `INDEPENDENT_EA_VALIDATOR_SPEC.md` gains an E9-1 section.

**No re-stamp.** The DL-077, DL-412 and fourth receipts keep their validator pins: `190a86f2…`, `319f6bff…` and `3e98a165…`.

## What it does not relax

- **Decision rules:** the cited entry must exist once as `### DL-NNNN:`, its section hash must match, and it must name the exact event type. DL-077 and DL-078 cannot be cited, and a step record cannot cite DL-412.
- **Refused forms:** zero-padded four-digit ids, five or more digits, letters, signs, spaces, an empty number and non-ASCII four-digit ids.
- **Everything else:** no other rule, list, fingerprint, freeze digest, ledger, record or pass predicate changes.

## Landing (part of S1)

1. **Fill the chain.** Run `python3 -I reports/event-authority-20261114/land_receipt_chain.py <landing-tree> --lander <actual-lander-task>`.
   - It fills the DL-412, fourth and fifth receipts in that order and refreshes the two prior-receipt pins.
   - It refuses if any validator pin moved or the DL-412 or DL-451 section changed.
   - Do not run `write_multifamily_receipt.py` or `write_recount_receipt.py`: each resets its receipt's after-hash to the live bytes.
2. **P adds three Spec Lock entries** (`canonical_ssot_hashes.files`: `{"path", "sha256"}` of the final bytes), as the writer prints them:
   - `reports/event-authority-20261104/seal-check-multifamily-step-receipt.json`
   - `reports/event-authority-20261105/seal-check-recount-receipt.json`
   - `reports/event-authority-20261114/seal-check-dl-pattern-receipt.json`
3. **Verify the chain.** Run `python3 -I reports/event-authority-20261114/land_receipt_chain.py <landing-tree> --verify`. Then run the frozen check with `PM_EA_RECOUNT_SOURCE_MAP` set.
4. **Re-pin the DL-300 records.** They pin the DL-412 receipt, so step 1 changes their pin. Run `python3 scripts/pm-s2-dl300-step-records.py --repin` wherever those records are on the tree (lane s2).

Until steps 1 to 3 are on the tree, the chain fails closed, and the check also reports `dl_pattern_change_receipt_invalid`.

**Checks:** `reports/event-authority-20261114/seal-check-dl-pattern-checks.py`. Results: `seal-check-dl-pattern-results.json`.

**Seal applier exclusions (procedural):**
- the author and the actual lander;
- `claude-opus-5.5:pm-ea-lead`;
- CA-SEAL and CA-SEAL-FIX1 to FIX8;
- CA-SEAL2 and CA-SEAL2-FIX1 to FIX12;
- every other fix worker on these amendments.

No admission, registry edit, Decision Log entry, seal or re-stamp is performed.
