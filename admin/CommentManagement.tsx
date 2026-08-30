import React, { useEffect, useState } from 'react';
import { 
  MessageSquare, Trash2, ShieldCheck, Search, CornerDownRight, 
  Send, CheckCircle, Clock, Filter, AlertCircle, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

interface CommentItem {
  _id: string;
  id: string;
  newsId: string;
  parentId?: string | null;
  rootId?: string | null;
  replyToName?: string;
  name: string;
  email?: string;
  content: string;
  avatar?: string;
  likes?: number;
  isApproved?: boolean;
  isAdminReply?: boolean;
  reply?: string;
  replyAuthor?: string;
  repliedAt?: string;
  repliedBy?: {
    id?: any;
    name?: string;
    avatar?: string;
    role?: string;
  };
  createdAt: string;
}

const CommentManagement: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
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

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    comment: CommentItem | null;
  }>({
    isOpen: false,
    comment: null
  });

  const handleDeleteClick = (comment: CommentItem) => {
    setDeleteConfirm({
      isOpen: true,
      comment
    });
  };

  const handleConfirmDelete = async () => {
    const comment = deleteConfirm.comment;
    if (!comment) return;
    const commentId = comment._id || comment.id;

    try {
      await api.news.deleteComment(commentId);
      showToast('Đã xóa bình luận thành công', 'success');
      setComments(comments.filter(c => (c._id || c.id) !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      showToast('Lỗi khi xóa bình luận', 'error');
    } finally {
      setDeleteConfirm({ isOpen: false, comment: null });
    }
  };

  const handleDeleteReply = async (commentId: string) => {
    try {
      await api.news.deleteReply(commentId);
      showToast('Đã xóa phản hồi thành công', 'success');
      setComments(comments.map(c => {
        if ((c._id || c.id) === commentId) {
          const updated = { ...c };
          delete updated.reply;
          return updated;
        }
        return c;
      }));
      if (replyingId === commentId) {
        setReplyingId(null);
        setReplyText('');
      }
    } catch (err) {
      console.error('Error deleting reply:', err);
      showToast('Lỗi khi xóa phản hồi', 'error');
    }
  };

  const handleSendReply = async (commentId: string) => {
    if (!replyText.trim()) {
      handleDeleteReply(commentId);
      return;
    }

    const currentReplier = user ? {
      id: user.id,
      name: user.name || 'Administrator',
      email: user.email,
      avatar: user.avatar,
      role: user.role
    } : {
      name: 'Administrator'
    };

    setSubmittingReply(true);
    try {
      await api.news.replyComment(commentId, replyText.trim(), currentReplier);
      showToast('Đã lưu phản hồi thành công', 'success');
      setComments(comments.map(c => {
        if ((c._id || c.id) === commentId) {
          return {
            ...c,
            reply: replyText.trim(),
            replyAuthor: currentReplier.name,
            repliedBy: currentReplier,
            repliedAt: new Date().toISOString()
          };
        }
        return c;
      }));
      setReplyingId(null);
      setReplyText('');
    } catch (err) {
      console.error('Error replying to comment:', err);
      showToast('Lỗi khi lưu phản hồi', 'error');
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
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                        {c.name}
                        {c.isAdminReply && (
                          <span className="text-[10px] bg-sky-100 dark:bg-sky-950/80 text-primary dark:text-sky-300 px-2 py-0.5 rounded font-bold border border-sky-200 dark:border-sky-800">
                            Ban Biên Tập CTC
                          </span>
                        )}
                        {c.replyToName && (
                          <span className="text-[11px] font-semibold text-primary dark:text-sky-400">
                            ↳ trả lời @{c.replyToName}
                          </span>
                        )}
                        {c.email && (
                          <span className="text-[11px] font-normal text-gray-400">({c.email})</span>
                        )}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(c.createdAt || Date.now()).toLocaleString('vi-VN')}
                        </span>
                        <span className="font-semibold text-gray-600 dark:text-gray-300">
                          👍 {c.likes || 0} lượt thích
                        </span>
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
                      onClick={() => handleDeleteClick(c)}
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
                  <div className="ml-6 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs space-y-2">
                    <div className="flex items-center justify-between text-primary font-bold">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={15} /> Phản hồi từ Ban Biên Tập CTC
                      </span>
                      <button
                        onClick={() => handleDeleteReply(commentId)}
                        className="text-[11px] text-red-500 hover:text-red-700 hover:underline flex items-center gap-1 font-semibold transition-colors"
                        title="Xóa phản hồi này"
                      >
                        <Trash2 size={12} /> Xóa phản hồi
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        👤 {c.repliedBy?.name || c.replyAuthor || 'Administrator'}
                      </span>
                      {(c.repliedBy?.role === 'admin' || c.repliedBy?.role === 'super_admin') && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 dark:bg-blue-900/50 text-primary dark:text-sky-300 rounded">
                          Quản trị viên
                        </span>
                      )}
                      {c.repliedAt && (
                        <span>• {new Date(c.repliedAt).toLocaleString('vi-VN')}</span>
                      )}
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                      {typeof c.reply === 'object' && c.reply ? (c.reply as any).content : c.reply}
                    </p>
                  </div>
                )}

                {/* Reply Form */}
                {isReplying && (
                  <div className="ml-6 p-4 rounded-2xl bg-blue-50/80 dark:bg-slate-900 border border-blue-200 dark:border-blue-900 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2.5 border-b border-blue-200/50 dark:border-gray-700 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-primary dark:text-sky-400">
                        <CornerDownRight size={14} /> Phản hồi ý kiến độc giả <span className="underline">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[11px]">
                        <span>Người trả lời:</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {user?.name || 'Administrator'}
                        </span>
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-primary dark:text-sky-300 px-1.5 py-0.5 rounded font-bold border border-blue-200 dark:border-blue-800">
                          Tài khoản hiện tại
                        </span>
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Nhập nội dung phản hồi chính thức từ Ban Biên Tập CTC (để trống và lưu để xóa phản hồi)..."
                      className="w-full p-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                    />
                    <div className="flex items-center justify-between">
                      {c.reply ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteReply(commentId)}
                          className="px-2.5 py-1.5 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={13} /> Xóa phản hồi
                        </button>
                      ) : <span />}
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
                          {submittingReply ? 'Đang lưu...' : 'Lưu phản hồi'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Comment Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, comment: null })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bình luận"
        itemName={deleteConfirm.comment?.name}
        description={`Bạn có chắc chắn muốn xóa bình luận của "${deleteConfirm.comment?.name}"?`}
        warningText="Bình luận này sẽ bị xóa khỏi bài viết và không thể khôi phục."
        confirmText="Đồng ý xóa"
      />
    </div>
  );
};

export default CommentManagement;
