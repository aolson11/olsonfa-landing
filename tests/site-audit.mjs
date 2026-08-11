#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const checks = [];
const check = (condition, label) => { checks.push(label); if (!condition) failures.push(label); };
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);

const assessment = read('assessment.html');
const intake = read('intake-form.html');
const index = read('index.html');
const guide = read('guide.html');
const e2 = read('e2/index.html');
const sitemap = read('sitemap.xml');
const formSuccess = JSON.parse(read('tests/form-success.json'));
const formFailure = JSON.parse(read('tests/form-failure.json'));
const formActivation = JSON.parse(read('tests/form-activation.json'));
const providerConfirmed = payload => Boolean(
  payload &&
  (payload.success === true || payload.success === 'true') &&
  !/activat/i.test(String(payload.message || ''))
);
check(providerConfirmed(formSuccess), 'FormSubmit fixture: explicit success is accepted');
check(!providerConfirmed(formFailure), 'FormSubmit fixture: explicit failure is rejected');
check(!providerConfirmed(formActivation), 'FormSubmit fixture: activation response is rejected');
check(!providerConfirmed({}), 'FormSubmit fixture: ambiguous empty response is rejected');

for (const [name, html, formId] of [
  ['assessment', assessment, 'assessment-form'],
  ['intake', intake, 'franchise-fit-form']
]) {
  const marker = `document.getElementById('${formId}').addEventListener('submit'`;
  const start = html.indexOf(marker);
  const handler = start >= 0 ? html.slice(start, html.indexOf('// Initialize', start) >= 0 ? html.indexOf('// Initialize', start) : html.indexOf('</script>', start)) : '';
  check(start >= 0, `${name}: submit handler exists`);
  check(handler.includes('async function'), `${name}: handler is async`);
  check(handler.includes('await fetch'), `${name}: submission awaits FormSubmit`);
  check(html.includes(`id="${formId}" action="https://formsubmit.co/ajax/admin@olsoncg.com"`), `${name}: async form uses FormSubmit AJAX endpoint`);
  check(handler.includes('body: JSON.stringify(formPayload)'), `${name}: AJAX request sends documented JSON payload`);
  check(handler.includes("'Content-Type': 'application/json'"), `${name}: AJAX content type is JSON`);
  check(handler.includes('response.ok'), `${name}: response status is checked`);
  check(handler.includes("payload.success === true || payload.success === 'true'"), `${name}: provider success must be explicit`);
  check(handler.includes('catch(() => null)'), `${name}: malformed JSON cannot default to success`);
  check(handler.includes('/activat/i.test(providerMessage)'), `${name}: activation response is rejected`);
  check(handler.indexOf('await fetch') >= 0 && handler.indexOf('await fetch') < handler.indexOf("success-message"), `${name}: success UI follows awaited submission`);
  check(handler.includes('submitButton.disabled = false'), `${name}: failure re-enables submit`);
  check(handler.includes('form-status active error'), `${name}: visible failure status exists`);
}

check(intake.includes('name="_template" value="table"'), 'intake: FormSubmit template field is valid');
check(!intake.includes('name="_template" table'), 'intake: malformed template field is absent');
check(assessment.includes('name="contact_consent" value="yes" required'), 'assessment: contact consent is required');
check(intake.includes('name="contact_consent" value="yes" required'), 'intake: contact consent is required');
check(index.includes('name="Guide_Request_Consent" value="yes" required'), 'home guide: request consent is required');
check(index.includes('name="Marketing_Consent" value="yes"'), 'home guide: marketing opt-in is separate');
check(index.includes('name="Contact_Consent" value="yes" required'), 'home contact: contact consent is required');
check(guide.includes('name="Guide_Request_Consent" value="yes" required'), 'guide page: request consent is required');
check(guide.includes('name="Marketing_Consent" value="yes"'), 'guide page: marketing opt-in is separate');

const budgetOptions = [...intake.matchAll(/name="investment_budget" value="([^"]+)"[^>]*>[\s\S]{0,120}?<span>([^<]+)<\/span>/g)]
  .map(match => [match[1], match[2].trim()]);
const expectedBudgets = new Map([
  ['under-30k', 'Under $30K'],
  ['30k-100k', '$30K to $100K'],
  ['100k-250k', '$100K to $250K'],
  ['250k-500k', '$250K to $500K'],
  ['500k-plus', '$500K+'],
  ['undecided', 'Not sure yet']
]);
check(budgetOptions.length === expectedBudgets.size, 'intake: all six budget options are present');
check(new Set(budgetOptions.map(([value]) => value)).size === budgetOptions.length, 'intake: budget values are unique');
check(budgetOptions.every(([value,label]) => expectedBudgets.get(value) === label), 'intake: budget values match their visible labels');

