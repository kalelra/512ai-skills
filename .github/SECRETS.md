# Required GitHub Actions Secrets

Add these in: Settings → Secrets and variables → Actions → New repository secret

| Secret Name | Description | Where to get |
|-------------|-------------|--------------|
| `SLACK_BOT_TOKEN` | Slack bot OAuth token | Slack app → OAuth & Permissions |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook | Slack app → Incoming Webhooks |
| `ANTHROPIC_API_KEY` | Claude API key | console.anthropic.com |

`GITHUB_TOKEN` is provided automatically — no action needed.

## Manual Trigger

Go to: Actions tab → Teaching Agent Nightly → Run workflow
