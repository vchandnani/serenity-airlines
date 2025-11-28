import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { SeatSelection } from "@/components/seat-selection"
import { BookingForm } from "@/components/booking-form"
import type { Flight } from "@/lib/types"
import { Plane } from "lucide-react"
import Link from "next/link"

export default async function BookFlightPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { class?: string }
}) {
  const supabase = await createClient()
  const flightId = params.id
  const seatClass = (searchParams.class as "economy" | "business") || "economy"

  const { data: flight } = await supabase.from("flights").select("*").eq("id", flightId).single()

  if (!flight) {
    notFound()
  }

  const { data: seats } = await supabase.from("seats").select("*").eq("flight_id", flightId).eq("seat_class", seatClass)

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-orange-600 to-red-600 p-2 rounded-lg">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Air India</h1>
              <p className="text-xs text-gray-600">Connecting US to India</p>
            </div>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <SeatSelection flight={flight as Flight} initialSeats={seats || []} initialClass={seatClass} />
          <div className="mt-8">
            <BookingForm flight={flight as Flight} />
          </div>
        </div>
      </div>
    </main>
  )
}
