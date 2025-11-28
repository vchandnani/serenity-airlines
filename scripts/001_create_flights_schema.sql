-- Create flights table
create table if not exists public.flights (
  id uuid primary key default gen_random_uuid(),
  flight_number text not null unique,
  origin text not null,
  destination text not null,
  departure_time timestamptz not null,
  arrival_time timestamptz not null,
  aircraft_type text not null,
  base_price_economy integer not null,
  base_price_business integer not null,
  total_seats_economy integer not null,
  total_seats_business integer not null,
  created_at timestamptz default now()
);

-- Create bookings table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  flight_id uuid references public.flights(id) on delete cascade,
  passenger_name text not null,
  passenger_email text not null,
  seat_number text not null,
  seat_class text not null check (seat_class in ('economy', 'business')),
  price_paid integer not null,
  booking_reference text not null unique,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'completed', 'failed')),
  stripe_session_id text,
  created_at timestamptz default now()
);

-- Create seats table (for real-time seat availability)
create table if not exists public.seats (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid references public.flights(id) on delete cascade,
  seat_number text not null,
  seat_class text not null check (seat_class in ('economy', 'business')),
  is_available boolean default true,
  booking_id uuid references public.bookings(id) on delete set null,
  unique(flight_id, seat_number)
);

-- Enable RLS on all tables
alter table public.flights enable row level security;
alter table public.bookings enable row level security;
alter table public.seats enable row level security;

-- RLS Policies for flights (public read access)
create policy "flights_select_all"
  on public.flights for select
  using (true);

-- RLS Policies for bookings (users can only see their own bookings)
create policy "bookings_select_own"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "bookings_insert_own"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "bookings_update_own"
  on public.bookings for update
  using (auth.uid() = user_id);

-- RLS Policies for seats (public read access for availability)
create policy "seats_select_all"
  on public.seats for select
  using (true);

create policy "seats_update_booking"
  on public.seats for update
  using (true);
