#!/usr/bin/env python3
"""Compositor-recorded motion audit for Settings concepts 05–11.

Uses Chrome DevTools Page.startScreencast so evidence contains the actual
compositor frames produced during each interaction, including View Transition
pseudo-elements. Raw frames are temporary; sampled filmstrips, per-concept MP4
review reels, and a machine-readable report are retained.
"""
from __future__ import annotations

import argparse
import base64
import json
import math
import os
import re
import shutil
import statistics
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageStat
from playwright.sync_api import Page, sync_playwright

HERE = Path(__file__).resolve().parent
MODEL = HERE.parent
REPO = MODEL.parents[2]
HUB_SERVER = REPO / "Concepts" / "ConceptHub" / "server.py"
BASE = "/concepts/settings-redesign-concepts/5.6%20Sol"
STEMS = [
    "concept-05-directory-take-1",
    "concept-06-directory-take-2",
    "concept-07-compendium-workspace",
    "concept-08-directory-take-3",
    "concept-09-tome-tabs",
    "concept-10-command-suite",
    "concept-11-tabbed-organizer",
]
SAMPLE_TIMES = [0, 80, 160, 240, 360, 520, 760, 1000]

RESET_JS = """(spec) => {
  const a = window.__pmv2App;
  if (!a) throw new Error('PMv2 app unavailable');
  Object.keys(a.flags || {}).forEach(k => a.flags[k] = false);
  a.work = null;
  a.stack = [];
  a.query = '';
  a.results = [];
  a.selectedResultId = null;
  a.searchOpen = false;
  a.statesOpen = false;
  a.detailsId = null;
  a.copy = {step:null, sourceId:null, categories:[], restorePoint:null, receipt:null};
  a.route = spec.route || {name:'home'};
  if (a.route.manager) a.hydrated[a.route.manager] = {at:Date.now()};
  document.documentElement.setAttribute('data-motion', spec.reduced ? 'reduced' : 'full');
  a._motion = {cause:'audit-settle', direction:'lateral', stage:false, targetId:null};
  a.paint();
}"""

ANIMATIONS_JS = """() => {
  const rows = document.getAnimations({subtree:true}).map(a => {
    let timing = {};
    try { timing = a.effect && a.effect.getTiming ? a.effect.getTiming() : {}; } catch (_) {}
    const target = a.effect && a.effect.target;
    return {
      current: Number.isFinite(a.currentTime) ? a.currentTime : null,
      duration: typeof timing.duration === 'number' ? timing.duration : null,
      delay: typeof timing.delay === 'number' ? timing.delay : null,
      iterations: timing.iterations === Infinity ? 'infinite' : timing.iterations,
      playState: a.playState,
      pseudo: a.effect && a.effect.pseudoElement || null,
      target: target ? String(target.className || target.tagName || '').slice(0,100) : null
    };
  });
  const finite = rows.filter(x => typeof x.duration === 'number' && typeof x.delay === 'number');
  return {
    count: rows.length,
    maxDuration: finite.length ? Math.max(...finite.map(x => x.duration)) : 0,
    maxEnd: finite.length ? Math.max(...finite.map(x => x.duration + Math.max(0,x.delay))) : 0,
    infinite: rows.filter(x => x.iterations === 'infinite').length,
    rows
  };
}"""

@dataclass
class Hub:
    process: subprocess.Popen
    port: int
    log_path: Path

    def close(self) -> None:
        if self.process.poll() is None:
            self.process.terminate()
            try: self.process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                self.process.kill(); self.process.wait(timeout=3)
        try: self.log_path.unlink()
        except FileNotFoundError: pass


