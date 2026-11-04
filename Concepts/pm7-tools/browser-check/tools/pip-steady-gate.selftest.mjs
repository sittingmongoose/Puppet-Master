// Unit-test the gate composition with a fake browser command and real lossless decode (no browser/recording).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pip-gate-selftest-'));
try {
  const bin = path.join(root, 'bin'); fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'browser-check'), `#!${process.execPath}\nimport fs from 'node:fs';\nconst a=process.argv, p=a[a.indexOf('--record')+1];\nif(process.env.FIXTURE)fs.copyFileSync(process.env.FIXTURE,p);\nprocess.exit(Number(process.env.STRUCTURAL_EXIT));\n`, { mode: 0o755 });
  // Use CommonJS for the executable without an .mjs suffix.
  const stub = path.join(bin, 'browser-check'); fs.writeFileSync(stub, fs.readFileSync(stub, 'utf8').replace("import fs from 'node:fs';", "const fs=require('node:fs');"));
  const fixtures = {};
  for (const kind of ['clean', 'drop', 'empty-colour']) {
    const raw = Buffer.alloc(64 * 64 * 3 * 121);
    for (let f = 0; f < 121; f++) for (let i = 0; i < 64 * 64; i++) {
      const o = (f * 64 * 64 + i) * 3, blue = kind !== 'empty-colour' && !(kind === 'drop' && f === 60);
      raw[o+1] = blue ? 86 : 0; raw[o+2] = blue ? 179 : 0;
    }
    // Match the scanner's normal crop without needing a full-size encoded fixture.
    const film = path.join(root, kind+'.nut');
    const enc = spawnSync('ffmpeg', ['-v','error','-f','rawvideo','-pixel_format','rgb24','-video_size','64x64','-framerate','60','-i','pipe:0','-vf','pad=874:900:422:240','-c:v','rawvideo',film], {input:raw});
    assert.equal(enc.status,0,enc.stderr.toString()); fixtures[kind] = film;
  }
  const invalid = path.join(root,'invalid.mp4'); fs.writeFileSync(invalid,'not a movie'); fixtures.invalid=invalid;
  const cases = [['clean',0,0],['clean',1,1],['drop',0,1],['empty-colour',0,1],['invalid',0,1],['missing',0,1]];
  for (const [kind, structural, expected] of cases) {
    const run=spawnSync(process.execPath,[fileURLToPath(new URL('./pip-steady-gate.mjs',import.meta.url)),'--page','fixture.html','--out',path.join(root,kind+'-'+structural),'--sandbox','1'],{encoding:'utf8',env:{...process.env,PATH:bin+path.delimiter+process.env.PATH,FIXTURE:fixtures[kind]||'',STRUCTURAL_EXIT:String(structural)}});
    assert.equal(run.status,expected,run.stdout+run.stderr);
  }
  console.log('PASS 6 gate composition cases (fake browser, real decoder): clean, structural failure, painted dropout, no body colour, invalid film, missing film');
} finally { fs.rmSync(root,{recursive:true,force:true}); }
