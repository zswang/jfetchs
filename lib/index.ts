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
    (): Promise<T>
  }
}
export class Cache<T> {
  options: ICacheOptions<T>
  fetchedAt: number = 0
  fetchData: T
  constructor(options: ICacheOptions<T>) {
    this.options = {
      debug: false,
      expire: 1,
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
  fetch(): Promise<T> {
    const now = Date.now()
    if (now - this.fetchedAt <= this.options.expire * 1000) {
      if (this.options.debug) {
        console.log(
          `jfetchs/src/index.ts:50${
            typeof this.options.debug === 'string'
              ? ' ' + JSON.stringify(this.options.debug)
              : ''
          } hitting cache`
        )
      }
      return Promise.resolve(this.fetchData)
    }
    if (this.options.debug) {
      console.log(
        `jfetchs/src/index.ts:62${
          typeof this.options.debug === 'string'
            ? ' ' + JSON.stringify(this.options.debug)
            : ''
        } missing cache`
      )
    }
    return this.options.fetch().then(data => {
      this.fetchData = data
      this.fetchedAt = now
      return data
    })
  }
}
