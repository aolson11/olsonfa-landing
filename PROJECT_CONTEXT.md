# OlsonFA Website — Complete Context (2026-06-16)

## Current State
- Main site: olsonfa.com / www.olsonfa.com (V9 deployed, live)
- Vercel project: aolson11s-projects/olsonfa-landing
- Deploy method: `vercel deploy --prod --yes` (git push times out consistently)

## Domains
| Domain | Purpose | Status |
|--------|---------|--------|
| olsonfa.com / www.olsonfa.com | Main franchise advisory brand | Live |
| olsoncg.com | Parent LLC — Olson Consulting Group | Page ready, DNS needs verification in Vercel dashboard |

## Multi-Domain Architecture
- One Vercel project per domain (separate deployments, same codebase in git)
- Each campaign page lives in `/campaigns/<name>.html`
- Deploy: `vercel deploy --prod --yes` after editing files locally

### How to Add New Campaign Domain
1. Point DNS of new domain to Vercel (CNAME/A records via registrar)
2. Add site + verify DNS in Vercel dashboard (Settings → Domains)
3. Alias: `vercel alias add <domain.com>` from project directory
4. Create page: `cp index.html campaigns/<name>.html` and customize
5. Deploy: `vercel deploy --prod --yes`

## Website Doctrine (StoryBrand + Challenger)
- Austin = Guide. Clients = Heroes. Non-negotiable.
- All personal info/bio/credentials serve ONE purpose: proving trustworthiness to the hero's journey — NOT about Austin.
- Framework: StoryBrand 2.0 + Challenger methodology.

## JD Credential Strategy
- "Austin Olson, J.D." appears above bio headline on olsonfa.com
- One paragraph explains what JD enables without mentioning legal services
- Zero em dashes enforced across all copy
- JD = analytical rigor, reading between the lines — NOT legal representation

## Key Files
- `/Users/olson/Desktop/OpenClaw-Workspace/olsonfa-landing/index.html` (main site)
- `/Users/olson/Desktop/OpenClaw-Workspace/olsonfa-landing/campaigns/olsoncg.html` (parent LLC page)
- `/Users/olson/Desktop/OpenClaw-Workspace/olsonfa-landing/MULTI_DOMAIN_ARCHITECTURE.md`

## Pending Decisions
- Which second campaign domain to add first? (E-2 visa buyers recommended as highest priority)
- DNS verification for olsoncg.com in Vercel dashboard (user action needed)
