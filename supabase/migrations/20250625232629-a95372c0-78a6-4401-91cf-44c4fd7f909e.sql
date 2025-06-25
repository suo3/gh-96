
-- Add a function to get conversations with real user profile data
CREATE OR REPLACE FUNCTION public.get_conversations_with_profiles()
RETURNS TABLE(
  conv_id uuid,
  item_title text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  user1_id uuid,
  user2_id uuid,
  last_message text,
  last_message_time timestamp with time zone,
  unread_count bigint,
  partner_name text,
  partner_username text,
  partner_avatar text
)
LANGUAGE sql
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
$function$
