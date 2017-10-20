# 移动端轮播图组件

## 支持三种模式

* [base模式](http://blog.shellhong.com/effect/carousel/index-base.html)
* [scale模式](http://blog.shellhong.com/effect/carousel/index-scale.html)
* [parallel模式](http://blog.shellhong.com/effect/carousel/index-parallel.html)

## 使用实例

### base模式
```js
carousel.init(document.querySelector('.sky-carousel'), [
  './images/1.jpg',
  './images/2.jpg',
  './images/3.jpg',
  './images/4.jpg',
  './images/5.jpg',
  './images/6.jpg',
  './images/7.jpg'
], {
  isAutoCarousel: true,//是否自动轮播，默认为false
  animateTime: .2,//动画耗时，默认为0.2s
  autoCarouselTime: 5000//自动轮播时间间隔，默认为5000ms
});
```
### scale模式
```js
carousel.init(document.querySelector('.sky-carousel'), [
  './images/1.jpg',
  './images/2.jpg',
  './images/3.jpg',
  './images/4.jpg',
  './images/5.jpg',
  './images/6.jpg',
  './images/7.jpg'
], {
  type: 'scale',
  gap: '10%',//图片与容器左右两边的距离，可为数字（像素值）或字符串（百分比，相对于容器宽度）
  rate: .8,//缩放比例
  isAutoCarousel: true//是否自动轮播，默认为false
});
```
### parallel模式
```js
carousel.init(document.querySelector('.sky-carousel'), [
  './images/1.jpg',
  './images/2.jpg',
  './images/3.jpg',
  './images/4.jpg',
  './images/5.jpg',
  './images/6.jpg',
  './images/7.jpg'
], {
  type: 'parallel',
  width: '70%',//图片宽度，可为数字（像素值）或字符串（百分比，相对于容器宽度）
  marginR: 10,//图片彼此间的距离，可为数字（像素值）或字符串（百分比，相对于容器宽度）
  isAutoCarousel: true//是否自动轮播，默认为false
});
```

##  相关的博客文章

[点击阅读](http://blog.shellhong.com/export/views/work/carousel/index.html)
