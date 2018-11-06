const LI_TEMPLATE = `<li data-index='{{index}}' style='position:absolute;background-size: cover;background-image: url({{url}});-webkit-backface-visibility:hidden;backface-visibility:hidden;user-select:none;'></li>`
const UL_TEMPLATE = `<ul style='position:relative;list-style-type:none;padding:0;margin:0;'>{{lis}}</ul>`

class BaseCarousel {
  constructor ({
    container,
    data,
    auto,
    isSort,
    liWidth,
    endAnimateTime = .2,
    autoStepTime = 5000,
    effectDistance = 30
  }) {
    data = this.fillIndexData(data)
    data = this.getData(data)

    // 参数注入
    this.container = container
    this.data = data
    this.auto = auto
    this.isSort = isSort
    this.liWidth = liWidth
    this.endAnimateTime = endAnimateTime
    this.autoStepTime = autoStepTime
    this.effectDistance = effectDistance // 起作用的距离，即停下来的时候滑动了多少，可以触发自动滑到下一张或上一张，否则回滚

    // 控制变量
    this.stepX = 0
    this.autoing = false // 是否正在自动播放中，区别于auto，auto表示是否要自动播放
    this.ulLastX = 0
    this.isEndAnimating = false
    this.liCur = 0
    this.liChildrenLen = 0
    this.preLiIndexMap = {}
    this.curLiIndexMap = {}
    this.nextLiIndexMap = {}
    this.liChildrenLen = this.data.length
    this.liMax = this.liChildrenLen - 1
    this.liMin = 0
    this.liCur = Math.floor((this.liChildrenLen - 1) / 2)
  }

  init () {
    this.fillHtml()
    this.initDomProps()
    this.initContainer()
    this.initLiX()
    this.initLiProps()
    this.initUlPeriodX()
    this.addTouchEvent()
    this.initAuto()
  }

  initContainer () {
    this.container.style.position = 'relative'
  }

  initLiX () {
    this.originLis.forEach((li, index) => {
      this.setLiPeriodX(li, this.getLiXRange() * index)
    })
  }

  initLiProps () {
    this.originLis.forEach((li, index) => {
      li.style.width = `${this.liWidth}px`;
      li.style.height = `${this.container.offsetHeight}px`;
    });
  }

  getUlMoveDistance () { // 容器每一次移动的距离
    return this.liWidth
  }

  getMoveXRate () { // 手指滑动x轴距离与容器宽度（往往是屏幕宽度）的比率
    return 1
  }

  getLiXRange () { // 每个元素X方向占位多少
    return this.liWidth
  }

  initUlPeriodX () { // 容器每一次移动停下来后的位置
    var temp = this.liCur * this.getUlMoveDistance()
    this.setTranslateX(this.ul, -temp)
    this.setUlLastX(-temp)
  }

  initDomProps () {
    this.ul = this.container.querySelector('ul')
    this.lis = this.ul.querySelectorAll('li')
    this.originLis = Array.prototype.slice.call(this.lis)
    this.controlLis = this.originLis.slice(0)
    this.liChildrenLen = this.originLis.length
    this.liWidth = this.liWidth || this.container.offsetWidth
  }

  fillHtml (data) {
    var data = data || this.data
    var html = ''
    data.forEach(function(item){
      html += LI_TEMPLATE.replace('{{url}}', item.url).replace('{{index}}', item.index)
    })
    html = UL_TEMPLATE.replace('{{lis}}', html)
    this.container.innerHTML = html
  }

  initAuto () {
    if (!this.auto) {
      return
    }
    clearInterval(this.autoIntervalHandle)
    this.autoIntervalHandle = setInterval(() => {
      this.autoing = true
      this.stepX = -1 // 以此推动自动播放，重新进行手动滑动时，会自动重置
      this.doEndAnimate(this.ul)
      this.touchEndCb && this.touchEndCb()
    }, this.autoStepTime)
  }

