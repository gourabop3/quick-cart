import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const authSeller = async (userId) => {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // Only allow admin@gmail.com to access seller dashboard
    if (user.emailAddresses && user.emailAddresses.length > 0) {
      const primaryEmail = user.emailAddresses[0].emailAddress;
      if (primaryEmail === "admin@gmail.com") {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Auth seller error:", error);
    return false;
  }
};

export default authSeller;
