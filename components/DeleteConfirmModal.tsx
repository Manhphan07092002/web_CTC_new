import React from 'react';
import { AlertTriangle, Trash2, X, RotateCcw } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  productName?: string;
  type?: 'soft' | 'permanent' | 'restore' | 'hard';
  itemImage?: string;
  productImage?: string;
  itemPrice?: string;
  productPrice?: string;
  itemCategory?: string;
  productCategory?: string;
  itemType?: 'product' | 'news' | 'project' | 'partner' | 'testimonial' | 'category' | 'user' | 'role';
  description?: string;
  warningText?: string;
  confirmText?: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  productName,
  type = 'hard',
  itemImage,
  productImage,
  itemPrice,
  productPrice,
  itemCategory,
  productCategory,
  itemType = 'product',
  description,
  warningText,
  confirmText
}) => {
  const name = itemName || productName || '';
  const img = itemImage || productImage;
  const price = itemPrice || productPrice;
  const cat = itemCategory || productCategory;

  if (!isOpen) return null;

  const getConfig = () => {
    switch (type) {
      case 'soft':
        return {
          icon: <Trash2 size={24} className="text-orange-600" />,
          bgColor: 'bg-gradient-to-r from-orange-500/10 to-amber-500/10',
          borderColor: 'border-orange-100',
          buttonColor: 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-500/25',
          iconBg: 'bg-orange-100 text-orange-600 ring-4 ring-orange-50',
          title: title || 'Chuyển vào thùng rác',
          description: description || 'Mục này sẽ được chuyển vào thùng rác và có thể khôi phục sau.',
          actionText: confirmText || 'Chuyển vào thùng rác',
          warning: false
        };
      case 'permanent':
        return {
          icon: <AlertTriangle size={24} className="text-red-600" />,
          bgColor: 'bg-gradient-to-r from-red-500/10 to-rose-500/10',
          borderColor: 'border-red-100',
          buttonColor: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/25',
          iconBg: 'bg-red-100 text-red-600 ring-4 ring-red-50',
          title: title || 'Xóa vĩnh viễn',
          description: description || 'Hành động này KHÔNG THỂ HOÀN TÁC! Dữ liệu sẽ bị xóa hoàn toàn khỏi hệ thống.',
          actionText: confirmText || 'Xóa vĩnh viễn',
          warning: true
        };
      case 'restore':
        return {
          icon: <RotateCcw size={24} className="text-emerald-600" />,
          bgColor: 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10',
          borderColor: 'border-emerald-100',
          buttonColor: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25',
          iconBg: 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50',
          title: title || 'Khôi phục mục này',
          description: description || 'Dữ liệu sẽ được khôi phục và hiển thị trở lại trong danh sách.',
          actionText: confirmText || 'Khôi phục',
          warning: false
        };
      case 'hard':
      default:
        const itemTypeText = itemType === 'category' ? 'danh mục' :
                           itemType === 'news' ? 'tin tức' : 
                           itemType === 'project' ? 'dự án' :
                           itemType === 'partner' ? 'đối tác' :
                           itemType === 'testimonial' ? 'đánh giá' :
                           itemType === 'user' ? 'người dùng' :
                           itemType === 'role' ? 'vai trò' : 'mục này';
        return {
          icon: <Trash2 size={24} className="text-red-600" />,
          bgColor: 'bg-gradient-to-r from-red-500/10 to-rose-500/10',
          borderColor: 'border-red-100',
          buttonColor: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/25',
          iconBg: 'bg-red-100 text-red-600 ring-4 ring-red-50',
          title: title || `Xác nhận xóa ${itemTypeText}`,
          description: description || `${itemTypeText.charAt(0).toUpperCase() + itemTypeText.slice(1)} sẽ bị xóa vĩnh viễn khỏi hệ thống.`,
          actionText: confirmText || 'Đồng ý xóa',
          warning: true
        };
    }
  };

  const config = getConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 transform transition-all duration-300 scale-100 animate-scale-up z-10">
        
        {/* Header */}
        <div className={`${config.bgColor} border-b ${config.borderColor} px-6 py-5 flex items-center justify-between`}>
          <div className="flex items-center gap-3.5">
            <div className={`${config.iconBg} p-2.5 rounded-2xl flex items-center justify-center transition-transform hover:scale-105`}>
              {config.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">{config.title}</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Xác nhận hành động</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white/80 transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          
          {/* Target Item Highlight */}
          {name && (
            <div className="flex items-center gap-4 p-4 bg-slate-50/80 border border-slate-100 rounded-2xl">
              {img ? (
                <img 
                  src={img} 
                  alt={name}
                  className="w-14 h-14 object-cover rounded-xl shadow-sm border border-white"
                />
              ) : (
                <div className="w-12 h-12 bg-red-100/70 text-red-600 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-base truncate">{name}</h4>
                {cat && <p className="text-xs text-gray-500 mt-0.5 font-medium">{cat}</p>}
                {price && <p className="text-xs font-semibold text-primary mt-1">{price}</p>}
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed font-normal">
            {config.description}
          </p>

          {/* Special Warning Box */}
          {(warningText || config.warning) && (
            <div className="bg-amber-50/90 border border-amber-200/70 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold text-amber-900 block mb-0.5">Lưu ý quan trọng:</span>
                <span className="text-amber-800 font-medium">
                  {warningText || 'Hành động này sẽ xóa dữ liệu và không thể hoàn tác sau khi thực hiện.'}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-5 py-3 rounded-2xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-semibold text-sm transition-all duration-200 active:scale-95"
            >
              Hủy bỏ
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-5 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 active:scale-95 ${config.buttonColor}`}
            >
              {config.actionText}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DeleteConfirmModal;
