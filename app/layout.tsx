import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/api/provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kost",
  description: "Manajemen kost untuk pemilik dan pengelola",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
