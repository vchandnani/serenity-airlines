"use client"

import type { Flight, Seat } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SeatMapProps {
  flight: Flight
  seats: Seat[]
  selectedSeat: string | null
  onSeatSelect: (seat: string) => void
  seatClass: "economy" | "business"
  onClassChange: (seatClass: "economy" | "business") => void
  onContinue: () => void
}

export function SeatMap({
  flight,
  seats,
  selectedSeat,
  onSeatSelect,
  seatClass,
  onClassChange,
  onContinue,
}: SeatMapProps) {
  const businessSeats = seats.filter((s) => s.seat_class === "business")
  const economySeats = seats.filter((s) => s.seat_class === "economy")

  const renderSeatGrid = (seatsList: Seat[], columns: string[]) => {
    const rows = [...new Set(seatsList.map((s) => s.seat_number.replace(/[A-F]/, "")))]

    return (
      <div className="space-y-1">
        {rows.map((row) => {
          const rowSeats = columns.map((col) => {
            const seatNumber = `${row}${col}`
            return seatsList.find((s) => s.seat_number === seatNumber)
          })

          return (
            <div key={row} className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground w-8">{row}</span>
              <div className="flex gap-2">
                {rowSeats.map((seat, idx) => {
                  if (idx === 2) {
                    return (
                      <div key={`aisle-${row}-${idx}`} className="flex gap-2">
                        <div className="w-8" />
                        {seat && (
                          <button
                            onClick={() => seat.is_available && onSeatSelect(seat.seat_number)}
                            disabled={!seat.is_available}
                            className={cn(
                              "w-10 h-10 rounded-lg border-2 font-medium text-sm transition-all",
                              seat.is_available
                                ? selectedSeat === seat.seat_number
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-gray-300 hover:border-blue-400 bg-white"
                                : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed",
                            )}
                          >
                            {seat.seat_number.slice(-1)}
                          </button>
                        )}
                      </div>
                    )
                  }

                  return seat ? (
                    <button
                      key={seat.id}
                      onClick={() => seat.is_available && onSeatSelect(seat.seat_number)}
                      disabled={!seat.is_available}
                      className={cn(
                        "w-10 h-10 rounded-lg border-2 font-medium text-sm transition-all",
                        seat.is_available
                          ? selectedSeat === seat.seat_number
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300 hover:border-blue-400 bg-white"
                          : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed",
                      )}
                    >
                      {seat.seat_number.slice(-1)}
                    </button>
                  ) : (
                    <div key={`empty-${row}-${idx}`} className="w-10" />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Seat</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={seatClass} onValueChange={(v) => onClassChange(v as "economy" | "business")}>
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <TabsTrigger value="economy" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Economy Class
            </TabsTrigger>
            <TabsTrigger value="business" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Business Class
            </TabsTrigger>
          </TabsList>

          <TabsContent value="business" className="space-y-6">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 border-gray-300 bg-white" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 border-blue-600 bg-blue-600" />
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 border-gray-200 bg-gray-100" />
                <span>Occupied</span>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="text-center mb-6">
                <div className="inline-block bg-gradient-to-b from-gray-800 to-gray-600 text-white px-6 py-2 rounded-t-2xl">
                  Business Class
                </div>
              </div>
              {renderSeatGrid(businessSeats, ["A", "C", "D", "F"])}
            </div>
          </TabsContent>

          <TabsContent value="economy" className="space-y-6">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 border-gray-300 bg-white" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 border-blue-600 bg-blue-600" />
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 border-gray-200 bg-gray-100" />
                <span>Occupied</span>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="text-center mb-6">
                <div className="inline-block bg-gradient-to-b from-blue-800 to-blue-600 text-white px-6 py-2 rounded-t-2xl">
                  Economy Class
                </div>
              </div>
              {renderSeatGrid(economySeats, ["A", "B", "C", "D", "E", "F"])}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button
            size="lg"
            disabled={!selectedSeat}
            onClick={onContinue}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            Continue to Passenger Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
