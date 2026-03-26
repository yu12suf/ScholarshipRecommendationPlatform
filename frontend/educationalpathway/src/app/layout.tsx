import type { Metadata } from "next";
import { Open_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-context";
import { ThemeProvider } from "@/providers/theme-context";
import { Toaster } from "react-hot-toast";

import { GoogleOAuthProvider } from "@react-oauth/google";

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["400", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "Admas",
  description: "Your journey to academic success starts here.",
  icons: {
    icon: "/admas.png",
    apple: "/admas.png",
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
        className={`${openSans.variable} ${playfair.variable} font-sans antialiased text-foreground bg-background`}
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
