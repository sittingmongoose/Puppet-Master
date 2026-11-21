/* Pip's sound, round two (Fable 5.2). levels.js: measured, not written by hand (tools/checks/levels.check.mjs --set write=1).
   For each look: the dB each event and Pip's line ("say") move to sit at its target loudness; "look~take" is another
   take of the look's voice; a song's id has the dB that song moves ("music"). So a look is never louder than its
   neighbour and changing the song never jumps. */
(function (G) {
  'use strict';
  if (/[?&]notrims=1/.test(location.search)) return;
  const T = /* TRIMS:begin */{
    "basic": {"tap":6.5,"key":1,"select":-10,"toggleOn":-5.5,"toggleOff":-6,"next":-6.5,"back":-7,"open":-6,"close":-6.5,"warn":12,"lower":-8,"land":5.5,"lift":-7,"hop":12,"tryOn":-3,"sparkle":-5,"confetti":-10,"chapter":-7,"tick":-5,"block":-5.5,"power":-4,"score":12,"lock":12,"decode":12,"feed":12,"powerOn":-6.5,"powerOff":-8,"rail":12,"tip":-4,"cheer":-9.5,"crew":-8,"snore":-1.5,"think":-12,"wake":-6,"sleep":-2,"happy":-6,"wink":-4.5,"alert":-3,"say":-2.5},
    "basic~round1": {"say":-2.5},
    "c1-basic": {"music":3.5},
    "c1-friendly": {"music":-1},
    "c1-glass": {"music":2},
    "c1-nier": {"music":1.5},
    "c1-phosphor": {"music":1.5},
    "c1-teletype": {"music":1.5},
    "c2-basic": {"music":2.5},
    "c2-friendly": {"music":2.5},
    "c2-glass": {"music":2},
    "c2-nier": {"music":0.5},
    "c2-phosphor": {"music":0.5},
    "c2-teletype": {"music":4},
    "c3-basic": {"music":4.5},
    "c3-friendly": {"music":0},
    "c3-glass": {"music":1},
    "c3-nier": {"music":-1.5},
    "c3-phosphor": {"music":1.5},
    "c3-teletype": {"music":7},
    "friendly": {"tap":3,"key":2.5,"select":-7,"toggleOn":-6.5,"toggleOff":-3.5,"next":-4.5,"back":-4,"open":-4.5,"close":-5.5,"warn":12,"lower":-3,"land":5,"lift":-2,"hop":12,"tryOn":-5.5,"sparkle":-5,"confetti":-8.5,"chapter":-4.5,"tick":-3,"block":0,"power":-2.5,"score":12,"lock":12,"decode":12,"feed":12,"powerOn":-4.5,"powerOff":-6,"rail":10,"tip":-3.5,"cheer":-12.5,"crew":-7,"snore":-3,"think":-18,"wake":-4.5,"sleep":1.5,"happy":-2.5,"wink":1.5,"alert":-4,"say":-2},
    "friendly~round1": {"say":-3.5},
    "glass": {"tap":3,"key":3.5,"select":-10.5,"toggleOn":-4,"toggleOff":-2.5,"next":-6.5,"back":-6.5,"open":-3,"close":-4,"warn":12,"lower":-2.5,"land":9,"lift":-1.5,"hop":12,"tryOn":-5.5,"sparkle":-1.5,"confetti":-9.5,"chapter":-6,"tick":-5,"block":-5.5,"power":-2,"score":12,"lock":12,"decode":12,"feed":12,"powerOn":-3,"powerOff":-5,"rail":12,"tip":-2,"cheer":-14.5,"crew":-9,"snore":-0.5,"think":-18,"wake":-4.5,"sleep":-2.5,"happy":-7.5,"wink":-3,"alert":-9.5,"say":-2},
    "glass~original": {"say":-5},
    "glass~round1": {"say":-4},
    "nier": {"tap":11.5,"hover":12,"key":2,"select":-11.5,"toggleOn":-5.5,"toggleOff":-8,"next":-7.5,"back":-7.5,"open":-8,"close":-8,"warn":12,"lower":-4,"ghost":12,"land":7.5,"lift":-2.5,"tryOn":-2,"sparkle":-4,"confetti":-11.5,"chapter":-10.5,"tick":-5,"block":-10,"power":-6,"score":12,"lock":10,"decode":12,"feed":12,"powerOn":-8.5,"powerOff":-9,"rail":12,"tip":-4.5,"cheer":-9.5,"crew":-8.5,"snore":-2,"think":12,"wake":-0.5,"sleep":-2,"happy":-5.5,"wink":-5,"alert":-2,"say":-3},
    "nier~round1": {"say":-3},
    "orig-basic": {"music":-1.5},
    "orig-friendly": {"music":-8.5},
    "orig-glass": {"music":-3},
    "orig-nier": {"music":-5.5},
    "orig-phosphor": {"music":0},
    "orig-teletype": {"music":-6},
    "phosphor": {"tap":11.5,"key":8.5,"select":-3.5,"toggleOn":-0.5,"toggleOff":1,"next":-0.5,"back":-0.5,"open":2,"close":-0.5,"warn":12,"lower":10,"land":12,"lift":9,"hop":6.5,"tryOn":6.5,"sparkle":5,"confetti":-1,"chapter":0,"tick":1.5,"block":3,"power":1.5,"score":12,"lock":10,"decode":12,"degauss":12,"feed":12,"powerOn":0,"powerOff":12,"rail":12,"tip":1.5,"cheer":-10,"crew":-4.5,"snore":3,"think":-14,"wake":-5.5,"sleep":-6.5,"happy":-6.5,"wink":-3.5,"alert":-4,"say":-0.5},
    "phosphor~round1": {"say":-2.5},
    "teletype": {"tap":9.5,"key":4,"select":-10.5,"toggleOn":-7,"toggleOff":-4.5,"next":-1,"back":-6.5,"open":-5,"close":-6.5,"warn":12,"lower":-1.5,"land":12,"lift":-1.5,"hop":12,"tryOn":1.5,"sparkle":-3,"confetti":-10.5,"chapter":-6,"tick":-3,"block":-3.5,"power":-4,"score":12,"lock":12,"decode":12,"feed":12,"powerOn":8,"powerOff":4,"rail":12,"tip":-5,"cheer":-14,"crew":-9,"snore":-3.5,"think":-17.5,"wake":-9.5,"sleep":-10.5,"happy":-10.5,"wink":-8,"alert":-8.5,"say":-5},
    "teletype~round1": {"say":-3.5}
  }/* TRIMS:end */;
  G.PS5.TRIMS = T;
})(window);
