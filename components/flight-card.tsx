"use client"

import type { Flight } from "@/lib/types"
import { formatDateTime, formatDate, calculateDuration } from "@/lib/utils/date"
import { formatPrice } from "@/lib/utils/currency"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plane, Clock, Calendar } from "lucide-react"
import Link from "next/link"

interface FlightCardProps {
  flight: Flight
  preferredClass?: "economy" | "business"
}

export function FlightCard({ flight, preferredClass }: FlightCardProps) {
  const economyPrice = formatPrice(flight.base_price_economy)
  const businessPrice = formatPrice(flight.base_price_business)
  const duration = calculateDuration(flight.departure_time, flight.arrival_time)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-mono">
                    {flight.flight_number}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{flight.aircraft_type}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(flight.departure_time)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {flight.origin.split("(")[1]?.replace(")", "") || flight.origin}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{formatDateTime(flight.departure_time)}</p>
              </div>

              <div className="flex-1 flex flex-col items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Clock className="h-4 w-4" />
                  <span>{duration}</span>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent relative">
                  <Plane className="h-5 w-5 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Direct</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {flight.destination.split("(")[1]?.replace(")", "") || flight.destination}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{formatDateTime(flight.arrival_time)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:min-w-[200px]">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Economy</span>
                <span className="text-lg font-bold text-gray-900">{economyPrice}</span>
              </div>
              <Link href={`/book/${flight.id}?class=economy`}>
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  variant={preferredClass === "economy" ? "default" : "outline"}
                >
                  Select Economy
                </Button>
              </Link>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Business</span>
                <span className="text-lg font-bold text-gray-900">{businessPrice}</span>
              </div>
              <Link href={`/book/${flight.id}?class=business`}>
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  variant={preferredClass === "business" ? "default" : "outline"}
                >
                  Select Business
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
