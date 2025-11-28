export interface Flight {
  id: string
  flight_number: string
  origin: string
  destination: string
  departure_time: string
  arrival_time: string
  aircraft_type: string
  base_price_economy: number
  base_price_business: number
  total_seats_economy: number
  total_seats_business: number
}

export interface Seat {
  id: string
  flight_id: string
  seat_number: string
  seat_class: "economy" | "business"
  is_available: boolean
  booking_id: string | null
}

export interface Booking {
  id: string
  user_id: string | null
  flight_id: string
  passenger_name: string
  passenger_email: string
  seat_number: string
  seat_class: "economy" | "business"
  price_paid: number
  confirmation_code: string
  status: "pending" | "completed" | "failed"
  stripe_payment_id: string | null
  created_at: string
  flights?: Flight
}
