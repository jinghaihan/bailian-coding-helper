import { describe, expect, it } from 'vitest'
import { buildBailianArgs } from '../src/adapter'

describe('buildBailianArgs', () => {
  it('builds arguments for a standard API key and Base URL', () => {
    expect(buildBailianArgs({
      agent: 'codex',
      endpoint: { type: 'base-url', value: 'https://example.com/v1' },
      key: 'sk-example',
      model: 'glm-5.2',
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
      'glm-5.2',
    ])
  })

  it('uses the encoded key and region flags when appropriate', () => {
    expect(buildBailianArgs({
      agent: 'claude-code',
      endpoint: { type: 'region', value: 'cn-beijing' },
      key: 'o1_example',
      model: 'glm-5.2',
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
      'glm-5.2',
    ])
  })
})
