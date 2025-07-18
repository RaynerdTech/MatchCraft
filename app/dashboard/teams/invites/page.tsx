'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useRouter } from 'next/navigation' // Correct import for App Router

interface TeamInvite {
  _id: string
  teamName: string
    name: string // Team name like "Madrid"
    side: string // "teamA" or "teamB"
  invitedBy: {
    name: string
    email: string
  }
  event: {
    _id: string
    title: string
    description: string
    date: string
    time: string
    endTime: string
    location: string
    pricePerPlayer: number
    slots: number
    teamOnly: boolean
    allowFreePlayersIfTeamIncomplete: boolean
    image?: string
  }
}

export default function TeamInvitesPage() {
     const router = useRouter() 
  // Destructure `status` from useSession.
  const { data: session, status } = useSession()
  const [invites, setInvites] = useState<TeamInvite[]>([])
  const [loading, setLoading] = useState(true) // Tracks our API call's loading state
  const [expanded, setExpanded] = useState<string | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const res = await axios.get('/api/teams/invites')
        setInvites(res.data.invites)
      } catch (err) {
        toast.error('Failed to load invites')
      } finally {
        setLoading(false) // API call is done, set our loading to false
      }
    }

    // Only act when the session status is definitive.
    if (status === 'authenticated') {
      fetchInvites()
    } else if (status === 'unauthenticated') {
      // If the user is not logged in, we know there are no invites.
      setLoading(false)
    }
    // If status is 'loading', we do nothing and let the skeleton show.
  }, [status]) // Depend on `status` to re-run when authentication completes.

const acceptInvite = async (teamId: string) => {
  try {
    setAcceptingId(teamId)

    await axios.patch('/api/teams/accept-invite', { teamId })

    // 🔥 Show toast FIRST (no setTimeout needed)
  toast.success(
  <span className="flex flex-col items-center">
    <strong>You’ve accepted the invite!</strong>
    <button
      onClick={() => (window.location.href = '/dashboard/teams/unpaid-invites')}
      className="mt-2 text-blue-600 underline font-medium"
    >
      Continue
    </button>
  </span>,
  {
    duration: Infinity, // 👈 won't disappear
    icon: '✅', // Optional
    style: {
      textAlign: 'center',
    },
  }
)



    // 💡 Delay the removal slightly so toast has time to be noticed
    setTimeout(() => {
      setInvites(prev => prev.filter(invite => invite._id !== teamId))
    }, 1000) // 1 second is enough
  } catch (err) {
    toast.error('Failed to accept invite')
  } finally {
    setAcceptingId(null)
  }
}



  // Show the skeleton if the session is loading OR if our API is fetching.
  if (status === 'loading' || loading) {
    return <InvitesSkeleton />
  }

  // This condition is now only checked after we know the session status and have fetched data.
  if (invites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-500"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="19" y1="8" x2="19" y2="14"></line>
              <line x1="22" y1="11" x2="16" y2="11"></line>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            No pending invites
          </h2>
          <p className="text-gray-500">
            You don't have any team invites at the moment. Check back later!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Invites</h1>
        <p className="text-gray-500">You've been invited to join these teams</p>
      </div>

      <div className="space-y-6">
        {invites.map(invite => (
          <div
            key={invite._id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md"
          >
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    {invite.event.image ? (
                      <img
                        src={invite.event.image}
                        alt="Event"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-500"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {invite.event.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Team: {invite.name} ({invite.teamName})
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Invited by: {invite.invitedBy.name} ({invite.invitedBy.email})
                    </p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        ></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      {new Date(invite.event.date).toLocaleDateString()} •{' '}
                      {invite.event.time} - {invite.event.endTime}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {invite.event.teamOnly ? 'Team Only' : 'Mixed Event'}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ₦{invite.event.pricePerPlayer} per player
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {invite.event.slots} slots available
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() =>
                      setExpanded(prev => (prev === invite._id ? null : invite._id))
                    }
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {expanded === invite._id ? 'Hide Details' : 'View Details'}
                  </button>
                  <button
                    onClick={() => acceptInvite(invite._id)}
                    disabled={acceptingId === invite._id}
                    className="px-4 py-2 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg text-sm font-medium text-white hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {acceptingId === invite._id ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Accepting...
                      </>
                    ) : (
                      'Accept Invite'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {expanded === invite._id && (
              <div className="px-6 pb-6 border-t border-gray-100 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Team Details
                      </h4>
                      <p className="text-sm text-gray-600">
                        <strong>Team Name:</strong> {invite.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Team Type:</strong> {invite.side}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Event Description
                      </h4>
                      <p className="text-sm text-gray-600">
                        {invite.event.description}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Additional Information
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex items-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5 flex-shrink-0 text-gray-400"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>
                          <strong>Location:</strong> {invite.event.location}
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5 flex-shrink-0 text-gray-400"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>
                          <strong>Time:</strong> {invite.event.time} -{' '}
                          {invite.event.endTime}
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5 flex-shrink-0 text-gray-400"
                        >
                          <path d="M12 2v4"></path>
                          <path d="m16.24 7.76 2.83-2.83"></path>
                          <path d="M18 12h4"></path>
                          <path d="m16.24 16.24 2.83 2.83"></path>
                          <path d="M12 18v4"></path>
                          <path d="m7.76 16.24-2.83 2.83"></path>
                          <path d="M6 12H2"></path>
                          <path d="m7.76 7.76-2.83-2.83"></path>
                        </svg>
                        <span>
                          <strong>Allow Free Players:</strong>{' '}
                          {invite.event.allowFreePlayersIfTeamIncomplete
                            ? 'Yes'
                            : 'No'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function InvitesSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="h-10 w-64 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
        <div className="h-4 w-80 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-60 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-6 w-28 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}