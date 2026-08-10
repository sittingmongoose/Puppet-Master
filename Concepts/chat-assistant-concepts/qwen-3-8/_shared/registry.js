window.PMChatWindows = window.PMChatWindows || {};
window.PMChatThreads = window.PMChatThreads || {};

window.PMChatRegistry = (() => {
  const windowMeta = {
    w1: { id: "w1", label: "Masthead", blurb: "Two-row masthead with a corner-sprout chats drawer" },
    w2: { id: "w2", label: "Single Bar", blurb: "One 44px bar; every control lives in the popup family" },
    w3: { id: "w3", label: "Thread Shelf", blurb: "A horizontal shelf of compact thread cards" },
    w4: { id: "w4", label: "Corner Sockets", blurb: "Chrome clustered in the four corners of the frame" },
    w5: { id: "w5", label: "Chrome Spine", blurb: "A vertical icon spine beside the transcript" },
    w6: { id: "w6", label: "Chip Deck", blurb: "A free-reflowing deck of live chrome chips" },
    w7: { id: "w7", label: "Mini Rail", blurb: "A persistent thread-tile column that grows on demand" },
    w8: { id: "w8", label: "Pull Strips", blurb: "Three hairline strips that pull open one at a time" }
  };
  const threadMeta = {
    t1: { id: "t1", label: "Measured Prose", blurb: "Controlled measure with generous leading" },
    t2: { id: "t2", label: "Turn Plates", blurb: "Each turn on a plate with a compact header band" },
    t3: { id: "t3", label: "Working Margin", blurb: "Runtime metadata lives in a right-hand margin" },
    t4: { id: "t4", label: "Session Spine", blurb: "A neutral time rail with session ticks" },
    t5: { id: "t5", label: "Condenser", blurb: "Grouped turns and surfaces condensed to a chip strip" },
    t6: { id: "t6", label: "Dense Rows", blurb: "One-line rows that expand to full prose in place" },
    t7: { id: "t7", label: "Surfaces Aloft", blurb: "Pure conversation with dynamic surfaces held aloft" },
    t8: { id: "t8", label: "Chapters", blurb: "Day chapters with a jump map for very long threads" }
  };
  function windows() { return Object.values(windowMeta); }
  function threads() { return Object.values(threadMeta); }
  function windowLabel(id) { return windowMeta[id] ? windowMeta[id].label : id; }
  function threadLabel(id) { return threadMeta[id] ? threadMeta[id].label : id; }
  return { windowMeta, threadMeta, windows, threads, windowLabel, threadLabel };
})();
