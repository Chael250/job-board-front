import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth.context";
import { MainNavigation } from "@/components/navigation/main-nav";
import { AuthChecker } from "@/components/auth/auth-checker";

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
      <body className="font-sans antialiased min-h-screen bg-secondary-50 text-secondary-900">
        <AuthProvider>
          <AuthChecker>
            <div id="root" className="min-h-screen flex flex-col">
              <MainNavigation />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </AuthChecker>
        </AuthProvider>
      </body>
    </html>
  );
}
