import type { BailianAgentConfig } from './types'
import { Buffer } from 'node:buffer'
import process from 'node:process'
import { configAgent } from 'bailian-cli-commands'
import { createCli } from 'bailian-cli-runtime'
import { NAME, VERSION } from './constants'

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
