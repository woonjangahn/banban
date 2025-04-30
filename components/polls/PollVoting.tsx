"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import type { PollOption } from "@/types";

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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleVote = async () => {
    if (!selectedOption) {
      setError("Please select an option");
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
        throw new Error(data.error || "Failed to vote");
      }

      // Refresh the page to show results
      router.refresh();
      onVoted();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to vote");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasVoted) {
    return null; // Don't show voting options if user has voted
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Cast Your Vote</h3>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}

      <div className="space-y-2">
        {options.map((option) => (
          <div
            key={option.id}
            className={`p-3 border rounded-md cursor-pointer transition-colors ${
              selectedOption === option.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:bg-gray-50"
            }`}
            onClick={() => setSelectedOption(option.id)}
          >
            <div className="flex items-center">
              <div
                className={`w-4 h-4 rounded-full border ${
                  selectedOption === option.id
                    ? "border-blue-500"
                    : "border-gray-400"
                }`}
              >
                {selectedOption === option.id && (
                  <div className="w-2 h-2 m-[3px] rounded-full bg-blue-500" />
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
        Vote
      </Button>
    </div>
  );
}
