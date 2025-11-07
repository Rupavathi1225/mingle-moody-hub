-- Create landing_page table for hero content
CREATE TABLE public.landing_page (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create categories table (related searches boxes)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  webresult_page TEXT NOT NULL, -- wr=1, wr=2, etc.
  serial_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create web_results table
CREATE TABLE public.web_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webresult_page TEXT NOT NULL, -- wr=1, wr=2, etc.
  is_sponsored BOOLEAN DEFAULT false,
  offer_name TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  original_link TEXT NOT NULL,
  logo_url TEXT,
  serial_number INTEGER NOT NULL,
  imported_from TEXT,
  access_type TEXT NOT NULL DEFAULT 'worldwide', -- 'worldwide' or 'selected_countries'
  allowed_countries JSONB DEFAULT '[]',
  backlink_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create analytics table for click tracking
CREATE TABLE public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  country TEXT,
  source TEXT,
  device TEXT,
  page_views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  related_searches INTEGER DEFAULT 0,
  result_clicks INTEGER DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Insert default landing page content
INSERT INTO public.landing_page (title, description) VALUES (
  'Minglemoody - Your Social Connection Hub',
  'Discover the best platforms for connecting, sharing, and engaging with people worldwide. Whether you''re looking for social networking, community forums, dating apps, or professional networking sites, we help you find the perfect platform to achieve your social goals.'
);

-- Insert default categories
INSERT INTO public.categories (title, webresult_page, serial_number) VALUES
  ('Top Social Networking Platforms', 'wr=1', 1),
  ('Best Community Forums', 'wr=2', 2),
  ('Dating & Relationship Apps', 'wr=3', 3),
  ('Professional Networking Sites', 'wr=4', 4),
  ('Social Media Analytics Tools', 'wr=5', 5);

-- Enable RLS
ALTER TABLE public.landing_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to landing_page"
  ON public.landing_page FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to web_results"
  ON public.web_results FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to analytics"
  ON public.analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read access to analytics"
  ON public.analytics FOR SELECT
  USING (true);

-- Create policies for admin access (all operations)
CREATE POLICY "Allow all operations on landing_page"
  ON public.landing_page FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on categories"
  ON public.categories FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on web_results"
  ON public.web_results FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on analytics"
  ON public.analytics FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
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