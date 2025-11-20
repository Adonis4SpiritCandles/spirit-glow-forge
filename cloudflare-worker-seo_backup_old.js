// Cloudflare Worker per proxy pass SEO meta tags
// Questo worker intercetta i crawler e fa proxy pass all'Edge Function
// mantenendo l'URL originale nel browser/crawler

const SUPABASE_EDGE_FUNCTION_URL = 'https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/serve-seo-meta';
const SUPABASE_SITEMAP_FUNCTION_URL = 'https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/generate-sitemap';
const ORIGINAL_DOMAIN = 'https://spirit-candle.com';

// Lista di User-Agent dei crawler
const CRAWLER_PATTERNS = [
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

function isCrawler(userAgent) {
  if (!userAgent) return false;
  const lowerUA = userAgent.toLowerCase();
  return CRAWLER_PATTERNS.some(pattern => lowerUA.includes(pattern.toLowerCase()));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';
    
    // Serve sitemap.xml from Edge Function (auto-generated)
    if (url.pathname === '/sitemap.xml') {
      try {
        const sitemapResponse = await fetch(SUPABASE_SITEMAP_FUNCTION_URL);
        const sitemapContent = await sitemapResponse.text();
        
        return new Response(sitemapContent, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          },
        });
      } catch (error) {
        console.error('[Cloudflare Worker] Error fetching sitemap:', error);
        // In caso di errore, passa la richiesta al server originale
        return fetch(request);
      }
    }
    
    // IMPORTANTE: Lascia passare direttamente immagini e asset statici
    // I crawler devono poter scaricare le immagini senza passare per l'Edge Function
    // Questo risolve il problema del Content-Type non valido per le immagini OG
    const staticExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', 
                              '.js', '.css', '.woff', '.woff2', '.ttf', '.eot', '.json', '.xml', '.txt',
                              '.mp4', '.mp3', '.pdf', '.zip'];
    const isStaticAsset = staticExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
    
    if (isStaticAsset) {
      // Per asset statici (immagini, CSS, JS, font, etc.), passa direttamente al server originale
      // Questo garantisce che vengano serviti con il Content-Type corretto
      console.log(`[Cloudflare Worker] Static asset detected: ${url.pathname}, passing through`);
      return fetch(request);
    }
    
    // Solo per crawler e pagine HTML: fai proxy pass all'Edge Function
    if (isCrawler(userAgent)) {
      // Costruisci l'URL dell'Edge Function con il path originale
      const originalPath = url.pathname + url.search;
      const edgeFunctionUrl = `${SUPABASE_EDGE_FUNCTION_URL}?path=${encodeURIComponent(originalPath)}`;
      
      console.log(`[Cloudflare Worker] Crawler detected: ${userAgent.substring(0, 50)}`);
      console.log(`[Cloudflare Worker] Original path: ${originalPath}`);
      console.log(`[Cloudflare Worker] Proxying to: ${edgeFunctionUrl}`);
      
      // Crea una nuova richiesta all'Edge Function
      const edgeRequest = new Request(edgeFunctionUrl, {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers),
          // Mantieni l'User-Agent originale
          'User-Agent': userAgent,
          // Aggiungi header per indicare l'URL originale
          'X-Original-URL': request.url,
          'X-Forwarded-Host': url.host,
          'X-Forwarded-Proto': url.protocol.replace(':', ''),
        },
        body: request.body,
      });
      
      try {
        // Fai fetch all'Edge Function
        const response = await fetch(edgeRequest);
        
        // Ottieni l'HTML dalla risposta
        const html = await response.text();
        
        // IMPORTANTE: Sostituisci eventuali riferimenti all'URL di Supabase con l'URL originale
        // Questo assicura che og:url e canonical siano sempre corretti
        const correctedHtml = html.replace(
          new RegExp('https://fhtuqmdlgzmpsbflxhra\\.supabase\\.co/functions/v1/serve-seo-meta[^"\'\\s]*', 'g'),
          ORIGINAL_DOMAIN + originalPath
        );
        
        // Ritorna la risposta con l'HTML corretto
        // IMPORTANTE: Usa l'URL originale nella risposta, non quello di Supabase
        return new Response(correctedHtml, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers),
            'Content-Type': 'text/html; charset=utf-8',
            // Assicurati che i meta tag siano sempre corretti
            'X-Original-URL': request.url,
            // Cache per 1 ora
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          },
        });
      } catch (error) {
        console.error('[Cloudflare Worker] Error proxying to Edge Function:', error);
        // In caso di errore, passa la richiesta al server originale
        return fetch(request);
      }
    }
    
    // Per utenti normali (non crawler), passa la richiesta al server originale
    // Cloudflare passerà automaticamente la richiesta a Hostinger
    return fetch(request);
  },
};