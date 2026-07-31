
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Phone, Sparkles, RefreshCw, Bot, Zap, FileText, Shield, DollarSign } from 'lucide-react';
import { chatService, ChatMessage } from '../services/chatService';
import { useLanguage } from '../contexts/LanguageContext';

const ChatBox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: t('chat.welcome'), isUser: false, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick Questions Configuration
  const QUICK_QUESTIONS = [
    { label: "💰 Báo giá lắp đặt", text: "Cho tôi xin báo giá lắp đặt điện mặt trời áp mái." },
    { label: "🛠️ Quy trình làm việc", text: "Quy trình lắp đặt hệ thống điện mặt trời như thế nào?" },
    { label: "🛡️ Chính sách bảo hành", text: "Chính sách bảo hành của CTC như thế nào?" },
    { label: "📞 Liên hệ tư vấn", text: "Tôi muốn liên hệ với nhân viên tư vấn kỹ thuật." },
  ];

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages(prev => {
      const newMsgs = [...prev];
      if (newMsgs.length > 0 && !newMsgs[0].isUser) {
        newMsgs[0].text = t('chat.welcome');
      }
      return newMsgs;
    });
  }, [t]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessageToAI = async (text: string) => {
    setIsTyping(true);
    const botMsgIndex = Date.now();
    setMessages(prev => [...prev, { text: "", isUser: false, timestamp: botMsgIndex }]);

    let accumulatedText = "";
    try {
      await chatService.sendMessageStream(text, (chunk: string) => {
        accumulatedText += chunk;
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && !updated[lastIdx].isUser) {
            updated[lastIdx] = { ...updated[lastIdx], text: accumulatedText };
          }
          return updated;
        });
      });
    } catch (error) {
      if (!accumulatedText) {
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && !updated[lastIdx].isUser) {
            updated[lastIdx] = { ...updated[lastIdx], text: "Kết nối gián đoạn. Vui lòng gọi 0915 059 666." };
          }
          return updated;
        });
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = { text: input, isUser: true, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    
    await sendMessageToAI(userMsg.text);
  };

  const handleQuickQuestion = (question: string) => {
    const userMsg = { text: question, isUser: true, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    sendMessageToAI(question);
  };

  const handleReset = () => {
    chatService.resetSession();
    setMessages([{ text: t('chat.welcome'), isUser: false, timestamp: Date.now() }]);
  };

  const HOTLINE = "0915059666";
  const ZALO_LINK = `https://zalo.me/${HOTLINE}`;

  return (
    <div className="fixed bottom-4 right-2 z-50 flex flex-col items-end gap-2 font-sans sm:bottom-6 sm:right-5 sm:gap-3 print:hidden">
      {/* Floating Contact Buttons (Visible when chat is closed) */}
      {!isOpen && (
        <div className="flex flex-col gap-3 animate-fade-in-up">
           {/* 1. NÚT ZALO CÓ SÓNG LAN TỎA & SHADOW GLOW */}
           <a 
             href={ZALO_LINK} 
             target="_blank" 
             rel="noreferrer"
             className="relative flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 border-white bg-blue-600 shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-115 hover:shadow-xl hover:shadow-blue-500/60 group p-0"
             title="Chat Zalo"
           >
             {/* Ripple Ring Effect */}
             <span className="absolute -inset-1 rounded-full bg-blue-500/30 animate-ping duration-1000"></span>
             
             <span className="font-bold text-[9px] absolute -top-1.5 -left-1.5 bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-bounce z-10 shadow-md">1</span>
             <img src="/images/zalo-icon.svg" alt="Zalo" className="w-full h-full object-cover rounded-full relative z-0 transition-transform group-hover:rotate-6" />
             
             {/* Tooltip */}
             <span className="absolute right-full mr-3 bg-slate-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity shadow-lg backdrop-blur-xs">
               Chat Zalo trực tiếp
             </span>
           </a>
           
           {/* 2. NÚT HOTLINE CÓ RUNG VÀ SÓNG ĐỎ KHẨN CẤP */}
           <a 
             href={`tel:${HOTLINE}`} 
             className="relative flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 border-white bg-red-500 text-white shadow-lg shadow-red-500/30 transition-all duration-300 hover:scale-115 hover:shadow-xl hover:shadow-red-500/60 group"
             title="Call Hotline"
           >
             {/* Red Ripple Wave */}
             <span className="absolute -inset-1 rounded-full bg-red-500/40 animate-ping duration-700"></span>
             
             <Phone size={20} className="animate-bounce sm:hidden relative z-10" />
             <Phone size={24} className="animate-bounce hidden sm:block relative z-10" />
             
             {/* Tooltip */}
             <span className="absolute right-full mr-3 bg-slate-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity shadow-lg backdrop-blur-xs">
               Hotline: 0915 059 666
             </span>
           </a>
        </div>
      )}

      {/* 3. NÚT AI CHATBOT CÓ HÀO QUANG & HÌNH ANH ROBOT LINH HOẠT */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="group relative flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 border-white bg-white text-white shadow-xl shadow-sky-500/30 transition-all duration-300 hover:scale-115 hover:shadow-2xl hover:shadow-sky-500/60 p-0"
          title="Chat với AI CTC"
        >
          {/* AI Glow Aura Ring */}
          <span className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 opacity-40 animate-ping duration-1000"></span>
          <span className="absolute -inset-0.5 rounded-full bg-sky-400/30 animate-pulse"></span>
          
          <img 
            src="/images/ai-chatbot-icon.png" 
            alt="AI Bot" 
            className="w-full h-full object-cover rounded-full relative z-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" 
          />
          
          {/* Online Indicator Badge */}
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5 z-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>

          {/* Tooltip */}
          <span className="absolute right-full mr-3 bg-slate-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity shadow-lg backdrop-blur-xs">
            Trợ lý AI tư vấn 24/7
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="flex h-[550px] max-h-[85vh] w-[calc(100vw-1.5rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl animate-fade-in-up sm:w-[380px]">
          {/* Header */}
          <div className="bg-corporate p-4 text-white">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded-full relative w-8 h-8 flex items-center justify-center">
                   <img src="/images/ai-chatbot-icon.png" alt="AI Bot" className="w-6 h-6 object-contain" />
                   <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold flex items-center gap-1">Trợ Lý AI CTC <Sparkles size={12} className="text-yellow-400"/></h3>
                  <p className="text-xs opacity-80 flex items-center gap-1">Hỗ trợ 24/7</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={handleReset} className="p-1.5 hover:bg-white/20 rounded-full transition-colors" title="Làm mới chat"><RefreshCw size={16}/></button>
                <button onClick={toggleChat} className="p-1.5 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
              </div>
            </div>

            {/* Quick Contact Bar */}
            <div className="flex gap-2 mt-2">
               <a href={ZALO_LINK} target="_blank" rel="noreferrer" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
                  Chat Zalo
               </a>
               <a href={`tel:${HOTLINE}`} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
                  <Phone size={12}/> 0915 059 666
               </a>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 scrollbar-thin scrollbar-thumb-gray-300">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                {!msg.isUser && (
                   <img src="/images/ai-chatbot-icon.png" alt="AI" className="w-8 h-8 rounded-full bg-white p-0.5 border border-sky-200 object-contain mr-2 flex-shrink-0 mt-1 shadow-xs" />
                )}
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.isUser 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                }`}>
                  {/* Render formatting */}
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} className={`${line.trim().startsWith('-') ? 'ml-2 mb-1' : 'mb-1'} ${line.includes('**') ? 'font-semibold' : ''}`}>
                      {line.replace(/\*\*/g, '')}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {/* Suggestion Chips (Show only if it's the start of conversation or last msg is from AI) */}
            {!isTyping && messages.length > 0 && !messages[messages.length - 1].isUser && (
               <div className="flex flex-wrap gap-2 mt-2 ml-10 animate-fade-in">
                  {QUICK_QUESTIONS.map((q, idx) => (
                     <button 
                        key={idx}
                        onClick={() => handleQuickQuestion(q.text)}
                        className="text-xs bg-white border border-primary/30 text-gray-700 hover:bg-orange-50 hover:border-primary px-3 py-1.5 rounded-full transition-colors shadow-sm flex items-center gap-1"
                     >
                        {q.label}
                     </button>
                  ))}
               </div>
            )}

            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-corporate flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">AI</div>
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chat.placeholder')}
              className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button 
              type="submit" 
              disabled={isTyping || !input.trim()} 
              className="bg-corporate text-white p-2.5 rounded-full hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
