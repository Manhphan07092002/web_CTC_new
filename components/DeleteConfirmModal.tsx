import React from 'react';
import { AlertTriangle, Trash2, X, RotateCcw } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  type: 'soft' | 'permanent' | 'restore' | 'hard';
  itemImage?: string;
  itemPrice?: string;
  itemCategory?: string;
  itemType?: 'product' | 'news' | 'project' | 'partner' | 'testimonial';
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  type,
  itemImage,
  itemPrice,
  itemCategory,
  itemType = 'product'
}) => {
  if (!isOpen) return null;

  const getConfig = () => {
    switch (type) {
      case 'soft':
        return {
          icon: <Trash2 size={48} className="text-orange-500" />,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          buttonColor: 'bg-orange-600 hover:bg-orange-700',
          iconBg: 'bg-orange-100',
          title: 'Chuyển vào thùng rác',
          description: 'Sản phẩm sẽ được chuyển vào thùng rác và có thể khôi phục sau.',
          actionText: 'Chuyển vào thùng rác',
          warning: false
        };
      case 'permanent':
        return {
          icon: <AlertTriangle size={48} className="text-red-500" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          iconBg: 'bg-red-100',
          title: 'Xóa vĩnh viễn',
          description: 'Hành động này KHÔNG THỂ HOÀN TÁC! Sản phẩm sẽ bị xóa hoàn toàn khỏi hệ thống.',
          actionText: 'Xóa vĩnh viễn',
          warning: true
        };
      case 'restore':
        return {
          icon: <RotateCcw size={48} className="text-green-500" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          iconBg: 'bg-green-100',
          title: 'Khôi phục sản phẩm',
          description: 'Sản phẩm sẽ được khôi phục và hiển thị trở lại trong danh sách.',
          actionText: 'Khôi phục',
          warning: false
        };
      case 'hard':
        const itemTypeText = itemType === 'news' ? 'tin tức' : 
                           itemType === 'project' ? 'dự án' :
                           itemType === 'partner' ? 'đối tác' :
                           itemType === 'testimonial' ? 'đánh giá' : 'nội dung';
        return {
          icon: <Trash2 size={48} className="text-red-500" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          iconBg: 'bg-red-100',
          title: `Xóa ${itemTypeText}`,
          description: `${itemTypeText.charAt(0).toUpperCase() + itemTypeText.slice(1)} sẽ bị xóa vĩnh viễn khỏi hệ thống.`,
          actionText: 'Xóa',
          warning: true
        };
    }
  };

  const config = getConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className={`${config.bgColor} ${config.borderColor} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`${config.iconBg} p-2 rounded-full`}>
                {config.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800">{config.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Product Info */}
          <div className="flex items-start gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
            {itemImage ? (
              <img 
                src={itemImage} 
                alt={itemName}
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 mb-1 line-clamp-2">{itemName}</h4>
              {itemCategory && (
                <p className="text-sm text-gray-500 mb-1">{itemCategory}</p>
              )}
              {itemPrice && (
                <p className="text-sm font-medium text-primary">{itemPrice}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-4">{config.description}</p>

          {/* Warning */}
          {config.warning && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium text-sm">Cảnh báo!</p>
                  <p className="text-red-700 text-sm">
                    Sau khi xóa vĩnh viễn, bạn sẽ không thể khôi phục sản phẩm này.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-3 text-white rounded-xl font-medium transition-colors ${config.buttonColor}`}
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
