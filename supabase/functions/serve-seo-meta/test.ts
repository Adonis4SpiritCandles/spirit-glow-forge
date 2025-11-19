/**
 * Local Test for serve-seo-meta Edge Function
 * 
 * Run with: deno run --allow-net --allow-env test.ts
 * Or: supabase functions serve serve-seo-meta (then test with curl)
 */

import { parseUrl, isCrawler } from './helpers.ts';

// Test parseUrl function
console.log('🧪 Testing parseUrl function\n');

const urlTests = [
  { path: '/', expected: { pageType: 'home', language: 'en' } },
  { path: '/en', expected: { pageType: 'home', language: 'en' } },
  { path: '/pl', expected: { pageType: 'home', language: 'pl' } },
  { path: '/en/shop', expected: { pageType: 'shop', language: 'en' } },
  { path: '/pl/shop', expected: { pageType: 'shop', language: 'pl' } },
  { path: '/en/about', expected: { pageType: 'about', language: 'en' } },
  { path: '/pl/about', expected: { pageType: 'about', language: 'pl' } },
  { path: '/contact', expected: { pageType: 'contact', language: 'en' } },
  { path: '/en/custom-candles', expected: { pageType: 'custom_candles', language: 'en' } },
  { path: '/en/product/123', expected: { pageType: 'product', language: 'en', id: '123' } },
  { path: '/pl/product/abc-def', expected: { pageType: 'product', language: 'pl', id: 'abc-def' } },
  { path: '/en/collection/col-1', expected: { pageType: 'collection', language: 'en', id: 'col-1' } },
];

urlTests.forEach(test => {
  const result = parseUrl(test.path);
  const passed = 
    result.pageType === test.expected.pageType &&
    result.language === test.expected.language &&
    (test.expected.id === undefined || result.id === test.expected.id);
  
  console.log(`${passed ? '✅' : '❌'} ${test.path}`);
  if (!passed) {
    console.log('  Expected:', test.expected);
    console.log('  Got:', result);
  }
});

console.log('\n🤖 Testing isCrawler function\n');

const crawlerTests = [
  { ua: 'facebookexternalhit/1.0', expected: true },
  { ua: 'Facebot', expected: true },
  { ua: 'twitterbot', expected: true },
  { ua: 'linkedinbot', expected: true },
  { ua: 'googlebot', expected: true },
  { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', expected: false },
  { ua: 'Chrome/91.0.4472.124', expected: false },
];

crawlerTests.forEach(test => {
  const result = isCrawler(test.ua);
  const passed = result === test.expected;
  
  console.log(`${passed ? '✅' : '❌'} ${test.ua.substring(0, 40)}...`);
  if (!passed) {
    console.log(`  Expected: ${test.expected}, Got: ${result}`);
  }
});

console.log('\n✅ All local tests passed!');
console.log('\nNext: Test with Supabase CLI:');
console.log('  supabase functions serve serve-seo-meta');
console.log('  curl -H "User-Agent: facebookexternalhit" http://localhost:54321/functions/v1/serve-seo-meta?path=/about');

