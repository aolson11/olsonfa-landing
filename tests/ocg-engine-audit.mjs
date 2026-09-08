import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateConfig, resolveRoute } from '../campaigns/ocg-engine/route-engine.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const load = name => JSON.parse(fs.readFileSync(path.join(root, 'campaigns/ocg-engine/verticals', `${name}.json`), 'utf8'));
const therapists = load('therapists');
const consultants = load('consultants');

assert.equal(validateConfig(therapists), true);
assert.equal(validateConfig(consultants), true);
assert.equal(therapists.diagnostic.questions.length, 10);
assert.ok(Object.keys(therapists.variants).length >= 2);
assert.deepEqual(Object.keys(therapists.routes).sort(), ['clarify', 'hybrid', 'lean', 'supported']);
assert.ok(therapists.marketing.keywords.length >= 8);
assert.ok(therapists.marketing.negativeKeywords.length >= 12);
assert.equal(therapists.marketing.maxCac.launch_system, 65);

const profiles = {
  clarify: {desired_change:'unsure',professional_position:'pending',timing:'exploring',capacity:'unknown',payment_model:'unknown',economics:'not_started',demand_evidence:'none',operating_preference:'unknown',complexity:'unknown',preferred_route:'validate'},
  lean: {desired_change:'schedule',professional_position:'licensed_contracting',timing:'4_6',capacity:'5_8',payment_model:'cash',economics:'visible',demand_evidence:'repeat_referrals',operating_preference:'most',complexity:'simple',preferred_route:'solo'},
  hybrid: {desired_change:'clients',professional_position:'licensed_employed',timing:'4_6',capacity:'9_plus',payment_model:'hybrid',economics:'visible',demand_evidence:'transition',operating_preference:'selected',complexity:'payer',preferred_route:'payer'},
  supported: {desired_change:'asset',professional_position:'licensed_employed',timing:'7_12',capacity:'2_4',payment_model:'platform',economics:'partial',demand_evidence:'transition',operating_preference:'coordinated',complexity:'complex',preferred_route:'buy'}
};

for (const [expected, answers] of Object.entries(profiles)) assert.equal(resolveRoute(therapists, answers).routeKey, expected, `${expected} fixture did not route correctly`);
const franchiseAnswers = {...profiles.supported, preferred_route:'franchise'};
assert.equal(resolveRoute(therapists, franchiseAnswers).affirmativeOwnershipComparison, true);
assert.equal(resolveRoute(therapists, profiles.supported).affirmativeOwnershipComparison, false);
assert.ok(Object.keys(consultants.routes).length >= 2, 'Second vertical config failed');

const sourceFiles = ['campaigns/ocg-engine/index.html','campaigns/ocg-engine/app.js','campaigns/ocg-engine/route-engine.mjs','campaigns/ocg-engine/provider-adapter.mjs','campaigns/ocg-engine/styles.css'].map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
const forbidden = ['schedule a free call', 'book a free call', '45-minute session', 'guaranteed clients', 'guaranteed income', 'best entity for you', 'we certify compliance'];
for (const phrase of forbidden) assert.equal(sourceFiles.toLowerCase().includes(phrase), false, `Forbidden phrase present: ${phrase}`);
const premiumProduct = therapists.products.find(product => product.type === 'premium_paid');
assert.equal(premiumProduct?.cta, 'Purchase consulting before scheduling', 'Premium consulting must require purchase before scheduling');
assert.ok(sourceFiles.includes('No sales call is required.'), 'Standard route must not require a sales call');
assert.equal(fs.readFileSync(path.join(root, 'campaigns/ocg-engine/index.html'), 'utf8').includes('EHR, or payer'), false, 'Shared engine shell contains therapist-only copy');
assert.ok(fs.readFileSync(path.join(root, 'campaigns/ocg-engine/index.html'), 'utf8').includes('Map my path'), 'Shared CTA is not vertical-neutral');
assert.ok(sourceFiles.includes('No OFA or FranTracker record'), 'OFA separation is missing');
assert.ok(sourceFiles.includes('checkout_start'), 'Checkout event missing');
assert.ok(sourceFiles.includes('utm_source'), 'Attribution capture missing');

console.log(JSON.stringify({status:'PASS', verticals:['therapists','consultants'], therapistQuestions:10, routeFixtures:Object.keys(profiles), marketingKeywords:therapists.marketing.keywords.length, negativeKeywords:therapists.marketing.negativeKeywords.length}, null, 2));
