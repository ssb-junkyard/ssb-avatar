'use strict'
var pull = require('pull-stream')
var cat = require('pull-cat')
var mlib = require('ssb-msgs')

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
    ]),
    pull.filter(function (msg) {
      return msg && msg.value.content && (!name || !image)
    }),
    pull.drain(function (msg) {
      var c = msg.value.content
      if (!name) {
        name = c.name
      }
      if (!image) {
        var imgLink = mlib.link(c.image, 'blob')
        image = imgLink && imgLink.link
      }
    }, function (err) {
      if (err) return cb (err)
      if (!name) name = truncate(dest, 8)
      cb(null, {id: dest, name: name, image: image, from: source})
    })
  )
}


