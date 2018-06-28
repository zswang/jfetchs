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
            this.options = __assign({ debug: false, expire: 1 }, options);
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
      cache3
        .fetch()
        .then(data => {
          console.log(data)
          // > cache3 0
        })
        .then(() => {
          return cache3.fetch().then(data => {
            console.log(data)
            // > cache3 0
          })
        })
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
         */
        Cache.prototype.fetch = function () {
            var _this = this;
            var now = Date.now();
            if (now - this.fetchedAt <= this.options.expire * 1000) {
                if (this.options.debug) {
                    console.log("jfetchs/src/index.ts:50" + (typeof this.options.debug === 'string'
                        ? ' ' + JSON.stringify(this.options.debug)
                        : '') + " hitting cache");
                }
                return Promise.resolve(this.fetchData);
            }
            if (this.options.debug) {
                console.log("jfetchs/src/index.ts:62" + (typeof this.options.debug === 'string'
                    ? ' ' + JSON.stringify(this.options.debug)
                    : '') + " missing cache");
            }
            return this.options.fetch().then(function (data) {
                _this.fetchData = data;
                _this.fetchedAt = now;
                return data;
            });
        };
        return Cache;
    }());
    exports.Cache = Cache;
});
