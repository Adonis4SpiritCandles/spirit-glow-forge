import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CustomRequestData {
  name: string;
  email: string;
  fragrance: string;
  customFragrance?: string;
  labelText?: string;
  message?: string;
  quantity: number;
  language: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: CustomRequestData = await req.json();
    const { name, email, fragrance, customFragrance, labelText, message, quantity, language } = requestData;

    // Admin notification email
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D4AF37;">New Custom Candle Request - SPIRIT CANDLES</h1>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
          <h2>Customer Details:</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          
          <h2>Order Details:</h2>
          <p><strong>Fragrance:</strong> ${fragrance}</p>
          ${customFragrance ? `<p><strong>Custom Fragrance Description:</strong> ${customFragrance}</p>` : ''}
          ${labelText ? `<p><strong>Label Text:</strong> ${labelText}</p>` : ''}
          <p><strong>Quantity:</strong> ${quantity}</p>
          ${message ? `<p><strong>Additional Notes:</strong> ${message}</p>` : ''}
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">This request requires manual follow-up and quote preparation.</p>
      </div>
    `;

    // User confirmation email
    const userEmailHtml = language === 'pl' ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D4AF37;">Dziękujemy za Twoje zapytanie - SPIRIT CANDLES</h1>
        <p>Cześć ${name},</p>
        <p>Otrzymaliśmy Twoje zapytanie o personalizowaną świecę. Skontaktujemy się z Tobą w ciągu 24-72 godzin z ofertą cenową i szczegółami.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Podsumowanie zapytania:</h2>
          <p><strong>Zapach:</strong> ${fragrance}</p>
          ${customFragrance ? `<p><strong>Opis zapachu:</strong> ${customFragrance}</p>` : ''}
          ${labelText ? `<p><strong>Tekst na etykiecie:</strong> ${labelText}</p>` : ''}
          <p><strong>Ilość:</strong> ${quantity}</p>
        </div>
        
        <p>Pozdrawiamy,<br>Zespół SPIRIT CANDLES</p>
        <p style="color: #666; font-size: 12px;">m5moffice@proton.me | +48 729877557</p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D4AF37;">Thank You for Your Inquiry - SPIRIT CANDLES</h1>
        <p>Hello ${name},</p>
        <p>We have received your custom candle request. We'll contact you within 24-72 hours with a quote and further details.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Request Summary:</h2>
          <p><strong>Fragrance:</strong> ${fragrance}</p>
          ${customFragrance ? `<p><strong>Custom Fragrance:</strong> ${customFragrance}</p>` : ''}
          ${labelText ? `<p><strong>Label Text:</strong> ${labelText}</p>` : ''}
          <p><strong>Quantity:</strong> ${quantity}</p>
        </div>
        
        <p>Best regards,<br>SPIRIT CANDLES Team</p>
        <p style="color: #666; font-size: 12px;">m5moffice@proton.me | +48 729877557</p>
      </div>
    `;

    // Send admin notification
    await resend.emails.send({
      from: "SPIRIT CANDLES <onboarding@resend.dev>",
      to: ["m5moffice@proton.me"],
      cc: ["spiritcandlesite@gmail.com"],
      subject: `New Custom Candle Request from ${name}`,
      html: adminEmailHtml,
    });

    // Send user confirmation
    await resend.emails.send({
      from: "SPIRIT CANDLES <onboarding@resend.dev>",
      to: [email],
      subject: language === 'pl' ? 'Potwierdzenie zapytania - SPIRIT CANDLES' : 'Request Confirmation - SPIRIT CANDLES',
      html: userEmailHtml,
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-custom-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
