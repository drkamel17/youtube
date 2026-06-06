-- ============================================
-- Promouvoir un utilisateur en admin
-- ============================================

-- Fonction utilitaire : promouvoir par email
create or replace function promote_to_admin(user_email text)
returns void as $$
begin
  update profiles
  set role = 'admin'
  where id = (select id from auth.users where email = user_email);
end;
$$ language plpgsql security definer;

-- Usage : select promote_to_admin('ton-email@example.com');

-- Ou directement :
-- update profiles set role = 'admin' where id = (select id from auth.users where email = 'ton-email@example.com');
