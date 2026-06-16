# OlsonFA.com Multi-Domain Architecture

## Overview
Single Vercel project (`olsonfa-landing`) supports multiple custom domains for campaign-specific landing pages. Zero hosting cost on Hobbie plan (free tier).

## Current Domains
| Domain | Purpose | Status |
|--------|---------|--------|
| `olsonfa.com` / `www.olsonfa.com` | Main brand site (franchise advisory) | Live |
| `olsoncg.com` | Parent LLC — Olson Consulting Group | DNS needs verification, page ready |

## Domain: olsoncg.com (Olson Consulting Group)
- **LLC name**: Olson Consulting Group
- **Campaign page**: `/campaigns/olsoncg.html` (ready to deploy)
- **Purpose**: Parent brand / consulting umbrella — can host multiple franchise campaigns under one roof
- **Status**: Page created, alias pending DNS verification in Vercel dashboard

### To Activate olsoncg.com
1. Add `olsoncg.com` as a site in your Vercel dashboard (Settings → Domains)
2. Verify DNS ownership (add the CNAME/A records Vercel provides to your domain registrar)
3. Once verified, alias it: `vercel alias add olsoncg.com`
4. Deploy: `vercel deploy --prod --yes`

### Why Two Domains?
- **olsonfa.com** = Franchise broker brand (StoryBrand positioning, guide framework)
- **olsoncg.com** = Parent LLC / consulting umbrella (broader positioning, can host multiple campaigns)

## How to Add a New Campaign Domain

### Step 1: Point DNS to Vercel
Add CNAME or A records for the new domain pointing to Vercel's servers. See Vercel docs for exact values.

### Step 2: Alias Domain to Project
```bash
cd /Users/olson/Desktop/OpenClaw-Workspace/olsonfa-landing
vercel alias add <new-domain.com>
```

### Step 3: Create Campaign HTML
Copy `index.html` to `/campaigns/<campaign-name>.html`:
```bash
cp index.html campaigns/<campaign-name>.html
# Edit the new file with campaign-specific copy
```

### Step 4: Deploy
```bash
vercel deploy --prod --yes
```

## Architecture Decision: Separate Projects vs Single Project

**Chosen approach: One Vercel project per domain (separate deployments)**

### Why Not Edge Function Routing?
- Static HTML site - edge functions add complexity without benefit
- Analytics isolation per campaign (critical for conversion tracking)
- No routing latency or failure modes
- Simpler to manage and debug

### When to Use Separate Projects
Each campaign domain gets its own Vercel deployment:
- `olsonfa.com` → main brand site (current project)
- `yourfranchisefit.com` → new project with campaign-specific HTML
- `e2visa-franchise.com` → E-2 visa buyer campaign

### Project Naming Convention
`<campaign>-landing` or `<domain>-vercel`

## Campaign Page Best Practices
1. **Hero section** must speak to the specific audience's pain point
2. **Keep OFA trust signals** (JD credential, bio excerpt) consistent across all pages
3. **CTA button** should match campaign intent ("Schedule Your Evaluation" vs "Get Started")
4. **Analytics** - separate GA4 property per domain for clean conversion tracking

## Adding New Domains - Quick Reference
```bash
# 1. DNS setup (done in domain registrar)
# 2. Alias to project
vercel alias add <domain.com>

# 3. Create campaign HTML
cp index.html campaigns/<name>.html

# 4. Deploy
vercel deploy --prod --yes
```

## Cost
- Vercel Hobbie plan: Free (up to 100 custom domains)
- Domain registration: ~$10/year per domain
- Hosting: $0 (Vercel free tier covers all traffic for static sites)
