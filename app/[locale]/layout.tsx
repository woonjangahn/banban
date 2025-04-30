import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import ClientNavbar from "@/components/layout/ClientNavbar";
import ClientFooter from "@/components/layout/ClientFooter";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BanBan - 투표 서비스",
  description: "Next.js 15로 만든 투표 서비스",
};

// This is a special Next.js 15 function for getting messages
// It won't be called during rendering, but as a separate step
export async function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <NextIntlClientProvider>
          <ClientNavbar />
          <main className="flex-grow">{children}</main>
          <ClientFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
