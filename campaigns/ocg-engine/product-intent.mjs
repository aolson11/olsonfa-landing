export function createProductIntent({config, result, product}) {
  if (!config || !result || !product) throw new Error('Config, route result, and product are required');
  if (product.id !== 'launch_system' || product.type !== 'standard' || product.price !== 197) throw new Error('The $197 launch-system product is not configured');
  const answers = Object.fromEntries(Object.entries(result.answers || {}).map(([questionId, answer]) => [questionId, {value:answer.value, label:answer.label}]));
  return {
    schemaVersion: '1.0',
    eventType: 'OCG_PRODUCT_INTENT_PREPARED',
    intentId: globalThis.crypto?.randomUUID?.() || `intent-${Date.now()}`,
    createdAt: new Date().toISOString(),
    verticalId: config.verticalId,
    productId: product.id,
    productVersion: product.version || 'unversioned',
    price: product.price,
    currency: 'USD',
    routeKey: result.routeKey,
    routeArtifact: result.route.artifact,
    answers,
    affirmativeOwnershipComparison: false,
    receiptStatus: 'not_started',
    deliveryStatus: 'not_entitled'
  };
}

export function validateProductIntent(intent) {
  const required = ['schemaVersion','eventType','intentId','verticalId','productId','productVersion','price','currency','routeKey','routeArtifact','answers','receiptStatus','deliveryStatus'];
  const missing = required.filter(key => intent?.[key] == null);
  if (missing.length) throw new Error(`Missing product intent fields: ${missing.join(', ')}`);
  const serialized = JSON.stringify(intent).toLowerCase();
  for (const prohibited of ['email','mobile','phone','frantracker','payment_credentials']) {
    if (serialized.includes(prohibited)) throw new Error(`Product intent contains prohibited field: ${prohibited}`);
  }
  if (intent.affirmativeOwnershipComparison !== false) throw new Error('Product purchase intent cannot create an ownership-comparison request');
  return true;
}
