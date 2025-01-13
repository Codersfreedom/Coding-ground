import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ConvexClientProvider from "./providers/ConvexClientProvider";
import {ClerkProvider} from "@clerk/nextjs";
import Footer from "@/components/Footer";
import {Toaster} from "react-hot-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Coding ground",
  description: "A online IDE for coding and sharing snippets among friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <ClerkProvider>

    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased
        min-h-screen bg-gradient-to-b from-gray-900 text-gray-100 flex flex-col
        `}

      >
      <ConvexClientProvider>

        {children}
      </ConvexClientProvider>
      <Footer />
      <Toaster />
      </body>
    </html>
      </ClerkProvider>
  );
}
