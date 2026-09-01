#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveRouteSelection } from '../assets/tentacle-routing.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const html=read('career-control/index.html'); const runtime=read('assets/tentacle-diagnostic.js'); const css=read('assets/tentacle-system.css');
const campaign=JSON.parse(read('tentacles/career-concentration.json')); const schema=JSON.parse(read('tentacles/tentacle.schema.json'));
const failures=[]; const checks=[]; const check=(ok,label)=>{checks.push(label);if(!ok)failures.push(label)}; const has=(source,...terms)=>terms.every(term=>source.includes(term));

check(html.indexOf('The meeting can be fifteen minutes.') < html.indexOf('<p class="eyebrow">Career Concentration Check</p>'), 'recognizable hero scene precedes diagnostic abstraction');
check(html.includes('<h2>Is it time to take control of your life?</h2>'), 'exact diagnostic header is present');
check(has(html,'Stop letting one employer decide what happens to your entire future.','You do not have to feel fearless. You have to decide whether fear gets to make the decision without evidence.'), 'hero promise and call to adventure are present');
check(campaign.questions.length===7 && campaign.questions.map(q=>q.id).join('|')==='income|changes|impact|runway|control|future|timing','seven questions follow required GAP order');
check(Object.keys(campaign.dimensions).join('|')==='exposure|control|posture' && has(runtime,'scores = { exposure: 0, control: 0, posture: 0 }','scores[question.dimension] += value.weight'), 'three score dimensions remain separate');
const future=campaign.questions.find(q=>q.id==='future');
check(future.dimension==='posture' && campaign.questions.filter(q=>q.dimension==='exposure').every(q=>!['future','control'].includes(q.id)), 'ownership interest is excluded from exposure scoring');
check(has(html,'name="record_class" value="FIRST_PARTY_OPTIN"','name="entry_route" value="recognition_optin"','name="doorway" value="employment_concentration_risk"','name="buyer_context_self_reported"','name="route_candidate"','name="route_artifact"','name="noncustomer_tier_self_reported"','name="requested_next_step" value="personalized_diagnostic"'), 'canonical first-party metadata is present');
check(has(html,'name="operating_context"','name="e2_business_intent" value="yes"','name="prior_franchise_research"','value="stopped_or_rejected"') && !/<option value="e2_business_intent">/.test(html), 'E-2 intent is voluntary and separate from canonical operating context');
const expectedRoutes={executive_leader:['EXECUTIVE_OWNERSHIP_STRATEGY','Executive Ownership Decision Brief','Executive Ownership Strategy Review'],skilled_trades_operator:['SKILLED_TRADES_OPERATOR_TO_OWNER','Operator-to-Owner Role Map','Operator-to-Owner Fit Review'],portfolio_investor:['PORTFOLIO_GOVERNANCE_DILIGENCE','Manager-Led Diligence Brief','Manager-Led Franchise Diligence Review'],first_time_owner:['FIRST_TIME_OWNER_EDUCATION','Start/Buy/Franchise and Owner-Role Brief','First Ownership Model Review'],second_act_flexible_role:['SECOND_ACT_ROLE_DESIGN','Second-Act Owner Role Map','Second-Act Ownership Design Review'],general_or_unknown:['GENERAL_GAP_DIAGNOSTIC','Franchise Evaluation Sequence','Franchise Decision Review'],e2_business_intent:['E2_BUSINESS_FIT','E-2 Business Decision Map','E-2 Franchise Business-Fit Review']};
for(const [key,[routeKey,artifact,cta]] of Object.entries(expectedRoutes)){const route=campaign.routes[key];check(route&&route.routeKey===routeKey&&route.artifact===artifact&&route.cta.includes(cta)&&route.criteria.length===3&&route.contradiction,`${key} has exact canonical routeKey, distinct artifact, CTA, criteria, and contradiction`)}
const executiveE2=resolveRouteSelection(campaign,'executive_leader',true);
check(executiveE2.routeKey==='E2_BUSINESS_FIT'&&executiveE2.buyerContextSelfReported==='executive_leader'&&executiveE2.secondaryBuyerContext==='executive_leader'&&executiveE2.routeOverrideApplied==='yes','simulated executive + E-2 case preserves context and makes E2_BUSINESS_FIT primary');
check(campaign.routes.e2_business_intent.boundary.includes('Business-fit only') && has(html,'name="e2_business_intent_self_reported"','name="route_override_applied"','name="route_override_reason"','name="secondary_buyer_context"') && runtime.includes('Primary route: E-2 business fit.'), 'E-2 override metadata, boundary, and explicit result context are present');
check(campaign.routes.general_or_unknown.lowConfidence===true && /not yet specific enough|neutral sequence/.test(campaign.routes.general_or_unknown.interpretation) && resolveRouteSelection(campaign,'',false).routeConfigKey==='general_or_unknown', 'unknown context maps to neutral low-confidence route');
check(JSON.stringify(campaign.tierMap)==='{"no":"Tier 3","stopped_or_rejected":"Tier 2","active":"Tier 1","unknown":"Unknown"}', 'self-reported noncustomer tier mapping is exact');
check(!/market.?signal|intent.?signal|lead.?score|conversion.?score/i.test(runtime+JSON.stringify(campaign)), 'no market-signal conversion or inferred tier logic');
check(runtime.includes("payload.success === true || payload.success === 'true'") && runtime.indexOf('await fetch(form.action') < runtime.indexOf('fullResult.hidden = false') && runtime.includes('/activat/i.test(providerMessage)'), 'route result requires explicit submission confirmation');
check(runtime.includes('submitButton.disabled = false')&&runtime.includes('Your preview and answers are still here')&&runtime.includes('austin@olsonfa.com'),'failure recovery preserves answers and contact alternatives');
check(html.match(/Educational only/g)?.length===1 && !/not a prediction/g.test(html.replace('Educational only; this diagnostic is not a prediction','')), 'one concise educational/no-guarantee boundary is used');
check(has(html,'Your current pattern: <span data-preview-band>','Two self-reported drivers','data-preview-reflection') && !runtime.includes('compare options on your timing'), 'preview heading and reflection use natural grammar');
check(has(html,'Choose whether to continue the investigation.','Continue My Investigation','begins a real response','after your submission is confirmed'), 'capture explains the requested response in candidate language');
check(has(html,'does not enroll me in recurring promotional messages','Reply STOP','name="marketing_consent"') && !html.includes('I truthfully request'), 'requested-response and separate marketing consent are natural and explicit');
const visibleCopy=html.replace(/<[^>]+>/g,' ');
check(!/The Challenger reframe|gated|FormSubmit/i.test(visibleCopy) && !/\bGAP\b/.test(visibleCopy), 'public copy contains no internal framework or implementation jargon');
check(css.includes('.field select{display:block;width:100%;max-width:100%')&&css.includes('.field select:focus-visible'), 'selects match inputs and preserve visible keyboard focus');
check(has(runtime,'desiredControl','desiredFuture','Use evidence to revise either answer'), 'self-authored control and future answers echo into result and remain revisable');
check(has(html,'<strong>Proceed</strong>','<strong>Investigate further</strong>','<strong>Not yet</strong>','<strong>No</strong>'), 'every result preserves all four candidate-owned conclusions');
check(['utm_source','utm_medium','utm_campaign','utm_content','utm_term','referrer','landing_url'].every(name=>html.includes(`name="${name}"`)) && has(runtime,'window.location.search','document.referrer','window.location.href'), 'UTM, referrer, and landing metadata are preserved');
check(!/localStorage|sessionStorage/.test(runtime), 'runtime uses no local or session storage');
check(!/CRM receipt|production router|automated email/i.test(html+runtime), 'no unsupported CRM, router, or email confirmation claim');
check(schema.required.includes('dimensions')&&schema.required.includes('routes')&&schema.$defs.resultRoute.required.includes('routeKey')&&schema.$defs.resultRoute.properties.criteria.maxItems===3,'schema validates canonical routed multi-dimensional configuration');
check(html.includes('Austin Olson, J.D.')&&has(html,'buyer side','career that stopped fitting','may be compensated by a franchisor','independent legal, tax, and financial advisors'),'guide authority, unity, process, and compensation are bounded and transparent');
check(has(html,'Do not wait for a forced decision to discover your options.','Start while every answer, including stay, not yet, and no, is still yours.'),'final CTA preserves agency');
check(css.includes('@media(max-width:900px)')&&css.includes('@media(max-width:560px)')&&css.includes('prefers-reduced-motion')&&css.includes(':focus-visible'),'responsive and accessibility CSS remains');
const banned=[/immune to the economy/i,/recession-proof/i,/AI-proof/i,/guaranteed (?:income|security|success|control|wealth)/i,/ownership is safer than employment/i,/limited spots/i,/act now/i]; for(const pattern of banned)check(!pattern.test(html),`banned claim absent: ${pattern}`);
if(failures.length){console.error(`CAREER CONTROL AUDIT FAILED: ${failures.length}/${checks.length}`);failures.forEach(f=>console.error(`- ${f}`));process.exit(1)}
console.log(`CAREER CONTROL AUDIT PASSED: ${checks.length} checks`);
