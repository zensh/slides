title: koa | toa 简化 Node.js server 的异步开发模式
speaker: Qing Yan
url: https://github.com/zensh
transition: move
files: /js/app.js, /css/app.css

[slide]

# koa | toa
# 简化 Node.js server 的异步开发模式

<small>2014.12.20</small>

<div class="logo"></div>

[slide]

![zensh](/img/zensh.jpeg "zensh")

## 严 清
> Director / front-end engineer of teambition

https://github.com/zensh

http://weibo.com/zensh

[slide]

## 最近三周业余的 commits（[toa](https://github.com/toajs)）

- **toa:** A web app framework rely on thunks.
- **toa-ejs:** Ejs render module for toa.
- **toa-body:** Request body parser for toa.
- **toa-router:** A router for toa.
- **toa-static:** A static server module for toa.
- **toa-favicon:** Favicon middleware for toa.
- **toa-session:** Session middleware for toa.
- **toa-compress:** Compress responses middleware for toa.
- **file-cache:** Read file with caching, rely on thunks.
- **route-trie:** A trie-based URL router.

[slide]

## http://docs.angularjs.cn/api

# <iframe data-src="http://docs.angularjs.cn/api" src="http://docs.angularjs.cn/api"></iframe>
**X-Powered-By:Toa（12月1日上线）**

[slide]

## Toa static server demo

```js
var Toa = require('toa');
var toaStatic = require('toa-static')({
  root: 'docs',
  index: 'index-jsgen.html',
  maxAge: 1000 * 60 * 60 * 24 * 30,
  staticPath: function () {
    if (this.path.indexOf('/api') === 0) return '/';
  }
});
```
**As middleware:**
```js
var app = Toa();
app.use(toaStatic);
app.listen(3001);
```
**As module:**
```js
var app = Toa(function* (Thunk) {
  yield toaStatic;
//  return toaStatic;
//  return Thunk.call(this, toaStatic);
});

app.listen(3001);
```

[slide]

## koa 的核心

 * `co`: 异步流程控制, 异常捕捉机制（无需再用 `async` 之类的异步库，无需再用 `domain` 捕捉异常）; {:&.zoomIn}
 * `context`, `request`, `reponse` 提供了标准化的 http 方法（语法糖）;

[slide]

## Toa 的核心

 * `thunks`: 链式异步流程控制, 带作用域的异常捕捉机制; (`co`的增强版，支持 node.js v0.10.x, toa 的基础组件都支持 v0.10.x);
 * 汲(tou)取了 `context`, `request`, `reponse` 标准化的 http 方法;

[slide]

# request

<div class="columns-2">
<pre>
- request.header
- request.headers
- request.method
- request.method=
- request.length
- request.url
- request.url=
- request.originalUrl
- request.path
- request.path=
- request.querystring
- request.querystring=
- request.search
- request.search=
- request.host
- request.hostname
- request.type
- request.charset
</pre>
<pre>
- request.query
- request.query=
- request.fresh
- request.stale
- request.protocol
- request.secure
- request.ip
- request.ips
- request.subdomains
- request.is(types...)
- request.accepts(types)
- request.acceptsEncodings(encodings)
- request.acceptsCharsets(charsets)
- request.acceptsLanguages(langs)
- request.idempotent
- request.socket
- request.get(field)
</pre>
</div>

[slide]

# reponse

<div class="columns-2">
<pre>
- response.header
- response.socket
- response.status
- response.status=
- response.message
- response.message=
- response.length=
- response.length
- response.body
- response.body=
  - `string` written
  - `Buffer` written
  - `Stream` piped
  - `Object` json-stringified
  - `null` no content response
</pre>
<pre>
- response.get(field)
- response.set(field, value)
- response.set(fields)
- response.remove(field)
- response.type
- response.type=
- response.is(types...)
- response.redirect(url, [alt])
- response.attachment([filename])
- response.headerSent
- response.lastModified
- response.lastModified=
- response.etag=
- response.vary(field)
</pre>
</div>

[slide]

# middlewares 的 `this` —— context

