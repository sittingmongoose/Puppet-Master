#!/usr/bin/env python3
"""Decode final recordings without frame interpolation or padding.
All encoded frames get hashes/timestamps and consecutive contact-sheet coverage.
This script does not perform visual review; the review record is separate.
"""
from pathlib import Path
import argparse,hashlib,json,math,statistics,subprocess
from PIL import Image,ImageDraw,ImageFont

def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def stats(values):
 v=sorted(values)
 return {'count':len(v),'median_ms':statistics.median(v) if v else None,'p95_ms':v[min(len(v)-1,math.floor(len(v)*.95))] if v else None,'max_ms':max(v,default=0),'over25ms':sum(x>25 for x in v),'over50ms':sum(x>50 for x in v)}
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--recordings',type=Path,required=True);ap.add_argument('--outdir',type=Path,required=True);a=ap.parse_args();src=a.recordings.resolve();out=a.outdir.resolve()
 if (out/'FRAME_REPORT.json').exists():ap.error('Use a fresh output directory')
 videos=sorted(src.glob('*/workflow.mkv'))
 if not videos:ap.error('No recordings found')
 out.mkdir(parents=True,exist_ok=True);font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',12)
 report={'status':'running','visual_review':'not_performed_by_script','scope':'All encoded frames decoded. Encoded cadence is not application paint cadence. No interpolation or frame padding. Identical frames can be intentional static dwell.','recordings':[]}
 def save():(out/'FRAME_REPORT.json').write_text(json.dumps(report,indent=2)+'\n')
 for video in videos:
  name=video.parent.name;dest=out/name;dest.mkdir();r=json.loads((video.parent/'RESULT.json').read_text());assert r['status']=='pass',name
  probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_streams','-show_frames','-show_entries','frame=best_effort_timestamp_time:stream=width,height,r_frame_rate,avg_frame_rate,time_base','-of','json',str(video)]));pts=[float(f['best_effort_timestamp_time']) for f in probe['frames']];assert pts
  (dest/'encoded_timestamps.json').write_text(json.dumps(pts)+'\n');gaps=[(b-a)*1000 for a,b in zip(pts,pts[1:])]
  hashes_txt=subprocess.check_output(['ffmpeg','-v','error','-i',str(video),'-map','0:v:0','-fps_mode','passthrough','-f','framemd5','-']).decode();(dest/'decoded_frame_hashes.txt').write_text(hashes_txt);hashes=[x.split(',')[-1].strip() for x in hashes_txt.splitlines() if x and not x.startswith('#')];assert len(hashes)==len(pts)
  native=sorted(set([0,len(pts)//3,len(pts)*2//3,max(0,len(pts)-20),max(range(len(gaps)),key=gaps.__getitem__)+1 if gaps else 0]));vf='select='+ '+'.join('eq(n\\,'+str(i)+')' for i in native)
  subprocess.run(['ffmpeg','-v','error','-i',str(video),'-vf',vf,'-fps_mode','passthrough',str(dest/'native-%02d.png')],check=True)
  tw=210;th=round(probe['streams'][0]['height']*tw/probe['streams'][0]['width']);stride=tw*th*3;cols,nrows=8,10;per=cols*nrows;cellh=th+19;sheets=[];overview_indices=sorted({round(i*(len(pts)-1)/19) for i in range(20)});overview=Image.new('RGB',(tw*5,cellh*4+30),(245,245,245));od=ImageDraw.Draw(overview);od.text((6,7),name+' | sampled workflow overview',font=font,fill=(10,10,10))
  proc=subprocess.Popen(['ffmpeg','-v','error','-i',str(video),'-vf',f'scale={tw}:{th}','-fps_mode','passthrough','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE);idx=0
  while True:
   data=proc.stdout.read(stride)
   if not data:break
   while len(data)<stride:
    more=proc.stdout.read(stride-len(data));assert more;data+=more
   if idx%per==0:
    sheet=Image.new('RGB',(tw*cols,cellh*nrows+30),(245,245,245));draw=ImageDraw.Draw(sheet);draw.text((6,7),f'{name} | consecutive {idx+1}-{min(idx+per,len(pts))} | no frames omitted',font=font,fill=(10,10,10))
   im=Image.frombytes('RGB',(tw,th),data);x=(idx%cols)*tw;y=30+((idx%per)//cols)*cellh;sheet.paste(im,(x,y));draw.text((x+3,y+th+2),f'{idx+1}   {pts[idx]:.3f}s',font=font,fill=(10,10,10))
   if idx in overview_indices:
    oi=overview_indices.index(idx);ox=oi%5*tw;oy=30+oi//5*cellh;overview.paste(im,(ox,oy));od.text((ox+3,oy+th+2),f'{idx+1}   {pts[idx]:.3f}s',font=font,fill=(10,10,10))
   idx+=1
   if idx%per==0 or idx==len(pts):
    p=dest/f'consecutive-{len(sheets)+1:03d}.jpg';sheet.save(p,quality=87);sheets.append({'path':str(p.relative_to(out)),'first_frame':len(sheets)*per+1,'last_frame':idx,'sha256':digest(p)})
  assert proc.wait()==0 and idx==len(pts);overview.save(dest/'overview.jpg',quality=93)
  raf=r.get('timing',{}).get('raf',[]);rafg=[b-a for a,b in zip(raf,raf[1:])];same=sum(x==y for x,y in zip(hashes,hashes[1:]));run=longest=1
  for x,y in zip(hashes,hashes[1:]):run=run+1 if x==y else 1;longest=max(longest,run)
  row={'scenario':name,'html_sha256':r['html_sha256'],'video_sha256':digest(video),'stream':probe['streams'][0],'frame_count':len(pts),'encoded_intervals':stats(gaps),'browser_raf':stats(rafg),'browser_long_tasks':r.get('timing',{}).get('longTasks',[]),'identical_consecutive_pairs':same,'longest_identical_run_frames':longest,'native_indices_1_based':[x+1 for x in native],'overview_indices_1_based':[x+1 for x in overview_indices],'contact_sheets':sheets,'visual_review':'pending'};report['recordings'].append(row);save();print(name,'frames',len(pts),'sheets',len(sheets),flush=True)
 report['status']='decoded';report['total_frames']=sum(r['frame_count'] for r in report['recordings']);save()
if __name__=='__main__':main()
