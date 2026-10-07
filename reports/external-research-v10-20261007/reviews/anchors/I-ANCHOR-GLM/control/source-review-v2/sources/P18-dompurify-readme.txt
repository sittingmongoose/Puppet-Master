L1: # DOMPurify
L2: 
L3: [![npm](https://img.shields.io/npm/v/dompurify.svg)](https://www.npmjs.com/package/dompurify) [![License](https://img.shields.io/badge/license-MPL--2.0%20OR%20Apache--2.0-blue.svg)](https://github.com/cure53/DOMPurify/blob/main/LICENSE) [![Downloads](https://img.shields.io/npm/dm/dompurify.svg)](https://www.npmjs.com/package/dompurify) [![dependents](https://badgen.net/github/dependents-repo/cure53/dompurify?color=green&label=dependents)](https://github.com/cure53/DOMPurify/network/dependents) ![npm package minimized gzipped size (select exports)](https://img.shields.io/bundlejs/size/dompurify?color=%233C1&label=gzip) [![Cloudback](https://app.cloudback.it/badge/cure53/DOMPurify)](https://cloudback.it)
L4: 
L5: [![OpenSSF Best Practices](https://www.bestpractices.dev/projects/12162/badge)](https://www.bestpractices.dev/projects/12162) [![Build & Test](https://github.com/cure53/DOMPurify/actions/workflows/build-and-test.yml/badge.svg?branch=main)](https://github.com/cure53/DOMPurify/actions/workflows/build-and-test.yml) [![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/cure53/DOMPurify/badge)](https://scorecard.dev/viewer/?uri=github.com/cure53/DOMPurify) [![Socket Badge](https://badge.socket.dev/npm/package/dompurify/latest)](https://badge.socket.dev/npm/package/dompurify/latest) [![snyk.io package health](https://img.shields.io/badge/snyk.io%20package%20health-97%2F100-brightgreen)](https://security.snyk.io/package/npm/dompurify)
L6: 
L7: DOMPurify is a DOM-only, super-fast, uber-tolerant XSS sanitizer for HTML, MathML and SVG.
L8: 
L9: It's also very simple to use and get started with. DOMPurify was [started in February 2014](https://github.com/cure53/DOMPurify/commit/a630922616927373485e0e787ab19e73e3691b2b) and, meanwhile, has reached version **v3.4.16**.
L10: 
L11: DOMPurify runs as JavaScript and works in all modern browsers (Safari (10+), Opera (15+), Edge, Firefox and Chrome - as well as almost anything else using Blink, Gecko or WebKit). It doesn't break on MSIE or other legacy browsers. It simply does nothing.
L12: 
L13: **Note that [DOMPurify v2.5.9](https://github.com/cure53/DOMPurify/releases/tag/2.5.9) is the latest version supporting MSIE. For important security updates compatible with MSIE, please use the [2.x branch](https://github.com/cure53/DOMPurify/tree/2.x).**
L14: 
L15: Our automated tests cover 9 browser/OS combinations on the current engines (Chromium, Firefox, and WebKit across Ubuntu, macOS, and Windows) on every push, and a separate matrix re-runs the suite on older engine snapshots (back to roughly Chromium 110, Firefox 108 and WebKit 16.4, around three years old) so regressions on outdated browsers get caught too. We also run Node.js v20, v22, v24, v25 and v26 with DOMPurify on [jsdom](https://github.com/jsdom/jsdom). Older Node versions are known to work as well, but hey... no guarantees.
L16: 
L17: DOMPurify is written by security people who have vast background in web attacks and XSS. Fear not. For more details please also read about our [Security Goals & Threat Model](https://github.com/cure53/DOMPurify/wiki/Security-Goals-&-Threat-Model). Please, read it. Like, really. And if you enjoy the gory details, the [Attack Classes & Bypass History](https://github.com/cure53/DOMPurify/wiki/Attack-Classes-&-Bypass-History) page catalogs the parser-mutation, namespace, clobbering, and template tricks DOMPurify defends against.
L18: 
L19: The DOMPurify project inspired the creation of the [HTML Sanitizer API](https://wicg.github.io/sanitizer-api/#sanitizer), which is already shipping in [many browsers](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API#browser_compatibility). The same capability is now being standardized directly in the [WHATWG HTML specification](https://html.spec.whatwg.org/#html-sanitization).
L20: 
L21: ## Table of Contents
L22: 
L23: - [What does it do?](#what-does-it-do)
L24: - [How do I use it?](#how-do-i-use-it)
L25: - [Is there a demo?](#is-there-a-demo)
L26: - [What if I find a _security_ bug?](#what-if-i-find-a-security-bug)
L27: - [Some purification samples please?](#some-purification-samples-please)
L28: - [What is supported?](#what-is-supported)
L29: - [What about legacy browsers like Internet Explorer?](#what-about-legacy-browsers-like-internet-explorer)
L30: - [What about DOMPurify and Trusted Types?](#what-about-dompurify-and-trusted-types)
L31: - [Can I configure DOMPurify?](#can-i-configure-dompurify)
L32: - [Persistent Configuration](#persistent-configuration)
L33: - [Hooks](#hooks)
L34: - [Removed Configuration](#removed-configuration)
L35: - [Continuous Integration](#continuous-integration)
L36: - [Security Mailing List](#security-mailing-list)
L37: - [Who contributed?](#who-contributed)
L38: 
L39: ## What does it do?
L40: 
L41: DOMPurify sanitizes HTML and prevents XSS attacks. You can feed DOMPurify with e.g. a string full of dirty HTML and it will return a string (unless configured otherwise) with clean HTML. DOMPurify will strip out everything that contains dangerous HTML and thereby prevent XSS attacks and other nastiness. It's also damn bloody fast. We use the technologies the browser provides and turn them into an XSS filter. The faster your browser, the faster DOMPurify will be.
L42: 
L43: ## How do I use it?
L44: 
L45: It's easy. Just include DOMPurify on your website.
L46: 
L47: ### Using the unminified version (source-map available)
L48: 
L49: ```html
L50: <script type="text/javascript" src="dist/purify.js"></script>
L51: ```
L52: 
L59: Afterwards you can sanitize strings by executing the following code:
L60: 
L61: ```js
L62: const clean = DOMPurify.sanitize(dirty);
L63: ```
L64: 
L65: Or maybe this, if you love working with Angular or alike:
L66: 
L67: ```js
L68: import DOMPurify from 'dompurify';
L69: 
L70: const clean = DOMPurify.sanitize('<b>hello there</b>');
L71: ```
L72: 
L73: The resulting HTML can be written into a DOM element using `innerHTML` or the DOM using `document.write()`. That is fully up to you.
L74: Note that by default, we permit HTML, SVG **and** MathML. If you only need HTML, which might be a very common use-case, you can easily set that up as well:
L75: 
L76: ```js
L77: const clean = DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
L78: ```
L79: 
L80: ### Is there any foot-gun potential?
L81: 
L82: Well, please note, if you _first_ sanitize HTML and then modify it _afterwards_, you might easily **void the effects of sanitization**. If you feed the sanitized markup to another library _after_ sanitization, please be certain that the library doesn't mess around with the HTML on its own. See the [Security Goals & Threat Model](https://github.com/cure53/DOMPurify/wiki/Security-Goals-&-Threat-Model) for safe-usage recipes and the tags/attributes worth thinking twice about, and [Attack Classes & Bypass History](https://github.com/cure53/DOMPurify/wiki/Attack-Classes-&-Bypass-History) for why post-processing and changing the markup context defeat sanitization.
L83: 
L84: ### What about passing a DOM node instead of a string?
L85: 
L86: `DOMPurify.sanitize()` also accepts a DOM node (an `Element`, `DocumentFragment` or `Document`). Since 3.4.14 that path is hardened for nodes that did not come out of the HTML parser: a node built with the DOM API or parsed as XML/XHTML (for example via `DOMParser` with `application/xhtml+xml` and `importNode()`) can carry case-preserved attribute names such as `ONERROR`, or a rawtext element like `<style>` with an element child or its own end tag inside its text. Both shapes are invisible to a string sanitizer because the HTML parser can never build them, but they break out on reparse. DOMPurify now removes attributes by their exact `Attr` node and treats these literal-text trees as unsafe, so mixing document contexts on the input side is covered. It remains your job not to mix contexts on the _output_ side, see the paragraph above.
L87: 
L88: ### Okay, makes sense, let's move on
L89: 
L90: After sanitizing your markup, you can also have a look at the property `DOMPurify.removed` and find out, what elements and attributes were thrown out. Please **do not use** this property for making any security critical decisions. This is just a little helper for curious minds.
L91: 
L92: ### Running DOMPurify on the server
L93: 
L94: DOMPurify technically also works server-side with Node.js. Our support strives to follow the [Node.js release cycle](https://nodejs.org/en/about/previous-releases).
L95: 
L96: Running DOMPurify on the server requires a DOM to be present, which is probably no surprise. Usually, [jsdom](https://github.com/jsdom/jsdom) is the tool of choice and we **strongly recommend** to use the latest version of _jsdom_.
L97: 
L98: Why? Because older versions of _jsdom_ are known to be buggy in ways that result in XSS _even if_ DOMPurify does everything 100% correctly. There are **known attack vectors** in, e.g. _jsdom v19.0.0_ that are fixed in _jsdom v20.0.0_ - and we really recommend to keep _jsdom_ up to date because of that.
L99: 
L100: Please also be aware that tools like [happy-dom](https://github.com/capricorn86/happy-dom) exist but **are not considered safe** at this point. Combining DOMPurify with _happy-dom_ is currently not recommended and will likely lead to XSS. For background on why the server-side DOM you choose is part of your trusted computing base, see [Attack Classes & Bypass History](https://github.com/cure53/DOMPurify/wiki/Attack-Classes-&-Bypass-History).
L101: 
L102: Other than that, you are fine to use DOMPurify on the server. Probably. This really depends on _jsdom_ or whatever DOM you utilize server-side. If you can live with that, this is how you get it to work:
L103: 
L104: ```bash
L105: npm install dompurify
L106: npm install jsdom
L107: ```
L108: 
L109: For _jsdom_ (please use an up-to-date version), this should do the trick:
L110: 
L111: ```js
L112: const createDOMPurify = require('dompurify');
L113: const { JSDOM } = require('jsdom');
L114: 
L115: const window = new JSDOM('').window;
L116: const DOMPurify = createDOMPurify(window);
L117: const clean = DOMPurify.sanitize('<b>hello there</b>');
L118: ```
L119: 
L120: Or even this, if you prefer working with imports:
L121: 
L122: ```js
L123: import { JSDOM } from 'jsdom';
L124: import DOMPurify from 'dompurify';
L125: 
L126: const window = new JSDOM('').window;
L127: const purify = DOMPurify(window);
L128: const clean = purify.sanitize('<b>hello there</b>');
L129: ```
L130: 
L131: If you have problems making it work in your specific setup, consider looking at the amazing [isomorphic-dompurify](https://github.com/kkomelin/isomorphic-dompurify) project which solves lots of problems people might run into.
L132: 
L133: ```bash
L134: npm install isomorphic-dompurify
L135: ```
L136: 
L137: ```js
L138: import DOMPurify from 'isomorphic-dompurify';
L139: 
L140: const clean = DOMPurify.sanitize('<s>hello</s>');
L141: ```
L142: 
L143: ## Is there a demo?
L144: 
L145: Of course there is a demo! [Play with DOMPurify](https://cure53.de/purify)
L146: 
L147: ## What if I find a security bug?
L148: 
L149: First of all, please immediately contact us via [email](mailto:mario@cure53.de) so we can work on a fix. [PGP key](https://keyserver.ubuntu.com/pks/lookup?op=vindex&search=0xC26C858090F70ADA)
L150: 
L151: Also, you probably qualify for a bug bounty! The fine folks over at [Fastmail](https://www.fastmail.com/) use DOMPurify for their services and added our library to their bug bounty scope. So, if you find a way to bypass or weaken DOMPurify, please also have a look at their website and the [bug bounty info](https://www.fastmail.com/about/bugbounty/).
L152: 
L153: ## Some purification samples please?
L154: 
L155: How does purified markup look like? Well, [the demo](https://cure53.de/purify) shows it for a big bunch of nasty elements. But let's also show some smaller examples!
L156: 
L157: ```js
L158: DOMPurify.sanitize('<img src=x onerror=alert(1)//>'); // becomes <img src="x">
L159: DOMPurify.sanitize('<svg><g/onload=alert(2)//<p>'); // becomes <svg><g></g></svg>
L160: DOMPurify.sanitize('<p>abc<iframe//src=jAva&Tab;script:alert(3)>def</p>'); // becomes <p>abc</p>
L161: DOMPurify.sanitize('<math><mi//xlink:href="data:x,<script>alert(4)</script>">'); // becomes <math><mi></mi></math>
L162: DOMPurify.sanitize('<TABLE><tr><td>HELLO</tr></TABL>'); // becomes <table><tbody><tr><td>HELLO</td></tr></tbody></table>
L163: DOMPurify.sanitize('<UL><li><A HREF=//google.com>click</UL>'); // becomes <ul><li><a href="//google.com">click</a></li></ul>
L164: ```
L165: 
L166: These are just a taste. For the full taxonomy of attack classes these samples come from - mutation XSS, namespace confusion, DOM clobbering, rawtext breakouts, and more - see [Attack Classes & Bypass History](https://github.com/cure53/DOMPurify/wiki/Attack-Classes-&-Bypass-History).
L167: 
L168: ## What is supported?
L169: 
L170: DOMPurify currently supports HTML5, SVG and MathML. DOMPurify per default allows CSS, HTML custom data attributes. DOMPurify also supports the Shadow DOM - and sanitizes DOM templates recursively. DOMPurify also allows you to sanitize HTML for being used with the jQuery `$()` and `elm.html()` API without any known problems. For the exact set of elements and attributes permitted by default, see the [Default TAGs & ATTRIBUTEs allow-list & blocklist](https://github.com/cure53/DOMPurify/wiki/Default-TAGs-ATTRIBUTEs-allow-list-&-blocklist) wiki page.
L171: 
L172: ## What about legacy browsers like Internet Explorer?
L173: 
L174: DOMPurify does nothing at all. It simply returns exactly the string that you fed it. DOMPurify exposes a property called `isSupported`, which tells you whether it will be able to do its job, so you can come up with your own backup plan.
L175: 
L176: ## What about DOMPurify and Trusted Types?
L177: 
L178: In version 1.0.9, support for the [Trusted Types API](https://github.com/w3c/webappsec-trusted-types) ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API)) was added to DOMPurify.
L179: In version 2.0.0, a config flag was added to control DOMPurify's behavior regarding this.
L180: 
L181: When `DOMPurify.sanitize` is used in an environment where the Trusted Types API is available and `RETURN_TRUSTED_TYPE` is set to `true`, it tries to return a `TrustedHTML` value instead of a string (the behavior for `RETURN_DOM` and `RETURN_DOM_FRAGMENT` config options does not change).
L182: 
L183: Note that in order to create a policy in `trustedTypes` using DOMPurify, `RETURN_TRUSTED_TYPE: false` is required, as `createHTML` expects a normal string, not `TrustedHTML`. The example below shows this.
L184: 
L185: ```js
L186: window.trustedTypes.createPolicy('default', {
L187:   createHTML: (to_escape) =>
L188:     DOMPurify.sanitize(to_escape, { RETURN_TRUSTED_TYPE: false }),
L189: });
L190: ```
L191: 
L192: When no `TRUSTED_TYPES_POLICY` is supplied, DOMPurify attempts to create its own internal Trusted Types policy named `dompurify`. If your page already defines its own policy together with a strict CSP (for example `trusted-types my-organization`) that does not allow a policy named `dompurify`, this attempt is blocked by the browser and logs a `TrustedTypes policy dompurify could not be created.` warning along with a CSP violation.
L193: 
L194: To stop DOMPurify from creating its internal fallback policy, pass `TRUSTED_TYPES_POLICY: null`. This is the right choice when you call `DOMPurify.sanitize` from inside your own policy's `createHTML`, and it means you do not have to add `dompurify` to your CSP's `trusted-types` allowlist.
L195: 
L196: ```js
L197: window.trustedTypes.createPolicy('my-organization', {
L198:   createHTML: (input) =>
L199:     DOMPurify.sanitize(input, { TRUSTED_TYPES_POLICY: null }),
L200: });
L201: ```
L202: 
L203: Do **not** pass your own wrapping policy back to DOMPurify as its `TRUSTED_TYPES_POLICY` (for example via `DOMPurify.setConfig({ TRUSTED_TYPES_POLICY: myPolicy })`) when that policy's `createHTML` already calls `DOMPurify.sanitize`. That is circular by definition - sanitizing would call the policy, which sanitizes by calling DOMPurify again - and DOMPurify will throw a descriptive `TypeError` to prevent the infinite recursion. Your own policy should call DOMPurify; DOMPurify should not be configured to call your policy.
L204: 
L205: If you want this `default`-policy pattern applied across an entire page automatically - so that every HTML sink is sanitized, including legacy code, third-party widgets, and the thousands of `innerHTML` assignments you cannot easily find or rewrite - have a look at [DOMFortify](https://github.com/cure53/DOMFortify). It installs exactly such a Trusted Types `default` policy backed by DOMPurify and refuses script sinks (`eval`, `script.src`, ...) outright. It is a deliberately separate project: DOMPurify stays a focused sanitizer, and DOMFortify handles the document-wide enforcement layer that is intentionally out of DOMPurify's scope.
L206: 
L207: ## Can I configure DOMPurify?
L208: 
L209: Yes. The included default configuration values are pretty good already - but you can of course override them. Check out the [`/demos`](https://github.com/cure53/DOMPurify/tree/main/demos) folder to see a bunch of examples on how you can [customize DOMPurify](https://github.com/cure53/DOMPurify/tree/main/demos#what-is-this).
L210: 
L211: Before you widen the allow-list (`ADD_TAGS`, `ADD_ATTR`, `CUSTOM_ELEMENT_HANDLING`, …) or relax a default, it's worth skimming the [tags and attributes to think twice about](https://github.com/cure53/DOMPurify/wiki/Security-Goals-&-Threat-Model#dangerous-tags-and-attributes-think-twice-before-allow-listing) - a few are dangerous in non-obvious ways.
L212: 
L213: ### General settings
L214: 
L215: ```js
L216: // strip {{ ... }}, ${ ... } and <% ... %> to make output safe for template systems
L217: // be careful please, this mode is not recommended for production usage.
L218: // allowing template parsing in user-controlled HTML is not advised at all.
L219: // only use this mode if there is really no alternative.
L220: const clean = DOMPurify.sanitize(dirty, { SAFE_FOR_TEMPLATES: true });
L221: 
L222: // change how e.g. comments containing risky HTML characters are treated.
L223: // be very careful, this setting should only be set to `false` if you really only handle
L224: // HTML and nothing else, no SVG, MathML or the like.
L225: // Otherwise, changing from `true` to `false` will lead to XSS in this or some other way.
L226: const clean = DOMPurify.sanitize(dirty, { SAFE_FOR_XML: false });
L227: ```
L228: 
L229: ### Control our allow-lists and block-lists
L230: 
L231: ```js
L232: // allow only <b> elements, very strict
L233: const clean = DOMPurify.sanitize(dirty, { ALLOWED_TAGS: ['b'] });
L234: 
L235: // allow only <b> and <q> with style attributes
L236: const clean = DOMPurify.sanitize(dirty, {
L237:   ALLOWED_TAGS: ['b', 'q'],
L398: // return a DOM DocumentFragment instead of an HTML string (default is false)
L399: const clean = DOMPurify.sanitize(dirty, { RETURN_DOM_FRAGMENT: true });
L400: 
L401: // use the RETURN_TRUSTED_TYPE flag to turn on Trusted Types support if available
L402: const clean = DOMPurify.sanitize(dirty, { RETURN_TRUSTED_TYPE: true }); // will return a TrustedHTML object instead of a string if possible
L403: 
L404: // use a provided Trusted Types policy
L405: const clean = DOMPurify.sanitize(dirty, {
L406:   // supplied policy must define createHTML and createScriptURL
L407:   TRUSTED_TYPES_POLICY: trustedTypes.createPolicy('dompurify', {
L408:     createHTML(s) {
L409:       return s;
L410:     },
L411:     createScriptURL(s) {
L412:       return s;
L413:     },
L414:   }),
L415: });
L416: 
L417: // opt out of DOMPurify's internal `dompurify` Trusted Types policy entirely
L418: // (useful when your CSP `trusted-types` allowlist does not include `dompurify`)
L419: const clean = DOMPurify.sanitize(dirty, { TRUSTED_TYPES_POLICY: null });
L420: ```
L421: 
L422: ### Influence how we sanitize
L423: 
L424: ```js
L425: // return entire document including <html> tags (default is false)
L426: const clean = DOMPurify.sanitize(dirty, { WHOLE_DOCUMENT: true });
L427: 
L428: // disable DOM Clobbering protection on output (default is true, handle with care, minor XSS risks here)
L429: const clean = DOMPurify.sanitize(dirty, { SANITIZE_DOM: false });
L460: ### Influence where we sanitize
L461: 
L462: ```js
L463: // use the IN_PLACE mode to sanitize a node "in place", which is much faster depending on how you use DOMPurify
L464: const dirty = document.createElement('a');
L465: dirty.setAttribute('href', 'javascript:alert(1)');
L466: 
L467: const clean = DOMPurify.sanitize(dirty, { IN_PLACE: true }); // see https://github.com/cure53/DOMPurify/issues/288 for more info
L468: ```
L469: 
L470: A few things to know about `IN_PLACE`:
L471: 
L472: - The root node you pass in must itself be an allowed tag and must not be DOM-clobbered (for example a `<form>` with a child named `nodeName` or `ownerDocument`). If it is, DOMPurify strips the root's subtree of every non-allow-listed attribute and then throws a `TypeError`, so a rejected root is never handed back armed.
L473: - If anything throws mid-walk, the same fail-closed neutralization runs over the root and over every subtree already detached during that walk before the error propagates.
L474: - Nodes that a hook detaches from the tree (a common pattern, see [Hooks](#hooks)) are treated as removed. In `IN_PLACE` mode their subtree is neutralized inline, so an `<img onload>` that was already loading when you built the live tree cannot fire after `sanitize()` returns.
L475: - DOMPurify cannot undo engine mutations that already fired _before_ `sanitize()` was called (a patch applied on connection, a `selectedcontent` re-clone, and so on). Sanitize attacker-controlled trees before connecting them to the live document, not after.
L476: 
L477: There is even [more examples here](https://github.com/cure53/DOMPurify/tree/main/demos#what-is-this), showing how you can run, customize and configure DOMPurify to fit your needs.
L478: 
L479: ## Persistent Configuration
L480: 
L481: Instead of repeatedly passing the same configuration to `DOMPurify.sanitize`, you can use the `DOMPurify.setConfig` method. Your configuration will persist until your next call to `DOMPurify.setConfig`, or until you invoke `DOMPurify.clearConfig` to reset it. Remember that there is only one active configuration, which means once it is set, all extra configuration parameters passed to `DOMPurify.sanitize` are ignored.
L482: 
L483: ## Hooks
L484: 
L485: DOMPurify allows you to augment its functionality by attaching one or more functions with the `DOMPurify.addHook` method to one of the following hooks:
L511: 
L512: ### Hook behavior worth knowing
L513: 
L514: - **Detaching a node from a hook is supported.** If a `beforeSanitizeElements` or `uponSanitizeElement` hook removes the current node from the tree (for example `node.remove()` to drop a `foreignObject`), DOMPurify treats the node as removed and stops processing it. Such nodes are not recorded in `DOMPurify.removed`. In `IN_PLACE` mode the detached subtree is still neutralized (since 3.4.13), because a live node may carry an already-queued resource event.
L515: - **`afterSanitizeElements` runs for kept custom elements, too.** Since 3.4.12, an element admitted via `CUSTOM_ELEMENT_HANDLING.tagNameCheck` goes through `afterSanitizeElements` exactly like an allow-listed element, so a policy applied in that hook (for example stripping an attribute from every surviving element) cannot silently skip custom elements ([GHSA-c2j3-45gr-mqc4](https://github.com/cure53/DOMPurify/security/advisories/GHSA-c2j3-45gr-mqc4)).
L516: - **Prefer `hookEvent.keepAttr` / `forceKeepAttr` over writing to `hookEvent.allowedAttributes` or `allowedTags`.** The per-node flags cannot leak. Writes to the allow-list objects are isolated per call, including when the hook is installed lazily from inside another hook and when a persistent config from `setConfig()` is active ([GHSA-cmwh-pvxp-8882](https://github.com/cure53/DOMPurify/security/advisories/GHSA-cmwh-pvxp-8882)), but they remain the sharper tool.
L517: - **`afterSanitize*` hooks run after validation.** Whatever you write there is not re-checked. Put attacker-influenced values through `uponSanitize*` hooks instead.
L518: 
L519: ### A note on calling `sanitize()` from a hook
L520: 
L521: **`DOMPurify.sanitize()` is not re-entrant.** Please do not call it from inside a hook, or from a configuration callback such as `CUSTOM_ELEMENT_HANDLING.tagNameCheck` or `attributeNameCheck`. Those callbacks run in the _middle_ of an active sanitizer pass.
L522: 
L523: A nested `sanitize()` call re-reads the configuration handed to it and, in doing so, **replaces the configuration the outer pass is still using**. The rest of the outer document is then sanitized against the nested call's configuration instead of yours. Since the nested call typically runs with the default configuration, a strict `ALLOWED_TAGS` allow-list can silently widen back to the default one part-way through a document, with no error and no warning.
L524: 
L525: If you need to sanitize nested markup, for example an HTML fragment carried inside an attribute value, you have two safe options. Either set your configuration once with [`DOMPurify.setConfig`](#persistent-configuration) instead of passing it per call, since a persistent configuration is shared by the nested call and stays in effect for the whole pass; or collect the fragments during the hook and sanitize them with a separate `sanitize()` call _after_ the outer one has returned.
L551: These are our npm scripts:
L552: 
L553: - `npm run dev` to build the unminified UMD bundle while watching sources for changes
L554: - `npm run test` to lint the sources, run tests through jsdom, and run browser tests in Chromium via Playwright
L555:   - `npm run test:jsdom` to only run tests through jsdom
L556:   - `npm run test:happydom` to run the suite through happy-dom (an unsupported environment; kept as a robustness check, not a compatibility promise)
L557:   - `npm run test:browser` to only run tests through Playwright
L558:   - `npm run test:browser:legacy` to run the suite on older browser engines (point `PW_MODULE` at a pinned old Playwright install; see `.github/workflows/legacy-browsers.yml`)
L559:   - `npm run test:ci` to run the CI test flow for jsdom and Playwright
L560:   - `npm run test:fuzz` to run a small fuzzer covering `sanitize()` and CONFIG
L561: - `npm run bench` to run the jsdom micro-benchmark over the built `dist/purify.cjs` (build first; `--json` and `--compare a.json b.json` support A/B runs across branches - results are directional, confirm user-facing claims in real browsers)
L562: - `npm run coverage` to build an instrumented bundle, run the jsdom suite, and write a local HTML line/branch coverage report to `coverage/index.html` (jsdom scope only, not run in CI)
L563:   - `npm run build:cov` to only build the instrumented coverage bundle
L564: - `npm run lint` to lint the sources using ESLint via xo
L565: - `npm run format` to format JavaScript/TypeScript and Markdown sources with Prettier
L566:   - `npm run format:js` to only format JavaScript/TypeScript sources
L567:   - `npm run format:md` to only format Markdown files
L568: - `npm run build` to build type declarations and distribution bundles, then fix and clean up generated types
L569:   - `npm run build:types` to only emit TypeScript declaration files
L570:   - `npm run build:rolldown` to build all Rolldown bundles
L571:   - `npm run build:umd` to only build an unminified UMD bundle
L572:   - `npm run build:umd:min` to only build a minified UMD bundle
L573:   - `npm run build:es` to only build the ES module bundle
