
import React, { useState } from 'react';
import { MessageCircle, CheckCircle, Search, MoreHorizontal, Send, Paperclip, Phone, Video } from 'lucide-react';

const ChatManagement: React.FC = () => {
  const [activeChat, setActiveChat] = useState(1);
  const [messageInput, setMessageInput] = useState('');

  const users = [
    { id: 1, name: 'Nguyễn Văn A', msg: 'Xin chào, tôi cần tư vấn...', time: '10:30 AM', unread: 2, online: true },
    { id: 2, name: 'Trần Thị B', msg: 'Giá bộ Inverter Huawei là bao nhiêu?', time: 'Yesterday', unread: 0, online: false },
    { id: 3, name: 'Lê Hoàng C', msg: 'Cảm ơn shop nhé.', time: '2 days ago', unread: 0, online: true },
    { id: 4, name: 'Phạm D', msg: 'Đã nhận được hàng.', time: '1 week ago', unread: 0, online: false },
  ];

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-slate-800/90 border border-gray-100 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
      {/* Sidebar List */}
      <div className="w-80 border-r border-gray-100 dark:border-slate-700 flex flex-col bg-gray-50/30 dark:bg-slate-900/40">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700">
           <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-4">Messages</h3>
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18}/>
             <input type="text" placeholder="Search chats..." className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"/>
           </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map(u => (
            <div 
              key={u.id} 
              onClick={() => setActiveChat(u.id)}
              className={`p-4 cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-800 border-l-4 ${activeChat === u.id ? 'bg-white dark:bg-slate-800 border-primary shadow-sm' : 'border-transparent hover:border-gray-200 dark:hover:border-slate-700'}`}
            >
              <div className="flex gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {u.name.charAt(0)}
                  </div>
                  {u.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className={`font-bold text-sm truncate ${activeChat === u.id ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>{u.name}</h4>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{u.time}</span>
                  </div>
                  <p className={`text-xs truncate ${u.unread > 0 ? 'text-gray-800 dark:text-gray-100 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>{u.msg}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800">
        {/* Header */}
        <div className="h-20 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center px-6 bg-white dark:bg-slate-800">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
               {users.find(u => u.id === activeChat)?.name.charAt(0)}
             </div>
             <div>
               <div className="font-bold text-gray-800 dark:text-gray-100 text-lg">{users.find(u => u.id === activeChat)?.name}</div>
               <div className="text-xs text-green-500 flex items-center gap-1">
                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Active now
               </div>
             </div>
           </div>
           <div className="flex gap-4 text-primary">
             <button className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-full transition-colors"><Phone size={20}/></button>
             <button className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-full transition-colors"><Video size={20}/></button>
             <button className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-400 dark:text-gray-500"><MoreHorizontal size={20}/></button>
           </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 bg-gray-50 dark:bg-slate-900/50 p-6 overflow-y-auto space-y-6">
          <div className="flex justify-center">
             <span className="text-xs text-gray-400 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">Today, 10:23 AM</span>
          </div>
          
          <div className="flex justify-start gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0"></div>
             <div className="space-y-1 max-w-[70%]">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm text-gray-700 dark:text-gray-200 text-sm border border-gray-100 dark:border-slate-700">
                  Xin chào, tôi muốn hỏi về gói lắp đặt 5kWp cho gia đình.
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm text-gray-700 dark:text-gray-200 text-sm border border-gray-100 dark:border-slate-700">
                  Nhà tôi ở Đà Nẵng, mái tôn.
                </div>
              </div>
          </div>

          <div className="flex justify-end gap-3">
             <div className="space-y-1 max-w-[70%]">
                <div className="bg-primary text-white p-3 rounded-2xl rounded-tr-none shadow-md text-sm">
                  Chào bạn A, cảm ơn bạn đã quan tâm!
                </div>
                <div className="bg-primary text-white p-3 rounded-2xl rounded-tr-none shadow-md text-sm">
                  Với mái tôn diện tích khoảng bao nhiêu m2 ạ? Bên mình đang có gói khuyến mãi tặng kèm gói vệ sinh pin 1 năm đấy ạ.
                </div>
                <div className="text-right text-xs text-gray-400 dark:text-gray-500 mr-1">Seen 10:35 AM <CheckCircle size={10} className="inline"/></div>
             </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
           <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-900 p-2 rounded-2xl border border-gray-200 dark:border-slate-700 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"><Paperclip size={20}/></button>
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="flex-1 bg-transparent focus:outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setMessageInput('')}
              />
              <button className="p-2 bg-primary text-white rounded-xl hover:bg-secondary transition-colors shadow-md">
                <Send size={18} className="ml-0.5"/>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

export default ChatManagement;
