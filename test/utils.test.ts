import { describe, expect, it } from 'vitest'
import { parseBailianConfigOutput } from '../src/utils'

describe('parse bailian config output', () => {
  it('keeps useful details and removes the duplicated success message', () => {
    expect(parseBailianConfigOutput([
      '\u001B[32mClaude Code configured successfully.\u001B[39m',
      '  Written: /Users/example/.claude/settings.json',
      '  Run `claude` to start using Claude Code with DashScope.',
      'Warning: Rewrote base URL for Claude Code.',
      '',
    ].join('\n'))).toEqual([
      'Written: /Users/example/.claude/settings.json',
      'Run `claude` to start using Claude Code with DashScope.',
      'Warning: Rewrote base URL for Claude Code.',
    ])
  })
})
