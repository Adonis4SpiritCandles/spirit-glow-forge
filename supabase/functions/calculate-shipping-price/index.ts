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
    const apiBaseUrl = Deno.env.get('FURGONETKA_API_URL') || 'https://api.sandbox.furgonetka.pl';
  
    // Prepare sender/pickup address (your warehouse)
    const sender = {
      name: "Spirit Candle",
      street: "Aleja Krakowska 61",
      city: "Warszawa",
      postcode: "02-180",
      country_code: "PL",
      email: "m5moffice@proton.me",
      phone: "+48501234567"
    };

    // Normalize country to ISO-2 if a full name is provided
    const countryNameToCode: Record<string, string> = {
      poland: 'PL', italy: 'IT', germany: 'DE', france: 'FR', spain: 'ES',
      'united kingdom': 'GB', uk: 'GB', england: 'GB', portugal: 'PT',
      netherlands: 'NL', belgium: 'BE', austria: 'AT', switzerland: 'CH',
      czechia: 'CZ', 'czech republic': 'CZ', slovakia: 'SK', ukraine: 'UA',
      lithuania: 'LT', latvia: 'LV', estonia: 'EE'
    };
    const countryCode = receiver.country?.length === 2
      ? receiver.country.toUpperCase()
      : (countryNameToCode[receiver.country?.toLowerCase?.() ?? ''] || receiver.country);

    // Normalize postcode for PL (NN-NNN)
    const normalizedPostcode = (countryCode === 'PL' && receiver.postalCode)
      ? (() => {
          const digits = String(receiver.postalCode).replace(/\D/g, '');
          return digits.length === 5 ? `${digits.slice(0,2)}-${digits.slice(2)}` : receiver.postalCode;
        })()
      : receiver.postalCode;

    // Build the package payload as required by Furgonetka (must be nested under "package")
    const packagePayload = {
      pickup: sender,
      sender: sender,
      receiver: {
        name: receiver.name,
        street: receiver.street,
        city: receiver.city,
        postcode: normalizedPostcode,
        country_code: countryCode,
        email: receiver.email || '',
        phone: receiver.phone || ''
      },
      parcels: parcels.map(p => {
        const weight = Math.max(0.1, Number(p.weight || 1));
        const length = Math.max(1, Number(p.length || 10));
        const width = Math.max(1, Number(p.width || 10));
        const height = Math.max(1, Number(p.height || 10));
        return {
          weight,
          length,
          width,
          height,
          depth: height // Furgonetka validate expects `depth` for some carriers
        };
      }),
      type: 'package'
    };
    console.log('Validating package with:', JSON.stringify(packagePayload));

    // 1) VALIDATE PACKAGE FIRST (soft validation)
    // Note: API may expect top-level package fields for this endpoint. We won't block on failure; we log and continue to pricing.
    let preValidationErrors: any[] = [];
    try {
      const validateResponse = await fetch('${apiBaseUrl}/packages/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/vnd.furgonetka.v1+json',
          'Accept': 'application/vnd.furgonetka.v1+json',
          'X-Language': 'en_GB',
        },
        body: JSON.stringify(packagePayload), // top-level payload
      });
      let validateJson: any = null;
      try { validateJson = await validateResponse.clone().json(); } catch (_) {}
      if (!validateResponse.ok || (validateJson && Array.isArray(validateJson.errors) && validateJson.errors.length)) {
        console.warn('Validation failed (soft):', validateResponse.status, validateResponse.statusText, JSON.stringify(validateJson));
        preValidationErrors = (validateJson?.errors || []).map((e: any) => ({ path: e.path, message: e.message, code: e.code }));
      }
    } catch (e) {
      console.warn('Validation request error (ignored):', e);
    }

    // 2) FETCH ACTIVE ACCOUNT SERVICES
    const servicesResponse = await fetch('${apiBaseUrl}/account/services', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/vnd.furgonetka.v1+json',
        'X-Language': 'en_GB',
      }
    });

    if (!servicesResponse.ok) {
      const errorText = await servicesResponse.text();
      console.error('Furgonetka services error:', servicesResponse.status, servicesResponse.statusText, errorText);
      throw new Error(`Failed to load services: ${servicesResponse.status} ${servicesResponse.statusText} ${errorText}`);
    }

    const servicesJson = await servicesResponse.json();
    const rawServices = servicesJson.services || servicesJson || [];

    // Compute total weight to apply simple whitelist rules (e.g., GLS >= 1kg)
    const totalWeight = parcels.reduce((sum, p) => sum + Number(p.weight || 0), 0);

    const filteredServices = (rawServices || []).filter((s: any) => {
      const name = (s.service || s.name || '').toString().toLowerCase();
      const blacklist = ['meest', 'swiatprzesylek', 'postivo', 'deligoo', 'furgonetka_gielda', 'gielda'];
      if (blacklist.some(b => name.includes(b))) return false;
      if (totalWeight < 1 && name === 'gls') return false; // GLS requires >= 1kg
      return true;
    });

    const serviceIds = Array.from(new Map(filteredServices.map((s: any) => {
      const id = s.id ?? s.service_id ?? s.serviceId;
      const type = s.type || s.service_type || 'package';
      if (!s.type && !s.service_type) {
        console.warn(`Service ${id} missing type field, using fallback 'package'`);
      }
      return [id, { service_id: id, type }];
    })).values()).filter(s => s.service_id);

    console.log('Using services for pricing (with type):', JSON.stringify(serviceIds));

    // 3) CALCULATE PRICE (package must be nested and include explicit services)
    const calculateBody = {
      package: packagePayload,
      services: serviceIds,
    };

    console.log('Calculating shipping prices with:', JSON.stringify(calculateBody));

    const priceResponse = await fetch('${apiBaseUrl}/packages/calculate-price', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/vnd.furgonetka.v1+json',
        'Accept': 'application/vnd.furgonetka.v1+json',
        'X-Language': 'en_GB',
      },
      body: JSON.stringify(calculateBody),
    });

    if (!priceResponse.ok) {
      const errorText = await priceResponse.text();
      console.error('Furgonetka API error:', priceResponse.status, priceResponse.statusText, errorText);
      throw new Error(`Failed to calculate prices: ${priceResponse.status} ${priceResponse.statusText} ${errorText}`);
    }

    const priceResult = await priceResponse.json();
    console.log('Price calculation result:', JSON.stringify(priceResult));
    
    // Log first 3 service prices for debugging
    const rawPrices = priceResult.services_prices || priceResult.services || [];
    console.log('First 3 services_prices (with errors):', JSON.stringify(
      rawPrices.slice(0, 3).map((sp: any) => ({
        service_id: sp.service_id,
        service: sp.service,
        available: sp.available,
        errors: sp.errors,
        pricing: sp.pricing,
        lowest_price: sp.lowest_price
      })), null, 2
    ));

    // Transform response to our format with filtering and de-duplication

    const parsePrice = (item: any) => {
      const net = item.pricing?.net_price ?? item.pricing?.price_net ?? item.price?.net ?? item.net_price ?? 0;
      const gross = item.pricing?.gross_price ?? item.pricing?.price_gross ?? item.price?.gross ?? item.gross_price ?? 0;
      const currency = item.pricing?.currency ?? item.price?.currency ?? item.currency ?? 'PLN';
      return { net: Number(net) || 0, gross: Number(gross) || 0, currency };
    };

    // Deduplicate by service_id and keep the lowest gross price
    const dedupMap = new Map<number | string, any>();
    for (const s of rawPrices) {
      const id = s.service_id ?? s.id;
      if (!id) continue;
      const price = parsePrice(s);
      const available = (typeof s.available === 'boolean') ? s.available : true;
      if (!available || price.gross <= 0) continue;

      const existing = dedupMap.get(id);
      if (!existing || price.gross < existing.price.gross) {
        dedupMap.set(id, {
          service_id: id,
          service_name: s.service_name || s.name || s.service || 'Standard Delivery',
          carrier: s.carrier || s.provider || s.service || 'Unknown',
          delivery_type: s.delivery_type || 'courier',
          price,
          eta: s.eta || s.delivery_time || null,
        });
      }
    }

    const options = Array.from(dedupMap.values());

    // If nothing valid returned, send a helpful message back
    if (options.length === 0) {
      console.warn('No priced services returned. Raw response:', JSON.stringify(priceResult));
      // Collect validation-like errors from carrier responses (if any)
      const validationErrors = (rawPrices || []).flatMap((sp: any) => Array.isArray(sp.errors) ? sp.errors.map((e: any) => ({
        service_id: sp.service_id ?? sp.id,
        carrier: sp.service || sp.name,
        path: e.path,
        message: e.message,
        code: e.code,
      })) : []);

      return new Response(
        JSON.stringify({ 
          options: [], 
          reason: 'validation_failed',
          message: 'Unable to price shipment. Please review address and parcel data.',
          validationErrors
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
