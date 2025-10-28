import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    const { email, name } = await req.json();

    const discountCode = "WELCOME10";
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}</style></head>
        <body style="background-color:#f4f4f4;padding:20px;">
          <div style="max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:10px;">
            <img src="https://spirit-candle.com/ImageFiles/spirit-logo-BluOP5mb.png" alt="Spirit Candles" style="width:150px;margin-bottom:20px;">
            <h1 style="color:#8B4513;">Welcome to Spirit Candles! 🕯️</h1>
            <p>Hi ${name || 'there'},</p>
            <p>Thank you for subscribing to our newsletter! We're excited to have you join our community.</p>
            <p>As a welcome gift, here's <strong>10% off your first order</strong>:</p>
            <div style="background:#8B4513;color:#fff;padding:15px;text-align:center;border-radius:5px;margin:20px 0;">
              <h2 style="margin:0;font-size:24px;">${discountCode}</h2>
            </div>
            <p>Use this code at checkout to enjoy your discount!</p>
            <a href="https://spirit-candle.com/shop" style="display:inline-block;background:#8B4513;color:#fff;padding:12px 30px;text-decoration:none;border-radius:5px;margin:20px 0;">Shop Now</a>
            <p style="color:#666;font-size:14px;margin-top:30px;">Dziękujemy za zapisanie się! Oto Twój kod rabatowy: <strong>${discountCode}</strong></p>
          </div>
        </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "Spirit Candles <noreply@spirit-candle.com>",
        to: [email],
        subject: "Welcome to Spirit Candles - 10% Off Inside! 🎁",
        html: emailHtml,
      }),
    });

    if (!res.ok) throw new Error("Failed to send email");
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

serve(handler);
