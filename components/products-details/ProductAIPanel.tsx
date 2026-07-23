import React, { useState, useEffect } from 'react';
import { Sparkles, GitCompare, X, Plus, Check, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Product } from '../../types';

interface ProductAIPanelProps {
  currentProduct?: Product;
  productName: string;
  aiSummary: string;
  aiComparison: string;
  aiSummaryLoading: boolean;
  aiCompareLoading: boolean;
  onFetchSummary: () => void;
  onFetchComparison: (selectedProducts: Product[]) => void;
  hasRelatedProducts: boolean;
  allCatalogProducts?: Product[];
}

/**
 * Helper to render markdown bold **text** into JSX elements safely
 */
const renderFormattedText = (text: string) => {
  if (!text) return null;
  const parts = text.split('**');
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/40">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
};

const ProductAIPanel: React.FC<ProductAIPanelProps> = ({
  currentProduct,
  productName,
  aiSummary,
  aiComparison,
  aiSummaryLoading,
  aiCompareLoading,
  onFetchSummary,
  onFetchComparison,
  hasRelatedProducts,
  allCatalogProducts = []
}) => {
  const { t } = useLanguage();
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize selected products when modal opens (priority: same category)
  useEffect(() => {
    if (isCompareModalOpen && currentProduct) {
      const sameCat = allCatalogProducts.filter(p => {
        if (p.id === currentProduct.id) return false;
        if (currentProduct.categoryId && p.categoryId) return p.categoryId === currentProduct.categoryId;
        if (currentProduct.category && p.category) return p.category.toLowerCase() === currentProduct.category.toLowerCase();
        return true;
      });
      const initial = [currentProduct];
      if (sameCat.length > 0) {
        initial.push(sameCat[0]);
      }
      setSelectedProducts(initial);
    }
  }, [isCompareModalOpen, currentProduct, allCatalogProducts]);

  const handleToggleProduct = (prod: Product) => {
    const exists = selectedProducts.some(p => p.id === prod.id);
    if (exists) {
      if (currentProduct && prod.id === currentProduct.id) return;
      setSelectedProducts(selectedProducts.filter(p => p.id !== prod.id));
    } else {
      if (selectedProducts.length >= 4) {
        alert('Bạn chỉ được chọn tối đa 4 sản phẩm để AI so sánh.');
        return;
      }
      setSelectedProducts([...selectedProducts, prod]);
    }
  };

  const handleStartComparison = () => {
    if (selectedProducts.length < 2) return;
    setIsCompareModalOpen(false);
    onFetchComparison(selectedProducts);
  };

  // Filter candidate products ONLY in the same category
  const sameCategoryProducts = allCatalogProducts.filter(p => {
    if (!currentProduct) return true;
    if (currentProduct.categoryId && p.categoryId) {
      return p.categoryId === currentProduct.categoryId;
    }
    if (currentProduct.category && p.category) {
      return p.category.toLowerCase() === currentProduct.category.toLowerCase();
    }
    return true;
  });

  const filteredCatalog = sameCategoryProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* LEFT CARD: AI Summary Panel */}
        <div className="flex-1 flex flex-col">
          {!aiSummary ? (
            <button
              onClick={onFetchSummary}
              disabled={aiSummaryLoading}
              className="w-full h-full min-h-[120px] bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-white dark:from-gray-800 dark:to-gray-850 border-2 border-blue-400/80 hover:border-blue-600 dark:border-blue-500/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-4 group text-left"
            >
              {aiSummaryLoading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <div>
                    <div className="text-sm font-bold text-blue-700 dark:text-blue-400">AI CTC đang đọc & phân tích...</div>
                    <div className="text-xs text-gray-500">Vui lòng chờ trong giây lát</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-blue-500 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-blue-900 dark:text-blue-300">
                      Click để dùng AI CTC
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Tóm tắt nhanh thông số kỹ thuật, ưu nhược điểm & tư vấn ứng dụng
                    </div>
                  </div>
                </>
              )}
            </button>
          ) : (
            <div className="h-full bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-900/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 rounded-lg">
                      <Sparkles size={18} />
                    </div>
                    <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-100">
                      AI CTC - Tóm Tắt Thông Số
                    </h3>
                  </div>
                  <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-bold px-2 py-1 rounded-full">
                    Tối ưu tự động
                  </span>
                </div>

                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2.5 leading-relaxed">
                  {aiSummary.split('\n').map((line, idx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return null;

                    if (trimmed.startsWith('-')) {
                      return (
                        <div key={idx} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                          <p className="flex-1">{renderFormattedText(trimmed.substring(1).trim())}</p>
                        </div>
                      );
                    }

                    return <p key={idx}>{renderFormattedText(trimmed)}</p>;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT CARD: AI Comparison & Recommendations */}
        <div className="flex-1 lg:flex-[1.4] flex flex-col">
          {!aiComparison ? (
            <button
              onClick={() => setIsCompareModalOpen(true)}
              disabled={aiCompareLoading}
              className="w-full h-full min-h-[120px] bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white dark:from-gray-800 dark:to-gray-850 border-2 border-emerald-400/80 hover:border-emerald-600 dark:border-emerald-500/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-4 group text-left"
            >
              {aiCompareLoading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                  <div>
                    <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">AI CTC đang lập bảng so sánh...</div>
                    <div className="text-xs text-gray-500">Đối chiếu dữ liệu 2 - 4 sản phẩm...</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform">
                    <GitCompare size={24} />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-emerald-900 dark:text-emerald-300">
                      Click để dùng AI CTC So sánh
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Chọn 2, 3 hoặc 4 sản phẩm cùng loại để AI so sánh bảng thông số & khuyên dùng
                    </div>
                  </div>
                </>
              )}
            </button>
          ) : (
            <div className="h-full bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-6 shadow-sm flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-lg">
                    <GitCompare size={18} />
                  </div>
                  <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-100">
                    AI CTC - Kết Quả So Sánh Chi Tiết
                  </h3>
                </div>
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  className="text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800"
                >
                  <RefreshCw size={13} /> Chọn lại sản phẩm
                </button>
              </div>

              {/* Table & Recommendation Content */}
              <div className="text-sm space-y-4">
                {(() => {
                  const rawLines = aiComparison.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                  
                  // Separate table lines and text lines
                  const allTableLines = rawLines.filter(l => l.includes('|'));
                  const textLines = rawLines.filter(l => !l.includes('|'));

                  // Filter out markdown separator lines like |---|---|
                  const cleanTableLines = allTableLines.filter(line => !/^[|\s-:]+$/.test(line));

                  // Helper to parse markdown table line cleanly without trailing empty columns
                  const parseMarkdownTableLine = (line: string): string[] => {
                    let trimmed = line.trim();
                    if (trimmed.startsWith('|')) trimmed = trimmed.substring(1);
                    if (trimmed.endsWith('|')) trimmed = trimmed.substring(0, trimmed.length - 1);
                    return trimmed.split('|').map(c => c.trim());
                  };

                  // Parse Table Rows cleanly
                  const parsedRows = cleanTableLines
                    .map(line => parseMarkdownTableLine(line))
                    .filter(row => row.length > 0);

                  const rawHeaders = parsedRows.length > 0 ? [...parsedRows[0]] : [];
                  if (rawHeaders.length > 0) {
                    rawHeaders[0] = 'TIÊU CHÍ';
                  }
                  const headers = rawHeaders;
                  const bodyRows = parsedRows.length > 1 ? parsedRows.slice(1) : [];

                  // Calculate equal column width percentage dynamically for 2, 3, 4 products
                  const totalCols = headers.length;
                  const firstColWidthPercent = totalCols <= 3 ? 24 : totalCols === 4 ? 20 : 18;
                  const productColWidthPercent = totalCols > 1 ? (100 - firstColWidthPercent) / (totalCols - 1) : 80;

                  return (
                    <>
                      {/* Comparison Table */}
                      {headers.length > 0 && (
                        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
                          <table className="w-full table-fixed border-collapse text-xs text-left">
                            <thead>
                              <tr className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white font-extrabold">
                                {headers.map((head, i) => (
                                  <th 
                                    key={i} 
                                    style={{ width: `${i === 0 ? firstColWidthPercent : productColWidthPercent}%` }}
                                    className={`px-4 py-3.5 border-r border-emerald-600/50 last:border-r-0 ${
                                      i === 0 ? 'bg-emerald-900/60 text-emerald-100 font-black uppercase text-[11px] tracking-wider' : 'font-extrabold text-white text-xs'
                                    }`}
                                  >
                                    {head}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                              {bodyRows.map((row, rowIdx) => {
                                const isPriceRow = row[0] && (row[0].toLowerCase().includes('giá') || row[0].toLowerCase().includes('price'));
                                const isEffRow = row[0] && (row[0].toLowerCase().includes('hiệu suất') || row[0].toLowerCase().includes('công suất'));

                                return (
                                  <tr 
                                    key={rowIdx} 
                                    className={`transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 ${
                                      rowIdx % 2 === 0 ? 'bg-gray-50/60 dark:bg-gray-850' : 'bg-white dark:bg-gray-800'
                                    }`}
                                  >
                                    {row.map((cell, colIdx) => {
                                      const isHeaderCol = colIdx === 0;

                                      return (
                                        <td 
                                          key={colIdx} 
                                          className={`px-4 py-3 border-r border-gray-100 dark:border-gray-700 last:border-r-0 align-top ${
                                            isHeaderCol 
                                              ? 'font-bold text-gray-800 dark:text-gray-200 bg-gray-100/60 dark:bg-gray-750' 
                                              : isPriceRow
                                              ? 'font-extrabold text-emerald-700 dark:text-emerald-400'
                                              : isEffRow
                                              ? 'font-bold text-blue-700 dark:text-blue-400'
                                              : 'text-gray-700 dark:text-gray-300'
                                          }`}
                                        >
                                          {renderFormattedText(cell)}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* AI Expert Recommendation Box */}
                      {textLines.length > 0 && (
                        <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white dark:from-emerald-950/40 dark:to-gray-800 p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm mt-4">
                          <h4 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-300 mb-2.5 flex items-center gap-2 border-b border-emerald-200/60 dark:border-emerald-800/40 pb-2">
                            <Sparkles size={18} className="text-emerald-600" />
                            Đánh Giá & Lời Khuyên Tối Ưu Từ AI CTC:
                          </h4>
                          
                          <div className="space-y-2 text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                            {textLines.map((line, idx) => {
                              const cleanLine = line.replace(/^(ĐÁNH GIÁ & KHUYÊN DÙNG:|KHUYÊN DÙNG:)\s*/i, '');
                              if (!cleanLine) return null;

                              if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
                                return (
                                  <div key={idx} className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></span>
                                    <p className="flex-1">{renderFormattedText(cleanLine.substring(1).trim())}</p>
                                  </div>
                                );
                              }

                              return <p key={idx}>{renderFormattedText(cleanLine)}</p>;
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Product Selection Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCompareModalOpen(false)}></div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative z-10 animate-fade-in-up border border-gray-100 dark:border-gray-700">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-750 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <GitCompare className="text-emerald-500" size={20} />
                  Chọn từ 2 đến 4 sản phẩm để AI CTC so sánh
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Tự chọn sản phẩm trong danh mục để AI phân tích bảng thông số & đưa ra lời khuyên tối ưu
                </p>
              </div>
              <button 
                onClick={() => setIsCompareModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Selected Products Slots (2-4 Slots) */}
            <div className="p-5 bg-emerald-50/40 dark:bg-emerald-950/20 border-b border-gray-100 dark:border-gray-700">
              <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
                <span>DANH SÁCH SẢN PHẨM ĐÃ CHỌN SO SÁNH:</span>
                <span className="text-emerald-600 font-extrabold bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-0.5 rounded-full text-[11px]">
                  {selectedProducts.length} / 4 sản phẩm (Tối thiểu 2)
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map(slotIdx => {
                  const prod = selectedProducts[slotIdx];
                  const isCurrent = currentProduct && prod?.id === currentProduct.id;
                  
                  return (
                    <div 
                      key={slotIdx}
                      className={`p-3 rounded-xl border flex flex-col justify-between h-24 transition-all relative ${
                        prod 
                          ? 'bg-white dark:bg-gray-800 border-emerald-500 shadow-sm' 
                          : 'border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-750 items-center justify-center'
                      }`}
                    >
                      {prod ? (
                        <>
                          <div>
                            <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">
                              {isCurrent ? 'Sản phẩm hiện tại' : `Sản phẩm ${slotIdx + 1}`}
                            </div>
                            <h5 className="text-xs font-bold text-gray-800 dark:text-gray-100 line-clamp-2">
                              {prod.name}
                            </h5>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-[11px] font-semibold text-primary">
                              {typeof prod.price === 'number' ? prod.price.toLocaleString('vi-VN') + 'đ' : (prod.price || 'Liên hệ')}
                            </span>
                            {!isCurrent && (
                              <button 
                                onClick={() => handleToggleProduct(prod)}
                                className="text-gray-400 hover:text-red-500 p-0.5"
                                title="Bỏ chọn"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-gray-400">
                          <Plus size={18} className="mx-auto mb-1 opacity-60" />
                          <span className="text-[11px]">Vị trí {slotIdx + 1}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Catalog Picker List */}
            <div className="p-5 flex-1 overflow-y-auto max-h-[350px]">
              {/* Category Filter Badge */}
              <div className="mb-3 text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  ĐANG LỌC SẢN PHẨM CÙNG DANH MỤC: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">{currentProduct?.category || 'Cùng loại'}</span>
                </span>
                <span className="text-[11px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  {filteredCatalog.length} sản phẩm phù hợp
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Tìm kiếm trong danh mục ${currentProduct?.category || 'này'}...`}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Product Cards Grid */}
              <div className="space-y-2">
                {filteredCatalog.map(item => {
                  const isSelected = selectedProducts.some(p => p.id === item.id);
                  const isCurrent = currentProduct && item.id === currentProduct.id;

                  return (
                    <div 
                      key={item.id}
                      onClick={() => handleToggleProduct(item)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500' 
                          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image || item.imageUrl || 'https://placehold.co/60x60'} 
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-100 dark:border-gray-700" 
                        />
                        <div>
                          <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            {item.name}
                            {isCurrent && (
                              <span className="text-[9px] bg-blue-100 text-blue-700 font-extrabold px-1.5 py-0.5 rounded">Gốc</span>
                            )}
                          </h4>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-3">
                            <span>Công suất: <strong>{item.power || 'N/A'}W</strong></span>
                            <span>Hiệu suất: <strong>{item.efficiency || 'N/A'}%</strong></span>
                            <span className="text-primary font-semibold">
                              {typeof item.price === 'number' ? item.price.toLocaleString('vi-VN') + 'đ' : (item.price || 'Liên hệ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-500 hover:text-white'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check size={14} /> Đã chọn
                          </>
                        ) : (
                          <>
                            <Plus size={14} /> Chọn
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer / Action Button */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-750 rounded-b-2xl">
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-500" />
                Vui lòng chọn tối thiểu 2 sản phẩm để so sánh.
              </div>

              <button
                onClick={handleStartComparison}
                disabled={selectedProducts.length < 2}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles size={16} />
                Bắt đầu AI Phân tích & So sánh ({selectedProducts.length} sản phẩm)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAIPanel;
