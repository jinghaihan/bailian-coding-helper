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
})
