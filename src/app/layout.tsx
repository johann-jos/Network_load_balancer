import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SimulationProvider } from '../context/SimulationContext';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TCP/04 | Connection Lab',
  description:
    'A visual TCP load-balancing laboratory for exploring handshakes, routing decisions, failover, queues, and connection teardown.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#071019] font-sans text-[#e8f1f5] antialiased selection:bg-[#8ee8ff] selection:text-[#071019]">
        <SimulationProvider>{children}</SimulationProvider>
      </body>
    </html>
  );
}
