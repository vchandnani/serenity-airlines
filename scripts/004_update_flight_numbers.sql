-- Update flight numbers from AI to SR (Serenity Airlines)
UPDATE public.flights 
SET flight_number = 'SR' || substring(flight_number from 3) 
WHERE flight_number LIKE 'AI%';
