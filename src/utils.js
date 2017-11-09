'use strict'

import path from 'path'

//
const filterTagsFromNode = node => node.filter(n => n.type === 'tag' || (n.type === 'text' && /([^\s])/.test(n.data)))

//
const camelCase = prop => prop.replace(/[-|:]([a-z])/gi, (all, letter) => letter.toUpperCase())

//
const toJSON = (obj, pretty) => pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj)

//
const isDataAttr = prop => /^data(-\w+)/.test(prop)

//
const generateObjectFromNode = source => {
  const root = setRoot(source)
  let obj = {}

  if (Array.isArray(root)) {
    return root.map(node => generateObjectFromNode(node))
  }

  if (root.type === 'tag') {
    obj.name = root.name

    if (root.attribs) {
      obj.attrs = {}
      for (var attr in root.attribs) {
        if (root.attribs.hasOwnProperty(attr)) {
          obj.attrs[isDataAttr(attr) ? attr : camelCase(attr)] = root.attribs[attr]
        }
      }
    }

    if (root.children) {
      obj.childs = filterTagsFromNode(root.children).map(node => generateObjectFromNode(node))

      if (!obj.childs.length) {
        delete obj.childs
      }
    }
  } else if (root.type === 'text') {
    obj.text = root.data
  }

  return obj
}

//
const filterFile = file => path.extname(file) === '.svg'

//
const list = val => val.split(',')

//
const setRoot = source => {
  if (Array.isArray(source)) {
    const onlyTag = filterTagsFromNode(source)
    return onlyTag.length === 1 ? onlyTag[0] : onlyTag
  }

  return source
}

const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1)

//
const flatList = svgs => {
  const svgList = {}

  const setNodeType = childs => childs.map(child => {
    child.type = capitalizeFirstLetter(child.name)

     // Validate posible extra props
    delete child.name
    delete child.xmlnsXlink

    if(child.type === 'G') setNodeType(child.childs)

    return child
  })

  svgs.forEach(svg => {
    // Validate possible extra props
    if(svg.attrs.xmlnsXlink) delete svg.attrs.xmlnsXlink

    svgList[camelCase(svg.title)] = {
      type: 'Svg',
      attrs: svg.attrs,
      childs: setNodeType(svg.childs)
    }
  })

  return svgList
}

module.exports = {
  generateObjectFromNode,
  isDataAttr,
  filterFile,
  camelCase,
  flatList,
  setRoot,
  toJSON,
  list
}
