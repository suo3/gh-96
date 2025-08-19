-- Add price column to listings table
ALTER TABLE public.listings 
ADD COLUMN price DECIMAL(10,2);

-- Add index for price-based queries
CREATE INDEX idx_listings_price ON public.listings(price) WHERE price IS NOT NULL;