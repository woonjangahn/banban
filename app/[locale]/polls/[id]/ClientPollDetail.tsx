'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { PollResults } from '@/components/polls/PollResults';
import type { Poll, PollOption, Comment, User } from '@/types';

// Dynamically import components to avoid hydration issues
const PollVoting = dynamic(() => import('@/components/polls/PollVoting').then(mod => mod.PollVoting), {
  ssr: false,
});

const CommentSection = dynamic(() => import('@/components/comments/CommentSection').then(mod => mod.CommentSection), {
  ssr: false,
});

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
  hasVoted
}: ClientPollDetailProps) {
  const user = userProfile !== null;

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