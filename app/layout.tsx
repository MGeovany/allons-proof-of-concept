import type { Metadata, Viewport } from "next";
import { Urbanist } from "next/font/google";

import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Allons - Descubre eventos cerca de ti",
  description: "Encuentra y reserva los mejores eventos cerca de ti",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#131617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${urbanist.variable} h-dvh overflow-hidden py-4 font-sans antialiased bg-[#1a1a1c]`}
      >
        <div className="mx-auto flex h-[calc(100dvh-2rem)] w-full max-w-[430px] flex-col bg-background rounded-[1.5rem] border border-white/10 shadow-2xl overflow-hidden min-[431px]:rounded-[2rem]">
          {children}
        </div>
      </body>
    </html>
  );
}
