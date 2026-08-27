#!/usr/bin/env python3
import hashlib,json,socket,sys
if len(sys.argv)!=2: raise SystemExit(2)
r='charlie'; t=sys.argv[1]; p='/mnt/Cursor/PuppetMaster/tests/r9g36/run-canary-006/goal_subject.sock'
q=json.dumps({"route":r,"schema_id":"pw-r9-codex-native-goal-db-socket-subject-request-v1","thread_id":t},sort_keys=True,separators=(",",":")).encode()+b"\n"
s=socket.socket(socket.AF_UNIX,socket.SOCK_STREAM); s.settimeout(8.0); s.connect(p); s.sendall(q); s.shutdown(socket.SHUT_WR)
raw=b""
while True:
 x=s.recv(512)
 if not x: break
 raw+=x
s.close()
if len(raw)!=261 or hashlib.sha256(raw).hexdigest()!='c29ed7ef69f87a0e0228cece9a0d3b9ab277f486b88a36ddbad8ee544703542a': raise SystemExit(3)
sys.stdout.buffer.write(raw)
