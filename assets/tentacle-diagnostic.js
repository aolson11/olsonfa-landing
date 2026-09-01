import { resolveRouteSelection } from './tentacle-routing.mjs';

(async function () {
  'use strict';
  const root = document.querySelector('[data-tentacle-config-url]');
  if (!root) return;

  const response = await fetch(root.dataset.tentacleConfigUrl, { headers: { Accept: 'application/json' } });
  if (!response.ok) return;
  const config = await response.json();
  const form = document.getElementById(config.formId);
  const questionHost = root.querySelector('[data-questions]');
  const progress = root.querySelector('[data-progress]');
  const preview = root.querySelector('[data-preview]');
  const capture = root.querySelector('[data-capture]');
  const fullResult = root.querySelector('[data-full-result]');
  const formStatus = root.querySelector('[data-form-status]');
  let step = 0;
  let result = null;

  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const fieldValue = name => form.elements[name]?.value || '';
  const bandFor = (dimension, score) => [...config.dimensions[dimension].bands].reverse().find(band => score >= band.min);

  questionHost.innerHTML = config.questions.map((question, index) => `<fieldset class="diagnostic-step" data-step="${index}"${index ? ' hidden' : ''}><legend><span>0${index + 1}</span>${escape(question.legend)}</legend>${question.help ? `<p class="question-help">${escape(question.help)}</p>` : ''}<div class="answer-grid">${question.options.map(option => `<label class="answer"><input type="${question.multi ? 'checkbox' : 'radio'}" name="diagnostic_${escape(question.id)}${question.multi ? '[]' : ''}" value="${escape(option.value)}" ${question.multi ? '' : 'required'}><span>${escape(option.label)}</span></label>`).join('')}</div><p class="question-error" aria-live="polite"></p><div class="step-actions">${index ? '<button type="button" class="text-button" data-back>Back</button>' : '<span></span>'}<button type="button" class="button button-gold" data-next>${index === config.questions.length - 1 ? 'See my preview' : 'Continue'}</button></div></fieldset>`).join('');

  const steps = [...questionHost.querySelectorAll('[data-step]')];
  const showStep = next => { step = next; steps.forEach((element, index) => { element.hidden = index !== step; }); progress.textContent = `Question ${step + 1} of ${config.questions.length}`; };
  const selected = (question, index) => [...steps[index].querySelectorAll('input:checked')].map(input => question.options.find(option => option.value === input.value));
  const validate = index => { const values = selected(config.questions[index], index); steps[index].querySelector('.question-error').textContent = values.length ? '' : 'Choose the answer that comes closest.'; return values.length > 0; };

  const compute = () => {
    const scores = { exposure: 0, control: 0, posture: 0 };
    const drivers = [];
    const answers = {};
    const answerValues = {};
    config.questions.forEach((question, index) => {
      const values = selected(question, index);
      answers[question.id] = values.map(value => value.label);
      answerValues[question.id] = values.map(value => value.value);
      values.forEach(value => { scores[question.dimension] += value.weight; if (value.driver && value.weight) drivers.push({ label: value.driver, weight: value.weight }); });
    });
    const bands = Object.fromEntries(Object.keys(scores).map(dimension => [dimension, bandFor(dimension, scores[dimension])]));
    const topDrivers = [...new Map(drivers.sort((a, b) => b.weight - a.weight).map(driver => [driver.label, driver])).values()].slice(0, 2).map(driver => driver.label);
    return { scores, bands, topDrivers, answers, answerValues };
  };

  const renderPreview = () => {
    result = compute();
    root.querySelector('[data-preview-band]').textContent = result.bands.exposure.label;
    root.querySelector('[data-preview-drivers]').textContent = result.topDrivers.length ? result.topDrivers.join(' and ') : 'no elevated exposure driver';
    const impact = result.answers.impact[0].toLowerCase();
    root.querySelector('[data-preview-reflection]').textContent = `Your present runway matters because it affects how much room you have to protect ${impact}, compare options, and choose a next step from evidence.`;
    form.elements.exposure_band.value = result.bands.exposure.label;
    form.elements.control_gap.value = result.bands.control.label;
    form.elements.investigation_posture.value = result.bands.posture.label;
    form.elements.summarized_answers.value = Object.entries(result.answers).map(([key, values]) => `${key}: ${values.join(', ')}`).join(' | ');
    questionHost.hidden = true; preview.hidden = false; capture.hidden = false; preview.focus();
  };

  questionHost.addEventListener('click', event => {
    if (event.target.closest('[data-back]')) showStep(step - 1);
    if (event.target.closest('[data-next]') && validate(step)) step === steps.length - 1 ? renderPreview() : showStep(step + 1);
  });
  questionHost.addEventListener('change', event => {
    const question = config.questions[step];
    if (question.multi && event.target.value === 'none' && event.target.checked) steps[step].querySelectorAll('input:not([value="none"])').forEach(input => { input.checked = false; });
    if (question.multi && event.target.value !== 'none' && event.target.checked) { const none = steps[step].querySelector('input[value="none"]'); if (none) none.checked = false; }
  });

  const params = new URLSearchParams(window.location.search);
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(name => { form.elements[name].value = params.get(name) || ''; });
  form.elements.referrer.value = document.referrer;
  form.elements.landing_url.value = window.location.href;

  const renderRoute = () => {
    const context = fieldValue('operating_context');
    const selection = resolveRouteSelection(config, context, form.elements.e2_business_intent.checked);
    const route = selection.route;
    const tier = config.tierMap[fieldValue('prior_franchise_research')] || config.tierMap.unknown;
    const desiredControl = result.answers.control[0];
    const desiredFuture = result.answers.future[0];
    form.elements.buyer_context_self_reported.value = selection.buyerContextSelfReported;
    form.elements.route_candidate.value = selection.routeKey;
    form.elements.route_artifact.value = route.artifact;
    form.elements.noncustomer_tier_self_reported.value = tier;
    form.elements.e2_business_intent_self_reported.value = selection.e2BusinessIntentSelfReported;
    form.elements.route_override_applied.value = selection.routeOverrideApplied;
    form.elements.route_override_reason.value = selection.routeOverrideReason;
    form.elements.secondary_buyer_context.value = selection.secondaryBuyerContext;
    root.querySelector('[data-route-artifact]').textContent = route.artifact;
    root.querySelector('[data-route-interpretation]').textContent = route.interpretation;
    root.querySelector('[data-route-context]').textContent = selection.routeConfigKey === 'e2_business_intent' ? `Primary route: E-2 business fit. Your secondary operating context remains ${form.elements.operating_context.options[form.elements.operating_context.selectedIndex].text}.` : `Primary route: ${route.artifact}.`;
    root.querySelector('[data-route-criteria]').innerHTML = route.criteria.map(criterion => `<li>${escape(criterion)}</li>`).join('');
    root.querySelector('[data-route-contradiction]').textContent = route.contradiction;
    root.querySelector('[data-route-echo]').textContent = `You said you want more control over ${desiredControl.toLowerCase()} and are willing to ${desiredFuture.toLowerCase()}. Use evidence to revise either answer; the purpose is a better decision, not consistency for its own sake.`;
    root.querySelector('[data-route-tier]').textContent = tier === 'Unknown' ? 'Research stage: not specified' : `Self-reported research stage: ${tier}`;
    const boundary = root.querySelector('[data-route-boundary]');
    boundary.textContent = route.boundary || '';
    boundary.hidden = !route.boundary;
    const nextStep = root.querySelector('[data-route-cta]');
    nextStep.textContent = route.cta;
    nextStep.href = `mailto:austin@olsonfa.com?subject=${encodeURIComponent(route.cta)}`;
  };

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    renderRoute();
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true; formStatus.className = 'form-status active'; formStatus.textContent = 'Confirming your submission…';
    const formPayload = Object.fromEntries(new FormData(form).entries());
    try {
      const providerResponse = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(formPayload) });
      const payload = await providerResponse.json().catch(() => null);
      const successConfirmed = payload && (payload.success === true || payload.success === 'true');
      const providerMessage = String(payload?.message || '');
      if (!providerResponse.ok || !successConfirmed || /activat/i.test(providerMessage)) throw new Error(`Submission was not confirmed (status ${providerResponse.status})`);
      capture.hidden = true; fullResult.hidden = false; formStatus.textContent = ''; fullResult.focus();
    } catch (error) {
      submitButton.disabled = false; formStatus.className = 'form-status active error';
      formStatus.innerHTML = 'We could not confirm receipt. Your preview and answers are still here. Try again, call <a href="tel:+15122008967">(512) 200-8967</a>, or email <a href="mailto:austin@olsonfa.com">austin@olsonfa.com</a>.';
    }
  });
  showStep(0);
})();
