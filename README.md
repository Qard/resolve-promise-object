# resolve-promise-object
[![Build Status](https://travis-ci.org/Qard/resolve-promise-object.png)](https://travis-ci.org/Qard/resolve-promise-object)

Easily resolve an object full of promises, or even recursively construct an object made of promises.

## Install

    npm install resolve-promise-object

## Usage
    
    var p1 = Q.defer()
    var p2 = Q.defer()

    resolvePromises({
      foo: p.promise
    }, function (err, res) {
      console.log(res.foo.bar) // baz
    })

    p1.resolve({
      bar: p2.promise
    })

    p2.resolve('baz')

---

### Copyright (c) 2013 Stephen Belanger
#### Licensed under MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
