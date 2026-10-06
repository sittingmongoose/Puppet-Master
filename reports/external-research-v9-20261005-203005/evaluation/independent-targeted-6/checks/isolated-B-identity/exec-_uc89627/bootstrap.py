import json, resource, sys
resource.setrlimit(resource.RLIMIT_CPU, (3, 3))
resource.setrlimit(resource.RLIMIT_AS, (256*1024*1024, 256*1024*1024))
resource.setrlimit(resource.RLIMIT_FSIZE, (1024*1024, 1024*1024))
resource.setrlimit(resource.RLIMIT_NOFILE, (64, 64))
resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
data = json.loads(open('/work/data.json').read())
sys.stderr.write('ER9_TRUSTED_BOOTSTRAP_EXEC_START\n'); sys.stderr.flush()
exec(compile(open('/work/code.py').read(), '/work/code.py', 'exec'), {'__name__':'__main__', 'data':data})
