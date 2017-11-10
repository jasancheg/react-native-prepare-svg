'use strict'

import htmlparser from 'htmlparser2'
import svgo from 'svgo'

import { generateObjectFromNode, setRoot } from './utils'

const optimize = (input, plugins, callback) => {
  new svgo(plugins).optimize(input).then(result => callback(result.data))
}

const parseAndGenerate = (input, callback) => {
  const dom = htmlparser.parseDOM(input, { xmlMode: true })
  callback(generateObjectFromNode(dom), setRoot(dom))
}

module.exports = function (input, options, callback) {
  const initialConfig = {
    svgoConfig: {
      plugins: [
        { convertStyleToAttrs: true },
        { removeHiddenElems: false },
        { removeViewBox: false },
        { cleanupIDs: false },
        { removeXMLNS: true },
        { removeStyleElement: false },
        {
          removeAttrs: {
            attrs: '(stroke-width|stroke-linecap|stroke-linejoin)'
          }
        }
      ],
      multipass: true
    },
    svgo: false,
    title: null
  }

  const config = Object.assign({}, initialConfig, options)
  const _processOne = (node, more) => Object.assign({}, node, more)

  return optimize(input, config.svgoConfig, r => {
    parseAndGenerate(r, (generated, root) => {
      const isArray = Array.isArray(root)
      const more = config.title ? { title: config.title } : {}

      isArray
        ? callback( generated.map((node, i) => _processOne(node, more)) )
        : callback( _processOne(generated, more) )
    })
  })
}
