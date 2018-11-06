import BaseCarousel from './BaseCarousel.js'
class ScaleCarousel extends BaseCarousel {
  constructor (opt) {
    super(opt)
    this.rate = opt.rate || .8
    this.maxRate = opt.maxRate || 1

    // 值缓存变量
    this.containerW = 0
    this.animateLiOffset = 0
    this.liXRange = 0
  }

  initUlPeriodX () {
    var temp = this.liCur * this.getUlMoveDistance() - (this.getContainerW() - this.liWidth) / 2
    this.setTranslateX(this.ul, -temp)
    this.setUlLastX(-temp)
  }

  initLiProps () {
    this.originLis.forEach((li, index) => {
      li.style.width = `${this.liWidth}px`;
      li.style.height = `${this.container.offsetHeight}px`;
      if (index !== this.liCur) {
        this.setLiScale(li, this.rate)
      } else {
        this.setLiScale(li, this.maxRate)
      }
    });
  }

  getCacheVal (key, val) {
    if (this[key]) {
      return this[key]
    }
    return this[key] = val
  }

  getContainerW () {
    return this.getCacheVal('containerW', this.container.offsetWidth)
  }

  getAnimateLiOffset () {
    return this.getCacheVal('animateLiOffset', this.maxRate - this.rate)
  }

  getLiXRange () { // 每个元素X方向占位多少
    return this.getCacheVal('liXRange', this.liWidth)
  }

  getUlMoveDistance () {
    return this.liWidth
  }

  getMoveXRate () {
    return this.getCacheVal('moveXRate', this.getUlMoveDistance() / this.getContainerW())
  }

  getLi (which) {
    var beforeOffset = this.liCur - this.liMin
    var afterOffset = this.liMax - this.liCur
    var index = 0
    if (afterOffset < beforeOffset) {
      index = this.controlLis.length - afterOffset - 1
    } else {
      index = beforeOffset
    }
    switch (which) {
      case 'pre':
        index--
        break
      case 'next':
        index++
        break
    }
    return this.controlLis[index]
  }

  touchMoveCb () {
    var offset = this.getAnimateLiOffset()
    var curLi = this.getLi('cur')
    var witch = 'next'
    if (this.stepX > 0) {
      witch = 'pre'
    }
    var otherLi = this.getLi(witch)
    var movingScaleOffset = (this.stepX / this.getUlMoveDistance()) * offset
    this.setLiScale(curLi, this.maxRate - movingScaleOffset)
    this.setLiScale(otherLi, this.rate + movingScaleOffset)
  }

  setLiScale (li, r) {
    this.setTransform(li, /scaleY\([^)]+\)/, ` scaleY(${r}) `);
    this.setWebkitTransform(li, /-webkit-scaleY\([^)]+\)/, ` -webkit-scaleY(${r}) `);
  }

  touchEndCb () {
    var curLi = this.getLi('cur')
    var otherLi

    if (Math.abs(this.stepX) > this.effectDistance || this.autoing) {
      if (this.stepX > 0) {
        otherLi = this.getLi('next')
      } else {
        otherLi = this.getLi('pre')
      }
    } else {
      if (this.stepX > 0) {
        otherLi = this.getLi('pre')
      } else {
        otherLi = this.getLi('next')
      }
    }

    super.addEndTransition(curLi)
    super.addEndTransition(otherLi)
    this.setLiScale(curLi, this.maxRate)
    this.setLiScale(otherLi, this.rate)
  }
}
export default ScaleCarousel
