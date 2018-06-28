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
  private options: ICacheOptions<T>
  private fetchedAt: number = 0
  private fetchData: T
  /**
   * 获取数据中
   */
  private fetching: boolean
  /**
   * 读取队列
   */
  private queue: {
    resolve: Function
    reject: Function
  }[] = []

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
    (*<jdists import="?debug[desc='debugstring']" />*)
    ```
   * @example fetch():debugtrue
    ```js
    (*<jdists import="?debug[desc='debugtrue']" />*)
    ```
   * @example fetch():nodebug
    ```js
    (*<jdists import="?debug[desc='nodebug']" />*)
    ```
   * @example fetch():reject
    ```js
    (*<jdists import="?debug[desc='reject']" />*)
    ```
   */
  fetch(): Promise<T> {
    const now = Date.now()
    if (now - this.fetchedAt <= this.options.expire * 1000) {
      if (this.options.debug) {
        console.log(
          `^linenum${
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
        `^linenum${
          typeof this.options.debug === 'string'
            ? ' ' + JSON.stringify(this.options.debug)
            : ''
        } missing cache`
      )
    }

    if (this.fetching) {
      return new Promise((resolve, reject) => {
        this.queue.push({
          resolve: resolve,
          reject: reject,
        })
      })
    }

    this.fetching = true
    return new Promise((resolve, reject) => {
      this.options
        .fetch()
        .then(data => {
          this.fetchData = data
          this.fetchedAt = now
          this.fetching = false
          let item
          while ((item = this.queue.shift())) {
            item.resolve(data)
          }
          resolve(data)
        })
        .catch(err => {
          let item
          while ((item = this.queue.shift())) {
            item.reject(err)
          }
          reject(err)
        })
    })
  }
}

/*<remove>*/
const jfetchs = {
  Cache,
}

/*<debug desc="debugstring">*/
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
/*</debug>*/

/*<debug desc="debugtrue">*/
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
/*</debug>*/

/*<debug desc="nodebug">*/
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
/*</debug>*/

/*<debug desc="reject">*/
let cache4 = new jfetchs.Cache({
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
/*</debug>*/
/*</remove>*/
