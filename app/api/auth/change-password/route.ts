import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/authOptions'
import { connectDB } from '@/lib/mongoose'
import User from "@/lib/models/User";

export async function PUT(req: Request) {
  await connectDB()
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { oldPassword, newPassword } = await req.json()
  if (!oldPassword || !newPassword) {
    return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
  }

  const user = await User.findById(session.user._id).select('+password')
  const isMatch = await bcrypt.compare(oldPassword, user.password)
  if (!isMatch) {
    return NextResponse.json({ message: 'Old password is incorrect' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 10)
  user.password = hashed
  await user.save()

  return NextResponse.json({ message: 'Password updated successfully' })
}
