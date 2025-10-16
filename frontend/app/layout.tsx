import type { Metadata } from "next";
import { PrimeReactProvider } from 'primereact/api';

import "./globals.css";
import HeaderComponent from "@/components/headerComponent";
import FooterComponent from "@/components/footerComponent";

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
    <html lang="en" className="h-full">
      <PrimeReactProvider>
        <body className="antialiased h-full">
          <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col">
            {/* Header sempre in alto e sticky */}
            <HeaderComponent />

            {/* Contenuto principale che si espande per riempire lo spazio disponibile */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              <div className="pt-4">
                {children}
              </div>
            </main>

            {/* Footer sempre in basso */}
            <FooterComponent />
          </div>
        </body>
      </PrimeReactProvider>
    </html>
  );
}
