import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Poll } from "@/types";

export default async function PollsPage() {
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
    return <div>Error loading polls</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Polls</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {polls?.map((poll: Poll) => <PollCard key={poll.id} poll={poll} />)}
      </div>

      {polls?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No polls found</p>
        </div>
      )}
    </div>
  );
}

// Note: This would typically be moved to its own component file
function PollCard({ poll }: { poll: Poll }) {
  return (
    <Link href={`/polls/${poll.id}`}>
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="font-semibold text-lg mb-2 truncate">{poll.title}</div>
        {poll.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {poll.description}
          </p>
        )}

        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>By: {poll.creator?.username || "Anonymous"}</span>
          <span className="bg-gray-100 px-2 py-1 rounded">{poll.category}</span>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
          <span>{poll.stats?.vote_count || 0} votes</span>
          <span>{poll.stats?.comment_count || 0} comments</span>
        </div>
      </div>
    </Link>
  );
}
