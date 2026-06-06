import { Inter } from 'next/font/google';
import './globals.css';
import { Footer } from '../components/layout/footer';
import { Toaster } from '../components/ui/toaster';
import { ConditionalShell } from '../components/layout/conditional-shell';
import { Navbar } from '../components/layout/navbar';
import { ImpersonationProvider } from '../contexts/impersonation-context';
import { ImpersonationBar } from '../components/layout/impersonation-bar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
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