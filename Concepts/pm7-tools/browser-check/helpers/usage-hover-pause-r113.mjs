// Main-behavior chart controls plus retained R113 lifecycle/roll/Live regressions, on selected looks and surfaces.
export async function r113Cases(t, f, label, park) {
	const records = [];
	for (const kind of String(t.args.r113Cases || 'live,plot,tooltip,handoff,compact,roll').split(',')) {
		if (kind === 'plot') { records.push(await plotLimit(t,f,label,park)); continue; }
		if (kind === 'tooltip') { records.push(await tooltipPause(t,f,label,park)); continue; }
		if (kind === 'handoff') { records.push(await gestureHandoff(t,f,label,park)); continue; }
		if (kind === 'compact') { records.push(await compactDonut(t,f,label,park)); continue; }
		if (kind === 'roll') { records.push(await neutralDonutRoll(t,f,label,park)); continue; }
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
			const read=()=>{const s=PMU.live.state();return {t:performance.now(),on:s.on,armed:s.armed,beats:s.beats,held:s.held,pending:s.pending,hovered:!!plot?.isConnected&&plot.matches(':hover'),hot:[...plot?.querySelectorAll('.pmu-col.is-hot-col')||[]].map(x=>x.dataset.i),readout:!!plot?.classList.contains('pmu-xh-on'),crosshair:PMU.charts.crosshairOn(),top:sc.scrollTop,op:b.getAttribute('data-op')};};
			const r=window.__uhpR113={pre:read(),wheels:[],scrolls:[],moves:0,ends:[],samples:[]};let pos=null;
			const wheel=e=>{pos=[e.clientX,e.clientY];r.wheels.push({t:performance.now(),trusted:e.isTrusted});};
			const scroll=()=>r.scrolls.push({t:performance.now(),top:sc.scrollTop});
			const move=e=>{if(pos&&(pos[0]!==e.clientX||pos[1]!==e.clientY))r.moves++;};
			const end=e=>{if(e.detail?.board===b)r.ends.push(performance.now());};
			sc.addEventListener('wheel',wheel,{passive:true});sc.addEventListener('scroll',scroll,{passive:true});document.addEventListener('pointermove',move,true);document.addEventListener('pmu-op-end',end);
			r.read=read;r.timer=setInterval(()=>r.samples.push(read()),500);
			r.stop=()=>{clearInterval(r.timer);sc.removeEventListener('wheel',wheel);sc.removeEventListener('scroll',scroll);document.removeEventListener('pointermove',move,true);document.removeEventListener('pmu-op-end',end);return {...r,timer:undefined,read:undefined,stop:undefined,after:read()};};
		});
		await t.page.mouse.wheel(0,1); await t.page.waitForTimeout(900);
		const returned=await f.evaluate(()=>window.__uhpR113.read());
		await t.page.waitForTimeout(14000);
		const rec=await f.evaluate(()=>window.__uhpR113.stop());records.push({kind,returned,rec});
		t.log(label+'R113 P6 Live columns: '+JSON.stringify({returned,rec}));
		await t.check(label+'R113 P6 could judge: Live on, trusted wheel and real scroll, stationary plot over successive beats',rec.pre.on&&returned.on&&returned.armed&&rec.wheels.length===1&&rec.wheels[0].trusted&&rec.ends.length===1&&!rec.moves&&returned.hovered&&rec.scrolls.length>0&&returned.top>rec.pre.top&&!returned.readout&&!returned.op&&rec.after.hovered&&rec.samples.length>=20,JSON.stringify({pre:rec.pre,returned,after:rec.after,wheels:rec.wheels,ends:rec.ends,moves:rec.moves}));
		await t.check(label+'R113 P6 main scroll dismissal leaves no restored column or crosshair and does not hold Live',!returned.crosshair&&!returned.hot.length&&rec.samples.filter(x=>x.t>=returned.t).every(x=>!x.crosshair&&!x.hot.length&&x.held!=='crosshair'),JSON.stringify({returned,held:rec.samples.map(x=>x.held)}));
		await t.check(label+'R113 P6 Live keeps flushing at least two natural beats under the still pointer',rec.after.beats>=returned.beats+2&&!rec.after.pending,`${returned.beats} -> ${rec.after.beats} flushed beats; held ${rec.after.held}, pending ${rec.after.pending}`);
		await park();await f.evaluate(on=>{if(!on)PMU.live.pause();},liveWasOn);
	}
	return records;
}

