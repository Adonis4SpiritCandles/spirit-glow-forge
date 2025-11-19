import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Crawler detection
export function isCrawler(userAgent: string): boolean {
  const crawlerPatterns = [
    'facebookexternalhit',
    'Facebot',
    'twitterbot',
    'linkedinbot',
    'LinkedInBot',
    'slackbot',
    'Slackbot',
    'telegrambot',
    'whatsapp',
    'WhatsApp',
    'WhatsAppBot',
    'pinterest',
    'discordbot',
    'googlebot',
    'bingbot',
    'baiduspider',
    'yandexbot',
    'SkypeUriPreview',
    'Applebot',
    'ia_archiver'
  ];
  
  const lowerUA = userAgent.toLowerCase();
  return crawlerPatterns.some(pattern => lowerUA.includes(pattern.toLowerCase()));
}

// URL parsing to extract page type, language, and IDs
export interface ParsedUrl {
  pageType: string;
  language: string;
  id?: string;
}

export function parseUrl(pathname: string, language: string = 'en'): ParsedUrl {
  // Remove trailing slash
  const cleanPath = pathname.replace(/\/$/, '');
  
  // NOTE: This site does NOT use /en or /pl prefixes in URLs
  // Language is determined by Accept-Language header or defaults to 'en'
  // The pathname is used directly without removing language prefixes
  
  // Detect page type directly from pathname
  if (!cleanPath || cleanPath === '/') {
    return { pageType: 'home', language };
  }
  
  if (cleanPath.startsWith('/about')) {
    return { pageType: 'about', language };
  }
  
  // Shop/Products list page: /shop or /products
  if (cleanPath === '/shop' || cleanPath === '/products') {
    return { pageType: 'shop', language };
  }
  
  if (cleanPath.startsWith('/shop/')) {
    return { pageType: 'shop', language };
  }
  
  if (cleanPath.startsWith('/contact')) {
    return { pageType: 'contact', language };
  }
  
  if (cleanPath.startsWith('/custom-candles')) {
    return { pageType: 'custom_candles', language };
  }
  
  // Collections list page: /collections (plural, no ID)
  if (cleanPath === '/collections') {
    return { pageType: 'collections', language };
  }
  
  // Collections detail page: /collections/:slug (plural with slug)
  const collectionsDetailMatch = cleanPath.match(/^\/collections\/([^/]+)/);
  if (collectionsDetailMatch) {
    return { pageType: 'collection', language, id: collectionsDetailMatch[1] }; // id field contains slug
  }
  
  // Product detail: /product/:id
  const productMatch = cleanPath.match(/^\/product\/([^/]+)/);
  if (productMatch) {
    return { pageType: 'product', language, id: productMatch[1] };
  }
  
  // Collection detail: /collection/:id (singular, legacy format)
  const collectionMatch = cleanPath.match(/^\/collection\/([^/]+)/);
  if (collectionMatch) {
    return { pageType: 'collection', language, id: collectionMatch[1] };
  }
  
  // Static pages
  if (cleanPath === '/faq') {
    return { pageType: 'faq', language };
  }
  
  if (cleanPath === '/privacy-policy') {
    return { pageType: 'privacy_policy', language };
  }
  
  if (cleanPath === '/cookie-policy') {
    return { pageType: 'cookie_policy', language };
  }
  
  if (cleanPath === '/terms-of-sale') {
    return { pageType: 'terms_of_sale', language };
  }
  
  if (cleanPath === '/shipping-returns') {
    return { pageType: 'shipping_returns', language };
  }
  
  if (cleanPath === '/legal-notice') {
    return { pageType: 'legal_notice', language };
  }
  
  if (cleanPath === '/data-request') {
    return { pageType: 'data_request', language };
  }
  
  if (cleanPath === '/accessibility') {
    return { pageType: 'accessibility', language };
  }
  
  if (cleanPath === '/all-notices') {
    return { pageType: 'all_notices', language };
  }
  
  if (cleanPath === '/wishlist') {
    return { pageType: 'wishlist', language };
  }
  
  if (cleanPath === '/scent-quiz') {
    return { pageType: 'scent_quiz', language };
  }
  
  if (cleanPath === '/loyalty') {
    return { pageType: 'loyalty', language };
  }
  
  if (cleanPath === '/cart') {
    return { pageType: 'cart', language };
  }
  
  if (cleanPath === '/checkout') {
    return { pageType: 'checkout', language };
  }
  
  if (cleanPath === '/payment-success') {
    return { pageType: 'payment_success', language };
  }
  
  if (cleanPath === '/auth') {
    return { pageType: 'auth', language };
  }
  
  if (cleanPath === '/dashboard') {
    return { pageType: 'dashboard', language };
  }
  
  if (cleanPath === '/admin') {
    return { pageType: 'admin', language };
  }
  
  if (cleanPath === '/leaderboard') {
    return { pageType: 'leaderboard', language };
  }
  
  if (cleanPath === '/reset-password') {
    return { pageType: 'reset_password', language };
  }
  
  if (cleanPath === '/privacy-registration') {
    return { pageType: 'privacy_registration', language };
  }
  
  // Dynamic routes with parameters
  // AR Viewer: /ar/:productId
  const arMatch = cleanPath.match(/^\/ar\/([^/]+)/);
  if (arMatch) {
    return { pageType: 'ar', language, id: arMatch[1] };
  }
  
  // Profile: /profile/:userId
  const profileMatch = cleanPath.match(/^\/profile\/([^/]+)/);
  if (profileMatch) {
    return { pageType: 'profile', language, id: profileMatch[1] };
  }
  
  // Order timeline: /order/:orderId/timeline
  const orderTimelineMatch = cleanPath.match(/^\/order\/([^/]+)\/timeline/);
  if (orderTimelineMatch) {
    return { pageType: 'order_timeline', language, id: orderTimelineMatch[1] };
  }
  
  // Shared wishlist: /wishlist/shared/:token
  const sharedWishlistMatch = cleanPath.match(/^\/wishlist\/shared\/([^/]+)/);
  if (sharedWishlistMatch) {
    return { pageType: 'shared_wishlist', language, id: sharedWishlistMatch[1] };
  }
  
  // Default to home
  return { pageType: 'home', language };
}

