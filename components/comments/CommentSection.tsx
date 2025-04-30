"use client";

import { useCallback, useEffect, useState } from "react";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import { Button } from "@/components/ui/Button";
import type { Comment, User } from "@/types";
import { createClientComponentClient } from "@/lib/supabase/client";

interface CommentSectionProps {
  pollId: string;
  initialComments: Comment[];
  currentUser: User | null;
}

export function CommentSection({
  pollId,
  initialComments,
  currentUser,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialComments?.length === 20);

  const fetchMoreComments = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const offset = page * 20;
      const response = await fetch(
        `/polls/${pollId}/comments?offset=${offset}&limit=20`,
      );
      const data = await response.json();

      if (data.comments.length === 0) {
        setHasMore(false);
      } else {
        setComments((prev) => [...prev, ...data.comments]);
        setPage((prev) => prev + 1);
        setHasMore(data.comments.length === 20);
      }
    } catch (error) {
      console.error("Error fetching more comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewComment = useCallback((comment: Comment) => {
    // Add the new comment to the top of the list
    setComments((prev) => [comment, ...prev]);
  }, []);

  const handleNewReply = useCallback((reply: Comment) => {
    // Add the reply to the nested comments structure
    // In a real app, you would fetch the updated comments or handle the nesting better
    setComments((prev) => [reply, ...prev]);
  }, []);

  // Setup realtime updates for comments
  useEffect(() => {
    const supabase = createClientComponentClient();

    const channel = supabase
      .channel(`poll:${pollId}:comments`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `poll_id=eq.${pollId}`,
        },
        (payload) => {
          // Skip comments we added manually to avoid duplicates
          if (comments.some((c) => c.id === payload.new.id)) {
            return;
          }

          // Fetch the full comment data including user info
          fetch(`/api/comments/${payload.new.id}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.comment) {
                setComments((prev) => [data.comment, ...prev]);
              }
            })
            .catch((err) => console.error("Error fetching new comment:", err));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId, comments]);

  return (
    <div className="space-y-6 w-full">
      {currentUser && (
        <div className="mb-6">
          <CommentForm pollId={pollId} onSubmit={handleNewComment} />
        </div>
      )}

      {comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No comments yet. {currentUser ? "Be the first to comment!" : "Login to comment."}
          </p>
        </div>
      ) : (
        <div className="space-y-4 divide-y divide-border">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              pollId={pollId}
              onReplyAdded={handleNewReply}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={fetchMoreComments}
            isLoading={isLoading}
            disabled={isLoading}
            size="sm"
          >
            Load More Comments
          </Button>
        </div>
      )}
    </div>
  );
}