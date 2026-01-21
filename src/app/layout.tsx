import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth.context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Job Board - Find Your Dream Job",
  description: "Connect with top companies and find your perfect job opportunity. Browse thousands of job listings and apply with ease.",
  keywords: ["jobs", "careers", "employment", "hiring", "job search"],
  authors: [{ name: "Job Board Team" }],
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <AuthProvider>
          <div id="root" className="min-h-screen">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
