-- Seed some sample flights from US cities to Indian cities
insert into public.flights (flight_number, origin, destination, departure_time, arrival_time, aircraft_type, base_price_economy, base_price_business, total_seats_economy, total_seats_business) values
  ('AI101', 'New York (JFK)', 'Delhi (DEL)', now() + interval '2 days', now() + interval '2 days 15 hours', 'Boeing 777-300ER', 85000, 325000, 24, 8),
  ('AI102', 'Newark (EWR)', 'Mumbai (BOM)', now() + interval '3 days', now() + interval '3 days 16 hours', 'Boeing 787-9', 78000, 295000, 24, 8),
  ('AI103', 'Chicago (ORD)', 'Bangalore (BLR)', now() + interval '4 days', now() + interval '4 days 17 hours', 'Boeing 777-200LR', 82000, 310000, 24, 8),
  ('AI104', 'San Francisco (SFO)', 'Hyderabad (HYD)', now() + interval '5 days', now() + interval '5 days 18 hours', 'Boeing 787-8', 89000, 335000, 24, 8),
  ('AI105', 'Washington (IAD)', 'Chennai (MAA)', now() + interval '6 days', now() + interval '6 days 16 hours', 'Boeing 777-300ER', 81000, 305000, 24, 8),
  ('AI106', 'New York (JFK)', 'Mumbai (BOM)', now() + interval '7 days', now() + interval '7 days 15 hours', 'Boeing 787-9', 86000, 320000, 24, 8),
  ('AI107', 'Los Angeles (LAX)', 'Delhi (DEL)', now() + interval '8 days', now() + interval '8 days 19 hours', 'Boeing 777-200LR', 92000, 345000, 24, 8),
  ('AI108', 'Boston (BOS)', 'Bangalore (BLR)', now() + interval '9 days', now() + interval '9 days 17 hours', 'Boeing 787-8', 84000, 315000, 24, 8);
