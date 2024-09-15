import fs from 'fs'
import chalk from 'chalk'
import path from 'path'
import { createRequire } from 'module'

export const coloredName = ({ name, isDir}) => {
  return isDir ? chalk.bold(chalk.blue(name)) : name
}

export const humanSize = (size) => {
  if (size < 1024) {
    return `${size}b`
  }

  const kb = size / 1024
  if (kb < 1024) {
    return `${parseFloat(kb.toFixed(2))}K`
  }

  const mb = kb / 1024
  if (mb < 1024) {
    return `${parseFloat(mb.toFixed(2))}M`
  }

  const gb = mb / 1024
  return `${parseFloat(gb.toFixed(2))}G`
}

export const log = (message, options) => {
  let prefix = ''
  if (options?.success === true) {
    prefix = ` ${chalk.green('✔')}`
  } else if (options?.success === false) {
    prefix = ` ${chalk.red('✖')}`
  }

  const indentLevel = options?.l ? options.l * 2 : 0 * 2
  const indent = ' '.repeat(indentLevel)
  console.log(`${indent}${prefix} ${message}`)
}

export const isExists = (filename) => {
  return fs.existsSync(filename)
}

export const isDir = (filename) => {
  return fs.lstatSync(filename).isDirectory()
}

const hduPath = () => {
  const require = createRequire(import.meta.url)
  const paths = require.resolve.paths('hdu').filter(
    p => p.includes(path.join('hdu', 'node_modules')))
  return path.join(paths[0], '..')
}

export const version = () => {
  const uri = path.join(hduPath(), 'package.json')
  const file = fs.readFileSync(uri, 'utf8')
  const pjson = JSON.parse(file)
  return pjson?.version
}
