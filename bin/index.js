#!/usr/bin/env node

import { Option, program } from 'commander'
import { du } from '../src/du.js'
import { version } from '../src/utils.js'

program
  .name('hdu')
  .version(version(), '-v, --version', 'print version')
  .description(`Human friendly "du" (disk usage) utility.`)
  .option('-f, --include-files', 'include files')
  .addOption(
    new Option('-s, --sort <order>', 'sort order')
      .choices(['desc', 'asc'])
      .default('desc')
  )
  .option('--head <n>', 'print first <n> lines')
  .argument('[dirs...]', 'one or more directories', '.')
  .action((dirs, options) => du(dirs, options))
  .addHelpText(
    'after',
    `
Examples:
  $ npx hdu

  By default, it displays the information about the current
  directory.

  $ npx hdu -f

  The "--include-files" option will display information about
  files too.

  $ npx hdu -s asc

  By default, information will be sorted in descending order.
  You could change the order with the "--sort" option.

  $ npx hdu --head 5

  The "--head <n>" option allows the display first <n> results.
`)

program.parse(process.argv)
