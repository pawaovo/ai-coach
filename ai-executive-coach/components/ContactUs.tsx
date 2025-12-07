import React, { useState } from 'react';
import { Copy, ArrowUpRight, Check } from 'lucide-react';

const ContactUs: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full px-5 pt-8 pb-4 bg-[#EFEDE6]">
      <div className="mb-4 shrink-0">
         <h1 className="text-3xl font-serif text-[#191919] mb-2">联系我们</h1>
      </div>

      <div className="flex-1 flex flex-col justify-between min-h-0 pb-2">
        
        {/* Main Card - Compact */}
        <div className="flex-1 max-h-[35%] bg-[#E4E0D6] rounded-xl p-4 flex flex-row items-center justify-between gap-4 border border-transparent hover:border-[#DEDBD2] transition-colors mb-3">
          <div className="h-full aspect-square bg-[#EFEDE6] rounded-lg shadow-sm flex items-center justify-center">
             <span className="font-serif italic text-[#8D8D8A] text-xs">QR Code</span>
          </div>
          <div className="flex-1 h-full flex flex-col justify-center">
             <h3 className="font-serif text-lg text-[#191919] mb-1">关注公众号</h3>
             <p className="text-xs font-sans text-[#5D5D5B] tracking-wide leading-relaxed">
               获取更多商业洞察
             </p>
          </div>
        </div>

        {/* Contact List */}
        <div className="space-y-3">
           {/* WeChat Item */}
           <div 
             className="flex flex-col p-4 bg-[#E4E0D6] rounded-xl active:bg-[#DCD8CE] transition-colors cursor-pointer"
             onClick={() => handleCopy('your_wechat_id', 'wechat')}
           >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-semibold tracking-widest opacity-70 text-[#5D5D5B]">微信</span>
                {copiedId === 'wechat' ? <Check size={14} className="text-[#191919]" /> : <Copy size={14} className="text-[#8D8D8A]" />}
              </div>
              <span className="text-lg font-serif text-[#191919]">your_wechat_id</span>
           </div>

           {/* Phone Item */}
           <a href="tel:138xxxxxxxx" className="flex flex-col p-4 bg-[#E4E0D6] rounded-xl active:bg-[#DCD8CE] transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-semibold tracking-widest opacity-70 text-[#5D5D5B]">电话</span>
                <ArrowUpRight size={14} className="text-[#8D8D8A]" />
              </div>
              <span className="text-lg font-serif text-[#191919]">138-xxxx-xxxx</span>
           </a>

           {/* Website Button */}
           <a 
             href="https://www.xxx.com" 
             target="_blank" 
             rel="noopener noreferrer"
             className="flex flex-col p-4 bg-[#E4E0D6] rounded-xl active:bg-[#DCD8CE] transition-colors"
           >
              <div className="flex justify-between items-center mb-1">
                 <span className="text-[10px] font-semibold tracking-widest opacity-70 text-[#5D5D5B]">官方网站</span>
                 <ArrowUpRight size={14} className="text-[#8D8D8A]" />
              </div>
              <span className="text-lg font-serif text-[#191919]">www.xxx.com</span>
           </a>
        </div>

        <div className="pt-4 text-center shrink-0">
           <p className="text-[10px] text-[#8D8D8A] font-sans">
             © 2025 AI Coach
           </p>
        </div>

      </div>
    </div>
  );
};

export default ContactUs;