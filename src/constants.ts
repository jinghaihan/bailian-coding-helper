import pkg from '../package.json'

export const NAME = pkg.name

export const VERSION = pkg.version

export const DEFAULT_MODEL = 'glm-5.2'

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
