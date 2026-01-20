import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redis Control Room",
  description: "Apple-like Redis management console"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cloud text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
