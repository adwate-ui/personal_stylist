import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import LayoutContent from "@/components/LayoutContent";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TaskProvider } from "@/contexts/TaskContext";
import { ProfileProvider } from "@/contexts/ProfileContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["monospace"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  fallback: ["serif"],
});

export const metadata: Metadata = {
  title: "Personal Stylist - Gemini 3",
  description: "AI-Powered Personal Stylist",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ProfileProvider>
            <TaskProvider>
              <LayoutContent>
                {children}
              </LayoutContent>
            </TaskProvider>
          </ProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
