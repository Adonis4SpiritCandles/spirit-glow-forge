-- Insert admin user manually in profiles (without auth.users dependency)
INSERT INTO public.profiles (user_id, username, email, first_name, last_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Admin',
  'admin@spiritofcandles.com',
  'Admin',
  'User',
  'admin'
) ON CONFLICT (username) DO NOTHING;