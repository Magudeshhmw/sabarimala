-- 1. Create the members table if it doesn't exist
create table if not exists members (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  mobile_number text not null unique,
  bag_number text not null unique,
  bus_number text not null,
  seat_number text,
  payment_status text not null default 'UNPAID',
  payment_method text not null default 'NONE',
  payment_receiver text,
  amount numeric not null default 2500,
  referral text
);

-- 2. Add 'referral' column if the table already exists but the column does not
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'members' and column_name = 'referral') then
    alter table members add column referral text;
  end if;
end $$;

-- 3. Create the app_settings table for Admin Password
create table if not exists app_settings (
  key text primary key,
  value text not null
);

-- 4. Set default Admin Password to 'admin123' (only if not set)
insert into app_settings (key, value)
values ('admin_password', 'admin123')
on conflict (key) do nothing;

-- 5. Enable Row Level Security (RLS)
alter table members enable row level security;
alter table app_settings enable row level security;

-- 6. Create policies to allow public access (since we handle auth in app code for now)
-- Replace with specific policies if you implement Supabase Auth later
create policy "Allow public access to members"
on members for all using (true);

create policy "Allow public access to settings"
on app_settings for all using (true);
