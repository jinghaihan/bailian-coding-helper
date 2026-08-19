import type { BailianAgentConfig } from './types'
import { configAgent } from 'bailian-cli-commands'
import { createCli } from 'bailian-cli-runtime'
import { NAME, VERSION } from './constants'

export function buildBailianArgs(config: BailianAgentConfig): string[] {
  const keyFlag = config.key.startsWith('o1_') ? '--key' : '--api-key'
  const endpointFlag = config.endpoint.type === 'region' ? '--region' : '--base-url'

  return [
    'config',
    'agent',
    '--agent',
    config.agent,
    endpointFlag,
    config.endpoint.value,
    keyFlag,
    config.key,
    '--model',
    config.model,
  ]
}

export async function runBailianConfig(config: BailianAgentConfig): Promise<void> {
  const cli = createCli({ 'config agent': configAgent }, {
    binName: NAME,
    version: VERSION,
    clientName: NAME,
    npmPackage: NAME,
  })

  await cli.run(buildBailianArgs(config))
}
