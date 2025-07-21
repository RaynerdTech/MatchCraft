"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  MapPin,
  Calendar,
  XCircle,
  Frown,
  ArrowRight,
  RefreshCw,
  Share2,
  Check,
  Users,
  UserCheck,
  UserX,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import EventDrawer from "../events/EventDrawer";
import { useSession } from "next-auth/react";



const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse h-full transition-all duration-300 hover:shadow-xl">
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
  teamOnly: boolean;
  allowFreePlayersIfTeamIncomplete: boolean;
  teamCount: number;
  status: "not_started" | "ongoing" | "ended"; // Add this line
  completeTeamCount?: number;
  soldOutReason?: string;
  eventType?: string;
  endTime: string; // Add this line
};

const getStatusDisplay = (status: string) => {
  switch (status) {
    case "not_started":
      return { text: "Upcoming", color: "bg-blue-100 text-blue-800" };
    case "ongoing":
      return { text: "Ongoing", color: "bg-green-100 text-green-800" };
    case "ended":
      return { text: "Ended", color: "bg-gray-100 text-gray-800" };
    default:
      return { text: status, color: "bg-gray-100 text-gray-800" };
  }
};

// Add this helper function near your other utility functions
const formatEventTimeDisplay = (event: Event) => {
  if (!event.time) return "Time not specified";

  const startTime = event.time;
  const endTime = event.endTime;

  if (endTime) {
    return `${startTime} → ${endTime}`;
  }
  return startTime;
};

