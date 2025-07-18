'use client';

import { Menu, X, Bell, ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type SessionUser = {
  _id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  onboardingComplete?: boolean;
};

export default function Topbar({ onMenuClick, isSidebarOpen }: { 
  onMenuClick: () => void,
  isSidebarOpen: boolean 
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = session?.user as SessionUser | undefined;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    const fetchUserRole = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const userId = user?._id;
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
        setError('Failed to load user role');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?._id) {
      fetchUserRole();
    }
  }, [session, status, user?._id]);

  const formatRole = (role?: string | null) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <header className={`sticky top-0 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm' 
        : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            
            <div className="hidden lg:flex items-center">
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-sm font-medium text-gray-500">Dashboard</span>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Notification button */}
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User profile */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt="Profile"
                    width={36}
                    height={36}
                    className="rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                    {user?.name?.[0] ?? 'U'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
              </div>
              
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">{user?.name ?? 'User'}</div>
                <div className="text-xs text-gray-500">
                  {isLoading ? 'Loading...' : formatRole(userRole)}
                </div>
              </div>
              
              <button className="hidden md:block text-gray-400 hover:text-gray-600">
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}