title: thunks & thunk-redis
speaker: Qing Yan
url: https://github.com/zensh
transition: move
files: /js/app.js, /css/app.css

[slide]

# thunks & thunk-redis
## Write complex asynchronous API with a simple module
<small>2014.11.07</small>

<div class="logo"></div>

[slide]

## 严 清
> Leader / front-end engineer for teambition

https://github.com/zensh

http://weibo.com/zensh

## 20+ public repositories on github:

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

## 男神

![TJ Holowaychuk](/img/tj.jpg "TJ Holowaychuk")

<small>TJ Holowaychuk</small>

`thunk` comes from https://github.com/tj/co

[slide]

## thunk function in `co`

```js
var co = require('co');
var fs = require('fs');

// wrap `fs.readFile` to a thunk function
function readFile(fileName) {
  return function (callback) {
    fs.readFile(fileName, 'utf8', callback);
  };
}

// yield thunk function in co
co(function *() {

  var json = yield readFile('package.json');
  var js = yield readFile('index.js');
  console.log(json, js);

})(function (error) {
  console.log('end');
});
```
[slide]

## thunk is the execution unit in `co`

```js
// Convert `obj` into a normalized thunk.
function toThunk(obj, ctx) {
  if (isGeneratorFunction(obj)) {
    return co(obj.call(ctx));
  }
  if (isGenerator(obj)) {
    return co(obj);
  }
  if (isPromise(obj)) {
    return promiseToThunk(obj);
  }
  if ('function' == typeof obj) {
    return obj;
  }
  if (isObject(obj) || Array.isArray(obj)) {
    return objectToThunk.call(ctx, obj);
  }
  return obj;
}
```

[slide]

> Is there any chance to implement asynchronous task with pure thunk functions?


> **2 rules enhance thunk function for asynchronous.**

[slide]

### 1. always return a new thunk for chain (similar to Promise).

```js
var Thunk = require('thunks')();

// generate a seed thunk function
var thunkA = Thunk(function (callback) {
  // some task
  callback(error, result);
});

// run a thunk function and return a another thunk function
var thunkB = thunkA(function(err, res) {/*...*/});
var thunkC = thunkB(function(err, res) {/*...*/});
var thunkD = thunkC(function(err, res) {/*...*/});
//... always return a new thunk function.

//another style...
Thunk(function(callback) {/*...*/})(callback)(callback)(callback)(callback)//...;
```

[slide]

### 2. return a thunk in callback for asynchronous (similar to Promise).

```js
var Thunk = require('thunks')();

var thunkA = Thunk(function (callback) {/*...*/});
var thunkB = Thunk(function (callback) {/*...*/});
var thunkC = Thunk(function (callback) {/*...*/});
var thunkD = Thunk(function (callback) {/*...*/});

thunkA(function(err, res) {
  // do some thing
  return thunkB;
})(function(err, res) {
  // do some thing
  return thunkC;
})(function(err, res) {
  // do some thing
  return thunkD;
})(function(err, res) {
  // end
})
```

[slide]

## It is `thunks`
https://github.com/teambition/thunks

```js
var Thunk = require('thunks')();
var readFile = Thunk.thunkify(require('fs').readFile);

readFile('package.json')(function (err, res) {

  console.log(res); // package.json
  return readFile('index.js');

})(function (err, res) {

  console.log(res); // index.js
  return readFile('README.md')(function (err, res) {
    console.log(res); // README.md
    return 'end';
  });

})(function (err, res) {
  console.log(res); // 'end'
});
```

[slide]

## Wrap anything to thunk

```js
var Thunk = require('thunks')();

// wrap simple value
Thunk('abc')(console.log) // null, 'abc'

// wrap function
Thunk(function (callback) { callback(null, 123); })(console.log) // null, 123

// wrap thunk
Thunk(Thunk(Thunk('deep nested thunk')))(console.log) // null, 'deep nested thunk'

// wrap promise
Thunk(Promise.resolve('promise'))(console.log) // null, 'promise'

// wrap co
Thunk(co(function *() { return yield [1, 2, 3]; }))(console.log) // null, '[1, 2, 3]'

// wrap then.js
Thunk(thenjs('thenjs'))(console.log) // null, 'thenjs'
```

