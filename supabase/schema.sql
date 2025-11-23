-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create recipes table
create table if not exists public.recipes (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  ingredients jsonb default '[]'::jsonb,
  instructions jsonb default '[]'::jsonb,
  image_url text,
  prep_time integer default 0,
  cook_time integer default 0,
  servings integer default 1,
  user_id uuid references auth.users(id) default auth.uid()
);

-- Create meal_plans table
create table if not exists public.meal_plans (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null,
  meals jsonb default '{}'::jsonb,
  user_id uuid references auth.users(id) default auth.uid(),
  unique(date, user_id)
);

-- Set up Row Level Security (RLS)
alter table public.recipes enable row level security;
alter table public.meal_plans enable row level security;

-- Policies for recipes
create policy "Users can view their own recipes"
  on public.recipes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own recipes"
  on public.recipes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recipes"
  on public.recipes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own recipes"
  on public.recipes for delete
  using (auth.uid() = user_id);

-- Policies for meal_plans
create policy "Users can view their own meal plans"
  on public.meal_plans for select
  using (auth.uid() = user_id);

create policy "Users can insert their own meal plans"
  on public.meal_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own meal plans"
  on public.meal_plans for update
  using (auth.uid() = user_id);

create policy "Users can delete their own meal plans"
  on public.meal_plans for delete
  using (auth.uid() = user_id);

