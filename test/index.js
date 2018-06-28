
const jfetchs = require('../')
      

describe("src/index.ts", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("fetch():debugstring", function (done) {
    examplejs_printLines = [];
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
  examplejs_print(data)
  assert.equal(examplejs_printLines.join("\n"), "cache1 0"); examplejs_printLines = [];
})
setTimeout(() => {
  cache1.fetch().then(data => {
    examplejs_print(data)
    assert.equal(examplejs_printLines.join("\n"), "cache1 0"); examplejs_printLines = [];
  })
}, 500)
setTimeout(() => {
  cache1.fetch().then(data => {
    examplejs_print(data)
    assert.equal(examplejs_printLines.join("\n"), "cache1 1"); examplejs_printLines = [];
    done();
  })
}, 1200)
  });
          
  it("fetch():debugtrue", function (done) {
    examplejs_printLines = [];
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
  examplejs_print(data)
  assert.equal(examplejs_printLines.join("\n"), "cache2 0"); examplejs_printLines = [];
})
setTimeout(() => {
  cache2.fetch().then(data => {
    examplejs_print(data)
    assert.equal(examplejs_printLines.join("\n"), "cache2 0"); examplejs_printLines = [];
  })
}, 500)
setTimeout(() => {
  cache2.fetch().then(data => {
    examplejs_print(data)
    assert.equal(examplejs_printLines.join("\n"), "cache2 1"); examplejs_printLines = [];
    done();
  })
}, 1200)
  });
          
  it("fetch():nodebug", function (done) {
    examplejs_printLines = [];
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
  examplejs_print(data)
  assert.equal(examplejs_printLines.join("\n"), "cache3 0"); examplejs_printLines = [];
})
cache3.fetch().then(data => {
  examplejs_print(data)
  assert.equal(examplejs_printLines.join("\n"), "cache3 0"); examplejs_printLines = [];
})
cache3.fetch().then(data => {
  examplejs_print(data)
  assert.equal(examplejs_printLines.join("\n"), "cache3 0"); examplejs_printLines = [];
})
setTimeout(() => {
  cache3.fetch().then(data => {
    examplejs_print(data)
    assert.equal(examplejs_printLines.join("\n"), "cache3 0"); examplejs_printLines = [];
  })
}, 50)
setTimeout(() => {
  cache3.fetch().then(data => {
    examplejs_print(data)
    assert.equal(examplejs_printLines.join("\n"), "cache3 1"); examplejs_printLines = [];
  })
}, 500)
setTimeout(() => {
  cache3.fetch().then(data => {
    examplejs_print(data)
    assert.equal(examplejs_printLines.join("\n"), "cache3 2"); examplejs_printLines = [];
    done();
  })
}, 1200)
  });
          
  it("fetch():reject", function () {
    examplejs_printLines = [];
    let cache4 = new jfetchs.Cache({
  fetch: () => {
    return Promise.reject('cache4 error')
  },
})
cache4.fetch().catch(err => {
  examplejs_print(err)
  assert.equal(examplejs_printLines.join("\n"), "cache4 error"); examplejs_printLines = [];
})
cache4.fetch().catch(err => {
  examplejs_print(err)
  assert.equal(examplejs_printLines.join("\n"), "cache4 error"); examplejs_printLines = [];
})
  });
          
});
         