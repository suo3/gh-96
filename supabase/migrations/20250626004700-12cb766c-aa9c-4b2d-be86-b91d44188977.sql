
-- Create a function to handle account deletion
-- This will clean up all user data before deleting the account
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete user's ratings (both given and received)
  DELETE FROM public.ratings WHERE rater_user_id = auth.uid() OR rated_user_id = auth.uid();
  
  -- Delete user's messages
  DELETE FROM public.messages WHERE sender_id = auth.uid();
  
  -- Delete conversations where user is involved
  DELETE FROM public.conversations WHERE user1_id = auth.uid() OR user2_id = auth.uid();
  
  -- Delete user's listings
  DELETE FROM public.listings WHERE user_id = auth.uid();
  
  -- Delete user's swaps
  DELETE FROM public.swaps WHERE user1_id = auth.uid() OR user2_id = auth.uid();
  
  -- Delete user's coin transactions
  DELETE FROM public.coin_transactions WHERE user_id = auth.uid();
  
  -- Delete user's reported listings
  DELETE FROM public.reported_listings WHERE reporter_id = auth.uid();
  
  -- Delete user's subscription data
  DELETE FROM public.subscribers WHERE user_id = auth.uid();
  
  -- Delete user's admin privileges if any
  DELETE FROM public.admin_users WHERE user_id = auth.uid();
  
  -- Delete user's profile
  DELETE FROM public.profiles WHERE id = auth.uid();
  
  -- Finally delete the auth user (this will cascade and clean up auth-related data)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
