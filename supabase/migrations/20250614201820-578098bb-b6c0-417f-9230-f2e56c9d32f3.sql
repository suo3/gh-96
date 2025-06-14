
-- Add an 'is_read' column to messages if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'is_read'
    ) THEN
        ALTER TABLE public.messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE NOT NULL;
    END IF;
END $$;

-- Drop the old policy if it exists, then create the new one
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.messages;

-- Policy: Allow users to mark messages they've received as read (by updating is_read to true)
CREATE POLICY "Users can mark messages as read" 
  ON public.messages 
  FOR UPDATE
  USING (
    sender_id != auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
    )
  )
  WITH CHECK (is_read = true);

-- This function will efficiently get all conversations for a user,
-- along with the count of unread messages for each one.
CREATE OR REPLACE FUNCTION get_conversations_with_unread()
RETURNS TABLE (
  conv_id uuid,
  item_title text,
  created_at timestamptz,
  updated_at timestamptz,
  user1_id uuid,
  user2_id uuid,
  last_message text,
  last_message_time timestamptz,
  unread_count bigint
)
LANGUAGE sql
AS $$
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
$$;
