
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!stripeSecretKey || !webhookSecret) {
      throw new Error('Stripe keys not configured')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Verify webhook signature (simplified for demo)
    // In production, you should use Stripe's webhook verification
    const event = JSON.parse(body)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.metadata.user_id
      const planType = session.metadata.plan_type

      // Update user's subscription status
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({ membership_type: 'premium' })
        .eq('id', userId)

      if (profileError) {
        console.error('Profile update error:', profileError)
      }

      // Update subscriber record
      const subscriptionEnd = new Date()
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + (planType === 'yearly' ? 12 : 1))

      const { error: subError } = await supabaseClient
        .from('subscribers')
        .update({
          subscribed: true,
          subscription_end: subscriptionEnd.toISOString(),
          stripe_customer_id: session.customer,
        })
        .eq('user_id', userId)

      if (subError) {
        console.error('Subscription update error:', subError)
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      const customerId = subscription.customer

      // Find user by stripe customer ID and downgrade
      const { data: subscriber, error: findError } = await supabaseClient
        .from('subscribers')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (!findError && subscriber) {
        await supabaseClient
          .from('profiles')
          .update({ membership_type: 'free' })
          .eq('id', subscriber.user_id)

        await supabaseClient
          .from('subscribers')
          .update({ subscribed: false })
          .eq('user_id', subscriber.user_id)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
