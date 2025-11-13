import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let target = 'UNKNOWN';
  
  try {
    // Parse request body
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      console.error('Error parsing request body:', e);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body',
          base: 'PLN',
          target: 'PLN',
          rate: 1
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    target = body.target;
    
    console.log('Request received for target currency:', target);
    
    if (!target) {
      throw new Error('Target currency is required');
    }

    // Se target è PLN, restituisci rate 1
    if (target === 'PLN') {
      return new Response(
        JSON.stringify({ 
          base: 'PLN',
          target: 'PLN',
          rate: 1,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Usa exchangerate-api.com (gratuito, supporta PLN come base)
    // Questa API restituisce tutti i tassi di cambio da PLN a tutte le altre valute
    const url = `https://api.exchangerate-api.com/v4/latest/PLN`;
    
    console.log(`Fetching exchange rates from PLN to all currencies`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SpiritCandles/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`exchangerate-api.com returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('API Response:', JSON.stringify(data).substring(0, 200));
    
    // Verifica che la risposta contenga i rates
    if (!data.rates || typeof data.rates !== 'object') {
      throw new Error('Invalid response format: rates not found');
    }
    
    const rate = data.rates[target];
    
    if (!rate || isNaN(rate) || rate <= 0) {
      console.error(`Invalid exchange rate for ${target}:`, rate);
      throw new Error(`Invalid exchange rate for ${target}: ${rate}`);
    }
    
    console.log(`Exchange rate PLN to ${target}: ${rate}`);
    
    return new Response(
      JSON.stringify({ 
        base: 'PLN',
        target: target,
        rate: rate,
        timestamp: data.date || new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching exchange rates:', error);
    console.error('Error stack:', error?.stack);
    // IMPORTANTE: Non restituire rate: 1 in caso di errore!
    // Restituisci un errore chiaro così il frontend può gestirlo
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to fetch exchange rates',
        base: 'PLN',
        target: target || 'UNKNOWN',
        rate: null // Non restituire rate: 1, così il frontend sa che c'è un errore
      }),
      { 
        status: 500, // Restituisci 500 per errori reali
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
