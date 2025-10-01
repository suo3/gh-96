import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: isAdminData, error: isAdminError } = await supabaseClient
      .rpc('is_admin', { user_uuid: user.id });

    if (isAdminError || !isAdminData) {
      throw new Error('User is not an admin');
    }

    const { userId } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Deleting user:', userId);

    // Delete user's ratings (both given and received)
    await supabaseClient
      .from('ratings')
      .delete()
      .or(`rater_user_id.eq.${userId},rated_user_id.eq.${userId}`);

    // Delete user's messages
    await supabaseClient
      .from('messages')
      .delete()
      .eq('sender_id', userId);

    // Delete conversations where user is involved
    await supabaseClient
      .from('conversations')
      .delete()
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    // Delete user's listings
    await supabaseClient
      .from('listings')
      .delete()
      .eq('user_id', userId);

    // Delete user's sales
    await supabaseClient
      .from('sales')
      .delete()
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    // Delete user's coin transactions
    await supabaseClient
      .from('coin_transactions')
      .delete()
      .eq('user_id', userId);

    // Delete user's reported listings
    await supabaseClient
      .from('reported_listings')
      .delete()
      .eq('reporter_id', userId);

    // Delete user's subscription data
    await supabaseClient
      .from('subscribers')
      .delete()
      .eq('user_id', userId);

    // Delete user's admin privileges if any
    await supabaseClient
      .from('admin_users')
      .delete()
      .eq('user_id', userId);

    // Delete user's favorites
    await supabaseClient
      .from('user_favorites')
      .delete()
      .eq('user_id', userId);

    // Delete user's profile
    await supabaseClient
      .from('profiles')
      .delete()
      .eq('id', userId);

    // Finally delete the auth user
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      throw new Error(`Failed to delete auth user: ${deleteError.message}`);
    }

    console.log('User deleted successfully:', userId);

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error deleting user:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
