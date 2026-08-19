import type { AccessMode, AgentId, BailianAgentConfig, Endpoint, Region } from './types'
import process from 'node:process'
import * as p from '@clack/prompts'
import c from 'ansis'
import { runBailianConfig } from './adapter'
import {
  ACCESS_MODES,
  AGENT_CONTEXT_WINDOW_SUPPORT,
  CLAUDE_CODE_EXTENDED_CONTEXT_MODELS,
  CLAUDE_CODE_EXTENDED_CONTEXT_WINDOW,
  DEFAULT_MODEL,
  TOKEN_PLAN_MODEL_DOCS_URL,
  TOKEN_PLAN_MODELS,
  VERSION,
} from './constants'
import { getOfficialAgentIds } from './official'
import {
  formatAgentLabel,
  formatContextWindow,
  getCodingPlanBaseUrl,
  getModelContextWindow,
  getPayAsYouGoBaseUrl,
  getTokenPlanBaseUrl,
  normalizeBaseUrl,
  parseBailianConfigOutput,
  parseContextWindow,
  validateContextWindow,
  validateUrl,
} from './utils'

const CUSTOM_MODEL = '__custom__'
const CUSTOM_CONTEXT_WINDOW = '__custom__'
const DEFAULT_CONTEXT_WINDOW = '__default__'
const EXTENDED_CONTEXT_WINDOW = '__extended__'
const MODEL_CONTEXT_WINDOW = '__model__'

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
  p.log.info(`${c.bold('Official model list:')} ${c.underline.cyan(TOKEN_PLAN_MODEL_DOCS_URL)}`)

  const selected = await prompt(p.select<string>({
    message: 'Model',
    options: [
      ...TOKEN_PLAN_MODELS.map(model => ({
        value: model.value,
        label: model.value,
        hint: `${model.hint} · ${formatContextWindow(model.contextWindow)} context`,
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

async function resolveContextWindow(
  agent: AgentId,
  model: string,
): Promise<number | null | undefined> {
  if (agent !== 'claude-code' && agent !== 'openclaw')
    return null

  const support = AGENT_CONTEXT_WINDOW_SUPPORT[agent]
  const modelContextWindow = getModelContextWindow(model)
  const usesExtendedContext = agent === 'claude-code'
    && (
      model.endsWith('[1m]')
      || (CLAUDE_CODE_EXTENDED_CONTEXT_MODELS as readonly string[]).includes(model)
    )
  const recommendedContextWindow = usesExtendedContext
    ? CLAUDE_CODE_EXTENDED_CONTEXT_WINDOW
    : modelContextWindow
  const options: Array<{ value: string, label: string, hint: string }> = []

  if (recommendedContextWindow) {
    options.push({
      value: MODEL_CONTEXT_WINDOW,
      label: formatContextWindow(recommendedContextWindow),
      hint: 'Recommended · Model maximum',
    })
  }

  if (support.defaultValue !== recommendedContextWindow) {
    options.push({
      value: DEFAULT_CONTEXT_WINDOW,
      label: formatContextWindow(support.defaultValue),
      hint: `${formatAgentLabel(agent)} default`,
    })
  }

  if (agent === 'claude-code' && !usesExtendedContext) {
    options.push({
      value: EXTENDED_CONTEXT_WINDOW,
      label: '1M',
      hint: 'Use only if the model supports extended context',
    })
  }

  options.push({
    value: CUSTOM_CONTEXT_WINDOW,
    label: 'Other',
    hint: 'Enter a token count',
  })

  const selected = await prompt(p.select<string>({
    message: 'Context window',
    options,
  }))

  if (!selected)
    return undefined
  if (selected === MODEL_CONTEXT_WINDOW)
    return recommendedContextWindow
  if (selected === DEFAULT_CONTEXT_WINDOW)
    return support.defaultValue
  if (selected === EXTENDED_CONTEXT_WINDOW)
    return CLAUDE_CODE_EXTENDED_CONTEXT_WINDOW

  const custom = await prompt(p.text({
    message: 'Context window tokens',
    placeholder: String(recommendedContextWindow ?? support.defaultValue),
    validate: validateContextWindow,
  }))

  return custom ? parseContextWindow(custom) : undefined
}

async function resolveEndpoint(
  accessMode: AccessMode,
  agent: AgentId,
): Promise<Endpoint | undefined> {
  if (accessMode === 'coding-plan')
    return { type: 'base-url', value: getCodingPlanBaseUrl(agent) }

  if (accessMode === 'token-plan')
    return { type: 'base-url', value: getTokenPlanBaseUrl(agent) }

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

  const contextWindow = await resolveContextWindow(agent, model.trim())
  if (contextWindow === undefined)
    return

  const agentLabel = formatAgentLabel(agent)
  const accessLabel = ACCESS_MODES.find(item => item.value === accessMode)?.label ?? accessMode

  const configuration = [
    `${c.dim('Agent:')}    ${c.cyan(agentLabel)}`,
    `${c.dim('Access:')}   ${c.cyan(accessLabel)}`,
    `${c.dim('Endpoint:')} ${c.cyan(endpoint.value)}`,
    `${c.dim('Model:')}    ${c.yellow(model.trim())}`,
  ]
  if (contextWindow !== null) {
    configuration.push(
      `${c.dim('Context:')}  ${c.yellow(formatContextWindow(contextWindow))}`,
    )
  }
  p.note(configuration.join('\n'), 'Configuration')

  const confirmed = await prompt(p.confirm({
    message: `Configure ${c.cyan(agentLabel)} with ${c.yellow('Bailian')}?`,
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
    contextWindow: contextWindow ?? undefined,
    endpoint,
    key,
    model: model.trim(),
  }

  p.log.step(`Configuring ${agentLabel}`)
  const output = await runBailianConfig(config)
  const details = parseBailianConfigOutput(output)

  if (details.length > 0) {
    p.note(details.map((line) => {
      if (line.startsWith('Written:'))
        return `${c.dim('Written:')} ${c.cyan(line.slice('Written:'.length).trim())}`
      if (line.startsWith('Warning:'))
        return `${c.yellow('Warning:')} ${line.slice('Warning:'.length).trim()}`
      return line
    }).join('\n'), 'Bailian CLI')
  }

  p.log.success(`${agentLabel} configured`)
  p.outro(`Done. Open ${c.cyan(agentLabel)} to start coding.`)
}
