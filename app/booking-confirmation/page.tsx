import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateTime, formatDate } from "@/lib/utils/date"
import { formatPrice } from "@/lib/utils/currency"
import { CheckCircle2, Calendar, Armchair, Mail, User } from "lucide-react"
import Link from "next/link"
import { confirmPayment } from "@/app/actions/booking"
import Image from "next/image"

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: { booking_id: string; session_id: string }
}) {
  const bookingId = searchParams.booking_id
  const sessionId = searchParams.session_id

  if (!bookingId || !sessionId) {
    notFound()
  }

  // Confirm the payment
  const result = await confirmPayment(bookingId, sessionId)

  if (result.error || !result.booking) {
    notFound()
  }

  const booking = result.booking

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
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">Your flight has been successfully booked</p>
          </div>

          <Card className="overflow-hidden">
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
                <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Route</p>
                    <p className="font-semibold text-lg">
                      {booking.flights.origin} → {booking.flights.destination}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Departure</p>
                    <p className="font-semibold">{formatDateTime(booking.flights.departure_time)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Arrival</p>
                    <p className="font-semibold">{formatDateTime(booking.flights.arrival_time)}</p>
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

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Passenger Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-semibold">{booking.passenger_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold">{booking.passenger_email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  A confirmation email has been sent to <strong>{booking.passenger_email}</strong> with your booking
                  details and e-ticket.
                </p>
              </div>

              <div className="flex gap-4">
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    Book Another Flight
                  </Button>
                </Link>
                <Link href="/my-bookings" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800">View My Bookings</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
