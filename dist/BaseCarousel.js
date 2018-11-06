(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.BaseCarousel = factory());
}(this, (function () { 'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var LI_TEMPLATE = '<li data-index=\'{{index}}\' style=\'position:absolute;background-size: cover;background-image: url({{url}});-webkit-backface-visibility:hidden;backface-visibility:hidden;user-select:none;\'></li>';
var UL_TEMPLATE = '<ul style=\'position:relative;list-style-type:none;padding:0;margin:0;\'>{{lis}}</ul>';

var BaseCarousel = function () {
  function BaseCarousel(_ref) {
    var container = _ref.container,
        data = _ref.data,
        auto = _ref.auto,
        isSort = _ref.isSort,
        liWidth = _ref.liWidth,
        _ref$endAnimateTime = _ref.endAnimateTime,
        endAnimateTime = _ref$endAnimateTime === undefined ? .2 : _ref$endAnimateTime,
        _ref$autoStepTime = _ref.autoStepTime,
        autoStepTime = _ref$autoStepTime === undefined ? 5000 : _ref$autoStepTime,
        _ref$effectDistance = _ref.effectDistance,
        effectDistance = _ref$effectDistance === undefined ? 30 : _ref$effectDistance;
    classCallCheck(this, BaseCarousel);

    data = this.fillIndexData(data);
    data = this.getData(data);

    // 参数注入
    this.container = container;
    this.data = data;
    this.auto = auto;
    this.isSort = isSort;
    this.liWidth = liWidth;
    this.endAnimateTime = endAnimateTime;
    this.autoStepTime = autoStepTime;
    this.effectDistance = effectDistance; // 起作用的距离，即停下来的时候滑动了多少，可以触发自动滑到下一张或上一张，否则回滚

    // 控制变量
    this.stepX = 0;
    this.autoing = false; // 是否正在自动播放中，区别于auto，auto表示是否要自动播放
    this.ulLastX = 0;
    this.isEndAnimating = false;
    this.liCur = 0;
    this.liChildrenLen = 0;
    this.preLiIndexMap = {};
    this.curLiIndexMap = {};
    this.nextLiIndexMap = {};
    this.liChildrenLen = this.data.length;
    this.liMax = this.liChildrenLen - 1;
    this.liMin = 0;
    this.startLiCur = this.liCur = Math.floor((this.liChildrenLen - 1) / 2);
  }

  createClass(BaseCarousel, [{
    key: 'init',
    value: function init() {
      this.fillHtml();
      this.initDomProps();
      this.initContainer();
      this.initLiX();
      this.initLiInfo();
      this.initUlPeriodX();
      this.addTouchEvent();
      this.initAuto();
    }
  }, {
    key: 'initContainer',
    value: function initContainer() {
      this.container.style.position = 'relative';
    }
  }, {
    key: 'initLiX',
    value: function initLiX() {
      var _this = this;

      this.originLis.forEach(function (li, index) {
        _this.setLiPeriodX(li, _this.getLiXRange() * index);
      });
    }
  }, {
    key: 'initLiInfo',
    value: function initLiInfo() {
      var _this2 = this;

      this.originLis.forEach(function (li, index) {
        li.style.width = _this2.liWidth + 'px';
        li.style.height = _this2.container.offsetHeight + 'px';
      });
    }
  }, {
    key: 'getUlMoveDistance',
    value: function getUlMoveDistance() {
      return this.liWidth;
    }
  }, {
    key: 'getMoveXRate',
    value: function getMoveXRate() {
      return 1;
    }
  }, {
    key: 'getLiXRange',
    value: function getLiXRange() {
      // 每个元素X方向占位多少
      return this.liWidth;
    }
  }, {
    key: 'initUlPeriodX',
    value: function initUlPeriodX() {
      var temp = this.liCur * this.getUlMoveDistance();
      this.setTranslateX(this.ul, -temp);
      this.setUlLastX(-temp);
    }
  }, {
    key: 'fillIndexData',
    value: function fillIndexData(data) {
      return data.map(function (item, index) {
        return {
          url: item,
          index: index
        };
      });
    }
  }, {
    key: 'getData',
    value: function getData(data) {
      if (data.length > 0 && data.length < 5) {
        return this.getData(data.concat(data));
      }
      return data;
    }
  }, {
    key: 'initDomProps',
    value: function initDomProps() {
      this.ul = this.container.querySelector('ul');
      this.lis = this.ul.querySelectorAll('li');
      this.originLis = Array.prototype.slice.call(this.lis);
      this.controlLis = this.originLis.slice(0);
      this.liChildrenLen = this.originLis.length;
      this.liWidth = this.liWidth || this.container.offsetWidth;
    }
  }, {
    key: 'fillHtml',
    value: function fillHtml(data) {
      var data = data || this.data;
      var html = '';
      data.forEach(function (item) {
        html += LI_TEMPLATE.replace('{{url}}', item.url).replace('{{index}}', item.index);
      });
      html = UL_TEMPLATE.replace('{{lis}}', html);
      this.container.innerHTML = html;
    }
  }, {
    key: 'initAuto',
    value: function initAuto() {
      var _this3 = this;

      if (!this.auto) {
        return;
      }
      clearInterval(this.autoIntervalHandle);
      this.autoIntervalHandle = setInterval(function () {
        _this3.autoing = true;
        _this3.stepX = -1; // 以此推动自动播放，重新进行手动滑动时，会自动重置
        _this3.doEndAnimate(_this3.ul);
      }, this.autoStepTime);
    }
  }, {
    key: 'addTouchEvent',
    value: function addTouchEvent() {
      var _this4 = this;

      var stepY = 0;
      var reset = function reset() {
        _this4.autoing = false;
        _this4.stepX = 0;
        stepY = 0;
        _this4.initAuto();
      };
      var touchstartHandle = function touchstartHandle(event) {
        reset(); // auto为true情况下，即自动播放情况下，重新进行手动滑动，需重置
        _this4.isStarted = true;
        _this4.startX = event.touches[0].clientX;
        _this4.startY = event.touches[0].clientY;
        _this4.touchStartCb && _this4.touchStartCb();
      };
      var touchmoveHandle = function touchmoveHandle(event) {
        if (!_this4.isStarted || _this4.isEndAnimating) {
          return;
        }
        var isFirst = _this4.stepX === 0 && stepY === 0;
        var clientX = event.touches[0].clientX;
        var clientY = event.touches[0].clientY;
        _this4.stepX = (clientX - _this4.startX) * _this4.getMoveXRate();

        if (isFirst) {
          // 第一次move,仅做方向判断，不移动
          stepY = clientY - _this4.startY;
          if (Math.abs(_this4.stepX) < Math.abs(stepY)) {
            // 判断为垂直方向移动，不做处理
            reset();
            return;
          }
        } else {
          _this4.setUlX(_this4.stepX + _this4.ulLastX);
          _this4.touchMoveCb && _this4.touchMoveCb();
        }
        event.preventDefault();
        event.stopPropagation();
      };

      var touchendHandle = function touchendHandle() {
        if (!_this4.isStarted) {
          return;
        }
        _this4.doEndAnimate(_this4.ul);
        _this4.touchEndCb && _this4.touchEndCb();
        reset();
      };

      var touchcancelHandle = touchendHandle;

      this.container.addEventListener('touchstart', touchstartHandle);
      this.container.addEventListener('touchmove', touchmoveHandle);
      this.container.addEventListener('touchend', touchendHandle);
      this.container.addEventListener('touchcancel', touchcancelHandle);
    }
  }, {
    key: 'fixLiWhenMoveL',
    value: function fixLiWhenMoveL() {
      var index = this.liCur + 1;
      if (this.liMax - index < 2) {
        this.liMax++;
        this.liMin++;
        var li = this.controlLis.shift();
        this.controlLis.push(li);
        this.setLiPeriodX(li, this.liMax * this.getLiXRange());
      }
      this.liCur++;
    }
  }, {
    key: 'fixLiWhenMoveR',
    value: function fixLiWhenMoveR() {
      console.log('fixLiWhenMoveR parent');
      var index = this.liCur - 1;
      if (index - this.liMin < 2) {
        this.liMax--;
        this.liMin--;
        var li = this.controlLis.pop();
        this.controlLis.unshift(li);
        this.setLiPeriodX(li, this.liMin * this.getLiXRange());
      }
      this.liCur--;
    }
  }, {
    key: 'doEndAnimate',
    value: function doEndAnimate(el) {
      if (this.stepX == 0) {
        return;
      }
      this.isEndAnimating = true;
      this.addEndTransition(el);
      if (Math.abs(this.stepX) > this.effectDistance || this.autoing) {
        if (this.stepX > 0) {
          this.fixLiWhenMoveR();
        } else {
          this.fixLiWhenMoveL();
        }
      }
      this.initUlPeriodX();
    }
  }, {
    key: 'addEndTransition',
    value: function addEndTransition(el) {
      var _this5 = this;

      var ul = this.ul;
      var cb = function cb() {
        _this5.removeEndAnimation(el);
      };
      ul.style.transition = 'transform ' + this.endAnimateTime + 's ease-out';
      ul.style.webkitTransition = '-webkit-transform ' + this.endAnimateTime + 's ease-out';
      ul.offsetWidth;
      ul.addEventListener('webkitTransitionEnd', cb);
      ul.addEventListener('transitionend', cb);
    }
  }, {
    key: 'removeEndAnimation',
    value: function removeEndAnimation(el) {
      el.style.transition = 'unset';
      el.style.webkitTransition = 'unset';
      this.isEndAnimating = false;
    }
  }, {
    key: 'setUlX',
    value: function setUlX(x) {
      this.setTranslateX(this.ul, x);
    }
  }, {
    key: 'setLiPeriodX',
    value: function setLiPeriodX(li, x) {
      this.setTranslateX(li, x);
    }
  }, {
    key: 'setUlLastX',
    value: function setUlLastX(x) {
      this.ulLastX = x;
    }
  }, {
    key: 'setTranslateX',
    value: function setTranslateX(el, x) {
      this.setTransform(el, /translate3d\([^)]+\)/, ' translate3d(' + x + 'px, 0, 0) ');
      this.setWebkitTransform(el, /-webkit-translate3d\([^)]+\)/, ' -webkit-translate3d(' + x + 'px, 0, 0) ');
    }
  }, {
    key: 'setTransform',
    value: function setTransform(el, reg, result) {
      if (reg.test(el.style.transform)) {
        el.style.transform = el.style.transform.replace(reg, result);
      } else {
        el.style.transform += result;
      }
    }
  }, {
    key: 'setWebkitTransform',
    value: function setWebkitTransform(el, reg, result) {
      if (reg.test(el.style.transform)) {
        el.style.webkitTransform = el.style.webkitTransform.replace(reg, result);
      } else {
        el.style.webkitTransform += result;
      }
    }
  }]);
  return BaseCarousel;
}();

return BaseCarousel;

})));
