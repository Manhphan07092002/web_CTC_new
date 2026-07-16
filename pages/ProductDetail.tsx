
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Product, Review } from '../types';
import { ShoppingCart, CreditCard, CheckCircle, Star, Share2, ChevronRight, Home, Phone, ShieldCheck, ChevronLeft, X, MessageSquare, Eye, Sparkles, GitCompare, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import PriceDisplay from '../components/PriceDisplay';
import { chatService } from '../services/chatService';
import analyticsTracking from '../services/analytics-tracking';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [activeAITab, setActiveAITab] = useState<'summary' | 'compare'>('summary');
  
  // AI States
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiComparison, setAiComparison] = useState<string>('');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiCompareLoading, setAiCompareLoading] = useState(false);
  
  // Image Gallery States
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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

  const PLACEHOLDER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent('<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#F3F4F6"/><g transform="translate(110, 60)"><path d="M160 120L110 60L80 95L30 30L0 120H160Z" fill="#D1D5DB"/><circle cx="130" cy="35" r="20" fill="#D1D5DB"/></g><text x="200" y="220" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" font-weight="500" fill="#9CA3AF">No Image</text></svg>');

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
        
        // Set engagement stats (likes and shares only, views will be updated by incrementView)
        setLikes(productData?.likes || 0);
        setShares(productData?.shares || 0);
        
        // Increment view count (only once per product)
        if (productData && viewIncrementedRef.current !== id) {
          viewIncrementedRef.current = id; // Mark as incremented
          
          // Track product view in analytics
          analyticsTracking.trackProductView(
            id,
            productData.name,
            productData.category
          );
          
          // Call increment view API and update state with the new value
          api.products.incrementView(id).then(result => {
            setViews(result.views);
          }).catch(err => {
            console.error('Error incrementing view:', err);
            // Fallback to current views if API fails
            setViews(productData?.views || 0);
          });
        } else {
          // If already incremented, just set the current views
          setViews(productData?.views || 0);
        }
        
        if (productData) {
          const allProducts = await api.products.getAll();
          // Filter related products (same category, not current one)
          const related = allProducts.filter(p => p.category === productData.category && p.id !== productData.id).slice(0, 4);
          setRelatedProducts(related);
        }

        setLoading(false);
        setCurrentImageIndex(0); // Reset gallery
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    fetchProduct();
  }, [id]);

  // Derived list of images. If product.images exists use it, otherwise use single product.image
  const imageList = product ? (product.images && product.images.length > 0 ? product.images : [product.image]) : [];

  // Auto-play logic
  useEffect(() => {
    let interval: any;

    // Only auto-play if there are multiple images and user is not hovering
    if (imageList.length > 1 && !isHovered) {
      interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageList.length);
      }, 4000); // 4 seconds per slide
    }

    return () => clearInterval(interval);
  }, [imageList.length, isHovered]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imageList.length);
  };

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
      
      // Reload reviews
      const updatedReviews = await api.reviews.getByProductId(id);
      setReviews(updatedReviews || []);
      
      setIsReviewModalOpen(false);
      setNewReview({ userName: '', userRole: '', userPhone: '', rating: 5, comment: '' });
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
    }
  };

  // AI Summary Handler
  const handleAISummary = async () => {
    if (!product || aiSummary) return; // Skip if already loaded
    
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

  // AI Comparison Handler
  const handleAIComparison = async () => {
    if (!product || aiComparison || relatedProducts.length === 0) return;
    
    setAiCompareLoading(true);
    const relatedProduct = relatedProducts[0]; // Compare with first related product
    
    const prompt = `So sánh 2 sản phẩm sau theo dạng bảng:

SẢN PHẨM A: ${product.name}
- Công suất: ${product.power || 'N/A'}W
- Hiệu suất: ${product.efficiency || 'N/A'}%
- Giá: ${product.price || 'Liên hệ'}

SẢN PHẨM B: ${relatedProduct.name}
- Công suất: ${relatedProduct.power || 'N/A'}W
- Hiệu suất: ${relatedProduct.efficiency || 'N/A'}%
- Giá: ${relatedProduct.price || 'Liên hệ'}

Hãy trả lời theo format:
TIÊU CHÍ | SẢN PHẨM A | SẢN PHẨM B
(Mỗi dòng so sánh 1 tiêu chí: Công suất, Hiệu suất, Giá, Ưu điểm, Phù hợp)

Sau đó thêm 1-2 câu kết luận ngắn gọn.`;

    try {
      const response = await chatService.sendMessage(prompt);
      setAiComparison(response);
    } catch (error) {
      setAiComparison('Không thể tạo so sánh AI. Vui lòng thử lại sau.');
    } finally {
      setAiCompareLoading(false);
    }
  };

  // Trigger AI when AI tab is clicked
  useEffect(() => {
    if (activeAITab === 'summary' && !aiSummary) {
      handleAISummary();
    } else if (activeAITab === 'compare' && !aiComparison) {
      handleAIComparison();
    }
  }, [activeAITab]);

  // Handle Like with floating hearts
  const handleLike = async () => {
    if (!id || isLiking) return;
    
    setIsLiking(true);
    
    // Create floating heart
    const heartId = Date.now();
    const randomX = Math.random() * 60 - 30; // Random position -30 to 30
    setFloatingHearts(prev => [...prev, { id: heartId, x: randomX }]);
    
    // Remove heart after animation
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

  // Handle Share with floating icons
  const handleShare = async () => {
    if (!id || isSharing) return;
    
    setIsSharing(true);
    
    // Create floating share icon
    const shareId = Date.now();
    const randomX = Math.random() * 60 - 30; // Random position -30 to 30
    setFloatingShares(prev => [...prev, { id: shareId, x: randomX }]);
    
    // Remove share icon after animation
    setTimeout(() => {
      setFloatingShares(prev => prev.filter(s => s.id !== shareId));
    }, 2000);
    
    try {
      const result = await api.products.incrementShare(id);
      setShares(result.shares);
      
      // Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link đã được sao chép!');
      }
    } catch (error) {
      console.error('Error sharing product:', error);
    } finally {
      setTimeout(() => setIsSharing(false), 300);
    }
  };

  if (loading) return <div className="w-full h-[60vh] flex items-center justify-center"><div className="animate-spin-slow text-primary text-4xl">☀️</div></div>;

  if (!product) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">{t('products.no_result')}</h2>
      <Link to="/products" className="text-primary hover:underline mt-4 block">{t('common.view_details')}</Link>
    </div>
  );

  const getProductSchema = (product: Product) => ({
    "@context": "https://schema.org/",
    "@type": "Product",
    "@id": `${window.location.origin}/products/${id}`,
    "name": product.name,
    "image": imageList,
    "description": product.description,
    "sku": id,
    "brand": { 
      "@type": "Brand", 
      "name": (product as any).brand || "CTC" 
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
      "price": product.price || "0",
      "availability": (product.stock && product.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
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
    <div className="bg-gray-50 font-sans text-gray-700 dark:text-gray-300 pb-20 animate-fade-in relative">
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
               <Link to="/" className="hover:text-primary flex items-center gap-1"><Home size={14}/> {t('nav.home')}</Link>
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
               
               {/* --- Image Gallery Section --- */}
               <div className="space-y-4">
                 <div 
                    className="relative group aspect-[4/3] overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center cursor-pointer"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                 >
                    {/* Main Image */}
                    <img 
                       src={imageList[currentImageIndex] || PLACEHOLDER_IMAGE} 
                       alt={`${product.name} - View ${currentImageIndex + 1}`} 
                       className="w-full h-full object-contain transition-opacity duration-500 ease-in-out"
                       onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                    />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-10">
                       <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                          {product.category}
                       </span>
                    </div>

                    {/* Navigation Arrows (Only if > 1 image) */}
                    {imageList.length > 1 && (
                      <>
                        <button 
                          onClick={handlePrevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800/80 hover:bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-primary p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button 
                          onClick={handleNextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800/80 hover:bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-primary p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight size={24} />
                        </button>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                           {imageList.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                className={`w-2 h-2 rounded-full transition-all shadow-sm ${currentImageIndex === idx ? 'bg-primary w-6' : 'bg-white dark:bg-gray-800/60 hover:bg-white dark:bg-gray-800'}`}
                              />
                           ))}
                        </div>
                      </>
                    )}
                 </div>
                 
                 {/* Thumbnail Strip (Only if > 1 image) */}
                 {imageList.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                       {imageList.map((img, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-primary opacity-100 ring-2 ring-primary/30' : 'border-transparent opacity-60 hover:opacity-100'}`}
                          >
                             <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                          </button>
                       ))}
                    </div>
                 )}
               </div>

               {/* Info Section */}
               <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-corporate mb-4 leading-tight">{product.name}</h1>
                  
                  <div className="flex items-center gap-4 mb-6 flex-wrap">
                     <div className="flex items-center text-yellow-400 text-sm gap-1">
                        <span className="text-lg font-bold text-gray-800 dark:text-gray-200 mr-1">{averageRating || 0}</span>
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={16} fill={i <= Math.round(Number(averageRating)) ? "currentColor" : "none"} className={i <= Math.round(Number(averageRating)) ? "text-yellow-400" : "text-gray-300"} />
                        ))}
                     </div>
                     <span className="text-gray-400 text-sm border-l border-gray-300 pl-4">{reviews.length} {t('products.reviews')}</span>
                     <span className="text-gray-400 text-sm border-l border-gray-300 pl-4 flex items-center gap-1">
                        <Eye size={14} /> {views} {t('products.views')}
                     </span>
                  </div>

                  <div className="mb-8 bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                     <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">💰 {t('products.product_price')}</h3>
                        <PriceDisplay 
                          price={product.price || 0}
                          originalPrice={product.originalPrice}
                          contactPrice={product.contactPrice}
                          size="xl"
                          layout="vertical"
                          className="mb-3"
                        />
                     </div>
                     
                     {product.stock !== undefined && (
                        <div className="flex items-center gap-2 text-sm">
                           <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                           <span className={product.stock > 0 ? 'text-green-700 font-medium' : 'text-red-600'}>
                              {product.stock > 0 ? t('common.in_stock') : t('common.out_of_stock')}
                           </span>
                        </div>
                     )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8 text-justify">
                     {product.description}
                     <br className="mb-2"/>
                     {t('home.why_choose_desc')}
                  </p>

                  <div className="flex flex-col gap-4 mb-8">
                     <div className="grid grid-cols-2 gap-4">
                        <button className="bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                           <Phone size={20} /> {t('products.call_to_buy')}
                        </button>
                        <button className="border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold text-lg hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                           <ShoppingCart size={20} /> {t('products.add_to_quote')}
                        </button>
                     </div>
                     
                     {/* Engagement Buttons */}
                     <div className="flex items-center gap-3 relative">
                        {/* Floating Hearts */}
                        {floatingHearts.map(heart => (
                          <div
                            key={heart.id}
                            className="absolute pointer-events-none animate-float-up text-red-500"
                            style={{
                              left: `calc(25% + ${heart.x}px)`,
                              bottom: '0px',
                              fontSize: '24px'
                            }}
                          >
                            ❤️
                          </div>
                        ))}
                        
                        {/* Floating Share Icons */}
                        {floatingShares.map(share => (
                          <div
                            key={share.id}
                            className="absolute pointer-events-none animate-float-up text-blue-500"
                            style={{
                              left: `calc(65% + ${share.x}px)`,
                              bottom: '0px',
                              fontSize: '24px'
                            }}
                          >
                            📤
                          </div>
                        ))}
                        
                        <button 
                          onClick={handleLike}
                          disabled={isLiking}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 transform bg-gray-100 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 hover:scale-105 active:scale-95 ${
                            isLiking ? 'scale-110' : ''
                          }`}
                        >
                           <Heart 
                             size={18} 
                             className={`transition-all duration-300 ${isLiking ? 'animate-heart-beat text-red-500' : ''}`}
                           /> 
                           <span className={`transition-all ${isLiking ? 'animate-bounce-once' : ''}`}>{likes}</span> {t('products.like')}
                        </button>
                        <button 
                          onClick={handleShare}
                          disabled={isSharing}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 transform bg-gray-100 text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:scale-105 active:scale-95 ${
                            isSharing ? 'scale-110' : ''
                          }`}
                        >
                           <Share2 
                             size={18} 
                             className={`transition-all duration-300 ${isSharing ? 'rotate-12 text-blue-500' : ''}`}
                           /> 
                           <span className={`transition-all ${isSharing ? 'animate-bounce-once' : ''}`}>{shares}</span> {t('products.share_btn')}
                        </button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-gray-100 dark:border-gray-700">
                     <div className="flex items-center gap-3">
                        <ShieldCheck className="text-primary" size={24} />
                        <div>
                           <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{t('products.warranty')}</p>
                           <p className="text-xs text-gray-500">12 - 25 {t('products.years')}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <CheckCircle className="text-primary" size={24} />
                        <div>
                           <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{t('products.authentic')}</p>
                           <p className="text-xs text-gray-500">100%</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <CreditCard className="text-primary" size={24} />
                        <div>
                           <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{t('products.payment')}</p>
                           <p className="text-xs text-gray-500">Secure</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* AI Analysis Section - Compact */}
         <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
               {/* AI Summary Button */}
               {!aiSummary ? (
                  <button
                     onClick={handleAISummary}
                     disabled={aiSummaryLoading}
                     className="flex-1 bg-white dark:bg-gray-800 border-2 border-blue-500 hover:bg-blue-50 text-blue-600 px-4 py-3 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     {aiSummaryLoading ? (
                        <>
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                           <span className="text-sm">{t('products.ai_analyzing')}</span>
                        </>
                     ) : (
                        <>
                           <Sparkles size={18} />
                           <div className="text-left">
                              <div className="text-sm font-bold">{t('products.ai_click')}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">{t('products.ai_summary_desc')}</div>
                           </div>
                        </>
                     )}
                  </button>
               ) : (
                  <div className="flex-1 bg-white dark:bg-gray-800 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                     <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="text-blue-500" size={20} />
                        <h3 className="font-bold text-gray-800 dark:text-gray-200">{t('products.ai_summary')}</h3>
                     </div>
                     <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                        {aiSummary.split('\n').map((line, idx) => {
                           const trimmed = line.trim();
                           if (!trimmed) return null;
                           
                           const renderWithBold = (text: string) => {
                              const parts = text.split('**');
                              return parts.map((part, i) => 
                                 i % 2 === 1 ? <strong key={i} className="text-primary">{part}</strong> : <span key={i}>{part}</span>
                              );
                           };
                           
                           if (trimmed.startsWith('-')) {
                              return (
                                 <div key={idx} className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <p className="flex-1">{renderWithBold(trimmed.substring(1).trim())}</p>
                                 </div>
                              );
                           }
                           
                           return <p key={idx}>{renderWithBold(trimmed)}</p>;
                        })}
                     </div>
                  </div>
               )}

               {/* AI Compare Button */}
               {relatedProducts.length > 0 && (
                  !aiComparison ? (
                     <button
                        onClick={handleAIComparison}
                        disabled={aiCompareLoading}
                        className="flex-1 bg-white dark:bg-gray-800 border-2 border-green-500 hover:bg-green-50 text-green-600 px-4 py-3 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {aiCompareLoading ? (
                           <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              <span className="text-sm">{t('products.ai_comparing')}</span>
                           </>
                        ) : (
                           <>
                              <GitCompare size={18} />
                              <div className="text-left">
                                 <div className="text-sm font-bold">{t('products.ai_click')}</div>
                                 <div className="text-xs text-gray-600 dark:text-gray-400">{t('products.ai_compare_desc')}</div>
                              </div>
                           </>
                        )}
                     </button>
                  ) : (
                     <div className="flex-1 bg-white dark:bg-gray-800 border-2 border-green-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                           <GitCompare className="text-green-500" size={20} />
                           <h3 className="font-bold text-gray-800 dark:text-gray-200">{t('products.ai_compare')}</h3>
                        </div>
                        <div className="text-sm">
                           {(() => {
                              const lines = aiComparison.split('\n').filter(l => l.trim());
                              const tableLines: string[] = [];
                              const otherLines: string[] = [];
                              
                              lines.forEach(line => {
                                 if (line.includes('|')) tableLines.push(line);
                                 else otherLines.push(line);
                              });
                              
                              return (
                                 <>
                                    {tableLines.length > 0 && (
                                       <div className="overflow-x-auto mb-4">
                                          <table className="w-full border-collapse text-xs">
                                             <thead>
                                                <tr className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                                                   {tableLines[0].split('|').map((cell, i) => (
                                                      <th key={i} className="px-3 py-2 text-left font-bold border border-green-400">
                                                         {cell.trim()}
                                                      </th>
                                                   ))}
                                                </tr>
                                             </thead>
                                             <tbody>
                                                {tableLines.slice(1).map((row, idx) => (
                                                   <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white dark:bg-gray-800'}>
                                                      {row.split('|').map((cell, i) => (
                                                         <td key={i} className="px-3 py-2 border border-gray-200 dark:border-gray-700">
                                                            {cell.trim()}
                                                         </td>
                                                      ))}
                                                   </tr>
                                                ))}
                                             </tbody>
                                          </table>
                                       </div>
                                    )}
                                    
                                    {otherLines.length > 0 && (
                                       <div className="bg-green-50 p-3 rounded-lg text-gray-700 dark:text-gray-300">
                                          {otherLines.map((line, idx) => (
                                             <p key={idx} className="mb-1">{line}</p>
                                          ))}
                                       </div>
                                    )}
                                 </>
                              );
                           })()}
                        </div>
                     </div>
                  )
               )}
            </div>
         </div>

         {/* Details Tabs */}
         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-12">
            <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
               <button 
                  onClick={() => setActiveTab('desc')}
                  className={`px-8 py-4 font-bold text-sm uppercase tracking-wide transition-colors border-b-2 whitespace-nowrap ${activeTab === 'desc' ? 'border-primary text-primary bg-orange-50' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-50'}`}
               >
                  {t('products.detail_tab_desc')}
               </button>
               <button 
                  onClick={() => setActiveTab('specs')}
                  className={`px-8 py-4 font-bold text-sm uppercase tracking-wide transition-colors border-b-2 whitespace-nowrap ${activeTab === 'specs' ? 'border-primary text-primary bg-orange-50' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-50'}`}
               >
                  {t('products.detail_tab_specs')}
               </button>
               <button 
                  onClick={() => setActiveTab('reviews')}
                  className={`px-8 py-4 font-bold text-sm uppercase tracking-wide transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'reviews' ? 'border-primary text-primary bg-orange-50' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-50'}`}
               >
                  {t('products.detail_tab_reviews')} <span className="bg-gray-100 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">{reviews.length}</span>
               </button>
            </div>
            
            <div className="p-8 md:p-12">
               {activeTab === 'desc' && (
                  <div className="space-y-6">
                     <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-400">
                        <p>{product.description}</p>
                        {product.shortDescription && (
                           <p className="text-gray-500 italic">{product.shortDescription}</p>
                        )}
                     </div>

                     {/* Tính năng nổi bật */}
                     {product.features && product.features.length > 0 && (
                        <div className="mt-8">
                           <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                              <Sparkles size={24} className="text-primary" />
                              {t('products.key_features')}
                           </h3>
                           <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {product.features.map((feature, index) => (
                                 <li key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                    <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     )}

                     {/* Specifications text */}
                     {product.specifications && (
                        <div className="mt-8">
                           <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('products.tech_details')}</h3>
                           <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-400 bg-gray-50 p-6 rounded-xl">
                              <p className="whitespace-pre-line">{product.specifications}</p>
                           </div>
                        </div>
                     )}
                  </div>
               )}

               {activeTab === 'specs' && (
                  <div className="max-w-2xl">
                     <table className="w-full text-sm text-left">
                        <tbody className="divide-y divide-gray-100">
                           {/* Basic specs */}
                           {product.power && (
                              <tr className="bg-gray-50">
                                 <td className="p-4 font-bold text-gray-700 dark:text-gray-300 w-1/3">{t('products.power')}</td>
                                 <td className="p-4 text-gray-600 dark:text-gray-400">{product.power}kW</td>
                              </tr>
                           )}
                           {product.efficiency && (
                              <tr>
                                 <td className="p-4 font-bold text-gray-700 dark:text-gray-300">{t('products.efficiency')}</td>
                                 <td className="p-4 text-gray-600 dark:text-gray-400">{product.efficiency}%</td>
                              </tr>
                           )}
                           {product.warranty && (
                              <tr className="bg-gray-50">
                                 <td className="p-4 font-bold text-gray-700 dark:text-gray-300">{t('products.warranty')}</td>
                                 <td className="p-4 text-gray-600 dark:text-gray-400">{product.warranty}</td>
                              </tr>
                           )}
                           
                           {/* Technical specs from database */}
                           {product.technicalSpecs && Object.entries(product.technicalSpecs).map(([key, value], index) => (
                              <tr key={key} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                 <td className="p-4 font-bold text-gray-700 dark:text-gray-300">{key}</td>
                                 <td className="p-4 text-gray-600 dark:text-gray-400">{value}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}

               {activeTab === 'reviews' && (
                  <div>
                     <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('products.detail_tab_reviews')}</h3>
                        <button 
                           onClick={() => setIsReviewModalOpen(true)}
                           className="border border-primary text-primary px-6 py-2 rounded-full hover:bg-primary hover:text-white transition-colors flex items-center gap-2 font-bold text-sm"
                        >
                           <MessageSquare size={16}/> {t('products.write_review')}
                        </button>
                     </div>

                     {reviews.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                           <Star size={48} className="mx-auto text-gray-300 mb-3"/>
                           <p className="text-gray-500 italic mb-2">{t('products.no_reviews')}</p>
                           <p className="text-sm text-gray-400">{t('products.be_first')}</p>
                        </div>
                     ) : (
                        <div className="space-y-6">
                           {reviews.map((review) => (
                              <div key={review.id} className="bg-gray-50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                                 <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                          {review.userName.charAt(0).toUpperCase()}
                                       </div>
                                       <div>
                                          <h4 className="font-bold text-gray-800 dark:text-gray-200">{review.userName}</h4>
                                          {review.userRole && <p className="text-xs text-gray-500">{review.userRole}</p>}
                                       </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{review.date}</span>
                                 </div>
                                 <div className="flex text-yellow-400 text-xs mb-3">
                                    {[1,2,3,4,5].map(i => (
                                       <Star key={i} size={14} fill={i <= review.rating ? "currentColor" : "none"} className={i <= review.rating ? "text-yellow-400" : "text-gray-300"} />
                                    ))}
                                 </div>
                                 <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">"{review.comment}"</p>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>

         {/* Related Products Section */}
         {relatedProducts.length > 0 && (
            <div className="mb-12">
               <h2 className="text-2xl font-bold text-corporate mb-6 border-l-4 border-primary pl-3">{t('products.related_products')}</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((item, index) => (
                     <Link key={`related-product-${item.id || item._id}-${index}`} to={`/products/${item.id || item._id}`} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group">
                        <div className="h-48 bg-gray-100 relative overflow-hidden">
                           <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="p-4">
                           <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 truncate group-hover:text-primary transition-colors">{item.name}</h4>
                           <PriceDisplay 
                             price={item.price || 0}
                             originalPrice={item.originalPrice}
                             contactPrice={item.contactPrice}
                             size="sm"
                             layout="horizontal"
                           />
                        </div>
                     </Link>
                  ))}
               </div>
            </div>
         )}
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
         <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsReviewModalOpen(false)}></div>
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-fade-in-up">
               <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{t('products.write_review')}</h3>
                  <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-400"><X size={20}/></button>
               </div>
               
               <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
                  {/* Star Rating */}
                  <div className="flex flex-col items-center mb-4">
                     <span className="text-sm text-gray-500 mb-2">Rate this product</span>
                     <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                           <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview({...newReview, rating: star})}
                              className="focus:outline-none transition-transform hover:scale-110"
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
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">{t('common.name')} <span className="text-red-500">*</span></label>
                     <input 
                        required
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        value={newReview.userName}
                        onChange={e => setNewReview({...newReview, userName: e.target.value})}
                        placeholder="Name"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">{t('contact.phone')} <span className="text-red-500">*</span></label>
                        <input 
                           required
                           type="tel" 
                           className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                           value={newReview.userPhone}
                           onChange={e => setNewReview({...newReview, userPhone: e.target.value})}
                           placeholder="Phone"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">Role</label>
                        <input 
                           type="text" 
                           className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                           value={newReview.userRole}
                           onChange={e => setNewReview({...newReview, userRole: e.target.value})}
                           placeholder="e.g. Customer"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">{t('contact.message')} <span className="text-red-500">*</span></label>
                     <textarea 
                        required
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none"
                        value={newReview.comment}
                        onChange={e => setNewReview({...newReview, comment: e.target.value})}
                        placeholder="..."
                     ></textarea>
                  </div>

                  <button 
                     type="submit" 
                     className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-secondary transition-all shadow-md mt-2"
                  >
                     {t('common.save')}
                  </button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default ProductDetail;
