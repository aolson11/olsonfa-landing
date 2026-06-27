# Session Handoff — Austin Olson / Olson Franchise Advisory
## Date: 2026-06-27

### WHAT WAS COMPLETED
8 profession-targeted blogs published and deployed live on olsonfa.com:
1. Nurses → /blog/nurses-franchise-ownership
2. Blue-Collar Trades → /blog/blue-collar-franchises (title cut-off fixed)
3. Teachers/Educators → /blog/career-transition-for-teachers
4. Military/Veterans → /blog/military-veteran-franchise-ownership
5. Corporate/Tech Professionals → /blog/corporate-professional-franchise-transition
6. Small Business Owners → /blog/career-transition-for-small-business-owners
7. Real Estate Professionals → /blog/career-transition-for-real-estate-professionals
8. Healthcare Administrators → /blog/career-transition-for-healthcare-administrators

### WHAT'S IN PROGRESS (NEEDS RESEARCH FIRST)
3 profession blogs pending — MUST research actual pain points before writing:
1. Government Workers — validate: pension trap, salary cap, bureaucracy frustration, golden handcuffs
2. IT/Tech Professionals — validate: layoffs, ageism, on-call burnout, building someone else's dream
3. Military Spouses/Partners — validate: frequent relocations, portable business models, spouse career instability

### HOW TO RESEARCH PAIN POINTS (CRITICAL)
- Use Reddit threads from profession-specific subreddits
- Check Glassdoor reviews for each profession
- Look at career forums and professional groups
- Key subreddits: r/governmentjobs, r/federal, r/cscareerquestions, r/militaryspouses, r/military
- Browser CDP needed for direct Reddit/Glassdoor access (DDG search is rate-limited)
- Connect Brave browser locally with /browser connect command

### WEBSITE DEPLOYMENT
- Repo: /Users/olson/Desktop/OpenClaw-Workspace/olsonfa-landing
- Deploy via: npx vercel deploy --prod --yes (git push times out consistently)
- Blog files in: blog/*.html and blog/*.md
- All HTML pages follow same template structure as blue-collar-franchises.html

### CONTENT DOCTRINE (NON-NEGOTIABLE)
- Austin = Guide. Clients = Heroes. Never about Austin's ego.
- Challenger methodology — direct, uncomfortable truths
- Zero marketing jargon
- Affordability angle woven subtly (partnering option to reduce individual risk)
- No em dashes anywhere
- NEVER use the word "lawyer" even in disclaimers (creates liability exposure)
- JD speaks for itself — don't explain what it isn't

### LINKEDIN PROFILE STATUS
- URL: www.linkedin.com/in/franchiseguide
- About section drafted and ready to paste (needs "lawyer" fix)
- Experience entries drafted
- Banner text needs design
- Connection building: manual only, 50-75/week max for new account
- NEVER automate LinkedIn — anti-bot detection will ban permanently

### NEXT STEPS IN ORDER
1. Research pain points for government workers, IT pros, military spouses (Reddit/Glassdoor)
2. Write 3 pending profession blogs with researched pain points
3. Deploy to olsonfa.com
4. Validate/refine existing blog content against actual community data
5. LinkedIn profile completion and connection building

### KEY DECISIONS MADE
- One Vercel project per domain for campaign-specific landing pages
- Blog index updated with all profession cards
- Title cut-off on blue-collar article fixed (CSS clamp + word-break)
- All blogs follow same proven structure: hero's journey → pain points → affordability → what they bring → CTA
