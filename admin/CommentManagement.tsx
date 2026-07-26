import React, { useEffect, useState } from 'react';
import { 
  MessageSquare, Trash2, ShieldCheck, Search, CornerDownRight, 
  Send, CheckCircle, Clock, Filter, AlertCircle, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';

interface CommentItem {
  _id: string;
  id: string;
  newsId: string;
  name: string;
  email?: string;
  content: string;
  avatar?: string;
  likes?: number;
  isApproved?: boolean;
  reply?: string;
  createdAt: string;
}

const CommentManagement: React.FC = () => {
  const { showToast } = useToast();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await api.news.getAdminComments();
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching admin comments:', err);
      showToast('Lỗi khi tải danh sách bình luận', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

    try {
      await api.news.deleteComment(commentId);
      showToast('Đã xóa bình luận thành công', 'success');
      setComments(comments.filter(c => (c._id || c.id) !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      showToast('Lỗi khi xóa bình luận', 'error');
    }
  };

  const handleSendReply = async (commentId: string) => {
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      await api.news.replyComment(commentId, replyText.trim());
      showToast('Đã phản hồi bình luận thành công', 'success');
      setComments(comments.map(c => {
        if ((c._id || c.id) === commentId) {
          return { ...c, reply: replyText.trim() };
        }
        return c;
      }));
      setReplyingId(null);
      setReplyText('');
    } catch (err) {
      console.error('Error replying to comment:', err);
      showToast('Lỗi khi gửi phản hồi', 'error');
    }
    setSubmittingReply(false);
  };

  const filteredComments = comments.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-primary" size={22} />
            Quản Lý Bình Luận Độc Giả
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Duyệt, phản hồi và quản lý ý kiến độc giả trên các bài viết tin tức.
          </p>
        </div>

        <button
          onClick={fetchComments}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Làm mới ({comments.length})
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc nội dung bình luận..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-xs font-bold text-gray-400">Đang tải danh sách bình luận...</p>
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-gray-400 space-y-2">
          <MessageSquare size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-sm font-bold">Chưa có bình luận nào</p>
          <p className="text-xs text-gray-400">Tất cả ý kiến của độc giả trên website sẽ hiển thị tại đây.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map(c => {
            const commentId = c._id || c.id;
            const isReplying = replyingId === commentId;

            return (
              <div 
                key={commentId}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                {/* Top User Info Bar */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`} 
                      alt={c.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        {c.name}
                        {c.email && (
                          <span className="text-[11px] font-normal text-gray-400">({c.email})</span>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                        <Clock size={12} />
                        <span>{new Date(c.createdAt || Date.now()).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setReplyingId(isReplying ? null : commentId);
                        setReplyText(c.reply || '');
                      }}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <CornerDownRight size={14} />
                      {c.reply ? 'Sửa phản hồi' : 'Phản hồi'}
                    </button>

                    <button
                      onClick={() => handleDelete(commentId)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                      title="Xóa bình luận"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="pl-13 text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-medium bg-gray-50 dark:bg-gray-900/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700/60">
                  {c.content}
                </div>

                {/* Existing Reply if any */}
                {c.reply && !isReplying && (
                  <div className="ml-6 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs space-y-1">
                    <div className="flex items-center justify-between text-primary font-bold">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={14} /> Phản hồi từ Ban Biên Tập CTC
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                      {c.reply}
                    </p>
                  </div>
                )}

                {/* Reply Form */}
                {isReplying && (
                  <div className="ml-6 p-4 rounded-2xl bg-blue-50/80 dark:bg-slate-900 border border-blue-200 dark:border-blue-900 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      <CornerDownRight size={14} /> Trả lời độc giả {c.name}
                    </div>
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Nhập nội dung phản hồi chính thức từ Ban Biên Tập CTC..."
                      className="w-full p-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setReplyingId(null)}
                        className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700"
                      >
                        Hủy
                      </button>
                      <button
                        disabled={submittingReply}
                        onClick={() => handleSendReply(commentId)}
                        className="px-4 py-1.5 bg-primary hover:bg-secondary text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <Send size={12} />
                        {submittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentManagement;
