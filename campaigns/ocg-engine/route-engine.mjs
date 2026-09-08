export function validateConfig(config) {
  const required = ['schemaVersion', 'verticalId', 'brand', 'audience', 'variants', 'diagnostic', 'routes', 'products', 'marketing', 'boundaries', 'provider'];
  const missing = required.filter(key => !config[key]);
  if (missing.length) throw new Error(`Missing config fields: ${missing.join(', ')}`);
  if (!Array.isArray(config.diagnostic.questions) || config.diagnostic.questions.length < 1) throw new Error('Diagnostic questions are required');
  if (Object.keys(config.routes).length < 2) throw new Error('At least two routes are required');
  if (!config.boundaries.disclaimer || !config.boundaries.ofaRule) throw new Error('Scope and OFA boundaries are required');
  if (!Array.isArray(config.marketing.keywords) || !Array.isArray(config.marketing.negativeKeywords)) throw new Error('Marketing keyword controls are required');
  return true;
}

export function resolveRoute(config, answers) {
  validateConfig(config);
  const scores = Object.fromEntries(Object.keys(config.routes).map(key => [key, 0]));
  let affirmativeOwnershipComparison = false;
  const normalizedAnswers = {};

  config.diagnostic.questions.forEach(question => {
    const answer = answers[question.id];
    const option = question.options.find(candidate => candidate.value === answer);
    if (!option) throw new Error(`Missing or invalid answer for ${question.id}`);
    normalizedAnswers[question.id] = { value: option.value, label: option.label };
    Object.entries(option.scores || {}).forEach(([route, points]) => {
      if (route in scores) scores[route] += Number(points) || 0;
    });
    if (option.affirmativeOwnershipComparison === true) affirmativeOwnershipComparison = true;
  });

  const routeKey = Object.keys(scores).sort((a, b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a];
    return (config.routes[b].priority || 0) - (config.routes[a].priority || 0);
  })[0];

  return {
    routeKey,
    route: config.routes[routeKey],
    scores,
    answers: normalizedAnswers,
    affirmativeOwnershipComparison
  };
}
