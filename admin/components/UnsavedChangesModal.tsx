import React from 'react';
import { AlertTriangle, Save, LogOut, RotateCcw } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void; // Stay and continue editing
  onDiscard: () => void; // Discard changes & leave
  onSaveAndExit?: () => void; // Save changes & leave
  title?: string;
  isSaving?: boolean;
}

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onClose,
  onDiscard,
  onSaveAndExit,
  title = 'Bạn có thay đổi chưa được lưu',
  isSaving = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs animate-fadeIn p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-scaleUp">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-amber-100/80 text-amber-600 rounded-2xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Các thông tin bạn vừa nhập hoặc chỉnh sửa sẽ bị mất nếu bạn rời khỏi trang này mà không lưu.
            </p>
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 mb-6">
          <p className="text-xs font-medium text-amber-800 flex items-center gap-1.5">
            <span>💡</span> Bạn có thể chọn <strong>Lưu &amp; Thoát</strong> để không bỏ lỡ dữ liệu đã nhập.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            Tiếp tục sửa
          </button>

          <button
            type="button"
            onClick={onDiscard}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            Bỏ qua &amp; Thoát
          </button>

          {onSaveAndExit && (
            <button
              type="button"
              onClick={onSaveAndExit}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu &amp; Thoát
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesModal;
