#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveRouteSelection } from '../assets/tentacle-routing.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const html=read('career-control/index.html');
const runtime=read('assets/tentacle-diagnostic.js');
const css=read('assets/tentacle-system.css');
const campaign=JSON.parse(read('tentacles/career-concentration.json'));
const schema=JSON.parse(read('tentacles/tentacle.schema.json'));
const failures=[];
const checks=[];
const check=(ok,label)=>{checks.push(label);if(!ok)failures.push(label)};
const has=(source,...terms)=>terms.every(term=>source.includes(term));
const visibleCopy=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ');

// Buyer-language and conversion architecture
check(has(html,'too much to lose to “just quit”','Your job pays for your life. It should not own your future.','mortgage, health insurance, family plans, and the identity','burned out','undervalued','one employer in charge'), 'hero directly names livelihood, identity, family, burnout, recognition, and employer dependence');
check(has(html,'You need a Plan B you can investigate before you need it.','Take the 2-minute check','Why OFA is different'), 'hero offers a concrete Plan B and direct conversion action');
check(has(html,'The Career Crossroads Check','See whether ownership belongs in your Plan B.','Which Plan B deserves a serious look?'), 'public diagnostic name and promise use natural buyer language');
check(has(html,'A real advisory starting point, not an anonymous quiz.','First name, mobile, email, and two quick background choices unlock your pressure points, next questions, and OFA follow-up.'), 'hero states the full contact-for-result exchange before the questions');
check(has(html,'The paycheck is real. So are the golden handcuffs.','mortgage, health insurance, family plans','company decision becomes a family emergency'), 'stakes section names the practical and emotional cost without inventing a personal diagnosis');
check(has(html,'Losing the job is not the only risk.','no attractive option except another job search','Replace one employer with another.','Build an ownership option you can accept or reject.'), 'Challenger reframe converts job-loss fear into an ownership-option comparison');
check(has(html,'You do not have to choose between another job and inventing a business from scratch.','A system to inspect, not invent','Training and support to verify','Owners you can question','The advantage is not safety.'), 'franchise possibility explains the structured middle path and its limits');
check(has(html,'You do not need another broker sending you the same list of brands.','what your next chapter has to protect','every business has to earn its place'), 'OFA differentiation leads with decision quality rather than brand inventory');
check(has(html,'Austin Olson, J.D.','Claims versus proof.','The owner job beneath the pitch.','Buyer-side perspective.','made a franchise decision himself'), 'guide section combines relevant J.D. authority with truthful buyer-side empathy');
check(has(html,'Executive / Senior Leader','Skilled Trades / Operator','First-Time Owner','Manager-Led Investor','Second Act','E-2 Business Fit'), 'six visibly different buyer situations receive targeted routes');
check(has(html,'Tell the truth about the current deal','Define what ownership has to change','Make the business prove it'), 'three-step plan moves from current state through criteria to evidence');
check(!/\bcareer control\b|\bemployment concentration\b|\binvestigation posture\b|\bNo contact first\b/i.test(visibleCopy), 'public copy excludes rejected internal abstractions and anonymous-preview language');
check(!/FTC|Federal Trade Commission|claim ledger|funnel|buyer tier|The Challenger|\bGAP\b|Cialdini|StoryBrand/i.test(visibleCopy), 'public copy keeps regulatory and persuasion-framework language backstage');

// DOM journey and conversion close
const idxStakes=html.indexOf('id="stakes"');
const idxEvidence=html.indexOf('aria-label="Workforce context"');
const idxReframe=html.indexOf('id="reframe"');
const idxOwnership=html.indexOf('id="why-ownership"');
const idxGuide=html.indexOf('id="why-ofa"');
const idxPlan=html.indexOf('id="plan"');
const idxDisclosure=html.indexOf('id="disclosure"');
const idxAction=html.indexOf('id="career-check"');
const idxForm=html.indexOf('<form id="career-control-form"');
check([idxStakes,idxEvidence,idxReframe,idxOwnership,idxGuide,idxPlan,idxDisclosure,idxAction,idxForm].every(i=>i>=0) && idxStakes<idxEvidence && idxEvidence<idxReframe && idxReframe<idxOwnership && idxOwnership<idxGuide && idxGuide<idxPlan && idxPlan<idxDisclosure && idxDisclosure<idxAction && idxAction<idxForm, 'DOM journey moves from recognition through grounding, reframe, ownership, guide, plan, disclosure, and final diagnostic action');
check(!html.slice(html.indexOf('<section class="hero">'),idxStakes).includes('<form'), 'hero offers direct value and CTA without prematurely embedding the form');
check(html.lastIndexOf('<section class="section ')<idxAction && idxAction-html.lastIndexOf('<section class="section ')<120, 'personalized assessment is the final main-page conversion section');

