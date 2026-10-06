import hashlib, io, json

# Synthetic dataset: 120k data rows (~3.6 MB). Parsed via fixed 64 KiB chunks to emulate a
# bounded/streaming path. Row identity = (file line number, starting byte offset).
buf = io.StringIO()
buf.write("id,name,amount,ts\n")
for i in range(120_000):
    if i == 99_999:   # one malformed record: 5 fields instead of 4
        buf.write(f"{i},bad\"row,not\"csv,oops,2026-01-01T00:00:0X\n")
    else:
        buf.write(f"{i},item-{i:06d},{(i % 97) / 7:.4f},2026-01-01T00:00:00\n")
data = buf.getvalue().encode()
total_bytes = len(data)

CHUNK = 65536
rows_ok = 0
rejects = []
max_resident = 0
carry = b""
line_no = 0
line_start = 0
digest = hashlib.sha256()
pos = 0
while pos < total_bytes:
    chunk = data[pos:pos + CHUNK]
    pos += len(chunk)
    digest.update(chunk)
    max_resident = max(max_resident, len(carry) + len(chunk))
    carry = carry + chunk
    *lines, carry = carry.split(b"\n")
    for ln in lines:
        line_no += 1
        if line_no == 1:
            line_start += len(ln) + 1
            continue                        # header
        if ln.count(b",") != 3:
            rejects.append({"line": line_no, "byte_offset": line_start,
                            "bytes": len(ln), "reason": "expected 4 fields"})
        else:
            rows_ok += 1
        line_start += len(ln) + 1
if carry:
    line_no += 1
    rows_ok += 1

print(json.dumps({
    "bytes_total": total_bytes,
    "chunk_bytes": CHUNK,
    "max_bytes_held_at_once": max_resident,
    "clean_rows": rows_ok,
    "malformed_kept_in_rejects": len(rejects),
    "reject_records": rejects,
    "streamed_sha256_prefix": digest.hexdigest()[:16],
}))
assert len(rejects) == 1 and rejects[0]["line"] == 100_001 and rejects[0]["byte_offset"] > 0
assert rows_ok + len(rejects) == 120_000          # every data line accounted for; none dropped
print("W3 PASS: bounded-chunk streaming kept <=64KiB+carry resident; the malformed record was recorded with its line number and byte offset, never silently deleted")
print("SCOPE: data generated in memory (synthetic); 'bounded' applies to per-chunk processing, not to this generator; naive field split does not implement CSV quoting")
