// R113 regressions run as rows of usage-hover-pause, on its selected looks and surfaces.
export async function r113Cases(t, f, label, park) {
	const records = [];
	for (const kind of String(t.args.r113Cases || 'live,plot').split(',')) {
		if (kind === 'plot') { records.push(await plotLimit(t,f,label,park)); continue; }
		if (kind !== 'live') throw new Error('Unknown R113 case: ' + kind);
		await park();
		const liveWasOn = await f.evaluate(() => { const on=PMU.live.on(); PMU.live.resume(); PM7_USAGE.setRoomDetail('costs','diagnostics'); return on; });
		await t.page.waitForTimeout(4500);
		const target=f.locator('#pmuBoard .pmu-colsplot .pmu-col:not(.is-zero)').first();
		await target.scrollIntoViewIfNeeded(); await t.page.waitForTimeout(500);
		const box=await target.boundingBox(), pane=await f.locator('#pmuScroll').boundingBox();
		if (!box || !pane) { await t.check(label+'R113 P6 could judge a visible column',false); continue; }
		await t.page.mouse.move(box.x+box.width/2,(Math.max(box.y,pane.y)+Math.min(box.y+box.height,pane.y+pane.height))/2);
		await t.page.waitForTimeout(800);
		await f.evaluate(() => {
			const sc=document.getElementById('pmuScroll'), b=document.getElementById('pmuBoard'), plot=b.querySelector('.pmu-colsplot:hover');
			const read=()=>{const s=PMU.live.state();return {t:performance.now(),on:s.on,armed:s.armed,beats:s.beats,held:s.held,pending:s.pending,hovered:!!plot?.isConnected&&plot.matches(':hover'),hot:[...plot?.querySelectorAll('.pmu-col.is-hot-col')||[]].map(x=>x.dataset.i),readout:!!plot?.classList.contains('pmu-xh-on'),crosshair:PMU.charts.crosshairOn(),op:b.getAttribute('data-op')};};
			const r=window.__uhpR113={pre:read(),wheels:[],moves:0,ends:[],samples:[]};let pos=null;
			const wheel=e=>{pos=[e.clientX,e.clientY];r.wheels.push({t:performance.now(),trusted:e.isTrusted});};
			const move=e=>{if(pos&&(pos[0]!==e.clientX||pos[1]!==e.clientY))r.moves++;};
			const end=e=>{if(e.detail?.board===b)r.ends.push(performance.now());};
			sc.addEventListener('wheel',wheel,{passive:true});document.addEventListener('pointermove',move,true);document.addEventListener('pmu-op-end',end);
			r.read=read;r.timer=setInterval(()=>r.samples.push(read()),500);
			r.stop=()=>{clearInterval(r.timer);sc.removeEventListener('wheel',wheel);document.removeEventListener('pointermove',move,true);document.removeEventListener('pmu-op-end',end);return {...r,timer:undefined,read:undefined,stop:undefined,after:read()};};
		});
		await t.page.mouse.wheel(0,1); await t.page.waitForTimeout(900);
		const returned=await f.evaluate(()=>window.__uhpR113.read());
		await t.page.waitForTimeout(14000);
		const rec=await f.evaluate(()=>window.__uhpR113.stop());records.push({kind,returned,rec});
		t.log(label+'R113 P6 Live columns: '+JSON.stringify({returned,rec}));
		await t.check(label+'R113 P6 could judge: Live on, trusted wheel, index-only column return, stationary hovered plot over successive beats',rec.pre.on&&returned.on&&returned.armed&&rec.wheels.length===1&&rec.wheels[0].trusted&&rec.ends.length===1&&!rec.moves&&returned.hovered&&returned.hot.length===1&&!returned.readout&&!returned.op&&rec.after.hovered&&rec.samples.length>=20,JSON.stringify({pre:rec.pre,returned,after:rec.after,wheels:rec.wheels,ends:rec.ends,moves:rec.moves}));
		await t.check(label+'R113 P6 index-only emphasis never holds Live as an open crosshair',!returned.crosshair&&rec.samples.filter(x=>x.t>=returned.t).every(x=>!x.crosshair&&x.held!=='crosshair'),JSON.stringify({returned,held:rec.samples.map(x=>x.held)}));
		await t.check(label+'R113 P6 Live keeps flushing at least two natural beats under the still pointer',rec.after.beats>=returned.beats+2&&!rec.after.pending,`${returned.beats} -> ${rec.after.beats} flushed beats; held ${rec.after.held}, pending ${rec.after.pending}`);
		await park();await f.evaluate(on=>{if(!on)PMU.live.pause();},liveWasOn);
	}
	return records;
}

