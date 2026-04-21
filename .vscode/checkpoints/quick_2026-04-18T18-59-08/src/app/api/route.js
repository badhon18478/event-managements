import { NextResponse } from 'next/server';

// ডেমো পেমেন্ট সেশন তৈরি করুন (কোন Secret Key লাগবে না)
export async function POST(request) {
  try {
    const { eventId, eventTitle, price, userId, userEmail } =
      await request.json();

    console.log('Creating checkout session for:', {
      eventId,
      eventTitle,
      price,
      userId,
      userEmail,
    });

    // ডেমো সেশন আইডি তৈরি করুন
    const demoSessionId =
      'demo_session_' +
      Date.now() +
      '_' +
      Math.random().toString(36).substring(7);

    // ডেমো চেকআউট URL (যা আমাদের success page এ নিয়ে যাবে)
    const demoCheckoutUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/success?session_id=${demoSessionId}&demo=true`;

    // Payment history save করুন (optional)
    // আপনি চাইলে এখানে ডাটাবেসে পেমেন্ট সেভ করতে পারেন

    return NextResponse.json({
      id: demoSessionId,
      url: demoCheckoutUrl,
      // Stripe এর মত রেস্পন্স structure
    });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
