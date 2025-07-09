import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Event from "@/lib/models/Event";
import User from "@/lib/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { uploadImageToCloudinary } from "@/utils/uploadImageToCloudinary";

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
      location,
      imageBase64,
      pricePerPlayer,
      slots,
    } = body;

    if (!slots || slots <= 0) {
      return NextResponse.json(
        { error: "Slots must be a positive number" },
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
      location,
      pricePerPlayer: pricePerPlayer || 0,
      slots,
      createdBy: user._id,
      image: imageUrl,
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (err) {
    console.error("Error creating event:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

type ExtendedEvent = {
  _id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  image?: string;
  pricePerPlayer: number;
  participants: any[];
  slots: number;
  createdBy: { name: string };
  participantsCount: number;
  availableSlots: number;
  isAvailable: boolean;
};

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search")?.trim().toLowerCase();
  const location = searchParams.get("location")?.trim().toLowerCase();
  const date = searchParams.get("date");
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "date:1";
  const slots = searchParams.get("slots");
  const slotStatus = searchParams.get("slotStatus");

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

  const [sortField, sortOrder] = sort.split(":");
  const sortOptions: any = {};
  sortOptions[sortField] = parseInt(sortOrder);
  urlParams.append("sort", sort);

  try {
    let events = await Event.find(query)
      .sort(sortOptions)
      .populate("createdBy", "name")
      .lean();

    const enrichedEvents = events.map((event) => {
      const participantsCount = event.participants?.length || 0;
      const availableSlots = event.slots - participantsCount;
      return {
        ...event,
        participantsCount,
        availableSlots,
        isAvailable: availableSlots > 0,
      };
    });

    if (slotStatus) {
      switch (slotStatus) {
        case "available":
          events = enrichedEvents.filter((event) => event.isAvailable);
          break;
        case "unavailable":
          events = enrichedEvents.filter((event) => !event.isAvailable);
          break;
        default:
          events = enrichedEvents;
          break;
      }
    } else {
      events = enrichedEvents;
    }

    return NextResponse.json({
      events,
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

