-- Update the handle_new_user function to give new users 50 coins instead of 20
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    coins,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    50, -- Updated from 20 to 50 coins
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;