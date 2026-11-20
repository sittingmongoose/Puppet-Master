"""DC criterion-12 retained-read store observations (PNC-019 C12-DC1; DC2 reuses it with its own families).

Every historical and checkpoint read of a family runs through the complete checker route (evaluate_probe ->
historical_rejection / checkpoint_rejection -> dispatch_original -> the shared RetainedDispatcher) while the sealed
custody store is snapshotted before and after: every sealed reference with the SHA-256 of its binding, recipe,
record, result and receipt bytes, plus the installed recipe map. A read may select its recipe only from the sealed
custody of that exact original; it must leave the store byte-identical, and it must never seal (create a receipt).

Three receipt negatives are composed beside the checker's own composition (the same DCOriginalOwner class, the same
installed recipe map, the same frozen verifier), and read through the same complete historical route:
- missing receipt: a writer-built original that was never sealed reads as original_unavailable;
- ambiguous receipt: two sealed originals share one event_id with different bytes; a third variant of that
  event_id selects neither (original_unavailable), and each sealed variant selects only itself;
- receipt for another original: custody whose receipt names a different event refuses original_verification.
Each preserves the store and returns the checker's historical refusal; none creates a receipt.
"""
import copy
import hashlib
import pickle
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_collaboration_events as dc  # noqa: E402
import pm_dc_c12_clauses as clauses  # noqa: E402
from pm_event_numbers import OriginalCustody, RetainedDispatcher, storage_value_bytes, EVENT_VALUE  # noqa: E402


def _h(b):
    return hashlib.sha256(b).hexdigest()


def store_snapshot(dispatcher):
    """Digest map of the sealed store and the recipe map; nothing is composed or sealed to take it."""
    owner = dispatcher._owner
    sealed = {ref: _h(pickle.dumps((c.binding, c.recipe, c.record_bytes, c.result_bytes, c.receipt_bytes), protocol=5))
              for ref, c in sorted(owner._sealed.items())}
    recipes = sorted(_h(pickle.dumps(k, protocol=5)) for k in dispatcher._recipes)
    return dict(sealed_count=len(sealed), sealed_sha256=_h(pickle.dumps(sealed, protocol=5)), recipes_sha256=_h(pickle.dumps(recipes, protocol=5)),
                refs=sealed)


class Observed:
    """Counts owner lookups and seals during one read (instance attributes; the class is untouched)."""

    def __init__(self, owner):
        self.owner, self.lookups, self.seals = owner, [], 0
        self._lookup, self._seal = owner.authenticated_original, owner.seal

    def __enter__(self):
        def lookup(ref):
            self.lookups.append(ref)
            return self._lookup(ref)

        def seal(*a, **k):
            self.seals += 1
            return self._seal(*a, **k)
        self.owner.authenticated_original, self.owner.seal = lookup, seal
        return self

    def __exit__(self, *exc):
        del self.owner.authenticated_original
        del self.owner.seal
        return False


def observe(probe, dispatcher):
    before = store_snapshot(dispatcher)
    with Observed(dispatcher._owner) as seen:
        result, first, exc = clauses.route(probe)
    after = store_snapshot(dispatcher)
    return dict(case_id=probe["case_id"], expected=probe["expected"], result=result, first=list(first) if first else None, exception=exc,
                matches=exc is None and result == probe["expected"], lookups=len(seen.lookups), seals=seen.seals,
                store_unchanged=before["refs"] == after["refs"] and before["recipes_sha256"] == after["recipes_sha256"],
                store_before=before["sealed_sha256"], store_after=after["sealed_sha256"], sealed_count=before["sealed_count"])


def family_reads(families):
    out = []
    for p in clauses.all_probes():
        if p["domain"] not in ("historical", "checkpoint"):
            continue
        fam = clauses.family(p) if p["domain"] == "historical" else "shared"
        if p["domain"] == "historical" and fam not in families:
            continue
        out.append((fam, p))
    return out


