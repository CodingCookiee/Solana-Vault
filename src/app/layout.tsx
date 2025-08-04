import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SolanaProvider } from "@/providers/SolanaProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/common";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: "/favicon.png",
  title: "SolanaVault - Web3 Wallet Suite",
  description:
    "Securely manage your Solana assets with our next-generation wallet interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SolanaProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </AuthProvider>
          </SolanaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
