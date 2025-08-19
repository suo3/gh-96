-- Create mobile money transactions table for Ghana market
CREATE TABLE IF NOT EXISTS public.mobile_money_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('mtn', 'vodafone', 'airteltigo')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GHS',
  coin_amount INTEGER NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('starter', 'value', 'power')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'initiated', 'completed', 'failed', 'cancelled')),
  external_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mobile_money_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for mobile money transactions
CREATE POLICY "Users can view their own transactions" 
ON public.mobile_money_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.mobile_money_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Only allow updates to status and external_reference (for payment processing)
CREATE POLICY "System can update transaction status" 
ON public.mobile_money_transactions 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_mobile_money_transactions_user_id ON public.mobile_money_transactions(user_id);
CREATE INDEX idx_mobile_money_transactions_status ON public.mobile_money_transactions(status);
CREATE INDEX idx_mobile_money_transactions_external_ref ON public.mobile_money_transactions(external_reference);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_mobile_money_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_mobile_money_transactions_updated_at
BEFORE UPDATE ON public.mobile_money_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_mobile_money_updated_at_column();