import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 },
      );
    }

    // Verify OTP from database
    // const otpRecord = await db.collection('otps').findOne({ email, otp, expiresAt: { $gt: Date.now() } });

    // if (!otpRecord) {
    //   return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    // }

    // Delete used OTP
    // await db.collection('otps').deleteOne({ _id: otpRecord._id });

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 },
    );
  }
}
