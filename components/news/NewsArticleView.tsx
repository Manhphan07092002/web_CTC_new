import React, { useState, useEffect } from 'react';
import { NewsItem } from '../../types';
import { 
  Calendar, Tag, Share2, Clock, Check, User, ArrowRight, 
  Phone, MessageSquare, Printer, Bookmark, Eye, Type, 
  ThumbsUp, BookOpen, ListOrdered, Volume2, VolumeX, Play, Pause,
  Send, MessageCircle, ShieldCheck, CornerDownRight, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

interface NewsArticleViewProps {
  news: NewsItem;
}

interface ReaderComment {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  avatarBg: string;
  time: string;
  content: string;
  likes: number;
  isLiked?: boolean;
  parentId?: string | null;
  rootId?: string | null;
  replyToName?: string;
  isAdminReply?: boolean;
  replies?: ReaderComment[];
  reply?: string;
  replyAuthor?: string;
  repliedAt?: string;
  repliedBy?: {
    id?: any;
    name?: string;
    avatar?: string;
    role?: string;
  };
}

export const NewsArticleView: React.FC<NewsArticleViewProps> = ({ news }) => {
  const { settings } = useSettings();
  const { user, isAuthenticated } = useAuth();
  const logoSrc = settings?.logoHeader || settings?.logo || '/uploads/images/logo/logodo.png';
  
  const articleId = (news as any)._id || news.id;
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likes, setLikes] = useState<number>((news as any).likes || 0);
  const [hasLiked, setHasLiked] = useState<boolean>(() => {
    return localStorage.getItem(`ctc_news_liked_${articleId}`) === 'true';
  });

  useEffect(() => {
    const currentId = (news as any)._id || news.id;
    setLikes((news as any).likes || 0);
    setHasLiked(localStorage.getItem(`ctc_news_liked_${currentId}`) === 'true');
  }, [news]);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Audio Speech Reader States
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  // Reader Comments State (Dynamic 100% from Database - No Login Required)
  const [comments, setComments] = useState<ReaderComment[]>([]);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentEmail, setNewCommentEmail] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Guest Persistent Identification & Reply States
  const [savedGuestEmail, setSavedGuestEmail] = useState<string>(() => localStorage.getItem('ctc_comment_email') || '');
  const [savedGuestName, setSavedGuestName] = useState<string>(() => localStorage.getItem('ctc_comment_name') || '');

  // Prompt Modal when Guest likes for the first time without email
  const [likeEmailModal, setLikeEmailModal] = useState<{ isOpen: boolean; commentId: string | null }>({ isOpen: false, commentId: null });
  const [likeEmailInput, setLikeEmailInput] = useState('');
  const [likeEmailError, setLikeEmailError] = useState('');

  // Inline Reply Form States
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyName, setReplyName] = useState('');
  const [replyEmail, setReplyEmail] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [submittingReply, setSubmittingReply] = useState(false);

  // Helper to map comment data recursively
  const mapCommentData = (c: any): ReaderComment => ({
    id: c._id || c.id,
    name: c.name,
    email: c.email,
    avatar: c.avatar,
    avatarBg: 'bg-primary',
    time: c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) : 'Mới gửi',
    content: c.content,
    likes: c.likes || 0,
    isLiked: !!c.isLiked,
    parentId: c.parentId,
    rootId: c.rootId,
    replyToName: c.replyToName,
    isAdminReply: !!c.isAdminReply,
    reply: typeof c.reply === 'object' && c.reply ? c.reply.content : c.reply,
    replyAuthor: c.replyAuthor || (typeof c.reply === 'object' && c.reply?.repliedBy ? c.reply.repliedBy.name : (c.repliedBy?.name || 'Administrator')),
    repliedBy: typeof c.reply === 'object' && c.reply?.repliedBy ? c.reply.repliedBy : c.repliedBy,
    repliedAt: typeof c.reply === 'object' && c.reply?.repliedAt ? c.reply.repliedAt : c.repliedAt,
    replies: Array.isArray(c.replies) ? c.replies.map(mapCommentData) : []
  });

  const loadComments = () => {
    const artId = (news as any)._id || news.id;
    if (artId) {
      const activeEmail = (isAuthenticated && user ? user.email : savedGuestEmail) || undefined;
      const activeUserId = (isAuthenticated && user ? (user.id || (user as any)._id) : undefined);
      api.news.getComments(artId, { email: activeEmail, userId: activeUserId }).then(data => {
        if (Array.isArray(data)) {
          setComments(data.map(mapCommentData));
        }
      }).catch(err => console.error('Error loading comments:', err));
    }
  };

  // Fetch real comments from database
  useEffect(() => {
    loadComments();
    if (savedGuestName && !newCommentName) {
      setNewCommentName(savedGuestName);
    }
    if (savedGuestEmail && !newCommentEmail) {
      setNewCommentEmail(savedGuestEmail);
    }
  }, [news, savedGuestEmail, user]);

  // Scroll Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleAudioPlayer = () => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ tính năng đọc giọng nói AI.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${news.title}. ${news.excerpt || ''}. ${(news.content || '').substring(0, 800)}`;
      const newUtterance = new SpeechSynthesisUtterance(textToRead);
      newUtterance.lang = 'vi-VN';
      newUtterance.rate = speechRate;
      
      newUtterance.onend = () => setIsPlayingAudio(false);
      newUtterance.onerror = () => setIsPlayingAudio(false);

      setUtterance(newUtterance);
      window.speechSynthesis.speak(newUtterance);
      setIsPlayingAudio(true);
    }
  };

  const handleSpeechRateChange = (rate: number) => {
    setSpeechRate(rate);
    if (isPlayingAudio && utterance) {
      window.speechSynthesis.cancel();
      const textToRead = `${news.title}. ${news.excerpt || ''}. ${(news.content || '').substring(0, 800)}`;
      const newUtterance = new SpeechSynthesisUtterance(textToRead);
      newUtterance.lang = 'vi-VN';
      newUtterance.rate = rate;
      newUtterance.onend = () => setIsPlayingAudio(false);
      newUtterance.onerror = () => setIsPlayingAudio(false);
      setUtterance(newUtterance);
      window.speechSynthesis.speak(newUtterance);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);

    const trimmedName = newCommentName.trim();
    const trimmedEmail = newCommentEmail.trim().toLowerCase();
    const trimmedContent = newCommentText.trim();

    if (!trimmedName) {
      setCommentError('Vui lòng nhập họ và tên của bạn.');
      return;
    }

    if (!trimmedEmail) {
      setCommentError('Vui lòng nhập email của bạn.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setCommentError('Email không hợp lệ. Vui lòng nhập đúng định dạng (ví dụ: abc@gmail.com).');
      return;
    }

    if (!trimmedContent) {
      setCommentError('Vui lòng nhập nội dung ý kiến thảo luận.');
      return;
    }

    const articleId = (news as any)._id || news.id;
    setSubmittingComment(true);
    try {
      const added = await api.news.addComment(articleId, {
        name: trimmedName,
        email: trimmedEmail,
        content: trimmedContent
      });

      localStorage.setItem('ctc_comment_email', trimmedEmail);
      localStorage.setItem('ctc_comment_name', trimmedName);
      setSavedGuestEmail(trimmedEmail);
      setSavedGuestName(trimmedName);

      const newEntry: ReaderComment = {
        id: added._id || added.id || Date.now().toString(),
        name: added.name || trimmedName,
        email: added.email || trimmedEmail,
        avatarBg: 'bg-primary',
        time: 'Vừa xong',
        content: added.content || trimmedContent,
        likes: 0,
        isLiked: false,
        replies: []
      };
      setComments([newEntry, ...comments]);
      setNewCommentText('');
      setCommentError(null);
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      setCommentError(err?.message || 'Lỗi khi gửi bình luận. Vui lòng thử lại.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Like Toggle Logic (Optimistic UI & Anti-duplicate)
  const handleToggleLike = async (commentId: string) => {
    const activeEmail = (isAuthenticated && user ? user.email : savedGuestEmail)?.trim();
    const activeUserId = isAuthenticated && user ? (user.id || (user as any)._id) : undefined;

    // If guest has no saved email, prompt for email once
    if (!activeUserId && !activeEmail) {
      setLikeEmailModal({ isOpen: true, commentId });
      setLikeEmailInput('');
      setLikeEmailError('');
      return;
    }

    await executeLikeToggle(commentId, activeEmail, activeUserId);
  };

  const executeLikeToggle = async (commentId: string, email?: string, userId?: string) => {
    const updateLikesTree = (list: ReaderComment[]): ReaderComment[] => {
      return list.map(item => {
        if (item.id === commentId) {
          const currentlyLiked = !!item.isLiked;
          return {
            ...item,
            isLiked: !currentlyLiked,
            likes: currentlyLiked ? Math.max(0, item.likes - 1) : item.likes + 1
          };
        }
        if (item.replies && item.replies.length > 0) {
          return {
            ...item,
            replies: updateLikesTree(item.replies)
          };
        }
        return item;
      });
    };

    // Optimistic UI update
    setComments(prev => updateLikesTree(prev));

    try {
      const res = await api.news.likeComment(commentId, { email, userId });
      if (res && typeof res.likes === 'number') {
        const syncServerResult = (list: ReaderComment[]): ReaderComment[] => {
          return list.map(item => {
            if (item.id === commentId) {
              return {
                ...item,
                isLiked: res.isLiked,
                likes: res.likes
              };
            }
            if (item.replies && item.replies.length > 0) {
              return {
                ...item,
                replies: syncServerResult(item.replies)
              };
            }
            return item;
          });
        };
        setComments(prev => syncServerResult(prev));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      // Revert if error
      setComments(prev => updateLikesTree(prev));
    }
  };

  const handleConfirmLikeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmed = likeEmailInput.trim().toLowerCase();
    if (!trimmed) {
      setLikeEmailError('Vui lòng nhập email của bạn.');
      return;
    }
    if (!emailRegex.test(trimmed)) {
      setLikeEmailError('Email không hợp lệ. Vui lòng nhập đúng định dạng (ví dụ: abc@gmail.com).');
      return;
    }

    localStorage.setItem('ctc_comment_email', trimmed);
    setSavedGuestEmail(trimmed);
    const targetId = likeEmailModal.commentId;
    setLikeEmailModal({ isOpen: false, commentId: null });

    if (targetId) {
      await executeLikeToggle(targetId, trimmed, undefined);
    }
  };

  // Reply Form Handlers
  const handleOpenReplyForm = (targetComment: ReaderComment) => {
    if (activeReplyId === targetComment.id) {
      setActiveReplyId(null);
    } else {
      setActiveReplyId(targetComment.id);
      setReplyName(savedGuestName || (isAuthenticated && user ? user.name : ''));
      setReplyEmail(savedGuestEmail || (isAuthenticated && user ? user.email : ''));
      setReplyContent('');
      setReplyError(null);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, targetComment: ReaderComment, rootCommentId: string) => {
    e.preventDefault();
    setReplyError(null);

    const trimmedName = replyName.trim();
    const trimmedEmail = replyEmail.trim().toLowerCase();
    const trimmedContent = replyContent.trim();

    if (!trimmedName) {
      setReplyError('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!trimmedEmail) {
      setReplyError('Vui lòng nhập email của bạn.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setReplyError('Email không hợp lệ. Vui lòng nhập đúng định dạng (ví dụ: abc@gmail.com).');
      return;
    }
    if (!trimmedContent) {
      setReplyError('Vui lòng nhập nội dung phản hồi.');
      return;
    }

    setSubmittingReply(true);
    const artId = (news as any)._id || news.id;
    try {
      const added = await api.news.addComment(artId, {
        name: trimmedName,
        email: trimmedEmail,
        content: trimmedContent,
        parentId: targetComment.id,
        replyToName: targetComment.name
      });

      localStorage.setItem('ctc_comment_email', trimmedEmail);
      localStorage.setItem('ctc_comment_name', trimmedName);
      setSavedGuestEmail(trimmedEmail);
      setSavedGuestName(trimmedName);

      const newReplyItem: ReaderComment = {
        id: added._id || added.id || Date.now().toString(),
        name: added.name || trimmedName,
        email: added.email || trimmedEmail,
        avatarBg: 'bg-primary',
        time: 'Vừa xong',
        content: added.content || trimmedContent,
        likes: 0,
        isLiked: false,
        parentId: targetComment.id,
        replyToName: targetComment.name,
        replies: []
      };

      setComments(prev => prev.map(c => {
        if (c.id === rootCommentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newReplyItem]
          };
        }
        return c;
      }));

      setActiveReplyId(null);
      setReplyContent('');
      setReplyError(null);
    } catch (err: any) {
      console.error('Error submitting reply:', err);
      setReplyError(err?.message || 'Lỗi khi gửi phản hồi. Vui lòng thử lại.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const renderInlineReplyForm = (targetComment: ReaderComment, rootCommentId: string) => (
    <form 
      onSubmit={e => handleSubmitReply(e, targetComment, rootCommentId)} 
      className="p-4 rounded-2xl bg-sky-50/50 dark:bg-gray-800/90 border border-sky-200 dark:border-sky-900/60 space-y-3 mt-2 shadow-inner"
    >
      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-sky-200/60 dark:border-gray-700">
        <span className="font-bold text-primary dark:text-sky-400 flex items-center gap-1.5">
          <CornerDownRight size={14} /> Trả lời <span className="underline">@{targetComment.name}</span>
        </span>
        <button
          type="button"
          onClick={() => setActiveReplyId(null)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-semibold flex items-center gap-1"
        >
          <X size={13} /> Đóng
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <input
          type="text"
          required
          placeholder="Họ và tên của bạn..."
          value={replyName}
          onChange={e => { setReplyName(e.target.value); setReplyError(null); }}
          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary"
        />
        <input
          type="email"
          required
          placeholder="Email của bạn..."
          value={replyEmail}
          onChange={e => { setReplyEmail(e.target.value); setReplyError(null); }}
          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary"
        />
      </div>

      <textarea
        required
        rows={2}
        placeholder="Viết phản hồi của bạn..."
        value={replyContent}
        onChange={e => { setReplyContent(e.target.value); setReplyError(null); }}
        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary placeholder-gray-400"
      />

      {replyError && (
        <div className="text-xs text-red-600 dark:text-red-400 font-semibold px-2.5 py-1.5 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900 flex items-center gap-1.5">
          <span>⚠️</span>
          <span>{replyError}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-gray-400 hidden sm:inline">
          Email được bảo mật và dùng cho phản hồi tiếp theo.
        </span>
        <button
          type="submit"
          disabled={submittingReply}
          className="px-4 py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors ml-auto disabled:opacity-50"
        >
          <Send size={12} /> {submittingReply ? 'Đang gửi...' : 'Gửi trả lời'}
        </button>
      </div>
    </form>
  );

  const readingTimeMinutes = Math.max(2, Math.ceil(((news.content || news.excerpt || '').length) / 500));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLike = () => {
    const targetId = (news as any)._id || news.id;
    if (!hasLiked) {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      localStorage.setItem(`ctc_news_liked_${targetId}`, 'true');
      api.news.incrementLike(targetId).catch(err => console.error('Error incrementing like:', err));
    }
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareOnZalo = () => {
    window.open(`https://sp.zalo.me/share_inline?link=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large': return 'text-lg sm:text-xl leading-relaxed';
      case 'xlarge': return 'text-xl sm:text-2xl leading-loose';
      default: return 'text-base sm:text-lg leading-relaxed';
    }
  };

  const rawContent = news.content || news.excerpt || '';
  const isHtmlContent = rawContent.includes('<') && rawContent.includes('>');

  // Dynamic Table of Contents (Mục lục bài viết 100% động từ nội dung)
  const { tocItems, processedContentHtml } = React.useMemo(() => {
    if (!rawContent) return { tocItems: [], processedContentHtml: '' };

    const items: { id: string; text: string; level: number }[] = [];

    if (isHtmlContent) {
      let counter = 0;
      const htmlWithIds = rawContent.replace(/<h([2-4])([^>]*)>(.*?)<\/h\1>/gi, (match, levelStr, attrs, innerText) => {
        const level = parseInt(levelStr, 10);
        const cleanText = innerText.replace(/<[^>]*>?/gm, '').trim();
        if (!cleanText) return match;

        counter++;
        const id = `toc-heading-${counter}`;
        items.push({ id, text: cleanText, level });

        if (/id=["']/i.test(attrs)) {
          return match;
        }
        return `<h${levelStr}${attrs} id="${id}">${innerText}</h${levelStr}>`;
      });

      return { tocItems: items, processedContentHtml: htmlWithIds };
    } else {
      const lines = rawContent.split('\n').map(l => l.trim()).filter(Boolean);
      let counter = 0;
      lines.forEach((line) => {
        if (
          line.length >= 4 &&
          line.length <= 100 &&
          (/^(?:[0-9IVX]+[\.\):]|bước|phần|chương|bài|mục)\s+/i.test(line) ||
           /^[0-9]\.\s+/i.test(line) ||
           /^[A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ\s\-\:]{6,80}$/.test(line))
        ) {
          counter++;
          items.push({
            id: `toc-heading-${counter}`,
            text: line.replace(/^[0-9IVX]+[\.\):]\s*/i, ''),
            level: 2
          });
        }
      });

      if (items.length === 0 && lines.length >= 2) {
        lines.slice(0, 3).forEach((line, idx) => {
          items.push({
            id: `toc-heading-${idx + 1}`,
            text: line.substring(0, 65) + (line.length > 65 ? '...' : ''),
            level: 2
          });
        });
      }

      return { tocItems: items, processedContentHtml: rawContent };
    }
  }, [rawContent, isHtmlContent]);

  const rawParagraphs = isHtmlContent ? [] : rawContent.split('\n').filter(p => p.trim() !== '');

  return (
    <>
      {/* Top Floating Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-gray-200/50 dark:bg-gray-800/50">
        <div 
          className="h-full bg-gradient-to-r from-red-600 via-primary to-amber-400 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <article className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/80 overflow-hidden font-sans">
        
        {/* Newspaper Top Meta Header */}
        <div className="p-6 sm:p-10 md:p-12 pb-6 border-b border-gray-100 dark:border-gray-700/70 space-y-6">
          
          {/* Category Badge & Publication Tag */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 bg-red-600 text-white text-[11px] font-black uppercase tracking-wider rounded-md shadow-sm">
                {news.category || 'TIN TỨC CHUYÊN NGÀNH'}
              </span>
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest hidden sm:inline-block">
                • TẠP CHÍ CTC NEWS
              </span>
            </div>

            {/* Newspaper Font Resizer & Print Controls */}
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/60 p-1 rounded-xl text-xs text-gray-600 dark:text-gray-300">
              <span className="px-2 font-bold text-[11px] text-gray-400 flex items-center gap-1">
                <Type size={13} /> Cỡ chữ:
              </span>
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all ${fontSize === 'normal' ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'hover:text-primary'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all ${fontSize === 'large' ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'hover:text-primary'}`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all ${fontSize === 'xlarge' ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'hover:text-primary'}`}
              >
                A++
              </button>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <button
                onClick={handlePrint}
                className="p-1.5 hover:text-primary transition-colors rounded-lg"
                title="In bài viết"
              >
                <Printer size={15} />
              </button>
            </div>
          </div>

          {/* Newspaper Main Article Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-[1.18] tracking-tight">
            {news.title}
          </h1>

          {/* Sapo / Summary Lead Text */}
          {news.excerpt && (
            <div className="text-base sm:text-xl font-medium text-slate-700 dark:text-slate-200 p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border-l-4 border-red-600 leading-relaxed italic shadow-inner">
              {news.excerpt}
            </div>
          )}

          {/* Byline Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-full">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">
                  CTC
                </div>
                <span className="font-extrabold text-gray-800 dark:text-gray-200">Ban Biên Tập CTC News</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-gray-500">
                <Calendar size={14} className="text-amber-500" />
                <span>{news.date}</span>
              </div>

              <div className="flex items-center gap-1.5 text-gray-500">
                <Clock size={14} className="text-primary" />
                <span>{readingTimeMinutes} phút đọc</span>
              </div>

              <div className="flex items-center gap-1.5 text-gray-500">
                <Eye size={14} className="text-emerald-500" />
                <span>{(news.viewCount || 1).toLocaleString('vi-VN')} lượt xem</span>
              </div>
            </div>

            {/* Quick Bookmark Button */}
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                bookmarked 
                  ? 'bg-amber-500/10 text-amber-600 border-amber-400' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary text-gray-600 dark:text-gray-300'
              }`}
            >
              <Bookmark size={14} className={bookmarked ? 'fill-amber-500' : ''} />
              {bookmarked ? 'Đã lưu bài viết' : 'Lưu đọc sau'}
            </button>
          </div>

          {/* AI Voice Reader Widget ("Nghe đọc bài viết AI CTC") */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-corporate to-slate-900 text-white shadow-md border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAudioPlayer}
                className="w-11 h-11 rounded-full bg-primary hover:bg-secondary text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 flex-shrink-0"
              >
                {isPlayingAudio ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
              </button>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <Volume2 size={12} /> Nghe đọc bài viết AI CTC
                </span>
                <p className="text-xs font-bold text-slate-100">
                  {isPlayingAudio ? 'Đang phát giọng đọc bài viết...' : 'Bấm để nghe giọng đọc bài viết tự động'}
                </p>
              </div>
            </div>

            {/* Speed Toggle */}
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10 text-[11px] font-bold">
              <span className="text-slate-400 px-2">Tốc độ:</span>
              {[1.0, 1.25, 1.5].map(rate => (
                <button
                  key={rate}
                  onClick={() => handleSpeechRateChange(rate)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${speechRate === rate ? 'bg-amber-400 text-slate-900 font-extrabold' : 'hover:bg-white/10'}`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Featured Media Photo & Caption */}
        <div className="p-6 sm:p-10 md:p-12 py-6">
          <figure className="space-y-2">
            <div className="relative h-[320px] sm:h-[480px] w-full overflow-hidden rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 group">
              <img 
                src={news.image} 
                alt={news.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <figcaption className="text-xs text-gray-500 dark:text-gray-400 italic text-center font-medium">
              Hình ảnh: {news.title} — Ảnh chụp tư liệu chính thức tại CTC.
            </figcaption>
          </figure>
        </div>

        {/* Article Main Body Content */}
        <div className="px-6 sm:px-10 md:px-12 pb-10 space-y-8">
          
          {/* Table of Contents Index (Dynamic 100% from Article Headings) */}
          {tocItems.length > 0 && (
            <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-slate-900/80 border border-blue-100 dark:border-blue-900/40 space-y-3">
              <h4 className="font-extrabold text-sm text-blue-900 dark:text-blue-200 flex items-center gap-2">
                <ListOrdered size={16} className="text-primary" />
                MỤC LỤC BÀI VIẾT ({tocItems.length})
              </h4>
              <ul className="text-xs space-y-2 text-slate-700 dark:text-slate-300 font-medium pl-2">
                {tocItems.map((item, idx) => (
                  <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(item.id);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className="hover:text-primary hover:underline transition-colors flex items-start gap-1.5"
                    >
                      <span className="font-bold text-primary text-[11px] min-w-[16px]">{idx + 1}.</span>
                      <span>{item.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Formatted Content - HTML or Plain Text */}
          <div className={`prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 font-sans space-y-6 ${getFontSizeClass()} prose-h2:text-2xl prose-h2:font-bold prose-h2:text-gray-900 prose-h2:dark:text-white prose-h3:text-xl prose-h3:font-semibold prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-ul:list-disc prose-ul:pl-6 prose-img:rounded-xl prose-img:shadow-lg`}>
            {isHtmlContent ? (
              <div dangerouslySetInnerHTML={{ __html: processedContentHtml }} />
            ) : (
              rawParagraphs.map((para, idx) => (
                <p 
                  key={idx} 
                  id={`toc-heading-${idx + 1}`}
                  className={`leading-relaxed ${idx === 0 ? 'first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:text-primary first-letter:leading-none' : ''}`}
                >
                  {para}
                </p>
              ))
            )}
          </div>

          {/* Editorial Reaction & Social Share Bar */}
          <div className="pt-8 border-t border-gray-100 dark:border-gray-700/70 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                hasLiked 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 hover:border-primary text-gray-700 dark:text-gray-200'
              }`}
            >
              <ThumbsUp size={16} className={hasLiked ? 'fill-white' : ''} />
              <span>{hasLiked ? 'Đã thích bài viết' : 'Bài viết hữu ích'} ({likes})</span>
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-400 mr-1">Chia sẻ:</span>
              <button
                onClick={shareOnFacebook}
                className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm"
              >
                Facebook
              </button>
              <button
                onClick={shareOnZalo}
                className="px-3.5 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 transition-colors shadow-sm"
              >
                Zalo
              </button>
              <button 
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all shadow-sm flex items-center gap-1.5"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                {copied ? 'Đã chép' : 'Sao chép Link'}
              </button>
            </div>
          </div>

          {/* Reader Discussion / Comments Section ("Ý kiến độc giả") */}
          <div className="pt-8 border-t border-gray-100 dark:border-gray-700/70 space-y-6">
            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="text-primary" size={20} />
              Ý kiến độc giả ({comments.reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0)})
            </h3>

            {/* Comment Input Form - Public Reader (No Login Required) */}
            <form onSubmit={handleAddComment} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/80 space-y-3.5 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input 
                    type="text" 
                    required
                    placeholder="Họ và tên của bạn..." 
                    value={newCommentName}
                    onChange={e => { setNewCommentName(e.target.value); if (commentError) setCommentError(null); }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary placeholder-gray-400"
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    required
                    placeholder="Email của bạn..." 
                    value={newCommentEmail}
                    onChange={e => { setNewCommentEmail(e.target.value); if (commentError) setCommentError(null); }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary placeholder-gray-400"
                  />
                </div>
              </div>

              <textarea 
                required
                rows={3}
                placeholder="Viết ý kiến thảo luận của bạn về bài viết này..."
                value={newCommentText}
                onChange={e => { setNewCommentText(e.target.value); if (commentError) setCommentError(null); }}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary placeholder-gray-400 transition-colors"
              />

              {commentError && (
                <div className="text-xs text-red-600 dark:text-red-400 font-semibold px-3 py-2 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>{commentError}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400 hidden sm:inline">
                  Ý kiến của bạn sẽ được hiển thị công khai. Email sẽ được bảo mật.
                </span>
                <button 
                  type="submit"
                  disabled={submittingComment}
                  className="px-5 py-2.5 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors ml-auto disabled:opacity-50"
                >
                  <Send size={14} /> {submittingComment ? 'Đang gửi...' : 'Gửi ý kiến'}
                </button>
              </div>
            </form>

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-700/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs">
                💬 Chưa có bình luận nào. Hãy là người đầu tiên gửi ý kiến về bài viết này!
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map(c => (
                  <div key={c.id} className="p-5 rounded-2xl bg-white dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700/80 space-y-3 shadow-sm transition-all">
                    {/* Comment Author & Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {c.avatar ? (
                          <img 
                            src={c.avatar} 
                            alt={c.name} 
                            className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                          />
                        ) : (
                          <div className={`w-9 h-9 rounded-full ${c.avatarBg || 'bg-primary'} text-white font-extrabold text-xs flex items-center justify-center shadow-sm uppercase`}>
                            {(c.name || 'U').charAt(0)}
                          </div>
                        )}
                        <div>
                          <span className="font-extrabold text-xs text-gray-900 dark:text-white block">{c.name}</span>
                          <span className="text-[11px] text-gray-400 font-medium block">{c.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed font-medium pl-11">
                      {c.content}
                    </p>

                    {/* Action Buttons: Like & Reply for Root Comment */}
                    <div className="flex items-center gap-3 pl-11 pt-1">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(c.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                          c.isLiked
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-primary dark:hover:text-sky-400'
                        }`}
                      >
                        <ThumbsUp size={13} className={c.isLiked ? 'fill-white' : ''} />
                        <span>{c.isLiked ? 'Đã thích' : 'Thích'} ({c.likes || 0})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenReplyForm(c)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-primary dark:hover:text-sky-400 transition-all"
                      >
                        <CornerDownRight size={13} />
                        <span>Trả lời</span>
                      </button>
                    </div>

                    {/* Inline Reply Form for Root Comment */}
                    {activeReplyId === c.id && (
                      <div className="pl-11 pt-1">
                        {renderInlineReplyForm(c, c.id)}
                      </div>
                    )}

                    {/* Level 2: Nested Replies (Admin Reply & Reader Replies) */}
                    {c.replies && c.replies.length > 0 && (
                      <div className="space-y-3 pt-2">
                        {c.replies.map(reply => {
                          if (reply.isAdminReply) {
                            // Phản hồi từ Ban Biên Tập CTC
                            return (
                              <div key={reply.id} className="ml-6 sm:ml-11 p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 text-xs space-y-2.5 shadow-sm">
                                <div className="flex items-center gap-1.5 text-primary dark:text-sky-400 font-extrabold text-xs">
                                  <ShieldCheck size={16} className="text-primary dark:text-sky-400 flex-shrink-0" />
                                  <span>Phản hồi từ Ban Biên Tập CTC</span>
                                </div>

                                <div className="pl-4 border-l-2 border-primary/20 dark:border-sky-500/30 ml-1.5 space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                                      {reply.repliedBy?.avatar ? (
                                        <img
                                          src={reply.repliedBy.avatar}
                                          alt={reply.name}
                                          className="w-4 h-4 rounded-full inline-block object-cover border border-sky-400"
                                        />
                                      ) : (
                                        <span className="text-primary dark:text-sky-400">👤</span>
                                      )}
                                      {reply.repliedBy?.name || reply.name || 'Administrator'}
                                    </span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-primary/10 text-primary dark:text-sky-300 rounded border border-primary/20">
                                      Quản trị viên
                                    </span>
                                    {reply.repliedAt && (
                                      <span className="text-[11px] text-gray-400">
                                        • {new Date(reply.repliedAt).toLocaleString('vi-VN')}
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium text-xs">
                                    {reply.content}
                                  </p>

                                  {/* Action Buttons for Admin Reply */}
                                  <div className="flex items-center gap-2.5 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleLike(reply.id)}
                                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                                        reply.isLiked
                                          ? 'bg-blue-600 text-white shadow-sm'
                                          : 'text-gray-600 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 hover:text-primary dark:hover:text-sky-300'
                                      }`}
                                    >
                                      <ThumbsUp size={12} className={reply.isLiked ? 'fill-white' : ''} />
                                      <span>{reply.isLiked ? 'Đã thích' : 'Thích'} ({reply.likes || 0})</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleOpenReplyForm(reply)}
                                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs text-gray-600 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 hover:text-primary dark:hover:text-sky-300 transition-all"
                                    >
                                      <CornerDownRight size={12} />
                                      <span>Trả lời</span>
                                    </button>
                                  </div>

                                  {/* Inline Reply Form for Admin Reply */}
                                  {activeReplyId === reply.id && (
                                    <div className="pt-2">
                                      {renderInlineReplyForm(reply, c.id)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          } else {
                            // Câu trả lời của Độc giả (cấp 2)
                            return (
                              <div key={reply.id} className="ml-6 sm:ml-11 p-4 rounded-2xl bg-gray-50/90 dark:bg-gray-900/50 border border-gray-200/80 dark:border-gray-700/80 text-xs space-y-2 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-extrabold text-[11px] flex items-center justify-center uppercase">
                                      {(reply.name || 'U').charAt(0)}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-extrabold text-xs text-gray-900 dark:text-white">{reply.name}</span>
                                        {reply.replyToName && (
                                          <span className="text-[11px] text-primary dark:text-sky-400 font-semibold flex items-center gap-0.5">
                                            <span>↳</span> <span>@{reply.replyToName}</span>
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-gray-400 font-medium">{reply.time}</span>
                                    </div>
                                  </div>
                                </div>

                                <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed font-medium pl-9">
                                  {reply.content}
                                </p>

                                {/* Action Buttons for Reader Reply */}
                                <div className="flex items-center gap-2.5 pl-9 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleLike(reply.id)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                                      reply.isLiked
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-sky-400'
                                    }`}
                                  >
                                    <ThumbsUp size={12} className={reply.isLiked ? 'fill-white' : ''} />
                                    <span>{reply.isLiked ? 'Đã thích' : 'Thích'} ({reply.likes || 0})</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenReplyForm(reply)}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-sky-400 transition-all"
                                  >
                                    <CornerDownRight size={12} />
                                    <span>Trả lời</span>
                                  </button>
                                </div>

                                {/* Inline Reply Form for Reader Reply */}
                                {activeReplyId === reply.id && (
                                  <div className="pl-9 pt-2">
                                    {renderInlineReplyForm(reply, c.id)}
                                  </div>
                                )}
                              </div>
                            );
                          }
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Nhập Email để Like (Dành cho khách chưa có email) */}
          {likeEmailModal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <ThumbsUp size={16} className="text-primary dark:text-sky-400" />
                    Nhập email để thích bình luận
                  </h4>
                  <button
                    type="button"
                    onClick={() => setLikeEmailModal({ isOpen: false, commentId: null })}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  Email được dùng để ghi nhận lượt thích duy nhất và không bị trùng lặp. Bạn chỉ cần nhập một lần duy nhất.
                </p>

                <form onSubmit={handleConfirmLikeEmail} className="space-y-3">
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="Email của bạn (ví dụ: name@example.com)..."
                    value={likeEmailInput}
                    onChange={e => { setLikeEmailInput(e.target.value); setLikeEmailError(''); }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />

                  {likeEmailError && (
                    <div className="text-xs text-red-600 dark:text-red-400 font-semibold px-2 py-1 bg-red-50 dark:bg-red-950/40 rounded border border-red-200 dark:border-red-900">
                      ⚠️ {likeEmailError}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setLikeEmailModal({ isOpen: false, commentId: null })}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-secondary text-white font-bold text-xs shadow-md transition-colors"
                    >
                      Xác nhận thích
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CTC Expert Author & Consultation Card (Corporate Ocean Blue) */}
          <div className="bg-gradient-to-br from-sky-600 via-blue-800 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row items-center gap-6 border border-sky-400/20 relative overflow-hidden group">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-sky-500/20 blur-3xl group-hover:scale-125 transition-transform" />
            
            <div className="w-20 h-20 rounded-2xl bg-white p-3.5 flex items-center justify-center flex-shrink-0 shadow-xl border border-sky-100">
              <img src={logoSrc} alt="CTC Logo" className="h-full w-auto object-contain" />
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                Tư vấn từ Chuyên gia CTC Solar
              </span>
              <h4 className="font-black text-lg text-white">Bạn cần giải pháp Năng lượng cho Doanh nghiệp?</h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                Đội ngũ kỹ sư CTC Solar luôn sẵn sàng hỗ trợ bạn tính toán công suất, khảo sát mặt bằng và lập báo cáo tài chính dự án miễn phí.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full md:w-auto">
              <Link
                to="/contact"
                className="px-6 py-3 rounded-xl bg-white text-blue-800 font-black text-xs uppercase tracking-wider hover:bg-amber-300 hover:text-slate-900 transition-all text-center shadow-xl flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} /> Liên hệ ngay
              </Link>
              <a
                href="tel:0915059666"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs text-center transition-colors flex items-center justify-center gap-2 backdrop-blur-md"
              >
                <Phone size={15} className="text-amber-400 animate-pulse" /> 0915 059 666
              </a>
            </div>
          </div>

        </div>
      </article>
    </>
  );
};

export default NewsArticleView;
