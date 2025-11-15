import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { PrimeReactProvider } from 'primereact/api';
import HeaderComponent from "@/components/headerComponent";
import FooterComponent from "@/components/footerComponent";
import localFont from 'next/font/local';

const jungleFever = localFont({
  src: [
    {
      path: '../../public/fonts/JungleFeverNF.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-junglefever',
  display: 'swap',
});

const kranji = localFont({
  src: [
    {
      path: '../../public/fonts/Skranji-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-kranji',
  display: 'swap',
});

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
  const messages = await getMessages({locale});
 
  return (
    <html lang={locale} className={`h-full ${jungleFever.variable} ${kranji.variable}`}>
      <body className="antialiased h-full overflow-x-hidden">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <PrimeReactProvider>
            {/* Header sempre in alto e sticky - FUORI dal container principale */}
            <HeaderComponent />
            
            <div className="min-h-screen flex flex-col">
              {/* Contenuto principale che si espande per riempire lo spazio disponibile */}
              <main className="flex-1 w-full overflow-x-hidden">
                {children}
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