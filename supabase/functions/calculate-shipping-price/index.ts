import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Address {
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  email?: string;
  phone?: string;
}

interface Parcel {
  weight: number;
  length: number;
  width: number;
  height: number;
}

interface CalculateRequest {
  receiver: Address;
  parcels: Parcel[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const { receiver, parcels }: CalculateRequest = await req.json();

    // Validate input
    if (!receiver || !parcels || parcels.length === 0) {
      throw new Error('Missing receiver address or parcels');
    }

    // Get access token using Supabase client (no raw HTTP to functions)
    const { data: tokenData, error: tokenError } = await supabaseClient.functions.invoke('get-furgonetka-token');
    if (tokenError || !tokenData?.access_token) {
      console.error('Token fetch error:', tokenError, tokenData);
      throw new Error('Failed to get Furgonetka token');
    }
    const access_token = tokenData.access_token;

    // Prepare sender/pickup address (your warehouse)
    const sender = {
      name: "Spirit Candle",
      street: "Via Example 123",
      city: "Warszawa",
      post_code: "00-001",
      country: "PL",
      email: "m5moffice@proton.me",
      phone: "+48123456789"
    };

    // Prepare calculate request for Furgonetka API
    const calculateData = {
      pickup: sender,
      sender: sender,
      receiver: {
        name: receiver.name,
        street: receiver.street,
        city: receiver.city,
        post_code: receiver.postalCode,
        country: receiver.country,
        email: receiver.email || '',
        phone: receiver.phone || ''
      },
      parcels: parcels.map(p => ({
        weight: p.weight,
        length: p.length,
        width: p.width,
        height: p.height
      })),
      type: 'package'
    };

    console.log('Calculating shipping prices with:', JSON.stringify(calculateData));

    // Call Furgonetka calculate-price API
    const priceResponse = await fetch('https://api.sandbox.furgonetka.pl/packages/calculate-price', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/vnd.furgonetka.v1+json',
        'Accept': 'application/vnd.furgonetka.v1+json',
        'X-Language': 'en_GB',
      },
      body: JSON.stringify(calculateData),
    });

    if (!priceResponse.ok) {
      const errorText = await priceResponse.text();
      console.error('Furgonetka API error:', priceResponse.status, priceResponse.statusText, errorText);
      throw new Error(`Failed to calculate prices: ${priceResponse.status} ${priceResponse.statusText} ${errorText}`);
    }

    const priceResult = await priceResponse.json();
    console.log('Price calculation result:', JSON.stringify(priceResult));

    // Transform response to our format
    const services = priceResult.services_prices || priceResult.services || [];
    const options = services.map((service: any) => ({
      service_id: service.service_id || service.id,
      service_name: service.service_name || service.name,
      carrier: service.carrier || 'Unknown',
      delivery_type: service.delivery_type || 'courier',
      price: {
        net: service.price?.net || service.net_price || 0,
        gross: service.price?.gross || service.gross_price || 0,
        currency: service.price?.currency || service.currency || 'PLN'
      },
      eta: service.eta || service.delivery_time || null
    }));

    return new Response(
      JSON.stringify({ options }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in calculate-shipping-price:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
