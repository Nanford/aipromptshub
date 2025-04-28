import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let query = supabase.from('prompts').select('*');
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query.order('createdat', { ascending: false });
    
    if (error) {
      console.error('Error fetching prompts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ prompts: data });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const promptData = await request.json();
    
    // 转换字段名为小写，并确保iscode是布尔值
    const dbData = {
      category: promptData.category,
      title: promptData.title,
      prompt: promptData.prompt,
      effect: promptData.effect,
      imageurl: promptData.imageurl,
      sourceurl: promptData.sourceurl,
      iscode: promptData.iscode === true ? true : false,
      aimodel: promptData.aimodel,
      createdat: new Date().toISOString()
    };
    
    console.log('创建数据:', JSON.stringify(dbData));
    
    const { data, error } = await supabase
      .from('prompts')
      .insert([dbData])
      .select();
    
    if (error) {
      console.error('Error creating prompt:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // 转换回驼峰式返回给前端
    const responseData = data[0] ? {
      id: data[0].id,
      category: data[0].category,
      title: data[0].title,
      prompt: data[0].prompt,
      effect: data[0].effect || '',
      imageurl: data[0].imageurl || '',
      sourceurl: data[0].sourceurl,
      iscode: data[0].iscode === true,
      aimodel: data[0].aimodel || '',
      createdat: data[0].createdat
    } : null;
    
    return NextResponse.json({ prompt: responseData });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 