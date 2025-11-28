"use client"

import { useState } from "react"
import type { Flight, Seat } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Armchair, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/utils/currency"

interface SeatSelectionProps {
  flight: Flight
  initialSeats: Seat[]
  initialClass: "economy" | "business"
}

export function SeatSelection({ flight, initialSeats, initialClass }: SeatSelectionProps) {
  const [selectedClass, setSelectedClass] = useState<"economy" | "business">(initialClass)
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
  const [seats, setSeats] = useState<Seat[]>(initialSeats)

  const price = selectedClass === "economy" ? flight.base_price_economy : flight.base_price_business

  // Generate seat layout
  const businessRows = [1, 2, 3, 4]
  const businessColumns = ["A", "C", "D", "F"]
  const economyRows = Array.from({ length: 30 }, (_, i) => i + 10)
  const economyColumns = ["A", "B", "C", "D", "E", "F"]

  const rows = selectedClass === "business" ? businessRows : economyRows
  const columns = selectedClass === "business" ? businessColumns : economyColumns

  const getSeatStatus = (seatNumber: string) => {
    const seat = seats.find((s) => s.seat_number === seatNumber && s.seat_class === selectedClass)
    if (!seat) return "unavailable"
    if (seatNumber === selectedSeat) return "selected"
    if (!seat.is_available) return "occupied"
    return "available"
  }

  const handleSeatClick = (seatNumber: string) => {
    const status = getSeatStatus(seatNumber)
    if (status === "available") {
      setSelectedSeat(seatNumber)
      // Store selection in form data
      const form = document.getElementById("booking-form") as HTMLFormElement
      if (form) {
        const input = form.querySelector('input[name="seatNumber"]') as HTMLInputElement
        if (input) input.value = seatNumber
      }
    } else if (status === "selected") {
      setSelectedSeat(null)
    }
  }

  const handleClassChange = async (newClass: "economy" | "business") => {
    setSelectedClass(newClass)
    setSelectedSeat(null)

    // Fetch seats for the new class
    const response = await fetch(`/api/seats?flight_id=${flight.id}&class=${newClass}`)
    const data = await response.json()
    setSeats(data.seats || [])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Select Your Seat</CardTitle>
            <div className="flex gap-2">
              <Button
                className={selectedClass === "economy" ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
                variant={selectedClass === "economy" ? "default" : "outline"}
                onClick={() => handleClassChange("economy")}
              >
                Economy {formatPrice(flight.base_price_economy)}
              </Button>
              <Button
                className={selectedClass === "business" ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
                variant={selectedClass === "business" ? "default" : "outline"}
                onClick={() => handleClassChange("business")}
              >
                Business {formatPrice(flight.base_price_business)}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-gray-300 rounded bg-white" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-blue-600 rounded bg-blue-100" />
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-gray-300 rounded bg-gray-200" />
                <span>Occupied</span>
              </div>
            </div>

            {/* Seat Map */}
            <div className="bg-gray-50 p-6 rounded-lg overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Column headers */}
                <div className="flex items-center justify-center mb-4">
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns.length}, 2.5rem)` }}>
                    {columns.map((col) => (
                      <div key={col} className="text-center text-sm font-medium text-gray-600">
                        {col}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seat rows */}
                <div className="space-y-2">
                  {rows.map((row) => (
                    <div key={row} className="flex items-center gap-4">
                      <div className="text-sm font-medium text-gray-600 w-8 text-right">{row}</div>
                      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns.length}, 2.5rem)` }}>
                        {columns.map((col) => {
                          const seatNumber = `${row}${col}`
                          const status = getSeatStatus(seatNumber)

                          return (
                            <button
                              key={col}
                              type="button"
                              onClick={() => handleSeatClick(seatNumber)}
                              disabled={status === "occupied" || status === "unavailable"}
                              className={cn(
                                "w-10 h-10 border-2 rounded transition-all flex items-center justify-center",
                                status === "available" &&
                                  "border-gray-300 bg-white hover:border-blue-600 hover:bg-blue-50",
                                status === "selected" && "border-blue-600 bg-blue-100",
                                status === "occupied" && "border-gray-300 bg-gray-200 cursor-not-allowed",
                                status === "unavailable" && "border-transparent bg-transparent cursor-not-allowed",
                              )}
                            >
                              {status === "selected" && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                              {status === "occupied" && <Armchair className="h-4 w-4 text-gray-400" />}
                              {status === "available" && <Armchair className="h-4 w-4 text-gray-400" />}
                            </button>
                          )
                        })}
                      </div>
                      <div className="text-sm font-medium text-gray-600 w-8">{row}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selection summary */}
            {selectedSeat && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Selected Seat</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedSeat}</p>
                    <p className="text-sm text-muted-foreground capitalize">{selectedClass} Class</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(price)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
