import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { reactionSchema } from '@/lib/validations/poll';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const validation = reactionSchema.safeParse({
      ...body,
      commentId: params.id
    });
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { reactionType } = validation.data;
    const supabase = createRouteHandlerClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user already reacted to this comment
    const { data: existingReaction } = await supabase
      .from('comment_reactions')
      .select('id, reaction_type')
      .eq('comment_id', params.id)
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (existingReaction) {
      return NextResponse.json(
        { error: 'You have already reacted to this comment' },
        { status: 400 }
      );
    }
    
    // Create the reaction
    const { data: reaction, error } = await supabase
      .from('comment_reactions')
      .insert({
        comment_id: params.id,
        user_id: user.id,
        reaction_type: reactionType
      })
      .select()
      .single();
      
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ reaction });
  } catch (error) {
    console.error('Error creating reaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const validation = reactionSchema.safeParse({
      ...body,
      commentId: params.id
    });
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { reactionType } = validation.data;
    const supabase = createRouteHandlerClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user has a reaction to update
    const { data: existingReaction } = await supabase
      .from('comment_reactions')
      .select('id')
      .eq('comment_id', params.id)
      .eq('user_id', user.id)
      .single();
      
    if (!existingReaction) {
      return NextResponse.json(
        { error: 'No reaction found to update' },
        { status: 404 }
      );
    }
    
    // Update the reaction
    const { data: reaction, error } = await supabase
      .from('comment_reactions')
      .update({ reaction_type: reactionType })
      .eq('id', existingReaction.id)
      .select()
      .single();
      
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ reaction });
  } catch (error) {
    console.error('Error updating reaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const supabase = createRouteHandlerClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Delete the reaction
    const { error } = await supabase
      .from('comment_reactions')
      .delete()
      .eq('comment_id', params.id)
      .eq('user_id', user.id);
      
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}