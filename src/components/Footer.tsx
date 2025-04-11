'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Reach Andaman Travel</h3>
            <p className="text-gray-300 mb-4">
              Your ultimate guide to exploring the beautiful Andaman Islands. We provide comprehensive travel information, booking services, and curated experiences.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/destinations" className="text-gray-300 hover:text-white">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/packages" className="text-gray-300 hover:text-white">
                  Travel Packages
                </Link>
              </li>
              <li>
                <Link href="/activities" className="text-gray-300 hover:text-white">
                  Activities
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-white">
                  Travel Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h3 className="text-xl font-semibold mb-4">For Vendors</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/vendor/register" className="text-gray-300 hover:text-white">
                  Register as Vendor
                </Link>
              </li>
              <li>
                <Link href="/vendor/login" className="text-gray-300 hover:text-white">
                  Vendor Login
                </Link>
              </li>
              <li>
                <Link href="/vendor/how-it-works" className="text-gray-300 hover:text-white">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/vendor/terms" className="text-gray-300 hover:text-white">
                  Terms for Vendors
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Phone size={18} className="mr-2" />
                <span className="text-gray-300">+91 99999999</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2" />
                <a href="mailto:info@andamantravel.com" className="text-gray-300 hover:text-white">
                  info@reachandaman.com
                </a>
              </li>
              <li className="text-gray-300 mt-2">
                Port Blair, Andaman and Nicobar Islands, India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© {currentYear} Reach Andaman Travel Platform. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-white">
              Terms of Service
            </Link>
            <Link href="/refund-policy" className="hover:text-white">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
