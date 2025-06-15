
-- Create a swaps table to track completed swaps
CREATE TABLE public.swaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item1_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  item2_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item1_title TEXT NOT NULL,
  item2_title TEXT NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.swaps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for swaps
CREATE POLICY "Users can view their own swaps" ON public.swaps FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can create swaps" ON public.swaps FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can update their own swaps" ON public.swaps FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Update the profiles table to include achievements data
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS achievements TEXT[] DEFAULT ARRAY[]::TEXT[];
