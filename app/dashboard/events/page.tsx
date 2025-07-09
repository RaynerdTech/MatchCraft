'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CreateEventForm from '../components/CreateEventForm';

export const dynamic = 'force-dynamic'; // Required for Next.js 15

type SessionUser = {
  _id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  onboardingComplete?: boolean;
};

export default function CreateEventPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    const user = session?.user as SessionUser | undefined;

    if (!user?._id) {
      router.push('/signin?callbackUrl=/create-event');
      return;
    }

    const fetchUserRole = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const userId = user._id;
        if (!userId || !/^[0-9a-f]{24}$/i.test(userId)) {
          throw new Error('Invalid user ID format');
        }

        const response = await fetch(`/api/users/${userId}/role`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch role');
        }

        const data = await response.json();
        
        if (!data.role) {
          throw new Error('Role not found in response');
        }

        setUserRole(data.role);
      } catch (err) {
        console.error('Failed to fetch user role:', {
          error: err instanceof Error ? err.message : String(err),
          userId: user?._id,
          endpoint: `/api/users/${user?._id}/role`
        });
        setError('Failed to verify permissions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [session, status, router]);

  if (isLoading || status === 'loading') {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (userRole !== 'organizer' && userRole !== 'admin') {
    return <AccessDenied />;
  }

  const user = session?.user as SessionUser;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Create New Event</h1>
      <p className="text-gray-600 mb-6">
        Fill out the form below to list your event
      </p>
      
      <div className="bg-white border border-gray-200 rounded-lg ">
        <CreateEventForm 
          userId={user._id} 
          onSuccess={() => router.push('/events')} 
        />
      </div>
    </div>
  );
}

// Sub-components for better organization
function LoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

function AccessDenied() {
  const router = useRouter();
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="mb-4">
          Only organizers and administrators can create events.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push('/contact')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Become an Organizer
          </button>
          <button
            onClick={() => router.push('/dashboard/browse-events')}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Browse Events
          </button>
        </div>
      </div>
    </div>
  );
}