# 仿app端图案解锁（手势密码）

> lock && unlock

## Build Setup

``` bash
# 安装依赖
npm install

# 开发模式在localhost:8080/?id=trq
npm run dev

# 打包整合上线
npm run build

# 本地运行localhost:9002/?id=trq
node server
```
## 开发模式
### 前端
vue-cli脚手架构建项目。Vue2.0，webpack打包。
### 后台
Nodejs。express框架搭建服务器。
## 开发思路
### 实现方法
1. Canvas

2. CSS3

<p>因为我对CSS3更为熟悉，所以第一反应并不是Canvas。在实现路径显示的时候，CSS3遇到了较大的瓶颈，但最终还是通过tranform + js配合实现了目的。
<p>后面我会使用Canvas实现该项目。

### 开发核心
##### 目标获取
1. 移动端是touchstart、touchmove、touchend事件

2. touchmove事件的event.target，不会随着鼠标移动而改变，始终是touchstart的event.target。
3. document.elementFromPoint(event.touches[0].pageX, event.touches[0].pageY)获取鼠标下真实元素

[elementFromPoint()测试](http://www.zhangxinxu.com/study/201109/element-from-point.html)
##### 路径显示

1. 每个解锁圆圈有一个div.line，默认visibility：hidden，方向竖直向下，长度等于相邻圆心之间的距离。（最初使用::after，但js无法操作伪元素，放弃）

2. 使用visibility：hidden/visible切换来显示路径。

3. 同时根据最终目标与初始目标的位置计算斜率，来动态的改变height与rotate

##### 数据存储
1. window.location.search获取url并提取相关信息

2. localStorage存取
