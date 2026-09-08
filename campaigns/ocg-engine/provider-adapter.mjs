export class MockProviderAdapter {
  constructor(config = {}) {
    this.name = 'mock';
    this.capabilities = config.requiredCapabilities || [];
  }

  async quote(request) {
    return {
      status: 'provider_confirmation_required',
      requestId: `mock-${Date.now()}`,
      message: 'Formation pricing and fulfillment remain unavailable until a qualifying provider is connected.',
      request: { verticalId: request.verticalId, routeKey: request.routeKey }
    };
  }

  async createOrder() {
    throw new Error('Live provider orders are disabled in the local prototype.');
  }

  async getStatus() {
    return { status: 'not_connected' };
  }
}

export function createProviderAdapter(config) {
  if (config.adapter !== 'mock') throw new Error(`Unsupported local provider adapter: ${config.adapter}`);
  return new MockProviderAdapter(config);
}
