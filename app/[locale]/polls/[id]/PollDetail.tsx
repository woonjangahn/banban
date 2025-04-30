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
import { PollVoting } from "@/components/polls/PollVoting";
import { CommentSection } from "@/components/comments/CommentSection";
import { getTranslations } from "next-intl/server";

interface PollDetailProps {
  poll: Poll & {
    creator: { username: string; avatar_url: string } | null;
  };
  optionsWithVotes: (PollOption & { votes: number })[];
  comments: Comment[];
  userProfile: User | null;
  hasVoted: boolean;
}

export async function PollDetail({
  poll,
  optionsWithVotes,
  comments,
  userProfile,
  hasVoted,
}: PollDetailProps) {
  const user = userProfile !== null;
  const t = await getTranslations();

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
          <Link href="/polls">{t("poll.backToPolls")}</Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <Avatar
              url={poll.creator?.avatar_url}
              username={poll.creator?.username || t("comments.anonymous")}
              size="md"
            />
            <div>
              <div className="text-sm font-medium">
                {poll.creator?.username || t("comments.anonymous")}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("poll.detail.createdOn", { date: formattedDate })}
              </div>
            </div>
            <span className="ml-auto bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
              {poll.category &&
                t(`common.category.${poll.category.toLowerCase()}`)}
            </span>
          </div>
          <CardTitle className="text-2xl">{poll.title}</CardTitle>
          {poll.description && (
            <CardDescription className="whitespace-pre-wrap text-base mt-2">
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
                      {t("common.login")}
                    </Link>{" "}
                    {t("poll.loginToVote")}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex-col items-start border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">{t("poll.comments")}</h3>
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
