"use client";

import { NextIntlClientProvider } from "next-intl";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const DEFAULT_LOCALE = "ko";
const SUPPORTED_LOCALES = ["ko", "en"];

// Create a client component that dynamically loads messages
export default function IntlProvider({
  locale: defaultLocale, // Ignore the prop, determine from path
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<Record<string, any>>({});
  const [locale, setLocale] = useState<string>(defaultLocale);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Extract locale from the pathname
    const extractedLocale = pathname?.split("/")[1] || DEFAULT_LOCALE;
    const safeLocale = SUPPORTED_LOCALES.includes(extractedLocale)
      ? extractedLocale
      : DEFAULT_LOCALE;
    setLocale(safeLocale);

    // Dynamically import messages in the client
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const msgs = (await import(`@/messages/${safeLocale}.json`)).default;
        setMessages(msgs);
      } catch (error: unknown) {
        console.error(
          `Failed to load messages for locale: ${safeLocale}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        // Fallback to Korean if needed
        const fallback = (await import("@/messages/ko.json")).default;
        setMessages(fallback);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [pathname]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Asia/Seoul" // Add timeZone to fix the warning
    >
      {children}
    </NextIntlClientProvider>
  );
}
