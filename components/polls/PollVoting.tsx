"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { PollOption } from "@/types";
import { useTranslations } from "next-intl";

interface PollVotingProps {
  pollId: string;
  options: PollOption[];
  hasVoted: boolean;
  onVoted: () => void;
}

export function PollVoting({
  pollId,
  options,
  hasVoted,
  onVoted,
}: PollVotingProps) {
  const t = useTranslations('poll');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleVote = async () => {
    if (!selectedOption) {
      setError(t('selectOptionError'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/polls/${pollId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ optionId: selectedOption }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('voteError'));
      }

      // Refresh the page to show results
      router.refresh();
      onVoted();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('voteError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasVoted) {
    return null; // Don't show voting options if user has voted
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t('castVoteHeading')}</h3>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {options.map((option) => (
          <div
            key={option.id}
            className={cn(
              "p-3 border rounded-md cursor-pointer transition-colors",
              selectedOption === option.id
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-accent"
            )}
            onClick={() => setSelectedOption(option.id)}
          >
            <div className="flex items-center">
              <div
                className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center",
                  selectedOption === option.id
                    ? "border-primary"
                    : "border-muted-foreground"
                )}
              >
                {selectedOption === option.id && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <span className="ml-2">{option.text}</span>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={handleVote}
        isLoading={isSubmitting}
        disabled={!selectedOption || isSubmitting}
        fullWidth
      >
        {t('vote')}
      </Button>
    </div>
  );
}