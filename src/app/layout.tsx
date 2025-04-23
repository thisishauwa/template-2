import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { AuthProvider } from '../lib/contexts/AuthContext';
import { MoodJournalProvider } from '../lib/contexts/MoodJournalContext';
import { MovieProvider } from '../lib/contexts/MovieContext';

// Load Inter font from Google
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap' 
});

// Load Britti Sans font locally
const brittiSans = localFont({
  src: [
    {
      path: '../fonts/BrittiSansTrial-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/BrittiSansTrial-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/BrittiSansTrial-RegularItalic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/BrittiSansTrial-BoldItalic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-britti-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Feeling Flicks',
  description: 'Discover movies based on your mood and preferences',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${brittiSans.variable}`}>
      <body className="font-britti-sans">
        <AuthProvider>
          <MovieProvider>
            <MoodJournalProvider>
              {children}
            </MoodJournalProvider>
          </MovieProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