  addTouchEvent () {
    var stepY = 0
    var reset = () => {
      this.autoing = false
      this.stepX = 0
      stepY = 0
      this.initAuto()
    }
    var touchstartHandle = (event) => {
      reset() // auto为true情况下，即自动播放情况下，重新进行手动滑动，需重置
      this.isStarted = true
      this.startX = event.touches[0].clientX
      this.startY = event.touches[0].clientY
      this.touchStartCb && this.touchStartCb()
    }
    var touchmoveHandle = (event) => {
      if (!this.isStarted || this.isEndAnimating) {
        return
      }
      var isFirst = (this.stepX === 0 && stepY === 0)
      var clientX = event.touches[0].clientX
      var clientY = event.touches[0].clientY
      this.stepX = (clientX - this.startX) * this.getMoveXRate()

      if (isFirst) { // 第一次move,仅做方向判断，不移动
        stepY = clientY - this.startY
        if (Math.abs(this.stepX) < Math.abs(stepY)) { // 判断为垂直方向移动，不做处理
          reset()
          return
        }
      } else {
        this.setUlX(this.stepX + this.ulLastX)
        this.touchMoveCb && this.touchMoveCb()
      }
      event.preventDefault()
      event.stopPropagation()
    }

    var touchendHandle = () => {
      if (!this.isStarted) {
        return
      }
      this.doEndAnimate(this.ul)
      this.touchEndCb && this.touchEndCb()
      reset()
    }

    var touchcancelHandle = touchendHandle

    this.container.addEventListener('touchstart', touchstartHandle)
    this.container.addEventListener('touchmove', touchmoveHandle)
    this.container.addEventListener('touchend', touchendHandle)
    this.container.addEventListener('touchcancel', touchcancelHandle)
  }

  fixLiWhenMoveL () {
    var index = this.liCur + 1
    if (this.liMax - index < 2) {
      this.liMax++
      this.liMin++
      var li = this.controlLis.shift()
      this.controlLis.push(li)
      this.setLiPeriodX(li, this.liMax * this.getLiXRange())
    }
    this.liCur++
  }

  fixLiWhenMoveR (){
    var index = this.liCur - 1
    if (index - this.liMin < 2) {
      this.liMax--
      this.liMin--
      var li = this.controlLis.pop()
      this.controlLis.unshift(li)
      this.setLiPeriodX(li, this.liMin * this.getLiXRange())
    }
    this.liCur--
  }

  doEndAnimate (el){
    if (this.stepX === 0) {
      return
    }
    this.isEndAnimating = true
    this.addEndTransition(el)
    if (Math.abs(this.stepX) > this.effectDistance || this.autoing) {
      if (this.stepX > 0) {
        this.fixLiWhenMoveR()
      } else {
        this.fixLiWhenMoveL()
      }
    }
    this.initUlPeriodX()
  }

  addEndTransition (el){
    var cb = () => {
      this.removeEndAnimation(el)
    }
    el.style.transition = `transform ${this.endAnimateTime}s ease-out`
    el.style.webkitTransition = `-webkit-transform ${this.endAnimateTime}s ease-out`
    el.offsetWidth

    // el.addEventListener('webkitTransitionEnd', cb, {once: true}) // 某些情况下，该事件不响应，改用setTimeout
    // el.addEventListener('transitionend', cb, {once: true})

    setTimeout(cb, this.endAnimateTime * 1000)
  }

  removeEndAnimation (el){
    el.style.transition = `unset`
    el.style.webkitTransition = `unset`
    this.isEndAnimating = false
  }

  setUlX (x) {
    this.setTranslateX(this.ul, x)
  }

  setLiPeriodX (li, x) {
    this.setTranslateX(li, x)
  }

  setUlLastX (x) {
    this.ulLastX = x
  }

  setTranslateX (el, x) {
    this.setTransform(el, /translate3d\([^)]+\)/, ` translate3d(${x}px, 0, 0) `)
    this.setWebkitTransform(el, /-webkit-translate3d\([^)]+\)/, ` -webkit-translate3d(${x}px, 0, 0) `)
  }

  setTransform (el, reg, result) {
    if (reg.test(el.style.transform)) {
      el.style.transform = el.style.transform.replace(reg, result)
    } else {
      el.style.transform += result
    }
  }

  setWebkitTransform (el, reg, result) {
    if (reg.test(el.style.transform)) {
      el.style.webkitTransform = el.style.webkitTransform.replace(reg, result)
    } else {
      el.style.webkitTransform += result
    }
  }

  fillIndexData (data) {
    return data.map(function(item, index){
      return {
        url: item,
        index: index
      }
    })
  }

  getData (data) {
    if(data.length > 0 && data.length < 5){
      return this.getData(data.concat(data))
    }
    return data
  }
}

export default BaseCarousel