def start_hub() -> Hub:
    log = Path(tempfile.mktemp(prefix="pm-motion-hub-", suffix=".log"))
    fh = log.open("w", encoding="utf-8")
    proc = subprocess.Popen(
        [sys.executable, "-u", str(HUB_SERVER), "--port", "0", "--no-browser", "--no-runtime-state"],
        cwd=str(HUB_SERVER.parent), stdout=fh, stderr=subprocess.STDOUT, text=True,
        start_new_session=True,
    )
    port = None
    deadline = time.time() + 20
    while time.time() < deadline:
        fh.flush()
        text = log.read_text(encoding="utf-8", errors="replace") if log.exists() else ""
        match = re.search(r"http://127\.0\.0\.1:(\d+)/", text)
        if match:
            port = int(match.group(1)); break
        if proc.poll() is not None: break
        time.sleep(.05)
    fh.close()
    if port is None:
        try: proc.terminate()
        except Exception: pass
        raise RuntimeError(f"ConceptHub did not start: {log.read_text(errors='replace') if log.exists() else ''}")
    return Hub(proc, port, log)


def open_concept(page: Page, port: int, stem: str, width: int) -> None:
    page.set_viewport_size({"width": width, "height": 900})
    page.goto(f"http://127.0.0.1:{port}{BASE}/{stem}.html", wait_until="domcontentloaded", timeout=30_000)
    page.wait_for_selector("[data-pmv2-root]", timeout=15_000)
    page.wait_for_function("() => !!window.__pmv2App && !!window.PMv2", timeout=15_000)
    page.wait_for_timeout(750)


def reset(page: Page, route: dict[str, Any], reduced: bool = False) -> None:
    page.evaluate(RESET_JS, {"route": route, "reduced": reduced})
    page.wait_for_timeout(800 if not reduced else 80)
    page.evaluate("() => document.getAnimations({subtree:true}).forEach(a => { try { if (a.playState === 'finished') a.cancel(); } catch (_) {} })")


def capture_jpeg(page: Page, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(path), type="jpeg", quality=88, animations="allow", caret="hide", scale="css", timeout=20_000)


def image_stats(path: Path) -> dict[str, float]:
    im = Image.open(path).convert("RGB").resize((160, 112), Image.Resampling.BILINEAR)
    gray = im.convert("L")
    stat = ImageStat.Stat(gray)
    hist = gray.histogram(); total = sum(hist) or 1
    return {
        "mean_luma": stat.mean[0],
        "near_black_fraction": sum(hist[:8]) / total,
        "near_white_fraction": sum(hist[248:]) / total,
    }


def normalized_diff(a: Path, b: Path) -> float:
    ia = Image.open(a).convert("RGB").resize((160,112), Image.Resampling.BILINEAR)
    ib = Image.open(b).convert("RGB").resize((160,112), Image.Resampling.BILINEAR)
    return sum(ImageStat.Stat(ImageChops.difference(ia,ib)).mean) / (255.0 * 3.0)


def safe_name(value: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._-]+", "-", value).strip("-")


