# Teaching Agent Nightly Scheduler

## Option 1: GitHub Actions (Recommended for your setup)

Create `.github/workflows/teach.yml` in kalelra/512ai-skills:

```yaml
name: Teaching Agent Nightly

on:
  schedule:
    # Runs at 2 AM UTC every day
    - cron: '0 2 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  teach:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run Teaching Agent
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
        run: node agents/teaching-agent.js
      
      - name: Commit & Push Skills
        run: |
          git config user.name "Teaching Agent"
          git config user.email "bot@512ai.co"
          git add -A
          git commit -m "chore: nightly skills learning" || echo "No changes"
          git push
      
      - name: Notify Slack on Failure
        if: failure()
        uses: slack-notify-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          message: "❌ Teaching Agent failed: See logs"
```

## Option 2: Cron Job on Your Mac (If you prefer local execution)

```bash
# Add to your Mac's crontab (crontab -e)

# Teaching Agent runs at 2 AM UTC = 8 PM CDT (Austin time)
0 2 * * * cd /home/claude/512ai-skills && node agents/teaching-agent.js >> /tmp/teach.log 2>&1
```

## Option 3: Railway Cron Job (If backend already on Railway)

In `railway.toml` for 512ai-backend:

```toml
[services.teach]
cmd = "node /path/to/teaching-agent.js"
schedule = "0 2 * * *"  # Daily at 2 AM UTC
```

---

## Environment Variables Needed

Both GitHub Actions and local execution need:

```bash
GITHUB_TOKEN=ghp_...           # To fetch repos + create commits
SLACK_BOT_TOKEN=xoxb-...       # To send alerts
SLACK_SIGNING_SECRET=xxxx...   # For webhook verification
```

**In GitHub Actions:** Add to repo secrets (Settings → Secrets)  
**On your Mac:** Already in `~/.config/512ai/.env` (will be auto-loaded)

---

## Testing the Schedule

**Dry run (no changes):**
```bash
cd /home/claude/512ai-skills
node agents/teaching-agent.js --dry-run
```

**Live run (actually commits + pushes):**
```bash
cd /home/claude/512ai-skills
node agents/teaching-agent.js
```

---

## Monitoring

Check if nightly run succeeded:

**GitHub Actions:** https://github.com/kalelra/512ai-skills/actions  
**Mac cron:** `tail -f /tmp/teach.log`

---

## Recommendation

Use **GitHub Actions** (Option 1). Why?

✅ No Mac required to be running  
✅ Automatic retry on failure  
✅ Clear audit trail (Actions tab)  
✅ Can trigger manually anytime  
✅ Scales if you add more agents later

Once you push the repo, I'll add the `.github/workflows/teach.yml` file automatically.
