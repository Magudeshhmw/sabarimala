-- ==========================================
-- 1. MEMBERS TABLE UPDATE
-- ==========================================

-- Create members table if missing
create table if not exists members (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  mobile_number text not null unique,
  bag_number text not null unique,
  bus_number text not null,
  seat_number text, -- Kept for legacy compatibility, though removed from UI
  payment_status text not null default 'UNPAID',
  payment_method text not null default 'NONE',
  payment_receiver text,
  amount numeric not null default 2500,
  referral text
);

-- Add 'referral' column if it's missing (Safe to run multiple times)
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'members' and column_name = 'referral') then
    alter table members add column referral text;
  end if;
end $$;


-- ==========================================
-- 2. APP SETTINGS (ADMIN PASSWORD)
-- ==========================================

create table if not exists app_settings (
  key text primary key,
  value text not null
);

-- Default Admin Password: 'admin123'
insert into app_settings (key, value)
values ('admin_password', 'admin123')
on conflict (key) do nothing;


-- ==========================================
-- 3. PAYMENT RECEIVERS (NEW)
-- ==========================================

create table if not exists payment_receivers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text check (type in ('CASH', 'GPAY')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (name, type)
);

-- Default Receivers
insert into payment_receivers (name, type) values
  ('Rajesh', 'CASH'),
  ('Sunil', 'CASH'),
  ('Arun', 'CASH'),
  ('Owner GPay', 'GPAY'),
  ('Admin GPay', 'GPAY')
on conflict (name, type) do nothing;


-- ==========================================
-- 4. SECURITY POLICIES (RLS)
-- ==========================================

-- Enable RLS
alter table members enable row level security;
alter table app_settings enable row level security;
alter table payment_receivers enable row level security;

-- Drop existing policies to ensure clean state (optional, handles duplicate errors)
drop policy if exists "Allow public access to members" on members;
drop policy if exists "Allow public access to settings" on app_settings;
drop policy if exists "Allow public access to payment_receivers" on payment_receivers;

-- Create Open Policies (Since auth is handled in-app for now)
create policy "Allow public access to members" 
  on members for all using (true);

create policy "Allow public access to settings" 
  on app_settings for all using (true);

create policy "Allow public access to payment_receivers" 
  on payment_receivers for all using (true);
