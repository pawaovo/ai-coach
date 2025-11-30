
import React, { useState } from 'react';
import { Heart, Plus, Send, X, Eye, MessageCircle } from 'lucide-react';
import { WaterfallPost } from '../types';

// Updated Categories with layout positioning for the scattered effect
const CATEGORIES = [
    { id: 'all', label: '全部', position: 'top-2 left-6 -rotate-6 scale-110' },
    { id: 'love', label: '爱情', position: 'top-14 left-[20%] -rotate-12' },
    { id: 'academic', label: '学业', position: 'top-20 left-[42%] rotate-6 scale-105' },
    { id: 'job', label: '就业', position: 'top-4 right-[12%] rotate-6' },
    { id: 'higher_edu', label: '升学', position: 'top-20 right-[8%] -rotate-3' },
    { id: 'rant', label: '吐槽', position: 'top-32 left-[32%] -rotate-2' },
    { id: 'part_time', label: '兼职', position: 'top-36 left-[8%] rotate-12' },
    { id: 'wish', label: '许愿', position: 'top-32 right-[20%] rotate-12' },
];

// Mock Data
const MOCK_POSTS: WaterfallPost[] = [
    { id: '1', title: '我想家了', content: '想念家里的红烧肉了... 食堂的饭虽然不错，但总少了一种味道。', views: 120, likes: 8, dislikes: 0, category: 'rant', timestamp: new Date(), bgColor: 'bg-rose-50' },
    { id: '2', title: '关于那个窗边的男生', content: '图书馆二楼，每天坐窗边的男生，穿白色卫衣的那个，暗恋你很久了，不敢说话。如果你看到了，能不能...', views: 2300, likes: 20, dislikes: 0, category: 'love', timestamp: new Date(), bgColor: 'bg-pink-50' },
    { id: '3', title: '一切都会过去的', content: '大家考试周加油啊！', views: 890, likes: 5, dislikes: 0, category: 'academic', timestamp: new Date(), bgColor: 'bg-blue-50' },
    { id: '4', title: '有的努力都值得！', content: '感谢师兄师姐的内推和帮助，还愿！', views: 1205, likes: 45, dislikes: 2, category: 'job', timestamp: new Date(), bgColor: 'bg-green-50' },
    { id: '5', title: '救命，这个Bug怎么修', content: '已经在实验室待了48小时了，谁来救救孩子。', views: 400, likes: 12, dislikes: 0, category: 'academic', timestamp: new Date(), bgColor: 'bg-indigo-50' },
    { id: '6', title: '北邮的夕阳好美', content: '今天下课路过主楼，拍到了绝美的晚霞。', views: 560, likes: 67, dislikes: 0, category: 'all', timestamp: new Date(), bgColor: 'bg-orange-50' },
];