// Evidence grounding
check(has(html,'21%','52%','22%','Pew Research Center','Gallup','These numbers do not predict your job.'), 'approved workforce grounding remains visible and bounded');

// Diagnostic configuration
check(campaign.questions.length===7 && campaign.questions.map(q=>q.id).join('|')==='income|changes|impact|runway|control|future|timing', 'seven questions preserve the required GAP sequence');
check(has(JSON.stringify(campaign.questions),'How much of your household income disappears if this job does?','If the role changed or disappeared, what gets hit first?','What are you most tired of letting the job decide?','When do you need a real option?'), 'diagnostic questions use direct, natural stakes language');
check(Object.keys(campaign.dimensions).join('|')==='exposure|control|posture' && has(runtime,'scores = { exposure: 0, control: 0, posture: 0 }','scores[question.dimension] += value.weight'), 'exposure, desired change, and action posture remain separately scored');
const future=campaign.questions.find(q=>q.id==='future');
check(future.dimension==='posture' && campaign.questions.filter(q=>q.dimension==='exposure').every(q=>!['future','control'].includes(q.id)), 'ownership interest cannot inflate job-dependence scoring');
check(campaign.dimensions.exposure.bands.map(b=>b.label).join('|')==='not heavily dependent on one job|meaningfully dependent on one job|heavily dependent on one job', 'result bands translate internal scoring into buyer language');

// Contact gate: no personal result leakage before provider confirmation
const openCaptureStart=runtime.indexOf('const openCapture');
const prepareSubmissionStart=runtime.indexOf('const prepareSubmission');
const submitStart=runtime.indexOf("form.addEventListener('submit'");
const openCaptureBlock=runtime.slice(openCaptureStart,prepareSubmissionStart);
const beforeSubmit=runtime.slice(0,submitStart);
const afterSubmit=runtime.slice(submitStart);
check(has(openCaptureBlock,'capture.hidden = false','form.elements.first_name.focus()') && !openCaptureBlock.includes('compute()') && !openCaptureBlock.includes('[data-preview-') && !openCaptureBlock.includes('[data-route-'), 'finishing question seven reveals only the contact gate and writes no personalized result into the DOM');
check(beforeSubmit.indexOf('const prepareSubmission')>=0 && beforeSubmit.indexOf('result = compute()')>beforeSubmit.indexOf('const prepareSubmission') && afterSubmit.indexOf('const personalizedView = prepareSubmission()')>=0, 'personal scoring and route preparation begin only inside the valid contact-form submission path');
check(runtime.includes("payload.success === true || payload.success === 'true'") && runtime.includes('/activat/i.test(providerMessage)'), 'provider confirmation must be explicit and activation responses are rejected');
check(afterSubmit.indexOf('await fetch(form.action')>=0 && afterSubmit.indexOf('await fetch(form.action')<afterSubmit.indexOf('renderPersonalizedResult(personalizedView)') && afterSubmit.indexOf('renderPersonalizedResult(personalizedView)')<afterSubmit.indexOf('preview.hidden = false') && afterSubmit.indexOf('preview.hidden = false')<afterSubmit.indexOf('fullResult.hidden = false'), 'personalized DOM content and both result sections appear only after awaited provider confirmation');
check(runtime.includes('submitButton.disabled = false') && runtime.includes('Your answers and contact details are still here') && runtime.includes('austin@olsonfa.com'), 'failure recovery preserves answers, contact fields, retry, phone, and email paths');
check(has(html,'data-preview hidden','data-full-result hidden','data-capture hidden'), 'all personalized and capture states begin hidden');

