import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const authSeller = async (userId) => {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // Temporarily allow all users for testing
    // In production, uncomment the role check below
    return true;
    
    // Original role check (uncomment for production):
    // if (user.publicMetadata.role === "seller") {
    //   return true;
    // } else {
    //   return false;
    // }
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
};

export default authSeller;
