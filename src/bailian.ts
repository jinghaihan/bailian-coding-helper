import type { BailianAgentConfig, BailianCliResult } from './types'
import { createRequire } from 'node:module'
import process from 'node:process'
import { x } from 'tinyexec'

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

export function resolveBailianCliEntry(): string {
  const require = createRequire(import.meta.url)
  return require.resolve('bailian-cli')
}

export async function runBailianConfig(
  config: BailianAgentConfig,
  entry = resolveBailianCliEntry(),
): Promise<BailianCliResult> {
  const args = buildBailianArgs(config)
  const result = await x(process.execPath, [entry, ...args], {
    nodePath: false,
    nodeOptions: {
      env: process.env,
      shell: false,
      windowsHide: true,
    },
  })

  return {
    exitCode: result.exitCode ?? 1,
    stdout: result.stdout,
    stderr: result.stderr,
  }
}

export function redact(value: string, secret: string): string {
  return secret ? value.replaceAll(secret, '[redacted]') : value
}
