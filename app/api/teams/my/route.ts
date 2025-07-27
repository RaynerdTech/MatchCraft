import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/mongoose';
import Team from '@/lib/models/Team';
import User from '@/lib/models/User';
import '@/lib/models/Event';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user._id;

  try {
    const team = await Team.findOne({ 'members.userId': userId })
      .populate({
        path: 'event',
        select: 'title date endTime location createdBy',
        populate: {
          path: 'createdBy',
          model: User,
          select: 'name email image',
        },
      })
      .populate({
        path: 'members.userId',
        model: User,
        select: 'name image email',
      })
      .lean();

    if (!team) {
      return NextResponse.json({ message: 'No team found for this user.' }, { status: 404 });
    }

    if (!team.event || typeof team.event !== 'object' || !('date' in team.event) || !('endTime' in team.event)) {
      return NextResponse.json({ message: 'Event details not found.' }, { status: 404 });
    }

    const { date, endTime } = team.event as { date: string | Date; endTime: string };

    // Combine event date and endTime to get actual event end datetime
    const [hours, minutes] = endTime.split(':').map(Number);
    const eventEndDateTime = new Date(date);
    eventEndDateTime.setHours(hours);
    eventEndDateTime.setMinutes(minutes);

    const now = new Date();
    const isActive = now < eventEndDateTime;

    return NextResponse.json({
      ...team,
      active: isActive,
    });
  } catch (err) {
    console.error('Error fetching team:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
