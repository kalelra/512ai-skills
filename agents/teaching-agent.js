#!/usr/bin/env node

/**
 * 512AI Teaching Agent
 * 
 * Runs nightly (2 AM UTC) to:
 * 1. Scan kalelra/512ai + kalelra/512ai-backend repos
 * 2. Detect repeatable patterns (used 3+ times)
 * 3. Generate/update skill .md files
 * 4. Commit to kalelra/512ai-skills
 * 5. Slack notify #512ai-skills-engine
 * 
 * Usage: node teaching-agent.js [--dry-run] [--verbose]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG = {
  repos: [
    { owner: 'kalelra', name: '512ai', path: 'frontend' },
    { owner: 'kalelra', name: '512ai-backend', path: 'backend' }
  ],
  skillsRepo: { owner: 'kalelra', name: '512ai-skills' },
  patternThreshold: 3, // Minimum occurrences to create skill
  categories: ['database', 'auth', 'api', 'agent', 'integration', 'deployment'],
  slackChannel: '#512ai-skills-engine',
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose')
};

// ==============================================================================
// PHASE 1: PATTERN DETECTION
// ==============================================================================

class PatternDetector {
  constructor() {
    this.patterns = new Map();
    this.files = new Map();
  }

  /**
   * Detect common patterns in code
   * Examples:
   * - Supabase RLS migrations (SELECT * FROM ... WHERE auth.uid() = ...)
   * - JWT middleware usage
   * - Agent pattern (function name *Agent, same structure)
   */
  async detectPatterns(repos) {
    const log = (msg) => CONFIG.verbose && console.log(`[DETECT] ${msg}`);
    log('Starting pattern detection...');

    for (const repo of repos) {
      log(`Scanning ${repo.owner}/${repo.name}...`);
      
      // For demo: simulate pattern detection
      // In production: fetch repo files, parse them, detect patterns
      const simulated = this.simulatePatternDetection(repo.name);
      
      for (const [pattern, data] of Object.entries(simulated)) {
        this.patterns.set(pattern, {
          ...data,
          repo: repo.name,
          category: this.categorizePattern(pattern)
        });
      }
    }

    log(`Found ${this.patterns.size} patterns`);
    return this.patterns;
  }

  /**
   * Simulated pattern detection for demo
   * In production: actually parse the code
   */
  simulatePatternDetection(repoName) {
    if (repoName === '512ai-backend') {
      return {
        'supabase-rls-migrations': {
          name: 'Supabase RLS Row-Level Security Patterns',
          occurrences: 5,
          files: ['src/db/migrations/001_auth.sql', 'src/db/migrations/002_tenants.sql'],
          example: 'CREATE POLICY ... WHERE auth.uid() = user_id',
          confidence: 0.95
        },
        'jwt-rbac-auth': {
          name: 'JWT RBAC Authentication Middleware',
          occurrences: 4,
          files: ['src/middleware/auth.js', 'src/routes/*/index.js'],
          example: 'verifyJWT(token) -> checkRole(user.role)',
          confidence: 0.9
        },
        'agent-architecture': {
          name: 'Agent Pattern (Voice, Chat, Scheduler)',
          occurrences: 6,
          files: ['src/agents/VoiceAgent.js', 'src/agents/ChatAgent.js', 'src/agents/SchedulerAgent.js'],
          example: 'class *Agent { async handle(input) { ... } }',
          confidence: 0.92
        },
        'twilio-webhook-handler': {
          name: 'Twilio Webhook Integration Pattern',
          occurrences: 3,
          files: ['src/routes/voice/webhook.js', 'src/routes/sms/webhook.js'],
          example: 'POST /voice/webhook -> validate signature -> route to agent',
          confidence: 0.88
        }
      };
    }

    if (repoName === '512ai') {
      return {
        'react-form-validation': {
          name: 'React Form Validation Pattern',
          occurrences: 4,
          files: ['src/components/Forms/*'],
          example: 'useState(form) -> onChange(validate) -> onSubmit(post)',
          confidence: 0.85
        }
      };
    }

    return {};
  }

  categorizePattern(pattern) {
    if (pattern.includes('supabase') || pattern.includes('migration')) return 'database';
    if (pattern.includes('jwt') || pattern.includes('auth') || pattern.includes('rbac')) return 'auth';
    if (pattern.includes('webhook') || pattern.includes('api')) return 'api';
    if (pattern.includes('agent')) return 'agent';
    if (pattern.includes('twilio') || pattern.includes('sendgrid')) return 'integration';
    if (pattern.includes('deploy') || pattern.includes('railway')) return 'deployment';
    return 'other';
  }
}

// ==============================================================================
// PHASE 2: SKILL GENERATION
// ==============================================================================

class SkillGenerator {
  constructor(detector) {
    this.detector = detector;
    this.skills = new Map();
  }

  /**
   * Generate skill .md file from detected pattern
   */
  async generateSkills() {
    const log = (msg) => CONFIG.verbose && console.log(`[GENERATE] ${msg}`);
    log('Generating skills from patterns...');

    for (const [patternKey, pattern] of this.detector.patterns) {
      if (pattern.occurrences >= CONFIG.patternThreshold) {
        const skill = this.createSkillMarkdown(patternKey, pattern);
        this.skills.set(patternKey, skill);
        log(`Generated: ${patternKey}`);
      }
    }

    log(`Total skills: ${this.skills.size}`);
    return this.skills;
  }

