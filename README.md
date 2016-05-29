# ssb-avatar

query for the avatar that an ssb feed has been assigned,
compatible with the way that patchwork selects avatars.

refactored out of [ssb-notifier](https://github.com/ssbc/ssb-notifier)

# api

## getAvatar(sbot, namer, named, cb)

`namer` and `named` must both be ssb feed ids.
`cb` will callback with `err, {name: name, image: blob, id: named, from: named}`
 

## License

MIT
