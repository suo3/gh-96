
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    const body = await req.text();
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
    );

    console.log("Received webhook event:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extract user and coin info from metadata
      const userId = session.metadata?.user_id;
      const coinAmount = parseInt(session.metadata?.coin_amount || "0");
      const planType = session.metadata?.plan_type || "unknown";

      if (userId && coinAmount > 0) {
        console.log(`Adding ${coinAmount} coins to user ${userId}`);
        
        // Use service role key to add coins
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { error } = await supabaseAdmin.rpc('add_coins', {
          coin_amount: coinAmount,
          description: `Purchased ${coinAmount} coins (${planType} pack)`,
          payment_intent_id: session.payment_intent?.toString()
        });

        if (error) {
          console.error("Error adding coins:", error);
          return new Response("Error adding coins", { status: 500 });
        }

        console.log(`Successfully added ${coinAmount} coins to user ${userId}`);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(`Webhook error: ${error.message}`, { status: 400 });
  }
});
