// Read-only K19 trace: preserve every product assertion, capture the motion
// envelope beside the proposed previous anchor, and tag the native film.
import { tests } from '../checks/stage-keepoff.check.mjs';

export default async function (t) {
	if (String(t.args.sandbox) !== '0' || t.args.only !== 'begin') throw Error('Use sandbox=0 only=begin for the declared K19 proof');
	const open = t.app.open.bind(t.app);
	let namespace = 0;
	t.app.open = async (...args) => {
		const f = await open(...args);
		await f.evaluate((base) => {
			const tag = document.createElement('i');
			tag.style.cssText = 'position:fixed;left:0;top:0;width:168px;height:8px;contain:strict;z-index:2147483647;pointer-events:none';
			window.__k19Base = base;
			window.__k19Cells = Array.from({ length: 42 }, (_, i) => {
				const c = document.createElement('b');
				c.style.cssText = `position:absolute;left:${i * 4}px;top:0;width:4px;height:8px;background:#808080`;
				tag.append(c); return c;
			});
			document.documentElement.append(tag);
		}, namespace++ * 10000);
		const evaluate = f.evaluate.bind(f);
		f.evaluate = async (code, ...rest) => {
			if (typeof code !== 'function' || code.name !== 'sampler') return evaluate(code, ...rest);
			let source = code.toString();
			const trace = 'if(S.trace&&st2) S.trace.push({t:';
			if (!source.includes(trace) || !source.includes('.swap={old:prev,')) throw Error('Original sampler structure changed');
			source = source.replace(trace, `const paintSeq=window.__k19Base+S.frames,bits=[1,0];for(let i=0;i<20;i++)bits.push((paintSeq>>i)&1);for(let i=0;i<20;i++)bits.push(1-((paintSeq>>i)&1));bits.forEach((v,i)=>window.__k19Cells[i].style.background=v?'#fff':'#000');if(S.trace&&st2) S.trace.push({paintSeq,t:`);
			source = source.replace('const drift = Math.max', `const motion=st2.speechMotion?st2.speechMotion(tall?[44,30]:[58,44]):null;
				const sweptCandidate=motion?[candidate[0]+motion.lo[0]-sp[0],candidate[1]+motion.lo[1]-sp[1],candidate[2]+motion.hi[0]-sp[0],candidate[3]+motion.hi[1]-sp[1]]:null;
				const motionHits=sweptCandidate?obs.filter(o=>meet(sweptCandidate,o)):[];
                const ownerObs=[...st2.props.values()].filter(p=>p.state!=='out'&&p.restFit).map(p=>{const b=p.restFit.speechBox||p.restFit.box,a=st2.toScreen([b[0],b[1]]),z=st2.toScreen([b[2],b[3]]);return[a[0]-6,a[1]-6,z[0]+6,z[1]+6];});if(motion&&motion.bar)ownerObs.push(motion.bar);
                const ownerHits=sweptCandidate?ownerObs.filter(o=>meet(sweptCandidate,o)):[];
                const fc=[st2.ps.tiltT-.2,st2.ps.tiltT,st2.ps.tiltT+.2].flatMap(a=>{const q=st2.toScreen(st2.headXf(tall?[44,30]:[58,44],st2.H,a,1,1)),dx=sp[0]-q[0],dy=sp[1]-q[1];return[[12,32],[52,32],[12,58],[52,58]].map(p=>{const v=st2.toScreen(st2.headXf(p,st2.H,a,1,1));return[v[0]+dx,v[1]+dy];});});
                const face=[Math.min(...fc.map(p=>p[0]))-6,Math.min(...fc.map(p=>p[1]))-6,Math.max(...fc.map(p=>p[0]))+6,Math.max(...fc.map(p=>p[1]))+6];if(tall)face[1]-=12;else face[2]+=12;
                const faceHit=meet(candidate,face);
                const fitsSweep=sweptCandidate&&lo&&sweptCandidate[0]>=Math.max(pad,lo[0]+pad)-.5&&sweptCandidate[2]<=Math.min(st2.box.width-pad,hi[0]-pad)+.5&&sweptCandidate[1]>=Math.max(top,lo[1]+4)-.5&&sweptCandidate[3]<=Math.min(st2.box.height-foot,hi[1]-4)+.5;
                const ownerCanFit=!!fitsSweep&&!ownerHits.length&&!faceHit;
				const drift = Math.max`);
			source = source.replace('.swap={old:prev,', '.swap={motion,sp,sweptCandidate,motionHits,ownerObs,ownerHits,face,faceHit,fitsSweep,ownerCanFit,old:prev,');
			source = source.replace('if (!window.__sk) { dot.remove(); return; }', "if (!window.__sk) { window.__k19Cells.forEach(c=>c.style.background='#808080'); dot.remove(); return; }");
			return evaluate(`(${source})(${JSON.stringify(rest[0])})`);
		};
		return f;
	};
	try { await tests['stage keep-off, normal page'](t); }
	finally { t.app.open = open; }
}