async function tooltipPause(t,f,label,park) {
	await park();
	const prior=await f.evaluate(()=>{const c=PM_HOVER_TAG_CONTROLLER,on=PMU.live.on(),tips=c.readVisualSetting();PMU.live.pause();PM12_KIMI.setSettingFromHost('general.interaction.show-tooltips',true);c.syncVisualSetting();PM7_USAGE.setRoomDetail('overview','glance');return {on,tips};});
	await t.page.waitForTimeout(4500);
	const records=[],target=f.locator('#pmuBoard .pmu-skycol[data-prov]').first();
	for(const phase of ['pending','shown','focus']) {
		await park();await f.evaluate(()=>{PM_HOVER_TAG_CONTROLLER.close(true);document.activeElement?.blur();document.getElementById('pmuScroll').scrollTop=0;});
		const box=await target.boundingBox(),pane=await f.locator('#pmuScroll').boundingBox();
		if(!box||!pane){await t.check(label+'R113 P2 '+phase+' could judge Skyline target',false);continue;}
		await t.page.mouse.move(box.x+box.width/2,(Math.max(box.y,pane.y)+Math.min(box.y+box.height,pane.y+pane.height))/2);
		if(phase==='focus'){await target.focus();await t.page.keyboard.press('Tab');await target.focus();}
		await t.page.waitForTimeout(phase==='pending'?1100:phase==='shown'?1900:1400);
		await f.evaluate(phase=>{
			const c=PM_HOVER_TAG_CONTROLLER,b=document.getElementById('pmuBoard'),sc=document.getElementById('pmuScroll');
			const read=()=>{const tag=c.tag,open=!!tag&&!tag.hidden&&tag.getAttribute('data-open')==='true';return {t:performance.now(),op:b.getAttribute('data-op'),top:sc.scrollTop,enabled:c.visualEnabled,hovered:!!b.querySelector('.pmu-skycol:hover'),pending:c.pendingOpenSource,pendingHere:!!c.pendingOpenTarget&&b.contains(c.pendingOpenTarget),dwell:c.pendingPointerIntent?performance.now()-c.pendingPointerIntent.entered_at:null,activeHere:!!c.active&&b.contains(c.active),pointer:open&&tag.getAttribute('data-source')==='pointer',focus:open&&tag.getAttribute('data-source')==='focus'};};
			const r=window.__uhpR113={phase,pre:read(),frames:[],wheels:[],moves:0,ends:[]};let running=true,pos=null;
			const wheel=e=>{pos=[e.clientX,e.clientY];r.wheels.push({t:performance.now(),trusted:e.isTrusted});};
			const move=e=>{if(pos&&(pos[0]!==e.clientX||pos[1]!==e.clientY))r.moves++;};
			const end=e=>{if(e.detail?.board===b)r.ends.push(performance.now());};
			const frame=()=>{if(!running)return;r.frames.push(read());requestAnimationFrame(frame);};
			sc.addEventListener('wheel',wheel,{passive:true});document.addEventListener('pointermove',move,true);document.addEventListener('pmu-op-end',end);requestAnimationFrame(frame);
			r.stop=()=>{running=false;sc.removeEventListener('wheel',wheel);document.removeEventListener('pointermove',move,true);document.removeEventListener('pmu-op-end',end);return {...r,stop:undefined,after:read()};};
		},phase);
		for(let i=0;i<18;i++){await t.page.mouse.wheel(0,-1);await t.page.waitForTimeout(30);}
		await t.page.waitForTimeout(900);
		const rec=await f.evaluate(()=>window.__uhpR113.stop()),p=rec.pre,a=rec.after,held=rec.frames.filter(x=>x.t>=rec.wheels[0]?.t+50);records.push(rec);
		t.log(label+'R113 P2 '+phase+': '+JSON.stringify(rec));
		const ready=phase==='pending'?p.pending==='pointer'&&p.pendingHere&&p.dwell>=1000&&p.dwell<1600&&!p.pointer:phase==='shown'?p.pointer&&p.activeHere:p.focus&&p.activeHere;
		await t.check(label+'R113 P2 '+phase+' could judge: real tooltip state, trusted top-limit wheel hold and stationary provider',ready&&p.enabled&&p.hovered&&p.top===0&&a.hovered&&a.top===0&&!rec.moves&&rec.wheels.length===18&&rec.wheels.every(x=>x.trusted)&&held.length>=10&&!rec.ends.length&&held.every(x=>!x.op&&!x.top)&&!a.op,JSON.stringify({pre:p,after:a,frames:held.length,wheels:rec.wheels.length,moves:rec.moves,ends:rec.ends}));
		await t.check(label+'R113 P2 '+phase+' tooltip retains main behavior at a scroll limit',held.length>=10&&(phase==='focus'?held.every(x=>x.focus)&&a.focus:phase==='shown'?held.every(x=>x.pointer)&&a.pointer:held.some(x=>x.pointer)&&a.pointer&&a.pending!=='pointer'),`${held.filter(x=>phase==='focus'?!x.focus:phase==='shown'?!x.pointer:false).length}/${held.length} wrong tooltip samples; after ${JSON.stringify(a)}`);
	}
	await park();await f.evaluate(prior=>{PM_HOVER_TAG_CONTROLLER.close(true);document.activeElement?.blur();PM12_KIMI.setSettingFromHost('general.interaction.show-tooltips',prior.tips);if(prior.on)PMU.live.resume();},prior);
	return {kind:'tooltip',records};
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
		const frame=()=>{if(!running)return;r.frames.push(read());requestAnimationFrame(frame);};
		sc.addEventListener('wheel',wheel,{passive:true});document.addEventListener('pointermove',move,true);document.addEventListener('pmu-op-end',end);requestAnimationFrame(frame);
		r.stop=()=>{running=false;sc.removeEventListener('wheel',wheel);document.removeEventListener('pointermove',move,true);document.removeEventListener('pmu-op-end',end);return {...r,stop:undefined,after:read()};};
	});
	for(let i=0;i<18;i++){await t.page.mouse.wheel(0,-1);await t.page.waitForTimeout(30);}
	await t.page.waitForTimeout(900);
	const rec=await f.evaluate(()=>window.__uhpR113.stop()),p=rec.pre,a=rec.after,held=rec.frames.filter(x=>x.t>=rec.wheels[0]?.t+50);
	t.log(label+'R113 P1 plot at limit: '+JSON.stringify(rec));
	await t.check(label+'R113 P1 could judge: open area readout/crosshair/band/dots, trusted wheel hold at top, still hovered pointer',p.xh>0&&p.band>0&&p.dots>0&&p.readout>0&&p.hovered&&p.top===0&&a.hovered&&a.top===0&&!rec.moves&&rec.wheels.length===18&&rec.wheels.every(x=>x.trusted)&&held.length>=10&&!rec.ends.length&&held.every(x=>!x.op&&!x.top)&&!a.op,JSON.stringify({pre:p,after:a,frames:held.length,wheels:rec.wheels.length,ends:rec.ends,moves:rec.moves}));
	const unchanged=x=>x.xh===p.xh&&x.band===p.band&&x.dots===p.dots&&x.readout===p.readout&&x.cold===p.cold;
	await t.check(label+'R113 P1 main readout, crosshair, band, dots and series emphasis stay unchanged at the wheel limit',held.length>=10&&held.every(unchanged),`${held.filter(x=>!unchanged(x)).length}/${held.length} changed plot samples`);
	await t.check(label+'R113 P1 plot stays open after hold with no synthetic dismissal or restoration',unchanged(a),JSON.stringify(a));
	await park();await f.evaluate(on=>{PMU.board.reset('room');if(on)PMU.live.resume();},on);await t.page.waitForTimeout(1800);
	return {kind:'plot',rec};
}

