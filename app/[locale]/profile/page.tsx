import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Poll } from "@/types";

export default async function ProfilePage() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if no user
  if (!user) {
    redirect("/login");
  }

  // Fetch user details
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
  }

  // Fetch user's polls
  const { data: userPolls, error: pollsError } = await supabase
    .from("polls")
    .select(
      `
      *,
      stats:poll_stats(vote_count, comment_count)
    `,
    )
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (pollsError) {
    console.error("Error fetching user polls:", pollsError);
  }

  // Fetch user's votes
  const { data: userVotes, error: votesError } = await supabase
    .from("votes")
    .select(
      `
      *,
      poll:polls(id, title),
      option:poll_options(text)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (votesError) {
    console.error("Error fetching user votes:", votesError);
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center mb-6">
          <Avatar
            url={profile?.avatar_url}
            username={profile?.username || user.email?.split("@")[0] || "User"}
            size="lg"
          />
          <div className="ml-4">
            <h1 className="text-2xl font-bold">
              {profile?.display_name ||
                profile?.username ||
                user.email?.split("@")[0] ||
                "User"}
            </h1>
            <p className="text-gray-600">
              {profile?.username ? `@${profile.username}` : ""}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Member since{" "}
              {new Date(
                profile?.created_at || user.created_at || Date.now(),
              ).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            href="/profile/settings"
            className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">My Polls</h2>
          {userPolls && userPolls.length > 0 ? (
            <div className="space-y-4">
              {userPolls.map((poll: Poll) => (
                <Link href={`/polls/${poll.id}`} key={poll.id}>
                  <div className="p-4 border border-gray-200 rounded-md hover:border-gray-300 transition">
                    <h3 className="font-medium">{poll.title}</h3>
                    <div className="flex justify-between mt-2 text-sm text-gray-500">
                      <span>{poll.stats?.vote_count || 0} votes</span>
                      <span>
                        {new Date(poll.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">You haven&apos;t created any polls yet.</p>
          )}

          <div className="mt-6">
            <Link
              href="/polls/create"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Create a Poll
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">My Votes</h2>
          {userVotes && userVotes.length > 0 ? (
            <div className="space-y-4">
              {userVotes.map((vote) => (
                <Link href={`/polls/${vote.poll_id}`} key={vote.id}>
                  <div className="p-4 border border-gray-200 rounded-md hover:border-gray-300 transition">
                    <h3 className="font-medium">{vote.poll?.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      You voted: {vote.option?.text}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(vote.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">You haven&apos;t voted on any polls yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
