title: WebApp 工程架构
speaker: 严清
url: https://github.com/zensh
transition: move
files: /js/app.js, /css/app.css


[slide]

# WebApp 工程架构
<small>2014.11.09</small>

<div class="logo"></div>

[slide]

## 严 清

<small>AngularJS 中文社区 站长</small>

<small>Leader / front-end engineer for teambition</small>

https://github.com/zensh

http://weibo.com/zensh

20+ public repositories (2013 ~ 2014):
---

<div class="repos">
<small>thunks</small>
<small>thunk-redis</small>
<small>thunk-stream</small>
<small>then.js</small>
<small>jsGen</small>
<small>jsonkit</small>
<small>jsbench</small>
<small>baseco</small>
<small>merge2</small>
<small>resp.js</small>
<small>ng-warehouse</small>
<small>expire-cache</small>
<small>logci</small>
<small>reserveLoad.js</small>
<small>lrucache</small>
<small>serve-ngdocs</small>
<small>ui-autocomplete</small>
<small>gulp-ssh</small>
<small>gulp-sequence</small>
<small>gulp-ng-temlate</small>
</div>

[slide]

什么是 WebApp
---
> WebApp是指基于Web的系统和应用，其作用是向广大的最终用户发布一组复杂的内容和功能。 ——百度百科

### 用 Web 技术实现的，在浏览器引擎中运行的应用程序。

[slide]

目前运行 WebApp 的容器有:
---

* 普通浏览器Chrome、Firefox、Safari、IE等
* 移动端 PhoneGap(Cordova)、AppCan、集成浏览器内核的应用如微信等
* node-webkit、atom-shell、MacGap（桌面应用程序级别）
* Chrome OS、Firefox OS（操作系统级别）


[slide]

## WebApp 特征——运行资源与数据的分离

![WebApp 01](/img/webapp01.png)

[slide]

三个项目实例
---

* 某类QQ的通信客户端，基于 AngularJS 框架，XMPP 实时通信
* teambition Web 端和桌面端，基于 Backbone 框架，Websocket 实时通信
* 开源的 jsGen，基于 AngularJS 框架

[slide]

某类QQ的通信 Windows/MacOS 客户端

> node-webkit | AngularJS | XMPP | gulp

![WebApp 02](/img/webapp02.png)

[slide]

应用入口——`index.html`
---

![WebApp 03](/img/webapp03.png)

[slide]

文件结构
---

![WebApp 04](/img/webapp04.png)

[slide]

views 中的 html 文件变成了一个 `ng` 模块
---

![WebApp 05](/img/webapp05.png)

[slide]

WebApp 运行起来后的 DOM
---

![WebApp 06](/img/webapp06.png)

[slide]

teambition Windows/MacOS 客户端，Web 端

> node-webkit | MacGap | Backbone | Websocket | requirejs | grunt

![WebApp 07](/img/webapp07.png)

[slide]

teambition 运行起来后的 DOM
---

![WebApp 08](/img/webapp08.png)

[slide]

teambition 架构
---

![WebApp 09](/img/webapp09.png)

[slide]

teambition 开发的四个状态模式
---

* **开发模式（development）**，各种静态资源独立，方便开发调试；
* **本地测试模式（build）**，对静态资源打包压缩，部署在本地，使用本地测试服务器的数据API；
* **线上测试模式（generally available）**，对静态资源打包压缩，并生成了唯一资源URI部署到CDN服务器，使用正式服务器的数据API，特定用户才可以访问；
* **正式上线模式（release）**，与 GA 模式的区别是，所有用户可以访问。

[slide]

模式的切换，就是输出不同的 `index.html`
---

![WebApp 10](/img/webapp10.png)

[slide]

静态资源的 build 之 grunt
---
```js
grunt.loadNpmTasks('grunt-contrib-clean')
grunt.loadNpmTasks('tb.grunt-i18n')
grunt.loadNpmTasks('tb.grunt-dot')
grunt.loadNpmTasks('grunt-contrib-less')
grunt.loadNpmTasks('grunt-contrib-coffee')
grunt.loadNpmTasks('grunt-contrib-requirejs')
grunt.loadNpmTasks('grunt-contrib-uglify')
grunt.loadNpmTasks('grunt-contrib-copy')
grunt.loadNpmTasks('grunt-rev')
grunt.loadNpmTasks('grunt-usemin')
```
grunt 出生早，生态成熟，同步顺序执行，使用略显复杂，效率低

[slide]

静态资源的 build 之 gulp
---
```js
clean = require('gulp-clean');
jshint = require('gulp-jshint');
concat = require('gulp-concat');
imagemin = require('gulp-imagemin');
minifyCss = require('gulp-minify-css');
minifyHtml = require('gulp-minify-html');
ngTemplate = require('gulp-ng-template');
uglify = require('gulp-uglify');
rev = require('gulp-rev');
usemin = require('gulp-usemin');
gulpSequence = require('gulp-sequence');
```
grunt 去年兴起，生态相对成熟，异步并发执行，使用简单，效率高

[slide]

jsGen，基于 AngularJS 框架

![WebApp 11](/img/webapp11.png)

[slide]

完全开源，供大家学习参考
---
https://github.com/zensh/jsgen

* 前后端完全分离（目前仍在一个项目中，随后会分离成 API server 和前端 WebApp 两个项目，方便改造）
* 后端使用 MongoDB、redis、rrestjs（较老，随后替换为最新流行的 koa）
* 前端使用 AngularJS、gulp打包

[slide]

# WebApp 之软件架构

[slide]

# 功能解耦

![WebApp 12](/img/webapp12.png)

[slide]

## 视图层 View

* 数据输出为 UI 视图
* 动画交互

[slide]

## 控制层 Controller

* 路由控制和界面切换
* 视图拼装、逻辑控制
* 数据监听、处理、验证

[slide]

## 数据层 Model

* API 接口调用
* 接受处理推送数据
* 数据缓存、同步

[slide]

# 模块化开发

* 模块管理 requirejs, angular.module，seajs等
* 按功能分解，无论是视图层、控制层还是数据层，都可以分解成一个个模块，实际表现出来就相当于一个个文件
