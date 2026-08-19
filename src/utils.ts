import type { AgentId, Protocol, Region } from './types'
import { CODING_PLAN_BASE_URLS, PAY_AS_YOU_GO_BASE_URLS } from './constants'

export function validateUrl(value: string | undefined): string | undefined {
  if (!value?.trim())
    return 'Enter a Base URL.'

  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' && url.protocol !== 'http:')
      return 'Enter an HTTP or HTTPS URL.'
  }
  catch {
    return 'Enter a valid URL.'
  }
}

export function getProtocol(agent: AgentId): Protocol {
  return agent === 'claude-code' ? 'anthropic' : 'openai'
}

export function getCodingPlanBaseUrl(agent: AgentId): string {
  return CODING_PLAN_BASE_URLS[getProtocol(agent)]
}

export function getPayAsYouGoBaseUrl(region: Region, agent: AgentId): string {
  return PAY_AS_YOU_GO_BASE_URLS[region][getProtocol(agent)]
}

export function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/$/, '')
}
