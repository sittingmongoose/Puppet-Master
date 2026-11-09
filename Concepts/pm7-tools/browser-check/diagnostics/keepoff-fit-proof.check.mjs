// Read-only K19 trace: preserve every product assertion, capture the motion
// envelope beside the proposed previous anchor, and tag the native film.
import { tests } from '../checks/stage-keepoff.check.mjs';

export default async function (t) {
	if (!['0', '1'].includes(String(t.args.sandbox)) || t.args.only !== 'begin') throw Error('Use sandbox=0|1 only=begin for the declared K19 proof');
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
			source = source.replace('if (!window.__sk) { dot.remove(); return; }', "if (!window.__sk) { window.__k19Cells.forEach(c=>c.style.background='#808080'); dot.remove(); return; }");
			return evaluate(`(${source})(${JSON.stringify(rest[0])})`);
		};
		return f;
	};
	try { await tests[t.args.sandbox === '1' ? 'stage keep-off, sandbox' : 'stage keep-off, normal page'](t); }
	finally { t.app.open = open; }
}