def receipt_negatives(families):
    """(family, probe, dispatcher) triples for the missing, ambiguous and other-original receipt cases."""
    fx = dc.load(dc.FIXTURE_PATH, dc.ROOT)
    siid, epoch = fx["storage_context"]["storage_instance_id"], fx["storage_context"]["recovery_epoch"]
    base = dc.original_dispatcher(dc.ROOT)
    out = []
    for c in fx["valid_events"]:
        et = c["event_type"]
        if et not in families:
            continue
        rec = c["record"]

        def history(name, record, expected):
            ctx = dict(storage_instance_id=siid, write_epoch=epoch, withdrawn=False, retained=True, original_record=copy.deepcopy(record))
            return dict(domain="historical", case_id="c12:" + c["case_id"] + ":" + name, value=copy.deepcopy(record), expected=expected,
                        event_type=et, context=ctx)
        # A writer-built variant of the original (sequence assigned differently) that no composition sealed.
        missing = copy.deepcopy(rec); missing["sequence_id"] = rec["sequence_id"] + 7
        owner = dc.DCOriginalOwner()
        owner.seal(rec, siid, epoch, dc.ROOT)
        disp = RetainedDispatcher(owner, base._recipes)
        out.append((et, history("receipt_missing", missing, "historical_original_recipe"), disp, "original_unavailable"))
        # Ambiguous: two sealed originals with one event_id and different bytes.
        variant = copy.deepcopy(rec); variant["sequence_id"] = rec["sequence_id"] + 1
        third = copy.deepcopy(rec); third["sequence_id"] = rec["sequence_id"] + 2
        owner = dc.DCOriginalOwner()
        owner.seal(rec, siid, epoch, dc.ROOT)
        owner.seal(variant, siid, epoch, dc.ROOT)
        disp = RetainedDispatcher(owner, base._recipes)
        out.append((et, history("receipt_ambiguous_third", third, "historical_original_recipe"), disp, "original_unavailable"))
        out.append((et, history("receipt_ambiguous_first", rec, None), disp, None))
        out.append((et, history("receipt_ambiguous_second", variant, None), disp, None))
        # Receipt for another original: the custody's receipt names another event.
        owner = dc.DCOriginalOwner()
        owner.seal(rec, siid, epoch, dc.ROOT)
        ref = next(iter(owner._sealed))
        cust = owner._sealed[ref]
        other = dc.canonical({"event_id": "evt_collaboration_" + "0" * 64, "sequence_id": rec["sequence_id"], "write_epoch": epoch}).encode("utf-8")
        owner._sealed[ref] = OriginalCustody(cust.binding, cust.recipe, cust.record_bytes, cust.result_bytes, other)
        disp = RetainedDispatcher(owner, base._recipes)
        out.append((et, history("receipt_other_original", rec, "historical_original_recipe"), disp, "original_verification"))
    return out


def run(families):
    base = dc.original_dispatcher(dc.ROOT)
    reads = [dict(observe(p, base), family=fam, domain=p["domain"]) for fam, p in family_reads(families)]
    negatives = []
    saved = dc.original_dispatcher
    for fam, probe, disp, reason in receipt_negatives(families):
        dc.original_dispatcher = lambda root=dc.ROOT, disp=disp: disp
        try:
            obs = observe(probe, disp)
            dispatch = dc.dispatch_original(probe["value"], probe["context"]["storage_instance_id"], dc.ROOT)[0]
        finally:
            dc.original_dispatcher = saved
        negatives.append(dict(obs, family=fam, dispatch_reason=dispatch, expected_reason=reason, reason_matches=dispatch == reason))
    ok = all(r["matches"] and r["store_unchanged"] and r["seals"] == 0 for r in reads + negatives) and all(n["reason_matches"] for n in negatives)
    return dict(status="pass" if ok else "fail", reads=reads, receipt_negatives=negatives)
