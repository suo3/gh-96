-- Add phone number field to inquiries table
ALTER TABLE public.inquiries 
ADD COLUMN phone_number text;