import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Product, Review } from '../types';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import { chatService } from '../services/chatService';
import analyticsTracking from '../services/analytics-tracking';
import { 
  ProductGallery, 
  ProductInfo, 
  ProductActions, 
  ProductAIPanel, 
  ProductTabs, 
  ReviewModal, 
  RelatedProducts 
} from '../components/products-details';
import Loading from '../components/Loading';
import { useCart } from '../contexts/CartContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [allCatalogProducts, setAllCatalogProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  
  // AI States
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiComparison, setAiComparison] = useState<string>('');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiCompareLoading, setAiCompareLoading] = useState(false);

  // Review States
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    userName: '',
    userRole: '',
    userPhone: '',
    rating: 5,
    comment: ''
  });

  // Engagement States
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [shares, setShares] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; x: number }>>([]);
  const [floatingShares, setFloatingShares] = useState<Array<{ id: number; x: number }>>([]);
  
  // Track if view has been incremented for this product (prevent double increment in StrictMode)
  const viewIncrementedRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        setLoading(true);
        const [productData, reviewsData] = await Promise.all([
          api.products.getById(id),
          api.reviews.getByProductId(id)
        ]);
        
        setProduct(productData);
        setReviews(reviewsData || []);
        
        // Set engagement stats
        setLikes(productData?.likes || 0);
        setShares(productData?.shares || 0);
        
        // Increment view count (only once per product)
        if (productData && viewIncrementedRef.current !== id) {
          viewIncrementedRef.current = id;
          
          analyticsTracking.trackProductView(
            id,
            productData.name,
            productData.category
          );
          
          api.products.incrementView(id).then(result => {
            setViews(result.views);
          }).catch(err => {
            console.error('Error incrementing view:', err);
            setViews(productData?.views || 0);
          });
        } else {
          setViews(productData?.views || 0);
        }
        
        if (productData) {
          const allProducts = await api.products.getAll();
          setAllCatalogProducts(allProducts || []);
          const related = (allProducts || []).filter(p => p.category === productData.category && p.id !== productData.id).slice(0, 4);
          setRelatedProducts(related);
        }

        setLoading(false);
        setAiSummary('');
        setAiComparison('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    fetchProduct();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      const reviewData = {
        userName: newReview.userName,
        userRole: newReview.userRole,
        userPhone: newReview.userPhone,
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString().split('T')[0]
      };
      
      await api.reviews.addToProduct(id, reviewData);
      
      const updatedReviews = await api.reviews.getByProductId(id);
      setReviews(updatedReviews || []);
      
      setIsReviewModalOpen(false);
      setNewReview({ userName: '', userRole: '', userPhone: '', rating: 5, comment: '' });
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
    }
  };

  const handleAISummary = async () => {
    if (!product || aiSummary) return;
    
    setAiSummaryLoading(true);
    const prompt = `Phân tích ngắn gọn sản phẩm sau:

${product.name}
Công suất: ${product.power || 'N/A'}W | Hiệu suất: ${product.efficiency || 'N/A'}%

Trả lời TỐI ĐA 150 từ, bao gồm:
1. Tóm tắt 1 câu
2. 3 ưu điểm chính (mỗi điểm 1 dòng)
3. Phù hợp cho ai (1 câu)

Ngắn gọn, súc tích, tiếng Việt.`;

    try {
      const response = await chatService.sendMessage(prompt);
      setAiSummary(response);
    } catch (error) {
      setAiSummary('Không thể tạo tóm tắt AI. Vui lòng thử lại sau.');
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const handleAIComparison = async (selectedProducts: Product[]) => {
    if (!product || !selectedProducts || selectedProducts.length < 2) return;
    
    setAiCompareLoading(true);
    
    const productDescs = selectedProducts.map((p, idx) => {
      const rawPrice = (p as any).price;
      const formattedPrice = typeof rawPrice === 'number' 
        ? rawPrice.toLocaleString('vi-VN') + 'đ' 
        : (rawPrice || 'Liên hệ');
      const brandStr = (p as any).brand || 'CTC';
      return `SẢN PHẨM ${idx + 1}: ${p.name}
- Công suất: ${p.power || 'N/A'}W
- Hiệu suất: ${p.efficiency || 'N/A'}%
- Giá: ${formattedPrice}
- Thương hiệu: ${brandStr}`;
    }).join('\n\n');

    const headers = selectedProducts.map((p) => p.name).join(' | ');

    const prompt = `Bạn là Chuyên gia Kỹ thuật Điện Mặt trời CTC. Hãy lập BẢNG SO SÁNH MARKDOWN chính xác giữa ${selectedProducts.length} sản phẩm sau:

${productDescs}

Bắt buộc tuân thủ Cấu trúc Bảng Markdown duy nhất (Cột 1 Luôn luôn có tiêu đề là "TIÊU CHÍ", các cột tiếp theo là Tên sản phẩm):

| TIÊU CHÍ | ${headers} |
| Tên mẫu | ${headers} |
| Giá bán | ... | ... |
| Công suất | ... | ... |
| Hiệu suất (%) | ... | ... |
| Điểm nổi bật | ... | ... |
| Phù hợp nhu cầu | ... | ... |

Sau bảng so sánh, hãy viết phần "ĐÁNH GIÁ & KHUYÊN DÙNG CHI TIẾT CỦA AI CTC:" (dùng các dấu gạch đầu dòng - để phân tích rõ từng sản phẩm).`;

    try {
      const response = await chatService.sendMessage(prompt);
      setAiComparison(response);
    } catch (error) {
      setAiComparison('Không thể tạo so sánh AI. Vui lòng thử lại sau.');
    } finally {
      setAiCompareLoading(false);
    }
  };

  const handleLike = async () => {
    if (!id || isLiking) return;
    
    setIsLiking(true);
    const heartId = Date.now();
    const randomX = Math.random() * 60 - 30;
    setFloatingHearts(prev => [...prev, { id: heartId, x: randomX }]);
    
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== heartId));
    }, 2000);
    
    try {
      const result = await api.products.incrementLike(id);
      setLikes(result.likes);
    } catch (error) {
      console.error('Error liking product:', error);
    } finally {
      setTimeout(() => setIsLiking(false), 300);
    }
  };

  const handleShare = async () => {
    if (!id || isSharing) return;
    
    setIsSharing(true);
    const shareId = Date.now();
    const randomX = Math.random() * 60 - 30;
    setFloatingShares(prev => [...prev, { id: shareId, x: randomX }]);
    
    setTimeout(() => {
      setFloatingShares(prev => prev.filter(s => s.id !== shareId));
    }, 2000);
    
    try {
      const result = await api.products.incrementShare(id);
      setShares(result.shares);
      
      if (navigator.share) {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link đã được sao chép!');
      }
    } catch (error) {
      console.error('Error sharing product:', error);
    } finally {
      setTimeout(() => setIsSharing(false), 300);
    }
  };

  if (loading) {
    return <Loading fullScreen={false} className="h-[60vh]" />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
          {t('products.no_result') || 'Không tìm thấy sản phẩm'}
        </h2>
        <Link to="/products" className="text-primary hover:underline mt-4 block">
          {t('common.view_details') || 'Quay lại danh sách'}
        </Link>
      </div>
    );
  }

  const imageList = product.images && product.images.length > 0 ? product.images : [product.image];

  const getProductSchema = (p: Product) => ({
    "@context": "https://schema.org/",
    "@type": "Product",
    "@id": `${window.location.origin}/products/${id}`,
    "name": p.name,
    "image": imageList,
    "description": p.description,
    "sku": id,
    "brand": { 
      "@type": "Brand", 
      "name": (p as any).brand || "CTC" 
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "Công ty Cổ phần Xây lắp Bưu điện Miền Trung",
      "url": "https://www.ctcdn.vn"
    },
    "offers": {
      "@type": "Offer",
      "url": `${window.location.origin}/products/${id}`,
      "priceCurrency": "VND",
      "price": p.price || "0",
      "availability": (p.stock && p.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "CTC",
        "url": "https://www.ctcdn.vn"
      }
    },
    "aggregateRating": reviews.length > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1),
      "reviewCount": reviews.length,
      "bestRating": 5,
      "worstRating": 1
    } : undefined
  });

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 font-sans text-gray-700 dark:text-gray-300 pb-20 animate-fade-in relative">
      <SEO 
        title={product.name}
        description={product.description.substring(0, 160)}
        image={imageList[0]}
        schema={getProductSchema(product)}
      />

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-primary flex items-center gap-1">
              <Home size={14}/> {t('nav.home')}
            </Link>
            <ChevronRight size={14} className="mx-2"/>
            <Link to="/products" className="hover:text-primary">{t('nav.products')}</Link>
            <ChevronRight size={14} className="mx-2"/>
            <span className="text-corporate font-semibold truncate">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 md:p-10 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Image Gallery */}
            <ProductGallery 
              images={imageList}
              productName={product.name}
              categoryName={product.category}
            />

            {/* Info Section */}
            <div className="flex flex-col justify-between space-y-8">
              <ProductInfo 
                product={product}
                averageRating={averageRating}
                reviewsCount={reviews.length}
                views={views}
              />

              <ProductActions 
                warranty={product.warranty}
                likes={likes}
                shares={shares}
                isLiking={isLiking}
                isSharing={isSharing}
                floatingHearts={floatingHearts}
                floatingShares={floatingShares}
                onLike={handleLike}
                onShare={handleShare}
                onCallBuy={() => { window.location.href = "tel:0915059666"; }}
                onAddToQuote={() => addToCart(product)}
              />
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <ProductAIPanel 
          currentProduct={product}
          productName={product.name}
          aiSummary={aiSummary}
          aiComparison={aiComparison}
          aiSummaryLoading={aiSummaryLoading}
          aiCompareLoading={aiCompareLoading}
          onFetchSummary={handleAISummary}
          onFetchComparison={handleAIComparison}
          hasRelatedProducts={relatedProducts.length > 0}
          allCatalogProducts={allCatalogProducts}
        />

        {/* Details Tabs */}
        <ProductTabs 
          product={product}
          reviews={reviews}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onWriteReviewClick={() => setIsReviewModalOpen(true)}
        />

        {/* Related Products */}
        <RelatedProducts relatedProducts={relatedProducts} />
      </div>

      {/* Review Modal Form */}
      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        newReview={newReview}
        setNewReview={setNewReview}
      />
    </div>
  );
};

export default ProductDetail;
