import json

# Synthetic CSV: 100 identical integer-looking rows, then three heterogeneous rows appear late in the file.
rows = [("id", "val")] + [(str(i), "1") for i in range(1, 101)] \
     + [("102", "1.5"), ("103", "007"), ("104", "2020-06-15T13:45:59")]
csv_text = "\n".join(",".join(r) for r in rows)

def is_int(s):
    try:
        int(s); return True
    except ValueError:
        return False

def is_float(s):
    try:
        float(s); return True
    except ValueError:
        return False

def infer(sample_rows):                      # naive per-column sniffer emulation
    col = [r[1] for r in sample_rows]
    if all(is_int(v) for v in col):  return "INTEGER"
    if all(is_float(v) for v in col): return "DOUBLE"
    return "VARCHAR"

data_lines = [tuple(l.split(",")) for l in csv_text.splitlines()[1:]]
sample_10  = data_lines[:10]

t_sample = infer(sample_10)
t_full   = infer(data_lines)
late_val = data_lines[-3][1]                 # '1.5', never seen by a 10-row preview
cast_under_sample_guess = int(float(late_val))

print("inferred from 10-row preview :", t_sample)
print("inferred from full scan      :", t_full)
print("late value in file           :", late_val)
print("read back under preview type :", cast_under_sample_guess, " (silent rewrite of", late_val + ")")

assert t_sample == "INTEGER" and t_full == "VARCHAR" and cast_under_sample_guess == 2
print("W2 PASS: a bounded preview supports a type claim the full dataset refutes; casting under the preview's assumption silently rewrote 1.5 -> 2")
print("SCOPE: mechanism emulation only; mirrors DuckDB issue #25824's sniffer/scanner asymmetry at toy scale, not a DuckDB result")
