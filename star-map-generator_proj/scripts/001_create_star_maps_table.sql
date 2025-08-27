-- Create star_maps table to store user's star map configurations
create table if not exists public.star_maps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  subtitle text,
  date date not null,
  location text not null,
  latitude real not null,
  longitude real not null,
  theme text not null default 'light',
  show_constellations boolean default true,
  show_grid boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.star_maps enable row level security;

-- Create RLS policies
create policy "star_maps_select_own"
  on public.star_maps for select
  using (auth.uid() = user_id);

create policy "star_maps_insert_own"
  on public.star_maps for insert
  with check (auth.uid() = user_id);

create policy "star_maps_update_own"
  on public.star_maps for update
  using (auth.uid() = user_id);

create policy "star_maps_delete_own"
  on public.star_maps for delete
  using (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger star_maps_updated_at
  before update on public.star_maps
  for each row
  execute function public.handle_updated_at();
