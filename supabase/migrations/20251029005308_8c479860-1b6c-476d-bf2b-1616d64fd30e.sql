-- Restore admin account for adonis.gagliardi@gmail.com
UPDATE public.profiles 
SET 
  role = 'admin',
  first_name = 'Adonis Antonio',
  last_name = 'Gagliardi',
  username = 'AdoniSpirit'
WHERE email = 'adonis.gagliardi@gmail.com';