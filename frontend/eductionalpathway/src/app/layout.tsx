import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-context";
import { Toaster } from "react-hot-toast";

import { GoogleOAuthProvider } from '@react-oauth/google';

const lora = Lora({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Educational Pathway | Scholarship Platform",
  description: "Your journey to academic success starts here.",
  icons: {
    icon: [
      {
        url: "/favicon.png",
        type: "image/png",
      },
    ],
    // You can also add multiple sizes for different devices
    apple: [
      {
        url: "/favicon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <html lang="en">
      <body
        className={`${lora.variable} font-serif antialiased text-foreground bg-background`}
      >
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
