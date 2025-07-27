"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { format, isBefore } from "date-fns";
import axios from "axios";
import SafeImage from "../components/SafeImage";

export default function MyTeamPage() {
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchTeam = async () => {
    try {
      const res = await axios.get("/api/teams/my");
      setTeam(res.data);
    } catch (err: any) {
      console.error("Error fetching team:", err);
      if (err.response?.status === 404) {
        setTeam(null); // No team found
      } else {
        // Optional: Handle other errors like 500
        console.error("Unexpected error:", err.message || err);
      }
    } finally {
      setLoading(false);
    }
  };

  fetchTeam();
}, []);


  if (loading)
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    );

  if (!team)
    return (
   <div className="min-h-dvh flex items-center justify-center bg-gray-50 px-4">
  <div className="text-center p-8 bg-white rounded-lg border border-gray-100 shadow-xs max-w-md w-full">
    <h1 className="text-2xl font-medium text-gray-900 mb-3 leading-tight">
      No Team Found
    </h1>
    <p className="text-gray-600">
      We couldn't find any team associated with your account.
    </p>
  </div>
</div>
    );

  const eventDate = new Date(team.event.date);
  const [hours, minutes] = team.event.endTime.split(":").map(Number);
  eventDate.setHours(hours, minutes);
  const isActive = new Date() < eventDate || team.active;

  return (
    <div className="min-h-dvh bg-gray-50 p-4">
      <main className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden md:mx-4">
        {/* Team Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{team.name}</h1>
              <div className="flex items-center mt-2 space-x-4">
                <span className="px-3 py-1 bg-blue-500 bg-opacity-20 rounded-full text-sm">
                  Team {team.side}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {isActive ? "Active" : "Ended"} {!isActive && "(Past event)"}
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-sm">
              <p>Created: {format(new Date(team.createdAt), "PPP")}</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-8">
          {/* Event Info */}
          <section aria-labelledby="event-info-heading">
            <h2
              id="event-info-heading"
              className="text-xl font-semibold text-gray-800 mb-4"
            >
              Event Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Title</h3>
                  <p className="text-gray-900">{team.event.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Location
                  </h3>
                  <p className="text-gray-900">{team.event.location}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="text-gray-900">
                    {format(new Date(team.event.date), "PPPP")}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    End Time
                  </h3>
                  <p className="text-gray-900">{team.event.endTime}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Event Creator */}
          <section aria-labelledby="creator-heading">
            <h2
              id="creator-heading"
              className="text-xl font-semibold text-gray-800 mb-4"
            >
              Event Creator
            </h2>
            <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
              <SafeImage
                src={team.event.createdBy.image || ""}
                alt={team.event.createdBy.name}
                width={64}
                height={64}
                className="rounded-full w-16 h-16 object-cover border-2 border-blue-500"
              />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {team.event.createdBy.name}
                </p>
                <p
                  className="text-gray-600 truncate"
                  title={team.event.createdBy.email}
                >
                  {team.event.createdBy.email}
                </p>
              </div>
            </div>
          </section>

          {/* Team Members */}
          <section aria-labelledby="members-heading">
            <div className="flex justify-between items-center mb-4">
              <h2
                id="members-heading"
                className="text-xl font-semibold text-gray-800"
              >
                Team Members
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {team.members.length} members
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.members
                .filter((member: any) => member.userId)
                .map((member: any, idx: number) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex gap-4 items-center">
                    <SafeImage
                      src={member.userId.image || ""}
                      alt={member.userId.name}
                      width={64}
                      height={64}
                      className="rounded-full w-12 h-12 sm:w-14 sm:h-14 object-cover border-2 border-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {member.userId.name}
                      </p>
                      <p
                        className="text-sm text-gray-600 truncate"
                        title={member.userId.email}
                      >
                        {member.userId.email}
                      </p>
                      <div className="flex space-x-3 mt-1">
                        <span
                          className={`text-xs font-medium ${
                            member.accepted ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {member.accepted ? "Accepted" : "Pending"}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            member.paid ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {member.paid ? "Paid" : "Unpaid"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
