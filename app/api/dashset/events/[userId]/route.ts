import { connectDB } from '@/lib/mongoose';
import Transaction from '@/lib/models/Transaction';
import Event from '@/lib/models/Event';
import { NextResponse } from 'next/server';

type Params = Promise<{ userId: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  await connectDB();
  const { userId } = await params;

  try {
    const transactions = await Transaction.find({
      user: userId,
      status: 'success',
    })
      .populate('event', 'title location date') // populate only needed fields
      .sort({ createdAt: -1 });

    const count = transactions.length;

    return NextResponse.json({ count, transactions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching joined events:', error);
    return NextResponse.json(
      { error: 'Could not fetch joined events' },
      { status: 500 }
    );
  }
}
