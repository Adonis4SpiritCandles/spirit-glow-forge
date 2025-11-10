import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CampaignRequest {
  campaign_id: string;
  test_mode?: boolean;
  test_email?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { campaign_id, test_mode = false, test_email }: CampaignRequest = await req.json();

    console.log(`Processing campaign: ${campaign_id}, test_mode: ${test_mode}`);

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("email_campaigns")
      .select(`
        *,
        template:email_templates(*),
        segment:customer_segments(*)
      `)
      .eq("id", campaign_id)
      .single();

    if (campaignError || !campaign) {
      throw new Error(`Campaign not found: ${campaignError?.message}`);
    }

    // Get recipients based on segment or test mode
    let recipients: string[] = [];

    if (test_mode && test_email) {
      recipients = [test_email];
    } else {
      // Get customers based on segment filters
      const filters = campaign.segment?.filters || {};
      let query = supabase.from("profiles").select("email");

      // Apply filters (example implementation)
      if (filters.min_orders) {
        // This would require a join with orders table
      }
      if (filters.language) {
        query = query.eq("preferred_language", filters.language);
      }

      const { data: customers } = await query;
      recipients = customers?.map((c: any) => c.email).filter(Boolean) || [];
    }

    console.log(`Sending to ${recipients.length} recipients`);

    // Update campaign status
    if (!test_mode) {
      await supabase
        .from("email_campaigns")
        .update({ status: "sending", sent_at: new Date().toISOString() })
        .eq("id", campaign_id);
    }

    // Send emails
    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      try {
        const emailResult = await resend.emails.send({
          from: "Spirit Candles <noreply@spiritcandles.com>",
          to: [recipient],
          subject: campaign.subject,
          html: campaign.template?.html_content || "<p>Email content</p>",
        });

        // Log analytics
        if (!test_mode) {
          await supabase.from("email_campaign_analytics").insert({
            campaign_id: campaign_id,
            recipient_email: recipient,
            sent_at: new Date().toISOString(),
          });
        }

        sentCount++;
        console.log(`Email sent to ${recipient}:`, emailResult);
      } catch (error: any) {
        console.error(`Failed to send to ${recipient}:`, error);
        failedCount++;

        if (!test_mode) {
          await supabase.from("email_campaign_analytics").insert({
            campaign_id: campaign_id,
            recipient_email: recipient,
            bounce_reason: error.message,
          });
        }
      }
    }

    // Update campaign status
    if (!test_mode) {
      await supabase
        .from("email_campaigns")
        .update({ status: "sent" })
        .eq("id", campaign_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: failedCount,
        total: recipients.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in send-campaign-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});