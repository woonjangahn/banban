import { z } from 'zod';

export const createPollSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().min(1),
  options: z.array(
    z.object({
      text: z.string().min(1).max(200),
      position: z.number().int().min(0)
    })
  ).min(2).max(5)
});

export const voteSchema = z.object({
  optionId: z.string().uuid()
});

export const commentSchema = z.object({
  content: z.string().min(1).max(1000),
  pollId: z.string().uuid(),
  parentId: z.string().uuid().optional()
});

export const reactionSchema = z.object({
  commentId: z.string().uuid(),
  reactionType: z.enum(['upvote', 'downvote'])
});

export type CreatePollInput = z.infer<typeof createPollSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type ReactionInput = z.infer<typeof reactionSchema>;