#!/usr/bin/env node

'use strict'

import program from 'commander'
import Promise from 'promise'
import fs from 'fs-promise'
import chalk from 'chalk'
import path from 'path'

import { filterFile, toJSON, flatList } from '../lib/utils'
import { version } from '../package.json'
import prepareSvg from '../lib'

program
  .version(version)
  .usage('[options] <keywords>')
  .option('-i, --input [input]', 'Specifies input folder or file. Default current')
  .option('-o, --output [output]', 'Specifies output file. Default ./svgLib.json')
  .option('-p, --pretty', 'Prettyfied JSON')
  .parse(process.argv)

const SRC_DIR   = program.input || '.'
const DEST_FILE = program.output || 'svgLib.json'

let sourceDir
let sourceFile

const readFolder = () => {
  if (!fs.statSync(SRC_DIR).isDirectory()) {
    sourceFile = path.basename(SRC_DIR)
    sourceDir = path.dirname(SRC_DIR)
    return Promise.resolve([SRC_DIR])
  }

  return fs.readdir(SRC_DIR)
}

const processFiles = files => {
  const q = files.length
  let count = 0

  files.forEach((file, index) => file.lastIndexOf('.svg') !== -1 && ++count)

  console.log(`- ${chalk.cyan('Analyzed:')} ${chalk.yellow(q + ' file' + (q > 1 ? 's' : ''))}`)
  console.log(`- ${chalk.cyan('Found svg:')} ${chalk.yellow(count + ' file' + (count > 1 ? 's' : ''))}`)

  if (q === 1) {
    return new Promise((resolve, reject) => {
      if (filterFile(path.resolve(sourceDir, sourceFile))) {
        resolve(processSeparateFile(path.resolve(sourceDir, sourceFile)))
      } else {
        reject(`${chalk.red('!')} File --input ${chalk.cyan(sourceFile)} ${chalk.red('should be .svg')} file`)
      }
    })
  }

  return Promise.all(files.filter(filterFile).map(processFile))
}

const applyExtras = title => {
  const extras = {
    // optimize and remove unnecessary tags.
    svgo: true,
    // get icon title from file name
    title
  }

  return extras
}

const processSeparateFile = file => {
  const fileExt = path.extname(sourceFile)
  const fileName = path.basename(sourceFile, fileExt)
  return new Promise((resolve, reject) => {
    return fs.readFile(file, 'utf-8').then(data => {
      prepareSvg(data, applyExtras(fileName), resolve)
    })
  })
}

const processFile = file => {
  const filePath = path.resolve(SRC_DIR, file)
  const fileExt = path.extname(file)
  const fileName = path.basename(file, fileExt)
  return new Promise((resolve,reject) => {
    return fs.readFile(filePath, 'utf8').then(data => {
      process.stdout.cursorTo(0)
      process.stdout.clearLine()
      process.stdout.write(file)
      prepareSvg(data, applyExtras(fileName), resolve)
    })
  })
}

const printFile = obj => {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  console.log(`- ${chalk.cyan('Transforming into')}${program.pretty ? chalk.yellow(' Prettyfied') : ''} ${chalk.cyan('JSON notation')}`)
  return toJSON(flatList(obj), program.pretty)
}

const writeOutput = content => {
  console.log(`- ${chalk.cyan('Saved file')} ${chalk.yellow(DEST_FILE)}`)
  return fs.writeFile(DEST_FILE, content, 'utf8')
}

const catchErrors = err => console.log(err)

readFolder()
  .then(processFiles)
  .then(printFile)
  .then(writeOutput)
  .catch(catchErrors)
