import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mobile Money provider configurations for Ghana
const MOBILE_MONEY_PROVIDERS = {
  mtn: {
    name: "MTN Mobile Money",
    prefixes: ["024", "054", "055", "059"],
    apiEndpoint: "https://api.mtn.com/v1/momo", // Example - replace with actual MTN MoMo API
  },
  vodafone: {
    name: "Vodafone Cash",
    prefixes: ["020", "050"],
    apiEndpoint: "https://api.vodafone.com/v1/cash", // Example - replace with actual Vodafone Cash API
  },
  airteltigo: {
    name: "AirtelTigo Money",
    prefixes: ["027", "057", "026", "056"],
    apiEndpoint: "https://api.airteltigo.com/v1/money", // Example - replace with actual AirtelTigo API
  },
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

    // Get the authorization header and extract the token
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    // Parse the request body
    const { coinAmount, planType, phoneNumber, provider, email, userId } = await req.json();

    // Validate phone number format
    const cleanPhoneNumber = phoneNumber.replace(/\s+/g, '');
    const providerConfig = MOBILE_MONEY_PROVIDERS[provider as keyof typeof MOBILE_MONEY_PROVIDERS];
    
    if (!providerConfig) {
      throw new Error("Invalid mobile money provider");
    }

    const isValidNumber = providerConfig.prefixes.some(prefix => 
      cleanPhoneNumber.startsWith(prefix) && cleanPhoneNumber.length === 10
    );

    if (!isValidNumber) {
      throw new Error("Invalid phone number for the selected provider");
    }

    // Define pricing in Ghana Cedis (GHS)
    let priceGHS, coins;
    switch (planType) {
      case "starter":
        priceGHS = 20; // GHS 20
        coins = 25;
        break;
      case "value":
        priceGHS = 40; // GHS 40
        coins = 60;
        break;
      case "power":
        priceGHS = 80; // GHS 80
        coins = 150;
        break;
      default:
        throw new Error("Invalid plan type");
    }

    // Create a transaction record in the database
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const transactionId = crypto.randomUUID();
    
    // Insert transaction record
    const { error: insertError } = await supabaseService
      .from("mobile_money_transactions")
      .insert({
        id: transactionId,
        user_id: userId,
        phone_number: cleanPhoneNumber,
        provider: provider,
        amount: priceGHS,
        currency: "GHS",
        coin_amount: coins,
        plan_type: planType,
        status: "pending",
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Error inserting transaction:", insertError);
      throw new Error("Failed to create transaction record");
    }

    // Here you would integrate with the actual mobile money API
    // For now, we'll simulate the payment process
    
    // Example mobile money payment request (replace with actual API call)
    const paymentRequest = {
      amount: priceGHS,
      currency: "GHS",
      phoneNumber: cleanPhoneNumber,
      reference: transactionId,
      description: `Purchase ${coins} Swap Coins`,
      callbackUrl: `${req.headers.get("origin")}/api/mobile-money-callback`,
    };

    console.log(`Initiating ${providerConfig.name} payment:`, paymentRequest);

    // In a real implementation, you would call the mobile money provider's API here
    // For demonstration, we'll update the transaction as initiated
    const { error: updateError } = await supabaseService
      .from("mobile_money_transactions")
      .update({ 
        status: "initiated",
        external_reference: `MM_${transactionId}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transactionId);

    if (updateError) {
      console.error("Error updating transaction:", updateError);
      throw new Error("Failed to update transaction status");
    }

    // Return success response
    return new Response(JSON.stringify({ 
      success: true, 
      transactionId,
      message: `Payment request sent to ${cleanPhoneNumber}. Please check your phone for the mobile money prompt.`,
      provider: providerConfig.name,
      amount: priceGHS,
      currency: "GHS",
      coins: coins
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in purchase-mobile-money-coins function:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});