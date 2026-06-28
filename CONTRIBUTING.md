# Contributing to Local Agent Studio

Thanks for your interest in contributing to Local Agent Studio.

This project is still early, so clear reports, small focused pull requests, and
real-world testing notes are especially helpful.

## Ways to Help

- Report bugs with steps to reproduce.
- Suggest improvements for the agent workflow, UI, providers, or setup process.
- Test Ollama models, ComfyUI workflows, MCP servers, and Runpod-style remote providers.
- Improve documentation, release notes, screenshots, and setup guides.
- Open pull requests for focused fixes or features.

## Before Opening an Issue

Please check whether a similar issue already exists.

When reporting a bug, include:

- Local Agent Studio version
- Operating system
- Ollama version and model name, if relevant
- ComfyUI setup, if relevant
- Steps to reproduce
- Expected result
- Actual result
- Logs or screenshots if they help explain the issue

## Development Setup

Requirements:

- Node.js 20+
- npm
- Ollama for local LLM testing
- ComfyUI for image workflow testing

Install dependencies:

```bash
npm install
```

Run the app in development mode:

```bash
npm run dev
```

Run a production build check:

```bash
npm run build
```

## Pull Request Guidelines

- Keep pull requests focused on one feature or fix.
- Describe what changed and why.
- Include screenshots or short videos for UI changes when possible.
- Run `npm run build` before submitting.
- Avoid committing generated release files unless the PR is specifically about release packaging.
- Do not include API keys, tokens, private endpoints, or personal workspace files.

## Security

Please do not open public issues for security vulnerabilities.
Use the instructions in `SECURITY.md` instead.
