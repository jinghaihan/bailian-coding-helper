import type { BailianAgentConfig } from './types'
import { Buffer } from 'node:buffer'
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { configAgent } from 'bailian-cli-commands'
import { createCli } from 'bailian-cli-runtime'
import { CLAUDE_CODE_EXTENDED_CONTEXT_WINDOW, NAME, VERSION } from './constants'

function captureWrite(chunks: Buffer[]): NodeJS.WriteStream['write'] {
  return ((
    chunk: string | Uint8Array,
    encoding?: BufferEncoding | ((error?: Error | null) => void),
    callback?: (error?: Error | null) => void,
  ) => {
    chunks.push(typeof chunk === 'string'
      ? Buffer.from(chunk, typeof encoding === 'string' ? encoding : undefined)
      : Buffer.from(chunk))

    const done = typeof encoding === 'function' ? encoding : callback
    done?.(null)
    return true
  }) as NodeJS.WriteStream['write']
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function getConfiguredModel(config: BailianAgentConfig): string {
  if (
    config.agent === 'claude-code'
    && config.contextWindow
    && config.contextWindow >= CLAUDE_CODE_EXTENDED_CONTEXT_WINDOW
    && !config.model.endsWith('[1m]')
  ) {
    return `${config.model}[1m]`
  }

  return config.model
}

function writeClaudeContextWindow(contextWindow: number): void {
  const configDirectory = process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude')
  const settingsPath = join(configDirectory, 'settings.json')
  const settings: unknown = JSON.parse(readFileSync(settingsPath, 'utf8'))

  if (!isRecord(settings))
    throw new TypeError(`Expected an object in ${settingsPath}.`)

  const env = isRecord(settings.env) ? settings.env : {}
  env.CLAUDE_CODE_MAX_CONTEXT_TOKENS = String(contextWindow)
  settings.env = env
  writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, { mode: 0o600 })
}

export function buildBailianArgs(config: BailianAgentConfig): string[] {
  const keyFlag = config.key.startsWith('o1_') ? '--key' : '--api-key'
  const endpointFlag = config.endpoint.type === 'region' ? '--region' : '--base-url'
  const args = [
    'config',
    'agent',
    '--agent',
    config.agent,
    endpointFlag,
    config.endpoint.value,
    keyFlag,
    config.key,
    '--model',
    getConfiguredModel(config),
  ]

  if (config.agent === 'openclaw' && config.contextWindow)
    args.push('--context-window', String(config.contextWindow))

  return args
}

export async function runBailianConfig(config: BailianAgentConfig): Promise<string> {
  const cli = createCli({ 'config agent': configAgent }, {
    binName: NAME,
    version: VERSION,
    clientName: NAME,
    npmPackage: NAME,
  })

  const chunks: Buffer[] = []
  const stdoutWrite = process.stdout.write
  const stderrWrite = process.stderr.write
  process.stdout.write = captureWrite(chunks)
  process.stderr.write = captureWrite(chunks)

  try {
    await cli.run(buildBailianArgs(config))
    if (config.agent === 'claude-code' && config.contextWindow)
      writeClaudeContextWindow(config.contextWindow)
  }
  catch (error) {
    const output = Buffer.concat(chunks).toString()
    if (output)
      stderrWrite.call(process.stderr, output)
    throw error
  }
  finally {
    process.stdout.write = stdoutWrite
    process.stderr.write = stderrWrite
  }

  return Buffer.concat(chunks).toString()
}
