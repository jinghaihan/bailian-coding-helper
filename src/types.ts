import type {
  ACCESS_MODES,
  AGENTS,
  CODING_PLAN_BASE_URLS,
  PAY_AS_YOU_GO_BASE_URLS,
} from './constants'

export type KnownAgentId = (typeof AGENTS)[number]['value']

export type AgentId = KnownAgentId | (string & {})

export type AccessMode = (typeof ACCESS_MODES)[number]['value']

export type Region = keyof typeof PAY_AS_YOU_GO_BASE_URLS

export type Protocol = keyof typeof CODING_PLAN_BASE_URLS

export type Endpoint
  = | { type: 'base-url', value: string }
    | { type: 'region', value: Region }

export interface BailianAgentConfig {
  agent: AgentId
  endpoint: Endpoint
  key: string
  model: string
}

export interface BailianCliResult {
  exitCode: number
  stdout: string
  stderr: string
}