// Capture value, fields, consent, and metadata
check(/name="first_name"[^>]*required/.test(html) && /name="phone"[^>]*maxlength="25"[^>]*required/.test(html) && /name="email"[^>]*required/.test(html) && has(runtime,"mobileDigits.length < 10 || mobileDigits.length > 15",'Enter a valid mobile number so OFA can contact you about your result.'), 'first name, valid mobile, and valid email are required before the personalized result');
check(has(html,'Your answers are ready','Unlock your result and next-step map.','pressure points matter most','three questions someone with your background should answer next','Show my result and next-step map'), 'capture names the immediate personalized value and exact requested response');
check(has(html,'does not enroll me in recurring promotional messages','name="contact_consent" value="yes" required','name="marketing_consent" value="yes"','Consent is not a condition of receiving my result','Reply STOP'), 'requested response and optional recurring promotional consent are separate and explicit');
check(!/name="marketing_consent"[^>]*required/.test(html), 'promotional consent is optional');
check(has(html,'Privacy Policy','franchisor may compensate OFA','do not pay OFA a separate brokerage fee'), 'privacy and commercial relationship are adjacent to the commitment');
check(has(html,'name="record_class" value="FIRST_PARTY_OPTIN"','name="entry_route" value="recognition_optin"','name="entry_door" value="employment_concentration_risk"','name="doorway" value="employment_concentration_risk"','name="source" value="owned_site"','name="requested_next_step" value="personalized_diagnostic"','name="buyer_context_self_reported"','name="route_candidate"','name="route_artifact"'), 'canonical first-party and routed-result metadata are present');
check(has(html,'name="captured_at"','name="requested_response_consent_at"','name="marketing_consent_at"') && has(runtime,'new Date().toISOString()','requested_response_consent_at.value = capturedAt','marketing_consent_at.value = form.elements.marketing_consent.checked'), 'capture and separate consent timestamps are recorded at submission');
check(campaign.campaignId==='employment_concentration_risk_2026q3' && html.includes('name="campaign_id" value="employment_concentration_risk_2026q3"'), 'page and configuration share the validated campaign ID');
check(has(html,'name="operating_context"','name="e2_business_intent" value="yes"','name="prior_franchise_research"','value="stopped_or_rejected"') && !/<option value="e2_business_intent">/.test(html), 'E-2 intent remains voluntary and separate from operating background');
check(has(html,'action="https://formsubmit.co/ajax/admin@olsoncg.com"','name="_next" value="https://olsonfa.com/thankyou.html"','name="_captcha" value="false"'), 'form uses the monitored endpoint and stable fallback configuration');
check(['utm_source','utm_medium','utm_campaign','utm_content','utm_term','referrer','landing_url'].every(name=>html.includes(`name="${name}"`)) && has(runtime,'window.location.search','document.referrer','window.location.href'), 'UTM, referrer, and landing metadata are preserved');

// Canonical route behavior
const expectedRoutes={executive_leader:['EXECUTIVE_OWNERSHIP_STRATEGY','Executive Ownership Decision Brief','Executive Ownership Strategy Review'],skilled_trades_operator:['SKILLED_TRADES_OPERATOR_TO_OWNER','Operator-to-Owner Role Map','Operator-to-Owner Fit Review'],portfolio_investor:['PORTFOLIO_GOVERNANCE_DILIGENCE','Manager-Led Diligence Brief','Manager-Led Franchise Diligence Review'],first_time_owner:['FIRST_TIME_OWNER_EDUCATION','Start/Buy/Franchise and Owner-Role Brief','First Ownership Model Review'],second_act_flexible_role:['SECOND_ACT_ROLE_DESIGN','Second-Act Owner Role Map','Second-Act Ownership Design Review'],general_or_unknown:['GENERAL_GAP_DIAGNOSTIC','Franchise Evaluation Sequence','Franchise Decision Review'],e2_business_intent:['E2_BUSINESS_FIT','E-2 Business Decision Map','E-2 Franchise Business-Fit Review']};
for(const [key,[routeKey,artifact,cta]] of Object.entries(expectedRoutes)){const route=campaign.routes[key];check(route && route.routeKey===routeKey && route.artifact===artifact && route.cta.includes(cta) && route.criteria.length===3 && route.contradiction,`${key} preserves its canonical route, artifact, CTA, criteria, and contradiction`)}
const executiveE2=resolveRouteSelection(campaign,'executive_leader',true);
check(executiveE2.routeKey==='E2_BUSINESS_FIT' && executiveE2.buyerContextSelfReported==='executive_leader' && executiveE2.secondaryBuyerContext==='executive_leader' && executiveE2.routeOverrideApplied==='yes', 'voluntary executive plus E-2 selection preserves context and makes business fit primary');
check(campaign.routes.e2_business_intent.boundary.includes('Business-fit only') && has(html,'name="e2_business_intent_self_reported"','name="route_override_applied"','name="route_override_reason"','name="secondary_buyer_context"'), 'E-2 override metadata and business-fit boundary remain present');
check(campaign.routes.general_or_unknown.lowConfidence===true && resolveRouteSelection(campaign,'',false).routeConfigKey==='general_or_unknown', 'unknown background maps to the neutral low-confidence route');
check(JSON.stringify(campaign.tierMap)==='{"no":"Tier 3","stopped_or_rejected":"Tier 2","active":"Tier 1","unknown":"Unknown"}', 'self-reported research-stage mapping remains exact');
check(!/market.?signal|intent.?signal|lead.?score|conversion.?score/i.test(runtime+JSON.stringify(campaign)), 'runtime does not infer buyer tier or market intent');
check(has(runtime,"result.answerValues.control[0] === 'none'",'You did not identify one job-controlled factor you need to change.','toSecondPerson(result.answers.control[0])','Use evidence to revise either answer'), 'self-authored desired change and future path echo naturally, including the none-of-these branch');

