import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";
import ClarityInit from '@/components/ClarityInit';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Desktop [Matic Ahlin]",
  description: "Visual designer based in Slovenia with a love for the web. Building sites that merge design craft with functional, expressive code.",
  keywords: ["graphic design", "frontend developer", "visual design", "print design", "Slovenia", "portfolio", "visual communications", "blog"],
  authors: [{ name: "Matic Ahlin" }],
  creator: "Matic Ahlin",
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://maticahlin.com",
    title: "Matic Ahlin — Designer & Developer",
    description: "Visual designer based in Slovenia with a love for the web. Building sites that merge design craft with functional, expressive code.",
    siteName: "Matic Ahlin Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Matic Ahlin Portfolio",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Matic Ahlin - Designer & Developer",
    description: "Visual designer based in Slovenia with a love for the web. Building sites that merge design craft with functional, expressive code.",
    images: ["/og-image.png"],
  },

  alternates: {
    canonical: "https://maticahlin.com",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <ClarityInit />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}