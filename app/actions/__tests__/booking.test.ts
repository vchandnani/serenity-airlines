import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies before importing the module
const mockStripeInstance = {
  checkout: {
    sessions: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
  },
}

vi.mock('stripe', () => {
  return {
    default: class MockStripe {
      constructor() {
        return mockStripeInstance
      }
    },
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}))

// Set environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'

describe('createBooking', () => {
  let mockSupabase: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    }

    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
  })

  it('should create a booking successfully', async () => {
    const { createBooking } = await import('../booking')
    
    const mockUser = { id: 'user-123' }
    const mockBooking = {
      id: 'booking-123',
      flight_id: 'flight-123',
      passenger_name: 'John Doe',
      passenger_email: 'john@example.com',
      seat_number: 'A1',
      seat_class: 'economy',
      price_paid: 299.99,
      confirmation_code: 'AI123ABC',
      status: 'pending',
    }
    const mockFlight = {
      id: 'flight-123',
      flight_number: 'SA101',
      origin: 'New York',
      destination: 'Los Angeles',
    }
    const mockStripeSession = {
      url: 'https://checkout.stripe.com/session-123',
    }

    // Setup Supabase mocks
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    
    const mockFrom = vi.fn()
    mockSupabase.from = mockFrom

    // Mock bookings insert
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockBooking, error: null }),
      }),
    })

    // Mock seats update
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })

    // Mock flights select
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockFlight, error: null }),
      }),
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'bookings') {
        return {
          insert: mockInsert,
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      if (table === 'seats') {
        return { update: mockUpdate }
      }
      if (table === 'flights') {
        return { select: mockSelect }
      }
      return {}
    })

    // Setup Stripe mock
    mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockStripeSession)

    const formData = {
      flightId: 'flight-123',
      seatNumber: 'A1',
      seatClass: 'economy' as const,
      passengerName: 'John Doe',
      passengerEmail: 'john@example.com',
      price: 299.99,
    }

    const result = await createBooking(formData)

    expect(result).toEqual({
      sessionUrl: 'https://checkout.stripe.com/session-123',
      bookingId: 'booking-123',
    })
    expect(mockSupabase.auth.getUser).toHaveBeenCalled()
    expect(mockInsert).toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalled()
    expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalled()
  })

  it('should handle booking creation error', async () => {
    const { createBooking } = await import('../booking')
    
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
    
    const mockFrom = vi.fn()
    mockSupabase.from = mockFrom

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
      }),
    })

    mockFrom.mockReturnValue({
      insert: mockInsert,
    })

    const formData = {
      flightId: 'flight-123',
      seatNumber: 'A1',
      seatClass: 'economy' as const,
      passengerName: 'John Doe',
      passengerEmail: 'john@example.com',
      price: 299.99,
    }

    const result = await createBooking(formData)

    expect(result).toEqual({ error: 'Failed to create booking' })
  })

  it('should handle seat reservation failure and rollback', async () => {
    const { createBooking } = await import('../booking')
    
    const mockUser = { id: 'user-123' }
    const mockBooking = {
      id: 'booking-123',
      flight_id: 'flight-123',
      passenger_name: 'John Doe',
      passenger_email: 'john@example.com',
      seat_number: 'A1',
      seat_class: 'economy',
      price_paid: 299.99,
      confirmation_code: 'AI123ABC',
      status: 'pending',
    }

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    
    const mockFrom = vi.fn()
    mockSupabase.from = mockFrom

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockBooking, error: null }),
      }),
    })

    const mockDelete = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'Seat not available' } }),
      }),
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'bookings') {
        return {
          insert: mockInsert,
          delete: mockDelete,
        }
      }
      if (table === 'seats') {
        return { update: mockUpdate }
      }
      return {}
    })

    const formData = {
      flightId: 'flight-123',
      seatNumber: 'A1',
      seatClass: 'economy' as const,
      passengerName: 'John Doe',
      passengerEmail: 'john@example.com',
      price: 299.99,
    }

    const result = await createBooking(formData)

    expect(result).toEqual({ error: 'Seat no longer available' })
    expect(mockDelete).toHaveBeenCalled()
  })

  it('should work without authenticated user', async () => {
    const { createBooking } = await import('../booking')
    
    const mockBooking = {
      id: 'booking-123',
      flight_id: 'flight-123',
      passenger_name: 'John Doe',
      passenger_email: 'john@example.com',
      seat_number: 'A1',
      seat_class: 'economy',
      price_paid: 299.99,
      confirmation_code: 'AI123ABC',
      status: 'pending',
    }
    const mockFlight = {
      id: 'flight-123',
      flight_number: 'SA101',
      origin: 'New York',
      destination: 'Los Angeles',
    }
    const mockStripeSession = {
      url: 'https://checkout.stripe.com/session-123',
    }

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
    
    const mockFrom = vi.fn()
    mockSupabase.from = mockFrom

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockBooking, error: null }),
      }),
    })

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockFlight, error: null }),
      }),
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'bookings') {
        return { insert: mockInsert }
      }
      if (table === 'seats') {
        return { update: mockUpdate }
      }
      if (table === 'flights') {
        return { select: mockSelect }
      }
      return {}
    })

    mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockStripeSession)

    const formData = {
      flightId: 'flight-123',
      seatNumber: 'A1',
      seatClass: 'business' as const,
      passengerName: 'Jane Doe',
      passengerEmail: 'jane@example.com',
      price: 599.99,
    }

    const result = await createBooking(formData)

    expect(result).toEqual({
      sessionUrl: 'https://checkout.stripe.com/session-123',
      bookingId: 'booking-123',
    })
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: null,
      })
    )
  })
})

