import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MilestoneEmailRequest {
  userId: string;
  referralCount: number;
  milestone: 3 | 5 | 10;
  rewardType: 'badge' | 'points' | 'coupon';
  rewardDetails: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, referralCount, milestone, rewardType, rewardDetails }: MilestoneEmailRequest = await req.json();

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email, first_name, preferred_language')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const language = profile.preferred_language || 'en';
    const firstName = profile.first_name || 'Valued Customer';

    // Milestone-specific content
    const milestoneContent = {
      3: {
        en: {
          subject: '🎉 Congratulations! You\'ve Earned Referral Master Badge',
          title: 'Referral Master Achieved!',
          message: `You've successfully referred ${referralCount} friends to Spirit Candles! You've earned the Referral Master badge.`,
          reward: rewardDetails,
        },
        pl: {
          subject: '🎉 Gratulacje! Zdobyłeś Odznakę Mistrza Poleceń',
          title: 'Mistrz Poleceń Osiągnięty!',
          message: `Poleciłeś ${referralCount} znajomych do Spirit Candles! Zdobyłeś odznakę Mistrza Poleceń.`,
          reward: rewardDetails,
        },
      },
      5: {
        en: {
          subject: '🎁 Amazing! 500 Bonus Points Added to Your Account',
          title: '500 Bonus Points Unlocked!',
          message: `You've reached ${referralCount} successful referrals! As a thank you, we've added 500 bonus points to your account.`,
          reward: rewardDetails,
        },
        pl: {
          subject: '🎁 Niesamowite! 500 Punktów Bonusowych Dodanych',
          title: '500 Punktów Bonusowych Odblokowanych!',
          message: `Osiągnąłeś ${referralCount} udanych poleceń! W podziękowaniu dodaliśmy 500 punktów bonusowych na Twoje konto.`,
          reward: rewardDetails,
        },
      },
      10: {
        en: {
          subject: '💎 You\'re a VIP! Exclusive VIP10 Coupon Unlocked',
          title: 'VIP Status Achieved!',
          message: `Incredible! You've referred ${referralCount} friends! You've unlocked the exclusive VIP10 coupon (15% off all purchases).`,
          reward: rewardDetails,
        },
        pl: {
          subject: '💎 Jesteś VIP! Odblokowano Ekskluzywny Kupon VIP10',
          title: 'Status VIP Osiągnięty!',
          message: `Niesamowite! Poleciłeś ${referralCount} znajomych! Odblokowałeś ekskluzywny kupon VIP10 (15% zniżki na wszystkie zakupy).`,
          reward: rewardDetails,
        },
      },
    };

    const content = milestoneContent[milestone][language];

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${language}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${content.subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${content.title}</h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="font-size: 18px; color: #333333; margin-bottom: 20px;">
              ${language === 'pl' ? 'Cześć' : 'Hi'} ${firstName}!
            </p>
            
            <p style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 30px;">
              ${content.message}
            </p>

            ${rewardType === 'coupon' ? `
              <div style="background-color: #f9fafb; border-left: 4px solid #8B5CF6; padding: 20px; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase;">
                  ${language === 'pl' ? 'Twój Kod Kuponu' : 'Your Coupon Code'}
                </p>
                <p style="margin: 0; font-size: 28px; font-weight: bold; color: #8B5CF6; letter-spacing: 2px;">
                  ${rewardDetails}
                </p>
              </div>
            ` : ''}

            ${rewardType === 'points' ? `
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                <p style="margin: 0; font-size: 48px; font-weight: bold; color: #d97706;">
                  +${rewardDetails}
                </p>
                <p style="margin: 10px 0 0 0; font-size: 16px; color: #92400e;">
                  ${language === 'pl' ? 'Punktów Bonusowych' : 'Bonus Points'}
                </p>
              </div>
            ` : ''}

            <div style="text-align: center; margin-top: 40px;">
              <a href="https://yourdomain.com/dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                ${language === 'pl' ? 'Zobacz Swoje Nagrody' : 'View Your Rewards'}
              </a>
            </div>

            <p style="font-size: 14px; color: #888888; margin-top: 40px; text-align: center;">
              ${language === 'pl' 
                ? 'Dziękujemy za bycie częścią społeczności Spirit Candles!' 
                : 'Thank you for being part of the Spirit Candles community!'}
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #888888;">
            <p style="margin: 0 0 10px 0;">Spirit Candles</p>
            <p style="margin: 0;">
              ${language === 'pl' ? 'Ten email został wysłany automatycznie.' : 'This email was sent automatically.'}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Spirit Candles <noreply@spiritcandles.com>',
        to: [profile.email],
        subject: content.subject,
        html: htmlContent,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const emailResult = await resendResponse.json();
    console.log('Milestone email sent:', emailResult);

    return new Response(JSON.stringify({ success: true, emailId: emailResult.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in send-referral-milestone:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
