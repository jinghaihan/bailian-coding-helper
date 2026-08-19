import type { CAC } from 'cac'
import process from 'node:process'
import * as p from '@clack/prompts'
import { cac } from 'cac'
import { NAME, VERSION } from './constants'
import { runWizard } from './prompts'

try {
  const cli: CAC = cac(NAME)

  cli
    .command('', 'Interactively configure a coding agent with Bailian')
    .action(runWizard)

  cli.help()
  cli.version(VERSION)
  cli.parse(process.argv, { run: false })
  await cli.runMatchedCommand()
}
catch (error) {
  p.log.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
