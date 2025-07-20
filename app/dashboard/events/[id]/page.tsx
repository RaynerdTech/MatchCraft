"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowLeft,
  Edit,
  Eye,
  Ticket,
  Share2,
  MoreVertical,
  AlertCircle,
} from "lucide-react";

type Event = {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  image: string;
  location: string;
  pricePerPlayer: number;
  createdBy: {
    _id: string;
    name: string;
  };
  isOrganizer: boolean;
  isAdmin: boolean;
};

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);

        if (res.status === 401) {
          throw new Error("Please login to view this event");
        }

        if (res.status === 403) {
          throw new Error("Only organizers and admins can access this event");
        }

        if (!res.ok) {
          throw new Error("Failed to fetch event details");
        }

        const data = await res.json();
        setEvent(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleTrackEvent = () => {
    router.push(`/dashboard/events/${id}/track`);
  };

  const handleEditEvent = () => {
    router.push(`/dashboard/events/${id}/edit`);
  };

  const handleShareEvent = () => {
    navigator.clipboard.writeText(`${window.location.origin}/events/${id}`);
    alert("Event link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="text-center p-6 max-w-md bg-red-50 rounded-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error}</h2>
          {error.includes("login") ? (
            <button
              onClick={() => router.push("/signin")}
              className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Login
            </button>
          ) : (
            <button
              onClick={() => router.push("/dashboard/browse-events")}
              className="mt-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4 inline" />
              Browse Events
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Event Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="relative w-full h-64 sm:h-80 md:h-96">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            </div>

            <div className="px-6 pt-6 pb-4">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-900">
                  {event.title}
                </h1>

                {(event.isOrganizer || event.isAdmin) && (
                  <div className="relative">
                    <button className="p-2 rounded-full hover:bg-gray-100">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <button
                        onClick={handleEditEvent}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Edit className="mr-2 h-4 w-4 inline" />
                        Edit Event
                      </button>
                      <button
                        onClick={handleTrackEvent}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Eye className="mr-2 h-4 w-4 inline" />
                        Track Event
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(event.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  <Clock className="h-4 w-4 mr-1" />
                  {event.time}
                </span>
                {event.pricePerPlayer > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    <Ticket className="h-4 w-4 mr-1" />₦
                    {event.pricePerPlayer.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="px-6 pb-6 space-y-6">
              <p className="text-gray-700 leading-relaxed">
                {event.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Location
                    </h3>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Organizer
                    </h3>
                    <p className="font-medium">{event.createdBy.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {event.isOrganizer || event.isAdmin ? (
            <>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Organizer Tools</h2>
                </div>
                <div className="p-6 space-y-3">
                  <button
                    onClick={handleTrackEvent}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Eye className="mr-2 h-4 w-4 inline" />
                    Track Event
                  </button>
                  <button
                    onClick={handleEditEvent}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="mr-2 h-4 w-4 inline" />
                    Edit Event
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <button
                    onClick={handleShareEvent}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Share2 className="mr-2 h-4 w-4 inline" />
                    Share Event
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <button className="w-full mb-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <Ticket className="mr-2 h-4 w-4 inline" />
                  {event.pricePerPlayer > 0
                    ? `Book for ₦${event.pricePerPlayer}`
                    : "Join Event"}
                </button>
                <button
                  onClick={handleShareEvent}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Share2 className="mr-2 h-4 w-4 inline" />
                  Share Event
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Event Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {new Date(event.date).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">{event.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{event.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
