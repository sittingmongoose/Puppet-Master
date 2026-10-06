import csv, io, sys

# W3: bounded chunked aggregation over a synthetic CSV at miniature scale.
N = 100_000
buf = io.StringIO()
buf.write("i,square\n")
for i in range(N):
    buf.write(f"{i},{i*i}\n")
total_bytes = len(buf.getvalue())

CHUNK = 10_000
reader = csv.reader(io.StringIO(buf.getvalue()))
header = next(reader)
max_rows_held = 0
count = 0; total = 0; sq_total = 0
while True:
    chunk = []
    for row in reader:
        chunk.append(row)
        if len(chunk) == CHUNK:
            break
    if not chunk:
        break
    max_rows_held = max(max_rows_held, len(chunk))
    for i_s, sq_s in chunk:
        v = int(i_s)
        count += 1; total += v; sq_total += int(sq_s)

exp_total = sum(range(N)); exp_sq = sum(i*i for i in range(N))
assert (count, total, sq_total) == (N, exp_total, exp_sq)
assert max_rows_held <= CHUNK
one_chunk_bytes = sys.getsizeof([[str(i), str(i*i)] for i in range(CHUNK)])
print(f"rows={count} sum={total} sq_sum={sq_total}")
print(f"source_bytes={total_bytes} max_rows_held={max_rows_held} (chunk bound {CHUNK})")
print(f"approx per-chunk buffer bytes={one_chunk_bytes} => bounded memory per chunk, not O(file)")
print("W3_OK")
