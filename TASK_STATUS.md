# OFA Website Update — Task Status (Save for Main Chat)

**Date:** 2026-06-15
**Status:** In Progress — SB7 Audit Complete, Awaiting Approval to Patch

## What Was Done
1. Read full StoryBrand 2.0 framework text (Book_Building_A_StoryBrand_2.0.txt)
2. Audited current olsonfa.com/index.html against all 7 SB7 elements
3. Identified core issues and recommended fixes below

## Current Site File
- `/Users/olson/Desktop/OpenClaw-Workspace/olsonfa-landing/index.html` (1,195 lines)
- Deployed to Vercel (main branch pushed)

## SB7 Audit Results

| Element | Status | Issue |
|---|---|---|
| 1. Character (customer = hero) | ✅ Pass | Hero says "The Question Nobody Asks Before You Buy a Franchise" — customer's question, not Austin's pitch |
| 2. Has a Problem | ⚠️ Partial | Problem cards are good but the Gap section before it breaks alignment |
| 3. Meets A Guide | ✅ Pass | "I Do Not Start With a Brand I Want to Sell You" — clear guide positioning |
| 4. Gives Them A Plan | ✅ Pass | 3-step process section is clean and specific |
| 5. Calls To Action | ✅ Pass | Direct CTA (contact form) + Transitional CTA (lead magnet) both present |
| 6. Avoid Failure | ✅ Pass | Stakes section with failure/success cards works well |
| 7. Ends In Success | ⚠️ Partial | Implied but not explicitly painted — success card is about "what happens if you get clarity" rather than vivid outcome picture |

## Core Issues Found

### Issue 1: Gap Section Reads Like Methodology, Not Customer Copy
- Current labels: "Where You Are Right Now", "What Is Actually Possible"
- Academic dimension labels (What It Looks Like, What Is Missing, The Cost, etc.)
- Visitor doesn't know what "the gap" means — feels like a framework exercise
- **Fix:** Replace with customer-facing language that maps current-state → future-state without naming any methodology. Make it feel like OFA is helping them see their situation clearly, not doing an exercise.

### Issue 2: Hero Tagline Fails Grunt Test
- Current: "The Franchise Decision Nobody Should Make Alone"
- Problem: A caveman can't immediately say what OFA does
- **Fix:** Make it clear OFA helps people evaluate whether franchise ownership makes sense for them, and which option fits.

### Issue 3: Guide Section Backstory Overweight
- Austin's bio takes up too much space before getting to how he helps the customer
- SB7 Principle: Guide's backstory serves ONE purpose — proving trustworthiness as guide
- **Fix:** Tighten bio, move more focus to "how I help you"

### Issue 4: Success Outcome Not Vividly Painted (SB7 #7)
- Current success card says "You walk away knowing..." — that's about the process, not the outcome
- SB7 Principle 7: Tell customers how great their life can look if they buy
- **Fix:** Paint a vivid picture of what ownership with clarity looks like vs. without it

## Recommended Fixes (Awaiting Approval)

### Fix 1: Hero Section
```
Tagline → "Unbiased Franchise Evaluation Before You Commit"
H1 → Keep current ("The Question Nobody Asks Before You Buy a Franchise") — this is strong
Subtitle → Clarify what OFA does in one sentence
CTA → Keep as-is (strong)
```

### Fix 2: Replace Gap Section Entirely
Replace the academic "gap" columns with customer-facing copy that:
- Maps current frustration → desired outcome WITHOUT naming any methodology
- Uses language like "Before you evaluate a single brand..." not "Map this gap first"
- Keeps the tension (current state vs. what's possible) but makes it feel natural, not clinical

### Fix 3: Tighten Guide Section
- Trim Austin bio to focus on trust signals relevant to franchise evaluation
- Move more emphasis to "how I evaluate differently"

### Fix 4: Paint Success Vividly
- Rewrite success card in stakes section to show what life looks like with clarity vs. without it
- Make the contrast sharper and more emotional

## Framework Alignment Doctrine (For Reference)
- StoryBrand 2.0 = structural foundation (keep as-is, apply invisibly)
- Gap Selling = current-state → future-state mapping (apply subtly, never name-drop)
- Challenger Sale = provocative headlines/hooks only (not throughout copy)
- Hook Point + Hormozi Core Four = LinkedIn content hooks (3-second attention)
- Kennedy Measurement = track engaged leads per channel, not vanity metrics

## Pending Actions
1. [ ] Get approval on audit findings and fix plan
2. [ ] Patch hero tagline for grunt test pass
3. [ ] Replace Gap section with customer-facing copy
4. [ ] Tighten Guide section bio
5. [ ] Paint success outcome vividly (SB7 #7)
6. [ ] Commit and deploy to Vercel
7. [ ] Verify live site renders correctly

## Key Files
- `/Users/olson/Desktop/OpenClaw-Workspace/olsonfa-landing/index.html` — main site
- `/Users/olson/Desktop/OpenClaw-Workspace/olsonfa-landing/guide-content.md` — lead magnet draft
- `/Users/olson/Desktop/OpenClaw-Workspace/olsonfa-landing/guide.html` — standalone guide page
