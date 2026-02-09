import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SentinelAI Dashboard",
  description: "Security Agent Control Panel",
};

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WebSocketProvider } from "@/context/WebSocketContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WebSocketProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </WebSocketProvider>
      </body>
    </html>
  );
}