export const WaterfallPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [newPostContent, setNewPostContent] = useState({ title: '', content: '' });

  const filteredPosts = activeCategory === 'all' 
    ? posts 
    : posts.filter(p => p.category === activeCategory);

  const handlePost = () => {
      if(!newPostContent.title || !newPostContent.content) return;
      const newPost: WaterfallPost = {
          id: Date.now().toString(),
          title: newPostContent.title,
          content: newPostContent.content,
          views: 0,
          likes: 0,
          dislikes: 0,
          category: activeCategory === 'all' ? 'rant' : activeCategory,
          timestamp: new Date(),
          bgColor: 'bg-white'
      };
      setPosts([newPost, ...posts]);
      setIsComposeOpen(false);
      setNewPostContent({ title: '', content: '' });
  };

  return (
      <div className="h-full pt-10 px-4 pb-24 max-w-2xl mx-auto overflow-y-auto scrollbar-hide relative">
          {/* Header */}
          <div className="text-center mb-2 relative z-10">
              <h2 className="text-3xl font-serif font-bold text-gray-800 tracking-wide italic">大声哔哔</h2>
          </div>

          {/* Categories Scatter Layout */}
          <div className="relative h-48 w-full mb-4 mx-auto max-w-sm">
              {CATEGORIES.map(cat => (
                  <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`
                          absolute px-5 py-2.5 rounded-[2rem] text-sm font-bold transition-all duration-300 shadow-sm border border-white/40
                          ${cat.position}
                          ${activeCategory === cat.id 
                              ? 'bg-gray-800 text-white z-20 scale-110 shadow-lg' 
                              : 'bg-white/60 backdrop-blur-sm text-gray-600 hover:bg-white/80 hover:scale-105 z-10'}
                      `}
                  >
                      {cat.label}
                  </button>
              ))}
          </div>

          {/* Waterfall Grid (Columns) */}
          <div className="columns-2 gap-4 space-y-4 pb-4">
              {filteredPosts.map(post => (
                  <div key={post.id} className={`break-inside-avoid rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow ${post.bgColor || 'bg-white/60'}`}>
                      <h3 className="font-bold text-gray-800 text-sm mb-2">{post.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-4 font-light">{post.content}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                          <span className="inline-block px-1.5 py-0.5 bg-white/50 rounded text-[10px] text-gray-500 font-medium">
                              #{CATEGORIES.find(c => c.id === post.category)?.label || post.category}
                          </span>
                      </div>
                      
                      <div className="flex items-center gap-3 border-t border-black/5 pt-2 text-gray-400">
                          <div className="flex items-center gap-1">
                              <Eye size={10} /> <span className="text-[10px]">{post.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                              <Heart size={10} /> <span className="text-[10px]">{post.likes}</span>
                          </div>
                           <div className="flex items-center gap-1">
                              <MessageCircle size={10} /> <span className="text-[10px]">0</span>
                          </div>
                      </div>
                  </div>
              ))}
          </div>

          {/* Floating Action Button - Fixed to viewport */}
          <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto h-0 z-30 pointer-events-none">
              <div className="absolute bottom-24 right-6 pointer-events-auto">
                <button 
                    onClick={() => setIsComposeOpen(true)}
                    className="w-14 h-14 bg-gray-900 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform shadow-gray-400/50"
                >
                    <Plus size={28} />
                </button>
              </div>
          </div>

          {/* Compose Modal */}
          {isComposeOpen && (
              <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col p-6 animate-fade-in">
                  <div className="flex justify-between items-center mb-6 pt-10 max-w-2xl mx-auto w-full">
                      <h3 className="text-lg font-bold">发布新内容</h3>
                      <button onClick={() => setIsComposeOpen(false)} className="p-2 bg-gray-100 rounded-full">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
                    <input 
                        type="text" 
                        placeholder="标题 (可选)"
                        className="w-full bg-transparent text-lg font-bold mb-4 focus:outline-none placeholder-gray-400"
                        value={newPostContent.title}
                        onChange={e => setNewPostContent({...newPostContent, title: e.target.value})}
                    />
                    
                    <textarea 
                        placeholder="在这里写下你的心事..."
                        className="w-full flex-1 bg-transparent text-sm leading-relaxed focus:outline-none resize-none placeholder-gray-400 font-light"
                        value={newPostContent.content}
                        onChange={e => setNewPostContent({...newPostContent, content: e.target.value})}
                    />

                    <div className="mt-4 flex flex-col gap-4 mb-10">
                         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                             {/* Simple category selector for compose (Linear list for ease of use) */}
                             {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                                 <button 
                                    key={c.id}
                                    onClick={() => setActiveCategory(c.id)}
                                    className={`px-3 py-1 rounded-full text-[10px] border whitespace-nowrap transition-colors ${activeCategory === c.id ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-500'}`}
                                 >
                                     {c.label}
                                 </button>
                             ))}
                         </div>
                         <button 
                            onClick={handlePost}
                            className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-colors flex items-center justify-center gap-2"
                         >
                             发布 <Send size={16} />
                         </button>
                    </div>
                  </div>
              </div>
          )}
      </div>
  );
};
