module.exports = resolve

function resolve (object, callback) {
  // If the property is not an object,
  // it needs no further processing.
  if ( ! isObject(object)) {
    return callback(null, object)
  }

  // If it is a promise, wait for it to resolve.
  // Run the check again to find nested promises.
  if (isPromise(object)) {
    return object
      .then(checkAgain.bind(null, null))
      .fail(callback)
  }

  // If it has a toJSON method, assume it can be used directly.
  if (canJSON(object)) {
    object = object.toJSON()
    if ( ! isObject(object)) {
      return callback(null, object)
    }
  }

  // Build a list of promises and promise-like structures to wait for.
  var remains = []
  Object.keys(object).forEach(function (key) {
    var item = object[key]
    if (isPromise(item) || isMongooseQuery(item) || isObject(item)) {
      remains.push(key)
    }
  })

  // If none were found, we must be done.
  if ( ! remains.length) {
    return callback(null, object)
  }
  
  // Otherwise, loop through the list.
  var pending = remains.length
  remains.forEach(function (key) {
    var item = object[key]

    // Promises and queries must be checked again upon success
    // to ensure nested promises are properly processed.
    if (isPromise(item)) {
      item
        .then(doneHandler(key, checkAgain).bind(null, null))
        .fail(doneHandler(key, callback))
    } else if (isMongooseQuery(item)) {
      item.exec(doneHandler(key, checkAgain))

    // Other objects can simply be traversed directly.
    } else {
      resolve(item, doneHandler(key, callback))
    }
  })

  // All the check to be restarted so we
  // can return promises from promises.
  function checkAgain (err, res) {
    if (err) return callback(err)
    resolve(res, callback)
  }

  // Promises need to call the restart the check,
  // so we use this to allow them to swap out fn.
  function doneHandler (key, fn) {
    return function (err, result) {
      if (err) return callback(err)

      object[key] = result
      if (--pending === 0) {
        fn(null, object)
      }
    }
  }
}

/**************************** HELPER METHODS **********************************/

function canJSON (v) {
  return typeof v.toJSON === 'function'
}

function isObject (v) {
  return typeof v === 'object'
}

function isPromise (v) {
  return v && typeof v === 'object' && typeof v.then === 'function'
}

function isMongooseQuery (v) {
  return v && typeof v === 'object' && typeof v.exec === 'function'
}
