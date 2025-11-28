"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

interface CheckoutSessionData {
  flightId: string
  seatNumber: string
  seatClass: "economy" | "business"
  passengerName: string
  passengerEmail: string
  price: number
}

export async function startCheckoutSession(data: CheckoutSessionData) {
  const supabase = await createClient()

  // Get flight details
  const { data: flight } = await supabase.from("flights").select("*").eq("id", data.flightId).single()

  if (!flight) {
    throw new Error("Flight not found")
  }

  // Generate booking reference
  const bookingRef = `AI${Date.now().toString(36).toUpperCase()}`

  // Get current user (optional - booking can work without auth)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: `${flight.flight_number}: ${flight.origin} → ${flight.destination}`,
            description: `Seat ${data.seatNumber} - ${data.seatClass.charAt(0).toUpperCase() + data.seatClass.slice(1)} Class`,
          },
          unit_amount: data.price,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    customer_email: data.passengerEmail,
    metadata: {
      flightId: data.flightId,
      seatNumber: data.seatNumber,
      seatClass: data.seatClass,
      passengerName: data.passengerName,
      passengerEmail: data.passengerEmail,
      bookingReference: bookingRef,
      userId: user?.id || "guest",
    },
  })

  // Create pending booking
  await supabase.from("bookings").insert({
    user_id: user?.id || null,
    flight_id: data.flightId,
    passenger_name: data.passengerName,
    passenger_email: data.passengerEmail,
    seat_number: data.seatNumber,
    seat_class: data.seatClass,
    price_paid: data.price,
    booking_reference: bookingRef,
    payment_status: "pending",
    stripe_session_id: session.id,
  })

  // Reserve the seat temporarily
  await supabase
    .from("seats")
    .update({ is_available: false })
    .eq("flight_id", data.flightId)
    .eq("seat_number", data.seatNumber)

  return { clientSecret: session.client_secret }
}
