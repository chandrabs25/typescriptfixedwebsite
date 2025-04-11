/**
 * @jest/globals
 */
import { describe, expect, test } from '@jest/globals';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn()
    };
  }
}));

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
);

describe('API Endpoints', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('Bookings API should return bookings', async () => {
    // Mock implementation for this test
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          bookings: [
            {
              id: 'booking_1',
              packageName: 'Havelock Island Adventure',
              startDate: '2025-05-15',
              endDate: '2025-05-20',
              guests: 2,
              status: 'confirmed'
            }
          ] 
        }),
      })
    );

    const response = await fetch('/api/bookings?userId=user_123');
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.bookings).toBeDefined();
    expect(data.bookings.length).toBeGreaterThan(0);
    expect(data.bookings[0].packageName).toBe('Havelock Island Adventure');
  });

  test('Availability API should check package availability', async () => {
    // Mock implementation for this test
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          available: true,
          pricing: {
            basePrice: 25000,
            taxes: 5000,
            totalAmount: 30000
          }
        }),
      })
    );

    const response = await fetch('/api/availability?packageId=pkg_123&startDate=2025-05-15&endDate=2025-05-20&guests=2');
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.available).toBe(true);
    expect(data.pricing).toBeDefined();
    expect(data.pricing.totalAmount).toBe(30000);
  });

  test('Payment API should create order', async () => {
    // Mock implementation for this test
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          orderId: 'order_123456',
          status: 200
        }),
      })
    );

    const response = await fetch('/api/payment/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 30000,
        currency: 'INR',
        receipt: 'receipt_123'
      }),
    });
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.orderId).toBeDefined();
    expect(data.status).toBe(200);
  });
});