describe('confirmPayment', () => {
  let mockSupabase: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    mockSupabase = {
      from: vi.fn(),
    }

    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
  })

  it('should confirm payment successfully', async () => {
    const { confirmPayment } = await import('../booking')
    
    const mockSession = {
      payment_status: 'paid',
      payment_intent: 'pi_1234567890',
    }
    const mockBooking = {
      id: 'booking-123',
      flight_id: 'flight-123',
      passenger_name: 'John Doe',
      passenger_email: 'john@example.com',
      seat_number: 'A1',
      seat_class: 'economy',
      price_paid: 299.99,
      confirmation_code: 'AI123ABC',
      status: 'completed',
      stripe_payment_id: 'pi_1234567890',
      flights: {
        id: 'flight-123',
        flight_number: 'SA101',
        origin: 'New York',
        destination: 'Los Angeles',
      },
    }

    mockStripeInstance.checkout.sessions.retrieve.mockResolvedValue(mockSession)

    const mockFrom = vi.fn()
    mockSupabase.from = mockFrom

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockBooking, error: null }),
      }),
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'bookings') {
        return {
          update: mockUpdate,
          select: mockSelect,
        }
      }
      return {}
    })

    const result = await confirmPayment('booking-123', 'session-123')

    expect(result).toEqual({ booking: mockBooking })
    expect(mockStripeInstance.checkout.sessions.retrieve).toHaveBeenCalledWith('session-123')
    expect(mockUpdate).toHaveBeenCalledWith({
      status: 'completed',
      stripe_payment_id: 'pi_1234567890',
    })
  })

  it('should return error when payment is not completed', async () => {
    const { confirmPayment } = await import('../booking')
    
    const mockSession = {
      payment_status: 'unpaid',
      payment_intent: null,
    }

    mockStripeInstance.checkout.sessions.retrieve.mockResolvedValue(mockSession)

    const result = await confirmPayment('booking-123', 'session-123')

    expect(result).toEqual({ error: 'Payment not completed' })
  })

  it('should handle database update error', async () => {
    const { confirmPayment } = await import('../booking')
    
    const mockSession = {
      payment_status: 'paid',
      payment_intent: 'pi_1234567890',
    }

    mockStripeInstance.checkout.sessions.retrieve.mockResolvedValue(mockSession)

    const mockFrom = vi.fn()
    mockSupabase.from = mockFrom

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
    })

    mockFrom.mockReturnValue({
      update: mockUpdate,
    })

    const result = await confirmPayment('booking-123', 'session-123')

    expect(result).toEqual({ error: 'Failed to confirm booking' })
  })
})
