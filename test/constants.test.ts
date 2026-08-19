import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MODEL,
  TOKEN_PLAN_MODEL_DOCS_URL,
  TOKEN_PLAN_MODELS,
} from '../src/constants'

describe('token plan model catalog', () => {
  it('keeps the default model first and every model unique', () => {
    const models = TOKEN_PLAN_MODELS.map(model => model.value)

    expect(models[0]).toBe(DEFAULT_MODEL)
    expect(new Set(models).size).toBe(models.length)
  })

  it('links to the official catalog and contains the documented text models', () => {
    expect(TOKEN_PLAN_MODEL_DOCS_URL).toBe(
      'https://help.aliyun.com/zh/model-studio/token-plan-team-overview',
    )
    expect(TOKEN_PLAN_MODELS.map(model => model.value)).toEqual([
      'glm-5.2',
      'qwen3.8-max-preview',
      'qwen3.7-max',
      'qwen3.7-plus',
      'qwen3.6-plus',
      'qwen3.6-flash',
      'deepseek-v4-pro',
      'deepseek-v4-flash',
      'deepseek-v3.2',
      'kimi-k2.7-code',
      'kimi-k2.6',
      'kimi-k2.5',
      'glm-5.1',
      'glm-5',
      'MiniMax-M2.5',
    ])
  })
})
