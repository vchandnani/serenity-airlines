"use client"

import type React from "react"

import { useState } from "react"
import type { Flight } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBooking } from "@/app/actions/booking"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

interface BookingFormProps {
  flight: Flight
}

export function BookingForm({ flight }: BookingFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const seatClass = (searchParams.get("class") as "economy" | "business") || "economy"
  const price = seatClass === "economy" ? flight.base_price_economy : flight.base_price_business

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const seatNumber = formData.get("seatNumber") as string

    if (!seatNumber) {
      setError("Please select a seat first")
      setIsLoading(false)
      return
    }

    const bookingData = {
      flightId: flight.id,
      seatNumber,
      seatClass,
      passengerName: formData.get("passengerName") as string,
      passengerEmail: formData.get("passengerEmail") as string,
      price,
    }

    try {
      const result = await createBooking(bookingData)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      if (result.sessionUrl) {
        // Redirect to Stripe Checkout
        window.location.href = result.sessionUrl
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passenger Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="seatNumber" />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passengerName">Full Name *</Label>
              <Input id="passengerName" name="passengerName" placeholder="John Doe" required disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passengerEmail">Email Address *</Label>
              <Input
                id="passengerEmail"
                name="passengerEmail"
                type="email"
                placeholder="john@example.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            By proceeding, you agree to our terms and conditions. Payment is processed securely through Stripe.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
