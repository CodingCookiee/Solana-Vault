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
              <Toaster
                position="top-right"
                toastOptions={{
                  className:
                    "border border-white/20 dark:border-gray-800/20 backdrop-blur-sm",
                  style: {
                    background: "rgba(255, 255, 255, 0.8)",
                    color: "var(--foreground)",
                    backdropFilter: "blur(8px)",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  },
                  success: {
                    style: {
                      background:
                        "linear-gradient(to right, rgba(240, 253, 244, 0.9), rgba(209, 250, 229, 0.9))",
                      borderTop: "1px solid rgba(52, 211, 153, 0.3)",
                      color: "#047857",
                    },
                    icon: "🎉",
                  },
                  error: {
                    style: {
                      background:
                        "linear-gradient(to right, rgba(254, 242, 242, 0.9), rgba(254, 226, 226, 0.9))",
                      borderTop: "1px solid rgba(248, 113, 113, 0.3)",
                      color: "#b91c1c",
                    },
                    icon: "❌",
                  },
                  info: {
                    style: {
                      background:
                        "linear-gradient(to right, rgba(239, 246, 255, 0.9), rgba(219, 234, 254, 0.9))",
                      borderTop: "1px solid rgba(96, 165, 250, 0.3)",
                      color: "#1e40af",
                    },
                    icon: "ℹ️",
                  },
                  warning: {
                    style: {
                      background:
                        "linear-gradient(to right, rgba(255, 251, 235, 0.9), rgba(254, 243, 199, 0.9))",
                      borderTop: "1px solid rgba(251, 191, 36, 0.3)",
                      color: "#92400e",
                    },
                    icon: "⚠️",
                  },
                  loading: {
                    style: {
                      background:
                        "linear-gradient(to right, rgba(243, 244, 246, 0.9), rgba(229, 231, 235, 0.9))",
                      borderTop: "1px solid rgba(156, 163, 175, 0.3)",
                      color: "#374151",
                    },
                  },
                }}
              />
            </AuthProvider>
          </SolanaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
