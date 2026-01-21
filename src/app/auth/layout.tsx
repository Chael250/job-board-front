import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Job Board",
  description: "Sign in or create an account to access the job board platform.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  );
}