import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const updates = await request.json();
    
    const dbUpdates = {
      category: updates.category,
      prompt: updates.prompt,
      effect: updates.effect,
      imageurl: updates.imageUrl,
      sourceurl: updates.sourceUrl,
      iscode: updates.isCode,
      aimodel: updates.aiModel
    };
    
    const { error } = await supabase
      .from('prompts')
      .update(dbUpdates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating prompt:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting prompt:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 