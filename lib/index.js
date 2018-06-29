/* istanbul ignore next */
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
(function (root, factory) {
    /* istanbul ignore next */
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    } else { factory(null, root["jfetchs"] = {}); }
})(this, function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Cache = /** @class */ (function () {
        function Cache(options) {
            this.fetchedAt = 0;
            /**
             * 读取队列2
             */
            this.queue = [];
            this.options = __assign({ debug: false, expire: 60 * 60 }, options);
        }
        /**
         * 获取数据
         * @example fetch():debugstring
          ```js
          let cache1 = new jfetchs.Cache({
        debug: 'count1',
        expire: 1,
        fetch: (() => {
          let count = 0
          return () => {
            return Promise.resolve(`cache1 ${count++}`)
          }
        })(),
      })
      cache1.fetch().then(data => {
        console.log(data)
        // > cache1 0
      })
      setTimeout(() => {
        cache1.fetch().then(data => {
          console.log(data)
          // > cache1 0
        })
      }, 500)
      setTimeout(() => {
        cache1.fetch().then(data => {
          console.log(data)
          // > cache1 1
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
          ```
         */
        Cache.prototype.fetch = function () {
            var _this = this;
            var now = Date.now();
            var prefix = typeof this.options.debug === 'string'
                ? ' ' + JSON.stringify(this.options.debug)
                : '';
            if (now - this.fetchedAt <= this.options.expire * 1000) {
                if (this.options.debug) {
                    console.log("jfetchs/src/index.ts:69" + prefix + " hitting cache");
                }
                return Promise.resolve(this.fetchData);
            }
            if (this.fetching) {
                if (this.options.debug) {
                    console.log("jfetchs/src/index.ts:76" + prefix + " fetching in queue");
                }
                return new Promise(function (resolve, reject) {
                    _this.queue.push({
                        resolve: resolve,
                        reject: reject,
                    });
                });
            }
            if (this.options.debug) {
                console.log("jfetchs/src/index.ts:87" + prefix + " missing cache");
            }
            this.flush();
            this.fetching = true;
            return new Promise(function (resolve, reject) {
                _this.options
                    .fetch()
                    .then(function (data) {
                    _this.fetchData = data;
                    _this.fetchedAt = now;
                    _this.fetching = false;
                    var item;
                    while ((item = _this.queue.shift())) {
                        item.resolve(data);
                    }
                    resolve(data);
                })
                    .catch(function (err) {
                    var item;
                    while ((item = _this.queue.shift())) {
                        item.reject(err);
                    }
                    reject(err);
                });
            });
        };
        /**
         * 移除缓存
         */
        Cache.prototype.flush = function () {
            this.fetchData = null;
            this.fetchedAt = 0;
        };
        return Cache;
    }());
    exports.Cache = Cache;
});
