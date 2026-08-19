import { configAgent } from 'bailian-cli-commands'

function getConfigAgentFlags() {
  if (!configAgent.flags)
    throw new Error('The installed Bailian command package does not expose config agent flags.')

  return configAgent.flags
}

export function getOfficialAgentIds(): string[] {
  return [...getConfigAgentFlags().agent.choices]
}

export function getOfficialWireApis(): string[] {
  return [...getConfigAgentFlags().wireApi.choices]
}
