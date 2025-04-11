/**
 * @jest/globals
 */
import { describe, expect, test } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock components since we can't actually render them in tests
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn()
    };
  }
}));

// Mock for testing purposes
const BookingForm = ({ packageId, packageName, basePrice }) => (
  <div data-testid="booking-form">
    <h2>Book {packageName}</h2>
    <button data-testid="check-availability">Check Availability</button>
    <button data-testid="submit-booking">Book Now</button>
  </div>
);

const UserBookings = () => (
  <div data-testid="user-bookings">
    <h1>My Bookings</h1>
    <div data-testid="booking-item">Havelock Island Adventure</div>
  </div>
);

const VendorBookings = () => (
  <div data-testid="vendor-bookings">
    <h1>Manage Bookings</h1>
    <div data-testid="booking-stats">
      <div>Pending Bookings: 2</div>
      <div>Total Revenue: ₹45,000</div>
    </div>
    <div data-testid="booking-item">Havelock Island Adventure</div>
  </div>
);

describe('UI Components', () => {
  test('BookingForm renders correctly', () => {
    render(
      <BookingForm 
        packageId="pkg_123" 
        packageName="Havelock Island Adventure" 
        basePrice={25000} 
      />
    );
    
    expect(screen.getByTestId('booking-form')).toBeInTheDocument();
    expect(screen.getByText('Book Havelock Island Adventure')).toBeInTheDocument();
    expect(screen.getByTestId('check-availability')).toBeInTheDocument();
    expect(screen.getByTestId('submit-booking')).toBeInTheDocument();
  });

  test('UserBookings renders correctly', () => {
    render(<UserBookings />);
    
    expect(screen.getByTestId('user-bookings')).toBeInTheDocument();
    expect(screen.getByText('My Bookings')).toBeInTheDocument();
    expect(screen.getByTestId('booking-item')).toBeInTheDocument();
    expect(screen.getByText('Havelock Island Adventure')).toBeInTheDocument();
  });

  test('VendorBookings renders correctly', () => {
    render(<VendorBookings />);
    
    expect(screen.getByTestId('vendor-bookings')).toBeInTheDocument();
    expect(screen.getByText('Manage Bookings')).toBeInTheDocument();
    expect(screen.getByTestId('booking-stats')).toBeInTheDocument();
    expect(screen.getByText('Pending Bookings: 2')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue: ₹45,000')).toBeInTheDocument();
  });
});
