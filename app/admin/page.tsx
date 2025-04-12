'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// 定义数据类型
type PromptCard = {
  id: string;
  category: string;
  title: string;
  prompt: string;
  effect: string;
  imageUrl?: string;
  sourceUrl: string;
  isCode?: boolean;
  createdAt?: string;
  aiModel?: string;
};

// 分类映射
const categoryMap: { [key: string]: string } = {
  'text': '文本类',
  'image': '作图类',
  'media': '自媒体素材',
  'creative': '创作类',
  'code': '编程类',
  'general': '通用类',
};

// AI模型选项
const aiModels = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Deepseek',
  'Midjourney',
  'Grok',
  '豆包',
  'QWEN',
  '文心一言',
  'Kimi',
  'klingai'
];

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [prompts, setPrompts] = useState<PromptCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<PromptCard>({
    id: '',
    category: 'text',
    title: '',
    prompt: '',
    effect: '',
    sourceUrl: '',
    imageUrl: '',
    isCode: false,
    aiModel: ''
  });

  // 验证管理员身份
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminAuthenticated') === 'true';
    if (isLoggedIn) {
      setAuthenticated(true);
      fetchPrompts();
    }
  }, []);

  // 处理管理员登录
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 简单的密码验证（生产环境应使用更安全的方式）
    if (adminPassword === 'aiPrompts2024Admin') {
      setAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
      fetchPrompts();
    } else {
      setError('密码不正确');
    }
  };

  // 加载数据
  useEffect(() => {
    fetchPrompts();
  }, []);

  async function fetchPrompts() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/prompts');
      
      if (!response.ok) {
        throw new Error('获取数据失败');
      }
      
      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError('获取案例数据失败，请稍后再试');
      
      // 开发环境下使用模拟数据
      if (process.env.NODE_ENV === 'development') {
        setPrompts([
          {
            id: '1',
            category: 'image',
            title: '未命名',
            prompt: 'A futuristic cityscape at sunset, cyberpunk style, neon lights reflecting on wet streets, high detail, photorealistic, 8K.',
            effect: '',
            imageUrl: 'https://placehold.co/600x400/cccccc/888888?text=效果图片',
            sourceUrl: 'https://example.com/1',
            createdAt: new Date().toISOString(),
            aiModel: 'Midjourney'
          },
          {
            id: '2',
            category: 'text',
            title: '未命名',
            prompt: 'Summarize the following article into three key bullet points: [Article Text Placeholder]',
            effect: '效果文本会显示在这里...\n• 要点 1\n• 要点 2\n• 要点 3',
            sourceUrl: 'https://example.com/2',
            createdAt: new Date().toISOString(),
            aiModel: 'Kimi'
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      console.log(`Checkbox ${name} changed to: ${checked}`); // 添加调试日志
      setCurrentPrompt(prev => {
        // 创建新对象并明确设置布尔值
        const updated = { 
          ...prev, 
          [name]: checked 
        };
        console.log('Updated prompt:', updated);
        return updated;
      });
    } else {
      setCurrentPrompt({ ...currentPrompt, [name]: value });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // 确保isCode是布尔值
      const promptToSubmit = {
        ...currentPrompt,
        isCode: currentPrompt.isCode === true
      };
      
      console.log('提交数据:', promptToSubmit);
      
      if (formMode === 'add') {
        // 添加新Prompt
        const response = await fetch('/api/prompts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(promptToSubmit),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '添加失败');
        }
        
        const data = await response.json();
        setPrompts([data.prompt, ...prompts]);
      } else {
        // 更新现有Prompt
        const response = await fetch(`/api/prompts/${promptToSubmit.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(promptToSubmit),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '更新失败');
        }
        
        // 更新本地数据
        const updatedPrompts = prompts.map(p => 
          p.id === promptToSubmit.id ? promptToSubmit : p
        );
        setPrompts(updatedPrompts);
      }
      
      // 重置表单
      resetForm();
    } catch (err: unknown) {
      console.error('Error saving prompt:', err);
      setError(err instanceof Error ? err.message : '保存数据失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个Prompt案例吗？此操作不可撤销。')) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '删除失败');
      }
      
      // 从本地数据中移除
      setPrompts(prompts.filter(p => p.id !== id));
    } catch (err: unknown) {
      console.error('Error deleting prompt:', err);
      setError(err instanceof Error ? err.message : '删除数据失败，请重试');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(prompt: PromptCard) {
    // 确保所有字段都有值，防止undefined
    setCurrentPrompt({
      id: prompt.id || '',
      category: prompt.category || 'text',
      title: prompt.title || '',
      prompt: prompt.prompt || '',
      effect: prompt.effect || '',
      sourceUrl: prompt.sourceUrl || '',
      imageUrl: prompt.imageUrl || '',
      isCode: prompt.isCode === true ? true : false,
      aiModel: prompt.aiModel || ''
    });
    setFormMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setCurrentPrompt({
      id: '',
      category: 'text',
      title: '',
      prompt: '',
      effect: '',
      sourceUrl: '',
      imageUrl: '',
      isCode: false,
      aiModel: ''
    });
    setFormMode('add');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {!authenticated ? (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">管理员登录</h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">管理员密码</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              登录
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-blue-600 hover:underline">返回首页</Link>
          </div>
        </div>
      ) : (
        <>
          <header className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">AI Prompt 案例管理</h1>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    localStorage.removeItem('adminAuthenticated');
                    setAuthenticated(false);
                  }}
                  className="text-red-600 hover:underline"
                >
                  退出登录
                </button>
                <Link href="/" className="text-blue-600 hover:underline">返回首页</Link>
              </div>
            </div>
            <p className="text-gray-600">在这里添加、编辑和删除Prompt案例</p>
          </header>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">{formMode === 'add' ? '添加新案例' : '编辑案例'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select
                    name="category"
                    value={currentPrompt.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={submitting}
                  >
                    {Object.entries(categoryMap).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">来源链接</label>
                  <input
                    type="url"
                    name="sourceUrl"
                    value={currentPrompt.sourceUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                <input
                  type="text"
                  name="title"
                  value={currentPrompt.title || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="如：小红书爆款标题生成、SVG图标生成..."
                  required
                  disabled={submitting}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Prompt 内容</label>
                <textarea
                  name="prompt"
                  value={currentPrompt.prompt}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="输入Prompt内容..."
                  required
                  disabled={submitting}
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">效果展示</label>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name="isCode"
                    checked={currentPrompt.isCode}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <span className="ml-2 text-sm text-gray-600">是代码格式</span>
                </div>
                <textarea
                  name="effect"
                  value={currentPrompt.effect}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={currentPrompt.isCode ? "输入代码..." : "输入效果文本..."}
                  disabled={submitting}
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">图片URL (可选，仅作图类)</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={currentPrompt.imageUrl || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                  disabled={submitting}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">适用AI模型</label>
                <select
                  name="aiModel"
                  value={currentPrompt.aiModel || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                >
                  <option value="">-- 选择AI模型 --</option>
                  {aiModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  disabled={submitting}
                >
                  {submitting ? '处理中...' : formMode === 'add' ? '添加案例' : '保存修改'}
                </button>
                
                {formMode === 'edit' && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={submitting}
                  >
                    取消
                  </button>
                )}
              </div>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">案例列表</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : prompts.length === 0 ? (
              <p className="text-center py-4 text-gray-500">暂无案例，请添加新案例</p>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">添加时间</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {prompts.map((prompt) => (
                      <tr key={prompt.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {categoryMap[prompt.category]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 truncate max-w-xs">{prompt.prompt}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prompt.createdAt ? new Date(prompt.createdAt).toLocaleString('zh-CN') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleEdit(prompt)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            编辑
                          </button>
                          <button 
                            onClick={() => handleDelete(prompt.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 