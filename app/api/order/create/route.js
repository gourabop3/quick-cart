import connectDB from "@/config/db";
import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    await connectDB();
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authenticated" }, { status: 401 });
    }

    const { address, items } = await request.json();

    if (!address || !items || items.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid data: address and items are required" }, { status: 400 });
    }

    // Validate items structure
    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity <= 0) {
        return NextResponse.json({ success: false, message: "Invalid item data" }, { status: 400 });
      }
    }

    // calculate amount using items
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        amount += product.offerPrice * item.quantity;
      } else {
        return NextResponse.json({ success: false, message: `Product not found: ${item.product}` }, { status: 404 });
      }
    }

    // Add 2% processing fee
    const finalAmount = amount + Math.floor(amount * 0.02);

    // Create order in database first
    const order = new Order({
      userId,
      items,
      amount: finalAmount,
      address,
      date: Date.now(),
      paymentStatus: "pending",
      paymentMethod: "UPI"
    });

    const savedOrder = await order.save();

    // Create Razorpay payment order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100), // Convert to paise
      currency: "INR",
      receipt: savedOrder.orderId,
      payment_capture: 1,
      notes: {
        userId: userId,
        orderId: savedOrder.orderId,
      },
    });

    // Update order with Razorpay order ID
    await Order.findByIdAndUpdate(savedOrder._id, {
      razorpayOrderId: razorpayOrder.id
    });

    // Clear user cart after order creation
    try {
      let user = await User.findById(userId);
      if (!user) {
        // Create user if they don't exist
        user = new User({
          _id: userId,
          name: "User",
          email: "user@example.com",
          imageUrl: "",
          cartItems: {}
        });
      } else {
        user.cartItems = {};
      }
      await user.save();
    } catch (userError) {
      console.error("Error updating user cart:", userError);
      // Don't fail the order creation if cart clearing fails
    }

    return NextResponse.json({ 
      success: true, 
      message: "Order created successfully. Please complete payment.",
      order: {
        id: savedOrder._id,
        orderId: savedOrder.orderId,
        amount: finalAmount,
        status: savedOrder.status,
        paymentStatus: savedOrder.paymentStatus
      },
      payment: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to create order. Please try again." 
    }, { status: 500 });
  }
}
