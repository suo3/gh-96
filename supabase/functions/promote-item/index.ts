import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MOBILE_MONEY_PROVIDERS = {
  mtn: {
    name: "MTN Mobile Money",
    prefixes: ["024", "025", "053", "054", "055", "059"],
    business_account_key: "ghana_business_mtn"
  },
  vodafone: {
    name: "Vodafone Cash", 
    prefixes: ["020", "050"],
    business_account_key: "ghana_business_vodafone"
  },
  airteltigo: {
    name: "AirtelTigo Money",
    prefixes: ["026", "027", "028", "056", "057"],
    business_account_key: "ghana_business_airteltigo"
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Create Supabase client with service role for privileged operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the authorization header and extract the token
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    // Parse the request body
    const { listingId, promotionType, phoneNumber, provider, durationDays = 7 } = await req.json();

    // Validate inputs
    if (!listingId || !promotionType || !phoneNumber || !provider) {
      throw new Error("Missing required fields");
    }

    // Validate phone number for the selected provider
    const providerData = MOBILE_MONEY_PROVIDERS[provider as keyof typeof MOBILE_MONEY_PROVIDERS];
    if (!providerData) {
      throw new Error("Invalid mobile money provider");
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      throw new Error("Phone number must be 10 digits");
    }

    const isValidPrefix = providerData.prefixes.some(prefix => cleanPhone.startsWith(prefix));
    if (!isValidPrefix) {
      throw new Error(`Invalid phone number for ${providerData.name}`);
    }

    // Verify the listing belongs to the user
    const { data: listing, error: listingError } = await supabaseClient
      .from('listings')
      .select('id, user_id, title')
      .eq('id', listingId)
      .eq('user_id', user.id)
      .single();

    if (listingError || !listing) {
      throw new Error("Listing not found or access denied");
    }

    // Get promotion price
    const { data: priceData, error: priceError } = await supabaseService
      .from('platform_settings')
      .select('value')
      .eq('key', `promotion_${promotionType}_price`)
      .single();

    if (priceError) {
      throw new Error("Failed to get promotion price");
    }

    const promotionPrice = parseFloat(priceData.value as string);

    // Create promotion transaction record
    const { data: transaction, error: transactionError } = await supabaseService
      .from('promotion_transactions')
      .insert({
        user_id: user.id,
        listing_id: listingId,
        amount: promotionPrice,
        currency: 'GHS',
        phone_number: cleanPhone,
        provider: provider,
        promotion_type: promotionType,
        promotion_duration_days: durationDays,
        status: 'pending'
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      throw new Error("Failed to create promotion transaction");
    }

    // Get business account for this provider
    const { data: businessData } = await supabaseService
      .from('platform_settings')
      .select('value')
      .eq('key', providerData.business_account_key)
      .single();

    const businessAccount = businessData?.value as string || "0241234567";

    // TODO: Integrate with actual mobile money API
    // For now, we'll simulate the payment initiation and auto-complete for demo
    console.log(`Initiating mobile money payment:
      Provider: ${providerData.name}
      From: ${cleanPhone}
      To: ${businessAccount}
      Amount: GHS ${promotionPrice}
      Reference: ${transaction.id}
    `);

    // Simulate successful payment for demo purposes
    // In production, this would be handled by a webhook from the mobile money provider
    
    // Update transaction status to completed
    await supabaseService
      .from('promotion_transactions')
      .update({ 
        status: 'completed',
        external_reference: `DEMO_${Date.now()}`
      })
      .eq('id', transaction.id);

    // Create the promoted item record
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    await supabaseService
      .from('promoted_items')
      .insert({
        listing_id: listingId,
        user_id: user.id,
        promotion_type: promotionType,
        starts_at: new Date().toISOString(),
        ends_at: endDate.toISOString(),
        amount_paid: promotionPrice,
        currency: 'GHS',
        transaction_id: transaction.id,
        status: 'active'
      });

    return new Response(JSON.stringify({ 
      success: true,
      transaction_id: transaction.id,
      message: "Promotion activated successfully!",
      payment_details: {
        provider: providerData.name,
        amount: promotionPrice,
        currency: 'GHS',
        duration_days: durationDays
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: unknown) {
    console.error("Error in promote-item function:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ 
      error: message || "An unexpected error occurred"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});