async function gestureHandoff(t,f,label,park) {
	await park();
	const on=await f.evaluate(()=>{const on=PMU.live.on();PMU.live.pause();PM7_USAGE.setRoomDetail('overview','glance');return on;});
	await t.page.waitForTimeout(4500);
	const records=[],cdp=await t.page.context().newCDPSession(t.page);
	try {
		for(const [key,mode] of [['m','move'],['r','resize']]) {
			for(let attempt=0;attempt<3;attempt++) {
				await park();await f.evaluate(()=>{document.activeElement?.blur();document.getElementById('pmuScroll').scrollTop=0;});
				await f.locator('#pmuBoard > .pmu-card[data-widget="health"]').focus();
				const target=f.locator('#pmuBoard .pmu-skycol[data-prov]').first(),box=await target.boundingBox(),pane=await f.locator('#pmuScroll').boundingBox();
				if(!box||!pane){await t.check(label+'R113 P3 '+mode+' could judge Skyline point',false);break;}
				const at={x:box.x+box.width/2,y:(Math.max(box.y,pane.y)+Math.min(box.y+box.height,pane.y+pane.height))/2};
				await t.page.mouse.move(at.x,at.y);await t.page.keyboard.press(key);await t.page.waitForTimeout(400);
				await f.evaluate(()=>{
					const b=document.getElementById('pmuBoard'),sc=document.getElementById('pmuScroll');
					const read=()=>({t:performance.now(),op:b.getAttribute('data-op'),gesture:PMU.board.gesture(),top:sc.scrollTop});
					const r=window.__uhpR113={pre:read(),keys:[],wheels:[],starts:[],ends:[],moves:0};
					let pos=null;
					const capture=e=>{pos=[e.clientX,e.clientY];r.wheels.push({...read(),trusted:e.isTrusted});};
					const wheelDone=()=>{if(r.wheels.length)r.wheels.at(-1).afterWheel=read();};
					const scroll=()=>{if(r.wheels.length)r.wheels.at(-1).after=read();};
					const key=e=>{if(e.key==='Escape')r.keys.push({t:performance.now(),trusted:e.isTrusted});};
					const start=e=>{if(e.detail?.board===b)r.starts.push(read());};
					const end=e=>{if(e.detail?.board===b)r.ends.push(read());};
					const move=e=>{if(pos&&(pos[0]!==e.clientX||pos[1]!==e.clientY))r.moves++;};
					sc.addEventListener('wheel',capture,{capture:true,passive:true});sc.addEventListener('wheel',wheelDone,{passive:true});sc.addEventListener('scroll',scroll,{passive:true});document.addEventListener('keydown',key,true);document.addEventListener('pointermove',move,true);document.addEventListener('pmu-op-start',start);document.addEventListener('pmu-op-end',end);
					r.stop=()=>{sc.removeEventListener('wheel',capture,true);sc.removeEventListener('wheel',wheelDone);sc.removeEventListener('scroll',scroll);document.removeEventListener('keydown',key,true);document.removeEventListener('pointermove',move,true);document.removeEventListener('pmu-op-start',start);document.removeEventListener('pmu-op-end',end);return {...r,stop:undefined,after:read()};};
				});
				// Queue both trusted inputs together. The authored component check covers the narrow idle-marker race;
				// here the wheel must take over once the gesture is released, even if idle cleanup ran already.
				await Promise.all([
					cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27}),
					cdp.send('Input.dispatchMouseEvent',{type:'mouseWheel',x:at.x,y:at.y,deltaX:0,deltaY:1})
				]);
				await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
				await t.page.waitForTimeout(900);
				const rec=await f.evaluate(()=>window.__uhpR113.stop());records.push({mode,attempt,rec});
				const w=rec.wheels[0],k=rec.keys[0],qualified=rec.pre.gesture?.kb&&rec.pre.gesture.type===mode&&rec.pre.op===mode&&rec.wheels.length===1&&w.trusted&&k?.trusted&&k.t<=w.t&&!w.gesture&&!rec.moves&&w.top===0&&rec.after.top>0&&!rec.after.gesture&&!rec.after.op;
				t.log(label+'R113 P3 '+mode+' attempt '+(attempt+1)+': '+JSON.stringify(rec));
				if(!qualified&&attempt<2)continue;
				await t.check(label+'R113 P3 '+mode+' could judge: trusted gesture release followed by real wheel-driven pane movement',qualified,JSON.stringify(rec));
				const began=rec.starts[0], ended=rec.ends[0];
				await t.check(label+'R113 P3 '+mode+' first effective wheel after gesture release starts and ends one pause',
					qualified&&rec.starts.length===1&&began.op==='wheel'&&began.top===w.top&&
					w.afterWheel?.op==='wheel'&&w.after?.op==='wheel'&&w.after.top>w.top&&
					rec.ends.length===1&&ended.t>w.after.t&&!ended.op&&!ended.gesture,JSON.stringify(rec));
				break;
			}
		}
	} finally {await cdp.detach();await park();await f.evaluate(on=>{document.activeElement?.blur();if(on)PMU.live.resume();},on);}
	return {kind:'handoff',records};
}

