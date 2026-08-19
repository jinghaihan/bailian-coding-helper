import pkg from '../package.json'

export const NAME = pkg.name

export const VERSION = pkg.version

export const DEFAULT_MODEL = 'glm-5.2'

export const TOKEN_PLAN_MODEL_DOCS_URL
  = 'https://help.aliyun.com/zh/model-studio/token-plan-team-overview'

export const TOKEN_PLAN_MODELS = [
  { value: 'glm-5.2', hint: 'Recommended · Zhipu AI', contextWindow: 1_048_576 },
  { value: 'qwen3.8-max-preview', hint: 'Qwen · Preview', contextWindow: 983_616 },
  { value: 'qwen3.7-max', hint: 'Qwen', contextWindow: 1_000_000 },
  { value: 'qwen3.7-plus', hint: 'Qwen', contextWindow: 1_000_000 },
  { value: 'qwen3.6-plus', hint: 'Qwen', contextWindow: 1_000_000 },
  { value: 'qwen3.6-flash', hint: 'Qwen', contextWindow: 1_000_000 },
  { value: 'deepseek-v4-pro', hint: 'DeepSeek', contextWindow: 1_000_000 },
  { value: 'deepseek-v4-flash', hint: 'DeepSeek', contextWindow: 1_000_000 },
  { value: 'deepseek-v3.2', hint: 'DeepSeek', contextWindow: 131_072 },
  { value: 'kimi-k2.7-code', hint: 'Moonshot AI', contextWindow: 262_144 },
  { value: 'kimi-k2.6', hint: 'Moonshot AI', contextWindow: 262_144 },
  { value: 'kimi-k2.5', hint: 'Moonshot AI', contextWindow: 262_144 },
  { value: 'glm-5.1', hint: 'Zhipu AI', contextWindow: 202_745 },
  { value: 'glm-5', hint: 'Zhipu AI', contextWindow: 202_752 },
  { value: 'MiniMax-M2.5', hint: 'MiniMax', contextWindow: 204_800 },
] as const

export const AGENT_CONTEXT_WINDOW_SUPPORT = {
  'claude-code': {
    strategy: 'claude-settings',
    defaultValue: 200_000,
  },
  'openclaw': {
    strategy: 'cli-flag',
    defaultValue: 256_000,
  },
} as const

export const CLAUDE_CODE_EXTENDED_CONTEXT_WINDOW = 1_000_000

export const CLAUDE_CODE_EXTENDED_CONTEXT_MODELS = [
  'glm-5.2',
  'qwen3.8-max-preview',
  'qwen3.7-max',
  'qwen3.7-plus',
  'qwen3.6-plus',
  'qwen3.6-flash',
  'deepseek-v4-pro',
  'deepseek-v4-flash',
] as const

export const ACCESS_MODES = [
  {
    value: 'coding-plan',
    label: 'Coding Plan',
    hint: 'Subscription for individual developers',
  },
  {
    value: 'token-plan',
    label: 'Token Plan',
    hint: 'Personal or team subscription',
  },
  {
    value: 'pay-as-you-go',
    label: 'Pay-as-you-go',
    hint: 'Standard Model Studio API key',
  },
  {
    value: 'custom',
    label: 'Custom endpoint',
    hint: 'Provide a Base URL manually',
  },
] as const

export const CODING_PLAN_BASE_URLS = {
  anthropic: 'https://coding.dashscope.aliyuncs.com/apps/anthropic',
  openai: 'https://coding.dashscope.aliyuncs.com/v1',
} as const

export const PAY_AS_YOU_GO_BASE_URLS = {
  'cn-beijing': {
    anthropic: 'https://dashscope.aliyuncs.com/apps/anthropic',
    openai: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  },
  'ap-southeast-1': {
    anthropic: 'https://dashscope-intl.aliyuncs.com/apps/anthropic',
    openai: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
  },
} as const
