-- Create storage bucket for prelander images
INSERT INTO storage.buckets (id, name, public)
VALUES ('prelander-images', 'prelander-images', true);

-- Allow anyone to view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'prelander-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload prelander images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'prelander-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their images
CREATE POLICY "Authenticated users can update prelander images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'prelander-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete prelander images"
ON storage.objects FOR DELETE
USING (bucket_id = 'prelander-images' AND auth.role() = 'authenticated');