(function () {
  'use strict';
  const root = document.querySelector('[data-tentacle-config]');
  if (!root) return;

  const config = JSON.parse(document.getElementById(root.dataset.tentacleConfig).textContent);
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
  questionHost.innerHTML = config.questions.map((q, index) => `<fieldset class="diagnostic-step" data-step="${index}"${index ? ' hidden' : ''}><legend><span>0${index + 1}</span>${escape(q.legend)}</legend>${q.help ? `<p class="question-help">${escape(q.help)}</p>` : ''}<div class="answer-grid">${q.options.map(o => `<label class="answer"><input type="${q.multi ? 'checkbox' : 'radio'}" name="diagnostic_${escape(q.id)}${q.multi ? '[]' : ''}" value="${escape(o.value)}" ${q.multi ? '' : 'required'}><span>${escape(o.label)}</span></label>`).join('')}</div><p class="question-error" aria-live="polite"></p><div class="step-actions">${index ? '<button type="button" class="text-button" data-back>Back</button>' : '<span></span>'}<button type="button" class="button button-gold" data-next>${index === config.questions.length - 1 ? 'See my preview' : 'Continue'}</button></div></fieldset>`).join('');

  const steps = [...questionHost.querySelectorAll('[data-step]')];
  const showStep = next => { step = next; steps.forEach((el, i) => el.hidden = i !== step); progress.textContent = `Question ${step + 1} of ${config.questions.length}`; };
  const selected = (q, index) => [...steps[index].querySelectorAll('input:checked')].map(input => q.options.find(o => o.value === input.value));
  const validate = index => {
    const values = selected(config.questions[index], index);
    steps[index].querySelector('.question-error').textContent = values.length ? '' : 'Choose the answer that comes closest.';
    return values.length > 0;
  };
  const compute = () => {
    let score = 0; const drivers = []; const answers = {};
    config.questions.forEach((q, index) => {
      const values = selected(q, index); answers[q.id] = values.map(v => v.label);
      values.forEach(v => { score += v.weight; if (v.driver && v.weight) drivers.push({ label: v.driver, weight: v.weight }); });
    });
    const band = [...config.bands].reverse().find(item => score >= item.min);
    const topDrivers = [...new Map(drivers.sort((a,b) => b.weight-a.weight).map(d => [d.label,d])).values()].slice(0,2).map(d => d.label);
    return { band, topDrivers, answers };
  };
  const renderPreview = () => {
    result = compute();
    root.querySelector('[data-preview-band]').textContent = result.band.label;
    root.querySelector('[data-preview-summary]').textContent = result.band.summary;
    root.querySelector('[data-preview-drivers]').textContent = result.topDrivers.length ? result.topDrivers.join(' and ') : 'No elevated driver in your answers';
    form.elements.diagnostic_band.value = result.band.label;
    form.elements.summarized_answers.value = Object.entries(result.answers).map(([key, values]) => `${key}: ${values.join(', ')}`).join(' | ');
    questionHost.hidden = true; preview.hidden = false; capture.hidden = false; preview.focus();
  };
  questionHost.addEventListener('click', event => {
    if (event.target.closest('[data-back]')) showStep(step - 1);
    if (event.target.closest('[data-next]') && validate(step)) step === steps.length - 1 ? renderPreview() : showStep(step + 1);
  });
  questionHost.addEventListener('change', event => {
    const q = config.questions[step];
    if (q.multi && event.target.value === 'none' && event.target.checked) steps[step].querySelectorAll('input:not([value="none"])').forEach(input => input.checked = false);
    if (q.multi && event.target.value !== 'none' && event.target.checked) { const none = steps[step].querySelector('input[value="none"]'); if (none) none.checked = false; }
  });

  const params = new URLSearchParams(window.location.search);
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(name => { form.elements[name].value = params.get(name) || ''; });
  form.elements.referrer.value = document.referrer;
  form.elements.landing_url.value = window.location.href;

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true; formStatus.className = 'form-status active'; formStatus.textContent = 'Sending your request…';
    const formPayload = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(formPayload) });
      const payload = await response.json().catch(() => null);
      const successConfirmed = payload && (payload.success === true || payload.success === 'true');
      const providerMessage = String(payload?.message || '');
      if (!response.ok || !successConfirmed || /activat/i.test(providerMessage)) throw new Error(`Submission was not confirmed by FormSubmit (status ${response.status})`);
      capture.hidden = true; fullResult.hidden = false;
      root.querySelector('[data-full-band]').textContent = result.band.label;
      root.querySelector('[data-full-drivers]').textContent = result.topDrivers.length ? result.topDrivers.join(' and ') : 'No elevated driver in your answers';
      formStatus.textContent = ''; fullResult.focus();
    } catch (error) {
      submitButton.disabled = false; formStatus.className = 'form-status active error';
      formStatus.innerHTML = 'We could not confirm receipt. Your preview is still here. Try again, call <a href="tel:+15122008967">(512) 200-8967</a>, or email <a href="mailto:austin@olsonfa.com">austin@olsonfa.com</a>.';
    }
  });
  showStep(0);
})();
