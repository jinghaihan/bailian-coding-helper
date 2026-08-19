import { describe, expect, it } from 'vitest'
import {
  getOfficialAgentIds,
  getOfficialWireApis,
} from '../src/official'

describe('official command metadata', () => {
  it('provides the supported agent and wire API choices', () => {
    expect(getOfficialAgentIds()).toEqual([
      'claude-code',
      'qwen-code',
      'opencode',
      'openclaw',
      'hermes',
      'codex',
    ])
    expect(getOfficialWireApis()).toEqual(['chat', 'responses'])
  })
})
