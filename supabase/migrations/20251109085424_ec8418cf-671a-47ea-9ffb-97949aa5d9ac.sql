-- Add RLS policies to analytics_events table
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on analytics_events"
ON public.analytics_events
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public insert to analytics_events"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public read access to analytics_events"
ON public.analytics_events
FOR SELECT
USING (true);