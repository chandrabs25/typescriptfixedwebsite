// Path: .\src\app\contact\page.tsx
'use client';

import React, { useState, useRef } from 'react'; // Import React
import Image from 'next/image';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react'; // Added Loader2

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{success?: boolean; message?: string} | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear status message when user starts typing again
    if (submitStatus) setSubmitStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Simulate API call - Replace with your actual API endpoint logic
    console.log("Submitting contact form:", formData);
    try {
        // Example: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) ... });
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

        setSubmitStatus({
            success: true,
            message: 'Thank you for your message! We will get back to you soon.'
        });
        if (formRef.current) {
            formRef.current.reset();
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        }
    } catch (error) {
        console.error("Contact form submission error:", error);
        setSubmitStatus({
            success: false,
            message: 'Sorry, there was an error sending your message. Please try again later.'
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-blue-900 h-64 md:h-80">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-700/70 z-10"></div> {/* Added opacity */}

        {/* Image Container */}
        <div className="absolute inset-0 z-0"> {/* Lower z-index */}
          {/* Desktop Image */}
          <Image
            src="/images/contact-hero.jpg"
            alt="Contact Us - Andaman"
            fill
            className="object-cover hidden md:block" // Hide on mobile, show md+
            priority
          />
          {/* Mobile Image */}
          <Image
            src="/images/contact-hero-mobile.jpg" // Ensure this file exists in public/images
            alt="Contact Us - Andaman"
            fill
            className="object-cover block md:hidden" // Show on mobile, hide md+
            priority
          />
        </div>

        {/* Text Content */}
        <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-20"> {/* Higher z-index */}
          {/* Adjusted text sizes */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-2 md:mb-4">
            Contact Us
          </h1>
          <p className="text-lg sm:text-xl text-white text-center max-w-2xl opacity-90">
            We're here to help plan your perfect Andaman adventure
          </p>
        </div>
      </div>

      {/* Contact Content */}
      <div className="container mx-auto px-4 py-10 md:py-16"> {/* Adjusted padding */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16"> {/* Increased gap */}

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Get In Touch</h2>
              <p className="text-gray-700 mb-6 md:mb-8 text-base leading-relaxed"> {/* Adjusted text size/leading */}
                Have questions about planning your trip? Need help booking a package or activity?
                Our friendly team is ready to assist you.
              </p>

              <div className="space-y-5 md:space-y-6"> {/* Adjusted spacing */}
                {/* Phone */}
                <div className="flex items-start">
                   <div className="flex-shrink-0 bg-blue-100 p-2.5 rounded-full mr-3 md:mr-4"> <Phone className="h-5 w-5 md:h-6 md:w-6 text-blue-600" /> </div>
                   <div> <h3 className="text-base md:text-lg font-semibold text-gray-800">Phone</h3> <a href="tel:+913192123456" className="text-gray-700 hover:text-blue-600 block">+91 3192 123456</a> <a href="tel:+919876543210" className="text-gray-700 hover:text-blue-600 block">+91 9876 543210</a> </div>
                 </div>
                {/* Email */}
                <div className="flex items-start">
                   <div className="flex-shrink-0 bg-blue-100 p-2.5 rounded-full mr-3 md:mr-4"> <Mail className="h-5 w-5 md:h-6 md:w-6 text-blue-600" /> </div>
                   <div> <h3 className="text-base md:text-lg font-semibold text-gray-800">Email</h3> <a href="mailto:info@reachandaman.com" className="text-gray-700 hover:text-blue-600 block break-all">info@reachandaman.com</a> <a href="mailto:support@reachandaman.com" className="text-gray-700 hover:text-blue-600 block break-all">support@reachandaman.com</a> </div>
                 </div>
                {/* Address */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 p-2.5 rounded-full mr-3 md:mr-4"> <MapPin className="h-5 w-5 md:h-6 md:w-6 text-blue-600" /> </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-800">Office Address</h3>
                    <p className="text-gray-700">
                      45 Marine Drive, Phoenix Bay<br />
                      Port Blair, Andaman & Nicobar Islands<br />
                      India - 744101
                    </p>
                  </div>
                </div>
              </div>

              {/* Office Hours */}
              <div className="mt-8 md:mt-10">
                 <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">Office Hours</h3>
                 <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200"> {/* Added border */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"> {/* Adjusted grid/gap */}
                     <div> <p className="font-medium text-gray-700 text-sm">Mon - Fri:</p> <p className="text-gray-600 text-sm">9:00 AM - 6:00 PM IST</p> </div>
                     <div> <p className="font-medium text-gray-700 text-sm">Saturday:</p> <p className="text-gray-600 text-sm">10:00 AM - 4:00 PM IST</p> </div>
                     <div className="sm:col-span-2"> <p className="font-medium text-gray-700 text-sm">Sunday:</p> <p className="text-gray-600 text-sm">Closed</p> </div>
                   </div>
                 </div>
               </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200"> {/* Added border and padding */}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Send Us a Message</h2>

              {submitStatus && (
                <div className={`p-4 mb-6 rounded-md text-sm ${submitStatus.success ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                  {submitStatus.message}
                </div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5"> {/* Adjusted spacing */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1"> Full Name * </label>
                  <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base" placeholder="Your Name" /> {/* Adjusted padding/size */}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5"> {/* Adjusted gap */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1"> Email Address * </label>
                    <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base" placeholder="you@example.com" />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1"> Phone Number </label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base" placeholder="(Optional)" />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1"> Subject * </label>
                  <input type="text" id="subject" name="subject" required value={formData.subject} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base" placeholder="e.g., Package Inquiry" />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1"> Message * </label>
                  <textarea id="message" name="message" rows={4} required value={formData.message} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base" placeholder="Your message..."></textarea>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition-colors" // Adjusted padding
                  >
                    {isSubmitting ? (
                       <> <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> Sending... </>
                    ) : (
                      <> <Send className="h-5 w-5 mr-2" /> Send Message </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-12 md:mt-16"> {/* Adjusted margin */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">Find Us On Map</h2> {/* Centered */}
            <div className="h-64 md:h-96 bg-gray-200 rounded-lg overflow-hidden shadow-md"> {/* Added shadow */}
              <div className="relative w-full h-full">
                <Image
                  src="/images/map.jpg"
                  alt="Office Location Map - Port Blair" // More specific alt text
                  fill
                  className="object-cover"
                />
                {/* You could overlay an iframe map here for interactivity if needed */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}