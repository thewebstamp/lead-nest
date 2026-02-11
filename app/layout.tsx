// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeadNest - Never Miss a Lead Again",
  description: "Automated lead capture and follow-up for service businesses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}