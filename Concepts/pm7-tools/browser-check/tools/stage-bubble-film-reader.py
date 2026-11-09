#!/usr/bin/env python3
"""Read Basic Light Ready's white bubble directly from native 1920x1080 GPU film pixels.

With pip-stage-entry --set counter=1, compare the raster fill edge with the exact tagged
frame's DOM box (1 px raster tolerance). Without tags, retain pixel trajectories only;
there is no fabricated per-frame DOM correlation. Other looks need their own pixel reader.
"""
import argparse, json, math, pathlib, subprocess
from fractions import Fraction
from PIL import Image, ImageChops, ImageDraw

p = argparse.ArgumentParser()
p.add_argument('film'); p.add_argument('probe'); p.add_argument('--out', required=True)
p.add_argument('--allow-untagged', action='store_true', help='retain an uncorrelated trajectory, never a placement verdict')
a = p.parse_args()
meta = json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0',
    '-show_entries','stream=width,height,avg_frame_rate','-of','json',a.film]))['streams'][0]
fps = float(Fraction(meta['avg_frame_rate']))
if [meta['width'],meta['height']] != [1920,1080] or abs(fps-60) > .1:
    raise SystemExit('Requires a native 1920x1080, 60 fps film; no resizing or rate conversion')
episodes = json.loads(pathlib.Path(a.probe).read_text())
episodes = [e for e in episodes if e['look'] == 'basic-light' and e['size'] == [1920,1080]]
if not episodes:
    raise SystemExit('This reader requires Basic Light at native 1920x1080')
rows = {r['paintSeq']: (e, r) for e in episodes for r in e['frames'] if r.get('paintSeq')}
# The fitter may place this route above or below Pip. Select its native search window from
# the tagged DOM boxes; pixels still locate the independent connected white fill within it.
boxes = [[r['stageRect'][0]+r['bub']['box'][0],r['stageRect'][1]+r['bub']['box'][1],r['bub']['box'][2],r['bub']['box'][3]]
         for _,r in rows.values() if r.get('screen') == 'c-ready']
if not boxes: raise SystemExit('No tagged Ready boxes')
left=max(0,min(1570,math.floor(min(b[0] for b in boxes))-30))
top=max(0,min(900,math.floor(min(b[1] for b in boxes))-40))
if any(b[0]<left or b[1]<top or b[0]+b[2]>left+350 or b[1]+b[3]>top+180 for b in boxes):
    raise SystemExit('Ready boxes exceed one native350x180 search window; reader needs multiple regions')
# Decode only the tag and search window. No rescaling or rate conversion.
filters = f'[0:v]split=2[t][b];[t]crop=168:8:0:0,pad=350:8:0:0[tag];[b]crop=350:180:{left}:{top}[box];[tag][box]vstack'
cmd = ['ffmpeg','-hide_banner','-loglevel','error','-i',a.film,'-filter_complex',filters,'-pix_fmt','rgb24','-f','rawvideo','-']
proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
size = 350 * 188 * 3
frames = []; index = 0
threshold = [0 if i < 248 else 255 for i in range(256)]
while True:
    raw = proc.stdout.read(size)
    if not raw: break
    if len(raw) != size: raise RuntimeError('partial decoded frame')
    im = Image.frombytes('RGB',(350,188),raw)
    tag = im.crop((0,0,168,8)).convert('L')
    bits = [1 if tag.getpixel((4*i+2,4)) > 160 else 0 if tag.getpixel((4*i+2,4)) < 96 else -1 for i in range(42)]
    seq = None
    if bits[:2] == [1,0] and all(bits[2+i] >= 0 and bits[22+i] == 1-bits[2+i] for i in range(20)):
        seq = sum(bits[2+i] << i for i in range(20))
    if rows and seq not in rows:
        index += 1
        continue
    box = im.crop((0,8,350,188)); r,g,b = box.split()
    mask = ImageChops.darker(ImageChops.darker(r,g),b).point(threshold)
    # At least 165 white pixels across a row: text holes remain inside the filled box;
    # the small white eyes, tail and prop highlights cannot impersonate the bubble.
    means = list(mask.resize((1,180),Image.Resampling.BOX).get_flattened_data())
    ys = [i for i,v in enumerate(means) if v >= 120]
    native = None
    seed = None
    for y in ys:
        start = None
        for x in range(351):
            white = x < 350 and mask.getpixel((x,y)) != 0
            if white and start is None: start = x
            if not white and start is not None:
                if x-start >= 165: seed=((start+x)//2,y); break
                start = None
        if seed: break
    if seed:
        # An entering server can have white panels beside the bubble. Read its
        # connected fill rather than merging every white object in the region.
        filled=mask.copy();ImageDraw.floodfill(filled,seed,128)
        component=filled.point([255 if v==128 else 0 for v in range(256)])
        means=list(component.resize((1,180),Image.Resampling.BOX).get_flattened_data())
        ys=[i for i,v in enumerate(means) if v>=120]
    if ys and seed and 20 <= max(ys)-min(ys) <= 75:
        part = component.crop((0,min(ys),350,max(ys)+1)); bb = part.getbbox()
        if bb and 175 <= bb[2]-bb[0] <= 245:
            # Near-white excludes the antialiased edge pixel. Use the centre of
            # its one-cell boundary interval, plus the 1px Basic border.
            native = [left+bb[0]-1.5,top+min(ys)-1.5,left+bb[2]+1.5,top+max(ys)+2.5]
    data = dict(frame=index,seconds=round(index/fps,4),seq=seq,native=native)
    if seq in rows:
        ep, row = rows[seq]
        data.update(mode=ep['mode'],label=ep['label'],screen=row.get('screen'))
        if row.get('screen') == 'c-ready':
            sr=row['stageRect']; q=row['bub']['box']
            expected=[sr[0]+q[0],sr[1]+q[1],sr[0]+q[0]+q[2],sr[1]+q[1]+q[3]]
            data['expected']=expected
            if native:
                # Fill endpoints can quantize by one pixel at a rounded corner; top/bottom
                # are read along the straight part, and are the placement witness.
                data['error']=max(abs(native[i]-expected[i]) for i in (1,3))
    if native or seq in rows: frames.append(data)
    index += 1
if proc.wait() != 0: raise RuntimeError('ffmpeg failed')
matched=[r for r in frames if r.get('screen')=='c-ready']
errors=[r for r in matched if r.get('error',float('inf')) > 1]
coverage=[dict(mode=e['mode'],label=e['label'],frames=sum(r.get('mode')==e['mode'] and r.get('label')==e['label'] for r in matched)) for e in episodes]
covered=all(e['frames'] >= 30 for e in coverage)
result=dict(status='tagged_comparison' if matched else 'trajectory_only', ok=covered and not errors if matched else None,
            filmFrames=index,fps=fps,roi=[left,top,350,180],taggedReadyFrames=len(matched),badRasterFrames=len(errors),
            coverage=coverage,
            maxRasterError=max((r['error'] for r in matched if 'error' in r),default=None),
            firstBad=errors[:8],frames=frames)
pathlib.Path(a.out).write_text(json.dumps(result,separators=(',',':'),allow_nan=False))
print(json.dumps({k:v for k,v in result.items() if k!='frames'}))
raise SystemExit(0 if result['ok'] or a.allow_untagged and not matched else 1)
