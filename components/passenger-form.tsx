"use client"

import type React from "react"

import { useState } from "react"
import type { Flight } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CheckoutEmbed } from "@/components/checkout-embed"
import { User, Mail, ArrowLeft } from "lucide-react"

interface PassengerFormProps {
  flight: Flight
  selectedSeat: string
  seatClass: "economy" | "business"
  price: number
  onBack: () => void
}

export function PassengerForm({ flight, selectedSeat, seatClass, price, onBack }: PassengerFormProps) {
  const [passengerName, setPassengerName] = useState("")
  const [passengerEmail, setPassengerEmail] = useState("")
  const [showCheckout, setShowCheckout] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowCheckout(true)
  }

  if (showCheckout) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Complete Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckoutEmbed
            flightId={flight.id}
            seatNumber={selectedSeat}
            seatClass={seatClass}
            passengerName={passengerName}
            passengerEmail={passengerEmail}
            price={price}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passenger Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">As shown on passport or government ID</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={passengerEmail}
                onChange={(e) => setPassengerEmail(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">Booking confirmation will be sent to this email</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Seat Selection
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              Proceed to Payment
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
