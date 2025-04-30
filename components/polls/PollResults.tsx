"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { PollOption } from "@/types";

interface PollResultsProps {
  pollId: string;
  initialOptions: (PollOption & { votes: number })[];
}

export function PollResults({ pollId, initialOptions }: PollResultsProps) {
  const [options, setOptions] = useState(initialOptions);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Subscribe to realtime votes
    const channel = supabase
      .channel(`poll:${pollId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `poll_id=eq.${pollId}`,
        },
        (payload) => {
          // Update the vote count for the option
          setOptions((currentOptions) =>
            currentOptions.map((option) =>
              option.id === payload.new.option_id
                ? { ...option, votes: option.votes + 1 }
                : option,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "votes",
          filter: `poll_id=eq.${pollId}`,
        },
        (payload) => {
          // Handle vote updates (switching from one option to another)
          setOptions((currentOptions) =>
            currentOptions.map((option) => {
              if (option.id === payload.new.option_id) {
                return { ...option, votes: option.votes + 1 };
              }
              if (option.id === payload.old.option_id) {
                return { ...option, votes: Math.max(0, option.votes - 1) };
              }
              return option;
            }),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId, supabase]);

  // Calculate total votes
  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);

  // Generate colors based on position for more consistency
  const getBarColor = (position: number) => {
    const colors = [
      "bg-primary", 
      "bg-blue-500",
      "bg-indigo-500",
      "bg-violet-500",
      "bg-fuchsia-500",
      "bg-pink-500"
    ];
    
    return colors[position % colors.length];
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Results</h3>
      <div className="space-y-4">
        {options.map((option) => {
          const percentage =
            totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

          return (
            <div key={option.id} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{option.text}</span>
                <span className="font-semibold">{percentage}%</span>
              </div>
              <div className="bg-secondary h-2.5 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    getBarColor(option.position)
                  )}
                  style={{ width: `${percentage || 1}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {option.votes} vote{option.votes !== 1 ? "s" : ""}
              </p>
            </div>
          );
        })}
      </div>
      <p className="text-sm font-medium text-muted-foreground pt-2 border-t">
        Total votes: {totalVotes}
      </p>
    </div>
  );
}