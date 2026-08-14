#!/usr/bin/env node
// Regression tests for OFA-ORG-P0-20260813: Public Trust Repair
// These prevent re-introduction of specific defects found during audit.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const checks = [];
const check = (condition, label) => { checks.push(label); if (!condition) failures.push(label); };
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');

// === P0-1: Duplicate blog article cards must be absent ===
const blogIndex = read('blog/index.html');
const cardPattern = /<article class="blog-card">[\s\S]*?<\/article>/gi;
const allCards = [...blogIndex.matchAll(cardPattern)];
const urlsInCards = [];

for (const match of allCards) {
  const urlMatch = match[0].match(/href="(\/blog\/[^"]+)"/);
  if (urlMatch) urlsInCards.push(urlMatch[1]);
}

// Check for duplicate URLs in blog index cards
const seenUrls = new Set();
let hasDuplicates = false;
for (const url of urlsInCards) {
  if (seenUrls.has(url)) {
    console.error(`P0-REGRESSION: Duplicate blog card URL found: ${url}`);
    hasDuplicates = true;
  }
  seenUrls.add(url);
}

check(!hasDuplicates, 'P0-1: No duplicate blog article cards in index');
check(allCards.length === urlsInCards.length, `P0-1: All ${allCards.length} cards have href attributes`);
check(seenUrls.size === allCards.length, 'P0-1: All card URLs are unique');

// === P0-2: "consultant and attorney" self-description must be absent ===
const consultantAttorneyPattern = /consultant and attorney/gi;
const caMatches = [...blogIndex.matchAll(consultantAttorneyPattern)];
check(caMatches.length === 0, 'P0-2: "consultant and attorney" self-description is absent from blog index');

// Check all HTML files for this pattern
const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
for (const file of htmlFiles) {
  const content = read(file);
  const matches = [...content.matchAll(consultantAttorneyPattern)];
  check(matches.length === 0, `P0-2: "consultant and attorney" absent from ${file}`);
}

// === P0-3: "brandsands" typo must be absent ===
const brandsandsPattern = /brandsands/gi;
check(brandsandsPattern.test(blogIndex) === false, 'P0-3: "brandsands" typo is absent from blog index');

for (const file of htmlFiles) {
  const content = read(file);
  check(brandsandsPattern.test(content) === false, `P0-3: "brandsands" absent from ${file}`);
}

// === P0-4: Sitemap must include individual blog article URLs ===
const sitemap = read('sitemap.xml');
const expectedBlogUrls = [
  'best-franchises-after-layoff',
  'franchise-cost-guide',
  'best-franchises-for-nurses',
  'blue-collar-franchises',
  'career-transition-for-teachers',
  'military-veteran-franchise-ownership',
  'corporate-professional-franchise-transition',
  'career-transition-for-small-business-owners',
  'career-transition-for-real-estate-professionals',
  'career-transition-for-healthcare-administrators',
  'no-experience-franchise',
  'how-to-evaluate-franchise',
  'sba-loans-franchises',
  'franchise-vs-independent-business',
  'best-franchises-for-teachers',
  'franchise-due-diligence-checklist',
];

for (const article of expectedBlogUrls) {
  check(sitemap.includes(`https://olsonfa.com/blog/${article}`), `P0-4: sitemap includes /blog/${article}`);
}

// === P0-5: Blog index must have exactly 16 unique articles ===
check(seenUrls.size === 16, 'P0-5: Blog index has exactly 16 unique article URLs');

// === Summary ===
if (failures.length) {
  console.error(`\nP0 REGRESSION TESTS FAILED: ${failures.length}/${checks.length}`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`P0 REGRESSION TESTS PASSED: ${checks.length} checks`);
