"use client"

import { useState } from "react"
import type { Flight, Seat } from "@/lib/types"
import { FlightSummary } from "@/components/flight-summary"
import { SeatMap } from "@/components/seat-map"
import { PassengerForm } from "@/components/passenger-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface BookingFlowProps {
  flight: Flight
  seats: Seat[]
  initialClass: "economy" | "business"
}

export function BookingFlow({ flight, seats, initialClass }: BookingFlowProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
  const [seatClass, setSeatClass] = useState<"economy" | "business">(initialClass)
  const [step, setStep] = useState<"seat" | "passenger">("seat")

  const price = seatClass === "economy" ? flight.base_price_economy : flight.base_price_business

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Flights
        </Button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === "seat" ? (
            <SeatMap
              flight={flight}
              seats={seats}
              selectedSeat={selectedSeat}
              onSeatSelect={setSelectedSeat}
              seatClass={seatClass}
              onClassChange={setSeatClass}
              onContinue={() => setStep("passenger")}
            />
          ) : (
            <PassengerForm
              flight={flight}
              selectedSeat={selectedSeat!}
              seatClass={seatClass}
              price={price}
              onBack={() => setStep("seat")}
            />
          )}
        </div>

        <div className="lg:col-span-1">
          <FlightSummary flight={flight} selectedSeat={selectedSeat} seatClass={seatClass} price={price} />
        </div>
      </div>
    </div>
  )
}
