export function resolveRouteSelection(config, operatingContext, e2BusinessIntent) {
  const context = config.routes[operatingContext] ? operatingContext : 'general_or_unknown';
  const overrideApplied = e2BusinessIntent === true;
  const routeConfigKey = overrideApplied ? 'e2_business_intent' : context;
  return {
    route: config.routes[routeConfigKey], routeConfigKey,
    routeKey: config.routes[routeConfigKey].routeKey,
    buyerContextSelfReported: context,
    secondaryBuyerContext: overrideApplied ? context : '',
    e2BusinessIntentSelfReported: overrideApplied ? 'yes' : 'no',
    routeOverrideApplied: overrideApplied ? 'yes' : 'no',
    routeOverrideReason: overrideApplied ? 'voluntary_e2_business_intent' : ''
  };
}
