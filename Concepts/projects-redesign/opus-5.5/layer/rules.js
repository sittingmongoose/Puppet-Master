/* Projects concepts (Opus 5.5), Split v2: the rule tables, window.PJX.rules.

   A copy of the onboarding concept's own rules on the PM7-build integration branch (25-fixtures.js FORGES and
   71-screens-safe.js ACCESS / CHECK / DEMO_ACCESS), because the PMConcept7 framed on main still offers retired services.
   Services follow DL-273 and the branch: no Codeberg, no Gitea Cloud, no Cursor Origin, no GitHub Pages; Forgejo and
   Gitea are servers of your own only. One shared rule table for onboarding and this flow is a Plans ask (spec 18).

     SERVICES                  one row per service: kinds (hosted or own server), sign-in methods per kind, the owner and
                               project nouns, visibility per owner and project, the name rule and how a name is spelled
     service(id), kind(id, k)  lookups; key(id, k) is the ENV.forges key ('github.com', 'gitlab.own', ...)
     nameProblem(svc, name)    null or the reason a name breaks that service's own rule
     spell(svc, name)          the name as the service saves it ('Book club website' -> 'Book-club-website' or a slug)
     visibility(svc, kind, owner, project)  the who-can-see-it choices, most private first
     branchProblem(name)       git check-ref-format, in words
     FAMILIES, ACCESS, CHECK, DEMO_ACCESS, accessProblem(fam, acc), place(fam, acc, ctx)   the backup families
     folderNameProblem(n)      the folder-name rule */
