import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Trash2, ArrowLeft, Search, ImageIcon } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import PriceDisplay from '../components/PriceDisplay';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

interface Product {
  id: string;
  name: string;
  category: string;
  categoryLabel?: string;
  code?: string;
  price?: string;
  originalPrice?: string;
  contactPrice?: boolean;
  image: string;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt: string;
}

const ProductTrash: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Delete Modal States
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    product: null as Product | null,
    type: 'restore' as 'soft' | 'permanent' | 'restore'
  });

  useEffect(() => {
    loadDeletedProducts();
  }, []);

  const loadDeletedProducts = async () => {
    setLoading(true);
    try {
      const deletedProducts = await api.products.getDeleted();
      setProducts(deletedProducts);
      console.log('Loaded deleted products:', deletedProducts);
    } catch (error) {
      console.error('Error loading deleted products:', error);
      showToast('Lỗi khi tải dữ liệu', 'error');
    }
    setLoading(false);
  };

  const openDeleteModal = (product: Product, type: 'permanent' | 'restore') => {
    setDeleteModal({
      isOpen: true,
      product,
      type
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      product: null,
      type: 'restore'
    });
  };

  const handleConfirmAction = async () => {
    if (!deleteModal.product) return;

    const { product, type } = deleteModal;
    
    try {
      if (type === 'restore') {
        await api.products.update(product.id, { isDeleted: false, deletedAt: null });
        showToast(`Đã khôi phục ${product.name}`, 'success');
      } else if (type === 'permanent') {
        await api.products.permanentDelete(product.id);
        showToast(`Đã xóa vĩnh viễn ${product.name}`, 'success');
      }
      loadDeletedProducts();
    } catch (error) {
      console.error('Error:', error);
      showToast('Lỗi khi thực hiện', 'error');
    }
  };

  const handleEmptyTrash = async () => {
    if (products.length === 0) {
      showToast('Thùng rác đã trống', 'info');
      return;
    }

    if (!confirm(`XÓA VĨNH VIỄN TẤT CẢ ${products.length} sản phẩm trong thùng rác?\n\nHành động này KHÔNG THỂ HOÀN TÁC!`)) return;

    try {
      await Promise.all(products.map(p => api.products.delete(p.id)));
      showToast('Đã làm trống thùng rác', 'success');
      loadDeletedProducts();
    } catch (error) {
      console.error('Error emptying trash:', error);
      showToast('Lỗi khi làm trống thùng rác', 'error');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/admin/content?tab=products')}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Thùng rác Sản phẩm</h1>
          </div>
          <p className="text-gray-500 ml-9">{filteredProducts.length} sản phẩm đã xóa</p>
        </div>
        <button
          onClick={handleEmptyTrash}
          disabled={products.length === 0}
          className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 size={18} />
          Làm trống thùng rác
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm đã xóa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Trash2 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            {searchTerm ? 'Không tìm thấy sản phẩm' : 'Thùng rác trống'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Các sản phẩm đã xóa sẽ xuất hiện ở đây'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
              <div className="relative h-48 bg-gray-100">
                {product.image && product.image.trim() !== '' ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="text-center">
                      <ImageIcon size={32} className="text-gray-400 mx-auto mb-2" />
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                  🗑️ ĐÃ XÓA
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.categoryLabel || product.category}</p>
                {product.code && <p className="text-xs text-gray-400 mb-2">📦 Mã: {product.code}</p>}
                
                <div className="mb-3">
                  <PriceDisplay 
                    price={product.price || 0}
                    originalPrice={product.originalPrice}
                    contactPrice={product.contactPrice}
                    size="sm"
                    layout="vertical"
                  />
                </div>
                
                {product.deletedAt && (
                  <p className="text-xs text-red-500 mb-3 bg-red-50 px-2 py-1 rounded">
                    🗑️ Xóa lúc: {new Date(product.deletedAt).toLocaleString('vi-VN')}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => openDeleteModal(product, 'restore')}
                    className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium flex items-center justify-center gap-1"
                  >
                    <RotateCcw size={16} />
                    Khôi phục
                  </button>
                  <button
                    onClick={() => openDeleteModal(product, 'permanent')}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    title="Xóa vĩnh viễn"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete/Restore Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmAction}
        title={deleteModal.type === 'restore' ? 'Khôi phục sản phẩm' : 'Xóa vĩnh viễn'}
        productName={deleteModal.product?.name || ''}
        type={deleteModal.type}
        productImage={deleteModal.product?.image}
        productPrice={deleteModal.product?.price}
        productCategory={deleteModal.product?.categoryLabel || deleteModal.product?.category}
      />
    </div>
  );
};

export default ProductTrash;
