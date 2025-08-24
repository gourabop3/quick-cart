import connectDB from "@/config/db";
import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

    // Try to send order creation event to Inngest first
    let orderCreated = false;
    try {
      await inngest.send({
        name: "order/created",
        data: {
          userId,
          address,
          items,
          amount: finalAmount,
          date: Date.now(),
        },
      });
      orderCreated = true;
    } catch (inngestError) {
      console.error("Inngest error, creating order directly:", inngestError);
      
      // Fallback: Create order directly in database
      try {
        const order = new Order({
          userId,
          items,
          amount: finalAmount,
          address,
          date: Date.now(),
        });
        await order.save();
        orderCreated = true;
      } catch (directOrderError) {
        console.error("Direct order creation failed:", directOrderError);
        return NextResponse.json({ 
          success: false, 
          message: "Failed to create order. Please try again." 
        }, { status: 500 });
      }
    }

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
      message: "Order Placed Successfully",
      amount: finalAmount
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to place order. Please try again." 
    }, { status: 500 });
  }
}
