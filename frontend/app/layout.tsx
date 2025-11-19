import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Giorgio Privitera Lab",
  description: "Giorgio Privitera Lab is a laboratory for the creation of art and design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
