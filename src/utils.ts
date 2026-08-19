import type { AgentId, Protocol, Region } from './types'
import c from 'ansis'
import {
  CODING_PLAN_BASE_URLS,
  PAY_AS_YOU_GO_BASE_URLS,
  TOKEN_PLAN_MODELS,
} from './constants'

const AGENT_LABELS: Record<string, string> = {
  'claude-code': 'Claude Code',
  'codex': 'Codex',
  'hermes': 'Hermes Agent',
  'opencode': 'OpenCode',
  'openclaw': 'OpenClaw',
  'qwen-code': 'Qwen Code',
}

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

export function formatAgentLabel(agent: AgentId): string {
  return AGENT_LABELS[agent]
    ?? agent.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export function parseBailianConfigOutput(output: string): string[] {
  return c.strip(output)
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.endsWith(' configured successfully.'))
}

export function getModelContextWindow(model: string): number | undefined {
  return TOKEN_PLAN_MODELS.find(item => item.value === model)?.contextWindow
}

export function formatContextWindow(value: number): string {
  if (value % 1_000_000 === 0)
    return `${value / 1_000_000}M`
  if (value % 1_000 === 0)
    return `${value / 1_000}K`
  return value.toLocaleString('en-US')
}

export function parseContextWindow(value: string | undefined): number | undefined {
  const match = value?.trim().match(/^(\d+(?:\.\d+)?)\s*([km])?$/i)
  if (!match)
    return undefined

  const amount = Number(match[1])
  const unit = match[2]?.toLowerCase()
  const multiplier = unit === 'm' ? 1_000_000 : unit === 'k' ? 1_000 : 1
  const result = amount * multiplier

  return Number.isSafeInteger(result) && result > 0 ? result : undefined
}

export function validateContextWindow(value: string | undefined): string | undefined {
  return parseContextWindow(value) ? undefined : 'Enter a positive token count, such as 256K or 1M.'
}
