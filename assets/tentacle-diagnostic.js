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

  questionHost.innerHTML = config.questions.map((question, index) => `<fieldset class="diagnostic-step" data-step="${index}"${index ? ' hidden' : ''}><legend><span>0${index + 1}</span>${escape(question.legend)}</legend>${question.help ? `<p class="question-help">${escape(question.help)}</p>` : ''}<div class="answer-grid">${question.options.map(option => `<label class="answer"><input type="${question.multi ? 'checkbox' : 'radio'}" name="diagnostic_${escape(question.id)}${question.multi ? '[]' : ''}" value="${escape(option.value)}" ${question.multi ? '' : 'required'}><span>${escape(option.label)}</span></label>`).join('')}</div><p class="question-error" aria-live="polite"></p><div class="step-actions">${index ? '<button type="button" class="text-button" data-back>Back</button>' : '<span></span>'}<button type="button" class="button button-gold" data-next>${index === config.questions.length - 1 ? 'Get my personalized result' : 'Continue'}</button></div></fieldset>`).join('');

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

  const openCapture = () => {
    questionHost.hidden = true;
    capture.hidden = false;
    form.elements.first_name.focus();
  };

  questionHost.addEventListener('click', event => {
    if (event.target.closest('[data-back]')) showStep(step - 1);
    if (event.target.closest('[data-next]') && validate(step)) step === steps.length - 1 ? openCapture() : showStep(step + 1);
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

  const prepareSubmission = () => {
    result = compute();
    form.elements.exposure_band.value = result.bands.exposure.label;
    form.elements.control_gap.value = result.bands.control.label;
    form.elements.investigation_posture.value = result.bands.posture.label;
    form.elements.summarized_answers.value = Object.entries(result.answers).map(([key, values]) => `${key}: ${values.join(', ')}`).join(' | ');
    const context = fieldValue('operating_context');
    const selection = resolveRouteSelection(config, context, form.elements.e2_business_intent.checked);
    const route = selection.route;
    const tier = config.tierMap[fieldValue('prior_franchise_research')] || config.tierMap.unknown;
    form.elements.buyer_context_self_reported.value = selection.buyerContextSelfReported;
    form.elements.route_candidate.value = selection.routeKey;
    form.elements.route_artifact.value = route.artifact;
    form.elements.noncustomer_tier_self_reported.value = tier;
    form.elements.e2_business_intent_self_reported.value = selection.e2BusinessIntentSelfReported;
    form.elements.route_override_applied.value = selection.routeOverrideApplied;
    form.elements.route_override_reason.value = selection.routeOverrideReason;
    form.elements.secondary_buyer_context.value = selection.secondaryBuyerContext;
    return { selection, route, tier };
  };

  const renderPersonalizedResult = ({ selection, route, tier }) => {
    root.querySelector('[data-result-name]').textContent = fieldValue('first_name').trim();
    root.querySelector('[data-preview-band]').textContent = result.bands.exposure.label;
    const driverLead = root.querySelector('[data-preview-driver-lead]');
    const driverText = root.querySelector('[data-preview-drivers]');
    const driverEnd = root.querySelector('[data-preview-driver-end]');
    if (result.topDrivers.length) {
      driverLead.textContent = result.topDrivers.length === 1 ? 'Your strongest pressure point is ' : 'Your strongest pressure points are ';
      driverText.textContent = result.topDrivers.join(' and ');
      driverEnd.textContent = '.';
    } else {
      driverLead.textContent = '';
      driverText.textContent = 'Your answers did not surface one dominant pressure point.';
      driverEnd.textContent = '';
    }
    const reflection = result.answerValues.impact[0] === 'manageable'
      ? 'Your answers suggest the immediate practical impact would be manageable, giving you more room to compare options before deciding.'
      : `That matters because it shapes how much time and bargaining room you have to protect ${result.answers.impact[0].toLowerCase()} before you make the next move.`;
    root.querySelector('[data-preview-reflection]').textContent = reflection;
    root.querySelector('[data-route-artifact]').textContent = route.artifact;
    root.querySelector('[data-route-interpretation]').textContent = route.interpretation;
    const contextLabel = form.elements.operating_context.options[form.elements.operating_context.selectedIndex].text;
    root.querySelector('[data-route-context]').textContent = selection.routeConfigKey === 'e2_business_intent' ? `Your starting point: E-2 business fit. Your other operating background remains ${contextLabel}.` : `Your starting point: ${route.artifact}.`;
    root.querySelector('[data-route-criteria]').innerHTML = route.criteria.map(criterion => `<li>${escape(criterion)}</li>`).join('');
    root.querySelector('[data-route-contradiction]').textContent = route.contradiction;
    const toSecondPerson = text => (text.charAt(0).toLowerCase() + text.slice(1)).replace(/\bI\b/g, 'you').replace(/\bmy\b/g, 'your');
    const desiredFutureFragment = toSecondPerson(result.answers.future[0]);
    const echo = result.answerValues.control[0] === 'none'
      ? `You did not identify one job-controlled factor you need to change. You are willing to ${desiredFutureFragment}. Use evidence to revise either answer as you learn more.`
      : `You said you are tired of letting the job decide ${toSecondPerson(result.answers.control[0])}, and you are willing to ${desiredFutureFragment}. Use evidence to revise either answer; the purpose is a better decision, not consistency for its own sake.`;
    root.querySelector('[data-route-echo]').textContent = echo;
    const tierCopy = {
      'Tier 3': 'Research so far: Just starting or not yet researching franchises.',
      'Tier 2': 'Research so far: You looked before and stopped or rejected what you saw.',
      'Tier 1': 'Research so far: Actively exploring one or more concepts.',
      Unknown: 'Research so far: Not specified.'
    };
    root.querySelector('[data-route-tier]').textContent = tierCopy[tier] || tierCopy.Unknown;
    const boundary = root.querySelector('[data-route-boundary]');
    boundary.textContent = route.boundary || '';
    boundary.hidden = !route.boundary;
    root.querySelector('[data-route-cta]').textContent = route.cta;
  };

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const mobileDigits = fieldValue('phone').replace(/\D/g, '');
    if (mobileDigits.length < 10 || mobileDigits.length > 15) {
      formStatus.className = 'form-status active error';
      formStatus.textContent = 'Enter a valid mobile number so OFA can contact you about your result.';
      form.elements.phone.focus();
      return;
    }
    const personalizedView = prepareSubmission();
    const capturedAt = new Date().toISOString();
    form.elements.captured_at.value = capturedAt;
    form.elements.requested_response_consent_at.value = capturedAt;
    form.elements.marketing_consent_at.value = form.elements.marketing_consent.checked ? capturedAt : '';
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true; formStatus.className = 'form-status active'; formStatus.textContent = 'Confirming your submission…';
    const formPayload = Object.fromEntries(new FormData(form).entries());
    try {
      const providerResponse = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(formPayload) });
      const payload = await providerResponse.json().catch(() => null);
      const successConfirmed = payload && (payload.success === true || payload.success === 'true');
      const providerMessage = String(payload?.message || '');
      if (!providerResponse.ok || !successConfirmed || /activat/i.test(providerMessage)) throw new Error(`Submission was not confirmed (status ${providerResponse.status})`);
      renderPersonalizedResult(personalizedView);
      capture.hidden = true; preview.hidden = false; fullResult.hidden = false; formStatus.textContent = ''; preview.focus();
    } catch (error) {
      submitButton.disabled = false; formStatus.className = 'form-status active error';
      formStatus.innerHTML = 'We could not confirm receipt. Your answers and contact details are still here. Try again, call <a href="tel:+15122008967">(512) 200-8967</a>, or email <a href="mailto:austin@olsonfa.com">austin@olsonfa.com</a>.';
    }
  });
  showStep(0);
})();
