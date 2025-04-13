// Path: .\src\app\vendor\services\page.tsx
'use client';
export const dynamic = 'force-dynamic'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CreditCard, Check, AlertTriangle, Loader2, Trash2, Edit, Power, PowerOff, Package } from 'lucide-react';

// --- Interfaces ---
interface AvailabilitySlot { day: string; time: string; }
interface Service {
  id: number; name: string; description: string | null; type: string;
  provider_id: number; island_id: number; price: number;
  availability: string | null; // Raw JSON string from DB/API
  images: string | null; // Raw comma-separated string or single URL from DB/API
  amenities: string | null; cancellation_policy: string | null;
  image_url?: string; // Derived: First image URL
  parsedAvailability?: AvailabilitySlot[]; // Derived: Parsed availability
  isActive: boolean; // Used for state toggling
  bookings?: number; // Optional stats from API
  rating?: number; // Optional stats from API
}
interface ServiceFormData {
  name: string; description: string; price: string; image_url: string;
  availability: AvailabilitySlot[]; type: string;
}
interface FormErrors {
    name?: string; description?: string; price?: string;
    availability?: string; type?: string;
}
// --- End Interfaces ---

// --- LoadingSpinner Component ---
const LoadingSpinner = ({ text = "Loading..." }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
    <p className="text-gray-500">{text}</p>
  </div>
);

// --- Helper Functions ---
const getServiceStatusColor = (isActive: boolean): string => {
  return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
};

const tryParseJson = (jsonString: string | null, defaultValue: any = null): any => {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return defaultValue;
  }
};
// --- End Helper Functions ---


