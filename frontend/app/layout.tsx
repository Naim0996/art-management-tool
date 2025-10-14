import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Art Management Tool",
  description: "Art gallery management system with customer and admin interfaces",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
