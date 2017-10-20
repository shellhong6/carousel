(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.carousel = factory());
}(this, (function () { 'use strict';

//auto carousel
var _autoCarouselHandle = null;
var _doAutoCarousel = function _doAutoCarousel() {
  if (g_isAutoCarousel && g_liChildrenLen > 1 && _autoCarouselHandle == null) {
    _autoCarouselHandle = setInterval(function () {
      _doEndAnimate(g_ul, 0, 'left');
    }, g_opt.autoCarouselTime || 5000);
  }
};
var _unAutoCarousel = function _unAutoCarousel() {
  if (_autoCarouselHandle != null) {
    clearInterval(_autoCarouselHandle);
    _autoCarouselHandle = null;
  }
};
//utils
var _getDataType = function _getDataType(o) {
  return Object.prototype.toString.call(o);
};
//listener set
var _dealTEndListener = function _dealTEndListener(nodes, fn, cb) {
  var els = [nodes];
  if (Object.prototype.toString.call(nodes).toLowerCase() == '[object array]') {
    els = nodes;
  }
  els.forEach(function (el) {
    cb && cb(el, fn);
  });
};
var _addTEndListener = function _addTEndListener(nodes, fn) {
  _dealTEndListener(nodes, fn, function (el, _fn) {
    el.addEventListener('webkitTransitionEnd', _fn);
    el.addEventListener('transitionend', _fn);
    if (!el['data-fns']) {
      el['data-fns'] = [];
    }
    el['data-fns'].push(_fn);
  });
};
//dom utils set
var _getMoveDistance = function _getMoveDistance() {
  if (g_isParallelType) {
    return g_liWidth;
  }
  return g_containerW;
};
var _initUlPosition = function _initUlPosition() {
  var index = Math.floor((g_liChildrenLen - 1) / 2),
      temp = index * _getMoveDistance();
  g_liCur = index;
  _setTranslate3d(g_ul, -temp);
  g_ul['data-translate'] = -temp;
};
var _getData = function _getData(data) {
  if (data.length > 1 && data.length < 5) {
    return _getData(data.concat(data));
  }
  return data;
};
var _initContainer = function _initContainer() {
  g_container.style.position = 'relative';
};
var _fillHtml = function _fillHtml(data) {
  data = _getData(data);
  if (!data) {
    return;
  }
  var html = '';
  data.forEach(function (item) {
    html += LI_TEMPLATE.replace('{{url}}', item);
  });
  html = UL_TEMPLATE.replace('{{lis}}', html);
  g_container.innerHTML = html;
};
var _initLiScale = function _initLiScale() {
  if (g_isScaleType) {
    var index = _getLiChildrenIndex();
    g_liChildren.forEach(function (li, i) {
      if (i != index) {
        _setScale(g_liChildren[i], g_opt.rate);
      }
    });
  }
};
var _initLiRange = function _initLiRange() {
  g_liMax = g_liChildrenLen - 1;
};
var _setTransform = function _setTransform(el, reg, result) {
  if (reg.test(el.style.transform)) {
    el.style.transform = el.style.transform.replace(reg, result);
  } else {
    el.style.transform += result;
  }
};
var _setWebkitTransform = function _setWebkitTransform(el, reg, result) {
  if (reg.test(el.style.transform)) {
    el.style.webkitTransform = el.style.webkitTransform.replace(reg, result);
  } else {
    el.style.webkitTransform += result;
  }
};
var _setTranslate3d = function _setTranslate3d(el, x) {
  _setTransform(el, /translate3d\([^)]+\)/, ' translate3d(' + x + 'px, 0, 0) ');
  _setWebkitTransform(el, /-webkit-translate3d\([^)]+\)/, ' -webkit-translate3d(' + x + 'px, 0, 0) ');
};
var _setScale = function _setScale(el, r) {
  _setTransform(el, /scaleY\([^)]+\)/, ' scaleY(' + r + ') ');
  _setWebkitTransform(el, /-webkit-scaleY\([^)]+\)/, ' -webkit-scaleY(' + r + ') ');
};
var _setCurLiScale = function _setCurLiScale(totalOffsetX) {
  if (g_isScaleType) {
    totalOffsetX = Math.abs(totalOffsetX);
    var r = 1 - (1 - g_opt.rate) * totalOffsetX / g_liWidth;
    if (r < g_opt.rate) {
      r = g_opt.rate;
    }
    _setScale(g_liChildren[_getLiChildrenIndex()], r);
  }
};
var _seNextLiScale = function _seNextLiScale(totalOffsetX) {
  if (g_isScaleType) {
    var _totalOffsetX = Math.abs(totalOffsetX);
    var r = g_opt.rate + (1 - g_opt.rate) * _totalOffsetX / g_liWidth;
    if (r > 1) {
      r = 1;
    }
    if (totalOffsetX > 0) {
      _setScale(g_liChildren[_getPreLiChildrenIndex()], r);
    } else {
      _setScale(g_liChildren[_getNextLiChildrenIndex()], r);
    }
  }
};
var _setUlX = function _setUlX(el, x) {
  var t = el['data-translate'];
  _setTranslate3d(el, x + t);
  el['data-translate'] = x + t;
};
var _initLiWH = function _initLiWH() {
  g_liChildren.forEach(function (li) {
    if (g_isParallelType) {
      li.style.width = g_liWidth - g_opt.marginR + 'px';
    } else {
      li.style.width = g_liWidth + 'px';
    }
    li.style.height = g_liHeight + 'px';
  });
};
var _getDiff = function _getDiff() {
  if (g_isScaleType) {
    return g_opt.gap * g_liChildrenLen;
  }
  return 0;
};
var _getLiChildrenIndex = function _getLiChildrenIndex() {
  var r = g_liCur % g_liChildrenLen;
  return r < 0 ? r + g_liChildrenLen : r;
};
var _getPreLiChildrenIndex = function _getPreLiChildrenIndex() {
  var r = (g_liCur - 1) % g_liChildrenLen;
  return r < 0 ? r + g_liChildrenLen : r;
};
var _getNextLiChildrenIndex = function _getNextLiChildrenIndex() {
  var r = (g_liCur + 1) % g_liChildrenLen;
  return r < 0 ? r + g_liChildrenLen : r;
};
var _initLiPosition = function _initLiPosition() {
  var temp = _getDiff();
  g_liChildren.forEach(function (li, index) {
    _setTranslate3d(li, g_liWidth * index + temp);
  });
};
var _initLiChildren = function _initLiChildren() {
  g_liChildren = Array.prototype.slice.call(g_container.querySelectorAll('li'));
  g_liChildrenWithPos = g_liChildren.slice(0);
  g_liChildrenLen = g_liChildren.length;
};
var _getLiWidth = function _getLiWidth() {
  g_containerW = g_container.offsetWidth;
  if (g_isScaleType) {
    if (_getDataType(g_opt.gap).toLowerCase() == '[object string]' && g_opt.gap.indexOf('%') != -1) {
      g_opt.gap = g_containerW * parseFloat(g_opt.gap.replace('%', '')) / 100;
    }
    return g_containerW - g_opt.gap * 2;
  }
  if (g_isParallelType) {
    if (_getDataType(g_opt.width).toLowerCase() == '[object string]' && g_opt.width.indexOf('%') != -1) {
      g_opt.width = g_containerW * parseFloat(g_opt.width.replace('%', '')) / 100;
    }
    if (_getDataType(g_opt.marginR).toLowerCase() == '[object string]' && g_opt.marginR.indexOf('%') != -1) {
      g_opt.marginR = g_containerW * parseFloat(g_opt.marginR.replace('%', '')) / 100;
    }
    return g_opt.width + g_opt.marginR;
  }
  return g_containerW;
};
//end animate set
var _addEndAnimation = function _addEndAnimation(el, d, fn) {
  el.style.transition = 'transform ' + (g_opt.animateTime || END_TIME) + 's ease-out';
  el.style.webkitTransition = '-webkit-transform ' + (g_opt.animateTime || END_TIME) + 's ease-out';
  el.offsetWidth;
  // _setUlX(el, distance);
  fn(el, d);
  if (!el.hasAddTEndListener) {
    el.hasAddTEndListener = true;
    _addTEndListener(el, function () {
      _removeEndAnimation(el);
      _doAutoCarousel();
    });
  }
};
var _removeEndAnimation = function _removeEndAnimation(el) {
  el.style.transition = 'unset';
  el.style.webkitTransition = 'unset';
  g_isEndAnimating = false;
  el.hasAddTEndListener = false;
};
var _doEndAnimate = function _doEndAnimate(el, offset, direction) {
  if (offset == 0 && !direction) {
    return;
  }
  g_isEndAnimating = true;
  if (Math.abs(offset) > EFFECT_DISTANCE || direction) {
    if (offset > 0 || direction == 'r') {
      //右移
      _addEndAnimation(el, g_liWidth - offset, _setUlX);
      if (g_isScaleType) {
        _addEndAnimation(g_liChildren[_getLiChildrenIndex()], g_opt.rate, _setScale);
        _addEndAnimation(g_liChildren[_getPreLiChildrenIndex()], 1, _setScale);
      }
      _fixLiWhenMoveR();
    } else {
      //左移
      if (g_isScaleType) {
        _addEndAnimation(g_liChildren[_getLiChildrenIndex()], g_opt.rate, _setScale);
        _addEndAnimation(g_liChildren[_getNextLiChildrenIndex()], 1, _setScale);
      }
      _addEndAnimation(el, -g_liWidth - offset, _setUlX);
      _fixLiWhenMoveL();
    }
  } else {
    //回滚
    if (g_isScaleType) {
      _addEndAnimation(g_liChildren[_getLiChildrenIndex()], 1, _setScale);
      _addEndAnimation(g_liChildren[_getNextLiChildrenIndex()], g_opt.rate, _setScale);
      _addEndAnimation(g_liChildren[_getPreLiChildrenIndex()], g_opt.rate, _setScale);
    }
    _addEndAnimation(el, -offset, _setUlX);
  }
};
var _fixLiWhenMoveL = function _fixLiWhenMoveL() {
  g_liCur++;
  if (g_liMax - g_liCur < 2) {
    g_liMax++;
    g_liMin++;
    var li = g_liChildrenWithPos.shift();
    g_liChildrenWithPos.push(li);
    _setTranslate3d(li, g_liMax * g_liWidth + _getDiff());
  }
};
var _fixLiWhenMoveR = function _fixLiWhenMoveR() {
  g_liCur--;
  if (g_liCur - g_liMin < 2) {
    g_liMin--;
    g_liMax--;
    var li = g_liChildrenWithPos.pop();
    g_liChildrenWithPos.unshift(li);
    _setTranslate3d(li, g_liMin * g_liWidth + _getDiff());
  }
};

