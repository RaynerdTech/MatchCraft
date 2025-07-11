'use client';

import {
  X,
  MapPin,
  CalendarClock,
  User,
  Share2,
  Bookmark,
  Heart,
  Users,
  Loader2, // Added for a better loading indicator
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react'; // Added useCallback
import toast from 'react-hot-toast';

// --- Type Definition (No Changes) ---
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

// --- Main Component ---
export default function EventDrawer({
  event,
  onClose,
}: {
  event: Event | null;
  onClose: () => void;
}) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // --- Keyboard event listener ---
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // --- Share functionality ---
  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  }, []);

  // --- Ticket purchase logic ---
  const handleBuyTicket = async () => {
    if (!event?._id) return;
    setIsRedirecting(true);

    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event._id }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong.');
      } else if (data.url) {
        window.location.assign(data.url);
      } else {
        toast.error('No payment URL returned.');
      }
    } catch (err) {
      console.error('Ticket purchase failed:', err);
      toast.error('Unable to process payment. Try again.');
    } finally {
      // Don't set isRedirecting to false here if a redirect is successful,
      // as the page will navigate away. It's mainly for handling errors.
      setIsRedirecting(false);
    }
  };

  if (!event) return null;

  // --- Derived State and Formatting (Memoization could be used here for performance) ---
  const progressPercentage = Math.min(
    100,
    (event.participantsCount / event.slots) * 100
  );

  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(event.pricePerPlayer);

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <>
      {/* --- Backdrop --- */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        aria-hidden="true"
      />

      {/* --- Drawer Container ---
       * KEY CHANGE: Changed to a flex column layout.
       * This makes the content area scrollable while the footer remains fixed at the bottom.
       * `h-full` or `h-screen` is crucial for this layout to work.
      */}
      <div
        className="event-drawer-mobile fixed top-0 right-0 flex flex-col w-full max-w-screen-sm h-full bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out animate-slideIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-title"
      >
        {/* --- Scrollable Content Area ---
         * KEY CHANGE: `flex-grow` allows this section to fill available space.
         * `overflow-y-auto` makes ONLY this section scrollable, fixing the overflow issue.
        */}
        <main className="flex-grow overflow-y-auto">
          {/* Header Section */}
          <header className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-6 sticky top-0 z-10">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 mr-4">
                <span className="inline-block px-2 py-1 bg-white/20 text-white text-xs font-semibold rounded-full mb-2">
                  {event.type}
                </span>
                <h2
                  id="event-title"
                  className="text-xl sm:text-2xl font-bold text-white break-words"
                >
                  {event.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
                aria-label="Close event details"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </header>

          {/* Image Section */}
          <div className="relative w-full h-48 sm:h-64">
            <Image
              src={event.image}
              alt={`Promotional image for ${event.title}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 100vw, 640px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute top-3 right-3 flex gap-2">
              {[
                {
                  label: isLiked ? 'Unlike event' : 'Like event',
                  Icon: Heart,
                  state: isLiked,
                  action: () => setIsLiked(!isLiked),
                  bgClass: 'bg-pink-500/90',
                },
                {
                  label: isSaved ? 'Unsave event' : 'Save event',
                  Icon: Bookmark,
                  state: isSaved,
                  action: () => setIsSaved(!isSaved),
                  bgClass: 'bg-indigo-500/90',
                },
              ].map(({ label, Icon, state, action, bgClass }) => (
                <button
                  key={label}
                  onClick={action}
                  className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                    state
                      ? `${bgClass} text-white`
                      : 'bg-white/90 text-gray-800 hover:bg-white'
                  }`}
                  aria-label={label}
                >
                  <Icon
                    className="w-5 h-5"
                    fill={state ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Location & Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard
                icon={MapPin}
                label="Location"
                value={event.location}
              />
              <InfoCard
                icon={CalendarClock}
                label="Date & Time"
                value={`${formattedDate} at ${event.time}`}
              />
            </div>

            {/* Availability Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="text-base font-medium text-gray-800">
                    Availability
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    event.availableSlots > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {event.availableSlots > 0
                    ? `${event.availableSlots} spots left`
                    : 'Sold Out'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all"
                  style={{
                    width: `${progressPercentage}%`,
                    backgroundColor:
                      progressPercentage >= 90
                        ? '#ef4444' // red-500
                        : progressPercentage >= 50
                        ? '#eab308' // yellow-500
                        : '#22c55e', // green-500
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{event.participantsCount} joined</span>
                <span>{event.slots} total</span>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                About the Event
              </h3>
              {/* Using prose for better typography and word wrapping */}
              <p className="text-gray-600 leading-relaxed break-words">
                {event.description}
              </p>
            </div>

            {/* Creator & Share Section */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Created by</p>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {event.createdBy?.name || 'Organizer'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleShare}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-colors text-sm flex-shrink-0"
              >
                <Share2 className="w-4 h-4" />
                <span>{isCopied ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>
        </main>

        {/* --- Sticky Footer / CTA ---
         * KEY CHANGE: This is now a regular div at the end of the flex container.
         * `flex-shrink-0` prevents it from shrinking.
         * `shadow-inner` or a top border provides visual separation.
        */}
        <footer className="flex-shrink-0 bg-white p-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-xl font-bold text-gray-900">
                {formattedPrice}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {event.availableSlots} of {event.slots} left
            </div>
          </div>
          <button
            onClick={handleBuyTicket}
            disabled={!event.isAvailable || isRedirecting}
            className="w-full py-3 text-base font-semibold rounded-lg shadow-md transition-all duration-300 flex items-center justify-center disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 enabled:hover:shadow-lg enabled:bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
          >
            {isRedirecting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Redirecting...
              </>
            ) : event.isAvailable ? (
              'Buy Ticket'
            ) : (
              'Event Full'
            )}
          </button>
        </footer>
      </div>
    </>
  );
}

// --- Sub-component for better readability ---
function InfoCard({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
      <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}