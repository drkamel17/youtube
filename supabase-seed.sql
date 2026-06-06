-- ============================================
-- YouTube Library - Données de démonstration
-- ============================================

-- Catégories
insert into categories (name) values
  ('Tutoriels'),
  ('Conférences'),
  ('Développement'),
  ('Design'),
  ('DevOps');

-- Exemple de vidéos
insert into videos (title, youtube_url, category_id, favorite, position) values
  ('Next.js Tutorial for Beginners', 'https://www.youtube.com/watch?v=ZxqFq7S58-I', 3, false, 0),
  ('React vs Vue vs Svelte', 'https://www.youtube.com/watch?v=Q7i4Bd4rZ5A', 3, true, 1),
  ('CSS Grid Layout Tutorial', 'https://www.youtube.com/watch?v=jV8B24rSN5o', 4, false, 2),
  ('Docker pour les développeurs', 'https://www.youtube.com/watch?v=3c-iBn73dDE', 5, false, 3),
  ('TypeScript Advanced Patterns', 'https://www.youtube.com/watch?v=pHB0E7B5E0A', 3, true, 4),
  ('UI Design Principles', 'https://www.youtube.com/watch?v=wIuVxPpfFJ4', 4, false, 5);

-- Créer un admin :
-- 1. Inscris-toi via l'app avec admin@test.com / admin123
-- 2. Puis execute :
--    update profiles set role = 'admin' where id = (select id from auth.users where email = 'admin@test.com');
