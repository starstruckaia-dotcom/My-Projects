-- migration-002-auth-organizations.sql
-- Purpose: Link Supabase Auth users to organizations (restaurants)

-- 1. Create junction table between users and organizations
create table if not exists user_organizations (
  user_id uuid references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  role text default 'owner',
  created_at timestamptz default now(),
  primary key (user_id, organization_id)
);

-- 2. Enable Row Level Security
alter table user_organizations enable row level security;

-- 3. Allow users to read their own org memberships
create policy "users can read their orgs"
on user_organizations
for select
using (auth.uid() = user_id);

-- 4. Allow users to insert themselves (on signup)
create policy "users can join orgs"
on user_organizations
for insert
with check (auth.uid() = user_id);
