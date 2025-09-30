import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Product = {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  images?: string[];
  wanted_items?: string[];
};

type RequestBody = {
  products: Product[];
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const url = Deno.env.get("SUPABASE_URL") ?? "";
    const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Client with user's JWT (for is_admin() check)
    const supabaseAuth = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // Verify admin
    const { data: isAdmin, error: adminError } = await supabaseAuth.rpc("is_admin");
    console.log("admin-bulk-import-listings is_admin:", isAdmin, adminError);
    if (adminError) {
      console.error("is_admin RPC error:", adminError);
      return new Response(JSON.stringify({ error: "Admin check failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const { products } = (await req.json()) as RequestBody;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return new Response(JSON.stringify({ error: "No products provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Service role client to bypass RLS after admin check
    const supabaseService = createClient(url, service, { auth: { persistSession: false } });

    // Ensure KentaKart auth user + profile exists
    let kentaId: string | undefined;

    // Try to find existing profile
    const { data: existingProfile, error: profileFetchError } = await supabaseService
      .from("profiles")
      .select("id")
      .eq("username", "KentaKart")
      .maybeSingle();

    if (profileFetchError) {
      console.error("Profile fetch error:", profileFetchError);
      return new Response(JSON.stringify({ error: "Failed to check KentaKart profile" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (existingProfile?.id) {
      kentaId = existingProfile.id as string;
    } else {
      // Create an auth user using admin API
      const email = `kenta+${Date.now()}@example.com`;
      const { data: adminUser, error: createUserError } = await supabaseService.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          first_name: "KentaKart",
          last_name: "Marketplace",
          username: "KentaKart",
        },
      });

      if (createUserError || !adminUser?.user?.id) {
        console.error("Create auth user error:", createUserError);
        return new Response(JSON.stringify({ error: "Failed to create KentaKart user" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      kentaId = adminUser.user.id;

      // After creating auth user, ensure profile exists (avoid duplicate if trigger already inserted)
      const { data: profileById, error: profileByIdError } = await supabaseService
        .from("profiles")
        .select("id")
        .eq("id", kentaId)
        .maybeSingle();

      if (profileByIdError) {
        console.error("Profile check by id error:", profileByIdError);
        return new Response(JSON.stringify({ error: "Failed to verify KentaKart profile" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      if (!profileById?.id) {
        const { error: createProfileError } = await supabaseService.from("profiles").insert({
          id: kentaId,
          username: "KentaKart",
          first_name: "KentaKart",
          last_name: "Marketplace",
          region: "Greater Accra",
          city: "Accra",
          is_verified: true,
          coins: 50,
        });
        if (createProfileError && (createProfileError as any).code !== "23505") {
          console.error("Create profile error:", createProfileError);
          return new Response(JSON.stringify({ error: "Failed to create KentaKart profile" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }
      }
    }

    // Normalize products
    const rows = products.map((p) => ({
      title: p.title?.toString().slice(0, 200) ?? "Sample Item",
      description: p.description?.toString().slice(0, 2000) ?? "",
      price: Number.isFinite(p.price) ? p.price : 0,
      category: p.category?.toString().slice(0, 120) ?? "Other",
      condition: p.condition?.toString().slice(0, 120) ?? "Used - Good",
      location: p.location?.toString().slice(0, 200) ?? "Accra",
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      ],
      wanted_items: Array.isArray(p.wanted_items) ? p.wanted_items : ["Cash"],
      user_id: kentaId!,
      status: "active",
    }));

    // Insert in batches
    const batchSize = 200;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error: insertError } = await supabaseService.from("listings").insert(batch);
      if (insertError) {
        console.error("Insert error:", insertError);
        return new Response(JSON.stringify({ error: "Failed to insert listings" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    }

    return new Response(JSON.stringify({ success: true, inserted: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Unhandled error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});