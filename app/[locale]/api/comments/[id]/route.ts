import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient();
    
    // Fetch the comment with user and reactions
    const { data: comment, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(username, avatar_url),
        reactions:comment_reactions(reaction_type, count)
      `)
      .eq('id', params.id)
      .single();
      
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Error fetching comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}