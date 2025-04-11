// src/components/Header.tsx
'use client';

import { useState } from 'react'; // Import useState
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation'; // Import usePathname
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, User, Search, ShoppingCart, LogOut } from 'lucide-react'; // ShoppingCart might be unused, consider removing later

const Header = () => { // Arrow function starts here
  // --- Add missing state and hooks ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  // --- End of missing state and hooks ---

  // --- Add missing handlers and data ---
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout(); // Call the logout function from the hook
    closeMenu(); // Close mobile menu if open
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Destinations', href: '/destinations' },
    { name: 'Packages', href: '/packages' },
    { name: 'Activities', href: '/activities' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];
  // --- End of missing handlers and data ---

  // The return statement for the component's JSX
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex justify-between items-center">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="inline-block" onClick={closeMenu}>
              <Image
                src="/images/logo.jpg"
                alt="Reach Andaman Logo"
                width={1171}
                height={455}
                className="h-8 md:h-10 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm lg:text-base font-medium text-gray-600 hover:text-blue-600 transition-colors ${
                  pathname === link.href ? 'text-blue-600 border-b-2 border-blue-600' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* User Actions & Mobile Menu Toggle */}
          <div className="flex items-center space-x-3 md:space-x-4">
             {/* Search Icon */}
             <button className="text-gray-500 hover:text-blue-600 p-1">
                <span className="sr-only">Search</span>
                <Search size={20} />
             </button>

            {/* Desktop User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoading ? (
                <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
              ) : isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Check if user exists and their role_id corresponds to 'vendor' (ID 3) */}
                  {user?.role_id === 3 && (
                    <Link href="/vendor/dashboard" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                      Vendor Area
                    </Link>
                  )}
                  {/* Consolidated User/Bookings Link */}
                  <Link href="/user/dashboard" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors" title="My Account">
                     <User size={20} />
                     <span className="sr-only">Profile</span>
                  </Link>
                  {/* Logout Button */}
                  <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center" title="Logout">
                     <LogOut size={18} className="mr-1" />
                     <span className="hidden lg:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/auth/signup"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="text-sm font-medium bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

             {/* Mobile Menu Button */}
             <div className="md:hidden">
                <button onClick={toggleMenu} className="text-gray-600 hover:text-blue-600 p-1">
                  <span className="sr-only">Toggle Menu</span>
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
             </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-200 z-40">
            <nav className="flex flex-col px-4 py-4 space-y-2"> {/* Added nav tag */}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === link.href
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={closeMenu} // Close menu on link click
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 pb-2 border-t border-gray-200">
                {isLoading ? (
                   <div className="flex justify-center py-2">
                       <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                    </div>
                ) : isAuthenticated ? (
                  <div className="space-y-1">
                    {/* Display user's first name or email */}
                    <p className="px-3 py-2 text-sm font-medium text-gray-500">Welcome, {user?.first_name || user?.email}</p>
                    {/* Check role_id for vendor */}
                    {user?.role_id === 3 && (
                      <Link
                        href="/vendor/dashboard"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        onClick={closeMenu}
                      >
                        Vendor Dashboard
                      </Link>
                    )}
                    <Link
                      href="/user/dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      onClick={closeMenu}
                    >
                      My Account
                    </Link>
                    <Link
                      href="/user/bookings"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      onClick={closeMenu}
                    >
                      My Bookings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Link
                      href="/auth/signin"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      onClick={closeMenu}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      onClick={closeMenu}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </nav> {/* Close nav tag */}
          </div>
        )}
      </div>
    </header>
  );
// --- FIX: Add the missing closing curly brace for the Header component function ---
};
// --- End of FIX ---

export default Header;