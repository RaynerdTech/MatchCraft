import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongoose";
import Event from "@/lib/models/Event";
import Transaction from "@/lib/models/Transaction";
import { isPopulatedUser } from "@/types/typeGuards";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?._id;

    if (!userId) {
      return NextResponse.json({ error: "Login or create an account to join event" }, { status: 401 });
    }

    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const event = await Event.findById(eventId).populate("createdBy");
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.pricePerPlayer || event.pricePerPlayer <= 0) {
      return NextResponse.json(
        { error: "This event does not require payment." },
        { status: 400 }
      );
    }

    if (!isPopulatedUser(event.createdBy)) {
      return NextResponse.json(
        { error: "Organizer details not available." },
        { status: 400 }
      );
    }

    const organizer = event.createdBy;

    if (!organizer.subaccountCode) {
      return NextResponse.json(
        { error: "Organizer has not set up their payout account." },
        { status: 400 }
      );
    }

    // ✅ Check if user already paid
    const alreadyPaid = await Transaction.findOne({
      user: userId,
      event: eventId,
      status: "success",
    });

    if (alreadyPaid) {
      return NextResponse.json(
        { error: "You have already paid for this event." },
        { status: 400 }
      );
    }

    const amountInKobo = event.pricePerPlayer * 100;
    const reference = `REF-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const newTransaction = new Transaction({
      user: userId,
      event: event._id,
      amount: event.pricePerPlayer,
      platformShare: Number((event.pricePerPlayer * 0.2).toFixed(2)),
      organizerShare: Number((event.pricePerPlayer * 0.8).toFixed(2)),
      status: "pending",
      reference,
    });

    await newTransaction.save();

    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          amount: amountInKobo,
          reference: newTransaction.reference,
          callback_url: `${process.env.NEXTAUTH_URL}/dashboard/payments/callback?eventId=${event._id}`,
          metadata: {
            eventId: event._id.toString(),
            userId,
          },
          split: {
            type: "percentage",
            subaccounts: [
              {
                subaccount: organizer.subaccountCode,
                share: 80,
              },
              {
                subaccount: process.env.PLATFORM_SUBACCOUNT_CODE!,
                share: 20,
              },
            ],
          },
        }),
      }
    );

    const data = await paystackRes.json();
    // console.log("[PAYSTACK_INIT_RESPONSE]", data);

    if (!data.status) {
      return NextResponse.json(
        { error: data.message || "Paystack error" },
        { status: 400 }
      );
    }

    return NextResponse.json({ url: data.data.authorization_url });
  } catch (err: any) {
    console.error("[INITIATE_PAYMENT_ERROR]", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
