# OlsonFA Website - Multi-Domain Architecture (2026-06-16)

## Current State
- Main site: olsonfa.com / www.olsonfa.com (V9 deployed, live)
- Vercel project: aolson11s-projects/olsonfa-landing
- Deploy method: `vercel deploy --prod --yes` (git push times out consistently)

## Multi-Domain Setup Complete
- Created `/campaigns/template.html` for campaign-specific pages
- Created `MULTI_DOMAIN_ARCHITECTURE.md` with full setup guide
- Architecture decision: One Vercel project per domain (separate deployments)
  - Why: Analytics isolation, no routing complexity, simpler management
  - Each domain = separate deployment but same codebase in git

## How to Add New Campaign Domain
1. Point DNS to Vercel (CNAME/A records)
2. `vercel alias add <domain.com>` from project directory
3. Copy index.html to campaigns/<name>.html and customize
4. `vercel deploy --prod --yes`

## Pending Decisions
- What is the second domain Austin owns? (never specified in conversation)
- Which campaign should get a dedicated page first? (E-2 visa buyers recommended as highest priority)

## JD Credential Strategy
- "Austin Olson, J.D." appears above bio headline
- One paragraph explains what JD enables: "reading between the lines" and analytical rigor
- No mention of legal services - stays in franchise broker lane
- Zero em dashes enforced across all copy

## Key Files
- `/Users/olson/Desktop/OpenClaw-Workspace/olsonfa-landing/index.html` (main site)
- `/Users/olson/Desktop/OpenClaw-Workspace/olsonfa-landing/campaigns/template.html`
- `/Users/olson/Desktop/OpenClaw-Workspace/olsonfa-landing/MULTI_DOMAIN_ARCHITECTURE.md`
