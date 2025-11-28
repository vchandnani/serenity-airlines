import { createClient } from "@/lib/supabase/server"
import type { Flight } from "@/lib/types"
import { FlightSearch } from "@/components/flight-search"
import { Plane } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: flights } = await supabase
    .from("flights")
    .select("*")
    .gte("departure_time", new Date().toISOString())
    .order("departure_time", { ascending: true })

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
          <nav className="flex items-center gap-4">
            <Link href="/my-bookings">
              <Button variant="outline">My Bookings</Button>
            </Link>
            <Link href="/auth/login">
              <Button>Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Book Your Journey to India</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience world-class comfort and hospitality on direct flights from major US cities to India
          </p>
        </div>

        <FlightSearch flights={(flights as Flight[]) || []} />
      </div>
    </main>
  )
}
