/* O55.endpoint — the local check of an address a person types to reach a Server (SCR-09). A web address is https://
   with a real host name, a port from 1 to 65535 if one is given, no user name or password in it and no spaces. A
   reverse proxy's address is its own host name with nothing after it (RAS-005: a path under another site is not
   supported); a Headscale address may have a path, but no ? or #. A bare host name gets https:// in front and the
   field says so; another scheme is never rewritten into https. A Remote Link is the link or the short code the Server
   shows (RAS-014); its exact form is the owner's, so only blanks and plain http are refused here. The owner still
   tests every address after Review: this only keeps a typo out of Review. */
(function () {
  'use strict';
  const O55 = window.O55;
  const HOST = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
  const IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
  const fail = (error) => ({ ok: false, error });

  /* check(value, kind) -> { ok, url, added } or { ok: false, error, empty }; kind 'proxy' | 'headscale' */
  function check(value, kind) {
    const v = String(value == null ? '' : value).trim();
    if (!v) return { ok: false, empty: true, error: null };
    if (/\s/.test(v)) return fail('spaces');
    const m = /^([a-z][a-z0-9+.-]*):\/\//i.exec(v);
    if (m && m[1].toLowerCase() !== 'https') return fail('scheme');
    const rest = m ? v.slice(m[0].length) : v;
    const cut = rest.search(/[/?#]/), authority = cut < 0 ? rest : rest.slice(0, cut), tail = cut < 0 ? '' : rest.slice(cut);
    if (authority.includes('@')) return fail('credentials');
    const hp = /^(\[[0-9a-f:.]+\]|[^:]+)(?::(\d*))?$/i.exec(authority);
    if (!hp) return fail('host');
    const host = hp[1].toLowerCase();
    if (hp[2] !== undefined && !(/^\d{1,5}$/.test(hp[2]) && +hp[2] >= 1 && +hp[2] <= 65535)) return fail('port');
    const ip = IPV4.test(host) || /^\[[0-9a-f:.]+\]$/.test(host);
    if (!(HOST.test(host) || ip)) return fail('host');
    if (kind === 'proxy' && ip) return fail('hostname'); /* a web address of its own: a name, not a number */
    if (/[?#]/.test(tail)) return fail('query');
    const path = tail.replace(/\/+$/, '');
    if (kind === 'proxy' && path) return fail('path');
    const url = 'https://' + host + (hp[2] ? ':' + +hp[2] : '') + path;
    return { ok: true, url, added: !m };
  }
  /* a Remote Link: the link (pm-remote-link:… or an https link) or the short code its Server shows */
  function checkLink(value) {
    const v = String(value == null ? '' : value).trim();
    if (!v) return { ok: false, empty: true, error: null };
    if (/\s/.test(v)) return fail('spaces');
    if (/^http:\/\//i.test(v)) return fail('scheme');
    if (v.length < 6) return fail('short');
    if (v.length > 160) return fail('long');
    return { ok: true, url: v, form: /^[a-z][a-z0-9+.-]*:/i.test(v) ? 'link' : 'code' };
  }
  /* the words for a field: an error, the address that will be used, or nothing */
  function hint(res, okHint) {
    if (!res || res.empty) return { hint: okHint || '', error: '' };
    if (!res.ok) return { hint: '', error: O55.t('endpoint.' + res.error) };
    return { hint: res.added ? O55.t('endpoint.added', { url: res.url }) : okHint || '', error: '' };
  }
  O55.endpoint = { check, checkLink, hint };
})();
