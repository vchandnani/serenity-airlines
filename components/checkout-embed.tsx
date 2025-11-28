"use client"

import { useCallback } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { startCheckoutSession } from "@/app/actions/stripe"
import { useRouter } from "next/navigation"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutEmbedProps {
  flightId: string
  seatNumber: string
  seatClass: "economy" | "business"
  passengerName: string
  passengerEmail: string
  price: number
}

export function CheckoutEmbed({
  flightId,
  seatNumber,
  seatClass,
  passengerName,
  passengerEmail,
  price,
}: CheckoutEmbedProps) {
  const router = useRouter()

  const fetchClientSecret = useCallback(async () => {
    const result = await startCheckoutSession({
      flightId,
      seatNumber,
      seatClass,
      passengerName,
      passengerEmail,
      price,
    })

    return result.clientSecret
  }, [flightId, seatNumber, seatClass, passengerName, passengerEmail, price])

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{
          fetchClientSecret,
          onComplete: () => {
            // Redirect to success page after payment
            router.push("/booking-success")
          },
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
