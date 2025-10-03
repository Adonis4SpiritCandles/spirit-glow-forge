import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, country = 'pl' } = await req.json();

    if (!query || query.trim().length < 3) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    const apiKey = Deno.env.get('GEOAPIFY_API_KEY');
    if (!apiKey) {
      console.error('GEOAPIFY_API_KEY not configured');
      throw new Error('Address autocomplete service not configured');
    }

    // Use Geoapify Autocomplete API
    const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete');
    url.searchParams.append('text', query);
    url.searchParams.append('apiKey', apiKey);
    url.searchParams.append('lang', 'en');
    
    // Bias towards the specified country
    if (country) {
      url.searchParams.append('filter', `countrycode:${country.toLowerCase()}`);
    }

    console.log('Fetching address suggestions for:', query);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Geoapify API error:', errorText);
      throw new Error('Failed to fetch address suggestions');
    }

    const data = await response.json();

    // Transform Geoapify results to our format
    const suggestions = data.features?.map((feature: any) => {
      const props = feature.properties;
      return {
        description: props.formatted || props.address_line1,
        street: props.street || props.address_line1 || '',
        city: props.city || props.town || props.village || '',
        postalCode: props.postcode || '',
        country: props.country_code?.toUpperCase() || '',
        countryName: props.country || ''
      };
    }) || [];

    console.log(`Returning ${suggestions.length} suggestions`);

    return new Response(
      JSON.stringify({ suggestions }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in places-autocomplete:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        suggestions: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
