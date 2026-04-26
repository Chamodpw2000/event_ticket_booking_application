import type { Metadata } from "next";
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
  title: "Tickety Admin",
  description: "Operations dashboard for managing events, ticket inventory, bookings, and payouts.",
};

import { QueryProvider } from "@/providers/QueryProvider";

import { Sidebar } from "@/features/layout/Sidebar";
import { Header } from "@/features/layout/Header";
import { LoadingBar } from "@/features/layout/LoadingBar";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-900">
        <QueryProvider>
          <LoadingBar />
          <Toaster position="top-right" richColors />
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col pl-64">
              <Header />
              <main className="flex-1 p-6 lg:p-8">
                {children}
              </main>
            </div>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
