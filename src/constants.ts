import pkg from '../package.json'

export const NAME = pkg.name

export const VERSION = pkg.version

export const DEFAULT_MODEL = 'glm-5.2'

export const TOKEN_PLAN_MODEL_DOCS_URL
  = 'https://help.aliyun.com/zh/model-studio/token-plan-team-overview'

export const TOKEN_PLAN_MODELS = [
  { value: 'glm-5.2', hint: 'Recommended · Zhipu AI' },
  { value: 'qwen3.8-max-preview', hint: 'Qwen · Preview' },
  { value: 'qwen3.7-max', hint: 'Qwen' },
  { value: 'qwen3.7-plus', hint: 'Qwen' },
  { value: 'qwen3.6-plus', hint: 'Qwen' },
  { value: 'qwen3.6-flash', hint: 'Qwen' },
  { value: 'deepseek-v4-pro', hint: 'DeepSeek' },
  { value: 'deepseek-v4-flash', hint: 'DeepSeek' },
  { value: 'deepseek-v3.2', hint: 'DeepSeek' },
  { value: 'kimi-k2.7-code', hint: 'Moonshot AI' },
  { value: 'kimi-k2.6', hint: 'Moonshot AI' },
  { value: 'kimi-k2.5', hint: 'Moonshot AI' },
  { value: 'glm-5.1', hint: 'Zhipu AI' },
  { value: 'glm-5', hint: 'Zhipu AI' },
  { value: 'MiniMax-M2.5', hint: 'MiniMax' },
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
