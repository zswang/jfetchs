import { ICacheStore } from 'jfetchs-util'
import { MemoryStore } from 'jfetchs-memory'
import { createHash } from 'crypto'

export { MemoryStore }
export interface ICacheOptions<T> {
  /**
   * 是否打印调试信息
   */
  debug?: boolean | string
  /**
   * 存储器
   */
  store?: ICacheStore<T>
  /**
   * 过期时间，单位：秒
   */
  expire?: number
  /**
   * 获取数据
   * @param query 查询条件
   * @param key hash 键值
   */
  fetch(query?: any, key?: string): Promise<T>
  /**
   * 计算 hash 值
   * @param query 查询条件
   */
  hash?(query?: any): string
}

/*<jdists encoding="ejs" data="../package.json">*/
/**
 * @file <%- name %>
 *
 * <%- description %>
 * @author
     <% (author instanceof Array ? author : [author]).forEach(function (item) { %>
 *   <%- item.name %> (<%- item.url %>)
     <% }); %>
 * @version <%- version %>
     <% var now = new Date() %>
 * @date <%- [
      now.getFullYear(),
      now.getMonth() + 101,
      now.getDate() + 100
    ].join('-').replace(/-1/g, '-') %>
 */
/*</jdists>*/

export class Cache<T> {
  /**
   * 配置项
   */
  private options: ICacheOptions<T>
  /**
   * 获取数据中
   */
  private fetching: { [key: string]: boolean } = {}
  /**
   * 读取队列
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
    if (!this.options.store) {
      this.options.store = new MemoryStore<T>()
    }
    if (!this.options.hash) {
      this.options.hash = query => {
        return createHash('sha1')
          .update(JSON.stringify(query))
          .digest('hex')
      }
    }
  }

  /**
   * 获取数据 Fetch cached data
   * @param key 缓存标志，默认: ''
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
   * @example fetch():key
    ```js
    (*<jdists import="?debug[desc='key']" />*)
    ```
   * @example fetch():resume
    ```js
    (*<jdists import="?debug[desc='resume']" />*)
    ```
   */
  fetch(query: any = ''): Promise<T> {
    let key = this.options.hash(query)

    // 日志前缀
    const prefix =
      typeof this.options.debug === 'string'
        ? ` ${JSON.stringify(this.options.debug)}${
            key === '' ? '' : `(${key})`
          }`
        : ''

    // 数据正在获取中
    if (this.fetching[key]) {
      if (this.options.debug) {
        console.log(`^linenum${prefix} fetching in queue`)
      }
      return new Promise((resolve, reject) => {
        this.queue[key] = this.queue[key] || []
        this.queue[key].push({
          resolve: resolve,
          reject: reject,
        })
      })
    }

    this.fetching[key] = true
    return this.options.store.load(key).then(data => {
      return new Promise((resolve, reject) => {
        if (data !== undefined) {
          if (this.options.debug) {
            console.log(`^linenum${prefix} hitting cache`)
          }
          this.fetching[key] = false
          return resolve(data)
        }

        if (this.options.debug) {
          console.log(`^linenum${prefix} missing cache`)
        }

        this.flush(key)
        this.options
          .fetch(query, key)
          .then(data => {
            return this.options.store
              .save(key, data, this.options.expire)
              .then(() => data)
          })
          .then(data => {
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
            this.fetching[key] = false
            if (this.queue[key]) {
              let item
              while ((item = this.queue[key].shift())) {
                item.reject(err)
              }
            }
            reject(err)
          })
      }) as Promise<T>
    })
  }
  /**
   * 移除缓存 Remove cached data
   * @param query 查询条件
   */
  flush(query: any = ''): Promise<boolean> {
    let key = this.options.hash(query)
    return this.options.store.remove(key)
  }
}

/*<remove>*/
const jfetchs = {
  MemoryStore,
  Cache,
}

/*<debug desc="debugstring">*/
let cache1 = new jfetchs.Cache({
  debug: 'count1',
  expire: 1,
  fetch: (() => {
    let count = 0
    return query => {
      return Promise.resolve(`cache1 ${query}${count++}`)
    }
  })(),
  hash: query => {
    if (['string', 'number', 'boolean'].indexOf(typeof query) >= 0) {
      return String(query)
    }
    return JSON.stringify(query)
  },
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
  debug: true,
  fetch: (query, key) => {
    console.log(query)
    // >
    console.log(key)
    // > dd29ecf524b030a65261e3059c48ab9e1ecb2585
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
/*</debug>*/

/*<debug desc="key">*/
let cache6 = new jfetchs.Cache({
  debug: true,
  fetch: query => {
    if (query === 6) {
      return Promise.resolve(666)
    }
    return Promise.reject(`cache6 ${query} error`)
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
/*</debug>*/

/*<debug desc="resume">*/
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
/*</debug>*/
/*</remove>*/
