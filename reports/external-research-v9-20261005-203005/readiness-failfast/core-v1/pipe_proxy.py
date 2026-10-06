"""Native MCP child: verified inherited resource placement, byte stream only."""
import argparse,os,re,selectors,socket,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
import profile

def main():
    p=argparse.ArgumentParser();p.add_argument('--socket',required=True);p.add_argument('--resource-profile',required=True);a=p.parse_args()
    resource=profile.load(a.resource_profile);profile.reader.own_placement(resource)
    if not re.fullmatch(r'@er9glm[0-9a-f]{32}',a.socket):raise ValueError('Exact owned abstract MCP endpoint required')
    sock=socket.socket(socket.AF_UNIX,socket.SOCK_STREAM);sock.connect('\0'+a.socket[1:])
    sel=selectors.DefaultSelector();sel.register(sys.stdin.buffer,selectors.EVENT_READ,'stdin');sel.register(sock,selectors.EVENT_READ,'socket')
    try:
        while True:
            for key,_ in sel.select(.1):
                data=os.read(key.fileobj.fileno(),65536)
                if not data:return 0
                if key.data=='stdin':sock.sendall(data)
                else:sys.stdout.buffer.write(data);sys.stdout.buffer.flush()
    finally:sock.close();sel.close()
if __name__=='__main__':raise SystemExit(main())
