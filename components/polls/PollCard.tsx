"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar } from "@/components/ui/Avatar";
import { Poll } from "@/types";
import { useTranslations } from "next-intl";

export default function PollCard({ poll }: { poll: Poll }) {
  const t = useTranslations();

  return (
    <Link href={`/polls/${poll.id}`} className="block h-full">
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Avatar
                url={poll.creator?.avatar_url}
                username={poll.creator?.username || t("comments.anonymous")}
                size="sm"
              />
              <span className="text-sm text-muted-foreground">
                {(poll.creator?.username && `@${poll.creator.username}`) ||
                  t("comments.anonymous")}
              </span>
            </div>
            <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
              {poll.category &&
                t(`common.category.${poll.category.toLowerCase()}`)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <CardTitle className="mb-2 text-lg line-clamp-2">
            {poll.title}
          </CardTitle>
          {poll.description && (
            <CardDescription className="line-clamp-2 mb-2">
              {poll.description}
            </CardDescription>
          )}
        </CardContent>
        <CardFooter className="border-t pt-3 flex justify-between text-xs text-muted-foreground">
          <span>
            {t("poll.totalVotes", { count: poll.stats?.vote_count || 0 })}
          </span>
          <span>
            {poll.stats?.comment_count || 0} {t("poll.comments")}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