// Fetch SEO settings from database
export async function fetchSEOSettings(supabaseUrl: string, supabaseKey: string, pageType: string, language: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase
    .from('seo_settings')
    .select('*')
    .eq('page_type', pageType)
    .single();
  
  if (error || !data) {
    console.error('Error fetching SEO settings:', error);
    return null;
  }
  
  const titleField = language === 'en' ? 'title_en' : 'title_pl';
  const descField = language === 'en' ? 'description_en' : 'description_pl';
  const keywordsField = language === 'en' ? 'keywords_en' : 'keywords_pl';
  
  return {
    title: data[titleField] || '',
    description: data[descField] || '',
    keywords: data[keywordsField] || '',
    og_image_url: data.og_image_url || 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
    noindex: data.noindex || false,
    use_specific_meta: data.use_specific_meta || false
  };
}

// Fetch product data for specific meta tags
export async function fetchProductData(supabaseUrl: string, supabaseKey: string, productId: string, language: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
  
  if (error || !data) {
    console.error('Error fetching product data:', error);
    return null;
  }
  
  const nameField = language === 'en' ? 'name_en' : 'name_pl';
  const descField = language === 'en' ? 'description_en' : 'description_pl';
  
  return {
    title: `${data[nameField]} | SPIRIT CANDLES`,
    description: data[descField] || data.summary_en || data.summary_pl || '',
    image: data.image_url || (data.image_urls && data.image_urls.length > 0 ? data.image_urls[0] : null) || 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
    price: data.price_pln ? parseFloat(data.price_pln.toString()) : undefined,
    currency: 'PLN'
  };
}

