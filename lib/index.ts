export interface ICacheOptions<T> {
  /**
   * 是否打印调试信息
   */
  debug?: boolean | string
  /**
   * 过期时间，单位：秒
   */
  expire?: number
  /**
   * 获取数据的方法
   */
  fetch: {
    (key?: string | number): Promise<T>
  }
}
export class Cache<T> {
  private options: ICacheOptions<T>
  private fetchedAt: { [key: string]: number } = {}
  private fetchData: { [key: string]: T } = {}
  /**
   * 获取数据中
   */
  private fetching: { [key: string]: boolean } = {}
  /**
   * 读取队列2
   */
  private queue: {
    [key: string]: {
      resolve: Function
      reject: Function
    }[]
  } = {}
  constructor(options: ICacheOptions<T>) {
    this.options = {
      debug: false,
      expire: 60 * 60, // 1 hours
      ...options,
    }
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
  fetch(key: string | number = ''): Promise<T> {
    const now = Date.now()
    const prefix =
      typeof this.options.debug === 'string'
        ? ' ' + JSON.stringify(this.options.debug)
        : ''
    if (now - (this.fetchedAt[key] || 0) <= this.options.expire * 1000) {
      if (this.options.debug) {
        console.log(`jfetchs/src/index.ts:75${prefix} hitting cache`)
      }
      return Promise.resolve(this.fetchData[key])
    }
    if (this.fetching[key]) {
      if (this.options.debug) {
        console.log(`jfetchs/src/index.ts:82${prefix} fetching in queue`)
      }
      return new Promise((resolve, reject) => {
        this.queue[key] = this.queue[key] || []
        this.queue[key].push({
          resolve: resolve,
          reject: reject,
        })
      })
    }
    if (this.options.debug) {
      console.log(`jfetchs/src/index.ts:94${prefix} missing cache`)
    }
    this.flush()
    this.fetching[key] = true
    return new Promise((resolve, reject) => {
      this.options
        .fetch(key)
        .then(data => {
          this.fetchData[key] = data
          this.fetchedAt[key] = now
          this.fetching[key] = false
          if (this.queue[key]) {
            let item
            while ((item = this.queue[key].shift())) {
              item.resolve(data)
            }
          }
          resolve(data)
        })
        .catch(err => {
          if (this.queue[key]) {
            let item
            while ((item = this.queue[key].shift())) {
              item.reject(err)
            }
          }
          reject(err)
        })
    })
  }
  /**
   * 移除缓存
   */
  flush(key: string | number = '') {
    this.fetchData[key] = null
    this.fetchedAt[key] = 0
  }
}
