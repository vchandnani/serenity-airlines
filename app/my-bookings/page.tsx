import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateTime, formatDate } from "@/lib/utils/date"
import { formatPrice } from "@/lib/utils/currency"
import { Calendar, Armchair, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function MyBookingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, flights(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Serenity Airlines Logo"
              width={48}
              height={48}
              className="w-12 h-12 rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Serenity Airlines</h1>
              <p className="text-xs text-gray-600">Connecting US to India</p>
            </div>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h2>
          <p className="text-muted-foreground">View all your flight reservations</p>
        </div>

        {!bookings || bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">You have no bookings yet</p>
              <Link href="/">
                <Button>Book a Flight</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking: any) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 mb-2">
                        {booking.flights.flight_number}
                        <Badge variant="outline" className="font-mono">
                          {booking.confirmation_code}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(booking.flights.departure_time)}</span>
                      </div>
                    </div>
                    <Badge
                      className={
                        booking.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Route</p>
                        <p className="font-semibold">
                          {booking.flights.origin} → {booking.flights.destination}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Departure</p>
                        <p className="font-semibold">{formatDateTime(booking.flights.departure_time)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Passenger</p>
                        <p className="font-semibold">{booking.passenger_name}</p>
                        <p className="text-sm text-muted-foreground">{booking.passenger_email}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 flex-1">
                          <Armchair className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Seat</p>
                            <p className="text-2xl font-bold">{booking.seat_number}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Class</p>
                          <p className="font-semibold capitalize">{booking.seat_class}</p>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Amount Paid</p>
                        <p className="text-2xl font-bold text-blue-600">{formatPrice(booking.price_paid)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
