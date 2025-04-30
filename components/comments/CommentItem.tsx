"use client";

import { useCallback, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { CommentReplyForm } from "./CommentReplyForm";
import type { Comment, User } from "@/types";

interface CommentItemProps {
  comment: Comment & { user?: User };
  currentUser: User | null;
  pollId: string;
  onReplyAdded: (comment: Comment) => void;
}

export function CommentItem({
  comment,
  currentUser,
  pollId,
  onReplyAdded,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [upvotes, setUpvotes] = useState(
    comment.reactions?.filter((r) => r.reaction_type === "upvote").length || 0,
  );
  const [downvotes, setDownvotes] = useState(
    comment.reactions?.filter((r) => r.reaction_type === "downvote").length ||
      0,
  );
  const [userReaction, setUserReaction] = useState<
    "upvote" | "downvote" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReaction = async (reactionType: "upvote" | "downvote") => {
    if (!currentUser || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // If user already reacted with the same type, remove the reaction
      if (userReaction === reactionType) {
        await fetch(`/api/comments/${comment.id}/reactions`, {
          method: "DELETE",
        });

        if (reactionType === "upvote") {
          setUpvotes((prev) => Math.max(0, prev - 1));
        } else {
          setDownvotes((prev) => Math.max(0, prev - 1));
        }

        setUserReaction(null);
      }
      // If user already reacted with the other type, switch the reaction
      else if (userReaction) {
        await fetch(`/api/comments/${comment.id}/reactions`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reactionType }),
        });

        if (reactionType === "upvote") {
          setUpvotes((prev) => prev + 1);
          setDownvotes((prev) => Math.max(0, prev - 1));
        } else {
          setDownvotes((prev) => prev + 1);
          setUpvotes((prev) => Math.max(0, prev - 1));
        }

        setUserReaction(reactionType);
      }
      // If user hasn't reacted yet, add a new reaction
      else {
        await fetch(`/api/comments/${comment.id}/reactions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reactionType }),
        });

        if (reactionType === "upvote") {
          setUpvotes((prev) => prev + 1);
        } else {
          setDownvotes((prev) => prev + 1);
        }

        setUserReaction(reactionType);
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = useCallback(
    (newComment: Comment) => {
      setShowReplyForm(false);
      onReplyAdded(newComment);
    },
    [onReplyAdded],
  );

  return (
    <div className="border-b border-gray-100 py-4 last:border-0">
      <div className="flex gap-3">
        <Avatar
          url={comment.user?.avatar_url}
          username={comment.user?.username || "Anonymous"}
          size="sm"
        />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {comment.user?.username || "Anonymous"}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(comment.created_at).toLocaleDateString()}
              {comment.updated_at && " (edited)"}
            </span>
          </div>

          <p className="mt-1 text-gray-800">{comment.content}</p>

          <div className="mt-2 flex items-center gap-4 text-sm">
            <button
              onClick={() => handleReaction("upvote")}
              disabled={!currentUser || isSubmitting}
              className={`flex items-center gap-1 ${userReaction === "upvote" ? "text-green-600" : "text-gray-500"} hover:text-green-600`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z" />
              </svg>
              <span>{upvotes}</span>
            </button>

            <button
              onClick={() => handleReaction("downvote")}
              disabled={!currentUser || isSubmitting}
              className={`flex items-center gap-1 ${userReaction === "downvote" ? "text-red-600" : "text-gray-500"} hover:text-red-600`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z" />
              </svg>
              <span>{downvotes}</span>
            </button>

            {currentUser && (
              <button
                onClick={() => setShowReplyForm((prev) => !prev)}
                className="text-gray-500 hover:text-blue-600"
              >
                Reply
              </button>
            )}
          </div>

          {showReplyForm && currentUser && (
            <div className="mt-3">
              <CommentReplyForm
                pollId={pollId}
                parentId={comment.id}
                onSubmit={handleReplySubmit}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
