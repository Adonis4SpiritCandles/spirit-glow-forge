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
  
  if (cleanPath.startsWith('/shop')) {
    return { pageType: 'shop', language };
  }
  
  if (cleanPath.startsWith('/contact')) {
    return { pageType: 'contact', language };
  }
  
  if (cleanPath.startsWith('/custom-candles')) {
    return { pageType: 'custom_candles', language };
  }
  
  // Product detail: /product/:id
  const productMatch = cleanPath.match(/^\/product\/([^/]+)/);
  if (productMatch) {
    return { pageType: 'product', language, id: productMatch[1] };
  }
  
  // Collection detail: /collection/:id
  const collectionMatch = cleanPath.match(/^\/collection\/([^/]+)/);
  if (collectionMatch) {
    return { pageType: 'collection', language, id: collectionMatch[1] };
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
    description: data[descField] || data.summary || '',
    image: data.image || 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
    price: data.price_pln,
    currency: 'PLN'
  };
}

// Fetch collection data for specific meta tags
export async function fetchCollectionData(supabaseUrl: string, supabaseKey: string, collectionId: string, language: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', collectionId)
    .single();
  
  if (error || !data) {
    console.error('Error fetching collection data:', error);
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

