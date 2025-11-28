-- Function to generate seats for a flight
create or replace function generate_seats_for_flight(
  p_flight_id uuid,
  p_economy_count integer,
  p_business_count integer
) returns void as $$
declare
  i integer;
begin
  -- Generate business class seats (rows 1-2, seats A-D)
  for i in 1..p_business_count loop
    insert into public.seats (flight_id, seat_number, seat_class, is_available)
    values (
      p_flight_id,
      concat(((i - 1) / 4 + 1)::text, 
             case (i - 1) % 4
               when 0 then 'A'
               when 1 then 'C'
               when 2 then 'D'
               when 3 then 'F'
             end),
      'business',
      true
    );
  end loop;
  
  -- Generate economy class seats (rows 10-15, seats A-F)
  for i in 1..p_economy_count loop
    insert into public.seats (flight_id, seat_number, seat_class, is_available)
    values (
      p_flight_id,
      concat(((i - 1) / 6 + 10)::text,
             case (i - 1) % 6
               when 0 then 'A'
               when 1 then 'B'
               when 2 then 'C'
               when 3 then 'D'
               when 4 then 'E'
               when 5 then 'F'
             end),
      'economy',
      true
    );
  end loop;
end;
$$ language plpgsql;

-- Generate seats for all flights
do $$
declare
  flight_record record;
begin
  for flight_record in select id, total_seats_economy, total_seats_business from public.flights loop
    perform generate_seats_for_flight(
      flight_record.id,
      flight_record.total_seats_economy,
      flight_record.total_seats_business
    );
  end loop;
end;
$$;
