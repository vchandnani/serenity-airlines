"use server"

import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

export async function createBooking(formData: {
  flightId: string
  seatNumber: string
  seatClass: "economy" | "business"
  passengerName: string
  passengerEmail: string
  price: number
}) {
  const supabase = await createClient()

  // Generate unique confirmation code
  const confirmationCode = `AI${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`

  // Get authenticated user (optional)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Create pending booking
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      flight_id: formData.flightId,
      user_id: user?.id || null,
      passenger_name: formData.passengerName,
      passenger_email: formData.passengerEmail,
      seat_number: formData.seatNumber,
      seat_class: formData.seatClass,
      price_paid: formData.price,
      confirmation_code: confirmationCode,
      status: "pending",
    })
    .select()
    .single()

  if (bookingError || !booking) {
    return { error: "Failed to create booking" }
  }

  // Reserve the seat
  const { error: seatError } = await supabase
    .from("seats")
    .update({ is_available: false, booking_id: booking.id })
    .eq("flight_id", formData.flightId)
    .eq("seat_number", formData.seatNumber)

  if (seatError) {
    // Rollback booking if seat reservation fails
    await supabase.from("bookings").delete().eq("id", booking.id)
    return { error: "Seat no longer available" }
  }

  // Get flight details for Stripe
  const { data: flight } = await supabase.from("flights").select("*").eq("id", formData.flightId).single()

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${flight?.flight_number} - ${flight?.origin} to ${flight?.destination}`,
            description: `Seat ${formData.seatNumber} (${formData.seatClass.toUpperCase()})`,
          },
          unit_amount: Math.round(formData.price * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/booking-confirmation?booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/book/${formData.flightId}?class=${formData.seatClass}`,
    metadata: {
      booking_id: booking.id,
      confirmation_code: confirmationCode,
    },
  })

  return { sessionUrl: session.url, bookingId: booking.id }
}

export async function confirmPayment(bookingId: string, sessionId: string) {
  const supabase = await createClient()

  // Verify the Stripe session
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status === "paid") {
    // Update booking status
    const { error } = await supabase
      .from("bookings")
      .update({
        status: "completed",
        stripe_payment_id: session.payment_intent as string,
      })
      .eq("id", bookingId)

    if (error) {
      return { error: "Failed to confirm booking" }
    }

    // Get booking details
    const { data: booking } = await supabase.from("bookings").select("*, flights(*)").eq("id", bookingId).single()

    return { booking }
  }

  return { error: "Payment not completed" }
}
