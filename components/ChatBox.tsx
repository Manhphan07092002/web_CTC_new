
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
    { label: "🧮 Tính dung lượng & Báo giá PDF", text: "Tính giúp tôi nhà dùng khoảng 2.5 triệu tiền điện mỗi tháng" },
    { label: "📦 Tra cứu đơn hàng & Lịch thi công", text: "Tôi muốn tra cứu tiến độ đơn hàng CTC-1002" },
    { label: "📄 Xem & Tải Datasheet Pin / Inverter", text: "Cho tôi xin file Datasheet pin Canadian Solar 550W" },
    { label: "📞 Liên hệ tư vấn 24/7", text: "Cho tôi thông tin liên hệ và tư vấn kỹ thuật trực tiếp" },
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
    <div className="floating-contact-buttons fixed right-2 z-[95] flex flex-col items-end gap-2 font-sans sm:right-5 sm:gap-3 print:hidden bottom-[calc(var(--mobile-bottom-nav-height,64px)+env(safe-area-inset-bottom,0px)+16px)] lg:bottom-6">
      {/* Floating Contact Buttons (Visible when chat is closed) */}
      {!isOpen && (
        <div className="flex flex-col gap-3 animate-fade-in-up">
           {/* 1. NÚT ZALO CÓ SÓNG LAN TỎA & SHADOW GLOW */}
           <a 
             href={ZALO_LINK} 
             target="_blank" 
             rel="noreferrer"
             className="relative flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 border-white bg-blue-600 shadow-lg shadow-blue-500/40 transition-all duration-300 hover:scale-115 hover:shadow-xl hover:shadow-blue-500/80 group p-0 cursor-pointer"
             title="Chat Zalo"
           >
             {/* Ripple Ring Wave Effect */}
             <span className="absolute -inset-1 rounded-full bg-blue-500/40 animate-pulse-ring pointer-events-none"></span>
             
             <span className="font-bold text-[9px] absolute -top-1.5 -left-1.5 bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-bounce z-10 shadow-md">1</span>
             <img src="/images/zalo-icon.svg" alt="Zalo" className="w-full h-full object-cover rounded-full relative z-0 transition-transform group-hover:rotate-12" />
             
             {/* Tooltip */}
             <span className="absolute right-full mr-3 bg-slate-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity shadow-lg backdrop-blur-xs pointer-events-none">
               Chat Zalo trực tiếp
             </span>
           </a>
           
           {/* 2. NÚT HOTLINE CÓ RUNG VÀ SÓNG ĐỎ KHẨN CẤP */}
           <a 
             href={`tel:${HOTLINE}`} 
             className="relative flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 border-white bg-red-500 text-white shadow-lg shadow-red-500/40 transition-all duration-300 hover:scale-115 hover:shadow-xl hover:shadow-red-500/80 group cursor-pointer"
             title="Call Hotline"
           >
             {/* Red Ripple Wave */}
             <span className="absolute -inset-1 rounded-full bg-red-500/40 animate-pulse-ring pointer-events-none"></span>
             
             <Phone size={20} className="animate-phone-shake sm:hidden relative z-10" />
             <Phone size={24} className="animate-phone-shake hidden sm:block relative z-10" />
             
             {/* Tooltip */}
             <span className="absolute right-full mr-3 bg-slate-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity shadow-lg backdrop-blur-xs pointer-events-none">
               Hotline: 0915 059 666
             </span>
           </a>
        </div>
      )}

      {/* 3. NÚT AI CHATBOT CÓ HÀO QUANG & HÌNH ANH ROBOT LINH HOẠT */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="group relative flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 border-white dark:border-slate-700 bg-white dark:bg-slate-800 text-white shadow-xl shadow-sky-500/40 transition-all duration-300 hover:scale-115 hover:shadow-2xl hover:shadow-sky-500/80 p-0 cursor-pointer"
          title="Chat với AI CTC"
        >
          {/* AI Glow Aura Ring */}
          <span className="absolute -inset-1.5 rounded-full bg-sky-400/40 animate-pulse-ring pointer-events-none"></span>
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 opacity-40 animate-pulse pointer-events-none"></span>
          
          <img 
            src="/images/ai-chatbot-icon.png" 
            alt="AI Bot" 
            className="w-full h-full object-cover rounded-full relative z-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" 
          />
          
          {/* Online Indicator Badge */}
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5 z-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800"></span>
          </span>

          {/* Tooltip */}
          <span className="absolute right-full mr-3 bg-slate-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity shadow-lg backdrop-blur-xs pointer-events-none">
            Trợ lý AI tư vấn 24/7
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="flex h-[550px] max-h-[85vh] w-[calc(100vw-1.5rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-fade-in-up sm:w-[380px]">
          {/* Header */}
          <div className="bg-corporate dark:bg-slate-800/90 p-4 text-white border-b border-white/10 dark:border-slate-700/60">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-white dark:bg-slate-700 p-1 rounded-full relative w-8 h-8 flex items-center justify-center">
                   <img src="/images/ai-chatbot-icon.png" alt="AI Bot" className="w-6 h-6 object-contain" />
                   <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white dark:border-slate-700 rounded-full"></span>
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
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-slate-950/80 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-700">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                {!msg.isUser && (
                   <img src="/images/ai-chatbot-icon.png" alt="AI" className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 p-0.5 border border-sky-200 dark:border-slate-700 object-contain mr-2 flex-shrink-0 mt-1 shadow-xs" />
                )}
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.isUser 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700/70 text-gray-800 dark:text-slate-100 rounded-tl-none'
                }`}>
                  {/* Render formatting with clean page name links, bold text and Interactive Action Cards */}
                  {(() => {
                    // Extract action tags from text
                    const solarMatch = msg.text.match(/\[ACTION_SOLAR:\s*(.*?)\]/);
                    const orderMatch = msg.text.match(/\[ACTION_ORDER:\s*(.*?)\]/);
                    const docMatch = msg.text.match(/\[ACTION_DOC:\s*(.*?)\]/);

                    const cleanText = msg.text
                      .replace(/\[ACTION_SOLAR:\s*(.*?)\]/g, '')
                      .replace(/\[ACTION_ORDER:\s*(.*?)\]/g, '')
                      .replace(/\[ACTION_DOC:\s*(.*?)\]/g, '')
                      .trim();

                    const parseLine = (line: string): React.ReactNode[] => {
                      const regex = /(\[(.*?)\]\((.*?)\)|\*\*(.*?)\*\*)/g;
                      const elements: React.ReactNode[] = [];
                      let lastIndex = 0;
                      let match: RegExpExecArray | null;

                      while ((match = regex.exec(line)) !== null) {
                        if (match.index > lastIndex) {
                          elements.push(line.substring(lastIndex, match.index));
                        }

                        if (match[1].startsWith('[')) {
                          const label = match[2];
                          const url = match[3];
                          const isInternal = url.startsWith('/') || (typeof window !== 'undefined' && url.includes(window.location.hostname));
                          elements.push(
                            <a
                              key={match.index}
                              href={url}
                              target={isInternal ? '_self' : '_blank'}
                              rel="noreferrer"
                              className="inline-flex items-center gap-0.5 text-blue-600 dark:text-sky-400 font-bold underline underline-offset-2 hover:text-primary transition-colors cursor-pointer"
                            >
                              {label}
                            </a>
                          );
                        } else if (match[1].startsWith('**')) {
                          const boldText = match[4];
                          elements.push(
                            <strong key={match.index} className="font-bold text-gray-900 dark:text-white">
                              {boldText}
                            </strong>
                          );
                        }

                        lastIndex = regex.lastIndex;
                      }

                      if (lastIndex < line.length) {
                        elements.push(line.substring(lastIndex));
                      }

                      return elements.length > 0 ? elements : [line];
                    };

                    const parseTagParams = (str: string): Record<string, string> => {
                      const params: Record<string, string> = {};
                      const regex = /(\w+)="([^"]*)"/g;
                      let m;
                      while ((m = regex.exec(str)) !== null) {
                        params[m[1]] = m[2];
                      }
                      return params;
                    };

                    return (
                      <>
                        {cleanText.split('\n').map((line, i) => (
                          <p key={i} className={`${line.trim().startsWith('-') ? 'ml-2 mb-1' : 'mb-1'}`}>
                            {parseLine(line)}
                          </p>
                        ))}

                        {/* 1. Solar Calculation Interactive Card */}
                        {solarMatch && (() => {
                          const params = parseTagParams(solarMatch[1]);
                          return (
                            <div className="mt-3 p-3.5 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-slate-900/5 dark:from-amber-950/40 dark:to-slate-900 border border-amber-500/30 rounded-2xl shadow-sm text-xs space-y-2.5 animate-fade-in">
                              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                                <span className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                                  <Zap size={14} className="animate-pulse" /> Đề Xuất Cấu Hình Solar
                                </span>
                                <span className="bg-amber-500 text-white font-black px-2 py-0.5 rounded-full text-[10px]">
                                  {params.capacity || '5 kWp'}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-200 font-medium">
                                <div className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-xl border border-amber-200/50 dark:border-slate-700">
                                  <span className="text-[10px] text-slate-400 block font-bold">Điện phát/tháng</span>
                                  <span className="font-extrabold text-amber-600 dark:text-amber-300 text-xs">{params.monthlyOutput || '~600 kWh'}</span>
                                </div>
                                <div className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-xl border border-amber-200/50 dark:border-slate-700">
                                  <span className="text-[10px] text-slate-400 block font-bold">Tiết kiệm/tháng</span>
                                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">{params.monthlySavings || '~1.800.000đ'}</span>
                                </div>
                                <div className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-xl border border-amber-200/50 dark:border-slate-700">
                                  <span className="text-[10px] text-slate-400 block font-bold">Hoàn vốn dự kiến</span>
                                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xs">{params.payback || '~4.2 năm'}</span>
                                </div>
                                <div className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-xl border border-amber-200/50 dark:border-slate-700">
                                  <span className="text-[10px] text-slate-400 block font-bold">Ước tính đầu tư</span>
                                  <span className="font-extrabold text-rose-600 dark:text-rose-400 text-xs">{params.cost || '~85 triệu'}</span>
                                </div>
                              </div>

                              <div className="pt-1">
                                <a
                                  href="/cart"
                                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm text-xs cursor-pointer"
                                >
                                  <FileText size={14} /> 📄 In & Tải File Báo Giá PDF CTC
                                </a>
                              </div>
                            </div>
                          );
                        })()}

                        {/* 2. Order Tracking Interactive Card */}
                        {orderMatch && (() => {
                          const params = parseTagParams(orderMatch[1]);
                          return (
                            <div className="mt-3 p-3.5 bg-gradient-to-br from-blue-500/10 via-sky-400/5 to-slate-900/5 dark:from-blue-950/40 dark:to-slate-900 border border-blue-500/30 rounded-2xl shadow-sm text-xs space-y-2.5 animate-fade-in">
                              <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
                                <span className="font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                                  <Shield size={14} /> Tiến Độ Đơn Hàng & Thi Công
                                </span>
                                <span className="bg-blue-600 text-white font-black px-2 py-0.5 rounded-full text-[10px]">
                                  {params.orderId || 'CTC-ORDER'}
                                </span>
                              </div>

                              <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-blue-200/50 dark:border-slate-700 space-y-1.5">
                                <div className="flex justify-between items-center text-slate-700 dark:text-slate-200 font-bold">
                                  <span>Trạng thái:</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full text-[10px]">
                                    {params.status || 'Đang vận chuyển'}
                                  </span>
                                </div>
                                {params.deliveryDate && (
                                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                    <span>Lịch thi công:</span>
                                    <span className="font-extrabold text-blue-600 dark:text-sky-400">{params.deliveryDate}</span>
                                  </div>
                                )}
                                {params.engineer && (
                                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                    <span>Đội kỹ sư phụ trách:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-100">{params.engineer}</span>
                                  </div>
                                )}
                              </div>

                              <div className="pt-1">
                                <a
                                  href="/track-order"
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm text-xs cursor-pointer"
                                >
                                  🔍 Xem Chi Tiết Hành Trình Vận Chuyển
                                </a>
                              </div>
                            </div>
                          );
                        })()}

                        {/* 3. Technical Document Interactive Card */}
                        {docMatch && (() => {
                          const params = parseTagParams(docMatch[1]);
                          return (
                            <div className="mt-3 p-3.5 bg-gradient-to-br from-emerald-500/10 via-teal-400/5 to-slate-900/5 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-500/30 rounded-2xl shadow-sm text-xs space-y-2.5 animate-fade-in">
                              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                                  <FileText size={14} /> Tài Liệu Kỹ Thuật Đã Tìm Thấy
                                </span>
                                <span className="bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full text-[10px]">
                                  {params.type || 'PDF'}
                                </span>
                              </div>

                              <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-emerald-200/50 dark:border-slate-700">
                                <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs mb-1">
                                  📄 {params.title || 'Tài liệu Kỹ thuật CTC'}
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                  File chính thức chứng nhận CO/CQ & tiêu chuẩn ISO/TUV.
                                </p>
                              </div>

                              <div className="pt-1 flex gap-2">
                                <a
                                  href="/resources"
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-2 rounded-xl flex items-center justify-center gap-1 transition-all text-xs cursor-pointer"
                                >
                                  👁️ Xem Trực Tiếp
                                </a>
                                <a
                                  href={params.url || '/resources'}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-extrabold py-2 px-2 rounded-xl flex items-center justify-center gap-1 transition-all text-xs cursor-pointer"
                                >
                                  📥 Tải File PDF
                                </a>
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    );
                  })()}
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
                        className="text-xs bg-white dark:bg-slate-800 border border-primary/30 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-700 hover:border-primary dark:hover:border-primary px-3 py-1.5 rounded-full transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                     >
                        {q.label}
                     </button>
                  ))}
               </div>
            )}

            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-corporate flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">AI</div>
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-slate-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-slate-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chat.placeholder')}
              className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 border-0 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button 
              type="submit" 
              disabled={isTyping || !input.trim()} 
              className="bg-corporate text-white p-2.5 rounded-full hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
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
