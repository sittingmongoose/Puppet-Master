
import json, os, tempfile

out = {}

def atomic_save(path, obj):
    tmp = path + '.tmp'
    with open(tmp, 'w') as f:
        json.dump(obj, f)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, path)          # POSIX: atomic replacement of existing target

def save_then_crash_before_replace(path, obj):
    tmp = path + '.tmp'
    with open(tmp, 'w') as f:
        json.dump(obj, f)
        f.flush()
        os.fsync(f.fileno())
    # simulated crash: replace never happens

d = tempfile.mkdtemp()
proj = os.path.join(d, 'project.json')
good = {'schema': 1, 'name': 'demo', 'annotations': 42}
atomic_save(proj, good)
out['after_clean_save'] = json.load(open(proj)) == good
out['no_tmp_left_after_clean_save'] = not os.path.exists(proj + '.tmp')

# Interrupted save: original intact, .tmp recoverable
newer = {'schema': 1, 'name': 'demo', 'annotations': 43}
save_then_crash_before_replace(proj, newer)
out['interrupted_save_original_intact'] = json.load(open(proj)) == good
out['interrupted_save_tmp_present'] = os.path.exists(proj + '.tmp')
out['tmp_recoverable_content'] = json.load(open(proj + '.tmp')) == newer

# Recovery scan: complete the interrupted save
if os.path.exists(proj + '.tmp'):
    os.replace(proj + '.tmp', proj)
out['recovered_content'] = json.load(open(proj)) == newer

# Failed export: exception mid-write leaves target untouched
try:
    with open(proj + '.tmp', 'w') as f:
        f.write('{ truncated ...')
        raise IOError('disk full (simulated)')
except IOError:
    os.unlink(proj + '.tmp')
out['failed_export_target_untouched'] = json.load(open(proj)) == newer
out['failed_export_cleaned_tmp'] = not os.path.exists(proj + '.tmp')

print(json.dumps(out, indent=1))
print("EXIT_OK")
