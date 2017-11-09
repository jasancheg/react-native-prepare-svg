'use strict';

import htmlparser from 'htmlparser2';
import svgo from 'svgo';

const filterTags = node => node.filter(n => {
  return n.type === 'tag' || (n.type === 'text' && /([^\s])/.test(n.data));
});

const setRoot = source => {
  if (Array.isArray(source)) {
    const onlyTag = filterTags(source);
    return onlyTag.length === 1 ? onlyTag[0] : onlyTag;
  }

  return source;
}

const camelCase = prop => prop.replace(/[-|:]([a-z])/gi, (all, letter) => letter.toUpperCase());

const isDataAttr = prop => /^data(-\w+)/.test(prop);

const generate = source => {
  const root = setRoot(source);
  let obj = {};

  if (Array.isArray(root)) {
    return root.map(node => generate(node))
  }

  if (root.type === 'tag') {
    obj.name = root.name;

    if (root.attribs) {
      obj.attrs = {}
      for (var attr in root.attribs) {
        if (root.attribs.hasOwnProperty(attr)) {
          obj.attrs[
            isDataAttr(attr)
            ? attr
            : camelCase(attr)
          ] = root.attribs[attr]
        }
      }
    }

    if (root.children) {
      obj.childs = filterTags(root.children).map(node => generate(node));
      if (!obj.childs.length)
        delete obj.childs
    }
  } else if (root.type === 'text') {
    obj.text = root.data;
  }

  return obj;
}

const optimize = (input, plugins, callback) => {
  new svgo(plugins).optimize(input).then(result => callback(result.data));
};

const parseAndGenerate = (input, callback) => {
  const dom = htmlparser.parseDOM(input, { xmlMode: true });
  callback(generate(dom), setRoot(dom));
};

module.exports = function (input, options, callback) {
  const initialConfig = {
    svgoConfig: {
      plugins: [
        {
          removeAttrs: {
            attrs: '(stroke-width|stroke-linecap|stroke-linejoin)'
          }
        }
      ],
      multipass: true
    },
    svgo: false,
    title: null,
  }

  const config = Object.assign({}, initialConfig, options);
  const _processOne = (node, more) => Object.assign({}, node, more);

  return optimize(input, config.svgoConfig, r => {
    parseAndGenerate(r, (generated, root) => {
      const isArray = Array.isArray(root);
      const more = config.title ? { title: config.title } : {};

      isArray
        ? callback( generated.map((node, i) => _processOne(node, more)) )
        : callback( _processOne(generated, more) );
    });
  });
};
