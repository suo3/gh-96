
-- First, let's add the listing_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'conversations' AND column_name = 'listing_id') THEN
        ALTER TABLE public.conversations 
        ADD COLUMN listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add an index for better performance when querying conversations by listing
CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON public.conversations(listing_id);

-- Drop existing policies to avoid conflicts and recreate them
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete their conversations" ON public.conversations;

DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their messages" ON public.messages;

-- Add RLS policies for conversations table
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Users can view conversations they're part of
CREATE POLICY "Users can view their conversations" ON public.conversations
FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can create conversations
CREATE POLICY "Users can create conversations" ON public.conversations  
FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can update their conversations
CREATE POLICY "Users can update their conversations" ON public.conversations
FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can delete their conversations  
CREATE POLICY "Users can delete their conversations" ON public.conversations
FOR DELETE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Add RLS policies for messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in conversations they're part of
CREATE POLICY "Users can view their messages" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- Users can create messages in their conversations
CREATE POLICY "Users can create messages" ON public.messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- Users can update their own messages
CREATE POLICY "Users can update their messages" ON public.messages
FOR UPDATE USING (auth.uid() = sender_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete their messages" ON public.messages
FOR DELETE USING (auth.uid() = sender_id);

-- Create a function to check if a listing has active conversations
CREATE OR REPLACE FUNCTION public.listing_has_active_conversation(listing_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.conversations 
    WHERE listing_id = listing_uuid
  );
$$;
