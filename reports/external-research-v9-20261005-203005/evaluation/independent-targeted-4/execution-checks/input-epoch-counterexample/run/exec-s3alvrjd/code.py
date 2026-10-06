import hashlib, json, pathlib, tempfile
# A deterministic schedule represents an external writer, not notebook privileges.
# The consumer only reads; no shared mount or product implementation is asserted.
with tempfile.TemporaryDirectory() as tmp:
    source = pathlib.Path(tmp) / "source.txt"
    recorded = b"value=1\n"
    concurrent = b"value=2\n"
    source.write_bytes(recorded)
    before = hashlib.sha256(source.read_bytes()).hexdigest()
    # External writer changes a referenced source after manager fingerprinting.
    source.write_bytes(concurrent)
    consumer_read = source.read_bytes()
    # External writer restores exact bytes before manager commit verification.
    source.write_bytes(recorded)
    after = hashlib.sha256(source.read_bytes()).hexdigest()
    manager_match = before == after
    actual_input_match = hashlib.sha256(consumer_read).hexdigest() == before
    assert manager_match is True
    assert actual_input_match is False
    print(json.dumps({"pre_and_commit_digest_match": manager_match,
                      "consumer_used_recorded_bytes": actual_input_match,
                      "consumer_value": consumer_read.decode().strip(),
                      "recorded_value": recorded.decode().strip(),
                      "scope": "simulated input fingerprint policy, no product or bind mount executed"}, sort_keys=True))
