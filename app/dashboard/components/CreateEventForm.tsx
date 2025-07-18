'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, AlertCircle, Image as ImageIcon, Wind, PartyPopper, CheckCircle2 } from 'lucide-react';

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

const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// --- Main Component ---
export default function CreateEventForm({ userId, onSuccess }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // State for success modal and created event ID
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    date: '',
    time: '',
    endTime: '',
    description: '',
    pricePerPlayer: 0,
    slots: 10,
    image: null as File | null,
    preview: null as string | null,
    teamOnly: false, // ✅ New
    allowFreePlayersIfTeamIncomplete: false, // ✅ New
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // Using environment variable for API key
  const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

  // --- Persistence Logic ---
  useEffect(() => {
    const savedFormData = sessionStorage.getItem('eventFormData');
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setFormData(prev => ({
          ...prev,
          ...parsed,
          // We don't restore the File object, but we keep the preview URL
          image: null,
          preview: parsed.preview || null,
        }));
      } catch (err) {
        console.error("Failed to parse saved form data:", err);
      }
    }
    
    // Drag and Drop Event Listeners
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
      // Include the preview URL in the saved data
      sessionStorage.setItem('eventFormData', JSON.stringify({
        ...dataToSave,
        preview: formData.preview
      }));
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [formData]);

  // --- Form Validation ---
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title) newErrors.title = "Event title is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.date) newErrors.date = "Please select a date";
    if (!formData.time) newErrors.time = "Please select a time";
    if (!formData.endTime) newErrors.endTime = "Please select an end time";
    // Replace the time comparison in validateForm with:
 if (formData.time && formData.endTime) {
      const startMinutes = timeToMinutes(formData.time);
      const endMinutes = timeToMinutes(formData.endTime);
      
      if (startMinutes >= endMinutes) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    if (!formData.preview) newErrors.image = "Please upload an event banner"; // Changed to check preview instead of image File object

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- File Handling ---
  const handleFile = (file: File) => {
    if (!file.type.match('image.*')) {
      setErrors(prev => ({ ...prev, image: 'Please select an image file (JPEG, PNG, GIF)' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image size should not exceed 5MB' }));
      return;
    }

    setErrors(prev => ({ ...prev, image: '' }));
    setFormData(prev => ({ ...prev, image: file }));
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setFormData(prev => ({ ...prev, preview: previewUrl }));
    };
    reader.onerror = () => {
      setErrors(prev => ({ ...prev, image: 'Failed to process image' }));
    };
    reader.readAsDataURL(file);
  };

  // --- Location Autocomplete ---
  const handleLocationChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchText = e.target.value;
    setFormData(prev => ({ ...prev, location: searchText }));
    setErrors(prev => ({ ...prev, location: '' }));

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
      console.error("Failed to fetch location suggestions", err);
      setErrors(prev => ({ ...prev, location: 'Failed to fetch locations' }));
    } finally {
      setIsLocationLoading(false);
    }
  }, [GEOAPIFY_API_KEY]);

  const handleSuggestionClick = (suggestion: any) => {
    setFormData(prev => ({ ...prev, location: suggestion.properties.formatted }));
    setErrors(prev => ({ ...prev, location: '' }));
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
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsDataURL(file);
    });
  };

  // --- Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // If we have a preview but no File object (from session storage)
    if (formData.preview && !formData.image) {
      setErrors(prev => ({ ...prev, image: 'Please re-upload your image' }));
      return;
    }

    setLoading(true);

    try {
      const imageBase64 = formData.preview || await toBase64(formData.image!);

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          location: formData.location,
          date: formData.date,
          time: formData.time,
          endTime: formData.endTime,
          description: formData.description,
          pricePerPlayer: formData.pricePerPlayer,
          slots: formData.slots,
          imageBase64,
          userId,
          teamOnly: formData.teamOnly,
          allowFreePlayersIfTeamIncomplete: formData.allowFreePlayersIfTeamIncomplete,
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
        endTime: '',
        description: '',
        pricePerPlayer: 0,
        slots: 10,
        image: null,
        preview: null,
        teamOnly: formData.teamOnly,
        allowFreePlayersIfTeamIncomplete: formData.allowFreePlayersIfTeamIncomplete,
      });

      // Show success modal
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Event creation error:", err);
      setErrors(prev => ({ ...prev, form: err.message || 'An unexpected error occurred' }));
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
            <form ref={formRef} onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              {errors.form && (
                <div className="flex items-center bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                  <AlertCircle className="h-5 w-5 mr-3" />
                  <p className="text-sm">{errors.form}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Title Field */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                  <InputField icon={Wind} error={!!errors.title}>
                    <input
                      id="title"
                      type="text"
                      placeholder="What's your event called?"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, title: e.target.value }));
                        setErrors(prev => ({ ...prev, title: '' }));
                      }}
                      className="w-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                    />
                  </InputField>
                  {errors.title && <p className="text-red-500 text-xs mt-1 ml-1">{errors.title}</p>}
                </div>

                {/* Location Field */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative" ref={locationInputRef}>
                    <InputField icon={MapPin} error={!!errors.location}>
                      <input
                        id="location"
                        type="text"
                        placeholder="Where will it take place?"
                        value={formData.location}
                        onChange={handleLocationChange}
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
                  {errors.location && <p className="text-red-500 text-xs mt-1 ml-1">{errors.location}</p>}
                </div>

                {/* Date & Time Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <InputField icon={Calendar} error={!!errors.date}>
                      <input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, date: e.target.value }));
                          setErrors(prev => ({ ...prev, date: '' }));
                        }}
                        min={today}
                        className="w-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                      />
                    </InputField>
                    {errors.date && <p className="text-red-500 text-xs mt-1 ml-1">{errors.date}</p>}
                  </div>

                 <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
          <InputField icon={Clock} error={!!errors.time}>
            <input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => {
                const newTime = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  time: newTime,
                  // Clear end time if it's now invalid
                  ...(timeToMinutes(newTime) >= timeToMinutes(prev.endTime) 
                    ? { endTime: '' } 
                    : {})
                }));
                setErrors(prev => ({
                  ...prev,
                  time: '',
                  endTime: timeToMinutes(newTime) >= timeToMinutes(formData.endTime)
                    ? "End time must be after start time"
                    : prev.endTime
                }));
              }}
              className="w-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
            />
          </InputField>
          {errors.time && <p className="text-red-500 text-xs mt-1 ml-1">{errors.time}</p>}
        </div>

        {/* End Time Field */}
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
          <InputField icon={Clock} error={!!errors.endTime}>
            <input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => {
                const newEndTime = e.target.value;
                setFormData(prev => ({ ...prev, endTime: newEndTime }));
                setErrors(prev => ({
                  ...prev,
                  endTime: timeToMinutes(formData.time) >= timeToMinutes(newEndTime)
                    ? "End time must be after start time"
                    : ''
                }));
              }}
              className="w-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
            />
          </InputField>
          {errors.endTime && <p className="text-red-500 text-xs mt-1 ml-1">{errors.endTime}</p>}
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
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum number of participants for this event
                  </p>
                </div>

                {/* Team-Only Toggle */}