var EFFECT_DISTANCE = 30;
var END_TIME = .2;
var LI_TEMPLATE = '<li style=\'position:absolute;background-size: cover;background-image: url({{url}});-webkit-backface-visibility:hidden;backface-visibility:hidden;user-select:none;\'></li>';
var UL_TEMPLATE = '<ul style=\'position:relative;list-style-type:none;padding:0;margin:0;\'>{{lis}}</ul>';

var g_container = null;
var g_containerW = 0;
var g_liChildren = null;
var g_liChildrenWithPos = null;
var g_liChildrenLen = 0;
var g_liWidth = 0;
var g_liHeight = 0;
var g_ul = null;
var g_isEndAnimating = false;
var g_liMin = 0;
var g_liMax = 0;
var g_liCur = 0;
var g_opt = null;
var g_isScaleType = false;
var g_isAutoCarousel = false;
var g_isParallelType = false;
var carousel = {
  init: function init(container, data) {
    var opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    g_container = container;
    g_opt = opt;
    g_isScaleType = 'scale' == opt.type;
    g_isParallelType = 'parallel' == opt.type;
    g_isAutoCarousel = true == opt.isAutoCarousel;
    _fillHtml(data);
    _initContainer();
    g_liChildren = g_container.querySelectorAll('li');
    g_liChildrenLen = g_liChildren.length;
    var onlyOne = g_liChildrenLen == 1;
    g_ul = g_container.querySelector('ul');
    g_liWidth = _getLiWidth();
    g_liHeight = g_container.offsetHeight;
    if (!g_liChildrenLen) {
      return;
    }
    if (!onlyOne) {
      _initLiChildren();
    }
    _initLiWH();
    if (onlyOne) {
      //一个元素，无需切换图片
      return;
    }
    _initLiPosition();
    _initUlPosition();
    _initLiScale();
    _initLiRange();
    this.addEvent();
    _doAutoCarousel();
  },
  addEvent: function addEvent() {
    var startX = 0,
        startY = 0,
        moveX = 0,
        moveY = 0,
        moveOffsetX = 0,
        moveOffsetY = 0,
        totalOffsetX = 0,
        totalOffsetY = 0,
        isStarted = false,
        clientX = 0,
        clientY = 0;
    function _reset() {
      isStarted = false;
      moveOffsetX = 0;
      moveOffsetY = 0;
      totalOffsetX = 0;
      totalOffsetY = 0;
    }
    function _doEnd() {
      _doEndAnimate(g_ul, totalOffsetX);
    }
    g_container.addEventListener('touchstart', function (event) {
      isStarted = true;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    });
    g_container.addEventListener('touchmove', function (event) {
      if (!isStarted || g_isEndAnimating) {
        return;
      }
      var isFirst = moveOffsetX == 0 && moveOffsetY == 0;
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
      moveOffsetX = clientX - (moveX || startX);
      moveOffsetY = clientY - (moveY || startY);
      moveX = clientX;
      moveY = clientY;
      if (isFirst) {
        //第一次move,仅做方向判断，不移动
        if (Math.abs(moveOffsetX) < Math.abs(moveOffsetY)) {
          //上下优先
          _reset();
          return;
        }
      } else {
        _unAutoCarousel();
        totalOffsetX += moveOffsetX;
        totalOffsetY += moveOffsetY;
        _setUlX(g_ul, moveOffsetX);
        _setCurLiScale(totalOffsetX);
        _seNextLiScale(totalOffsetX);
      }
      event.preventDefault();
      event.stopPropagation();
    });
    g_container.addEventListener('touchend', function (event) {
      if (!isStarted) {
        return;
      }
      _doEnd();
      _reset();
    });
    g_container.addEventListener('touchcancel', function (event) {
      if (!isStarted) {
        return;
      }
      _doEnd();
      _reset();
    });
  }
};

return carousel;

})));
