import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import type { BailianAgentConfig, BailianCliResult } from './types'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import process from 'node:process'

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

  return await new Promise((resolve, reject) => {
    const child: ChildProcessWithoutNullStreams = spawn(process.execPath, [entry, ...args], {
      env: process.env,
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    })

    let stdout = ''
    let stderr = ''

    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', chunk => stdout += chunk)
    child.stderr.on('data', chunk => stderr += chunk)
    child.once('error', reject)
    child.once('close', code => resolve({
      exitCode: code ?? 1,
      stdout,
      stderr,
    }))
  })
}

export function redact(value: string, secret: string): string {
  return secret ? value.replaceAll(secret, '[redacted]') : value
}
