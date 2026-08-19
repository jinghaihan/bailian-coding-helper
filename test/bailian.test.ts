import { describe, expect, it } from 'vitest'
import { buildBailianArgs, redact, resolveBailianCliEntry } from '../src/bailian'

describe('buildBailianArgs', () => {
  it('builds arguments for a standard API key and Base URL', () => {
    expect(buildBailianArgs({
      agent: 'codex',
      endpoint: { type: 'base-url', value: 'https://example.com/v1' },
      key: 'sk-example',
      model: 'qwen3.7-plus',
    })).toEqual([
      'config',
      'agent',
      '--agent',
      'codex',
      '--base-url',
      'https://example.com/v1',
      '--api-key',
      'sk-example',
      '--model',
      'qwen3.7-plus',
    ])
  })

  it('uses the encoded key and region flags when appropriate', () => {
    expect(buildBailianArgs({
      agent: 'claude-code',
      endpoint: { type: 'region', value: 'cn-beijing' },
      key: 'o1_example',
      model: 'qwen3.7-plus',
    })).toEqual([
      'config',
      'agent',
      '--agent',
      'claude-code',
      '--region',
      'cn-beijing',
      '--key',
      'o1_example',
      '--model',
      'qwen3.7-plus',
    ])
  })
})

describe('resolveBailianCliEntry', () => {
  it('resolves the CLI from the installed dependency', () => {
    expect(resolveBailianCliEntry()).toMatch(/bailian-cli.+bailian\.mjs$/)
  })
})

describe('redact', () => {
  it('redacts every occurrence of a secret', () => {
    expect(redact('Invalid sk-secret: sk-secret', 'sk-secret'))
      .toBe('Invalid [redacted]: [redacted]')
  })
})
