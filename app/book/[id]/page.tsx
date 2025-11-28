import { createClient } from "@/lib/supabase/server"
import type { Flight } from "@/lib/types"
import { notFound } from "next/navigation"
import { BookingFlow } from "@/components/booking-flow"

interface BookingPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ class?: string }>
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const { id } = await params
  const { class: seatClass } = await searchParams

  const supabase = await createClient()

  const { data: flight } = await supabase.from("flights").select("*").eq("id", id).single()

  if (!flight) {
    notFound()
  }

  const { data: seats } = await supabase.from("seats").select("*").eq("flight_id", id).order("seat_number")

  const selectedClass = seatClass === "business" || seatClass === "economy" ? seatClass : "economy"

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <BookingFlow flight={flight as Flight} seats={seats || []} initialClass={selectedClass} />
    </main>
  )
}
