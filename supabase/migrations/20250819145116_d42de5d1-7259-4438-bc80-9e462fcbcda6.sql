-- Create temp_audio bucket for temporary audio uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('temp_audio', 'temp_audio', false);

-- Create policies for temp_audio bucket
CREATE POLICY "Authenticated users can upload to temp_audio" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'temp_audio' AND auth.role() = 'authenticated');

CREATE POLICY "Service role can manage temp_audio" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'temp_audio' AND auth.role() = 'service_role');