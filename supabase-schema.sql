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
-- FONCTION is_admin (contourne RLS)
-- ============================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
    );
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table categories enable row level security;
alter table videos enable row level security;
alter table profiles enable row level security;
alter table user_categories enable row level security;

-- Supprimer toutes les policies existantes
drop policy if exists "admin full access categories" on categories;
drop policy if exists "user read categories" on categories;
drop policy if exists "admin full access videos" on videos;
drop policy if exists "user read allowed videos" on videos;
drop policy if exists "admin all profiles" on profiles;
drop policy if exists "user read own profile" on profiles;
drop policy if exists "admin all user_categories" on user_categories;

-- CATEGORIES : admin = tout, user = lecture seule
create policy "admin full access categories" on categories
    for all using (public.is_admin());

create policy "user read categories" on categories
    for select using (true);

-- VIDEOS : admin = tout, user = uniquement ses catégories autorisées
create policy "admin full access videos" on videos
    for all using (public.is_admin());

create policy "user read allowed videos" on videos
    for select using (
        not public.is_admin()
        and category_id in (
            select category_id from user_categories
            where user_id = auth.uid()
        )
    );

-- PROFILES : admin = tout, user = son propre profil
create policy "admin all profiles" on profiles
    for all using (public.is_admin());

create policy "user read own profile" on profiles
    for select using (auth.uid() = id);

-- USER_CATEGORIES : admin = tout, user = lecture seule
create policy "admin all user_categories" on user_categories
    for all using (public.is_admin());

create policy "user read own categories" on user_categories
    for select using (user_id = auth.uid());

-- ============================================
-- 5. PAGE_VIEWS (statistiques)
-- ============================================
create table if not exists page_views (
    id bigint generated always as identity primary key,
    user_id uuid references profiles(id) on delete cascade,
    page text not null,
    visited_at timestamp default now()
);

alter table page_views enable row level security;

create policy "page_views select for admin"
on page_views for select
using (public.is_admin());

create policy "page_views insert for auth"
on page_views for insert
with check (auth.role() = 'authenticated');

-- ============================================
-- INDEX
-- ============================================
create index if not exists idx_videos_category on videos(category_id);
create index if not exists idx_videos_position on videos(position);
create index if not exists idx_videos_favorite on videos(favorite);
create index if not exists idx_user_categories_user on user_categories(user_id);
create index if not exists idx_page_views_user on page_views(user_id);
create index if not exists idx_page_views_page on page_views(page);
create index if not exists idx_page_views_date on page_views(visited_at);