<div className="flex items-center space-x-2">
  <input
    type="checkbox"
    id="teamOnly"
    checked={formData.teamOnly}
    onChange={(e) => setFormData(prev => ({ ...prev, teamOnly: e.target.checked }))}
    className="w-5 h-5"
  />
  <label htmlFor="teamOnly" className="text-sm text-gray-700">Team-only event (players must join in teams)</label>
</div>

{/* Allow Free Players Fallback */}
{formData.teamOnly && (
  <div className="flex items-center space-x-2 ml-6 mt-2">
    <input
      type="checkbox"
      id="allowFreePlayers"
      checked={formData.allowFreePlayersIfTeamIncomplete}
      onChange={(e) =>
        setFormData(prev => ({
          ...prev,
          allowFreePlayersIfTeamIncomplete: e.target.checked,
        }))
      }
      className="w-5 h-5"
    />
    <label htmlFor="allowFreePlayers" className="text-sm text-gray-700">
      Allow free players to fill team slots if team incomplete
    </label>
  </div>
)}


                {/* Image Upload */}
                <div>
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">Event Banner</label>
                  <div
                    ref={dropAreaRef}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center border-2 ${errors.image ? 'border-red-500' : formData.preview ? 'border-gray-200' : 'border-dashed border-gray-300'} rounded-2xl p-6 cursor-pointer transition-all ${formData.preview ? 'bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}`}
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
                        <ImageIcon className={`h-12 w-12 ${errors.image ? 'text-red-500' : 'text-gray-400'} mb-3`} />
                        <div className="text-center">
                          <p className={`text-sm font-medium ${errors.image ? 'text-red-600' : 'text-gray-600'}`}>
                            <span className={errors.image ? 'text-red-600 underline' : 'text-gray-700 underline'}>Upload a file</span> or drag and drop
                          </p>
                          <p className={`text-xs ${errors.image ? 'text-red-400' : 'text-gray-400'} mt-1`}>PNG, JPG, GIF up to 5MB</p>
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
                    />
                  </div>
                  {errors.image && <p className="text-red-500 text-xs mt-1 ml-1">{errors.image}</p>}
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