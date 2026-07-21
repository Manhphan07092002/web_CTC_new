import React from 'react';
import { Star, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newReview: {
    userName: string;
    userRole: string;
    userPhone: string;
    rating: number;
    comment: string;
  };
  setNewReview: React.Dispatch<React.SetStateAction<{
    userName: string;
    userRole: string;
    userPhone: string;
    rating: number;
    comment: string;
  }>>;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newReview,
  setNewReview
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-fade-in-up">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
            {t('products.write_review') || 'Viết đánh giá'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:text-gray-400 bg-transparent border-0"
          >
            <X size={20}/>
          </button>
        </div>
        
        {/* Modal Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* Star Rating Selector */}
          <div className="flex flex-col items-center mb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">Rate this product</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className="focus:outline-none transition-transform hover:scale-110 bg-transparent border-0 p-0"
                >
                  <Star 
                    size={32} 
                    fill={star <= newReview.rating ? "#FBBF24" : "none"} 
                    className={star <= newReview.rating ? "text-yellow-400" : "text-gray-300"} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
              {t('common.name') || 'Tên'} <span className="text-red-500">*</span>
            </label>
            <input 
              required
              type="text" 
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm dark:bg-gray-800 dark:text-white"
              value={newReview.userName}
              onChange={e => setNewReview({ ...newReview, userName: e.target.value })}
              placeholder="Name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
                {t('contact.phone') || 'Số điện thoại'} <span className="text-red-500">*</span>
              </label>
              <input 
                required
                type="tel" 
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm dark:bg-gray-800 dark:text-white"
                value={newReview.userPhone}
                onChange={e => setNewReview({ ...newReview, userPhone: e.target.value })}
                placeholder="Phone"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
                Role
              </label>
              <input 
                type="text" 
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm dark:bg-gray-800 dark:text-white"
                value={newReview.userRole}
                onChange={e => setNewReview({ ...newReview, userRole: e.target.value })}
                placeholder="e.g. Customer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
              {t('contact.message') || 'Nội dung'} <span className="text-red-500">*</span>
            </label>
            <textarea 
              required
              rows={4}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none dark:bg-gray-800 dark:text-white"
              value={newReview.comment}
              onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="..."
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-secondary transition-all shadow-md mt-2 border-0"
          >
            {t('common.save') || 'Lưu'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
