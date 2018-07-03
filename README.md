## jfetchs

# [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coverage-image]][coverage-url]

封装获取缓存的方法 Cache of fetch data

## 使用方法 Usage

### 声明缓存 Declaration cache

```js
var cache = new jfetchs.Cache({
  debug: 'localhost',
  expire: 60, // 60 seconds
  fetch: () => {
    return Promise.resolve(Date.now())
  },
})

cache.fetch().then(data => {
  console.log(data)
})
```

## API

### Cache.fetch

```js
/**
 * 获取数据 Fetch cached data
 * @param key 缓存标志，默认: ''
 */
Cache.fetch(key?: string) {}
```

### Cache.flush

```js
/**
 * 移除缓存 Remove cached data
 * @param key 缓存标志，默认: ''
 */
Cache.flush(key?: string) {}
```

## License

MIT © [zswang](http://weibo.com/zswang)

[npm-url]: https://npmjs.org/package/jfetchs
[npm-image]: https://badge.fury.io/js/jfetchs.svg
[travis-url]: https://travis-ci.org/zswang/jfetchs
[travis-image]: https://travis-ci.org/zswang/jfetchs.svg?branch=master
[coverage-url]: https://coveralls.io/github/zswang/jfetchs?branch=master
[coverage-image]: https://coveralls.io/repos/zswang/jfetchs/badge.svg?branch=master&service=github
