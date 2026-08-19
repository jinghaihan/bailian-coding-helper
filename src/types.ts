export type KnownAgentId
  = | 'claude-code'
    | 'qwen-code'
    | 'codex'
    | 'opencode'
    | 'openclaw'
    | 'hermes'

export type AgentId = KnownAgentId | (string & {})

export type AccessMode
  = | 'coding-plan'
    | 'token-plan'
    | 'pay-as-you-go'
    | 'custom'

export type Region = 'cn-beijing' | 'ap-southeast-1'

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

export interface CommandOptions {
  cwd?: string
}

export interface ConfigOptions extends CommandOptions {}

export interface Options extends CommandOptions, ConfigOptions {}
