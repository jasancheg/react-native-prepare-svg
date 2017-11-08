#!/usr/bin/env node

'use strict';

import program from 'commander';
import Promise from 'promise';
import fs from 'fs-promise';
import chalk from 'chalk';
import path from 'path';

import { version } from '../package.json';
import svgson from '../lib/rnpreparesvg';

const list = (val) => { return val.split(','); };

program
  .version(version)
  .usage('[options] <keywords>')
  .option('-i, --input [input]', 'Specifies input folder or file. Default current')
  .option('-o, --output [output]', 'Specifies output file. Default ./svgson.json')
  .option('-p, --pretty', 'Prettyfied JSON')
  .parse(process.argv);

const SRC_DIR   = program.input || '.';
const DEST_FILE = program.output || 'svgLib.json';

let sourceDir, sourceFile;

const readFolder = () => {
  if (!fs.statSync(SRC_DIR).isDirectory()) {
    sourceFile = path.basename(SRC_DIR);
    sourceDir = path.dirname(SRC_DIR);
    return Promise.resolve([SRC_DIR])
  }

  return fs.readdir(SRC_DIR);
};

const filterFile = (file) => {
  return path.extname(file) === '.svg';
};

const processFiles = (files) => {
  const q = files.length;
  console.log(`--- ${chalk.yellow('Processing')} ${chalk.gray(q + ' file' + (q > 1 ? 's' : '')  + '...')}`);

  if (q === 1) {
    return new Promise((resolve, reject) => {
      if (filterFile(path.resolve(sourceDir, sourceFile))) {
        resolve(processSeparateFile(path.resolve(sourceDir, sourceFile)));
      } else {
        reject(`${chalk.red('!!!')} File --input ${chalk.yellow(sourceFile)} ${chalk.red('should be .svg')} file`)
      }
    });
  }

  return Promise.all(files.filter(filterFile).map(processFile));
};

const applyExtras = (title) => {
  const extras = {
    // optimize and remove unnecessary tags.
    svgo: true,

    pathsKey: 'groupKey',

    title: title || 'tempTitle',
  }

  return extras;
}

const processSeparateFile = (file) => {
  const fileExt = path.extname(sourceFile);
  const fileName = path.basename(sourceFile, fileExt);
  return new Promise((resolve, reject) => {
    return fs.readFile(file, 'utf-8').then(data => {
      svgson(data, applyExtras(fileName), resolve);
    });
  });
};

const processFile = (file) => {
  const filePath = path.resolve(SRC_DIR, file);
  const fileExt = path.extname(file);
  const fileName = path.basename(file, fileExt);
  return new Promise((resolve,reject) => {
    return fs.readFile(filePath, 'utf8').then(data => {
      process.stdout.cursorTo(0);
      process.stdout.clearLine();
      process.stdout.write(file);
      svgson(data, applyExtras(fileName), resolve);
    });
  });
};

const toJSON = (obj, pretty) => {
  return pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
};

const printFile = obj => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  console.log(`--- ${chalk.yellow('Transforming into')}${program.pretty ? chalk.gray(' Prettyfied') : ''} ${chalk.yellow('JSON notation')}`)
  return toJSON(obj, program.pretty);
};

const writeOutput = content => {
  console.log(`--- ${chalk.yellow('Saved file')} ${chalk.gray(DEST_FILE)}`);
  return fs.writeFile(DEST_FILE, content, 'utf8');
};

const catchErrors = err => console.log(err);

readFolder()
  .then(processFiles)
  .then(printFile)
  .then(writeOutput)
  .catch(catchErrors)
