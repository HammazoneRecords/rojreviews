
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/auth-context';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'ROJFeedback',
  description: 'AI-Powered Restaurant Feedback Analysis for Restaurants of Jamaica',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <div className="flex-grow">
            {children}
          </div>
        </AuthProvider>
        <footer className="text-center text-sm text-muted-foreground py-4 flex flex-col items-center justify-center gap-2">
            <Image
                src="https://firebasestorage.googleapis.com/v0/b/ralfeedback.firebasestorage.app/o/img%2FROJ_Logo.png?alt=media&token=35b9c7b1-294b-4861-a537-8271161d9a5b"
                alt="ROJ Logo"
                width={102}
                height={102}
                className="h-6 w-auto"
            />
            <p>© Restaurants of Jamaica (ROJ) Ltd. 2025</p>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
