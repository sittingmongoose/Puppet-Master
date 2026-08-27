#!/usr/bin/env python3
import hashlib,json,socket,sys
ROW='row-097'; PATH='/mnt/Cursor/PuppetMaster/tests/r9g37/run-stream-v5-canary-005/goal_chunks.sock'; SIZES=[170, 170, 170, 170, 170, 170, 170, 170, 170, 170, 170, 170, 170, 30]; DIGESTS=['6875d45626d8d1f3e6a95e0775f8d5fe8d3c6d4e84231ecec660b5b425b3d9da', '9e71f3a4c9616ae10ef80158e33f35e15e893f923c1f864e3aa338f4c23f894f', 'e20bc9791f1813e4c2ed62a78178bf84538c83c3c7c215f4756a6c87eebfbcb4', 'f696f3273011642e68baf794720473437295fbce06053ac2ba2011c2f048f800', '1a485d45147c6bb0e9aca76e0845da3f6c6e4f10e28cde6887a0074ea4e6b40f', '6670663070e4ed54bb75f92f811be7b10853ad17a1d4d301c399a38473f5651a', '47df5bc10b168bda86967cf64c261f9b06727acd80e3d51da812c068666b9fde', 'b1c052f8b3628e4fbe323b4b3c08713a8e5d9f490a8c416dcc2f4d4a70094e10', '1f26b4268da203c605cdf63fd84f7abc445242409bfdfddabf40bba221001fec', '7668577e6ac93c1182c31d1b71ca2230b6c8095fbadb5406b2ea038909d26cc3', '1327ca0eb5d0420d3540e12b9ffbd552d9767d79aabb7a3ff20f65d066c685f9', '97b094b0ff5452003975388a9709fc5db22c7c078fc326b0b81c57ff5977f868', '35061837ef7f378f2568e293cbf214092040ab5d00d15a208646b383b4dab315', '906993d15c76e3aeafdd0bea565879715e6fdb3bfd9c74e04cf8d2f22731d41c']
if len(sys.argv)!=3 or len(sys.argv[2])!=3 or not sys.argv[2].isdigit(): raise SystemExit(2)
thread=sys.argv[1]; index=int(sys.argv[2])
if index<0 or index>=len(SIZES): raise SystemExit(2)
request=json.dumps({"chunk_index":index,"row_id":ROW,"schema_id":"pw-r9-codex-native-goal-db-stream-v5-chunk-request-v1","thread_id":thread},sort_keys=True,separators=(",",":")).encode()+b"\n"
channel=socket.socket(socket.AF_UNIX,socket.SOCK_STREAM); channel.settimeout(10.0); channel.connect(PATH); channel.sendall(request); channel.shutdown(socket.SHUT_WR)
raw=b""
while True:
 part=channel.recv(512)
 if not part: break
 raw+=part
channel.close()
if len(raw)!=SIZES[index] or hashlib.sha256(raw).hexdigest()!=DIGESTS[index]: raise SystemExit(3)
sys.stdout.buffer.write(raw)
