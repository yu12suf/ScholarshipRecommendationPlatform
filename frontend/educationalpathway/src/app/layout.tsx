import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-context";
import { ThemeProvider } from "@/providers/theme-context";
import { Toaster } from "react-hot-toast";

import { GoogleOAuthProvider } from "@react-oauth/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  if (!googleClientId) {
    console.warn(
      "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined. Google OAuth will fail. " +
        "Add the environment variable to .env.local with your client ID.",
    );
  }

  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased text-foreground bg-background`}
      >
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            <ThemeProvider>
              <AuthProvider>
                {children}
                <Toaster position="top-right" />
              </AuthProvider>
            </ThemeProvider>
          </GoogleOAuthProvider>
        ) : (
          <ThemeProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" />
            </AuthProvider>
          </ThemeProvider>
        )}
      </body>
    </html>
  );
}
