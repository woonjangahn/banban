import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Poll } from "@/types";
import { Button } from "@/components/ui/Button";
import { getTranslations } from "next-intl/server";
import PollCard from "@/components/polls/PollCard";

export default async function PollsPage() {
  const t = await getTranslations();
  const supabase = await createClient();

  // Fetch polls data with their creators
  const { data: polls, error } = await supabase
    .from("polls")
    .select(
      `
      *,
      creator:users!created_by(username, avatar_url),
      stats:poll_stats!poll_id(vote_count, comment_count)
    `,
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching polls:", error);
    return <div>{t("common.loading")}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("common.polls")}</h1>
        <Link href="/polls/create">
          <Button>{t("common.homepage.createPoll")}</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {polls?.map((poll: Poll) => <PollCard key={poll.id} poll={poll} />)}
      </div>

      {polls?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("poll.noPollsFound")}</p>
        </div>
      )}
    </div>
  );
}
