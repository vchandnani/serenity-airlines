import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const flightId = searchParams.get("flight_id")
  const seatClass = searchParams.get("class")

  if (!flightId || !seatClass) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: seats, error } = await supabase
    .from("seats")
    .select("*")
    .eq("flight_id", flightId)
    .eq("seat_class", seatClass)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ seats })
}
