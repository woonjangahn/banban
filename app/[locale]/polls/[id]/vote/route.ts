import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { voteSchema } from '@/lib/validations/poll';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const validation = voteSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { optionId } = validation.data;
    const supabase = createRouteHandlerClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', params.id)
      .eq('user_id', user.id)
      .single();
      
    if (existingVote) {
      // Update existing vote
      const { error } = await supabase
        .from('votes')
        .update({ option_id: optionId })
        .eq('id', existingVote.id);
        
      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    } else {
      // Create new vote
      const { error } = await supabase
        .from('votes')
        .insert({
          poll_id: params.id,
          option_id: optionId,
          user_id: user.id
        });
        
      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}