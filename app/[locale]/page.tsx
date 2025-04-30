"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Home() {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col items-center">
      {/* Hero section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
            Create polls, gather opinions, see results in real-time
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl">
            BanBan is a simple and powerful polling platform that lets you
            create, share, and analyze polls in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/polls"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
            >
              {t("polls")}
            </Link>
            <Link
              href="/polls/create"
              className="px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition font-medium"
            >
              Create a Poll
            </Link>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="w-full py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Key Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Poll Creation</h3>
              <p className="text-gray-600">
                Create custom polls in seconds with multiple options and
                categories.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Results</h3>
              <p className="text-gray-600">
                Watch votes come in real-time with live updating charts and
                statistics.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Discussion</h3>
              <p className="text-gray-600">
                Enable discussion around your polls with comments and reactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="w-full py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">
            Ready to start gathering opinions?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users already creating polls and making decisions
            with BanBan.
          </p>
          <Link
            href="/register"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
          >
            {t("register")}
          </Link>
        </div>
      </section>
    </div>
  );
}
