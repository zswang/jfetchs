"use strict";
/* istanbul ignore next */
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var jfetchs_memory_1 = require("jfetchs-memory");
exports.MemoryStore = jfetchs_memory_1.MemoryStore;
/**
 * @file jfetchs
 *
 * Cache of fetch data
 * @author
 *   zswang (http://weibo.com/zswang)
 * @version 0.1.27
 * @date 2018-09-16
 */
var Cache = /** @class */ (function () {
    function Cache(options) {
        /**
         * 获取数据中
         */
        this.fetching = {};
        /**
         * 读取队列
         */
        this.queue = {};
        this.options = __assign({ debug: false, expire: 60 * 60 }, options);
        if (!this.options.store) {
            this.options.store = new jfetchs_memory_1.MemoryStore();
        }
    }
    /**
     * 获取数据 Fetch cached data
     * @param key 缓存标志，默认: ''
     * @example fetch():debugstring
      ```js
      let cache1 = new jfetchs.Cache({
    debug: 'count1',
    expire: 1,
    fetch: (() => {
      let count = 0
      return key => {
        return Promise.resolve(`cache1 ${key}${count++}`)
      }
    })(),
  })
  cache1.fetch('c').then(data => {
    console.log(data)
    // > cache1 c0
  })
  setTimeout(() => {
    cache1.fetch('d').then(data => {
      console.log(data)
      // > cache1 d1
    })
  }, 500)
  setTimeout(() => {
    cache1.fetch().then(data => {
      console.log(data)
      // > cache1 2
      // * done
    })
  }, 1200)
      ```
     * @example fetch():debugtrue
      ```js
      let cache2 = new jfetchs.Cache({
    debug: true,
    expire: 1,
    fetch: (() => {
      let count = 0
      return () => {
        return Promise.resolve(`cache2 ${count++}`)
      }
    })(),
  })
  cache2.fetch().then(data => {
    console.log(data)
    // > cache2 0
  })
  setTimeout(() => {
    cache2.fetch().then(data => {
      console.log(data)
      // > cache2 0
    })
  }, 500)
  setTimeout(() => {
    cache2.fetch().then(data => {
      console.log(data)
      // > cache2 1
      // * done
    })
  }, 1200)
      ```
     * @example fetch():nodebug
      ```js
      let cache3 = new jfetchs.Cache({
    expire: 0.1,
    fetch: (() => {
      let count = 0
      return () => {
        return Promise.resolve(`cache3 ${count++}`)
      }
    })(),
  })
  cache3.fetch().then(data => {
    console.log(data)
    // > cache3 0
  })
  cache3.fetch().then(data => {
    console.log(data)
    // > cache3 0
  })
  cache3.fetch().then(data => {
    console.log(data)
    // > cache3 0
  })
  setTimeout(() => {
    cache3.fetch().then(data => {
      console.log(data)
      // > cache3 0
    })
  }, 50)
  setTimeout(() => {
    cache3.fetch().then(data => {
      console.log(data)
      // > cache3 1
    })
  }, 500)
  setTimeout(() => {
    cache3.fetch().then(data => {
      console.log(data)
      // > cache3 2
      // * done
    })
  }, 1200)
      ```
     * @example fetch():reject
      ```js
      let cache4 = new jfetchs.Cache({
    debug: true,
    fetch: () => {
      return Promise.reject('cache4 error')
    },
  })
  cache4.fetch().catch(err => {
    console.log(err)
    // > cache4 error
  })
  cache4.fetch().catch(err => {
    console.log(err)
    // > cache4 error
  })
  let cache5 = new jfetchs.Cache({
    debug: 'cache5',
    fetch: () => {
      return Promise.reject('cache5 error')
    },
  })
  cache5.fetch().catch(err => {
    console.log(err)
    // > cache5 error
  })
  cache5.fetch().catch(err => {
    console.log(err)
    // > cache5 error
  })
  cache5.fetch(8).catch(err => {
    console.log(err)
    // > cache5 error
  })
      ```
     * @example fetch():key
      ```js
      let cache6 = new jfetchs.Cache({
    debug: true,
    fetch: key => {
      if (key === 6) {
        return Promise.resolve(666)
      }
      return Promise.reject(`cache6 ${key} error`)
    },
  })
  cache6.fetch('ok').catch(err => {
    console.log(err)
    // > cache6 ok error
  })
  cache6.fetch(3).catch(err => {
    console.log(err)
    // > cache6 3 error
  })
  cache6.flush(3)
  cache6.flush()
  cache6.fetch(6).then(data => {
    console.log(data)
    // > 666
  })
      ```
     * @example fetch():resume
      ```js
      let error
  const cache7 = new jfetchs.Cache({
    store: new jfetchs.MemoryStore(),
    fetch: () => {
      if (error) {
        return Promise.reject(error)
      }
      return Promise.resolve('ok')
    },
  })
  error = '#1'
  cache7
    .fetch()
    .then()
    .catch(err => {
      console.log(err)
      // > #1
    })
  setTimeout(() => {
    error = null
    cache7
      .fetch()
      .then(reply => {
        console.log(reply)
        // > ok
        // * done
      })
      .catch()
  }, 100)
      ```
     */
    Cache.prototype.fetch = function (key) {
        var _this = this;
        if (key === void 0) { key = ''; }
        // 日志前缀
        var prefix = typeof this.options.debug === 'string'
            ? " " + JSON.stringify(this.options.debug) + (key === '' ? '' : "(" + key + ")")
            : '';
        // 数据正在获取中
        if (this.fetching[key]) {
            if (this.options.debug) {
                console.log("jfetchs/src/index.ts:115" + prefix + " fetching in queue");
            }
            return new Promise(function (resolve, reject) {
                _this.queue[key] = _this.queue[key] || [];
                _this.queue[key].push({
                    resolve: resolve,
                    reject: reject,
                });
            });
        }
        this.fetching[key] = true;
        return this.options.store.load(key).then(function (data) {
            return new Promise(function (resolve, reject) {
                if (data !== undefined) {
                    if (_this.options.debug) {
                        console.log("jfetchs/src/index.ts:131" + prefix + " hitting cache");
                    }
                    _this.fetching[key] = false;
                    return resolve(data);
                }
                if (_this.options.debug) {
                    console.log("jfetchs/src/index.ts:138" + prefix + " missing cache");
                }
                _this.flush(key);
                _this.options
                    .fetch(key)
                    .then(function (data) {
                    return _this.options.store
                        .save(key, data, _this.options.expire)
                        .then(function () { return data; });
                })
                    .then(function (data) {
                    _this.fetching[key] = false;
                    if (_this.queue[key]) {
                        var item = void 0;
                        while ((item = _this.queue[key].shift())) {
                            item.resolve(data);
                        }
                    }
                    resolve(data);
                })
                    .catch(function (err) {
                    _this.fetching[key] = false;
                    if (_this.queue[key]) {
                        var item = void 0;
                        while ((item = _this.queue[key].shift())) {
                            item.reject(err);
                        }
                    }
                    reject(err);
                });
            });
        });
    };
    /**
     * 移除缓存 Remove cached data
     * @param key 缓存标志，默认: ''
     */
    Cache.prototype.flush = function (key) {
        if (key === void 0) { key = ''; }
        return this.options.store.remove(key);
    };
    return Cache;
}());
exports.Cache = Cache;
