-- Create email_captures table to store pre-landing page email submissions
CREATE TABLE public.email_captures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  web_result_id UUID REFERENCES public.web_results(id),
  session_id TEXT,
  ip_address TEXT,
  country TEXT,
  device TEXT,
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  redirected_to TEXT
);

-- Enable Row Level Security
ALTER TABLE public.email_captures ENABLE ROW LEVEL SECURITY;

-- Create policies for email_captures
CREATE POLICY "Allow all operations on email_captures"
ON public.email_captures
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public insert to email_captures"
ON public.email_captures
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public read access to email_captures"
ON public.email_captures
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_email_captures_web_result_id ON public.email_captures(web_result_id);
CREATE INDEX idx_email_captures_captured_at ON public.email_captures(captured_at DESC);