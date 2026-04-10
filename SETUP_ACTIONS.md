# GitHub Actions Setup — One-Time Manual Step

The Teaching Agent workflow is ready but needs to be created via the GitHub UI
because GitHub requires the `workflow` PAT scope to push workflow files directly.

## Quickest Path (2 minutes in GitHub UI)

1. Go to: https://github.com/kalelra/512ai-skills/new/main
2. Type the filename exactly: `.github/workflows/teach.yml`
3. Paste the YAML below into the editor
4. Click **Commit new file**

## The Complete Workflow YAML

```
name: Teaching Agent Nightly

on:
  schedule:
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  teach:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install deps
        run: if [ -f package.json ]; then npm ci 2>/dev/null || npm install; fi
      - name: Run Teaching Agent
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: node agents/teaching-agent.js
      - name: Commit skills
        run: |
          git config user.name "512AI Teaching Agent"
          git config user.email "bot@512ai.co"
          git add -A
          git diff --cached --quiet || git commit -m "chore: nightly skills $(date -u +%Y-%m-%d)" && git push
```

## Add These 3 Secrets

Settings > Secrets > Actions > New repository secret:
- `ANTHROPIC_API_KEY`
- `SLACK_BOT_TOKEN`  
- `SLACK_WEBHOOK_URL`

## Trigger Manually to Test

https://github.com/kalelra/512ai-skills/actions > Teaching Agent Nightly > Run workflow
