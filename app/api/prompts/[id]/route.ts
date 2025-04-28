import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    
    const dbUpdates = {
      category: updates.category,
      title: updates.title,
      prompt: updates.prompt,
      effect: updates.effect,
      imageurl: updates.imageurl,
      sourceurl: updates.sourceurl,
      iscode: updates.iscode === true ? true : false,
      aimodel: updates.aimodel
    };
    
    // console.log('更新数据:', JSON.stringify(dbUpdates));
    
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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