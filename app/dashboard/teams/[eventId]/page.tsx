'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Image from 'next/image';
import { Clock, MapPin, Users, Calendar } from 'lucide-react';

export default function CreateTeamPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [emails, setEmails] = useState<string[]>(['']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [teams, setTeams] = useState<any[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamsError, setTeamsError] = useState('');

  // Fetch event and teams data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, teamsRes] = await Promise.all([
          axios.get(`/api/events/${eventId}`),
          axios.get(`/api/teams?eventId=${eventId}`)
        ]);
        setEvent(eventRes.data);
        setTeams(teamsRes.data.teams || []);
      } catch (err) {
        setError('Failed to fetch data.');
      } finally {
        setTeamsLoading(false);
      }
    };

    if (eventId) fetchData();
  }, [eventId, success]);

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const addEmailField = () => {
    if (emails.length < Math.floor((event?.slots || 2) / 2)) {
      setEmails([...emails, '']);
    }
  };

  const removeEmailField = (index: number) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/teams/create', {
        eventId,
        name: teamName,
        invitedEmails: emails,
      });

      setSuccess(`Team ${teams.length === 0 ? 'A' : 'B'} created successfully!`);
      setTeamName('');
      setEmails(['']);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (!event) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const maxTeamsReached = teams.length >= 2;
  const creatingTeamSide = teams.length === 0 ? 'A' : 'B';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Event Details Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="relative h-48 w-full">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>
        
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{event.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-start gap-3">
              <MapPin className="flex-shrink-0 mt-0.5 text-indigo-600" size={18} />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="text-gray-800">{event.location}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Calendar className="flex-shrink-0 mt-0.5 text-indigo-600" size={18} />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="text-gray-800">
                  {new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="flex-shrink-0 mt-0.5 text-indigo-600" size={18} />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Time</h3>
                <p className="text-gray-800">
                  {event.time} - {event.endTime || 'No end time specified'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Users className="flex-shrink-0 mt-0.5 text-indigo-600" size={18} />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Price per player</h3>
                <p className="text-gray-800">${event.pricePerPlayer}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
            <p className="text-gray-700">{event.description}</p>
          </div>
        </div>
      </div>

      {/* Team Registration Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Team Registration</h1>
          <p className="text-gray-600 mt-1">Event: {event.title}</p>
        </div>
        {maxTeamsReached && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p>Event is full with 2 teams. Registration closed.</p>
          </div>
        )}
      </div>

      {/* Teams Display Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Teams</h2>
        
        {teamsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : teamsError ? (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
            <p>{teamsError}</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
            <p>🎉 No team has been created yet. You'll be creating Team A.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((team) => (
              <div key={team._id} className="border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-lg text-gray-800">
                    {team.name} 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      team.side === 'A' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      Team {team.side}
                    </span>
                  </h3>
                </div>
                
                <h4 className="font-medium mb-3 text-gray-700">Members:</h4>
                {team.members.length === 0 ? (
                  <p className="text-gray-500 italic">No members yet</p>
                ) : (
                  <div className="space-y-3">
                    {team.members.map((member: any) => (
                      <div key={member.userId._id} className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow">
                          <Image
                            src={member.userId.image || '/default-avatar.png'}
                            alt={member.userId.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{member.userId.name}</p>
                          <p className="text-xs text-gray-500">
                            {member.accepted ? 'Confirmed' : 'Pending'} • {member.paid ? 'Paid' : 'Unpaid'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Section - Only show if not max teams reached */}
      {!maxTeamsReached && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              Create Team {creatingTeamSide}
            </h2>
            <p className="text-gray-600">
              {creatingTeamSide === 'A' 
                ? "You're creating the first team (Team A) for this event."
                : "You're creating the second team (Team B) to complete the event."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium text-gray-700 mb-2">Team Name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter your team name"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-medium text-gray-700">Invite Players</label>
                <span className="text-sm text-gray-500">
                  {emails.length}/{Math.floor(event.slots / 2)} slots used
                </span>
              </div>
              
              <div className="space-y-3">
                {emails.map((email, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(idx, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="teammate@example.com"
                      required
                    />
                    {emails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEmailField(idx)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        aria-label="Remove email"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {emails.length < Math.floor(event.slots / 2) && (
                <button
                  type="button"
                  onClick={addEmailField}
                  className="mt-3 flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add another player
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded">
                <p>{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Team {creatingTeamSide}...
                </span>
              ) : (
                `Create Team ${creatingTeamSide}`
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}