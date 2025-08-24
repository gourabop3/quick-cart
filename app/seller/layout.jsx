"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SellerLayout({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        router.push("/");
        return;
      }

      // Check if user is admin
      if (user && user.emailAddresses && user.emailAddresses.length > 0) {
        const primaryEmail = user.emailAddresses[0].emailAddress;
        if (primaryEmail === "admin@gmail.com") {
          setIsAuthorized(true);
        } else {
          // Redirect non-admin users
          router.push("/");
        }
      } else {
        router.push("/");
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, [isSignedIn, isLoaded, user, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect to home
  }

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {children}
    </div>
  );
}
