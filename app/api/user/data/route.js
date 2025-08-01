import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    await connectDB();
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
      await user.save();
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