export default function VendorServiceManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({ name: '', description: '', price: '', image_url: '', availability: [], type: 'activity' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // useEffect to fetch services
  useEffect(() => {
      const fetchServices = async () => {
          setIsLoading(true); setFetchError(null);
          try {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate fetch
              const mockServices: Service[] = [
                {
                  id: 1,
                  name: "Scuba Diving Experience",
                  description: "Explore the vibrant underwater world with our certified instructors.",
                  type: "activity",
                  provider_id: 1,
                  island_id: 2,
                  price: 2500,
                  availability: JSON.stringify([
                    { day: "Monday", time: "09:00 AM" },
                    { day: "Monday", time: "01:00 PM" },
                    { day: "Wednesday", time: "09:00 AM" },
                    { day: "Friday", time: "09:00 AM" },
                    { day: "Saturday", time: "09:00 AM" },
                    { day: "Saturday", time: "01:00 PM" },
                  ]),
                  images: "https://example.com/images/scuba1.jpg,https://example.com/images/scuba2.jpg",
                  amenities: "Equipment rental,Instructor,Underwater photos",
                  cancellation_policy: "48 hours notice required for full refund",
                  isActive: true,
                  bookings: 24,
                  rating: 4.7
                },
                {
                  id: 2,
                  name: "Island Hopping Tour",
                  description: "Visit multiple islands in one day with our comfortable boat tour.",
                  type: "tour",
                  provider_id: 1,
                  island_id: 2,
                  price: 1800,
                  availability: JSON.stringify([
                    { day: "Tuesday", time: "08:00 AM" },
                    { day: "Thursday", time: "08:00 AM" },
                    { day: "Sunday", time: "08:00 AM" },
                  ]),
                  images: "https://example.com/images/island-tour.jpg",
                  amenities: "Lunch,Snorkeling gear,Guide",
                  cancellation_policy: "24 hours notice required for full refund",
                  isActive: true,
                  bookings: 56,
                  rating: 4.5
                },
                {
                  id: 3,
                  name: "Beach Cabana Rental",
                  description: "Relax in comfort with our private beach cabanas.",
                  type: "accommodation",
                  provider_id: 1,
                  island_id: 2,
                  price: 1200,
                  availability: JSON.stringify([
                    { day: "Monday", time: "08:00 AM" },
                    { day: "Tuesday", time: "08:00 AM" },
                    { day: "Wednesday", time: "08:00 AM" },
                    { day: "Thursday", time: "08:00 AM" },
                    { day: "Friday", time: "08:00 AM" },
                    { day: "Saturday", time: "08:00 AM" },
                    { day: "Sunday", time: "08:00 AM" },
                  ]),
                  images: "https://example.com/images/cabana.jpg",
                  amenities: "Lounge chairs,Umbrella,Towels,Drink service",
                  cancellation_policy: "Same day cancellation: 50% refund",
                  isActive: false,
                  bookings: 12,
                  rating: 4.2
                }
              ];
              const processedServices = mockServices.map(s => ({
                  ...s,
                  image_url: s.images?.split(',')[0]?.trim(),
                  parsedAvailability: tryParseJson(s.availability, [])
              }));
              setServices(processedServices);
          } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
              setFetchError(errorMessage);
              console.error("Error fetching services:", err);
          }
          finally { setIsLoading(false); }
      };
      fetchServices();
  }, []);


  // Form Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field if it exists
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAvailabilityChange = (day: string, timeSlot: string, isAvailable: boolean) => {
    setFormData(prev => {
      let newAvailability = [...prev.availability];
      
      if (isAvailable) {
        // Add the slot if it doesn't exist
        if (!newAvailability.some(slot => slot.day === day && slot.time === timeSlot)) {
          newAvailability.push({ day, time: timeSlot });
        }
      } else {
        // Remove the slot if it exists
        newAvailability = newAvailability.filter(
          slot => !(slot.day === day && slot.time === timeSlot)
        );
      }
      
      return { ...prev, availability: newAvailability };
    });
    
    // Clear availability error if it exists
    if (errors.availability) {
      setErrors(prev => ({ ...prev, availability: undefined }));
    }
  };

  const isTimeSlotAvailable = (day: string, timeSlot: string): boolean => {
    return formData.availability.some(
      slot => slot.day === day && slot.time === timeSlot
    );
  };

  // Edit/Add Handlers
  const handleEditService = (service: Service) => {
    // Prepare form data from service
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      image_url: service.image_url || '',
      type: service.type,
      availability: service.parsedAvailability || []
    });
    setCurrentService(service);
    setIsEditing(true);
    setErrors({});
    setSuccessMessage('');
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNewService = () => {
    setFormData({ name: '', description: '', price: '', image_url: '', availability: [], type: 'activity' });
    setCurrentService(null);
    setIsEditing(true);
    setErrors({});
    setSuccessMessage('');
  };

  // --- Form Validation (FIXED return) ---
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Service name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price.trim()) { newErrors.price = 'Price is required'; }
    else { const priceNum = parseFloat(formData.price); if (isNaN(priceNum) || priceNum <= 0) newErrors.price = 'Price must be a positive number'; }
    if (!formData.type.trim()) newErrors.type = 'Service type is required';
    if (!Array.isArray(formData.availability) || formData.availability.length === 0) { newErrors.availability = 'Select at least one availability slot'; }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    // Ensure boolean is always returned
    return isValid; // Explicitly return the result
  };
  // --- End Form Validation ---

  // --- Form Submission (Simulation - FIXED Update Logic) ---
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSuccessMessage('');

    const priceNumber = parseFloat(formData.price);
    const submissionData = {
        ...formData,
        price: isNaN(priceNumber) ? 0 : priceNumber,
        availability: JSON.stringify(formData.availability), // Stringify for simulated save
        images: formData.image_url || null
    };
    console.log("Submitting Service Data (Simulation):", submissionData);

    setTimeout(() => {
      if (currentService) { // Update
        setServices(prevServices =>
          prevServices.map(service =>
            service.id === currentService.id
              ? { // Construct the updated Service object correctly
                  ...service, // Keep existing fields like provider_id, island_id, etc.
                  name: formData.name,
                  description: formData.description,
                  price: parseFloat(formData.price), // Use parsed number
                  type: formData.type,
                  images: formData.image_url || null, // Update raw images string
                  image_url: formData.image_url || undefined, // Update derived field
                  availability: JSON.stringify(formData.availability), // Update raw availability string
                  parsedAvailability: formData.availability, // Update parsed availability
                  // isActive is handled by toggle function, not here usually
                  // bookings/rating would be updated by other processes
                }
              : service // Return other services unchanged
          )
        );
        setSuccessMessage(`Service "${formData.name}" updated successfully!`);
      } else { // Add new
        const newService: Service = {
          id: Math.max(0, ...services.map(s => s.id)) + 1,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image_url: formData.image_url || undefined,
          images: formData.image_url || null,
          availability: JSON.stringify(formData.availability),
          parsedAvailability: formData.availability,
          isActive: true,
          type: formData.type,
          provider_id: 1, // Placeholder
          island_id: 2, // Placeholder
          amenities: null, cancellation_policy: null, bookings: 0, rating: undefined
        };
        setServices(prev => [...prev, newService]);
        setSuccessMessage(`New service "${formData.name}" added successfully!`);
      }
      setIsSubmitting(false);
      setIsEditing(false);
    }, 1000);
  };
  // --- End Form Submission ---

  // Cancel Edit
  const handleCancel = () => {
    setIsEditing(false);
    setCurrentService(null);
    setErrors({});
  };

  // Delete/Toggle Status (Simulation)
  const handleDeleteService = (serviceId: number) => {
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      setServices(prev => prev.filter(s => s.id !== serviceId));
      setSuccessMessage('Service deleted successfully');
    }
  };

  const handleToggleServiceStatus = (serviceId: number) => {
    setServices(prev => 
      prev.map(service => 
        service.id === serviceId 
          ? { ...service, isActive: !service.isActive } 
          : service
      )
    );
    
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSuccessMessage(`Service "${service.name}" ${service.isActive ? 'deactivated' : 'activated'} successfully`);
    }
  };

  // Constants for Availability Grid
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Manage Services</h1>
          <Link href="/vendor/dashboard" className="text-sm text-blue-600 hover:text-blue-800"> ← Back to Dashboard </Link>
        </div>

        {/* Messages */}
        {successMessage && ( <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert"> <span className="block sm:inline">{successMessage}</span> </div> )}
        {fetchError && !isLoading && ( <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"> <span className="block sm:inline">Error loading services: {fetchError}</span> </div> )}


        {/* Add/Edit Form */}
        {isEditing ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 border border-blue-200">
                 <div className="px-6 py-4 border-b bg-gray-50"> <h2 className="font-semibold text-lg">{currentService ? 'Edit Service' : 'Add New Service'}</h2> </div>
                 <div className="p-6">
                   <form onSubmit={handleSubmit} noValidate>
                      {/* Form Fields */}
                       <div className="mb-4"> <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1"> Name* </label> <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500`} required/> {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>} </div>
                       <div className="mb-4"> <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1"> Description* </label> <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500`} required></textarea> {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>} </div>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                           <div> <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1"> Price (₹)* </label> <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} min="0" step="0.01" className={`w-full border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500`} required/> {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>} </div>
                           <div> <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1"> Service Type* </label> <select id="type" name="type" value={formData.type} onChange={handleInputChange} required className={`w-full border ${errors.type ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white`}> <option value="activity">Activity</option> <option value="accommodation">Accommodation</option> <option value="transport">Transport</option> <option value="tour">Tour Package</option> <option value="other">Other</option> </select> {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>} </div>
                           <div> <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1"> Image URL </label> <input type="url" id="image_url" name="image_url" value={formData.image_url} onChange={handleInputChange} placeholder="https://..." className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"/> </div>
                      </div>
                      {/* Availability Grid */}
                      <div className="mb-6">
                           <label className="block text-sm font-medium text-gray-700 mb-2"> Availability* <span className="text-xs text-gray-500">(Select available time slots)</span> </label>
                           {errors.availability && <p className="mb-2 text-sm text-red-600">{errors.availability}</p>}
                           <div className="border border-gray-300 rounded-md overflow-hidden"> <div className="overflow-x-auto"> <table className="min-w-full divide-y divide-gray-200 text-xs"> <thead className="bg-gray-50"> <tr> <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10"> Day </th> {timeSlots.map((ts) => <th key={ts} className="px-1 py-2 text-center font-medium text-gray-500 uppercase whitespace-nowrap"> {ts.replace(' AM','a').replace(' PM','p')} </th>)} </tr> </thead> <tbody className="bg-white divide-y divide-gray-200"> {daysOfWeek.map((day) => ( <tr key={day}> <td className="px-2 py-2 whitespace-nowrap font-medium text-gray-900 sticky left-0 bg-white z-10"> {day} </td> {timeSlots.map((ts) => ( <td key={`${day}-${ts}`} className="px-1 py-2 whitespace-nowrap text-center"> <input type="checkbox" checked={isTimeSlotAvailable(day, ts)} onChange={(e) => handleAvailabilityChange(day, ts, e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" /> </td> ))} </tr> ))} </tbody> </table> </div> </div>
                      </div>
                      {/* Form Actions */}
                      <div className="flex justify-end space-x-3 pt-4 border-t"> <button type="button" onClick={handleCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm"> Cancel </button> <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50 flex items-center"> {isSubmitting && <Loader2 className="animate-spin h-4 w-4 mr-2"/>} {isSubmitting ? 'Saving...' : currentService ? 'Update Service' : 'Add Service'} </button> </div>
                   </form>
                 </div>
            </div>
        ) : (
          <div className="mb-6">
            <button onClick={handleAddNewService} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"> + Add New Service </button>
          </div>
        )}

        {/* Services List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
           <div className="px-6 py-4 border-b bg-gray-50"> <h2 className="font-semibold">Your Services</h2> </div>
            {isLoading ? (
                <LoadingSpinner text="Loading your services..." />
            ) : services.length === 0 ? (
               <div className="p-8 text-center text-gray-500"> You haven't added any services yet. </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                    {/* Table Headers */}
                    <tr>
                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Service </th>
                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Price </th>
                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Status </th>
                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Bookings </th>
                       <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"> Actions </th>
                    </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {services.map((service) => (
                     <tr key={service.id} className="hover:bg-gray-50">
                       {/* Service Column */}
                       <td className="px-4 py-4 whitespace-nowrap">
                           <div className="flex items-center">
                               <div className="h-10 w-10 bg-gray-100 rounded-md flex-shrink-0 mr-3 flex items-center justify-center">
                                    {service.image_url ? ( <Image src={service.image_url} alt={service.name} width={40} height={40} className="object-cover rounded-md" onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).style.display = 'none'; }}/> ) : ( <Package size={20} className="text-gray-400"/> )}
                               </div>
                               <div> <div className="text-sm font-medium text-gray-900">{service.name}</div> <div className="text-xs text-gray-500 truncate max-w-xs">{service.description || 'No description'}</div> </div>
                           </div>
                       </td>
                       {/* Price Column */}
                       <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900"> {typeof service.price === 'number' ? `₹${service.price.toLocaleString('en-IN')}` : service.price} </td>
                       {/* Status Column */}
                       <td className="px-4 py-4 whitespace-nowrap"> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getServiceStatusColor(service.isActive)}`}> {service.isActive ? 'Active' : 'Inactive'} </span> </td>
                       {/* Bookings Column */}
                       <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500"> {service.bookings ?? 'N/A'} </td>
                       {/* Actions Column */}
                       <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3"> <button onClick={() => handleEditService(service)} className="text-blue-600 hover:text-blue-900" title="Edit"><Edit size={16}/></button> <button onClick={() => handleToggleServiceStatus(service.id)} className={service.isActive ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"} title={service.isActive ? 'Deactivate' : 'Activate'}> {service.isActive ? <PowerOff size={16}/> : <Power size={16}/>} </button> <button onClick={() => handleDeleteService(service.id)} className="text-red-600 hover:text-red-900" title="Delete"><Trash2 size={16}/></button> </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"> <h3 className="text-lg font-medium text-blue-800 mb-4">Service Management Tips</h3> <ul className="space-y-2 text-sm text-blue-700 list-disc list-inside"> <li>Keep descriptions clear and accurate.</li> <li>Ensure availability is up-to-date to avoid conflicts.</li> <li>Upload high-quality images to attract customers.</li> <li>Respond promptly to booking inquiries.</li> </ul> </div>

      </div>
    </div>
  );
} // End of VendorServiceManagement component