const EventsClientUI = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isFilterSectionOpen, setIsFilterSectionOpen] = useState(false);

  const [currentSearch, setCurrentSearch] = useState(
    searchParams.get("search") || ""
  );
  const [teamOnly, setTeamOnly] = useState(
    searchParams.get("teamOnly") === "true" || false
  );
  const [currentLocation, setCurrentLocation] = useState(
    searchParams.get("location") || ""
  );
  const [currentDate, setCurrentDate] = useState(
    searchParams.get("date") || ""
  );
  const [currentSlots, setCurrentSlots] = useState(
    searchParams.get("slots") || ""
  );
  const [slotStatus, setSlotStatus] = useState(
    searchParams.get("slotStatus") || "all"
  );

 const updateUrlParams = useCallback(
  (
    newSearch: string,
    newLocation: string,
    newDate: string,
    newSlots: string,
    newSlotStatus: string,
    newTeamOnly: boolean
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newSearch) params.set("search", newSearch);
    else params.delete("search");

    if (newLocation) params.set("location", newLocation);
    else params.delete("location");

    if (newDate) params.set("date", newDate);
    else params.delete("date");

    if (newSlots) params.set("slots", newSlots);
    else params.delete("slots");

    if (newSlotStatus && newSlotStatus !== "all") {
      params.set("slotStatus", newSlotStatus);
      // Add this line to set eventStatus when slotStatus is "available"
      if (newSlotStatus === "available") {
        params.set("eventStatus", "available");
      }
    } else {
      params.delete("slotStatus");
      params.delete("eventStatus"); // Also delete when not needed
    }

    if (newTeamOnly) params.set("teamOnly", "true");
    else params.delete("teamOnly");

    router.replace(`${pathname}?${params.toString()}`);
  },
  [searchParams, pathname, router]
);

  useEffect(() => {
    const fetchEvents = async () => {
  try {
    setLoading(true);
    setError("");

    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const date = searchParams.get("date") || "";
    const slots = searchParams.get("slots") || "";
    const slotStatusParam = searchParams.get("slotStatus") || "";
    const eventStatusParam = searchParams.get("eventStatus") || ""; // Add this line

    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (location) params.append("location", location);
    if (date) params.append("date", date);
    if (slots) params.append("slots", slots);
    if (slotStatusParam) params.append("slotStatus", slotStatusParam);
    if (eventStatusParam) params.append("eventStatus", eventStatusParam); // Add this line
    if (teamOnly) params.append("teamOnly", "true");

    console.log('Fetching with params:', params.toString()); // Debug log

    const res = await fetch(`/api/events?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch events");

    const data = await res.json();
    setEvents(data.events || []);
  } catch (err: any) {
    console.error("Failed to fetch events:", err);
    setError(
      err.message || "An unexpected error occurred while fetching events."
    );
  } finally {
    setLoading(false);
  }
};

    const timer = setTimeout(() => {
      fetchEvents();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentSearch(value);
    updateUrlParams(
      value,
      currentLocation,
      currentDate,
      currentSlots,
      slotStatus,
      teamOnly
    );
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentLocation(value);
    updateUrlParams(
      currentSearch,
      value,
      currentDate,
      currentSlots,
      slotStatus,
      teamOnly
    );
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentDate(value);
    updateUrlParams(
      currentSearch,
      currentLocation,
      value,
      currentSlots,
      slotStatus,
      teamOnly
    );
  };

  const handleSlotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentSlots(value);
    updateUrlParams(
      currentSearch,
      currentLocation,
      currentDate,
      value,
      slotStatus,
      teamOnly
    );
  };

  const handleSlotStatusChange = (status: string) => {
    setSlotStatus(status);
    updateUrlParams(
      currentSearch,
      currentLocation,
      currentDate,
      currentSlots,
      status,
      teamOnly
    );
  };

  const clearSearch = () => {
    setCurrentSearch("");
    updateUrlParams(
      "",
      currentLocation,
      currentDate,
      currentSlots,
      slotStatus,
      teamOnly
    );
  };

  const clearLocation = () => {
    setCurrentLocation("");
    updateUrlParams(
      currentSearch,
      "",
      currentDate,
      currentSlots,
      slotStatus,
      teamOnly
    );
  };

  const clearDate = () => {
    setCurrentDate("");
    updateUrlParams(
      currentSearch,
      currentLocation,
      "",
      currentSlots,
      slotStatus,
      teamOnly
    );
  };

  const clearSlots = () => {
    setCurrentSlots("");
    updateUrlParams(
      currentSearch,
      currentLocation,
      currentDate,
      "",
      slotStatus,
      teamOnly
    );
  };

  const resetAllFilters = () => {
    setCurrentSearch("");
    setCurrentLocation("");
    setCurrentDate("");
    setCurrentSlots("");
    setSlotStatus("all");
    setTeamOnly(false);
    updateUrlParams("", "", "", "", "all", false);
    setIsMobileFiltersOpen(false);
  };

  const copyCurrentUrl = () => {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy URL:", err);
      });
  };

  const shareCurrentUrl = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Check out these events",
          url: window.location.href,
        });
      } else {
        copyCurrentUrl();
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

const handleEventClick = (event: Event) => {
  // Don't proceed if event is ended or ongoing
  if (event.status === "ended" || event.status === "ongoing") {
    return;
  }

  if (event.isAvailable) {
    if (event.teamOnly || event.allowFreePlayersIfTeamIncomplete) {
      // Check if user is authenticated
      if (status === "authenticated") {
        // User is logged in, proceed directly
        router.push(`/dashboard/teams/${event._id}`);
      } else {
        // Show toast with login prompt
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
            max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Team Registration Required
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Please login or create an account to register your team
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  router.push(`/signin?callbackUrl=/dashboard/teams/${event._id}`);
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Login
              </button>
            </div>
          </div>
        ), {
          duration: 10000,
          position: 'bottom-center',
        });
      }
    } else {
      setSelectedEvent(event);
      const params = new URLSearchParams(searchParams.toString());
      params.set("event", event._id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }
};
  const handleCloseDrawer = () => {
    setSelectedEvent(null);
  };

  const renderEventAvailability = (event: Event) => {
    if (event.teamOnly || event.allowFreePlayersIfTeamIncomplete) {
      return (
        <div className="flex items-center text-xs text-blue-600">
          <Users className="h-3 w-3 mr-1" />
          <span>Teams: {event.teamCount}/2</span>
          {!event.isAvailable && (
            <span className="ml-1 text-red-500">• {event.soldOutReason}</span>
          )}
        </div>
      );
    } else if (event.allowFreePlayersIfTeamIncomplete) {
      return (
        <div className="flex flex-col space-y-1">
          <div className="flex items-center text-xs text-green-600">
            <Users className="h-3 w-3 mr-1" />
            <span>
              Players: {event.participantsCount}/{event.slots}
            </span>
          </div>
          <div className="flex items-center text-xs text-blue-600">
            <Users className="h-3 w-3 mr-1" />
            <span>Teams: {event.teamCount}/2</span>
          </div>
          {!event.isAvailable && (
            <div className="text-xs text-red-500">{event.soldOutReason}</div>
          )}
        </div>
      );
    } else {
      return (
        <div
          className={`flex items-center text-xs ${
            event.availableSlots === 0 ? "text-red-500" : "text-green-600"
          }`}
        >
          <Users className="h-3 w-3 mr-1" />
          <span>
            Available: {event.availableSlots}/{event.slots}
          </span>
          {!event.isAvailable && (
            <span className="ml-1">• {event.soldOutReason}</span>
          )}
        </div>
      );
    }
  };

  const numberOfSkeletons = 8;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl mb-8 sm:mb-12 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 bg-[url('https://uploads-ssl.webflow.com/5f6bc60e665f54545a1e52a5/615627e5824c9c6195abfda0_noise.png')] opacity-10"></div>
          <div className="relative z-10 px-6 py-12 sm:py-16 md:py-20 lg:py-24 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Discover <span className="text-yellow-300">Unforgettable</span>{" "}
              Events
            </h1>
            <p className="text-lg sm:text-xl text-indigo-100 max-w-3xl mx-auto mb-8">
              Find your next adventure with our curated selection of events
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 z-30" />
              <input
                type="text"
                placeholder="Search events..."
                value={currentSearch}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-indigo-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200"
              />
              {currentSearch && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200 transition-colors"
                >
                  <XCircle size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <Filter className="w-5 h-5 mr-2 text-indigo-600" />
              <span className="font-medium text-gray-700">Filters</span>
            </div>
            <span className="text-sm px-2 py-1 bg-indigo-100 rounded-md text-indigo-800">
              {events.length} {events.length === 1 ? "event" : "events"}
            </span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6 transition-all duration-300 hover:shadow-lg">
              <div
                className="flex justify-between items-center mb-4 cursor-pointer"
                onClick={() => setIsFilterSectionOpen(!isFilterSectionOpen)}
              >
                <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                {isFilterSectionOpen ? (
                  <ChevronUp className="text-gray-500" />
                ) : (
                  <ChevronDown className="text-gray-500" />
                )}
              </div>

              {isFilterSectionOpen && (
                <div className="space-y-5">
                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Any location"
                        value={currentLocation}
                        onChange={handleLocationChange}
                        className="pl-10 pr-8 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      />
                      {currentLocation && (
                        <button
                          onClick={clearLocation}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="date"
                        value={currentDate}
                        onChange={handleDateChange}
                        className="pl-10 pr-8 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                      />
                      {currentDate && (
                        <button
                          onClick={clearDate}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Slots Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Slots
                    </label>
                    <div className="relative">
                      <Users
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Any slots"
                        value={currentSlots}
                        onChange={handleSlotsChange}
                        className="pl-10 pr-8 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      />
                      {currentSlots && (
                        <button
                          onClick={clearSlots}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Availability Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Availability
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleSlotStatusChange("all")}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center transition-colors ${
                          slotStatus === "all"
                            ? "bg-indigo-100 text-indigo-800"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        All Events
                      </button>
                      <button
                        onClick={() => handleSlotStatusChange("available")}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center transition-colors ${
                          slotStatus === "available"
                            ? "bg-green-100 text-green-800"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Available Only
                      </button>
                      <button
                        onClick={() => handleSlotStatusChange("unavailable")}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center transition-colors ${
                          slotStatus === "unavailable"
                            ? "bg-red-100 text-red-800"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Full Events
                      </button>
                    </div>
                  </div>

                  {/* Team Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setTeamOnly(false);
                          updateUrlParams(
                            currentSearch,
                            currentLocation,
                            currentDate,
                            currentSlots,
                            slotStatus,
                            false
                          );
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center transition-colors ${
                          !teamOnly
                            ? "bg-indigo-100 text-indigo-800"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        All Event Types
                      </button>
                      <button
                        onClick={() => {
                          setTeamOnly(true);
                          updateUrlParams(
                            currentSearch,
                            currentLocation,
                            currentDate,
                            currentSlots,
                            slotStatus,
                            true
                          );
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center transition-colors ${
                          teamOnly
                            ? "bg-blue-100 text-blue-800"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Team Events Only
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={resetAllFilters}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Filters */}
          {isMobileFiltersOpen && (
          <div className={`fixed inset-0 z-50 bg-gray-500 bg-opacity-75 transition-opacity flex items-center justify-center p-4 ${isMobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
<div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90dvh] flex flex-col">
    <div className="inline-block align-bottom bg-white rounded-t-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div>
                    <div className="p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Filters
                      </h3>
                      <button
                        onClick={() => setIsMobileFiltersOpen(false)}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                      >
                        <span className="sr-only">Close</span>
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                      </div>
                      </div>

                    <div className="space-y-4">
                      {/* Location Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <div className="relative">
                          <MapPin
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <input
                            type="text"
                            placeholder="Any location"
                            value={currentLocation}
                            onChange={handleLocationChange}
                            className="pl-10 pr-8 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                          />
                          {currentLocation && (
                            <button
                              onClick={clearLocation}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Date Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <div className="relative">
                          <Calendar
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <input
                            type="date"
                            value={currentDate}
                            onChange={handleDateChange}
                            className="pl-10 pr-8 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          {currentDate && (
                            <button
                              onClick={clearDate}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Slots Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Slots
                        </label>
                        <div className="relative">
                          <Users
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <input
                            type="number"
                            min="1"
                            placeholder="Any slots"
                            value={currentSlots}
                            onChange={handleSlotsChange}
                            className="pl-10 pr-8 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                          />
                          {currentSlots && (
                            <button
                              onClick={clearSlots}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Availability Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Availability
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleSlotStatusChange("all")}
                            className={`px-3 py-2 rounded-md text-sm flex items-center justify-center transition-colors ${
                              slotStatus === "all"
                                ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                : "border border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <Users className="w-4 h-4 mr-1" />
                            All
                          </button>
                          <button
                            onClick={() => handleSlotStatusChange("available")}
                            className={`px-3 py-2 rounded-md text-sm flex items-center justify-center transition-colors ${
                              slotStatus === "available"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "border border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Available
                          </button>
                          <button
                            onClick={() =>
                              handleSlotStatusChange("unavailable")
                            }
                            className={`px-3 py-2 rounded-md text-sm flex items-center justify-center transition-colors ${
                              slotStatus === "unavailable"
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "border border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Full
                          </button>
                        </div>
                      </div>

                      {/* Team Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Event Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setTeamOnly(false);
                              updateUrlParams(
                                currentSearch,
                                currentLocation,
                                currentDate,
                                currentSlots,
                                slotStatus,
                                false
                              );
                            }}
                            className={`px-3 py-2 rounded-md text-sm flex items-center justify-center transition-colors ${
                              !teamOnly
                                ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                : "border border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <Users className="w-4 h-4 mr-1" />
                            All Types
                          </button>
                          <button
                            onClick={() => {
                              setTeamOnly(true);
                              updateUrlParams(
                                currentSearch,
                                currentLocation,
                                currentDate,
                                currentSlots,
                                slotStatus,
                                true
                              );
                            }}
                            className={`px-3 py-2 rounded-md text-sm flex items-center justify-center transition-colors ${
                              teamOnly
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "border border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Team Only
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

<div className="mt-auto p-6 pt-0 border-t border-gray-200">
                  <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3">
                    <button
                      onClick={resetAllFilters}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </button>
                    <button
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                      Apply Filters
                    </button>
                    </div>
                    </div>
                </div>
              </div>
            </div>
          )}

          {/* Events Grid */}
          <div className="flex-1">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Upcoming Events
                </h2>
                {!loading && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                    {events.length} {events.length === 1 ? "event" : "events"}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={resetAllFilters}
                  className="hidden sm:flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </button>
                <button
                  onClick={shareCurrentUrl}
                  className="flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-start mb-6">
                <div className="flex-shrink-0">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Events Grid */}
            {loading ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
                {Array.from({ length: numberOfSkeletons }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
                  <Frown className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No events found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search or filters to find what you're
                  looking for.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
             <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
                {events.map((event) => (
<div
  key={event._id}
  onClick={() => handleEventClick(event)}
  className={`group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${ // Added "group"
    !event.isAvailable ? "opacity-80 grayscale-[20%]" : ""
  } ${
    event.status === "ended" || event.status === "ongoing"
      ? "cursor-not-allowed opacity-90"
      : "cursor-pointer hover:shadow-lg"
  }`}
>
                    <div className="relative h-48 overflow-hidden">
                  <Image
  src={event.image}
  alt={event.title}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
  className="object-cover transition-transform duration-500 group-hover:scale-105" // The key is group-hover:scale-105
  priority={false}
/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                      <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/70 text-white backdrop-blur-sm">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusDisplay(event.status).color
                          }`}
                        >
                          {getStatusDisplay(event.status).text}
                        </span>
                      </div>
                      {event.teamOnly && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                            Team Event
                          </span>
                        </div>
                      )}
                      {!event.isAvailable && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500 text-white cursor-not-allowed">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                        {event.title}
                      </h3>
                      <p className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-indigo-500" />
                        <span className="truncate">{event.location}</span>
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-indigo-500" />
                        <span>{formatEventTimeDisplay(event)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <div className="flex flex-col space-y-1">
                          {renderEventAvailability(event)}
                        </div>
                        <button
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white transition-colors ${
                            event.isAvailable && event.status === "not_started"
                              ? event.teamOnly ||
                                event.allowFreePlayersIfTeamIncomplete
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-indigo-600 hover:bg-indigo-700"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
                          disabled={
                            event.status === "ended" ||
                            event.status === "ongoing"
                          }
                        >
                          {event.status === "ended"
                            ? "Event Ended"
                            : event.status === "ongoing"
                            ? "In Progress"
                            : event.isAvailable
                            ? event.teamOnly ||
                              event.allowFreePlayersIfTeamIncomplete
                              ? "Team Register"
                              : "View Details"
                            : "Fully Booked"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Drawer - Only for non-team events */}
      {selectedEvent &&
        !selectedEvent.teamOnly &&
        !selectedEvent.allowFreePlayersIfTeamIncomplete && (
          <EventDrawer event={selectedEvent} onClose={handleCloseDrawer} />
        )}
    </div>
  );
};

export default EventsClientUI;   