(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.carousel = factory());
}(this, (function () { 'use strict';

// import WinChangedManage from '@flyme/utils/lib/appStoreClient/WinChangedManage'

//auto carousel
var _autoCarouselHandle = null;
var _doAutoCarousel = function _doAutoCarousel() {
  if (g_isParallelType) {
    return;
  }
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
var _sort = function _sort(data) {
  return data.splice(data.length - g_liCur, data.length).concat(data);
};
var _isPercentage = function _isPercentage(str) {
  return _getDataType(str).toLowerCase() == '[object string]' && str.indexOf('%') != -1;
};
var _getDataType = function _getDataType(o) {
  return Object.prototype.toString.call(o);
};
var _isLastButOneLi = function _isLastButOneLi() {
  return _getNextLiChildrenIndex() == g_startLiCur - 1;
};
var _isLastButTwoLi = function _isLastButTwoLi() {
  return _getNextLiChildrenIndex() == g_startLiCur - 2;
};
var _isLastLi = function _isLastLi() {
  return _getNextLiChildrenIndex() == g_startLiCur;
};
var _isFirstLi = function _isFirstLi() {
  return _getLiChildrenIndex() == g_startLiCur;
};
var _isSecondLi = function _isSecondLi() {
  return _getLiChildrenIndex() == g_startLiCur + 2;
};
var _getParallelRate = function _getParallelRate() {
  if (!_isLastLi()) {
    if (_isLastButOneLi()) {
      return g_parallel_lastButOne_move / g_containerW;
    } else {
      return g_liWidth / g_containerW;
    }
  }
  return 1;
};
var _parallel_simple_rate = null;
var _getParallelSimpleRate = function _getParallelSimpleRate() {
  if (!_parallel_simple_rate) {
    _parallel_simple_rate = g_liWidth / g_containerW;
  }
  return _parallel_simple_rate;
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
  if (g_isParallelType || g_isParallelSimpleType) {
    return g_liWidth;
  }
  return g_containerW;
};
var _initUlPosition = function _initUlPosition() {
  var temp = g_liCur * _getMoveDistance();
  if (g_isParallelSimpleType) {
    temp -= g_parallel_startX;
  }
  _setTranslate3d(g_ul, -temp);
};
var _fillIndexData = function _fillIndexData(data) {
  return data.map(function (item, index) {
    return {
      url: item,
      index: index
    };
  });
};
var _getData = function _getData(data) {
  if (data.length > 0 && data.length < 5) {
    return _getData(data.concat(data));
  }
  return data;
};
var _initContainer = function _initContainer() {
  g_container.style.position = 'relative';
};
var _fillHtml = function _fillHtml(data) {
  if (!data) {
    return;
  }
  var html = '';
  data.forEach(function (item) {
    html += LI_TEMPLATE.replace('{{url}}', item.url).replace('{{index}}', item.index);
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
  // if(isNaN(x)){
  //   console.log(el)
  //   console.trace();
  // }
  el['data-tx'] = x;
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
var _setNextLiParallel = function _setNextLiParallel(totalOffsetX, moveOffsetX) {
  if (!g_isParallelType) {
    return;
  }
  var el = g_liChildren[_getNextLiChildrenIndex()];
  var tx = el['data-tx'];
  if (g_parallel_liAnimating) {
    var temp = g_parallel_dragHolder - totalOffsetX;
    if (totalOffsetX < -g_parallel_dragHolder) {
      return;
    }
    if (totalOffsetX > 0) {
      return;
    }
    _setTranslate3d(el, tx + moveOffsetX);
  } else {
    if (_isLastLi()) {
      if (totalOffsetX < -g_parallel_dragHolder) {
        //最后一个元素的首次反弹效果
        g_parallel_pre_liAnimating = false;
        g_parallel_liAnimating = true;
        _addEndAnimation(el, g_liChildren[_getLiChildrenIndex()]['data-tx'] + g_parallel_startX + g_liWidth, _setTranslate3d);
      } else if (totalOffsetX < 0) {
        g_parallel_pre_liAnimating = true;
        _setTranslate3d(el, tx - moveOffsetX);
      }
    }
  }
};
var _setUlX = function _setUlX(el, x) {
  var t = el['data-tx'] || 0;
  _setTranslate3d(el, x + t);
};
var _initLiInfo = function _initLiInfo() {
  g_liChildren.forEach(function (li, index) {
    if (g_isParallelType || g_isParallelSimpleType) {
      li.style.width = g_opt.width + 'px';
    } else {
      li.style.width = g_liWidth + 'px';
    }
    li.style.height = g_liHeight + 'px';
    // li.setAttribute('data-index', index % g_dataLen);
  });
};
var _period = 0;
var _getDiffWhenMoveL = function _getDiffWhenMoveL() {
  if (g_isParallelType) {
    if (_isLastButTwoLi()) {
      _period += g_parallel_startX;
      var r = g_parallel_startX + _period;
      return r;
    } else {
      return g_parallel_startX + _period;
    }
  }
  return 0;
};
var _getDiffWhenMoveR = function _getDiffWhenMoveR() {
  if (g_isParallelType) {
    if (_isSecondLi()) {
      var r = -g_parallel_startX + _period;
      _period -= g_parallel_startX;
      return r;
    } else {
      return _period;
    }
  }
  return 0;
};
var _getStaticDiff = function _getStaticDiff() {
  if (g_isScaleType) {
    return g_opt.gap * g_liChildrenLen;
  }
  return 0;
};
var _getDiffWhenInit = function _getDiffWhenInit(index) {
  if (g_isParallelType && index >= g_liCur) {
    return g_parallel_startX;
  }
  return 0;
};
var _preLiIndex = {
  cur: null,
  real: 0
};
var _curLiIndexMap = {
  cur: null,
  real: 0
};
var _nextLiIndexMap = {
  cur: null,
  real: 0
};
var _getPreLiChildrenIndex = function _getPreLiChildrenIndex() {
  if (g_liCur === _preLiIndex.cur) {
    return _preLiIndex.real;
  }
  var r = (g_liCur - 1) % g_liChildrenLen;
  r = r < 0 ? r + g_liChildrenLen : r;
  _preLiIndex = {
    cur: g_liCur,
    real: r
  };
  return r;
};
var _getLiChildrenIndex = function _getLiChildrenIndex() {
  if (g_liCur === _curLiIndexMap.cur) {
    return _curLiIndexMap.real;
  }
  var r = g_liCur % g_liChildrenLen;
  r = r < 0 ? r + g_liChildrenLen : r;
  _curLiIndexMap = {
    cur: g_liCur,
    real: r
  };
  return r;
};
var _getNextLiChildrenIndex = function _getNextLiChildrenIndex() {
  if (g_liCur === _nextLiIndexMap.cur) {
    return _nextLiIndexMap.real;
  }
  var r = (g_liCur + 1) % g_liChildrenLen;
  r = r < 0 ? r + g_liChildrenLen : r;
  _nextLiIndexMap = {
    cur: g_liCur,
    real: r
  };
  return r;
};
var _initLiPosition = function _initLiPosition() {
  var temp = _getStaticDiff();
  g_liChildren.forEach(function (li, index) {
    _setTranslate3d(li, g_liWidth * index + temp + _getDiffWhenInit(index));
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
    if (_isPercentage(g_opt.gap)) {
      g_opt.gap = g_containerW * parseFloat(g_opt.gap.replace('%', '')) / 100;
    }
    return g_containerW - g_opt.gap * 2;
  }
  if (g_isParallelType || g_isParallelSimpleType) {
    if (_isPercentage(g_opt.width)) {
      g_opt.width = g_containerW * parseFloat(g_opt.width.replace('%', '')) / 100;
    }
    if (_isPercentage(g_opt.marginR)) {
      g_opt.marginR = g_containerW * parseFloat(g_opt.marginR.replace('%', '')) / 100;
    }
    if (g_isParallelType && _isPercentage(g_opt.dragHolder)) {
      g_opt.dragHolder = g_containerW * parseFloat(g_opt.dragHolder.replace('%', '')) / 100;
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
  // el.hasAddTEndListener = false;
};
var _doEndAnimate = function _doEndAnimate(el, offset, autoDirection) {
  if (offset == 0 && !autoDirection) {
    return;
  }
  var nextLi = g_liChildren[_getNextLiChildrenIndex()],
      li = g_liChildren[_getLiChildrenIndex()],
      preLi = g_liChildren[_getPreLiChildrenIndex()];
  g_isEndAnimating = true;
  var distance = g_effectDistance;
  if (g_isParallelType && _isLastLi()) {
    distance = g_parallel_dragHolder;
  }
  if (Math.abs(offset) > distance || autoDirection) {
    if (offset > 0 || autoDirection == 'r') {
      //右移
      if (g_isScaleType) {
        _addEndAnimation(li, g_opt.rate, _setScale);
        _addEndAnimation(preLi, 1, _setScale);
      }
      var distance = g_liWidth;
      if (g_isParallelType) {
        if (_isLastLi()) {
          distance = g_parallel_lastButOne_move;
        } else if (_isFirstLi()) {
          distance = g_containerW - g_marginR;
        }
      }
      _addEndAnimation(el, distance - offset, _setUlX);
      _fixLiWhenMoveR();
    } else {
      //左移
      if (g_isScaleType) {
        _addEndAnimation(li, g_opt.rate, _setScale);
        _addEndAnimation(nextLi, 1, _setScale);
      }
      var distance = g_liWidth;
      if (g_isParallelType) {
        if (_isLastButOneLi()) {
          distance = g_parallel_lastButOne_move;
        } else if (_isLastLi()) {
          distance = g_containerW - g_marginR;
        }
      }
      _addEndAnimation(el, -distance - offset, _setUlX);
      _fixLiWhenMoveL();
    }
  } else {
    //回滚
    if (g_isScaleType) {
      _addEndAnimation(li, 1, _setScale);
      _addEndAnimation(nextLi, g_opt.rate, _setScale);
      _addEndAnimation(preLi, g_opt.rate, _setScale);
    }

    if (g_isParallelType && g_parallel_liAnimating) {
      _addEndAnimation(nextLi, li['data-tx'] + g_parallel_startX + g_liWidth, _setTranslate3d);
    }
    if (g_isParallelType && g_parallel_pre_liAnimating) {
      _setTranslate3d(nextLi, li['data-tx'] + g_parallel_startX + g_liWidth);
      g_parallel_pre_liAnimating = false;
    }
    _addEndAnimation(el, -offset, _setUlX);
  }
};
var _fixLiWhenMoveL = function _fixLiWhenMoveL() {
  var index = g_liCur + 1;
  if (g_liMax - index < 2) {
    g_liMax++;
    g_liMin++;
    var li = g_liChildrenWithPos.shift();
    g_liChildrenWithPos.push(li);
    _setTranslate3d(li, g_liMax * g_liWidth + _getDiffWhenMoveL() + _getStaticDiff());
  }
  g_liCur++;
};
var _fixLiWhenMoveR = function _fixLiWhenMoveR() {
  var index = g_liCur - 1;
  if (index - g_liMin < 2) {
    g_liMin--;
    g_liMax--;
    var li = g_liChildrenWithPos.pop();
    g_liChildrenWithPos.unshift(li);
    _setTranslate3d(li, g_liMin * g_liWidth + _getDiffWhenMoveR() + _getStaticDiff());
  }
  g_liCur--;
};

var END_TIME = .2;
var LI_TEMPLATE = '<li data-index=\'{{index}}\' style=\'position:absolute;background-size: cover;background-image: url({{url}});-webkit-backface-visibility:hidden;backface-visibility:hidden;user-select:none;\'></li>';
var UL_TEMPLATE = '<ul style=\'position:relative;list-style-type:none;padding:0;margin:0;\'>{{lis}}</ul>';

var g_container = null;
var g_effectDistance = 30;
var g_containerW = 0;
var g_liChildren = null;
var g_liChildrenWithPos = null;
var g_liChildrenLen = 0;
var g_liWidth = 0;
var g_liHeight = 0;
var g_ul = null;
var g_isEndAnimating = false;
var g_marginR = 0;
var g_liMin = 0;
var g_liMax = 0;
var g_liCur = 0;
var g_startLiCur = 0;
var g_opt = null;
var g_isScaleType = false;
var g_isAutoCarousel = false;
var g_isParallelType = false;
var g_isParallelSimpleType = false;
var g_parallel_startX = 0;
var g_parallel_rItemW = 0;
var g_parallel_lastButOne_move = 0;
var g_parallel_dragHolder = 0;
var g_parallel_liAnimating = false;
var g_parallel_pre_liAnimating = false;
var g_dataLen = 0;
var g_touchstartHandle = null;
var g_touchmoveHandle = null;
var g_touchendHandle = null;
var g_touchcancelHandle = null;

var g_reset = function g_reset() {
  if (g_container) {
    g_container.removeEventListener('touchstart', g_touchstartHandle);
    g_container.removeEventListener('touchmove', g_touchmoveHandle);
    g_container.removeEventListener('touchend', g_touchendHandle);
    g_container.removeEventListener('touchcancel', g_touchcancelHandle);
  }
  g_container = null;
  g_effectDistance = 30;
  g_containerW = 0;
  g_liChildren = null;
  g_liChildrenWithPos = null;
  g_liChildrenLen = 0;
  g_liWidth = 0;
  g_liHeight = 0;
  g_ul = null;
  g_isEndAnimating = false;
  g_marginR = 0;
  g_liMin = 0;
  g_liMax = 0;
  g_liCur = 0;
  g_startLiCur = 0;
  g_opt = null;
  g_isScaleType = false;
  g_isAutoCarousel = false;
  g_isParallelType = false;
  g_isParallelSimpleType = false;
  g_parallel_startX = 0;
  g_parallel_rItemW = 0;
  g_parallel_lastButOne_move = 0;
  g_parallel_dragHolder = 0;
  g_parallel_liAnimating = false;
  g_parallel_pre_liAnimating = false;
  g_dataLen = 0;
  _autoCarouselHandle = null;
  _parallel_simple_rate = null;
  _period = 0;
  _preLiIndex = {
    cur: null,
    real: 0
  };
  _curLiIndexMap = {
    cur: null,
    real: 0
  };
  _nextLiIndexMap = {
    cur: null,
    real: 0
  };
};

var carousel = {
  init: function init(container, data) {
    var opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    g_reset();
    g_dataLen = data.length;
    g_container = container;
    g_opt = opt;
    g_effectDistance = opt.effectDistance || g_effectDistance;
    g_isScaleType = 'scale' == opt.type;
    g_isParallelType = 'parallel' == opt.type;
    g_isParallelSimpleType = 'parallel-simple' == opt.type;
    g_isAutoCarousel = true == opt.isAutoCarousel;
    data = _fillIndexData(data);
    data = _getData(data);
    g_liChildrenLen = data.length;
    g_startLiCur = g_liCur = Math.floor((g_liChildrenLen - 1) / 2);
    if (opt.isSort) {
      data = _sort(data);
    }
    _fillHtml(data);
    _initContainer();
    g_liChildren = g_container.querySelectorAll('li');
    var onlyOne = g_liChildrenLen == 1;
    g_ul = g_container.querySelector('ul');
    g_liWidth = _getLiWidth();
    g_liHeight = g_container.offsetHeight;
    g_marginR = g_opt.marginR;
    if (g_isParallelType) {
      g_parallel_startX = opt.startX;
      g_parallel_dragHolder = opt.dragHolder;
      g_parallel_rItemW = g_containerW - g_liWidth - g_parallel_startX - g_marginR;
      g_parallel_lastButOne_move = g_liWidth - g_parallel_rItemW;
    }
    if (g_isParallelSimpleType) {
      g_parallel_startX = opt.startX;
    }
    if (!g_liChildrenLen) {
      return;
    }
    if (!onlyOne) {
      _initLiChildren();
    }
    _initLiInfo();
    if (onlyOne) {
      //一个元素，无需切换图片
      return;
    }
    _initLiPosition();
    _initUlPosition();
    _initLiScale();
    _initLiRange();
    this.addEvent();
    // _doAutoCarousel();

    //页面激活和隐藏状态切换
    // WinChangedManage.addListener((status) => {
    //   if (status == 1) {
    //     _doAutoCarousel()
    //   } else {
    //     _unAutoCarousel()
    //   }
    // });
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
      g_parallel_liAnimating = false;
      g_isEndAnimating = false;
    }
    function _doEnd() {
      _doEndAnimate(g_ul, totalOffsetX);
    }
    g_touchstartHandle = function g_touchstartHandle(event) {
      isStarted = true;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    };
    g_container.addEventListener('touchstart', g_touchstartHandle);

    g_touchmoveHandle = function g_touchmoveHandle(event) {
      if (!isStarted || g_isEndAnimating) {
        return;
      }
      var isFirst = moveOffsetX == 0 && moveOffsetY == 0;
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
      moveOffsetX = clientX - (moveX || startX);
      moveOffsetY = clientY - (moveY || startY);
      if (g_isParallelType) {
        moveOffsetX *= _getParallelRate();
      } else if (g_isParallelSimpleType) {
        moveOffsetX *= _getParallelSimpleRate();
      }
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
        _setUlX(g_ul, moveOffsetX, g_isParallelType);
        _setCurLiScale(totalOffsetX);
        _seNextLiScale(totalOffsetX);
        _setNextLiParallel(totalOffsetX, moveOffsetX);
      }
      event.preventDefault();
      event.stopPropagation();
    };
    g_container.addEventListener('touchmove', g_touchmoveHandle);

    g_touchendHandle = function g_touchendHandle(event) {
      if (!isStarted) {
        return;
      }
      _doEnd();
      _reset();
    };
    g_container.addEventListener('touchend', g_touchendHandle);

    g_touchcancelHandle = function g_touchcancelHandle(event) {
      if (!isStarted) {
        return;
      }
      _doEnd();
      _reset();
    };
    g_container.addEventListener('touchcancel', g_touchcancelHandle);
  }
};

return carousel;

})));
