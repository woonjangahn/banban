import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { commentSchema } from '@/lib/validations/poll';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = commentSchema.safeParse({
      ...body,
      pollId: params.id
    });
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { content, parentId } = validation.data;
    const supabase = createRouteHandlerClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        poll_id: params.id,
        user_id: user.id,
        parent_id: parentId,
        content
      })
      .select(`
        *,
        user:users(username, avatar_url)
      `)
      .single();
      
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const parentId = url.searchParams.get('parentId');
    
    const supabase = createRouteHandlerClient();
    
    // Build the query
    let query = supabase
      .from('comments')
      .select(`
        *,
        user:users(username, avatar_url),
        reactions:comment_reactions(reaction_type, count)
      `)
      .eq('poll_id', params.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Add parent filter if needed
    if (parentId === null) {
      query = query.is('parent_id', null);
    } else if (parentId) {
      query = query.eq('parent_id', parentId);
    }
    
    const { data: comments, error, count } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      comments,
      pagination: {
        total: count || 0,
        offset,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}