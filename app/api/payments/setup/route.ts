import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongoose";
import User from "@/lib/models/User";
import { createPaystackSubaccount } from "@/lib/paystack";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // ✅ Ensure session and user
    const userId = session?.user?._id;
    const userRole = session?.user?.role;

    if (!userId || !userRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Role check using session
    if (!["organizer", "admin"].includes(userRole)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { bankCode, bankName, accountNumber } = await req.json();

    if (!bankCode || !accountNumber) {
      return NextResponse.json(
        { error: "Bank code and account number are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try {
      const { subaccountCode, accountName } = await createPaystackSubaccount({
        name: user.name || "Unnamed",
        bankCode,
        accountNumber,
      });

      // ✅ Save subaccount info to user
      user.bankCode = bankCode;
      user.bankName = bankName || null;
      user.accountNumber = accountNumber;
      user.accountName = accountName;
      user.subaccountCode = subaccountCode;
      user.bankSetupComplete = true;

      await user.save();

      return NextResponse.json({
        message: "Bank info saved!",
        accountName,
      });
    } catch (err: any) {
      console.error("❌ Paystack Subaccount Creation Error:", err.message);

      user.bankSetupComplete = false;
      await user.save();

      if (err.message.toLowerCase().includes("resolve account")) {
        return NextResponse.json(
          {
            error:
              "Invalid account number or bank. Please double-check the details.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: err.message || "An error occurred while creating subaccount.",
        },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error("[SETUP_PAYMENT_ERROR]", err);
    return NextResponse.json(
      { error: err.message || "An internal server error occurred." },
      { status: 500 }
    );
  }
}
