-- Fix RLS policies for profiles storage bucket

-- Drop existing policies that may be incorrect
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Profile images are publicly accessible" ON storage.objects;

-- Create corrected policies for profiles bucket
CREATE POLICY "Profile images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);