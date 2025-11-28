import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function BookingSuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Your flight has been successfully booked. A confirmation email has been sent to your email address.
          </p>

          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-orange-900 mb-2">Important: Please check your email</p>
            <p className="text-sm text-orange-700">
              Your booking reference and e-ticket have been sent to your email address.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Link href="/my-bookings">
              <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                View My Bookings
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                Book Another Flight
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