async function plotLimit(t,f,label,park) {
	await park();
	const on=await f.evaluate(()=>{const on=PMU.live.on();PMU.live.pause();PM7_USAGE.setRoomDetail('analytics','diagnostics');return on;});
	await t.page.waitForTimeout(4500);
	await f.evaluate(()=>{const b=PMU.board;b.visible().filter(x=>x!=='token-trend').forEach(x=>b.setVisible(x,false));b.resize('token-trend',{w:b.cls().tracks,h:16});});
	await t.page.waitForTimeout(1800);
	await f.evaluate(()=>{document.getElementById('pmuScroll').scrollTop=0;});
	const plot=f.locator('#pmuBoard .pmu-card[data-widget="token-trend"] .pmu-plotbox');
	const box=await plot.boundingBox(),pane=await f.locator('#pmuScroll').boundingBox();
	if (!box||!pane) { await t.check(label+'R113 P1 could judge full-size Token volume plot',false);return null; }
	await t.page.mouse.move(box.x+box.width*.55,Math.min(pane.y+pane.height-20,box.y+box.height*.4));
	await t.page.waitForTimeout(800);
	await f.evaluate(()=>{
		const b=document.getElementById('pmuBoard'),sc=document.getElementById('pmuScroll'),plot=b.querySelector('[data-widget="token-trend"] .pmu-plotbox'),chart=plot.closest('.pmu-chart');
		const read=()=>({t:performance.now(),op:b.getAttribute('data-op'),top:sc.scrollTop,hovered:plot.matches(':hover'),xh:plot.querySelectorAll('.pmu-xh.is-on').length,band:plot.querySelectorAll('.pmu-xband.is-on').length,dots:plot.querySelectorAll('.pmu-xdot.is-on').length,readout:document.querySelectorAll('.pmu-readout.is-on').length,cold:chart.querySelectorAll('.is-cold').length});
		const r=window.__uhpR113={pre:read(),wheels:[],moves:0,frames:[],ends:[]};let running=true,pos=null;
		const wheel=e=>{pos=[e.clientX,e.clientY];r.wheels.push({t:performance.now(),trusted:e.isTrusted});};
		const move=e=>{if(pos&&(pos[0]!==e.clientX||pos[1]!==e.clientY))r.moves++;};
		const end=e=>{if(e.detail?.board===b)r.ends.push(performance.now());};
		const frame=()=>{if(!running)return;if(b.getAttribute('data-op')==='wheel')r.frames.push(read());requestAnimationFrame(frame);};
		sc.addEventListener('wheel',wheel,{passive:true});document.addEventListener('pointermove',move,true);document.addEventListener('pmu-op-end',end);requestAnimationFrame(frame);
		r.stop=()=>{running=false;sc.removeEventListener('wheel',wheel);document.removeEventListener('pointermove',move,true);document.removeEventListener('pmu-op-end',end);return {...r,stop:undefined,after:read()};};
	});
	for(let i=0;i<18;i++){await t.page.mouse.wheel(0,-1);await t.page.waitForTimeout(30);}
	await t.page.waitForTimeout(900);
	const rec=await f.evaluate(()=>window.__uhpR113.stop()),p=rec.pre,a=rec.after,held=rec.frames.filter(x=>x.t>=rec.wheels[0]?.t+50);
	t.log(label+'R113 P1 plot at limit: '+JSON.stringify(rec));
	await t.check(label+'R113 P1 could judge: open area readout/crosshair/band/dots, trusted wheel hold at top, still hovered pointer',p.xh>0&&p.band>0&&p.dots>0&&p.readout>0&&p.hovered&&p.top===0&&a.hovered&&a.top===0&&!rec.moves&&rec.wheels.length===18&&rec.wheels.every(x=>x.trusted)&&held.length>=10&&rec.ends.length===1&&!a.op,JSON.stringify({pre:p,after:a,frames:held.length,wheels:rec.wheels.length,ends:rec.ends,moves:rec.moves}));
	const quiet=x=>!x.xh&&!x.band&&!x.dots&&!x.readout&&!x.cold;
	await t.check(label+'R113 P1 wheel clears every plot part and series emphasis through the complete hold',held.length>=10&&held.every(quiet),`${held.filter(x=>!quiet(x)).length}/${held.length} lit samples`);
	await t.check(label+'R113 P1 area readout stays dismissed after return; index-only restoration remains column-only',quiet(a),JSON.stringify(a));
	await park();await f.evaluate(on=>{PMU.board.reset('room');if(on)PMU.live.resume();},on);await t.page.waitForTimeout(1800);
	return {kind:'plot',rec};
}
