-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (Users)
create table public.profiles (
  id text primary key, -- LINE User ID
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Menus
create table public.menus (
  id uuid default uuid_generate_v4() primary key,
  owner_id text references public.profiles(id) not null,
  title text not null,
  company_name text,
  share_token text unique not null,
  is_open boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Menu Items
create table public.menu_items (
  id uuid default uuid_generate_v4() primary key,
  menu_id uuid references public.menus(id) on delete cascade not null,
  name text not null,
  price integer not null,
  description text
);

-- Orders
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  menu_id uuid references public.menus(id) on delete cascade not null,
  buyer_name text not null,
  total_price integer not null,
  content jsonb, -- Stores array of items: [{name, price, quantity, note}]
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.menus enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;

-- Profiles: Public read, Self update
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (true); -- Simplified for LIFF flow
create policy "Users can update own profile" on public.profiles for update using (id = auth.uid()); -- Note: auth.uid() needs custom mapping if using Supabase Auth with LINE, but here we might use custom ID. 
-- IMPORTANT: Since we are using LINE ID as primary key and might not be using Supabase Auth's built-in JWT for LIFF users directly without custom auth, 
-- we might need to adjust RLS or use a service role for some operations if we don't implement full custom auth.
-- For this prototype, we will assume the client sends the LINE ID and we might rely on client-side security or a simple RLS where possible.
-- A better approach for production: Exchange LINE ID token for Supabase JWT. 
-- For this "Simple" prompt, we will allow public insert/read for simplicity or assume the backend handles it.
-- Let's stick to a permissive policy for the prototype to ensure it works easily, but add comments.

create policy "Enable read access for all users" on public.profiles for select using (true);
create policy "Enable insert for all users" on public.profiles for insert with check (true);
create policy "Enable update for users based on ID" on public.profiles for update using (true);

-- Menus: Owner can do everything, Public can read via share token (conceptually)
create policy "Menus are viewable by everyone" on public.menus for select using (true);
create policy "Users can create menus" on public.menus for insert with check (true);
create policy "Users can update own menus" on public.menus for update using (owner_id = current_setting('app.current_user_id', true)); -- Conceptual

-- For this specific request, since we don't have a full backend server to sign JWTs, 
-- we will use standard Supabase Client. 
-- We will make tables public for this prototype to ensure the "Vue + Supabase" works without complex Auth setup 
-- (which usually requires a backend function to verify LINE token and mint Supabase JWT).
-- WE WILL USE PUBLIC ACCESS FOR SIMPLICITY AS REQUESTED "精簡版".

create policy "Public Access Menus" on public.menus for all using (true);
create policy "Public Access Items" on public.menu_items for all using (true);
create policy "Public Access Orders" on public.orders for all using (true);
