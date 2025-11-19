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

// Helper function to add timeout to promises
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => {
        console.warn(`[serve-seo-meta] Operation timed out after ${timeoutMs}ms, using fallback`);
        resolve(fallback);
      }, timeoutMs);
    })
  ]);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let actualPath = '/'; // Default to homepage for error handling
  
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('[serve-seo-meta] Missing environment variables');
      throw new Error('Missing Supabase configuration');
    }
    
    // Get request URL and user agent
    const url = new URL(req.url);
    const userAgent = req.headers.get('user-agent') || '';
    
    // IMPORTANT: Get path from query parameter (passed by .htaccess redirect)
    // When .htaccess redirects, it passes the original path as ?path=/about
    // If not present (direct call), fallback to pathname
    const queryPath = url.searchParams.get('path');
    const pathname = queryPath || url.pathname;
    
    console.log('[serve-seo-meta] Raw path values:', {
      queryPath,
      pathname,
      fullUrl: req.url,
      searchParams: url.search
    });
    
    // Normalize path: ensure it starts with / and remove trailing slash
    actualPath = pathname;
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
    
    console.log('[serve-seo-meta] Normalized path:', actualPath);
    
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
    
    const isCrawlerRequest = isCrawler(userAgent);
    console.log('[serve-seo-meta] Request:', { 
      pathname: actualPath,
      queryPath: queryPath,
      originalPathname: url.pathname,
      userAgent: userAgent, // Log completo per vedere User-Agent di WhatsApp
      detectedLanguage,
      acceptLanguage: acceptLanguage.substring(0, 50),
      isCrawler: isCrawlerRequest
    });
    
    // Check if request is from a crawler
    if (!isCrawlerRequest) {
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
      try {
        // Check if we should use specific meta for products
        const productSettings = await withTimeout(
          fetchSEOSettings(supabaseUrl, supabaseKey, 'product_default', parsed.language),
          5000,
          null
        );
        
        if (productSettings && productSettings.use_specific_meta) {
          // Use specific product data
          console.log('[serve-seo-meta] Using specific product data for product ID:', parsed.id);
          try {
            const productData = await withTimeout(
              fetchProductData(supabaseUrl, supabaseKey, parsed.id, parsed.language),
              5000,
              null
            );
            if (productData) {
              title = productData.title;
              description = productData.description;
              image = productData.image;
              price = productData.price;
              currency = productData.currency;
              ogType = 'product';
              console.log('[serve-seo-meta] Product data retrieved successfully');
            } else {
              console.warn('[serve-seo-meta] Product data not found for ID:', parsed.id, '- falling back to generic settings');
              // Fallback to generic product_default settings
              if (productSettings) {
                title = productSettings.title;
                description = productSettings.description;
                keywords = productSettings.keywords;
                image = productSettings.og_image_url;
                noindex = productSettings.noindex;
              }
            }
          } catch (productError) {
            console.error('[serve-seo-meta] Error fetching product data:', productError);
            // Fallback to generic settings
            if (productSettings) {
              title = productSettings.title;
              description = productSettings.description;
              keywords = productSettings.keywords;
              image = productSettings.og_image_url;
              noindex = productSettings.noindex;
            }
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
      } catch (error) {
        console.error('[serve-seo-meta] Error in product handling:', error);
        // Continue with fallback defaults - will be handled below
      }
    } else if (parsed.pageType === 'collection' && parsed.id) {
      try {
        // Check if we should use specific meta for collections
        const collectionSettings = await withTimeout(
          fetchSEOSettings(supabaseUrl, supabaseKey, 'collection_default', parsed.language),
          5000,
          null
        );
        
        if (collectionSettings && collectionSettings.use_specific_meta) {
          // Use specific collection data
          console.log('[serve-seo-meta] Using specific collection data for collection ID:', parsed.id);
          try {
            const collectionData = await withTimeout(
              fetchCollectionData(supabaseUrl, supabaseKey, parsed.id, parsed.language),
              5000,
              null
            );
            if (collectionData) {
              title = collectionData.title;
              description = collectionData.description;
              image = collectionData.image;
              console.log('[serve-seo-meta] Collection data retrieved successfully');
            } else {
              console.warn('[serve-seo-meta] Collection data not found for ID:', parsed.id, '- falling back to generic settings');
              // Fallback to generic collection_default settings
              if (collectionSettings) {
                title = collectionSettings.title;
                description = collectionSettings.description;
                keywords = collectionSettings.keywords;
                image = collectionSettings.og_image_url;
                noindex = collectionSettings.noindex;
              }
            }
          } catch (collectionError) {
            console.error('[serve-seo-meta] Error fetching collection data:', collectionError);
            // Fallback to generic settings
            if (collectionSettings) {
              title = collectionSettings.title;
              description = collectionSettings.description;
              keywords = collectionSettings.keywords;
              image = collectionSettings.og_image_url;
              noindex = collectionSettings.noindex;
            }
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
      } catch (error) {
        console.error('[serve-seo-meta] Error in collection handling:', error);
        // Continue with fallback defaults - will be handled below
      }
    } else if (parsed.pageType === 'collections') {
      // Collections list page (no specific ID)
      console.log('[serve-seo-meta] Fetching SEO settings for collections list page');
      try {
        const collectionsSettings = await withTimeout(
          fetchSEOSettings(supabaseUrl, supabaseKey, 'collections', parsed.language),
          5000,
          null
        );
        
        if (collectionsSettings) {
          title = collectionsSettings.title;
          description = collectionsSettings.description;
          keywords = collectionsSettings.keywords;
          image = collectionsSettings.og_image_url;
          noindex = collectionsSettings.noindex;
          console.log('[serve-seo-meta] Using collections list SEO settings');
        } else {
          console.warn('[serve-seo-meta] No SEO settings found for collections list - using fallback');
        }
      } catch (error) {
        console.error('[serve-seo-meta] Error fetching collections list settings:', error);
        // Continue with fallback defaults - will be handled below
      }
    } else {
      // For other pages (home, shop, about, contact, custom_candles)
      console.log('[serve-seo-meta] Fetching SEO settings for page type:', parsed.pageType, 'language:', parsed.language);
      try {
        const pageSettings = await withTimeout(
          fetchSEOSettings(supabaseUrl, supabaseKey, parsed.pageType, parsed.language),
          5000,
          null
        );
        console.log('[serve-seo-meta] SEO settings retrieved:', pageSettings ? {
          title: pageSettings.title || '(empty)',
          description: pageSettings.description ? pageSettings.description.substring(0, 50) + '...' : '(empty)',
          hasImage: !!pageSettings.og_image_url,
          image: pageSettings.og_image_url || '(empty)'
        } : 'null - no settings found in database');
        
        if (pageSettings) {
          title = pageSettings.title;
          description = pageSettings.description;
          keywords = pageSettings.keywords;
          image = pageSettings.og_image_url;
          noindex = pageSettings.noindex;
          console.log('[serve-seo-meta] Using SEO settings:', { title, description: description?.substring(0, 50) + '...', image });
        } else {
          console.warn('[serve-seo-meta] No SEO settings found for page type:', parsed.pageType, '- will use fallback defaults');
        }
      } catch (error) {
        console.error('[serve-seo-meta] Error fetching page settings:', error);
        // Continue with fallback defaults - will be handled below
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
    
    // Construct full URL - IMPORTANT: Use the original domain, not Supabase URL
    // This ensures og:url points to the actual site URL, not the Edge Function URL
    const baseUrl = 'https://spirit-candle.com';
    const fullUrl = `${baseUrl}${actualPath}`;
    const canonicalUrl = fullUrl;
    
    // Final values being used
    console.log('[serve-seo-meta] Final values being used:', {
      title: title || '(empty - using fallback)',
      description: description ? description.substring(0, 50) + '...' : '(empty - using fallback)',
      image: image || '(empty - using default)',
      url: fullUrl,
      canonicalUrl: canonicalUrl,
      actualPath: actualPath,
      pageType: parsed.pageType,
      language: parsed.language,
      requestUrl: req.url
    });
    
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
    console.error('[serve-seo-meta] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[serve-seo-meta] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      url: req.url,
      method: req.method,
      userAgent: req.headers.get('user-agent'),
      actualPath: actualPath || '/'
    });
    
    // Construct the correct URL even on error
    const baseUrl = 'https://spirit-candle.com';
    const errorPath = actualPath || '/';
    const errorUrl = `${baseUrl}${errorPath}`;
    
    // Return a proper HTML response even on error, so crawlers can still see something
    const errorHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SPIRIT CANDLES — Reborn Your Nature</title>
  <meta name="description" content="Discover SPIRIT CANDLES luxury soy candles inspired by iconic fragrances and handcrafted with natural soy wax.">
  <meta property="og:title" content="SPIRIT CANDLES — Reborn Your Nature">
  <meta property="og:description" content="Discover SPIRIT CANDLES luxury soy candles inspired by iconic fragrances and handcrafted with natural soy wax.">
  <meta property="og:image" content="https://spirit-candle.com/spiritcandles/og-image-default.jpg">
  <meta property="og:url" content="${errorUrl}">
  <meta property="og:type" content="website">
</head>
<body>
  <h1>SPIRIT CANDLES</h1>
</body>
</html>`;
    
    return new Response(errorHtml, {
      status: 200, // Return 200 even on error so crawlers see the fallback HTML
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  }
});

