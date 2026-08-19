# bailian-coding-helper

[![npm version][npm-version-src]][npm-version-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

An interactive CLI for setting up Alibaba Cloud Bailian with AI coding agents.

It provides a prompt-based interface powered by the official [`bailian-cli`](https://github.com/modelstudioai/cli) command metadata and runtime.

## Usage

```bash
npx bailian-coding-helper@latest
```

The wizard asks for your coding agent, Bailian access plan, API key, and model. API keys are hidden during input and omitted from the configuration summary. Supported agents are read from the installed official command package.

Supported access modes:

- Coding Plan
- Token Plan
- Pay-as-you-go
- Custom Base URL

Supported agents:

- Claude Code
- Qwen Code
- Codex
- OpenCode
- OpenClaw
- Hermes Agent

The model picker contains the text-generation models from the [Token Plan Team model catalog](https://help.aliyun.com/zh/model-studio/token-plan-team-overview), with `glm-5.2` as the recommended default. Each maintained model includes its official context window. The wizard displays that documentation link and always provides an **Other model** option, so you can enter a newly released model before this package updates its maintained catalog.

Claude Code and OpenClaw also receive a context-window prompt with the selected model's known limit as the default. Claude Code is configured with its context environment setting and the `[1m]` model suffix for extended-context models. OpenClaw uses the official `--context-window` flag. Other agents are not prompted until their configuration format is explicitly supported.

## How it works

The selected values are passed to the official `configAgent` command through `bailian-cli-runtime`, equivalent to:

```bash
bl config agent --agent <agent> --base-url <url> --api-key <key> --model <model>
```

Agent-specific configuration files, merging, and backups remain the responsibility of the official command implementation.

## License

[MIT](./LICENSE) License © [jinghaihan](https://github.com/jinghaihan)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/bailian-coding-helper?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/bailian-coding-helper
[npm-downloads-src]: https://img.shields.io/npm/dm/bailian-coding-helper?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/bailian-coding-helper
[bundle-src]: https://img.shields.io/bundlephobia/minzip/bailian-coding-helper?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=bailian-coding-helper
[license-src]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/jinghaihan/bailian-coding-helper/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/bailian-coding-helper
