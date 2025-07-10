import { Suspense } from 'react';
import EventsClientUI from './EventsClientUI';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

// This is the skeleton loading state shown while the client component loads
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
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

      {/* Simplified Skeleton Filters */}
      <div className="animate-pulse">
        <div className="mb-8 sm:mb-10 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 space-y-4">
            <div className="h-12 bg-gray-200 rounded-xl"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
           <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
             <div className="w-full h-48 bg-gradient-to-r from-gray-100 to-gray-200"></div>
             <div className="p-6 space-y-4">
               <div className="h-6 bg-gray-200 rounded-full w-3/4"></div>
               <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
               <div className="h-4 bg-gray-200 rounded-full w-1/3"></div>
               <div className="h-16 bg-gray-200 rounded-lg w-full"></div>
               <div className="h-10 bg-gray-200 rounded-lg w-full mt-4"></div>
             </div>
           </div>
        ))}
      </div>
    </div>
  </div>
);


export default function BrowseEventsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <EventsClientUI />
    </Suspense>
  );
}