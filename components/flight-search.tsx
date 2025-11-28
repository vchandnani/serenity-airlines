"use client"

import { useState, useMemo } from "react"
import type { Flight } from "@/lib/types"
import { FlightCard } from "@/components/flight-card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface FlightSearchProps {
  flights: Flight[]
}

export function FlightSearch({ flights }: FlightSearchProps) {
  const [origin, setOrigin] = useState<string>("all")
  const [destination, setDestination] = useState<string>("all")
  const [seatClass, setSeatClass] = useState<string>("all")

  const origins = useMemo(() => {
    const uniqueOrigins = [...new Set(flights.map((f) => f.origin))]
    return uniqueOrigins.sort()
  }, [flights])

  const destinations = useMemo(() => {
    const uniqueDestinations = [...new Set(flights.map((f) => f.destination))]
    return uniqueDestinations.sort()
  }, [flights])

  const filteredFlights = useMemo(() => {
    return flights.filter((flight) => {
      const originMatch = origin === "all" || flight.origin === origin
      const destinationMatch = destination === "all" || flight.destination === destination
      return originMatch && destinationMatch
    })
  }, [flights, origin, destination])

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Search className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Search Flights</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="origin">From (US City)</Label>
            <Select value={origin} onValueChange={setOrigin}>
              <SelectTrigger id="origin">
                <SelectValue placeholder="Select origin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {origins.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">To (India City)</Label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger id="destination">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {destinations.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select value={seatClass} onValueChange={setSeatClass}>
              <SelectTrigger id="class">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="economy">Economy</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900">Available Flights ({filteredFlights.length})</h3>

        {filteredFlights.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow border border-gray-100">
            <p className="text-gray-600">No flights found matching your criteria</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredFlights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                preferredClass={seatClass !== "all" ? (seatClass as "economy" | "business") : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
