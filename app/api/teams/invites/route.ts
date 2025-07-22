import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongoose";
import Team from "@/lib/models/Team";
import "@/lib/models/Event"; 

export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session || !session.user?._id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user._id;

  const teams = await Team.find({
    members: {
      $elemMatch: {
        userId,
        accepted: false,
      },
    },
  })
   .populate([
  {
    path: 'event',
    select: '_id title description date time endTime image location pricePerPlayer slots teamOnly allowFreePlayersIfTeamIncomplete',
  },
  {
    path: 'createdBy',
    select: 'name email',
  },
])


 const invites = teams.map((team) => {
  const event = team.event as unknown as {
    _id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    endTime: string;
    image: string;
    location: string;
    pricePerPlayer: number;
    slots: number;
    teamOnly: boolean;
    allowFreePlayersIfTeamIncomplete: boolean;
  };

  const createdBy = team.createdBy as unknown as {
    _id: string;
    name: string;
    email: string;
  };

  return {
    _id: team._id.toString(),
    name: team.name,
    side: team.side,
    event: {
      _id: event._id.toString(),
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      endTime: event.endTime,
      image: event.image,
      location: event.location,
      pricePerPlayer: event.pricePerPlayer,
      slots: event.slots,
      teamOnly: event.teamOnly,
      allowFreePlayersIfTeamIncomplete: event.allowFreePlayersIfTeamIncomplete,
    },
    invitedBy: {
      _id: createdBy._id.toString(),
      name: createdBy.name,
      email: createdBy.email,
    },
  };
});

  return NextResponse.json({ invites });
}