/* O55.famWindow — the four looks' hero moments in the onboarding window, which are Pip's now (DL-238, O1: Pip replaces
   the per-look puppet scenes, every look reimagined). The troupe's wake, act cards and curtain calls went with the
   troupe; Pip's stage plays the moments itself, each in its world's own way (58-rig.js setChapter, 59-cheer.js):
     Basic     a chapter change is a small hop; a choice gets a check badge on its prop's corner and a ring spreading
     Friendly  Pip hops; stars, hearts and a wink at the end
     Glass     a light sweep across the stage; glints and rising bubbles
     Retro     Retro Dark degausses (the picture wobbles and tints, then settles), Retro Light feeds the paper up a page
   and Ready's curtain call is the crew's (Pips in a crown, a hard hat and glasses) with Pip's one wink. NieR Mode keeps
   its own window skin (O55.nierWindow, 66-nier-window.js), asked first; its stage moments are Pip's too (QUEST UPDATED
   and the two-band glitch, 54-art-nier.js). This skin answers only Ready, so the plain celebration does not play twice;
   nothing of the four looks runs long enough to need snapping on a key or a press. */
(function () {
  'use strict';
  const O55 = window.O55;
  const painted = () => document.documentElement.getAttribute('data-o55-nier') === 'on';
  const stage = () => { const r = O55.S && O55.S.root; return r && O55.pipStage && O55.pipStage.of ? O55.pipStage.of(r.querySelector('.o55-stage')) : null; };
  O55.famWindow = {
    /* Ready's curtain call (instead of the plain celebration, which stays for a window without Pip's stage) */
    ready(layer, fresh) { if (!fresh || painted()) return false; const st = stage(); if (!st) return false; st.curtainCall(); return true; }
  };
})();
