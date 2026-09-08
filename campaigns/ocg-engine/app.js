import { validateConfig, resolveRoute } from './route-engine.mjs';
import { createProviderAdapter } from './provider-adapter.mjs';

const params = new URLSearchParams(window.location.search);
const safeId = value => /^[a-z0-9_-]+$/i.test(value || '') ? value : '';
const verticalId = safeId(params.get('vertical')) || 'therapists';
const variantId = safeId(params.get('variant')) || 'control';
const debugEnabled = params.get('debug') === '1';
const root = document.querySelector('[data-app]');
const eventKey = 'ocg_engine_events_v1';

function readEvents() {
  try { return JSON.parse(localStorage.getItem(eventKey) || '[]'); } catch { return []; }
}

function record(eventName, detail = {}) {
  const events = readEvents();
  events.push({
    eventName,
    verticalId,
    variantId,
    at: new Date().toISOString(),
    source: params.get('utm_source') || 'direct',
    medium: params.get('utm_medium') || '',
    campaign: params.get('utm_campaign') || '',
    content: params.get('utm_content') || '',
    term: params.get('utm_term') || '',
    ...detail
  });
  localStorage.setItem(eventKey, JSON.stringify(events.slice(-200)));
  renderDebugEvents();
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderDebugEvents() {
  const target = document.querySelector('[data-events]');
  if (target) target.textContent = JSON.stringify(readEvents().slice(-12), null, 2);
}

async function loadConfig() {
  const response = await fetch(`./verticals/${verticalId}.json`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Unable to load vertical: ${verticalId}`);
  const config = await response.json();
  validateConfig(config);
  return config;
}

function renderProducts(config, result, provider) {
  const host = document.querySelector('[data-products]');
  const status = document.querySelector('[data-product-status]');
  host.replaceChildren();
  config.products.filter(product => product.id !== 'free_route').forEach(product => {
    const card = el('article', 'product-card');
    card.append(el('h3', '', product.name));
    const price = product.price === null ? 'Price set before launch' : `$${product.price}`;
    card.append(el('p', 'product-price', price));
    const button = el('button', 'button secondary', product.cta);
    button.type = 'button';
    if (product.type === 'provider_dependent') button.disabled = true;
    button.addEventListener('click', async () => {
      if (product.type === 'standard') {
        record('checkout_start', { productId: product.id, price: product.price, routeKey: result.routeKey });
        status.className = 'form-status';
        status.textContent = 'Checkout adapter is intentionally disabled in this local prototype.';
      } else if (product.type === 'premium_paid') {
        record('premium_checkout_start', { productId: product.id, routeKey: result.routeKey });
        status.className = 'form-status';
        status.textContent = 'A paid consulting receipt would unlock scheduling. No calendar is available before payment.';
      } else {
        const quote = await provider.quote({ verticalId, routeKey: result.routeKey });
        status.textContent = quote.message;
      }
    });
    card.append(button);
    host.append(card);
  });
}

function showResult(config, result, provider) {
  document.querySelector('[data-capture]').hidden = true;
  const resultNode = document.querySelector('[data-result]');
  resultNode.hidden = false;
  document.querySelector('[data-result-title]').textContent = result.route.title;
  document.querySelector('[data-result-summary]').textContent = result.route.summary;
  document.querySelector('[data-result-tradeoff]').textContent = result.route.tradeoff;
  document.querySelector('[data-result-boundary]').textContent = result.route.nonConclusions;
  document.querySelector('[data-result-artifact]').textContent = result.route.artifact;
  const actions = document.querySelector('[data-result-actions]');
  actions.replaceChildren(...result.route.nextActions.map(action => el('li', '', action)));
  const ownership = document.querySelector('[data-ownership-option]');
  ownership.hidden = !result.affirmativeOwnershipComparison;
  if (!ownership.hidden) {
    const checkbox = ownership.querySelector('[data-ownership-request]');
    checkbox.addEventListener('change', () => record('ownership_comparison_affirmation', { affirmed: checkbox.checked, routeKey: result.routeKey }));
  }
  renderProducts(config, result, provider);
  record('result_view', { routeKey: result.routeKey, scores: result.scores, ownershipOptionShown: result.affirmativeOwnershipComparison });
  resultNode.focus();
}

function renderQuestions(config, provider) {
  const host = document.querySelector('[data-question-host]');
  const form = document.querySelector('[data-diagnostic-form]');
  const progress = document.querySelector('[data-progress]');
  const percent = document.querySelector('[data-progress-percent]');
  const bar = document.querySelector('[data-progress-bar]');
  let index = 0;
  let pendingResult = null;
  const answers = {};

  function showQuestion() {
    const question = config.diagnostic.questions[index];
    host.replaceChildren();
    const fieldset = el('fieldset', 'question-card');
    fieldset.append(el('legend', '', question.legend));
    const list = el('div', 'answer-list');
    question.options.forEach(option => {
      const label = el('label', 'answer');
      const input = document.createElement('input');
      input.type = 'radio'; input.name = question.id; input.value = option.value;
      if (answers[question.id] === option.value) input.checked = true;
      label.append(input, el('span', '', option.label));
      list.append(label);
    });
    fieldset.append(list);
    const error = el('p', 'question-error'); error.setAttribute('aria-live', 'polite');
    fieldset.append(error);
    const actions = el('div', 'question-actions');
    const back = el('button', 'text-button', 'Back'); back.type = 'button'; back.hidden = index === 0;
    const next = el('button', 'button primary', index === config.diagnostic.questions.length - 1 ? 'Prepare my result' : 'Continue'); next.type = 'button';
    back.addEventListener('click', () => { index -= 1; showQuestion(); });
    next.addEventListener('click', () => {
      const selected = fieldset.querySelector('input:checked');
      if (!selected) { error.textContent = 'Choose the answer that comes closest.'; return; }
      answers[question.id] = selected.value;
      record('diagnostic_answer', { questionId: question.id, answerValue: selected.value });
      if (index < config.diagnostic.questions.length - 1) { index += 1; showQuestion(); return; }
      pendingResult = resolveRoute(config, answers);
      host.hidden = true;
      document.querySelector('[data-capture]').hidden = false;
      progress.textContent = 'Questions complete'; percent.textContent = '100%'; bar.style.width = '100%';
      document.querySelector('[name=email]').focus();
      record('diagnostic_complete', { routeKey: pendingResult.routeKey });
    });
    actions.append(back, next); fieldset.append(actions); host.append(fieldset);
    const complete = Math.round((index / config.diagnostic.questions.length) * 100);
    progress.textContent = `Question ${index + 1} of ${config.diagnostic.questions.length}`;
    percent.textContent = `${complete}%`; bar.style.width = `${complete}%`;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const status = document.querySelector('[data-status]');
    const email = form.elements.email.value.trim();
    if (!form.elements.email.checkValidity() || !form.elements.requested_result.checked) {
      status.className = 'form-status error'; status.textContent = 'Enter a valid email and request the result.'; return;
    }
    status.textContent = '';
    record('result_capture_complete', { emailDomainPresent: email.includes('@') });
    showResult(config, pendingResult, provider);
  });

  showQuestion();
}

function renderDebug(config) {
  const panel = document.querySelector('[data-debug]');
  panel.hidden = !debugEnabled;
  if (!debugEnabled) return;
  document.querySelector('[data-keywords]').replaceChildren(...config.marketing.keywords.map(item => el('li', '', item)));
  document.querySelector('[data-negatives]').replaceChildren(...config.marketing.negativeKeywords.map(item => el('li', '', item)));
  document.querySelector('[data-cac]').textContent = JSON.stringify(config.marketing.maxCac, null, 2);
  renderDebugEvents();
}

try {
  const config = await loadConfig();
  const variant = config.variants[variantId] || config.variants.control || Object.values(config.variants)[0];
  document.title = `${variant.eyebrow} | ${config.brand}`;
  document.querySelector('[data-eyebrow]').textContent = variant.eyebrow;
  document.querySelector('[data-headline]').textContent = variant.headline;
  document.querySelector('[data-subhead]').textContent = variant.subhead;
  document.querySelector('[data-eligibility]').textContent = config.eligibility;
  document.querySelector('[data-diagnostic-title]').textContent = config.diagnostic.title;
  document.querySelector('[data-diagnostic-intro]').textContent = config.diagnostic.intro;
  document.querySelector('[data-disclaimer]').textContent = `${config.boundaries.disclaimer} ${config.boundaries.ofaRule}`;
  const provider = createProviderAdapter(config.provider);
  renderQuestions(config, provider);
  renderDebug(config);
  record('landing_view');
} catch (error) {
  root.innerHTML = `<p class="form-status error">The local prototype could not load: ${String(error.message || error)}</p>`;
}
