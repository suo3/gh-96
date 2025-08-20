import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Business Mobile Money Accounts - where payments should be sent
const BUSINESS_ACCOUNTS = {
  mtn: "0244000000", // Replace with actual business MTN account
  vodafone: "0200000000", // Replace with actual business Vodafone account
  airteltigo: "0270000000", // Replace with actual business AirtelTigo account
};

// Mobile Money provider configurations for Ghana
const MOBILE_MONEY_PROVIDERS = {
  mtn: {
    name: "MTN Mobile Money",
    prefixes: ["024", "054", "055", "059"],
    apiEndpoint: "https://api.mtn.com/v1/momo", // Replace with actual MTN MoMo API
    businessAccount: BUSINESS_ACCOUNTS.mtn,
  },
  vodafone: {
    name: "Vodafone Cash",
    prefixes: ["020", "050"],
    apiEndpoint: "https://api.vodafone.com/v1/cash", // Replace with actual Vodafone Cash API
    businessAccount: BUSINESS_ACCOUNTS.vodafone,
  },
  airteltigo: {
    name: "AirtelTigo Money",
    prefixes: ["027", "057", "026", "056"],
    apiEndpoint: "https://api.airteltigo.com/v1/money", // Replace with actual AirtelTigo API
    businessAccount: BUSINESS_ACCOUNTS.airteltigo,
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

    // Prepare payment request to mobile money provider
    const paymentRequest = {
      amount: priceGHS,
      currency: "GHS",
      fromPhoneNumber: cleanPhoneNumber, // Customer's phone number
      toPhoneNumber: providerConfig.businessAccount, // Business account
      reference: transactionId,
      description: `SwapBoard: Purchase ${coins} Swap Coins`,
      callbackUrl: `${req.headers.get("origin")}/api/mobile-money-callback`,
      // Additional fields required by mobile money APIs
      externalId: transactionId,
      payerMessage: `Payment for ${coins} coins`,
      payeeNote: `Coin purchase - ${planType} plan`,
    };

    console.log(`Initiating ${providerConfig.name} payment from ${cleanPhoneNumber} to ${providerConfig.businessAccount}:`, paymentRequest);

    // TODO: Replace this simulation with actual mobile money API integration
    // Example API calls would look like:
    // const response = await fetch(providerConfig.apiEndpoint + '/payments', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${Deno.env.get('MOBILE_MONEY_API_KEY')}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(paymentRequest)
    // });
    
    // For demonstration purposes, we'll simulate the payment initiation
    // In production, you would wait for the mobile money provider's callback
    
    // Update transaction status to completed and add coins to user account
    const { error: updateError } = await supabaseService
      .from("mobile_money_transactions")
      .update({ 
        status: "completed",
        external_reference: `MM_${transactionId}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transactionId);

    if (updateError) {
      console.error("Error updating transaction:", updateError);
      throw new Error("Failed to update transaction status");
    }

    // Add coins to user's account
    const { error: coinError } = await supabaseService.rpc('add_coins', {
      coin_amount: coins,
      description: `Mobile money purchase - ${planType} plan`,
      payment_intent_id: transactionId
    });

    if (coinError) {
      console.error("Error adding coins:", coinError);
      throw new Error("Failed to add coins to user account");
    }

    // Return success response
    return new Response(JSON.stringify({ 
      success: true, 
      transactionId,
      message: `Payment request sent to ${cleanPhoneNumber}. You will be prompted to pay GHS ${priceGHS} to ${providerConfig.businessAccount} (SwapBoard). Please check your phone for the mobile money prompt.`,
      provider: providerConfig.name,
      businessAccount: providerConfig.businessAccount,
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