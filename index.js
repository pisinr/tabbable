var tabbableSelector = 'input, select, a, textarea, button, [tabindex]';

module.exports = function(el, selectorParam) {
  var basicTabbables = [];
  var orderedTabbables = [];

  if (!selectorParam) {
    selectorParam = tabbableSelector;
  }
  var candidateNodelist;
  if (typeof selectorParam == 'function') {
    candidateNodelist = selectorParam(el)
  } else {
    candidateNodelist = el.querySelectorAll(selectorParam);
  }
  var candidates = Array.prototype.slice.call(candidateNodelist);

  var candidate, candidateIndex;
  for (var i = 0, l = candidates.length; i < l; i++) {
    candidate = candidates[i];
    candidateIndex = candidate.tabIndex;

    if (
      candidateIndex < 0
      || (candidate.tagName === 'INPUT' && candidate.type === 'hidden')
      || (candidate.tagName === 'A' && !candidate.href && !candidate.tabIndex)
      || candidate.disabled
      || isHidden(candidate)
    ) {
      continue;
    }

    if (candidateIndex === 0) {
      basicTabbables.push(candidate);
    } else {
      orderedTabbables.push({
        tabIndex: candidateIndex,
        node: candidate,
      });
    }
  }

  var tabbableNodes = orderedTabbables
    .sort(function(a, b) {
      return a.tabIndex - b.tabIndex;
    })
    .map(function(a) {
      return a.node
    });

  Array.prototype.push.apply(tabbableNodes, basicTabbables);

  return tabbableNodes;
}

module.exports.DEFAULT_SELECTOR = tabbableSelector;

function setDefaultSelector(selector) {
  tabbableSelector = selectorParam(selector);
}
module.exports.setDefaultSelector = setDefaultSelector;

var nodeCache = {};
var nodeCacheIndex = 1;
function isHidden(node) {
  if (node === document.documentElement) {
    return false;
  }

  if (node.tabbableCacheIndex) {
    return nodeCache[node.tabbableCacheIndex];
  }

  var result = false;
  var style = window.getComputedStyle(node);
  if (style.visibility === 'hidden' || style.display === 'none') {
    result = true;
  } else if (node.parentNode) {
    result = isHidden(node.parentNode);
  }

  node.tabbableCacheIndex = nodeCacheIndex;
  nodeCache[node.tabbableCacheIndex] = result;
  nodeCacheIndex++;

  return result;
}
