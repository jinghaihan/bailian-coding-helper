import { describe, expect, it } from 'vitest'
import {
  getOfficialAgentIds,
  getOfficialExampleModels,
  getOfficialWireApis,
  getSuggestedModels,
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

  it('extracts model suggestions from official examples', () => {
    expect(getOfficialExampleModels()).toEqual(['qwen3-max', 'qwen3-coder-plus'])
    expect(getSuggestedModels('glm-5.2')).toEqual([
      'glm-5.2',
      'qwen3-max',
      'qwen3-coder-plus',
    ])
  })
})
