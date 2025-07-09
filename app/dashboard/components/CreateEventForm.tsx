'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, AlertCircle, Image as ImageIcon, Wind, ChevronDown, PartyPopper, CheckCircle2 } from 'lucide-react';

type Props = {
  userId: string;
  onSuccess?: () => void;
};

// --- Helper Components ---
const InputField = ({ icon: Icon, children, error }: { icon: React.ElementType, children: React.ReactNode, error?: boolean }) => (
  <div className={`flex items-center bg-gray-50 border ${error ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-3 transition-all duration-300 focus-within:ring-2 focus-within:ring-gray-200 focus-within:border-gray-400`}>
    <Icon className={`h-5 w-5 ${error ? 'text-red-500' : 'text-gray-400'}`} />
    <div className="flex-grow ml-3">
      {children}
    </div>
  </div>
);

// --- Main Component ---
export default function CreateEventForm({ userId, onSuccess }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  // Added new state for success modal and created event ID
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    date: '',
    time: '',
    description: '',
    pricePerPlayer: 0,
    slots: 10,
    image: null as File | null,
    preview: null as string | null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // Using environment variable for API key
  const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

  // --- Persistence Logic: Load from sessionStorage on initial mount ---
  useEffect(() => {
    console.log("PERSISTENCE: Component mounted. Attempting to load form data from sessionStorage...");
    const savedFormData = sessionStorage.getItem('eventFormData');
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        console.log("PERSISTENCE: Parsed saved data from sessionStorage:", parsed);
        setFormData(prev => ({
          ...prev,
          ...parsed,
          image: null,
          preview: parsed.preview || null,
        }));
        console.log("PERSISTENCE: formData state set from sessionStorage with:", parsed);
      } catch (err) {
        console.error("PERSISTENCE ERROR: Failed to parse saved form data from sessionStorage:", err);
      }
    } else {
      console.log("PERSISTENCE: No saved form data found in sessionStorage.");
    }

    // --- Drag and Drop Event Listeners Setup ---
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;

    const preventDefaults = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const highlight = () => dropArea.classList.add('border-blue-500', 'bg-blue-50');
    const unhighlight = () => dropArea.classList.remove('border-blue-500', 'bg-blue-50');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, unhighlight, false);
    });

    const handleDrop = (e: DragEvent) => {
      const dt = e.dataTransfer;
      const files = dt?.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    };

    dropArea.addEventListener('drop', handleDrop, false);

    return () => {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.removeEventListener(eventName, preventDefaults, false);
      });
      ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.removeEventListener(eventName, highlight, false);
      });
      ['dragleave', 'drop'].forEach(eventName => {
        dropArea.removeEventListener(eventName, unhighlight, false);
      });
      dropArea.removeEventListener('drop', handleDrop, false);
    };
  }, []);

  // --- Debounced Persistence Logic ---
  useEffect(() => {
    const handler = setTimeout(() => {
      const { image, ...dataToSave } = formData;
      sessionStorage.setItem('eventFormData', JSON.stringify(dataToSave));
      console.log("PERSISTENCE: Debounced Form data saved to sessionStorage:", dataToSave);
    }, 300);

    return () => {
      clearTimeout(handler);
      console.log("PERSISTENCE: Debounce timer cleared.");
    };
  }, [formData]);

  // --- File Handling ---
  const handleFile = (file: File) => {
    if (!file.type.match('image.*')) {
      setError('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should not exceed 5MB.');
      return;
    }

    setError('');
    setFormData(prev => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, preview: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // --- Location Autocomplete ---
  const handleLocationChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchText = e.target.value;
    setFormData(prev => ({ ...prev, location: searchText }));

    if (searchText.length < 3) {
      setSuggestions([]);
      setIsLocationLoading(false);
      return;
    }

    setIsLocationLoading(true);
    try {
      const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${searchText}&apiKey=${GEOAPIFY_API_KEY}`);
      if (!res.ok) throw new Error(`Geoapify API error: ${res.statusText}`);
      const data = await res.json();
      setSuggestions(data.features || []);
    } catch (err) {
      console.error("API_ERROR: Failed to fetch location suggestions", err);
      setError("Failed to fetch location suggestions. Please try again later.");
    } finally {
      setIsLocationLoading(false);
    }
  }, [GEOAPIFY_API_KEY]);

  const handleSuggestionClick = (suggestion: any) => {
    setFormData(prev => ({ ...prev, location: suggestion.properties.formatted }));
    setSuggestions([]);
  };

  // --- Image Handling ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // --- Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.location || !formData.date || !formData.time || !formData.image) {
      setError("Please fill in all the required fields, including uploading an image.");
      return;
    }

    setLoading(true);

    try {
      const imageBase64 = await toBase64(formData.image);

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          location: formData.location,
          date: formData.date,
          time: formData.time,
          description: formData.description,
          pricePerPlayer: formData.pricePerPlayer,
          slots: formData.slots, // Add slots to the request
          imageBase64,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const createdEvent = await response.json();
      setCreatedEventId(createdEvent._id);
      
      // Clear storage and form
      sessionStorage.removeItem('eventFormData');
      setFormData({
        title: '',
        location: '',
        date: '',
        time: '',
        description: '',
        pricePerPlayer: 0,
        slots: 10, // Reset to default
        image: null,
        preview: null,
      });

      // Show success modal instead of immediate redirect
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("SUBMIT_ERROR: Event creation error:", err);
      setError(err.message || 'An unexpected error occurred during event creation.');
    } finally {
      setLoading(false);
    }
  };

  // --- UI Helpers ---
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- View Event Handler ---
  const handleViewEvent = () => {
    setShowSuccessModal(false);
    router.push(`/dashboard/events/${createdEventId}`);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center">
              <h1 className="text-2xl md:text-4xl font-bold text-white">
                Create Your Next Event
              </h1>
              <p className="mt-2 text-blue-100">Fill in the details to create an unforgettable experience</p>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              {error && (
                <div className="flex items-center bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                  <AlertCircle className="h-5 w-5 mr-3" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Title Field */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                  <InputField icon={Wind}>
                    <input
                      id="title"
                      type="text"
                      placeholder="What's your event called?"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className="w-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                    />
                  </InputField>
                </div>

                {/* Location Field */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative" ref={locationInputRef}>
                    <InputField icon={MapPin}>
                      <input
                        id="location"
                        type="text"
                        placeholder="Where will it take place?"
                        value={formData.location}
                        onChange={handleLocationChange}
                        required
                        className="w-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                      />
                    </InputField>
                    {isLocationLoading && (
                      <div className="absolute right-3 top-3.5 h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {suggestions.length > 0 && (
                      <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-xl max-h-60 overflow-y-auto">
                        {suggestions.map((suggestion) => (
                          <li
                            key={suggestion.properties.place_id}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="font-medium text-gray-800">{suggestion.properties.address_line1}</div>
                            <div className="text-sm text-gray-500">{suggestion.properties.address_line2}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Date & Time Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <InputField icon={Calendar}>
                      <input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        min={today}
                        required
                        className="w-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-400 appearance-none"
                      />
                      <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />
                    </InputField>
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <InputField icon={Clock}>
                      <input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        required
                        className="w-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                      />
                    </InputField>
                  </div>
                </div>

                {/* Description Field */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <div className="relative">
                    <textarea
                      id="description"
                      placeholder="Tell people what to expect at your event..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={5}
                      maxLength={1000}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 text-gray-900 placeholder-gray-400 resize-none transition-all"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                      {formData.description.length}/1000
                    </div>
                  </div>
                </div>

                {/* Price Per Player Field */}
                <div>
                  <label htmlFor="pricePerPlayer" className="block text-sm font-medium text-gray-700 mb-2">
                    Price Per Player (₦)
                  </label>
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 transition-all duration-300 focus-within:ring-2 focus-within:ring-gray-200 focus-within:border-gray-400">
                    <span className="text-gray-800 font-medium">₦</span>
                    <input
                      id="pricePerPlayer"
                      type="number"
                      min="0"
                      step="100"
                      placeholder="Enter amount"
                      value={formData.pricePerPlayer}
                      onChange={(e) => setFormData(prev => ({ ...prev, pricePerPlayer: Number(e.target.value) }))}
                      className="w-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-400 ml-2"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Set to 0 if the event is free to join
                  </p>
                </div>

                {/* Slots Field */}
<div>
  <label htmlFor="slots" className="block text-sm font-medium text-gray-700 mb-2">
    Available Slots
  </label>
  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 transition-all duration-300 focus-within:ring-2 focus-within:ring-gray-200 focus-within:border-gray-400">
    <input
      id="slots"
      type="number"
      min="1"
      placeholder="Number of available spots"
      value={formData.slots}
      onChange={(e) => setFormData(prev => ({ ...prev, slots: Number(e.target.value) }))}
      className="w-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
      required
    />
  </div>
  <p className="mt-1 text-xs text-gray-500">
    Maximum number of participants for this event
  </p>
</div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Banner</label>
                  <div
                    ref={dropAreaRef}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all ${
                      formData.preview ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {formData.preview ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                        <Image
                          src={formData.preview}
                          alt="Preview"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-600">
                            <span className="text-gray-700 underline">Upload a file</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      name="image"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-100"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Creating Event...
                  </>
                ) : (
                  'Create Event'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center text-white">
              <PartyPopper className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Event Created Successfully!</h2>
              <p className="mt-2 opacity-90">Your event is now live and ready for participants</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-6 w-6 mr-2" />
                <span className="font-medium">All details saved successfully</span>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => router.push('/dashboard/browse-events')}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
                >
                  Browse Events
                </button>
                <button
                  onClick={handleViewEvent}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  View Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}