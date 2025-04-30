import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Poll } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Polls</h1>
        <Link href="/polls/create">
          <Button>Create Poll</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {polls?.map((poll: Poll) => <PollCard key={poll.id} poll={poll} />)}
      </div>

      {polls?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No polls found</p>
        </div>
      )}
    </div>
  );
}

// Note: This would typically be moved to its own component file
function PollCard({ poll }: { poll: Poll }) {
  return (
    <Link href={`/polls/${poll.id}`} className="block h-full">
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Avatar
                url={poll.creator?.avatar_url}
                username={poll.creator?.username || "Anonymous"}
                size="sm"
              />
              <span className="text-sm text-muted-foreground">
                {poll.creator?.username || "Anonymous"}
              </span>
            </div>
            <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
              {poll.category}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <CardTitle className="mb-2 text-lg line-clamp-2">{poll.title}</CardTitle>
          {poll.description && (
            <CardDescription className="line-clamp-2 mb-2">
              {poll.description}
            </CardDescription>
          )}
        </CardContent>
        <CardFooter className="border-t pt-3 flex justify-between text-xs text-muted-foreground">
          <span>{poll.stats?.vote_count || 0} votes</span>
          <span>{poll.stats?.comment_count || 0} comments</span>
        </CardFooter>
      </Card>
    </Link>
  );
}