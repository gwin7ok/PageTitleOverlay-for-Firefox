(function () {
  var DEFAULT = 'left-bottom';
  function log() { try { var a = Array.prototype.slice.call(arguments); a.unshift('[page-title-overlay]'); if (console && console.debug) console.debug.apply(console, a); } catch (e) { } }
  var form = document.getElementById('posForm');
  var status = document.getElementById('status');
  var enabledOn = document.getElementById('enabled_on');
  var enabledOff = document.getElementById('enabled_off');
  var fontInput = document.getElementById('fontSize');
  var colorForm = document.getElementById('colorForm');
  var statusColors = document.getElementById('statusColors');
  var bgInput = document.getElementById('bgColor');
  var textInput = document.getElementById('textColor');
  var bgAlphaInput = document.getElementById('bgAlpha');
  var bgAlphaVal = document.getElementById('bgAlphaVal');
  var textAlphaInput = document.getElementById('textAlpha');
  var textAlphaVal = document.getElementById('textAlphaVal');
  var saveAllBtn = document.getElementById('saveAll');
  // old options.js disabled
  /*
    This file was deprecated and replaced by page-title-overlay-options.js
  */
  console.warn('[page-title-overlay] deprecated: options.js replaced by page-title-overlay-options.js');
  radios[i].checked = (radios[i].value === val);