// Result quality and boundaries
check(has(html,'<strong>Proceed</strong>','<strong>Investigate further</strong>','<strong>Not yet</strong>','<strong>No</strong>'), 'personalized result preserves all four candidate-owned conclusions');
check(has(runtime,"result.topDrivers.length === 1 ? 'Your strongest pressure point is '",'Your answers did not surface one dominant pressure point.',"result.answerValues.impact[0] === 'manageable'",'immediate practical impact would be manageable','Your starting point:','Research so far: Just starting or not yet researching franchises.') && !/Primary route:|Self-reported research stage:/.test(runtime), 'result handles singular, no-driver, manageable-impact, route, and research-stage language naturally');
check(has(html,'Your next conversation','OFA has your result and will follow up using the contact details you provided.') && !html.includes('data-route-cta href=') && !runtime.includes('nextStep.href'), 'post-result state confirms OFA follow-up without asking for a redundant email request');
check(has(html,'starting map, not a financial, legal, tax, or immigration conclusion','Staying, changing employers, building another income stream, starting, buying, and franchising'), 'result boundary preserves non-franchise alternatives');
check(!/CRM receipt|production router|automated email/i.test(html+runtime), 'page makes no unsupported CRM, production-router, or automated-email claim');
check(!/localStorage|sessionStorage/.test(runtime), 'runtime uses no local or session storage');
check(schema.required.includes('dimensions') && schema.required.includes('routes') && schema.$defs.resultRoute.required.includes('routeKey') && schema.$defs.resultRoute.properties.criteria.maxItems===3, 'schema preserves canonical routed multidimensional configuration');

// Visual and claim controls
check(has(css,'.possibility-grid','.audience-grid','.outcome-grid','.field select{display:block;width:100%;max-width:100%',':focus-visible','prefers-reduced-motion'), 'new persuasion sections and form states retain responsive and keyboard-accessible styling');
check(css.includes('@media(max-width:900px)') && css.includes('@media(max-width:560px)') && css.includes('.footer-row>span+span{margin-top:10px}'), 'desktop, tablet, mobile, and footer layouts remain covered');
check(!/timing is still yours|decides the timing for you|before the timing is decided for you|Do not wait for a forced decision|limited spots|act now/i.test(html+runtime), 'synthetic scarcity and forced-timing pressure are absent');
const banned=[/immune to the economy/i,/recession-proof/i,/AI-proof/i,/guaranteed (?:income|security|success|control|wealth)/i,/ownership is safer than employment/i,/no commission from franchisors/i,/attorney-level expertise/i,/reviewed hundreds of franchise disclosure/i];
for(const pattern of banned) check(!pattern.test(html),`banned claim absent: ${pattern}`);

if(failures.length){console.error(`CAREER CROSSROADS AUDIT FAILED: ${failures.length}/${checks.length}`);failures.forEach(f=>console.error(`- ${f}`));process.exit(1)}
console.log(`CAREER CROSSROADS AUDIT PASSED: ${checks.length} checks`);
