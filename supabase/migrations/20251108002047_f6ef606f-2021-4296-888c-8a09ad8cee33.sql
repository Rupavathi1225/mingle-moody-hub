-- Ensure click_events table exists with proper schema
CREATE TABLE IF NOT EXISTS public.click_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  search_term TEXT,
  target_url TEXT,
  ip_address TEXT,
  country TEXT,
  device TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure analytics table has all required columns
ALTER TABLE public.analytics 
ADD COLUMN IF NOT EXISTS unique_clicks INTEGER DEFAULT 0;

ALTER TABLE public.analytics 
ADD COLUMN IF NOT EXISTS time_spent BIGINT DEFAULT 0;

-- Enable RLS on click_events if not already enabled
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Enable all access for click_events" ON public.click_events;

CREATE POLICY "Enable all access for click_events" 
ON public.click_events 
FOR ALL 
USING (true) 
WITH CHECK (true);