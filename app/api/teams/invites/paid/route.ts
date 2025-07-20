import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongoose";
import Team from '@/lib/models/Team';
import User from "@/lib/models/User";
import Event from '@/lib/models/Event';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = new mongoose.Types.ObjectId(session.user._id);

  try {
    const teams = await Team.find({
      members: {
        $elemMatch: {
          userId,
          accepted: true,
          paid: true,
        },
      },
    })
      .populate({
        path: 'event',
        model: Event,
        select: 'title date location image price pricePerPlayer',
      })
      .populate({
        path: 'createdBy',
        model: User,
        select: 'name email',
      });

    const filtered = teams.map((team) => {
      const userInvite = team.members.find((m) => m.userId.equals(userId));
      return {
        _id: team._id,
        name: team.name,
        side: team.side,
        event: team.event,
        createdBy: team.createdBy,
        member: userInvite,
      };
    });

    return NextResponse.json({ teams: filtered }, { status: 200 });
  } catch (error) {
    console.error('[PAID_INVITES_ERROR]', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
