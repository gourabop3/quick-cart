import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppContextProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuickCart - Your Online Shopping Destination",
  description: "Discover amazing products at great prices. Shop now on QuickCart!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        </head>
        <body className={inter.className}>
          <AppContextProvider>
            <Navbar />
            {children}
            <Toaster position="top-right" />
          </AppContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
