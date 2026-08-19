import { describe, expect, it } from 'vitest'
import {
  formatContextWindow,
  getModelContextWindow,
  getTokenPlanBaseUrl,
  parseBailianConfigOutput,
  parseContextWindow,
  validateContextWindow,
} from '../src/utils'

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

  it('looks up and formats maintained context windows', () => {
    expect(getModelContextWindow('glm-5.2')).toBe(1_048_576)
    expect(getModelContextWindow('unknown-model')).toBeUndefined()
    expect(formatContextWindow(1_000_000)).toBe('1M')
    expect(formatContextWindow(262_144)).toBe('262,144')
  })

  it('parses custom context window values', () => {
    expect(parseContextWindow('1M')).toBe(1_000_000)
    expect(parseContextWindow('256k')).toBe(256_000)
    expect(parseContextWindow('262144')).toBe(262_144)
    expect(parseContextWindow('-1')).toBeUndefined()
    expect(validateContextWindow('1.5M')).toBeUndefined()
    expect(validateContextWindow('many')).toBeTruthy()
  })

  it('selects the Token Plan endpoint for the agent protocol', () => {
    expect(getTokenPlanBaseUrl('claude-code')).toBe(
      'https://token-plan.cn-beijing.maas.aliyuncs.com/apps/anthropic',
    )
    expect(getTokenPlanBaseUrl('codex')).toBe(
      'https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
    )
  })
})
