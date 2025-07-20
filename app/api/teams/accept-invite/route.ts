import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongoose";
import Team from '@/lib/models/Team';
import User from "@/lib/models/User";

// Optional if you're calling from client and want fresh data always
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
    //   console.log('❌ No session or email');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { teamId } = await req.json();
    // console.log('✅ Incoming teamId:', teamId);

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
    //   console.log('❌ User not found for email:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const team = await Team.findById(teamId);
    if (!team) {
    //   console.log('❌ Team not found');
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const memberIndex = team.members.findIndex(
      (m) => m.userId.toString() === user._id.toString()
    );

    if (memberIndex === -1) {
    //   console.log('❌ User is not invited to this team');
      return NextResponse.json({ error: 'Not invited to this team' }, { status: 403 });
    }

    if (team.members[memberIndex].accepted) {
    //   console.log('ℹ️ Already accepted invite');
      return NextResponse.json({ message: 'Already accepted' }, { status: 200 });
    }

    team.members[memberIndex].accepted = true;
    await team.save();

    // console.log('✅ Invite accepted');
    return NextResponse.json({ message: 'Invite accepted successfully' });
  } catch (err) {
    // console.error('❌ Error accepting invite:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