- ctx.req
- ctx.res
- ctx.request
- ctx.response
- ctx.state
- ctx.app (考虑安全因素，toa 没有 `app`)
- ctx.cookies.get(name, [options])
- ctx.cookies.set(name, value, [options])
- ctx.throw([msg], [status], [properties])
- ctx.respond
- **Request aliases**
- **Response aliases**
- **toa 扩展的部分：event object; ctx.catchStream; ctx.config;**

[slide]

### 响应 JSON

```js
var Toa = require('toa');
var app = toa(function (Thunk) {
  this.body = this.toJSON();
});

app.listen(3000);
```

### 响应 Stream

```js
var fs = require('fs');
var Toa = require('toa');
var app = toa(function (Thunk) {
  this.type = 'text';
  // this.type = 'json';
  this.body = fs.createReadStream(__dirname + '/package.json', {encoding: 'utf8'});
});

app.listen(3000);
```

[slide]

# koa middleware

```js
var koa = require('koa');
var app = koa();

app.use(function*(next) {
  var start = new Date;
  yield *next;
  var ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
});

app.use(function*(){
  this.body = 'Hello World';
});

app.listen(3001);
```
### middleware 中必须 `yield *next`，除了最后一个

[slide]

## 一个简单的 middlewares 组合运行步骤

![middleware](/img/middleware.gif "middleware")

**级联（yield hell?）**

[slide]

# 异步基础之 thunks

```js
fs.readFile('/etc/passwd', function (err, data) {
  if (err) return console.error(err);
  console.log(data);
});
```

```js
function readFile(path) { // 返回 thunk
  return function(callback) {
    fs.readFile(path, callback);
  };
}

var file = readFile('/etc/passwd'); // file 是一个 thunk 函数
file(function (err, data) {
  if (err) return console.error(err);
  console.log(data);
});
```
**thunk(callback)**

[slide]

# 异步基础之 Promise

```js
function readFile(path) { // 返回 promise
  return new Promise(function (resolve, reject) {
    fs.readFile(path, function (err, data) {
      if (err) return reject(error);
      resolve(data);
    });
  });
}

var file = readFile('/etc/passwd'); // file 是一个 promise 对象
file.then(function (data) {
  console.log(data);
}).catch(function(err) {
  console.error(err);
})
```
**promise.then(onsuccessFn, onerrorFn)**

[slide]

# Promise 核心：异步组合

```js
var promiseB = promiseA.then(function () {
  return promise1.then(fn).then(fn).then(fn).then(fn).then(fn).then(fn);
}).then(function () {
  return promise2.then(fn).then(fn).then(fn).then(fn).then(fn).then(fn);
}).then(function () {
  return promise3.then(fn).then(fn).then(fn).then(fn).then(fn).then(fn);
}).then(function () {
  return promise4.then(fn).then(fn).then(fn).then(fn).then(fn).then(fn);
}).then(function () {
  return promise4.then(fn).then(fn).then(fn).then(fn).then(fn).then(fn);
}).then(function () {
  return promise4.then(fn).then(fn).then(fn).then(fn).then(fn).then(fn);
});
```

**横向纵向任意组合，koa 也是把所有 middlewares 组合成了一个 promise 丢入 request listener 运行**

[slide]

# thunks 异步组合（[thunks](https://github.com/thunks) 加持之后）

```js
var thunkB = thunkA(function () {
  return thunk1(fn)(fn)(fn)(fn)(fn)(fn)(fn);
})(function () {
  return thunk2(fn)(fn)(fn)(fn)(fn)(fn)(fn);
})(function () {
  return thunk3(fn)(fn)(fn)(fn)(fn)(fn)(fn);
})(function () {
  return thunk4(fn)(fn)(fn)(fn)(fn)(fn)(fn);
})(function () {
  return thunk5(fn)(fn)(fn)(fn)(fn)(fn)(fn);
})(function () {
  return thunk6(fn)(fn)(fn)(fn)(fn)(fn)(fn);
});
```

**toa 也是把所有 middlewares 和 body 组合成了一个 thunk 函数 丢入 request listener 运行**

[slide]

# 异步基础之 Generator

