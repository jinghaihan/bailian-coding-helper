import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const run = vi.fn(async () => {
  process.stdout.write('Claude Code configured successfully.\n')
  process.stderr.write('  Written: /Users/example/.claude/settings.json\n')
})

vi.mock('bailian-cli-runtime', () => ({
  createCli: () => ({ run }),
}))

const { runBailianConfig } = await import('../src/adapter')

describe('run bailian config', () => {
  beforeEach(() => {
    run.mockClear()
  })

  it('captures official command output and restores the process streams', async () => {
    const stdoutWrite = process.stdout.write
    const stderrWrite = process.stderr.write

    const output = await runBailianConfig({
      agent: 'claude-code',
      endpoint: { type: 'region', value: 'cn-beijing' },
      key: 'sk-example',
      model: 'glm-5.2',
    })

    expect(output).toBe([
      'Claude Code configured successfully.',
      '  Written: /Users/example/.claude/settings.json',
      '',
    ].join('\n'))
    expect(process.stdout.write).toBe(stdoutWrite)
    expect(process.stderr.write).toBe(stderrWrite)
  })

  it('writes the selected Claude Code context window to settings', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'bailian-helper-'))
    const settingsPath = join(directory, 'settings.json')
    const previousConfigDirectory = process.env.CLAUDE_CONFIG_DIR
    process.env.CLAUDE_CONFIG_DIR = directory
    writeFileSync(settingsPath, JSON.stringify({ env: { EXISTING_VALUE: 'kept' } }))

    try {
      await runBailianConfig({
        agent: 'claude-code',
        contextWindow: 1_000_000,
        endpoint: { type: 'region', value: 'cn-beijing' },
        key: 'sk-example',
        model: 'glm-5.2',
      })

      const settings = JSON.parse(readFileSync(settingsPath, 'utf8'))
      expect(settings.env).toMatchObject({
        CLAUDE_CODE_MAX_CONTEXT_TOKENS: '1000000',
        EXISTING_VALUE: 'kept',
      })
      expect(run).toHaveBeenCalledWith(expect.arrayContaining([
        '--model',
        'glm-5.2[1m]',
      ]))
    }
    finally {
      if (previousConfigDirectory === undefined)
        delete process.env.CLAUDE_CONFIG_DIR
      else
        process.env.CLAUDE_CONFIG_DIR = previousConfigDirectory
      rmSync(directory, { recursive: true, force: true })
    }
  })
})
