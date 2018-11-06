import BaseCarousel from './BaseCarousel.js'
class ParallelCarousel extends BaseCarousel {
  constructor (opt) {
    super(opt)
    this.startMarginL = opt.startMarginL || 30
    this.marginR = opt.marginR || 15

    // 值缓存变量
    this.liXRange = 0
    this.ulMoveDistance = 0
    this.containerW = 0
    this.moveXRate = 0
    this.animateLiOffset = 0
    this.animateLiRate = 0
  }

  getCacheVal (key, val) {
    if (this[key]) {
      return this[key]
    }
    return this[key] = val
  }

  getLiXRange () { // 每个元素X方向占位多少
    return this.getCacheVal('liXRange', this.liWidth + this.marginR)
  }

  getUlMoveDistance () {
    return this.getCacheVal('ulMoveDistance', this.liWidth + this.marginR)
  }

  getContainerW () {
    return this.getCacheVal('containerW', this.container.offsetWidth)
  }

  getMoveXRate () {
    return this.getCacheVal('moveXRate', this.getUlMoveDistance() / this.getContainerW())
  }

  getAnimateLiOffset () {
    return this.getCacheVal('animateLiOffset', this.startMarginL - this.marginR)
  }

  getAnimateLiRate () {
    return this.getCacheVal('animateLiRate', this.getAnimateLiOffset() / this.getUlMoveDistance())
  }

  setLiX (li, x) {
    x += parseFloat(li.lastX)
    this.setTranslateX(li, x)
  }

  setLiPeriodX (li, x) {
    li.lastX = x
    super.setLiPeriodX(li, x)
  }

  initUlPeriodX () {
    var temp = this.liCur * this.getUlMoveDistance() - this.marginR
    this.setTranslateX(this.ul, -temp)
    this.setUlLastX(-temp)
  }

  initLiX () {
    var distance = 0
    this.originLis.forEach((li, index) => {
      if (index >= this.liCur) {
        distance = this.getLiXRange() * index + this.getAnimateLiOffset()
      } else {
        distance = this.getLiXRange() * index
      }
      this.setLiPeriodX(li, distance)
    })
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
    var rate = this.getAnimateLiRate()
    var witch = 'cur'
    if (this.stepX > 0) {
      witch = 'pre'
    }
    var li = this.getLi(witch)
    var distance = this.stepX * rate
    this.setLiX(li, distance)
  }

  touchEndCb () {
    var offset = 0
    var li

    if (Math.abs(this.stepX) > this.effectDistance || this.autoing) {
      if (this.stepX > 0) {
        li = this.getLi('cur')
        offset = this.getAnimateLiOffset()
      } else {
        li = this.getLi('pre')
        offset = -this.getAnimateLiOffset()
      }
    } else {
      if (this.stepX > 0) {
        li = this.getLi('pre')
      } else {
        li = this.getLi('cur')
      }
      offset = 0
    }

    super.addEndTransition(li)
    this.setLiPeriodX(li, offset + parseFloat(li.lastX))
  }

  fixLiWhenMoveL () {
    var index = this.liCur + 1
    if (this.liMax - index < 2) {
      this.liMax++
      this.liMin++
      var li = this.controlLis.shift()
      this.controlLis.push(li)
      this.setLiPeriodX(li, this.liMax * this.getLiXRange() + this.getAnimateLiOffset())
    }
    this.liCur++
  }
}
export default ParallelCarousel