```js
function* Gen(val) {
  yield console.log(val);
  throw new Error('some error');
}

var gen1 = Gen(123); // Gen 内部逻辑不会运行
gen1.next(); // 123;
gen1.next(); // throw [some error]

var gen2 = Gen(456);
// ...
```
> 运行 generator 函数只是返回一个 generator 对象，用它来控制函数内部的运行，而不是直接运行。

[slide]

# `co` 加持 generator 之后

```js
co(function *(){
  var file1 = yield readFile('file1');
  var file2 = yield readFile('file2');
  var files = yield [file2, readFile('file3'), readFile('file4')];
  console.log(files) // [file2, file3, file4]
}).catch(function(err) {
  console.error(err);
});
```

[slide]

# `thunks`加持 generator 之后

```js
var Thunk = thunks(function (err) {
  console.error(err);
});

Thunk(function *(){
  var file1 = yield readFile('file1');
  var file2 = yield readFile('file2');
  var files = yield [file2, readFile('file3'), readFile('file4')];
  console.log(files) // [file2, file3, file4]
})(function *(err){
  // resolve multiple promises in parallel
  var file1 = yield readFile('file5');
  var file2 = yield readFile('file6');
})(function *(err){
  // resolve multiple promises in parallel
  var file1 = yield readFile('file7');
  var file2 = yield readFile('file8');
})();
```

> 链式 generator 异步

[slide]

## Yieldables in `co`

The `yieldable` objects currently supported are:

- promises
- thunks (functions)
- array (parallel execution)
- objects (parallel execution)
- generators (delegation)
- generator functions (delegation)

> Nested `yieldable`s are supported, meaning you can nest
promises within objects within arrays, and so on!

[slide]

## Thunkables in `thunks`

The `thunkable` objects supported are:

- promises
- thunks (functions)
- array (parallel execution)
- objects (parallel execution)
- generators (delegation)
- generator functions (delegation)
- **any value!!!**

> Nested `thunkable`s are supported, meaning you can nest
thunkables within objects within arrays, and so on!

[slide]

## Thunkables in `thunks`

```js
var thunk = Thunk(thunkable1)(function* () {
  yield thunkable2
  return thunkable3;
})(function () {
  return thunkable4;
});

// Thunk.all(thunkable5, thunkable6, thunkable7);
// Thunk.seq(thunkable5, thunkable6, thunkable7);
// Thunk.race(thunkable5, thunkable6, thunkable7);
```

> `Thunk` 和 `return` 的数组或对象不会当做 `thunkable` 处理，而是当做结果值处理，`Thunk.all`、`Thunk.seq`、`Thunk.race` 和 `yield` 则会把数组和对象当做 `thunkable` 处理

[slide]

# `co` vs `thunks` ?

> 一开始，thunks 只想用纯函数实现 Promise 异步模式，那时 co 是基于 thunk 的，thunks 幻想某天能成为 co 的基础库，直到 co v4 移情别恋 promise 之后（一个月前），愤然支持 generator。

> `co`: 基于 promise，将任何 yield 右值转化为 promise 后处理，像 promise 一样及早求值，返回标准 promise 后无法再使用 generator；

> `thunks`: 基于 thunk 函数，将任何 yield 右值转化为 thunk 后处理，惰性求值，返回 thunk 函数可继续使用 generator；`thunks` 支持 es3，全兼容浏览器端。

> 可以把 `thunks` 当做 `co` 用，无法把 `co` 当做 `thunks` 用。

[slide]

### `co` 的及早求值：

```js
var promise = co(function*() {
  console.log(123);
  console.log(yield Promise.resolve('abc'));
});
// promise 已经运行求值完毕
promise.then(function () {/*...*/});
```

### `thunks` 的惰性求值：

```js
var thunk = Thunk(function*() {
  console.log(123);
  console.log(yield Promise.resolve('abc'));
});
// thunk 还未运行求值
thunk(function* () {/*...*/});
```

[slide]

### 一个 `promise` 单元的异常捕捉：

```js
var file = readFile('/etc/passwd'); // file 是一个 promise 对象
file.then(function (data) {
  console.log(data);
}).catch(function(err) {
  console.error(err);
})
```

