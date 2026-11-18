// R113 regressions run as rows of usage-hover-pause, on its selected looks and surfaces.
export async function r113Cases(t, f, label, park) {
	const records = [];
	for (const kind of String(t.args.r113Cases || 'live').split(',')) {
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
