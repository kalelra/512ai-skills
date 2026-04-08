# 512AI Skills Engine

Auto-learned, versioned skill modules for 512AI projects.

## What This Is

This repository stores **reusable patterns** discovered by Claude across 512AI codebases:
- Database patterns (Supabase RLS, migrations)
- Agent patterns (VoiceAgent, SchedulerAgent, etc.)
- API integration patterns (Twilio, SendGrid, LawnPro)
- Authentication flows (JWT, RBAC, tenant isolation)
- Deployment patterns (Railway, Netlify)

Each skill is a **lean markdown file** + code examples + when-to-use guidance.

## Skills (Auto-Updated Nightly)

| Skill | Category | Confidence | Last Updated |
|-------|----------|-----------|--------------|
| `supabase-rls-patterns.md` | Database | High | 2026-04-08 |
| `twilio-voice-agent.md` | Integration | High | 2026-04-07 |
| `jwt-rbac-auth.md` | Auth | High | 2026-04-05 |
| *(more added nightly)* | - | - | - |

Browse `/skills/` folder for all available.

## How It Works

1. **Nightly Detection** — Teaching agent scans `kalelra/512ai` + `kalelra/512ai-backend`
2. **Pattern Analysis** — Finds repeatable code (used 3+ times or cross-project)
3. **Skill Generation** — Creates/updates `.md` files
4. **Versioning** — Commits to GitHub + tags releases (v0.1.0, v0.1.1, etc.)
5. **Slack Alert** — Notifies you in `#512ai-skills-engine`

## Using a Skill

Example: You're building a new agent and need RLS pattern:

```bash
# Find it
ls skills/ | grep rls

# Read it
cat skills/supabase-rls-patterns.md

# Use it
# (Copy example code, adapt to your context)
```

## Folder Structure

```
512ai-skills/
├── README.md (this file)
├── CHANGELOG.md (auto-updated version history)
├── /skills/ (all skill modules)
│   ├── supabase-rls-patterns.md
│   ├── twilio-voice-agent.md
│   └── ...
├── /templates/ (diagram + doc templates)
│   ├── architecture-diagram.svg
│   ├── api-spec-template.md
│   └── ...
├── /agents/ (teaching agent code)
│   ├── detect-patterns.js
│   ├── generate-skills.js
│   └── validate-skill.js
└── /audit/ (logs + change tracking)
    ├── nightly-runs.json
    └── ...
```

## Contributing

Skills are **auto-generated**. Don't edit directly; instead:
1. Improve the pattern in the main codebase
2. Teaching agent detects it
3. Skill updates automatically

## License

Same as parent projects. Internal use.

---

Last generated: `2026-04-08T02:15:00Z`  
Next run: `2026-04-09T02:00:00Z`
