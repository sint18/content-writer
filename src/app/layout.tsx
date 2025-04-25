import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sophia",
  description: "Craft engaging, insightful, and effective content with Sophia.",
  openGraph: {
    title: {
      default: "Sophia",
      template: "%s | Sophia",
    },
    description:
      "Craft engaging, insightful, and effective content with Sophia.",
    url: "https://project-sophia.vercel.app/",
    siteName: "Sophia",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