[slide]

### Run in parallel or sequence

```js
var Thunk = require('thunks')();

// parallel
Thunk.all([
  Thunk(function (callback) { setTimeout(function () { callback(null, 1); }, 1050); }),
  2,
  Thunk(3),
  Promise.resolve(4),
  function (callback) { setTimeout(function () { callback(null, 5); }, 1000); },
])(console.log); // null, [1, 2, 3, 4, 5]

// sequence
var result = [], thunk = Thunk(1);
for (var i = 0; i < 5; i++) {
  thunk = thunk(function (err, res) {
    result.push(res);
    return ++res;
  });
}
thunk(function (error) {
  console.log(error, result); // null, [1, 2, 3, 4, 5]
});
```

[slide]

### Debug and error catch in thunk's scope

```js
// generator of thunks, it generates the main function `Thunk` with scope.
var thunks = require('thunks');

// catch error
var Thunk = thunks(function (err) {
  console.log(err); // [Error: some error]
});

Thunk(123)(function (err, res) {
  throw new Error('some error');
})(function (err, res) {
  console.log(err); // will not run!
});

// debug and catch error
var Thunk2 = thunks({
  debug: console.log,
  onerror: console.log
});

Thunk(123)(function (err, res) {
  throw new Error('some error');
})(function (err, res) {
  console.log(err); // will not run!
});
```

[slide]

## `thunks` and `co` and `Promise`

```js
var Thunk = require('thunks');
var co = require('co');

Thunk(123)(function(err, res) {

  console.log(err, res); // null, 123
  return Promise.resolve(456);
})(function(err, res) {

  console.log(err, res); // null, 456
  return co(function *() {
    return yield [Thunk('a'), Promise.resolve('b')];
  });
})(function(err, res) {
  console.log(err, res); // null, ['a', 'b']
});
```

[slide]

### `npm install thunks`
or
### `bower install thunks`

* 220 lines code
* 5 times faster as native Promise
* compatible ES3, just run it in node.js and all bowsers.

[slide]

```bash
➜  thunks git:(master) node benchmark/index
Sync Benchmark...

JSBench Start (1000 cycles, async mode):
Test Promise...
Test thunk...

JSBench Results:
Promise: 1000 cycles, 13.818 ms/cycle, 72.369 ops/sec
thunk: 1000 cycles, 3.023 ms/cycle, 330.797 ops/sec

Promise: 100%; thunk: 457.10%;

JSBench Completed!
```

[slide]

![Cook](/img/cook.jpg "Cook")
## One more thing...

[slide]

## thunk-redis
> A thunk-based redis client with pipelining.

https://github.com/zensh/thunk-redis

```js
var redis = require('thunk-redis');
var client = redis.createClient({authPass: '123456', database: 1});

client.info('server')(function (error, res) {

  console.log('redis server info: ', res);
  return this.dbsize();
})(function (error, res) {

  console.log('database size: ', res);
  return this.select(10);
})(function (error, res) {

  console.log('select database 10: ', res);
  this.clientEnd();
});
```

[slide]

## thunk-redis demo: Pub/Sub

```js
var Thunk = require('thunks')();
var redis = require('thunk-redis');
var clientSub = redis.createClient();
var clientPub = redis.createClient();

clientSub.on('message', function (channel, message) {
  console.log(channel, message);
});

clientSub.subscribe('teambition')(function (err, res) {
  return Thunk.all([
    clientPub.publish('teambition', 'Hello'),
    clientPub.publish('teambition', 'Welcome to teambition'),
    clientPub.publish('teambition', 'This is the one more thing.')
  ]);
})(function (err) {
  clientSub.quit();
  clientPub.quit();
});

```
