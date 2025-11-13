import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Ottieni IP del client dalla request
    // x-forwarded-for contiene l'IP reale del client (se c'è un proxy)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

    // Se IP non disponibile o è localhost, fallback a Polonia
    if (clientIp === 'unknown' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.')) {
      return new Response(
        JSON.stringify({ 
          country: 'PL', 
          country_name: 'Poland', 
          currency: 'PLN' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Usa ipapi.co per rilevare il paese (gratuito, 1500 richieste/giorno)
    // Alternativa: ip-api.com (gratuito, 45 richieste/minuto)
    const response = await fetch(`https://ipapi.co/${clientIp}/json/`, {
      headers: {
        'User-Agent': 'SpiritCandles/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`ipapi.co returned ${response.status}`);
    }

    const data = await response.json();
    
    // Verifica se la risposta contiene error
    if (data.error) {
      throw new Error(data.reason || 'Failed to detect country');
    }
    
    const countryCode = data.country_code || 'PL';
    const countryName = data.country_name || 'Poland';
    const currency = data.currency || 'PLN';
    
    console.log(`Detected country: ${countryCode} (${countryName}) for IP: ${clientIp}`);
    
    return new Response(
      JSON.stringify({ 
        country: countryCode,
        country_name: countryName,
        currency: currency
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error detecting country:', error);
    // Fallback a Polonia se fallisce
    return new Response(
      JSON.stringify({ 
        country: 'PL', 
        country_name: 'Poland', 
        currency: 'PLN' 
      }),
      { 
        status: 200, // Restituisci 200 anche in caso di errore (fallback)
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});



