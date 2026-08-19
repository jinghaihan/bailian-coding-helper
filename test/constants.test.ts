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

  it('stores a context window for every maintained model', () => {
    expect(Object.fromEntries(
      TOKEN_PLAN_MODELS.map(model => [model.value, model.contextWindow]),
    )).toEqual({
      'glm-5.2': 1_048_576,
      'qwen3.8-max-preview': 983_616,
      'qwen3.7-max': 1_000_000,
      'qwen3.7-plus': 1_000_000,
      'qwen3.6-plus': 1_000_000,
      'qwen3.6-flash': 1_000_000,
      'deepseek-v4-pro': 1_000_000,
      'deepseek-v4-flash': 1_000_000,
      'deepseek-v3.2': 131_072,
      'kimi-k2.7-code': 262_144,
      'kimi-k2.6': 262_144,
      'kimi-k2.5': 262_144,
      'glm-5.1': 202_745,
      'glm-5': 202_752,
      'MiniMax-M2.5': 204_800,
    })
  })
})
