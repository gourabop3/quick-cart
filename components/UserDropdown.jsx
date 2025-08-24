"use client";
import { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { 
  UserIcon, 
  ShoppingBagIcon, 
  HeartIcon, 
  CogIcon, 
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

export default function UserDropdown() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const menuItems = [
    {
      label: "My Profile",
      icon: UserIcon,
      href: "/profile",
      onClick: () => router.push("/profile")
    },
    {
      label: "My Orders",
      icon: ShoppingBagIcon,
      href: "/my-orders",
      onClick: () => router.push("/my-orders")
    },
    {
      label: "Wishlist",
      icon: HeartIcon,
      href: "/wishlist",
      onClick: () => router.push("/wishlist")
    },
    {
      label: "Settings",
      icon: CogIcon,
      href: "/settings",
      onClick: () => router.push("/settings")
    }
  ];

  if (!isSignedIn) {
    return (
      <button
        onClick={() => router.push("/sign-in")}
        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-orange-600 transition-colors duration-200"
      >
        <UserIcon className="h-5 w-5" />
        <span className="hidden sm:block">Sign In</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || "User"}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-white text-sm font-medium">
              {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || "U"}
            </span>
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {user?.firstName || user?.emailAddresses[0]?.emailAddress?.split("@")[0] || "User"}
          </p>
          <p className="text-xs text-gray-500">
            {user?.emailAddresses[0]?.emailAddress || "user@example.com"}
          </p>
        </div>
        <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || "User"}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {user?.fullName || user?.firstName || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.emailAddresses[0]?.emailAddress || "user@example.com"}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-2"></div>

          {/* Sign Out */}
          <div className="px-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-lg"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}