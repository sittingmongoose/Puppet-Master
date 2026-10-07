"""Fail-closed, offline, single-process Python witness primitive (Linux/bwrap)."""
import argparse
import json
import os
import selectors
import shutil
import signal
import subprocess
import time
from pathlib import Path
from common import digest, encoded, read, write_new, now, emit

# Trusted bootstrap runs before candidate code. No shell or host preexec hook.
RUNNER = r'''
import ctypes, errno, json, os, resource
resource.setrlimit(resource.RLIMIT_AS, (268435456, 268435456))
resource.setrlimit(resource.RLIMIT_CPU, (2, 2))
resource.setrlimit(resource.RLIMIT_FSIZE, (1048576, 1048576))
resource.setrlimit(resource.RLIMIT_NOFILE, (32, 32))
resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
lib = ctypes.CDLL('libseccomp.so.2', use_errno=True)
lib.seccomp_init.argtypes = [ctypes.c_uint32]
lib.seccomp_init.restype = ctypes.c_void_p
lib.seccomp_syscall_resolve_name.argtypes = [ctypes.c_char_p]
lib.seccomp_syscall_resolve_name.restype = ctypes.c_int
lib.seccomp_rule_add.argtypes = [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_int, ctypes.c_uint]
lib.seccomp_load.argtypes = [ctypes.c_void_p]
lib.seccomp_release.argtypes = [ctypes.c_void_p]
context = lib.seccomp_init(0x7fff0000)  # allow, then forbid process/socket/isolation escapes
if not context:
    raise RuntimeError('seccomp_init failed')
for name in ('clone', 'clone3', 'fork', 'vfork', 'execve', 'execveat', 'socket',
             'socketpair', 'mount', 'umount2', 'unshare', 'setns', 'ptrace',
             'process_vm_readv', 'process_vm_writev', 'bpf', 'userfaultfd',
             'io_uring_setup', 'io_uring_enter', 'io_uring_register'):
    number = lib.seccomp_syscall_resolve_name(name.encode())
    if number >= 0 and lib.seccomp_rule_add(context, 0x00050000 | errno.EPERM, number, 0) != 0:
        raise RuntimeError('seccomp_rule_add failed: ' + name)
if lib.seccomp_load(context) != 0:
    raise RuntimeError('seccomp_load failed')
lib.seccomp_release(context)
namespaces = {k: os.readlink('/proc/self/ns/' + k) for k in ('mnt','net','pid','ipc','uts','user')}
os.write(2, ('ER10_ISOLATION_READY ' + json.dumps(namespaces) + '\n').encode())
source = open('/code.py', 'rb').read()
exec(compile(source, '/code.py', 'exec'), {'__name__':'__main__', '__file__':'/code.py'})
'''

PROBE = b'''import os, socket
for path in ('/home', '/run', '/mnt', '/etc'):
    assert not os.path.exists(path), path
for action in (lambda: socket.socket(), lambda: os.fork(), lambda: open('/tmp/write', 'w')):
    try:
        action()
    except OSError:
        pass
    else:
        raise AssertionError('forbidden operation succeeded')
assert sorted(os.environ) == ['LANG', 'PATH', 'PWD']
print('offline/read-only/no-fork probe passed')
'''


