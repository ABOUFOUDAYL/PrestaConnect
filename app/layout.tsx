import { Sora, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import { Footer } from '../components/layout/footer';
import { Toaster } from '../components/ui/toaster';
import { ConditionalShell } from '../components/layout/conditional-shell';
import { Navbar } from '../components/layout/navbar';
import { ImpersonationProvider } from '../contexts/impersonation-context';
import { ImpersonationBar } from '../components/layout/impersonation-bar';

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-sora',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${sora.variable} ${dmSans.variable} ${dmMono.variable} font-sans`}>
        <ImpersonationProvider>
          <ImpersonationBar />
          <ConditionalShell
            navbar={<Navbar />}
            footer={<Footer />}
          >
            {children}
          </ConditionalShell>
          <Toaster />
        </ImpersonationProvider>
      </body>
    </html>
  );
}