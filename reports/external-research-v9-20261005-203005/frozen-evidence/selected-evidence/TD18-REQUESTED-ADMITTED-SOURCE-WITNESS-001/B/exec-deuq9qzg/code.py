import hashlib, os, pathlib, tempfile
with tempfile.TemporaryDirectory() as d:
    root = pathlib.Path(d)
    target = root / 'project.json'
    target.write_bytes(b'{"generation":1}')
    old_digest = hashlib.sha256(target.read_bytes()).hexdigest()
    orphan = root / '.project.json.tmp'
    try:
        orphan.write_bytes(b'{"generation":2,')
        raise RuntimeError('simulated interruption before replace')
    except RuntimeError:
        pass
    after_failure_intact = hashlib.sha256(target.read_bytes()).hexdigest() == old_digest
    orphan_remains = orphan.exists()
    complete = root / '.project.json.complete.tmp'
    complete.write_bytes(b'{"generation":2}')
    os.replace(complete, target)
    after_replace = target.read_bytes().decode('utf-8')
    same_hash = hashlib.sha256(after_replace.encode()).hexdigest() == hashlib.sha256(b'{"generation":2}').hexdigest()
    changed_hash = hashlib.sha256(b'{"generation":2}').hexdigest() != hashlib.sha256(b'{"generation":3}').hexdigest()
    print('target_intact_after_pre_replace_failure:', after_failure_intact)
    print('orphan_temp_remains:', orphan_remains)
    print('new_generation_after_replace:', after_replace)
    print('replacement_hash_matches:', same_hash)
    print('one_byte_identity_change_detected:', changed_hash)
