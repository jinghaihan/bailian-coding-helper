import { configAgent } from 'bailian-cli-commands'

function getConfigAgentFlags() {
  if (!configAgent.flags)
    throw new Error('The installed Bailian command package does not expose config agent flags.')

  return configAgent.flags
}

function getExampleVariants(example: unknown): string[] {
  if (typeof example === 'string')
    return [example]

  if (!example || typeof example !== 'object')
    return []

  return Object.values(example).filter(value => typeof value === 'string')
}

export function getOfficialAgentIds(): string[] {
  return [...getConfigAgentFlags().agent.choices]
}

export function getOfficialWireApis(): string[] {
  return [...getConfigAgentFlags().wireApi.choices]
}

export function getOfficialExampleModels(): string[] {
  const models = new Set<string>()

  for (const example of configAgent.exampleArgs ?? []) {
    for (const variant of getExampleVariants(example)) {
      const match = variant.match(/--model(?:=|\s+)(\S+)/)
      if (match?.[1])
        models.add(match[1].replace(/^['"]|['"]$/g, ''))
    }
  }

  return [...models]
}

export function getSuggestedModels(defaultModel: string): string[] {
  return [...new Set([defaultModel, ...getOfficialExampleModels()])]
}
