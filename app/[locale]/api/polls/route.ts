import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createPollSchema } from '@/lib/validations/poll';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createPollSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { title, description, category, options } = validation.data;
    const supabase = createRouteHandlerClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Create the poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title,
        description,
        category,
        created_by: user.id,
        is_active: true
      })
      .select()
      .single();
      
    if (pollError) {
      return NextResponse.json(
        { error: pollError.message },
        { status: 400 }
      );
    }
    
    // Create the poll options
    const pollOptions = options.map(option => ({
      poll_id: poll.id,
      text: option.text,
      position: option.position
    }));
    
    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(pollOptions);
      
    if (optionsError) {
      // If options creation fails, try to clean up the poll
      await supabase.from('polls').delete().eq('id', poll.id);
      
      return NextResponse.json(
        { error: optionsError.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      poll
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}