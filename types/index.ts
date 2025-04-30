export interface User {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  last_login?: string;
  is_active: boolean;
  preferences?: Record<string, any>;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  category: string;
  created_at: string;
  end_at?: string;
  created_by: string;
  is_active: boolean;
  is_featured: boolean;
  metadata?: Record<string, any>;
  creator?: User;
  options?: PollOption[];
  stats?: PollStats;
}

export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  position: number;
  metadata?: Record<string, any>;
  votes?: number;
}

export interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  created_at: string;
  client_fingerprint?: string;
}

export interface Comment {
  id: string;
  poll_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  created_at: string;
  updated_at?: string;
  is_deleted: boolean;
  user?: User;
  reactions?: CommentReaction[];
}

export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: 'upvote' | 'downvote';
  created_at: string;
}

export interface PollStats {
  poll_id: string;
  vote_count: number;
  comment_count: number;
}