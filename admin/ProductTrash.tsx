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
  vat?: number;
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
      showToast('Lá»—i khi táº£i dá»¯ liá»‡u', 'error');
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
        showToast(`ÄÃ£ khÃ´i phá»¥c ${product.name}`, 'success');
      } else if (type === 'permanent') {
        await api.products.permanentDelete(product.id);
        showToast(`ÄÃ£ xÃ³a vÄ©nh viá»…n ${product.name}`, 'success');
      }
      loadDeletedProducts();
    } catch (error) {
      console.error('Error:', error);
      showToast('Lá»—i khi thá»±c hiá»‡n', 'error');
    }
  };

  const [emptyTrashConfirm, setEmptyTrashConfirm] = useState(false);

  const handleEmptyTrash = () => {
    if (products.length === 0) {
      showToast('ThÃ¹ng rÃ¡c Ä‘Ã£ trá»‘ng', 'info');
      return;
    }
    setEmptyTrashConfirm(true);
  };

  const handleConfirmEmptyTrash = async () => {
    try {
      await Promise.all(products.map(p => api.products.permanentDelete ? api.products.permanentDelete(p.id) : api.products.delete(p.id)));
      showToast('ÄÃ£ lÃ m trá»‘ng thÃ¹ng rÃ¡c thÃ nh cÃ´ng!', 'success');
      loadDeletedProducts();
    } catch (error) {
      console.error('Error emptying trash:', error);
      showToast('Lá»—i khi lÃ m trá»‘ng thÃ¹ng rÃ¡c', 'error');
    } finally {
      setEmptyTrashConfirm(false);
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
            <h1 className="text-3xl font-bold text-gray-800">ThÃ¹ng rÃ¡c Sáº£n pháº©m</h1>
          </div>
          <p className="text-gray-500 ml-9">{filteredProducts.length} sáº£n pháº©m Ä‘Ã£ xÃ³a</p>
        </div>
        <button
          onClick={handleEmptyTrash}
          disabled={products.length === 0}
          className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 size={18} />
          LÃ m trá»‘ng thÃ¹ng rÃ¡c
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="TÃ¬m kiáº¿m sáº£n pháº©m Ä‘Ã£ xÃ³a..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-4">Äang táº£i...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800/90 rounded-xl border border-gray-100 dark:border-slate-700/60">
          <Trash2 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            {searchTerm ? 'KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m' : 'ThÃ¹ng rÃ¡c trá»‘ng'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm ? 'Thá»­ tÃ¬m kiáº¿m vá»›i tá»« khÃ³a khÃ¡c' : 'CÃ¡c sáº£n pháº©m Ä‘Ã£ xÃ³a sáº½ xuáº¥t hiá»‡n á»Ÿ Ä‘Ã¢y'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden opacity-85 hover:opacity-100 transition-opacity flex flex-col justify-between">
              <div>
                <div className="relative h-36 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100">
                  {product.image && product.image.trim() !== '' ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <ImageIcon size={28} className="text-gray-400 mx-auto mb-1" />
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                    ðŸ—‘ï¸ ÄÃƒ XÃ“A
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 truncate">
                    {product.categoryLabel || product.category || 'Sáº£n pháº©m'}
                  </p>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 text-xs line-clamp-2 min-h-[32px] mb-1" title={product.name}>{product.name}</h3>
                  {product.code && <p className="text-[10px] text-gray-400 mb-1.5 truncate">ðŸ“¦ MÃ£: {product.code}</p>}
                  
                  <div className="mb-2">
                    <PriceDisplay 
                      price={product.price || 0}
                      originalPrice={product.originalPrice}
                      contactPrice={product.contactPrice}
                      size="sm"
                      layout="vertical"
                    />
                  </div>
                  
                  {product.deletedAt && (
                    <p className="text-[10px] text-red-500 mb-2 bg-red-50 px-2 py-0.5 rounded truncate">
                      ðŸ—‘ï¸ XÃ³a: {new Date(product.deletedAt).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 pt-0 flex gap-1.5">
                <button
                  onClick={() => openDeleteModal(product, 'restore')}
                  className="flex-1 px-2 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-xs font-medium flex items-center justify-center gap-1"
                >
                  <RotateCcw size={14} />
                  KhÃ´i phá»¥c
                </button>
                <button
                  onClick={() => openDeleteModal(product, 'permanent')}
                  className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs"
                  title="XÃ³a vÄ©nh viá»…n"
                >
                  <Trash2 size={14} />
                </button>
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
        title={deleteModal.type === 'restore' ? 'KhÃ´i phá»¥c sáº£n pháº©m' : 'XÃ³a vÄ©nh viá»…n'}
        productName={deleteModal.product?.name || ''}
        type={deleteModal.type}
        productImage={deleteModal.product?.image}
        productPrice={deleteModal.product?.price}
        productCategory={deleteModal.product?.categoryLabel || deleteModal.product?.category}
      />

      {/* Empty Trash Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={emptyTrashConfirm}
        onClose={() => setEmptyTrashConfirm(false)}
        onConfirm={handleConfirmEmptyTrash}
        title="LÃ m trá»‘ng thÃ¹ng rÃ¡c"
        type="permanent"
        itemName={`Táº¥t cáº£ ${products.length} sáº£n pháº©m`}
        description={`Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a vÄ©nh viá»…n toÃ n bá»™ ${products.length} sáº£n pháº©m trong thÃ¹ng rÃ¡c?`}
        warningText="Táº¤T Cáº¢ sáº£n pháº©m trong thÃ¹ng rÃ¡c sáº½ bá»‹ xÃ³a vÄ©nh viá»…n vÃ  khÃ´ng thá»ƒ khÃ´i phá»¥c!"
        confirmText="XÃ³a sáº¡ch thÃ¹ng rÃ¡c"
      />
    </div>
  );
};

export default ProductTrash;

