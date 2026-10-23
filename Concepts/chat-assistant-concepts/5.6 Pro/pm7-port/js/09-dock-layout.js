/* Both dock writers use the actual consumer. The composer ResizeObserver
   also runs during every Ask Card animation; routing only questions.js here
   left app.js publishing --decision-h on the whole chat stage every frame. */
(function () {
  'use strict';
  var decisionHeight = '0px', stageNode = null;
  window.PM56_DOCK_H = function (stage, value) {
    decisionHeight = value;
    var float = stage.querySelector('.chat-float');
    if (float && float.style.getPropertyValue('--decision-h') !== value)
      float.style.setProperty('--decision-h', value);
  };
  /* Preserve measured declarations in render markup. Removing and rebuilding
     these variables during each patch briefly changed inherited styles and
     forced layout before the post-render measurement could put them back. */
  window.PM56_DOCK_STYLE = function (float) {
    if (float) return '--decision-h:' + decisionHeight + ';';
    if (!stageNode || !stageNode.isConnected) {
      var root = document.getElementById('pmRoot');
      stageNode = root && root.querySelector('.chat-stage');
    }
    if (!stageNode) return '';
    return ['--chat-dock-h', '--thread-float-h', '--lens-strip-h'].map(function (name) {
      var value = stageNode.style.getPropertyValue(name);
      return value ? name + ':' + value + ';' : '';
    }).join('');
  };
})();
