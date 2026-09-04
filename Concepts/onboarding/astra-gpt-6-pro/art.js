/* Astra / eight original vector worlds. No network, canvas loop, or stock imagery. */
(() => {
'use strict';
const stars = (color, n=24) => Array.from({length:n},(_,i)=>`<circle cx="${28+(i*73)%400}" cy="${42+(i*113)%340}" r="${i%4===0?1.8:.8}" fill="${color}" opacity="${.22+(i%5)*.13}"/>`).join('');
const svg = (id, defs, body) => `<svg viewBox="0 0 460 570" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
const grad=(id,a,b,x='0',y='1')=>`<linearGradient id="${id}" x1="0" y1="0" x2="${x}" y2="${y}"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const worlds={
'friendly-light': () => svg('garden',grad('fg-sky','#f3dfc2','#f4c9b4')+grad('fg-arch','#faefe0','#d69e85')+grad('fg-leaf','#8aa88b','#375f4b')+grad('fg-pot','#dc936d','#a35540'),`
<rect width="460" height="570" fill="url(#fg-sky)"/><circle cx="340" cy="119" r="54" fill="#fff6da"/>
<path d="M0 394C120 331 262 429 460 354V570H0Z" fill="#f0c0a4"/><path d="M0 461C152 401 264 466 460 414V570H0Z" fill="#e4af91"/>
<ellipse cx="231" cy="436" rx="148" ry="25" fill="#af7864" opacity=".15"/>
<g class="as-art-float"><path d="M119 403V234a111 111 0 01222 0v169h-34V234a77 77 0 00-154 0v169Z" fill="url(#fg-arch)" stroke="#fff5e5" stroke-width="2"/>
<path d="M154 401V237a76 76 0 01152 0v164" stroke="#b98972" stroke-width="2"/>
<path d="M139 394h184v18H139Z" fill="#fae8d3"/><path d="M126 412h210v15H126Z" fill="#ddb399"/>
<g class="as-art-sway" style="transform-origin:235px 346px"><path d="M233 351V267M233 315l-36-27M233 297l34-38" stroke="#48684f" stroke-width="4" stroke-linecap="round"/>
<path d="M232 308c-1-40-42-52-51-24 6 23 29 31 51 24Z" fill="url(#fg-leaf)"/><path d="M237 287c-5-40 15-63 38-49 15 23-1 46-38 49Z" fill="url(#fg-leaf)"/>
<path d="M231 267c-27-20-26-53-9-57 23 9 32 33 9 57Z" fill="#739376"/>
</g><path d="M202 333h64l-9 49h-46Z" fill="url(#fg-pot)"/><ellipse cx="234" cy="334" rx="32" ry="8" fill="#e9ac80"/><ellipse cx="234" cy="334" rx="23" ry="4" fill="#8e5643"/>
<rect x="293" y="372" width="31" height="15" rx="5" fill="#98aca1"/><rect x="285" y="387" width="39" height="8" rx="3" fill="#ba7560"/>
</g><g class="as-art-orbit"><path d="M84 212c9-15 18-12 19-3-6 9-17 9-19 3Z" fill="#fff6e7"/><path d="M84 212c-9-15-18-12-19-3 6 9 17 9 19 3Z" fill="#db977d"/></g>
<path d="M72 425v-59m0 28c-18-22-26-18-23-4 5 8 16 8 23 4Zm1-16c18-28 30-26 24-11-4 10-15 14-24 11Z" stroke="#68866e" stroke-width="3" fill="#76917a"/>
`),
'friendly-dark': () => svg('lantern',grad('fd-sky','#192e32','#30434c')+grad('fd-moon','#ffebb8','#c58c60')+grad('fd-isle','#718d78','#314e48'),`
<rect width="460" height="570" fill="url(#fd-sky)"/>${stars('#e8d3ac',32)}<circle cx="325" cy="142" r="53" fill="#f6d49d" opacity=".06"/><circle cx="325" cy="142" r="34" fill="url(#fd-moon)"/>
<path d="M0 452Q144 352 248 427T460 404V570H0Z" fill="#203b3e"/><path d="M0 503Q170 410 460 479V570H0Z" fill="#162e34"/>
<g class="as-art-float"><path d="M113 385Q226 340 348 385L317 424 250 452 173 437Z" fill="url(#fd-isle)"/><ellipse cx="230" cy="382" rx="118" ry="24" fill="#819581"/>
<path d="M165 378V251l64-46 64 46v127Z" fill="#345350" stroke="#9aad8c" stroke-width="2"/>
<path d="M165 251l64-46 64 46M229 206v171M165 288h128" stroke="#b6bf9b" stroke-width="3"/>
<path d="M181 301h32v57h-32Z" fill="#dbab6b" opacity=".8"/><path d="M246 265h31v94h-31Z" fill="#ffdfa0" opacity=".8"/>
<path d="M195 377v-24m0 11c-18-15-26-9-14 1h14Zm0-5c18-28 24-22 20-7-3 6-11 9-20 7Z" fill="#9bbc87" stroke="#b2bd90" stroke-width="2"/>
<path d="M281 384v-46" stroke="#d4c6a0" stroke-width="2"/><rect x="274" y="322" width="14" height="21" rx="6" fill="#ffdda2"/>
</g><g class="as-art-float as-art-delay"><path d="M63 267q29-12 57 0l-17 26-26-3Z" fill="#567865"/><ellipse cx="92" cy="266" rx="29" ry="7" fill="#91a285"/><path d="M92 266v-31" stroke="#b2bd90" stroke-width="2"/><circle cx="92" cy="231" r="9" fill="#f1c383"/></g>
<g class="as-art-sway"><path d="M357 341v-34m0 8q-23-35-31-16 2 19 31 16Zm0-4q17-40 28-20-1 17-28 20Z" fill="#79987c" stroke="#9bb28f" stroke-width="2"/></g>
`),
'glass-light': () => svg('prism',grad('gl-sky','#e8f0f1','#e5d9ee')+grad('gl-arch','#ffffffb8','#a2adc080','1','1')+grad('gl-cut','#faffffcf','#8691cc55','1','1'),`
<rect width="460" height="570" fill="url(#gl-sky)"/><circle cx="235" cy="243" r="150" fill="#fff7e7" opacity=".64"/><circle cx="316" cy="180" r="64" fill="#fff9f2"/>
<path d="M0 395L460 315V570H0Z" fill="#cdd7e133"/><ellipse cx="234" cy="424" rx="124" ry="28" fill="#7986ae" opacity=".1"/>
<g class="as-art-float"><path d="M123 398V228a101 101 0 01202 0v170l-38 16V234a63 63 0 00-126 0v148Z" fill="url(#gl-arch)" stroke="white" stroke-width="1.6"/>
<path d="M123 398l29 17V245a81 81 0 01162 0v147l11 6V228a101 101 0 00-202 0Z" fill="url(#gl-cut)" stroke="#fcffff"/>
<path d="M123 398l38-16 126 32 38-16" stroke="white" stroke-width="2"/>
<path d="M216 251l62 40-27 92-68-48Z" fill="#e6b9c66b" stroke="white" stroke-width="1.3"/><path d="M216 251l-33 84 68 48 5-78Z" fill="#aac7d16b" stroke="white"/>
<path d="M216 251l40 54 22-14M256 305l-5 78" stroke="white"/>
</g><g class="as-art-orbit"><circle cx="99" cy="279" r="16" fill="#ffffff80" stroke="white"/><circle cx="351" cy="354" r="26" fill="#e1edf088" stroke="white"/></g>
<path d="M91 474h277M121 490h217" stroke="#b4baca" opacity=".5"/><path d="M358 106v16m-8-8h16" stroke="#8999b7"/>
`),
'glass-dark': () => svg('nocturne',grad('gd-sky','#101e30','#203b4b')+grad('gd-ring','#d4f2ee','#4e8eab','1','1')+grad('gd-prism','#71ddd9','#233b70','1','1'),`
<rect width="460" height="570" fill="url(#gd-sky)"/>${stars('#a9dbe1',38)}
<path d="M-20 440C120 293 326 429 504 277" stroke="#74b9c3" stroke-width="80" opacity=".035"/><path d="M-20 462C116 310 330 446 504 299" stroke="#9cb0ca" stroke-width="25" opacity=".055"/>
<ellipse cx="233" cy="449" rx="143" ry="30" fill="#040c15" opacity=".6"/>
<g class="as-art-float"><ellipse cx="227" cy="279" rx="120" ry="154" transform="rotate(24 227 279)" stroke="url(#gd-ring)" stroke-width="22"/><ellipse cx="224" cy="279" rx="119" ry="154" transform="rotate(24 224 279)" stroke="#b2eee3" stroke-width="1"/>
<path d="M227 198l70 96-70 91-62-102Z" fill="url(#gd-prism)" stroke="#bbf6ed" stroke-width="1.3"/><path d="M227 198l-6 98 76-2-70 91-6-89-56-13Z" fill="#417387" stroke="#94dcd5"/>
<path d="M227 198l70 96-76 2Z" fill="#a0dace" opacity=".4"/>
</g><g class="as-art-orbit"><circle cx="100" cy="168" r="20" fill="#163245" stroke="#a4d9da"/><circle cx="342" cy="368" r="11" fill="#c7eee2"/></g>
<path d="M48 452Q236 410 418 465" stroke="#5a899e" opacity=".28"/><path d="M54 474Q240 436 407 482" stroke="#5a899e" opacity=".16"/>
`),
'retro-light': () => svg('observatory',`<pattern id="rl-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" stroke="#a59c7940" stroke-width=".6"/></pattern>`,`
<rect width="460" height="570" fill="#efe7cb"/><rect width="460" height="570" fill="url(#rl-grid)"/>
<path d="M37 98h70m-70 0v54M422 458h-70m70 0v-54" stroke="#9f553c" stroke-width="2"/>
<circle cx="337" cy="133" r="33" stroke="#b17e45" stroke-width="2" stroke-dasharray="4 5"/>
<g class="as-art-float"><path d="M77 357l149-82 157 84-151 88Z" fill="#d1c7a9" stroke="#514e3e" stroke-width="2"/><path d="M77 357v21l155 89 151-88v-20l-151 88Z" fill="#9a987c" stroke="#514e3e" stroke-width="2"/>
<path d="M146 332v-83l84-48 85 46v85l-84 49Z" fill="#d8ad7a" stroke="#514e3e" stroke-width="2"/>
<path d="M146 249l84 48 85-50M230 297v84" stroke="#514e3e" stroke-width="2"/><path d="M160 245v-42l18-24h23v-19h54v19h25l20 26v42l-69 40Z" fill="#567c68" stroke="#514e3e" stroke-width="2"/>
<path d="M201 160l29 13 25-13M230 173v114M178 179l52 27 50-27" stroke="#a7b69a" stroke-width="2"/>
<path d="M208 218l53-42 25 12-56 45Z" fill="#b46343" stroke="#514e3e" stroke-width="2"/>
<path d="M275 172l17 10v22l-16-10Z" fill="#d9bb86" stroke="#514e3e" stroke-width="2"/>
<path d="M176 320v-40l25 15v40Z" fill="#656f59" stroke="#514e3e"/>
<path d="M255 323l34-19v27l-34 20Z" fill="#f2ddb5" stroke="#514e3e"/>
</g><path d="M64 196h24m-12-12v24M361 276h20m-10-10v20" stroke="#a46745" stroke-width="2"/>
<path d="M92 487h165m-165 6h108" stroke="#aca38b"/>
`),
'retro-dark': () => svg('station',`<pattern id="rd-grid" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0V26" stroke="#9bad5530" stroke-width=".8"/></pattern>`+grad('rd-ground','#273429','#101f22'),`
<rect width="460" height="570" fill="#162327"/><rect width="460" height="570" fill="url(#rd-grid)"/>${stars('#c2d89b',16)}
<circle cx="350" cy="135" r="32" fill="#b1ba70"/><path d="M330 111h40M321 124h57M321 138h60M326 151h48" stroke="#263930" stroke-width="5"/>
<g class="as-art-float"><path d="M72 350l154-90 163 89-158 99Z" fill="#354c43" stroke="#a2c484" stroke-width="2"/><path d="M72 350v29l159 100 158-100v-30l-158 99Z" fill="url(#rd-ground)" stroke="#789870" stroke-width="2"/>
<path d="M143 330v-65l40-25v-38l48-28 69 40v125l-72 44Z" fill="#557668" stroke="#b2ca91" stroke-width="2"/>
<path d="M231 174v121l69 44M143 265l85 49 72-41M228 314v69" stroke="#bbd397" stroke-width="2"/>
<path d="M158 272v-37l47 28v35Z" fill="#122b31" stroke="#b2ca91" stroke-width="2"/><path d="M169 249l24 14m-24-6l24 14m-24-6l15 9" stroke="#d7d089" stroke-width="2"/>
<path d="M248 220l35 20v27l-35-20Z" fill="#d0b47b" stroke="#e2d4aa"/><path d="M248 226l35 20m-35-12l35 20" stroke="#496654"/>
<path d="M213 371v-35l-19-11v35Z" fill="#132c2b"/>
<path d="M103 357l-14 8 18 10 14-8Z" fill="#d0b47b"/><path d="M324 369l21-13 18 10-20 13Z" fill="#cf9a76"/>
</g><path d="M53 100h42v8H53Zm0 16h28v3H53Zm307 343h38v4h-38Z" fill="#a6bf7c" opacity=".6"/>
`),
'basic-light': () => svg('sculpture',grad('bl-bg','#f2f1ed','#e2e1db')+grad('bl-arch','#fffcf5','#b2b4ad','1','1')+grad('bl-ball','#a2b4b0','#3c5c5a','1','1'),`
<rect width="460" height="570" fill="url(#bl-bg)"/><path d="M0 431l460-91v230H0Z" fill="#dbdbd4"/>
<ellipse cx="253" cy="438" rx="126" ry="18" fill="#777e78" opacity=".14"/>
<g class="as-art-float"><path d="M122 413V231a109 109 0 01218 0v182h-45V231a64 64 0 00-128 0v182Z" fill="url(#bl-arch)"/><path d="M122 413V231a109 109 0 01218 0" stroke="#fff" stroke-width="1.2"/>
<path d="M163 412V232a68 68 0 01136 0v180" stroke="#9da49b" stroke-width="1"/>
<circle cx="231" cy="305" r="51" fill="url(#bl-ball)"/><path d="M191 278c5-11 15-19 26-22" stroke="#d9e6df" stroke-width="2" stroke-linecap="round" opacity=".6"/>
<path d="M102 413h256v19H102Z" fill="#c5c8be"/><path d="M102 413h256" stroke="#fff"/>
</g><path d="M81 136v38m-19-19h38" stroke="#8e9a90"/><circle cx="360" cy="474" r="2" fill="#4a645c"/>
`),
'basic-dark': () => svg('eclipse',grad('bd-bg','#151c1e','#242e30')+grad('bd-ring','#a7bbb2','#253a39','1','1')+grad('bd-sphere','#c2c5b3','#465c55','1','1'),`
<rect width="460" height="570" fill="url(#bd-bg)"/><path d="M0 433L460 353V570H0Z" fill="#182224"/>
<ellipse cx="236" cy="442" rx="133" ry="22" fill="#0c1314" opacity=".65"/>
<g class="as-art-float"><ellipse cx="230" cy="276" rx="124" ry="157" transform="rotate(-19 230 276)" stroke="url(#bd-ring)" stroke-width="25"/>
<ellipse cx="230" cy="276" rx="136" ry="169" transform="rotate(-19 230 276)" stroke="#adc4b7" stroke-opacity=".3"/>
<circle cx="230" cy="279" r="55" fill="url(#bd-sphere)"/><path d="M195 253a44 44 0 0137-18" stroke="#dde2cb" opacity=".5" stroke-linecap="round"/>
<path d="M174 443h117" stroke="#567166" stroke-width="3"/>
</g><path d="M357 132v24m-12-12h24" stroke="#bdcabb" opacity=".65"/><path d="M69 367h31" stroke="#7a9186"/><circle cx="330" cy="441" r="4" fill="#bccdaf"/>
`)
};
window.ASTRA_ART={worlds,render(theme){return (worlds[theme]||worlds['friendly-light'])();}};
})();
