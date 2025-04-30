'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@/lib/supabase/client';
import type { PollOption } from '@/types';

interface PollResultsProps {
  pollId: string;
  initialOptions: (PollOption & { votes: number })[];
}

export function PollResults({ 
  pollId, 
  initialOptions 
}: PollResultsProps) {
  const [options, setOptions] = useState(initialOptions);
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    // Subscribe to realtime votes
    const channel = supabase
      .channel(`poll:${pollId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `poll_id=eq.${pollId}`
        },
        (payload) => {
          // Update the vote count for the option
          setOptions(currentOptions => 
            currentOptions.map(option => 
              option.id === payload.new.option_id
                ? { ...option, votes: option.votes + 1 }
                : option
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'votes',
          filter: `poll_id=eq.${pollId}`
        },
        (payload) => {
          // Handle vote updates (switching from one option to another)
          setOptions(currentOptions => 
            currentOptions.map(option => {
              if (option.id === payload.new.option_id) {
                return { ...option, votes: option.votes + 1 };
              }
              if (option.id === payload.old.option_id) {
                return { ...option, votes: Math.max(0, option.votes - 1) };
              }
              return option;
            })
          );
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId, supabase]);
  
  // Calculate total votes
  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Results</h3>
      <div className="space-y-3">
        {options.map(option => {
          const percentage = totalVotes > 0 
            ? Math.round((option.votes / totalVotes) * 100) 
            : 0;
            
          return (
            <div key={option.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{option.text}</span>
                <span>{percentage}%</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${option.position % 2 === 0 ? 'bg-blue-500' : 'bg-indigo-500'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {option.votes} vote{option.votes !== 1 ? 's' : ''}
              </p>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-gray-600">
        Total votes: {totalVotes}
      </p>
    </div>
  );
}