'use strict'
var pull = require('pull-stream')
var cat = require('pull-cat')
var mlib = require('ssb-msgs')
var ref = require('ssb-ref')

function truncate(str, len) {
  str = String(str)
  return str.length < len ? str : str.substr(0, len-1) + '…'
}

module.exports = function getAvatar(sbot, source, dest, cb) {
  var name, image
  pull(
    cat([
      // First get About info that we gave them.
      sbot.links({
        source: source,
        dest: dest,
        rel: 'about',
        values: true,
        reverse: true
      }),
      // If that isn't enough, then get About info that they gave themselves.
      sbot.links({
        source: dest,
        dest: dest,
        rel: 'about',
        values: true,
        reverse: true
      }),
      // If that isn't enough, get About info from other feeds.
      sbot.links({
        dest: dest,
        rel: 'about',
        values: true,
        reverse: true
      }),
      // Finally, get About info from the thing itself (if possible)
      function fn(end, cb) {
        if (end || fn.ended) return cb(true)
        fn.ended = true
        if (ref.isMsg(dest) && sbot.get) {
          sbot.get(dest, function (err, value) {
            if (err) cb(true)
            else cb(null, {key: dest, value: value})
          })
        } else {
          cb(true)
        }
      }
    ]),
    pull.filter(function (msg) {
      return msg && msg.value.content
    }),
    pull.drain(function (msg) {
      if (name && image) return false // end the streams early
      var c = msg.value.content
      if (!name) {
        name = c.name
      }
      if (!image) {
        var imgLink = mlib.link(c.image, 'blob')
        image = imgLink && imgLink.link
      }
    }, function (err) {
      if (err && err !== true) return cb (err)
      if (!name) name = truncate(dest, 8)
      cb(null, {id: dest, name: name, image: image, from: source})
    })
  )
}


