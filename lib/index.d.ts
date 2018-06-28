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
        (): Promise<T>;
    };
}
export declare class Cache<T> {
    private options;
    private fetchedAt;
    private fetchData;
    /**
     * 获取数据中
     */
    private fetching;
    /**
     * 读取队列
     */
    private queue;
    constructor(options: ICacheOptions<T>);
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
    fetch(): Promise<T>;
}
//# sourceMappingURL=index.d.ts.map