import type { Flight } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatDateTime, calculateDuration } from "@/lib/utils/date"
import { formatPrice } from "@/lib/utils/currency"
import { Plane, Armchair } from "lucide-react"

interface FlightSummaryProps {
  flight: Flight
  selectedSeat: string | null
  seatClass: "economy" | "business"
  price: number
}

export function FlightSummary({ flight, selectedSeat, seatClass, price }: FlightSummaryProps) {
  const duration = calculateDuration(flight.departure_time, flight.arrival_time)

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Booking Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Flight Number</p>
          <p className="font-semibold">{flight.flight_number}</p>
        </div>

        <Separator />

        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">From</p>
            <p className="font-semibold">{flight.origin}</p>
            <p className="text-sm">{formatDateTime(flight.departure_time)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">To</p>
            <p className="font-semibold">{flight.destination}</p>
            <p className="text-sm">{formatDateTime(flight.arrival_time)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-semibold">{duration}</p>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-sm text-muted-foreground">Class</p>
          <p className="font-semibold capitalize">{seatClass}</p>
        </div>

        {selectedSeat && (
          <>
            <div className="flex items-center gap-2">
              <Armchair className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Selected Seat</p>
                <p className="font-semibold text-lg">{selectedSeat}</p>
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Amount</span>
            <span className="text-2xl font-bold text-orange-600">{formatPrice(price)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
