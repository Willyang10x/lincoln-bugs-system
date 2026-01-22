import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- TEM QUE TER O 'S'
import { DateProvider } from "@/contexts/date-context";
import { Toaster } from "@/components/ui/sonner"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lincoln Bugs System",
  description: "Gestão Financeira Exclusiva",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png", 
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lincoln Bugs",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <DateProvider>
          {children}
        </DateProvider>
        <Toaster />
      </body>
    </html>
  );
}