(function (W) {
  'use strict';
  const PJX = W.PJX;
  if (!PJX || PJX.rules) return;
  const w = (k, v) => PJX.w(k, v);

  const gitBasic = (n, max, extra) => (!n ? 'empty' : n.length > max ? 'long' : !/^[A-Za-z0-9._-]+$/.test(n) ? 'chars' : n === '.' || n === '..' ? 'reserved' : extra ? extra(n) : null);
  const giteaName = (n) => gitBasic(n, 100, (x) => (x === '-' || /\.(git|wiki|rss|atom)$/i.test(x) ? 'reserved' : /\.\./.test(x) ? 'chars' : null));
  const AZURE_RESERVED = /^(aux|con|nul|prn|com([1-9]|10)|lpt[1-9]|server|signalr|defaultcollection|web)$/i;
  const slugOf = (n) => String(n || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  const RULE_TEXT = {
    github: 'Use letters, numbers, - . or _ only, up to 100.',
    gitlab: 'Use letters, numbers, - . or _, starting and ending with a letter or number, and no two symbols together.',
    azure: 'Up to 64 characters, not starting with _ or . and without \\ / : * ? " < > | ; # $ { } , + = [ ] or &.',
    bitbucket: 'Use letters or numbers: its web address keeps them, turns the rest into dashes, and holds up to 62.',
    bitbucketDc: 'Start with a letter or number; then letters, numbers, spaces, - . or _.',
    forgejo: 'Use letters, numbers, - . or _ only, up to 100.'
  };

  /* kinds: id, label (the segment's words), host (a hosted kind's own address), address (a server address is typed).
     auth: sign-in methods per kind, the first the main one: browser (its own page), device (a code to type there),
     token (an access token made on that server). owner: the noun of the place an account keeps a copy; ownerQ: the
     heading over those cards; project: the place inside an owner some services also need. fork: Contribute is offered
     (GitHub semantics; other services are typed unsupported, R3 4.1). */
  const SERVICES = [
    { id: 'github', name: 'GitHub', sub: 'Most popular', primary: true, fork: true, personal: true,
      kinds: [{ id: 'com', label: 'GitHub.com', host: 'github.com' }], auth: { com: ['browser', 'device'] },
      ownerQ: 'Whose account keeps it?', rule: 'github', spaces: 'dash', device: 'github.com/login/device' },
    { id: 'ghe', name: 'GitHub Enterprise', sub: 'Your company’s own GitHub', fork: true, personal: true, enterprise: true,
      kinds: [{ id: 'server', label: 'GitHub Enterprise Server', address: true }], auth: { server: ['browser', 'token'] },
      ownerQ: 'Whose account keeps it?', rule: 'github', spaces: 'dash', tokenHow: 'github' },
    { id: 'gitlab', name: 'GitLab', sub: 'GitLab.com or your company’s own', personal: true,
      kinds: [{ id: 'com', label: 'GitLab.com', host: 'gitlab.com' }, { id: 'own', label: 'My company’s own server', address: true }], auth: { com: ['browser', 'device'], own: ['browser', 'token'] },
      ownerQ: 'Where does it live?', rule: 'gitlab', spaces: 'dash', device: 'gitlab.com/oauth/device', tokenHow: 'gitlab' },
    { id: 'azure', name: 'Azure DevOps', sub: 'Microsoft’s service for teams', personal: false, project: 'teamProject',
      kinds: [{ id: 'services', label: 'Azure DevOps Services', host: 'dev.azure.com' }, { id: 'server', label: 'Azure DevOps Server', address: true }], auth: { services: ['browser', 'device'], server: ['browser', 'token'] },
      ownerQ: { services: 'Organization', server: 'Collection' }, rule: 'azure', spaces: 'keep', device: 'microsoft.com/devicelogin', tokenHow: 'azure' },
    { id: 'bitbucket', name: 'Bitbucket', sub: 'Cloud or Data Center', personal: false,
      kinds: [{ id: 'cloud', label: 'Bitbucket Cloud', host: 'bitbucket.org' }, { id: 'dc', label: 'Bitbucket Data Center', address: true }], auth: { cloud: ['browser'], dc: ['browser', 'token'] },
      ownerQ: { cloud: 'Workspace', dc: 'Which project keeps it?' }, project: { cloud: 'bbProject' }, rule: { cloud: 'bitbucket', dc: 'bitbucketDc' }, spaces: 'keep', tokenHow: 'bitbucket' },
    { id: 'forgejo', name: 'Forgejo', sub: 'On a server of your own', personal: true, token: true,
      kinds: [{ id: 'own', label: 'Your own server', address: true }], auth: { own: ['token'] },
      ownerQ: 'Whose account keeps it?', rule: 'forgejo', spaces: 'dash', tokenHow: 'forgejo' },
    { id: 'gitea', name: 'Gitea', sub: 'On a server of your own', personal: true, token: true,
      kinds: [{ id: 'own', label: 'Your own server', address: true }], auth: { own: ['token'] },
      ownerQ: 'Whose account keeps it?', rule: 'forgejo', spaces: 'dash', tokenHow: 'gitea' }
  ];
  const service = (id) => SERVICES.find((s) => s.id === id) || null;
  const kind = (id, k) => { const s = service(id); return s ? (s.kinds.find((x) => x.id === k) || s.kinds[0]) : null; };
  const key = (id, k) => id + '.' + (kind(id, k) || {}).id;
  const per = (v, k) => (v && typeof v === 'object' && !Array.isArray(v) ? v[k] : v);
  const ruleOf = (svc, k) => per(service(svc).rule, k || (kind(svc, k) || {}).id);
  const ownerQ = (svc, k) => per(service(svc).ownerQ, (kind(svc, k) || {}).id);
  const projectNoun = (svc, k) => per(service(svc).project, (kind(svc, k) || {}).id) || null;
  const auth = (svc, k) => (service(svc).auth[(kind(svc, k) || {}).id] || ['browser']);

  function nameProblem(svc, k, n) {
    const r = ruleOf(svc, (kind(svc, k) || {}).id);
    let why = null;
    if (r === 'github') why = gitBasic(n, 100);
    else if (r === 'gitlab') why = !n ? 'empty' : n.length > 255 ? 'long' : !/^[A-Za-z0-9._-]+$/.test(n) ? 'chars' : !/^[A-Za-z0-9]/.test(n) || !/[A-Za-z0-9]$/.test(n) ? 'ends' : /[._-]{2}/.test(n) ? 'chars' : /\.(git|atom)$/i.test(n) ? 'reserved' : null;
    else if (r === 'azure') why = !n ? 'empty' : n.length > 64 ? 'long' : /[\\/:*?"<>|;#${},+=[\]&]/.test(n) ? 'chars' : /^[_.]/.test(n) || /\.$/.test(n) ? 'ends' : AZURE_RESERVED.test(n) ? 'reserved' : null;
    else if (r === 'bitbucket') why = !n ? 'empty' : !slugOf(n) ? 'chars' : slugOf(n).length > 62 ? 'long' : null;
    else if (r === 'bitbucketDc') why = !n ? 'empty' : n.length > 128 ? 'long' : !/^[A-Za-z0-9][A-Za-z0-9 ._-]*$/.test(n) ? 'chars' : null;
    else why = giteaName(n);
    if (!why) return null;
    if (why === 'empty') return 'Give it a name on ' + service(svc).name + '.';
    if (why === 'reserved') return w('np.details.reserved', { service: service(svc).name });
    return RULE_TEXT[r];
  }
  /* how a service spells a typed name: spaces become dashes where its rule has no spaces; the slug is its address */
  const spell = (svc, n) => (service(svc).spaces === 'dash' ? String(n || '').trim().replace(/\s+/g, '-').replace(/[^A-Za-z0-9._-]/g, '') : String(n || '').trim());
  const slug = slugOf;

  /* who can see it, most private first (FF-02): [{ id, title, sub }] or [] when it follows the project's own settings */
  function visibility(svc, k, owner, project, host) {
    const kd = (kind(svc, k) || {}).id, org = owner && owner.label, isOrg = owner && owner.kind !== 'personal';
    if (svc === 'azure') return [];
    if (svc === 'github' || svc === 'ghe') {
      const out = [isOrg ? { id: 'private', title: w('np.details.privateOrg', { org }), sub: w('np.details.privateOrgSub') } : { id: 'private', title: w('np.details.private'), sub: w('np.details.privateSub') },
        { id: 'public', title: w('np.details.public'), sub: svc === 'ghe' ? w('np.details.publicServerSub', { host }) : w('np.details.publicSub') }];
      if (isOrg && (svc === 'ghe' || owner.enterprise)) out.splice(1, 0, { id: 'internal', title: w('np.details.ghInternal'), sub: w('np.details.ghInternalSub', { org }) });
      return out;
    }
    if (svc === 'gitlab') {
      let out = [{ id: 'private', title: w('np.details.glPrivate'), sub: w('np.details.glPrivateSub') }];
      // Internal only on your own server, and only where that server allows it (checked, never assumed; FGI-011)
      if (kd === 'own' && (!owner || owner.internalAllowed !== false)) out.push({ id: 'internal', title: w('np.details.glInternal', { host }), sub: w('np.details.glInternalSub') });
      out.push({ id: 'public', title: w('np.details.glPublic'), sub: kd === 'own' ? w('np.details.publicServerSub', { host }) : w('np.details.publicSub') });
      const open = { private: 0, internal: 1, public: 2 };
      if (owner && owner.cap) out = out.filter((v) => open[v.id] <= open[owner.cap]);
      return out;
    }
    if (svc === 'bitbucket') {
      if (kd === 'dc') return [{ id: 'private', title: w('np.details.dcPrivate', { org }), sub: w('np.details.dcPrivateSub') }].concat(owner && owner.publicAccess ? [{ id: 'public', title: w('np.details.dcPublic', { host }), sub: w('np.details.dcPublicSub') }] : []);
      const priv = [{ id: 'private', title: w('np.details.bbPrivate'), sub: w('np.details.bbPrivateSub') }];
      return project && project.private ? priv : priv.concat([{ id: 'public', title: w('np.details.bbPublic'), sub: w('np.details.publicSub') }]);
    }
    return [isOrg ? { id: 'private', title: w('np.details.privateOrg', { org }), sub: w('np.details.privateOrgSub') } : { id: 'private', title: w('np.details.private'), sub: w('np.details.privateSub') },
      { id: 'public', title: w('np.details.public'), sub: w('np.details.publicServerSub', { host }) }];
  }
  function capNote(svc, k, owner, project, host) {
    if (svc === 'gitlab' && owner && owner.cap === 'private') return w('np.details.cap.gitlab', { org: owner.label });
    if (svc === 'bitbucket' && (kind(svc, k) || {}).id === 'cloud' && project && project.private) return w('np.details.cap.bitbucket', { project: project.label });
    if ((svc === 'forgejo' || svc === 'gitea') && owner && owner.profile === 'limited') return w('np.details.cap.profile', { org: owner.label, host });
    return '';
  }
  /* git check-ref-format, in words */
  function branchProblem(n) {
    const v = String(n == null ? '' : n);
    if (!v.trim()) return w('np.access.branchEmpty');
    if (/\s|\.\.|[~^:?*[\\]|@\{/.test(v) || /^-/.test(v) || /[/.]$/.test(v) || /\/\//.test(v) || /\.lock$/.test(v)) return w('np.access.branchBad');
    return null;
  }
  const remoteProblem = (n, taken) => (!/^[A-Za-z0-9._-]+$/.test(String(n || '')) ? w('np.link.remoteBad') : taken && taken.indexOf(n) >= 0 ? w('np.link.remoteTaken', { remote: n }) : null);
  const folderNameProblem = (n) => (!String(n || '').trim() ? w('np.name.empty') : /[/\\:*?"<>|]/.test(n) ? w('np.loc.bad.chars') : null);
  const folderSlug = (n) => String(n || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9._-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');

  /* ------------------------------------------------------------------ backups: the eight families (BRS-013) */
  const FAMILIES = {
    local_nas: { label: 'Home NAS' }, google_drive: { label: 'Google Drive', drive: ['My Drive', 'Puppet Master'] }, onedrive: { label: 'OneDrive', drive: ['Apps', 'Puppet Master'] },
    aws_s3: { label: 'Amazon S3' }, backblaze_b2: { label: 'Backblaze B2' }, s3_compatible: { label: 'S3-compatible' }, sftp: { label: 'SFTP server' }, webdav: { label: 'WebDAV server' }
  };
  const SUBS = { bucket: ['aws_s3', 'backblaze_b2', 's3_compatible'], server: ['sftp', 'webdav'] };
  const DEST_FAMILY = { nas: 'local_nas', gdrive: 'google_drive', onedrive: 'onedrive' };
  const family = (dest, sub) => (SUBS[dest] ? (SUBS[dest].indexOf(sub) >= 0 ? sub : SUBS[dest][0]) : DEST_FAMILY[dest] || null);
  const part = (v) => String(v || '').trim().replace(/^s3:\/\//i, '').split('/')[0];
  const ip4 = /^\d{1,3}(\.\d{1,3}){3}$/;
  const CHECK = {
    awsBucket: (v) => { const b = part(v); return b.length >= 3 && b.length <= 63 && /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(b) && !/\.\./.test(b) && !ip4.test(b); },
    b2Bucket: (v) => { const b = part(v); return b.length >= 6 && b.length <= 63 && /^[A-Za-z0-9.-]+$/.test(b) && !/^b2-/i.test(b) && !/^\.|\.$/.test(b) && !/\.\./.test(b); },
    bucket: (v) => { const b = part(v); return b.length >= 3 && b.length <= 63 && /^[A-Za-z0-9._-]+$/.test(b); },
    b2Host: (v) => /^(https:\/\/)?s3\.[a-z0-9-]+\.backblazeb2\.com\/?$/i.test(String(v || '').trim()),
    https: (v) => /^https:\/\/[^\s/?#]+(\/\S*)?$/i.test(String(v || '').trim()),
    sftp: (v) => /^sftp:\/\/[^\s/?#]+(\/\S*)?$/i.test(String(v || '').trim())
  };
  /* [key, type, check, when ('opt' optional, 'temp' only with temporary keys)], with onboarding's words */
  const ACCESS = {
    aws_s3: [['bucket', 'text', 'awsBucket'], ['keyId', 'text'], ['secret', 'password'], ['session', 'password', null, 'temp']],
    backblaze_b2: [['b2host', 'text', 'b2Host'], ['bucket', 'text', 'b2Bucket'], ['keyId', 'text'], ['secret', 'password']],
    s3_compatible: [['server', 'text', 'https'], ['region', 'text', null, 'opt'], ['bucket', 'text', 'bucket'], ['keyId', 'text'], ['secret', 'password']],
    sftp: [['address', 'text', 'sftp'], ['user', 'text'], ['password', 'password']],
    webdav: [['address', 'text', 'https'], ['user', 'text'], ['password', 'password']]
  };
  const A = {
    aws_s3: { bucket: ['Bucket', 'my-backups or my-backups/puppet-master', 'Its name, and a folder in it if you like. Puppet Master finds its region.', 'Amazon bucket names have 3 to 63 lowercase letters, numbers, dots or dashes, and start and end with a letter or number.'],
      keyId: ['Access key ID'], secret: ['Secret access key', '', 'Kept in your computer’s password store, never in Puppet Master’s files.'],
      session: ['Session token', '', 'Temporary keys come with one. Kept in your computer’s password store, never in Puppet Master’s files.'] },
    backblaze_b2: { b2host: ['S3 address', 's3.us-west-004.backblazeb2.com', 'Shown on the bucket’s page in Backblaze.', 'It looks like s3.us-west-004.backblazeb2.com.'],
      bucket: ['Bucket', 'my-backups', 'Its name, and a folder in it if you like.', 'B2 bucket names have 6 to 63 letters, numbers, dashes or dots, and don’t start with b2-.'],
      keyId: ['Application key ID'], secret: ['Application key', '', 'A key made for this bucket: Backblaze’s master key doesn’t work here. Kept in your computer’s password store, never in Puppet Master’s files.'] },
    s3_compatible: { server: ['Service address', 'https://s3.example.com', 'The S3 address your storage service gives you.', 'It starts with https://.'], region: ['Region, if the service asks for one'],
      bucket: ['Bucket', 'my-backups', 'Its name, and a folder in it if you like.', 'Bucket names have 3 to 63 letters, numbers, dots, dashes or underscores.'],
      keyId: ['Access key ID'], secret: ['Secret access key', '', 'Kept in your computer’s password store, never in Puppet Master’s files.'] },
    sftp: { address: ['Server address', 'sftp://backup.example.com/puppet-master', 'The server and the folder for backups.', 'It starts with sftp://. An https:// address is WebDAV: choose WebDAV above.'],
      user: ['Username'], password: ['Password', '', 'Kept in your computer’s password store, never in Puppet Master’s files.'] },
    webdav: { address: ['WebDAV address', 'https://dav.example.com/puppet-master', 'The folder’s https address, as your server gives it.', 'It starts with https://.'],
      user: ['Username'], password: ['Password', '', 'Kept in your computer’s password store, never in Puppet Master’s files.'] }
  };
  const fieldWords = (fam, k) => { const r = (A[fam] || {})[k] || [k]; return { label: r[0], ph: r[1] || '', hint: r[2] || '', bad: r[3] || '' }; };
  const KEYS = [['keyId', 'demo-access-key-id'], ['secret', 'demo-secret-access-key']], B2KEYS = [['keyId', 'demo-b2-key-id'], ['secret', 'demo-b2-application-key']];
  const DEMO_ACCESS = {
    aws_s3: [['works', [['bucket', 'jared-pm-backups']].concat(KEYS)], ['wrong', [['bucket', 'My_Backups']]]],
    backblaze_b2: [['works', [['b2host', 's3.us-west-004.backblazeb2.com'], ['bucket', 'jared-pm-backups']].concat(B2KEYS)], ['wrong', [['b2host', 's3.amazonaws.com']]]],
    s3_compatible: [['works', [['server', 'https://s3.wasabisys.com'], ['bucket', 'jared-pm-backups']].concat(KEYS)], ['wrong', [['server', 'http://s3.wasabisys.com']]]],
    sftp: [['works', [['address', 'sftp://backup.platyr.test/puppet-master'], ['user', 'jared'], ['password', 'demo-password']]], ['wrong', [['address', 'https://backup.platyr.test/puppet-master']]]],
    webdav: [['works', [['address', 'https://dav.platyr.test/puppet-master'], ['user', 'jared'], ['password', 'demo-password']]], ['wrong', [['address', 'sftp://dav.platyr.test/puppet-master']]]]
  };
  const shown = (fam, acc) => (ACCESS[fam] || []).filter((f) => f[3] !== 'temp' || (acc && acc.temp));
  const fieldBad = (f, acc) => !!(f[2] && String((acc || {})[f[0]] || '').trim() && !CHECK[f[2]](acc[f[0]]));
  /* the first missing or wrong access field, in onboarding's words; secrets count by their typed flag only */
  function accessProblem(fam, acc) {
    acc = acc || {};
    for (const f of shown(fam, acc)) {
      if (f[3] === 'opt') continue;
      if (f[1] === 'password') { if (!acc[f[0] + 'Typed']) return { field: f[0], text: w('np.bk.accessMissing') }; continue; }
      if (!String(acc[f[0]] || '').trim()) return { field: f[0], text: w('np.bk.accessMissing') };
      if (fieldBad(f, acc)) return { field: f[0], text: fieldWords(fam, f[0]).bad };
    }
    return null;
  }
  /* where the backups go, exactly, shown before any sign-in (FF-14) */
  function place(fam, acc, ctx) {
    ctx = ctx || {}; acc = acc || {};
    const name = ctx.slug || 'your-project';
    if (fam === 'local_nas') return w('np.bk.place.nas', { path: '/volume1/backups/puppet-master/' + name, nas: ctx.nas || 'Home NAS' });
    if (fam === 'google_drive' || fam === 'onedrive') {
      const f = FAMILIES[fam].drive.join(' › ');
      return ctx.account ? FAMILIES[fam].label + ' · ' + ctx.account + ' · ' + f : FAMILIES[fam].label + ' · ' + f + ' · you sign in right after the Project is made';
    }
    const bucket = String(acc.bucket || '').trim().replace(/^s3:\/\//i, '');
    if (/aws_s3|backblaze_b2|s3_compatible/.test(fam)) {
      const addr = fam === 'backblaze_b2' ? String(acc.b2host || '').trim() : fam === 's3_compatible' ? String(acc.server || '').trim() : '';
      return [FAMILIES[fam].label, addr, (bucket || 'your-bucket') + (bucket.indexOf('/') < 0 ? '/puppet-master/' + name : '')].filter(Boolean).join(' · ');
    }
    const addr = String(acc.address || '').trim();
    return FAMILIES[fam].label + ' · ' + (addr ? addr.replace(/\/+$/, '') + '/' + name : 'the address you type, then /' + name);
  }

  PJX.rules = { SERVICES, service, kind, key, ownerQ, projectNoun, auth, nameProblem, spell, slug, visibility, capNote, branchProblem, remoteProblem, folderNameProblem, folderSlug,
    FAMILIES, SUBS, family, ACCESS, CHECK, DEMO_ACCESS, shown, fieldBad, fieldWords, accessProblem, place, RULE_TEXT };
})(window);
