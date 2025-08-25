-- Fix remaining functions with search path security issues

CREATE OR REPLACE FUNCTION public.increment_listing_likes(listing_uuid uuid)
 RETURNS void
 LANGUAGE sql
 SET search_path = 'public'
AS $function$
  UPDATE public.listings 
  SET likes = COALESCE(likes, 0) + 1,
      updated_at = now()
  WHERE id = listing_uuid;
$function$;

CREATE OR REPLACE FUNCTION public.increment_listing_views(listing_uuid uuid)
 RETURNS void
 LANGUAGE sql
 SET search_path = 'public'
AS $function$
  UPDATE public.listings 
  SET views = COALESCE(views, 0) + 1,
      updated_at = now()
  WHERE id = listing_uuid;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_average_rating(user_uuid uuid)
 RETURNS numeric
 LANGUAGE sql
 STABLE
 SET search_path = 'public'
AS $function$
  SELECT COALESCE(AVG(rating::numeric), 0)
  FROM public.ratings 
  WHERE rated_user_id = user_uuid;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_rating_count(user_uuid uuid)
 RETURNS bigint
 LANGUAGE sql
 STABLE
 SET search_path = 'public'
AS $function$
  SELECT COUNT(*)
  FROM public.ratings 
  WHERE rated_user_id = user_uuid;
$function$;

CREATE OR REPLACE FUNCTION public.listing_has_active_conversation(listing_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.conversations 
    WHERE listing_id = listing_uuid
  );
$function$;

CREATE OR REPLACE FUNCTION public.check_user_coins(required_coins integer)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path = 'public'
AS $function$
  SELECT COALESCE((SELECT coins FROM public.profiles WHERE id = auth.uid()), 0) >= required_coins;
$function$;

CREATE OR REPLACE FUNCTION public.get_conversations_with_profiles()
 RETURNS TABLE(conv_id uuid, item_title text, created_at timestamp with time zone, updated_at timestamp with time zone, user1_id uuid, user2_id uuid, last_message text, last_message_time timestamp with time zone, unread_count bigint, partner_name text, partner_username text, partner_avatar text)
 LANGUAGE sql
 SET search_path = 'public'
AS $function$
  SELECT
    c.id as conv_id,
    c.item_title,
    c.created_at,
    c.updated_at,
    c.user1_id,
    c.user2_id,
    (SELECT content FROM public.messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
    (SELECT created_at FROM public.messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
    (
      SELECT count(*) FROM public.messages
      WHERE conversation_id = c.id AND sender_id != auth.uid() AND is_read = false
    ) as unread_count,
    CASE 
      WHEN c.user1_id = auth.uid() THEN 
        COALESCE(p2.first_name || ' ' || p2.last_name, p2.username, 'Unknown User')
      ELSE 
        COALESCE(p1.first_name || ' ' || p1.last_name, p1.username, 'Unknown User')
    END as partner_name,
    CASE 
      WHEN c.user1_id = auth.uid() THEN p2.username
      ELSE p1.username
    END as partner_username,
    CASE 
      WHEN c.user1_id = auth.uid() THEN COALESCE(p2.avatar, 'U')
      ELSE COALESCE(p1.avatar, 'U')
    END as partner_avatar
  FROM public.conversations c
  LEFT JOIN public.profiles p1 ON c.user1_id = p1.id
  LEFT JOIN public.profiles p2 ON c.user2_id = p2.id
  WHERE c.user1_id = auth.uid() OR c.user2_id = auth.uid()
  ORDER BY last_message_time DESC NULLS LAST, c.updated_at DESC;
$function$;

CREATE OR REPLACE FUNCTION public.get_conversations_with_unread()
 RETURNS TABLE(conv_id uuid, item_title text, created_at timestamp with time zone, updated_at timestamp with time zone, user1_id uuid, user2_id uuid, last_message text, last_message_time timestamp with time zone, unread_count bigint)
 LANGUAGE sql
 SET search_path = 'public'
AS $function$
  SELECT
    c.id as conv_id,
    c.item_title,
    c.created_at,
    c.updated_at,
    c.user1_id,
    c.user2_id,
    (SELECT content FROM public.messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
    (SELECT created_at FROM public.messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
    (
      SELECT count(*) FROM public.messages
      WHERE conversation_id = c.id AND sender_id != auth.uid() AND is_read = false
    ) as unread_count
  FROM public.conversations c
  WHERE c.user1_id = auth.uid() OR c.user2_id = auth.uid()
  ORDER BY last_message_time DESC NULLS LAST, c.updated_at DESC;
$function$;

CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
 RETURNS TABLE(id uuid, username text, first_name text, last_name text, avatar text, joined_date timestamp with time zone, rating numeric, total_swaps integer, achievements text[], is_verified boolean, region text, city text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT 
    p.id,
    p.username,
    p.first_name,
    p.last_name,
    p.avatar,
    p.joined_date,
    p.rating,
    p.total_swaps,
    p.achievements,
    p.is_verified,
    p.region,
    p.city
  FROM public.profiles p
  WHERE p.id = profile_id;
$function$;