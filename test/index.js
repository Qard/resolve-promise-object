var should = require('should')
var resolver = require('..')
var Q = require('q')

describe('promise resolution', function () {

  it('should work directly', function (done) {
    var p = Q.defer()

    resolver(p.promise, function (err, res) {
      if (err) return done(err)
      res.should.eql('foo')
      done()
    })

    setImmediate(function () {
      p.resolve('foo')
    })
  })

  it('should work within objects', function (done) {
    var p = Q.defer()

    resolver({
      foo: p.promise
    }, function (err, res) {
      if (err) return done(err)
      res.should.have.property('foo', 'bar')
      done()
    })

    setImmediate(function () {
      p.resolve('bar')
    })
  })

  it('should work with deep structures', function (done) {
    var p = Q.defer()

    resolver({
      foo: { bar: p.promise }
    }, function (err, res) {
      if (err) return done(err)
      res.should.have.property('foo')
        .and.have.property('bar', 'baz')
      done()
    })

    setImmediate(function () {
      p.resolve('baz')
    })
  })

  it('should work in parallel', function (done) {
    var p1 = Q.defer()
    var p2 = Q.defer()

    resolver({
      foo: p1.promise,
      bar: { baz: p2.promise }
    }, function (err, res) {
      if (err) return done(err)
      res.should.have.property('foo', 'bar')
      res.should.have.property('bar')
        .and.have.property('baz', 'buz')
      done()
    })

    setImmediate(function () {
      p1.resolve('bar')

      setImmediate(function () {
        p2.resolve('buz')
      })
    })
  })

  it('should work with nested promises', function (done) {
    var p1 = Q.defer()
    var p2 = Q.defer()
    var p3 = Q.defer()

    resolver({
      foo: p1.promise
    }, function (err, res) {
      if (err) return done(err)
      res.should.have.property('foo')
        .and.have.property('bar')
        .and.have.property('baz', 'buz')
      done()
    })

    setImmediate(function () {
      p1.resolve({
        bar: p2.promise
      })

      setImmediate(function () {
        p2.resolve({
          baz: p3.promise
        })

        setImmediate(function () {
          p3.resolve('buz')
        })
      })
    })
  })

})

describe('graceful rejection', function () {

  it('should receive error on rejection', function (done) {
    var p = Q.defer()

    resolver(p.promise, function (err, res) {
      should.exist(err)
      err.should.eql('foo')
      done()
    })

    setImmediate(function () {
      p.reject('foo')
    })
  })

  it('should handle partial rejection', function (done) {
    var p1 = Q.defer()
    var p2 = Q.defer()

    resolver({
      foo: p1.promise,
      bar: p2.promise
    }, function (err, res) {
      should.exist(err)
      err.should.eql('baz')
      done()
    })

    setImmediate(function () {
      p1.resolve('bar')

      setImmediate(function () {
        p2.reject('baz')
      })
    })
  })

})

describe('query support', function () {

  function MockQuery (input, fail) {
    this.input = input
    this.fail = fail
  }
  MockQuery.prototype.exec = function (fn) {
    fn(this.fail, this.input)
  }

  it('should handle successful exec', function (done) {
    resolver({
      foo: new MockQuery('bar')
    }, function (err, res) {
      if (err) return done(err)
      res.should.have.property('foo', 'bar')
      done()
    })
  })

  it('should handle failed exec', function (done) {
    resolver({
      foo: new MockQuery('bar', new Error('boo'))
    }, function (err, res) {
      should.exist(err)
      err.message.should.eql('boo')
      done()
    })
  })

})

describe('toJSON support', function () {

  function JSONable (obj) {
    this.obj = obj
  }
  JSONable.prototype.toJSON = function () {
    return this.obj
  }

  it('should call toJSON', function (done) {
    resolver(new JSONable({ foo: 'bar' }), function (err, res) {
      if (err) return done(err)
      res.should.have.property('foo', 'bar')
      done()
    })
  })

})
