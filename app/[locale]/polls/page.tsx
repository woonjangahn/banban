import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Poll } from "@/types";
import { Button } from "@/components/ui/Button";
import { getTranslations } from "next-intl/server";
import PollCard from "@/components/polls/PollCard";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function PollsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const t = await getTranslations();
  const supabase = await createClient();

  const { category, sort } = await searchParams;

  // Create the query
  let query = supabase
    .from("polls")
    .select(
      `
      *,
      creator:users!created_by(username, avatar_url),
      stats:poll_stats!poll_id(vote_count, comment_count)
    `,
    )
    .eq("is_active", true);

  // Apply category filter if provided
  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  // For all cases, start with the default sort by creation date
  query = query.order("created_at", { ascending: false });

  // Limit results
  query = query.limit(20);

  // Execute the query
  const { data: polls, error } = await query;

  console.log("Polls fetched:", polls?.length, "Error:", error);

  // Sort results client-side based on votes or comments if needed
  let sortedPolls = polls;

  if (polls && polls.length > 0) {
    if (sort === "votes") {
      // Sort by vote count (highest first)
      sortedPolls = [...polls].sort((a, b) => {
        const votesA = a.stats?.vote_count || 0;
        const votesB = b.stats?.vote_count || 0;
        return votesB - votesA;
      });
    } else if (sort === "comments") {
      // Sort by comment count (highest first)
      sortedPolls = [...polls].sort((a, b) => {
        const commentsA = a.stats?.comment_count || 0;
        const commentsB = b.stats?.comment_count || 0;
        return commentsB - commentsA;
      });
    }
  }

  if (error) {
    console.error("Error fetching polls:", error);
    return <div>{t("common.loading")}</div>;
  }

  // Get unique categories from the codebase (hardcoded for now based on the i18n file)
  const categories = [
    "general",
    "technology",
    "entertainment",
    "sports",
    "politics",
    "demographics",
    "other",
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("common.polls")}</h1>
        <Link href="/polls/create">
          <Button>{t("common.homepage.createPoll")}</Button>
        </Link>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Category filter */}
        <div className="md:w-1/2">
          <label className="block text-sm font-medium mb-2">
            {t("common.categories")}:
          </label>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/polls"
              className={`px-3 py-1 text-sm rounded-full ${
                !category || category === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {t("common.category.all") || "All"}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/polls?category=${cat}${sort ? `&sort=${sort}` : ""}`}
                className={`px-3 py-1 text-sm rounded-full ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {t(`common.category.${cat}`)}
              </Link>
            ))}
          </div>
        </div>

        {/* Sort options */}
        <div className="md:w-1/2">
          <label className="block text-sm font-medium mb-2">
            {t("common.sortBy") || "Sort by"}:
          </label>
          <div className="flex gap-2">
            <Link
              href={category ? `/polls?category=${category}` : "/polls"}
              className={`px-3 py-1 text-sm rounded-full ${
                !sort || sort === "newest"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {t("common.sort.newest") || "Newest"}
            </Link>
            <Link
              href={
                category
                  ? `/polls?category=${category}&sort=votes`
                  : "/polls?sort=votes"
              }
              className={`px-3 py-1 text-sm rounded-full ${
                sort === "votes"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {t("common.sort.votes") || "Most Votes"}
            </Link>
            <Link
              href={
                category
                  ? `/polls?category=${category}&sort=comments`
                  : "/polls?sort=comments"
              }
              className={`px-3 py-1 text-sm rounded-full ${
                sort === "comments"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {t("common.sort.comments") || "Most Comments"}
            </Link>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 shadow-sm">
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="space-y-2">
                  {Array(3).fill(0).map((_, j) => (
                    <div key={j} className="h-8 bg-gray-200 rounded w-full"></div>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPolls?.map((poll: Poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>

        {sortedPolls?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("poll.noPollsFound")}</p>
          </div>
        )}
      </Suspense>
    </div>
  );
}
