import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongoose";
import Event from "@/lib/models/Event";
import User from "@/lib/models/User";
import Team from "@/lib/models/Team";
import { sendTeamInviteEmail } from "@/lib/mail/sendTeamInviteEmail";

export async function POST(req: NextRequest) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session?.user?._id) {
    return NextResponse.json(
      { error: "You must be logged in to create a team." },
      { status: 401 }
    );
  }

  const { eventId, name, invitedEmails } = await req.json();

  if (!eventId || !name || !Array.isArray(invitedEmails)) {
    return NextResponse.json(
      {
        error:
          "Missing information. Make sure to include eventId, team name, and list of invited emails.",
      },
      { status: 400 }
    );
  }

  const cleanedEmails = invitedEmails.map((e) => e.trim().toLowerCase());
  const uniqueEmails = [...new Set(cleanedEmails)];

  if (uniqueEmails.length !== invitedEmails.length) {
    return NextResponse.json(
      { error: "Each email can only be added once to the team." },
      { status: 400 }
    );
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return NextResponse.json(
      { error: "The event you are trying to join does not exist." },
      { status: 404 }
    );
  }

  if (!event.teamOnly && !event.allowFreePlayersIfTeamIncomplete) {
    return NextResponse.json(
      { error: "Team creation is not allowed for this event." },
      { status: 400 }
    );
  }

  const existingTeams = await Team.find({ event: eventId });

  if (existingTeams.length >= 2) {
    return NextResponse.json(
      { error: "This event already has two teams. You cannot create another." },
      { status: 400 }
    );
  }

  const side = existingTeams.length === 0 ? "A" : "B";
  const maxTeamSize = Math.floor(event.slots / 2);

  if (uniqueEmails.length !== maxTeamSize) {
    return NextResponse.json(
      {
        error: `You must invite exactly ${maxTeamSize} members to form a complete team.`,
      },
      { status: 400 }
    );
  }

  const nameClash = await Team.findOne({ event: eventId, name: name.trim() });
  if (nameClash) {
    return NextResponse.json(
      { error: "Another team in this event already uses that name." },
      { status: 400 }
    );
  }

  const users = await User.find({ email: { $in: uniqueEmails } });
  const foundEmails = users.map((u) => u.email);
  const notRegistered = uniqueEmails.filter((e) => !foundEmails.includes(e));

  if (notRegistered.length > 0) {
    return NextResponse.json(
      {
        error: `The following users need to create an account first: ${notRegistered.join(
          ", "
        )}`,
      },
      { status: 400 }
    );
  }

  const allExistingMembers = existingTeams.flatMap((team) =>
    team.members.map((m) => m.userId.toString())
  );
  const duplicateInOtherTeam = users.find((user) =>
    allExistingMembers.includes(user._id.toString())
  );

  if (duplicateInOtherTeam) {
    return NextResponse.json(
      {
        error: `User ${duplicateInOtherTeam.email} is already part of the other team.`,
      },
      { status: 400 }
    );
  }

  const members = users.map((user) => ({
    userId: user._id,
    accepted: false,
    paid: false,
  }));

  const newTeam = await Team.create({
    event: event._id,
    createdBy: session.user._id,
    name: name.trim(),
    side,
    members,
    confirmed: false,
  });

  // 📩 Send email to each invited user
  for (const user of users) {
    await sendTeamInviteEmail({
      to: user.email,
      inviterName: session.user.name,
      teamName: name.trim(),
      eventTitle: event.title,
    });
  }

  return NextResponse.json(
    {
      message: "Team created successfully!",
      teamId: newTeam._id,
      side,
    },
    { status: 201 }
  );
}


