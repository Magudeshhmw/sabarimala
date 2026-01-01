-- 1. Create payment_receivers table
create table if not exists payment_receivers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text check (type in ('CASH', 'GPAY')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (name, type)
);

-- 2. Insert default receivers (If not exists)
insert into payment_receivers (name, type) values
  ('Rajesh', 'CASH'),
  ('Sunil', 'CASH'),
  ('Arun', 'CASH'),
  ('Owner GPay', 'GPAY'),
  ('Admin GPay', 'GPAY')
on conflict (name, type) do nothing;

-- 3. Enable RLS
alter table payment_receivers enable row level security;

-- 4. Allow public read access
create policy "Allow public read access to payment_receivers"
on payment_receivers for select using (true);
