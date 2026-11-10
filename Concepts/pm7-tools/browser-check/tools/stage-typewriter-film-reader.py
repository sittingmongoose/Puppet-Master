#!/usr/bin/env python3
"""Match Retro Dark's straight green speech borders to exact tagged native film frames.

This verifies the typing sampler's horizontal boxes were painted for selected isolated
borders. The kit's separate prefix/real-typer assertions judge every text's stability.
"Which folder?" puts its border on a prop rope and needs a different pixel predicate.
"""
import argparse
from fractions import Fraction
import json
import math
import pathlib
import subprocess
from PIL import Image

p = argparse.ArgumentParser()
p.add_argument('film'); p.add_argument('probe'); p.add_argument('--out', required=True)
p.add_argument('--text', action='append', choices=["No AI yet? That's fine.",'Open that one first?','A different file or folder?'],
    help='repeat for supported isolated-border cases; default is No AI yet')
a = p.parse_args()
meta = json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0',
    '-show_entries','stream=width,height,avg_frame_rate','-of','json',a.film]))['streams'][0]
fps = float(Fraction(meta['avg_frame_rate']))
if [meta['width'],meta['height']] != [1920,1080] or abs(fps-60) > .1:
    raise SystemExit('Requires native 1920x1080 at60fps; no resizing or rate conversion')
episodes = json.loads(pathlib.Path(a.probe).read_text())
if any(e['look'] != 'retro-dark' for e in episodes):
    raise SystemExit('This pixel predicate is for Retro Dark phosphor speech')
selected = a.text or ["No AI yet? That's fine."]
episodes = [dict(e,paint=[c for c in e['paint'] if c['text'] in selected]) for e in episodes]
if any(not any(c['text']==text for e in episodes for c in e['paint']) for text in selected):
    raise SystemExit('A selected case is absent')
rows = {r['paintSeq']: (e, c, r) for e in episodes for c in e['paint'] for r in c['frames']}
if not rows:
    raise SystemExit('No tagged paint frames')
left = math.floor(min(r['box'][0] for _,_,r in rows.values()))-12
right = math.ceil(max(r['box'][0]+r['box'][2] for _,_,r in rows.values()))+12
top = math.floor(min(r['box'][1] for _,_,r in rows.values()))-6
bottom = math.ceil(max(r['box'][1]+r['box'][3] for _,_,r in rows.values()))+6
width, height = right-left, bottom-top
packed = max(168,width)
filters = (f'[0:v]format=rgb24,split=2[t][b];[t]crop=168:8:0:0,pad={packed}:8:0:0[tag];'
           f'[b]crop={width}:{height}:{left}:{top},pad={packed}:{height}:0:0[box];[tag][box]vstack')
proc = subprocess.Popen(['ffmpeg','-v','error','-i',a.film,'-filter_complex',filters,
    '-pix_fmt','rgb24','-f','rawvideo','-'],stdout=subprocess.PIPE)
size = packed*(height+8)*3
samples = []; index = 0
while True:
    raw = proc.stdout.read(size)
    if not raw: break
    if len(raw) != size: raise RuntimeError('Partial decoded frame')
    im = Image.frombytes('RGB',(packed,height+8),raw)
    values = [sum(im.getpixel((i*4+2,4)))/3 for i in range(42)]
    bits = [1 if v>160 else 0 if v<96 else -1 for v in values]
    seq = None
    if bits[:2] == [1,0] and all(bits[2+i]>=0 and bits[22+i]==1-bits[2+i] for i in range(20)):
        seq = sum(bits[2+i]<<i for i in range(20))
    if seq in rows:
        e,c,r = rows[seq]; box = r['box']
        y0,y1 = math.floor(box[1]),math.ceil(box[1]+box[3])
        def chroma(x,y):
            red,green,blue=im.getpixel((x-left,y-top+8))
            return green-(red+blue)/2
        def edge(expected,side):
            xs=list(range(math.floor(expected)-8,math.floor(expected)+9))
            # A nearby prop rope continues above/below the box. A speech border exists
            # only along its side. Subtract that outside ink before reading the stroke.
            weights=[]
            for x in xs:
                inside=sum(chroma(x,y) for y in range(y0+5,y1-5))/max(1,y1-y0-10)
                outside=(chroma(x,y0-4)+chroma(x,y1+4))/2
                weights.append(max(0,inside-outside))
            at=max(range(len(xs)),key=lambda i:weights[i]); peak=weights[at]
            if peak<8:return None
            lo=hi=at
            while lo>0 and weights[lo-1]>=peak/2:lo-=1
            while hi+1<len(xs) and weights[hi+1]>=peak/2:hi+=1
            centre=sum((xs[i]+.5)*weights[i] for i in range(lo,hi+1))/sum(weights[lo:hi+1])
            return centre+side # 2px phosphor border: one pixel from stroke centre to its outer edge
        le,re=edge(box[0],-1),edge(box[0]+box[2],1)
        native=[le,re] if le is not None and re is not None else None
        error = max(abs(native[0]-box[0]),abs(native[1]-(box[0]+box[2]))) if native else None
        samples.append(dict(frame=index,seconds=index/fps,seq=seq,mode=e['mode'],text=c['text'],
            on=r['on'],off=r['off'],width=r['w'],native=native,expected=[box[0],box[0]+box[2]],error=error))
    index += 1
if proc.wait(): raise RuntimeError('ffmpeg failed')
bad = [s for s in samples if s['error'] is None or s['error']>1]
coverage = [dict(mode=e['mode'],text=c['text'],frames=sum(s['mode']==e['mode'] and s['text']==c['text'] for s in samples))
            for e in episodes for c in e['paint']]
result = dict(ok=bool(samples) and all(c['frames']>=30 for c in coverage) and not bad,
    selectedTexts=selected,fps=fps,filmFrames=index,matchedFrames=len(samples),badFrames=len(bad),coverage=coverage,
    maxRasterError=max((s['error'] for s in samples if s['error'] is not None),default=None),
    firstBad=bad[:8],samples=samples)
pathlib.Path(a.out).write_text(json.dumps(result,separators=(',',':'),allow_nan=False))
print(json.dumps({k:v for k,v in result.items() if k!='samples'}))
raise SystemExit(0 if result['ok'] else 1)
