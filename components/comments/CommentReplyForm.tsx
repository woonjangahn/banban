"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Comment } from "@/types";

interface CommentReplyFormProps {
  pollId: string;
  parentId: string;
  onSubmit: (comment: Comment) => void;
  onCancel: () => void;
}

export function CommentReplyForm({
  pollId,
  parentId,
  onSubmit,
  onCancel,
}: CommentReplyFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Reply cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/polls/${pollId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          parentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add reply");
      }

      setContent("");
      onSubmit(data.comment);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="p-2 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <textarea
          placeholder="Write a reply..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          maxLength={1000}
          disabled={isSubmitting}
        ></textarea>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="secondary" onClick={onCancel} size="sm">
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting || !content.trim()}
          size="sm"
        >
          Reply
        </Button>
      </div>
    </form>
  );
}
