'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 数据库返回的数据结构
interface DbPrompt {
  id: string;
  category: string;
  prompt: string;
  effect: string;
  imageurl?: string;
  sourceurl: string;
  iscode?: boolean;
  createdat?: string;
  aimodel?: string;
}

// 定义数据类型
type PromptCard = {
  id: string;
  category: string;
  prompt: string;
  effect: string;
  imageUrl?: string;
  sourceUrl: string;
  isCode?: boolean;
  createdAt?: string;
  aiModel?: string;
};

// 分类映射
const categoryMap: { [key: string]: { label: string; tagClass: string } } = {
  'all': { label: '全部', tagClass: '' },
  'text': { label: '文本类', tagClass: 'tag-text' },
  'image': { label: '作图类', tagClass: 'tag-image' },
  'media': { label: '自媒体素材', tagClass: 'tag-media' },
  'creative': { label: '创作类', tagClass: 'tag-creative' },
  'code': { label: '编程类', tagClass: 'tag-code' },
  'general': { label: '通用类', tagClass: 'tag-general' },
};

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [prompts, setPrompts] = useState<PromptCard[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<PromptCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // 检查是否管理员访问模式
  useEffect(() => {
    // 检查URL中是否包含特定查询参数
    const searchParams = new URLSearchParams(window.location.search);
    const adminToken = searchParams.get('adminToken');
    
    // 检查adminToken是否匹配特定值(简单示例，实际应用请使用更强的验证)
    if (adminToken === 'aiPrompts2024') {
      setIsAdmin(true);
      // 移除URL中的查询参数，以免暴露管理员令牌
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 加载数据
  useEffect(() => {
    async function fetchPrompts() {
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = `/api/prompts${activeFilter !== 'all' ? `?category=${activeFilter}` : ''}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('获取数据失败');
        }
        
        const data = await response.json();
        
        // 转换字段名为驼峰式
        const formattedPrompts = data.prompts.map((item: DbPrompt) => ({
          id: item.id,
          category: item.category,
          prompt: item.prompt,
          effect: item.effect,
          imageUrl: item.imageurl,
          sourceUrl: item.sourceurl,
          isCode: item.iscode,
          createdAt: item.createdat,
          aiModel: item.aimodel
        }));
        
        setPrompts(formattedPrompts);
        setFilteredPrompts(formattedPrompts);
      } catch (err) {
        console.error('Error fetching prompts:', err);
        setError('获取案例数据失败，请稍后再试');
        
        // 开发环境下使用模拟数据
        if (process.env.NODE_ENV === 'development') {
          const demoPrompts = [
            {
              id: '1',
              category: 'image',
              prompt: 'A futuristic cityscape at sunset, cyberpunk style, neon lights reflecting on wet streets, high detail, photorealistic, 8K.',
              effect: '',
              imageUrl: 'https://placehold.co/600x400/cccccc/888888?text=效果图片',
              sourceUrl: '#',
              aiModel: 'Midjourney',
            },
            {
              id: '2',
              category: 'text',
              prompt: 'Summarize the following article into three key bullet points: [Article Text Placeholder]',
              effect: `效果文本会显示在这里...\n• 要点 1\n• 要点 2\n• 要点 3`,
              sourceUrl: '#',
              aiModel: 'Claude',
            },
            {
              id: '3',
              category: 'code',
              prompt: 'Write a Python function that takes a list of integers and returns the sum of all even numbers in the list.',
              effect: `def sum_even_numbers(numbers):
    total = 0
    for num in numbers:
        if num % 2 == 0:
            total += num
    return total

# Example usage:
my_list = [1, 2, 3, 4, 5, 6]
print(sum_even_numbers(my_list)) # Output: 12`,
              sourceUrl: '#',
              isCode: true,
              aiModel: 'ChatGPT',
            },
            {
              id: '4',
              category: 'creative',
              prompt: 'Write a short story opening about a detective discovering a mysterious object in a dusty attic.',
              effect: `效果文本会显示在这里...\n\n阳光透过布满灰尘的天窗，投下斑驳的光柱。侦探哈里斯用手帕捂住口鼻，小心翼翼地拨开蛛网。在阁楼的角落，一个覆盖着天鹅绒布的箱子引起了他的注意...`,
              sourceUrl: '#',
              aiModel: '文心一言',
            },
          ];
          setPrompts(demoPrompts);
          setFilteredPrompts(demoPrompts.filter(p => activeFilter === 'all' || p.category === activeFilter));
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchPrompts();
  }, [activeFilter]);

  // 筛选器更新时过滤数据
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredPrompts(prompts);
    } else {
      setFilteredPrompts(prompts.filter(card => card.category === activeFilter));
    }
  }, [activeFilter, prompts]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Prompt 工程案例库</h1>
        <p className="text-gray-600 mt-2">收集和展示优秀的 Prompt 案例</p>
      </header>

      <nav className="mb-8 flex flex-wrap justify-center gap-2">
        {Object.entries(categoryMap).map(([key, { label }]) => (
          <button
            key={key}
            className={`filter-btn px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 shadow-sm ${activeFilter === key ? 'active' : ''}`}
            onClick={() => setActiveFilter(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      ) : filteredPrompts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无相关案例</p>
        </div>
      ) : (
        <main id="prompt-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((card) => (
            <div
              key={card.id}
              className="prompt-card bg-white p-6 rounded-lg shadow border border-gray-200 flex flex-col"
              data-category={card.category}
            >
              <div className="flex flex-wrap mb-4">
                <span className={`inline-block ${categoryMap[card.category].tagClass} text-xs font-medium px-2.5 py-0.5 rounded-full mr-2`}>
                  {categoryMap[card.category].label}
                </span>
                
                {card.aiModel && (
                  <span className={`inline-block ai-${card.aiModel} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                    {card.aiModel}
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Prompt:</h3>
              <p className="text-gray-600 mb-4 flex-grow">{card.prompt}</p>
              
              <h3 className="text-lg font-semibold mb-2 text-gray-900">效果预览:</h3>
              
              {card.isCode ? (
                <div className="mb-4 p-4 bg-gray-900 text-white rounded font-mono text-sm overflow-x-auto">
                  <pre><code>{card.effect}</code></pre>
                </div>
              ) : card.imageUrl ? (
                <div className="mb-4 bg-gray-200 rounded aspect-video flex items-center justify-center">
                  <Image 
                    src={card.imageUrl} 
                    alt="效果图片" 
                    className="w-full h-full object-cover rounded" 
                    width={600}
                    height={400}
                  />
                </div>
              ) : (
                <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700 whitespace-pre-line">
                  {card.effect}
                </div>
              )}
              
              <div className="mt-auto">
                <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                  来源链接 &rarr;
                </a>
              </div>
            </div>
          ))}
        </main>
      )}

      <footer className="mt-12 py-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} AI Prompts Hub | aipromptshub.art</p>
        <div className="mt-2">
          {isAdmin && (
            <Link href="/admin" className="text-blue-600 hover:underline">管理入口</Link>
          )}
        </div>
      </footer>
    </div>
  );
}
