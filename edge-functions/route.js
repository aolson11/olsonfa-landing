import { NextResponse } from 'next/server';

const DOMAIN_MAP = {
  // Main site - default
  'olsonfa.com': '/index.html',
  'www.olsonfa.com': '/index.html',
  
  // Add campaign domains here as you add them
  // Example: 'yourfranchisefit.com': '/campaigns/e2-visa.html',
};

export async function request(request) {
  const host = request.headers.get('host') || '';
  const htmlPath = DOMAIN_MAP[host] || '/index.html';
  
  try {
    const response = await fetch(new URL(htmlPath, request.url));
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    return new NextResponse('Not found', { status: 404 });
  }
}

export const config = {
  runtime: 'edge',
};
