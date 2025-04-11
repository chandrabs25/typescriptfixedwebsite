// Path: .\src\app\auth\signup\page.tsx
'use client';

import React, { useState, useEffect } from 'react'; // Import React
import Image from 'next/image';
import Link from 'next/link';
import { User, Mail, Lock, ArrowRight } from 'lucide-react'; // Assuming ArrowRight is used somewhere or intended

// Define interface for form data
interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  agreeTerms: boolean;
}

// Define interface for form errors
interface SignupFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: string;
}


export default function SignupPage() {
  const [formData, setFormData] = useState<SignupFormData>({ // Add type annotation
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState<SignupFormErrors>({}); // Add type annotation
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // --- FIX: Add type annotation to the event parameter 'e' ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  // --- End of FIX ---
    const { name, value, type } = e.target;

    // Handle checkbox separately
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined; // Type cast for checked property

    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? checked : value
    }));

    // Clear error when field is edited
    if (errors[name as keyof SignupFormErrors]) { // Use keyof for type safety
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): SignupFormErrors => { // Add return type
    const newErrors: SignupFormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { // Add type annotation
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setSubmitError('');

    try {
       console.log("Submitting registration:", formData); // Debug log
      // Simulate API call - In real app, call your /api/auth/register
      // const response = await fetch('/api/auth/register', {
      //    method: 'POST',
      //    headers: { 'Content-Type': 'application/json' },
      //    body: JSON.stringify({
      //       name: `${formData.firstName} ${formData.lastName}`, // Combine names for API
      //       email: formData.email,
      //       password: formData.password,
      //       phone: formData.phone || null
      //    })
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message || 'Registration failed');

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

      // Redirect to login page on success
       console.log("Simulated registration successful."); // Debug log
      window.location.href = '/auth/signin?registered=true';
    } catch (err) {
       console.error("Registration submission error:", err); // Debug log
      setSubmitError(err instanceof Error ? err.message : 'An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of the component's return statement remains the same...
  return (
     <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
       {/* ... (rest of JSX unchanged) ... */}
         <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <Link href="/" className="flex justify-center">
              <h1 className="text-3xl font-bold text-blue-600">Andaman Explorer</h1>
            </Link>
            {/* ... rest of header ... */}
             <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900"> Create your account </h2>
             <p className="mt-2 text-center text-sm text-gray-600"> Already have an account?{' '} <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500"> Sign in </Link> </p>
          </div>
           <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                {submitError && ( <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"> {submitError} </div> )}
                 <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* ... form inputs ... */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                         <div>
                           <label htmlFor="firstName" className="block text-sm font-medium text-gray-700"> First name </label>
                           <div className="mt-1"> <input id="firstName" name="firstName" type="text" autoComplete="given-name" value={formData.firstName} onChange={handleChange} className={`appearance-none block w-full px-3 py-2 border ${ errors.firstName ? 'border-red-300' : 'border-gray-300' } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`} /> {errors.firstName && ( <p className="mt-2 text-sm text-red-600">{errors.firstName}</p> )} </div>
                         </div>
                         <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700"> Last name </label>
                            <div className="mt-1"> <input id="lastName" name="lastName" type="text" autoComplete="family-name" value={formData.lastName} onChange={handleChange} className={`appearance-none block w-full px-3 py-2 border ${ errors.lastName ? 'border-red-300' : 'border-gray-300' } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`} /> {errors.lastName && ( <p className="mt-2 text-sm text-red-600">{errors.lastName}</p> )} </div>
                          </div>
                       </div>
                       {/* ... email input ... */}
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700"> Email address </label>
                          <div className="mt-1 relative rounded-md shadow-sm"> <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> <Mail className="h-5 w-5 text-gray-400" /> </div> <input id="email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} className={`appearance-none block w-full pl-10 px-3 py-2 border ${ errors.email ? 'border-red-300' : 'border-gray-300' } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`} placeholder="you@example.com" /> </div> {errors.email && ( <p className="mt-2 text-sm text-red-600">{errors.email}</p> )}
                        </div>
                       {/* ... phone input ... */}
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700"> Phone number (optional) </label>
                          <div className="mt-1"> <input id="phone" name="phone" type="tel" autoComplete="tel" value={formData.phone} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="+91 9876543210" /> </div>
                        </div>
                       {/* ... password inputs ... */}
                       <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700"> Password </label>
                           <div className="mt-1 relative rounded-md shadow-sm"> <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> <Lock className="h-5 w-5 text-gray-400" /> </div> <input id="password" name="password" type="password" autoComplete="new-password" value={formData.password} onChange={handleChange} className={`appearance-none block w-full pl-10 px-3 py-2 border ${ errors.password ? 'border-red-300' : 'border-gray-300' } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`} /> </div> {errors.password && ( <p className="mt-2 text-sm text-red-600">{errors.password}</p> )}
                        </div>
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700"> Confirm password </label>
                           <div className="mt-1"> <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} className={`appearance-none block w-full px-3 py-2 border ${ errors.confirmPassword ? 'border-red-300' : 'border-gray-300' } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`} /> {errors.confirmPassword && ( <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p> )} </div>
                         </div>
                       {/* ... terms checkbox ... */}
                        <div className="flex items-center"> <input id="agreeTerms" name="agreeTerms" type="checkbox" checked={formData.agreeTerms} onChange={handleChange} className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${ errors.agreeTerms ? 'border-red-300' : '' }`} /> <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-900"> I agree to the{' '} <a href="#" className="text-blue-600 hover:text-blue-500"> Terms and Conditions </a>{' '} and{' '} <a href="#" className="text-blue-600 hover:text-blue-500"> Privacy Policy </a> </label> </div> {errors.agreeTerms && ( <p className="mt-2 text-sm text-red-600">{errors.agreeTerms}</p> )}
                     {/* ... submit button ... */}
                      <div> <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"> {isLoading ? 'Creating account...' : 'Create account'} </button> </div>
                 </form>
                 {/* ... social signup buttons ... */}
                   <div className="mt-6">
                      <div className="relative"> <div className="absolute inset-0 flex items-center"> <div className="w-full border-t border-gray-300" /> </div> <div className="relative flex justify-center text-sm"> <span className="px-2 bg-white text-gray-500">Or continue with</span> </div> </div>
                      <div className="mt-6 grid grid-cols-2 gap-3"> {/* Social buttons */} <div> <a href="#" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"> <span className="sr-only">Sign up with Google</span> {/* Google SVG */} <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.798-1.677-4.198-2.707-6.735-2.707-5.523 0-10 4.477-10 10s4.477 10 10 10c8.396 0 10-7.326 10-12 0-0.791-0.089-1.562-0.252-2.311h-9.748z" /></svg> </a> </div> <div> <a href="#" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"> <span className="sr-only">Sign up with Facebook</span> {/* Facebook SVG */} <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686 0.235 2.686 0.235v2.953h-1.514c-1.491 0-1.956 0.925-1.956 1.874v2.25h3.328l-0.532 3.47h-2.796v8.385c5.737-0.9 10.125-5.864 10.125-11.854z" /></svg> </a> </div> </div>
                   </div>
            </div>
          </div>
     </div>
  );
}