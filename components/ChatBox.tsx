
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
    try {
      const responseText = await chatService.sendMessage(text);
      const botMsg = { text: responseText, isUser: false, timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg = { text: "Kết nối gián đoạn. Vui lòng gọi 093 979 24 28.", isUser: false, timestamp: Date.now() };
      setMessages(prev => [...prev, errorMsg]);
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

  const HOTLINE = "0939792428";
  const ZALO_LINK = `https://zalo.me/${HOTLINE}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans flex flex-col items-end gap-3">
      {/* Floating Contact Buttons (Visible when chat is closed) */}
      {!isOpen && (
        <div className="flex flex-col gap-3 animate-fade-in-up">
           <a 
             href={ZALO_LINK} 
             target="_blank" 
             rel="noreferrer"
             className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 relative group border-2 border-white"
             title="Chat Zalo"
           >
             <span className="font-bold text-[10px] absolute -top-2 -left-2 bg-red-500 text-white px-1.5 rounded-full animate-bounce">1</span>
             <span className="font-bold text-xs">Zalo</span>
             {/* Tooltip */}
             <span className="absolute right-full mr-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">Chat Zalo</span>
           </a>
           
           <a 
             href={`tel:${HOTLINE}`} 
             className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 relative group border-2 border-white"
             title="Call Hotline"
           >
             <Phone size={24} className="animate-pulse" />
             <span className="absolute right-full mr-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">093 979 24 28</span>
           </a>
        </div>
      )}

      {/* Main Chat Toggle (AI Bot) */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-primary hover:bg-secondary text-white w-14 h-14 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center border-2 border-white group"
          title="Chat với AI Tran Le"
        >
          <Bot size={28} className="group-hover:rotate-12 transition-transform" />
          {/* Optional Badge/Indicator */}
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-[350px] sm:w-[380px] rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden animate-fade-in-up h-[550px] max-h-[85vh]">
          {/* Header */}
          <div className="bg-corporate p-4 text-white">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1.5 rounded-full relative">
                   <Bot size={24} className="text-corporate" />
                   <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold flex items-center gap-1">Trợ Lý AI TRAN LE <Sparkles size={12} className="text-yellow-400"/></h3>
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
                  <Phone size={12}/> 093 979 24 28
               </a>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 scrollbar-thin scrollbar-thumb-gray-300">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                {!msg.isUser && (
                   <div className="w-8 h-8 rounded-full bg-corporate flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">AI</div>
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
