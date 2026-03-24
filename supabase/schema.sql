create extension if not exists pgcrypto;

create type public.app_role as enum ('student', 'admin');
create type public.moderation_status as enum ('pending', 'approved', 'rejected');

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  role public.app_role not null default 'student',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null,
  content text not null check (char_length(content) between 12 and 1500),
  moderation_status public.moderation_status not null default 'pending',
  moderated_by uuid,
  moderated_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint posts_author_id_fkey
    foreign key (author_id) references public.profiles (id) on delete cascade,
  constraint posts_moderated_by_fkey
    foreign key (moderated_by) references public.profiles (id) on delete set null
);

create table if not exists public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null,
  image_url text not null,
  storage_path text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  constraint post_images_post_id_fkey
    foreign key (post_id) references public.posts (id) on delete cascade
);

create table if not exists public.post_likes (
  post_id uuid not null,
  user_id uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (post_id, user_id),
  constraint post_likes_post_id_fkey
    foreign key (post_id) references public.posts (id) on delete cascade,
  constraint post_likes_user_id_fkey
    foreign key (user_id) references public.profiles (id) on delete cascade
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null,
  author_id uuid not null,
  content text not null check (char_length(content) between 2 and 280),
  moderation_status public.moderation_status not null default 'approved',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint comments_post_id_fkey
    foreign key (post_id) references public.posts (id) on delete cascade,
  constraint comments_author_id_fkey
    foreign key (author_id) references public.profiles (id) on delete cascade
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.is_admin(check_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = check_user
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, display_name)
  values (
    new.id,
    new.email,
    coalesce(lower(new.raw_user_meta_data ->> 'username'), 'user_' || substring(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, 'Ученик'), '@', 1))
  )
  on conflict (id) do update
  set
    email = excluded.email,
    username = excluded.username,
    display_name = excluded.display_name;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.handle_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row execute procedure public.handle_updated_at();

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at
before update on public.comments
for each row execute procedure public.handle_updated_at();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_images enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;

create policy "Profiles are visible to everyone"
on public.profiles
for select
using (true);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "Approved posts are public, own and admin posts are visible"
on public.posts
for select
using (
  moderation_status = 'approved'
  or author_id = auth.uid()
  or public.is_admin()
);

create policy "Authenticated users can create posts"
on public.posts
for insert
to authenticated
with check (author_id = auth.uid());

create policy "Admins can moderate posts"
on public.posts
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can delete own pending posts"
on public.posts
for delete
to authenticated
using (
  (author_id = auth.uid() and moderation_status = 'pending')
  or public.is_admin()
);

create policy "Post images follow parent post visibility"
on public.post_images
for select
using (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id
      and (
        posts.moderation_status = 'approved'
        or posts.author_id = auth.uid()
        or public.is_admin()
      )
  )
);

create policy "Authors can attach images to own posts"
on public.post_images
for insert
to authenticated
with check (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id
      and posts.author_id = auth.uid()
  )
);

create policy "Likes are visible to everyone"
on public.post_likes
for select
using (true);

create policy "Authenticated users can like approved posts"
on public.post_likes
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.posts
    where posts.id = post_likes.post_id
      and posts.moderation_status = 'approved'
  )
);

create policy "Users can remove own likes"
on public.post_likes
for delete
to authenticated
using (user_id = auth.uid());

create policy "Comments are visible with parent post access"
on public.comments
for select
using (
  moderation_status = 'approved'
  and exists (
    select 1
    from public.posts
    where posts.id = comments.post_id
      and (
        posts.moderation_status = 'approved'
        or posts.author_id = auth.uid()
        or public.is_admin()
      )
  )
);

create policy "Authenticated users can comment approved posts"
on public.comments
for insert
to authenticated
with check (
  author_id = auth.uid()
  and exists (
    select 1
    from public.posts
    where posts.id = comments.post_id
      and posts.moderation_status = 'approved'
  )
);

create policy "Users can manage own comments"
on public.comments
for update
to authenticated
using (author_id = auth.uid() or public.is_admin())
with check (author_id = auth.uid() or public.is_admin());

create policy "Users can delete own comments"
on public.comments
for delete
to authenticated
using (author_id = auth.uid() or public.is_admin());

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "Public can read post images from storage"
on storage.objects
for select
using (bucket_id = 'post-images');

create policy "Authenticated users upload images into own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Authenticated users manage own uploaded images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Authenticated users delete own uploaded images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create or replace view public.posts_feed
with (security_invoker = true)
as
select
  posts.id,
  posts.author_id,
  profiles.display_name as author_name,
  profiles.username as author_username,
  profiles.avatar_url as author_avatar,
  posts.content,
  posts.moderation_status,
  posts.created_at,
  posts.updated_at,
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', post_images.id,
          'imageUrl', post_images.image_url,
          'sortOrder', post_images.sort_order
        )
        order by post_images.sort_order
      )
      from public.post_images
      where post_images.post_id = posts.id
    ),
    '[]'::jsonb
  ) as images,
  (
    select count(*)::int
    from public.post_likes
    where post_likes.post_id = posts.id
  ) as likes_count,
  (
    select count(*)::int
    from public.comments
    where comments.post_id = posts.id
      and comments.moderation_status = 'approved'
  ) as comments_count
from public.posts
join public.profiles on profiles.id = posts.author_id;

grant usage on schema public to anon, authenticated;
grant select on public.posts_feed to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, update, delete on public.comments to authenticated;
grant select, insert, delete on public.post_likes to authenticated;
grant select, insert on public.post_images to authenticated;

comment on table public.profiles is 'Чтобы сделать пользователя админом, обновите поле role в этой таблице.';