def make_title_frame(size: tuple[int,int], title: str, subtitle: str) -> Image.Image:
    im = Image.new("RGB", size, (18,20,26)); d = ImageDraw.Draw(im)
    try:
        big = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 34)
        small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 19)
    except Exception: big = small = ImageFont.load_default()
    d.text((42,size[1]//2-48),title,font=big,fill=(245,247,252))
    d.text((42,size[1]//2+4),subtitle,font=small,fill=(166,176,196))
    return im


def overlay_label(im: Image.Image, label: str, elapsed_ms: int) -> Image.Image:
    im = im.copy().convert("RGB"); d = ImageDraw.Draw(im,"RGBA")
    try: font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",15)
    except Exception: font=ImageFont.load_default()
    d.rounded_rectangle((12,12,min(im.width-12,510),42),radius=7,fill=(0,0,0,180))
    d.text((22,19),f"{label} · {elapsed_ms:+d} ms",font=font,fill=(255,255,255,255))
    return im


def capture_sequence(page: Page, output: Path, stem: str, name: str, action_js: str,
                     duration_ms: int, width: int = 1280, reduced: bool = False) -> dict[str, Any]:
    seq_dir = output / "raw" / safe_name(name)
    seq_dir.mkdir(parents=True, exist_ok=True)
    before = seq_dir / "before.jpg"; capture_jpeg(page,before)
    cdp = page.context.new_cdp_session(page)
    frames: list[dict[str,Any]] = []
    trigger_clock = 0.0

    def on_frame(params: dict[str,Any]) -> None:
        nonlocal frames
        received = time.perf_counter()
        try: cdp.send("Page.screencastFrameAck", {"sessionId": params["sessionId"]})
        except Exception: pass
        if trigger_clock <= 0: return
        idx=len(frames); path=seq_dir/f"frame-{idx:04d}.jpg"
        path.write_bytes(base64.b64decode(params["data"]))
        frames.append({"index":idx,"received":received,"elapsed_ms":round((received-trigger_clock)*1000,2),"path":str(path),"metadata":params.get("metadata",{})})

    cdp.on("Page.screencastFrame",on_frame)
    cdp.send("Page.startScreencast",{"format":"jpeg","quality":88,"maxWidth":width,"maxHeight":900,"everyNthFrame":1})
    page.wait_for_timeout(100)
    trigger_clock=time.perf_counter()
    page.evaluate(action_js)
    immediate=page.evaluate(ANIMATIONS_JS)
    page.wait_for_timeout(min(250,duration_ms))
    quarter=page.evaluate(ANIMATIONS_JS)
    if duration_ms>250: page.wait_for_timeout(duration_ms-250)
    final_anim=page.evaluate(ANIMATIONS_JS)
    cdp.send("Page.stopScreencast")
    page.wait_for_timeout(80)
    final=seq_dir/"final.jpg"; capture_jpeg(page,final)
    try: cdp.detach()
    except Exception: pass

    # Use only frames received from trigger onward. Append final still for an exact settled endpoint.
    if not frames:
        shutil.copy2(final,seq_dir/"frame-0000.jpg")
        frames=[{"index":0,"received":time.perf_counter(),"elapsed_ms":duration_ms,"path":str(seq_dir/"frame-0000.jpg"),"metadata":{}}]
    ordered=[before]+[Path(f["path"]) for f in frames]+[final]
    adjacent=[normalized_diff(ordered[i],ordered[i+1]) for i in range(len(ordered)-1)]
    stats=[image_stats(p) for p in ordered]
    endpoint_black=max(stats[0]["near_black_fraction"],stats[-1]["near_black_fraction"])
    endpoint_white=max(stats[0]["near_white_fraction"],stats[-1]["near_white_fraction"])
    flash_black=max(s["near_black_fraction"] for s in stats) > max(.92,endpoint_black+.35)
    flash_white=max(s["near_white_fraction"] for s in stats) > max(.92,endpoint_white+.35)
    final_diff=normalized_diff(Path(frames[-1]["path"]),final)
    intervals=[]
    for a,b in zip(frames,frames[1:]): intervals.append(b["elapsed_ms"]-a["elapsed_ms"])

    # Select actual compositor frames nearest requested wall-clock positions.
    sampled=[]
    targets=[0,40,80,160,240,360,520,760] if reduced else SAMPLE_TIMES
    for target in targets:
        f=min(frames,key=lambda x:abs(x["elapsed_ms"]-target))
        sampled.append({"target_ms":target,"actual_ms":f["elapsed_ms"],"path":f["path"]})

    route=page.evaluate("() => ({route:window.__pmv2App.route, query:window.__pmv2App.query, rootCause:document.querySelector('[data-pmv2-root]')?.dataset.motionCause, rootDirection:document.querySelector('[data-pmv2-root]')?.dataset.motionDirection})")
    max_end=max(immediate.get("maxEnd",0),quarter.get("maxEnd",0))
    pass_rules=(
        not flash_black and not flash_white and final_diff < .035 and
        immediate.get("infinite",0)==0 and quarter.get("infinite",0)==0 and
        (max_end <= 900 if not reduced else max_end <= 2)
    )
    return {
        "sequence":name,"width":width,"reduced":reduced,"duration_ms":duration_ms,
        "before":str(before),"final":str(final),"frames":frames,"sampled":sampled,
        "animation_snapshots":{"immediate":immediate,"quarter":quarter,"final":final_anim},
        "frame_analysis":{"frame_count":len(frames),"interval_ms":{"min":min(intervals) if intervals else None,"median":statistics.median(intervals) if intervals else None,"max":max(intervals) if intervals else None},"max_adjacent_diff":max(adjacent) if adjacent else 0,"settled_endpoint_diff":final_diff,"black_flash":flash_black,"white_flash":flash_white},
        "terminal_state":route,"pass":pass_rules,
    }


def set_copy_preview(page: Page) -> None:
    page.evaluate("""() => { const a=window.__pmv2App; a.openCopy(); a.copy.sourceId='northwind-docs'; a.copy.categories=(a.categories||[]).map(c=>c.id); a.copy.step='preview'; a._motion={cause:'audit-settle',direction:'lateral',stage:false,targetId:null}; a.paint(); }""")
    page.wait_for_timeout(800)


def run_concept(page: Page, port: int, stem: str, output: Path) -> dict[str,Any]:
    concept_dir=output/stem; concept_dir.mkdir(parents=True,exist_ok=True)
    open_concept(page,port,stem,1280)
    seqs=[]
    def cap(name,action,duration=1000,width=1280,reduced=False):
        print(f"  {stem}: {name}",flush=True)
        seqs.append(capture_sequence(page,concept_dir,stem,name,action,duration,width,reduced))

    reset(page,{"name":"home"}); cap("home-to-domain","() => window.__pmv2App.openPage('ai','accounts')")
    reset(page,{"name":"domain","domain":"ai","page":"accounts","section":"accounts"}); cap("domain-to-manager","() => window.__pmv2App.openManager('providers',{object:'anthropic',page:'overview'})")
    reset(page,{"name":"manager","domain":"ai","manager":"providers","page":"overview","object":"anthropic"}); cap("manager-tab-lateral","() => window.__pmv2App.navigate({name:'manager',domain:'ai',manager:'providers',page:'installations',object:'anthropic'},{cause:'tab',direction:'lateral'})",900)
    reset(page,{"name":"manager","domain":"ai","manager":"providers","page":"overview","object":"anthropic"}); cap("manager-object-lateral","() => window.__pmv2App.navigate({name:'manager',domain:'ai',manager:'providers',page:'overview',object:'openai'},{cause:'object',direction:'lateral'})",900)
    reset(page,{"name":"home"}); cap("search-dropdown","() => window.__pmv2App.setQuery('OpenAI')",700)
    reset(page,{"name":"home"}); page.evaluate("() => window.__pmv2App.setQuery('Theme')"); page.wait_for_timeout(450); cap("search-result-landing","() => window.__pmv2App.pickResult(window.__pmv2App.results[0].id)",1000)
    reset(page,{"name":"home"}); page.evaluate("() => {const a=window.__pmv2App;a.setQuery('Theme'); const id=a.results[0].id;a.pickResult(id)}"); page.wait_for_timeout(1000); cap("back-to-query","() => window.__pmv2App.back()",1000)
    first_id=page.evaluate("() => window.PMv2.productSettingIds[0]")
    reset(page,{"name":"all"}); cap("details-drawer-open",f"() => window.__pmv2App.openDetails({json.dumps(first_id)})",800)
    reset(page,{"name":"all"}); page.evaluate(f"() => window.__pmv2App.openDetails({json.dumps(first_id)})"); page.wait_for_timeout(700); cap("details-drawer-close","() => window.__pmv2App.closeDetails()",800)
    reset(page,{"name":"home"}); set_copy_preview(page); cap("copy-apply-to-receipt","() => window.__pmv2App.applyCopy()",1300)
    reset(page,{"name":"home"}); set_copy_preview(page); page.evaluate("() => window.__pmv2App.applyCopy()"); page.wait_for_timeout(900); cap("copy-rollback","() => window.__pmv2App.rollbackCopy()",800)
    # Narrow push transition uses a fresh viewport but the same concept document.
    page.set_viewport_size({"width":760,"height":900}); page.wait_for_timeout(300)
    reset(page,{"name":"home"}); cap("narrow-home-to-manager","() => window.__pmv2App.openManager('providers',{object:'anthropic',page:'overview'})",1000,760)
    page.set_viewport_size({"width":1280,"height":900}); page.wait_for_timeout(300)
    reset(page,{"name":"home"},True); cap("reduced-home-to-domain","() => window.__pmv2App.openPage('ai','accounts')",300,1280,True)
    reset(page,{"name":"all"},True); cap("reduced-details-drawer",f"() => window.__pmv2App.openDetails({json.dumps(first_id)})",300,1280,True)
    return {"stem":stem,"sequences":seqs,"pass":all(s["pass"] for s in seqs)}


def create_review_assets(output: Path, report: dict[str,Any]) -> None:
    try:
        label_font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",13)
        title_font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",20)
        tiny_font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",10)
    except Exception: label_font=title_font=tiny_font=ImageFont.load_default()
    for stem,concept in report["concepts"].items():
        seqs=concept["sequences"]
        # Two contact sheets, seven interactions each, eight actual compositor samples per row.
        for part,start in enumerate((0,7),1):
            group=seqs[start:start+7]; fw,fh=220,155; left=240; top=42
            canvas=Image.new("RGB",(left+fw*8,top+fh*len(group)),(17,19,24)); d=ImageDraw.Draw(canvas)
            d.text((12,10),f"{stem} · compositor motion review · part {part}",font=title_font,fill=(245,247,252))
            for ri,seq in enumerate(group):
                y=top+ri*fh
                status="PASS" if seq["pass"] else "FAIL"
                d.text((10,y+8),seq["sequence"],font=label_font,fill=(240,242,247))
                fa=seq["frame_analysis"]
                d.text((10,y+31),f"{fa['frame_count']} frames · settle {fa['settled_endpoint_diff']:.4f} · {status}",font=tiny_font,fill=(112,226,164) if seq["pass"] else (255,112,112))
                for ci,sample in enumerate(seq["sampled"]):
                    im=Image.open(sample["path"]).convert("RGB"); im.thumbnail((fw-4,fh-26),Image.Resampling.LANCZOS)
                    x=left+ci*fw
                    bg=Image.new("RGB",(fw-4,fh-26),(28,31,38)); bg.paste(im,((bg.width-im.width)//2,(bg.height-im.height)//2))
                    canvas.paste(bg,(x+2,y+21))
                    d.text((x+6,y+5),f"{sample['actual_ms']:.0f} ms",font=tiny_font,fill=(224,228,238))
            sheet=output/f"{stem}--motion-filmstrip-{part}.jpg"; canvas.save(sheet,quality=91,subsampling=1)
            concept.setdefault("review_assets",{})[f"filmstrip_{part}"]=str(sheet)

        # Build one actual-frame review reel per concept, 30fps. Raw compositor
        # frames are normalized and labeled; title slates separate interactions.
        video_frames=output/"video-frames"/stem; shutil.rmtree(video_frames,ignore_errors=True); video_frames.mkdir(parents=True)
        frame_no=0; target_size=(1280,900)
        for seq in seqs:
            title=make_title_frame(target_size,seq["sequence"],f"{stem} · {'reduced motion' if seq['reduced'] else 'full motion'}")
            for _ in range(18): title.save(video_frames/f"{frame_no:06d}.jpg",quality=90); frame_no+=1
            raw=seq["frames"]
            # Resample event frames to a nominal 30fps timeline using actual arrival times.
            duration=max(seq["duration_ms"],int(raw[-1]["elapsed_ms"] if raw else 0))
            for t in range(0,duration+1,33):
                f=min(raw,key=lambda x:abs(x["elapsed_ms"]-t))
                im=Image.open(f["path"]).convert("RGB")
                if im.size!=target_size:
                    bg=Image.new("RGB",target_size,(18,20,26)); im.thumbnail(target_size,Image.Resampling.LANCZOS); bg.paste(im,((1280-im.width)//2,(900-im.height)//2)); im=bg
                overlay_label(im,seq["sequence"],t).save(video_frames/f"{frame_no:06d}.jpg",quality=89); frame_no+=1
            final=Image.open(seq["final"]).convert("RGB")
            if final.size!=target_size:
                bg=Image.new("RGB",target_size,(18,20,26)); final.thumbnail(target_size,Image.Resampling.LANCZOS); bg.paste(final,((1280-final.width)//2,(900-final.height)//2)); final=bg
            for _ in range(12): overlay_label(final,seq["sequence"],duration).save(video_frames/f"{frame_no:06d}.jpg",quality=89); frame_no+=1
        mp4=output/f"{stem}--motion-review-reel.mp4"
        subprocess.run(["ffmpeg","-y","-hide_banner","-loglevel","error","-framerate","30","-i",str(video_frames/"%06d.jpg"),"-c:v","libx264","-preset","medium","-crf","23","-pix_fmt","yuv420p","-movflags","+faststart",str(mp4)],check=True)
        concept.setdefault("review_assets",{})["video"]=str(mp4)
        shutil.rmtree(video_frames,ignore_errors=True)


def main() -> int:
    ap=argparse.ArgumentParser(); ap.add_argument("--output",type=Path,required=True); ap.add_argument("--concept",action="append",choices=STEMS); ap.add_argument("--chromium",default=os.environ.get("PM_SETTINGS_CHROMIUM_BINARY","/usr/bin/chromium")); args=ap.parse_args()
    out=args.output.resolve(); shutil.rmtree(out,ignore_errors=True); out.mkdir(parents=True)
    hub=start_hub(); profile=Path(tempfile.mkdtemp(prefix="pm-motion-profile-"))
    report={"schema_id":"pm.settings.compositor_motion_audit.v1","started_at":time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),"chromium":args.chromium,"concepts":{}}
    try:
        with sync_playwright() as p:
            context=p.chromium.launch_persistent_context(str(profile),headless=True,executable_path=args.chromium,args=["--no-sandbox","--disable-gpu","--no-first-run","--no-default-browser-check"],viewport={"width":1280,"height":900})
            for stem in args.concept or STEMS:
                page=context.new_page(); errors=[]
                page.on("pageerror",lambda e:errors.append(f"pageerror: {e}"))
                page.on("console",lambda m:errors.append(f"console: {m.text}") if m.type=="error" else None)
                try: concept=run_concept(page,hub.port,stem,out); concept["errors"]=errors
                finally: page.close()
                concept["pass"]=concept["pass"] and not errors
                report["concepts"][stem]=concept
                (out/"partial-report.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
            context.close()
    finally:
        hub.close(); shutil.rmtree(profile,ignore_errors=True)
    create_review_assets(out,report)
    # Raw screencast frames are temporary. Evidence retains sampled filmstrips,
    # review reels, exact frame metrics, and endpoint stills only.
    for concept in report["concepts"].values():
        for seq in concept["sequences"]:
            raw_dir=Path(seq["before"]).parent
            keep={Path(seq["before"]).name,Path(seq["final"]).name}
            for sample in seq["sampled"]: keep.add(Path(sample["path"]).name)
            for p in raw_dir.glob("*.jpg"):
                if p.name not in keep: p.unlink()
            # Rewrite frame list to metadata only; no dangling raw paths.
            seq["frames"]=[{"index":f["index"],"elapsed_ms":f["elapsed_ms"],"metadata":f["metadata"]} for f in seq["frames"]]
    report["completed_at"]=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())
    report["summary"]={"concepts":len(report["concepts"]),"sequences":sum(len(c["sequences"]) for c in report["concepts"].values()),"frames_observed":sum(s["frame_analysis"]["frame_count"] for c in report["concepts"].values() for s in c["sequences"]),"pass":all(c["pass"] for c in report["concepts"].values()),"failures":[{"concept":stem,"sequence":s["sequence"]} for stem,c in report["concepts"].items() for s in c["sequences"] if not s["pass"]]}
    (out/"COMPOSITOR_MOTION_AUDIT.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
    print(json.dumps(report["summary"],indent=2))
    return 0 if report["summary"]["pass"] else 1

if __name__=="__main__": raise SystemExit(main())
