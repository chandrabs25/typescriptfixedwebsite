// Path: ./src/app/about/page.tsx
'use client';

import Image from 'next/image';
// Removed unused Link import, can add back if needed elsewhere
// import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-blue-900 h-64 md:h-80">
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700 opacity-70 z-0"></div> {/* Added opacity */}

        {/* --- Image Container --- */}
        <div className="absolute inset-0 z-[-1]"> {/* Send images behind the gradient */}
          {/* Desktop Image */}
          <Image
            src="/images/about-hero.jpg" // Desktop image path
            alt="About Reach Andaman - Team meeting" // Descriptive alt text
            fill
            className="object-cover hidden md:block" // Hidden on mobile, shown md+
            priority
          />
          {/* Mobile Image */}
          <Image
            src="/images/about-hero-mobile.jpg" // Mobile image path (ensure this file exists)
            alt="About Reach Andaman - Team" // Descriptive alt text
            fill
            className="object-cover block md:hidden" // Shown on mobile, hidden md+
            priority
          />
        </div>
        {/* --- End Image Container --- */}

        <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-10"> {/* Keep text above overlays/image */}
          {/* Adjusted text sizes for mobile */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-2 md:mb-4">
            About Reach Andaman
          </h1>
          <p className="text-lg sm:text-xl text-white text-center max-w-2xl opacity-90"> {/* Slightly reduced opacity */}
            Your trusted partner for unforgettable Andaman experiences
          </p>
        </div>
      </div>

      {/* About Content */}
      <div className="container mx-auto px-4 py-10 md:py-16"> {/* Adjusted padding */}
        <div className="max-w-4xl mx-auto">
          {/* Our Story */}
          <div className="mb-10 md:mb-16"> {/* Adjusted margin */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 text-center md:text-left">Our Story</h2>
            {/* Use Tailwind typography for better control */}
            <div className="space-y-4 text-gray-700 text-base md:text-lg leading-relaxed">
              <p>
                Founded in 2023, Reach Andaman was born out of a passion for the breathtaking beauty of the Andaman Islands and a desire to share this hidden paradise with travelers from around the world. What began as a small team of local guides has grown into a comprehensive travel platform dedicated to providing authentic and memorable experiences.
              </p>
              <p>
                Our journey started when our founder, a native Andamanese, recognized the need for a reliable travel service that could showcase the islands' natural wonders while respecting their delicate ecosystems and supporting local communities. Today, we continue to uphold these values as we help travelers discover the magic of the Andamans.
              </p>
            </div>
          </div>

          {/* Our Mission */}
          <div className="mb-10 md:mb-16"> {/* Adjusted margin */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 text-center md:text-left">Our Mission</h2>
            <div className="text-gray-700 text-base md:text-lg leading-relaxed">
              <p className="mb-4">
                At Reach Andaman, our mission is to provide exceptional travel experiences that connect visitors with the natural beauty, rich culture, and warm hospitality of the Andaman Islands. We are committed to:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4"> {/* Adjusted list styling */}
                <li>Promoting sustainable tourism that preserves the islands' pristine environments</li>
                <li>Supporting local communities through responsible travel practices</li>
                <li>Offering personalized services that cater to each traveler's unique preferences</li>
                <li>Ensuring safety, comfort, and satisfaction throughout your journey</li>
                <li>Creating unforgettable memories that last a lifetime</li>
              </ul>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="mb-10 md:mb-16"> {/* Adjusted margin */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8 text-center">Why Choose Us</h2> {/* Centered heading */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"> {/* Adjusted gap */}
              {/* Card 1 */}
              <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left"> {/* Text align changes */}
                {/* Icon can go here if desired */}
                <h3 className="text-lg md:text-xl font-semibold mb-2">Local Expertise</h3>
                <p className="text-gray-700 text-sm">
                  Our team consists of local experts ensuring authentic experiences and insider access.
                </p>
              </div>
               {/* Card 2 */}
              <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left">
                {/* Icon can go here if desired */}
                <h3 className="text-lg md:text-xl font-semibold mb-2">Personalized Service</h3>
                <p className="text-gray-700 text-sm">
                  We tailor itineraries to match your interests, preferences, and travel style.
                </p>
              </div>
               {/* Card 3 */}
              <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left">
                {/* Icon can go here if desired */}
                <h3 className="text-lg md:text-xl font-semibold mb-2">Sustainable Practices</h3>
                <p className="text-gray-700 text-sm">
                  Committed to eco-friendly tourism that preserves the natural beauty of the Andamans.
                </p>
              </div>
            </div>
          </div>

          {/* Our Team */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8 text-center">Our Team</h2> {/* Centered heading */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"> {/* Adjusted grid for small screens */}
              {/* Team Member 1 */}
              <div className="text-center">
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-3 rounded-full overflow-hidden shadow-md"> {/* Adjusted size */}
                  <Image src="/images/team-1.jpg" alt="Kanna - Founder & CEO" fill className="object-cover"/>
                </div>
                <h3 className="text-lg font-semibold">Kanna</h3>
                <p className="text-gray-600 text-sm">Founder & CEO</p>
              </div>
              {/* Team Member 2 */}
              <div className="text-center">
                 <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-3 rounded-full overflow-hidden shadow-md">
                  <Image src="/images/team-2.jpg" alt="Elon Musk - Head of Operations" fill className="object-cover"/>
                </div>
                <h3 className="text-lg font-semibold">Elon Musk</h3>
                <p className="text-gray-600 text-sm">Head of Operations</p>
              </div>
               {/* Team Member 3 */}
               <div className="text-center">
                 <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-3 rounded-full overflow-hidden shadow-md">
                   <Image src="/images/team-3.jpg" alt="Mia Khalifa - Lead Tour Guide" fill className="object-cover"/>
                 </div>
                 <h3 className="text-lg font-semibold">Mia Khalifa</h3>
                 <p className="text-gray-600 text-sm">Lead Tour Guide</p>
               </div>
               {/* Team Member 4 */}
               <div className="text-center">
                 <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-3 rounded-full overflow-hidden shadow-md">
                   <Image src="/images/team-4.jpg" alt="Sunny Leone - Customer Relations" fill className="object-cover"/>
                 </div>
                 <h3 className="text-lg font-semibold">Sunny Leone</h3>
                 <p className="text-gray-600 text-sm">Customer Relations</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}