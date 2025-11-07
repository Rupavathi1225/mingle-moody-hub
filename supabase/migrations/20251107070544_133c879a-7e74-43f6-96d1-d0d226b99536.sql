-- Drop triggers first
DROP TRIGGER IF EXISTS set_updated_at_landing_page ON public.landing_page;
DROP TRIGGER IF EXISTS set_updated_at_categories ON public.categories;
DROP TRIGGER IF EXISTS set_updated_at_web_results ON public.web_results;

-- Drop and recreate function with proper security
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER set_updated_at_landing_page
  BEFORE UPDATE ON public.landing_page
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_categories
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_web_results
  BEFORE UPDATE ON public.web_results
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();