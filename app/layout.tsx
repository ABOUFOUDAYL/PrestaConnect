import { Inter } from 'next/font/google';
import './globals.css';

// Importations corrigées avec des chemins relatifs explicites
import { Footer } from '../components/layout/footer';
import { Toaster } from '../components/ui/toaster';
import { ConditionalShell } from '../components/layout/conditional-shell';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ConditionalShell>
          {children}
        </ConditionalShell>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
