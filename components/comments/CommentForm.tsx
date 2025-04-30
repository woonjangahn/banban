"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Comment } from "@/types";
import { useTranslations } from "next-intl";

interface CommentFormProps {
  pollId: string;
  onSubmit: (comment: Comment) => void;
}

export function CommentForm({ pollId, onSubmit }: CommentFormProps) {
  const t = useTranslations('comments');
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError(t('emptyError'));
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
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('submitError'));
      }

      setContent("");
      onSubmit(data.comment);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="comment" className="sr-only">
          {t('label')}
        </label>
        <textarea
          id="comment"
          placeholder={t('placeholder')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input bg-background"
          rows={3}
          maxLength={1000}
          disabled={isSubmitting}
        ></textarea>
        <div className="text-xs text-muted-foreground mt-1 text-right">
          {t('charCount', { count: content.length, max: 1000 })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting || !content.trim()}
        >
          {t('submit')}
        </Button>
      </div>
    </form>
  );
}