const htmlFiles = walk(ROOT).filter(f => f.endsWith('.html'));
const allHtml = htmlFiles.map(f => fs.readFileSync(f,'utf8')).join('\n');
const formMatches = [...allHtml.matchAll(/<form\b[^>]*action="https:\/\/formsubmit\.co\/(?:ajax\/)?([^"]+)"[^>]*>[\s\S]*?<\/form>/gi)];
check(formMatches.length === 5, `site: exactly five FormSubmit forms found (found ${formMatches.length})`);
const formOrigins = [];
const formSubjects = [];
for (const [i,match] of formMatches.entries()) {
  check(match[1] === 'admin@olsoncg.com', `form ${i+1}: recipient is the monitored owner-controlled work inbox`);
  const origin = match[0].match(/name="form_origin" value="([^"]+)"/);
  const subject = match[0].match(/name="_subject" value="([^"]+)"/);
  const next = match[0].match(/name="_next" value="([^"]+)"/);
  check(Boolean(origin), `form ${i+1}: stable form_origin is present`);
  check(Boolean(subject), `form ${i+1}: subject is present`);
  check(Boolean(next), `form ${i+1}: redirect destination is present`);
  check(Boolean(next) && new URL(next[1]).protocol === 'https:' && new URL(next[1]).hostname === 'olsonfa.com', `form ${i+1}: redirect stays on HTTPS olsonfa.com`);
  if (origin) formOrigins.push(origin[1]);
  if (subject) formSubjects.push(subject[1]);
  check(/name="_captcha" value="false"/.test(match[0]), `form ${i+1}: captcha setting is explicit`);
  check(/name="_template" value="table"/.test(match[0]), `form ${i+1}: table template is valid`);
  check(/name="(?:Guide_Request_Consent|Contact_Consent|contact_consent)"[^>]*required/.test(match[0]), `form ${i+1}: transactional contact consent is required`);
}
check(new Set(formOrigins).size === 5, 'site: all five FormSubmit forms have unique origins');
check(new Set(formSubjects).size === 5, 'site: all five FormSubmit forms have unique subjects');
check((allHtml.match(/action="https:\/\/formsubmit\.co\/ajax\/admin@olsoncg\.com"/g) || []).length === 2, 'site: exactly two async forms use the documented AJAX endpoint');
check(!allHtml.includes('href="#"'), 'site: placeholder hash-only links are absent');
check(!allHtml.includes('content="width=device-width, 1.0"'), 'site: malformed responsive viewport is absent');
check(!allHtml.includes('austin@olsoncg.com'), 'site: retired unmonitored public email is absent');
check(allHtml.includes('austin@olsonfa.com'), 'site: monitored branded public email is present');
check(!allHtml.includes('We do not share, store, or have access to the data transmitted through this service.'), 'privacy: owner access to received submissions is not denied');

const banned = [
  /fastest path to a US green card/i,
  /attorney-level expertise/i,
  /753 franchises vetted/i,
  /from "I'm interested" to "visa approved"/i,
  /no commission from franchisors/i,
  /reviewed hundreds of franchise disclosure/i,
  /helped dozens of professionals/i,
  /after working with hundreds of people/i,
  /ahead of 90%/i,
  /750\+ concept/i,
  /waste \$100K/i
];
for (const pattern of banned) check(!pattern.test(allHtml), `claims: prohibited pattern absent: ${pattern}`);
check(/does not determine E-2 eligibility/i.test(e2), 'E-2 page: scope boundary is explicit');
check(/independently retained, qualified immigration attorney/i.test(e2), 'E-2 page: independent counsel is required');
check(!/href="#" class="btn-primary"/.test(e2), 'E-2 page: primary CTA has a real destination');
for (const route of ['/how-it-works','/right-for-me','/categories','/funding','/guide','/assessment','/e2','/blog/','/privacy']) {
  check(sitemap.includes(`<loc>https://olsonfa.com${route}</loc>`), `sitemap: ${route} is listed`);
}

const missingLocalRefs = [];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file,'utf8');
  const opens = (html.match(/<form\b/gi)||[]).length;
  const closes = (html.match(/<\/form>/gi)||[]).length;
  check(opens === closes, `${path.relative(ROOT,file)}: form tags balance (${opens}/${closes})`);

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/gi)) {
    const raw = match[1];
    if (!raw) continue;
    if (raw.startsWith('#')) {
      const fragment = raw.slice(1);
      const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!fragment || !new RegExp(`(?:id|name)=["']${escaped}["']`, 'i').test(html)) {
        missingLocalRefs.push(`${path.relative(ROOT,file)} -> ${raw}`);
      }
      continue;
    }
    if (/^(?:https?:\/\/|mailto:|tel:|data:|javascript:)/i.test(raw)) continue;
    const cleanRef = raw.split(/[?#]/, 1)[0];
    if (!cleanRef) continue;
    const target = cleanRef.startsWith('/')
      ? path.join(ROOT, cleanRef.slice(1))
      : path.resolve(path.dirname(file), cleanRef);
    const candidates = [target];
    if (target === ROOT) candidates.push(path.join(ROOT, 'index.html'));
    else if (!path.extname(target)) candidates.push(`${target}.html`, path.join(target, 'index.html'));
    if (!candidates.some(candidate => fs.existsSync(candidate))) {
      missingLocalRefs.push(`${path.relative(ROOT,file)} -> ${raw}`);
    }
  }
}
check(missingLocalRefs.length === 0, `site: local links and assets resolve${missingLocalRefs.length ? ` (${missingLocalRefs.join(', ')})` : ''}`);

if (failures.length) {
  console.error(`SITE AUDIT FAILED: ${failures.length}/${checks.length}`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`SITE AUDIT PASSED: ${checks.length} checks across ${htmlFiles.length} HTML files`);
