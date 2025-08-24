import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { amount, currency = "INR", receipt } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 }
      );
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt,
      payment_capture: 1,
      notes: {
        userId: userId,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
    });
  } catch (error) {
    console.error("Payment order creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create payment order" },
      { status: 500 }
    );
  }
}