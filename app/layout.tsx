import type { Metadata } from "next";
import { Lilita_One, Inter } from "next/font/google";
import "./globals.css";
import { SHOW_NAME } from "./lib/brand";

// Big chunky display font for indie-game vibe
const lilita = Lilita_One({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: SHOW_NAME,
  description:
    "Five AI characters argue your topic at a roundtable. Pick a winner. Build a streak.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${lilita.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
