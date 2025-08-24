import crypto from "crypto";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";

export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      );
    }

    await connectDB();

    // Update order status to paid
    const order = await Order.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { 
        status: "Paid",
        paymentId: razorpay_payment_id,
        paymentStatus: "completed",
        paidAt: Date.now()
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order: {
        id: order._id,
        orderId: order.orderId,
        amount: order.amount,
        status: order.status,
        paymentId: razorpay_payment_id,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, message: "Payment verification failed" },
      { status: 500 }
    );
  }
}