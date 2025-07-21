import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Event from "@/lib/models/Event";
import User from "@/lib/models/User";
import Team from "@/lib/models/Team";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { uploadImageToCloudinary } from "@/utils/uploadImageToCloudinary";

// ==================== CREATE EVENT ====================
export async function POST(req: NextRequest) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await User.findById(session.user._id).select("role");
  if (!user || (user.role !== "organizer" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      date,
      time,
      endTime, // Add endTime to the destructured properties
      location,
      imageBase64,
      pricePerPlayer,
      slots,
      teamOnly = false,
      allowFreePlayersIfTeamIncomplete = true,
    } = body;

    if (!slots || slots <= 0) {
      return NextResponse.json(
        { error: "Slots must be a positive number" },
        { status: 400 }
      );
    }

    // Check if pricePerPlayer is provided and is at least 1000
    if (pricePerPlayer !== undefined && pricePerPlayer < 1000) {
      return NextResponse.json(
        { error: "Price per player must be at least 1000" },
        { status: 400 }
      );
    }

    let imageUrl = "";
    if (imageBase64) {
      imageUrl = await uploadImageToCloudinary(
        imageBase64,
        `event_${Date.now()}`
      );
    }

    const newEvent = await Event.create({
      title,
      description,
      date,
      time,
      endTime, // Include endTime in the created event
      location,
      pricePerPlayer: pricePerPlayer || 1000,
      slots,
      createdBy: user._id,
      image: imageUrl,
      teamOnly,
      allowFreePlayersIfTeamIncomplete,
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (err) {
    console.error("Error creating event:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

// ==================== FETCH EVENTS WITH ENHANCED TEAM LOGIC ====================
// Add this helper function at the top of your API file
const getEventStatus = (eventDate: string | Date, eventTime: string, eventEndTime: string) => {
  const now = new Date();
  
  // Convert date to string if it's a Date object
  const dateStr = typeof eventDate === 'string' 
    ? eventDate 
    : eventDate.toISOString().split('T')[0];
  
  const eventStart = new Date(`${dateStr}T${eventTime}`);
  const eventEnd = new Date(`${dateStr}T${eventEndTime}`);
  
  if (now < eventStart) return 'not_started';
  if (now >= eventStart && now < eventEnd) return 'ongoing';
  return 'ended';
};

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const eventStatus = searchParams.get("eventStatus");
  // Query parameters
  const search = searchParams.get("search")?.trim().toLowerCase();
  const location = searchParams.get("location")?.trim().toLowerCase();
  const date = searchParams.get("date");
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "date:1";
  const slots = searchParams.get("slots");
  const slotStatus = searchParams.get("slotStatus");
  const teamOnly = searchParams.get("teamOnly"); // New filter parameter

  // Build query
  const query: any = {};
  const urlParams = new URLSearchParams();

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
    urlParams.append("search", search);
  }

  if (location) {
    query.location = { $regex: location, $options: "i" };
    urlParams.append("location", location);
  }

  if (date) {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    query.date = { $gte: startOfDay, $lte: endOfDay };
    urlParams.append("date", date);
  }

  if (category) {
    query.category = category;
    urlParams.append("category", category);
  }

  if (slots) {
    query.slots = { $gte: parseInt(slots) };
    urlParams.append("slots", slots);
  }

  if (slotStatus) {
    urlParams.append("slotStatus", slotStatus);
  }

  // Add teamOnly filter to query if provided
 if (teamOnly) {
  // Filter for events that are strictly team-only OR hybrid (team-focused)
  query.$or = [
    { teamOnly: true },
    { 
      teamOnly: false,
      allowFreePlayersIfTeamIncomplete: true 
    }
  ];
  urlParams.append('teamOnly', teamOnly);
  }
  

  // Sort options
  const [sortField, sortOrder] = sort.split(":");
  const sortOptions: any = {};
  sortOptions[sortField] = parseInt(sortOrder);
  urlParams.append("sort", sort);

  console.log("Filtering for team events. Query:", {
  $or: [
    { teamOnly: true },
    { 
      teamOnly: false,
      allowFreePlayersIfTeamIncomplete: true 
    }
  ]
});

const events = await Event.find(query).sort(sortOptions).lean();
console.log(`Found ${events.length} team/hybrid events`);

  try {
    // Fetch base events
    const events = await Event.find(query)
      .sort(sortOptions)
      .populate("createdBy", "name")
      .lean();

    // Enrich events with availability data
    const enrichedEvents = await Promise.all(
      events.map(async (event) => {
        const status = getEventStatus(event.date, event.time, event.endTime);
        // Count paid participants (individual slots)
        const paidParticipants = event.participants?.filter(p => p.paid)?.length || 0;
        
        // Get ALL teams for this event (regardless of status)
        const allTeams = await Team.find({ event: event._id }).lean();
        const totalTeams = allTeams.length;
        
        // Count complete teams (where all members have accepted AND paid)
        const completeTeams = allTeams.filter(team => {
          return team.members.every(member => member.accepted && member.paid);
        }).length;

        // Determine availability based on event type
        let isAvailable = true;
        let soldOutReason = null;
        let availableSlots = 0;
        
        if (event.teamOnly) {
          // Team-only: Sold out when 2 teams exist
          isAvailable = totalTeams < 2;
          availableSlots = 2 - totalTeams;
          if (!isAvailable) soldOutReason = "Maximum teams reached (2)";
        } else if (event.allowFreePlayersIfTeamIncomplete) {
          // Hybrid: 
          // - Individual slots: event.slots - paidParticipants
          // - Team slots: 2 - totalTeams
          const individualAvailable = event.slots - paidParticipants;
          const teamAvailable = 2 - totalTeams;
          
          isAvailable = individualAvailable > 0 || teamAvailable > 0;
          availableSlots = Math.max(individualAvailable, teamAvailable);
          
          if (!isAvailable) {
            soldOutReason = "All individual slots and team slots filled";
          }
        } else {
          // Individual-only: Sold out when slots filled
          isAvailable = paidParticipants < event.slots;
          availableSlots = event.slots - paidParticipants;
          if (!isAvailable) soldOutReason = "All slots filled";
        }

        return {
          ...event,
          status,
          participantsCount: paidParticipants,
          availableSlots,
          teamCount: totalTeams, // Now showing ALL teams
          completeTeamCount: completeTeams, // For reference if needed
          isAvailable,
          isSoldOut: !isAvailable,
          soldOutReason,
          eventType: event.teamOnly 
            ? "team-only" 
            : event.allowFreePlayersIfTeamIncomplete 
              ? "hybrid" 
              : "individual-only"
        };
      })
    );

    // Apply slot status filter if provided
  let filteredEvents = enrichedEvents;

// Filter by slot availability (available / sold out)
if (slotStatus) {
  filteredEvents = slotStatus === "available"
    ? enrichedEvents.filter(e => e.isAvailable)
    : enrichedEvents.filter(e => !e.isAvailable);
}

// ✅ Filter out ended events if eventStatus is "available"
if (eventStatus === "available") {
  filteredEvents = filteredEvents.filter(e => e.status !== "ended");
}


    return NextResponse.json({
      events: filteredEvents,
      queryParams: Object.fromEntries(urlParams.entries()),
    });
    
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    return NextResponse.json(
      { message: "Failed to fetch events" },
      { status: 500 }
    );
  }
  
}