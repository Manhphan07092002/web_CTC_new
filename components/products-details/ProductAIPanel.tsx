import React from 'react';
import { Sparkles, GitCompare } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProductAIPanelProps {
  productName: string;
  aiSummary: string;
  aiComparison: string;
  aiSummaryLoading: boolean;
  aiCompareLoading: boolean;
  onFetchSummary: () => void;
  onFetchComparison: () => void;
  hasRelatedProducts: boolean;
}

const ProductAIPanel: React.FC<ProductAIPanelProps> = ({
  productName,
  aiSummary,
  aiComparison,
  aiSummaryLoading,
  aiCompareLoading,
  onFetchSummary,
  onFetchComparison,
  hasRelatedProducts
}) => {
  const { t } = useLanguage();

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* AI Summary Button/Card */}
        {!aiSummary ? (
          <button
            onClick={onFetchSummary}
            disabled={aiSummaryLoading}
            className="flex-1 bg-white dark:bg-gray-800 border-2 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-600 px-4 py-3 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiSummaryLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">{t('products.ai_analyzing') || 'Đang phân tích...'}</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <div className="text-left">
                  <div className="text-sm font-bold">{t('products.ai_click') || 'Click để xem AI'}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {t('products.ai_summary_desc') || 'Tóm tắt ưu nhược điểm & đánh giá nhanh'}
                  </div>
                </div>
              </>
            )}
          </button>
        ) : (
          <div className="flex-1 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-900 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-blue-500" size={20} />
              <h3 className="font-bold text-gray-800 dark:text-gray-200">
                {t('products.ai_summary') || 'AI Tóm tắt'}
              </h3>
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

        {/* AI Compare Button/Card */}
        {hasRelatedProducts && (
          !aiComparison ? (
            <button
              onClick={onFetchComparison}
              disabled={aiCompareLoading}
              className="flex-1 bg-white dark:bg-gray-800 border-2 border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 text-green-600 px-4 py-3 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiCompareLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  <span className="text-sm">{t('products.ai_comparing') || 'Đang so sánh...'}</span>
                </>
              ) : (
                <>
                  <GitCompare size={18} />
                  <div className="text-left">
                    <div className="text-sm font-bold">{t('products.ai_click') || 'Click để xem AI'}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t('products.ai_compare_desc') || 'So sánh nhanh với sản phẩm tương tự'}
                    </div>
                  </div>
                </>
              )}
            </button>
          ) : (
            <div className="flex-1 bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-900 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <GitCompare className="text-green-500" size={20} />
                <h3 className="font-bold text-gray-800 dark:text-gray-200">
                  {t('products.ai_compare') || 'AI So sánh'}
                </h3>
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
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-850' : 'bg-white dark:bg-gray-805'}>
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
                        <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg text-gray-700 dark:text-gray-300">
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
  );
};

export default ProductAIPanel;
