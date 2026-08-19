import type { CAC } from 'cac'
import type { AccessMode, AgentId, BailianAgentConfig, Endpoint, Region } from './types'
import process from 'node:process'
import * as p from '@clack/prompts'
import c from 'ansis'
import { cac } from 'cac'
import { redact, runBailianConfig } from './bailian'
import {
  ACCESS_MODES,
  AGENTS,
  CODING_PLAN_BASE_URLS,
  DEFAULT_MODEL,
  NAME,
  PAY_AS_YOU_GO_BASE_URLS,
  VERSION,
} from './constants'

const CUSTOM_AGENT = '__custom__'

async function prompt<T>(value: Promise<T | symbol>): Promise<T | undefined> {
  const result = await value

  if (p.isCancel(result)) {
    p.cancel('No changes were made.')
    return undefined
  }

  return result
}

function validateUrl(value: string | undefined): string | undefined {
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

function getProtocol(agent: AgentId): 'anthropic' | 'openai' {
  return agent === 'claude-code' ? 'anthropic' : 'openai'
}

async function resolveAgent(): Promise<AgentId | undefined> {
  const selected = await prompt(p.select<string>({
    message: 'Which coding agent do you want to configure?',
    options: [
      ...AGENTS,
      { value: CUSTOM_AGENT, label: 'Other', hint: 'Enter an agent ID supported by Bailian CLI' },
    ],
  }))

  if (!selected)
    return undefined

  if (selected !== CUSTOM_AGENT)
    return selected

  return await prompt(p.text({
    message: 'Agent ID',
    placeholder: 'agent-name',
    validate: value => value?.trim() ? undefined : 'Enter an agent ID.',
  }))
}

async function resolveEndpoint(
  accessMode: AccessMode,
  agent: AgentId,
): Promise<Endpoint | undefined> {
  const protocol = getProtocol(agent)

  if (accessMode === 'coding-plan')
    return { type: 'base-url', value: CODING_PLAN_BASE_URLS[protocol] }

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
      ? { type: 'base-url', value: PAY_AS_YOU_GO_BASE_URLS[region][protocol] }
      : undefined
  }

  const baseUrl = await prompt(p.text({
    message: 'Base URL',
    placeholder: 'https://example.com/compatible-mode/v1',
    validate: validateUrl,
  }))

  return baseUrl ? { type: 'base-url', value: baseUrl.trim().replace(/\/$/, '') } : undefined
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

async function runWizard(): Promise<void> {
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

  const model = await prompt(p.text({
    message: 'Model',
    initialValue: DEFAULT_MODEL,
    validate: value => value?.trim() ? undefined : 'Enter a model name.',
  }))
  if (!model)
    return

  const agentLabel = AGENTS.find(item => item.value === agent)?.label ?? agent
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

  const spinner = p.spinner()
  spinner.start(`Configuring ${agentLabel}`)

  const result = await runBailianConfig(config)

  if (result.exitCode !== 0) {
    spinner.stop(`Could not configure ${agentLabel}`)
    const output = redact(result.stderr || result.stdout, key).trim()
    if (output)
      p.log.error(output)
    process.exitCode = result.exitCode
    return
  }

  spinner.stop(`${agentLabel} configured`)
  p.outro(`Done. Open ${agentLabel} to start coding.`)
}

try {
  const cli: CAC = cac(NAME)

  cli
    .command('', 'Interactively configure a coding agent with Bailian')
    .action(runWizard)

  cli.help()
  cli.version(VERSION)
  cli.parse(process.argv, { run: false })
  await cli.runMatchedCommand()
}
catch (error) {
  p.log.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
