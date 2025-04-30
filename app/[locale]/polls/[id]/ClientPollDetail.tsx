"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PollResults } from "@/components/polls/PollResults";
import type { Poll, PollOption, Comment, User } from "@/types";

// Dynamically import components to avoid hydration issues
const PollVoting = dynamic(
  () => import("@/components/polls/PollVoting").then((mod) => mod.PollVoting),
  {
    ssr: false,
  },
);

const CommentSection = dynamic(
  () =>
    import("@/components/comments/CommentSection").then(
      (mod) => mod.CommentSection,
    ),
  {
    ssr: false,
  },
);

interface ClientPollDetailProps {
  poll: Poll & {
    creator: { username: string; avatar_url: string } | null;
  };
  optionsWithVotes: (PollOption & { votes: number })[];
  comments: Comment[];
  userProfile: User | null;
  hasVoted: boolean;
}

export function ClientPollDetail({
  poll,
  optionsWithVotes,
  comments,
  userProfile,
  hasVoted,
}: ClientPollDetailProps) {
  const user = userProfile !== null;

  const formattedDate = new Date(poll.created_at).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link href="/polls">← Back to polls</Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <Avatar
              url={poll.creator?.avatar_url}
              username={poll.creator?.username || "Anonymous"}
              size="md"
            />
            <div>
              <div className="text-sm font-medium">
                {poll.creator?.username || "Anonymous"}
              </div>
              <div className="text-xs text-muted-foreground">
                {formattedDate}
              </div>
            </div>
            <span className="ml-auto bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
              {poll.category}
            </span>
          </div>
          <CardTitle className="text-2xl">{poll.title}</CardTitle>
          {poll.description && (
            <CardDescription className="text-base mt-2">
              {poll.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {hasVoted || !user ? (
                <PollResults
                  pollId={poll.id}
                  initialOptions={optionsWithVotes}
                />
              ) : (
                <PollVoting
                  pollId={poll.id}
                  options={poll.options ?? []}
                  hasVoted={hasVoted}
                  onVoted={() => {}}
                />
              )}
            </div>

            {!hasVoted && !user && (
              <Card className="bg-primary/5 border-primary/10">
                <CardContent className="p-4">
                  <p>
                    <Link
                      href="/login"
                      className="font-medium text-primary underline"
                    >
                      Log in
                    </Link>{" "}
                    to cast your vote.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex-col items-start border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Comments</h3>
          <div className="w-full">
            <CommentSection
              pollId={poll.id}
              initialComments={comments || []}
              currentUser={userProfile}
            />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
