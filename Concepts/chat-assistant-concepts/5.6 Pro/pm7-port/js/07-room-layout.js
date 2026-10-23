/* The turn's room floor has one consumer. Keep its measured root value for
   readers, but publish it directly to the transcript list; the registered
   property does not invalidate every message on each spring frame. */
(function () {
  'use strict';
  var style = window.PM56_ROOT_STYLE, value = '', inner = null;
  var set = style.setProperty, remove = style.removeProperty;
  function consumer() {
    if (inner && inner.isConnected) return inner;
    var root = document.getElementById('pmRoot');
    inner = root && root.querySelector('.chat-stage .transcript-inner');
    return inner;
  }
  function publish() {
    var node = consumer();
    if (!node) return;
    if (!value) node.style.removeProperty('--tx-hold-min');
    else if (node.style.getPropertyValue('--tx-hold-min') !== value)
      node.style.setProperty('--tx-hold-min', value);
  }
  style.setProperty = function (name, next) {
    set.call(style, name, next);
    if (name === '--tx-hold-min') { value = String(next); publish(); }
  };
  style.removeProperty = function (name) {
    remove.call(style, name);
    if (name === '--tx-hold-min') { value = ''; publish(); }
  };
  // A keyed patch must retain the floor between its before/after measurements.
  window.PM56_ROOM_STYLE = function () { return value ? '--tx-hold-min:' + value + ';' : ''; };
})();
