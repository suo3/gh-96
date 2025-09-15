-- Create admin_conversations table for admin-user chats
CREATE TABLE public.admin_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  inquiry_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create admin_messages table for messages in admin conversations
CREATE TABLE public.admin_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.admin_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.admin_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_conversations
CREATE POLICY "Users can view their own admin conversations" 
ON public.admin_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all admin conversations" 
ON public.admin_conversations 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can create admin conversations" 
ON public.admin_conversations 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update admin conversations" 
ON public.admin_conversations 
FOR UPDATE 
USING (is_admin());

-- RLS policies for admin_messages
CREATE POLICY "Users can view messages in their conversations" 
ON public.admin_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_conversations 
    WHERE admin_conversations.id = admin_messages.conversation_id 
    AND (admin_conversations.user_id = auth.uid() OR is_admin())
  )
);

CREATE POLICY "Users can send messages in their conversations" 
ON public.admin_messages 
FOR INSERT 
WITH CHECK (
  (auth.uid() = sender_id AND is_admin = false AND 
   EXISTS (
     SELECT 1 FROM public.admin_conversations 
     WHERE admin_conversations.id = admin_messages.conversation_id 
     AND admin_conversations.user_id = auth.uid()
   ))
  OR 
  (is_admin() AND is_admin = true)
);

CREATE POLICY "Users can update read status in their conversations" 
ON public.admin_messages 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_conversations 
    WHERE admin_conversations.id = admin_messages.conversation_id 
    AND (admin_conversations.user_id = auth.uid() OR is_admin())
  )
);

-- Function to get admin conversations with latest message
CREATE OR REPLACE FUNCTION public.get_admin_conversations_with_latest()
RETURNS TABLE(
  conv_id UUID,
  user_id UUID,
  inquiry_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT,
  user_name TEXT,
  user_email TEXT
)
LANGUAGE sql
SET search_path TO 'public'
AS $function$
  SELECT
    ac.id as conv_id,
    ac.user_id,
    ac.inquiry_id,
    ac.created_at,
    ac.updated_at,
    ac.is_active,
    (SELECT content FROM public.admin_messages WHERE conversation_id = ac.id ORDER BY created_at DESC LIMIT 1) as last_message,
    (SELECT created_at FROM public.admin_messages WHERE conversation_id = ac.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
    (
      SELECT count(*) FROM public.admin_messages
      WHERE conversation_id = ac.id 
      AND sender_id != auth.uid() 
      AND is_read = false
    ) as unread_count,
    COALESCE(p.first_name || ' ' || p.last_name, p.username, 'Unknown User') as user_name,
    (SELECT email FROM auth.users WHERE id = ac.user_id) as user_email
  FROM public.admin_conversations ac
  LEFT JOIN public.profiles p ON ac.user_id = p.id
  WHERE ac.user_id = auth.uid() OR is_admin()
  ORDER BY last_message_time DESC NULLS LAST, ac.updated_at DESC;
$function$;