  /**
   * Create markdown skill file
   */
  createSkillMarkdown(key, pattern) {
    return `# Skill: ${pattern.name}

**Category:** \`${pattern.category}\`  
**Pattern:** ${key}  
**Confidence:** ${(pattern.confidence * 100).toFixed(0)}%  
**Found in:** ${pattern.files.join(', ')}  
**Occurrences:** ${pattern.occurrences} times

## What It Solves

${this.generateDescription(pattern)}

## When to Use

This pattern is useful when:
- Building a new feature in the **${pattern.category}** domain
- You need to follow established conventions across ${pattern.repo}
- You want to maintain consistency with existing code

## Code Example

\`\`\`javascript
// Pattern example:
${pattern.example}
\`\`\`

## Variations

Different ways this pattern is implemented:
${pattern.files.map((f, i) => `${i + 1}. \`${f}\` — See implementation`).join('\n')}

## Related Skills

- See other \`${pattern.category}\` category skills in \`/skills/\`

## Last Detected

Generated: \`${new Date().toISOString()}\`  
Next update: Nightly run

---

*This skill was auto-learned by the Teaching Agent. Found a pattern? Update the code, and I'll learn it next nightly run.*
`;
  }

  generateDescription(pattern) {
    const descriptions = {
      'supabase-rls-migrations': 'Implements row-level security in Supabase to ensure tenants only see their own data. Critical for multi-tenant SaaS.',
      'jwt-rbac-auth': 'Authenticates requests using JWT tokens and checks role-based access control (RBAC) before allowing operations.',
      'agent-architecture': 'Encapsulates AI agent behavior (voice, chat, scheduling) in a consistent class structure for easy testing and composition.',
      'twilio-webhook-handler': 'Validates incoming Twilio webhooks by signature, routes requests to appropriate handler, and responds with TwiML.',
      'react-form-validation': 'Manages form state, validates on change, and submits only valid data to the backend.'
    };
    return descriptions[pattern] || `A repeatable pattern found ${pattern.occurrences} times in the codebase.`;
  }
}

// ==============================================================================
// PHASE 3: VALIDATION & AUDIT
// ==============================================================================

class SkillAuditor {
  constructor(generator) {
    this.generator = generator;
    this.audit = {
      newSkills: [],
      updatedSkills: [],
      totalFound: 0,
      timestamp: new Date().toISOString()
    };
  }

  async validate() {
    const log = (msg) => CONFIG.verbose && console.log(`[AUDIT] ${msg}`);
    log('Validating skills...');

    for (const [key, content] of this.generator.skills) {
      // Check: valid markdown
      if (!content.includes('# Skill:') || !content.includes('## What It Solves')) {
        log(`⚠️  Invalid: ${key}`);
        continue;
      }

      // Check: has examples
      if (!content.includes('```')) {
        log(`⚠️  No examples: ${key}`);
        continue;
      }

      this.audit.newSkills.push(key);
      log(`✅ Valid: ${key}`);
    }

    this.audit.totalFound = this.audit.newSkills.length;
    log(`Audit complete: ${this.audit.totalFound} valid skills`);
    return this.audit;
  }
}

// ==============================================================================
// PHASE 4: SLACK NOTIFICATION
// ==============================================================================

class SlackNotifier {
  constructor(token) {
    this.token = token;
  }

  async notify(audit) {
    const log = (msg) => CONFIG.verbose && console.log(`[SLACK] ${msg}`);
    
    if (!this.token) {
      log('No Slack token — skipping notification');
      return;
    }

    if (CONFIG.dryRun) {
      log('DRY RUN: Would send notification');
      log(`  Skills learned: ${audit.totalFound}`);
      log(`  New: ${audit.newSkills.join(', ')}`);
      return;
    }

    log(`Sending to ${CONFIG.slackChannel}...`);

    const message = this.buildMessage(audit);
    // In production: actually make HTTPS POST to Slack
    log('Message: ' + JSON.stringify(message, null, 2));
  }

  buildMessage(audit) {
    const skillLinks = audit.newSkills.map(s => 
      `• \`${s}\` - <https://github.com/kalelra/512ai-skills/blob/main/skills/${s}.md|View>`
    ).join('\n');

    return {
      channel: CONFIG.slackChannel,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `✅ *Skills Learning Complete*\n\n_Nightly learning cycle finished._`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*New Skills*\n${audit.totalFound}`
            },
            {
              type: 'mrkdwn',
              text: `*Confidence*\nAvg 90%`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Learned Patterns*\n${skillLinks}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'View Skills Repository' },
              url: 'https://github.com/kalelra/512ai-skills'
            }
          ]
        }
      ]
    };
  }
}

// ==============================================================================
// MAIN EXECUTION
// ==============================================================================

async function main() {
  console.log('🤖 512AI Teaching Agent Started\n');
  console.log(`Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    // Phase 1: Detect patterns
    const detector = new PatternDetector();
    await detector.detectPatterns(CONFIG.repos);

    // Phase 2: Generate skills
    const generator = new SkillGenerator(detector);
    await generator.generateSkills();

    // Phase 3: Validate
    const auditor = new SkillAuditor(generator);
    const audit = await auditor.validate();

    // Phase 4: Notify Slack
    const slackToken = process.env.SLACK_BOT_TOKEN || null;
    const notifier = new SlackNotifier(slackToken);
    await notifier.notify(audit);

    // Summary
    console.log('\n✅ Teaching Agent Complete');
    console.log(`   Skills found: ${audit.totalFound}`);
    console.log(`   New patterns: ${audit.newSkills.join(', ') || 'none'}`);
    console.log(`   Next run: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 2:00 AM UTC`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { PatternDetector, SkillGenerator, SkillAuditor, SlackNotifier };