def execute(code, input_bytes=None, wall_seconds=5, max_output=131072):
    if not 0 < wall_seconds <= 30 or not 1024 <= max_output <= 131072:
        raise ValueError("wall limit must be (0,30] seconds; output limit 1024..131072 bytes")
    start = time.monotonic()
    receipt = {"started_at": now(), "code_sha256": digest(code),
               "input_sha256": digest(input_bytes) if input_bytes is not None else None,
               "isolation": "unavailable", "process_exit": None,
               "exit_scope": "bubblewrap wrapper; child signal exits use 128+signal",
               "witness_validity": "not_assessed", "applicability": "not_assessed",
               "limits": {"wall_seconds": wall_seconds, "cpu_seconds": 2,
                          "address_space_bytes": 268435456, "output_bytes": max_output,
                          "network": "none", "filesystem": "read-only", "processes": "single"}}
    binary = shutil.which("bwrap")
    if not binary or not hasattr(os, "memfd_create"):
        receipt["blocker"] = "Linux bwrap/memfd unavailable; code not executed"
        receipt.update(ended_at=now(), elapsed_seconds=time.monotonic()-start,
                       resource_released=True)
        return receipt
    fds, proc = [], None
    try:
        cmd = [binary, "--unshare-all", "--unshare-user", "--disable-userns",
               "--die-with-parent", "--new-session", "--cap-drop", "ALL", "--clearenv",
               "--setenv", "PATH", "/usr/bin", "--setenv", "LANG", "C.UTF-8"]
        # Fixed system Python runtime only; no configurable host bind paths.
        version = subprocess.check_output(["/usr/bin/python3", "-I", "-B", "-c",
                                           "import sys;print('%d.%d'%sys.version_info[:2])"],
                                          timeout=2, env={"PATH": "/usr/bin"}).decode().strip()
        for path in ("/usr/lib/python" + version, "/usr/lib/x86_64-linux-gnu"):
            if not Path(path).is_dir():
                raise RuntimeError("fixed x86_64 Linux runtime unavailable")
            cmd += ["--ro-bind", path, path]
        cmd += ["--ro-bind", "/usr/bin/python3", "/usr/bin/python3",
                "--symlink", "usr/lib", "/lib", "--symlink", "usr/lib/x86_64-linux-gnu", "/lib64",
                "--proc", "/proc", "--remount-ro", "/proc", "--dev", "/dev", "--remount-ro", "/dev",
                "--tmpfs", "/tmp", "--remount-ro", "/tmp"]
        for body, name in ((RUNNER.encode(), "/runner.py"), (code, "/code.py"),
                           (input_bytes, "/input.bin")):
            if body is not None:
                fd = os.memfd_create("er10-input", flags=0)
                fds.append(fd)
                os.write(fd, body)
                os.lseek(fd, 0, os.SEEK_SET)
                cmd += ["--ro-bind-data", str(fd), name]
        cmd += ["--remount-ro", "/", "--chdir", "/tmp", "--", "/usr/bin/python3",
                "-I", "-B", "/runner.py"]
        proc = subprocess.Popen(cmd, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE, pass_fds=fds, close_fds=True,
                                start_new_session=True, env={"PATH": "/usr/bin"})
        captured = {"stdout": bytearray(), "stderr": bytearray()}
        with selectors.DefaultSelector() as selector:
            for stream, label in ((proc.stdout, "stdout"), (proc.stderr, "stderr")):
                os.set_blocking(stream.fileno(), False)
                selector.register(stream, selectors.EVENT_READ, label)
            reason = None
            while selector.get_map():
                if time.monotonic() - start > wall_seconds:
                    reason = "wall_timeout"
                    break
                for key, _ in selector.select(0.05):
                    chunk = os.read(key.fd, 16384)
                    if not chunk:
                        selector.unregister(key.fileobj)
                        continue
                    remaining = max_output - sum(map(len, captured.values()))
                    captured[key.data].extend(chunk[:remaining])
                    if len(chunk) > remaining:
                        reason = "output_limit"
                        break
                if reason:
                    break
        if reason:
            try:
                os.killpg(proc.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
        try:
            proc.wait(timeout=max(0.01, wall_seconds - (time.monotonic() - start)))
        except subprocess.TimeoutExpired:
            reason = "wall_timeout"
            try:
                os.killpg(proc.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            proc.wait(timeout=2)
        proc.stdout.close()
        proc.stderr.close()
        stderr = captured["stderr"].decode("utf-8", errors="replace")
        first = stderr.splitlines()[0] if stderr else ""
        if first.startswith("ER10_ISOLATION_READY "):
            ns = json.loads(first.split(" ", 1)[1])
            if all(v != os.readlink("/proc/self/ns/" + k) for k, v in ns.items()):
                receipt["isolation"] = "namespace_and_seccomp_enforced"
            else:
                receipt["blocker"] = "namespace identity check failed"
        else:
            receipt["blocker"] = "sandbox/bootstrap unavailable; candidate code was not admitted"
        receipt.update(process_exit=proc.returncode, termination=reason,
                       stdout=captured["stdout"].decode("utf-8", errors="replace"), stderr=stderr,
                       output_truncated=reason == "output_limit")
    except (OSError, RuntimeError, subprocess.SubprocessError) as exc:
        receipt["blocker"] = str(exc)
    finally:
        if proc is not None:
            if proc.poll() is None:
                try:
                    os.killpg(proc.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
                proc.wait(timeout=2)
            for stream in (proc.stdout, proc.stderr):
                if stream and not stream.closed:
                    stream.close()
            receipt["resource_released"] = proc.poll() is not None
        else:
            receipt["resource_released"] = True
        for fd in fds:
            os.close(fd)
        receipt.update(ended_at=now(), elapsed_seconds=time.monotonic()-start)
    return receipt


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--code", type=Path)
    p.add_argument("--input", type=Path, help="one bounded data file, visible as /input.bin")
    p.add_argument("--probe", action="store_true")
    p.add_argument("--receipt", type=Path, required=True)
    p.add_argument("--wall-seconds", type=float, default=5)
    a = p.parse_args()
    if bool(a.code) == bool(a.probe) or not 0 < a.wall_seconds <= 30 or a.receipt.exists():
        p.error("choose code OR probe, new receipt, and wall seconds in (0,30]")
    result = execute(PROBE if a.probe else read(a.code, 1024*1024),
                     read(a.input, 1024*1024) if a.input else None, a.wall_seconds)
    write_new(a.receipt, encoded(result))
    emit(result)
    if result["isolation"] != "namespace_and_seccomp_enforced":
        return 2
    return 1 if a.probe and (result["process_exit"] != 0 or result.get("termination")) else 0


if __name__ == "__main__":
    raise SystemExit(main())
