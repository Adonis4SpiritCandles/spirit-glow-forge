import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache per 1 ora
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all published products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name_en, name_pl, image_url, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false });

    if (productsError) {
      console.error('[generate-sitemap] Error fetching products:', productsError);
      // Continue with empty products array instead of throwing
    }

    // Fetch all active collections with slug
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('id, name_en, name_pl, slug, image_url, cover_image_url, updated_at')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (collectionsError) {
      console.error('[generate-sitemap] Error fetching collections:', collectionsError);
      // Continue with empty collections array instead of throwing
    }

    const baseUrl = 'https://spirit-candle.com';
    const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Build sitemap XML with image support
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
    sitemap += 'xmlns:xhtml="http://www.w3.org/1999/xhtml" ';
    sitemap += 'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    // Helper function to add URL (single entry, no EN/PL duplication)
    // NOTE: Site does NOT use /en or /pl prefixes in URLs
    const addUrl = (
      path: string, 
      priority: string, 
      changefreq: string, 
      lastmod?: string,
      imageUrl?: string,
      imageTitle?: string
    ) => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${path}</loc>\n`;
      sitemap += `    <lastmod>${lastmod || currentDate}</lastmod>\n`;
      sitemap += `    <changefreq>${changefreq}</changefreq>\n`;
      sitemap += `    <priority>${priority}</priority>\n`;
      
      // Image if provided
      if (imageUrl) {
        sitemap += `    <image:image>\n`;
        sitemap += `      <image:loc>${imageUrl}</image:loc>\n`;
        if (imageTitle) {
          sitemap += `      <image:title>${imageTitle}</image:title>\n`;
        }
        sitemap += `    </image:image>\n`;
      }
      
      // hreflang: indicate both languages are available (same URL, different content based on Accept-Language)
      sitemap += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${path}" />\n`;
      sitemap += `    <xhtml:link rel="alternate" hreflang="pl" href="${baseUrl}${path}" />\n`;
      sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${path}" />\n`;
      sitemap += '  </url>\n';
    };

    // Homepage (highest priority)
    addUrl('/', '1.0', 'daily', currentDate, 'https://spirit-candle.com/spiritcandles/spirit-logo.png', 'SPIRIT CANDLES Homepage');

    // Main pages
    addUrl('/shop', '0.9', 'daily', currentDate);
    addUrl('/collections', '0.8', 'weekly', currentDate);
    addUrl('/about', '0.7', 'monthly', currentDate);
    addUrl('/contact', '0.7', 'monthly', currentDate);
    addUrl('/faq', '0.7', 'monthly', currentDate);
    addUrl('/custom-candles', '0.8', 'monthly', currentDate);

    // Feature pages
    addUrl('/scent-quiz', '0.7', 'monthly', currentDate);
    addUrl('/loyalty', '0.6', 'monthly', currentDate);
    addUrl('/wishlist', '0.5', 'weekly', currentDate);

    // Static/legal pages (lower priority, less frequent updates)
    addUrl('/privacy-policy', '0.4', 'yearly', currentDate);
    addUrl('/cookie-policy', '0.4', 'yearly', currentDate);
    addUrl('/terms-of-sale', '0.4', 'yearly', currentDate);
    addUrl('/shipping-returns', '0.5', 'monthly', currentDate);
    addUrl('/legal-notice', '0.4', 'yearly', currentDate);
    addUrl('/data-request', '0.3', 'yearly', currentDate);
    addUrl('/accessibility', '0.4', 'yearly', currentDate);
    addUrl('/all-notices', '0.3', 'yearly', currentDate);
    addUrl('/privacy-registration', '0.3', 'yearly', currentDate);

    // Collections with images (using slug, not ID)
    if (collections && collections.length > 0) {
      collections.forEach((collection) => {
        const lastmod = collection.updated_at 
          ? new Date(collection.updated_at).toISOString().split('T')[0]
          : currentDate;
        const imageUrl = collection.cover_image_url || collection.image_url;
        const collectionName = collection.name_en || collection.name_pl;
        
        // Use slug for URL, not ID
        if (collection.slug) {
          addUrl(
            `/collections/${collection.slug}`,
            '0.7',
            'weekly',
            lastmod,
            imageUrl || undefined,
            collectionName || undefined
          );
        }
      });
    }

    // Products with images
    if (products && products.length > 0) {
      products.forEach((product) => {
        const lastmod = product.updated_at 
          ? new Date(product.updated_at).toISOString().split('T')[0]
          : currentDate;
        const productName = product.name_en || product.name_pl;
        
        addUrl(
          `/product/${product.id}`,
          '0.8',
          'weekly',
          lastmod,
          product.image_url || undefined,
          productName || undefined
        );
      });
    }

    // Fetch public profiles for sitemap (optional)
    const { data: publicProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, updated_at')
      .eq('public_profile', true)
      .limit(1000); // Limit to prevent sitemap from being too large

    if (!profilesError && publicProfiles && publicProfiles.length > 0) {
      publicProfiles.forEach((profile) => {
        const lastmod = profile.updated_at 
          ? new Date(profile.updated_at).toISOString().split('T')[0]
          : currentDate;
        addUrl(`/profile/${profile.user_id}`, '0.5', 'monthly', lastmod);
      });
    }

    sitemap += '</urlset>';

    const totalUrls = 
      1 + // homepage
      9 + // main pages
      9 + // static/legal pages
      (collections?.filter(c => c.slug).length || 0) +
      (products?.length || 0) +
      (publicProfiles?.length || 0);

    console.log(`[generate-sitemap] Generated sitemap with ${totalUrls} URLs (${products?.length || 0} products, ${collections?.filter(c => c.slug).length || 0} collections, ${publicProfiles?.length || 0} profiles)`);

    return new Response(sitemap, {
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('[generate-sitemap] Error generating sitemap:', error);
    
    // Return minimal valid sitemap on error
    const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://spirit-candle.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    
    return new Response(errorSitemap, {
      status: 200, // Return 200 even on error to prevent crawler issues
      headers: corsHeaders,
    });
  }
});