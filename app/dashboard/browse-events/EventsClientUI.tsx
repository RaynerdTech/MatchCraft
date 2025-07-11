'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, MapPin, Calendar, XCircle, Frown, ArrowRight, RefreshCw, Share2, Check, Users, UserCheck, UserX } from 'lucide-react';
import EventDrawer from '../events/EventDrawer';

// Your SkeletonCard component remains the same
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gradient-to-r from-gray-100 to-gray-200"></div>
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-200 rounded-full w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded-full w-1/3"></div>
      <div className="h-16 bg-gray-200 rounded-lg w-full"></div>
      <div className="h-10 bg-gray-200 rounded-lg w-full mt-4"></div>
    </div>
  </div>
);

// Define the Event type
type Event = {
  _id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  image: string;
  description: string;
  type: string;
  createdBy: {
    _id: string;
    name: string;
  };
  participantsCount: number;
  slots: number;
  availableSlots: number;
  isAvailable: boolean;
  pricePerPlayer: number;
};

export default function EventsClientUI() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [currentSearch, setCurrentSearch] = useState(searchParams.get('search') || '');
  const [currentLocation, setCurrentLocation] = useState(searchParams.get('location') || '');
  const [currentDate, setCurrentDate] = useState(searchParams.get('date') || '');
  const [currentSlots, setCurrentSlots] = useState(searchParams.get('slots') || '');
  const [slotStatus, setSlotStatus] = useState(searchParams.get('slotStatus') || 'all');

  const updateUrlParams = useCallback((
    newSearch: string,
    newLocation: string,
    newDate: string,
    newSlots: string,
    newSlotStatus: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newSearch) params.set('search', newSearch);
    else params.delete('search');

    if (newLocation) params.set('location', newLocation);
    else params.delete('location');

    if (newDate) params.set('date', newDate);
    else params.delete('date');

    if (newSlots) params.set('slots', newSlots);
    else params.delete('slots');

    if (newSlotStatus && newSlotStatus !== 'all') params.set('slotStatus', newSlotStatus);
    else params.delete('slotStatus');

    router.replace(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError('');

        const search = searchParams.get('search') || '';
        const location = searchParams.get('location') || '';
        const date = searchParams.get('date') || '';
        const slots = searchParams.get('slots') || '';
        const slotStatusParam = searchParams.get('slotStatus') || '';

        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (location) params.append('location', location);
        if (date) params.append('date', date);
        if (slots) params.append('slots', slots);
        if (slotStatusParam) params.append('slotStatus', slotStatusParam);

        const res = await fetch(`/api/events?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch events');

        const data = await res.json();
        setEvents(data.events || []);
      } catch (err: any) {
        console.error("Failed to fetch events:", err);
        setError(err.message || 'An unexpected error occurred while fetching events.');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchEvents();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchParams]);

  // All your handler functions (handleSearchChange, clearSearch, etc.) remain here...
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentSearch(value);
    updateUrlParams(value, currentLocation, currentDate, currentSlots, slotStatus);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentLocation(value);
    updateUrlParams(currentSearch, value, currentDate, currentSlots, slotStatus);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentDate(value);
    updateUrlParams(currentSearch, currentLocation, value, currentSlots, slotStatus);
  };

  const handleSlotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentSlots(value);
    updateUrlParams(currentSearch, currentLocation, currentDate, value, slotStatus);
  };

  const handleSlotStatusChange = (status: string) => {
    setSlotStatus(status);
    updateUrlParams(currentSearch, currentLocation, currentDate, currentSlots, status);
  };

  const clearSearch = () => {
    setCurrentSearch('');
    updateUrlParams('', currentLocation, currentDate, currentSlots, slotStatus);
  };

  const clearLocation = () => {
    setCurrentLocation('');
    updateUrlParams(currentSearch, '', currentDate, currentSlots, slotStatus);
  };

  const clearDate = () => {
    setCurrentDate('');
    updateUrlParams(currentSearch, currentLocation, '', currentSlots, slotStatus);
  };

  const clearSlots = () => {
    setCurrentSlots('');
    updateUrlParams(currentSearch, currentLocation, currentDate, '', slotStatus);
  };

  const resetAllFilters = () => {
    setCurrentSearch('');
    setCurrentLocation('');
    setCurrentDate('');
    setCurrentSlots('');
    setSlotStatus('all');
    updateUrlParams('', '', '', '', 'all');
    setIsMobileFiltersOpen(false);
  };

  const copyCurrentUrl = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
      });
  };

  const shareCurrentUrl = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out these events',
          url: window.location.href
        });
      } else {
        copyCurrentUrl();
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleEventClick = (event: Event) => {
    if (event.isAvailable) {
      setSelectedEvent(event);
      const params = new URLSearchParams(searchParams.toString());
      params.set('event', event._id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const handleCloseDrawer = () => {
    setSelectedEvent(null);
  };

  const numberOfSkeletons = 4;

  // The entire JSX from your original file goes here
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <header className="text-center mb-8 sm:mb-12 py-8 sm:py-16 rounded-3xl overflow-hidden relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
          <div className="absolute inset-0 bg-[url('https://uploads-ssl.webflow.com/5f6bc60e665f54545a1e52a5/615627e5824c9c6195abfda0_noise.png')] opacity-10"></div>
          
          <div className="relative z-10 px-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
              Discover <span className="text-yellow-300">Unforgettable</span> Events
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-indigo-100 max-w-3xl mx-auto leading-relaxed">
              Explore curated experiences that match your passion. From concerts to workshops, find what moves you.
            </p>
          </div>
        </header>

        {/* Mobile Filter Toggle */}
        <div className="sm:hidden mb-4">
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="w-full py-3 px-4 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-between"
          >
            <span className="font-medium text-gray-700">Filters</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${isMobileFiltersOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Filters and Action Buttons */}
        <div className={`${isMobileFiltersOpen ? 'block' : 'hidden'} sm:block mb-8 sm:mb-10`}>
          <div className="flex flex-col gap-4 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search events..."
                value={currentSearch}
                onChange={handleSearchChange}
                className="pl-12 pr-10 py-3 border border-gray-200/70 rounded-xl w-full focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-gray-800 placeholder-gray-500 text-sm bg-white/70 shadow-sm"
              />
              {currentSearch && (
                <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <XCircle size={18} />
                </button>
              )}
            </div>

             {/* Location Input */}
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Location..."
                value={currentLocation}
                onChange={handleLocationChange}
                className="pl-12 pr-10 py-3 border border-gray-200/70 rounded-xl w-full focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-gray-800 placeholder-gray-500 text-sm bg-white/70 shadow-sm"
              />
              {currentLocation && (
                <button onClick={clearLocation} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <XCircle size={18} />
                </button>
              )}
            </div>

            {/* Date Input */}
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="date"
                value={currentDate}
                onChange={handleDateChange}
                className="pl-12 pr-10 py-3 border border-gray-200/70 rounded-xl w-full focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-gray-800 placeholder-gray-500 text-sm bg-white/70 shadow-sm appearance-none"
              />
              {currentDate && (
                <button onClick={clearDate} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <XCircle size={18} />
                </button>
              )}
            </div>

            {/* Slot Filters - Mobile */}
            <div className="sm:hidden space-y-4">
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="number"
                  min="1"
                  placeholder="Minimum available slots..."
                  value={currentSlots}
                  onChange={handleSlotsChange}
                  className="pl-12 pr-10 py-3 border border-gray-200/70 rounded-xl w-full focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-gray-800 placeholder-gray-500 text-sm bg-white/70 shadow-sm"
                />
                {currentSlots && (
                  <button onClick={clearSlots} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    <XCircle size={18} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSlotStatusChange('all')}
                  className={`py-2 px-2 rounded-lg transition-colors flex items-center justify-center text-xs ${slotStatus === 'all' ? 'bg-indigo-600 text-white' : 'bg-white/70 text-gray-700 border border-gray-200'}`}
                >
                  <Users className="h-3 w-3 mr-1" />
                  All
                </button>
                <button
                  onClick={() => handleSlotStatusChange('available')}
                  className={`py-2 px-2 rounded-lg transition-colors flex items-center justify-center text-xs ${slotStatus === 'available' ? 'bg-green-600 text-white' : 'bg-white/70 text-gray-700 border border-gray-200'}`}
                >
                  <UserCheck className="h-3 w-3 mr-1" />
                  Available
                </button>
                <button
                  onClick={() => handleSlotStatusChange('unavailable')}
                  className={`py-2 px-2 rounded-lg transition-colors flex items-center justify-center text-xs ${slotStatus === 'unavailable' ? 'bg-red-600 text-white' : 'bg-white/70 text-gray-700 border border-gray-200'}`}
                >
                  <UserX className="h-3 w-3 mr-1" />
                  Full
                </button>
              </div>
            </div>
          </div>

          {/* Slot Filters - Desktop */}
          <div className="hidden sm:flex flex-col sm:flex-row gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mt-4">
            <div className="relative flex-1">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="number"
                min="1"
                placeholder="Minimum available slots..."
                value={currentSlots}
                onChange={handleSlotsChange}
                className="pl-12 pr-10 py-3 border border-gray-200/70 rounded-xl w-full focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-gray-800 placeholder-gray-500 text-sm bg-white/70 shadow-sm"
              />
              {currentSlots && (
                <button onClick={clearSlots} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <XCircle size={18} />
                </button>
              )}
            </div>
            <div className="flex-1 flex items-center gap-2">
              <button
                onClick={() => handleSlotStatusChange('all')}
                className={`flex-1 py-3 px-4 rounded-xl transition-colors flex items-center justify-center ${slotStatus === 'all' ? 'bg-indigo-600 text-white' : 'bg-white/70 text-gray-700 border border-gray-200'}`}
              >
                <Users className="h-4 w-4 mr-2" />
                All Events
              </button>
              <button
                onClick={() => handleSlotStatusChange('available')}
                className={`flex-1 py-3 px-4 rounded-xl transition-colors flex items-center justify-center ${slotStatus === 'available' ? 'bg-green-600 text-white' : 'bg-white/70 text-gray-700 border border-gray-200'}`}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Available
              </button>
              <button
                onClick={() => handleSlotStatusChange('unavailable')}
                className={`flex-1 py-3 px-4 rounded-xl transition-colors flex items-center justify-center ${slotStatus === 'unavailable' ? 'bg-red-600 text-white' : 'bg-white/70 text-gray-700 border border-gray-200'}`}
              >
                <UserX className="h-4 w-4 mr-2" />
                Full
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Filters
            </button>
            <button
              onClick={shareCurrentUrl}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Results
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-start mb-6 sm:mb-8 shadow-sm">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Event Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {loading ? (
            Array.from({ length: numberOfSkeletons }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : events.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-20 text-gray-500">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-60"></div>
                <Frown className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 text-purple-400" />
              </div> 
              <p className="text-lg sm:text-xl font-semibold text-gray-700">No events found</p>
              <p className="mt-2 text-gray-500 text-center max-w-md text-sm sm:text-base">
                Try adjusting your search or filters. We're sure there's something exciting waiting for you!
              </p>
              <button 
                onClick={resetAllFilters}
                className="mt-4 sm:mt-6 px-5 py-2 sm:px-6 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center text-sm sm:text-base"
              >
                Reset Filters
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          ) : (
            events.map((event) => (
              <div 
                key={event._id}
                onClick={() => handleEventClick(event)}
                className={`bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col cursor-pointer ${
                  !event.isAvailable ? 'opacity-70 grayscale-[30%] pointer-events-none' : ''
                }`}
              >
                <div className="relative w-full h-40 sm:h-48 overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                    <span className="bg-black/60 text-white text-xs px-2 py-1 sm:px-3 sm:py-1 rounded-full backdrop-blur-sm">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {!event.isAvailable && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-xs sm:text-sm px-2 py-1 rounded-full">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-6 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 mb-2 line-clamp-2">
                      {event.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center mb-2 sm:mb-3">
                      <MapPin size={14} className="mr-1 sm:mr-2 text-indigo-500 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </p>
                  <p className="text-sm md:text-base text-gray-500 mb-3 sm:mb-4 line-clamp-3">
  {event.description}
</p>
                  </div>
                  <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <p className="text-xs text-gray-500">
                          {event.time}
                        </p>
                        <div className={`flex items-center text-xs ${
                          event.availableSlots === 0 ? 'text-red-500' : 'text-green-600'
                        }`}>
                          <Users className="h-3 w-3 mr-1" />
                          <span>{event.participantsCount}/{event.slots}</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 sm:px-4 sm:py-2 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center ${
                        event.isAvailable 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}>
                        {event.isAvailable ? (
                          <>
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">Details</span>
                            <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                          </>
                        ) : (
                          'Fully Booked'
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Event Drawer */}
      <EventDrawer
        event={selectedEvent}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}