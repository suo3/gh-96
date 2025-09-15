-- Create inquiries table for support/contact requests
CREATE TABLE public.inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('promotion', 'advertisement', 'support', 'general')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inquiry responses table for admin responses
CREATE TABLE public.inquiry_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for inquiries
CREATE POLICY "Users can create inquiries"
  ON public.inquiries
  FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id) OR (auth.uid() IS NULL)
  );

CREATE POLICY "Users can view their own inquiries"
  ON public.inquiries
  FOR SELECT
  USING (
    (auth.uid() = user_id) OR is_admin()
  );

CREATE POLICY "Admins can update inquiries"
  ON public.inquiries
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can view all inquiries"
  ON public.inquiries
  FOR SELECT
  USING (is_admin());

-- RLS policies for inquiry responses
CREATE POLICY "Admins can create responses"
  ON public.inquiry_responses
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Users can view responses to their inquiries"
  ON public.inquiry_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.inquiries 
      WHERE inquiries.id = inquiry_responses.inquiry_id 
      AND (inquiries.user_id = auth.uid() OR is_admin())
    ) AND (is_internal = false OR is_admin())
  );

CREATE POLICY "Admins can view all responses"
  ON public.inquiry_responses
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update responses"
  ON public.inquiry_responses
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create function to update inquiry updated_at on response
CREATE OR REPLACE FUNCTION public.update_inquiry_on_response()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.inquiries 
  SET updated_at = now()
  WHERE id = NEW.inquiry_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_inquiry_on_response_trigger
  AFTER INSERT ON public.inquiry_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inquiry_on_response();

-- Create indexes for performance
CREATE INDEX idx_inquiries_user_id ON public.inquiries(user_id);
CREATE INDEX idx_inquiries_status ON public.inquiries(status);
CREATE INDEX idx_inquiries_created_at ON public.inquiries(created_at DESC);
CREATE INDEX idx_inquiry_responses_inquiry_id ON public.inquiry_responses(inquiry_id);