### 一个 `thunk` 单元的异常捕捉：

```js
var file = readFile('/etc/passwd'); // file 是一个 thunk 函数
file(function (err, data) {
  if (err) return console.error(err);
  console.log(data);
});
```

[slide]

### 一个 `promise`s 组合的异常捕捉：

```js
co(function*() {
  yield readFile('file1');
  yield readFile('file2');
  yield readFile('file3');
}).catch(function(err) {
  console.error(err);
});
```

### 一个 `thunk`s 组合的异常捕捉：

```js
var Thunk = thunks(function(err) {
  console.error(err);
  // return true;
})

Thunk(function*() {
  yield readFile('file1');
  yield readFile('file2');
  yield readFile('file3');
})(function*() {
  yield readFile('file4');
  yield readFile('file5');
  yield readFile('file6');
})();
```
[thunks 的作用域和异常处理设计](https://github.com/thunks/thunks/issues/5)

[slide]

## 全新的 server 端异步开发模式？

## 因为

- `koa` 的中间件都运行在 `co` 中；
- `toa` 的中间件或模块都运行在 `thunks` 中；

## 所以

> 中间件就是 `Yieldables` 或 `Thunkables`，具体来说就是 thunk 函数、generator 函数。`toa` 的模块则更进一步，可以是 thunk 函数、generator 函数，也可以是返回 `Thunkables` 的函数。这些函数又支持 `nested`，所以里面可以有更复杂的异步逻辑。

[slide]

# 万物归宗

## 不管你用了多少中间件或模块、不管你用了多么复杂的中间件或模块，`koa` 把它们变成了一个 promise 对象，`toa` 把它们变成了一个 thunk 函数。

[slide]

# 万物归宗的思想开发中间件或模块

## `koa`

> `koa` 只有中间件，且中间件必须为 generator 函数，函数运行的 this 值即为 context。函数内部逻辑的复杂度随意，它会在 `co` 中运行

## `toa`

> `toa` 支持中间件，提倡模块化开发，中间件可为 generator 函数或普通的 thunk 函数，函数运行的 this 值即为 context。函数内部逻辑的复杂度随意，它会在 `thunks` 中运行。`toa` 模块则可为任何函数，如果有异步逻辑，则必须返回 `thunkable` 的对象或函数，如 thunk 函数、generator 函数、promise 对象、generator 对象。

[slide]

# `koa` vs `toa`

> `toa` 借鉴了 `koa`，很大程度上是相似的，比如 `context`、`request`、`response`，甚至异步开发思维都相似。

[slide]

# `koa` vs `toa` 之异步核心

> `co` 和 `thunks` 的不同之处带来的区别，前有所叙，简而言之是 `toa` 支持 node.js v0.10.x，目前 `toa` 既有的模块或中间件都支持 v0.10.x。

> 具体到 `koa` 和 `toa` 内部异步控制和异常捕捉的实现都有区别。

[slide]

# `koa` vs `toa` 之级联

> 级联是 `koa` 的核心，`toa` 却不支持级联，所以一般 `koa` 的中间件不能直接在 `toa` 中运行。我认为，对于大型应用来说，级联简直就是 `yield hell`，出了 bug 很难理清，编写 middleware 也要步步小心。

[slide]

# `koa` vs `toa` 之安全顾虑

> `koa` 的 `context` 挂载了 `app`，而且中间件可以访问 `context`，也就是任何第三方中间件都可以访问整个 application 内容！如果有第三方中间件作恶，如果开发者没这方面的意识，很容易出问题。

> `toa` 限制了 `context` 的能力，也提倡模块化开发，尽量少用中间件。所谓模块就是接受必要参数，返回 `thunkable` 函数的函数。最大程度上限制模块访问外部数据的能力。

[slide]

# `toa` 异常捕捉 demo

```js
var toa = require('toa');
var app = toa();

app.use(function (callback) {
  this.throw(401, new Error('Unauthorized'));
});

app.listen(3000);
```

```js
var toa = require('toa');
var app = toa(function (Thunk) {
  throw new Error('server error');
});

app.listen(3000);
```
