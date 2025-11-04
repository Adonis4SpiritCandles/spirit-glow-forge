import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WelcomeEmailRequest {
  userEmail: string;
  firstName: string;
  lastName: string;
  preferredLanguage: string;
  hasReferral: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      userEmail,
      firstName,
      lastName,
      preferredLanguage,
      hasReferral,
    }: WelcomeEmailRequest = await req.json();

    console.log(`[Welcome Email] Sending to: ${userEmail}, Language: ${preferredLanguage}, Has referral: ${hasReferral}`);

    const isPolish = preferredLanguage === 'pl';
    
    // Subject
    const subject = isPolish
      ? '🎉 Witamy w Spirit Candles! Mamy dla Ciebie PREZENT!'
      : '🎉 Welcome to Spirit Candles! We have a GIFT for you!';

    // Greeting
    const greeting = isPolish
      ? `Witaj, ${firstName}!`
      : `Welcome, ${firstName}!`;

    // Main message
    const mainMessage = isPolish
      ? `Dziękujemy za dołączenie do rodziny Spirit Candles! Jesteśmy zaszczyceni, że jesteś z nami.`
      : `Thank you for joining the Spirit Candles family! We're honored to have you with us.`;

    // Welcome gift intro
    const giftIntro = isPolish
      ? `Jako podziękowanie za założenie konta, mamy dla Ciebie specjalny prezent:`
      : `As a thank you for creating an account, we have a special gift for you:`;

    // Coupon info
    const couponTitle = isPolish
      ? '🎁 Twój Kod Rabatowy'
      : '🎁 Your Discount Code';

    const couponDescription = isPolish
      ? 'Użyj tego kodu przy swoim pierwszym zamówieniu i otrzymaj <strong>10% zniżki</strong>:'
      : 'Use this code on your first order and get <strong>10% off</strong>:';

    const couponCode = 'WELCOME10';

    const couponInstructions = isPolish
      ? 'Po prostu wpisz ten kod podczas procesu zakupu, aby uzyskać zniżkę!'
      : 'Simply enter this code during checkout to get your discount!';

    // Referral bonus (if applicable)
    const referralBonus = hasReferral ? (isPolish
      ? `<div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #4caf50;">
          <p style="color: #2e7d32; margin: 0; font-size: 18px; font-weight: bold;">
            🎉 Bonus Referral!
          </p>
          <p style="color: #333; margin: 10px 0 0 0; font-size: 14px;">
            Ponieważ zarejestrowałeś się za pomocą kodu polecającego, <strong>otrzymasz dodatkowy kupon REFERRAL10</strong> na kolejne <strong>10% zniżki</strong>!
          </p>
          <p style="color: #333; margin: 10px 0 0 0; font-size: 13px; font-style: italic;">
            Ten kupon może być używany <strong>dla dowolnego zamówienia</strong> (nie tylko pierwszego) i może być <strong>łączony z innymi kuponami</strong>!
          </p>
        </div>`
      : `<div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #4caf50;">
          <p style="color: #2e7d32; margin: 0; font-size: 18px; font-weight: bold;">
            🎉 Referral Bonus!
          </p>
          <p style="color: #333; margin: 10px 0 0 0; font-size: 14px;">
            Because you registered using a referral code, <strong>you'll receive an additional REFERRAL10 coupon</strong> for another <strong>10% off</strong>!
          </p>
          <p style="color: #333; margin: 10px 0 0 0; font-size: 13px; font-style: italic;">
            This coupon can be used for <strong>any purchase</strong> (not just your first) and can be <strong>combined with other coupons</strong>!
          </p>
        </div>`)
      : '';

    // Shop link
    const shopLinkText = isPolish
      ? '🛍️ Zacznij Zakupy'
      : '🛍️ Start Shopping';

    const shopUrl = 'https://www.spirit-candle.com/shop';

    // Closing message
    const closingMessage = isPolish
      ? `Nie możemy się doczekać, aby zobaczyć, co wybierzesz!<br>Jeśli masz jakiekolwiek pytania, jesteśmy tutaj, aby pomóc.`
      : `We can't wait to see what you choose!<br>If you have any questions, we're here to help.`;

    // Signature
    const signature = isPolish
      ? 'Z wdzięcznością,<br>Zespół Spirit Candles'
      : 'With gratitude,<br>The Spirit Candles Team';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #ffffff;">
          <!-- Header with Logo -->
          <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 30px 20px; text-align: center;">
            <img src="https://spirit-candle.com/ImageFiles/spirit-logo-BluOP5mb.png" 
                 alt="Spirit Candles" 
                 style="max-width: 180px; height: auto;" />
          </div>
          
          <!-- Main Content -->
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #333; font-size: 28px; margin-bottom: 10px; font-weight: 600;">
              ${greeting}
            </h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              ${mainMessage}
            </p>

            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              ${giftIntro}
            </p>

            <!-- Coupon Box -->
            <div style="background: linear-gradient(135deg, #d4af37 0%, #c9a529 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);">
              <p style="color: #ffffff; font-size: 18px; margin: 0 0 10px 0; font-weight: bold;">
                ${couponTitle}
              </p>
              <p style="color: #ffffff; font-size: 14px; margin: 0 0 20px 0;">
                ${couponDescription}
              </p>
              <div style="background: #ffffff; padding: 15px 30px; border-radius: 8px; display: inline-block; margin: 0 auto;">
                <span style="color: #d4af37; font-size: 28px; font-weight: bold; letter-spacing: 2px; font-family: 'Courier New', monospace;">
                  ${couponCode}
                </span>
              </div>
              <p style="color: #ffffff; font-size: 12px; margin: 20px 0 0 0; font-style: italic;">
                ${couponInstructions}
              </p>
            </div>

            ${referralBonus}

            <!-- Shop Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${shopUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: #ffffff; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                ${shopLinkText}
              </a>
            </div>

            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                ${closingMessage}
              </p>
            </div>

            <p style="color: #999; font-size: 14px; margin-top: 30px; text-align: center; line-height: 1.6;">
              ${signature}
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f5f5f5; padding: 30px 20px; text-align: center; margin-top: 40px;">
            <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">
              <strong>www.spirit-candle.com</strong>
            </p>
            <p style="color: #999; font-size: 12px; margin: 0;">
              ${isPolish ? 'Jeśli masz pytania, skontaktuj się z nami pod adresem' : 'If you have questions, contact us at'} <a href="mailto:m5moffice@proton.me" style="color: #d4af37; text-decoration: none;">m5moffice@proton.me</a>
            </p>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'Spirit Candles <team@spirit-candle.com>',
      to: [userEmail],
      subject: subject,
      html: emailHtml,
    });

    console.log(`[Welcome Email] Successfully sent to ${userEmail}`);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('[Welcome Email] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
