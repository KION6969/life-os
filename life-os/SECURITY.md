# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.3.x   | ✅        |

## Reporting a Vulnerability

Life OS is a local-first application. Data never leaves the user's browser unless the user explicitly configures cloud sync (GitHub Gist or JSONBin).

- No credentials are stored in the repository
- API tokens for cloud sync are stored in the user's browser `localStorage` only
- The AI Chef forwards requests to a local FreeLLMAPI router

If you find a security issue, please open a GitHub issue. Do not submit pull requests containing tokens, keys, or credentials.

## Disclosure

We will acknowledge receipt within 72 hours and provide a timeline for resolution within 7 days.