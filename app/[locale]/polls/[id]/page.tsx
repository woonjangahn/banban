import { createServerComponentClient } from '@/lib/supabase/server';
import { Avatar } from '@/components/ui/Avatar';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PollResults } from '@/components/polls/PollResults';
import dynamic from 'next/dynamic';
import type { Poll, PollOption, Comment, User } from '@/types';

// Dynamically import components to avoid hydration issues
const PollVoting = dynamic(() => import('@/components/polls/PollVoting').then(mod => mod.PollVoting), {
  ssr: false,
});

const CommentSection = dynamic(() => import('@/components/comments/CommentSection').then(mod => mod.CommentSection), {
  ssr: false,
});

export default async function PollDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const supabase = createServerComponentClient();
  
  // Fetch poll data
  const { data: poll, error } = await supabase
    .from('polls')
    .select(`
      *,
      options:poll_options(*),
      creator:users(username, avatar_url),
      stats:poll_stats(vote_count, comment_count)
    `)
    .eq('id', params.id)
    .single();
    
  if (error || !poll) {
    console.error('Error fetching poll:', error);
    return notFound();
  }
    
  // Fetch comments with pagination
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select(`
      *,
      user:users(username, avatar_url),
      reactions:comment_reactions(reaction_type, count)
    `)
    .eq('poll_id', params.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(20);
    
  if (commentsError) {
    console.error('Error fetching comments:', commentsError);
  }

  // Fetch vote counts for each option
  const { data: voteData, error: voteError } = await supabase
    .from('votes')
    .select('option_id, count')
    .eq('poll_id', params.id)
    .group('option_id');
    
  if (voteError) {
    console.error('Error fetching vote counts:', voteError);
  }
  
  // Add vote counts to options
  const optionsWithVotes = poll.options.map((option: PollOption) => {
    const voteCount = voteData?.find(v => v.option_id === option.id)?.count || 0;
    return {
      ...option,
      votes: parseInt(voteCount)
    };
  });

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch user profile if logged in
  let userProfile: User | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profile) {
      userProfile = profile;
    }
  }
  
  // Check if user has voted
  let hasVoted = false;
  if (user) {
    const { data: userVote } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', params.id)
      .eq('user_id', user.id)
      .maybeSingle();
      
    hasVoted = !!userVote;
  }

  return (
    <div className="container mx-auto p-6">
      <Link href="/polls" className="text-blue-500 hover:underline mb-8 block">
        ← Back to polls
      </Link>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">{poll.title}</h1>
        
        {poll.description && (
          <p className="text-gray-700 mb-6">{poll.description}</p>
        )}
        
        <div className="flex items-center mb-6">
          <Avatar 
            url={poll.creator?.avatar_url} 
            username={poll.creator?.username || 'Anonymous'} 
            size="sm"
          />
          <span className="ml-2 text-sm text-gray-600">
            Created by {poll.creator?.username || 'Anonymous'} • {new Date(poll.created_at).toLocaleDateString()}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div className="space-y-6">
            {hasVoted || !user ? (
              <PollResults 
                pollId={poll.id} 
                initialOptions={optionsWithVotes} 
              />
            ) : (
              <PollVoting 
                pollId={poll.id} 
                options={poll.options} 
                hasVoted={hasVoted}
                onVoted={() => {}} 
              />
            )}
          </div>
          
          {!hasVoted && !user && (
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-blue-800">
                <Link href="/login" className="font-medium underline">Log in</Link> to cast your vote.
              </p>
            </div>
          )}
        </div>
        
        <div className="py-4 border-t">
          <CommentSection 
            pollId={poll.id}
            initialComments={comments || []}
            currentUser={userProfile}
          />
        </div>
      </div>
    </div>
  );
}