async function compactDonut(t,f,label,park) {
	await park();const on=await f.evaluate(()=>{const on=PMU.live.on();PMU.live.pause();PM7_USAGE.setRoomDetail('analytics','diagnostics');return on;});await t.page.waitForTimeout(4500);
	await f.evaluate(()=>PMU.board.resize('an-model-donut',{w:6,h:10}));await t.page.waitForTimeout(1800);
	const target=f.locator('#pmuBoard [data-widget="an-model-donut"] .pmu-dl-row[data-i="0"]');await target.scrollIntoViewIfNeeded();await t.page.waitForTimeout(500);
	const box=await target.boundingBox(),pane=await f.locator('#pmuScroll').boundingBox();
	if(!box||!pane){await t.check(label+'R113 P5 could judge compact first model',false);return null;}
	await t.page.mouse.move(box.x+box.width/2,(Math.max(box.y,pane.y)+Math.min(box.y+box.height,pane.y+pane.height))/2);await t.page.waitForTimeout(800);
	await f.evaluate(()=>{
		const b=document.getElementById('pmuBoard'),sc=document.getElementById('pmuScroll'),chart=b.querySelector('[data-widget="an-model-donut"] .pmu-c-donut');
		const read=()=>({t:performance.now(),op:b.getAttribute('data-op'),hovered:chart.querySelector('.pmu-dl-row[data-i="0"]').matches(':hover'),footer:chart.querySelectorAll('.pmu-dl-row.is-rest').length,index:chart.querySelector('.pmu-dl-row[data-i]:hover')?.getAttribute('data-i'),hot:[...chart.querySelectorAll('.pmu-dl-row.is-hot')].map(x=>({index:x.getAttribute('data-i'),footer:x.classList.contains('is-rest')})),dim:[...chart.querySelectorAll('path[data-mark="arc"].is-dim')].map(x=>x.dataset.i),arcs:[...chart.querySelectorAll('path[data-mark="arc"]')].map(x=>x.dataset.i),value:chart.querySelector('.pmu-dc-v')?.textContent,caption:chart.querySelector('.pmu-dc-c')?.textContent});
		const r=window.__uhpR113={pre:read(),neutral:chart._pmuChart._dh,frames:[],wheels:[],moves:0,ends:[]};let pos=null,running=true;
		const wheel=e=>{pos=[e.clientX,e.clientY];r.wheels.push({t:performance.now(),trusted:e.isTrusted});};
		const move=e=>{if(pos&&(pos[0]!==e.clientX||pos[1]!==e.clientY))r.moves++;};const end=e=>{if(e.detail?.board===b)r.ends.push(performance.now());};
		const frame=()=>{if(!running)return;r.frames.push(read());requestAnimationFrame(frame);};
		sc.addEventListener('wheel',wheel,{passive:true});document.addEventListener('pointermove',move,true);document.addEventListener('pmu-op-end',end);requestAnimationFrame(frame);
		r.stop=()=>{running=false;sc.removeEventListener('wheel',wheel);document.removeEventListener('pointermove',move,true);document.removeEventListener('pmu-op-end',end);return {...r,neutral:{value:r.neutral.centreVal,caption:r.neutral.centreCap},stop:undefined,after:read()};};
	});
	for(let i=0;i<18;i++){await t.page.mouse.wheel(0,i%2?-1:1);await t.page.waitForTimeout(30);}await t.page.waitForTimeout(900);
	const rec=await f.evaluate(()=>window.__uhpR113.stop()),p=rec.pre,a=rec.after,held=rec.frames.filter(x=>x.t>=rec.wheels[0]?.t+50);
	t.log(label+'R113 P5 compact donut: '+JSON.stringify(rec));
	await t.check(label+'R113 P5 could judge: supported compact donut has aggregate footer and applied first-model selection; trusted still-pointer wheel holds complete',p.footer===1&&p.index==='0'&&p.hovered&&p.hot.length>0&&p.dim.length>0&&p.value!==rec.neutral.value&&a.hovered&&!rec.moves&&rec.wheels.length===18&&rec.wheels.every(x=>x.trusted)&&held.length>=10&&rec.ends.length>=1&&rec.ends.at(-1)>rec.wheels.at(-1)?.t&&!a.op,JSON.stringify({pre:p,after:a,frames:held.length,wheels:rec.wheels.length,ends:rec.ends,moves:rec.moves}));
	const identity=x=>x.index!=null&&x.hot.length===1&&x.hot.every(r=>!r.footer&&r.index===x.index)&&x.dim.length===x.arcs.length-1&&x.dim.every(i=>i!==x.index);
	await t.check(label+'R113 P5 ordinary entry selects only its indexed model and leaves the aggregate footer neutral',identity(p),JSON.stringify(p));
	await t.check(label+'R113 P5 main model selection remains indexed and unchanged throughout the wheel hold',held.length>=10&&held.every(x=>identity(x)&&x.value===p.value&&x.caption===p.caption),`${held.filter(x=>!identity(x)||x.value!==p.value||x.caption!==p.caption).length}/${held.length} changed or wrong-index samples`);
	await t.check(label+'R113 P5 selected model and neutral footer remain unchanged after hold without chart restoration',identity(a)&&a.value===p.value&&a.caption===p.caption,JSON.stringify(a));
	await park();await f.evaluate(on=>{PMU.board.reset('room');if(on)PMU.live.resume();},on);await t.page.waitForTimeout(1800);
	return {kind:'compact',rec};
}

