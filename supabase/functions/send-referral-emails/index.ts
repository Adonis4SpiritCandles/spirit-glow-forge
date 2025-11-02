import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReferralEmailRequest {
  referrerEmail: string;
  referrerName: string;
  refereeName: string;
  refereeEmail: string;
  language?: 'en' | 'pl';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { referrerEmail, referrerName, refereeName, refereeEmail, language = 'en' }: ReferralEmailRequest = await req.json();

    console.log(`[Referral Emails] Sending emails for referral: ${referrerEmail} referred ${refereeEmail}`);

    const isPl = language === 'pl';

    // 1. Email to REFERRER (person who shared the link) - 200 points earned
    await resend.emails.send({
      from: 'Spirit Candles <team@spirit-candle.com>',
      to: [referrerEmail],
      subject: isPl 
        ? '🎉 Gratulacje! Zdobyłeś 200 punktów!' 
        : '🎉 Congratulations! You earned 200 points!',
      html: `
        <!DOCTYPE html>
        <html>
          <head><style>body{font-family:Arial;line-height:1.6;}</style></head>
          <body style="background:#f4f4f4;padding:20px;">
            <div style="max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:10px;">
              <div style="text-align:center;margin-bottom:20px;">
                <img src="https://spirit-candle.com/ImageFiles/spirit-logo-BluOP5mb.png" alt="Spirit Candles" style="width:150px;">
              </div>
              <h1 style="color:#d4af37;text-align:center;">
                ${isPl ? '🎉 Wspaniałe wieści!' : '🎉 Great news!'}
              </h1>
              <p style="font-size:16px;">
                ${isPl ? `Cześć ${referrerName},` : `Hi ${referrerName},`}
              </p>
              <p style="font-size:16px;color:#666;">
                ${isPl 
                  ? `<strong>${refereeName}</strong> użył Twojego linku polecającego i właśnie założył konto w Spirit Candles!`
                  : `<strong>${refereeName}</strong> used your referral link and just created an account with Spirit Candles!`}
              </p>
              <div style="background:#f0f8ff;border-left:4px solid #d4af37;padding:20px;margin:30px 0;">
                <h2 style="margin:0;color:#d4af37;font-size:32px;">+200 points</h2>
                <p style="margin:5px 0;color:#666;">
                  ${isPl 
                    ? 'Zostały dodane do Twojego konta lojalnościowego!'
                    : 'Have been added to your loyalty account!'}
                </p>
              </div>
              <p style="font-size:16px;color:#666;">
                ${isPl 
                  ? 'Dziękujemy za rekomendację Spirit Candles! Kontynuuj dzielenie się swoim linkiem, aby zdobywać więcej punktów.'
                  : 'Thank you for recommending Spirit Candles! Keep sharing your link to earn more points.'}
              </p>
              <div style="text-align:center;margin:30px 0;">
                <a href="https://spirit-candle.com/loyalty-program" 
                   style="display:inline-block;background:#d4af37;color:#fff;padding:15px 30px;text-decoration:none;border-radius:5px;font-weight:bold;">
                  ${isPl ? 'Zobacz Swoje Punkty' : 'View Your Points'}
                </a>
              </div>
              <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
              <p style="font-size:12px;color:#999;text-align:center;">
                Spirit Candles | m5moffice@proton.me
              </p>
            </div>
          </body>
        </html>
      `,
    });

    // 2. Email to REFEREE (new user) - Welcome + 10% discount
    await resend.emails.send({
      from: 'Spirit Candles <team@spirit-candle.com>',
      to: [refereeEmail],
      subject: isPl 
        ? '🎁 Witaj w Spirit Candles! Twój kod rabatowy 10% czeka!' 
        : '🎁 Welcome to Spirit Candles! Your 10% discount awaits!',
      html: `
        <!DOCTYPE html>
        <html>
          <head><style>body{font-family:Arial;line-height:1.6;}</style></head>
          <body style="background:#f4f4f4;padding:20px;">
            <div style="max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:10px;">
              <div style="text-align:center;margin-bottom:20px;">
                <img src="https://spirit-candle.com/ImageFiles/spirit-logo-BluOP5mb.png" alt="Spirit Candles" style="width:150px;">
              </div>
              <h1 style="color:#d4af37;text-align:center;">
                ${isPl ? '✨ Witaj w rodzinie Spirit Candles!' : '✨ Welcome to the Spirit Candles family!'}
              </h1>
              <p style="font-size:16px;">
                ${isPl ? `Cześć ${refereeName},` : `Hi ${refereeName},`}
              </p>
              <p style="font-size:16px;color:#666;">
                ${isPl 
                  ? `Dziękujemy za dołączenie do nas dzięki poleceniu od <strong>${referrerName}</strong>!`
                  : `Thank you for joining us through a referral from <strong>${referrerName}</strong>!`}
              </p>
              <div style="background:#f9f9f9;border:2px dashed #d4af37;padding:30px;text-align:center;margin:30px 0;">
                <p style="margin:0;font-size:18px;color:#666;">
                  ${isPl ? 'Twój kod rabatowy 10%:' : 'Your 10% discount code:'}
                </p>
                <h2 style="margin:10px 0;color:#d4af37;font-size:36px;font-family:monospace;">REFERRAL10</h2>
                <p style="margin:0;font-size:14px;color:#999;">
                  ${isPl ? 'Użyj przy pierwszym zamówieniu!' : 'Use on your first order!'}
                </p>
              </div>
              <p style="font-size:16px;color:#666;">
                ${isPl 
                  ? 'Dodatkowo otrzymałeś <strong>100 punktów lojalnościowych</strong> do wykorzystania przy kolejnych zakupach!'
                  : 'Additionally, you received <strong>100 loyalty points</strong> to use on future purchases!'}
              </p>
              <div style="text-align:center;margin:30px 0;">
                <a href="https://spirit-candle.com/shop" 
                   style="display:inline-block;background:#d4af37;color:#fff;padding:15px 30px;text-decoration:none;border-radius:5px;font-weight:bold;">
                  ${isPl ? 'Kup Teraz' : 'Shop Now'}
                </a>
              </div>
              <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
              <p style="font-size:12px;color:#999;text-align:center;">
                Spirit Candles | m5moffice@proton.me
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`[Referral Emails] Both emails sent successfully`);

    return new Response(
      JSON.stringify({ success: true, message: 'Referral emails sent' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('[Referral Emails] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
