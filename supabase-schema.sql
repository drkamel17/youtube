-- ============================================
-- YouTube Library - Schéma Supabase complet
-- ============================================

-- 1. CATEGORIES
create table if not exists categories (
    id bigint generated always as identity primary key,
    name text unique not null,
    created_at timestamp default now()
);

-- 2. VIDEOS
create table if not exists videos (
    id bigint generated always as identity primary key,
    title text not null,
    youtube_url text not null,
    category_id bigint references categories(id) on delete cascade,
    favorite boolean default false,
    position integer default 0,
    created_at timestamp default now()
);

-- 3. PROFILES (liée à auth.users)
create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text,
    role text default 'user' check (role in ('admin', 'user'))
);

-- 4. USER_CATEGORIES (jonction)
create table if not exists user_categories (
    user_id uuid references profiles(id) on delete cascade,
    category_id bigint references categories(id) on delete cascade,
    primary key (user_id, category_id)
);

-- ============================================
-- TRIGGER : créer un profil automatiquement
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, username, role)
    values (new.id, coalesce(new.raw_user_meta_data->>'username', 'user'), 'user');
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Activer RLS sur toutes les tables
alter table categories enable row level security;
alter table videos enable row level security;
alter table profiles enable row level security;
alter table user_categories enable row level security;

-- POLICIES : categories
drop policy if exists "admin full access" on categories;
create policy "admin full access" on categories
    for all using (
        (select role from profiles where id = auth.uid()) = 'admin'
    );

drop policy if exists "user read categories" on categories;
create policy "user read categories" on categories
    for select using (true);

-- POLICIES : videos
drop policy if exists "admin full access videos" on videos;
create policy "admin full access videos" on videos
    for all using (
        (select role from profiles where id = auth.uid()) = 'admin'
    );

drop policy if exists "user read allowed videos" on videos;
create policy "user read allowed videos" on videos
    for select using (
        (select role from profiles where id = auth.uid()) = 'user'
        and (
            category_id in (
                select category_id from user_categories
                where user_id = auth.uid()
            )
        )
    );

-- POLICIES : profiles
drop policy if exists "admin all profiles" on profiles;
create policy "admin all profiles" on profiles
    for all using (
        (select role from profiles where id = auth.uid()) = 'admin'
    );

drop policy if exists "user read own profile" on profiles;
create policy "user read own profile" on profiles
    for select using (auth.uid() = id);

-- POLICIES : user_categories
drop policy if exists "admin all user_categories" on user_categories;
create policy "admin all user_categories" on user_categories
    for all using (
        (select role from profiles where id = auth.uid()) = 'admin'
    );

-- ============================================
-- INDEX
-- ============================================
create index if not exists idx_videos_category on videos(category_id);
create index if not exists idx_videos_position on videos(position);
create index if not exists idx_videos_favorite on videos(favorite);
create index if not exists idx_user_categories_user on user_categories(user_id);