async function neutralDonutRoll(t,f,label,park) {
	if(await f.evaluate(()=>PMU.motion.reduced())){t.log(label+'R113 P7 SKIP number-roll race under Reduced Motion: its centre is already final.');return {kind:'roll',skipped:'Reduced Motion has no number roll'};}
	// R115 T1/R116 T3: this is specifically a digit-strip identity race. NieR never renders those strips.
	if(await f.evaluate(()=>PMU.motion.family()==='nier')){const reason='NieR uses glyph decode (or a text swap without a GPU), with no digit strips or subtree Web Animations';t.log(label+'R113 P7 SKIP digit-strip race: '+reason+'.');return {kind:'roll',skipped:reason};}
	await park();const on=await f.evaluate(()=>{const on=PMU.live.on();PMU.live.pause();PM7_USAGE.setRoomDetail('analytics','diagnostics');return on;});await t.page.waitForTimeout(4500);
	await f.evaluate(()=>{const b=PMU.board;b.visible().filter(x=>!['token-trend','an-model-donut'].includes(x)).forEach(x=>b.setVisible(x,false));b.resize('token-trend',{w:6,h:10});b.resize('an-model-donut',{w:6,h:10});b.move('token-trend',{x:0,y:0});b.move('an-model-donut',{x:6,y:0});});await t.page.waitForTimeout(1800);
	await f.evaluate(()=>{document.getElementById('pmuScroll').scrollTop=0;});
	const peer=f.locator('#pmuBoard > [data-widget="token-trend"] .pmu-cardhead'),box=await peer.boundingBox();
	if(!box){await t.check(label+'R113 P7 could judge neighboring card',false);return null;}
	await t.page.mouse.move(box.x+box.width/2,box.y+box.height/2);
	await f.evaluate(()=>PMU.board.setVisible('an-model-donut',false));await t.page.waitForTimeout(700);
	await f.evaluate(()=>{
		const sc=document.getElementById('pmuScroll'),b=document.getElementById('pmuBoard');
		const read=()=>{const cv=b.querySelector('[data-widget="an-model-donut"] .pmu-dc-v'),chart=cv?.closest('.pmu-c-donut');const anims=cv?[...cv.getAnimations({subtree:true})].filter(a=>a.playState==='running'):[];return {t:performance.now(),strips:cv?.querySelectorAll('.pmu-odo-s').length||0,running:anims.length,remaining:Math.max(0,...anims.map(a=>{const s=a.effect.getTiming();return Number(s.delay)+Number(s.duration)-Number(a.currentTime);})),hot:chart?.querySelectorAll('path.is-dim,.pmu-dl-row.is-hot').length||0,donutHovered:!!chart?.matches(':hover'),op:b.getAttribute('data-op'),live:PMU.live.on()};};
		const r=window.__uhpR113={wheels:[],moves:0};let pos=null,strip=null;
		const capture=e=>{pos=[e.clientX,e.clientY];const cv=b.querySelector('[data-widget="an-model-donut"] .pmu-dc-v');strip=cv?.querySelector('.pmu-odo-s');r.wheels.push({trusted:e.isTrusted,card:e.target.closest('.pmu-card')?.dataset.widget,before:read()});};
		const bubble=()=>{const cv=b.querySelector('[data-widget="an-model-donut"] .pmu-dc-v');r.wheels.at(-1).after={...read(),sameStrip:!!strip&&cv?.contains(strip)};};
		const move=e=>{if(pos&&(pos[0]!==e.clientX||pos[1]!==e.clientY))r.moves++;};
		sc.addEventListener('wheel',capture,{capture:true,passive:true});sc.addEventListener('wheel',bubble,{passive:true});document.addEventListener('pointermove',move,true);
		r.stop=()=>{sc.removeEventListener('wheel',capture,true);sc.removeEventListener('wheel',bubble);document.removeEventListener('pointermove',move,true);return {...r,stop:undefined,after:read()};};
	});
	await f.evaluate(()=>PMU.board.setVisible('an-model-donut',true));
	// Settle the card/legend entrance first. Reproduce its authored centre-roll path independently: a quiet entrance
	// legitimately has no roll, and motion of the entering card must not satisfy the number's painted-motion verdict.
	await t.page.waitForTimeout(1800);
	await f.evaluate(()=>{const chart=document.querySelector('#pmuBoard [data-widget="an-model-donut"] .pmu-c-donut')._pmuChart,cv=chart.el.querySelector('.pmu-dc-v');cv.removeAttribute('data-shown');PMU.charts.roll(cv,chart._centreNum,chart._centreFmt,{dur:1000,delay:300});});
	await f.waitForFunction(()=>{const cv=document.querySelector('#pmuBoard [data-widget="an-model-donut"] .pmu-dc-v');return !!cv?.querySelector('.pmu-odo-s')&&cv.getAnimations({subtree:true}).some(a=>a.playState==='running');},null,{timeout:5000}).catch(()=>{});
	await t.page.mouse.wheel(0,-1);
	const centre=f.locator('#pmuBoard [data-widget="an-model-donut"] .pmu-dc-v');
	// Let the wheel's outgoing/returning card lights settle too; the delayed number roll is still running afterward.
	await t.page.waitForTimeout(400);
	await t.moving(centre,label+'R113 P7 neutral centre retains painted number-roll motion after wheel',{ms:300,count:5,scroll:false});
	await t.page.waitForTimeout(900);
	const rec=await f.evaluate(()=>window.__uhpR113.stop()),w=rec.wheels[0];t.log(label+'R113 P7 neutral roll: '+JSON.stringify(rec));
	await t.check(label+'R113 P7 could judge: authored centre roll after settled add, no selection, trusted neighbor wheel and still pointer',rec.wheels.length===1&&w.trusted&&w.card==='token-trend'&&w.before.strips>0&&w.before.running>0&&w.before.remaining>=900&&!w.before.hot&&!w.before.donutHovered&&!w.before.live&&!rec.moves,JSON.stringify(rec));
	await t.check(label+'R113 P7 wheel at the limit preserves the neutral donut digit strip and its running roll',!w?.after.op&&w.after.sameStrip&&w.after.strips>0&&w.after.running>0,JSON.stringify(w));
	await park();await f.evaluate(on=>{PMU.board.reset('room');if(on)PMU.live.resume();},on);await t.page.waitForTimeout(1800);
	return {kind:'roll',rec};
}
