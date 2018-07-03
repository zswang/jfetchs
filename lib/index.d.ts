export interface ICacheOptions<T> {
    /**
     * 是否打印调试信息
     */
    debug?: boolean | string;
    /**
     * 过期时间，单位：秒
     */
    expire?: number;
    /**
     * 获取数据的方法
     */
    fetch: {
        (key?: string | number): Promise<T>;
    };
}
/**
 * @file jfetchs
 *
 * Cache of fetch data
 * @author
 *    ()
 * @version 0.1.8
 * @date 2018-07-03
 */
export declare class Cache<T> {
    /**
     * 配置项
     */
//     private options;
    /**
     * 缓存开始时间
     */
//     private fetchedAt;
    /**
     * 缓存数据
     */
//     private fetchData;
    /**
     * 获取数据中
     */
//     private fetching;
    /**
     * 读取队列
     */
//     private queue;
    constructor(options: ICacheOptions<T>);
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
  cache6.fetch(6).then(data => {
    console.log(data)
    // > 666
  })
      ```
     */
    fetch(key?: string | number): Promise<T>;
    /**
     * 移除缓存 Remove cached data
     * @param key 缓存标志，默认: ''
     */
    flush(key?: string | number): void;
}
//# sourceMappingURL=index.d.ts.map