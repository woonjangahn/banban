import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Poll, PollOption, User } from "@/types";
import { ClientPollDetail } from "./ClientPollDetail";

export default async function PollDetailPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const id = params.id;
  const supabase = await createClient();

  // Fetch poll data
  const { data: poll, error } = await supabase
    .from("polls")
    .select(
      `
      *,
      options:poll_options(*),
      creator:users!created_by(username, avatar_url),
      stats:poll_stats!poll_id(vote_count, comment_count)
    `,
    )
    .eq("id", id)
    .single();

  if (error || !poll) {
    console.error("Error fetching poll:", error);
    return notFound();
  }

  // Fetch comments with pagination
  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select(
      `
      *,
      user:users(username, avatar_url),
      reactions:comment_reactions(*)
    `,
    )
    .eq("poll_id", id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(20);

  if (commentsError) {
    console.error("Error fetching comments:", commentsError);
  }

  // Fetch vote counts for each option
  const { data: voteData, error: voteError } = await supabase.rpc(
    "get_vote_counts_by_option",
    { poll_id_param: id },
  );

  if (voteError) {
    console.error("Error fetching vote counts:", voteError);
  }

  // Add vote counts to options
  const optionsWithVotes = poll.options.map((option: PollOption) => {
    const voteCount =
      voteData?.find((v) => v.option_id === option.id)?.count || 0;
    return {
      ...option,
      votes: parseInt(voteCount),
    };
  });

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user profile if logged in
  let userProfile: User | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      userProfile = profile;
    }
  }

  // Check if user has voted
  let hasVoted = false;
  if (user) {
    const { data: userVote } = await supabase
      .from("votes")
      .select("id")
      .eq("poll_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    hasVoted = !!userVote;
  }

  return (
    <ClientPollDetail
      poll={poll}
      optionsWithVotes={optionsWithVotes}
      comments={comments || []}
      userProfile={userProfile}
      hasVoted={hasVoted}
    />
  );
}
