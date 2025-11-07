import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
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
      .select('id, name_en, name_pl, updated_at')
      .eq('published', true);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw productsError;
    }

    const baseUrl = 'https://spirit-candle.com';
    const currentDate = new Date().toISOString();

    // Build sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
    sitemap += 'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    // Helper function to add URL with hreflang support
    const addUrl = (path: string, priority: string, changefreq: string, lastmod?: string) => {
      // English version
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/en${path}</loc>\n`;
      sitemap += `    <lastmod>${lastmod || currentDate}</lastmod>\n`;
      sitemap += `    <changefreq>${changefreq}</changefreq>\n`;
      sitemap += `    <priority>${priority}</priority>\n`;
      sitemap += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en${path}" />\n`;
      sitemap += `    <xhtml:link rel="alternate" hreflang="pl" href="${baseUrl}/pl${path}" />\n`;
      sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en${path}" />\n`;
      sitemap += '  </url>\n';

      // Polish version
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/pl${path}</loc>\n`;
      sitemap += `    <lastmod>${lastmod || currentDate}</lastmod>\n`;
      sitemap += `    <changefreq>${changefreq}</changefreq>\n`;
      sitemap += `    <priority>${priority}</priority>\n`;
      sitemap += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en${path}" />\n`;
      sitemap += `    <xhtml:link rel="alternate" hreflang="pl" href="${baseUrl}/pl${path}" />\n`;
      sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en${path}" />\n`;
      sitemap += '  </url>\n';
    };

    // Homepage
    addUrl('/', '1.0', 'daily');

    // Main pages
    addUrl('/shop', '0.9', 'daily');
    addUrl('/collections', '0.8', 'weekly');
    addUrl('/about', '0.6', 'monthly');
    addUrl('/contact', '0.6', 'monthly');
    addUrl('/faq', '0.6', 'monthly');

    // Static/legal pages
    addUrl('/privacy-policy', '0.4', 'yearly');
    addUrl('/cookie-policy', '0.4', 'yearly');
    addUrl('/terms-of-sale', '0.4', 'yearly');
    addUrl('/shipping-returns', '0.5', 'monthly');
    addUrl('/legal-notice', '0.4', 'yearly');
    addUrl('/accessibility', '0.4', 'yearly');

    // Feature pages
    addUrl('/scent-quiz', '0.7', 'monthly');
    addUrl('/loyalty', '0.6', 'monthly');
    addUrl('/wishlist', '0.5', 'weekly');

    // Custom Candles page
    addUrl('/custom-candles', '0.7', 'monthly');

    // Product pages
    if (products && products.length > 0) {
      products.forEach((product) => {
        const lastmod = product.updated_at || currentDate;
        addUrl(`/product/${product.id}`, '0.8', 'weekly', lastmod);
      });
    }

    // Fetch public profiles for sitemap
    const { data: publicProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, updated_at')
      .eq('public_profile', true);

    if (!profilesError && publicProfiles && publicProfiles.length > 0) {
      publicProfiles.forEach((profile) => {
        const lastmod = profile.updated_at || currentDate;
        addUrl(`/profile/${profile.user_id}`, '0.6', 'weekly', lastmod);
      });
    }

    sitemap += '</urlset>';

    console.log(`Sitemap generated successfully with ${products?.length || 0} products and ${publicProfiles?.length || 0} public profiles`);

    return new Response(sitemap, {
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});