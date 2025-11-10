-- Create prelander_configs table
CREATE TABLE IF NOT EXISTS public.prelander_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  web_result_id UUID REFERENCES public.web_results(id) ON DELETE CASCADE,
  
  -- Logo settings
  logo_url TEXT,
  logo_position TEXT DEFAULT 'top-center',
  logo_size TEXT DEFAULT 'medium',
  
  -- Main image settings
  main_image_url TEXT,
  image_ratio TEXT DEFAULT '16:9',
  
  -- Content settings
  headline TEXT,
  description TEXT,
  headline_size TEXT DEFAULT 'large',
  headline_color TEXT DEFAULT '#000000',
  description_size TEXT DEFAULT 'medium',
  description_color TEXT DEFAULT '#666666',
  text_align TEXT DEFAULT 'center',
  
  -- CTA settings
  cta_text TEXT DEFAULT 'Continue to Offer',
  cta_color TEXT DEFAULT '#000000',
  cta_bg_color TEXT DEFAULT '#ffffff',
  
  -- Background settings
  bg_type TEXT DEFAULT 'color',
  bg_color TEXT DEFAULT '#ffffff',
  bg_image_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(web_result_id)
);

-- Enable RLS
ALTER TABLE public.prelander_configs ENABLE ROW LEVEL SECURITY;

-- Allow public to read prelander configs
CREATE POLICY "Anyone can view prelander configs"
ON public.prelander_configs
FOR SELECT
USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can manage prelander configs"
ON public.prelander_configs
FOR ALL
USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_prelander_configs_updated_at
BEFORE UPDATE ON public.prelander_configs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();