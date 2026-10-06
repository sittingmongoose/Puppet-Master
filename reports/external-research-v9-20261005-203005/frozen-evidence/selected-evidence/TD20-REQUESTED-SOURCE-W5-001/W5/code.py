import hashlib
import json


def canonical_bytes(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def digest_bytes(value):
    return hashlib.sha256(value).hexdigest()


def digest_obj(value):
    return digest_bytes(canonical_bytes(value))


def make_key(kind, source_text, inputs, environment):
    return digest_obj({
        "kind": kind,
        "source_sha256": digest_bytes(source_text.encode("utf-8")),
        "input_digests": inputs,
        "environment": environment,
    })


# Candidate-authored tiny Python transform; only this Python function runs.
records = data["records"]
python_result = [{"category": row.get("category"), "label": row.get("label", "<missing>")} for row in records]
expected_python_result = [
    {"category": "café", "label": "alpha"},
    {"category": None, "label": "<missing>"},
]
assert python_result == expected_python_result

python_source = data["python_source"]
sql_source = data["sql_source"]
environment = data["environment"]
dataset_digest = digest_obj(records)
python_key = make_key("python_notebook", python_source, [dataset_digest], environment)
intermediate_digest = digest_obj(python_result)
sql_key = make_key("sql_transform", sql_source, [intermediate_digest], environment)

sql_changed_key = make_key("sql_transform", sql_source + "\n-- comment changed", [intermediate_digest], environment)
changed_data_digest = digest_obj(records + [{"category": "β"}])
changed_python_key = make_key("python_notebook", python_source, [changed_data_digest], environment)
changed_intermediate_digest = digest_obj(python_result + [{"category": "β", "label": "<missing>"}])
changed_downstream_sql_key = make_key("sql_transform", sql_source, [changed_intermediate_digest], environment)
changed_environment = dict(environment, duckdb_build="1.5.x+different-build")
environment_python_key = make_key("python_notebook", python_source, [dataset_digest], changed_environment)
environment_sql_key = make_key("sql_transform", sql_source, [intermediate_digest], changed_environment)

assert sql_changed_key != sql_key and python_key == make_key("python_notebook", python_source, [dataset_digest], environment)
assert changed_python_key != python_key and changed_downstream_sql_key != sql_key
assert environment_python_key != python_key and environment_sql_key != sql_key
print(json.dumps({
    "check": "shared provenance-key and invalidation model",
    "python_result": python_result,
    "python_node_key": python_key,
    "sql_node_key": sql_key,
    "sql_edit_invalidates_sql_node": sql_changed_key != sql_key,
    "dataset_edit_invalidates_python_and_downstream_sql": changed_python_key != python_key and changed_downstream_sql_key != sql_key,
    "engine_environment_edit_invalidates_both": environment_python_key != python_key and environment_sql_key != sql_key,
    "sql_execution": "not performed; SQL text only hashed as a first-class node input"
}, ensure_ascii=False, sort_keys=True))