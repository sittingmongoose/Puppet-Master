"""Decode every encoded frame into consecutive contact sheets without padding.
The generated visual-review state is pending until an actual reviewer inspects it.
"""
from pathlib import Path
import argparse
from PIL import Image,ImageDraw,ImageFont
import hashlib,json,subprocess,statistics,math
ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--evidence-root',type=Path,required=True);ap.add_argument('--outdir',type=Path,required=True);args=ap.parse_args();E=args.evidence_root.resolve();O=args.outdir.resolve()
if (O/'TIMING_AND_FRAME_COVERAGE.json').exists():ap.error('Use a fresh frame-output directory.')
O.mkdir(parents=True,exist_ok=True)
def relative(path):
 try:return str(path.relative_to(E))
 except ValueError:return str(path)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def calc(vals):
 vals=sorted(vals)
 return {'count':len(vals),'median_ms':statistics.median(vals) if vals else None,'p95_ms':vals[min(len(vals)-1,math.floor(len(vals)*.95))] if vals else None,'max_ms':max(vals,default=0),'over25ms':sum(x>25 for x in vals),'over50ms':sum(x>50 for x in vals)}
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',11);result={'status':'decoded_contact_sheets_pending_visual_review','claim_boundary':'60 Hz acquisition target, passthrough encoded timing, browser callbacks and long tasks are separate. No interpolation or CFR padding. No actual-paint instrumentation. Contact sheets cover every encoded frame; native-resolution individual inspection is selected, not exhaustive.','recordings':[]}
for scene in ['thorough','exhaustive','budget','blocker']:
 base=E/'recordings'/scene/scene;video=base/'workflow.mkv';r=json.loads((base/'RESULT.json').read_text());dest=O/scene;dest.mkdir(exist_ok=True)
 info=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_streams','-show_frames','-show_entries','frame=best_effort_timestamp_time:stream=width,height,r_frame_rate,avg_frame_rate,time_base,duration,nb_frames','-of','json',str(video)]))
 pts=[float(f['best_effort_timestamp_time']) for f in info['frames']];gaps=[(y-x)*1000 for x,y in zip(pts,pts[1:])];(dest/'encoded_timestamps.json').write_text(json.dumps(pts)+'\n')
 md5=subprocess.check_output(['ffmpeg','-v','error','-i',str(video),'-map','0:v:0','-fps_mode','passthrough','-f','framemd5','-']).decode();(dest/'decoded_frame_hashes.txt').write_text(md5);hashes=[l.split(',')[-1].strip() for l in md5.splitlines() if l and not l.startswith('#')]
 assert len(hashes)==len(pts),(scene,len(hashes),len(pts))
 native=[1,len(pts)//3,max(1,len(pts)-25)]
 if gaps:native.append(max(range(len(gaps)),key=gaps.__getitem__)+2)
 native=sorted(set(native));vf='select='+ '+'.join('eq(n\\,'+str(i-1)+')' for i in native)
 subprocess.run(['ffmpeg','-v','error','-i',str(video),'-vf',vf,'-fps_mode','passthrough',str(dest/'native-%02d.png')],check=True)
 (dest/'native_frame_indices.json').write_text(json.dumps(native))
 tw,th=192,135;stride=tw*th*3;cols,rows=10,12;per=cols*rows;cellh=th+17;sheets=[]
 p=subprocess.Popen(['ffmpeg','-v','error','-i',str(video),'-vf',f'scale={tw}:{th}','-fps_mode','passthrough','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
 idx=0;sheet=None
 while True:
  data=p.stdout.read(stride)
  if not data:break
  while len(data)<stride:
   more=p.stdout.read(stride-len(data));assert more;data+=more
  if idx%per==0:
   sheet=Image.new('RGB',(tw*cols,cellh*rows+30),(245,245,245));draw=ImageDraw.Draw(sheet);draw.text((6,6),f'{scene} | consecutive encoded frames {idx+1}–{min(idx+per,len(pts))} | no frames skipped',font=font,fill=(15,15,15))
  cell=idx%per;x=(cell%cols)*tw;y=30+(cell//cols)*cellh
  sheet.paste(Image.frombytes('RGB',(tw,th),data),(x,y));draw.text((x+3,y+th+2),f'{idx+1}  {pts[idx]:.3f}s',font=font,fill=(10,10,10));idx+=1
  if idx%per==0 or idx==len(pts):
   path=dest/f'sheet-{len(sheets)+1:03d}.jpg';sheet.save(path,quality=89);sheets.append({'path':relative(path),'first_frame':(len(sheets)*per)+1,'last_frame':idx,'sha256':sha(path)})
 assert p.wait()==0 and idx==len(pts)
 repeated=sum(x==y for x,y in zip(hashes,hashes[1:]));longest=run=1
 for x,y in zip(hashes,hashes[1:]):run=run+1 if x==y else 1;longest=max(longest,run)
 row={'scenario':scene,'result_status':r['status'],'html_sha256':r['html_sha256'],'recording_assertions':len(r['checks']),'video_path':relative(video),'video_sha256':sha(video),'stream':info['streams'][0],'frame_count':len(pts),'encoded_intervals':calc(gaps),'strict_identical_consecutive_decoded_pairs':repeated,'longest_identical_decoded_run':longest,'identical_frame_interpretation':'Can include intentional static dwell; not automatically a painting stall.','browser_raf':{k:r['timing'][k] for k in ['median_raf_ms','max_raf_ms','intervals_over_25ms']},'long_tasks':r['timing']['longTasks'],'contact_sheets':sheets,'selected_native_frames':native,'visual_review_status':'pending'}
 result['recordings'].append(row);(O/'TIMING_AND_FRAME_COVERAGE.json').write_text(json.dumps(result,indent=2)+'\n');print(scene,len(pts),'frames',len(sheets),'sheets',flush=True)
result['total_frames']=sum(x['frame_count'] for x in result['recordings']);result['total_sheets']=sum(len(x['contact_sheets']) for x in result['recordings']);(O/'TIMING_AND_FRAME_COVERAGE.json').write_text(json.dumps(result,indent=2)+'\n')
