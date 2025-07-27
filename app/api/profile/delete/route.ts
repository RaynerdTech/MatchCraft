import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { connectDB } from '@/lib/mongoose'
import User from '@/lib/models/User'
import { EmailVerification } from '@/lib/models/EmailVerification'

export async function DELETE(req: Request) {
  await connectDB()
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { code } = await req.json()
  if (!code) return NextResponse.json({ message: 'OTP code is required' }, { status: 400 })

  const user = await User.findById(session.user._id)
  if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 })

  const otpDoc = await EmailVerification.findOne({ email: user.email })

  if (!otpDoc || otpDoc.otp !== code)
    return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 401 })

  // Delete user
  await User.findByIdAndDelete(user._id)

  // Optionally delete OTP
  await EmailVerification.deleteOne({ email: user.email })

  return NextResponse.json({ message: 'Account deleted successfully' })
}
