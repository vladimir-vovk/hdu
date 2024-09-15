import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

import { Spinner } from './spinner.js'
import { isExists, isDir, log, coloredName, humanSize } from './utils.js'

const dirSize = (dir) => {
  let error = ''
  let size = 0

  const proc = spawn('du', ['-s', dir])

  return new Promise((resolve) => {
    proc.stdout.on('data', (data) => {
      size = data.toString().split('\t')?.[0] ?? 0
      size = Number(size)

      if (process.platform === 'darwin') {
        // macos du returns size as 512 bytes per Kb, instead of 1024
        size = (size / 2) * 1024 // size in bytes
      }
    })

    proc.stderr.on('data', (data) => {
      process.stdout.write('\n')
      log(`Error: ${data.toString()}`, { success: false })
      error = data.toString()
    })

    proc.on('error', (err) => {
      error = err
      resolve({ size, error })
    })

    proc.on('close', (code) => {
      if (code) {
        if (!error) {
          error = `error code = ${code}`
        }
      }

      resolve({ size, error })
    })
  })
}

const dirInfo = async (dir, options) => {
  const spinner = new Spinner('Getting directory files and folders...')
  spinner.start()

  // Add parent directory
  const stats = [
    {
      file: dir,
      size: 0,
      isDir: true,
    },
  ]

  // Read directory structure
  fs.readdirSync(dir).forEach((name) => {
    const file = path.join(dir, name)
    const stat = fs.lstatSync(file)
    const size = stat.size
    const isDir = stat.isDirectory()
    const isLink = stat.isSymbolicLink()

    if (!isLink && (isDir || options.includeFiles)) {
      stats.push({
        file,
        size,
        isDir,
      })
    }
  })

  // Get directory sizes
  for (let info of stats) {
    const { file, isDir } = info
    if (!isDir) {
      continue
    }

    spinner.update({ text: `Getting size for ${file}...` })
    const { size, error } = await dirSize(file)
    info.size = size
    info.error = error
  }

  spinner.stop({ text: '', status: '' })

  // Sort & display
  const sortedStats = stats
    .sort((a, b) =>
      options.sort === 'desc' ? b.size - a.size : a.size - b.size,
    )
    .filter((info) => !!info.size)

  for (let i = 0; i < sortedStats.length; i++) {
    const { file, size, isDir } = sortedStats[i]

    if (options.head && Number(options.head) === i) {
      break
    }

    const name = file === dir ? dir : path.relative(dir, file)
    const padSize = humanSize(size).padEnd(10, ' ')

    log(`${padSize}${coloredName({ name, isDir })}`)
  }
}

export const du = (dirs, options) => {
  process.on('SIGINT', () => {
    // clear line
    process.stdout.write('\n')
    log('Interrupted by the user...', { success: false })
    // enable cursor
    process.stdout.write('\x1B[?25h')

    process.exit(130)
  })

  for (let dir of dirs) {
    if (!isExists(dir)) {
      log(`Error: "${dir}" does not exist`, { success: false })
      continue
    }

    if (isDir(dir)) {
      dirInfo(dir, options)
    } else {
      log(`Error: "${dir}" is not a directory`, { success: false })
    }
  }
}