// Fetch collection data for specific meta tags
// collectionId can be either an ID (UUID) or a slug (string)
export async function fetchCollectionData(supabaseUrl: string, supabaseKey: string, collectionId: string, language: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Try to fetch by ID first (UUID format)
  let query = supabase
    .from('collections')
    .select('*');
  
  // Check if collectionId looks like a UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(collectionId);
  
  if (isUUID) {
    query = query.eq('id', collectionId);
  } else {
    // Otherwise, try to fetch by slug
    query = query.eq('slug', collectionId);
  }
  
  const { data, error } = await query.single();
  
  if (error || !data) {
    console.error('Error fetching collection data:', error);
    // If fetching by slug failed and it wasn't a UUID, try by ID as fallback
    if (!isUUID) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .single();
      
      if (!fallbackError && fallbackData) {
        const nameField = language === 'en' ? 'name_en' : 'name_pl';
        const descField = language === 'en' ? 'description_en' : 'description_pl';
        
        return {
          title: `${fallbackData[nameField]} Collection | SPIRIT CANDLES`,
          description: fallbackData[descField] || '',
          image: fallbackData.image_url || fallbackData.cover_image_url || 'https://spirit-candle.com/spiritcandles/og-image-default.jpg'
        };
      }
    }
    return null;
  }
  
  const nameField = language === 'en' ? 'name_en' : 'name_pl';
  const descField = language === 'en' ? 'description_en' : 'description_pl';
  
  return {
    title: `${data[nameField]} Collection | SPIRIT CANDLES`,
    description: data[descField] || '',
    image: data.image_url || data.cover_image_url || 'https://spirit-candle.com/spiritcandles/og-image-default.jpg'
  };
}

// Helper function to replace placeholders in text
export function replacePlaceholders(text: string, replacements: Record<string, string>): string {
  let result = text;
  for (const [placeholder, value] of Object.entries(replacements)) {
    const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

// Generate HTML with meta tags
export function generateHTML(metaTags: {
  title: string;
  description: string;
  keywords?: string;
  image: string;
  url: string;
  type?: string;
  locale: string;
  alternateLocale: string;
  canonicalUrl: string;
  noindex?: boolean;
  price?: number;
  currency?: string;
}): string {
  const {
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    locale,
    alternateLocale,
    canonicalUrl,
    noindex = false,
    price,
    currency
  } = metaTags;
  
  // Escape HTML entities
  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeKeywords = keywords ? escapeHtml(keywords) : '';
  
  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Basic Meta Tags -->
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}" />
  ${safeKeywords ? `<meta name="keywords" content="${safeKeywords}" />` : ''}
  ${noindex ? '<meta name="robots" content="noindex, nofollow" />' : '<meta name="robots" content="index, follow" />'}
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${canonicalUrl}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${type}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${safeTitle}" />
  <meta property="og:site_name" content="SPIRIT CANDLES" />
  <meta property="og:locale" content="${locale === 'en' ? 'en_US' : 'pl_PL'}" />
  <meta property="og:locale:alternate" content="${alternateLocale === 'en' ? 'en_US' : 'pl_PL'}" />
  ${price && currency ? `
  <meta property="product:price:amount" content="${price}" />
  <meta property="product:price:currency" content="${currency}" />
  ` : ''}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${url}" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="${safeTitle}" />
  <meta name="twitter:creator" content="@spiritcandle0" />
  <meta name="twitter:site" content="@spiritcandle0" />
  
  <!-- Alternate Languages -->
  <!-- Note: Site doesn't use /en or /pl in URLs, so alternate URLs are the same -->
  <link rel="alternate" hreflang="en" href="${url}" />
  <link rel="alternate" hreflang="pl" href="${url}" />
  <link rel="alternate" hreflang="x-default" href="${url}" />
</head>
<body>
  <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
    <h1>SPIRIT CANDLES</h1>
    <p>Loading...</p>
    <p style="font-size: 12px; color: #666; margin-top: 20px;">
      If you are not redirected automatically, please visit 
      <a href="${url}">spirit-candle.com</a>
    </p>
  </div>
  <script>
    // Redirect to the actual SPA after a brief delay
    setTimeout(() => {
      window.location.href = '${url}';
    }, 100);
  </script>
</body>
</html>`;
}

