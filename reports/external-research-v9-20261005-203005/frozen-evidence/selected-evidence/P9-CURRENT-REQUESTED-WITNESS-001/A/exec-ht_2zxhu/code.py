import csv, io, json, hashlib

# W1: data-contract import witness (strict types, quarantine instead of deletion, stable row identity, source not mutated)
data = (
    "id,ts,val\n"
    "1,2026-01-02T03:04:05Z,10\n"
    "2,,20\n"
    "3,2026-01-02T05:06:07Z,notanumber\n"
    "4,2026-01-02T07:08:09Z,40\n"
    "broken row without commas\n"
    "5,2026-01-02T09:10:11Z,50\n"
)
src_before = hashlib.sha256(data.encode()).hexdigest()

header, rows, bad = None, [], []
for i, rec in enumerate(csv.reader(io.StringIO(data))):
    if i == 0:
        header = rec
        continue
    reason = None
    if len(rec) != len(header):
        reason = "column count %d != %d" % (len(rec), len(header))
    else:
        conv = {}
        for k, v in zip(header, rec):
            try:
                if k == "id":
                    if v == "":
                        raise ValueError("id is required, empty value")
                    conv[k] = int(v)
                elif k == "ts":
                    if v == "":
                        raise ValueError("ts is required, empty value")
                    conv[k] = v.strip()
                elif k == "val":
                    conv[k] = None if v == "" else int(v)
            except ValueError as e:
                reason = "%s=%r: %s" % (k, v, e)
                break
    if reason is not None:
        bad.append({"line": i + 1, "raw_line": ",".join(rec), "reason": reason})
        continue
    conv["row_id"] = hashlib.sha256(("|".join(rec)).encode()).hexdigest()[:16]
    conv["line"] = i + 1
    rows.append(conv)

manifest = {
    "source_sha256": src_before,
    "row_identity": "1-based file line number + content hash of raw fields",
    "contract": {"id": "int, required (empty -> error)", "ts": "ISO-8601 string, required (empty -> error)", "val": "int or null (empty -> null)"},
    "rows_parsed": len(rows),
    "rows_quarantined": len(bad),
    "quarantine": bad,
    "preview_note": "this witness parses the whole tiny input; for real imports a bounded preview is NOT evidence about unparsed rows",
}
assert hashlib.sha256(data.encode()).hexdigest() == src_before, "source mutated"
assert manifest["rows_parsed"] == 4, manifest["rows_parsed"]
assert manifest["rows_quarantined"] == 2, manifest["rows_quarantined"]
assert manifest["quarantine"][0]["line"] == 4 and "notanumber" in manifest["quarantine"][0]["reason"]
assert manifest["quarantine"][1]["line"] == 6
assert rows[1]["val"] == 20 and rows[0]["val"] == 10 and rows[1]["ts"] == ""
assert rows[1]["ts"] == "" and manifest["contract"]["ts"].startswith("ISO-8601"), "empty ts must have failed"
print(json.dumps(manifest, indent=1))
print("W1 OK: strict contract parse; 2 malformed rows quarantined with reasons (not silently deleted); source hash unchanged; row identity = line + content hash")
