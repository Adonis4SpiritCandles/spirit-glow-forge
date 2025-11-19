import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  isCrawler,
  parseUrl,
  fetchSEOSettings,
  fetchProductData,
  fetchCollectionData,
  generateHTML
} from './helpers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Get request URL and user agent
    const url = new URL(req.url);
    const userAgent = req.headers.get('user-agent') || '';
    
    // IMPORTANT: Get path from query parameter (passed by .htaccess redirect)
    // When .htaccess redirects, it passes the original path as ?path=/about
    // If not present (direct call), fallback to pathname
    const queryPath = url.searchParams.get('path');
    const pathname = queryPath || url.pathname;
    
    // Normalize path: ensure it starts with / and remove trailing slash
    let actualPath = pathname;
    if (!actualPath.startsWith('/')) {
      actualPath = '/' + actualPath;
    }
    // Remove trailing slash (except for homepage)
    if (actualPath !== '/' && actualPath.endsWith('/')) {
      actualPath = actualPath.slice(0, -1);
    }
    
    // If pathname is the Edge Function path itself (direct call), default to homepage
    if (actualPath === '/functions/v1/serve-seo-meta') {
      actualPath = '/';
    }
    
    // Detect language from Accept-Language header
    // Since the site doesn't use /en or /pl in URLs, we detect from browser preferences
    const acceptLanguage = req.headers.get('accept-language') || '';
    let detectedLanguage = 'en'; // default
    if (acceptLanguage) {
      // Simple detection: if 'pl' appears before 'en' in Accept-Language, use Polish
      const lowerAcceptLang = acceptLanguage.toLowerCase();
      const plIndex = lowerAcceptLang.indexOf('pl');
      const enIndex = lowerAcceptLang.indexOf('en');
      if (plIndex !== -1 && (enIndex === -1 || plIndex < enIndex)) {
        detectedLanguage = 'pl';
      }
    }
    
    console.log('[serve-seo-meta] Request:', { 
      pathname: actualPath,
      queryPath: queryPath,
      originalPathname: url.pathname,
      userAgent: userAgent.substring(0, 50),
      detectedLanguage,
      acceptLanguage: acceptLanguage.substring(0, 50)
    });
    
    // Check if request is from a crawler
    if (!isCrawler(userAgent)) {
      console.log('[serve-seo-meta] Not a crawler, proxying to SPA');
      // For non-crawlers, return a simple response that tells them to access the main site
      // In production, this would be handled by the hosting platform (Netlify/Vercel redirects)
      return new Response(
        JSON.stringify({ 
          message: 'This endpoint is for crawlers only. Please visit https://spirit-candle.com' 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Parse URL to get page type, language, and IDs
    // Pass actualPath instead of pathname (site doesn't use /en or /pl in URLs)
    const parsed = parseUrl(actualPath, detectedLanguage);
    console.log('[serve-seo-meta] Parsed URL:', parsed);
    
    let title = '';
    let description = '';
    let keywords = '';
    let image = 'https://spirit-candle.com/spiritcandles/og-image-default.jpg';
    let ogType = 'website';
    let noindex = false;
    let price: number | undefined;
    let currency: string | undefined;
    
    // Fetch SEO settings for the page type
    if (parsed.pageType === 'product' && parsed.id) {
      // Check if we should use specific meta for products
      const productSettings = await fetchSEOSettings(supabaseUrl, supabaseKey, 'product_default', parsed.language);
      
      if (productSettings && productSettings.use_specific_meta) {
        // Use specific product data
        console.log('[serve-seo-meta] Using specific product data');
        const productData = await fetchProductData(supabaseUrl, supabaseKey, parsed.id, parsed.language);
        if (productData) {
          title = productData.title;
          description = productData.description;
          image = productData.image;
          price = productData.price;
          currency = productData.currency;
          ogType = 'product';
        }
      } else {
        // Use generic product_default settings
        console.log('[serve-seo-meta] Using generic product_default settings');
        if (productSettings) {
          title = productSettings.title;
          description = productSettings.description;
          keywords = productSettings.keywords;
          image = productSettings.og_image_url;
          noindex = productSettings.noindex;
        }
      }
    } else if (parsed.pageType === 'collection' && parsed.id) {
      // Check if we should use specific meta for collections
      const collectionSettings = await fetchSEOSettings(supabaseUrl, supabaseKey, 'collection_default', parsed.language);
      
      if (collectionSettings && collectionSettings.use_specific_meta) {
        // Use specific collection data
        console.log('[serve-seo-meta] Using specific collection data');
        const collectionData = await fetchCollectionData(supabaseUrl, supabaseKey, parsed.id, parsed.language);
        if (collectionData) {
          title = collectionData.title;
          description = collectionData.description;
          image = collectionData.image;
        }
      } else {
        // Use generic collection_default settings
        console.log('[serve-seo-meta] Using generic collection_default settings');
        if (collectionSettings) {
          title = collectionSettings.title;
          description = collectionSettings.description;
          keywords = collectionSettings.keywords;
          image = collectionSettings.og_image_url;
          noindex = collectionSettings.noindex;
        }
      }
    } else {
      // For other pages (home, shop, about, contact, custom_candles)
      const pageSettings = await fetchSEOSettings(supabaseUrl, supabaseKey, parsed.pageType, parsed.language);
      if (pageSettings) {
        title = pageSettings.title;
        description = pageSettings.description;
        keywords = pageSettings.keywords;
        image = pageSettings.og_image_url;
        noindex = pageSettings.noindex;
      }
    }
    
    // Fallback to defaults if no settings found
    if (!title) {
      title = parsed.language === 'en' 
        ? 'SPIRIT CANDLES — Reborn Your Nature'
        : 'SPIRIT CANDLES — Odrodź Swoją Naturę';
    }
    
    if (!description) {
      description = parsed.language === 'en'
        ? 'Discover SPIRIT CANDLES luxury soy candles inspired by iconic fragrances and handcrafted with natural soy wax.'
        : 'Odkryj luksusowe świece sojowe SPIRIT CANDLES inspirowane kultowymi zapachami i ręcznie robione z naturalnego wosku sojowego.';
    }
    
    // Construct full URL
    const baseUrl = 'https://spirit-candle.com';
    const fullUrl = `${baseUrl}${actualPath}`;
    const canonicalUrl = fullUrl;
    
    // Generate HTML with meta tags
    const html = generateHTML({
      title,
      description,
      keywords,
      image,
      url: fullUrl,
      type: ogType,
      locale: parsed.language,
      alternateLocale: parsed.language === 'en' ? 'pl' : 'en',
      canonicalUrl,
      noindex,
      price,
      currency
    });
    
    console.log('[serve-seo-meta] Returning HTML with meta tags');
    
    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
    
  } catch (error) {
    console.error('[serve-seo-meta] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to generate SEO meta tags'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

