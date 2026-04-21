import { NextResponse } from 'next/server';
import { sendOTPEmail } from '@/lib/email';

// Temporary storage (in production, use MongoDB)
const otpStore = new Map();

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 },
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP (in production, save to database)
    otpStore.set(email, { otp, expiresAt });

    // Clean up expired OTPs after 10 minutes
    setTimeout(
      () => {
        if (otpStore.get(email)?.expiresAt === expiresAt) {
          otpStore.delete(email);
        }
      },
      10 * 60 * 1000,
    );

    // Send email with OTP
    await sendOTPEmail(email, otp);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 600,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}

// Export for checking OTP (optional)
export { otpStore };
