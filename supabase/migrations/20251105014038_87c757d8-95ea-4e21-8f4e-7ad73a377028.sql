-- Add email_language column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_language text DEFAULT 'en' CHECK (email_language IN ('en', 'pl'));