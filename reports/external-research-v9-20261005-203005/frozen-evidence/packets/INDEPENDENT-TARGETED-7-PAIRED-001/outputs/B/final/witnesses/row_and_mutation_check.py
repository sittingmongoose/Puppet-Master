import hashlib
import json

schema = data["schema"]
rows = data["rows"]

def naive_delimited(values):
    return "|".join("" if v is None else str(v) for v in values)

def canonical_row(row):
    encoded_fields = []
    for name, kind in schema:
        if name not in row:
            field = ["missing"]
        elif row[name] is None:
            field = ["null"]
        elif kind == "int":
            if type(row[name]) is not int:
                raise TypeError("expected int for " + name)
            field = ["int", str(row[name])]
        elif kind == "string":
            if type(row[name]) is not str:
                raise TypeError("expected string for " + name)
            field = ["string", row[name]]
        elif kind == "timestamp":
            if type(row[name]) is not str:
                raise TypeError("expected ISO-8601 string for " + name)
            field = ["timestamp", row[name]]
        elif kind == "variant":
            value = row[name]
            if type(value) is bool:
                field = ["bool", "true" if value else "false"]
            elif type(value) is int:
                field = ["int", str(value)]
            elif type(value) is float:
                field = ["float-hex", value.hex()]
            elif type(value) is str:
                field = ["string", value]
            else:
                raise TypeError("unsupported variant for " + name)
        else:
            raise AssertionError("unknown schema type " + kind)
        encoded_fields.append(field)
    payload = {"schema": schema, "fields": encoded_fields}
    return json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")

def dataset_digest(record_rows):
    h = hashlib.sha256()
    header = json.dumps(schema, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    h.update(len(header).to_bytes(8, "big")); h.update(header)
    for row in record_rows:
        raw = canonical_row(row)
        h.update(len(raw).to_bytes(8, "big")); h.update(raw)
    h.update(len(record_rows).to_bytes(8, "big"))
    return h.hexdigest()

# Independently derived expectations: preserve presence/null/type and unambiguous framing.
assert naive_delimited(["a|b", "c"]) == naive_delimited(["a", "b|c"])
assert canonical_row(rows[2]) != canonical_row(rows[3])
assert naive_delimited([rows[0].get("optional")]) == naive_delimited([rows[1].get("optional")])
assert canonical_row(rows[0]) != canonical_row(rows[1])
int_variant = {"label": "x", "optional": "", "count": 1, "at": "2026-10-06T00:00:00Z"}
str_variant = {"label": "x", "optional": "", "count": "1", "at": "2026-10-06T00:00:00Z"}
assert naive_delimited([1]) == naive_delimited(["1"])
assert canonical_row(int_variant) != canonical_row(str_variant)
assert "東京 / café".encode("utf-8").decode("utf-8") == "東京 / café"
assert dataset_digest(rows) != dataset_digest(list(reversed(rows)))
assert len(rows) == 4 and sum(r["count"] for r in rows) == 10

# refs/defs does not create a mutator->consumer edge for an in-place object change.
defs = {"producer": {"table"}, "mutator": set(), "consumer": {"observed"}}
refs = {"producer": set(), "mutator": {"table"}, "consumer": {"table"}}
edges = {(src, dst) for src in defs for dst in refs if defs[src] & refs[dst]}
assert ("producer", "mutator") in edges and ("producer", "consumer") in edges
assert ("mutator", "consumer") not in edges

table = [0]
table.append(1)
saved_consumer_output = len(table)
table.append(2)  # edit/rerun mutator; it mutates the same value and defines no global
mutator_descendants = {dst for src, dst in edges if src == "mutator"}
assert len(table) == 3 and saved_consumer_output == 2
assert "consumer" not in mutator_descendants

print("rows=4; count_sum=10; delimiter_collision=True; missing_vs_null_distinct=True; int_vs_string_distinct=True")
print("canonical_dataset_sha256=" + dataset_digest(rows))
print("reverse_order_changes_digest=True")
print("mutation_graph_edges=" + repr(sorted(edges)))
print("after_mutator_edit: live_len=3 saved_consumer=2 consumer_in_static_descendants=False")