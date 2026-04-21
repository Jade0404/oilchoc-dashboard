import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Sans_Thai, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";

// English body font — humanist, editorial, not too heavy
const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Thai body font — designed for Thai script, pairs naturally with DM Sans
const ibmPlexThai = IBM_Plex_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Monospace for stats/numbers
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Subsidy Volatility Paradox",
  description:
    "Policy dashboard: how regulated fuel subsidies create price shock risk across income groups. Earth Engineering Hackathon 2025.",
  keywords: ["fuel subsidy", "price shock", "policy analysis", "Thailand", "energy policy"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${ibmPlexThai.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#1c1b19] text-[#e6dfd3]">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
