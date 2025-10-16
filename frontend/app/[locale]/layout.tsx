import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { PrimeReactProvider } from 'primereact/api';
import HeaderComponent from "@/components/headerComponent";
import FooterComponent from "@/components/footerComponent";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  // Await params before accessing properties
  const {locale} = await params;
  
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <html lang={locale} className="h-full">
      <body className="antialiased h-full">
        <NextIntlClientProvider messages={messages}>
          <PrimeReactProvider>
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
          </PrimeReactProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}