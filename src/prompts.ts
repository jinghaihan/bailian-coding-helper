import type { AccessMode, AgentId, BailianAgentConfig, Endpoint, Region } from './types'
import process from 'node:process'
import * as p from '@clack/prompts'
import c from 'ansis'
import { runBailianConfig } from './adapter'
import { ACCESS_MODES, DEFAULT_MODEL, VERSION } from './constants'
import { getOfficialAgentIds, getSuggestedModels } from './official'
import {
  formatAgentLabel,
  getCodingPlanBaseUrl,
  getPayAsYouGoBaseUrl,
  normalizeBaseUrl,
  validateUrl,
} from './utils'

const CUSTOM_MODEL = '__custom__'

async function prompt<T>(value: Promise<T | symbol>): Promise<T | undefined> {
  const result = await value

  if (p.isCancel(result)) {
    p.cancel('No changes were made.')
    return undefined
  }

  return result
}

async function resolveAgent(): Promise<AgentId | undefined> {
  const agents = getOfficialAgentIds()

  return await prompt(p.select<string>({
    message: 'Which coding agent do you want to configure?',
    options: agents.map(agent => ({
      value: agent,
      label: formatAgentLabel(agent),
    })),
  }))
}

async function resolveModel(): Promise<string | undefined> {
  const models = getSuggestedModels(DEFAULT_MODEL)
  const selected = await prompt(p.select<string>({
    message: 'Model',
    options: [
      ...models.map(model => ({
        value: model,
        label: model,
        hint: model === DEFAULT_MODEL ? 'Recommended' : 'Official CLI example',
      })),
      { value: CUSTOM_MODEL, label: 'Other model', hint: 'Enter a model ID' },
    ],
  }))

  if (!selected || selected !== CUSTOM_MODEL)
    return selected

  return await prompt(p.text({
    message: 'Model ID',
    placeholder: DEFAULT_MODEL,
    validate: value => value?.trim() ? undefined : 'Enter a model ID.',
  }))
}

async function resolveEndpoint(
  accessMode: AccessMode,
  agent: AgentId,
): Promise<Endpoint | undefined> {
  if (accessMode === 'coding-plan')
    return { type: 'base-url', value: getCodingPlanBaseUrl(agent) }

  if (accessMode === 'token-plan') {
    const region = await prompt(p.select<Region>({
      message: 'Token Plan region',
      options: [
        { value: 'cn-beijing', label: 'China (Beijing)' },
        { value: 'ap-southeast-1', label: 'International (Singapore)' },
      ],
    }))

    return region ? { type: 'region', value: region } : undefined
  }

  if (accessMode === 'pay-as-you-go') {
    const region = await prompt(p.select<Region>({
      message: 'Model Studio region',
      options: [
        { value: 'cn-beijing', label: 'China (Beijing)' },
        { value: 'ap-southeast-1', label: 'International (Singapore)' },
      ],
    }))

    return region
      ? { type: 'base-url', value: getPayAsYouGoBaseUrl(region, agent) }
      : undefined
  }

  const baseUrl = await prompt(p.text({
    message: 'Base URL',
    placeholder: 'https://example.com/compatible-mode/v1',
    validate: validateUrl,
  }))

  return baseUrl ? { type: 'base-url', value: normalizeBaseUrl(baseUrl) } : undefined
}

async function resolveKey(): Promise<string | undefined> {
  const envKey = process.env.DASHSCOPE_API_KEY?.trim()

  if (envKey) {
    const useEnvironment = await prompt(p.confirm({
      message: 'Use DASHSCOPE_API_KEY from your environment?',
      initialValue: true,
    }))

    if (useEnvironment === undefined)
      return undefined
    if (useEnvironment)
      return envKey
  }

  const key = await prompt(p.password({
    message: 'Bailian API Key',
    validate: value => value?.trim() ? undefined : 'Enter an API Key.',
  }))

  return key?.trim()
}

export async function runWizard(): Promise<void> {
  p.intro(`${c.yellow('Bailian Coding Helper')} ${c.dim(`v${VERSION}`)}`)

  const agent = await resolveAgent()
  if (!agent)
    return

  const accessMode = await prompt(p.select<AccessMode>({
    message: 'How do you access Bailian?',
    options: [...ACCESS_MODES],
  }))
  if (!accessMode)
    return

  const endpoint = await resolveEndpoint(accessMode, agent)
  if (!endpoint)
    return

  const key = await resolveKey()
  if (!key)
    return

  const model = await resolveModel()
  if (!model)
    return

  const agentLabel = formatAgentLabel(agent)
  const accessLabel = ACCESS_MODES.find(item => item.value === accessMode)?.label ?? accessMode

  p.note([
    `Agent:    ${agentLabel}`,
    `Access:   ${accessLabel}`,
    `Endpoint: ${endpoint.value}`,
    `Model:    ${model.trim()}`,
  ].join('\n'), 'Configuration')

  const confirmed = await prompt(p.confirm({
    message: `Configure ${agentLabel} with Bailian?`,
    initialValue: true,
  }))
  if (confirmed === undefined)
    return
  if (!confirmed) {
    p.cancel('No changes were made.')
    return
  }

  const config: BailianAgentConfig = {
    agent,
    endpoint,
    key,
    model: model.trim(),
  }

  p.log.step(`Configuring ${agentLabel}`)
  await runBailianConfig(config)
  p.log.success(`${agentLabel} configured`)
  p.outro(`Done. Open ${agentLabel} to start coding.`)
}
