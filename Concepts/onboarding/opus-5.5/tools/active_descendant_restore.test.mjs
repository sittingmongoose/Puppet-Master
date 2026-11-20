// PERF-R5: broad cursor carriers retain every arm main supports. Added wave-2 classes may stay.
// PM7PERF-RESTORE-LIVE-MAIN (R26 F3): the reference is pinned below, not read from the live origin/main, so the test
// still means something after the restore is on main, and it runs where origin/main cannot be resolved.
// node --test active_descendant_restore.test.mjs [rules JSON to test instead of the one beside it]
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
// main 6bd8294726's rules 0/1/2/6 (the main PERF-R5 restored; R26 F3: the test read live origin/main, which is the
// restored JSON itself once that landed): the original selector and the prefix by SHA-256, and every descendant arm
const MAIN6={
 0:{original:'1064a8eb8d93845c992ca558765366230852298ecf0c3ee486ea0d5ee416bf69',source:'Concepts/onboarding/opus-5.5/src/settings/styles.d/14-nier-parts.css',omit:false,prefix:'8351c262e24c42d8dd559389f90b2ace02114f3e8b63aaf2dca83b039e8309a3',
  arms:[".A",".M",".cl-mode-desc",".cl-mode-info",".cl-mode-name",".d-na",".d-word",".docker",".domain-copy",".eq-abbr",".eq-full",".fm-chevron",".fm-count",".fm-ctx-caret",".fm-ctx-key",".fm-ctx-label",".fm-ficon",".fm-markers",".fm-name",".fm-quick",".fm-trail",".folder",".icon",".icon-inline",".icon-label",".md",".mono",".nx-a-drop",".nx-a-swap",".nx-a-wave",".nx-c",".nx-h",".nx-p0",".nx-p1",".nx-r-concept",".o55-nier-tt-box",".o55-nier-tt-mark",".o55-nier-tt-sliders",".o55-nier-tt-swatch",".orch-tab-badge",".orch-tab-badge-dot",".pm-ico",".pm-minibtn",".pm6-dash-size-chip",".pm6-ico",".pm6-tb-menu-item-label",".pm6-tb-menu-meta",".pm6-tt-chip",".pm6-tt-chips",".pm6-tt-name",".pmr-key",".rs",".sh-sdot",".slash-cmd-desc",".slash-cmd-name",".sm",".sql",".svelte",".symbol",".thread-action-btn",".thread-bottom-row",".thread-status-col",".thread-status-draft",".thread-status-read",".thread-status-unread",".thread-summary",".thread-timestamp",".thread-title",".thread-top-row",".thread-working-pulse",".toml",".wt-clean",".wt-dirty",".xml",".yml","b","br","circle","div","ellipse","g","i","line","path","polygon","polyline","rect","small","span","strong","svg"]},
 1:{original:'9cf1318f6333a8861d4b570b8b84dbafd80ff02c270ca51f1d3647e3a812be0a',source:'Concepts/onboarding/opus-5.5/src/css/25-hover-controls.css',omit:false,prefix:'658e5bec83ad9c8c32a022723fdd65e754c16fc45c0849e22b2dd369040dccef',
  arms:[".fm-selchip-lbl",".icon-label",".nx-a-drop",".nx-a-seq",".nx-a-spin",".nx-c",".nx-h",".nx-p0",".nx-pc",".pm-ico",".pm6-tb-project-chevron",".pm6-tb-project-ico",".pm6-tb-theme-ico",".pm6-tt-bite",".pm6-tt-core",".pm6-tt-rays",".pmt-card-chev",".pmt-card-tg-text",".pmw-exit",".pmw-hbtn-label",".pmw-ico",".pmw-kglyph",".pmw-kico",".pmw-tattn",".pmw-tclose",".pmw-tdot",".pmw-tico",".pmw-tlabel",".pmw-tmark",".sm",".symbol","b","circle","g","line","mask","path","polygon","polyline","rect","span","svg"]},
 2:{original:'c2503472bd04bcb51540ebdbfdbcdc0b491173c60bcbbfce77b2d9e519e7596c',source:'Concepts/leftrail-redesign/src/css/10-menu.css',omit:false,prefix:'2e6102f9ee262470c20b78f9fdd3c12280a4fd4e500586a51c79ae47d265da8e',
  arms:[".pm6-chat-modelcheck",".pm6-chat-modeleffort",".pm6-chat-modelname",".pmr-key",".pmr-mi-ico",".pmr-mi-sub","circle","defs","desc","ellipse","feComposite","feDisplacementMap","feGaussianBlur","feImage","filter","g","line","linearGradient","mask","path","polygon","polyline","rect","stop","svg","text","title","use"]},
 6:{original:'ace3878e982e6eee49dd81c79609f36c63c17ec8c32ffd109cd34c5f8e607168',source:'Concepts/onboarding/opus-5.5/src/settings/styles.d/14-nier-parts.css',omit:false,prefix:'4e0d1a7cd3b9924c76d1f1a7b11ca83e58f3a5764b1730e106b38c426ba37c10',
  arms:[".A",".M",".d-word",".docker",".domain-copy",".fm-chevron",".fm-count",".fm-ficon",".fm-markers",".fm-name",".fm-quick",".fm-trail",".folder",".icon",".icon-label",".md",".mono",".nx-p",".o55-nier-tt-box",".o55-nier-tt-mark",".o55-nier-tt-swatch",".orch-tab-badge",".orch-tab-badge-dot",".pm-ico",".pm-minibtn",".pm6-tb-menu-item-label",".pm6-tb-menu-meta",".pm6-tt-chip",".pm6-tt-chips",".pm6-tt-name",".pmr-key",".rs",".sh-sdot",".sm",".sql",".svelte",".symbol",".thread-action-btn",".thread-bottom-row",".thread-status-col",".thread-status-draft",".thread-status-read",".thread-status-unread",".thread-summary",".thread-timestamp",".thread-title",".thread-top-row",".thread-working-pulse",".toml",".wt-clean",".wt-dirty",".xml",".yml","b","br","circle","div","g","i","line","path","polygon","polyline","rect","small","span","strong","svg"]},
};const given=process.argv.find((a,i)=>i>1&&a.endsWith('.json'));
const actual=JSON.parse(readFileSync(given||new URL('./active_descendant_rules.json',import.meta.url),'utf8'));
const sha=s=>createHash('sha256').update(s).digest('hex');
const arms=r=>r.replacement.slice(r.replacement.lastIndexOf(':where(')+7,-1).split(',').map(s=>s.trim());
for(const id of [0,1,2,6])test('cursor rule '+id+' retains every main descendant arm',()=>{
 const before=MAIN6[id],after=actual.rules.find(r=>r.rule===id);
 assert.equal(sha(after.original),before.original);assert.equal(after.source,before.source);assert.equal(after.omit,before.omit);
 const entries=new Set(arms(after)),missing=before.arms.filter(s=>!entries.has(s));
 assert.deepEqual(missing,[],'main arms missing: '+missing.join(', '));
 assert.equal(sha(after.replacement.slice(0,after.replacement.lastIndexOf(':where('))),before.prefix);
});
